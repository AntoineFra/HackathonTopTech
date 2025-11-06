# Architecture API - Hackathon TopTech Backend

## 📊 Vue d'ensemble de l'API

```
┌─────────────────────────────────────────────────────────────────┐
│                    Hackathon TopTech API                        │
│                  http://localhost:3000/api                      │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Swagger UI  │      │  API Routes  │      │  OpenAPI     │
│  /api-docs   │      │  /api/*      │      │  /api-docs   │
│              │      │              │      │  .json       │
└──────────────┘      └──────────────┘      └──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Dump      │      │    Users     │      │      AI      │
│              │      │              │      │              │
│ GET  /dump   │      │ GET  /users  │      │ POST /answer │
│ GET  /:type  │      │ POST /users  │      │ GET  /health │
└──────────────┘      └──────────────┘      └──────────────┘
        │
        ▼
┌──────────────┐      ┌──────────────┐
│      3D      │      │   Settings   │
│              │      │              │
│ GET  /cities │      │ GET  /       │
│ GET  /:name  │      │ PUT  /       │
└──────────────┘      └──────────────┘
```

## 🗂️ Structure des Endpoints

### 1️⃣ Dump (Import de données)
```
/api/dump
  ├── GET  /                    # Liste tous les dumps
  └── GET  /:dumpType           # Exécute un dump
       ├── legal_unit           # Import unités légales
       └── cities               # Import villes
```

### 2️⃣ Users (Gestion utilisateurs)
```
/api/users
  ├── GET  /                    # Liste utilisateurs
  └── POST /                    # Crée utilisateur
```

### 3️⃣ AI (Intelligence Artificielle)
```
/api/ai
  ├── POST /answer              # Question à l'IA
  └── GET  /health              # État du service
```

### 4️⃣ 3D (Données géographiques)
```
/api/trois-d
  └── /cities
      ├── GET  /                # Toutes les villes
      └── GET  /:name           # Ville par nom
```

### 5️⃣ Settings (Configuration)
```
/api/settings
  ├── GET  /                    # Récupère config
  └── PUT  /                    # Met à jour config
```

## 🔄 Flux de données

### Import de données (Dump)
```
Client → GET /api/dump/cities → Backend
                                    │
                                    ├─► Download ZIP
                                    ├─► Extract CSV
                                    ├─► Import SQLite
                                    ├─► Fetch Geo API
                                    └─► Insert Prisma
                                         │
Client ◄─ Response ◄─────────────────────┘
```

### Question IA
```
Client → POST /api/ai/answer → Backend
         { question, history }      │
                                    ├─► Ollama Service
                                    ├─► Generate Answer
                                    └─► Format Response
                                         │
Client ◄─ { answer, model } ◄────────────┘
```

### Récupération ville
```
Client → GET /api/trois-d/cities/Nice → Backend
                                           │
                                           ├─► Prisma Query
                                           ├─► Include Relations
                                           │   ├─ PostalCodes
                                           │   └─ GeoData
                                           └─► Format Response
                                                │
Client ◄─ City Object ◄────────────────────────┘
```

## 📦 Modèles de données

### Relations entre entités
```
User                     City ──────────────┬──────────────┐
  ├─ id                    ├─ codeINSEE     │              │
  ├─ email                 ├─ name          │              │
  └─ name                  ├─ population    │              │
                           └─ ...           │              │
                                            │              │
Dump                                        ▼              ▼
  ├─ id                              PostalCode      CityGeoData
  ├─ type                              ├─ code         ├─ centreLat
  ├─ status                            └─ ...          ├─ centreLon
  └─ lastUpdate                                        ├─ contour
                                                       └─ bbox
Settings
  ├─ id
  └─ aiTimeout
```

## 🎨 Tags Swagger

Les endpoints sont organisés par tags dans Swagger UI :

| Tag       | Description                          | Endpoints |
|-----------|--------------------------------------|-----------|
| Dump      | Import de données massives           | 2         |
| Users     | Gestion des utilisateurs             | 2         |
| AI        | Intelligence artificielle            | 2         |
| 3D        | Données géographiques 3D             | 2         |
| Settings  | Configuration application            | 2         |

## 🔐 Sécurité et CORS

### CORS Configuration
```typescript
origin: [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://frontend:3000",
  /^http:\/\/192\.168\.\d+\.\d+:8080$/,
  /^http:\/\/172\.\d+\.\d+\.\d+:8080$/
]
```

## 🚀 Performance

### Cache et optimisation
- Vérification d'existence avant import (dump)
- Relations Prisma optimisées (include)
- Timeout configurable pour IA

### Gestion des erreurs
```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ├─► 400 Bad Request (validation)
       ├─► 404 Not Found (ressource)
       ├─► 500 Internal Error (serveur)
       └─► 503 Service Unavailable (IA)
```

## 📈 Statistiques

- **Total Endpoints** : 10
- **Méthodes HTTP** : GET (7), POST (2), PUT (1)
- **Modèles de données** : 9
- **Services externes** : 2 (API Geo, Ollama)
- **Base de données** : SQLite + Prisma

## 🔧 Stack Technique

```
┌──────────────────────────────────────┐
│         Client / Frontend            │
└────────────────┬─────────────────────┘
                 │ HTTP/REST
┌────────────────▼─────────────────────┐
│     Express.js + Swagger UI          │
├──────────────────────────────────────┤
│     Routes + Controllers             │
├──────────────────────────────────────┤
│         Services Layer               │
│   ├─ Dump                            │
│   ├─ AI (Ollama)                     │
│   └─ Settings                        │
├──────────────────────────────────────┤
│     Prisma ORM                       │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│         SQLite Database              │
│   ├─ Users                           │
│   ├─ Cities                          │
│   ├─ LegalUnits                      │
│   ├─ PostalCodes                     │
│   ├─ CityGeoData                     │
│   ├─ Dumps                           │
│   └─ Settings                        │
└──────────────────────────────────────┘
```

## 📝 Notes de développement

### Ajout d'un nouvel endpoint

1. **Créer le service** dans `services/`
2. **Créer le controller** dans `controllers/`
3. **Ajouter la route** dans `routes/`
4. **Documenter avec Swagger** (annotations JSDoc)
5. **Enregistrer dans** `routes/routes.ts`

### Format des annotations Swagger

```typescript
/**
 * @swagger
 * /api/votre-endpoint:
 *   method:
 *     summary: Description courte
 *     tags: [Tag]
 *     parameters: [...]
 *     requestBody: {...}
 *     responses:
 *       200: {...}
 */
```

## 🎯 Best Practices

- ✅ Toujours documenter les nouveaux endpoints
- ✅ Utiliser les schémas définis dans swagger.config.ts
- ✅ Inclure les exemples dans la documentation
- ✅ Documenter tous les codes d'erreur possibles
- ✅ Tester via Swagger UI avant commit

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2025  
**Documentation** : http://localhost:3000/api-docs

