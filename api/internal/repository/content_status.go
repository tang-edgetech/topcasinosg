package repository

// EffectivelyPublishedSQL computes visibility live instead of via a cron job:
// a row is publicly visible if it's published, or scheduled and its
// publish_at has already passed. Append to a WHERE clause in every public
// content read query.
const EffectivelyPublishedSQL = `(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))`
