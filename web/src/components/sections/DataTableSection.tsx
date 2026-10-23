import { field, itemIndexes, type PageSection } from "@/lib/pages";
import type { BonusType } from "@/app/[region]/_lib/api";
import DataTable, { type TableColumn } from "@/components/data-table/DataTable";
import { COLUMNS, SIMPLE_BONUS_DETAILS } from "@/components/data-table/columns";
import { loadRows } from "@/components/data-table/loadRows";
import { RichText, SectionHeader, SectionShell } from "./SectionShell";

type Preset = { columns: [string, string?][]; ctaLabel: string };

// Figma region Bonuses hub: each bonus type's table compares its own values
// (admin BonusForm DETAIL_FIELDS_BY_TYPE edits exactly these). Used by
// columnsMode "typed"; "custom" uses the editor's picked columns instead.
const TYPED_PRESETS: Record<BonusType, Preset> = {
  no_deposit: { columns: [["details", "No Deposit Bonus Details"], ["turnover", "Turnover Requirement"], ["maxClaim"], ["withdrawal"]], ctaLabel: "Activate Bonus" },
  cashback: { columns: [["details", "Cashback Details"], ["turnover", "Turnover Requirement"], ["frequency"]], ctaLabel: "Claim Here" },
  deposit: { columns: [["details", "Deposit Bonus Details"], ["turnover", "Turnover Requirement"], ["minDeposit", "Minimum Deposit"]], ctaLabel: "Claim Here" },
  welcome: { columns: [["details", "Welcome Bonus Details"], ["turnover", "Turnover Requirement"], ["withdrawal"]], ctaLabel: "Activate Offer" },
  free_spins: { columns: [["details", "Free Spin Details"], ["turnover", "Turnover Requirement"], ["provider"]], ctaLabel: "Claim Here" },
  loyalty_vip: {
    columns: [["details", "Top Benefits"], ["upgradeBonus"], ["maxRebate"], ["withdrawal", "Daily Withdrawal Amount"], ["perks"]],
    ctaLabel: "Claim Here",
  },
};

const DEFAULT_CASINO_COLUMNS: [string, string?][] = [["cashback"], ["payments"], ["rating"], ["safeIndex"]];

// One table block for every casino and bonus table on the site. source
// "casinos" lists the region's casinos (best rated first); source "bonuses"
// lists the region's bonuses of one type. Brand is always first and the CTA
// last; the columns in between are picked by the editor (one item per
// column: "column" key + optional "label") or come from a preset. Optional
// tip / recommendation boxes sit above the table and an outro below it.
// regionCode blank = the page's region. A table with no rows is left out.
export default async function DataTableSection({ section, regionCode: pageRegionCode = "" }: { section: PageSection; regionCode?: string }) {
  const value = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const source = value("source") === "bonuses" ? "bonuses" : "casinos";
  const regionCode = value("regionCode") || pageRegionCode;
  const bonusType = (value("bonusType") || "welcome") as BonusType;
  const mode = value("columnsMode") || (source === "bonuses" ? "simple" : "custom");
  const limitRaw = value("limit");
  const limit = limitRaw !== "" && Number.isFinite(Number(limitRaw)) ? Number(limitRaw) : source === "bonuses" ? 5 : 10;
  if (!regionCode || limit <= 0) return null;

  const picked = itemIndexes(section.fields)
    .map((i) => [field(section.fields, i, "column")?.textValue ?? "", field(section.fields, i, "label")?.textValue || undefined] as [string, string?])
    .filter(([key]) => key in COLUMNS);

  let columns: TableColumn[];
  let defaultCta: string;
  if (source === "bonuses" && mode !== "custom") {
    const preset = mode === "typed" ? TYPED_PRESETS[bonusType] : null;
    columns = preset ? preset.columns.map(([key, label]) => column(key, label)) : [{ key: "simple", label: SIMPLE_BONUS_DETAILS.label, def: SIMPLE_BONUS_DETAILS }];
    defaultCta = preset?.ctaLabel ?? "Claim Here";
  } else {
    columns = (picked.length > 0 ? picked : source === "casinos" ? DEFAULT_CASINO_COLUMNS : TYPED_PRESETS[bonusType].columns).map(([key, label]) => column(key, label));
    defaultCta = source === "casinos" ? "Visit Site" : "Claim Here";
  }
  const ctaLabel = value("showCta") === "no" ? null : value("ctaLabel") || defaultCta;
  const moreInfo = value("moreInfo") === "yes";

  const { rows, ctx } = await loadRows({
    source,
    regionCode,
    bonusType: source === "bonuses" ? bonusType : undefined,
    limit,
    needsProviders: columns.some((c) => c.key === "provider"),
  });
  if (rows.length === 0) return null;

  const tipHeading = value("tipHeading");
  const tipBody = value("tipBody");
  const recommendation = value("recommendation");

  return (
    <SectionShell section={section} name="data-table">
      <SectionHeader heading={value("heading")} intro={value("intro")} />
      {(tipBody || recommendation) && (
        <div className="section-row grid grid-cols-1 gap-4 lg:grid-cols-2">
          {tipBody && (
            <div className="section-col">
              {tipHeading && <h3 className="mb-2 text-sm text-primary-600">{tipHeading}</h3>}
              <RichText html={tipBody} className="caret-list text-sm text-primary-600" />
            </div>
          )}
          {recommendation && (
            <div className="section-col rounded-lg border border-primary-100 bg-surface-muted p-4">
              <h3 className="mb-1 text-base font-semibold text-primary-glow">Recommendation:</h3>
              <RichText html={recommendation} className="text-xs text-primary-600" />
            </div>
          )}
        </div>
      )}
      <DataTable rows={rows} ctx={ctx} columns={columns} ctaLabel={ctaLabel} moreInfo={moreInfo} mobile={source === "casinos" ? "swipe" : "stack"} />
      {value("outro") && (
        <div className="section-row">
          <RichText html={value("outro")} className="section-col text-sm leading-relaxed text-primary-600" />
        </div>
      )}
    </SectionShell>
  );
}

function column(key: string, label?: string): TableColumn {
  return { key, label: label ?? COLUMNS[key].label, def: COLUMNS[key] };
}
