#!/bin/bash

# 🚀 Script de démarrage rapide pour l'IA locale
# Ce script vérifie et démarre Ollama avec le modèle approprié

set -e

#!/bin/bash
# Script de démarrage de l'IA locale avec Ollama
# Utilisé pour le développement local

set -e

echo "=================================="
echo "🤖 Démarrage de l'IA locale pour 06 Analytics"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Ollama est installé
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}❌ Ollama n'est pas installé${NC}"
    echo ""
    echo "📥 Installation :"
    echo "   macOS/Linux : curl -fsSL https://ollama.com/install.sh | sh"
    echo "   Homebrew    : brew install ollama"
    echo "   Windows     : https://ollama.com"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Ollama est installé${NC}"

# Vérifier si Ollama est déjà en cours d'exécution
if pgrep -x "ollama" > /dev/null; then
    echo -e "${GREEN}✅ Ollama est déjà en cours d'exécution${NC}"
else
    echo -e "${YELLOW}🔄 Démarrage d'Ollama...${NC}"
    ollama serve > /dev/null 2>&1 &
    sleep 2
    echo -e "${GREEN}✅ Ollama démarré${NC}"
fi

# Vérifier le modèle par défaut (mistral)
MODEL=${OLLAMA_MODEL:-mistral}

echo ""
echo "🔍 Vérification du modèle : $MODEL"

if ollama list | grep -q "$MODEL"; then
    echo -e "${GREEN}✅ Le modèle $MODEL est disponible${NC}"
else
    echo -e "${YELLOW}📥 Téléchargement du modèle $MODEL...${NC}"
    echo "   (Cela peut prendre quelques minutes)"
    echo ""
    ollama pull $MODEL
    echo -e "${GREEN}✅ Modèle $MODEL téléchargé${NC}"
fi

echo ""
echo "🧪 Test du modèle..."
TEST_RESPONSE=$(curl -s http://localhost:11434/api/tags)

if [ ! -z "$TEST_RESPONSE" ]; then
    echo -e "${GREEN}✅ Ollama fonctionne correctement${NC}"
else
    echo -e "${RED}❌ Erreur : Ollama ne répond pas${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✨ Tout est prêt !${NC}"
echo ""
echo "📊 Informations :"
echo "   URL Ollama : http://localhost:11434"
echo "   Modèle     : $MODEL"
echo "   Health     : http://localhost:3000/api/ai-local"
echo ""
echo "🚀 Lancez maintenant votre application Next.js :"
echo "   pnpm dev"
echo ""
echo "💡 Pour tester directement :"
echo "   curl http://localhost:11434/api/generate -d '{\"model\":\"$MODEL\",\"prompt\":\"Bonjour\",\"stream\":false}'"
echo ""
