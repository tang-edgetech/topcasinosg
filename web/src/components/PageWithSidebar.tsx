import Sidebar from "./Sidebar";

// Container spec for every non-Home page: 1300px content max-width, a
// 280px Sidebar, and a 30px gap between them, with the Sidebar sticky
// top-right. `children` is expected to start with an IntroductionSection
// (which bleeds full-width on its own — see IntroductionSection.tsx) so the
// Sidebar's negative top margin pulls it up to overlap that band, matching
// the Figma design.
export default function PageWithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-with-sidebar mx-auto flex w-full max-w-[1300px] flex-col gap-[30px] px-6 lg:flex-row lg:items-start 2xl:max-w-[1920px]">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="w-full shrink-0 lg:sticky lg:top-6 lg:-mt-20 lg:w-[280px]">
        <Sidebar />
      </div>
    </div>
  );
}
