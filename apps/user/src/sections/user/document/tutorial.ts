// Tutorial CDN integration removed — no AmraaNet tutorial source configured.
// Return empty results so callers degrade gracefully.

type TutorialItem = {
  title: string;
  path: string;
  subItems?: TutorialItem[];
};

export async function getTutorial(_path: string): Promise<{
  config?: Record<string, unknown>;
  content: string;
}> {
  return { content: "" };
}

export async function getTutorialList(): Promise<Map<string, TutorialItem[]>> {
  return new Map();
}
