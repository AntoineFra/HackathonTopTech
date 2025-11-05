"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Eye, Building2 } from "lucide-react";
import { useMap } from "./map-context";
import { COLOR_SCHEMES } from "@/lib/map-colors";
import { CommuneData } from "@/types/map";

interface MapControlsProps {
    communes: CommuneData[];
}

export function MapControls({ communes }: MapControlsProps) {
    const { mapState, updateColorScheme, resetView, selectCommune } = useMap();

    const colorSchemes = Object.values(COLOR_SCHEMES).filter(
        (scheme) => scheme.scheme !== "custom",
    );

    return (
        <Card className="max-h-[600px] w-80 overflow-y-auto bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <Building2 className="h-4 w-4" />
                        Contrôles de la carte
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetView}
                        title="Réinitialiser la vue"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Color scheme selector */}
                <div>
                    <label className="mb-2 flex items-center gap-1 text-xs font-medium">
                        <Eye className="h-3 w-3" />
                        Mode de visualisation
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {colorSchemes.map((scheme) => (
                            <Badge
                                key={scheme.scheme}
                                variant={
                                    mapState.colorScheme === scheme.scheme
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer text-xs"
                                onClick={() => updateColorScheme(scheme.scheme)}
                            >
                                {scheme.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Commune selector */}
                <div>
                    <label className="mb-2 block text-xs font-medium">
                        Communes principales
                    </label>
                    <div className="space-y-1">
                        {communes.slice(0, 8).map((commune) => (
                            <button
                                key={commune.id}
                                onClick={() => selectCommune(commune.id)}
                                className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-slate-100 ${
                                    mapState.selectedCommune === commune.id
                                        ? "bg-sky-100 font-semibold"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{commune.name}</span>
                                    <span className="text-muted-foreground">
                                        {commune.population?.toLocaleString()}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                {mapState.selectedCommune && (
                    <div className="border-t pt-2">
                        <p className="text-muted-foreground text-xs">
                            Commune sélectionnée:{" "}
                            <span className="font-semibold text-slate-900">
                                {
                                    communes.find(
                                        (c) =>
                                            c.id === mapState.selectedCommune,
                                    )?.name
                                }
                            </span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
