# Deploy: Cloudflare (static files, no server)

Live: https://yousef.unilinkcampus.com (deployed 2026-11-18).
It is a Cloudflare Worker named `yousef-portfolio` that only serves static files (Wrangler 4 replaced Pages with this).
Static-file requests are free and unmetered, there is no server code, and it never touches UniLink's Vercel project.

## Redeploy after changes
```
cd site-v3
npx next build                 # writes out/ (all pages static)
npx wrangler@4 deploy          # uses wrangler.jsonc: uploads out/ to yousef-portfolio + yousef.unilinkcampus.com
```
Only changed files upload. If Wrangler asks to "set up" or convert the project, say no: it once installed OpenNext and
edited next.config/_headers/package.json on its own (reverted 2026-11-18). `wrangler.jsonc` here prevents that.
Wrangler login lives in your user profile; `npx wrangler@4 logout` removes it.

## Keeping usage low
- `public/_headers`: build files cached forever, media 30 days in browsers / 1 year at Cloudflare's edge.
  After replacing a clip with the same name, purge the cache (Caching > Configuration > Purge) or rename the file.
- Beats stream from Supabase (free plan: 5 GB egress/month). A beat downloads only when someone presses play.
- No analytics, no image optimisation, no functions, observability off.
