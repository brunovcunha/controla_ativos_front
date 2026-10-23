import { resources, type ResourceKey } from "./resources";
import { seed } from "./seed";


export type Row = Record<string, unknown> & { id: number | string };

// Set VITE_API_URL (e.g. http://localhost:8080/api) to use the real backend.
// Without it, data is kept in the browser so the interface works standalone.
const BASE = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "");
export const usingMock = !BASE;

// Classe personalizada para carregar status e dados do erro
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  // Se a resposta não for 2xx, extrai a mensagem enviada pelo Java/Spring Boot
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    let errorData: unknown = null;

    try {
      const text = await res.text();
      if (text) {
        errorData = JSON.parse(text);
        if (typeof errorData === "object" && errorData !== null) {
          const body = errorData as Record<string, unknown>;
          // Pega campos comuns do Spring Boot (message, detail do RFC 7807, ou error)
          message =
            (body["message"] as string) ||
            (body["detail"] as string) ||
            (body["error"] as string) ||
            text;
        } else {
          message = text;
        }
      }
    } catch {
    }

    throw new ApiError(res.status, message, errorData);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  const data = JSON.parse(text);
  return (data && Array.isArray(data.content) ? data.content : data) as T;
}


const storeKey = (k: ResourceKey) => `ativos:${k}`;
function readMock(k: ResourceKey): Row[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(storeKey(k));
  if (raw) return JSON.parse(raw);
  localStorage.setItem(storeKey(k), JSON.stringify(seed[k]));
  return seed[k];
}
const writeMock = (k: ResourceKey, rows: Row[]) => localStorage.setItem(storeKey(k), JSON.stringify(rows));

export const api = {
  async listByStatus(k: ResourceKey, status: string): Promise<Row[]> {
    if (usingMock) {
      return readMock(k).filter((r) => String(r["status"]) === status);
    }
    return http<Row[]>(`${resources[k].endpoint}/${status}/status`);
  },
  async list(k: ResourceKey): Promise<Row[]> {
    if (usingMock) return readMock(k);
    return http<Row[]>(resources[k].endpoint);
  },
  async create(k: ResourceKey, body: Omit<Row, "id">): Promise<Row> {
    if (usingMock) {
      const rows = readMock(k);
      const id = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
      const row = { ...body, id } as Row;
      writeMock(k, [...rows, row]);
      return row;
    }
    return http<Row>(resources[k].endpoint, { method: "POST", body: JSON.stringify(body) });
  },
  async update(k: ResourceKey, id: Row["id"], body: Omit<Row, "id">): Promise<Row> {
    if (usingMock) {
      const rows = readMock(k).map((r) => (r.id === id ? ({ ...body, id } as Row) : r));
      writeMock(k, rows);
      return { ...body, id } as Row;
    }
    return http<Row>(
      `${resources[k].endpoint}/${id}`,
      {
        method: resources[k].updateMethod ?? "PUT",
        body: JSON.stringify(body),
      }
    );
  },
  async remove(k: ResourceKey, id: Row["id"]): Promise<void> {
    if (usingMock) {
      writeMock(k, readMock(k).filter((r) => r.id !== id));
      return;
    }
    await http<void>(`${resources[k].endpoint}/${id}`, { method: "DELETE" });
  },

  // Regras excluisivas de Loan
  async loanPickup(id: Row["id"]): Promise<void> {
    if (usingMock) {
      const rows = readMock("loans").map((r) =>
        r.id === id ? { ...r, status: "IN_USE", pickupAt: new Date().toISOString() } : r
      );
      writeMock("loans", rows);
      return;
    }
    await http<void>(`loans/${id}/pickup`, { method: "POST" });
  },

  async loanReturn(id: Row["id"]): Promise<void> {
    if (usingMock) {
      const rows = readMock("loans").map((r) =>
        r.id === id ? { ...r, status: "RETURNED", returnedAt: new Date().toISOString() } : r
      );
      writeMock("loans", rows);
      return;
    }
    await http<void>(`loans/${id}/return`, { method: "POST" });
  },

  async loanCancel(id: Row["id"]): Promise<void> {
    if (usingMock) {
      const rows = readMock("loans").map((r) =>
        r.id === id ? { ...r, status: "CANCELLED" } : r
      );
      writeMock("loans", rows);
      return;
    }
    await http<void>(`loans/${id}/cancel`, { method: "POST" });
  },

// Métodos para requisições d emanutenções
  async starMaintenance(id: Row["id"]): Promise<void> {
    if (usingMock) {
      const rows = readMock("maintenances").map((r) =>
        r.id === id ? { ...r, status: "CANCELLED" } : r
      );
      writeMock("maintenances", rows);
      return;
    }
    await http<void>(`maintenances/${id}/start`, { method: "PATCH" });
  },
    async maintenanceComplete(id: Row["id"]): Promise<void> {
    if (usingMock) {
      const rows = readMock("maintenances").map((r) =>
        r.id === id ? { ...r, status: "COMPLETE", returnedAt: new Date().toISOString() } : r
      );
      writeMock("maintenances", rows);
      return;
    }
    await http<void>(`maintenances/${id}/complete`, { method: "PATCH" });
  },
   async mainteNanceCancel(id: Row["id"]): Promise<void> {
    if (usingMock) {
      const rows = readMock("maintenances").map((r) =>
        r.id === id ? { ...r, status: "CANCELLED" } : r
      );
      writeMock("maintenances", rows);
      return;
    }
    await http<void>(`maintenances/${id}/cancel`, { method: "PATCH" });
  }
};
