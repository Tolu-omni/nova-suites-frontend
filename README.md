# Nova Suites Frontend

Next.js frontend for Nova Suites reservations, customer payments, and hotel operations.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL=http://localhost:8080`.
3. Start the Spring Boot backend.
4. Run `npm install` if dependencies are not installed.
5. Run `npm run dev` and open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Production configuration

Set `NEXT_PUBLIC_API_URL` in Vercel to the HTTPS origin of the deployed Spring Boot service. Public hotel contact variables may be added after the business owner confirms them. Never place Paystack secret keys, JWT signing secrets, database credentials, or other private values in a `NEXT_PUBLIC_*` variable.

The backend must allow the Vercel origin through CORS and must set its frontend base URL to the deployed Vercel origin so Paystack callbacks return to `/payment/verify`.
