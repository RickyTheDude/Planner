import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage, mmkvInstance } from "./mmkv";
import { RoadmapStore } from "./types";
import { colorScheme } from "nativewind";

// Read and apply initial theme synchronously to prevent theme flash
const getInitialTheme = (): "light" | "dark" => {
  try {
    const raw = mmkvInstance.getString("roadmap-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.theme === "dark") {
        return "dark";
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
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "roadmap-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
