# Reader Geography

The homepage records one page view per visible page load unless the browser sends a privacy opt-out. The Worker stores only the inferred country or region code and its cumulative count in D1. The public summary counts views, never unique people.

To initialize the configured database, run `npx wrangler d1 execute zhuxy-reader-geography --remote --file schema.sql` in this directory. Deploy with `npx wrangler deploy`. The homepage uses `reader_geography_url` in `_config.yml`.

The simplified outlines in `assets/data/reader-countries.json` were derived from [Natural Earth 1:110m country boundaries v5.1.2](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson). Marker positions for smaller areas come from the 1:50m country label coordinates in the same Natural Earth release.
