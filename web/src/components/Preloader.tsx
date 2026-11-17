// Site Settings > General > Preloader: a white screen with its image (a jpg,
// png, webp or gif from Settings; the site logo, or its title, without one)
// and a sliding bar, shown only on the first page a visitor opens in a browser
// window or tab, until that page has loaded. Later pages in the same tab use
// the page transition (PageTransition.tsx) instead.
//
// It's in the server HTML so it covers the page from the first paint; the
// inline script right after it runs before the rest of the page is drawn.
// It remembers the tab in sessionStorage: already seen, it hides at once.
// Without JavaScript it never shows (the <noscript> style). The script only
// changes this element's class, never removes it, so React's hydration
// still finds it (suppressHydrationWarning covers the class). Styles:
// app/globals.css, "Preloader".
const SCRIPT = `(function () {
  var el = document.getElementById("site-preloader");
  if (!el) return;
  var seen = false;
  try {
    seen = sessionStorage.getItem("tcs-preloaded") === "1";
    sessionStorage.setItem("tcs-preloaded", "1");
  } catch (e) {}
  if (seen) { el.className += " is-skipped"; return; }
  var start = Date.now(), finished = false;
  function done() {
    if (finished) return;
    finished = true;
    setTimeout(function () { el.className += " is-hidden"; }, Math.max(0, 400 - (Date.now() - start)));
  }
  if (document.readyState === "complete") done();
  else window.addEventListener("load", done);
  setTimeout(done, 6000);
})();`;

export default function Preloader({
  imageUrl,
  logoUrl,
  siteTitle,
}: {
  imageUrl: string | null | undefined;
  logoUrl: string | null | undefined;
  siteTitle: string;
}) {
  return (
    <>
      <div id="site-preloader" className="site-preloader" aria-hidden="true" suppressHydrationWarning>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="site-preloader__image" />
        ) : logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="site-preloader__logo" />
        ) : (
          <span className="site-preloader__title">{siteTitle}</span>
        )}
        <span className="site-preloader__bar" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <noscript>
        <style>{"#site-preloader{display:none}"}</style>
      </noscript>
    </>
  );
}
