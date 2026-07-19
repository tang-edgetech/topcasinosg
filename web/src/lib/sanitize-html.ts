import sanitizeHtml from "sanitize-html";

// Content authored via the admin dashboard's WYSIWYG editor (Casino reviews,
// Guides, News, Blacklist write-ups) is stored as HTML. Editors are a lower
// trust tier than Super Admin, so strip anything beyond simple rich text
// before it ever reaches dangerouslySetInnerHTML on the public site.
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "code",
];

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    // Force every link to open safely regardless of what the editor set.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}
