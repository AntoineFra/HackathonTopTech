# Guide Map Three.js - Carte 3D de Nice

## 🎯 Vue d'ensemble

Cette implémentation fournit une carte 3D interactive de Nice utilisant **Three.js** et **React Three Fiber**. Elle affiche le relief terrain et les bâtiments extrudés en 3D.

## 📦 Stack Technique

- **Next.js** (TypeScript)
- **Three.js** - Moteur 3D WebGL
- **@react-three/fiber** - Wrapper React pour Three.js
- **@react-three/drei** - Helpers et composants utilitaires
- **Overpass API** - Données de bâtiments OSM

## 🚀 Démarrage Rapide

### 1. Installation

Les dépendances sont déjà installées. Si nécessaire :

```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

### 2. Lancer l'application

```bash
pnpm dev
```

Naviguez vers : `http://localhost:3000/map-threejs`

Ou cliquez sur le bouton **"Map Three.js"** dans la navbar.

## 🏗️ Architecture

### Structure des fichiers

```
app/
  map-threejs/
    page.tsx                          # Route Next.js

components/
  map3d-threejs/
    Map3D.tsx                         # Composant principal de la scène 3D

lib/
  threejs-loaders/
    terrainLoader.ts                  # Gestion du terrain et relief
    buildingsLoader.ts                # Chargement et extrusion des bâtiments

docs/
  MAP_THREEJS_GUIDE.md               # Ce fichier
```

### Composants principaux

#### 1. **Map3D.tsx**

Composant React principal qui :

- Initialise le Canvas Three.js
- Configure la caméra et les contrôles
- Charge la scène (terrain + bâtiments)
- Gère l'UI overlay (instructions, légende)

#### 2. **terrainLoader.ts**

Fonctions pour :

- Générer un terrain procedural avec relief
- Convertir lat/lon en coordonnées cartésiennes
- _TODO_ : Charger de vraies données d'élévation (DEM/DSM)

#### 3. **buildingsLoader.ts**

Fonctions pour :

- Charger les bâtiments depuis Overpass API (OSM)
- Parser les données GeoJSON/OSM
- Créer des extrusions 3D avec hauteurs
- Générer des bâtiments de démonstration

## 🎮 Contrôles Utilisateur

- **Clic gauche + glisser** : Rotation de la caméra
- **Molette de la souris** : Zoom avant/arrière
- **Clic droit + glisser** : Déplacement (pan)

## 🎨 Paramètres de Scène

### Terrain

```typescript
const terrain = createTerrain(
    10000, // Taille (10km × 10km)
    100, // Segments (résolution)
);
```

### Bâtiments

```typescript
// Zone de Nice
const buildings = await loadBuildingsFromOSM(
    43.68, // minLat
    7.23, // minLon
    43.74, // maxLat
    7.29, // maxLon
);
```

### Caméra

```typescript
<PerspectiveCamera
  position={[3000, 2000, 3000]}  // Position initiale
  fov={60}                        // Field of view
  near={1}                        // Plan proche
  far={50000}                     // Plan lointain
/>
```

## 📊 Sources de Données

### Bâtiments (actuel)

- **Overpass API** (OpenStreetMap)
- Endpoint : `https://overpass-api.de/api/interpreter`
- Requête : Bâtiments dans la bbox de Nice
- Hauteur : Tags OSM `height` ou `building:levels`

### Terrain (actuel)

- Génération **procedurale** (prototype)
- Utilise des fonctions sinusoïdales pour simuler le relief

### Améliorations futures

#### Terrain réel

1. **Mapbox Terrain-RGB**
    - Tiles raster avec données d'élévation encodées
    - URL : `https://api.mapbox.com/v4/mapbox.terrain-rgb/...`
    - Nécessite une clé API

2. **IGN MNT (Modèle Numérique de Terrain)**
    - Données d'élévation françaises officielles
    - Service WMS/WMTS disponible

3. **Librairie recommandée**
    - `three-geo` : Charge des tiles terrain depuis Mapbox
    - Installation : `pnpm add three-geo`

#### Bâtiments 3D

1. **3D Tiles (Cesium)**
    - Format optimisé pour grandes quantités de données
    - Loader : `three-loader-3dtiles`

2. **BD TOPO (IGN)**
    - Données vectorielles précises
    - Hauteurs et attributs détaillés

## 🔧 Configuration

### Variables d'environnement (.env.local)

Pour utiliser de vraies données terrain, créez `.env.local` :

```env
# Mapbox (pour terrain-RGB)
NEXT_PUBLIC_MAPBOX_TOKEN=votre_token_mapbox

# IGN (optionnel)
NEXT_PUBLIC_IGN_API_KEY=votre_cle_ign
```

## 🎯 Fonctionnalités Implémentées

- ✅ Scène Three.js dans Next.js
- ✅ Terrain avec relief procedural
- ✅ Bâtiments extrudés depuis OSM
- ✅ Contrôles orbitaux (rotation, zoom, pan)
- ✅ Lumières (ambient + directional)
- ✅ Ombres portées
- ✅ Ciel avec Sky shader
- ✅ Fog atmosphérique
- ✅ UI overlay avec instructions
- ✅ Légende visuelle
- ✅ Chargement asynchrone des données

## 🚧 TODO / Améliorations

### Court terme

- [ ] Ajouter un loader/spinner pendant le chargement
- [ ] Optimiser le nombre de bâtiments affichés (LOD)
- [ ] Ajouter des textures au terrain
- [ ] Colorier les bâtiments selon leur hauteur

### Moyen terme

- [ ] Intégrer de vraies données d'élévation (Mapbox Terrain-RGB)
- [ ] Ajouter des détails de bâtiments (toits, fenêtres)
- [ ] Système de clic sur bâtiment → Info panel
- [ ] Filtres (par type de bâtiment, hauteur, etc.)

### Long terme

- [ ] Intégration avec le chat IA (requêtes sur la carte 3D)
- [ ] Données d'entreprises affichées sur les bâtiments
- [ ] Heatmap 3D (densité, activité économique)
- [ ] Export de vues (screenshots, vidéo)
- [ ] Mode VR/AR

## 🐛 Dépannage

### Le terrain ne s'affiche pas

- Vérifiez la console pour les erreurs
- Assurez-vous que Three.js est bien installé
- Testez avec `pnpm list three`

### Les bâtiments ne se chargent pas

- L'API Overpass peut être lente ou limitée
- Réduisez la bbox de recherche
- Vérifiez votre connexion internet
- Attendez quelques secondes après le chargement

### Performance lente

- Réduisez le nombre de segments du terrain
- Limitez le nombre de bâtiments (déjà limité à 500)
- Utilisez un GPU plus puissant
- Désactivez les ombres pour gagner en FPS

### Erreur "Module not found: three"

```bash
pnpm add three @react-three/fiber @react-three/drei
```

## 📚 Ressources

### Documentation

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [React Three Drei](https://github.com/pmndrs/drei)
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)

### Tutoriels

- [Three.js Journey](https://threejs-journey.com/)
- [React Three Fiber Tutorial](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)

### Outils

- [Overpass Turbo](https://overpass-turbo.eu/) - Tester les requêtes OSM
- [Three.js Editor](https://threejs.org/editor/) - Visualiser des scènes

## 🎨 Personnalisation

### Modifier les couleurs

**Terrain** (dans `terrainLoader.ts`) :

```typescript
const material = new THREE.MeshStandardMaterial({
    color: 0x7cb342, // Vert terrain
});
```

**Bâtiments** (dans `buildingsLoader.ts`) :

```typescript
const material = new THREE.MeshStandardMaterial({
    color: 0x9e9e9e, // Gris bâtiments
});
```

### Changer la position de la caméra

Dans `Map3D.tsx` :

```typescript
<PerspectiveCamera
  position={[x, y, z]} // Modifiez ces valeurs
  target={[0, 0, 0]}   // Point vers lequel la caméra regarde
/>
```

### Ajuster la zone géographique

Dans `buildingsLoader.ts` :

```typescript
const buildings = await loadBuildingsFromOSM(
    minLat, // Latitude minimale
    minLon, // Longitude minimale
    maxLat, // Latitude maximale
    maxLon, // Longitude maximale
);
```

## 🤝 Contribution

Pour étendre cette implémentation :

1. **Ajouter une nouvelle source de données** : Créez un nouveau loader dans `lib/threejs-loaders/`
2. **Nouveaux contrôles** : Modifiez `Map3D.tsx` et ajoutez des boutons dans l'UI overlay
3. **Intégration IA** : Connectez avec `lib/map-ai-service.ts` existant

## 📝 Notes Techniques

### Performance

- Limite actuelle : 500 bâtiments pour éviter le lag
- Segments terrain : 100×100 (10 000 vertices)
- Shadows : Activées (impact performance)

### Compatibilité

- Nécessite WebGL 2.0
- Fonctionne sur navigateurs modernes (Chrome, Firefox, Edge, Safari)
- Mobile : Fonctionnel mais performances réduites

### Architecture modulaire

Le code est séparé pour faciliter l'extension :

- `terrainLoader.ts` → Peut être remplacé par un loader Mapbox
- `buildingsLoader.ts` → Peut intégrer BD TOPO ou 3D Tiles
- `Map3D.tsx` → Composant React réutilisable

## ✨ Exemple d'utilisation avancée

### Ajouter un marqueur 3D

```typescript
// Dans Map3D.tsx, dans le useEffect de Scene()
const geometry = new THREE.SphereGeometry(50, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const marker = new THREE.Mesh(geometry, material);
marker.position.set(x, height, z);
scene.add(marker);
```

### Récupérer l'info d'un bâtiment au clic

```typescript
// Utiliser Raycaster dans Map3D.tsx
const raycaster = new THREE.Raycaster();
const onClick = (event: MouseEvent) => {
    // Convertir position souris en coordonnées normalized
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const building = intersects[0].object.userData.buildingData;
        console.log(building);
    }
};
```

---

**Bon développement ! 🚀**

Pour toute question, consultez la documentation Three.js ou React Three Fiber.
