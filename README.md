# Cleaning app

Membership cleaning service for Amsterdam: customers pay a monthly membership for regular cleaners, a backup cleaner and breakage insurance; cleaners apply and are vetted.

- `app/` – Next.js web app (marketing, membership, cleaner application, admin placeholder)
- `lib/brand.ts` – brand name and colours (also mirrored in `app/globals.css`)

Planned: Supabase (auth, database, private document storage), Stripe (membership + hourly charges), Expo mobile app.

```bash
npm install && npm run dev
```
