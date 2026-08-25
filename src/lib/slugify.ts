// Collapses any run of non-alphanumeric characters (spaces, punctuation,
// existing hyphens) into a single hyphen and strips leading/trailing ones —
// the result always matches `slugPattern` in shared-schema.ts, *except* for
// an input with no alphanumeric characters at all, which produces "".
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (NFKD decomposition)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
