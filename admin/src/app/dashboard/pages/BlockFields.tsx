"use client";

import { useState } from "react";
import { Input, Select } from "antd";
import RichTextEditor from "@/components/content/RichTextEditor";
import MediaPicker from "@/components/media/MediaPicker";
import IconButton from "@/components/IconButton";
import { IconPhoto, IconPlus, IconTrash } from "@/components/Icons";
import type { MediaDTO, PageBlockType, PageFieldType } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

export function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${API_URL}${url}`;
}

export interface EditableField {
  itemIndex: number;
  fieldKey: string;
  fieldType: PageFieldType;
  textValue: string;
  mediaId: number | null;
  mediaUrl: string | null;
  urlValue: string;
  sortOrder: number;
}

function blankField(itemIndex: number, fieldKey: string, fieldType: PageFieldType, sortOrder: number): EditableField {
  return { itemIndex, fieldKey, fieldType, textValue: "", mediaId: null, mediaUrl: null, urlValue: "", sortOrder };
}

export const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  hero: "Hero Banner",
  rich_text: "Rich Text",
  icon_box_group: "Icon Box Group",
  image_gallery: "Image Gallery",
  cta: "Call To Action",
  logo_strip: "Logo Strip (Acknowledgement)",
  stats_counter: "Stats Counter (Track Record)",
  faq: "FAQ",
  bonus_calculator: "Bonus Calculator",
  bonus_listing_table: "Bonus Listing Table",
  team_grid: "Team Grid",
  top_casinos_by_region: "Top Casinos By Region",
  blacklist_preview: "Blacklist Preview",
  content_carousel: "Content Carousel (Guides/News)",
  region_explorer: "Region Explorer",
  casino_comparison_table: "Casino Comparison Table",
  event_highlights: "Event Highlights",
  introduction_section: "Introduction Section",
};

const BONUS_TYPE_OPTIONS = [
  { value: "welcome", label: "Welcome" },
  { value: "no_deposit", label: "No Deposit" },
  { value: "free_spins", label: "Free Spins" },
  { value: "deposit", label: "Deposit" },
  { value: "cashback", label: "Cashback" },
  { value: "loyalty_vip", label: "Loyalty / VIP" },
];

export type ButtonStyle = "primary" | "secondary" | "outline" | "white";

export const BUTTON_STYLE_OPTIONS: { value: ButtonStyle; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
  { value: "white", label: "White" },
];

export const COLOR_THEME_OPTIONS = [
  { value: "primary", label: "Primary (indigo)" },
  { value: "secondary", label: "Secondary (gold)" },
  { value: "white", label: "White" },
  { value: "muted", label: "Muted" },
];

const DISPLAY_MODE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "dropdown", label: "Dropdown" },
];

const LAYOUT_OPTIONS = [
  { value: "vertical", label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
];

function textField(itemIndex: number, key: string, value: string, sortOrder: number): EditableField {
  return { ...blankField(itemIndex, key, "text", sortOrder), textValue: value };
}

export function defaultFieldsForBlockType(blockType: PageBlockType): EditableField[] {
  switch (blockType) {
    case "hero":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subheading", "text", 2),
        blankField(0, "image", "image", 3),
        blankField(0, "button", "button", 4),
        textField(0, "buttonStyle", "primary", 5),
      ];
    case "rich_text":
      return [blankField(0, "heading", "text", 1), blankField(0, "body", "richtext", 2), blankField(0, "image", "image", 3)];
    case "icon_box_group":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "displayMode", "default", 2),
        textField(0, "layout", "vertical", 3),
        textField(0, "columns", "3", 4),
        textField(0, "colorNormal", "primary", 5),
        textField(0, "colorHover", "secondary", 6),
        textField(0, "colorActive", "primary", 7),
        blankField(0, "body", "richtext", 8),
      ];
    case "image_gallery":
      return [blankField(0, "heading", "text", 1)];
    case "cta":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "body", "richtext", 2),
        blankField(0, "button", "button", 3),
        textField(0, "buttonStyle", "white", 4),
      ];
    case "logo_strip":
      return [blankField(0, "heading", "text", 1)];
    case "stats_counter":
      return [blankField(0, "heading", "text", 1)];
    case "faq":
      return [blankField(0, "heading", "text", 1)];
    case "bonus_calculator":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subheading", "text", 2),
        blankField(0, "intro", "richtext", 3),
      ];
    case "bonus_listing_table":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "regionCode", "text", 2),
        textField(0, "bonusType", "welcome", 3),
        textField(0, "limit", "5", 4),
      ];
    case "team_grid":
      return [blankField(0, "heading", "text", 1)];
    case "top_casinos_by_region":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "highlightCount", "3", 2),
        textField(0, "moreCount", "5", 3),
        blankField(0, "regionCode", "text", 4),
      ];
    case "blacklist_preview":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "subheading", "text", 2),
        textField(0, "limit", "6", 3),
        textField(0, "seeAllUrl", "/blacklist", 4),
        blankField(0, "regionCode", "text", 5),
      ];
    case "content_carousel":
      return [
        blankField(0, "heading", "text", 1),
        textField(0, "sourceType", "guides", 2),
        textField(0, "mode", "manual", 3),
        textField(0, "limit", "4", 4),
        blankField(0, "seeAllUrl", "text", 5),
      ];
    case "region_explorer":
      return [blankField(0, "heading", "text", 1)];
    case "casino_comparison_table":
      return [blankField(0, "heading", "text", 1), blankField(0, "regionCode", "text", 2), textField(0, "limit", "5", 3)];
    case "event_highlights":
      return [blankField(0, "heading", "text", 1)];
    case "introduction_section":
      return [
        blankField(0, "heading", "text", 1),
        blankField(0, "highlightText", "text", 2),
        blankField(0, "subheading", "text", 3),
        blankField(0, "paragraph", "richtext", 4),
        textField(0, "theme", "blue", 5),
      ];
  }
}

// Reusable across any block that offers a responsive column count — same
// 1/2/3-at-desktop, 2-at-tablet, 1-at-mobile convention (see
// web/src/lib/pages.ts's columnsClassName). Keep new block types using this
// same field shape (fieldKey "columns", values "1"|"2"|"3") so they can
// reuse this component directly.
export function ColumnsField({
  value,
  onChange,
  label = "Columns per row (desktop ≥ 1200px)",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <LabeledField label={label}>
      <Select
        value={value || "3"}
        onChange={onChange}
        options={[
          { value: "1", label: "1 column" },
          { value: "2", label: "2 columns" },
          { value: "3", label: "3 columns" },
        ]}
      />
    </LabeledField>
  );
}

// Shared by every button field so a button's text/url/style edit together
// in one upsert pass, keeping the two EAV rows (the "button" field and its
// sibling "<key>Style" field) in sync.
function applyButtonFieldPatch(
  fields: EditableField[],
  itemIndex: number,
  buttonKey: string,
  styleKey: string,
  sortOrderBase: number,
  current: { textValue: string; urlValue: string; styleValue: string },
  patch: { textValue?: string; urlValue?: string; styleValue?: string }
): EditableField[] {
  let next = fields;
  if (patch.textValue !== undefined || patch.urlValue !== undefined) {
    next = upsertField(next, itemIndex, buttonKey, "button", sortOrderBase, {
      textValue: patch.textValue ?? current.textValue,
      urlValue: patch.urlValue ?? current.urlValue,
    });
  }
  if (patch.styleValue !== undefined) {
    next = upsertField(next, itemIndex, styleKey, "text", sortOrderBase + 1, { textValue: patch.styleValue });
  }
  return next;
}

function getField(fields: EditableField[], itemIndex: number, fieldKey: string): EditableField | undefined {
  return fields.find((f) => f.itemIndex === itemIndex && f.fieldKey === fieldKey);
}

function upsertField(
  fields: EditableField[],
  itemIndex: number,
  fieldKey: string,
  fieldType: PageFieldType,
  sortOrder: number,
  patch: Partial<EditableField>
): EditableField[] {
  const idx = fields.findIndex((f) => f.itemIndex === itemIndex && f.fieldKey === fieldKey);
  if (idx >= 0) {
    const next = [...fields];
    next[idx] = { ...next[idx], ...patch };
    return next;
  }
  return [...fields, { ...blankField(itemIndex, fieldKey, fieldType, sortOrder), ...patch }];
}

function itemIndexes(fields: EditableField[]): number[] {
  return Array.from(new Set(fields.filter((f) => f.itemIndex > 0).map((f) => f.itemIndex))).sort((a, b) => a - b);
}

function nextItemIndex(fields: EditableField[]): number {
  const items = itemIndexes(fields);
  return items.length > 0 ? Math.max(...items) + 1 : 1;
}

// ---- Field atoms ---------------------------------------------------------

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">{label}</label>
      {children}
    </div>
  );
}

function TextInputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <LabeledField label={label}>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </LabeledField>
  );
}

function RichTextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <LabeledField label={label}>
      <RichTextEditor value={value} onChange={onChange} />
    </LabeledField>
  );
}

function ImagePickerField({
  label,
  mediaId,
  mediaUrl: url,
  onChange,
}: {
  label: string;
  mediaId: number | null;
  mediaUrl: string | null;
  onChange: (mediaId: number, mediaUrl: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <LabeledField label={label}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-surface-muted dark:bg-surface-muted-dark">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <IconPhoto width={20} height={20} className="text-primary-400" />
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
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaDTO) => onChange(media.id, mediaUrl(media.url))}
      />
    </LabeledField>
  );
}

function ButtonField({
  label,
  textValue,
  urlValue,
  styleValue,
  onChange,
}: {
  label: string;
  textValue: string;
  urlValue: string;
  styleValue: string;
  onChange: (patch: { textValue?: string; urlValue?: string; styleValue?: string }) => void;
}) {
  return (
    <LabeledField label={label}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Input placeholder="Button label" value={textValue} onChange={(e) => onChange({ textValue: e.target.value })} />
        <Input placeholder="Link URL (e.g. /casinos)" value={urlValue} onChange={(e) => onChange({ urlValue: e.target.value })} />
        <Select value={styleValue || "primary"} onChange={(v) => onChange({ styleValue: v })} options={BUTTON_STYLE_OPTIONS} />
      </div>
    </LabeledField>
  );
}

// ---- Per-block-type composed editors -------------------------------------

interface BlockFieldsProps {
  blockType: PageBlockType;
  fields: EditableField[];
  onChange: (fields: EditableField[]) => void;
}

export default function BlockFieldEditor({ blockType, fields, onChange }: BlockFieldsProps) {
  switch (blockType) {
    case "hero":
      return <HeroFields fields={fields} onChange={onChange} />;
    case "rich_text":
      return <RichTextBlockFields fields={fields} onChange={onChange} />;
    case "icon_box_group":
      return <IconBoxGroupFields fields={fields} onChange={onChange} />;
    case "image_gallery":
      return <ImageGalleryFields fields={fields} onChange={onChange} />;
    case "cta":
      return <CTAFields fields={fields} onChange={onChange} />;
    case "logo_strip":
      return <LogoStripFields fields={fields} onChange={onChange} />;
    case "stats_counter":
      return <StatsCounterFields fields={fields} onChange={onChange} />;
    case "faq":
      return <FaqFields fields={fields} onChange={onChange} />;
    case "bonus_calculator":
      return <BonusCalculatorFields fields={fields} onChange={onChange} />;
    case "bonus_listing_table":
      return <BonusListingTableFields fields={fields} onChange={onChange} />;
    case "team_grid":
      return <TeamGridFields fields={fields} onChange={onChange} />;
    case "top_casinos_by_region":
      return <TopCasinosByRegionFields fields={fields} onChange={onChange} />;
    case "blacklist_preview":
      return <BlacklistPreviewFields fields={fields} onChange={onChange} />;
    case "content_carousel":
      return <ContentCarouselFields fields={fields} onChange={onChange} />;
    case "region_explorer":
      return <RegionExplorerFields fields={fields} onChange={onChange} />;
    case "casino_comparison_table":
      return <CasinoComparisonTableFields fields={fields} onChange={onChange} />;
    case "event_highlights":
      return <EventHighlightsFields fields={fields} onChange={onChange} />;
    case "introduction_section":
      return <IntroductionSectionFields fields={fields} onChange={onChange} />;
  }
}

function HeroFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subheading = getField(fields, 0, "subheading");
  const image = getField(fields, 0, "image");
  const button = getField(fields, 0, "button");
  const buttonStyle = getField(fields, 0, "buttonStyle");
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Subheading"
        value={subheading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 2, { textValue: v }))}
      />
      <ImagePickerField
        label="Image"
        mediaId={image?.mediaId ?? null}
        mediaUrl={image?.mediaUrl ?? null}
        onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, 0, "image", "image", 3, { mediaId, mediaUrl }))}
      />
      <ButtonField
        label="Button"
        textValue={button?.textValue ?? ""}
        urlValue={button?.urlValue ?? ""}
        styleValue={buttonStyle?.textValue ?? "primary"}
        onChange={(patch) =>
          onChange(
            applyButtonFieldPatch(
              fields,
              0,
              "button",
              "buttonStyle",
              4,
              { textValue: button?.textValue ?? "", urlValue: button?.urlValue ?? "", styleValue: buttonStyle?.textValue ?? "primary" },
              patch
            )
          )
        }
      />
    </div>
  );
}

function RichTextBlockFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const body = getField(fields, 0, "body");
  const image = getField(fields, 0, "image");
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading (optional)"
        value={heading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Body"
        value={body?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "body", "richtext", 2, { textValue: v }))}
      />
      <ImagePickerField
        label="Image (optional — shown side-by-side with the body when set)"
        mediaId={image?.mediaId ?? null}
        mediaUrl={image?.mediaUrl ?? null}
        onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, 0, "image", "image", 3, { mediaId, mediaUrl }))}
      />
    </div>
  );
}

function CTAFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const body = getField(fields, 0, "body");
  const button = getField(fields, 0, "button");
  const buttonStyle = getField(fields, 0, "buttonStyle");
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Text"
        value={body?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "body", "richtext", 2, { textValue: v }))}
      />
      <ButtonField
        label="Button"
        textValue={button?.textValue ?? ""}
        urlValue={button?.urlValue ?? ""}
        styleValue={buttonStyle?.textValue ?? "white"}
        onChange={(patch) =>
          onChange(
            applyButtonFieldPatch(
              fields,
              0,
              "button",
              "buttonStyle",
              3,
              { textValue: button?.textValue ?? "", urlValue: button?.urlValue ?? "", styleValue: buttonStyle?.textValue ?? "white" },
              patch
            )
          )
        }
      />
    </div>
  );
}

function IconBoxGroupFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const body = getField(fields, 0, "body");
  const displayMode = getField(fields, 0, "displayMode")?.textValue || "default";
  const layout = getField(fields, 0, "layout")?.textValue || "vertical";
  const columns = getField(fields, 0, "columns")?.textValue || "3";
  const colorNormal = getField(fields, 0, "colorNormal")?.textValue || "primary";
  const colorHover = getField(fields, 0, "colorHover")?.textValue || "secondary";
  const colorActive = getField(fields, 0, "colorActive")?.textValue || "primary";
  const items = itemIndexes(fields);

  function setStyleField(key: string, sortOrder: number, value: string) {
    onChange(upsertField(fields, 0, key, "text", sortOrder, { textValue: value }));
  }

  function addBox() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "icon", "image", 1),
      blankField(idx, "heading", "text", 2),
      blankField(idx, "text", "richtext", 3),
    ]);
  }

  function removeBox(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Our Review Process"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <RichTextField
        label="Section Paragraph (optional)"
        value={body?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "body", "richtext", 8, { textValue: v }))}
      />

      <div className="icon-box-style-row grid grid-cols-2 gap-3 rounded-md bg-surface-muted p-4 sm:grid-cols-3 dark:bg-surface-muted-dark">
        <LabeledField label="Display">
          <Select value={displayMode} onChange={(v) => setStyleField("displayMode", 2, v)} options={DISPLAY_MODE_OPTIONS} />
        </LabeledField>
        {displayMode === "default" && (
          <LabeledField label="Layout">
            <Select value={layout} onChange={(v) => setStyleField("layout", 3, v)} options={LAYOUT_OPTIONS} />
          </LabeledField>
        )}
        <ColumnsField value={columns} onChange={(v) => setStyleField("columns", 4, v)} label="Columns (desktop)" />
        <LabeledField label="Normal Color">
          <Select value={colorNormal} onChange={(v) => setStyleField("colorNormal", 5, v)} options={COLOR_THEME_OPTIONS} />
        </LabeledField>
        <LabeledField label="Hover Color">
          <Select value={colorHover} onChange={(v) => setStyleField("colorHover", 6, v)} options={COLOR_THEME_OPTIONS} />
        </LabeledField>
        <LabeledField label={displayMode === "dropdown" ? "Active (Open) Color" : "Active Color"}>
          <Select value={colorActive} onChange={(v) => setStyleField("colorActive", 7, v)} options={COLOR_THEME_OPTIONS} />
        </LabeledField>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const icon = getField(fields, itemIndex, "icon");
          const boxHeading = getField(fields, itemIndex, "heading");
          const boxText = getField(fields, itemIndex, "text");
          const button = getField(fields, itemIndex, "button");
          const buttonStyle = getField(fields, itemIndex, "buttonStyle");
          return (
            <div
              key={itemIndex}
              className="icon-box-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Box {itemIndex}</span>
                <IconButton
                  id={`icon-box-${itemIndex}-remove`}
                  title="Remove Box"
                  onClick={() => removeBox(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Icon"
                mediaId={icon?.mediaId ?? null}
                mediaUrl={icon?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "icon", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Heading"
                value={boxHeading?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "heading", "text", 2, { textValue: v }))}
              />
              <RichTextField
                label="Text"
                value={boxText?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "text", "richtext", 3, { textValue: v }))}
              />
              <ButtonField
                label="CTA Button (optional — hidden if the label is left blank)"
                textValue={button?.textValue ?? ""}
                urlValue={button?.urlValue ?? ""}
                styleValue={buttonStyle?.textValue ?? "primary"}
                onChange={(patch) =>
                  onChange(
                    applyButtonFieldPatch(
                      fields,
                      itemIndex,
                      "button",
                      "buttonStyle",
                      4,
                      { textValue: button?.textValue ?? "", urlValue: button?.urlValue ?? "", styleValue: buttonStyle?.textValue ?? "primary" },
                      patch
                    )
                  )
                }
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addBox}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Box
      </button>
    </div>
  );
}

function ImageGalleryFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addImage() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "image", "image", 1), blankField(idx, "caption", "text", 2)]);
  }

  function removeImage(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading (optional)"
        value={heading?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((itemIndex) => {
          const image = getField(fields, itemIndex, "image");
          const caption = getField(fields, itemIndex, "caption");
          return (
            <div
              key={itemIndex}
              className="gallery-item flex flex-col gap-2 rounded-md border border-border p-3 dark:border-border-dark"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">
                  Image {itemIndex}
                </span>
                <IconButton
                  id={`gallery-image-${itemIndex}-remove`}
                  title="Remove Image"
                  onClick={() => removeImage(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Image"
                mediaId={image?.mediaId ?? null}
                mediaUrl={image?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "image", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Caption (optional)"
                value={caption?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "caption", "text", 2, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addImage}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Image
      </button>
    </div>
  );
}

function LogoStripFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addLogo() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "logo", "image", 1), blankField(idx, "name", "text", 2), blankField(idx, "url", "text", 3)]);
  }

  function removeLogo(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading (optional)"
        value={heading?.textValue ?? ""}
        placeholder="Trusted & Licensed"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((itemIndex) => {
          const logo = getField(fields, itemIndex, "logo");
          const name = getField(fields, itemIndex, "name");
          const url = getField(fields, itemIndex, "url");
          return (
            <div key={itemIndex} className="logo-strip-item flex flex-col gap-2 rounded-md border border-border p-3 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Logo {itemIndex}</span>
                <IconButton
                  id={`logo-strip-${itemIndex}-remove`}
                  title="Remove Logo"
                  onClick={() => removeLogo(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Logo"
                mediaId={logo?.mediaId ?? null}
                mediaUrl={logo?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "logo", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Name"
                value={name?.textValue ?? ""}
                placeholder="PAGCOR"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "name", "text", 2, { textValue: v }))}
              />
              <TextInputField
                label="Link (optional)"
                value={url?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "url", "text", 3, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addLogo}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Logo
      </button>
    </div>
  );
}

function StatsCounterFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addStat() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "prefix", "text", 1),
      blankField(idx, "number", "text", 2),
      blankField(idx, "suffix", "text", 3),
      blankField(idx, "title", "text", 4),
      blankField(idx, "content", "text", 5),
    ]);
  }

  function removeStat(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Our Track Record"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const prefix = getField(fields, itemIndex, "prefix");
          const number = getField(fields, itemIndex, "number");
          const suffix = getField(fields, itemIndex, "suffix");
          const title = getField(fields, itemIndex, "title");
          const content = getField(fields, itemIndex, "content");
          return (
            <div
              key={itemIndex}
              className="stats-counter-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Stat {itemIndex}</span>
                <IconButton
                  id={`stat-${itemIndex}-remove`}
                  title="Remove Stat"
                  onClick={() => removeStat(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <TextInputField
                  label="Prefix"
                  value={prefix?.textValue ?? ""}
                  placeholder="e.g. +"
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "prefix", "text", 1, { textValue: v }))}
                />
                <TextInputField
                  label="Number"
                  value={number?.textValue ?? ""}
                  placeholder="50"
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "number", "text", 2, { textValue: v }))}
                />
                <TextInputField
                  label="Suffix"
                  value={suffix?.textValue ?? ""}
                  placeholder="e.g. +"
                  onChange={(v) => onChange(upsertField(fields, itemIndex, "suffix", "text", 3, { textValue: v }))}
                />
              </div>
              <TextInputField
                label="Title"
                value={title?.textValue ?? ""}
                placeholder="Casinos Reviewed"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 4, { textValue: v }))}
              />
              <TextInputField
                label="Description (optional)"
                value={content?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "content", "text", 5, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addStat}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Stat
      </button>
    </div>
  );
}

function FaqFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addFaq() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "question", "text", 1), blankField(idx, "answer", "richtext", 2)]);
  }

  function removeFaq(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Frequently Asked Questions"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />

      <div className="flex flex-col gap-3">
        {items.map((itemIndex) => {
          const question = getField(fields, itemIndex, "question");
          const answer = getField(fields, itemIndex, "answer");
          return (
            <div key={itemIndex} className="faq-item flex flex-col gap-3 rounded-md border border-border p-4 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Question {itemIndex}</span>
                <IconButton
                  id={`faq-${itemIndex}-remove`}
                  title="Remove Question"
                  onClick={() => removeFaq(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <TextInputField
                label="Question"
                value={question?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "question", "text", 1, { textValue: v }))}
              />
              <RichTextField
                label="Answer"
                value={answer?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "answer", "richtext", 2, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addFaq}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Question
      </button>
    </div>
  );
}

// Only the surrounding copy is admin-editable here — the widget's 5 inputs
// (deposit amount, bonus %, max bonus, wagering requirement, game
// contribution rate) and the calculation itself are fixed in
// BonusCalculatorSection on the web side, not configurable per-page (wagering
// applies to the bonus amount only, not deposit+bonus — see that file).
// Surrounding content (how-it-works steps, bonus type examples, FAQ) should
// be authored as separate rich_text/icon_box_group/faq blocks on the same
// page rather than folded into this one.
function BonusCalculatorFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subheading = getField(fields, 0, "subheading");
  const intro = getField(fields, 0, "intro");
  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Top-Rated Online Casino Bonus Calculator"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Subheading (optional)"
        value={subheading?.textValue ?? ""}
        placeholder="Check Your Real Bonus ROI"
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 2, { textValue: v }))}
      />
      <RichTextField
        label="Intro Text (optional)"
        value={intro?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "intro", "richtext", 3, { textValue: v }))}
      />
    </div>
  );
}

// Live data block — no static copy beyond the heading. Pulls published
// Bonus rows matching regionCode + bonusType at render time on the web side
// (web/src/components/sections/BonusListingTableSection.tsx), rather than
// storing bonus data on the page itself.
function BonusListingTableFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const regionCode = getField(fields, 0, "regionCode");
  const bonusType = getField(fields, 0, "bonusType")?.textValue || "welcome";
  const limit = getField(fields, 0, "limit");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Latest Welcome Bonuses"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Region Code"
        value={regionCode?.textValue ?? ""}
        placeholder="th"
        onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 2, { textValue: v }))}
      />
      <LabeledField label="Bonus Type">
        <Select value={bonusType} onChange={(v) => onChange(upsertField(fields, 0, "bonusType", "text", 3, { textValue: v }))} options={BONUS_TYPE_OPTIONS} />
      </LabeledField>
      <TextInputField
        label="Max Rows"
        value={limit?.textValue ?? "5"}
        onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 4, { textValue: v }))}
      />
    </div>
  );
}

function TeamGridFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addMember() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "photo", "image", 1),
      blankField(idx, "name", "text", 2),
      blankField(idx, "title", "text", 3),
      blankField(idx, "quote", "text", 4),
    ]);
  }

  function removeMember(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Expert Team Behind the Reviews"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((itemIndex) => {
          const photo = getField(fields, itemIndex, "photo");
          const name = getField(fields, itemIndex, "name");
          const title = getField(fields, itemIndex, "title");
          const quote = getField(fields, itemIndex, "quote");
          return (
            <div key={itemIndex} className="team-member-item flex flex-col gap-2 rounded-md border border-border p-3 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Member {itemIndex}</span>
                <IconButton
                  id={`team-member-${itemIndex}-remove`}
                  title="Remove Member"
                  onClick={() => removeMember(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Photo"
                mediaId={photo?.mediaId ?? null}
                mediaUrl={photo?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "photo", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Name"
                value={name?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "name", "text", 2, { textValue: v }))}
              />
              <TextInputField
                label="Title"
                value={title?.textValue ?? ""}
                placeholder="Casino Reviewer"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 3, { textValue: v }))}
              />
              <TextInputField
                label="Quote (optional)"
                value={quote?.textValue ?? ""}
                onChange={(v) => onChange(upsertField(fields, itemIndex, "quote", "text", 4, { textValue: v }))}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addMember}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Member
      </button>
    </div>
  );
}

// Live data block — no per-item admin content. For every active region (see
// web's getRegions()), the web renderer fetches that region's casinos
// (already sorted by rating desc, GET /api/casinos?region=X) and splits them
// into `highlightCount` highlight cards + the next `moreCount` in a table.
function TopCasinosByRegionFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const highlightCount = getField(fields, 0, "highlightCount");
  const moreCount = getField(fields, 0, "moreCount");
  const regionCode = getField(fields, 0, "regionCode");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Top Rated Casino of the Month by Country"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Highlighted Casinos per Region"
        value={highlightCount?.textValue ?? "3"}
        onChange={(v) => onChange(upsertField(fields, 0, "highlightCount", "text", 2, { textValue: v }))}
      />
      <TextInputField
        label="More Casinos per Region (table rows) — ignored if Region Code is set"
        value={moreCount?.textValue ?? "5"}
        onChange={(v) => onChange(upsertField(fields, 0, "moreCount", "text", 3, { textValue: v }))}
      />
      <TextInputField
        label="Region Code (optional — leave blank to loop every active region)"
        value={regionCode?.textValue ?? ""}
        placeholder="th"
        onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 4, { textValue: v }))}
      />
    </div>
  );
}

// Live data block — fetches the most recently added published Blacklist
// entries (GET /api/blacklist, no region filter) at render time; only the
// surrounding copy and row count are admin-configured.
function BlacklistPreviewFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const subheading = getField(fields, 0, "subheading");
  const limit = getField(fields, 0, "limit");
  const seeAllUrl = getField(fields, 0, "seeAllUrl");
  const regionCode = getField(fields, 0, "regionCode");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Blacklisted Casinos to Avoid"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Subheading (optional)"
        value={subheading?.textValue ?? ""}
        placeholder="What Makes a Casino Get Blacklisted?"
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 2, { textValue: v }))}
      />
      <TextInputField
        label="Max Entries"
        value={limit?.textValue ?? "6"}
        onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 3, { textValue: v }))}
      />
      <TextInputField
        label="Region Code (optional — leave blank for global entries only)"
        value={regionCode?.textValue ?? ""}
        placeholder="th"
        onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 5, { textValue: v }))}
      />
      <TextInputField
        label={'"See All" Link'}
        value={seeAllUrl?.textValue ?? "/blacklist"}
        onChange={(v) => onChange(upsertField(fields, 0, "seeAllUrl", "text", 4, { textValue: v }))}
      />
    </div>
  );
}

const CAROUSEL_SOURCE_OPTIONS = [
  { value: "guides", label: "Guides" },
  { value: "news", label: "News" },
];

const CAROUSEL_MODE_OPTIONS = [
  { value: "manual", label: "Manually picked" },
  { value: "latest", label: "Latest (auto)" },
];

// One reusable carousel block covers all 3 Homepage instances (Guides
// Winning Strategies, How to Play, Latest Casino News) — Guide has no
// category field to auto-split "Winning Strategies" from "How to Play", so
// Guides carousels are always manually curated by slug; News has no such
// split need, so it supports "latest" auto mode too.
function ContentCarouselFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const sourceType = getField(fields, 0, "sourceType")?.textValue || "guides";
  const mode = getField(fields, 0, "mode")?.textValue || "manual";
  const limit = getField(fields, 0, "limit");
  const seeAllUrl = getField(fields, 0, "seeAllUrl");
  const items = itemIndexes(fields);

  function addItem() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "slug", "text", 1)]);
  }

  function removeItem(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Casino Guides: Winning Strategies"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Source">
          <Select
            value={sourceType}
            onChange={(v) => onChange(upsertField(fields, 0, "sourceType", "text", 2, { textValue: v }))}
            options={CAROUSEL_SOURCE_OPTIONS}
          />
        </LabeledField>
        <LabeledField label="Mode">
          <Select
            value={mode}
            onChange={(v) => onChange(upsertField(fields, 0, "mode", "text", 3, { textValue: v }))}
            options={CAROUSEL_MODE_OPTIONS}
          />
        </LabeledField>
      </div>
      <TextInputField
        label="Max Items"
        value={limit?.textValue ?? "4"}
        onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 4, { textValue: v }))}
      />
      <TextInputField
        label={'"See All" Link (optional)'}
        value={seeAllUrl?.textValue ?? ""}
        placeholder="/guides"
        onChange={(v) => onChange(upsertField(fields, 0, "seeAllUrl", "text", 5, { textValue: v }))}
      />

      {mode === "manual" && (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
            Featured Items (by slug, in order)
          </label>
          {items.map((itemIndex) => {
            const slug = getField(fields, itemIndex, "slug");
            return (
              <div key={itemIndex} className="flex items-center gap-2">
                <Input
                  value={slug?.textValue ?? ""}
                  placeholder="how-to-pick-the-right-casino"
                  onChange={(e) => onChange(upsertField(fields, itemIndex, "slug", "text", 1, { textValue: e.target.value }))}
                />
                <IconButton
                  id={`carousel-item-${itemIndex}-remove`}
                  title="Remove Item"
                  onClick={() => removeItem(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
            );
          })}
          <button
            type="button"
            onClick={addItem}
            className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
          >
            <IconPlus width={14} height={14} />
            Add Item
          </button>
        </div>
      )}
    </div>
  );
}

// Live data block — no per-item admin content. The web renderer lists every
// active Region (GET /api/regions) as a link to /{regionCode}; only the
// heading is admin-authored.
function RegionExplorerFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Explore Online Casinos by Region"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
    </div>
  );
}

// Live data block — no per-item admin content. The web renderer fetches
// that region's casinos (GET /api/casinos?region=X, already sorted by
// rating desc) and shows Brand/Bonus/Payment Methods/Payout Speed/Rating
// for the top `limit` — no per-casino admin curation needed since it's
// always the region's own ranked list.
function CasinoComparisonTableFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const regionCode = getField(fields, 0, "regionCode");
  const limit = getField(fields, 0, "limit");

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Comparison of Thailand Online Casino Ratings"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Region Code"
        value={regionCode?.textValue ?? ""}
        placeholder="th"
        onChange={(v) => onChange(upsertField(fields, 0, "regionCode", "text", 2, { textValue: v }))}
      />
      <TextInputField
        label="Max Rows"
        value={limit?.textValue ?? "5"}
        onChange={(v) => onChange(upsertField(fields, 0, "limit", "text", 3, { textValue: v }))}
      />
    </div>
  );
}

// Purely admin-authored promo banner cards — no backing entity (Bonus has
// no image field), same convention as Team Grid.
function EventHighlightsFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const items = itemIndexes(fields);

  function addEvent() {
    const idx = nextItemIndex(fields);
    onChange([
      ...fields,
      blankField(idx, "image", "image", 1),
      blankField(idx, "title", "text", 2),
      blankField(idx, "dateRange", "text", 3),
      blankField(idx, "button", "button", 4),
    ]);
  }

  function removeEvent(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Section Heading"
        value={heading?.textValue ?? ""}
        placeholder="Event Highlights"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((itemIndex) => {
          const image = getField(fields, itemIndex, "image");
          const title = getField(fields, itemIndex, "title");
          const dateRange = getField(fields, itemIndex, "dateRange");
          const button = getField(fields, itemIndex, "button");
          return (
            <div key={itemIndex} className="event-highlight-item flex flex-col gap-2 rounded-md border border-border p-3 dark:border-border-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase dark:text-text-muted-dark">Event {itemIndex}</span>
                <IconButton
                  id={`event-highlight-${itemIndex}-remove`}
                  title="Remove Event"
                  onClick={() => removeEvent(itemIndex)}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
              <ImagePickerField
                label="Banner Image"
                mediaId={image?.mediaId ?? null}
                mediaUrl={image?.mediaUrl ?? null}
                onChange={(mediaId, mediaUrl) => onChange(upsertField(fields, itemIndex, "image", "image", 1, { mediaId, mediaUrl }))}
              />
              <TextInputField
                label="Title"
                value={title?.textValue ?? ""}
                placeholder="Huat Spin Giveaway"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "title", "text", 2, { textValue: v }))}
              />
              <TextInputField
                label="Date Range"
                value={dateRange?.textValue ?? ""}
                placeholder="19 Jan - 15 Feb, 2025"
                onChange={(v) => onChange(upsertField(fields, itemIndex, "dateRange", "text", 3, { textValue: v }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextInputField
                  label="Button Label"
                  value={button?.textValue ?? ""}
                  placeholder="Visit Site"
                  onChange={(v) =>
                    onChange(upsertField(fields, itemIndex, "button", "button", 4, { textValue: v, urlValue: button?.urlValue ?? "" }))
                  }
                />
                <TextInputField
                  label="Button Link"
                  value={button?.urlValue ?? ""}
                  onChange={(v) =>
                    onChange(upsertField(fields, itemIndex, "button", "button", 4, { textValue: button?.textValue ?? "", urlValue: v }))
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addEvent}
        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
      >
        <IconPlus width={14} height={14} />
        Add Event
      </button>
    </div>
  );
}

const INTRO_THEME_OPTIONS = [
  { value: "blue", label: "Blue (default)" },
  { value: "red", label: "Red (e.g. Blacklist)" },
];

// Every non-Home page's first section (Figma "Introduction Section") —
// heading with one highlighted substring, subheading, paragraph, and an
// optional page-menu link list (first item renders as the active tab, per
// the Figma "Thailand 2025" example — see IntroductionSection.tsx).
function IntroductionSectionFields({ fields, onChange }: { fields: EditableField[]; onChange: (f: EditableField[]) => void }) {
  const heading = getField(fields, 0, "heading");
  const highlightText = getField(fields, 0, "highlightText");
  const subheading = getField(fields, 0, "subheading");
  const paragraph = getField(fields, 0, "paragraph");
  const theme = getField(fields, 0, "theme")?.textValue || "blue";
  const items = itemIndexes(fields);

  function addMenuItem() {
    const idx = nextItemIndex(fields);
    onChange([...fields, blankField(idx, "label", "text", 1), blankField(idx, "url", "text", 2)]);
  }

  function removeMenuItem(itemIndex: number) {
    onChange(fields.filter((f) => f.itemIndex !== itemIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <TextInputField
        label="Heading"
        value={heading?.textValue ?? ""}
        placeholder="Online Casinos in Thailand 2025"
        onChange={(v) => onChange(upsertField(fields, 0, "heading", "text", 1, { textValue: v }))}
      />
      <TextInputField
        label="Highlighted Portion of Heading (optional — must match part of the heading text)"
        value={highlightText?.textValue ?? ""}
        placeholder="Thailand 2025"
        onChange={(v) => onChange(upsertField(fields, 0, "highlightText", "text", 2, { textValue: v }))}
      />
      <TextInputField
        label="Subheading"
        value={subheading?.textValue ?? ""}
        placeholder="Real Money & Real Players"
        onChange={(v) => onChange(upsertField(fields, 0, "subheading", "text", 3, { textValue: v }))}
      />
      <RichTextField
        label="Paragraph"
        value={paragraph?.textValue ?? ""}
        onChange={(v) => onChange(upsertField(fields, 0, "paragraph", "richtext", 4, { textValue: v }))}
      />
      <LabeledField label="Color Theme">
        <Select value={theme} onChange={(v) => onChange(upsertField(fields, 0, "theme", "text", 5, { textValue: v }))} options={INTRO_THEME_OPTIONS} />
      </LabeledField>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
          Page Menu (optional — first item shows as the active tab)
        </label>
        {items.map((itemIndex) => {
          const label = getField(fields, itemIndex, "label");
          const url = getField(fields, itemIndex, "url");
          return (
            <div key={itemIndex} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={label?.textValue ?? ""}
                onChange={(e) => onChange(upsertField(fields, itemIndex, "label", "text", 1, { textValue: e.target.value }))}
              />
              <Input
                placeholder="/th/bonuses"
                value={url?.textValue ?? ""}
                onChange={(e) => onChange(upsertField(fields, itemIndex, "url", "text", 2, { textValue: e.target.value }))}
              />
              <IconButton
                id={`intro-menu-${itemIndex}-remove`}
                title="Remove Item"
                onClick={() => removeMenuItem(itemIndex)}
                icon={<IconTrash width={14} height={14} />}
                variant="danger"
              />
            </div>
          );
        })}
        <button
          type="button"
          onClick={addMenuItem}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
        >
          <IconPlus width={14} height={14} />
          Add Menu Item
        </button>
      </div>
    </div>
  );
}
