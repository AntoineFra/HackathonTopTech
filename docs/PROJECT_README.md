# Portail des Données du Territoire 06

Portail interactif alimenté par l'IA pour interroger les indicateurs socio-démographiques du territoire Nice Côte d'Azur (Alpes-Maritimes).

## Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir l'application.

## Fonctionnalités

- 🤖 Requêtes en langage naturel en français
- 📊 Visualisations de données interactives
- 🎯 Suggestions intelligentes d'indicateurs
- 🔍 Exploration des données par catégorie
- ⚠️ Limitations des données transparentes
- 📱 Design responsive

## Structure du projet

```
├── app/                  # Répertoire Next.js app
├── components/           # Composants React
│   ├── ui/              # Composants UI de base (shadcn)
│   ├── query-interface.tsx
│   ├── ai-response-display.tsx
│   ├── indicator-card.tsx
│   └── category-grid.tsx
├── lib/                  # Utilitaires et services
│   ├── ai-service.ts    # Intégration IA (À IMPLÉMENTER)
│   ├── sample-data.ts   # Données d'exemple pour les tests
│   └── utils.ts
└── types/                # Définitions TypeScript
```

## Intégration IA requise

Ceci est un projet de base avec tous les composants UI prêts. Vous devez :

1. **Connecter le service IA** : Éditez `lib/ai-service.ts` pour intégrer OpenAI, Claude, ou votre backend IA
2. **Connecter la source de données** : Implémentez la récupération des données depuis votre base de données
3. **Ajouter des routes API** : Créez des routes API Next.js pour le traitement côté serveur

Voir `AI_INTEGRATION.md` pour des instructions détaillées.

## État actuel

✅ UI complète avec tous les composants  
✅ Configuration TypeScript type-safe  
✅ Données d'exemple pour les tests  
✅ Fonctionnalité de démo basique  
⏳ Intégration du service IA (À FAIRE)  
⏳ Connexion à la source de données réelles (À FAIRE)  

## Technologies

- Next.js 14+ (React, TypeScript)
- shadcn/ui + Tailwind CSS
- Icônes Lucide React

## Pour le Hackathon

L'application est prête pour la démo avec des données d'exemple. Concentrez-vous sur l'implémentation de l'intégration IA dans `lib/ai-service.ts` pour la rendre pleinement fonctionnelle.

---

Construit pour le Hackathon CCI Nice Côte d'Azur 2025
