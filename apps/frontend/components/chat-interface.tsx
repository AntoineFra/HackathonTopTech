"use client";

import { AIResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, User, Bot } from "lucide-react";
import { aiAnswer, type ChatMessage } from "@/services/ai.services";
import { useAIProvider } from "@/contexts/AIProviderContext";
import { AIGeneratedChart } from "@/components/map3d-threejs/AIGeneratedChart";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    loading?: boolean;
    response?: AIResponse;
    chartData?: {
        type: "bar" | "line" | "pie" | "area" | "radar" | "radial";
        data: any[];
        title?: string;
        description?: string;
        prismaQuery?: string;
    };
}

interface ChatInterfaceProps {
    onCityDetected?: (cityName: string, aiResponse: string) => void;
    onLegendActivate?: (
        legendType: "population" | "economy" | "tourism",
    ) => void;
    onChartGenerated?: (
        chartData: {
            type: "bar" | "line" | "pie" | "area" | "radar" | "radial";
            data: any[];
            title?: string;
            description?: string;
            prismaQuery?: string;
        } | null,
    ) => void;
    citiesList?: string[];
    showSuggestions?: boolean;
}

export function ChatInterface({
    onCityDetected,
    onLegendActivate,
    onChartGenerated,
    citiesList = [],
    showSuggestions = true,
}: ChatInterfaceProps = {}) {
    const { provider } = useAIProvider();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q");

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Bonjour ! Je suis votre assistant IA pour les données du territoire 06. Posez-moi vos questions sur les données démographiques, économiques et touristiques des Alpes-Maritimes.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasProcessedInitialQuery, setHasProcessedInitialQuery] =
        useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messageIdCounter = useRef(0);
    const initialQueryProcessed = useRef(false);

    // Generate unique message ID
    const generateMessageId = (prefix = "") => {
        messageIdCounter.current += 1;
        return `${prefix}${Date.now()}-${messageIdCounter.current}`;
    };

    // Detect city in response
    const detectCityInResponse = useCallback(
        (response: string): string | null => {
            if (citiesList.length === 0) return null;

            const normalizedResponse = response.toLowerCase();
            for (const city of citiesList) {
                const normalizedCity = city.toLowerCase();
                const regex = new RegExp(`\\b${normalizedCity}\\b`, "i");
                if (regex.test(normalizedResponse)) {
                    return city;
                }
            }
            return null;
        },
        [citiesList],
    );

    const suggestions = [
        "Quelle est la population de Nice ?",
        "Évolution démographique de Grasse",
        "Secteurs économiques du 06",
        "Statistiques touristiques de Cannes",
        "Comparaison des communes",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle initial query from URL
    useEffect(() => {
        if (
            initialQuery &&
            !hasProcessedInitialQuery &&
            !initialQueryProcessed.current
        ) {
            // Prevent double execution in StrictMode
            initialQueryProcessed.current = true;
            setHasProcessedInitialQuery(true);

            // Submit the initial query
            const submitInitialQuery = async () => {
                const userMessage: Message = {
                    id: generateMessageId("user-"),
                    role: "user",
                    content: initialQuery,
                    timestamp: new Date(),
                };

                setMessages((prev) => {
                    // Check if a user message with this content already exists
                    const alreadyExists = prev.some(
                        (m) => m.role === "user" && m.content === initialQuery,
                    );
                    if (alreadyExists) {
                        return prev;
                    }
                    return [...prev, userMessage];
                });

                setIsLoading(true);

                // Add loading message
                const loadingMessage: Message = {
                    id: generateMessageId("loading-"),
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                    loading: true,
                };
                setMessages((prev) => [...prev, loadingMessage]);

                try {
                    // For initial query, we only have the welcome message in history
                    const history: ChatMessage[] = [];

                    const result = await aiAnswer(
                        initialQuery,
                        history,
                        provider,
                    );

                    setMessages((prev) => {
                        const filtered = prev.filter((m) => !m.loading);
                        const responseMessage: Message = {
                            id: generateMessageId("response-"),
                            role: "assistant",
                            content:
                                result.answer ||
                                "Désolé, je n'ai pas pu traiter votre question.",
                            timestamp: new Date(),
                            response: {
                                success: result.success,
                                query: result.query,
                                answer: result.answer,
                                confidence: result.confidence || 0.85,
                            },
                        };

                        // Handle chart data
                        if (result.chart) {
                            console.log(
                                "📊 Données de graphique reçues:",
                                result.chart,
                            );
                            const chartData = {
                                type: result.chart.type,
                                data: result.chart.data,
                                title: result.chart.title,
                                description: result.chart.description,
                                prismaQuery: result.prismaQuery,
                            };
                            responseMessage.chartData = chartData;
                            onChartGenerated?.(chartData);
                        } else {
                            onChartGenerated?.(null);
                        }

                        // Handle legend activation
                        if (result.legendType && onLegendActivate) {
                            console.log(
                                `📊 Activation automatique de la légende: ${result.legendType}`,
                            );
                            onLegendActivate(result.legendType);
                        }

                        // Handle city detection
                        if (result.answer) {
                            const detectedCity = detectCityInResponse(
                                result.answer,
                            );
                            if (detectedCity && onCityDetected) {
                                console.log(
                                    `🏙️ Ville détectée dans la réponse: ${detectedCity}`,
                                );
                                onCityDetected(detectedCity, result.answer);
                            }
                        }

                        return [...filtered, responseMessage];
                    });
                } catch (error) {
                    console.error("AI Error:", error);

                    // Extract error message
                    let errorMessage =
                        "Désolé, une erreur s'est produite. Veuillez réessayer.";
                    if (error instanceof Error) {
                        if (
                            error.message.includes("Timeout") ||
                            error.message.includes("timeout")
                        ) {
                            errorMessage =
                                "⏱️ La requête a pris trop de temps. Le modèle IA est peut-être en train de démarrer ou surchargé. Veuillez patienter quelques instants et réessayer avec une question plus courte.";
                        } else if (error.message.includes("500")) {
                            errorMessage =
                                "❌ Erreur serveur. Le service IA n'est peut-être pas disponible. Vérifiez que Ollama est bien démarré.";
                        } else if (error.message.includes("fetch")) {
                            errorMessage =
                                "🔌 Impossible de contacter le serveur. Vérifiez votre connexion.";
                        }
                    }

                    setMessages((prev) => {
                        const filtered = prev.filter((m) => !m.loading);
                        return [
                            ...filtered,
                            {
                                id: generateMessageId("error-"),
                                role: "assistant",
                                content: errorMessage,
                                timestamp: new Date(),
                            },
                        ];
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            submitInitialQuery();
        }
    }, [
        initialQuery,
        hasProcessedInitialQuery,
        provider,
        detectCityInResponse,
        onChartGenerated,
        onCityDetected,
        onLegendActivate,
    ]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: generateMessageId("user-"),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Add loading message
        const loadingMessage: Message = {
            id: generateMessageId("loading-"),
            role: "assistant",
            content: "",
            timestamp: new Date(),
            loading: true,
        };
        setMessages((prev) => [...prev, loadingMessage]);

        try {
            // Build conversation history (last 10 messages)
            const history: ChatMessage[] = messages
                .filter((m) => !m.loading && m.id !== "welcome")
                .slice(-10)
                .map((m) => ({
                    role: m.role === "user" ? "user" : "assistant",
                    content: m.content,
                }));

            const result = await aiAnswer(
                userMessage.content,
                history,
                provider,
            );

            // Remove loading message and add real response
            setMessages((prev) => {
                const filtered = prev.filter((m) => !m.loading);
                const responseMessage: Message = {
                    id: generateMessageId("response-"),
                    role: "assistant",
                    content:
                        result.answer ||
                        "Désolé, je n'ai pas pu traiter votre question.",
                    timestamp: new Date(),
                    response: {
                        success: result.success,
                        query: result.query,
                        answer: result.answer,
                        confidence: result.confidence || 0.85,
                    },
                };

                // Handle chart data
                if (result.chart) {
                    console.log(
                        "📊 Données de graphique reçues:",
                        result.chart,
                    );
                    const chartData = {
                        type: result.chart.type,
                        data: result.chart.data,
                        title: result.chart.title,
                        description: result.chart.description,
                        prismaQuery: result.prismaQuery,
                    };
                    responseMessage.chartData = chartData;
                    onChartGenerated?.(chartData);
                } else {
                    onChartGenerated?.(null);
                }

                // Handle legend activation
                if (result.legendType && onLegendActivate) {
                    console.log(
                        `📊 Activation automatique de la légende: ${result.legendType}`,
                    );
                    onLegendActivate(result.legendType);
                }

                // Handle city detection
                if (result.answer) {
                    const detectedCity = detectCityInResponse(result.answer);
                    if (detectedCity && onCityDetected) {
                        console.log(
                            `🏙️ Ville détectée dans la réponse: ${detectedCity}`,
                        );
                        onCityDetected(detectedCity, result.answer);
                    }
                }

                return [...filtered, responseMessage];
            });
        } catch (error) {
            console.error("AI Error:", error);

            // Extract error message
            let errorMessage =
                "Désolé, une erreur s'est produite. Veuillez réessayer.";
            if (error instanceof Error) {
                if (
                    error.message.includes("Timeout") ||
                    error.message.includes("timeout")
                ) {
                    errorMessage =
                        "⏱️ La requête a pris trop de temps. Le modèle IA est peut-être en train de démarrer ou surchargé. Veuillez patienter quelques instants et réessayer avec une question plus courte.";
                } else if (error.message.includes("500")) {
                    errorMessage =
                        "❌ Erreur serveur. Le service IA n'est peut-être pas disponible. Vérifiez que Ollama est bien démarré.";
                } else if (error.message.includes("fetch")) {
                    errorMessage =
                        "🔌 Impossible de contacter le serveur. Vérifiez votre connexion.";
                }
            }

            // Remove loading message and add error
            setMessages((prev) => {
                const filtered = prev.filter((m) => !m.loading);
                return [
                    ...filtered,
                    {
                        id: generateMessageId("error-"),
                        role: "assistant",
                        content: errorMessage,
                        timestamp: new Date(),
                    },
                ];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${
                            message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        {message.role === "assistant" && (
                            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                {message.loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Bot className="h-4 w-4" />
                                )}
                            </div>
                        )}

                        <div
                            className={`max-w-[80%] rounded-lg overflow-hidden ${
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50"
                            }`}
                        >
                            <div className="p-3">
                                {message.loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">
                                            Réflexion en cours...
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                        {message.response?.confidence && (
                                            <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                                                <Sparkles className="h-3 w-3" />
                                                <span>
                                                    Confiance:{" "}
                                                    {Math.round(
                                                        message.response
                                                            .confidence * 100,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        )}
                                        {/* Afficher la requête SQL si disponible */}
                                        {message.chartData?.prismaQuery && (
                                            <details className="mt-2">
                                                <summary className="flex cursor-pointer items-center gap-2 text-xs opacity-70 hover:opacity-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                                    Voir la requête SQL
                                                </summary>
                                                <pre className="bg-muted/50 text-foreground mt-2 overflow-x-auto rounded p-2 text-xs">
                                                    {message.chartData.prismaQuery}
                                                </pre>
                                            </details>
                                        )}
                                        {/* Graphique généré par l'IA */}
                                        {message.chartData && (
                                            <div className="mt-3">
                                                <AIGeneratedChart
                                                    chartType={
                                                        message.chartData.type
                                                    }
                                                    data={
                                                        message.chartData.data
                                                    }
                                                    title={
                                                        message.chartData.title
                                                    }
                                                    description={
                                                        message.chartData
                                                            .description
                                                    }
                                                    prismaQuery={
                                                        message.chartData
                                                            .prismaQuery
                                                    }
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {message.role === "user" && (
                            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                <User className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (only shown when chat is empty or at start) */}
            {showSuggestions && messages.length <= 1 && (
                <div className="border-t px-4 py-3">
                    <p className="text-muted-foreground mb-2 text-xs">
                        Suggestions :
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="hover:bg-accent cursor-pointer"
                                onClick={() =>
                                    handleSuggestionClick(suggestion)
                                }
                            >
                                {suggestion}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: Quelle est la population de Nice ?"
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
                <p className="text-muted-foreground mt-2 text-center text-xs">
                    L&apos;IA peut faire des erreurs. Vérifiez les informations
                    importantes.
                </p>
            </div>
        </div>
    );
}
