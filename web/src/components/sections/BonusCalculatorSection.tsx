"use client";

import { useState, type CSSProperties } from "react";
import { field, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";

type InputKey = "depositAmount" | "bonusPercentage" | "maxBonusAmount" | "wageringRequirement" | "gameContributionRate";
type WagerBasis = "bonus" | "deposit_bonus";
type CalculatorInputs = Record<InputKey, string>;
type CalculatorErrors = Partial<Record<InputKey, string>>;

const BLANK_INPUTS: CalculatorInputs = {
  depositAmount: "",
  bonusPercentage: "",
  maxBonusAmount: "",
  wageringRequirement: "",
  gameContributionRate: "",
};

interface FieldSpec {
  key: InputKey;
  label: (currency: string) => string;
  prefix?: "currency";
  suffix?: string;
}

// Figma "Var / Calculator": two grouped panels — the bonus itself (step 1),
// then the turnover conditions (step 2).
const BONUS_FIELDS: FieldSpec[] = [
  { key: "depositAmount", label: (c) => `Deposit Amount (${c})`, prefix: "currency" },
  { key: "bonusPercentage", label: () => "Bonus Percentage (%)", suffix: "%" },
  { key: "maxBonusAmount", label: (c) => `Maximum Bonus Amount (${c})`, prefix: "currency" },
];
const TURNOVER_FIELDS: FieldSpec[] = [
  { key: "wageringRequirement", label: () => "Wagering Requirement (x)", suffix: "x" },
  { key: "gameContributionRate", label: () => "Game Contribution Rate (%)", suffix: "%" },
];

const WAGER_BASIS_OPTIONS: { value: WagerBasis; label: string }[] = [
  { value: "bonus", label: "Bonus only" },
  { value: "deposit_bonus", label: "Deposit + Bonus" },
];

interface ResultRow {
  description: string;
  amount: string;
}

function validate(inputs: CalculatorInputs): CalculatorErrors {
  const errors: CalculatorErrors = {};
  for (const key of Object.keys(inputs) as InputKey[]) {
    const raw = inputs[key].trim();
    if (raw === "") errors[key] = "*Cannot be empty";
    else if (!Number.isFinite(Number(raw)) || Number(raw) < 0) errors[key] = "*Enter a positive number";
  }
  if (!errors.gameContributionRate && Number(inputs.gameContributionRate) <= 0) {
    errors.gameContributionRate = "*Must be more than 0% — this game doesn't count toward wagering";
  }
  return errors;
}

// "$" sits flush against the number; a code like "THB" gets a space.
const currencyPrefix = (currency: string) => (currency.length > 1 ? `${currency} ` : currency);

// Game Contribution Rate reduces how much of each bet counts toward the
// requirement, so the real amount to bet is the turnover divided by it.
function calculate(inputs: CalculatorInputs, basis: WagerBasis, currency: string): ResultRow[] {
  const money = (n: number) => `${currencyPrefix(currency)}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const deposit = Number(inputs.depositAmount);
  const bonus = Math.min(deposit * (Number(inputs.bonusPercentage) / 100), Number(inputs.maxBonusAmount));
  const wallet = deposit + bonus;
  const wageredAmount = basis === "bonus" ? bonus : wallet;
  const totalBet = (wageredAmount * Number(inputs.wageringRequirement)) / (Number(inputs.gameContributionRate) / 100);

  return [
    { description: "Total Bonus Received", amount: money(bonus) },
    { description: "Final Wallet Balance", amount: money(wallet) },
    { description: "Total Bet Required", amount: money(totalBet) },
  ];
}

// introHtml arrives already sanitized from the server (SectionRenderer), so
// the HTML sanitizer never ships in this client component's bundle.
export default function BonusCalculatorSection({ section, introHtml }: { section: PageSection; introHtml: string }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const subheading = field(section.fields, 0, "subheading")?.textValue ?? "";
  const currency = field(section.fields, 0, "currency")?.textValue || "$";
  const defaultBasis: WagerBasis = field(section.fields, 0, "wagerBasis")?.textValue === "deposit_bonus" ? "deposit_bonus" : "bonus";

  const [inputs, setInputs] = useState<CalculatorInputs>(BLANK_INPUTS);
  const [basis, setBasis] = useState<WagerBasis>(defaultBasis);
  const [errors, setErrors] = useState<CalculatorErrors>({});
  const [result, setResult] = useState<ResultRow[] | null>(null);

  function setField(key: InputKey, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCalculate() {
    const found = validate(inputs);
    setErrors(found);
    setResult(Object.keys(found).length === 0 ? calculate(inputs, basis, currency) : null);
  }

  function handleClear() {
    setInputs(BLANK_INPUTS);
    setBasis(defaultBasis);
    setErrors({});
    setResult(null);
  }

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const renderField = (spec: FieldSpec) => (
    <CalculatorField
      key={spec.key}
      id={`${section.id}-${spec.key}`}
      label={spec.label(currency)}
      prefix={spec.prefix === "currency" ? currency : undefined}
      suffix={spec.suffix}
      value={inputs[spec.key]}
      error={errors[spec.key]}
      onChange={(v) => setField(spec.key, v)}
    />
  );

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--bonus-calculator section--bg" : "section--bonus-calculator", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-6 py-[3.125rem]">
        {(heading || subheading || introHtml) && (
          <div className="section-row">
            <div className="section-col flex flex-col gap-2">
              {heading && <h2 className="section-heading text-[36px] leading-[43px] font-bold text-primary-900">{heading}</h2>}
              {subheading && <p className="text-lg font-semibold text-primary-900">{subheading}</p>}
              {introHtml && (
                <div
                  className="rich-text-content text-sm leading-relaxed text-primary-600"
                  dangerouslySetInnerHTML={{ __html: introHtml }}
                />
              )}
            </div>
          </div>
        )}

        <div className="section-row">
          <div className="section-col flex w-full max-w-[465px] flex-col gap-4">
            <form
              className="bonus-calculator flex flex-col gap-2.5 rounded-[30px] bg-calc-surface p-5 text-white"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleCalculate();
              }}
            >
              <fieldset className="flex flex-col gap-4 rounded-[15px] bg-calc-panel p-5">{BONUS_FIELDS.map(renderField)}</fieldset>
              <fieldset className="flex flex-col gap-4 rounded-[15px] bg-calc-panel p-5">
                {TURNOVER_FIELDS.map(renderField)}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm">Wager On</span>
                  <div role="radiogroup" aria-label="Wager on" className="grid grid-cols-2 gap-1 rounded-[20px] bg-calc-field p-1">
                    {WAGER_BASIS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={basis === option.value}
                        onClick={() => setBasis(option.value)}
                        className={`cursor-pointer rounded-[16px] px-3 py-1.5 text-sm transition-colors ${
                          basis === option.value ? "bg-white font-semibold text-primary-900" : "text-white/70 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </fieldset>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="submit"
                  className="h-[60px] cursor-pointer rounded-[5px] bg-gradient-to-b from-secondary-600 to-secondary-900 text-base font-bold text-white hover:brightness-105"
                >
                  Calculate
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-[60px] cursor-pointer rounded-[5px] bg-calc-panel text-base font-semibold text-white hover:bg-calc-field-border"
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="bonus-calculator-result flex flex-col rounded-[30px] bg-calc-surface p-5 text-white" aria-live="polite">
              <div className="flex flex-col gap-4 rounded-[20px] bg-calc-panel p-4">
                <h3 className="text-2xl font-bold">Result</h3>
                <table className="w-full border-collapse overflow-hidden text-sm">
                  <thead className="bg-primary-900">
                    <tr>
                      <th className="border border-primary-700 px-3 py-2 text-center font-medium">Description</th>
                      <th className="w-1/3 border border-primary-700 px-3 py-2 text-center font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-calc-field">
                    {result === null ? (
                      <tr>
                        <td colSpan={2} className="px-3 py-8 text-center text-white/80">
                          No calculation yet
                        </td>
                      </tr>
                    ) : (
                      result.map((row) => (
                        <tr key={row.description} className="border-t border-calc-panel">
                          <td className="px-3 py-3">{row.description}</td>
                          <td className="px-3 py-3 text-right font-semibold">{row.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalculatorField({
  id,
  label,
  prefix,
  suffix,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  prefix?: string;
  suffix?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <div
        className={`flex items-center gap-1 rounded-[20px] border bg-calc-field px-4 py-2 focus-within:border-secondary-600 ${
          error ? "border-danger" : "border-calc-field-border/60"
        }`}
      >
        {prefix && <span className="text-sm text-white/40">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          placeholder="0"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-sm text-white placeholder-white/80 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="text-sm text-white/40">{suffix}</span>}
      </div>
      {error && (
        <span id={`${id}-error`} className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
