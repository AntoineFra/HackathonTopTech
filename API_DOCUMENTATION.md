# Documentation API Backend - Hackathon TopTech

## 🎉 Documentation Swagger Complète Installée !

La documentation interactive Swagger est maintenant disponible pour l'ensemble de l'API backend.

## 🚀 Accès Rapide

**Une fois le serveur démarré**, accédez à :

- **Interface Swagger UI** : http://localhost:3000/api-docs
- **Spécification OpenAPI JSON** : http://localhost:3000/api-docs.json

## 📖 Documentation Disponible

### 1. Guide Rapide
📄 `apps/backend/swagger/QUICK_REFERENCE.md`
- Accès rapide aux endpoints
- Exemples de commandes curl
- Structure des données principales

### 2. Documentation Complète
📚 `apps/backend/swagger/README.md`
- Configuration détaillée
- Guide d'utilisation
- Résolution de problèmes
- Ajout de nouveaux endpoints

## 📋 API Complète Documentée

### ✅ Dump - Import de données
- Liste des dumps disponibles
- Exécution des imports (unités légales, villes)

### ✅ Users - Gestion des utilisateurs
- Liste des utilisateurs
- Création d'utilisateur

### ✅ AI - Intelligence Artificielle
- Questions/réponses avec Ollama
- Vérification de l'état du service

### ✅ 3D - Données Géographiques
- Liste complète des villes avec géolocalisation
- Recherche de ville par nom

### ✅ Settings - Configuration
- Récupération des paramètres
- Modification des paramètres

## 🎯 Fonctionnalités

- ✅ **Interface Interactive** : Testez les API directement depuis le navigateur
- ✅ **Documentation Complète** : Tous les endpoints, paramètres, et réponses
- ✅ **Modèles de Données** : Schémas détaillés de toutes les entités
- ✅ **Codes d'Erreur** : Documentation des erreurs possibles
- ✅ **Exemples** : Exemples de requêtes et réponses
- ✅ **Export OpenAPI** : Spécification JSON disponible

## 🔧 Technologies Utilisées

- **swagger-jsdoc** : Génération de la spec OpenAPI depuis les annotations
- **swagger-ui-express** : Interface interactive Swagger UI
- **OpenAPI 3.0** : Standard de documentation d'API

## 📦 Packages Installés

```json
{
  "dependencies": {
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.8"
  }
}
```

## 🛠️ Fichiers Créés/Modifiés

### Créés ✨
```
apps/backend/swagger/
├── swagger.config.ts          # Configuration Swagger et schémas
├── README.md                  # Documentation complète
└── QUICK_REFERENCE.md         # Guide rapide
```

### Modifiés 🔄
```
apps/backend/
├── server.ts                  # Intégration Swagger UI
├── routes/
│   ├── dump.routes.ts         # Annotations Swagger
│   ├── users.routes.ts        # Annotations Swagger
│   ├── ai.routes.ts           # Annotations Swagger
│   ├── trois-d.routes.ts      # Annotations Swagger
│   └── settings.routes.ts     # Annotations Swagger
└── package.json               # Dépendances Swagger
```

## 🚦 Démarrage

```bash
# Démarrer le serveur backend
cd apps/backend
pnpm run dev

# Le serveur affiche :
# Server running on http://localhost:3000
# 📚 API Documentation available at http://localhost:3000/api-docs
# 📄 OpenAPI Spec (JSON) available at http://localhost:3000/api-docs.json
```

## 💡 Utilisation

### Via l'Interface Swagger
1. Ouvrez http://localhost:3000/api-docs
2. Parcourez les endpoints organisés par tags
3. Cliquez sur "Try it out" pour tester un endpoint
4. Remplissez les paramètres
5. Cliquez sur "Execute"
6. Visualisez la réponse

### Via curl/code
Utilisez les exemples fournis dans la documentation ou copiez les commandes depuis Swagger UI.

## 📚 Ressources

- **Documentation Swagger UI** : http://localhost:3000/api-docs
- **Guide Rapide** : `apps/backend/swagger/QUICK_REFERENCE.md`
- **Documentation Complète** : `apps/backend/swagger/README.md`

## ✅ Checklist

- [x] Installation des packages Swagger
- [x] Configuration Swagger créée avec tous les schémas
- [x] Annotations ajoutées à tous les endpoints
- [x] Interface Swagger UI intégrée au serveur
- [x] Documentation README complète créée
- [x] Guide de référence rapide créé
- [x] Tests de compilation réussis

## 🎊 Résultat

**Documentation API complète et interactive disponible** pour :
- ✅ 5 groupes d'endpoints (Dump, Users, AI, 3D, Settings)
- ✅ 10 endpoints au total
- ✅ 9 modèles de données documentés
- ✅ Interface de test interactive
- ✅ Export OpenAPI standard

---

**🎯 La documentation Swagger est maintenant complète et prête à l'emploi !**

Accédez à http://localhost:3000/api-docs une fois le serveur démarré.

