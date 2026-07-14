# yael-site

Public website and admin CMS for Yael Kanievsky — nutrition coaching and connected eating (`yaelifestyle.co.il`). Hebrew, RTL.

## Stack

- Next.js (App Router) + React + TypeScript (strict mode)
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage, RLS) via `@supabase/supabase-js` and `@supabase/ssr`
- Zod for validation
- React Hook Form + `@hookform/resolvers` for complex forms
- Resend for transactional email
- Deployed on Vercel

## Project Structure

```
src/
  app/
    (public)/     # Public website route group (about, services, recipes, articles, ...)
    admin/        # Admin CMS area (protected)
    page.tsx      # Homepage
    layout.tsx    # Root layout (lang="he", dir="rtl")
  actions/        # Server Actions (mutations)
  components/     # Shared UI components
  lib/
    supabase/     # Browser and server Supabase client factories
    auth/         # Authentication helpers (Supabase Auth session checks)
    validations/  # Zod schemas
    utils/        # Shared utilities
  types/          # Shared TypeScript types
```

## Getting Started

1. Copy the environment template and fill in real values (never commit `.env.local`):

   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — start the production server
- `npm run lint` — run ESLint

## Notes

- Colors, fonts, spacing and layout are fixed in code; the administrator manages content only, not design.
- Secrets live only in environment variables. Never expose service-role keys or API keys with the `NEXT_PUBLIC_` prefix.
- Database schema, authentication and business modules are implemented in later steps.
