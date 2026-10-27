"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer, Segmented, Switch, Tooltip } from "antd";
import { api, ApiError } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings-context";
import { IconDesktop, IconExternalLink, IconMobile, IconRefresh, IconTablet } from "@/components/Icons";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const AUTO_REFRESH_DELAY_MS = 900;
const DEVICES = {
  desktop: { width: 1280, label: "Desktop", icon: <IconDesktop /> },
  tablet: { width: 768, label: "Tablet", icon: <IconTablet /> },
  mobile: { width: 375, label: "Mobile", icon: <IconMobile /> },
} as const;
type Device = keyof typeof DEVICES;

// Side panel showing the page as the public site renders it, including
// changes not saved yet: the unsaved sections are sent to the API
// (POST /api/admin/pages/{id}/preview, kept for an hour) and the site's
// /preview/{token} route is shown in an iframe, scaled to fit the panel at
// desktop, tablet or mobile width. It refreshes shortly after each edit
// (auto refresh can be turned off), keeping the scroll position.
export default function LivePreview({
  open,
  onClose,
  pageId,
  payload,
  version,
}: {
  open: boolean;
  onClose: () => void;
  pageId: number;
  payload: () => unknown;
  version: string;
}) {
  const { settings } = useSiteSettings();
  const base = (WEB_URL || settings?.siteUrl || "").replace(/\/+$/, "");
  const [device, setDevice] = useState<Device>("desktop");
  const [auto, setAuto] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [boxEl, setBoxEl] = useState<HTMLDivElement | null>(null);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const requestSeq = useRef(0);

  async function refresh() {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const data = await api.post<{ token: string }>(`/api/admin/pages/${pageId}/preview`, payloadRef.current());
      if (seq === requestSeq.current) {
        setToken(data.token);
        setError("");
      }
    } catch (err) {
      if (seq === requestSeq.current) setError(err instanceof ApiError ? err.message : "Could not update the preview.");
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!open || (!auto && token)) return;
    const timer = window.setTimeout(refresh, token ? AUTO_REFRESH_DELAY_MS : 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, version, auto]);

  useEffect(() => {
    if (!boxEl) return;
    const observer = new ResizeObserver(([entry]) => setBox({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(boxEl);
    return () => observer.disconnect();
  }, [boxEl]);

  const width = DEVICES[device].width;
  const scale = box.width > 0 ? Math.min(1, box.width / width) : 1;
  const src = token && base ? `${base}/preview/${token}` : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Live Preview"
      placement="right"
      size={Math.min(760, typeof window === "undefined" ? 760 : Math.round(window.innerWidth * 0.5))}
      resizable
      mask={false}
      destroyOnHidden
      styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
      extra={
        <div className="flex items-center gap-3">
          <Tooltip title="Refresh the preview as you edit">
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <Switch size="small" checked={auto} onChange={setAuto} />
              Auto
            </label>
          </Tooltip>
          <button
            type="button"
            id="live-preview-refresh"
            title="Refresh now"
            onClick={refresh}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-primary-700"
          >
            <IconRefresh className={loading ? "animate-spin" : ""} />
          </button>
          {src && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              title="Open the preview in a new tab"
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-primary-700"
            >
              <IconExternalLink />
            </a>
          )}
        </div>
      }
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 dark:border-border-dark">
        <Segmented
          id="live-preview-device"
          size="small"
          value={device}
          onChange={(value) => setDevice(value as Device)}
          options={(Object.keys(DEVICES) as Device[]).map((key) => ({
            value: key,
            label: (
              <span className="flex items-center gap-1.5 px-1">
                {DEVICES[key].icon}
                {DEVICES[key].label}
              </span>
            ),
          }))}
        />
        <span className="text-xs text-text-muted">
          {width}px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
        </span>
      </div>
      {error && <p className="bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>}
      {!base && <p className="px-4 py-6 text-sm text-text-muted">Set the Site URL in Site Settings to see the preview.</p>}
      <div ref={setBoxEl} className="live-preview__viewport relative flex-1 overflow-hidden bg-surface-muted dark:bg-surface-muted-dark">
        {src && box.height > 0 && (
          <iframe
            key={device}
            id="live-preview-frame"
            title="Live preview"
            src={src}
            className="absolute top-0 border-0 bg-white shadow-sm"
            style={{
              width,
              height: box.height / scale,
              left: Math.max(0, (box.width - width * scale) / 2),
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        )}
      </div>
    </Drawer>
  );
}
