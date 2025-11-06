import { apiFetch } from "@/services/api";

export async function getSettings() {
    return apiFetch("/settings", { method: "GET" });
}

export async function updateSettings(payload: any) {
    return apiFetch("/settings", { method: "PUT", body: payload });
}
