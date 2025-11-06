"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot, X, MessageSquare, Sparkles, Cpu } from "lucide-react";
import { aiAnswer, type ChatMessage } from "@/services/ai.services";
import { AIGeneratedChart } from "./AIGeneratedChart";
import { Badge } from "@/components/ui/badge";

interface Map3DChatBoxProps {
    citiesList: string[];
    onCityDetected: (cityName: string, aiResponse: string) => void;
    onLegendActivate?: (legendType: "population" | "economy" | "tourism") => void;
    onChartGenerated?: (chartData: {
        type: "bar" | "line" | "pie";
        data: any[];
        title?: string;
        description?: string;
        prismaQuery?: string;
    } | null) => void;
}

export function Map3DChatBox({
    citiesList,
    onCityDetected,
    onLegendActivate,
    onChartGenerated,
}: Map3DChatBoxProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState<string>("");
    const [aiProvider, setAiProvider] = useState<"ollama" | "gemini">("gemini");
    const [chartData, setChartData] = useState<{
        type: "bar" | "line" | "pie";
        data: any[];
        title?: string;
        description?: string;
        prismaQuery?: string;
    } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const detectCityInResponse = (response: string): string | null => {
        // Normaliser la réponse pour la recherche
        const normalizedResponse = response.toLowerCase();

        // Chercher chaque ville dans la réponse
        for (const city of citiesList) {
            const normalizedCity = city.toLowerCase();
            // Chercher la ville en tant que mot entier
            const regex = new RegExp(`\\b${normalizedCity}\\b`, "i");
            if (regex.test(normalizedResponse)) {
                return city;
            }
        }

        return null;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userQuestion = input.trim();
        setInput("");
        setIsLoading(true);
        setLastResponse("");

        try {
            // Construire l'historique avec contexte géographique
            const history: ChatMessage[] = [
                {
                    role: "assistant",
                    content:
                        "Je suis un assistant spécialisé dans les données des communes des Alpes-Maritimes (département 06).",
                },
            ];

            const result = await aiAnswer(userQuestion, history, aiProvider);

            if (result.success && result.answer) {
                setLastResponse(result.answer);

                // Stocker les données du graphique si présentes
                if (result.chart) {
                    console.log("📊 Données de graphique reçues:", result.chart);
                    const newChartData = {
                        type: result.chart.type,
                        data: result.chart.data,
                        title: result.chart.title,
                        description: result.chart.description,
                        prismaQuery: result.prismaQuery,
                    };
                    setChartData(newChartData);
                    onChartGenerated?.(newChartData);
                } else {
                    setChartData(null);
                    onChartGenerated?.(null);
                }

                // Activer automatiquement la légende si retournée par l'IA
                if (result.legendType && onLegendActivate) {
                    console.log(`📊 Activation automatique de la légende: ${result.legendType}`);
                    onLegendActivate(result.legendType);
                }

                // Détecter la ville dans la réponse
                const detectedCity = detectCityInResponse(result.answer);

                if (detectedCity) {
                    console.log(
                        `🏙️ Ville détectée dans la réponse: ${detectedCity}`,
                    );
                    onCityDetected(detectedCity, result.answer);
                } else {
                    console.log("ℹ️ Aucune ville détectée dans la réponse");
                }
            } else {
                setLastResponse(
                    "Désolé, je n'ai pas pu traiter votre question.",
                );
            }
        } catch (error) {
            console.error("AI Error:", error);
            setLastResponse(
                "Désolé, une erreur s'est produite. Veuillez réessayer.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <Card className="bg-card border-border w-full border shadow-lg">
            <div className="border-border flex items-center justify-between border-b p-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-foreground text-lg font-semibold">
                            Assistant IA
                        </h3>
                        <p className="text-muted-foreground text-xs">
                            Posez vos questions sur les communes du 06
                        </p>
                    </div>
                </div>
                <Badge
                    variant={aiProvider === "gemini" ? "default" : "secondary"}
                    className="text-xs cursor-pointer"
                    onClick={() => setAiProvider(aiProvider === "gemini" ? "ollama" : "gemini")}
                >
                    {aiProvider === "gemini" ? (
                        <><Sparkles className="h-3 w-3 mr-1" /> Gemini</>
                    ) : (
                        <><Cpu className="h-3 w-3 mr-1" /> Ollama</>
                    )}
                </Badge>
            </div>

            <div className="space-y-3 p-4 overflow-y-auto flex-1">
                {/* Input de question */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: Quelle est l'évolution de la population de Grasse depuis 1876 ?"
                        disabled={isLoading}
                        className="max-h-24 min-h-12 flex-1 resize-none"
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="h-12 w-12 shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </form>

                {/* Zone de chargement */}
                {isLoading && (
                    <div className="text-muted-foreground flex items-center justify-center gap-2 py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-base">Réflexion en cours...</span>
                    </div>
                )}

                {/* Réponse de l'IA */}
                {lastResponse && (
                    <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-muted-foreground text-xs font-semibold mb-2">
                                Réponse de l'IA :
                            </p>
                            <p className="text-foreground text-sm whitespace-pre-wrap">
                                {lastResponse}
                            </p>
                        </div>

                        {/* Graphique généré par l'IA */}
                        {chartData && (
                            <AIGeneratedChart
                                chartType={chartData.type}
                                data={chartData.data}
                                title={chartData.title}
                                description={chartData.description}
                                prismaQuery={chartData.prismaQuery}
                            />
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
