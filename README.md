# Portail des Données du Territoire 06

Portail interactif alimenté par l'IA pour interroger les indicateurs socio-démographiques du territoire Nice Côte d'Azur (Alpes-Maritimes).

Développé pour la **CCI Nice Côte d'Azur** dans le cadre du hackathon 2025.

## 🚀 Fonctionnalités

- 🤖 **Questions en langage naturel** - Posez vos questions en français simple
- 📊 **Visualisations interactives** - Graphiques et cartes de données clairs
- 🎯 **Suggestions intelligentes** - Recommandations de requêtes pertinentes
- 🔍 **Navigation par catégories** - Explorez par démographie, économie, tourisme, etc.
- ⚠️ **Transparence** - Informations claires sur les limites des données
- 📱 **Design responsive** - Fonctionne sur tous les appareils

## 🛠️ Technologies

- **Framework** : [Next.js 14+](https://nextjs.org) (React, TypeScript)
- **UI** : [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com)
- **Icônes** : [Lucide React](https://lucide.dev)
- **Gestionnaire de paquets** : pnpm

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/AntoineFra/HackathonTopTech.git
cd HackathonTopTech

# Installer les dépendances
pnpm install

# Créer le fichier d'environnement
cp .env.example .env.local
```

## 🚀 Démarrage

```bash
# Lancer le serveur de développement
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔧 Configuration de l'IA

Pour activer les réponses IA réelles, configurez votre clé API :

1. Obtenez une clé API (OpenAI, Anthropic, etc.)
2. Ajoutez-la dans `.env.local` :
    ```env
    OPENAI_API_KEY=votre_clé_ici
    ```
3. Implémentez l'intégration dans `lib/ai-service.ts`

Voir [`docs/DEMARRAGE_RAPIDE.md`](docs/DEMARRAGE_RAPIDE.md) pour un guide détaillé.

## 📁 Structure du projet

```
├── app/                  # Pages et routes Next.js
│   ├── page.tsx         # Page d'accueil
│   └── api/             # Routes API
├── components/           # Composants React
│   ├── ui/              # Composants shadcn/ui
│   ├── query-interface.tsx
│   ├── ai-response-display.tsx
│   ├── indicator-card.tsx
│   └── category-grid.tsx
├── lib/                  # Utilitaires et services
│   ├── ai-service.ts    # Service IA (à implémenter)
│   ├── sample-data.ts   # Données de test
│   └── constants.ts     # Configuration
└── types/                # Définitions TypeScript
```

## 📝 Scripts disponibles

```bash
pnpm dev          # Démarrer le serveur de développement
pnpm build        # Construire pour la production
pnpm start        # Démarrer le serveur de production
pnpm lint         # Vérifier le code avec ESLint
```

## 🎯 Exemples de requêtes

- "Quelle est la population de Nice ?"
- "Afficher les statistiques d'emploi pour 2025"
- "Quels sont les principaux secteurs économiques du territoire 06 ?"
- "Indicateurs touristiques pour la Côte d'Azur"
- "Démographie des Alpes-Maritimes"

## 📚 Documentation

- [`docs/DEMARRAGE_RAPIDE.md`](docs/DEMARRAGE_RAPIDE.md) - Guide de démarrage rapide
- [`docs/AI_INTEGRATION.md`](docs/AI_INTEGRATION.md) - Guide d'intégration de l'IA
- [`docs/HACKATHON_SUMMARY.md`](docs/HACKATHON_SUMMARY.md) - Résumé du projet hackathon
- [`docs/PROJECT_README.md`](docs/PROJECT_README.md) - Documentation technique complète
- [`docs/VISUAL_GUIDE.md`](docs/VISUAL_GUIDE.md) - Guide visuel du projet

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.

## 👥 Contributeurs

Projet développé pour le hackathon CCI Nice Côte d'Azur 2025.

## 📄 Licence

© 2025 CCI Nice Côte d'Azur - Tous droits réservés

## Liens Utiles

Historique des populations : https://www.insee.fr/fr/statistiques/3698339
Recensement de la population (banque de données) :
https://www.insee.fr/fr/information/8568899
Dossier complet INSEE (inspiration pour le type de résultats attendus en fonction des sources
utilisées) : https://www.insee.fr/fr/statistiques/2011101?geo=DEP-06#graphique-POP_G2
Fichier SIRENE (StockEtablissement) : https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/
