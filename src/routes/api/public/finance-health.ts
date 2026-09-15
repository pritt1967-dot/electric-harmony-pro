import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/finance-health")({
  server: {
    handlers: {
      GET: async () => {
        const { financeHealthCheck } = await import("@/lib/finance-db.server");
        const result = await financeHealthCheck();
        return Response.json(result, {
          status: result.ok ? 200 : 503,
          headers: { "cache-control": "no-store" },
        });
      },
      HEAD: async () => {
        const { financeHealthCheck } = await import("@/lib/finance-db.server");
        const result = await financeHealthCheck();
        return new Response(null, {
          status: result.ok ? 200 : 503,
          headers: {
            "cache-control": "no-store",
            "x-finance-status": result.status === null ? "network-error" : String(result.status),
          },
        });
      },
    },
  },
});