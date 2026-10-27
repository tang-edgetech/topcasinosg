"use client";

import { useEffect, useState } from "react";
import type { PageBlockType, PageSectionFieldDTO } from "./types";

// Copy/paste of page components between pages (and global sections): the
// copied section - a container brings its components - is kept in this
// browser's localStorage, so it can be pasted on any page, in any tab, until
// something else is copied. Images keep their media library ids.
export interface CopiedSection {
  blockType: PageBlockType;
  customClass: string;
  customId: string;
  inContainer: boolean;
  fields: PageSectionFieldDTO[];
}

export interface SectionClipboard {
  label: string;
  sections: CopiedSection[];
}

const STORAGE_KEY = "tcsg-section-clipboard";
const CHANGE_EVENT = "tcsg-section-clipboard-change";

function read(): SectionClipboard | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SectionClipboard;
    return Array.isArray(parsed.sections) && parsed.sections.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function copySectionsToClipboard(clipboard: SectionClipboard): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clipboard));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function useSectionClipboard(): SectionClipboard | null {
  const [clipboard, setClipboard] = useState<SectionClipboard | null>(null);

  useEffect(() => {
    const refresh = () => setClipboard(read());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, []);

  return clipboard;
}
