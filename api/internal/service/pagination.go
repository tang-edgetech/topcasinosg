package service

const defaultPageSize = 25

// maxPageSize matches the dashboard's largest items-per-page choice (see
// admin/src/lib/pagination.ts's PAGE_SIZE_OPTIONS) — keep the two in sync.
const maxPageSize = 200

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
