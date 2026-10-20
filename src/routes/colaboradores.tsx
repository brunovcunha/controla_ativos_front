import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ResourcePage";

export const Route = createFileRoute("/colaboradores")({
  head: () => ({
    meta: [
      { title: "Colaboradores — Controla Ativos" },
      { name: "description", content: "Cadastro de colaboradores responsáveis por ativos." },
      { property: "og:title", content: "Colaboradores — Controla Ativos" },
      { property: "og:description", content: "Cadastro de colaboradores responsáveis por ativos." },
    ],
  }),
  component: () => <ResourcePage resource="employees" />,
});
