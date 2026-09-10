package service

const defaultPageSize = 25

// maxPageSize doubles as the dashboard's "fetch everything" ceiling: every
// admin list page now loads its full dataset in one request and paginates/
// filters/sorts client-side (see admin/src/lib/pagination.ts's
// FETCH_ALL_PAGE_SIZE), rather than paging through the API. 5000 comfortably
// covers this project's realistic per-type content volume in one query;
// revisit if any list is ever expected to exceed that.
const maxPageSize = 5000

// normalizePaging applies sane defaults/bounds shared by every list endpoint.
func normalizePaging(page, pageSize int) (int, int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > maxPageSize {
		pageSize = defaultPageSize
	}
	return page, pageSize
}
