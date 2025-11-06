"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { AIGeneratedChart } from "./AIGeneratedChart";
import { useAIProvider } from "@/contexts/AIProviderContext";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { aiAnswer, type ChatMessage } from "@/services/ai.services";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  loading?: boolean;
  confidence?: number;
  chartData?: {
    type: "bar" | "line" | "pie" | "area" | "radar" | "radial";
    data: any[];
    title?: string;
    description?: string;
    prismaQuery?: string;
  };
}

interface Map3DChatBoxProps {
  citiesList: string[];
  onCityDetected: (cityName: string, aiResponse: string) => void;
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
}

export function Map3DChatBox({
  citiesList,
  onCityDetected,
  onLegendActivate,
  onChartGenerated,
}: Map3DChatBoxProps) {
  const { provider } = useAIProvider();
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageIdCounter = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate unique message ID
  const generateMessageId = (prefix = "") => {
    messageIdCounter.current += 1;
    return `${prefix}${Date.now()}-${messageIdCounter.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour récupérer le nom de la ville depuis son code INSEE
  const getCityNameFromCode = async (inseeCode: string): Promise<string | null> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      // Utiliser la nouvelle route qui récupère directement par code INSEE
      const response = await fetch(`${backendUrl}/api/trois-d/cities/by-code/${inseeCode}`);
      if (!response.ok) {
        console.error(`Ville non trouvée pour le code INSEE: ${inseeCode}`);
        return null;
      }

      const city = await response.json();
      return city.name;
    } catch (error) {
      console.error("Erreur lors de la récupération du nom de la ville:", error);
      return null;
    }
  };

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

      const result = await aiAnswer(userMessage.content, history, provider);


      if (result.success && result.answer) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.loading);
          const responseMessage: Message = {
            id: generateMessageId("response-"),
            role: "assistant",
            content:
              result.answer ||
              "Désolé, je n'ai pas pu traiter votre question.",
            timestamp: new Date(),
            confidence: result.confidence || 0.85,
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

          return [...filtered, responseMessage];
        });

        // Activer automatiquement la légende si retournée par l'IA
        if (result.legendType && onLegendActivate) {
          console.log(
            `📊 Activation automatique de la légende: ${result.legendType}`,
          );
          onLegendActivate(result.legendType);
        }

        // Utiliser selected_codes pour détecter la ville

        if (result.selected_codes && result.selected_codes.length > 0) {
          const inseeCode = result.selected_codes[0];

          if (inseeCode === "06000") {
            console.log("Code 06000 détecté : question sur l'ensemble du département, pas de sélection de ville");
          } else {
            const cityName = await getCityNameFromCode(inseeCode);

            if (cityName) {
              onCityDetected(cityName, result.answer);
            }
          }
        }
      } else {
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.loading);
          return [
            ...filtered,
            {
              id: generateMessageId("error-"),
              role: "assistant",
              content:
                "Désolé, je n'ai pas pu traiter votre question.",
              timestamp: new Date(),
            },
          ];
        });
      }
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
            "⏱La requête a pris trop de temps. Le modèle IA est peut-être en train de démarrer ou surchargé. Veuillez patienter quelques instants et réessayer avec une question plus courte.";
        } else if (error.message.includes("500")) {
          errorMessage =
            "Erreur serveur. Le service IA n'est peut-être pas disponible. Vérifiez que Ollama est bien démarré.";
        } else if (error.message.includes("fetch")) {
          errorMessage =
            "Impossible de contacter le serveur. Vérifiez votre connexion.";
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-card border-border w-full border shadow-lg">
      <div className="border-border flex shrink-0 items-center gap-3 border-b p-4">
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

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user"
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
                    {message.confidence && (
                      <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                        <Sparkles className="h-3 w-3" />
                        <span>
                          Confiance:{" "}
                          {Math.round(
                            message.confidence *
                            100,
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

      {/* Input de question */}
      <div className="border-t border-border p-4">
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
      </div>
    </Card>
  );
}
