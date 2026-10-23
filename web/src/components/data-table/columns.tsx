import type { ReactNode } from "react";
import type { BonusDTO, CasinoDTO, GameProviderDTO } from "@/app/[region]/_lib/api";
import CasinoLogo from "@/components/CasinoLogo";
import ScoreDisplay from "@/components/ScoreDisplay";
import PaymentMethodBadges, { type PaymentBadge } from "@/components/PaymentMethodBadges";

// One row of a data table: a casino (source "casinos") or a bonus with its
// casino (source "bonuses"). Extras are looked up once per table.
export interface DataRow {
  key: number;
  casino?: CasinoDTO;
  bonus?: BonusDTO;
  cashback: string;
  firstBonus: string;
  badges: PaymentBadge[];
}

export interface CellContext {
  providers: Map<number, GameProviderDTO>;
}

export interface ColumnDef {
  label: string;
  source: "casino" | "bonus";
  render: (row: DataRow, ctx: CellContext) => ReactNode;
}

const MAX_BADGES = 3;
const text = (value: string | null | undefined): ReactNode => value || "—";
const date = (value: string | null | undefined) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

// Every value a data table can show. Keys are stored in the section's column
// items; labels are the defaults when an editor leaves a column label blank.
// Mirrored (keys + labels) in admin BlockFields DATA_TABLE_COLUMNS.
export const COLUMNS: Record<string, ColumnDef> = {
  rating: { label: "Rating", source: "casino", render: (r) => (r.casino ? <ScoreDisplay rating={r.casino.rating} /> : "—") },
  safeIndex: {
    label: "Safe Index",
    source: "casino",
    render: (r) =>
      r.casino?.safeIndex != null ? (
        <span className="text-primary-900">
          <span className="text-2xl font-bold">{r.casino.safeIndex}</span>
          <span className="text-xs">/100</span>
        </span>
      ) : (
        "—"
      ),
  },
  cashback: { label: "Cashback Details", source: "casino", render: (r) => <span className="text-xs">{text(r.cashback)}</span> },
  topBonus: { label: "Bonuses", source: "casino", render: (r) => text(r.firstBonus) },
  payments: {
    label: "Payment Method",
    source: "casino",
    render: (r) => (r.badges.length > 0 ? <PaymentMethodBadges badges={r.badges} max={MAX_BADGES} /> : "—"),
  },
  payoutSpeed: { label: "Processing Time", source: "casino", render: (r) => text(r.casino?.payoutSpeed) },
  rtp: { label: "RTP", source: "casino", render: (r) => (r.casino?.rtpPercentage != null ? `${r.casino.rtpPercentage}%` : "—") },
  crypto: { label: "Crypto Payment", source: "casino", render: (r) => (r.casino ? (r.casino.cryptoSupported ? "Yes" : "No") : "—") },
  localBanking: { label: "Local Banking", source: "casino", render: (r) => text(r.casino?.localBankingSpeed) },
  currencies: { label: "Currencies", source: "casino", render: (r) => text((r.casino?.currencies ?? []).join(", ")) },

  details: { label: "Bonus Details", source: "bonus", render: (r) => text(r.bonus?.title) },
  terms: { label: "Terms", source: "bonus", render: (r) => text(r.bonus?.terms) },
  code: { label: "Bonus Code", source: "bonus", render: (r) => text(r.bonus?.code) },
  turnover: { label: "Wagering Requirement", source: "bonus", render: (r) => text(r.bonus?.turnoverRequirement) },
  maxClaim: { label: "Max Claim Amount", source: "bonus", render: (r) => text(r.bonus?.maxClaim) },
  withdrawal: { label: "Min Max Withdrawal", source: "bonus", render: (r) => text(r.bonus?.withdrawalLimit) },
  minDeposit: { label: "Min. Deposit", source: "bonus", render: (r) => text(r.bonus?.minDeposit) },
  frequency: { label: "Payment Frequency", source: "bonus", render: (r) => text(r.bonus?.paymentFrequency) },
  eligibleGames: { label: "Eligible Games", source: "bonus", render: (r) => text(r.bonus?.eligibleGames) },
  provider: {
    label: "Eligible Provider",
    source: "bonus",
    render: (r, ctx) => {
      const provider = r.bonus?.eligibleProviderId ? ctx.providers.get(r.bonus.eligibleProviderId) : undefined;
      return provider ? <CasinoLogo src={provider.logoUrl} name={provider.name} className="mx-auto h-8 w-16" /> : "—";
    },
  },
  pointConversion: { label: "Point Conversion Rate", source: "bonus", render: (r) => text(r.bonus?.pointConversionRate) },
  upgradeBonus: { label: "Upgrade Bonus", source: "bonus", render: (r) => text(r.bonus?.upgradeBonus) },
  maxRebate: { label: "Max Rebate", source: "bonus", render: (r) => text(r.bonus?.maxRebate) },
  perks: { label: "Perks", source: "bonus", render: (r) => text(r.bonus?.perks) },
  validUntil: { label: "Valid Until", source: "bonus", render: (r) => date(r.bonus?.validUntil) },
};

// The original "simple" bonus layout: title, terms and code in one cell.
export const SIMPLE_BONUS_DETAILS: ColumnDef = {
  label: "Bonus Details",
  source: "bonus",
  render: (r) =>
    r.bonus ? (
      <div className="text-left">
        <div className="font-semibold text-primary-900">{r.bonus.title}</div>
        <div className="text-xs">{r.bonus.terms}</div>
        {r.bonus.code && <div className="text-xs">Code: {r.bonus.code}</div>}
      </div>
    ) : (
      "—"
    ),
};
