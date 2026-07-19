export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = ["25", "50", "100", "150", "200"];

// Shared antd Table pagination config for every dashboard list page — keeps
// the page-size choices (and their behavior) identical everywhere instead of
// each page re-deriving its own config.
export function tablePagination(
  page: number,
  pageSize: number,
  total: number,
  onChange: (page: number, pageSize: number) => void
) {
  return {
    current: page,
    pageSize,
    total,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    showSizeChanger: true,
    showTotal: (t: number) => `${t} total`,
    onChange,
  };
}
