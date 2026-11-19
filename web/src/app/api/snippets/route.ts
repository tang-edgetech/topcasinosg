import { getActiveSnippets } from "@/lib/snippets";

// The Settings > Snippets code for one page of the site, for SiteSnippets
// to swap in when a visitor clicks to another page ("top" = Head and Body
// snippets, "bottom" = Footer ones, as the root layout places them).
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") || "/";
  if (!path.startsWith("/")) return Response.json({ error: "path must start with /" }, { status: 400 });
  const snippets = await getActiveSnippets(path);
  return Response.json({ top: [...snippets.head, ...snippets.body], bottom: snippets.footer });
}
