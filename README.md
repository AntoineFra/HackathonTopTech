# PACA Analytics - Hackathon CCI Nice Côte d'Azur 2025
# 🏠 PACA Analytics Platform

Portail interactif alimenté par l'IA pour interroger les données socio-démographiques du territoire 06.
[![Documentation](https://github.com/AntoineFra/HackathonTopTech/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/AntoineFra/HackathonTopTech/actions/workflows/deploy-docs.yml)
[![GitBook](https://img.shields.io/badge/docs-GitBook-blue)](https://antoinefra.github.io/HackathonTopTech/)

## 🚀 Quick Start
> Plateforme interactive d'analyse de données territoriales pour la région PACA, alimentée par l'IA et visualisations 3D.

Développé pour la **CCI Nice Côte d'Azur** dans le cadre du hackathon 2025.


### Prérequis

- Docker & Docker Compose
- pnpm (recommandé) ou npm


Accédez à l'application :

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:3000
- **Ollama** : http://localhost:11434


## 📖 Documentation

Cette documentation est organisée avec GitBook. Consultez le [SUMMARY](SUMMARY.md) pour la navigation complète.

### 🚦 Guides de démarrage

- [⚡ Quick Start (EN)](docs/QUICKSTART.md)
- [🚀 Démarrage Rapide (FR)](docs/DEMARRAGE_RAPIDE.md)

### 🏗️ Architecture

- [📋 Vue d'ensemble du projet](docs/PROJECT_README.md)
- [🗺️ Architecture de la carte 3D](docs/MAP_ARCHITECTURE.md)
- [📊 Résumé du Hackathon](docs/HACKATHON_SUMMARY.md)

### ⚙️ Guides d'intégration

- [🤖 Intégration IA](docs/AI_INTEGRATION.md)
- [🗺️ Guide de la carte 3D](docs/MAP_3D_GUIDE.md)
- [🗺️ Intégration de la carte](docs/MAP_INTEGRATION_GUIDE.md)
- [📊 Implémentation données réelles](docs/REAL_DATA_IMPLEMENTATION.md)
- [🌍 API Geo Gouv](docs/GEO_API_GOUV_GUIDE.md)

### 📚 Référence API

- [Backend API](api-reference/backend.md)
- [Frontend Components](api-reference/frontend.md)


```
HackathonTopTech/
├── apps/
│   ├── frontend/          # Application Next.js
│   │   ├── app/          # Pages et routes
│   │   ├── components/   # Composants React
│   │   ├── lib/          # Utilitaires et services
│   │   └── types/        # Types TypeScript
│   │
│   └── backend/          # API Express
│       ├── controllers/  # Contrôleurs API
│       ├── routes/       # Définitions de routes
│       ├── prisma/       # Schéma et migrations
│       └── server.ts     # Point d'entrée
│
├── packages/             # Packages partagés (futur)
├── docs/                 # Documentation
├── api-reference/        # Référence API
├── docker-compose.yml    # Orchestration Docker
└── SUMMARY.md           # Table des matières GitBook
```

## 🎯 Exemples de requêtes

### Questions démographiques

- "Quelle est la population de Nice ?"
- "Démographie des Alpes-Maritimes"
- "Évolution de la population depuis 2020"

### Questions économiques

- "Afficher les statistiques d'emploi pour 2025"
- "Quels sont les principaux secteurs économiques du territoire 06 ?"
- "Données SIRENE des entreprises"

### Questions territoriales

- "Indicateurs touristiques pour la Côte d'Azur"
- "Liste des communes du département 06"
- "Données géographiques de Cannes"

## 📝 Scripts disponibles

## 🤝 Contribution

Ce projet a été développé dans le cadre du hackathon CCI Nice Côte d'Azur 2025.

## 📄 Licence

© 2025 CCI Nice Côte d'Azur - Tous droits réservés

## 🔗 Ressources

### Données et APIs

- [Historique des populations INSEE](https://www.insee.fr/fr/statistiques/3698339)
- [Recensement de la population](https://www.insee.fr/fr/information/8568899)
- [Dossier complet INSEE](https://www.insee.fr/fr/statistiques/2011101?geo=DEP-06)
- [Base SIRENE](https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/)
- [API Geo Gouv](https://geo.api.gouv.fr/)

### Technologies

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [Three.js Documentation](https://threejs.org/docs)

---

📚 **[Voir la documentation complète →](SUMMARY.md)**

## 🚀 Fonctionnalités

```bash
pnpm install
```

### 5. Lancer le projet

```bash
pnpm dev
```

- Frontend : http://localhost:3001
- Backend : http://localhost:3000

## 🔄 Commandes utiles

**Reset de la base de données :**
```bash
cd apps/backend
rm -rf prisma/dev.db generated
pnpm prisma generated
pnpm prisma db push
npx prisma migrate dev
```

**Gérer Ollama :**
```bash
docker compose up -d      # Démarrer
docker compose down       # Arrêter
docker logs -f paca-ollama  # Voir les logs
```

## 🛠️ Stack

- **Monorepo** : Turborepo + pnpm
- **Frontend** : Next.js 16 + shadcn/ui
- **Backend** : Express + Prisma (SQLite)
- **IA** : Ollama (Docker)
