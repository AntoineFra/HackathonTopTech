# Dépannage Ollama - Problèmes de Timeout

## 🔴 Erreur "Timeout: La requête a pris trop de temps"

### Causes possibles :

1. **Ollama n'est pas démarré**
2. **Le modèle n'est pas téléchargé**
3. **Le modèle est trop lent**
4. **Ressources système insuffisantes**

---

## ✅ Solutions

### 1. Vérifier qu'Ollama est démarré

```bash
# Vérifier si Ollama est en cours d'exécution
curl http://localhost:11434/api/tags

# Si erreur, démarrer Ollama
ollama serve
```

### 2. Télécharger un modèle plus rapide

Le modèle par défaut `llama2:7b-chat-q4_K_S` peut être lent. Essayez un modèle plus léger :

```bash
# Modèles recommandés par ordre de rapidité
ollama pull phi3:mini          # Le plus rapide (3.8GB)
ollama pull gemma:2b           # Très rapide (1.7GB)
ollama pull mistral:7b-instruct # Bon compromis (4.1GB)
```

Puis modifiez `apps/backend/.env` :
```env
OLLAMA_MODEL=phi3:mini
# ou
OLLAMA_MODEL=gemma:2b
```

### 3. Augmenter le timeout

#### Option A : Modifier settings.json
Éditez `apps/backend/settings.json` :
```json
{
    "aiTimeout": 180000
}
```
(180000 ms = 3 minutes)

#### Option B : Modifier .env
Éditez `apps/backend/.env` :
```env
OLLAMA_TIMEOUT=180000
```

### 4. Vérifier les ressources système

```bash
# Vérifier l'utilisation CPU/RAM
top

# Pour macOS, vérifier l'activité du processus Ollama
ps aux | grep ollama
```

**Recommandations minimales :**
- RAM : 8 GB minimum (16 GB recommandé)
- CPU : Processeur moderne (M1/M2 pour Mac, ou CPU récent)
- Espace disque : 10 GB libre pour les modèles

### 5. Optimiser les performances Ollama

#### Réduire le context window
Modifiez `apps/backend/services/ollama.services.ts` pour limiter le contexte :

```typescript
// Dans la fonction callOllamaGenerate
const request: OllamaGenerateRequest = {
    model: OLLAMA_MODEL,
    prompt: systemPrompt + conversationContext + userMessage,
    stream: false,
    options: {
        temperature: 0.7,
        num_ctx: 2048,  // Réduire de 4096 à 2048
        top_p: 0.9,
        top_k: 40,
    },
};
```

#### Utiliser le streaming (optionnel)
Pour une réponse progressive, activez le streaming dans Ollama.

---

## 🧪 Tests

### Test rapide d'Ollama
```bash
# Test direct avec curl
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "Bonjour, quelle est la capitale de la France ?",
  "stream": false
}'
```

### Temps de réponse attendus
| Modèle | Taille | Temps moyen | RAM nécessaire |
|--------|--------|-------------|----------------|
| gemma:2b | 1.7GB | 2-5s | 4GB |
| phi3:mini | 3.8GB | 3-8s | 6GB |
| mistral:7b-instruct | 4.1GB | 5-15s | 8GB |
| llama2:7b-chat | 4.5GB | 10-30s | 8GB |

---

## 📝 Configuration actuelle

Vérifiez votre configuration :

1. **Modèle** : `apps/backend/.env` → `OLLAMA_MODEL`
2. **Timeout** : `apps/backend/settings.json` → `aiTimeout`
3. **URL Ollama** : `apps/backend/.env` → `OLLAMA_BASE_URL`

---

## 🚀 Configuration recommandée pour le développement

```env
# apps/backend/.env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini
OLLAMA_TIMEOUT=120000
```

```json
// apps/backend/settings.json
{
    "aiTimeout": 120000
}
```

---

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs d'Ollama : `ollama serve` (mode verbose)
2. Vérifiez les logs du backend dans la console
3. Testez avec un modèle plus léger (gemma:2b)
