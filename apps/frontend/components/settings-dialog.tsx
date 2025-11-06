"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings, Download, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiHealth } from "@/services/ai.services";
import { listDumps, getDump } from "@/services/dump.services";
import { getSettings, updateSettings } from "@/services/settings.services";

type DumpItem = {
    id: number;
    label: string;
    type: string;
    status: string;
    lastUpdate: string | null;
};

export default function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false); // DOM mounted
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const toggleRef = useRef<HTMLButtonElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    const [aiStatus, setAiStatus] = useState<
        "idle" | "loading" | "ok" | "error"
    >("idle");
    const [aiMessage, setAiMessage] = useState<string | null>(null);
    const [dumps, setDumps] = useState<DumpItem[]>([]);
    const [loadingDumps, setLoadingDumps] = useState(false);
    const [downloading, setDownloading] = useState<Record<string, boolean>>({});
    // track temporary download result per type: 'idle' | 'loading' | 'ok' | 'error'
    const [downloadResult, setDownloadResult] = useState<
        Record<string, "idle" | "loading" | "ok" | "error">
    >({});
    const [error, setError] = useState<string | null>(null);

    // New: settings (aiTimeout)
    const [aiTimeout, setAiTimeout] = useState<number | null>(null);
    const [editingAiTimeout, setEditingAiTimeout] = useState<string>("");
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

    // Animation duration must match CSS transition (ms)
    const TRANSITION_MS = 200;

    // mount/unmount DOM around open to allow transition
    useEffect(() => {
        if (open) {
            setMounted(true);
        } else {
            // unmount after transition
            const t = window.setTimeout(
                () => setMounted(false),
                TRANSITION_MS + 20,
            );
            return () => window.clearTimeout(t);
        }
    }, [open]);

    // when panel becomes mounted and open, focus the close button and fetch list
    useEffect(() => {
        if (mounted && open) {
            // focus close button
            setTimeout(() => closeButtonRef.current?.focus(), 0);
            void fetchDumps();
            void fetchSettings();
        }
    }, [mounted, open]);

    // handle Escape and click outside
    useEffect(() => {
        if (!mounted) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        function onDown(e: MouseEvent) {
            const target = e.target as Node | null;
            if (
                dialogRef.current &&
                target &&
                !dialogRef.current.contains(target) &&
                toggleRef.current !== target
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
        };
    }, [mounted]);

    async function fetchDumps() {
        setLoadingDumps(true);
        setError(null);
        try {
            const res = await listDumps();
            if (res?.status === "ok" && Array.isArray(res.dumps)) {
                setDumps(res.dumps);
            } else {
                setError("Réponse inattendue du serveur");
            }
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            setLoadingDumps(false);
        }
    }

    // New: fetch settings from backend
    async function fetchSettings() {
        setSettingsMessage(null);
        try {
            const res = await getSettings();
            if (res?.settings && typeof res.settings.aiTimeout === "number") {
                setAiTimeout(res.settings.aiTimeout);
                setEditingAiTimeout(String(res.settings.aiTimeout));
            }
        } catch (e: any) {
            // non-blocking: display a message in the UI
            setSettingsMessage("Impossible de récupérer les paramètres");
        }
    }

    async function checkAi() {
        setAiStatus("loading");
        setAiMessage(null);
        try {
            const res = await aiHealth();
            if (res?.status === "ok") {
                setAiStatus("ok");
                setAiMessage("IA disponible");
            } else {
                setAiStatus("error");
                setAiMessage("IA indisponible");
            }
        } catch (e: any) {
            setAiStatus("error");
            setAiMessage(e?.message ?? String(e));
        }
    }

    async function handleDownload(type: string) {
        setDownloading((s) => ({ ...s, [type]: true }));
        setDownloadResult((s) => ({ ...s, [type]: "loading" }));
        setError(null);
        try {
            const dumpRes = await getDump(type);
            // If the server sends a `data` field, export that only
            const contentToExport = dumpRes?.data ?? dumpRes;
            if (contentToExport) {
                const blob = new Blob(
                    [JSON.stringify(contentToExport, null, 2)],
                    {
                        type: "application/json",
                    },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${type}-export.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } else if (dumpRes?.url) {
                const a = document.createElement("a");
                a.href = dumpRes.url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                const blob = new Blob([JSON.stringify(dumpRes, null, 2)], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${type}-export.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
            // refresh
            await fetchDumps();
            // mark success briefly (server listDumps may update the status)
            setDownloadResult((s) => ({ ...s, [type]: "ok" }));
            window.setTimeout(
                () => setDownloadResult((s) => ({ ...s, [type]: "idle" })),
                2500,
            );
        } catch (e: any) {
            setError(e?.message ?? String(e));
            // mark error so the dot becomes error-colored briefly
            setDownloadResult((s) => ({ ...s, [type]: "error" }));
            window.setTimeout(
                () => setDownloadResult((s) => ({ ...s, [type]: "idle" })),
                5000,
            );
        } finally {
            setDownloading((s) => ({ ...s, [type]: false }));
        }
    }

    // New: save settings
    async function saveSettings() {
        setSavingSettings(true);
        setSettingsMessage(null);
        const parsed = Number(editingAiTimeout);
        if (!Number.isFinite(parsed) || parsed < 0) {
            setSettingsMessage("La valeur doit être un nombre positif en ms");
            setSavingSettings(false);
            return;
        }
        try {
            const res = await updateSettings({ aiTimeout: Math.round(parsed) });
            if (res?.settings && typeof res.settings.aiTimeout === "number") {
                setAiTimeout(res.settings.aiTimeout);
                setEditingAiTimeout(String(res.settings.aiTimeout));
                setSettingsMessage("Paramètres sauvegardés");
                // hide the message after a short delay
                setTimeout(() => setSettingsMessage(null), 2000);
            } else {
                setSettingsMessage("Réponse inattendue du serveur");
            }
        } catch (e: any) {
            setSettingsMessage(e?.message ?? String(e));
        } finally {
            setSavingSettings(false);
        }
    }

    function renderStatusDot(status: string, type?: string) {
        // precedence: transient downloadResult -> downloading (EN_COURS) -> server status
        if (type) {
            const dr = downloadResult[type];
            if (dr === "loading") {
                return (
                    <span
                        title="En cours"
                        className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-orange-400"
                    />
                );
            }
            if (dr === "ok") {
                return (
                    <span
                        title="Téléchargement réussi"
                        className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500"
                    />
                );
            }
            if (dr === "error") {
                return (
                    <span
                        title="Erreur"
                        className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-red-700"
                    />
                );
            }
            if (downloading[type]) {
                return (
                    <span
                        title="En cours"
                        className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-orange-400"
                    />
                );
            }
        }

        const statusColorMap: Record<string, string> = {
            A_JOUR: "bg-green-500",
            EN_COURS: "bg-yellow-500",
            PAS_A_JOUR: "bg-red-500",
            ERROR: "bg-red-900",
        };
        const statusTextMap: Record<string, string> = {
            A_JOUR: "À jour",
            EN_COURS: "En cours",
            PAS_A_JOUR: "Pas à jour",
            ERROR: "Erreur",
        };
        const title = statusTextMap[status] ?? "Inconnu";
        const cls = statusColorMap[status] ?? "bg-gray-400";
        return (
            <span
                title={title}
                className={`inline-flex h-3 w-3 items-center justify-center rounded-full ${cls}`}
            />
        );
    }

    return (
        <div className="relative">
            <Button
                ref={toggleRef as any}
                variant="ghost"
                size="icon"
                onClick={() => {
                    // si on ouvre : monter le DOM d'abord, puis activer open dans le prochain frame
                    if (!open) {
                        if (!mounted) setMounted(true);
                        // delay d'une frame pour laisser le DOM être peint en état fermé, puis activer
                        requestAnimationFrame(() => setOpen(true));
                        return;
                    }
                    // si on ferme, on désactive immédiatement l'état open (la destruction du DOM suit après transition)
                    setOpen(false);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={
                    open ? "Fermer les paramètres" : "Ouvrir les paramètres"
                }
                className="h-9 w-9"
            >
                <Settings className="h-4 w-4" />
            </Button>

            {mounted && (
                <div
                    ref={dialogRef}
                    role={open ? "dialog" : undefined}
                    aria-modal={open ? "true" : undefined}
                    className={`bg-background dark:bg-card absolute right-0 z-50 mt-2 w-[360px] transform rounded-md border p-4 shadow-lg transition-all duration-200 ease-out ${
                        open
                            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                    }`}
                    onTransitionEnd={(e) => {
                        if (e.currentTarget === dialogRef.current && !open) {
                            setMounted(false);
                        }
                    }}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Paramètres</h3>
                        <Button
                            ref={closeButtonRef as any}
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                        >
                            Fermer
                        </Button>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-medium">
                                    Vérifier le status de l'IA
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Cliquez pour tester la connectivité
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {aiStatus === "loading" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : aiStatus === "ok" ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                ) : aiStatus === "error" ? (
                                    <span className="h-3 w-3 rounded-full bg-red-500" />
                                ) : null}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={checkAi}
                                >
                                    Vérifier
                                </Button>
                            </div>
                        </div>
                        {aiMessage && (
                            <div className="mt-2 text-xs">{aiMessage}</div>
                        )}

                        {/* New: AI timeout setting */}
                        <div className="mt-4 border-t pt-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-medium">
                                        Timeout IA (ms)
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        Temps maximum d'attente pour les
                                        requêtes IA
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        className="w-28 rounded-md border px-2 py-1 text-sm"
                                        type="number"
                                        min={0}
                                        value={editingAiTimeout}
                                        onChange={(e) =>
                                            setEditingAiTimeout(e.target.value)
                                        }
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={saveSettings}
                                        disabled={savingSettings}
                                    >
                                        {savingSettings ? "..." : "Enregistrer"}
                                    </Button>
                                </div>
                            </div>
                            {settingsMessage && (
                                <div className="mt-2 text-xs">
                                    {settingsMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-medium">
                                    Exportations
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Liste des exportations disponibles
                                </div>
                            </div>
                            <div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fetchDumps()}
                                >
                                    {loadingDumps
                                        ? "Actualisation..."
                                        : "Rafraîchir"}
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[300px] space-y-2 overflow-auto">
                            {loadingDumps && (
                                <div className="text-xs">Chargement...</div>
                            )}
                            {error && (
                                <div className="text-xs text-red-500">
                                    {error}
                                </div>
                            )}
                            {!loadingDumps && dumps.length === 0 && (
                                <div className="text-muted-foreground text-xs">
                                    Aucune exportation trouvée
                                </div>
                            )}

                            {dumps.map((d) => (
                                <div
                                    key={d.id}
                                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                                >
                                    <div className="flex items-center gap-2">
                                        {renderStatusDot(d.status, d.type)}
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium">
                                                {d.label}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {d.lastUpdate
                                                    ? new Date(
                                                          d.lastUpdate,
                                                      ).toLocaleString()
                                                    : "Jamais"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDownload(d.type)
                                            }
                                            disabled={downloading[d.type]}
                                        >
                                            {downloading[d.type] ? (
                                                "Téléchargement..."
                                            ) : (
                                                <>
                                                    <Download className="h-4 w-4" />{" "}
                                                    Télécharger
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
