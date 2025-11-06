# 🎉 MONOREPO PACA ANALYTICS - SETUP RÉUSSI !

## ✅ Configuration Complète

Votre monorepo est maintenant **100% opérationnel** avec :

### 🏗️ Architecture

- ✅ **Frontend** (Next.js 16 + React 19 + Tailwind CSS v4)
- ✅ **Backend** (Express 5 + Prisma 6 + SQLite)
- ✅ **IA Locale** (Ollama + Mistral 7B)
- ✅ **Docker Compose** (Orchestration complète)

### 📦 Services Actifs

| Service            | Port  | Statut        | URL                    |
| ------------------ | ----- | ------------- | ---------------------- |
| **Frontend**       | 8080  | ✅ Running    | http://localhost:8080  |
| **Backend API**    | 3000  | ✅ Running    | http://localhost:3000  |
| **Ollama**         | 11434 | ✅ Running    | http://localhost:11434 |
| **Modèle Mistral** | -     | ✅ Téléchargé | mistral:latest         |

### 🧪 Tests de Validation

#### 1. Backend Health Check

```bash
curl http://localhost:3000/api/ai/health
```

**Résultat attendu :**

```json
{
    "status": "healthy",
    "ollama_url": "http://ollama:11434",
    "model": "mistral",
    "available_models": ["mistral:latest"],
    "message": "AI locale opérationnelle"
}
```

#### 2. Question à l'IA

```bash
curl -X POST http://localhost:3000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"Quelle est la capitale de la France?","history":[]}'
```

#### 3. Interface Web

Ouvrez http://localhost:8080 dans votre navigateur et testez le chat !

---

## 🚀 Commandes Utiles

### Démarrage/Arrêt

```bash
# Démarrer tous les services
pnpm dev

# Arrêter tous les services
pnpm stop

# Voir les logs en temps réel
pnpm logs

# Logs d'un service spécifique
pnpm logs:frontend
pnpm logs:backend
pnpm logs:ollama
```

### Développement Local (sans Docker)

```bash
# Terminal 1 - Backend
pnpm dev:backend

# Terminal 2 - Frontend
pnpm dev:frontend
```

### Base de Données

```bash
# Générer le client Prisma
pnpm prisma:generate

# Pousser le schéma vers la DB
pnpm prisma:push

# Interface visuelle Prisma Studio
pnpm prisma:studio
```

### Ollama

```bash
# Télécharger un modèle
pnpm ollama:pull

# Lister les modèles installés
pnpm ollama:list

# Utiliser un autre modèle (dans docker-compose.yml)
# OLLAMA_MODEL=llama3.2  # ou mistral, codellama, etc.
```

### Nettoyage

```bash
# Arrêter et supprimer volumes + images
pnpm clean
```

---

## 📁 Structure du Projet

```
HackathonTopTech/
├── apps/
│   ├── frontend/          # Application Next.js
│   │   ├── app/           # Pages et routes
│   │   ├── components/    # Composants React
│   │   ├── lib/           # Utilitaires
│   │   └── services/      # Services API (appelle le backend)
│   │
│   └── backend/           # API Express
│       ├── controllers/   # Contrôleurs Express
│       ├── services/      # Services métier (Ollama, IA)
│       ├── routes/        # Routes API
│       ├── prisma/        # Schéma de base de données
│       └── generated/     # Client Prisma généré
│
├── packages/              # Code partagé (vide pour l'instant)
├── docker-compose.yml     # Orchestration Docker
├── pnpm-workspace.yaml    # Configuration monorepo
└── package.json           # Scripts root
```

---

## 🔧 Configuration

### Variables d'Environnement

**Backend** (`apps/backend/.env`) :

```env
DATABASE_URL="file:./prisma/dev.db"
OLLAMA_BASE_URL="http://ollama:11434"
OLLAMA_MODEL="mistral"
OLLAMA_TIMEOUT="120000"
PORT="3000"
```

**Frontend** (`apps/frontend/.env.local`) :

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
```

---

## 🐳 Docker

### Services

1. **frontend** - Next.js avec hot-reload
    - Build : `apps/frontend/Dockerfile.dev`
    - Port : 8080:3000
    - Volumes : Code monté pour hot-reload

2. **backend** - Express avec tsx watch
    - Build : `apps/backend/Dockerfile.dev`
    - Port : 3000:3000
    - Volumes : Code + base de données SQLite

3. **ollama** - Serveur Ollama
    - Image : `ollama/ollama:latest`
    - Port : 11434:11434
    - Volume : Modèles persistés

4. **ollama-init** - Télécharge Mistral au démarrage
    - S'exécute une fois puis s'arrête
    - Vérifie si le modèle existe avant de télécharger

### Volumes Persistés

- `paca-ollama-models` - Modèles Ollama (4.4 GB)
- `paca-backend-db` - Base de données SQLite

---

## 🎯 Flux de Données

```
┌─────────────┐      HTTP      ┌─────────────┐      HTTP      ┌─────────────┐
│   Browser   │───────────────>│  Frontend   │───────────────>│   Backend   │
│  :8080      │<───────────────│   Next.js   │<───────────────│   Express   │
└─────────────┘   React UI     └─────────────┘   JSON API     └─────────────┘
                                                                      │
                                                                      │ HTTP
                                                                      ▼
                                                               ┌─────────────┐
                                                               │   Ollama    │
                                                               │  Mistral 7B │
                                                               └─────────────┘
```

1. L'utilisateur pose une question dans l'interface web (port 8080)
2. Le frontend envoie la question au backend (POST `/api/ai/answer`)
3. Le backend traite la question et appelle Ollama
4. Ollama génère une réponse avec Mistral
5. Le backend retourne la réponse au frontend
6. L'interface affiche la réponse à l'utilisateur

---

## 📚 Documentation Complète

- 📖 [README Monorepo](./README.monorepo.md) - Guide détaillé
- ✅ [Checklist Migration](./MIGRATION_CHECKLIST.md) - 10 étapes complétées
- ⚡ [Quick Start](./QUICK_START.md) - Démarrage rapide

---

## ✨ Prochaines Étapes

### 1. Tester l'Application

- Ouvrez http://localhost:8080
- Posez une question dans le chat
- Vérifiez que l'IA répond correctement

### 2. Explorer les Données

```bash
pnpm prisma:studio
```

Interface web pour visualiser/éditer la base de données

### 3. Développer

- Le code frontend se recharge automatiquement (hot-reload)
- Le backend redémarre automatiquement (tsx watch)
- Modifiez le code et voyez les changements en temps réel !

### 4. Déployer

- Frontend : Vercel, Netlify, ou n'importe quel host Next.js
- Backend : Railway, Render, ou VPS avec Docker
- Ollama : GPU server ou CPU avec des modèles optimisés

---

## 🔥 Fonctionnalités Avancées

### Changer de Modèle IA

Modifiez `OLLAMA_MODEL` dans `docker-compose.yml` :

```yaml
environment:
    - OLLAMA_MODEL=llama3.2 # Plus rapide
    # - OLLAMA_MODEL=mistral  # Actuel
    # - OLLAMA_MODEL=codellama  # Pour le code
```

Puis téléchargez le nouveau modèle :

```bash
docker-compose exec ollama ollama pull llama3.2
docker-compose restart backend
```

### Ajouter des Modèles Prisma

1. Modifiez `apps/backend/prisma/schema.prisma`
2. Générez le client : `pnpm prisma:generate`
3. Poussez vers la DB : `pnpm prisma:push`

### Partager du Code entre Apps

Créez un package dans `packages/` :

```bash
mkdir -p packages/shared
cd packages/shared
pnpm init
```

Utilisez-le dans frontend ou backend :

```json
{
    "dependencies": {
        "@paca/shared": "workspace:*"
    }
}
```

---

## 🆘 Troubleshooting

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Recréer la DB
docker-compose exec backend pnpm prisma db push
docker-compose restart backend
```

### Ollama est lent

- Normal pour Mistral 7B sur CPU
- Utilisez un modèle plus petit : `llama3.2` (2B)
- Ou ajoutez du GPU support dans docker-compose

### Frontend ne voit pas le backend

- Vérifiez que `NEXT_PUBLIC_BACKEND_URL` est correct
- En dev local : http://localhost:3000
- En Docker : http://backend:3000 (réseau interne)

### Port déjà utilisé

```bash
# Changer les ports dans docker-compose.yml
ports:
  - "8081:3000"  # Au lieu de 8080
```

---

## 🎊 Félicitations !

Votre environnement de développement est **prêt à l'emploi** !

**Stack technique moderne :**

- ✅ Monorepo avec pnpm workspaces
- ✅ TypeScript partout
- ✅ Hot-reload frontend & backend
- ✅ IA locale performante
- ✅ Docker pour la cohérence d'environnement
- ✅ Base de données SQLite avec Prisma

**Bon développement ! 🚀**

---

**Dernière mise à jour :** 5 novembre 2025  
**Version :** 1.0.0
