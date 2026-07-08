import { Roadmap } from '../store/types';

export async function generateRoadmap(topic: string): Promise<Roadmap> {
  const endpoint = 'https://cognimosity-backend.vercel.app/api/roadmap';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: topic }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate roadmap: ${response.statusText}`);
  }

  const payload = await response.json();
  const data = payload.data || payload;
  
  if (data) {
    if (!data.createdAt) {
      data.createdAt = Date.now();
    }
    if (Array.isArray(data.nodes)) {
      data.nodes = data.nodes.map((node: any) => ({
        ...node,
        isCompleted: node.isCompleted ?? false,
      }));
    }
  }
  return data;
}
