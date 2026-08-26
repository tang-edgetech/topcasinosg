import Sidebar from "./Sidebar";

// Flex layout for every non-Home page's body — see the `.main`/`.primary`/
// `.sidebar` rules in shared/theme/sections.css. `.primary` and `.sidebar`
// are plain flex siblings with `align-items: flex-start`, so the Sidebar
// starts flush with whichever section renders first (typically
// Introduction Section) with no row-count or height bookkeeping needed.
export default function PageGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-container main">
      <div className="primary">{children}</div>
      <div className="sidebar">
        <Sidebar />
      </div>
    </div>
  );
}
