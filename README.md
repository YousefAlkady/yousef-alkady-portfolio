# Yousef Alkady: portfolio

Live: **https://yousef.unilinkcampus.com**

A scroll-driven portfolio. It opens in my studio, I stand up, check a message, a car pulls up, I drive off, and the road turns into a small galaxy. Three planets lead to my Projects, Experience and Education pages. There is also a Music page with my beats.

I'm a Computer Science student at MSA University (Cairo). I build and run live software (UniLink, a verified-student platform) and research low-power LoRa mesh networks. This site is the one place that puts all of that together.

The site lives on a subdomain of UniLink (`unilinkcampus.com`), which is my main project. It is a separate, static deployment and shares nothing with the UniLink app.

## What it's built with

| Part | Tool | Why I picked it |
|---|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript | static export, so the whole site is plain files |
| Scroll-driven film | GSAP + ScrollTrigger | scrubs video frames and text with the scrollbar |
| Smooth scrolling | Lenis | gives the scroll its weight; kept in sync with GSAP |
| 3D | three.js via React Three Fiber | the planet hub, ships, asteroids, the AAIB tower |
| Music | Supabase Storage (public bucket) + one site-wide `<audio>` | beats stream only when someone presses play |
| Hosting | Cloudflare Workers, static assets only | no server code, nothing to attack at runtime |

## How it was made

The full story (concept, shot planning, video, 3D, build, deploy and what went wrong along the way) is in **[PROCESS.md](PROCESS.md)**. Short version:

1. I wrote the concept and the storyboard: what each scroll scene says about me.
2. I made the source material: studio photos, the music, the 3D pieces (Blender), the research device.
3. The film clips were generated from my own photos with AI video tools (Higgsfield, Kling), then trimmed and compressed myself.
4. I built the site with Claude Code as a coding assistant, directing every decision and reviewing the result. The AI use is described openly in PROCESS.md.

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional: only needed for the Music page
npm run dev                  # http://localhost:3000
npm run build                # static export into out/
```

A few large or personal files are **not** in this repo on purpose:

- third-party 3D models (`public/media/hub/*.glb`): Sketchfab licences don't allow redistributing them. They are credited on the site's credits list. Without them the space scene loads without those ships and rocks.
- my CV and unpublished research manuscript (`public/Yousef-Alkady-CV.pdf`, `public/papers/`): available on the live site only.

## Security notes

This is a public repo, so here is what keeps it safe:

- **No secrets in the code or history.** `.env*` files are git-ignored; only `.env.example` (placeholders) is committed. The two `NEXT_PUBLIC_` Supabase values are public by design: the publishable key can only do what row-level security allows, which is *read* the beats list (see `supabase/migrations/`). Uploading and deleting need my dashboard login.
- **No server, no forms, no database writes from visitors.** The site is static files. There is no login, no cookies and no user input to inject into.
- **Response headers** (`public/_headers`): `nosniff`, strict referrer policy, `X-Frame-Options: DENY` / `frame-ancestors 'none'` (no clickjacking), HSTS, locked-down Permissions-Policy, `object-src 'none'`.
- **Subdomain isolation.** It sets no cookies, so nothing leaks to or from `unilinkcampus.com`, and deploys use a separate Cloudflare Worker with no access to the UniLink project.
- **External links** use `rel="noopener noreferrer"`.

Found a problem? Open an issue or email me through the contact section on the site.

## Rights

Code is shown for reference and learning. Photos, video, music, and 3D work are mine unless credited otherwise; please don't reuse them without asking.
