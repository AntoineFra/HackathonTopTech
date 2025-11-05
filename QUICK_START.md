# 🎯 Quick Start Guide - PACA Analytics Monorepo

## ⚡ Démarrage Ultra-Rapide (2 commandes)

```bash
# 1. Installer les dépendances
pnpm install

# 2. Lancer tout avec Docker
pnpm dev
```

**C'est tout ! 🎉** Le projet démarre automatiquement :
- ✅ Frontend sur http://localhost:8080
- ✅ Backend sur http://localhost:3000
- ✅ Ollama sur http://localhost:11434
- ✅ Mistral téléchargé automatiquement

---

## 📦 Ce Qui A Été Créé

### Structure Finale

```
📁 HackathonTopTech/
│
├── 📁 apps/
│   ├── 📁 frontend/         ← Next.js 16 (votre code)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── services/        ← Adapté pour backend
│   │   ├── Dockerfile       ← Production
│   │   └── Dockerfile.dev   ← Development
│   │
│   └── 📁 backend/          ← Express + Prisma
│       ├── controllers/     ← AI endpoints
│       ├── routes/
│       ├── services/        ← Ollama integration
│       ├── prisma/          ← Database
│       ├── Dockerfile       ← Production
│       └── Dockerfile.dev   ← Development
│
├── 📁 packages/             ← (vide, pour code partagé)
│
├── 📄 docker-compose.yml    ← ⭐ Orchestration magique
├── 📄 package.json          ← ⭐ Scripts monorepo
├── 📄 .env.root.example     ← Configuration
│
└── 📄 README.monorepo.md    ← ⭐ Documentation complète
```

### Fichiers Clés Créés

| Fichier | Rôle |
|---------|------|
| `docker-compose.yml` | Orchestre frontend + backend + Ollama |
| `package.json` (root) | Scripts dev, build, logs, prisma, ollama |
| `apps/frontend/Dockerfile.dev` | Hot-reload frontend |
| `apps/backend/Dockerfile.dev` | Hot-reload backend |
| `apps/backend/services/ollama.services.ts` | Service IA Ollama |
| `.env.root.example` | Configuration d'exemple |
| `README.monorepo.md` | Guide complet |

---

## 🎯 Workflow de Développement

### Développement avec Docker (Recommandé)

```bash
# Démarrer
pnpm dev

# Voir les logs
pnpm logs              # Tous
pnpm logs:frontend     # Frontend uniquement
pnpm logs:backend      # Backend uniquement
pnpm logs:ollama       # IA uniquement

# Arrêter
pnpm stop

# Nettoyer tout
pnpm clean
```

### Développement Local (Sans Docker)

```bash
# Terminal 1 - Ollama
ollama serve

# Terminal 2 - Backend
cd apps/backend
pnpm dev

# Terminal 3 - Frontend
cd apps/frontend
pnpm dev

# Ou en une commande :
pnpm dev:local
```

---

## 🔗 Communication Entre Services

### Avec Docker

```
Frontend → http://backend:3000/ai/answer
Backend  → http://ollama:11434/api/generate
```

### Sans Docker (Local)

```
Frontend → http://localhost:3000/ai/answer
Backend  → http://localhost:11434/api/generate
```

**Note :** Les URLs sont automatiquement configurées dans `docker-compose.yml`

---

## 🧪 Tests Rapides

### 1. Vérifier que tout fonctionne

```bash
# Frontend
curl http://localhost:8080

# Backend API
curl http://localhost:3000/ai/health

# Ollama
curl http://localhost:11434/api/tags

# Question à l'IA
curl -X POST http://localhost:3000/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "Quelle est la population de Nice ?"}'
```

### 2. Test Interface Web

1. Ouvrir http://localhost:8080
2. Aller sur `/chat`
3. Poser : "Quelle est la population de Nice ?"
4. L'IA répond avec le contexte PACA ✅

---

## 🔧 Commandes Utiles

### Gestion Docker

```bash
pnpm dev              # Démarrer (avec build)
pnpm start            # Démarrer (sans rebuild)
pnpm stop             # Arrêter
pnpm clean            # Nettoyer volumes
```

### Base de Données

```bash
pnpm prisma:generate  # Générer Prisma Client
pnpm prisma:push      # Pousser schema → DB
pnpm prisma:studio    # Interface graphique
```

### Ollama

```bash
pnpm ollama:pull      # Télécharger Mistral
pnpm ollama:list      # Lister modèles
```

### Logs

```bash
pnpm logs             # Tous les logs en temps réel
pnpm logs:frontend    # Frontend uniquement
pnpm logs:backend     # Backend uniquement
pnpm logs:ollama      # Ollama uniquement
```

---

## 🎨 Architecture Visuelle

```
┌─────────────────────────────────────────────┐
│           👤 User Browser                    │
│           http://localhost:8080              │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│       🖥️  Frontend (Next.js)                 │
│       Port: 8080                             │
│       - Interface utilisateur                │
│       - Chat IA avec historique              │
│       - Carte 3D interactive                 │
└──────────────────┬──────────────────────────┘
                   │ POST /ai/answer
┌──────────────────▼──────────────────────────┐
│       ⚙️  Backend (Express)                  │
│       Port: 3000                             │
│       - API REST (/ai, /dump, /users)        │
│       - Prisma + SQLite                      │
│       - services/ollama.services.ts          │
└──────────────────┬──────────────────────────┘
                   │ POST /api/generate
┌──────────────────▼──────────────────────────┐
│       🤖 Ollama (IA Locale)                  │
│       Port: 11434                            │
│       - Modèle: Mistral 7B                   │
│       - Traitement 100% local                │
│       - System prompt PACA                   │
└──────────────────────────────────────────────┘
```

---

## 📝 Modifications Principales

### ✅ Frontend (`apps/frontend/`)

**Modifié :**
- `services/ai.services.ts` : Appelle backend Express
- `components/chat-interface.tsx` : Utilise `aiAnswer()` avec historique

**Supprimé :**
- `app/api/ai-local/` : Route Next.js (remplacée par backend)

**Ajouté :**
- `Dockerfile` : Build production
- `Dockerfile.dev` : Hot-reload development

### ✅ Backend (`apps/backend/`)

**Ajouté :**
- `services/ollama.services.ts` : Service complet Ollama
- `Dockerfile` : Build production
- `Dockerfile.dev` : Hot-reload development

**Modifié :**
- `controllers/ai.controllers.ts` : Support historique conversation
- `services/ai.services.ts` : Intégration Ollama
- `server.ts` : CORS étendu pour Docker

### ✅ Root

**Créé :**
- `package.json` : Scripts monorepo
- `docker-compose.yml` : Orchestration
- `.env.root.example` : Configuration
- `.dockerignore` : Optimisation builds
- `README.monorepo.md` : Documentation
- `MONOREPO_SUCCESS.md` : Guide succès
- `MIGRATION_CHECKLIST.md` : Checklist complète
- `QUICK_START.md` : Ce guide

---

## 🚀 Prêt pour Production

### Build Production

```bash
# Build tout
pnpm build

# Build frontend uniquement
pnpm build:frontend

# Build backend uniquement
pnpm build:backend
```

### Déploiement

Les Dockerfiles de production sont prêts :
- Multi-stage builds optimisés
- Images minimales
- Non-root users
- Production-ready

---

## 💡 Astuces

### Hot-Reload

Les modifications sont détectées automatiquement :
- **Frontend** : Rechargement instantané
- **Backend** : Redémarrage automatique (tsx watch)
- **Base de données** : Persistante entre redémarrages

### Volumes Persistants

```bash
# Lister les volumes
docker volume ls | grep paca

# Supprimer les volumes
docker volume rm paca-ollama-models paca-backend-db
```

### Logs en Temps Réel

```bash
# Suivre tous les logs
pnpm logs

# Filtrer un service
pnpm logs | grep "frontend"
```

---

## 🆘 Aide Rapide

### Problème : Ollama ne démarre pas

```bash
pnpm logs:ollama
docker-compose restart ollama
```

### Problème : Frontend ne se connecte pas

```bash
# Vérifier backend
curl http://localhost:3000/ai/health

# Vérifier CORS
cat apps/backend/server.ts | grep cors
```

### Problème : Modèle manquant

```bash
pnpm ollama:pull
```

### Problème : Base de données

```bash
cd apps/backend
pnpm prisma generate
pnpm prisma push
```

---

## 📚 Documentation Complète

Pour plus de détails, consulter :

1. **`README.monorepo.md`** : Guide complet du monorepo
2. **`MONOREPO_SUCCESS.md`** : Installation et succès
3. **`MIGRATION_CHECKLIST.md`** : Checklist complète
4. **`docs/OLLAMA_SETUP.md`** : Configuration Ollama détaillée
5. **`docs/AI_LOCAL_IMPLEMENTATION.md`** : Intégration IA

---

## 🎉 Succès !

Votre monorepo PACA Analytics est prêt ! 🚀

**Une seule commande pour tout lancer :**

```bash
pnpm dev
```

**Temps de démarrage :**
- Première fois : 5-10 min (téléchargement Mistral)
- Redémarrages : 30-60 secondes

**Accès :**
- 🖥️ Frontend : http://localhost:8080
- ⚙️ Backend : http://localhost:3000
- 🤖 Ollama : http://localhost:11434

---

*PACA Analytics - Hackathon TopTech 2025*
