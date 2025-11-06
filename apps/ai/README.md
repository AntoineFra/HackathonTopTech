# AI Service

Service d'intelligence artificielle basé sur FastAPI et Google Gemini pour l'analyse de données des communes du département 06.

## Technologies

- **FastAPI**: API REST asynchrone
- **Google Gemini**: Modèle de langage pour la génération de requêtes SQL et l'analyse de données
- **LangChain**: Orchestration des appels LLM
- **ChromaDB**: Base de données vectorielle pour le RAG
- **SQLite**: Stockage des données par commune

## Prérequis

- **Python 3.10+** (requis - certaines dépendances nécessitent Python 3.10 minimum)
- pip 25.0+

**Important**: Ce projet utilise des versions spécifiques de packages qui nécessitent Python 3.10 ou supérieur. Avec Python 3.9, l'installation échouera.

### Installation

1. **Install Python dependencies**:
   ```bash
   pnpm install-deps
   # Or manually:
   python3.12 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install pandas  # Required dependency not in requirements.txt
   ```

**Note**: Si vous avez Python 3.9 ou inférieur, les packages suivants ne sont pas compatibles:
- `langchain==1.0.3` (nécessite Python 3.10+)
- `click==8.3.0` (version non disponible)
- `filelock==3.20.0` (nécessite Python 3.10+)

Vous devrez soit upgrader Python, soit ajuster les versions des packages.

## Configuration

Le service utilise une clé API Google (actuellement codée en dur dans `main.py`). Pour la production, utilisez des variables d'environnement:

```bash
export GOOGLE_API_KEY="votre_clé_api"
```

## Scripts disponibles

### `pnpm dev`
Lance le service en mode développement (exécution directe de `main.py`):
```bash
pnpm --filter @hackathon/ai dev
```

### `pnpm start`
Lance le serveur FastAPI en production:
```bash
pnpm --filter @hackathon/ai start
```

Le serveur sera accessible sur `http://localhost:8001`

### `pnpm fetch-csv`
Télécharge les données CSV depuis les sources:
```bash
pnpm --filter @hackathon/ai fetch-csv
```

### `pnpm csv-to-sqlite`
Convertit les CSV en bases SQLite par commune:
```bash
pnpm --filter @hackathon/ai csv-to-sqlite
```

## API Endpoints

### POST /api/ask

Main endpoint for processing natural language questions about communes data.

**Request Body:**
```json
{
  "query": "Quelle est la population de Nice ?",
  "maxCommunes": 10,
  "codes": ["06088"]
}
```

**Response:**
```json
{
  "question": "Quelle est la population de Nice ?",
  "sql": "SELECT ...",
  "result": [...],
  "selected_codes": ["06088"],
  "model": "gemini-2.5-flash",
  "source": "sqlite",
  "chart": {"type": "bar", "data": [...]}
}
```

## Running the Service

The FastAPI application is defined in `ai.py` (not `main.py`).

Start the service:

## Architecture

1. **RAG (Retrieval Augmented Generation)**: Utilise ChromaDB pour récupérer les définitions de schéma pertinentes
2. **Génération SQL**: Google Gemini génère une requête SQL basée sur la question et le schéma
3. **Résolution géographique**: Détermine automatiquement les communes concernées
4. **Exécution multi-DB**: Exécute la requête sur les bases SQLite de chaque commune
5. **Analyse**: Génère une réponse en langage naturel basée sur les résultats

## Données

Les données sont organisées par commune dans `./data/csv/{code_commune}/`:
- `06000`: Données départementales
- `06088`: Nice
- `06029`: Cannes
- etc.

Chaque commune possède sa propre base SQLite avec le même schéma.

## Développement

Pour ajouter de nouvelles tables ou modifier le schéma:

1. Mettre à jour `schema.save.sql`
2. Mettre à jour les descriptions dans le `collection.add()` de `main.py`
3. Régénérer les bases SQLite avec `csv_to_sqlite.py`

## Intégration avec le frontend

Le backend Next.js (dans `apps/backend`) peut appeler ce service via HTTP:

```typescript
const response = await fetch('http://localhost:8001/api/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Quelle est la population de Nice ?' })
});
const data = await response.json();
```
