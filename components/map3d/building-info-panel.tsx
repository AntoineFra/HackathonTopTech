"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, MapPin } from "lucide-react";
import { useMap } from "./map-context";
import { BuildingData } from "@/types/map";

interface BuildingInfoPanelProps {
    buildings: BuildingData[];
}

export function BuildingInfoPanel({ buildings }: BuildingInfoPanelProps) {
    const { mapState } = useMap();

    const selectedBuilding = buildings.find(
        (b) => b.id === mapState.selectedBuilding,
    );

    if (!selectedBuilding) {
        return null;
    }

    return (
        <Card className="w-80 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4" />
                    {selectedBuilding.name || "Bâtiment"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Location */}
                <div className="flex items-start gap-2">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                        <p className="text-xs font-medium">Commune</p>
                        <p className="text-sm">{selectedBuilding.commune}</p>
                    </div>
                </div>

                {/* Building details */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <p className="text-muted-foreground text-xs">Type</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                            {selectedBuilding.type || "Non spécifié"}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Étages</p>
                        <p className="mt-1 text-sm font-semibold">
                            {selectedBuilding.floors || "N/A"}
                        </p>
                    </div>
                </div>

                {/* Sector */}
                {selectedBuilding.sector && (
                    <div className="flex items-start gap-2">
                        <TrendingUp className="text-muted-foreground mt-0.5 h-4 w-4" />
                        <div className="flex-1">
                            <p className="text-xs font-medium">Secteur</p>
                            <Badge className="mt-1" variant="secondary">
                                {selectedBuilding.sector}
                            </Badge>
                        </div>
                    </div>
                )}

                {/* Enterprise count */}
                {selectedBuilding.enterpriseCount !== undefined &&
                    selectedBuilding.enterpriseCount > 0 && (
                        <div className="flex items-start gap-2">
                            <Users className="text-muted-foreground mt-0.5 h-4 w-4" />
                            <div className="flex-1">
                                <p className="text-xs font-medium">
                                    Entreprises
                                </p>
                                <p className="text-sm font-semibold">
                                    {selectedBuilding.enterpriseCount}
                                </p>
                            </div>
                        </div>
                    )}

                {/* Coordinates */}
                <div className="text-muted-foreground border-t pt-2 text-xs">
                    <p>
                        {selectedBuilding.coordinates.lat.toFixed(6)},{" "}
                        {selectedBuilding.coordinates.lon.toFixed(6)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
