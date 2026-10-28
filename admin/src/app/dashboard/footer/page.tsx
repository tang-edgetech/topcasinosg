"use client";

import { useState } from "react";
import { Segmented, Switch } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { isStaff } from "@/lib/roles";
import type { FooterBadgeDTO, FooterConfigDTO } from "@/lib/types";
import PageHeading from "@/components/PageHeading";
import IconButton from "@/components/IconButton";
import MediaPicker from "@/components/media/MediaPicker";
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash } from "@/components/Icons";
import MenuEditor from "../navigation/MenuEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
// Badge images like /certifications/x.webp are web/'s own public files.
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:4000";
const FOOTER_DESCRIPTION_MAX_LENGTH = 300;
const MAX_BADGES = 12;

const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark";
const SECTION_CLASS = "flex flex-col gap-4 rounded-md border border-border p-4 dark:border-border-dark";
const LEGEND_CLASS = "px-1 text-lg font-bold text-text dark:text-text-dark";
const HINT_CLASS = "text-xs text-text-muted dark:text-text-muted-dark";

function badgeImageUrl(url: string) {
  if (url.startsWith("http")) return url;
  return url.startsWith("/uploads/") ? `${API_URL}${url}` : `${WEB_URL}${url}`;
}

// The public site footer in one place: which blocks show and where, the link
// columns (menu items, location "footer"), the brand/contact block, the
// bottom bar text and the certification badges. Everything but the link
// columns saves together with one button; the columns save as you edit them.
export default function FooterPage() {
  const { user } = useAuth();
  const { settings, refresh } = useSiteSettings();
  const confirm = useConfirm();

  const [config, setConfig] = useState<FooterConfigDTO | null>(null);
  const [footerDescription, setFooterDescription] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [skypeUrl, setSkypeUrl] = useState("");
  const [pickingBadge, setPickingBadge] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fill the form once the settings arrive (and again after saving).
  const [loadedFrom, setLoadedFrom] = useState<typeof settings>(null);
  if (settings && settings !== loadedFrom) {
    setLoadedFrom(settings);
    setConfig(settings.footer);
    setFooterDescription(settings.footerDescription ?? "");
    setContactAddress(settings.contactAddress ?? "");
    setContactEmail(settings.contactEmail ?? "");
    setFacebookUrl(settings.facebookUrl ?? "");
    setSkypeUrl(settings.skypeUrl ?? "");
  }

  if (!user) return null;
  if (!isStaff(user)) {
    return (
      <section id="footer-page" className="footer-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }
  if (!config) {
    return <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>;
  }

  const layout = config.layout;
  function setLayout(patch: Partial<FooterConfigDTO["layout"]>) {
    setConfig((prev) => (prev ? { ...prev, layout: { ...prev.layout, ...patch } } : prev));
  }
  function setText(key: "certifiedByLabel" | "copyright" | "poweredBy", value: string) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }
  function setBadges(update: (badges: FooterBadgeDTO[]) => FooterBadgeDTO[]) {
    setConfig((prev) => (prev ? { ...prev, badges: update(prev.badges) } : prev));
  }
  function moveBadge(index: number, delta: number) {
    setBadges((badges) => {
      const next = [...badges];
      const [badge] = next.splice(index, 1);
      next.splice(index + delta, 0, badge);
      return next;
    });
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const ok = await confirm({
      title: "Save Footer",
      message: "This updates the footer on every page of the public site. Continue?",
      confirmLabel: "Save",
    });
    if (!ok) return;

    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.put("/api/admin/settings/footer", {
        footerDescription,
        contactAddress,
        contactEmail,
        facebookUrl,
        skypeUrl,
        footer: config,
      });
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the footer.");
    } finally {
      setSubmitting(false);
    }
  }

  const blockToggles: { key: "showLinks" | "showBrand" | "showBadges" | "showCopyright"; label: string; hint: string }[] = [
    { key: "showLinks", label: "Link Columns", hint: "The columns of links at the top." },
    { key: "showBrand", label: "Brand & Contact", hint: "Logo, description, address, email and social icons." },
    { key: "showBadges", label: "Certification Badges", hint: "The badge row in the bottom bar." },
    { key: "showCopyright", label: "Copyright", hint: "The copyright and “Powered by” lines in the bottom bar." },
  ];

  return (
    <section id="footer-page" className="footer-page flex max-w-3xl flex-col gap-8">
      <PageHeading title="Footer" help="footer" />

      <form id="footer-form" className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <fieldset id="footer-layout" className={SECTION_CLASS}>
          <legend className={LEGEND_CLASS}>Layout</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {blockToggles.map((toggle) => (
              <label key={toggle.key} className="flex cursor-pointer items-start gap-3">
                <Switch
                  id={`footer-layout-${toggle.key}`}
                  size="small"
                  className="mt-0.5"
                  checked={layout[toggle.key]}
                  onChange={(checked) => setLayout({ [toggle.key]: checked })}
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-text dark:text-text-dark">{toggle.label}</span>
                  <span className={HINT_CLASS}>{toggle.hint}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-text dark:text-text-dark">Brand Block Position</span>
            <Segmented
              id="footer-layout-brand-position"
              value={layout.brandPosition}
              onChange={(value) => setLayout({ brandPosition: value as "left" | "right" })}
              options={[
                { label: "Left Of Links", value: "left" },
                { label: "Right Of Links", value: "right" },
              ]}
            />
          </div>
          <FooterSchematic layout={layout} />
        </fieldset>

        <fieldset id="footer-brand" className={SECTION_CLASS}>
          <legend className={LEGEND_CLASS}>Brand &amp; Contact</legend>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">
            The logo is the site logo from Settings &rsaquo; General. Leave a field empty to hide it.
          </p>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="footer-description" className="text-sm font-medium text-text dark:text-text-dark">
              Footer Description
            </label>
            <textarea
              id="footer-description"
              rows={3}
              maxLength={FOOTER_DESCRIPTION_MAX_LENGTH}
              value={footerDescription}
              onChange={(e) => setFooterDescription(e.target.value)}
              className={INPUT_CLASS}
            />
            <div className={`flex justify-between gap-2 ${HINT_CLASS}`}>
              <span>A short sentence about the site, shown under the footer logo.</span>
              <span>
                {footerDescription.length} / {FOOTER_DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
          </div>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="footer-contact-address" className="text-sm font-medium text-text dark:text-text-dark">
              Address
            </label>
            <input
              id="footer-contact-address"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Blk 123 Example Street, #01-23 123456"
              className={INPUT_CLASS}
            />
          </div>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="footer-contact-email" className="text-sm font-medium text-text dark:text-text-dark">
              Contact Email
            </label>
            <input
              id="footer-contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hello@example.com"
              className={INPUT_CLASS}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="footer-facebook-url" className="text-sm font-medium text-text dark:text-text-dark">
                Facebook URL
              </label>
              <input
                id="footer-facebook-url"
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className={INPUT_CLASS}
              />
            </div>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="footer-skype-url" className="text-sm font-medium text-text dark:text-text-dark">
                Skype URL
              </label>
              <input
                id="footer-skype-url"
                value={skypeUrl}
                onChange={(e) => setSkypeUrl(e.target.value)}
                placeholder="https://join.skype.com/invite/… or skype:yourname?chat"
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </fieldset>

        <fieldset id="footer-bottom-bar" className={SECTION_CLASS}>
          <legend className={LEGEND_CLASS}>Bottom Bar</legend>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="footer-certified-label" className="text-sm font-medium text-text dark:text-text-dark">
              Badges Label
            </label>
            <input
              id="footer-certified-label"
              maxLength={200}
              value={config.certifiedByLabel}
              onChange={(e) => setText("certifiedByLabel", e.target.value)}
              className={INPUT_CLASS}
            />
            <p className={HINT_CLASS}>Shown before the badges, e.g. &ldquo;topcasinosg.com.sg is certified by:&rdquo;.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="footer-copyright" className="text-sm font-medium text-text dark:text-text-dark">
                Copyright
              </label>
              <input
                id="footer-copyright"
                maxLength={200}
                value={config.copyright}
                onChange={(e) => setText("copyright", e.target.value)}
                className={INPUT_CLASS}
              />
              <p className={HINT_CLASS}>
                <code>{"{year}"}</code> becomes the current year.
              </p>
            </div>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="footer-powered-by" className="text-sm font-medium text-text dark:text-text-dark">
                Powered By
              </label>
              <input
                id="footer-powered-by"
                maxLength={200}
                value={config.poweredBy}
                onChange={(e) => setText("poweredBy", e.target.value)}
                className={INPUT_CLASS}
              />
              <p className={HINT_CLASS}>Leave empty to hide.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-text dark:text-text-dark">
              Certification Badges ({config.badges.length} / {MAX_BADGES})
            </span>
            {config.badges.length < MAX_BADGES && (
              <IconButton id="footer-badge-add" title="Add Badge" onClick={() => setPickingBadge(true)} icon={<IconPlus />} />
            )}
          </div>
          {config.badges.length === 0 ? (
            <p className={HINT_CLASS}>No badges. Add one from the media library.</p>
          ) : (
            <ul id="footer-badges" className="flex flex-col gap-2">
              {config.badges.map((badge, index) => (
                <li
                  key={`${badge.imageUrl}-${index}`}
                  className="footer-badge flex flex-wrap items-center gap-3 rounded-md border border-border p-2 dark:border-border-dark"
                >
                  <span className="flex h-10 w-24 shrink-0 items-center justify-center rounded bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badgeImageUrl(badge.imageUrl)} alt={badge.name} className="max-h-full max-w-full object-contain" />
                  </span>
                  <input
                    aria-label="Badge name"
                    value={badge.name}
                    onChange={(e) => setBadges((all) => all.map((b, i) => (i === index ? { ...b, name: e.target.value } : b)))}
                    placeholder="Name (used as alt text)"
                    className={`${INPUT_CLASS} min-w-40 flex-1`}
                  />
                  <input
                    aria-label="Badge link"
                    value={badge.linkUrl}
                    onChange={(e) => setBadges((all) => all.map((b, i) => (i === index ? { ...b, linkUrl: e.target.value } : b)))}
                    placeholder="Link (optional)"
                    className={`${INPUT_CLASS} min-w-40 flex-1`}
                  />
                  <div className="flex shrink-0 gap-1.5">
                    <IconButton
                      id={`footer-badge-${index}-up`}
                      title="Move Up"
                      onClick={() => moveBadge(index, -1)}
                      disabled={index === 0}
                      icon={<IconChevronUp width={14} height={14} />}
                      variant="muted"
                    />
                    <IconButton
                      id={`footer-badge-${index}-down`}
                      title="Move Down"
                      onClick={() => moveBadge(index, 1)}
                      disabled={index === config.badges.length - 1}
                      icon={<IconChevronDown width={14} height={14} />}
                      variant="muted"
                    />
                    <IconButton
                      id={`footer-badge-${index}-remove`}
                      title="Remove Badge"
                      onClick={() => setBadges((all) => all.filter((_, i) => i !== index))}
                      icon={<IconTrash width={14} height={14} />}
                      variant="danger"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {error && <p className="form-error text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">Footer saved.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn--primary cursor-pointer self-start rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Footer"}
        </button>
      </form>

      <fieldset id="footer-links" className={SECTION_CLASS}>
        <legend className={LEGEND_CLASS}>Link Columns</legend>
        <p className={HINT_CLASS}>These save as you edit them — no need to press Save Footer.</p>
        <MenuEditor location="footer" />
      </fieldset>

      <MediaPicker
        open={pickingBadge}
        onClose={() => setPickingBadge(false)}
        onSelect={(media) =>
          setBadges((badges) => [
            ...badges,
            { name: media.originalFilename.replace(/\.[^.]+$/, ""), imageUrl: media.url, linkUrl: "" },
          ])
        }
      />
    </section>
  );
}

// A small drawing of the footer's arrangement, so the switches above have
// something to show before saving.
function FooterSchematic({ layout }: { layout: FooterConfigDTO["layout"] }) {
  const links = layout.showLinks && (
    <div className="flex flex-1 gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-1 flex-col gap-1">
          <div className="h-2 w-3/4 rounded bg-secondary-500" />
          <div className="h-1.5 rounded bg-white/50" />
          <div className="h-1.5 w-5/6 rounded bg-white/50" />
          <div className="h-1.5 w-2/3 rounded bg-white/50" />
        </div>
      ))}
    </div>
  );
  const brand = layout.showBrand && (
    <div className="flex w-1/3 flex-col gap-1 rounded border border-white/30 p-1.5">
      <div className="h-2.5 w-1/2 rounded bg-white" />
      <div className="h-1.5 rounded bg-white/50" />
      <div className="h-1.5 w-4/5 rounded bg-white/50" />
    </div>
  );
  const hasBottom = layout.showBadges || layout.showCopyright;
  return (
    <div id="footer-schematic" aria-hidden="true" className="rounded-md bg-primary-900 p-3">
      <div className="flex gap-3">
        {layout.brandPosition === "left" ? (
          <>
            {brand}
            {links}
          </>
        ) : (
          <>
            {links}
            {brand}
          </>
        )}
        {!layout.showLinks && !layout.showBrand && <div className="h-6 flex-1 text-[11px] text-white/50">No top blocks</div>}
      </div>
      {hasBottom && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded bg-white px-2 py-1.5">
          {layout.showCopyright ? <div className="h-1.5 w-1/4 rounded bg-primary-200" /> : <span />}
          {layout.showBadges && (
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-2.5 w-5 rounded-sm bg-primary-200" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
