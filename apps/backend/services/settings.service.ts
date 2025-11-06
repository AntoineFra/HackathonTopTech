import fs from "fs/promises";
import path from "path";

const SETTINGS_PATH = path.resolve(process.cwd(), "settings.json");

export interface AppSettings {
    aiTimeout: number; // en millisecondes
}

const DEFAULT_SETTINGS: AppSettings = {
    aiTimeout: parseInt(process.env.OLLAMA_TIMEOUT || "30000", 10),
};

async function ensureDefaults(): Promise<void> {
    try {
        await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
        // If file doesn't exist, write defaults
        try {
            await fs.access(SETTINGS_PATH);
            console.log(
                `[Settings Service] Settings file exists at ${SETTINGS_PATH}`,
            );
            // exists -> nothing to do
        } catch (e) {
            await fs.writeFile(
                SETTINGS_PATH,
                JSON.stringify(DEFAULT_SETTINGS, null, 2),
                "utf-8",
            );
            console.log(
                `[Settings Service] Created default settings at ${SETTINGS_PATH}`,
            );
        }
    } catch (err) {
        console.warn("[Settings Service] Could not ensure settings file:", err);
    }
}

async function readSettings(): Promise<AppSettings> {
    try {
        const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        return {
            aiTimeout:
                typeof parsed.aiTimeout === "number"
                    ? parsed.aiTimeout
                    : DEFAULT_SETTINGS.aiTimeout,
        };
    } catch (err) {
        // If anything goes wrong, return defaults
        return { ...DEFAULT_SETTINGS };
    }
}

async function writeSettings(s: AppSettings): Promise<void> {
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(s, null, 2), "utf-8");
}

export async function getSettings(): Promise<AppSettings> {
    return await readSettings();
}

export async function getAITimeout(): Promise<number> {
    const s = await readSettings();
    return s.aiTimeout;
}

export async function updateSettings(
    partial: Partial<AppSettings>,
): Promise<AppSettings> {
    const current = await readSettings();
    const next: AppSettings = {
        ...current,
        ...partial,
    };
    await writeSettings(next);
    return next;
}

export default {
    ensureDefaults,
    getSettings,
    getAITimeout,
    updateSettings,
};
