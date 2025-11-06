"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot, X, MessageSquare } from "lucide-react";
import { aiAnswer, type ChatMessage } from "@/services/ai.services";

interface Map3DChatBoxProps {
  citiesList: string[];
  onCityDetected: (cityName: string, aiResponse: string) => void;
}

export function Map3DChatBox({ citiesList, onCityDetected }: Map3DChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const detectCityInResponse = (response: string): string | null => {
    // Normaliser la réponse pour la recherche
    const normalizedResponse = response.toLowerCase();

    // Chercher chaque ville dans la réponse
    for (const city of citiesList) {
      const normalizedCity = city.toLowerCase();
      // Chercher la ville en tant que mot entier
      const regex = new RegExp(`\\b${normalizedCity}\\b`, 'i');
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
          content: "Je suis un assistant spécialisé dans les données des communes des Alpes-Maritimes (département 06).",
        },
      ];

      const result = await aiAnswer(userQuestion, history);

      if (result.success && result.answer) {
        setLastResponse(result.answer);

        // Détecter la ville dans la réponse
        const detectedCity = detectCityInResponse(result.answer);

        if (detectedCity) {
          console.log(`🏙️ Ville détectée dans la réponse: ${detectedCity}`);
          onCityDetected(detectedCity, result.answer);
        } else {
          console.log("ℹ️ Aucune ville détectée dans la réponse");
        }
      } else {
        setLastResponse("Désolé, je n'ai pas pu traiter votre question.");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setLastResponse("Désolé, une erreur s'est produite. Veuillez réessayer.");
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        size="lg"
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Poser une question à l'IA
      </Button>
    );
  }

  return (
    <Card className="w-full bg-card border border-border shadow-lg">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
            <Bot className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Assistant IA</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {/* Réponse de l'IA */}
        {lastResponse && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {lastResponse}
            </p>
          </div>
        )}

        {/* Zone de chargement */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Réflexion en cours...</span>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Quelle est la population à Nice ?"
            disabled={isLoading}
            className="max-h-24 min-h-10 flex-1 resize-none"
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

        <p className="text-muted-foreground text-xs text-center">
          Posez une question sur les communes du 06
        </p>
      </div>
    </Card>
  );
}
