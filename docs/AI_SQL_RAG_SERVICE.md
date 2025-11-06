# 🤖 Service IA (Python) — SQL RAG sur données INSEE

Ce document décrit le service IA Python situé dans `apps/ai/ai.py`. Il expose une API FastAPI qui:

- sélectionne les tables pertinentes via RAG (ChromaDB) sur le schéma SQLite,
- génère une requête SQL (Gemini) sans COUNT/SUM,
- exécute la requête sur une ou plusieurs bases SQLite (par commune ou département),
- fusionne les résultats et produit une réponse textuelle et, si pertinent, une suggestion de graphique en JSON.

> Langue: français. Données: INSEE (Alpes‑Maritimes — codes 06xxx).

---

## 🧭 Aperçu

- Emplacement: `apps/ai/ai.py`
- Framework: FastAPI + Uvicorn
- RAG: `chromadb` (mémoire locale, collection `table_collection`)
- LLM: `gemini-2.5-flash` (Google Generative AI) pour planification/SQL + synthèse
- Données: SQLite multi‑bases par code commune dans `apps/ai/data/csv/<code>/<code>.db`
- DDL: `apps/ai/data/dumps/schema.sql` (utilisé dans les prompts)

### 🎯 Contrat (résumé)
- Entrée: question en français, éventuellement `codes` (communes) et/ou `maxCommunes`.
- Sortie: JSON { success, answer, sqlQuery, selected_codes, chart?, ... }.
- Erreurs courantes: `no_sql_generated`, `no_database_found`, `rag_failed`.

---

## 🧩 Architecture

```
┌──────────────────────────────────────────────┐
│                  Client UI                   │
│  (Frontend Next.js / Backend Node facultatif)│
└───────────────▲──────────────────────────────┘
                │ HTTP POST /api/ask
┌───────────────┴──────────────────────────────┐
│          Service IA Python (FastAPI)         │
│  apps/ai/ai.py → app = FastAPI(...)          │
│  1) RAG tables (Chroma)                      │
│  2) Génération SQL (Gemini)                  │
│  3) Sélection DB (codes 06xxx)               │
│  4) Exécution multi‑DB + fusion (pandas)     │
│  5) Synthèse + graphique (Gemini)            │
└───────────────┬──────────────────────────────┘
                │ SQLite                       
┌───────────────▼──────────────────────────────┐
│  apps/ai/data/csv/                           │
│   ├─ 06000/06000.db (département)            │
│   └─ 06xyz/06xyz.db (communes)               │
│  DDL: apps/ai/data/dumps/schema.sql          │
└──────────────────────────────────────────────┘
```

---

## 📦 Installation & exécution

Depuis `apps/ai/`:

```bash
# 1) Environnement Python (WSL/Unix)
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2) Variable d'environnement (requis)
export GOOGLE_API_KEY="<votre_clef_Google>"

# 3) Lancer l'API (port 8000 par défaut)
uvicorn ai:app --reload --host 0.0.0.0 --port 8000
```

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

> Note sécurité: `ai.py` définit actuellement une clé par défaut via `os.environ["GOOGLE_API_KEY"] = "..."`. Remplacez‑la par une variable d'environnement avant de lancer en production.

---

## 🗂️ Données et schéma

- Bases SQLite: `apps/ai/data/csv/<code>/<code>.db`
  - `06000` = département (agrégé)
  - autres `06xxx` = communes 
- Schéma (DDL) utilisé dans les prompts: `apps/ai/data/dumps/schema.sql`
- Préparation/ingestion (exemples):
  - `apps/ai/data/prepare_data.py` (génération d'un schéma SQL riche et métadonnées)
  - `apps/ai/csv_to_sqlite.py`, `apps/ai/fetch_csv.py` (si présents dans votre flux)

Assurez‑vous que les `.db` existent pour les codes ciblés; sinon l'API retournera `no_database_found`.

---

## 🔌 API

### POST /api/ask

Corps (JSON):
```json
{
  "query": "Fais une synthèse économique et sociale d'Antibes en 2022.",
  "maxCommunes": 3,
  "codes": ["06004"],
  "legendType": null
}
```

Réponse (exemple de forme):
```json
{
  "success": true,
  "query": "...",
  "answer": "Résumé en français basé sur les données...",
  "error": null,
  "sqlQuery": "SELECT ...",
  "sqlQueryFixed": "",            
  "retryAttempted": false,
  "retrySucceeded": false,
  "retryError": "",
  "sqlFixPrompt": "...",          
  "selected_codes": ["06004"],
  "model": "gemini-2.5-flash",
  "source": "sqlite",
  "chart": {
    "type": "bar|line|pie|area|radar|radial",
    "data": [ ... ],
    "title": "<titre>",
    "description": "<pourquoi ce graphique est pertinent>"
  }
}
```

Notes:
- Si l'utilisateur ne fournit pas `codes`, le service résout automatiquement le périmètre via l'extraction des communes dans la question (Gemini) avec un maximum configurable (`maxCommunes`).
- En échec d'exécution SQL, un essai de correction minimale automatique est tenté; si cela échoue, `sqlFixPrompt` vous aide à itérer.

### Exemple cURL (WSL)

```bash
curl -s http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Quel est le mode de transport le plus utilisé en 2022 ?",
    "maxCommunes": 1,
    "codes": ["06000"]
  }' | jq .
```

---

## 🔁 Pipeline détaillé

1) RAG (ChromaDB)
- Collection `table_collection` initialisée dans `ai.py` avec les identifiants des tables (ACT/EMP/FAM/FOR/LOG/POP…).
- Requête `collection.query(query_texts=[question], n_results=5)` → tables candidates.
- Construction d'un sous‑ensemble de DDL (extraits de `data/dumps/schema.sql`).

2) Génération SQL (Gemini)
- Prompt contraint: jamais `COUNT` ni `SUM`; respecter les `CHECK IN` (1 valeur = 1 ligne).
- Extraction sécurisée du bloc ```sql ... ```.

3) Sélection du périmètre (communes)
- Si `codes` non fournis: détection automatique; `06000` = département, sinon codes 06xxx.
- Application d'un plafond `MAX_COMMUNES` pour éviter un éventail trop large.

4) Exécution multi‑bases
- Exécute la requête sur chaque base existante (SQLite) parmi les codes retenus.
- Fusion des résultats avec `pandas.concat` et ajout des colonnes `commune_code` et `commune_name`.

5) Synthèse & graphique (Gemini)
- Prompt « analyste de données » basé uniquement sur les lignes retournées.
- Réponse textuelle courte + bloc optionnel ```chart { ... } ``` (JSON) pour la visualisation.

---

## ⚙️ Configuration

Variables d'environnement principales:

- `GOOGLE_API_KEY` (requis): Jeton Google Générative AI.

Paramètres internes (dans `ai.py`):
- `MAX_COMMUNES = 5` (nombre max de communes déduites)
- Modèle Gemini: `gemini-2.5-flash`

---

## 🧪 Mode script (legacy)

`python apps/ai/ai.py` exécute la pipeline en mode CLI avec la variable `question` fixée dans le fichier.

- Utile pour des tests rapides sur terminal.
- Préférez le mode API pour l'intégration avec le frontend.

---

## 🐛 Dépannage

- `rag_failed`: Problème d'interrogation de ChromaDB — vérifier l'init de la collection et l'accès au fichier `schema.sql`.
- `no_sql_generated`: Gemini n'a pas renvoyé de SQL — reformuler la question, vérifier le DDL fourni, ou réduire la portée.
- `no_database_found`: Aucune base SQLite trouvée pour les `codes` — assurez‑vous que `apps/ai/data/csv/<code>/<code>.db` existe.
- Réponses pauvres/incohérentes: 
  - Vérifiez `GOOGLE_API_KEY` et le modèle,
  - Vérifiez la qualité du DDL (contraintes `CHECK IN`),
  - Spécifiez des `codes` explicites.

---

## 🔗 Liens utiles

- Guide intégration IA (frontend): `docs/AI_INTEGRATION.md`
- IA locale (Ollama) côté Next.js: `docs/LOCAL_AI_QUICKSTART.md`, `docs/AI_LOCAL_IMPLEMENTATION.md`
- Données réelles & intégration: `docs/REAL_DATA_IMPLEMENTATION.md`, `docs/REAL_DATA_INTEGRATION.md`

---

## ✅ Check‑list exploitation

- [ ] `GOOGLE_API_KEY` fourni via environnement (pas en dur)
- [ ] Bases présentes sous `apps/ai/data/csv/`
- [ ] Port 8000 accessible et Uvicorn démarré
- [ ] CORS/pare‑feu configurés selon besoin

> Pour toute question, ouvrez une issue ou consultez les autres guides dans `docs/`.
