import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ResourcePage";

export const Route = createFileRoute("/emprestimos")({
  head: () => ({
    meta: [
      { title: "Empréstimos — Controla Ativos" },
      { name: "description", content: "Controle de empréstimos e devoluções de ativos de TI." },
      { property: "og:title", content: "Empréstimos — Controla Ativos" },
      { property: "og:description", content: "Controle de empréstimos e devoluções de ativos de TI." },
    ],
  }),
  component: () => <ResourcePage resource="loans" />,
});
