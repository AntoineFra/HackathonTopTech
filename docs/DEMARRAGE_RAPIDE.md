# 🚀 Guide de Démarrage Rapide - Portail des Données du Territoire 06

## Démarrer le développement (2 minutes)

```bash
cd /home/hades/HackathonTopTech
pnpm install
pnpm dev
```

Puis ouvrir : **http://localhost:3000**

---

## Connecter le service IA (10 minutes)

### 1. Obtenir une clé API

- OpenAI : https://platform.openai.com/api-keys
- Anthropic : https://console.anthropic.com/

### 2. Ajouter à l'environnement

```bash
# Créer .env.local
echo "OPENAI_API_KEY=votre-clé-ici" > .env.local
```

### 3. Mettre à jour lib/ai-service.ts

Remplacer la ligne ~15 dans la fonction `queryAI` avec :

```typescript
// Ajouter en haut du fichier
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Dans la fonction queryAI :
const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
        {
            role: "system",
            content:
                "Vous répondez aux questions sur les données du territoire Nice Côte d'Azur...",
        },
        {
            role: "user",
            content: question,
        },
    ],
});

const answer = completion.choices[0].message.content;
```

### 4. Installer le SDK OpenAI

```bash
pnpm add openai
```

---

## Tester les requêtes

Essayez dans l'interface :

- "Quelle est la population de Nice ?"
- "Afficher les statistiques d'emploi"
- "Données touristiques pour la région"

---

## Structure du projet

```
📁 app/
  └── page.tsx              ← Page principale
  └── api/query/route.ts    ← Point d'API

📁 components/
  └── query-interface.tsx   ← Interface de recherche
  └── ai-response-display.tsx
  └── indicator-card.tsx
  └── category-grid.tsx

📁 lib/
  └── ai-service.ts         ← 🎯 ÉDITER CECI
  └── sample-data.ts        ← Données de test
  └── constants.ts

📁 types/
  └── index.ts              ← Définitions de types
```

---

## Fichiers clés à éditer

| Priorité | Fichier              | Que faire                         |
| -------- | -------------------- | --------------------------------- |
| 🔴 HAUTE | `lib/ai-service.ts`  | Ajouter l'intégration IA          |
| 🟡 MOY   | `.env.local`         | Ajouter les clés API              |
| 🟢 BASSE | `lib/sample-data.ts` | Mettre à jour les données de test |

---

## Commandes

```bash
# Développement
pnpm dev          # Démarrer le serveur dev
pnpm build        # Vérifier les erreurs
pnpm start        # Serveur de production

# Tests
pnpm lint         # Vérifier le code
```

---

## Problèmes courants

**"Module non trouvé"** : Exécuter `pnpm install`

**"Clé API non trouvée"** : Vérifier que `.env.local` existe

**"Erreurs de build"** : Exécuter `pnpm build` pour voir les détails

---

## Ressources

- 📖 Guide complet : `AI_INTEGRATION.md`
- 📋 Résumé : `HACKATHON_SUMMARY.md`
- 🔧 Configuration : `PROJECT_README.md`

---

**Besoin d'aide ?** Consultez les guides détaillés ci-dessus !

**Prêt à présenter ?** Testez d'abord toutes les requêtes de démo !

Bonne chance ! 🎉
