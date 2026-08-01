import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_site_text",
  title: "Изменить текст сайта",
  description:
    "Create or update a site_content text block by key (admin access required).",
  inputSchema: {
    key: z.string().trim().min(1).describe("Content key, e.g. hero_title."),
    value: z.string().describe("New text value."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ key, value }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("site_content")
      .upsert({ key, value }, { onConflict: "key" })
      .select();
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data?.[0] ?? null) }],
          structuredContent: { row: data?.[0] ?? null },
        };
  },
});
