"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { GameProviderDTO } from "@/lib/types";
import GameProviderForm from "../GameProviderForm";

export default function EditGameProviderPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const params = useParams<{ id: string }>();
  const [provider, setProvider] = useState<GameProviderDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ gameProviders: GameProviderDTO[] | null }>("/api/admin/game-providers")
      .then((data) => {
        setProvider(data.gameProviders?.find((p) => String(p.id) === params.id) ?? null);
      })
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load game provider."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!user) return null;

  if (user.role === "editor") {
    return (
      <section id="game-provider-edit-page" className="game-provider-edit-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  return (
    <section id="game-provider-edit-page" className="game-provider-edit-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/game-providers" className="text-sm font-medium text-primary-600 hover:text-primary-900">
          ← Back to Game Providers
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-text dark:text-text-dark">Edit Game Provider</h1>
      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : provider ? (
        <GameProviderForm target={provider} />
      ) : (
        <p className="text-text-muted dark:text-text-muted-dark">Game provider not found.</p>
      )}
    </section>
  );
}
