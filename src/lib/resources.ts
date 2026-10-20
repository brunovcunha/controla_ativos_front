// Resource definitions mirroring backend modules (asset, department, employee, loan, location, maintenance).
export type ResourceKey = "assets" | "departments" | "employees" | "loans" | "locations" | "maintenances";

export type FieldType = "text" | "number" | "date" | "email" | "select" | "ref" | "textarea";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  ref?: ResourceKey;
  refLabel?: string;
  inTable?: boolean;
  badge?: boolean;
  mono?: boolean;
  currency?: boolean;
}

export interface ResourceDef {
  key: ResourceKey;
  endpoint: string;
  title: string;
  singular: string;
  description: string;
  fields: Field[];
  searchKeys: string[];
  updateMethod?: "PUT" | "PATCH"; 
}

const opt = (...v: [string, string][]) => v.map(([value, label]) => ({ value, label }));

export const STATUS_TONE: Record<string, "success" | "warning" | "info" | "destructive" | "muted"> = {
  DISPONIVEL: "success",
  EM_USO: "info",
  MANUTENCAO: "warning",
  BAIXADO: "muted",
  ATIVO: "info",
  DEVOLVIDO: "success",
  ATRASADO: "destructive",
  ABERTA: "warning",
  EM_ANDAMENTO: "info",
  CONCLUIDA: "success",
  PREVENTIVA: "info",
  CORRETIVA: "warning",
};

export const resources: Record<ResourceKey, ResourceDef> = {
  assets: {
    key: "assets",
    endpoint: "assets",
    title: "Ativos",
    singular: "Ativo",
    description: "Inventário de equipamentos e patrimônio de TI.",
    searchKeys: ["tag", "name", "serialNumber", "brand"],
    fields: [
      { name: "tag", label: "Patrimônio", type: "text", required: true, inTable: true, mono: true },
      { name: "name", label: "Nome", type: "text", required: true, inTable: true },
      { name: "category", label: "Categoria", type: "select", inTable: true, options: opt(["NOTEBOOK", "Notebook"], ["DESKTOP", "Desktop"], ["MONITOR", "Monitor"], ["SMARTPHONE", "Smartphone"], ["IMPRESSORA", "Impressora"], ["REDE", "Rede"], ["OUTRO", "Outro"]) },
      { name: "brand", label: "Marca", type: "text" },
      { name: "model", label: "Modelo", type: "text" },
      { name: "serialNumber", label: "Nº de série", type: "text", mono: true },
      { name: "status", label: "Status", type: "select", required: true, inTable: true, badge: true, options: opt(["DISPONIVEL", "Disponível"], ["EM_USO", "Em uso"], ["MANUTENCAO", "Manutenção"], ["BAIXADO", "Baixado"]) },
      { name: "locationId", label: "Localização", type: "ref", ref: "locations", refLabel: "name", inTable: true },
      { name: "purchaseDate", label: "Data de compra", type: "date" },
      { name: "value", label: "Valor (R$)", type: "number", currency: true, inTable: true },
    ],
  },
  departments: {
    key: "departments",
    endpoint: "departments",
    title: "Departamentos",
    singular: "Departamento",
    description: "Áreas e centros de custo da organização.",
    searchKeys: ["name", "costCenter"],
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, inTable: true },
      { name: "costCenter", label: "Centro de custo", type: "text", inTable: true, mono: true },
      { name: "manager", label: "Gestor", type: "text", inTable: true },
    ],
  },
  employees: {
    key: "employees",
    endpoint: "employees",
    title: "Colaboradores",
    singular: "Colaborador",
    description: "Pessoas que podem receber ativos.",
    searchKeys: ["name", "email", "registration"],
    fields: [
      { name: "registration", label: "Matrícula", type: "text", required: true, inTable: true, mono: true },
      { name: "name", label: "Nome", type: "text", required: true, inTable: true },
      { name: "email", label: "E-mail", type: "email", inTable: true },
      { name: "position", label: "Cargo", type: "text", inTable: true },
      { name: "departmentId", label: "Departamento", type: "ref", ref: "departments", refLabel: "name", inTable: true },
    ],
  },
  loans: {
    key: "loans",
    endpoint: "loans",
    title: "Empréstimos",
    singular: "Empréstimo",
    description: "Cessão de ativos para colaboradores.",
    searchKeys: [],
    fields: [
      { name: "assetId", label: "Ativo", type: "ref", ref: "assets", refLabel: "name", required: true, inTable: true },
      { name: "employeeId", label: "Colaborador", type: "ref", ref: "employees", refLabel: "name", required: true, inTable: true },
      { name: "loanDate", label: "Data de saída", type: "date", required: true, inTable: true },
      { name: "expectedReturnDate", label: "Devolução prevista", type: "date", inTable: true },
      { name: "returnDate", label: "Devolvido em", type: "date" },
      { name: "status", label: "Status", type: "select", required: true, inTable: true, badge: true, options: opt(["ATIVO", "Ativo"], ["DEVOLVIDO", "Devolvido"], ["ATRASADO", "Atrasado"]) },
      { name: "notes", label: "Observações", type: "textarea" },
    ],
  },
  locations: {
    key: "locations",
    endpoint: "locations",
    title: "Localizações",
    singular: "Localização",
    description: "Unidades, prédios e salas onde os ativos ficam.",
    searchKeys: ["name", "address"],
    updateMethod: "PATCH",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, inTable: true },
      { name: "address", label: "Endereço", type: "text", inTable: true },
      { name: "room", label: "Sala / Andar", type: "text", inTable: true },
      { name: "active", label: "Ativa", type: "select", inTable: true, badge: true, options: opt(["true", "Sim"], ["false", "Não"])}
    ],
  },
  maintenances: {
    key: "maintenances",
    endpoint: "maintenances",
    title: "Manutenções",
    singular: "Manutenção",
    description: "Ordens de serviço preventivas e corretivas.",
    searchKeys: ["description", "provider"],
    fields: [
      { name: "assetId", label: "Ativo", type: "ref", ref: "assets", refLabel: "name", required: true, inTable: true },
      { name: "type", label: "Tipo", type: "select", required: true, inTable: true, badge: true, options: opt(["PREVENTIVA", "Preventiva"], ["CORRETIVA", "Corretiva"]) },
      { name: "description", label: "Descrição", type: "textarea", required: true, inTable: true },
      { name: "provider", label: "Fornecedor", type: "text" },
      { name: "startDate", label: "Início", type: "date", inTable: true },
      { name: "endDate", label: "Fim", type: "date" },
      { name: "cost", label: "Custo (R$)", type: "number", currency: true, inTable: true },
      { name: "status", label: "Status", type: "select", required: true, inTable: true, badge: true, options: opt(["ABERTA", "Aberta"], ["EM_ANDAMENTO", "Em andamento"], ["CONCLUIDA", "Concluída"]) },
    ],
  },
};

export function optionLabel(field: Field, value: unknown) {
  return field.options?.find((o) => o.value === value)?.label ?? String(value ?? "—");
}
