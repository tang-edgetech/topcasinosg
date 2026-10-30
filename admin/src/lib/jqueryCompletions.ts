import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";

// Autocomplete for jQuery snippets: common jQuery-object methods after a
// "." and the static $.helpers after "$." / "jQuery.". Not exhaustive — the
// methods people actually reach for in tracking/widget snippets.
const INSTANCE_METHODS = [
  "addClass", "after", "append", "appendTo", "attr", "before", "children", "click", "closest", "css", "data", "each",
  "empty", "eq", "fadeIn", "fadeOut", "fadeToggle", "filter", "find", "first", "focus", "hasClass", "height", "hide",
  "html", "index", "insertAfter", "insertBefore", "is", "last", "next", "not", "off", "offset", "on", "one", "parent",
  "parents", "position", "prepend", "prop", "remove", "removeAttr", "removeClass", "replaceWith", "scrollTop", "show",
  "siblings", "slideDown", "slideToggle", "slideUp", "submit", "text", "toggle", "toggleClass", "trigger", "val", "width",
  "wrap",
];

const STATIC_METHODS = ["ajax", "each", "extend", "get", "getJSON", "getScript", "grep", "inArray", "isArray", "map", "post", "trim", "when"];

const GLOBALS = [
  { label: "$", type: "variable", detail: "jQuery" },
  { label: "jQuery", type: "variable" },
  { label: "$(document).ready", type: "function", apply: "$(document).ready(function () {\n  \n});" },
];

export function jqueryCompletions(context: CompletionContext): CompletionResult | null {
  const member = context.matchBefore(/(\$|jQuery)?\.\w*$/);
  if (member) {
    const isStatic = member.text.startsWith("$.") || member.text.startsWith("jQuery.");
    const dot = member.text.indexOf(".");
    return {
      from: member.from + dot + 1,
      options: (isStatic ? STATIC_METHODS : INSTANCE_METHODS).map((label) => ({ label, type: "method" })),
      validFor: /^\w*$/,
    };
  }
  const word = context.matchBefore(/[\w$]+$/);
  if (!word && !context.explicit) return null;
  return { from: word ? word.from : context.pos, options: GLOBALS, validFor: /^[\w$]*$/ };
}
