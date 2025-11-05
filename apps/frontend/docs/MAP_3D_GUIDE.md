# Carte 3D Interactive - Département 06

## 🗺️ Vue d'ensemble

La carte 3D interactive est une visualisation immersive du département des Alpes-Maritimes (06) qui permet d'explorer les données socio-démographiques et économiques en 3D avec une intégration IA pour des requêtes en langage naturel.

## ✨ Fonctionnalités

### 1. Visualisation 3D

- **Bâtiments en 3D** : Extrudés depuis des empreintes au sol avec hauteurs réalistes
- **Département 06** : Frontières du département affichées en arrière-plan
- **Communes principales** : Nice, Cannes, Antibes, Menton, Grasse, et plus
- **Navigation fluide** : Orbite, zoom, panoramique avec contrôles de souris

### 2. Modes de couleurs

- **Entreprises** (Rouge) : Densité d'entreprises par bâtiment/commune
- **Population** (Bleu) : Concentration de population
- **Tourisme** (Vert) : Score d'attractivité touristique
- **Emploi** (Orange) : Taux d'emploi par commune
- **Revenu** (Violet) : Revenu moyen par commune
- **Secteurs** (Multicouleur) : Coloration par secteur économique
    - Technologie (Bleu)
    - Tourisme (Vert)
    - Commerce (Orange)
    - Santé (Rose)
    - Finance (Violet)
    - Immobilier (Marron)
    - Industrie (Gris bleu)
    - Services (Cyan)

### 3. Interactivité

- **Survol** : Effet de surbrillance et changement de curseur
- **Clic sur bâtiment** : Affiche les détails (nom, commune, secteur, nombre d'entreprises)
- **Sélection de commune** : Zoom et focus sur une ville spécifique
- **Panneau d'information** : Détails dynamiques sur le bâtiment sélectionné

### 4. Intégration IA

- **Requêtes en langage naturel** : Posez des questions sur les données
- **Actions automatiques** : La carte se met à jour selon la question
- **Réponses contextuelles** : L'IA explique ce qui est affiché

## 📂 Structure des fichiers

```
components/map3d/
  ├── building.tsx              # Composant de rendu de bâtiment 3D
  ├── building-info-panel.tsx   # Panneau d'informations sur bâtiment sélectionné
  ├── department-boundary.tsx   # Frontière du département 06
  ├── map-3d-scene.tsx          # Scène Three.js principale
  ├── map-3d-viewer.tsx         # Conteneur principal de la carte
  ├── map-context.tsx           # Context React pour état de la carte
  ├── map-controls.tsx          # UI de contrôle (modes, communes)
  └── map-legend.tsx            # Légende des couleurs

lib/
  ├── geo-data/
  │   └── department-06.ts      # Données géographiques et communes
  ├── map-ai-service.ts         # Service IA pour requêtes carte
  ├── map-colors.ts             # Schémas de couleurs et mappings
  └── map-utils.ts              # Utilitaires (projections, interpolation)

types/
  └── map.ts                    # Types TypeScript pour données carte

app/
  ├── map/page.tsx              # Page carte seule
  └── map-chat/page.tsx         # Page carte + chat intégré
```

## 🚀 Utilisation

### Navigation de base

**Contrôles souris :**

- **Clic gauche + glisser** : Rotation de la caméra autour de la carte
- **Molette** : Zoom avant/arrière
- **Clic droit + glisser** : Déplacement panoramique
- **Clic sur bâtiment** : Sélectionner et afficher les détails

### Exemples de requêtes IA

**Données économiques :**

- "Montre-moi les entreprises du département 06"
- "Affiche les secteurs d'activité"
- "Quel est le taux d'emploi ?"

**Démographie :**

- "Quelle est la population ?"
- "Affiche les zones les plus peuplées"

**Tourisme :**

- "Montre les zones touristiques"
- "Quel est le score touristique ?"

**Villes spécifiques :**

- "Focus sur Nice"
- "Zoom sur Cannes"
- "Montre-moi Antibes"

**Comparaisons :**

- "Compare les revenus moyens par commune"
- "Quelles sont les villes les plus peuplées ?"

## 🛠️ Technologies utilisées

- **React Three Fiber** : Rendu Three.js dans React
- **@react-three/drei** : Helpers (OrbitControls, Sky, etc.)
- **Three.js** : Moteur 3D WebGL
- **@turf/turf** : Calculs géospatiaux (prévu pour extensions)
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling des composants UI

## 📊 Données

### Communes incluses (8 principales)

1. **Nice** - 340 000 habitants, 15 420 entreprises
2. **Cannes** - 74 000 habitants, 8 920 entreprises
3. **Antibes** - 75 000 habitants, 7 650 entreprises
4. **Menton** - 29 000 habitants, 2 340 entreprises
5. **Cagnes-sur-Mer** - 51 000 habitants, 4 120 entreprises
6. **Grasse** - 51 000 habitants, 3 890 entreprises
7. **Vence** - 19 000 habitants, 1 560 entreprises
8. **Saint-Laurent-du-Var** - 30 000 habitants, 3 240 entreprises

### Données de bâtiments

- Génération procédurale de bâtiments par commune
- Nombre proportionnel à la population
- Attributs : type, hauteur, secteur, nombre d'entreprises
- Types : résidentiel, commercial, industriel, bureau, mixte

## 🔮 Extensions futures

### Fonctionnalités prévues

1. **Données réelles** : Intégration avec API IGN Géoportail ou OpenStreetMap
2. **Visualisations avancées** :
    - Graphiques 3D (barres, colonnes)
    - Heat maps avec dégradés
    - Mode choroplèthe par région
3. **Optimisation performance** :
    - LOD (Level of Detail)
    - Instancing pour bâtiments similaires
    - Frustum culling
4. **Animations** :
    - Transitions fluides entre modes
    - Croissance animée des bâtiments
    - Trajectoires de caméra animées
5. **Mobile** :
    - Gestes tactiles (pinch-to-zoom)
    - Mode 2D simplifié
    - Performance optimisée
6. **Accessibilité** :
    - Navigation clavier
    - Descriptions vocales
    - Mode contraste élevé

### Intégrations possibles

- **API Data.gouv.fr** : Données officielles françaises
- **INSEE API** : Statistiques démographiques en temps réel
- **Sirene API** : Données d'entreprises réelles
- **OpenStreetMap Overpass** : Bâtiments et infrastructures réels

## 🎨 Personnalisation

### Ajouter un nouveau schéma de couleurs

```typescript
// lib/map-colors.ts
export const COLOR_SCHEMES: Record<ColorScheme, ColorMapping> = {
    // ... existing schemes
    myNewScheme: {
        scheme: "myNewScheme",
        label: "Mon nouveau schéma",
        description: "Description du schéma",
        colorScale: {
            min: "#ffffff",
            mid: "#ff0000", // optionnel
            max: "#000000",
        },
        dataField: "myDataField",
    },
};
```

### Ajouter une nouvelle commune

```typescript
// lib/geo-data/department-06.ts
export const COMMUNES_06: CommuneData[] = [
  // ... existing communes
  {
    id: "comm-06XXX",
    name: "Ma Commune",
    population: 10000,
    area: 15.5,
    enterpriseCount: 500,
    tourismScore: 70,
    employmentRate: 85.0,
    averageIncome: 23000,
    coordinates: { lat: 43.XXX, lon: 7.XXX },
    bounds: [[lon1, lat1], [lon2, lat2], [lon3, lat3], [lon4, lat4]],
  },
];
```

### Ajouter une requête IA

```typescript
// lib/map-ai-service.ts
export async function queryMapAI(question: string): Promise<MapQueryResponse> {
    // ...
    if (lowerQuestion.includes("mon nouveau mot-clé")) {
        mapActions.push({
            type: "color",
            colorScheme: "myNewScheme",
            animate: true,
        });

        textResponse = "Ma réponse personnalisée...";
    }
    // ...
}
```

## 📝 Notes de développement

### Performance

- Environ 400-600 bâtiments générés au total
- Rendu fluide à 60 FPS sur hardware moderne
- Utilise ExtrudeGeometry pour conversion 2D → 3D
- Pas d'instancing actuellement (prévu pour optimisation)

### Projection

- Projection Mercator simple pour visualisation
- Échelle : 1 degré = 10 000 unités Three.js
- Centré sur Nice (43.7034°N, 7.2663°E)
- Pas de projection Lambert 93 (simplification)

### Limites actuelles

- Données mockées (pas de vraies sources de données)
- Pas de mise en cache
- Pas de lazy loading pour bâtiments
- Navigation IA basique (pattern matching)
- Pas de support multi-langue complet

## 🤝 Contribution

Pour contribuer à cette fonctionnalité :

1. Ajoutez des tests pour les nouveaux composants
2. Documentez les nouvelles fonctionnalités
3. Optimisez les performances si possible
4. Assurez l'accessibilité des nouveaux éléments UI

## 📄 Licence

Fait partie du projet HackathonTopTech - CCI Nice Côte d'Azur
