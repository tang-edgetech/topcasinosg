import { API_BASE_URL } from "./pages";

// Global head/body/footer code injection (Settings > Snippets in the
// admin). Same shape and fetch pattern as getRegions/getCasinos — degrade
// to empty on any failure rather than breaking the whole page.
const REVALIDATE_SECONDS = 60;

export interface ActiveSnippets {
  head: string[];
  body: string[];
  footer: string[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
}

export async function getActiveSnippets(pathname: string): Promise<ActiveSnippets> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/snippets?path=${encodeURIComponent(pathname)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return { head: [], body: [], footer: [] };

    const body = (await res.json()) as ApiEnvelope<{ head?: string[] | null; body?: string[] | null; footer?: string[] | null }>;
    return {
      head: body.data?.head ?? [],
      body: body.data?.body ?? [],
      footer: body.data?.footer ?? [],
    };
  } catch {
    return { head: [], body: [], footer: [] };
  }
}
