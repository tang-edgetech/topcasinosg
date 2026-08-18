import Link from "next/link";
import { getSidebarSections } from "@/lib/sidebar";

// Figma "Comp / Header / Sidebar" — shown on every non-Home page, floating
// top-right of the Introduction Section (see IntroductionSection.tsx) and
// staying sticky as the page scrolls (see PageWithSidebar's layout wrapper
// for the sticky/width/gap mechanics — this component only renders content).
export default async function Sidebar() {
  const sections = await getSidebarSections();
  if (sections.length === 0) return null;

  return (
    <aside
      id="site-sidebar"
      className="site-sidebar flex w-full flex-col gap-5 rounded-xl bg-white p-6 shadow-lg lg:w-[280px] lg:shrink-0"
    >
      {sections.map((section, i) => (
        <div key={section.id} className={i > 0 ? "flex flex-col gap-2 border-t border-primary-100 pt-5" : "flex flex-col gap-2"}>
          <h3 className="text-sm font-bold text-primary-900">{section.heading}</h3>
          <ul className="flex flex-col gap-1.5">
            {section.links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.url}
                  className="flex cursor-pointer items-center justify-between gap-2 text-sm text-primary-700 hover:text-secondary-600 hover:underline"
                >
                  {link.label}
                  {link.hasDropdown && (
                    <span aria-hidden="true" className="text-xs text-primary-400">
                      ▾
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
