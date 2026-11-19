-- Schema box (SEO tab of a page, casino, guide, news article or bonus): the
-- item's own schema.org JSON-LD, printed on its page as
-- <script type="application/ld+json">. Empty: none (the site's automatic
-- schema still applies).
ALTER TABLE seo_meta
    ADD COLUMN IF NOT EXISTS schema_json MEDIUMTEXT NULL AFTER article_author;
