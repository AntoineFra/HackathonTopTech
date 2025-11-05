# 🔧 Scripts utilitaires

Ce dossier contient des scripts pour faciliter le développement et le déploiement.

## Scripts disponibles

### `start-ollama.sh`

Script de démarrage automatique pour Ollama (IA locale).

**Fonctionnalités :**
- ✅ Vérifie si Ollama est installé
- 🚀 Démarre Ollama si nécessaire
- 📥 Télécharge le modèle Mistral si absent
- 🧪 Teste la connexion à Ollama
- 💡 Affiche les informations de configuration

**Usage :**

```bash
# Démarrage avec le modèle par défaut (mistral)
./scripts/start-ollama.sh

# Avec un modèle spécifique
OLLAMA_MODEL=llama3.2 ./scripts/start-ollama.sh
```

**Prérequis :**
- macOS ou Linux (bash)
- curl installé

**Installation d'Ollama :**
```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Ou via Homebrew (macOS)
brew install ollama
```

## Ajout de nouveaux scripts

Pour ajouter un nouveau script :

1. Créer le fichier dans `scripts/`
2. Ajouter le shebang : `#!/bin/bash`
3. Rendre exécutable : `chmod +x scripts/your-script.sh`
4. Documenter dans ce README

## Variables d'environnement

Les scripts utilisent les variables d'environnement définies dans `.env.local` :

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
OLLAMA_TIMEOUT=30000
```

## Support Windows

Pour Windows, utilisez :
- **Git Bash** (installé avec Git pour Windows)
- **WSL** (Windows Subsystem for Linux)
- **PowerShell** (scripts `.ps1` à créer)

## Ressources

- [Documentation Ollama](https://ollama.com/docs)
- [Guide d'installation](../docs/OLLAMA_SETUP.md)
- [Démarrage rapide](../docs/LOCAL_AI_QUICKSTART.md)
