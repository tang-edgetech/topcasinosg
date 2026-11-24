"use client";

import { useEffect } from "react";
import { startPreloader } from "@/lib/preloader-script";

// Safety net for the preloader: if its inline script never ran (the page was
// drawn by the browser, as "Page Not Found" is), start it now so the
// preloader still goes away. Does nothing when the script already ran.
export default function PreloaderGuard() {
  useEffect(() => {
    startPreloader();
  }, []);
  return null;
}
