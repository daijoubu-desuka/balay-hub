# BahayHub — Butuan City Real Estate (ITE 18 Frontend Midterm)

Frontend-only real estate website for Butuan City, built with **Nuxt 3**, **Vue 3** and **Pinia**.
There is no backend yet. Data comes from a mock JSON API (`public/data/properties.json`), and accounts,
saved homes and viewing requests are kept in the browser's localStorage.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run generate   # static site (for Netlify / Vercel / GitHub Pages)
```

Node 20 or newer is recommended.

## Demo accounts

| Role   | Email                  | Password  |
|--------|------------------------|-----------|
| Client | client@bahayhub.test   | client123 |
| Agent  | agent@bahayhub.test    | agent123  |
| Admin  | admin@bahayhub.test    | admin123  |

You can also create a new client or agent account on `/signup`.

## Pages

`/` Browse · `/new-developments` · `/commercial` · `/for-rent` · `/property/:id` · `/login` · `/signup` · `/account` (login required)

## Folder structure

```
app.vue                 root: splash screen, layout, toasts
layouts/                default (header + footer) and auth layouts
pages/                  file-based routes
components/             reusable UI (PropertyCard, SearchPanel, FilterSidebar, InquiryForm, ...)
stores/                 Pinia stores: properties, auth, ui
composables/            formatting + validation helpers
middleware/auth.ts      protects /account
plugins/hydrate.client  restores saved session and saved homes
public/data/            mock API (properties.json)
assets/css/main.css     design tokens + responsive styles
```

## Changing property photos

Photos are jpg links in `public/data/properties.json` (`images` array). Replace them with your own
photos (put files in `public/images/` and use `/images/name.jpg`). If an image fails to load, the card
shows a house icon instead of a broken image.

## Notes

- Login and signup are a mock for the midterm. Passwords are hashed with SHA-256 in the browser, which is
  not real security. Real authentication comes with the backend in the final.
- Fonts (Inter, Plus Jakarta Sans) load from Google Fonts.
