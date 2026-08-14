"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { GameProviderDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconPlus, IconTrash, IconDice } from "@/components/Icons";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/pagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export default function GameProvidersPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [providers, setProviders] = useState<GameProviderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ gameProviders: GameProviderDTO[] | null }>("/api/admin/game-providers");
      setProviders(data.gameProviders ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load game providers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const canManage = user.role === "super_admin" || user.role === "admin";

  async function handleDelete(provider: GameProviderDTO) {
    const ok = await confirm({
      title: "Delete Game Provider",
      message: `Delete "${provider.name}"? Casinos using it will no longer show it. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/game-providers/${provider.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete game provider.");
    }
  }

  return (
    <section id="game-providers-page" className="game-providers-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Game Providers</h1>
        {canManage && (
          <IconButton
            id="game-providers-add-button"
            title="Add Game Provider"
            onClick={() => router.push("/dashboard/game-providers/new")}
            icon={<IconPlus />}
          />
        )}
      </div>

      <Table
        id="game-providers-table"
        rowKey="id"
        loading={loading}
        dataSource={providers}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showTotal: (t) => `${t} total`,
        }}
        columns={[
          {
            title: "Logo",
            key: "logo",
            render: (_, provider) => (
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted dark:border-border-dark dark:bg-surface-muted-dark">
                {provider.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(provider.logoUrl)} alt={`${provider.name} logo`} className="h-full w-full object-cover" />
                ) : (
                  <IconDice width={16} height={16} className="text-primary-400" />
                )}
              </div>
            ),
          },
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Sort Order", dataIndex: "sortOrder", key: "sortOrder" },
          ...(canManage
            ? [
                {
                  title: "Actions",
                  key: "actions",
                  render: (_: unknown, provider: GameProviderDTO) => (
                    <div className="flex gap-2">
                      <IconButton
                        id={`game-provider-${provider.id}-edit`}
                        title="Edit Game Provider"
                        onClick={() => router.push(`/dashboard/game-providers/${provider.id}`)}
                        icon={<IconEdit />}
                        variant="muted"
                      />
                      <IconButton
                        id={`game-provider-${provider.id}-delete`}
                        title="Delete Game Provider"
                        onClick={() => handleDelete(provider)}
                        icon={<IconTrash />}
                        variant="danger"
                      />
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
    </section>
  );
}
