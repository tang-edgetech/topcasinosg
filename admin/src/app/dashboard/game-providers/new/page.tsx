"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import GameProviderForm from "../GameProviderForm";

export default function NewGameProviderPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="game-provider-new-page" className="game-provider-new-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="game-provider-new-page" className="game-provider-new-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/game-providers" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Game Providers
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Add Game Provider</h1>
      <GameProviderForm target={null} />
    </section>
  );
}
