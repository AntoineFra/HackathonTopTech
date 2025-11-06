// @ts-nocheck - Recharts types incompatibles avec React 19, mais fonctionne à l'exécution
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    RadarChart,
    Radar,
    RadialBarChart,
    RadialBar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    Cell,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";

interface AIGeneratedChartProps {
    chartType: "bar" | "line" | "pie" | "area" | "radar" | "radial";
    data: any[];
    title?: string;
    description?: string;
    prismaQuery?: string;
}

// Couleurs pour le theme oklch
const CHART_COLORS = [
    "oklch(0.623 0.214 259.815)", // bleu (chart-2)
    "oklch(0.707 0.182 142.495)", // vert
    "oklch(0.831 0.167 85.594)",  // jaune
    "oklch(0.705 0.199 28.363)",  // orange
    "oklch(0.576 0.232 27.325)",  // rouge
    "oklch(0.633 0.267 302.321)", // violet
];

export function AIGeneratedChart({
    chartType,
    data,
    title,
    description,
    prismaQuery,
}: AIGeneratedChartProps) {
    // Configuration du chart pour shadcn/ui
    const chartConfig = useMemo(() => {
        if (!data || data.length === 0) return {};

        const config: any = {};
        const firstItem = data[0];

        // Extraire les clés numériques pour la configuration
        Object.keys(firstItem).forEach((key, index) => {
            if (typeof firstItem[key] === "number") {
                config[key] = {
                    label: key.charAt(0).toUpperCase() + key.slice(1),
                    color: CHART_COLORS[index % CHART_COLORS.length],
                };
            }
        });

        return config;
    }, [data]);

    // Déterminer les clés pour les axes
    const { xKey, yKeys } = useMemo(() => {
        if (!data || data.length === 0) return { xKey: "", yKeys: [] };

        const firstItem = data[0];
        const keys = Object.keys(firstItem);

        // La première clé string devient l'axe X
        const xKey = keys.find((key) => typeof firstItem[key] === "string") || keys[0];

        // Les clés numériques deviennent les axes Y
        const yKeys = keys.filter((key) => typeof firstItem[key] === "number");

        return { xKey, yKeys };
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <Card className="border-muted">
                <CardHeader>
                    <CardTitle className="text-sm">Aucune donnée</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        L'IA n'a pas retourné de données pour le graphique.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const renderChart = () => {
        switch (chartType) {
            case "bar":
                return (
                    <ChartContainer config={chartConfig}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey={xKey}
                                className="text-muted-foreground text-xs"
                            />
                            <YAxis className="text-muted-foreground text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            {yKeys.map((key, index) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ChartContainer>
                );

            case "line":
                return (
                    <ChartContainer config={chartConfig}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey={xKey}
                                className="text-muted-foreground text-xs"
                            />
                            <YAxis className="text-muted-foreground text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            {yKeys.map((key, index) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            ))}
                        </LineChart>
                    </ChartContainer>
                );

            case "area":
                return (
                    <ChartContainer config={chartConfig}>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey={xKey}
                                className="text-muted-foreground text-xs"
                            />
                            <YAxis className="text-muted-foreground text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            {yKeys.map((key, index) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    fillOpacity={0.6}
                                    strokeWidth={2}
                                />
                            ))}
                        </AreaChart>
                    </ChartContainer>
                );

            case "pie":
                return (
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey={yKeys[0]} // Premier yKey pour le pie
                                nameKey={xKey}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                        </PieChart>
                    </ChartContainer>
                );

            case "radar":
                return (
                    <ChartContainer config={chartConfig}>
                        <RadarChart data={data}>
                            <PolarGrid className="stroke-muted" />
                            <PolarAngleAxis
                                dataKey={xKey}
                                className="text-muted-foreground text-xs"
                            />
                            <PolarRadiusAxis className="text-muted-foreground text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            {yKeys.map((key, index) => (
                                <Radar
                                    key={key}
                                    name={key}
                                    dataKey={key}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    fillOpacity={0.5}
                                    strokeWidth={2}
                                />
                            ))}
                            <Legend />
                        </RadarChart>
                    </ChartContainer>
                );

            case "radial":
                return (
                    <ChartContainer config={chartConfig}>
                        <RadialBarChart
                            data={data}
                            innerRadius="10%"
                            outerRadius="80%"
                            startAngle={90}
                            endAngle={-270}
                        >
                            <PolarGrid className="stroke-muted" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <RadialBar
                                dataKey={yKeys[0]}
                                label={{ position: 'insideStart', fill: '#fff' }}
                                background
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    />
                                ))}
                            </RadialBar>
                            <Legend />
                        </RadialBarChart>
                    </ChartContainer>
                );

            default:
                return <p className="text-muted-foreground">Type de graphique non supporté</p>;
        }
    };

    return (
        <Card className="border-muted">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base">
                            {title || "Graphique généré par l'IA"}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-xs">
                                {description}
                            </CardDescription>
                        )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {chartType}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="h-[280px]">
                    {renderChart()}
                </div>

                {/* Debug: Afficher la requête Prisma si disponible */}
                {prismaQuery && (
                    <details className="mt-4">
                        <summary className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs">
                            <Code className="h-3 w-3" />
                            Voir la requête Prisma
                        </summary>
                        <pre className="bg-muted text-foreground mt-2 overflow-x-auto rounded p-2 text-xs">
                            {prismaQuery}
                        </pre>
                    </details>
                )}
            </CardContent>
        </Card>
    );
}
