"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export type LegendType = "population" | "economy" | "tourism";

interface Map3DLegendsProps {
    onLegendChange: (legendType: LegendType, enabled: boolean) => void;
    activeLegends: Set<LegendType>;
}

interface LegendConfig {
    type: LegendType;
    label: string;
    description: string;
    colors: { color: string; label: string }[];
}

const LEGEND_CONFIGS: LegendConfig[] = [
    {
        type: "population",
        label: "Population",
        description: "Densité de population par commune",
        colors: [
            { color: "bg-[#2196F3]", label: "Faible" },
            { color: "bg-[#4CAF50]", label: "Moyenne" },
            { color: "bg-[#FFEB3B]", label: "Élevée" },
            { color: "bg-[#FF9800]", label: "Très élevée" },
            { color: "bg-[#F44336]", label: "Maximale" },
        ],
    },
    {
        type: "economy",
        label: "Économie",
        description: "Activité économique (bientôt disponible)",
        colors: [
            { color: "bg-gray-300", label: "Faible" },
            { color: "bg-purple-400", label: "Moyenne" },
            { color: "bg-purple-600", label: "Forte" },
        ],
    },
    {
        type: "tourism",
        label: "Tourisme",
        description: "Attractivité touristique (bientôt disponible)",
        colors: [
            { color: "bg-cyan-300", label: "Faible" },
            { color: "bg-teal-400", label: "Moyenne" },
            { color: "bg-emerald-600", label: "Forte" },
        ],
    },
];

export default function Map3DLegends({
    onLegendChange,
    activeLegends,
}: Map3DLegendsProps) {
    const handleToggle = (legendType: LegendType) => {
        const isEnabled = !activeLegends.has(legendType);
        onLegendChange(legendType, isEnabled);
    };

    return (
        <Card className="w-[240px] shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">
                    Visualisations
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {LEGEND_CONFIGS.map((config) => (
                    <div
                        key={config.type}
                        className="border-border space-y-1 rounded border p-2"
                    >
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id={config.type}
                                checked={activeLegends.has(config.type)}
                                onCheckedChange={() =>
                                    handleToggle(config.type)
                                }
                                disabled={config.type !== "population"}
                                className="mt-0.5"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <Label
                                        htmlFor={config.type}
                                        className="cursor-pointer text-xs font-semibold"
                                    >
                                        {config.label}
                                    </Label>
                                    {config.type !== "population" && (
                                        <Badge
                                            variant="outline"
                                            className="px-1 py-0 text-[10px]"
                                        >
                                            Bientôt
                                        </Badge>
                                    )}
                                </div>

                                {/* Gradient de couleurs - affiché seulement si activé */}
                                {activeLegends.has(config.type) && (
                                    <div className="mt-1.5 space-y-0.5">
                                        {config.colors.map((c, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-1.5"
                                            >
                                                <div
                                                    className={`h-2 w-2 rounded-sm ${c.color}`}
                                                />
                                                <span className="text-muted-foreground text-[10px]">
                                                    {c.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
