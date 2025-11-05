"use client";

import React, { useState, useEffect } from "react";
import { Settings, Download, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiHealth } from "@/services/ai.services";
import { listDumps, getDump } from "@/services/dump.services";

type DumpItem = {
  id: number;
  type: string;
  status: string;
  lastUpdate: string | null;
};

export default function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [dumps, setDumps] = useState<DumpItem[]>([]);
  const [loadingDumps, setLoadingDumps] = useState(false);
  const [downloading, setDownloading] = useState<{ [k: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchDumps();
    }
  }, [open]);

  async function fetchDumps() {
    setLoadingDumps(true);
    setError(null);
    try {
      const res = await listDumps();
      if (res?.status === "ok" && Array.isArray(res.dumps)) {
        setDumps(res.dumps);
      } else {
        setError("Unexpected response from server");
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoadingDumps(false);
    }
  }

  async function checkAi() {
    setAiStatus("loading");
    setAiMessage(null);
    try {
      const res = await aiHealth();
      // assume res has { status: 'ok' } or similar
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
    setError(null);
    try {
      const dumpRes = await getDump(type);
      // assume dumpRes contains file data or url. We'll try to create a blob if data.
      if (dumpRes?.data) {
        const blob = new Blob([JSON.stringify(dumpRes.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-dump.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (dumpRes?.url) {
        // server provided a URL
        const a = document.createElement("a");
        a.href = dumpRes.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // fallback: save whole response
        const blob = new Blob([JSON.stringify(dumpRes, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-dump.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      // refresh list after download
      await fetchDumps();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setDownloading((s) => ({ ...s, [type]: false }));
    }
  }

  function renderStatusDot(status: string) {
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
      <span title={title} className={`inline-flex h-3 w-3 items-center justify-center rounded-full ${cls}`} />
    );
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen((s) => !s)} aria-label="Ouvrir les paramètres" className="h-9 w-9">
        <Settings className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[360px] rounded-md border bg-background p-4 shadow-lg dark:bg-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Paramètres</h3>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Fermer</Button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium">Vérifier le status de l'IA</div>
                <div className="text-xs text-muted-foreground">Cliquez pour tester la connectivité</div>
              </div>
              <div className="flex items-center gap-2">
                {aiStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : aiStatus === "ok" ? <Check className="h-4 w-4 text-emerald-500" /> : aiStatus === "error" ? <span className="h-3 w-3 rounded-full bg-red-500" /> : null}
                <Button variant="ghost" size="sm" onClick={checkAi}>Vérifier</Button>
              </div>
            </div>
            {aiMessage && <div className="mt-2 text-xs">{aiMessage}</div>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium">Dumps</div>
                <div className="text-xs text-muted-foreground">Liste des dumps disponibles</div>
              </div>
              <div>
                <Button variant="ghost" size="sm" onClick={fetchDumps}>{loadingDumps ? "Actualisation..." : "Rafraîchir"}</Button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-auto space-y-2">
              {loadingDumps && <div className="text-xs">Chargement...</div>}
              {error && <div className="text-xs text-red-500">{error}</div>}
              {!loadingDumps && dumps.length === 0 && <div className="text-xs text-muted-foreground">Aucun dump trouvé</div>}

              {dumps.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    {renderStatusDot(d.status)}
                    <div className="flex flex-col">
                      <div className="text-sm font-medium">{d.type}</div>
                      <div className="text-xs text-muted-foreground">{d.lastUpdate ? new Date(d.lastUpdate).toLocaleString() : "Jamais"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(d.type)} disabled={downloading[d.type]}>
                      {downloading[d.type] ? "Téléchargement..." : <><Download className="h-4 w-4" /> Télécharger</>}
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
