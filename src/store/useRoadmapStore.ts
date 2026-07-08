import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "./mmkv";
import { RoadmapStore } from "./types";

export const useRoadmapStore = create<RoadmapStore>()(
  persist(
    (set, get) => ({
      roadmaps: [],

      addRoadmap: (roadmap) => {
        set((state) => ({
          roadmaps: [roadmap, ...state.roadmaps],
        }));
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
    }),
    {
      name: "roadmap-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
