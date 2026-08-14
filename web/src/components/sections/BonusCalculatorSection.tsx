"use client";

import { useState } from "react";
import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";

interface CalculatorInputs {
  depositAmount: string;
  bonusPercentage: string;
  maxBonusAmount: string;
  wageringRequirement: string;
  gameContributionRate: string;
}

const BLANK_INPUTS: CalculatorInputs = {
  depositAmount: "",
  bonusPercentage: "",
  maxBonusAmount: "",
  wageringRequirement: "",
  gameContributionRate: "",
};

interface ResultRow {
  description: string;
  amount: string;
}

const currency = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Wagering applies to the bonus amount only, not deposit + bonus (confirmed
// with the client — some casinos use the other convention, this site's
// calculator always assumes bonus-only). Game Contribution Rate reduces how
// much of a wagered dollar counts toward the requirement, so the actual
// amount that must be bet is the base turnover divided by that rate.
function calculateBonusResult(inputs: CalculatorInputs): ResultRow[] | null {
  const values = Object.values(inputs);
  if (values.some((v) => v.trim() === "" || Number.isNaN(Number(v)))) {
    return null;
  }

  const deposit = Number(inputs.depositAmount);
  const bonusPct = Number(inputs.bonusPercentage);
  const maxBonus = Number(inputs.maxBonusAmount);
  const wagering = Number(inputs.wageringRequirement);
  const contributionPct = Number(inputs.gameContributionRate);

  const bonusAmount = Math.min(deposit * (bonusPct / 100), maxBonus);
  const requiredTurnover = bonusAmount * wagering;

  if (contributionPct <= 0) {
    return [
      { description: "Bonus Amount", amount: currency(bonusAmount) },
      { description: "Required Turnover", amount: currency(requiredTurnover) },
      { description: "Actual Amount You Must Wager", amount: "N/A — this game doesn't count toward wagering" },
    ];
  }

  const actualWagerNeeded = requiredTurnover / (contributionPct / 100);

  return [
    { description: "Bonus Amount", amount: currency(bonusAmount) },
    { description: "Required Turnover", amount: currency(requiredTurnover) },
    { description: "Actual Amount You Must Wager", amount: currency(actualWagerNeeded) },
  ];
}

export default function BonusCalculatorSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";

  const [inputs, setInputs] = useState<CalculatorInputs>(BLANK_INPUTS);
  const [result, setResult] = useState<ResultRow[] | null>(null);

  function setField(key: keyof CalculatorInputs, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function handleCalculate() {
    setResult(calculateBonusResult(inputs));
  }

  function handleClear() {
    setInputs(BLANK_INPUTS);
    setResult(null);
  }

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--bonus-calculator", section)}>
      <div className="section-container flex flex-col gap-8 py-16">
        <div className="section-row flex flex-col">
          <div className="section-col mx-auto flex w-full max-w-3xl flex-col gap-4 text-center">
            {heading && <h2 className="section-heading text-2xl font-bold text-primary-900 sm:text-3xl">{heading}</h2>}
            {subheading && <p className="text-lg text-primary-600">{subheading}</p>}
            {intro && (
              <div
                className="rich-text-content text-left text-base leading-relaxed text-primary-600"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(intro) }}
              />
            )}
          </div>
        </div>

        <div className="section-row flex flex-col">
          <div
            id="bonus-calculator-widget"
            className="section-col mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg bg-primary-900 p-6 text-white"
          >
            <CalculatorField
              label="Deposit Amount ($)"
              value={inputs.depositAmount}
              onChange={(v) => setField("depositAmount", v)}
            />
            <CalculatorField
              label="Bonus Percentage (%)"
              value={inputs.bonusPercentage}
              onChange={(v) => setField("bonusPercentage", v)}
            />
            <CalculatorField
              label="Maximum Bonus Amount ($)"
              value={inputs.maxBonusAmount}
              onChange={(v) => setField("maxBonusAmount", v)}
            />
            <CalculatorField
              label="Wagering Requirement (x)"
              value={inputs.wageringRequirement}
              onChange={(v) => setField("wageringRequirement", v)}
            />
            <CalculatorField
              label="Game Contribution Rate (%)"
              value={inputs.gameContributionRate}
              onChange={(v) => setField("gameContributionRate", v)}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 cursor-pointer rounded-md bg-secondary-600 px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-secondary-500"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 cursor-pointer rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Clear
              </button>
            </div>

            <div className="bonus-calculator-result mt-2 rounded-md bg-white/10 p-4">
              <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wide text-white/70">
                <span>Description</span>
                <span>Amount</span>
              </div>
              {result === null ? (
                <p className="text-sm text-white/60">No calculation yet.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {result.map((row) => (
                    <li key={row.description} className="flex justify-between text-sm">
                      <span>{row.description}</span>
                      <span className="font-medium">{row.amount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalculatorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-white/80">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/40 focus:border-secondary-500 focus:outline-none"
        placeholder="0"
      />
    </label>
  );
}
