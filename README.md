# TalentForge – Freelancer Marketplace (Static)

A professional, static freelancer marketplace connecting clients with talent. Distinct brand and design (indigo/slate theme).

## Features

- **Homepage** – Hero with image slider (7 images from `upwork image` folder), search bar, categories, how it works, CTA
- **Find Talent** – Browse freelancers with mock data (search, filters, profile cards)
- **Find Work** – Browse jobs with mock data (search, filters, job cards)
- **How it Works** – Step-by-step guides for clients and freelancers
- **Sign Up / Log In** – Auth pages (static forms, no backend)
- **Header** – Sticky nav with mobile menu
- **Footer** – Links, copyright

## Tech Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS 4
- React Router v7

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5175](http://localhost:5175)

## Build

```bash
npm run build
npm run preview
```

## Images

Hero images are in `src/assets/` (hero-1.png through hero-7.png), copied from the `upwork image` folder.

## Next Steps (Dynamic Conversion)

When converting to dynamic:

1. Add API client (axios) and backend endpoints
2. Replace mock data with API calls
3. Add auth (JWT, protected routes)
4. Add Redux or React Query for state
5. Connect forms to backend
