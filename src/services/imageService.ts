import { ENDPOINTS } from "./apiClient";

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
 * Generate a highly relevant STEM image using FLUX.1-schnell.
 * Lazy-loaded by the frontend component via the Vercel backend to keep keys secure.
 */
export async function generateFluxImage(query: string): Promise<string> {
  try {
    const response = await fetch(ENDPOINTS.IMAGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      // Read the detailed error payload sent by our backend
      const errorPayload = await response.json().catch(() => ({}));
      console.error("Backend Error Details:", errorPayload);
      
      throw new Error(`Failed to fetch image from backend: ${response.status} - ${errorPayload.error || 'Unknown'}`);
    }

    const data = await response.json();
    if (data.base64) {
      return `data:image/jpeg;base64,${data.base64}`;
    }
    
    // Fallback if prediction fails
    return resolveImageUrl(query);
  } catch (e) {
    console.error("Failed to generate FLUX image:", e);
    return resolveImageUrl(query);
  }
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
