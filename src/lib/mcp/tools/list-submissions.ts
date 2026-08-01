import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_submissions",
  title: "Заявки с сайта",
  description:
    "List lead submissions sent from the site contact form (admin access required).",
  inputSchema: {
    status: z
      .enum(["new", "in_progress", "done"])
      .optional()
      .describe("Filter by submission status."),
    limit: z.number().int().min(1).max(100).default(20).describe("Max rows."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("submissions")
      .select("id, name, phone, comment, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data) }],
          structuredContent: { rows: data ?? [] },
        };
  },
});
