// ─── API Client: base URL and typed request helpers ───

export const API_BASE_URL = 'https://cognimosity-backend.rickythedude420.workers.dev';

export const ENDPOINTS = {
  ROADMAP: `${API_BASE_URL}/api/roadmap`,
  MODULE: `${API_BASE_URL}/api/roadmap/module`,
  IMAGE: `${API_BASE_URL}/api/image`,
} as const;

// ─── Content-type detection ───
export function isJsonResponse(contentType: string | null): boolean {
  return !!contentType && contentType.includes('application/json');
}

export function isStreamResponse(contentType: string | null): boolean {
  return !!contentType && contentType.includes('text/plain');
}
