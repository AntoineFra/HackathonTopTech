/**
 * Color Gradient Utility - Gère les gradients de couleurs pour la visualisation de données
 */

import * as THREE from "three";

export interface PopulationDataPoint {
    codeGeo: string;
    pop2022?: number;
}

/**
 * Calcule une couleur basée sur un gradient progressif
 * Bleu (faible) → Vert → Jaune → Orange → Rouge → Violet (fort)
 * Utilise une échelle logarithmique pour mieux visualiser les différences
 */
export function getColorFromGradient(
    value: number,
    minValue: number,
    maxValue: number,
): number {
    // Utiliser une échelle logarithmique pour mieux répartir les couleurs
    // Cela permet de mieux voir les différences entre petites et moyennes communes
    const logMin = Math.log10(Math.max(1, minValue));
    const logMax = Math.log10(Math.max(1, maxValue));
    const logValue = Math.log10(Math.max(1, value));

    // Normaliser la valeur entre 0 et 1 avec l'échelle log
    const normalized = Math.max(
        0,
        Math.min(1, (logValue - logMin) / (logMax - logMin)),
    );

    // Définir les couleurs du gradient (6 étapes)
    const colors = [
        { r: 33, g: 150, b: 243 }, // Bleu (#2196F3) - très faible
        { r: 76, g: 175, b: 80 }, // Vert (#4CAF50) - faible
        { r: 255, g: 235, b: 59 }, // Jaune (#FFEB3B) - moyen
        { r: 255, g: 152, b: 0 }, // Orange (#FF9800) - élevé
        { r: 244, g: 67, b: 54 }, // Rouge (#F44336) - très élevé
        { r: 156, g: 39, b: 176 }, // Violet (#9C27B0) - extrême
    ];

    // Calculer l'index du segment (0-4, car 5 segments entre 6 couleurs)
    const segmentIndex = Math.min(
        Math.floor(normalized * (colors.length - 1)),
        colors.length - 2,
    );
    const segmentProgress = normalized * (colors.length - 1) - segmentIndex;

    // Interpoler entre deux couleurs consécutives
    const colorA = colors[segmentIndex];
    const colorB = colors[segmentIndex + 1];

    const r = Math.round(colorA.r + (colorB.r - colorA.r) * segmentProgress);
    const g = Math.round(colorA.g + (colorB.g - colorA.g) * segmentProgress);
    const b = Math.round(colorA.b + (colorB.b - colorA.b) * segmentProgress);

    // Convertir RGB en hexadécimal
    return (r << 16) | (g << 8) | b;
}

/**
 * Applique un gradient de couleurs aux villes en fonction de leur population
 */
export function applyPopulationGradient(
    scene: THREE.Scene,
    populationData: PopulationDataPoint[],
) {
    if (populationData.length === 0) {
        console.log("⚠️ Aucune donnée de population à appliquer");
        return;
    }

    // Créer un map pour accès rapide par codeINSEE
    const populationMap = new Map<string, number>();
    let minPop = Infinity;
    let maxPop = -Infinity;

    populationData.forEach((data) => {
        if (data.pop2022 !== undefined && data.pop2022 !== null) {
            populationMap.set(data.codeGeo, data.pop2022);
            minPop = Math.min(minPop, data.pop2022);
            maxPop = Math.max(maxPop, data.pop2022);
        }
    });

    console.log(`📊 Données reçues: ${populationData.length} enregistrements`);
    console.log(`📊 Premier enregistrement:`, populationData[0]);
    console.log(`📊 Gradient de population: ${minPop} - ${maxPop}`);
    console.log(`📊 ${populationMap.size} villes avec données de population`);

    // Parcourir tous les objets de la scène
    let appliedCount = 0;
    let citiesFound = 0;
    scene.traverse((object) => {
        if (object.userData.type === "city") {
            citiesFound++;
            const codeINSEE = object.userData.codeINSEE;
            const population = populationMap.get(codeINSEE);

            if (citiesFound <= 3) {
                console.log(
                    `🏙️ Ville ${citiesFound}: codeINSEE=${codeINSEE}, population=${population}`,
                );
            }

            if (population !== undefined) {
                const color = getColorFromGradient(population, minPop, maxPop);

                // Appliquer la couleur aux meshes de remplissage
                object.children.forEach((child) => {
                    if (
                        child.userData.type === "fill" &&
                        child instanceof THREE.Mesh
                    ) {
                        (
                            child.material as THREE.MeshBasicMaterial
                        ).color.setHex(color);
                    }
                });

                // Stocker la couleur du gradient dans userData pour référence
                object.userData.gradientColor = color;
                appliedCount++;
            }
        }
    });

    console.log(
        `✅ Gradient appliqué à ${appliedCount} villes (sur ${citiesFound} villes trouvées dans la scène)`,
    );
}

/**
 * Restaure les couleurs originales des villes
 */
export function resetCityColors(scene: THREE.Scene) {
    scene.traverse((object) => {
        if (object.userData.type === "city") {
            const originalColor = object.userData.originalFillColor || 0x4caf50;

            object.children.forEach((child) => {
                if (
                    child.userData.type === "fill" &&
                    child instanceof THREE.Mesh
                ) {
                    (child.material as THREE.MeshBasicMaterial).color.setHex(
                        originalColor,
                    );
                }
            });

            // Supprimer la couleur du gradient
            delete object.userData.gradientColor;
        }
    });

    console.log("🔄 Couleurs originales restaurées");
}
