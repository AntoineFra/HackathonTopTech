import { QueryInterface } from "@/components/query-interface";

export default function Home() {
    return (
        <div className="from-background to-secondary/20 min-h-screen bg-gradient-to-b">
            <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-none">
                <div className="w-full max-w-7xl pointer-events-auto">
                    <QueryInterface />
                </div>
            </div>
        </div>
    );
}
