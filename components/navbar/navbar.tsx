"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type NavLink = {
    label: string;
    href: string;
    external?: boolean;
};

type NavbarProps = {
    brand?: React.ReactNode;
    links?: NavLink[];
    cta?: { label: string; href: string };
    sticky?: boolean;
};

const defaultLinks: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Chat", href: "/chat" },
    { label: "Contact", href: "/contact" },
];

const Navbar: React.FC<NavbarProps> = ({
    brand,
    links = defaultLinks,
    sticky = false,
}) => {
    const [open, setOpen] = useState(false);

    return (
        <header
            className={`bg-background dark:bg-card flex h-[var(--header-height)] w-full items-center border-b ${sticky ? "sticky top-0 z-60 backdrop-blur-md" : ""}`}
        >
            <div className="mx-auto flex h-full max-w-[1100px] items-center gap-4 px-4 py-2">
                <div className="flex flex-1 items-center gap-3">
                    <Link
                        href="/"
                        className="text-foreground inline-flex items-center gap-2 text-base font-semibold"
                        aria-label="Homepage"
                    >
                        {brand ?? (
                            <>
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="4"
                                        fill="#2563eb"
                                    />
                                    <path
                                        d="M7 12h10"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M12 7v10"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="hidden md:inline-block">
                                    PACA Analytics
                                </span>
                            </>
                        )}
                    </Link>

                    <button
                        className="text-foreground inline-flex items-center justify-center rounded-md p-1 focus:ring-2 focus:ring-sky-300 focus:outline-none md:hidden"
                        aria-expanded={open}
                        aria-label={open ? "Close menu" : "Open menu"}
                        onClick={() => setOpen((s) => !s)}
                    >
                        <span className="sr-only">Menu</span>
                        <span
                            className={`bg-foreground block h-0.5 w-5 transition-all duration-200 ${open ? "translate-y-1.5 rotate-45" : "-translate-y-1.5"}`}
                        />
                        <span
                            className={`bg-foreground my-1 block h-0.5 w-5 transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`}
                        />
                        <span
                            className={`bg-foreground block h-0.5 w-5 transition-all duration-200 ${open ? "-translate-y-1.5 -rotate-45" : "translate-y-1.5"}`}
                        />
                    </button>
                </div>

                <nav
                    className={`${open ? "bg-background dark:bg-card absolute top-[var(--header-height)] right-0 left-0 z-50 block border-b p-4" : "hidden"} md:static md:block md:pl-4`}
                    aria-label="Primary navigation"
                >
                    <ul
                        className={`m-0 flex list-none p-0 ${open ? "flex-col gap-2" : "gap-4"} items-center md:flex-row md:gap-4`}
                    >
                        {links.map((l) => (
                            <li key={l.href}>
                                {l.external ? (
                                    <a
                                        className="text-foreground hover:bg-accent rounded-md px-2 py-1 text-sm font-medium"
                                        href={l.href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        onClick={() => setOpen(false)}
                                    >
                                        {l.label}
                                    </a>
                                ) : (
                                    <Link
                                        href={l.href}
                                        className="text-foreground hover:bg-accent rounded-md px-2 py-1 text-sm font-medium"
                                        onClick={() => setOpen(false)}
                                    >
                                        {l.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                        <li>
                            <ThemeToggle />
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
