# 🚀 IA Locale - Guide de Démarrage Rapide

## ✅ Ce qui a été implémenté

L'intégration d'Ollama pour une IA locale complète est maintenant prête ! Voici ce qui fonctionne :

### 📦 Fichiers créés/modifiés

1. **Backend API** (`app/api/ai-local/route.ts`)
    - Endpoint POST `/api/ai-local` pour générer des réponses
    - Endpoint GET `/api/ai-local` pour vérifier l'état d'Ollama
    - Gestion complète des erreurs (timeout, connexion, etc.)
    - Support des variables d'environnement

2. **Prompt Engineering** (`lib/ai-prompts.ts`)
    - System prompt spécialisé pour le territoire PACA/Alpes-Maritimes
    - Contexte territorial : Nice, Cannes, tourisme, tech
    - Gestion de l'historique de conversation (10 derniers messages)
    - Formatage pour l'API Ollama

3. **Service Client** (`services/ai.services.ts`)
    - `aiAnswerLocal()` : appelle l'IA locale avec historique
    - `aiLocalHealth()` : vérifie la santé d'Ollama
    - Gestion des erreurs côté client

4. **Interface Chat** (`components/chat-interface.tsx`)
    - Utilise maintenant `aiAnswerLocal()` au lieu de l'API externe
    - Passe automatiquement l'historique des conversations
    - Affiche le modèle utilisé et la confiance

5. **Documentation**
    - `docs/OLLAMA_SETUP.md` : guide d'installation complet
    - `.env.example` : variables d'environnement

## 🎯 Démarrage en 3 étapes

### 1️⃣ Installer Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Ou via Homebrew (macOS)
brew install ollama

# Windows : télécharger depuis https://ollama.com
```

### 2️⃣ Télécharger un modèle (recommandé : Mistral 7B)

```bash
# Démarrer le serveur Ollama
ollama serve

# Dans un autre terminal, télécharger Mistral (meilleur pour le français)
ollama pull mistral

# Alternatives :
# ollama pull llama3.2    # Plus léger (3B paramètres)
# ollama pull gemma2      # Très rapide (2B paramètres)
```

### 3️⃣ Lancer l'application

```bash
# Créer le fichier .env.local (optionnel, utilise les valeurs par défaut)
cp .env.example .env.local

# Lancer Next.js
pnpm dev
```

## 🧪 Tester

### Test 1 : Vérifier qu'Ollama fonctionne

```bash
# Terminal 1 : serveur Ollama
ollama serve

# Terminal 2 : test direct
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Quelle est la population de Nice ?",
  "stream": false
}'
```

### Test 2 : Health check de l'API

```bash
# Lancer votre app Next.js
pnpm dev

# Dans un autre terminal
curl http://localhost:3000/api/ai-local
```

Réponse attendue :

```json
{
  "status": "healthy",
  "ollama_url": "http://localhost:11434",
  "model": "mistral",
  "available_models": ["mistral", "llama3.2", ...],
  "message": "AI locale opérationnelle"
}
```

### Test 3 : Interface utilisateur

1. Ouvrir http://localhost:3000/chat
2. Poser une question : "Quelle est la population de Nice ?"
3. L'IA locale devrait répondre avec le contexte PACA

## 🔧 Configuration avancée

### Variables d'environnement (`.env.local`)

```bash
# URL du serveur Ollama (par défaut : http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Modèle à utiliser (par défaut : mistral)
OLLAMA_MODEL=mistral

# Timeout en millisecondes (par défaut : 30000)
OLLAMA_TIMEOUT=60000
```

### Changer de modèle

```bash
# Télécharger un autre modèle
ollama pull llama3.2

# Modifier .env.local
OLLAMA_MODEL=llama3.2

# Redémarrer Next.js
pnpm dev
```

## 📊 Comparaison des modèles

| Modèle      | Taille | Vitesse     | Qualité FR | RAM recommandée |
| ----------- | ------ | ----------- | ---------- | --------------- |
| **mistral** | 7B     | Moyenne     | ⭐⭐⭐⭐⭐ | 8 GB            |
| llama3.2    | 3B     | Rapide      | ⭐⭐⭐⭐   | 4 GB            |
| gemma2      | 2B     | Très rapide | ⭐⭐⭐     | 2 GB            |

## 🐛 Résolution de problèmes

### Erreur : "Ollama n'est pas démarré"

```bash
# Vérifier si Ollama tourne
ps aux | grep ollama

# Si non, démarrer
ollama serve
```

### Erreur : "Timeout"

Le modèle est peut-être trop lent. Options :

1. Augmenter le timeout : `OLLAMA_TIMEOUT=60000`
2. Utiliser un modèle plus rapide : `OLLAMA_MODEL=gemma2`
3. Fermer d'autres applications pour libérer la RAM

### Erreur : "Model not found"

```bash
# Lister les modèles disponibles
ollama list

# Télécharger le modèle manquant
ollama pull mistral
```

### Réponses de mauvaise qualité

1. **Ajuster le prompt** : Modifier `lib/ai-prompts.ts`
2. **Changer de modèle** : Mistral est recommandé pour le français
3. **Ajouter plus de contexte** : L'historique est déjà géré (10 messages)

## 🎨 Fonctionnalités

### ✅ Déjà implémenté

- [x] API backend avec Ollama
- [x] Prompt engineering pour PACA
- [x] Service client
- [x] Intégration dans ChatInterface
- [x] Historique de conversation (10 messages)
- [x] Gestion d'erreurs complète
- [x] Health check endpoint
- [x] Variables d'environnement

### 🚧 À venir (optionnel)

- [ ] Streaming des réponses token par token
- [ ] Fallback automatique vers API externe si Ollama down
- [ ] Cache des réponses pour rapidité
- [ ] Monitoring des performances
- [ ] Fine-tuning du SYSTEM_PROMPT

## 📚 Ressources

- [Documentation Ollama](https://ollama.com/docs)
- [Guide d'installation complet](./OLLAMA_SETUP.md)
- [Liste des modèles disponibles](https://ollama.com/library)

## 💡 Conseils

1. **Performance** : Fermez les applications lourdes pendant l'utilisation
2. **Qualité** : Utilisez Mistral pour les meilleures réponses en français
3. **Vitesse** : Gemma2 si vous avez peu de RAM ou besoin de rapidité
4. **Privacy** : Toutes les données restent locales, rien n'est envoyé sur internet

## 🎉 C'est prêt !

L'IA locale est maintenant intégrée et fonctionnelle. Testez avec des questions sur le territoire PACA :

- "Quelle est la population de Nice ?"
- "Donne-moi les statistiques touristiques des Alpes-Maritimes"
- "Quels sont les principaux secteurs économiques du 06 ?"

L'IA utilisera le contexte territorial spécialisé pour répondre avec précision ! 🚀
