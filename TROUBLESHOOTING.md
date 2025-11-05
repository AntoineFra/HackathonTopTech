# 🔧 Troubleshooting Guide

## ❌ NetworkError when attempting to fetch resource

### Problème
Dans la console du navigateur, vous voyez :
```
TypeError: NetworkError when attempting to fetch resource.
```

### Cause
Le frontend Next.js ne peut pas appeler le backend Express car la variable d'environnement `NEXT_PUBLIC_BACKEND_URL` n'est pas définie.

### Solution ✅

1. **Ajouter la variable dans `.env.local`** :
   ```bash
   # apps/frontend/.env.local
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
   ```

2. **Redémarrer le frontend** :
   ```bash
   docker-compose restart frontend
   # ou
   pnpm dev:frontend
   ```

3. **Vérifier dans la console** :
   Le service API affiche maintenant :
   ```
   ➡️  POST http://localhost:3000/api/ai/answer
   ```

### Pourquoi `NEXT_PUBLIC_` ?

Next.js a deux types de variables d'environnement :

- **`NEXT_PUBLIC_*`** → Exposées au **navigateur** (client-side)
- **Sans préfixe** → Disponibles **uniquement côté serveur**

Notre appel `fetch()` se fait depuis le navigateur, donc on doit utiliser `NEXT_PUBLIC_BACKEND_URL`.

### Architecture Réseau

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   Navigateur    │  HTTP    │   Frontend      │  HTTP    │    Backend      │
│  (localhost)    │─────────>│   Next.js       │─────────>│    Express      │
│                 │          │  Port 8080      │          │   Port 3000     │
└─────────────────┘          └─────────────────┘          └─────────────────┘
      ↓                                                             ↓
      └──── appelle http://localhost:3000/api/... ─────────────────┘
```

**Important :** 
- Le navigateur appelle toujours `localhost:3000` (même si le frontend est dans Docker)
- Les conteneurs Docker communiquent entre eux via les noms de services (`http://backend:3000`)
- Mais le **navigateur** n'a pas accès au réseau Docker interne

---

## 🔍 Autres Problèmes Courants

### 1. CORS Error

**Symptôme :**
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**Solution :**
Vérifiez que le backend Express a bien configuré CORS :
```typescript
// apps/backend/server.ts
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### 2. Backend ne démarre pas

**Symptôme :**
```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine
```

**Solution :**
```bash
# Entrez dans le conteneur
docker-compose exec backend sh

# Créez la base de données
pnpm prisma db push --accept-data-loss

# Sortez et redémarrez
exit
docker-compose restart backend
```

### 3. Ollama Timeout

**Symptôme :**
```json
{"error":"Timeout: La requête a pris trop de temps"}
```

**Solution :**
Augmentez le timeout dans `docker-compose.yml` :
```yaml
backend:
  environment:
    - OLLAMA_TIMEOUT=120000  # 2 minutes au lieu de 30s
```

### 4. Modèle Mistral non téléchargé

**Symptôme :**
```
Error: model 'mistral' not found
```

**Solution :**
```bash
# Téléchargez manuellement
docker-compose exec ollama ollama pull mistral

# Vérifiez les modèles disponibles
docker-compose exec ollama ollama list
```

### 5. Port déjà utilisé

**Symptôme :**
```
Error: bind: address already in use
```

**Solution :**
```bash
# Trouvez le processus
lsof -ti:3000  # ou :8080, :11434

# Tuez-le
kill -9 $(lsof -ti:3000)

# Ou changez le port dans docker-compose.yml
ports:
  - "8081:3000"  # Au lieu de 8080
```

---

## 🧪 Tests de Validation

### 1. Backend Health Check
```bash
curl http://localhost:3000/api/ai/health
```

**Réponse attendue :**
```json
{
  "status": "healthy",
  "ollama_url": "http://ollama:11434",
  "model": "mistral",
  "available_models": ["mistral:latest"],
  "message": "AI locale opérationnelle"
}
```

### 2. Question à l'IA
```bash
curl -X POST http://localhost:3000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"Bonjour!","history":[]}'
```

### 3. Frontend Accessible
```bash
curl -s http://localhost:8080 | grep -q "Next.js" && echo "✅ Frontend OK"
```

### 4. Tous les conteneurs actifs
```bash
docker-compose ps
```

**Attendu :**
```
paca-frontend    Up
paca-backend     Up
paca-ollama      Up (healthy)
```

---

## 🛠️ Commandes de Debug

### Voir les logs en temps réel
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ollama
```

### Inspecter un conteneur
```bash
# Entrer dans le conteneur
docker-compose exec backend sh

# Voir les variables d'environnement
docker-compose exec backend env | grep OLLAMA

# Tester Ollama depuis le backend
docker-compose exec backend wget -O- http://ollama:11434/api/tags
```

### Reconstruire proprement
```bash
# Arrêter et nettoyer
docker-compose down -v

# Reconstruire sans cache
docker-compose build --no-cache

# Redémarrer
docker-compose up -d
```

### Vérifier les variables d'environnement Next.js
```bash
# Dans le conteneur frontend
docker-compose exec frontend sh -c 'echo $NEXT_PUBLIC_BACKEND_URL'
```

---

## 📚 Ressources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

---

**Dernière mise à jour :** 5 novembre 2025
