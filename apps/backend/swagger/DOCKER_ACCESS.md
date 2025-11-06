# 🐳 Accès à Swagger dans Docker

## ✅ C'EST OPÉRATIONNEL !

La documentation Swagger est maintenant accessible dans ton environnement Docker.

## 🌐 URLs d'accès

### Interface Swagger UI
```
http://localhost:3000/api-docs
```

### Spécification OpenAPI JSON
```
http://localhost:3000/api-docs.json
```

## 🚀 Commandes Docker

### Démarrer les conteneurs
```bash
docker-compose up -d
```

### Reconstruire après modification des dépendances
```bash
docker-compose down
docker-compose up --build -d
```

### Voir les logs du backend
```bash
docker-compose logs -f backend
```

### Redémarrer juste le backend
```bash
docker-compose restart backend
```

## 📝 Note importante

Quand tu modifies les dépendances du `package.json` (comme l'ajout de Swagger), tu dois **reconstruire l'image Docker** :

```bash
docker-compose down
docker-compose up --build -d
```

## ✅ Vérification

Tu devrais voir ces lignes dans les logs :
```
Server running on http://localhost:3000
📚 API Documentation available at http://localhost:3000/api-docs
📄 OpenAPI Spec (JSON) available at http://localhost:3000/api-docs.json
```

## 🎯 Accès rapide

Une fois les conteneurs démarrés, ouvre simplement :
```
http://localhost:3000/api-docs
```

Et voilà ! Tu as accès à toute la documentation interactive de ton API ! 🎊

---

**Status** : ✅ Opérationnel  
**Date** : 6 novembre 2025

