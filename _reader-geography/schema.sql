CREATE TABLE IF NOT EXISTS country_views (
  country TEXT PRIMARY KEY CHECK (length(country) = 2),
  views INTEGER NOT NULL CHECK (views > 0)
) WITHOUT ROWID;
