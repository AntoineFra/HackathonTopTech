import type { Request, Response } from "express";
import { dumpLegalUnit, dumpCities } from "../services/dump.services.js";
import * as dump_srvc from "../services/dump.services.js";
import { prisma } from "../server.js";

enum DumpType {
    LEGAL_UNITS = "legal_unit",
    CITIES = "cities",
}

enum DumpTypeFrench {
    LEGAL_UNITS = "Unités légales",
    CITIES = "Villes",
}

export async function getDumpList(req: Request, res: Response) {
    try {
        const db: any = prisma;
        const dumps = await db.dump.findMany({ orderBy: { id: "asc" } });

        // Map DB dump.type values to their French display names for the response only
        const typeToFrench: Record<string, string> = {
            [DumpType.LEGAL_UNITS]: DumpTypeFrench.LEGAL_UNITS,
            [DumpType.CITIES]: DumpTypeFrench.CITIES,
        };

        const dumpsForResponse = dumps.map((d: any) => ({
            ...d,
            label: typeToFrench[d.type] ?? d.type,
        }));

        return res.json({ status: "ok", dumps: dumpsForResponse });
    } catch (err) {
        console.error("Error fetching dump list:", err);
        return res
            .status(500)
            .json({ error: "Failed to fetch dump info", message: String(err) });
    }
}

export async function dumpData(req: Request, res: Response) {
    try {
        const dumpType = req.params.dumpType as DumpType;
        const validTypes = Object.values(DumpType);

        if (!validTypes.includes(dumpType)) {
            return res.status(400).json({ error: "Invalid dump type" });
        }

        const db: any = prisma;
        // Mark dump as "EN_COURS"
        await db.dump.upsert({
            where: { type: dumpType as any },
            update: { status: "EN_COURS" },
            create: { type: dumpType as any, status: "EN_COURS" },
        });

        const dumpFunctionMap: { [key in DumpType]: () => Promise<void> } = {
            [DumpType.LEGAL_UNITS]: async () => dumpLegalUnit(),
            [DumpType.CITIES]: async () =>
                dumpCities(await dump_srvc.getAllCities("06")),
        };

        try {
            await dumpFunctionMap[dumpType]();

            await db.dump.update({
                where: { type: dumpType as any },
                data: { status: "A_JOUR", lastUpdate: new Date() },
            });

            return res.json({
                success: true,
                message: `${dumpType} dumped successfully`,
            });
        } catch (innerErr) {
            console.error("Error during dump execution:", innerErr);
            // on error set to PAS_A_JOUR
            await db.dump.update({
                where: { type: dumpType as any },
                data: { status: "PAS_A_JOUR" },
            });
            return res.status(500).json({
                error: "Failed to run dump",
                details: String(innerErr),
            });
        }
    } catch (err) {
        console.log("Error during dumpData:", err);
        return res
            .status(500)
            .json({ error: "Failed to dump database", details: err });
    }
}
