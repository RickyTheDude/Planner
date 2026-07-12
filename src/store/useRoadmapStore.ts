import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage, mmkvInstance } from "./mmkv";
import { RoadmapStore, ContentStatus, ModuleContent } from "./types";
import { colorScheme } from "nativewind";

// ─── Legacy type guard for migration ───
interface LegacyNode {
  id: string;
  label: string;
  isCompleted: boolean;
  material?: {
    markdownBody: string;
    sources: { title: string; url: string }[];
  };
  // New-schema fields (may or may not exist)
  index?: number;
  description?: string;
  prerequisites?: string[];
  contentStatus?: ContentStatus;
  content?: ModuleContent;
}

function isLegacyNode(node: any): node is LegacyNode {
  return node && 'material' in node && !('contentStatus' in node);
}

// ─── Read and apply initial theme synchronously to prevent flash ───
const getInitialTheme = (): "light" | "dark" => {
  try {
    const raw = mmkvInstance.getString("roadmap-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.theme) {
        return parsed.state.theme;
      }
    }
  } catch (err) {
    console.error("Failed to read theme from MMKV", err);
  }
  return "light";
};

const initialTheme = getInitialTheme();
colorScheme.set(initialTheme);

export const useRoadmapStore = create<RoadmapStore>()(
  persist(
    (set, get) => ({
      roadmaps: [],
      theme: initialTheme,
      fontSizeMultiplier: 1.0,
      hasSeenOnboarding: false,
      audience: null,
      detailLevel: 'standard',

      setHasSeenOnboarding: (seen) => {
        set({ hasSeenOnboarding: seen });
      },

      setAudience: (audience) => {
        set({ audience });
      },

      setDetailLevel: (level) => {
        set({ detailLevel: level });
      },

      addRoadmap: (roadmap) => {
        set((state) => {
          const filtered = state.roadmaps.filter((r) => r.id !== roadmap.id);
          return {
            roadmaps: [roadmap, ...filtered],
          };
        });
      },

      deleteRoadmap: (roadmapId) => {
        set((state) => ({
          roadmaps: state.roadmaps.filter((r) => r.id !== roadmapId),
        }));
      },

      getRoadmapById: (roadmapId) => {
        return get().roadmaps.find((r) => r.id === roadmapId);
      },

      markNodeCompleted: (roadmapId, nodeId) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((r) => {
            if (r.id !== roadmapId) return r;
            return {
              ...r,
              nodes: r.nodes.map((n) =>
                n.id === nodeId ? { ...n, isCompleted: true } : n
              ),
            };
          }),
        }));
      },

      getNextNodeId: (roadmapId, currentNodeId) => {
        const roadmap = get().roadmaps.find((r) => r.id === roadmapId);
        if (!roadmap) return null;
        const currentIndex = roadmap.nodes.findIndex(
          (n) => n.id === currentNodeId
        );
        if (currentIndex === -1 || currentIndex >= roadmap.nodes.length - 1)
          return null;
        return roadmap.nodes[currentIndex + 1].id;
      },

      getPrevNodeId: (roadmapId, currentNodeId) => {
        const roadmap = get().roadmaps.find((r) => r.id === roadmapId);
        if (!roadmap) return null;
        const currentIndex = roadmap.nodes.findIndex(
          (n) => n.id === currentNodeId
        );
        if (currentIndex <= 0) return null;
        return roadmap.nodes[currentIndex - 1].id;
      },

      setRoadmaps: (roadmaps) => {
        set({ roadmaps });
      },

      // ─── Phase 2 Actions ───

      setModuleStatus: (roadmapId, moduleId, status) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((r) => {
            if (r.id !== roadmapId) return r;
            return {
              ...r,
              nodes: r.nodes.map((n) =>
                n.id === moduleId ? { ...n, contentStatus: status } : n
              ),
            };
          }),
        }));
      },

      injectModuleContent: (roadmapId, moduleId, content, status) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((r) => {
            if (r.id !== roadmapId) return r;
            return {
              ...r,
              nodes: r.nodes.map((n) =>
                n.id === moduleId
                  ? { ...n, contentStatus: status ?? n.contentStatus, content }
                  : n
              ),
            };
          }),
        }));
      },

      updateNodeScrollProgress: (roadmapId, nodeId, progress) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((r) => {
            if (r.id !== roadmapId) return r;
            return {
              ...r,
              nodes: r.nodes.map((n) =>
                n.id === nodeId
                  ? { ...n, maxScrollProgress: Math.max(n.maxScrollProgress || 0, progress) }
                  : n
              ),
            };
          }),
        }));
      },

      setTheme: (theme) => {
        set({ theme });
      },

      setFontSizeMultiplier: (multiplier) => {
        set({ fontSizeMultiplier: multiplier });
      },
    }),
    {
      name: "roadmap-storage",
      storage: createJSONStorage(() => mmkvStorage),
      // ─── Migration: transform legacy roadmaps on rehydration ───
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as any;
        if (state && Array.isArray(state.roadmaps)) {
          state.roadmaps = state.roadmaps.map((roadmap: any) => {
            if (!roadmap || !Array.isArray(roadmap.nodes)) return roadmap;

            const hasLegacyNodes = roadmap.nodes.some(isLegacyNode);
            if (!hasLegacyNodes) return roadmap;

            // Migrate legacy nodes to new schema
            return {
              ...roadmap,
              totalModules: roadmap.totalModules ?? roadmap.nodes.length,
              estimatedHours: roadmap.estimatedHours ?? 0,
              nodes: roadmap.nodes.map((node: LegacyNode, idx: number) => {
                const migrated: any = {
                  id: node.id,
                  index: node.index ?? idx,
                  label: node.label,
                  description: node.description ?? '',
                  prerequisites: node.prerequisites ?? [],
                  isCompleted: node.isCompleted ?? false,
                  contentStatus: node.material?.markdownBody ? 'complete' : 'idle',
                };

                // Preserve existing material as ModuleContent
                if (node.material?.markdownBody) {
                  migrated.content = {
                    moduleId: node.id,
                    markdownBody: node.material.markdownBody,
                    mermaidDiagrams: [],
                    imageQueries: [],
                    keyTakeaways: [],
                    sources: node.material.sources ?? [],
                    estimatedMinutes: 0,
                  };
                }

                return migrated;
              }),
            };
          });
        }
        return state;
      },
      version: 1,
    }
  )
);
