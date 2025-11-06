import type { Request, Response } from "express";
import { dumpLegalUnit, dumpCities, getAllCities, type DumpResult } from "../services/dump.services.js";
import { prisma } from "../server.js";
import { DumpStatus } from "../generated/prisma/enums.js";

enum DumpType {
    LEGAL_UNITS = "legal_unit",
    CITIES = "cities",
}

enum DumpTypeFrench {
    LEGAL_UNITS = "Unités légales",
    CITIES = "Villes",
}

const DUMP_TYPE_LABELS: Record<DumpType, string> = {
    [DumpType.LEGAL_UNITS]: DumpTypeFrench.LEGAL_UNITS,
    [DumpType.CITIES]: DumpTypeFrench.CITIES,
};

type DumpFunction = () => Promise<DumpResult>;

const DUMP_HANDLERS: Record<DumpType, DumpFunction> = {
    [DumpType.LEGAL_UNITS]: () => dumpLegalUnit(),
    [DumpType.CITIES]: async () => dumpCities(await getAllCities("06")),
};

export async function getDumpList(req: Request, res: Response) {
    try {
        const dumps = await prisma.dump.findMany({ orderBy: { id: "asc" } });

        const dumpsForResponse = dumps.map((d: any) => ({
            ...d,
            label: DUMP_TYPE_LABELS[d.type as DumpType] ?? d.type,
        }));

        return res.json({ status: "ok", dumps: dumpsForResponse });
    } catch (err) {
        console.error("Error fetching dump list:", err);
        return res
            .status(500)
            .json({ error: "Failed to fetch dump info", message: String(err) });
    }
}

async function updateDumpStatus(dumpType: DumpType, status: DumpStatus, lastUpdate?: Date) {
    return prisma.dump.upsert({
        where: { type: dumpType as any },
        update: { status, ...(lastUpdate && { lastUpdate }) },
        create: { type: dumpType as any, status },
    });
}

async function executeDump(dumpType: DumpType): Promise<DumpResult> {
    const handler = DUMP_HANDLERS[dumpType];
    return await handler();
}

export async function dumpData(req: Request, res: Response) {
    const dumpType = req.params.dumpType as DumpType;

    if (!Object.values(DumpType).includes(dumpType)) {
        return res.status(400).json({ error: "Invalid dump type" });
    }

    try {
        await updateDumpStatus(dumpType, DumpStatus.EN_COURS);

        const dumpResult = await executeDump(dumpType);

        await updateDumpStatus(dumpType, DumpStatus.A_JOUR, new Date());

        return res.json({
            success: true,
            message: `${DUMP_TYPE_LABELS[dumpType]} dumped successfully`,
            data: dumpResult,
        });
    } catch (err) {
        console.error("Error during dump execution:", err);

        await updateDumpStatus(dumpType, DumpStatus.PAS_A_JOUR);

        return res.status(500).json({
            error: "Failed to run dump",
            details: String(err),
        });
    }
}
