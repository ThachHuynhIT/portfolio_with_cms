// SiteSettings.bio is a single freeform string (not markdown — see
// MarkdownField vs plain Textarea in site-settings-form), so a blank line
// is the author's only signal for "this is a new paragraph." Shared by
// /about and home's intro section (Phase 16), both of which render bio
// text as separate <p> elements.
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
