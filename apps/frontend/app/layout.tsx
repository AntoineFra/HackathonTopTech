import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { AIProviderProvider } from "@/contexts/AIProviderContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Portail des Données - Alpes-Maritimes (06)",
    description:
        "Explorateur de données socio-démographiques du territoire Nice Côte d'Azur",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    if (!theme) {
                                        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                    }
                                    if (theme === 'dark') {
                                        document.documentElement.classList.add('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider>
                    <AIProviderProvider>
                        <LayoutWrapper>{children}</LayoutWrapper>
                    </AIProviderProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
