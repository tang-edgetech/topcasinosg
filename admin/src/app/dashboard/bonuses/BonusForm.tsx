"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, DatePicker, App as AntApp } from "antd";
import dayjs from "dayjs";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type { BonusDTO, BonusType, RegionDTO, CasinoDTO, GameProviderDTO } from "@/lib/types";

const { TextArea } = Input;

const BONUS_TYPES: BonusType[] = ["welcome", "no_deposit", "free_spins", "cashback", "loyalty_vip", "deposit"];

type DetailKey =
  | "turnoverRequirement"
  | "maxClaim"
  | "withdrawalLimit"
  | "minDeposit"
  | "paymentFrequency"
  | "upgradeBonus"
  | "maxRebate"
  | "perks";

interface DetailField {
  key: DetailKey;
  label: string;
  placeholder: string;
}

// Mirrors the per-type table columns on the bonus hub/type pages (see
// web/src/components/sections/BonusListingTableSection.tsx's TYPED_COLUMNS)
// so admins only see the comparison values a bonus of this type displays.
const DETAIL_FIELDS_BY_TYPE: Record<BonusType, DetailField[]> = {
  welcome: [
    { key: "turnoverRequirement", label: "Turnover Requirement", placeholder: "30x bonus + deposit" },
    { key: "minDeposit", label: "Minimum Deposit", placeholder: "SGD 20" },
  ],
  no_deposit: [
    { key: "turnoverRequirement", label: "Turnover Requirement", placeholder: "40x bonus + winnings" },
    { key: "maxClaim", label: "Max Claim Amount", placeholder: "SGD 10" },
    { key: "withdrawalLimit", label: "Min Max Withdrawal", placeholder: "Minimum SGD 50" },
  ],
  free_spins: [{ key: "turnoverRequirement", label: "Turnover Requirement", placeholder: "30x winnings" }],
  cashback: [
    { key: "turnoverRequirement", label: "Turnover Requirement", placeholder: "No Wagering" },
    { key: "paymentFrequency", label: "Payment Frequency", placeholder: "Weekly" },
  ],
  deposit: [
    { key: "turnoverRequirement", label: "Turnover Requirement", placeholder: "20x bonus + deposit" },
    { key: "minDeposit", label: "Minimum Deposit", placeholder: "SGD 20" },
  ],
  loyalty_vip: [
    { key: "upgradeBonus", label: "Upgrade Bonus", placeholder: "SGD 3,500" },
    { key: "maxRebate", label: "Max Rebate", placeholder: "1.20%" },
    { key: "withdrawalLimit", label: "Daily Withdrawal Amount", placeholder: "By Invitation" },
    { key: "perks", label: "Perks", placeholder: "VIP manager, 3 gifts, Private Customer Service" },
  ],
};

type FormValues = {
  regionId: number;
  casinoId?: number;
  bonusType: BonusType;
  title: string;
  slug: string;
  terms: string;
  code?: string;
  validRange?: [dayjs.Dayjs, dayjs.Dayjs];
  eligibleProviderId?: number;
} & Partial<Record<DetailKey, string>>;

export default function BonusForm({
  target,
  regions,
  casinos,
}: {
  target: BonusDTO | null;
  regions: RegionDTO[];
  casinos: CasinoDTO[];
}) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState<GameProviderDTO[]>([]);
  const bonusType: BonusType = Form.useWatch("bonusType", form) ?? target?.bonusType ?? "welcome";

  useEffect(() => {
    api
      .get<{ gameProviders: GameProviderDTO[] | null }>("/api/admin/game-providers")
      .then((data) => setProviders(data.gameProviders ?? []))
      .catch(() => setProviders([]));
  }, []);

  async function handleFinish(values: FormValues) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Bonus",
      message: target ? `Update "${values.title}"?` : `Create bonus "${values.title}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      regionId: values.regionId,
      casinoId: values.casinoId ?? null,
      bonusType: values.bonusType,
      title: values.title,
      slug: values.slug,
      terms: values.terms,
      code: values.code ?? null,
      validFrom: values.validRange?.[0]?.toISOString() ?? null,
      validUntil: values.validRange?.[1]?.toISOString() ?? null,
      turnoverRequirement: values.turnoverRequirement ?? "",
      maxClaim: values.maxClaim ?? "",
      withdrawalLimit: values.withdrawalLimit ?? "",
      minDeposit: values.minDeposit ?? "",
      paymentFrequency: values.paymentFrequency ?? "",
      upgradeBonus: values.upgradeBonus ?? "",
      maxRebate: values.maxRebate ?? "",
      perks: values.perks ?? "",
      eligibleProviderId: values.eligibleProviderId ?? null,
    };
    try {
      if (target) {
        await api.put(`/api/admin/bonuses/${target.id}`, body);
        message.success("Saved.");
      } else {
        await api.post("/api/admin/bonuses", body);
        message.success("Bonus created.");
      }
      router.push("/dashboard/bonuses");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save bonus.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="bonus-form" className="bonus-form flex max-w-2xl flex-col gap-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          regionId: target?.regionId,
          casinoId: target?.casinoId ?? undefined,
          bonusType: target?.bonusType ?? "welcome",
          title: target?.title ?? "",
          slug: target?.slug ?? "",
          terms: target?.terms ?? "",
          code: target?.code ?? "",
          validRange:
            target?.validFrom && target?.validUntil ? [dayjs(target.validFrom), dayjs(target.validUntil)] : undefined,
          turnoverRequirement: target?.turnoverRequirement ?? "",
          maxClaim: target?.maxClaim ?? "",
          withdrawalLimit: target?.withdrawalLimit ?? "",
          minDeposit: target?.minDeposit ?? "",
          paymentFrequency: target?.paymentFrequency ?? "",
          upgradeBonus: target?.upgradeBonus ?? "",
          maxRebate: target?.maxRebate ?? "",
          perks: target?.perks ?? "",
          eligibleProviderId: target?.eligibleProviderId ?? undefined,
        }}
      >
        <Form.Item
          name="title"
          label="Title / Bonus Details"
          rules={[{ required: true }]}
          extra="Shown as the main bonus description in the bonus tables (e.g. “100% match up to SGD 300 + 30 free spins”)."
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="slug"
          label="Slug"
          rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: "Lowercase letters, numbers, hyphens only" }]}
          extra="Used for this bonus's public detail page: /bonuses/{slug}. Must be unique."
        >
          <Input placeholder="welcome-100-bonus" />
        </Form.Item>
        <Form.Item name="bonusType" label="Bonus Type" rules={[{ required: true }]}>
          <Select options={BONUS_TYPES.map((t) => ({ value: t, label: titleCase(t) }))} />
        </Form.Item>
        <Form.Item name="regionId" label="Region" rules={[{ required: true }]}>
          <Select options={regions.map((r) => ({ value: r.id, label: r.name }))} />
        </Form.Item>
        <Form.Item name="casinoId" label="Casino (Optional)">
          <Select allowClear options={casinos.map((c) => ({ value: c.id, label: c.name }))} />
        </Form.Item>

        <fieldset className="bonus-form__details mb-6 flex flex-col rounded-md border border-border p-4 dark:border-border-dark">
          <legend className="px-1 text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
            Comparison Details — {titleCase(bonusType)}
          </legend>
          {DETAIL_FIELDS_BY_TYPE[bonusType].map((f) => (
            <Form.Item key={f.key} name={f.key} label={f.label}>
              <Input placeholder={f.placeholder} />
            </Form.Item>
          ))}
          {bonusType === "free_spins" && (
            <Form.Item name="eligibleProviderId" label="Eligible Provider">
              <Select allowClear options={providers.map((p) => ({ value: p.id, label: p.name }))} />
            </Form.Item>
          )}
        </fieldset>

        <Form.Item name="terms" label="Terms" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="code" label="Bonus Code">
          <Input placeholder="WELCOME100" />
        </Form.Item>
        <Form.Item name="validRange" label="Valid Period">
          <DatePicker.RangePicker className="w-full" />
        </Form.Item>

        <div className="flex gap-3">
          <button
            type="button"
            id="bonus-form-cancel"
            onClick={() => router.push("/dashboard/bonuses")}
            className="btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="bonus-form-submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}
