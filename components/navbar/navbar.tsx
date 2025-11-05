"use client";

import { useState } from "react";
import Link from "next/link";

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
    cta,
    sticky = false,
}) => {
    const [open, setOpen] = useState(false);

    return (
        <header className={`w-full bg-white border-b ${sticky ? 'sticky top-0 z-60 backdrop-blur-md' : ''}`}>
            <div className="max-w-[1100px] mx-auto px-4 py-2 flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-900 font-semibold text-base" aria-label="Homepage">
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
                                    <rect x="3" y="3" width="18" height="18" rx="4" fill="#2563eb" />
                                    <path d="M7 12h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M12 7v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <span className="hidden md:inline-block">PACA Analytics</span>
                            </>
                        )}
                    </Link>

                    <button
                        className="p-1 inline-flex items-center justify-center md:hidden focus:outline-none focus:ring-2 focus:ring-sky-300 rounded-md"
                        aria-expanded={open}
                        aria-label={open ? "Close menu" : "Open menu"}
                        onClick={() => setOpen((s) => !s)}
                    >
                        <span className="sr-only">Menu</span>
                        <span className={`block h-0.5 w-5 bg-slate-900 transition-all duration-200 ${open ? 'translate-y-1.5 rotate-45' : '-translate-y-1.5'}`} />
                        <span className={`block h-0.5 w-5 bg-slate-900 my-1 transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`block h-0.5 w-5 bg-slate-900 transition-all duration-200 ${open ? '-translate-y-1.5 -rotate-45' : 'translate-y-1.5'}`} />
                    </button>
                </div>

                <nav className={`${open ? 'block absolute left-0 right-0 top-16 bg-white border-b z-50 p-4' : 'hidden'} md:block md:static md:pl-4`} aria-label="Primary navigation">
                    <ul className={`m-0 p-0 list-none flex ${open ? 'flex-col gap-2' : 'gap-4'} items-center md:flex-row md:gap-4`}
                    >
                        {links.map((l) => (
                            <li key={l.href}>
                                {l.external ? (
                                    <a
                                        className="text-slate-900 px-2 py-1 rounded-md font-medium text-sm hover:bg-slate-100"
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
                                        className="text-slate-900 px-2 py-1 rounded-md font-medium text-sm hover:bg-slate-100"
                                        onClick={() => setOpen(false)}
                                    >
                                        {l.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
