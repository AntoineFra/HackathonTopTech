# Intégration de l'IA dans la Map2D

## 📋 Résumé des modifications

Ce document décrit l'intégration du système d'IA (Ollama/Gemini) dans la carte 2D interactive des Alpes-Maritimes.

## ✨ Changements effectués

### 1. Remplacement du système de Q&R local par l'IA réelle

**Fichier modifié :** `map2d-ai-service.ts`

#### Avant :
- Système de questions-réponses codé en dur avec des `if/else`
- Analyse syntaxique manuelle des questions
- Réponses prédéfinies basées sur des mots-clés

#### Après :
- Appel au service AI backend (Ollama ou Gemini)
- Enrichissement du prompt avec contexte de la carte
- Extraction intelligente des villes mentionnées dans les réponses
- Génération automatique des actions de carte (highlight, focus)

### 2. Nouvelles fonctionnalités

#### `extractCityNames(text: string)`
Extrait automatiquement les noms de villes mentionnés dans la réponse de l'IA en utilisant des regex.

#### `detectFocusRequest(question: string)`
Détecte si l'utilisateur demande un focus sur une ville spécifique (mots-clés : focus, zoom, montre-moi, etc.)

#### `queryMap2DAI(question: string, provider: "ollama" | "gemini")`
- Paramètre `provider` ajouté pour choisir entre Ollama et Gemini
- Gestion des demandes de focus en local (plus rapide)
- Enrichissement du prompt avec le contexte des villes disponibles
- Extraction automatique des villes et création des actions de carte
- Gestion d'erreurs améliorée

### 3. Interface utilisateur améliorée

**Fichier modifié :** `page.tsx`

#### Ajouts :
- Import du contexte `useAIProvider` pour gérer le choix du provider
- Badge affichant le provider actif (🤖 Ollama ou ✨ Gemini)
- Bouton "Changer" pour basculer entre Ollama et Gemini
- Passage du provider au service `queryMap2DAI`

#### Design :
- Badge coloré selon le provider (violet pour Ollama, bleu pour Gemini)
- Bouton de changement avec effet hover
- Intégration harmonieuse dans l'interface existante

## 🎯 Fonctionnement

### Flux de traitement d'une question

1. **Utilisateur pose une question** (ex: "Quelles sont les villes les plus peuplées ?")

2. **Détection de focus** :
   - Si la question contient des mots-clés de focus (zoom, montre-moi, etc.)
   - → Réponse locale rapide avec infos de la ville

3. **Appel à l'IA** :
   - Enrichissement du prompt avec contexte
   - Appel au backend (Ollama ou Gemini selon le choix)
   - Réception de la réponse

4. **Extraction des villes** :
   - Analyse de la réponse pour trouver les noms de villes
   - Création d'une liste de villes à mettre en surbrillance

5. **Génération des actions** :
   - Création d'une action `highlight` avec les villes trouvées
   - Ajout d'une note informative si nécessaire

6. **Application sur la carte** :
   - Les villes mentionnées s'illuminent en cyan
   - La réponse s'affiche dans l'interface de chat

## 🔧 Configuration

### Variables d'environnement requises

Backend :
```env
# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Gemini
GEMINI_API_KEY=your_api_key_here

# Provider par défaut
DEFAULT_AI_PROVIDER=gemini
```

### Dépendances

- Service AI backend : `/apps/backend/services/ai.services.ts`
- Service Ollama : `/apps/backend/services/ollama.services.ts`
- Service Gemini : `/apps/backend/services/gemini.services.ts`
- Context Provider : `/apps/frontend/contexts/AIProviderContext.tsx`

## 📝 Exemples de questions supportées

### Questions générales
- "Quelles sont les villes les plus peuplées ?"
- "Montre-moi les meilleures destinations touristiques"
- "Quelle ville a le plus d'entreprises ?"

### Focus sur une ville
- "Focus sur Nice"
- "Montre-moi Cannes"
- "Infos sur Antibes"

### Comparaisons
- "Compare Nice et Cannes"
- "Compare les revenus moyens des villes"

### Statistiques
- "Statistiques du département"
- "Données économiques du 06"

## 🚀 Avantages de l'intégration

1. **Flexibilité** : L'IA peut répondre à des questions variées et complexes
2. **Données à jour** : Accès direct à la base de données Prisma
3. **Personnalisation** : Choix entre Ollama (local, privé) et Gemini (cloud, performant)
4. **Intelligence** : Compréhension du langage naturel sans règles codées en dur
5. **Évolutivité** : Facile d'ajouter de nouveaux types de questions

## 🐛 Gestion des erreurs

- Timeout des requêtes IA
- Erreurs de connexion au backend
- Villes non trouvées
- Réponses de l'IA sans villes mentionnées

Toutes les erreurs sont capturées et affichent un message convivial à l'utilisateur.

## 📊 Performance

- **Focus local** : ~0ms (instantané)
- **Requête Gemini** : ~1-3s
- **Requête Ollama** : ~3-10s (selon le modèle)

## 🔮 Améliorations futures possibles

1. Mémorisation de l'historique des conversations
2. Suggestions contextuelles basées sur la question précédente
3. Visualisations de données (graphiques) générées par l'IA
4. Support de questions multi-villes complexes
5. Cache des réponses fréquentes pour améliorer la performance
