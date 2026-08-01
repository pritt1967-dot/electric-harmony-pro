import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const TABLES = ["services", "works", "reviews"] as const;

export default defineTool({
  name: "list_content",
  title: "Список контента сайта",
  description:
    "List site content: services, works (portfolio), reviews, or the site_content text blocks.",
  inputSchema: {
    section: z
      .enum(["services", "works", "reviews", "texts"])
      .describe("Which content section to list."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ section }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const query =
      section === "texts"
        ? supabase.from("site_content").select("key, value").order("key")
        : supabase
            .from(TABLES[TABLES.indexOf(section as (typeof TABLES)[number])])
            .select("*")
            .order("sort_order", { ascending: true });
    const { data, error } = await query;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data) }],
          structuredContent: { rows: data ?? [] },
        };
  },
});
