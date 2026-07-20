// Renders admin-authored raw HTML/JS verbatim (Snippets, per-page Custom
// Code). This is deliberately NOT sanitized — unlike WYSIWYG body content
// (see lib/sanitize-html.ts), the entire point of a snippet is to run
// arbitrary script (analytics, tracking pixels, chat widgets), and editing
// it is restricted to Super Admin at the API layer (see server.go). Safe to
// render this way because it's Server-Component SSR: the string becomes
// literal HTML in the response the browser parses on first load, so
// embedded <script> tags execute normally — unlike a client-side
// `.innerHTML` mutation after the page has already loaded, which browsers
// don't execute scripts from.
export default function RawHtmlBlock({ html }: { html: string }) {
  if (!html) return null;
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
