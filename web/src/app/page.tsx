const primaryScale = [
  { step: "50", value: "#e7e9f4" },
  { step: "100", value: "#c3c8e5" },
  { step: "200", value: "#9da4d3" },
  { step: "300", value: "#7781c1" },
  { step: "400", value: "#5a65b4" },
  { step: "500", value: "#3e4ba8" },
  { step: "600", value: "#38439e" },
  { step: "700", value: "#2f3a92" },
  { step: "800", value: "#273086" },
  { step: "900", value: "#1a1e71" },
];

const secondaryScale = [
  { step: "50", value: "#fdf8e1" },
  { step: "100", value: "#fbedb4" },
  { step: "200", value: "#fae183" },
  { step: "300", value: "#f8d650" },
  { step: "400", value: "#f7cc2a" },
  { step: "500", value: "#f7c30b" },
  { step: "600", value: "#f7b500" },
  { step: "700", value: "#f7a300" },
  { step: "800", value: "#f89200" },
  { step: "900", value: "#f87300" },
];

export default function Home() {
  return (
    <div id="home-page" className="flex flex-1 flex-col font-sans">
      <section
        id="theme-preview"
        className="theme-preview mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16"
      >
        <header className="theme-preview__header">
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">
            Top Casino SG — Theme Preview
          </h1>
          <p className="mt-2 text-base text-primary-500">
            Design tokens pulled from Figma (Element page, node 3006:8990). This page is a
            temporary style-guide check, not a real layout.
          </p>
        </header>

        <div id="theme-preview-colors" className="theme-preview__section flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-primary-900">Colors</h2>

          <div className="color-scale flex flex-col gap-2">
            <span className="color-scale__label text-sm font-medium text-primary-500">
              Primary
            </span>
            <div className="flex overflow-hidden rounded-lg">
              {primaryScale.map((c) => (
                <div
                  key={c.step}
                  className="color-swatch flex h-16 flex-1 items-end justify-center pb-1 text-[10px] font-medium text-white"
                  style={{ backgroundColor: c.value }}
                >
                  {c.step}
                </div>
              ))}
            </div>
          </div>

          <div className="color-scale flex flex-col gap-2">
            <span className="color-scale__label text-sm font-medium text-primary-500">
              Secondary
            </span>
            <div className="flex overflow-hidden rounded-lg">
              {secondaryScale.map((c) => (
                <div
                  key={c.step}
                  className="color-swatch flex h-16 flex-1 items-end justify-center pb-1 text-[10px] font-medium text-primary-900"
                  style={{ backgroundColor: c.value }}
                >
                  {c.step}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="color-swatch flex h-16 w-32 items-end justify-center rounded-lg bg-success pb-1 text-xs font-medium text-white">
              success
            </div>
            <div className="color-swatch flex h-16 w-32 items-end justify-center rounded-lg bg-danger pb-1 text-xs font-medium text-white">
              danger
            </div>
            <div className="color-swatch flex h-16 w-32 items-end justify-center rounded-lg bg-star pb-1 text-xs font-medium text-primary-900">
              star
            </div>
          </div>
        </div>

        <div id="theme-preview-typography" className="theme-preview__section flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-primary-900">Typography (Figtree)</h2>
          <p className="text-base font-normal text-primary-900">
            Body / Regular 16 — the quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-base font-bold text-primary-900">
            Body / Bold 16 — the quick brown fox jumps over the lazy dog.
          </p>
        </div>

        <div id="theme-preview-buttons" className="theme-preview__section flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-primary-900">Buttons</h2>
          <div className="flex gap-4">
            <button
              type="button"
              className="btn btn--primary rounded-md bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gradient-to-r hover:from-primary-900 hover:to-primary-glow"
            >
              Primary CTA
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
