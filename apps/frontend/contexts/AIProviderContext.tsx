"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type AIProvider = "ollama" | "gemini" | "local";

interface AIProviderContextType {
    provider: AIProvider;
    setProvider: (provider: AIProvider) => void;
}

const AIProviderContext = createContext<AIProviderContextType | undefined>(
    undefined,
);

export function AIProviderProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [provider, setProvider] = useState<AIProvider>("gemini");

    // Charger la préférence depuis localStorage au montage
    useEffect(() => {
        const saved = localStorage.getItem("ai-provider");
        if (saved === "ollama" || saved === "gemini" || saved === "local") {
            setProvider(saved);
        }
    }, []);

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem("ai-provider", provider);
    }, [provider]);

    return (
        <AIProviderContext.Provider value={{ provider, setProvider }}>
            {children}
        </AIProviderContext.Provider>
    );
}

export function useAIProvider() {
    const context = useContext(AIProviderContext);
    if (context === undefined) {
        throw new Error("useAIProvider must be used within AIProviderProvider");
    }
    return context;
}
