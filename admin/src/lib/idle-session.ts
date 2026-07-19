"use client";

import { useEffect, useRef } from "react";
import { api, ApiError } from "./api";

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // force logout after 2 hours with no interaction
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // well under the 15-minute access token TTL

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

// While the user is active, this silently rotates the access token every
// tick so the session survives past its 15-minute TTL. The moment there's
// been no interaction for 2 hours, it force-logs-out instead of refreshing —
// that's the actual security boundary, not the short-lived access token.
export function useIdleSession(enabled: boolean, onTimeout: () => void) {
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    lastActivity.current = Date.now();
    const markActive = () => {
      lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive, { passive: true }));

    const interval = setInterval(async () => {
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        onTimeout();
        return;
      }
      try {
        await api.post("/api/admin/auth/refresh");
      } catch (err) {
        if (err instanceof ApiError) {
          onTimeout();
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive));
      clearInterval(interval);
    };
  }, [enabled, onTimeout]);
}
