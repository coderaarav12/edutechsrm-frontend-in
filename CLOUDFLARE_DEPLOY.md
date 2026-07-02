# edutechsrm Cloudflare Deploy Notes

## Frontend

The `edutechsrm` frontend is prepared for Cloudflare Workers using OpenNext.

### Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.dev.vars` from `.dev.vars.example` and set:

```env
NEXTJS_ENV=development
SRM_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SRM_BACKEND_URL=http://127.0.0.1:8000
```

3. Run Next development:

```bash
npm run dev
```

4. Preview in Workers runtime:

```bash
npm run preview
```

### Deploy

1. Login to Cloudflare:

```bash
wrangler login
```

2. Set production variables/secrets:

```bash
wrangler secret put SRM_BACKEND_URL
wrangler secret put NEXT_PUBLIC_SRM_BACKEND_URL
wrangler secret put NEXT_PUBLIC_AI_BACKEND_URL
```

3. Deploy:

```bash
npm run deploy
```

## Backend

The `edutechsrm-backend` worker lives in `SRM_Backend_Cloudflare_TS`.

### Local setup

```bash
npm install
npm run check
```

### Production secrets

Optional default login account for private single-user deployments:

```bash
wrangler secret put SRM_DEFAULT_USERNAME
wrangler secret put SRM_DEFAULT_PASSWORD
```

Set allowed origins if you want to lock the backend to your frontend domain:

```bash
wrangler secret put ALLOWED_ORIGINS
```

### Deploy

```bash
npm run deploy
```

## Connection

1. Deploy backend first and copy its `workers.dev` or custom domain URL.
2. Set that backend URL as `SRM_BACKEND_URL` and `NEXT_PUBLIC_SRM_BACKEND_URL` on the frontend worker.
3. Deploy the frontend.
4. Open the frontend URL and login with SRM credentials.
