// The preloader's hide logic (components/Preloader.tsx). It runs as an
// inline script right after the preloader's HTML, so it works before the
// rest of the page is drawn. Some pages (e.g. "Page Not Found") are drawn
// by the browser instead of arriving as HTML, and then that inline script
// never runs — PreloaderGuard runs this same function for them. It marks the
// element so it never runs twice, and has no outside references, so it can
// be turned into script text with toString().
export function startPreloader() {
  const el = document.getElementById("site-preloader");
  if (!el || el.hasAttribute("data-started")) return;
  el.setAttribute("data-started", "");
  let seen = false;
  try {
    seen = sessionStorage.getItem("tcs-preloaded") === "1";
    sessionStorage.setItem("tcs-preloaded", "1");
  } catch {}
  if (seen) {
    el.className += " is-skipped";
    return;
  }
  const start = Date.now();
  let finished = false;
  function done() {
    if (finished) return;
    finished = true;
    setTimeout(function () {
      el!.className += " is-hidden";
    }, Math.max(0, 400 - (Date.now() - start)));
  }
  if (document.readyState === "complete") done();
  else window.addEventListener("load", done);
  setTimeout(done, 6000);
}
