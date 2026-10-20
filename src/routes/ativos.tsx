import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ResourcePage";

export const Route = createFileRoute("/ativos")({
  head: () => ({
    meta: [
      { title: "Ativos — Controla Ativos" },
      { name: "description", content: "Inventário de ativos de TI: notebooks, monitores, celulares e equipamentos de rede." },
      { property: "og:title", content: "Ativos — Controla Ativos" },
      { property: "og:description", content: "Inventário de ativos de TI: notebooks, monitores, celulares e equipamentos de rede." },
    ],
  }),
  component: () => <ResourcePage resource="assets" />,
});
