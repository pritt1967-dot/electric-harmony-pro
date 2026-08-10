import { createFileRoute } from "@tanstack/react-router";

import { buildContactCardPdf } from "@/lib/contact-card-pdf";

export const Route = createFileRoute("/api/public/contact-card.pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const pdf = await buildContactCardPdf(origin);
        return new Response(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=\"S&M-electric-kontakty.pdf\"",
            "Cache-Control": "private, max-age=0",
          },
        });
      },

    },
  },
});
