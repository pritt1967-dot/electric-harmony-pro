import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listContentTool from "./tools/list-content";
import listSubmissionsTool from "./tools/list-submissions";
import updateSubmissionStatusTool from "./tools/update-submission-status";
import updateSiteTextTool from "./tools/update-site-text";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef =
  import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "elektro-site",
  title: "Электро Site",
  version: "0.1.0",
  instructions:
    "Tools for the VoltPro electrician site: read services, works, reviews and site texts, review incoming leads and update their status, and edit site text blocks. Callers act as the signed-in app user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listContentTool,
    listSubmissionsTool,
    updateSubmissionStatusTool,
    updateSiteTextTool,
  ],
});
