import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatInterface } from "@/components/chat-interface";
import { LucideArrowLeft } from "lucide-react";

export default function Home() {
    return (
        <>
            <header
                className={`bg-background dark:bg-card sticky top-6 left-6 z-60 mt-6 ml-6 flex h-[var(--header-height)] w-fit items-center rounded-2xl border backdrop-blur-md`}
            >
                <div className="mr-auto flex h-full items-center gap-4 px-4 py-2">
                    <div className="flex flex-1 items-center gap-3">
                        <Link
                            href="/"
                            className="text-foreground inline-flex items-center gap-2 text-base font-semibold"
                            aria-label="Homepage"
                        >
                            <LucideArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <div className="from-background to-secondary/20 fixed inset-0 bg-gradient-to-b">
                {/* Minimalist background pattern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, currentColor 1.5px, transparent 1.5px),
                            linear-gradient(to bottom, currentColor 1.5px, transparent 1.5px)
                        `,
                        backgroundSize: "80px 80px",
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />

                <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col px-4 py-6">
                    <ChatInterface />
                </div>
            </div>
        </>
    );
}
