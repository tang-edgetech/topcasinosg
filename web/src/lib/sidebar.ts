/**
 * Fetch helper for the Sidebar widget (Figma "Comp / Header / Sidebar"),
 * shown on every non-Home page. Same envelope-unwrapping convention as
 * every other public endpoint: { success, data: { sections } }.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const REVALIDATE_SECONDS = 60;

export interface SidebarLink {
  id: number;
  label: string;
  url: string;
  hasDropdown: boolean;
  sortOrder: number;
}

export interface SidebarSection {
  id: number;
  key: "most_popular_topics" | "region_casino_games" | "casino_bonuses";
  heading: string;
  sortOrder: number;
  links: SidebarLink[];
}

export async function getSidebarSections(): Promise<SidebarSection[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sidebar`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const body = (await res.json()) as { success?: boolean; data?: { sections?: SidebarSection[] } };
    return body.data?.sections ?? [];
  } catch {
    return [];
  }
}
