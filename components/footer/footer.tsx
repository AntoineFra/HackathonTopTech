"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t bg-background/50 dark:bg-background/60">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    {/* Brand / Logo */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <Link href="/" aria-label="Homepage" className="inline-flex items-center gap-2">
                            <span className="inline-block rounded-md bg-primary/10 p-2">
                                {/* simple mark */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                                    <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                            <span className="font-semibold">PACA Analytics</span>
                        </Link>

                        <p className="text-sm text-muted-foreground">
                            Portail de données socio-démographiques des Alpes-Maritimes (06)
                        </p>
                    </div>

                    {/* Links */}
                    <nav aria-label="Footer" className="flex flex-wrap gap-6">
                        <div className="flex flex-col">
                            <span className="mb-2 text-sm font-medium">Products</span>
                            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">
                                Features
                            </Link>
                            <Link href="/pricing" className="mt-1 text-sm text-muted-foreground hover:text-foreground">
                                Pricing
                            </Link>
                        </div>

                        <div className="flex flex-col">
                            <span className="mb-2 text-sm font-medium">Company</span>
                            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                                About
                            </Link>
                            <Link href="/careers" className="mt-1 text-sm text-muted-foreground hover:text-foreground">
                                Careers
                            </Link>
                        </div>

                        <div className="flex flex-col">
                            <span className="mb-2 text-sm font-medium">Support</span>
                            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
                                Docs
                            </Link>
                            <Link href="/contact" className="mt-1 text-sm text-muted-foreground hover:text-foreground">
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
                            <label htmlFor="footer-newsletter" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="footer-newsletter"
                                name="email"
                                type="email"
                                required
                                placeholder="Your email"
                                className="flex-1 rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground bg-transparent focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
                            >
                                Subscribe
                            </button>
                        </form>

                        <div className="flex items-center gap-3">
                            <a
                                href="https://github.com"
                                aria-label="GitHub"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md p-2 text-muted-foreground hover:text-foreground"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href="https://twitter.com"
                                aria-label="Twitter"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md p-2 text-muted-foreground hover:text-foreground"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href="mailto:hello@example.com"
                                aria-label="Email"
                                className="rounded-md p-2 text-muted-foreground hover:text-foreground"
                            >
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-muted-foreground">&copy; {year} YourApp. All rights reserved.</p>
                        <div className="flex gap-4 text-sm">
                            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                                Terms
                            </Link>
                            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                                Privacy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
