"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme();

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                aria-label="Basculer le thème"
                className="relative h-9 w-9 rounded-md"
                disabled
            >
                <div className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Basculer le thème</span>
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Passer en mode ${theme === "light" ? "sombre" : "clair"}`}
            className="relative h-9 w-9 rounded-md"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Basculer le thème</span>
        </Button>
    );
}
