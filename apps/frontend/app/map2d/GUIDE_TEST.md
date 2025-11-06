# Guide de Test - Intégration IA Map2D

## 🧪 Tests à effectuer

### Prérequis
1. Le backend doit être démarré : `cd apps/backend && pnpm dev`
2. Le frontend doit être démarré : `cd apps/frontend && pnpm dev`
3. Pour Ollama : Le service doit être actif `ollama serve`
4. Pour Gemini : La clé API doit être configurée dans `.env`

## ✅ Liste des tests

### Test 1 : Changement de provider
**Action :** Cliquer sur le bouton "Changer" dans l'interface de chat

**Résultat attendu :**
- Le badge change entre "🤖 Ollama" et "✨ Gemini"
- La couleur du badge change (violet ↔ bleu)

### Test 2 : Question simple avec Gemini
**Provider :** Gemini ✨

**Question :** "Quelles sont les villes les plus peuplées ?"

**Résultat attendu :**
- L'IA répond avec une liste de villes (Nice, Antibes, Cannes, etc.)
- Les villes mentionnées s'illuminent en cyan sur la carte
- Le message de confirmation apparaît

### Test 3 : Question simple avec Ollama
**Provider :** Ollama 🤖

**Question :** "Quelle ville a le plus d'entreprises ?"

**Résultat attendu :**
- L'IA répond (peut prendre 3-10s)
- La ville est mise en surbrillance
- Réponse cohérente avec les données

### Test 4 : Focus sur une ville
**Question :** "Focus sur Nice"

**Résultat attendu :**
- La carte zoome sur Nice
- Nice est mise en surbrillance
- Les statistiques de Nice s'affichent :
  - Population
  - Entreprises
  - Tourisme
  - Emploi
  - Revenu moyen
  - Secteur dominant
  - Surface

### Test 5 : Question avec plusieurs villes
**Question :** "Compare Nice et Cannes"

**Résultat attendu :**
- L'IA compare les deux villes
- Nice et Cannes sont toutes deux en surbrillance
- Données chiffrées pour les deux villes

### Test 6 : Statistiques générales
**Question :** "Statistiques du département"

**Résultat attendu :**
- L'IA donne des statistiques globales du 06
- Possiblement plusieurs villes en surbrillance
- Données agrégées

### Test 7 : Suggestions prédéfinies
**Action :** Cliquer sur l'une des suggestions

**Résultat attendu :**
- La suggestion remplit le champ de texte
- On peut l'envoyer directement

### Test 8 : Gestion d'erreur - Backend down
**Prérequis :** Arrêter le backend

**Question :** N'importe quelle question

**Résultat attendu :**
- Message d'erreur affiché
- Pas de crash de l'application
- Message : "❌ Erreur lors du traitement..."

### Test 9 : Ville inconnue
**Question :** "Focus sur Paris"

**Résultat attendu :**
- L'IA indique que Paris n'est pas dans le département
- Aucune action sur la carte

### Test 10 : Question complexe
**Question :** "Montre-moi les 5 meilleures destinations touristiques"

**Résultat attendu :**
- L'IA liste 5 villes touristiques
- Les 5 villes sont en surbrillance
- Scores touristiques affichés

## 🐛 Débogage

### Vérifier les logs dans la console du navigateur

```
Map 2D AI Query: [question]
🏙️ Villes détectées dans la réponse: [array]
🎯 Action IA: {type, cities, ...}
```

### Vérifier les logs du backend

```
[AI Service] Using provider: gemini
[Gemini Service] Response received
```

### Problèmes courants

**Problème :** Aucune ville n'est mise en surbrillance
**Solution :** Vérifier que l'IA mentionne bien les noms des villes dans sa réponse

**Problème :** Timeout avec Ollama
**Solution :** Augmenter la valeur de `OLLAMA_TIMEOUT` dans les settings

**Problème :** Erreur 401 avec Gemini
**Solution :** Vérifier la clé API `GEMINI_API_KEY`

**Problème :** Les villes ne sont pas reconnues
**Solution :** Vérifier que les noms dans `cityData` correspondent aux noms retournés par l'IA

## 📊 Critères de réussite

- ✅ Toutes les questions de test reçoivent une réponse
- ✅ Les villes sont correctement mises en surbrillance
- ✅ Le changement de provider fonctionne
- ✅ Les erreurs sont gérées gracieusement
- ✅ L'interface reste responsive pendant les requêtes
- ✅ Les données affichées sont cohérentes

## 🎯 Performance attendue

| Provider | Temps de réponse | Qualité |
|----------|------------------|---------|
| Gemini   | 1-3s             | ⭐⭐⭐⭐⭐ |
| Ollama   | 3-10s            | ⭐⭐⭐⭐   |

## 🚀 Prochaines étapes après validation

1. Tester avec des utilisateurs réels
2. Collecter les questions les plus fréquentes
3. Optimiser le prompt pour améliorer la précision
4. Ajouter un cache pour les questions courantes
5. Améliorer l'extraction des villes (accents, variantes)
