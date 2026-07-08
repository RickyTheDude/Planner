export type Material = {
  markdownBody: string;
  sources: { title: string; url: string }[];
};

export type Node = {
  id: string;
  label: string;
  isCompleted: boolean;
  material: Material;
};

export type Roadmap = {
  id: string;
  topic: string;
  createdAt: number;
  nodes: Node[];
};

export interface RoadmapStore {
  roadmaps: Roadmap[];
  addRoadmap: (roadmap: Roadmap) => void;
  deleteRoadmap: (roadmapId: string) => void;
  getRoadmapById: (roadmapId: string) => Roadmap | undefined;
  markNodeCompleted: (roadmapId: string, nodeId: string) => void;
  getNextNodeId: (roadmapId: string, currentNodeId: string) => string | null;
  getPrevNodeId: (roadmapId: string, currentNodeId: string) => string | null;
  setRoadmaps: (roadmaps: Roadmap[]) => void;
}
