import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_submission_status",
  title: "Обновить статус заявки",
  description: "Update the status of a lead submission (admin access required).",
  inputSchema: {
    id: z.string().uuid().describe("Submission id."),
    status: z.enum(["new", "in_progress", "done"]).describe("New status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, status }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("submissions")
      .update({ status })
      .eq("id", id)
      .select();
    if (error)
      return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length)
      return {
        content: [{ type: "text", text: "No submission updated (not found or not permitted)." }],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0]) }],
      structuredContent: { row: data[0] },
    };
  },
});
