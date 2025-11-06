# PACA Analytics - Hackathon CCI Nice Côte d'Azur 2025
# 🏠 PACA Analytics Platform

Portail interactif alimenté par l'IA pour interroger les données socio-démographiques du territoire 06.
[![Documentation](https://github.com/AntoineFra/HackathonTopTech/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/AntoineFra/HackathonTopTech/actions/workflows/deploy-docs.yml)
[![GitBook](https://img.shields.io/badge/docs-GitBook-blue)](https://antoinefra.github.io/HackathonTopTech/)

## 🚀 Quick Start
> Plateforme interactive d'analyse de données territoriales pour la région PACA, alimentée par l'IA et visualisations 3D.

Développé pour la **CCI Nice Côte d'Azur** dans le cadre du hackathon 2025.

### 1. Installation
## 🎯 À propos

PACA Analytics est une plateforme moderne permettant d'interroger et de visualiser les données socio-démographiques et économiques du territoire des Alpes-Maritimes (département 06) de manière intuitive.

### Fonctionnalités principales

- 🤖 **Questions en langage naturel** - Posez vos questions en français via l'IA Mistral
- 🗺️ **Carte 3D interactive** - Visualisation immersive des données territoriales avec Three.js
- 📊 **Visualisations intelligentes** - Graphiques et indicateurs clairs
- 🎯 **Suggestions contextuelles** - Recommandations de requêtes pertinentes
- 🔍 **Navigation par catégories** - Démographie, économie, tourisme, etc.
- 📱 **Design responsive** - Interface adaptée à tous les appareils
- 🐳 **Architecture conteneurisée** - Déploiement simplifié avec Docker

## 🏗️ Architecture

Cette application est un **monorepo** composé de :

- **Frontend** : Next.js 16 avec React 19 (port 8080)
- **Backend** : Express 5 avec Prisma ORM (port 3000)
- **AI Engine** : Ollama avec modèle Mistral (port 11434)
- **Database** : SQLite avec Prisma

## 🚀 Démarrage rapide

### Prérequis

- Docker & Docker Compose
- pnpm (recommandé) ou npm

### Installation avec Docker (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/AntoineFra/HackathonTopTech.git
cd HackathonTopTech

# Créer les fichiers d'environnement
cp .env.root.example .env.root
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# Démarrer tous les services
docker compose up -d

# Attendre le téléchargement du modèle Mistral (première fois)
docker compose logs -f ollama-init
```

Accédez à l'application :

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:3000
- **Ollama** : http://localhost:11434

### Installation locale (Développement)

```bash
# Installer les dépendances
pnpm install

# Dans un terminal - Backend
cd apps/backend
pnpm dev

# Dans un autre terminal - Frontend
cd apps/frontend
pnpm dev
```

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

## 🛠️ Technologies

### Frontend

- **Framework** : Next.js 16 (React 19, TypeScript)
- **3D Visualization** : Three.js, React Three Fiber, Drei
- **UI** : shadcn/ui, Tailwind CSS 4, Lucide Icons
- **Maps** : Turf.js pour calculs géospatiaux

### Backend

- **Runtime** : Node.js 20
- **Framework** : Express 5
- **ORM** : Prisma 6
- **Database** : SQLite
- **Dev Tools** : tsx watch pour hot-reload

### AI & Data

- **AI Model** : Ollama (Mistral)
- **Data Sources** :
    - API Geo Gouv (communes, départements)
    - INSEE (statistiques)
    - IGN (données cartographiques)
    - OpenStreetMap

### Infrastructure

- **Containerization** : Docker, Docker Compose
- **Package Manager** : pnpm
- **Monorepo** : pnpm workspaces

## 📁 Structure du projet

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

### Racine du projet

```bash
pnpm install          # Installer toutes les dépendances
pnpm dev             # Démarrer frontend + backend en local
pnpm build           # Build de production

# Docker
pnpm docker:up       # Démarrer tous les services Docker
pnpm docker:down     # Arrêter tous les services
pnpm restart         # Redémarrer tous les conteneurs

# Prisma (Docker)
pnpm prisma:generate:docker  # Générer le client Prisma
pnpm prisma:push:docker      # Pousser le schéma vers la DB
pnpm prisma:reset:docker     # Reset complet
```

### Frontend (apps/frontend)

```bash
pnpm dev             # Serveur de développement
pnpm build           # Build de production
pnpm start           # Serveur de production
pnpm lint            # Linter
```

### Backend (apps/backend)

```bash
pnpm dev             # Serveur de développement avec hot-reload
pnpm build           # Compiler TypeScript
pnpm start           # Démarrer en production
pnpm prisma:generate # Générer le client Prisma
pnpm prisma:studio   # Interface Prisma Studio
```

## 🔧 Configuration

### Variables d'environnement

#### Backend (.env)

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
OLLAMA_BASE_URL="http://ollama:11434"
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
OLLAMA_BASE_URL="http://ollama:11434"
OLLAMA_MODEL="mistral"
```

## 🐳 Docker

### Services disponibles

- **frontend** : Application Next.js (port 8080)
- **backend** : API Express (port 3000)
- **ollama** : Serveur Ollama (port 11434)
- **ollama-init** : Téléchargement initial du modèle Mistral

### Commandes Docker utiles

```bash
# Voir les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Reconstruire un service
docker compose up -d --build backend

# Accéder au shell d'un conteneur
docker compose exec backend sh

# Nettoyer tout
docker compose down -v
```

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

### 2. Variables d'environnement

**Backend** (`apps/backend/.env`) :
```bash
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2:7b-chat-q4_K_S
OLLAMA_TIMEOUT=60000
```

**Frontend** (`apps/frontend/.env.local`) :
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### 3. Prisma (première fois uniquement)

```bash
cd apps/backend
pnpm prisma generate
pnpm prisma db push
```

### 4. Ollama (IA locale avec Docker)

```bash
# Démarrer Ollama et télécharger le modèle
./start-ollama.sh

# Ou manuellement :
docker compose up -d
docker exec paca-ollama ollama pull llama2:7b-chat-q4_K_S
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
rm prisma/dev.db
pnpm prisma db push
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
