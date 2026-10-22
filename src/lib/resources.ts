// Resource definitions mirroring backend modules (asset, department, employee, loan, location, maintenance).
export type ResourceKey = "assets" | "departments" | "employees" | "loans" | "locations" | "maintenances";

export type FieldType = "text" | "number" | "date" | "datetime-local" | "email" | "select" | "ref" | "textarea" | "phone";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  ref?: ResourceKey;
  refLabel?: string;
  inTable?: boolean;
  hideInForm?: boolean;    // Não envia no POST
  searchable?: boolean;
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
  SCHEDULED: "info",
  PENDING_PICKUP: "warning",
  IN_USE: "info",
  RETURNED: "success",
  CANCELLED: "muted",
  OVERDUE: "destructive",
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
    updateMethod: "PATCH",
    fields: [
      { name: "assetTag", label: "Patrimônio", type: "text", required: true, inTable: true, mono: true },
      { name: "name", label: "Nome", type: "text", required: true, inTable: true },
      { name: "type", label: "Categoria", type: "select", inTable: true, options: opt(["NOTEBOOK", "Notebook"], ["DESKTOP", "Desktop"], ["MONITOR", "Monitor"], ["PHONE", "Smartphone/telefone"], ["TABLET", "Tablet"], ["PRINTER", "Impressora"], ["SWITCH", "Rede"],["SERVER", "Servidor"], ["OTHER", "Outro"]) },
      { name: "brand", label: "Marca", type: "text" },
      { name: "model", label: "Modelo", type: "text" },
      { name: "serialNumber", label: "Nº de série", type: "text", mono: true },
      { name: "status", label: "Status", type: "select", required: true, inTable: true, badge: true, options: opt(["AVAILABLE", "Disponível"], ["IN_USE", "Em uso"], ["MAINTENANCE", "Manutenção"], ["STORED", "Em Estoque"], ["DISCARDED", "Descartado"]) },
      { name: "purchaseDate", label: "Data de compra", type: "date" },
      { name: "locationId", label: "Localização", type: "ref", ref: "locations", refLabel: "name", inTable: true },
      { name: "assetValue", label: "Valor (R$)", type: "number", currency: true, inTable: true },
      { name: "notes", label: "Observações", type: "textarea", currency: true, inTable: true }
    ],
  },
  departments: {
    key: "departments",
    endpoint: "departments",
    title: "Departamentos",
    singular: "Departamento",
    description: "Áreas e centros de custo da organização.",
    searchKeys: ["name", "costCenter"],
    updateMethod: "PATCH",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, inTable: true },
      { name: "code", label: "Código", type: "text", inTable: true, mono: true },
      { name: "description", label: "Descrição", type: "text", inTable: true },
      { name: "active", label: "Ativo", type: "select", inTable: true, badge: true, options: opt(["true", "Sim"], ["false", "Não"])}
    ],
  },
  employees: {
    key: "employees",
    endpoint: "employees",
    title: "Colaboradores",
    singular: "Colaborador",
    description: "Pessoas que podem receber ativos.",
    searchKeys: ["name", "email", "registration"],
    updateMethod: "PATCH",
    fields: [
      { name: "registration", label: "Matrícula", type: "text", required: true, inTable: true, mono: true },
      { name: "name", label: "Nome", type: "text", required: true, inTable: true },
      { name: "email", label: "E-mail", type: "email", inTable: true },
      { name: "phone", label: "Telefone", type: "phone", inTable: true },
      { name: "jobTitle", label: "Cargo", type: "text", inTable: true },
      { name: "status", label: "Status", type: "select", inTable: true, badge: true, options: opt(["ACTIVE", "Ativo"], ["INACTIVE", "Inativo"])},
      { name: "departmentId", label: "Departamento", type: "ref", ref: "departments", refLabel: "name", inTable: true },
      { name: "notes", label: "Observações", type: "textarea", inTable: true}
    ],
  },
  loans: {
  key: "loans",
  endpoint: "loans",
  title: "Empréstimos",
  singular: "Empréstimo",
  description: "Cessão e controle de ciclo de vida de ativos de TI.",
  searchKeys: ["assetTag", "assetName", "purpose"],
  updateMethod: "PATCH",
  fields: [
    { name: "assetId", label: "Ativo", type: "ref", ref: "assets", refLabel: "name", required: true, searchable: true, inTable: true },
    { name: "employeeId", label: "Colaborador", type: "ref", ref: "employees", refLabel: "name", required: true, searchable: true, inTable: true },
    { name: "scheduledStart", label: "Início Previsto", type: "datetime-local", required: true, inTable: true },
    { name: "scheduledEnd", label: "Término Previsto", type: "datetime-local", required: true, inTable: true },
    { name: "pickupAt", label: "Retirado em", type: "datetime-local", inTable: true, hideInForm: true },
    { name: "returnedAt", label: "Devolvido em", type: "datetime-local", inTable: true, hideInForm: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      inTable: true,
      badge: true,
      hideInForm: true, // Controlado pelas transições da API
      options: opt(
        ["SCHEDULED", "Agendado"],
        ["PENDING_PICKUP", "Aguardando Retirada"],
        ["IN_USE", "Em Uso"],
        ["RETURNED", "Devolvido"],
        ["CANCELLED", "Cancelado"],
        ["OVERDUE", "Atrasado"]
      ),
    },
    { name: "purpose", label: "Finalidade / Motivo", type: "text" },
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
