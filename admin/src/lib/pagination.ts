export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = ["25", "50", "100", "150", "200"];

// Every list page now fetches its whole dataset in one request (see
// api/internal/service/pagination.go's maxPageSize) and paginates/filters/
// sorts client-side — this is the page size sent to make that one request
// return everything rather than the default 25.
export const FETCH_ALL_PAGE_SIZE = 5000;

// Shared antd Table pagination config for a client-side-paginated list (the
// whole dataset is already in `dataSource`; antd just slices it for display).
export const CLIENT_TABLE_PAGINATION = {
  defaultPageSize: DEFAULT_PAGE_SIZE,
  pageSizeOptions: PAGE_SIZE_OPTIONS,
  showSizeChanger: true,
  showTotal: (t: number) => `${t} total`,
};
