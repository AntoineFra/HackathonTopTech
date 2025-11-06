"use client";

import { useEffect, useRef, useState } from "react";
import { cityPolygons, cityData } from "./data/cityPolygons";
import type { CityDataType } from "./data/cityPolygons";
import { loadGoogleMaps } from "@/lib/map-utils";
import {
    queryMap2DAI,
    getMap2DSuggestions,
    type Map2DAction,
} from "./map2d-ai-service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, Sparkles, ChevronDown, ChevronUp, Settings, Building2, Users, MapPin, Briefcase, Euro, Factory, Hash, Map as MapIcon } from "lucide-react";
import { useAIProvider } from "@/contexts/AIProviderContext";

interface HoveredCity extends CityDataType {
    name: string;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDYqP19MDyDR5PXp50uUbxHva-e_k2aMj0";

export default function Map2DPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [hoveredCity, setHoveredCity] = useState<HoveredCity | null>(null);
    const [highlightedCities, setHighlightedCities] = useState<string[]>([]);
    const polygonsRef = useRef<Map<string, google.maps.Polygon[]>>(new Map());
    const highlightedCitiesRef = useRef<string[]>([]); // Ref pour éviter closure stale

    // IA Chat states
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string>("");
    const [showChat, setShowChat] = useState(true);
    const { provider, setProvider } = useAIProvider();

    const suggestions = getMap2DSuggestions();

    // --- Initialisation Google Maps ---
    useEffect(() => {
        loadGoogleMaps(GOOGLE_MAPS_API_KEY)
            .then((maps) => {
                if (!mapRef.current) return;

                const newMap = new maps.Map(mapRef.current, {
                    center: { lat: 43.7, lng: 7.2 }, // Centré sur les Alpes-Maritimes (06)
                    zoom: 9,
                    styles: [
                        {
                            elementType: "geometry",
                            stylers: [{ color: "#1d1d1d" }],
                        },
                        {
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#e0e0e0" }],
                        },
                        {
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#1d1d1d" }],
                        },
                        {
                            featureType: "water",
                            stylers: [{ color: "#0f2027" }],
                        },
                    ],
                });
                setMap(newMap);
            })
            .catch((error) => {
                console.error(
                    "Erreur lors du chargement de Google Maps:",
                    error,
                );
            });
    }, []);

    // --- Création des polygones de villes ---
    useEffect(() => {
        if (!map || typeof window === "undefined" || !window.google) return;
        const maps = window.google.maps;

        console.log(
            `🗺️ Chargement de ${Object.keys(cityPolygons).length} villes`,
        );
        console.log(
            `📊 Villes disponibles:`,
            Object.keys(cityPolygons).slice(0, 10).join(", "),
            "...",
        );

        let totalPolygons = 0;
        const polygonsMap = new Map<string, google.maps.Polygon[]>();

        Object.entries(cityPolygons).forEach(([city, polygonsArray]) => {
            if (!Array.isArray(polygonsArray) || polygonsArray.length === 0) {
                console.warn(`⚠️ Ville ${city} sans polygones valides`);
                return;
            }

            const cityPolygonsList: google.maps.Polygon[] = [];

            // Créer un polygone Google Maps pour CHAQUE polygone de la ville
            polygonsArray.forEach((polygonCoords, index) => {
                if (!Array.isArray(polygonCoords) || polygonCoords.length < 3) {
                    console.warn(
                        `⚠️ ${city} - polygone ${index} invalide (< 3 points)`,
                    );
                    return;
                }

                const polygon = new maps.Polygon({
                    paths: polygonCoords,
                    strokeColor: "#888",
                    strokeOpacity: 0.5,
                    strokeWeight: 1,
                    fillColor: "#888",
                    fillOpacity: 0.2,
                    map,
                });

                totalPolygons++;
                cityPolygonsList.push(polygon);

                // Effet survol
                polygon.addListener("mouseover", () => {
                    // Vérifier la couleur actuelle du polygone pour savoir si highlighted
                    const currentFillColor = polygon.get("fillColor");
                    if (
                        currentFillColor !== "#00bcd4" &&
                        currentFillColor !== "#00ffff"
                    ) {
                        polygon.setOptions({
                            fillColor: "#00bcd4",
                            fillOpacity: 0.5,
                        });
                    }
                    const data = cityData[city];
                    if (data) {
                        setHoveredCity({ name: city, ...data });
                    }
                });

                polygon.addListener("mouseout", () => {
                    // Vérifier si c'est une ville highlighted (couleur cyan)
                    const currentFillColor = polygon.get("fillColor");
                    if (currentFillColor === "#00bcd4") {
                        // Si c'était juste un survol temporaire, remettre en gris
                        const isHighlighted =
                            highlightedCitiesRef.current.includes(city);
                        if (!isHighlighted) {
                            polygon.setOptions({
                                fillColor: "#888",
                                fillOpacity: 0.2,
                            });
                        } else {
                            // Remettre la couleur highlight forte
                            polygon.setOptions({
                                fillColor: "#00bcd4",
                                fillOpacity: 0.7,
                            });
                        }
                    }
                    setHoveredCity(null);
                });
            });

            // Stocker les polygones de cette ville
            if (cityPolygonsList.length > 0) {
                polygonsMap.set(city, cityPolygonsList);
            }
        });

        polygonsRef.current = polygonsMap;
        console.log(`✅ ${totalPolygons} polygones créés au total`);
    }, [map]); // ⚠️ Ne pas mettre highlightedCities ici sinon les polygones sont recréés !

    // Gérer les actions IA
    const applyMapAction = (action: Map2DAction) => {
        console.log("🎯 Action IA:", action);

        // TOUJOURS réinitialiser les anciennes villes highlighted d'abord
        console.log("🔄 Réinitialisation de toutes les villes...");
        polygonsRef.current.forEach((polygons, cityName) => {
            polygons.forEach((polygon) => {
                polygon.setOptions({
                    fillColor: "#888",
                    fillOpacity: 0.2,
                    strokeColor: "#888",
                    strokeWeight: 1,
                });
            });
        });

        if (action.type === "highlight" && action.cities) {
            console.log("✨ Highlight des villes:", action.cities);
            setHighlightedCities(action.cities);
            highlightedCitiesRef.current = action.cities; // Sync la ref

            // Mettre en surbrillance UNIQUEMENT les nouvelles villes
            action.cities.forEach((cityName) => {
                const polygons = polygonsRef.current.get(cityName);
                if (polygons) {
                    console.log(
                        `  → ${cityName}: ${polygons.length} polygone(s)`,
                    );
                    polygons.forEach((polygon) => {
                        polygon.setOptions({
                            fillColor: "#00bcd4",
                            fillOpacity: 0.7,
                            strokeColor: "#00ffff",
                            strokeWeight: 2,
                        });
                    });
                } else {
                    console.warn(`  ⚠️ ${cityName}: pas de polygones trouvés`);
                }
            });
        } else if (action.type === "reset") {
            console.log("🔄 Reset complet");
            setHighlightedCities([]);
            highlightedCitiesRef.current = []; // Sync la ref
            // Les polygones sont déjà réinitialisés au début
        } else if (action.type === "focus" && action.focusCity && map) {
            console.log("🎯 Focus sur:", action.focusCity);
            const data = cityData[action.focusCity];
            if (data && data.centreLat && data.centreLon) {
                map.panTo({ lat: data.centreLat, lng: data.centreLon });
                map.setZoom(12);

                // Highlight la ville
                setHighlightedCities([action.focusCity]);
                highlightedCitiesRef.current = [action.focusCity]; // Sync la ref
                const polygons = polygonsRef.current.get(action.focusCity);
                if (polygons) {
                    polygons.forEach((polygon) => {
                        polygon.setOptions({
                            fillColor: "#00bcd4",
                            fillOpacity: 0.7,
                            strokeColor: "#00ffff",
                            strokeWeight: 2,
                        });
                    });
                }
            }
        }
    };

    // Gérer la soumission du chat IA
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        setLoading(true);
        setResponse("");

        try {
            // Utiliser le provider sélectionné (ollama ou gemini)
            const aiProvider = provider === "local" ? "gemini" : provider;
            const result = await queryMap2DAI(query, aiProvider as "ollama" | "gemini");

            // Appliquer les actions à la map
            for (const action of result.mapActions) {
                applyMapAction(action);
            }

            // Afficher la réponse
            setResponse(result.textResponse);
        } catch (error) {
            console.error("Erreur IA:", error);
            setResponse(
                "Une erreur s'est produite lors du traitement de votre question. Veuillez réessayer.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
    };

    return (
        <div style={{ height: "100vh", width: "100%", position: "relative" }}>
            {/* Carte */}
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

            {/* Carte d'infos ville à droite */}
            {hoveredCity && (
                <Card className="absolute top-1/2 right-8 -translate-y-1/2 w-80 z-10 border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl text-primary flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            {hoveredCity.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Entreprises:</span>
                            <span className="font-medium ml-auto">{hoveredCity.entreprises}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Population:</span>
                            <span className="font-medium ml-auto">{hoveredCity.population.toLocaleString()} hab.</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Surface:</span>
                            <span className="font-medium ml-auto">
                                {hoveredCity.surface ? hoveredCity.surface.toFixed(2) + " ha" : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Tourisme:</span>
                            <span className="font-medium ml-auto">{hoveredCity.tourisme}/100</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Emploi:</span>
                            <span className="font-medium ml-auto">{hoveredCity.emploi}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Euro className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Revenu moyen:</span>
                            <span className="font-medium ml-auto">{hoveredCity.revenu} €</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Factory className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Secteur:</span>
                            <span className="font-medium ml-auto">{hoveredCity.secteur}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Code INSEE:</span>
                            <span className="font-medium ml-auto">{hoveredCity.code || "N/A"}</span>
                        </div>
                        <div className="pt-2 border-t border-border">
                            <Badge variant="secondary" className="text-xs">
                                {hoveredCity.zone === "metro" ? "🏙️ Zone Métropolitaine" : `📍 ${hoveredCity.zone}`}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Interface Chat IA en bas */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(30, 30, 30, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderTop: "1px solid #444",
                    padding: "1rem",
                    zIndex: 20,
                    maxHeight: showChat ? "400px" : "60px",
                    transition: "max-height 0.3s ease",
                    overflow: "hidden",
                }}
            >
                {/* Bouton toggle */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: showChat ? "0.75rem" : 0,
                        cursor: "pointer",
                    }}
                    onClick={() => setShowChat(!showChat)}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <Sparkles
                            style={{
                                color: "#00bcd4",
                                width: "20px",
                                height: "20px",
                            }}
                        />
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "1rem",
                                color: "#f0f0f0",
                            }}
                        >
                            Assistant IA - Carte Interactive
                        </h3>
                        <Badge
                            style={{
                                background: provider === "ollama" ? "rgba(139, 92, 246, 0.2)" : "rgba(59, 130, 246, 0.2)",
                                border: `1px solid ${provider === "ollama" ? "#8b5cf6" : "#3b82f6"}`,
                                color: provider === "ollama" ? "#a78bfa" : "#60a5fa",
                                fontSize: "0.7rem",
                                padding: "0.15rem 0.5rem",
                            }}
                        >
                            {provider === "ollama" ? "🤖 Ollama" : "✨ Gemini"}
                        </Badge>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setProvider(provider === "ollama" ? "gemini" : "ollama");
                            }}
                            style={{
                                background: "rgba(136, 136, 136, 0.2)",
                                border: "1px solid #555",
                                color: "#ccc",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(0, 188, 212, 0.2)";
                                e.currentTarget.style.borderColor = "#00bcd4";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(136, 136, 136, 0.2)";
                                e.currentTarget.style.borderColor = "#555";
                            }}
                        >
                            <Settings style={{ width: "14px", height: "14px", display: "inline", marginRight: "4px" }} />
                            Changer
                        </button>
                        {showChat ? (
                            <ChevronDown
                                style={{
                                    color: "#888",
                                    width: "20px",
                                    height: "20px",
                                }}
                            />
                        ) : (
                            <ChevronUp
                                style={{
                                    color: "#888",
                                    width: "20px",
                                    height: "20px",
                                }}
                            />
                        )}
                    </div>
                </div>

                {showChat && (
                    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                        {/* Réponse IA */}
                        {response && (
                            <div
                                style={{
                                    background: "rgba(0, 188, 212, 0.1)",
                                    border: "1px solid rgba(0, 188, 212, 0.3)",
                                    borderRadius: "8px",
                                    padding: "0.75rem",
                                    marginBottom: "0.75rem",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                }}
                            >
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Sparkles
                                        style={{
                                            color: "#00bcd4",
                                            width: "18px",
                                            height: "18px",
                                            flexShrink: 0,
                                            marginTop: "2px",
                                        }}
                                    />
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "0.85rem",
                                            color: "#f0f0f0",
                                            whiteSpace: "pre-line",
                                        }}
                                    >
                                        {response}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Formulaire de requête */}
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                marginBottom: "0.5rem",
                            }}
                        >
                            <Input
                                type="text"
                                placeholder='Posez une question... (ex: "Montre-moi les 3 villes les plus peuplées")'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    background: "#2a2a2a",
                                    border: "1px solid #444",
                                    color: "#f0f0f0",
                                    borderRadius: "8px",
                                    padding: "0.5rem",
                                }}
                            />
                            <Button
                                type="submit"
                                disabled={loading || !query.trim()}
                                style={{
                                    background:
                                        loading || !query.trim()
                                            ? "#444"
                                            : "#00bcd4",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "0.5rem 1rem",
                                    cursor:
                                        loading || !query.trim()
                                            ? "not-allowed"
                                            : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                animation:
                                                    "spin 1s linear infinite",
                                            }}
                                        />
                                        Analyse...
                                    </>
                                ) : (
                                    <>
                                        <Send
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                            }}
                                        />
                                        Envoyer
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Suggestions */}
                        {!loading && (
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "0.5rem",
                                }}
                            >
                                {suggestions
                                    .slice(0, 4)
                                    .map((suggestion, index) => (
                                        <Badge
                                            key={index}
                                            onClick={() =>
                                                handleSuggestionClick(
                                                    suggestion,
                                                )
                                            }
                                            style={{
                                                background:
                                                    "rgba(136, 136, 136, 0.2)",
                                                border: "1px solid #555",
                                                color: "#ccc",
                                                cursor: "pointer",
                                                padding: "0.25rem 0.75rem",
                                                borderRadius: "12px",
                                                fontSize: "0.75rem",
                                                transition: "all 0.2s",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background =
                                                    "rgba(0, 188, 212, 0.2)";
                                                e.currentTarget.style.borderColor =
                                                    "#00bcd4";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background =
                                                    "rgba(136, 136, 136, 0.2)";
                                                e.currentTarget.style.borderColor =
                                                    "#555";
                                            }}
                                        >
                                            {suggestion}
                                        </Badge>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
