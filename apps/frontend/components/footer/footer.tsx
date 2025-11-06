"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-background/50 dark:bg-background/60 border-t">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    {/* Brand / Logo */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link
                            href="/"
                            aria-label="Accueil"
                            className="inline-flex items-center gap-2"
                        >
                            <span className="bg-primary/10 inline-block rounded-md p-2">
                                {/* simple mark */}
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-primary"
                                >
                                    <path
                                        d="M3 12h18"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M12 3v18"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                            <span className="font-semibold">
                                PACA Analytics
                            </span>
                        </Link>

                        <p className="text-muted-foreground text-sm">
                            Portail de données socio-démographiques des
                            Alpes-Maritimes (06)
                        </p>
                    </div>

                    {/* Links */}
                    <nav
                        aria-label="Pied de page"
                        className="flex flex-wrap gap-6"
                    >
                        <div className="flex flex-col">
                            <span className="mb-2 text-sm font-medium">
                                Produits
                            </span>
                            <Link
                                href="/features"
                                className="text-muted-foreground hover:text-foreground text-sm"
                            >
                                Fonctionnalités
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-muted-foreground hover:text-foreground mt-1 text-sm"
                            >
                                Tarifs
                            </Link>
                        </div>

                        <div className="flex flex-col">
                            <span className="mb-2 text-sm font-medium">
                                Entreprise
                            </span>
                            <Link
                                href="/about"
                                className="text-muted-foreground hover:text-foreground text-sm"
                            >
                                À propos
                            </Link>
                            <Link
                                href="/careers"
                                className="text-muted-foreground hover:text-foreground mt-1 text-sm"
                            >
                                Recrutement
                            </Link>
                        </div>

                        <div className="flex flex-col">
                            <span className="mb-2 text-sm font-medium">
                                Support
                            </span>
                            <Link
                                href="/docs"
                                className="text-muted-foreground hover:text-foreground text-sm"
                            >
                                Documentation
                            </Link>
                            <Link
                                href="/contact"
                                className="text-muted-foreground hover:text-foreground mt-1 text-sm"
                            >
                                Contact
                            </Link>
                        </div>
                    </nav>

                    {/* Newsletter / Social */}
                    <div className="flex flex-col items-start gap-3">
                        <form
                            className="flex w-full max-w-sm items-center gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                // handle subscribe — replace with real logic
                                const form = e.currentTarget as HTMLFormElement;
                                const data = new FormData(form);
                                const email = data.get("email");
                                console.log("subscribe:", email);
                            }}
                        >
                            <label
                                htmlFor="footer-newsletter"
                                className="sr-only"
                            >
                                Adresse e-mail
                            </label>
                            <input
                                id="footer-newsletter"
                                name="email"
                                type="email"
                                required
                                placeholder="Votre e-mail"
                                className="placeholder:text-muted-foreground flex-1 rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium hover:opacity-95"
                            >
                                S'abonner
                            </button>
                        </form>

                        <div className="flex items-center gap-3">
                            <a
                                href="https://github.com"
                                aria-label="GitHub"
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground rounded-md p-2"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href="https://twitter.com"
                                aria-label="Twitter"
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground rounded-md p-2"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href="mailto:hello@example.com"
                                aria-label="E-mail"
                                className="text-muted-foreground hover:text-foreground rounded-md p-2"
                            >
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-muted-foreground text-sm">
                            &copy; {year} PACA Analytics. Tous droits réservés.
                        </p>
                        <div className="flex gap-4 text-sm">
                            <Link
                                href="/terms"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Conditions
                            </Link>
                            <Link
                                href="/privacy"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Confidentialité
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
