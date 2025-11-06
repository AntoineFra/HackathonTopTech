# Guide Rapide - API Documentation Swagger

## 🎯 Accès Rapide

```
📚 Documentation Interactive: http://localhost:3000/api-docs
📄 Spécification OpenAPI JSON: http://localhost:3000/api-docs.json
```

## 🚀 Démarrage

```bash
cd apps/backend
pnpm run dev
# Le serveur démarre sur http://localhost:3000
# La doc Swagger est disponible sur http://localhost:3000/api-docs
```

## 📋 Liste des Endpoints

### Dump (Import de données)
```
GET  /api/dump              # Liste tous les dumps
GET  /api/dump/:dumpType    # Lance un dump (legal_unit | cities)
```

### Users (Utilisateurs)
```
GET  /api/users             # Liste tous les utilisateurs
POST /api/users             # Crée un utilisateur
```

### AI (Intelligence Artificielle)
```
POST /api/ai/answer         # Pose une question à l'IA
GET  /api/ai/health         # Vérifie l'état du service IA
```

### 3D (Données Géographiques)
```
GET  /api/trois-d/cities        # Récupère toutes les villes
GET  /api/trois-d/cities/:name  # Récupère une ville par nom
```

### Settings (Configuration)
```
GET  /api/settings          # Récupère les paramètres
PUT  /api/settings          # Met à jour les paramètres
```

## 💡 Exemples d'utilisation

### Créer un utilisateur
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### Poser une question à l'IA
```bash
curl -X POST http://localhost:3000/api/ai/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"Quelle est la population de Nice?"}'
```

### Récupérer une ville
```bash
curl http://localhost:3000/api/trois-d/cities/Nice
```

### Lancer le dump des villes
```bash
curl http://localhost:3000/api/dump/cities
```

### Mettre à jour le timeout IA
```bash
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"aiTimeout":45000}'
```

## 🔑 Codes de réponse HTTP

| Code | Description |
|------|-------------|
| 200  | Succès |
| 400  | Requête invalide |
| 404  | Ressource non trouvée |
| 500  | Erreur serveur |
| 503  | Service indisponible (IA) |

## 📦 Structure des données principales

### User
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe"
}
```

### City
```json
{
  "codeINSEE": "06001",
  "name": "Aiglun",
  "population": 99,
  "postalCodes": [{"code": "06910"}],
  "geoData": {
    "centreLat": 43.8475,
    "centreLon": 6.9166
  }
}
```

### AI Request
```json
{
  "question": "Quelle est la capitale de la France?",
  "history": [
    {"role": "user", "content": "Bonjour"},
    {"role": "assistant", "content": "Bonjour!"}
  ]
}
```

### Settings
```json
{
  "id": 1,
  "aiTimeout": 30000
}
```

## 🛠️ Fichiers modifiés

```
apps/backend/
├── swagger/
│   ├── swagger.config.ts     ✅ Créé - Configuration Swagger
│   ├── README.md             ✅ Créé - Documentation complète
│   └── QUICK_REFERENCE.md    ✅ Créé - Guide rapide
├── routes/
│   ├── dump.routes.ts        ✅ Modifié - Annotations ajoutées
│   ├── users.routes.ts       ✅ Modifié - Annotations ajoutées
│   ├── ai.routes.ts          ✅ Modifié - Annotations ajoutées
│   ├── trois-d.routes.ts     ✅ Modifié - Annotations ajoutées
│   └── settings.routes.ts    ✅ Modifié - Annotations ajoutées
├── server.ts                 ✅ Modifié - Swagger UI intégré
└── package.json              ✅ Modifié - Dépendances ajoutées
```

## 📚 Documentation Complète

Pour plus de détails, consultez : `apps/backend/swagger/README.md`

---

**Astuce** : Utilisez l'interface Swagger UI pour tester facilement tous les endpoints sans avoir à écrire de commandes curl !

