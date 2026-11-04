"use client";

// Building blocks of the component editor's Style tab (SectionBuilder,
// BlockFields): toggle buttons, four linked number boxes for padding,
// margin and gaps, a colour field with the brand swatches, and the
// background control. What they store is read back by the site in
// web/src/lib/sectionStyle.ts.
import { createContext, useContext, useState, type ReactNode } from "react";
import { Button, ColorPicker, InputNumber, Radio, Tooltip } from "antd";
import MediaField from "@/components/media/MediaField";
import { IconDesktop, IconLink, IconMobile, IconPhoto, IconTablet, IconUnlink } from "@/components/Icons";
import { useSiteSettings } from "@/lib/site-settings-context";
import type { BreakpointsDTO, MediaDTO } from "@/lib/types";

// The device being edited: the Style tab's per-device settings and the Live
// Preview's width follow it. Desktop values apply everywhere; a tablet value
// overrides on tablet and mobile, a mobile value on mobile only. They are
// stored as the same field key plus "Tablet" / "Mobile" (web/src/lib/
// sectionStyle.ts and deviceCss.ts).
export type EditDevice = "desktop" | "tablet" | "mobile";
export const DEVICE_SUFFIX: Record<EditDevice, string> = { desktop: "", tablet: "Tablet", mobile: "Mobile" };
export const DEFAULT_BREAKPOINTS: BreakpointsDTO = { tablet: 768, desktop: 1200 };

export const EditDeviceContext = createContext<{ device: EditDevice; setDevice: (device: EditDevice) => void }>({
  device: "desktop",
  setDevice: () => {},
});

export function useEditDevice() {
  return useContext(EditDeviceContext);
}

export function useBreakpoints(): BreakpointsDTO {
  const { settings } = useSiteSettings();
  return settings?.breakpoints?.tablet ? settings.breakpoints : DEFAULT_BREAKPOINTS;
}

export const DEVICE_ICONS: Record<EditDevice, ReactNode> = { desktop: <IconDesktop />, tablet: <IconTablet />, mobile: <IconMobile /> };

export function deviceRange(device: EditDevice, bp: BreakpointsDTO): string {
  if (device === "mobile") return `below ${bp.tablet}px`;
  if (device === "tablet") return `${bp.tablet}–${bp.desktop - 1}px`;
  return `${bp.desktop}px and up`;
}

// "Mobile is below 768px, ..." at the screen sizes set in Site Settings.
export function DeviceRanges() {
  const bp = useBreakpoints();
  return (
    <span className="device-ranges text-xs text-text-muted dark:text-text-muted-dark">
      Mobile is {deviceRange("mobile", bp)}, tablet {deviceRange("tablet", bp)}, desktop {deviceRange("desktop", bp)} (Site Settings).
    </span>
  );
}

// Desktop / Tablet / Mobile switch at the top of the Style tab.
export function DeviceSwitch({ id }: { id: string }) {
  const { device, setDevice } = useEditDevice();
  const bp = useBreakpoints();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Radio.Group id={id} size="small" optionType="button" buttonStyle="solid" value={device} onChange={(e) => setDevice(e.target.value)}>
        {(["desktop", "tablet", "mobile"] as EditDevice[]).map((d) => (
          <Radio.Button key={d} id={`${id}-${d}`} value={d}>
            <span className="flex h-full items-center gap-1.5">
              {DEVICE_ICONS[d]}
              {d[0].toUpperCase() + d.slice(1)}
            </span>
          </Radio.Button>
        ))}
      </Radio.Group>
      <span className="text-xs text-text-muted dark:text-text-muted-dark">
        {device === "desktop"
          ? "Editing desktop: these values apply on every screen unless tablet or mobile sets its own."
          : `Editing ${device} (${deviceRange(device, bp)}): settings marked with the ${device} icon apply here only; empty boxes keep the value shown in grey.`}
      </span>
    </div>
  );
}

// The per-device value a device starts from: desktop's for tablet, tablet's
// (or desktop's) for mobile.
export function inheritedValue(text: (key: string) => string, key: string, device: EditDevice, desktopValue = text(key)): string {
  if (device === "mobile") return text(key + DEVICE_SUFFIX.tablet) || desktopValue;
  return device === "tablet" ? desktopValue : "";
}

// Side by side, the first value set in each position: [tablet, desktop] for
// mobile, then the defaults.
export function inheritedSides(values: string[], defaults: string[] = []): string[] {
  const parsed = values.map(parseSides);
  return [0, 1, 2, 3].map((i) => parsed.map((p) => p[i]).find(Boolean) ?? defaults[i] ?? "");
}

// A titled card in the Style tab.
export function StylePanel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 rounded-md bg-surface px-4 py-3 dark:bg-surface-muted-dark ${className}`}>
      <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">{title}</span>
      {children}
    </div>
  );
}

// One setting: its label on the left (above on narrow screens), the
// control on the right.
// A responsive row shows the device being edited next to its label.
export function StyleRow({ label, hint, responsive, children }: { label: string; hint?: string; responsive?: boolean; children: ReactNode }) {
  const { device } = useEditDevice();
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
      <span className="flex items-center gap-1.5 text-sm text-text sm:w-32 sm:shrink-0 sm:pt-1 dark:text-text-dark">
        {label}
        {responsive && (
          <Tooltip title={`Set per device: now editing ${device}`}>
            <span className={`style-row__device flex ${device === "desktop" ? "text-text-muted dark:text-text-muted-dark" : "text-primary-600 dark:text-primary-300"}`}>
              {DEVICE_ICONS[device]}
            </span>
          </Tooltip>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {children}
        {hint && <span className="text-xs text-text-muted dark:text-text-muted-dark">{hint}</span>}
      </div>
    </div>
  );
}

export interface ToggleOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

// A row of toggle buttons for a short list of choices; with icons, the
// label shows as a tooltip.
export function ToggleButtons({
  id,
  value,
  options,
  onChange,
}: {
  id?: string;
  value: string;
  options: ToggleOption[];
  onChange: (value: string) => void;
}) {
  return (
    <Radio.Group
      id={id}
      size="small"
      optionType="button"
      buttonStyle="solid"
      className="style-toggle flex flex-wrap"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) =>
        o.icon ? (
          <Tooltip key={o.value} title={o.label}>
            <Radio.Button value={o.value} id={id ? `${id}-${o.value || "default"}` : undefined} aria-label={o.label}>
              <span className="flex h-full items-center gap-1.5">{o.icon}</span>
            </Radio.Button>
          </Tooltip>
        ) : (
          <Radio.Button key={o.value} value={o.value} id={id ? `${id}-${o.value || "default"}` : undefined}>
            {o.label}
          </Radio.Button>
        )
      )}
    </Radio.Group>
  );
}

// A number of pixels; empty means "default".
export function PxInput({
  id,
  value,
  onChange,
  placeholder,
  max = 2000,
  suffix = "px",
  className = "w-24",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  max?: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <InputNumber
      id={id}
      size="small"
      className={className}
      min={0}
      max={max}
      value={value === "" ? null : Number(value)}
      placeholder={placeholder}
      suffix={suffix}
      onChange={(v) => onChange(v === null || v === undefined ? "" : String(v))}
    />
  );
}

// "top right bottom left" with "-" for an unset side (web sectionStyle.ts
// boxSides); one value means all four.
export function parseSides(value: string): string[] {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]].map((p) => (p === "-" ? "" : p));
  return [0, 1, 2, 3].map((i) => (parts[i] && parts[i] !== "-" ? parts[i] : ""));
}

export function joinSides(sides: string[]): string {
  if (sides.every((s) => s === "")) return "";
  if (sides.every((s) => s === sides[0])) return sides[0];
  return sides.map((s) => s || "-").join(" ");
}

const SIDE_LABELS = ["Top", "Right", "Bottom", "Left"];

// Number boxes for each side (or each of a pair, e.g. gap between rows and
// columns) with a link button: while linked, changing one changes all.
export function SideBoxes({
  id,
  value,
  onChange,
  placeholders = [],
  labels = SIDE_LABELS,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholders?: string[];
  labels?: string[];
}) {
  const count = labels.length;
  const sides = parseSides(value).slice(0, count);
  // Linked only while every side has the same value.
  const [linkPreferred, setLinked] = useState(true);
  const linked = linkPreferred && sides.every((s) => s === sides[0]);

  function set(index: number, v: string) {
    const next = linked ? sides.map(() => v) : sides.map((s, i) => (i === index ? v : s));
    onChange(count === 4 ? joinSides(next) : next.every((s) => s === next[0]) ? next[0] : next.map((s) => s || "-").join(" "));
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      {labels.map((label, i) => (
        <label key={label} className="flex flex-col items-center gap-0.5">
          <PxInput id={`${id}-${label.toLowerCase().replace(/\s+/g, "-")}`} value={sides[i] ?? ""} placeholder={placeholders[i] ?? "–"} className="w-20" onChange={(v) => set(i, v)} />
          <span className="text-[11px] text-text-muted dark:text-text-muted-dark">{label}</span>
        </label>
      ))}
      <Tooltip title={linked ? "Linked: all change together. Click to set each one." : "Click to link, so all change together"}>
        <Button
          id={`${id}-link`}
          size="small"
          type={linked ? "primary" : "default"}
          aria-pressed={linked}
          aria-label={linked ? "Unlink sides" : "Link sides"}
          icon={linked ? <IconLink /> : <IconUnlink />}
          onClick={() => {
            if (!linked && sides.some((s) => s !== "")) {
              const first = sides.find((s) => s !== "") ?? "";
              onChange(count === 4 ? joinSides(sides.map(() => first)) : first);
            }
            setLinked(!linked);
          }}
        />
      </Tooltip>
    </div>
  );
}

// Brand colours (shared/theme/tokens.css), stored by token name so they
// follow the theme; any other colour is stored as #hex.
export const COLOR_SWATCHES: { token: string; label: string }[] = [
  { token: "primary-900", label: "Navy" },
  { token: "primary-glow", label: "Blue" },
  { token: "primary-500", label: "Muted blue" },
  { token: "primary-50", label: "Light blue-grey" },
  { token: "secondary-600", label: "Gold" },
  { token: "secondary-50", label: "Cream" },
  { token: "success", label: "Green" },
  { token: "success-subtle", label: "Mint" },
  { token: "danger", label: "Red" },
  { token: "white", label: "White" },
];

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function swatchCss(value: string): string | undefined {
  if (!value) return undefined;
  if (value === "white") return "#ffffff";
  if (HEX.test(value)) return value;
  return `var(--color-${value})`;
}

function tokenHex(token: string): string {
  if (token === "white") return "#ffffff";
  if (HEX.test(token)) return token;
  if (typeof window === "undefined") return "#000000";
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim() || "#000000";
}

export function ColorField({
  id,
  value,
  onChange,
  alpha = false,
  clearLabel = "Default",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  alpha?: boolean;
  clearLabel?: string;
}) {
  const custom = value !== "" && !COLOR_SWATCHES.some((s) => s.token === value);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {COLOR_SWATCHES.map((s) => (
        <Tooltip key={s.token} title={s.label}>
          <button
            type="button"
            id={`${id}-${s.token}`}
            aria-label={s.label}
            aria-pressed={value === s.token}
            onClick={() => onChange(s.token)}
            className={`h-6 w-6 cursor-pointer rounded-full border border-border ring-offset-1 transition dark:border-border-dark ${
              value === s.token ? "ring-2 ring-primary-glow" : "hover:scale-110"
            }`}
            style={{ background: swatchCss(s.token) }}
          />
        </Tooltip>
      ))}
      <Tooltip title="Any colour">
        <ColorPicker
          size="small"
          disabledAlpha={!alpha}
          value={value ? tokenHex(value) : undefined}
          onChangeComplete={(c) => onChange(c.toHexString())}
        >
          <button
            type="button"
            id={`${id}-custom`}
            aria-label="Any colour"
            className={`h-6 w-6 cursor-pointer rounded-full border border-border ring-offset-1 dark:border-border-dark ${custom ? "ring-2 ring-primary-glow" : ""}`}
            style={{ background: custom ? value : "conic-gradient(#ff4553, #f7b500, #00bb9e, #3139d7, #ff4553)" }}
          />
        </ColorPicker>
      </Tooltip>
      {value && (
        <Button id={`${id}-clear`} size="small" type="text" onClick={() => onChange("")}>
          {clearLabel}
        </Button>
      )}
    </div>
  );
}

export interface BackgroundValue {
  type: string; // none | color | linear | radial | image
  color: string;
  color2: string;
  angle: string;
  imageUrl: string | null;
  size: string;
  position: string;
  overlay: string;
}

const BG_TYPES: ToggleOption[] = [
  { value: "none", label: "None" },
  { value: "color", label: "Colour" },
  { value: "linear", label: "Linear gradient" },
  { value: "radial", label: "Radial gradient" },
  { value: "image", label: "Image" },
];
const BG_SIZES: ToggleOption[] = [
  { value: "cover", label: "Fill" },
  { value: "contain", label: "Fit" },
  { value: "auto", label: "Original" },
];
const BG_POSITIONS: ToggleOption[] = [
  { value: "center", label: "Centre" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];
const ANGLES = ["0", "45", "90", "135", "180"];

// Background: none, a colour, a linear or radial gradient between two
// colours, or an image with size, position and a colour laid over it.
export function BackgroundControl({
  id,
  value,
  onChange,
  onImage,
}: {
  id: string;
  value: BackgroundValue;
  onChange: (patch: Partial<BackgroundValue>) => void;
  onImage: (media: MediaDTO | null) => void;
}) {
  const type = BG_TYPES.some((t) => t.value === value.type) ? value.type : "none";
  const preview =
    type === "color"
      ? swatchCss(value.color)
      : type === "linear"
        ? `linear-gradient(${value.angle || "90"}deg, ${swatchCss(value.color) ?? "transparent"}, ${swatchCss(value.color2) ?? "transparent"})`
        : type === "radial"
          ? `radial-gradient(circle at center, ${swatchCss(value.color) ?? "transparent"}, ${swatchCss(value.color2) ?? "transparent"})`
          : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleButtons id={`${id}-type`} value={type} options={BG_TYPES} onChange={(v) => onChange({ type: v })} />
        {preview && <span aria-hidden="true" className="h-6 w-16 rounded border border-border dark:border-border-dark" style={{ background: preview }} />}
      </div>
      {type === "color" && (
        <StyleRow label="Colour">
          <ColorField id={`${id}-color`} value={value.color} onChange={(v) => onChange({ color: v })} alpha clearLabel="Clear" />
        </StyleRow>
      )}
      {(type === "linear" || type === "radial") && (
        <>
          <StyleRow label={type === "radial" ? "Centre colour" : "From"}>
            <ColorField id={`${id}-color`} value={value.color} onChange={(v) => onChange({ color: v })} alpha clearLabel="Clear" />
          </StyleRow>
          <StyleRow label={type === "radial" ? "Edge colour" : "To"}>
            <ColorField id={`${id}-color2`} value={value.color2} onChange={(v) => onChange({ color2: v })} alpha clearLabel="Clear" />
          </StyleRow>
        </>
      )}
      {type === "linear" && (
        <StyleRow label="Direction" hint="0° goes upwards, 90° left to right, 180° downwards.">
          <div className="flex flex-wrap items-center gap-2">
            <PxInput id={`${id}-angle`} value={value.angle} placeholder="90" max={360} suffix="°" onChange={(v) => onChange({ angle: v })} />
            <ToggleButtons value={ANGLES.includes(value.angle) ? value.angle : ""} options={ANGLES.map((a) => ({ value: a, label: `${a}°` }))} onChange={(v) => onChange({ angle: v })} />
          </div>
        </StyleRow>
      )}
      {type === "image" && (
        <>
          <StyleRow label="Image">
            <MediaField
              url={value.imageUrl}
              emptyIcon={<IconPhoto width={20} height={20} className="text-primary-400" />}
              onSelect={(media: MediaDTO) => onImage(media)}
              onRemove={() => onImage(null)}
            />
          </StyleRow>
          <StyleRow label="Size">
            <ToggleButtons id={`${id}-size`} value={value.size || "cover"} options={BG_SIZES} onChange={(v) => onChange({ size: v })} />
          </StyleRow>
          <StyleRow label="Position">
            <ToggleButtons id={`${id}-position`} value={value.position || "center"} options={BG_POSITIONS} onChange={(v) => onChange({ position: v })} />
          </StyleRow>
          <StyleRow label="Overlay" hint="A see-through colour over the image keeps text readable: pick one, then lower its opacity.">
            <ColorField
              id={`${id}-overlay`}
              value={value.overlay}
              // A brand swatch starts at 60% opacity, so the image still shows.
              onChange={(v) => onChange({ overlay: COLOR_SWATCHES.some((s) => s.token === v) ? `${tokenHex(v).slice(0, 7)}99` : v })}
              alpha
              clearLabel="No overlay"
            />
          </StyleRow>
        </>
      )}
    </div>
  );
}
