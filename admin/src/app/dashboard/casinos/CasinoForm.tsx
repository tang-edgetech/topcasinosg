"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, Rate, InputNumber, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { CasinoDTO, RegionDTO, GameProviderDTO, LicenseDTO, MediaDTO, RiskStatus, GameType } from "@/lib/types";
import { GAME_TYPE_LABELS } from "@/lib/types";
import { IconPhoto } from "@/components/Icons";
import MediaPicker from "@/components/media/MediaPicker";
import RichTextEditor from "@/components/content/RichTextEditor";

const { TextArea } = Input;

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090"}${url}`;
}

export default function CasinoForm({
  target,
  regions,
  gameProviders,
  licenses,
}: {
  target: CasinoDTO | null;
  regions: RegionDTO[];
  gameProviders: GameProviderDTO[];
  licenses: LicenseDTO[];
}) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [logoMediaId, setLogoMediaId] = useState<number | null>(target?.logoMediaId ?? null);
  const [logoUrl, setLogoUrl] = useState<string | null>(target?.logoUrl ? mediaUrl(target.logoUrl) : null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFinish(values: {
    slug: string;
    name: string;
    rating: number;
    summary: string;
    content: string;
    languages?: string[];
    paymentMethods?: string[];
    pros?: string[];
    cons?: string[];
    safeIndex?: number;
    riskStatus?: RiskStatus;
    supportedGames?: GameType[];
    payoutSpeed: string;
    ctaUrl: string;
    regionIds: number[];
    gameProviderIds?: number[];
    licenseIds?: number[];
  }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Casino",
      message: target ? `Update "${values.name}"?` : `Create casino "${values.name}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = { ...values, logoMediaId };
    try {
      if (target) {
        await api.put(`/api/admin/casinos/${target.id}`, body);
        message.success("Saved.");
      } else {
        await api.post("/api/admin/casinos", body);
        message.success("Casino created.");
      }
      router.push("/dashboard/casinos");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save casino.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="casino-form" className="casino-form flex max-w-2xl flex-col gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          slug: target?.slug ?? "",
          name: target?.name ?? "",
          rating: target?.rating ?? 3,
          summary: target?.summary ?? "",
          content: target?.content ?? "",
          languages: target?.languages ?? [],
          paymentMethods: target?.paymentMethods ?? [],
          pros: target?.pros ?? [],
          cons: target?.cons ?? [],
          safeIndex: target?.safeIndex ?? undefined,
          riskStatus: target?.riskStatus ?? undefined,
          supportedGames: target?.supportedGames ?? [],
          payoutSpeed: target?.payoutSpeed ?? "",
          ctaUrl: target?.ctaUrl ?? "",
          regionIds: target?.regionIds ?? [],
          gameProviderIds: target?.gameProviderIds ?? [],
          licenseIds: target?.licenseIds ?? [],
        }}
      >
        <div className="mb-4 flex flex-col gap-2">
          <label className="text-sm font-medium text-text dark:text-text-dark">Logo</label>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-surface-muted dark:bg-surface-muted-dark">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <IconPhoto width={22} height={22} className="text-primary-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-900"
            >
              Choose From Media Library
            </button>
          </div>
        </div>

        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="slug" label="Slug" rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: "Lowercase letters, numbers, hyphens only" }]}>
          <Input placeholder="eu9" />
        </Form.Item>
        <Form.Item name="rating" label="Rating">
          <Rate allowHalf />
        </Form.Item>
        <Form.Item name="summary" label="Summary">
          <TextArea rows={2} maxLength={500} showCount />
        </Form.Item>
        <Form.Item name="content" label="Full Review Content">
          <RichTextEditor id="casino-form-content" value="" onChange={() => {}} />
        </Form.Item>
        <Form.Item name="regionIds" label="Regions">
          <Select mode="multiple" options={regions.map((r) => ({ value: r.id, label: r.name }))} />
        </Form.Item>
        <Form.Item name="languages" label="Languages Supported">
          <Select mode="tags" placeholder="EN, CN, TH..." />
        </Form.Item>
        <Form.Item name="paymentMethods" label="Payment Methods">
          <Select mode="tags" placeholder="Visa, Bank Transfer..." />
        </Form.Item>
        <Form.Item name="pros" label="Positives (Pros)" extra="Comparison section on the casino review page.">
          <Select mode="tags" placeholder="Fast payouts, 24/7 support..." />
        </Form.Item>
        <Form.Item name="cons" label="Negatives (Cons)">
          <Select mode="tags" placeholder="Limited payment options, high wagering..." />
        </Form.Item>
        <Form.Item
          name="safeIndex"
          label="Safe Index (0-100)"
          extra="Independent of Risk Status below — set both to what you judge to be accurate."
        >
          <InputNumber min={0} max={100} className="w-full" />
        </Form.Item>
        <Form.Item name="riskStatus" label="Risk Status">
          <Select
            allowClear
            placeholder="Not set"
            options={[
              { value: "low", label: "Low Risk" },
              { value: "medium", label: "Medium Risk" },
              { value: "high", label: "High Risk" },
            ]}
          />
        </Form.Item>
        <Form.Item name="supportedGames" label="Games Supported">
          <Select
            mode="multiple"
            placeholder="Select supported game types"
            options={(Object.keys(GAME_TYPE_LABELS) as GameType[]).map((value) => ({
              value,
              label: GAME_TYPE_LABELS[value],
            }))}
          />
        </Form.Item>
        <Form.Item name="gameProviderIds" label="Game Providers">
          <Select mode="multiple" placeholder="Select game providers" options={gameProviders.map((p) => ({ value: p.id, label: p.name }))} />
        </Form.Item>
        <Form.Item name="licenseIds" label="Licenses">
          <Select mode="multiple" placeholder="Select licenses" options={licenses.map((l) => ({ value: l.id, label: l.name }))} />
        </Form.Item>
        <Form.Item name="payoutSpeed" label="Payout Speed">
          <Input placeholder="24-48 hours" />
        </Form.Item>
        <Form.Item name="ctaUrl" label="CTA / Affiliate URL">
          <Input placeholder="https://..." />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="casino-form-cancel"
            onClick={() => router.push("/dashboard/casinos")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="casino-form-submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </Form>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaDTO) => {
          setLogoMediaId(media.id);
          setLogoUrl(mediaUrl(media.url));
        }}
      />
    </div>
  );
}
