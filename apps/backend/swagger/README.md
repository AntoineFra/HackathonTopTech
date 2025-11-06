# Documentation API Swagger - Hackathon TopTech Backend

## 📚 Vue d'ensemble

Cette documentation Swagger fournit une interface interactive complète pour explorer et tester toutes les API du backend du projet Hackathon TopTech.

## 🚀 Accès à la documentation

Une fois le serveur backend démarré, la documentation est accessible à :

- **Interface Swagger UI** : http://localhost:3000/api-docs
- **Spécification OpenAPI JSON** : http://localhost:3000/api-docs.json

## 📋 Endpoints documentés

### 1. **Dump** (`/api/dump`)
Gestion des imports de données massives

- `GET /api/dump` - Liste tous les dumps disponibles avec leur statut
- `GET /api/dump/{dumpType}` - Lance un dump de données (legal_unit ou cities)

**Types de dumps disponibles :**
- `legal_unit` : Import des unités légales (INSEE)
- `cities` : Import des villes avec données géographiques

### 2. **Users** (`/api/users`)
Gestion des utilisateurs

- `GET /api/users` - Liste tous les utilisateurs
- `POST /api/users` - Crée un nouvel utilisateur

### 3. **AI** (`/api/ai`)
Intelligence artificielle avec Ollama

- `POST /api/ai/answer` - Pose une question à l'IA
- `GET /api/ai/health` - Vérifie l'état de santé du service IA

### 4. **3D** (`/api/trois-d`)
Données géographiques pour visualisation 3D

- `GET /api/trois-d/cities` - Récupère toutes les villes avec données géo
- `GET /api/trois-d/cities/{name}` - Récupère une ville spécifique

### 5. **Settings** (`/api/settings`)
Configuration de l'application

- `GET /api/settings` - Récupère les paramètres actuels
- `PUT /api/settings` - Met à jour les paramètres

## 🔧 Configuration

### Installation des dépendances

Les packages Swagger sont déjà installés :

```bash
pnpm add swagger-jsdoc swagger-ui-express
pnpm add -D @types/swagger-jsdoc @types/swagger-ui-express
```

### Structure des fichiers

```
apps/backend/
├── swagger/
│   ├── swagger.config.ts    # Configuration Swagger et schémas
│   └── README.md            # Ce fichier
├── routes/
│   ├── *.routes.ts          # Routes avec annotations Swagger
├── server.ts                # Intégration Swagger UI
```

## 📝 Modèles de données

### User
```typescript
{
  id: number
  email: string
  name: string | null
}
```

### City
```typescript
{
  codeINSEE: string
  name: string
  codeDepartement: string
  siren: string
  codeEpci: string
  codeRegion: string
  population: number
  surface?: number
  zone?: string
  postalCodes: PostalCode[]
  geoData?: CityGeoData
}
```

### CityGeoData
```typescript
{
  id: number
  cityCodeINSEE: string
  centreLat?: number
  centreLon?: number
  mairieLat?: number
  mairieLon?: number
  contour?: string  // GeoJSON stringifié
  bbox?: string     // GeoJSON stringifié
}
```

### Dump
```typescript
{
  id: number
  type: 'legal_unit' | 'cities'
  status: 'PAS_A_JOUR' | 'A_JOUR' | 'EN_COURS'
  lastUpdate?: Date
  label?: string
}
```

### Settings
```typescript
{
  id: number
  aiTimeout: number  // en millisecondes
}
```

## 🧪 Tester l'API

### Via Swagger UI

1. Démarrez le backend : `pnpm run dev`
2. Ouvrez http://localhost:3000/api-docs
3. Cliquez sur un endpoint pour le développer
4. Cliquez sur "Try it out"
5. Remplissez les paramètres requis
6. Cliquez sur "Execute"
7. Visualisez la réponse

### Via curl

Exemple : Lister les utilisateurs
```bash
curl -X GET "http://localhost:3000/api/users" -H "accept: application/json"
```

Exemple : Créer un utilisateur
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

Exemple : Poser une question à l'IA
```bash
curl -X POST "http://localhost:3000/api/ai/answer" \
  -H "Content-Type: application/json" \
  -d '{"question":"Quelle est la population de Nice?"}'
```

Exemple : Récupérer une ville
```bash
curl -X GET "http://localhost:3000/api/trois-d/cities/Nice" \
  -H "accept: application/json"
```

## 📖 Ajouter de nouveaux endpoints

Pour documenter un nouvel endpoint, ajoutez une annotation JSDoc dans le fichier de routes :

```typescript
/**
 * @swagger
 * /api/votre-route:
 *   get:
 *     summary: Description courte
 *     description: Description détaillée
 *     tags: [VotreTag]
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 */
router.get("/votre-route", handler);
```

## 🎨 Personnalisation

La configuration Swagger se trouve dans `swagger/swagger.config.ts`. Vous pouvez :

- Modifier les informations de l'API (titre, description, version)
- Ajouter/modifier des schémas de données
- Ajouter des serveurs supplémentaires
- Personnaliser les tags

## 🔍 Résolution de problèmes

### La documentation ne s'affiche pas

Vérifiez que :
1. Le serveur backend est démarré
2. Vous accédez à la bonne URL : http://localhost:3000/api-docs
3. Le port 3000 n'est pas utilisé par une autre application

### Les nouveaux endpoints n'apparaissent pas

1. Vérifiez que les annotations JSDoc sont correctes
2. Redémarrez le serveur backend
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Erreurs de schéma

Assurez-vous que :
- Les références aux schémas utilisent `$ref: '#/components/schemas/NomDuSchema'`
- Les schémas sont définis dans `swagger.config.ts`
- La syntaxe YAML dans les JSDoc est correcte

## 📚 Ressources

- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.0)

## ✅ Checklist de déploiement

- [x] Installation des packages Swagger
- [x] Configuration Swagger créée
- [x] Tous les endpoints documentés
- [x] Tous les schémas définis
- [x] Tests des endpoints via Swagger UI
- [x] Documentation README créée

## 🎯 Fonctionnalités

- ✅ Documentation interactive complète
- ✅ Tous les endpoints API documentés
- ✅ Modèles de données détaillés
- ✅ Interface de test intégrée
- ✅ Export JSON OpenAPI disponible
- ✅ Tags pour organiser les endpoints
- ✅ Exemples de requêtes/réponses
- ✅ Codes d'erreur documentés

---

**Note** : Cette documentation est générée automatiquement à partir des annotations dans le code source. Elle est toujours à jour avec l'implémentation actuelle de l'API.

