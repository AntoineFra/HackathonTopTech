import type { Request, Response } from "express";
import settingsService from "../services/settings.service.js";

export async function getSettings(req: Request, res: Response) {
    try {
        const s = await settingsService.getSettings();
        res.json({ success: true, settings: s });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: err?.message || String(err),
        });
    }
}

export async function updateSettings(req: Request, res: Response) {
    try {
        const body = req.body || {};
        // Validate aiTimeout if provided
        if (body.aiTimeout !== undefined) {
            const val = Number(body.aiTimeout);
            if (!Number.isFinite(val) || val < 0 || val > 10_000_000) {
                return res.status(400).json({
                    success: false,
                    error: "aiTimeout must be a positive number (ms) and reasonable",
                });
            }
            body.aiTimeout = Math.round(val);
        }

        const updated = await settingsService.updateSettings(body);
        res.json({ success: true, settings: updated });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: err?.message || String(err),
        });
    }
}
