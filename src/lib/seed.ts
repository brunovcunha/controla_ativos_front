import type { ResourceKey } from "./resources";
import type { Row } from "./api";

export const seed: Record<ResourceKey, Row[]> = {
  departments: [
    { id: 1, name: "Tecnologia da Informação", costCenter: "CC-1010", manager: "Bruno Vieira" },
    { id: 2, name: "Financeiro", costCenter: "CC-2020", manager: "Carla Mendes" },
    { id: 3, name: "Recursos Humanos", costCenter: "CC-3030", manager: "Paulo Rocha" },
    { id: 4, name: "Comercial", costCenter: "CC-4040", manager: "Juliana Alves" },
  ],
  locations: [
    { id: 1, name: "Matriz", address: "Av. Brasil, 1500", room: "3º andar - TI", active: "false" },
    { id: 2, name: "Filial Centro", address: "Rua XV de Novembro, 220", room: "Térreo", active: "false" },
    { id: 3, name: "Almoxarifado", address: "Av. Brasil, 1500", room: "Subsolo", active: "false" },
  ],
  employees: [
    { id: 1, registration: "00123", name: "Ana Souza", email: "ana.souza@empresa.com", position: "Analista Financeiro", departmentId: 2 },
    { id: 2, registration: "00145", name: "Marcos Lima", email: "marcos.lima@empresa.com", position: "Desenvolvedor", departmentId: 1 },
    { id: 3, registration: "00167", name: "Fernanda Costa", email: "fernanda.costa@empresa.com", position: "Analista de RH", departmentId: 3 },
    { id: 4, registration: "00189", name: "Rafael Nunes", email: "rafael.nunes@empresa.com", position: "Executivo de Vendas", departmentId: 4 },
  ],
  assets: [
    { id: 1, tag: "PAT-0001", name: "Notebook Dell Latitude 5440", category: "NOTEBOOK", brand: "Dell", model: "Latitude 5440", serialNumber: "DL5440-8X21", status: "EM_USO", locationId: 1, purchaseDate: "2025-03-10", value: 6890 },
    { id: 2, tag: "PAT-0002", name: "Monitor LG 27\"", category: "MONITOR", brand: "LG", model: "27UL500", serialNumber: "LG27-44K1", status: "DISPONIVEL", locationId: 3, purchaseDate: "2024-11-02", value: 1450 },
    { id: 3, tag: "PAT-0003", name: "iPhone 15", category: "SMARTPHONE", brand: "Apple", model: "iPhone 15", serialNumber: "APL15-9921", status: "EM_USO", locationId: 2, purchaseDate: "2025-06-18", value: 5200 },
    { id: 4, tag: "PAT-0004", name: "Impressora HP LaserJet", category: "IMPRESSORA", brand: "HP", model: "M428", serialNumber: "HPM428-001", status: "MANUTENCAO", locationId: 1, purchaseDate: "2023-08-21", value: 3100 },
    { id: 5, tag: "PAT-0005", name: "Switch Cisco 24p", category: "REDE", brand: "Cisco", model: "CBS250", serialNumber: "CS250-7781", status: "DISPONIVEL", locationId: 1, purchaseDate: "2024-02-14", value: 2750 },
    { id: 6, tag: "PAT-0006", name: "Desktop Lenovo ThinkCentre", category: "DESKTOP", brand: "Lenovo", model: "M70q", serialNumber: "LNM70-3320", status: "BAIXADO", locationId: 3, purchaseDate: "2020-05-09", value: 3900 },
  ],
  loans: [
    { id: 1, assetId: 1, employeeId: 2, loanDate: "2026-08-01", expectedReturnDate: "2027-08-01", status: "ATIVO" },
    { id: 2, assetId: 3, employeeId: 4, loanDate: "2026-07-15", expectedReturnDate: "2026-10-01", status: "ATRASADO" },
    { id: 3, assetId: 2, employeeId: 1, loanDate: "2026-05-02", expectedReturnDate: "2026-06-02", returnDate: "2026-06-01", status: "DEVOLVIDO" },
  ],
  maintenances: [
    { id: 1, assetId: 4, type: "CORRETIVA", description: "Troca do fusor", provider: "HP Assist", startDate: "2026-10-12", cost: 680, status: "EM_ANDAMENTO" },
    { id: 2, assetId: 5, type: "PREVENTIVA", description: "Atualização de firmware", provider: "Interno", startDate: "2026-09-03", endDate: "2026-09-03", cost: 0, status: "CONCLUIDA" },
    { id: 3, assetId: 1, type: "PREVENTIVA", description: "Limpeza e troca de pasta térmica", provider: "Interno", startDate: "2026-10-22", cost: 0, status: "ABERTA" },
  ],
};
