import "dotenv/config";
import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import morgan from "morgan";
import registerRoutes from "./routes/routes.js";
import fs from "fs/promises";
import cors from "cors";

const app = express();
export const prisma = new PrismaClient();

// Créer les dossiers temporaires
await fs.mkdir("tmp", { recursive: true });
await fs.mkdir("data", { recursive: true });

// Initialiser les entrées de dump si nécessaire
try {
    const types = ["legal_unit", "cities", "population"];
    for (const t of types) {
        await prisma.dump.upsert({
            where: { type: t as any },
            update: {},
            create: { type: t as any, status: "PAS_A_JOUR" },
        });
    }
} catch (e) {
    console.warn("Could not initialize dump entries:", e);
}

app.use(express.json());
// Keep only console (dev) logger
app.use(morgan("dev"));
app.use(
    cors({
        origin: [
            "http://localhost:8080",
            "http://localhost:3000",
            "http://frontend:3000",
            // Docker network addresses (peuvent changer selon l'allocation IP)
            /^http:\/\/192\.168\.\d+\.\d+:8080$/,
            /^http:\/\/172\.\d+\.\d+\.\d+:8080$/,
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    }),
);

// Register application routes (centralized)
registerRoutes(app);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        error: "Not Found",
        message: `Route ${req.originalUrl} not found`,
    });
});

// Centralized error handler
app.use(
    (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        console.error(err);
        const status = err?.status || 500;
        res.status(status).json({
            status,
            error: err?.name || "Internal Server Error",
            message: err?.message || "An unexpected error occurred",
        });
    },
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
    try {
        // Set any EN_COURS dumps back to PAS_A_JOUR on shutdown
        const db: any = prisma;
        await db.dump.updateMany({
            where: { status: "EN_COURS" },
            data: { status: "PAS_A_JOUR" },
        });
    } catch (e) {
        console.warn("Error updating dumps on shutdown:", e);
    }
    await prisma.$disconnect();
    process.exit(0);
});
