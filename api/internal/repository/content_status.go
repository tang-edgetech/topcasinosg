package repository

// EffectivelyPublishedSQL computes visibility live instead of via a cron job:
// a row is publicly visible if it's published, or scheduled and its
// publish_at has already passed. Append to a WHERE clause in every public
// content read query.
const EffectivelyPublishedSQL = `(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))`

// EffectivelyPublishedSQLFor is EffectivelyPublishedSQL qualified with a
// table alias, for queries that JOIN another table that also has
// status/publish_at columns.
func EffectivelyPublishedSQLFor(alias string) string {
	return `(` + alias + `.status = 'published' OR (` + alias + `.status = 'scheduled' AND ` + alias + `.publish_at <= NOW()))`
}
