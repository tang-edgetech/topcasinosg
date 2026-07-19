"use client";

import { useAuth } from "@/lib/auth-context";
import MediaLibrary from "@/components/media/MediaLibrary";

export default function MediaPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role !== "super_admin" && user.role !== "admin" && user.role !== "editor") {
    return (
      <section id="media-page" className="media-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="media-page" className="media-page flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Media Library</h1>
      <MediaLibrary />
    </section>
  );
}
