# 🚀 PACA Analytics - Monorepo

Monorepo complet pour l'application PACA Analytics avec Frontend (Next.js), Backend (Express + Prisma) et IA locale (Ollama).

## 📁 Structure du Projet

```
paca-analytics-monorepo/
├── apps/
│   ├── frontend/          # Next.js 16 + Tailwind CSS
│   │   ├── app/           # Pages et API routes Next.js
│   │   ├── components/    # Composants React
│   │   ├── lib/           # Utilitaires et services
│   │   └── Dockerfile     # Build de production
│   │
│   └── backend/           # Express + Prisma + SQLite
│       ├── controllers/   # Contrôleurs Express
│       ├── routes/        # Routes API
│       ├── services/      # Business logic
│       ├── prisma/        # Schema et migrations Prisma
│       └── Dockerfile     # Build de production
│
├── packages/              # Code partagé (à venir)
│
├── docker-compose.yml     # Orchestration des services
├── package.json           # Scripts root
└── README.md              # Ce fichier
```

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│                    Port: 8080                            │
│  - Interface utilisateur                                 │
│  - Chat AI avec historique                               │
│  - Carte 3D interactive                                  │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP REST API
┌────────────────▼─────────────────────────────────────────┐
│                    Backend (Express)                      │
│                    Port: 3000                            │
│  - API REST (/ai, /dump, /users)                         │
│  - Base de données Prisma (SQLite)                       │
│  - Business logic                                        │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP API
┌────────────────▼─────────────────────────────────────────┐
│                    Ollama (IA Locale)                     │
│                    Port: 11434                           │
│  - Modèle Mistral 7B                                     │
│  - Génération de réponses                                │
│  - Traitement local                                      │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Démarrage Rapide

### Prérequis

- **Docker** et **Docker Compose** installés
- **Node.js 20+** (pour développement local)
- **pnpm 10+** (optionnel, pour développement local)

### Option 1 : Avec Docker (Recommandé)

```bash
# 1. Cloner le repo
git clone <repo-url>
cd HackathonTopTech

# 2. Lancer tous les services
pnpm dev
# Ou directement :
docker-compose up --build

# 3. Accéder aux services
# Frontend: http://localhost:8080
# Backend:  http://localhost:3000
# Ollama:   http://localhost:11434
```

Les services démarrent dans l'ordre :

1. **Ollama** (IA locale)
2. **Ollama-init** (téléchargement du modèle Mistral)
3. **Backend** (Express API)
4. **Frontend** (Next.js)

### Option 2 : Développement Local (sans Docker)

```bash
# 1. Installer les dépendances
pnpm install:all

# 2. Lancer Ollama localement
ollama serve

# 3. Télécharger le modèle (dans un autre terminal)
ollama pull mistral

# 4. Démarrer le backend (terminal 1)
pnpm dev:backend

# 5. Démarrer le frontend (terminal 2)
pnpm dev:frontend

# Ou les deux en parallèle :
pnpm dev:local
```

## 📝 Scripts Disponibles

### 🐳 Docker

```bash
pnpm dev              # Lancer tous les services (docker-compose up --build)
pnpm start            # Lancer en production (docker-compose up)
pnpm stop             # Arrêter tous les services
pnpm clean            # Nettoyer volumes et node_modules
```

### 💻 Développement Local

```bash
pnpm dev:frontend     # Lancer Next.js uniquement
pnpm dev:backend      # Lancer Express uniquement
pnpm dev:local        # Lancer frontend + backend en parallèle
```

### 🗄️ Base de Données (Prisma)

```bash
pnpm prisma:generate  # Générer le client Prisma
pnpm prisma:push      # Pousser le schema vers la DB
pnpm prisma:studio    # Ouvrir l'interface Prisma Studio
```

### 🤖 Ollama

```bash
pnpm ollama:pull      # Télécharger le modèle Mistral
pnpm ollama:list      # Lister les modèles disponibles
```

### 📋 Logs

```bash
pnpm logs             # Tous les logs
pnpm logs:frontend    # Logs frontend uniquement
pnpm logs:backend     # Logs backend uniquement
pnpm logs:ollama      # Logs Ollama uniquement
```

### 🛠️ Build et Qualité

```bash
pnpm build            # Build tout le projet
pnpm build:frontend   # Build Next.js
pnpm build:backend    # Build Express
pnpm format           # Formater le code
pnpm lint             # Linter le code
```

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env.local` à la racine :

```bash
cp .env.root.example .env.local
```

Variables principales :

- `NEXT_PUBLIC_BACKEND_URL` : URL du backend (default: http://localhost:3000)
- `OLLAMA_BASE_URL` : URL d'Ollama (default: http://localhost:11434)
- `OLLAMA_MODEL` : Modèle à utiliser (default: mistral)
- `DATABASE_URL` : URL de la base de données SQLite
- `PORT` : Port du backend (default: 3000)

### Docker Compose

Le fichier `docker-compose.yml` configure :

- **Networks** : `paca-analytics-network` pour la communication inter-services
- **Volumes** :
    - `paca-ollama-models` : Modèles Ollama persistants
    - `paca-backend-db` : Base de données SQLite
- **Health Checks** : Ollama vérifié avant le démarrage des autres services

## 🧪 Tests

### Vérifier que tout fonctionne

```bash
# 1. Frontend accessible
curl http://localhost:8080

# 2. Backend API
curl http://localhost:3000/ai/health

# 3. Ollama
curl http://localhost:11434/api/tags

# 4. Test complet du chat
# Ouvrir http://localhost:8080/chat
# Poser : "Quelle est la population de Nice ?"
```

## 📊 API Backend

### Endpoints Disponibles

#### AI Routes (`/ai`)

```bash
# Health check
GET /ai/health

# Poser une question à l'IA
POST /ai/answer
Content-Type: application/json
{
  "question": "Quelle est la population de Nice ?",
  "history": [] # Optionnel
}
```

#### Dump Routes (`/dump`)

```bash
# Liste des dumps
GET /dump

# Statut d'un dump
GET /dump/:type

# Mettre à jour un dump
POST /dump/:type/update
```

#### Users Routes (`/users`)

```bash
# Liste des utilisateurs
GET /users

# Créer un utilisateur
POST /users
```

## 🐛 Dépannage

### Frontend ne démarre pas

```bash
# Vérifier les logs
pnpm logs:frontend

# Reconstruire
docker-compose up --build frontend
```

### Backend ne se connecte pas à Ollama

```bash
# Vérifier qu'Ollama fonctionne
curl http://localhost:11434/api/tags

# Redémarrer Ollama
docker-compose restart ollama
```

### Modèle Mistral manquant

```bash
# Télécharger manuellement
pnpm ollama:pull

# Ou dans le conteneur Ollama
docker-compose exec ollama ollama pull mistral
```

### Base de données corrompue

```bash
# Supprimer le volume et recréer
docker-compose down -v
docker-compose up --build
```

### Problèmes de hot-reload

```bash
# Vérifier que les volumes sont montés
docker-compose ps -v

# Redémarrer les conteneurs
docker-compose restart frontend backend
```

## 📚 Documentation

- **Frontend** : `apps/frontend/README.md`
- **Backend** : `apps/backend/README.md`
- **Ollama Setup** : `docs/OLLAMA_SETUP.md`
- **AI Integration** : `docs/AI_LOCAL_IMPLEMENTATION.md`

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/ma-feature`
2. Commit : `git commit -m "feat: ajout de ma feature"`
3. Push : `git push origin feature/ma-feature`
4. Créer une Pull Request

## 📝 TODO

- [ ] Ajouter PostgreSQL en option (alternative à SQLite)
- [ ] Configurer CI/CD avec GitHub Actions
- [ ] Ajouter tests unitaires et E2E
- [ ] Créer des packages partagés dans `/packages`
- [ ] Ajouter monitoring et logging centralisé
- [ ] Documenter l'API avec Swagger/OpenAPI

## 📄 Licence

[À définir]

## 👥 Équipe

PACA Analytics - Hackathon TopTech 2025

---

**Made with ❤️ for PACA region**
