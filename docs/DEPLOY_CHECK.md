# Deployment verification

Cloudflare Pages production secrets: DATABASE_URL and JWT_SECRET. After changes to secrets, deploy a new commit so Pages Functions can read them. Verify GET /api/health, POST /api/auth/register, and POST /api/auth/login. Do not commit credentials.
