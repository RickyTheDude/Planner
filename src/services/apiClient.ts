// ─── API Client: base URL and typed request helpers ───

export const API_BASE_URL = 'https://cognimosity-backend.vercel.app';

export const ENDPOINTS = {
  ROADMAP: `${API_BASE_URL}/api/roadmap`,
  MODULE: `${API_BASE_URL}/api/roadmap/module`,
} as const;

// ─── Content-type detection ───
export function isJsonResponse(contentType: string | null): boolean {
  return !!contentType && contentType.includes('application/json');
}

export function isStreamResponse(contentType: string | null): boolean {
  return !!contentType && contentType.includes('text/plain');
}
