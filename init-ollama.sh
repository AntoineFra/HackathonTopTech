#!/bin/bash

# Démarrer Ollama en arrière-plan
ollama serve &

# Attendre qu'Ollama soit prêt
echo "⏳ Waiting for Ollama to start..."
sleep 5

# Vérifier si Ollama est accessible
until curl -s http://localhost:11434/api/version > /dev/null 2>&1; do
    echo "   Waiting for Ollama..."
    sleep 2
done

echo "✅ Ollama is ready!"

# Récupérer le modèle depuis la variable d'environnement
MODEL=${OLLAMA_MODEL:-"llama2:7b-chat-q4_K_S"}

# Vérifier si le modèle existe déjà
if ollama list | grep -q "$MODEL"; then
    echo "✅ Model $MODEL already exists, skipping download"
else
    echo "📥 Pulling model: $MODEL..."
    ollama pull "$MODEL"
    echo "✅ Model ready!"
fi

echo "🔗 Ollama available on port 11434"

# Garder le container actif
wait
