"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMap } from "./map-context";
import { COLOR_SCHEMES } from "@/lib/map-colors";

export function MapLegend() {
    const { mapState } = useMap();
    const currentScheme = COLOR_SCHEMES[mapState.colorScheme];

    if (mapState.colorScheme === "default") {
        return null; // Don't show legend for default scheme
    }

    return (
        <Card className="w-64 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    {currentScheme.label}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs">
                    {currentScheme.description}
                </p>

                {/* Color gradient indicator */}
                <div className="space-y-1">
                    <div
                        className="h-3 rounded"
                        style={{
                            background: currentScheme.colorScale.mid
                                ? `linear-gradient(to right, ${currentScheme.colorScale.min}, ${currentScheme.colorScale.mid}, ${currentScheme.colorScale.max})`
                                : `linear-gradient(to right, ${currentScheme.colorScale.min}, ${currentScheme.colorScale.max})`,
                        }}
                    />
                    <div className="text-muted-foreground flex justify-between text-xs">
                        <span>Faible</span>
                        <span>Élevé</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
