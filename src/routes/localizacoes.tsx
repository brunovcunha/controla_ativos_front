import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ResourcePage";

export const Route = createFileRoute("/localizacoes")({
  head: () => ({
    meta: [
      { title: "Localizações — Controla Ativos" },
      { name: "description", content: "Unidades, prédios e salas onde os ativos estão alocados." },
      { property: "og:title", content: "Localizações — Controla Ativos" },
      { property: "og:description", content: "Unidades, prédios e salas onde os ativos estão alocados." },
    ],
  }),
  component: () => <ResourcePage resource="locations" />,
});
