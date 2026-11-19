# PROJECT X deployment

Cloudflare Pages project: `allsosialmedia`

Production URL: https://allsosialmedia.pages.dev

Build command: `npm run build`

Build output: `apps/web/out`

Cloudflare Workers API is a separate deployment. Configure `NEXT_PUBLIC_API_URL` for the frontend and `DATABASE_URL` plus `JWT_SECRET` as Workers secrets. Never commit production credentials.

Status: Cloudflare GitHub integration configured; verify Pages build and API deployment before accepting production traffic.
