# Guide d'Installation IA Locale pour 06 Analytics

## Option recommandée : Ollama

### 1. Installation d'Ollama

**macOS / Linux :**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows :**
Téléchargez depuis https://ollama.com/download

### 2. Démarrer Ollama

```bash
ollama serve
```

Le serveur démarre sur `http://localhost:11434`

### 3. Télécharger un modèle

**Pour le français (recommandé) :**

```bash
# Mistral (7B - bon équilibre performance/qualité)
ollama pull mistral

# Ou Llama 3.2 (3B - plus rapide)
ollama pull llama3.2

# Ou Gemma 2 (2B - très rapide)
ollama pull gemma2:2b
```

### 4. Tester le modèle

```bash
ollama run mistral "Bonjour, comment vas-tu ?"
```

### 5. Vérifier que l'API fonctionne

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Quelle est la population de Nice ?",
  "stream": false
}'
```

## Configuration de l'application

Créez un fichier `.env.local` à la racine du projet :

```env
# IA Locale
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Optionnel : timeout en millisecondes
OLLAMA_TIMEOUT=30000
```

## Modèles recommandés par cas d'usage

| Modèle        | Taille | RAM  | Vitesse | Qualité  | Usage                 |
| ------------- | ------ | ---- | ------- | -------- | --------------------- |
| `gemma2:2b`   | 2B     | 4GB  | ⚡⚡⚡  | ⭐⭐     | Développement rapide  |
| `llama3.2:3b` | 3B     | 6GB  | ⚡⚡    | ⭐⭐⭐   | Production (petit)    |
| `mistral`     | 7B     | 8GB  | ⚡      | ⭐⭐⭐⭐ | Production (qualité)  |
| `llama3.1:8b` | 8B     | 10GB | ⚡      | ⭐⭐⭐⭐ | Production (meilleur) |

## Commandes utiles

```bash
# Lister les modèles installés
ollama list

# Supprimer un modèle
ollama rm mistral

# Voir les informations d'un modèle
ollama show mistral

# Arrêter Ollama
killall ollama
```

## Dépannage

### Ollama ne démarre pas

```bash
# Vérifier si le port 11434 est utilisé
lsof -i :11434

# Redémarrer Ollama
killall ollama && ollama serve
```

### Modèle trop lent

- Utilisez un modèle plus petit (gemma2:2b)
- Réduisez le contexte dans les prompts
- Ajoutez plus de RAM

### Erreur de mémoire

- Fermez les applications inutiles
- Utilisez un modèle plus petit
- Ajustez les paramètres num_ctx et num_thread

## Prochaines étapes

Une fois Ollama installé et fonctionnel :

1. L'API `/api/ai-local` sera créée automatiquement
2. Le chat utilisera automatiquement l'IA locale
3. Les réponses seront générées localement sans API externe
