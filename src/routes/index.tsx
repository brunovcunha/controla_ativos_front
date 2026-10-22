import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Laptop, ArrowLeftRight, Wrench, Wallet, AlertTriangle } from "lucide-react";
import { listQuery } from "@/components/ResourcePage";
import { StatusBadge } from "@/components/StatusBadge";
import type { Row } from "@/lib/api";
import { resources, optionLabel, type ResourceKey } from "@/lib/resources";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Controla Ativos" },
      { name: "description", content: "Visão geral do inventário, empréstimos e manutenções de ativos de TI." },
      { property: "og:title", content: "Dashboard — Controla Ativos" },
      { property: "og:description", content: "Visão geral do inventário, empréstimos e manutenções de ativos de TI." },
    ],
  }),
  component: Dashboard,
});

const keys: ResourceKey[] = ["assets", "loans", "maintenances", "employees"];
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Dashboard() {
  const res = useQueries({ queries: keys.map(listQuery) });
  const [assets, loans, maints, emps] = keys.map((_, i) => res[i]?.data ?? []) as [Row[], Row[], Row[], Row[]];
  const statusField = resources.assets.fields.find((f) => f.name === "status")!;
  const total = assets.reduce((s, a) => s + (Number(a["assetValue"]) || 0), 0);
  const activeLoans = loans.filter((l) => l["status"] !== "DEVOLVIDO");
  const late = loans.filter((l) => l["status"] === "ATRASADO");
  const openMaint = maints.filter((m) => m["status"] !== "CONCLUIDA");
  const name = (rows: typeof assets, id: unknown) => String(rows.find((r) => String(r.id) === String(id))?.["name"] ?? "—");

  const stats = [
    { label: "Ativos cadastrados", value: assets.length, icon: Laptop, to: "/ativos" as const },
    { label: "Empréstimos ativos", value: activeLoans.length, icon: ArrowLeftRight, to: "/emprestimos" as const },
    { label: "Manutenções abertas", value: openMaint.length, icon: Wrench, to: "/manutencoes" as const },
    { label: "Valor do patrimônio", value: brl.format(total), icon: Wallet, to: "/ativos" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos ativos de TI.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group rounded-xl border bg-card p-5 shadow-card transition hover:border-primary/40">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground"><s.icon className="size-4" /></span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="font-semibold">Ativos por status</h2>
          <div className="mt-4 space-y-3">
            {statusField.options!.map((o) => {
              const n = assets.filter((a) => a["status"] === o.value).length;
              const pct = assets.length ? (n / assets.length) * 100 : 0;
              return (
                <div key={o.value}>
                  <div className="mb-1 flex justify-between text-sm"><span>{o.label}</span><span className="text-muted-foreground">{n}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{emps.length} colaboradores cadastrados</p>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Empréstimos em aberto</h2>
            {late.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="size-3.5" />{late.length} atrasado(s)</span>
            )}
          </div>
          <ul className="mt-3 divide-y">
            {activeLoans.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Nenhum empréstimo em aberto.</li>}
            {activeLoans.slice(0, 6).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{name(assets, l["assetId"])}</p>
                  <p className="truncate text-muted-foreground">{name(emps, l["employeeId"])}</p>
                </div>
                <StatusBadge value={String(l["status"])} label={optionLabel(resources.loans.fields.find((f) => f.name === "status")!, l["status"])} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
