"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, InputNumber, Radio, Select, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { IconPhoto } from "@/components/Icons";
import MediaPicker from "@/components/media/MediaPicker";
import type { RTPEntryDTO, RTPCategory, RegionDTO, CasinoDTO, GameProviderDTO, MediaDTO } from "@/lib/types";

const RTP_CATEGORY_OPTIONS: { value: RTPCategory; label: string }[] = [
  { value: "slot", label: "Slot" },
  { value: "table", label: "Table game" },
  { value: "live", label: "Live casino" },
  { value: "other", label: "Other" },
];

interface FormValues {
  regionId: number;
  casinoId?: number;
  gameProviderId?: number;
  gameName: string;
  category: RTPCategory;
  rtpPercentage: number;
}

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090"}${url}`;
}

// One RTP entry = one game card in the /{region}/rtp sliders (slots in the
// first, table + live in the second, highest RTP first). The preview on the
// right mirrors that card so editors see the result while typing.
export default function RTPEntryForm({
  target,
  regions,
  casinos,
}: {
  target: RTPEntryDTO | null;
  regions: RegionDTO[];
  casinos: CasinoDTO[];
}) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState<GameProviderDTO[]>([]);
  const [imageMediaId, setImageMediaId] = useState<number | null>(target?.imageMediaId ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(target?.imageUrl ? mediaUrl(target.imageUrl) : null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const gameName = Form.useWatch("gameName", form) ?? target?.gameName ?? "";
  const rtpPercentage = Form.useWatch("rtpPercentage", form) ?? target?.rtpPercentage;
  const providerId = Form.useWatch("gameProviderId", form) ?? target?.gameProviderId ?? undefined;
  const casinoId = Form.useWatch("casinoId", form) ?? target?.casinoId ?? undefined;
  const providerName = providers.find((p) => p.id === providerId)?.name ?? "";
  const casino = casinos.find((c) => c.id === casinoId);

  useEffect(() => {
    api
      .get<{ gameProviders: GameProviderDTO[] | null }>("/api/admin/game-providers")
      .then((data) => setProviders(data.gameProviders ?? []))
      .catch(() => setProviders([]));
  }, []);

  async function handleFinish(values: FormValues) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add RTP Entry",
      message: target ? `Update "${values.gameName}"?` : `Create RTP entry "${values.gameName}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      regionId: values.regionId,
      casinoId: values.casinoId ?? null,
      gameProviderId: values.gameProviderId ?? null,
      imageMediaId,
      gameName: values.gameName,
      category: values.category,
      rtpPercentage: values.rtpPercentage,
    };
    try {
      if (target) {
        await api.put(`/api/admin/rtp/${target.id}`, body);
        message.success("RTP entry saved.");
      } else {
        await api.post("/api/admin/rtp", body);
        message.success("RTP entry created as a draft — publish it from the list to show it on the site.");
      }
      router.push("/dashboard/rtp");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save RTP entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="rtp-form" className="rtp-form flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex max-w-2xl flex-1 flex-col gap-6">
        <p className="rounded-md bg-surface-muted px-4 py-3 text-sm text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark">
          Published entries appear automatically in the game sliders on the region&apos;s RTP page, highest RTP first. Slots go in the
          slots slider; table and live games in the table games slider.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            regionId: target?.regionId ?? (regions.length === 1 ? regions[0].id : undefined),
            casinoId: target?.casinoId ?? undefined,
            gameProviderId: target?.gameProviderId ?? undefined,
            gameName: target?.gameName ?? "",
            category: target?.category ?? "slot",
            rtpPercentage: target?.rtpPercentage ?? 96,
          }}
        >
          <Form.Item name="gameName" label="Game Name" rules={[{ required: true, whitespace: true, message: "Enter the game's name." }]}>
            <Input placeholder="Gates of Olympus" />
          </Form.Item>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Radio.Group optionType="button" buttonStyle="solid" options={RTP_CATEGORY_OPTIONS} />
            </Form.Item>
            <Form.Item name="rtpPercentage" label="RTP %" rules={[{ required: true, message: "Enter the RTP between 0 and 100." }]}>
              <InputNumber className="w-full" min={0} max={100} step={0.01} precision={2} addonAfter="%" />
            </Form.Item>
          </div>
          <Form.Item
            name="gameProviderId"
            label="Provider"
            extra={
              <span>
                Shown as &quot;by …&quot; on the card. Missing one?{" "}
                <Link href="/dashboard/game-providers" className="text-primary-600 hover:text-primary-900">
                  Add it in Game Providers
                </Link>
                .
              </span>
            }
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Choose a provider"
              options={providers.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item name="regionId" label="Region" rules={[{ required: true, message: "Choose a region." }]}>
            <Select placeholder="Choose a region" options={regions.map((r) => ({ value: r.id, label: r.name }))} />
          </Form.Item>
          <Form.Item name="casinoId" label="Casino" extra="The card's Visit Site button opens this casino's link. Leave empty to show the card without a button.">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Choose a casino"
              options={casinos.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>

          <div className="mb-6 flex flex-col gap-2">
            <label className="text-sm font-medium text-text dark:text-text-dark">Card Image</label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md bg-surface-muted dark:bg-surface-muted-dark">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <IconPhoto width={22} height={22} className="text-primary-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-900"
              >
                {imageUrl ? "Change Image" : "Choose From Media Library"}
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageMediaId(null);
                    setImageUrl(null);
                  }}
                  className="cursor-pointer text-sm text-text-muted hover:text-danger dark:text-text-muted-dark"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              id="rtp-form-cancel"
              onClick={() => router.push("/dashboard/rtp")}
              className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="rtp-form-submit"
              disabled={submitting}
              className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </Form>
      </div>

      <aside id="rtp-form-preview" className="flex flex-col gap-2 lg:sticky lg:top-6">
        <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">Card Preview</span>
        <div className="flex w-[190px] flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-[130px] w-full object-cover" />
          ) : (
            <div className="flex h-[130px] w-full items-center justify-center bg-surface-muted text-xs text-text-muted">No image yet</div>
          )}
          <div className="flex flex-col gap-0.5 px-2 py-2">
            <span className="truncate text-sm font-semibold text-primary-900">{gameName || "Game name"}</span>
            {providerName && <span className="text-[10px] text-primary-500">by {providerName}</span>}
            <span className="text-2xl font-bold text-primary-900">{typeof rtpPercentage === "number" ? `${rtpPercentage.toFixed(2)}%` : "—"}</span>
            {casino ? (
              <span className="mt-1 rounded bg-primary-900 px-3 py-1.5 text-center text-sm font-semibold text-white">Visit Site</span>
            ) : (
              <span className="mt-1 text-center text-[11px] text-text-muted">No casino → no button</span>
            )}
          </div>
        </div>
      </aside>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaDTO) => {
          setImageMediaId(media.id);
          setImageUrl(mediaUrl(media.url));
        }}
      />
    </div>
  );
}
