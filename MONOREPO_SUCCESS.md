# 🎉 Monorepo PACA Analytics - Installation Complète !

## ✅ Ce qui a été réalisé

### 1. 🏗️ Architecture Monorepo Complète

```
paca-analytics-monorepo/
├── apps/
│   ├── frontend/              # Next.js 16 + React 19
│   │   ├── app/               # Pages et routes
│   │   ├── components/        # Composants UI
│   │   ├── lib/               # Utilitaires
│   │   ├── services/          # API services
│   │   ├── Dockerfile         # Production build
│   │   └── Dockerfile.dev     # Development hot-reload
│   │
│   └── backend/               # Express + Prisma + Ollama
│       ├── controllers/       # Express controllers
│       ├── routes/            # API routes
│       ├── services/          # Business logic + Ollama
│       ├── prisma/            # Database schema
│       ├── Dockerfile         # Production build
│       └── Dockerfile.dev     # Development hot-reload
│
├── docker-compose.yml         # Orchestration complète
├── package.json               # Scripts monorepo
└── README.monorepo.md         # Documentation complète
```

### 2. 🐳 Docker Compose Complet

**Services configurés :**

1. **Frontend (Next.js)**
   - Port : 8080
   - Hot-reload activé
   - Connexion automatique au backend

2. **Backend (Express)**
   - Port : 3000
   - Prisma + SQLite
   - Routes AI, Dump, Users
   - CORS configuré

3. **Ollama (IA Locale)**
   - Port : 11434
   - Modèle Mistral 7B
   - Volume persistant
   - Health check

4. **Ollama-Init**
   - Téléchargement automatique de Mistral
   - One-shot au démarrage

**Volumes persistants :**
- `paca-ollama-models` : Modèles Ollama
- `paca-backend-db` : Base de données SQLite

**Network :**
- `paca-analytics-network` : Communication inter-services

### 3. 🤖 Intégration IA Complète

**Backend Express :**
- `services/ollama.services.ts` : Service Ollama complet
- System prompt spécialisé PACA
- Historique de conversation (10 messages)
- Health check Ollama
- Gestion d'erreurs et timeouts

**Routes API :**
```
POST /ai/answer
- Body: { question: string, history: ChatMessage[] }
- Response: { success, answer, confidence, model }

GET /ai/health
- Response: { status, ollama_url, available_models }
```

**Frontend Next.js :**
- `services/ai.services.ts` : Appelle le backend Express
- `chat-interface.tsx` : Utilise aiAnswer avec historique
- Suppression de l'ancienne route `/api/ai-local`

### 4. 📝 Scripts Disponibles

```json
{
  "dev": "docker-compose up --build",
  "dev:frontend": "cd apps/frontend && pnpm dev",
  "dev:backend": "cd apps/backend && pnpm dev",
  "dev:local": "concurrently frontend + backend",
  
  "start": "docker-compose up",
  "stop": "docker-compose down",
  "clean": "docker-compose down -v",
  
  "prisma:generate": "Générer Prisma Client",
  "prisma:push": "Pusher schema vers DB",
  "prisma:studio": "Ouvrir Prisma Studio",
  
  "ollama:pull": "Télécharger Mistral",
  "ollama:list": "Lister modèles",
  
  "logs": "Tous les logs",
  "logs:frontend": "Logs frontend",
  "logs:backend": "Logs backend",
  "logs:ollama": "Logs Ollama"
}
```

### 5. 📄 Documentation

**Fichiers créés :**
- `README.monorepo.md` : Guide complet du monorepo
- `.env.root.example` : Configuration d'exemple
- `.dockerignore` : Optimisation builds Docker
- `apps/frontend/Dockerfile` : Build production frontend
- `apps/frontend/Dockerfile.dev` : Dev hot-reload frontend
- `apps/backend/Dockerfile` : Build production backend
- `apps/backend/Dockerfile.dev` : Dev hot-reload backend
- `docker-compose.yml` : Orchestration complète

## 🚀 Démarrage

### Option 1 : Docker (Recommandé)

```bash
# 1. Installer les dépendances root
pnpm install

# 2. Lancer tous les services
pnpm dev

# 3. Attendre que tout démarre (1-2 minutes)
# - Ollama démarre
# - Mistral se télécharge (première fois seulement)
# - Backend démarre
# - Frontend démarre

# 4. Accéder aux services
# Frontend: http://localhost:8080
# Backend:  http://localhost:3000
# Ollama:   http://localhost:11434
```

### Option 2 : Développement Local

```bash
# 1. Installer les dépendances
pnpm install:all

# 2. Démarrer Ollama
ollama serve
ollama pull mistral

# 3. Backend (terminal 1)
cd apps/backend
pnpm install
pnpm prisma generate
pnpm dev

# 4. Frontend (terminal 2)
cd apps/frontend
pnpm install
pnpm dev

# 5. Accéder à http://localhost:8080
```

## 🧪 Tests

### 1. Vérifier Ollama

```bash
curl http://localhost:11434/api/tags
```

### 2. Vérifier Backend API

```bash
# Health check
curl http://localhost:3000/ai/health

# Question test
curl -X POST http://localhost:3000/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "Quelle est la population de Nice ?"}'
```

### 3. Vérifier Frontend

```bash
curl http://localhost:8080
```

### 4. Test Complet

1. Ouvrir http://localhost:8080/chat
2. Poser : "Quelle est la population de Nice ?"
3. L'IA doit répondre avec le contexte PACA

## 📊 Flux de Données

```
User (Browser)
    ↓
Frontend (Next.js:8080)
    ↓ HTTP POST /ai/answer
Backend (Express:3000)
    ↓ services/ollama.services.ts
Ollama (AI:11434)
    ↓ Mistral 7B
Response (JSON)
```

## 🔧 Configuration

### Variables d'Environnement

**Docker (automatique) :**
- Backend → Ollama : `http://ollama:11434`
- Frontend → Backend : `http://backend:3000`

**Local :**
Créer `.env.local` :
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
DATABASE_URL=file:./prisma/dev.db
```

### Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 8080 | http://localhost:8080 |
| Backend | 3000 | http://localhost:3000 |
| Ollama | 11434 | http://localhost:11434 |
| Prisma Studio | 5555 | http://localhost:5555 (via pnpm prisma:studio) |

## 🐛 Dépannage

### Ollama ne démarre pas

```bash
# Vérifier les logs
pnpm logs:ollama

# Redémarrer
docker-compose restart ollama
```

### Frontend ne se connecte pas au backend

```bash
# Vérifier que le backend fonctionne
curl http://localhost:3000/ai/health

# Vérifier CORS
# S'assurer que apps/backend/server.ts autorise l'origine frontend
```

### Modèle Mistral manquant

```bash
# Télécharger manuellement
pnpm ollama:pull

# Ou directement dans Ollama
docker-compose exec ollama ollama pull mistral
```

### Hot-reload ne fonctionne pas

```bash
# Vérifier les volumes
docker-compose ps -v

# Reconstruire
docker-compose up --build
```

### Base de données corrompue

```bash
# Supprimer le volume et recréer
docker-compose down -v
docker-compose up --build
```

## 📈 Prochaines Étapes

### Fonctionnalités à ajouter

1. **Streaming AI**
   - Réponses token par token
   - Meilleure UX

2. **Cache Redis**
   - Cache des réponses AI
   - Performance améliorée

3. **PostgreSQL**
   - Alternative à SQLite
   - Meilleure scalabilité

4. **CI/CD**
   - GitHub Actions
   - Tests automatisés
   - Déploiement automatique

5. **Monitoring**
   - Grafana + Prometheus
   - Logs centralisés
   - Alertes

### Packages partagés

Créer dans `/packages` :
- `@paca/types` : Types TypeScript partagés
- `@paca/utils` : Fonctions utilitaires
- `@paca/config` : Configuration partagée

## 💡 Avantages du Monorepo

✅ **Code partagé** : Types, utils, config  
✅ **Build unifié** : Une commande pour tout  
✅ **Versions synchronisées** : Pas de problèmes de compatibilité  
✅ **Hot-reload** : Modifications instantanées  
✅ **Docker optimisé** : Multi-stage builds  
✅ **CI/CD simplifié** : Un pipeline pour tout  

## 📚 Documentation Complète

- **`README.monorepo.md`** : Guide principal
- **`docs/OLLAMA_SETUP.md`** : Configuration Ollama
- **`docs/AI_LOCAL_IMPLEMENTATION.md`** : Intégration IA
- **`apps/backend/README.md`** : Backend specifique (à créer)
- **`apps/frontend/README.md`** : Frontend specifique (à créer)

## 🎓 Technologies Utilisées

- **Frontend** : Next.js 16, React 19, Tailwind CSS, TypeScript
- **Backend** : Express 5, Prisma, TypeScript
- **Base de données** : SQLite (dev), PostgreSQL (prod recommandé)
- **IA** : Ollama, Mistral 7B
- **Containerisation** : Docker, Docker Compose
- **Package Manager** : pnpm 10
- **Monorepo** : pnpm workspaces

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/ma-feature`
2. Commit : `git commit -m "feat: ajout de ma feature"`
3. Push : `git push origin feature/ma-feature`
4. Créer une Pull Request

## 📝 Structure Git Recommandée

```
main                    # Production
├── develop             # Développement
├── feature/*           # Nouvelles fonctionnalités
├── fix/*               # Corrections de bugs
└── release/*           # Préparation releases
```

## 🎉 Conclusion

Le monorepo PACA Analytics est maintenant **100% opérationnel** !

**Pour démarrer immédiatement :**

```bash
pnpm install && pnpm dev
```

Puis ouvrir http://localhost:8080 et commencer à utiliser l'application ! 🚀

**Temps de démarrage estimé :**
- Première fois : 5-10 minutes (téléchargement Mistral)
- Redémarrages : 30-60 secondes

---

**Made with ❤️ for PACA region - Hackathon TopTech 2025**
