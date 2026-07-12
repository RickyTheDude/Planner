import { useState, useCallback, useRef } from 'react';
import { fetch } from 'expo/fetch';
import { ENDPOINTS, isJsonResponse } from '../services/apiClient';
import { useRoadmapStore } from '../store/useRoadmapStore';
import type { Roadmap, RoadmapNode, ModuleContent } from '../store/types';

// ─── Types ───

interface RoadmapApiResponse {
  source?: string;
  data: {
    id: string;
    topic: string;
    totalModules: number;
    estimatedHours: number;
    nodes: {
      id: string;
      index: number;
      label: string;
      description: string;
      prerequisites: string[];
    }[];
    createdAt?: number;
  };
}

interface ModuleApiResponse {
  source?: string;
  data: ModuleContent;
}

// ─── Helpers ───

/**
 * Attempt to parse a potentially incomplete JSON string.
 * Returns the parsed object on success, null on failure.
 */
function tryParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Transform raw API node data into a client-side RoadmapNode.
 */
function toRoadmapNode(raw: any, index: number): RoadmapNode {
  return {
    id: raw.id ?? `node-${index}`,
    index: raw.index ?? index,
    label: raw.label ?? 'Untitled',
    description: raw.description ?? '',
    prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites : [],
    isCompleted: false,
    contentStatus: 'idle',
  };
}

/**
 * Transform raw API response into a client-side Roadmap.
 */
function toRoadmap(raw: any): Roadmap {
  const data = raw.data ?? raw;
  return {
    id: data.id ?? `roadmap-${Date.now()}`,
    topic: data.topic ?? 'Untitled',
    totalModules: data.totalModules ?? data.nodes?.length ?? 0,
    estimatedHours: data.estimatedHours ?? 0,
    createdAt: data.createdAt ?? Date.now(),
    nodes: Array.isArray(data.nodes)
      ? data.nodes.map((n: any, i: number) => toRoadmapNode(n, i))
      : [],
  };
}

// ─── Hook ───

export function useRoadmapStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRoadmap = useRoadmapStore((s) => s.addRoadmap);
  const setModuleStatus = useRoadmapStore((s) => s.setModuleStatus);
  const injectModuleContent = useRoadmapStore((s) => s.injectModuleContent);

  // Abort controller ref for cancellation
  const abortRef = useRef<AbortController | null>(null);

  // ─── Phase 1: Generate roadmap structure ───
  const generateStructure = useCallback(
    async (prompt: string, bypassDuplicateCheck: boolean = false, isSearch: boolean = false): Promise<Roadmap | { existing: Roadmap } | null> => {
      setIsStreaming(true);
      setError(null);

      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const checkDuplicate = (roadmap: Roadmap) => {
        if (bypassDuplicateCheck) return null;
        const roadmaps = useRoadmapStore.getState().roadmaps;
        return roadmaps.find(r => r.topic.toLowerCase() === roadmap.topic.toLowerCase()) || null;
      };

      try {
        const storeState = useRoadmapStore.getState();
        const audience = storeState.audience;
        const detailLevel = storeState.detailLevel;

        const modifiedPrompt = prompt;

        const response = await fetch(ENDPOINTS.ROADMAP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: modifiedPrompt, detailLevel, isSearch, ...(audience && { audience }) }),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status >= 500 && response.status <= 599) {
            throw new Error('Server is currently down or unresponsive. Please try again later.');
          }
          const errBody = await response.text();
          const errJson = tryParseJSON<{ error?: string }>(errBody);
          throw new Error(errJson?.error ?? `Server error ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (isJsonResponse(contentType)) {
          // ─── Cache Hit: immediate JSON parse ───
          const payload = (await response.json()) as RoadmapApiResponse;
          const roadmap = toRoadmap(payload);
          
          const existing = checkDuplicate(roadmap);
          if (existing) {
            return { existing };
          }
          
          addRoadmap(roadmap);
          return roadmap;
        }

        // ─── Cache Miss: stream text chunks via ReadableStream ───
        if (!response.body) {
          // Fallback: read as text
          const text = await response.text();
          const parsed = tryParseJSON<RoadmapApiResponse>(text);
          if (!parsed) throw new Error('Failed to parse streamed roadmap response');
          const roadmap = toRoadmap(parsed);
          
          const existing = checkDuplicate(roadmap);
          if (existing) {
            return { existing };
          }
          
          addRoadmap(roadmap);
          return roadmap;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let lastGoodRoadmap: Roadmap | null = null;
        let checkedDuplicate = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          // Try to parse the accumulated text as complete JSON
          const parsed = tryParseJSON<RoadmapApiResponse>(accumulated);
          let currentParsedRoadmap: Roadmap | null = null;
          
          if (parsed) {
            currentParsedRoadmap = toRoadmap(parsed);
          } else {
            // Attempt partial parse: extract nodes that exist so far
            const partialRoadmap = attemptPartialParse(accumulated);
            if (partialRoadmap && partialRoadmap.nodes.length > (lastGoodRoadmap?.nodes.length ?? 0)) {
              currentParsedRoadmap = partialRoadmap;
            }
          }
          
          if (currentParsedRoadmap) {
            // Only check for duplicates once we have the first valid partial parse (which contains topic/id)
            if (!checkedDuplicate) {
              const existing = checkDuplicate(currentParsedRoadmap);
              if (existing) {
                // Return immediately without adding to store. The finally block will handle cleanup.
                return { existing };
              }
              checkedDuplicate = true;
            }
            lastGoodRoadmap = currentParsedRoadmap;
            addRoadmap(lastGoodRoadmap);
          }
        }

        // Final flush
        accumulated += decoder.decode();
        const finalParsed = tryParseJSON<RoadmapApiResponse>(accumulated);
        if (finalParsed) {
          lastGoodRoadmap = toRoadmap(finalParsed);
          addRoadmap(lastGoodRoadmap);
        }

        if (!lastGoodRoadmap) {
          throw new Error('Failed to parse streamed roadmap');
        }

        return lastGoodRoadmap;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        let message = err.message ?? 'An unknown error occurred';
        if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network request failed')) {
          message = 'Server is not responsive. Please check your connection or try again later.';
        }
        setError(message);
        console.error('[useRoadmapStream] generateStructure error:', message);
        return null;
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [addRoadmap]
  );

  // ─── Phase 2: Generate module content ───
  const generateModuleContent = useCallback(
    async (
      roadmapId: string,
      moduleId: string,
      moduleTitle: string,
      roadmapTopic: string,
      context: string
    ): Promise<ModuleContent | null> => {
      setError(null);
      setModuleStatus(roadmapId, moduleId, 'loading');

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const audience = useRoadmapStore.getState().audience;
        const response = await fetch(ENDPOINTS.MODULE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roadmapId,
            moduleId,
            moduleTitle,
            roadmapTopic,
            context,
            ...(audience && { audience }),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status >= 500 && response.status <= 599) {
            throw new Error('Server is currently down or unresponsive. Please try again later.');
          }
          const errBody = await response.text();
          const errJson = tryParseJSON<{ error?: string }>(errBody);
          throw new Error(errJson?.error ?? `Server error ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (isJsonResponse(contentType)) {
          // ─── Cache Hit ───
          const payload = (await response.json()) as ModuleApiResponse;
          const content = payload.data ?? payload;
          injectModuleContent(roadmapId, moduleId, content as ModuleContent, 'complete');
          return content as ModuleContent;
        }

        // ─── Cache Miss: stream ───
        if (!response.body) {
          const text = await response.text();
          const parsed = tryParseJSON<ModuleApiResponse>(text);
          if (!parsed) throw new Error('Failed to parse streamed module response');
          const content = parsed.data ?? parsed;
          injectModuleContent(roadmapId, moduleId, content as ModuleContent, 'complete');
          return content as ModuleContent;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let lastContent: ModuleContent | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          const parsed = tryParseJSON<ModuleApiResponse>(accumulated);
          if (parsed) {
            lastContent = (parsed.data ?? parsed) as ModuleContent;
            injectModuleContent(roadmapId, moduleId, lastContent);
          } else {
            // Attempt partial content extraction for progressive rendering
            const partial = attemptPartialModuleParse(accumulated);
            if (partial && (partial.markdownBody?.length ?? 0) > (lastContent?.markdownBody?.length ?? 0)) {
              lastContent = partial;
              // Inject partial content so markdown renders progressively
              injectModuleContent(roadmapId, moduleId, lastContent);
            }
          }
        }

        // Final flush
        accumulated += decoder.decode();
        const finalParsed = tryParseJSON<ModuleApiResponse>(accumulated);
        if (finalParsed) {
          lastContent = (finalParsed.data ?? finalParsed) as ModuleContent;
          injectModuleContent(roadmapId, moduleId, lastContent, 'complete');
        } else if (lastContent) {
          injectModuleContent(roadmapId, moduleId, lastContent, 'complete');
        }

        if (!lastContent) {
          console.error('[useRoadmapStream] Failed to parse. Accumulated string:', accumulated);
          throw new Error('Failed to parse streamed module content');
        }

        return lastContent;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        let message = err.message ?? 'An unknown error occurred';
        if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network request failed')) {
          message = 'Server is not responsive. Please check your connection or try again later.';
        }
        setError(message);
        setModuleStatus(roadmapId, moduleId, 'idle'); // Reset on failure
        console.error('[useRoadmapStream] generateModuleContent error:', message);
        return null;
      } finally {
        abortRef.current = null;
      }
    },
    [setModuleStatus, injectModuleContent]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { generateStructure, generateModuleContent, isStreaming, error, cancel };
}

// ─── Partial JSON Parsers ───
// These attempt to extract usable data from incomplete streaming JSON.

function attemptPartialParse(text: string): Roadmap | null {
  try {
    // Try to find and extract nodes array even from partial JSON
    // The AI SDK streams like: {"id":"...","topic":"...","nodes":[{...},{...
    // We try to repair the JSON by closing open brackets

    let repaired = text;
    // Count unclosed brackets and braces
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;

    // Remove any trailing comma
    repaired = repaired.replace(/,\s*$/, '');

    // Close any unclosed strings (heuristic: check if last non-space char is in a string)
    // This is intentionally naive — we just need "good enough" for UI updates
    const lastChar = repaired.trim().slice(-1);
    if (lastChar !== '"' && lastChar !== '}' && lastChar !== ']' && lastChar !== 'e' && lastChar !== 'l') {
      // Might be mid-string, try closing it
      repaired += '"';
    }

    // Close brackets and braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

    const parsed = JSON.parse(repaired);
    if (parsed && (parsed.data?.nodes || parsed.nodes)) {
      return toRoadmap(parsed);
    }
  } catch {
    // Partial parse failed — that's expected during streaming
  }
  return null;
}

function attemptPartialModuleParse(text: string): ModuleContent | null {
  try {
    let repaired = text;
    repaired = repaired.replace(/,\s*$/, '');

    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;

    const lastChar = repaired.trim().slice(-1);
    if (lastChar !== '"' && lastChar !== '}' && lastChar !== ']') {
      repaired += '"';
    }

    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

    const parsed = JSON.parse(repaired);
    const data = parsed.data ?? parsed;

    if (data && typeof data.markdownBody === 'string') {
      return {
        moduleId: data.moduleId ?? '',
        markdownBody: data.markdownBody ?? '',
        mermaidDiagrams: Array.isArray(data.mermaidDiagrams) ? data.mermaidDiagrams : [],
        imageQueries: Array.isArray(data.imageQueries) ? data.imageQueries : [],
        keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
        estimatedMinutes: data.estimatedMinutes ?? 0,
      };
    }
  } catch {
    // Expected during streaming
  }
  return null;
}
