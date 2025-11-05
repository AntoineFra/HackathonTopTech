import { QueryInterface } from "@/components/query-interface";

export default function Home() {
    return (
        <div className="from-background to-secondary/20 min-h-screen bg-gradient-to-b">
            <div className="pointer-events-none fixed right-0 bottom-4 left-0 flex justify-center px-4">
                <div className="pointer-events-auto w-full max-w-7xl">
                    <QueryInterface />
                </div>
            </div>
        </div>
    );
}
