"use client";

import { AIResponse } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiAnswer, type ChatMessage } from "@/services/ai.services";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, User, Bot } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    loading?: boolean;
    response?: AIResponse;
}

export function ChatInterface() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q");

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Bonjour ! Je suis votre assistant IA pour les données du territoire 06. Posez-moi vos questions sur les indicateurs socio-démographiques, économiques et statistiques de Nice Côte d'Azur.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasProcessedInitialQuery, setHasProcessedInitialQuery] =
        useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const suggestions = [
        "Quelle est la population de Nice ?",
        "Statistiques d'emploi 2025",
        "Secteurs économiques du 06",
        "Indicateurs touristiques",
        "Démographie des Alpes-Maritimes",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle initial query from URL
    useEffect(() => {
        if (initialQuery && !hasProcessedInitialQuery && !isLoading) {
            setHasProcessedInitialQuery(true);
            // Submit the initial query
            const submitInitialQuery = async () => {
                const userMessage: Message = {
                    id: Date.now().toString(),
                    role: "user",
                    content: initialQuery,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, userMessage]);
                setIsLoading(true);

                // Add loading message
                const loadingMessage: Message = {
                    id: `loading-${Date.now()}`,
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                    loading: true,
                };
                setMessages((prev) => [...prev, loadingMessage]);

                try {
                    // Build conversation history (last 10 messages)
                    const history: ChatMessage[] = messages
                        .filter(
                            (m) =>
                                (!m.loading && m.role !== "assistant") ||
                                m.response,
                        )
                        .slice(-10)
                        .map((m) => ({
                            role: m.role === "user" ? "user" : "assistant",
                            content: m.content,
                        }));

                    const result = await aiAnswer(initialQuery, history);

                    setMessages((prev) => {
                        const filtered = prev.filter((m) => !m.loading);
                        return [
                            ...filtered,
                            {
                                id: `response-${Date.now()}`,
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
                            },
                        ];
                    });
                } catch (error) {
                    console.error("AI Error:", error);
                    setMessages((prev) => {
                        const filtered = prev.filter((m) => !m.loading);
                        return [
                            ...filtered,
                            {
                                id: `error-${Date.now()}`,
                                role: "assistant",
                                content:
                                    "Désolé, une erreur s'est produite. Veuillez réessayer.",
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery, hasProcessedInitialQuery, isLoading]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Add loading message
        const loadingMessage: Message = {
            id: `loading-${Date.now()}`,
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

            const result = await aiAnswer(userMessage.content, history);

            // Remove loading message and add real response
            setMessages((prev) => {
                const filtered = prev.filter((m) => !m.loading);
                return [
                    ...filtered,
                    {
                        id: `response-${Date.now()}`,
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
                    },
                ];
            });
        } catch (error) {
            console.error("AI Error:", error);
            // Remove loading message and add error
            setMessages((prev) => {
                const filtered = prev.filter((m) => !m.loading);
                return [
                    ...filtered,
                    {
                        id: `error-${Date.now()}`,
                        role: "assistant",
                        content:
                            "Désolé, une erreur s'est produite. Veuillez réessayer.",
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

                        <Card
                            className={`max-w-[80%] ${
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card"
                            }`}
                        >
                            <div className="p-4">
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
                                    </>
                                )}
                            </div>
                        </Card>

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
            {messages.length <= 1 && (
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
                        placeholder="Posez votre question... (Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne)"
                        disabled={isLoading}
                        className="max-h-32 min-h-10 flex-1 resize-none"
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="h-10 w-10 shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
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
