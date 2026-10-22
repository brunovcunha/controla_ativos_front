import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, type Row } from "@/lib/api";
import { resources, optionLabel, type Field, type ResourceKey } from "@/lib/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "./StatusBadge";
import { SearchableSelect } from "./SearchableSelect";

export const listQuery = (k: ResourceKey) => ({ queryKey: [k], queryFn: () => api.list(k) });

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (v: unknown) => (v ? new Date(String(v) + "T00:00:00").toLocaleDateString("pt-BR") : "—");

function useRefMaps(fields: Field[]) {
  const refs = [...new Set(fields.filter((f) => f.ref).map((f) => f.ref!))];
  const results = useQueries({ queries: refs.map((r) => listQuery(r)) });
  return Object.fromEntries(refs.map((r, i) => [r, results[i]?.data ?? []])) as Record<ResourceKey, Row[]>;
}

export function ResourcePage({ resource }: { resource: ResourceKey }) {
  const def = resources[resource];
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery(listQuery(resource));
  const refData = useRefMaps(def.fields);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [page, setPage] = useState(1);


  const pageSize = 10;

  const cols = def.fields.filter((f) => f.inTable);

  const display = (f: Field, row: Row) => {
    const v = row[f.name];
    if (f.ref) {
      const r = refData[f.ref]?.find((x) => String(x.id) === String(v));
      return r ? String(r[f.refLabel ?? "name"]) : "—";
    }
    if (f.type === "select") return optionLabel(f, v);
    if (f.type === "date") return fmtDate(v);
    if (f.currency) return v == null || v === "" ? "—" : brl.format(Number(v));
    return v == null || v === "" ? "—" : String(v);
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((row) => cols.some((f) => display(f, row).toLowerCase().includes(s)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, refData]);

  useEffect(() => {
    setPage(1);
  }, [q, data.length]);




  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedData = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );


  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      editing ? api.update(resource, editing.id, body) : api.create(resource, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success(`${def.singular} ${editing ? "atualizado" : "cadastrado"} com sucesso`);
      setEditing(undefined);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (row: Row) => api.remove(resource, row.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success(`${def.singular} excluído`);
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (

    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{def.title}</h1>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus /> Novo {def.singular.toLowerCase()}
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex items-center justify-between gap-3 border-b p-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-8" />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{filtered.length} registro(s)</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((c) => (
                <TableHead key={c.name} className="text-xs uppercase tracking-wide">{c.label}</TableHead>
              ))}
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={cols.length + 1} className="py-10 text-center text-muted-foreground"><Loader2 className="mx-auto size-5 animate-spin" /></TableCell></TableRow>
            )}
            {error && (
              <TableRow><TableCell colSpan={cols.length + 1} className="py-10 text-center text-destructive">Não foi possível carregar: {(error as Error).message}</TableCell></TableRow>
            )}
            {!isLoading && !error && filtered.length === 0 && (
              <TableRow><TableCell colSpan={cols.length + 1} className="py-10 text-center text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
            )}

            {paginatedData.map((row) => {

              const status = String(row["status"] ?? "");

              const canPickup = status === "SCHEDULED" || status === "PENDING_PICKUP";
              const canReturn = status === "IN_USE";
              const canCancel = status === "SCHEDULED" || status === "PENDING_PICKUP";


              return (
                <TableRow key={row.id}>
                  {cols.map((c) => (
                    <TableCell key={c.name} className={c.mono ? "font-mono text-xs" : "max-w-xs truncate"}>
                      {c.badge ? <StatusBadge value={String(row[c.name])} label={display(c, row)} /> : display(c, row)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {resource === "loans" && (
                        <div className="flex items-center gap-1 mr-2">
                          {canPickup && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => api.loanPickup(row.id).then(() => qc.invalidateQueries({ queryKey: ["loans"] }))}
                            >
                              Retirar
                            </Button>
                          )}
                          {canReturn && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 text-xs"
                              onClick={() => api.loanReturn(row.id).then(() => qc.invalidateQueries({ queryKey: ["loans"] }))}
                            >
                              Devolver
                            </Button>
                          )}
                          {canCancel && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => api.loanCancel(row.id).then(() => qc.invalidateQueries({ queryKey: ["loans"] }))}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      )}

                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => setEditing(row)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir"
                        onClick={() => setDeleting(row)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-4 py-4">
          <span className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? "Nenhum registro"
              : `Mostrando ${(page - 1) * pageSize + 1}–${Math.min(
                page * pageSize,
                filtered.length
              )} de ${filtered.length} registros`}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>

            <span className="flex items-center px-2 text-sm">
              Página {page} de {Math.max(totalPages, 1)}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Editar ${def.singular.toLowerCase()}` : `Novo ${def.singular.toLowerCase()}`}</DialogTitle>
          </DialogHeader>
          {editing !== undefined && (
            <ResourceForm key={String(editing?.id ?? "new")} fields={def.fields} initial={editing} refData={refData}
              pending={save.isPending} onCancel={() => setEditing(undefined)} onSubmit={(b) => save.mutate(b)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {def.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && del.mutate(deleting)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (digits.length <= 10) {
    if (number.length <= 4) {
      return `(${ddd}) ${number}`;
    }

    return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }

  if (number.length <= 5) {
    return `(${ddd}) ${number}`;
  }

  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

function ResourceForm({ fields, initial, refData, pending, onSubmit, onCancel }: {
  fields: Field[]; initial: Row | null; refData: Record<string, Row[]>; pending: boolean;
  onSubmit: (b: Record<string, unknown>) => void; onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    fields.forEach((f) => (v[f.name] = initial?.[f.name] ?? ""));
    return v;
  });
  const set = (k: string, v: unknown) => setValues((s) => ({ ...s, [k]: v }));

  const formFields = fields.filter((f) => !f.hideInForm);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = {};
    for (const f of formFields) {
      const v = values[f.name];
      if (f.required && (v === "" || v == null)) {
        toast.error(`Preencha "${f.label}"`);
        return;
      }
      // Converte datas para ISO 8601 se preenchido
      if (f.type === "datetime-local" && v) {
        body[f.name] = new Date(String(v)).toISOString();
      } else {
        body[f.name] = v === "" ? null : f.type === "number" || f.type === "ref" ? Number(v) : v;
      }
    }
    onSubmit(body);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.type === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
            <Label htmlFor={f.name}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
            {f.type === "textarea" ? (
              <Textarea id={f.name} value={String(values[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === "select" || f.type === "ref" ? (
              <SearchableSelect
                value={values[f.name] == null ? "" : String(values[f.name])}
                onChange={(v) => set(f.name, v)}
                placeholder={`Selecione ${f.label.toLowerCase()}...`}
                options={
                  f.type === "select"
                    ? f.options ?? []
                    : (refData[f.ref!] ?? []).map((r) => ({
                      value: String(r.id),
                      label: String(r[f.refLabel ?? "name"]),
                    }))
                }
              />
            ) : (
              <Input
                id={f.name}
                type={f.type === "phone" ? "tel" : f.type}
                step={f.currency ? "0.01" : undefined}
                value={
                  f.type === "phone"
                    ? formatPhone(String(values[f.name] ?? ""))
                    : String(values[f.name] ?? "")
                }
                onChange={(e) =>
                  set(
                    f.name,
                    f.type === "phone"
                      ? formatPhone(e.target.value)
                      : e.target.value
                  )
                }
              />
            )}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}Salvar</Button>
      </DialogFooter>
    </form>
  );
}
