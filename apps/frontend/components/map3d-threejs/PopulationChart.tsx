"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface PopulationChartProps {
    populationData: any;
}

const chartConfig = {
    population: {
        label: "Population",
        color: "oklch(0.623 0.214 259.815)",
    },
} satisfies ChartConfig;

export function PopulationChart({ populationData }: PopulationChartProps) {
    if (!populationData) return null;

    // Préparer les données pour le graphique (dernières décennies)
    const chartData = [
        { year: "1999", population: populationData.pop1999 || 0 },
        { year: "2006", population: populationData.pop2006 || 0 },
        { year: "2010", population: populationData.pop2010 || 0 },
        { year: "2015", population: populationData.pop2015 || 0 },
        { year: "2020", population: populationData.pop2020 || 0 },
        { year: "2022", population: populationData.pop2022 || 0 },
    ].filter((d) => d.population > 0); // Filtrer les années sans données

    return (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="year"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                    dataKey="population"
                    fill="var(--color-population)"
                    radius={8}
                />
            </BarChart>
        </ChartContainer>
    );
}
