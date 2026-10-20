import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ResourcePage";

export const Route = createFileRoute("/departamentos")({
  head: () => ({
    meta: [
      { title: "Departamentos — Controla Ativos" },
      { name: "description", content: "Cadastro de departamentos e centros de custo." },
      { property: "og:title", content: "Departamentos — Controla Ativos" },
      { property: "og:description", content: "Cadastro de departamentos e centros de custo." },
    ],
  }),
  component: () => <ResourcePage resource="departments" />,
});
