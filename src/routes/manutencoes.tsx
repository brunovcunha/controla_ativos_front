import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ResourcePage";

export const Route = createFileRoute("/manutencoes")({
  head: () => ({
    meta: [
      { title: "Manutenções — Controla Ativos" },
      { name: "description", content: "Ordens de manutenção preventiva e corretiva dos ativos." },
      { property: "og:title", content: "Manutenções — Controla Ativos" },
      { property: "og:description", content: "Ordens de manutenção preventiva e corretiva dos ativos." },
    ],
  }),
  component: () => <ResourcePage resource="maintenances" />,
});
