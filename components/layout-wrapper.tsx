"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Routes where we don't want navbar and footer
    const hideLayout = pathname === "/chat" || pathname === "/map-chat";

    if (hideLayout) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar sticky />
            {children}
            <Footer />
        </>
    );
}
