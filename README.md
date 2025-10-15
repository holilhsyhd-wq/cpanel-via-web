# barmods-crate-pnael-via-web

Minimal Next.js (App Router) project to create Pterodactyl users & servers via Application API.
Ready to deploy to Vercel.

## Quick setup (local)
1. Copy files to a folder and run `npm install`.
2. Copy `.env.example` -> `.env.local` and fill values.
3. `npm run dev` and open http://localhost:3000

## Vercel deploy
1. Push to GitHub.
2. Import project to Vercel.
3. Set Environment Variables in Vercel (same keys as `.env.example`).
4. Deploy.

## Security
- The create endpoint is protected using `ADMIN_TOKEN`. The client sends header `X-ADMIN-TOKEN`.
- Keep `PTERO_API_KEY` secret (use Vercel Environment Variables).

## Notes
- This project uses the Next.js App Router (`app/`).
- UI is minimal as requested (login via token + create form).
