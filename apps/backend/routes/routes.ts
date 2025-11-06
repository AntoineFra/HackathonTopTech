import type { Express } from "express";
import { PrismaClient } from "../generated/prisma/client.js";

import dumpRoutes from "./dump.routes.js";
import usersRoutes from "./users.routes.js";
import aiRoutes from "./ai.routes.js";
import troisDRoutes from "./trois-d.routes.js";

export default function registerRoutes(app: Express) {
    // Mount grouped routes under their base paths
    app.use("/api/dump", dumpRoutes);
    app.use("/api/users", usersRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/trois-d", troisDRoutes);

}
