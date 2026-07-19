// ─── Phase 2: Module Content (from POST /api/roadmap/module) ───
export type MermaidDiagram = {
  title: string;
  code: string;
};

export type ImageQuery = {
  alt: string;
  query: string;
  placement: 'hero' | 'inline' | 'sidebar';
};

export type ModuleContent = {
  moduleId: string;
  markdownBody: string;
  mermaidDiagrams: MermaidDiagram[];
  imageQueries: ImageQuery[];
  keyTakeaways: string[];
  sources: { title: string; url: string }[];
  estimatedMinutes: number;
  createdAt?: number;
};

// ─── Phase 1: Roadmap Node (from POST /api/roadmap) ───
export type ContentStatus = 'idle' | 'loading' | 'complete';

export type RoadmapNode = {
  id: string;
  index: number;
  label: string;
  description: string;
  prerequisites: string[];
  isCompleted: boolean;
  contentStatus: ContentStatus;
  content?: ModuleContent;
  maxScrollProgress?: number;
};

// ─── Roadmap Structure ───
export type Roadmap = {
  id: string;
  topic: string;
  totalModules: number;
  estimatedHours: number;
  createdAt: number;
  nodes: RoadmapNode[];
  detailLevel?: 'quick' | 'standard' | 'comprehensive';
};

// ─── Store Interface ───
export interface RoadmapStore {
  roadmaps: Roadmap[];
  addRoadmap: (roadmap: Roadmap) => void;
  deleteRoadmap: (roadmapId: string) => void;
  getRoadmapById: (roadmapId: string) => Roadmap | undefined;
  markNodeCompleted: (roadmapId: string, nodeId: string) => void;
  getNextNodeId: (roadmapId: string, currentNodeId: string) => string | null;
  getPrevNodeId: (roadmapId: string, currentNodeId: string) => string | null;
  setRoadmaps: (roadmaps: Roadmap[]) => void;
  setModuleStatus: (roadmapId: string, moduleId: string, status: ContentStatus) => void;
  injectModuleContent: (roadmapId: string, moduleId: string, content: ModuleContent, status?: ContentStatus) => void;
  updateNodeScrollProgress: (roadmapId: string, nodeId: string, progress: number) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fontSizeMultiplier: number;
  setFontSizeMultiplier: (multiplier: number) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  audience: 'school_student' | 'university_student' | 'working_professional' | null;
  setAudience: (audience: 'school_student' | 'university_student' | 'working_professional' | null) => void;
  detailLevel: 'quick' | 'standard' | 'comprehensive';
  setDetailLevel: (level: 'quick' | 'standard' | 'comprehensive') => void;
}
