// ─── Deterministic image URL resolver using Picsum ───
// Maps query strings to consistent seed-based images.

/**
 * Resolve an imageQuery to a Picsum URL.
 * Uses encodeURIComponent(query) as the seed so the same query
 * always returns the same image.
 */
export function resolveImageUrl(
  query: string,
  width: number = 800,
  height: number = 400
): string {
  const seed = encodeURIComponent(query.trim().toLowerCase());
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Batch-resolve an array of image queries to URLs.
 */
export function resolveImageQueries(
  queries: { alt: string; query: string; placement: string }[],
  width: number = 800,
  height: number = 400
): { alt: string; url: string; placement: string }[] {
  return queries.map((q) => ({
    alt: q.alt,
    url: resolveImageUrl(q.query, width, height),
    placement: q.placement,
  }));
}
