# PACA Analytics - Hackathon CCI Nice Côte d'Azur 2025

Portail interactif alimenté par l'IA pour interroger les données socio-démographiques du territoire 06.

## 🚀 Quick Start

### 1. Installation

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
