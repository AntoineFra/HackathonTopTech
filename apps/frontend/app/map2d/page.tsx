"use client";

import { useEffect, useRef, useState } from "react";
import { cityPolygons, cityData } from "./data/cityPolygons";
import type { CityDataType } from "./data/cityPolygons";
import { loadGoogleMaps } from "@/lib/map-utils";

interface HoveredCity extends CityDataType {
    name: string;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDYqP19MDyDR5PXp50uUbxHva-e_k2aMj0";

export default function Map2DPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [hoveredCity, setHoveredCity] = useState<HoveredCity | null>(null);

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

        Object.entries(cityPolygons).forEach(([city, polygonsArray]) => {
            // polygonsArray est maintenant un array de polygones (pour gérer MultiPolygon)
            // Chaque polygone est un array de {lat, lng}

            if (!Array.isArray(polygonsArray) || polygonsArray.length === 0) {
                console.warn(`⚠️ Ville ${city} sans polygones valides`);
                return;
            }

            // Créer un polygone Google Maps pour CHAQUE polygone de la ville
            polygonsArray.forEach((polygonCoords, index) => {
                if (!Array.isArray(polygonCoords) || polygonCoords.length < 3) {
                    console.warn(
                        `⚠️ ${city} - polygone ${index} invalide (< 3 points)`,
                    );
                    return;
                }

                const polygon = new maps.Polygon({
                    paths: polygonCoords, // Un seul polygone ici
                    strokeColor: "#888",
                    strokeOpacity: 0.5,
                    strokeWeight: 1,
                    fillColor: "#888",
                    fillOpacity: 0.2,
                    map,
                });

                totalPolygons++;

                // Effet survol - tous les polygones d'une ville partagent le même survol
                polygon.addListener("mouseover", () => {
                    polygon.setOptions({
                        fillColor: "#00bcd4",
                        fillOpacity: 0.5,
                    });
                    const data = cityData[city];
                    if (data) {
                        setHoveredCity({ name: city, ...data });
                    }
                });

                polygon.addListener("mouseout", () => {
                    polygon.setOptions({ fillColor: "#888", fillOpacity: 0.2 });
                    setHoveredCity(null);
                });
            });
        });

        console.log(`✅ ${totalPolygons} polygones créés au total`);
    }, [map]);

    return (
        <div style={{ height: "100vh", width: "100%", position: "relative" }}>
            {/* Carte */}
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

            {/* Bulle d'infos à droite */}
            {hoveredCity && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        right: "2rem",
                        transform: "translateY(-50%)",
                        background: "#1e1e1e",
                        color: "#f0f0f0",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                        fontFamily: "sans-serif",
                        width: "280px",
                        zIndex: 10,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1.3rem",
                            color: "#00bcd4",
                        }}
                    >
                        {hoveredCity.name}
                    </h2>
                    <hr style={{ borderColor: "#333", margin: "8px 0" }} />
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>🏢 Entreprises :</b> {hoveredCity.entreprises}
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>👥 Population :</b>{" "}
                        {hoveredCity.population.toLocaleString()} habitants
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>📏 Surface :</b>{" "}
                        {hoveredCity.surface
                            ? hoveredCity.surface.toFixed(2) + " hectares"
                            : "N/A"}
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>🌴 Tourisme :</b> {hoveredCity.tourisme}/100
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>💼 Emploi :</b> {hoveredCity.emploi}%
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>💶 Revenu moyen :</b> {hoveredCity.revenu} €
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>🏭 Secteur dominant :</b> {hoveredCity.secteur}
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>📍 Code INSEE :</b> {hoveredCity.code || "N/A"}
                    </p>
                    <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
                        <b>🏙️ Zone :</b>{" "}
                        {hoveredCity.zone === "metro"
                            ? "Métropolitaine"
                            : hoveredCity.zone}
                    </p>
                </div>
            )}
        </div>
    );
}
