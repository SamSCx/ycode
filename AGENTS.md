<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The dev server is `npm run dev` on port 3002 (`http://localhost:3002`). Environment startup launches Docker, a local Supabase stack in `/opt/ycode-supabase`, writes its credentials to `.env`, then starts Next.js.
- Finish first-run setup at `/ycode/welcome`. Choose Self-hosted Supabase and paste `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_CONNECTION_URL`, `SUPABASE_DB_PASSWORD`, and `SUPABASE_URL` from `.env`. Email confirmation is already disabled. Run migrations, create an admin account, then open the editor at `/ycode`.
- `npm run lint`, `npm run type-check`, and `npm test` do not need Supabase. `npm run build` is the production build.
- `npm run migrate:latest` reads credentials from the process environment. Export the variables in `.env`, or run migrations from the welcome wizard.
