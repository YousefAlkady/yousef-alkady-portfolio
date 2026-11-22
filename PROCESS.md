# How this site was made

Written by Yousef, November 2026. This is the honest version: what I decided, what I made, what tools did the heavy lifting, and what broke.

## 1. The idea (11 Nov 2026)

I didn't want a page of cards. I wanted the site to feel like a short film where scrolling is the playback, but still be a portfolio first: name, role and navigation visible from the first second, and a skip button.

The story beats I wrote down:

1. Studio: I'm seated; this is the first frame.
2. I stand up, a message arrives.
3. I look at my LoRa mesh device (my research project).
4. A black BMW M4 arrives on autopilot, I get in.
5. I drive off through the city.
6. The road turns into a small galaxy with three planets: **Projects**, **Experience**, **Education**.

Each scene carries one real section of my CV, so the film is never "empty scrolling". I also decided early what must stay true: no invented numbers, no claims about unpublished research, and every third-party asset credited.

## 2. What I made myself

- The concept, storyboard, copy and all section content (`docs` in my working folder; the final text is in `lib/content.ts`).
- The source photos: my studio, the research device, project screenshots.
- The music on the Music page: they are my own beats.
- 3D pieces built in Blender, e.g. the AAIB head-office tower (script-built, then exported as a `.glb`).
- Design direction: near-black and off-white, iridescent purple only as a sparing accent, headings in capitals, a custom cursor and magnetic buttons.
- The research behind the Projects page: the LoRa image-delivery paper is mine; the site only shows what the manuscript supports.

## 3. Where AI tools were used

I'm saying this plainly because it matters for a portfolio:

- **Film clips**: generated from my own photos with Higgsfield and Kling (AI image-to-video), because I can't film a car pulling up in New York from my studio. I wrote the prompts and shot plan, picked the takes, trimmed and compressed them (ffmpeg) into the `h1…h5` clips in `public/media/`. An earlier attempt at a motion-captured 3D version of me looked wrong, so I dropped it and kept the video approach.
- **Code**: I used Claude Code (Anthropic) as a pair programmer. I set the architecture, chose the stack, reviewed what it wrote, tested on a real phone and desktop, rejected things that felt off, and I'm responsible for what's shipped. The planning and review files in my working folder (`TASKS.md`, handoffs, review notes) are the trail of that back-and-forth.

I'm a student learning by building real things. Using these tools is part of how I work, and I'd rather show it than hide it.

## 4. Build, in the order it happened

1. **Mockups first.** Several visual mockups to settle the look before any code. Reference sites were used only to name techniques (parallax, staggered scroll, magnetic buttons, card stacking), never to copy a layout.
2. **v2 → v3 rebuild.** My first site worked but felt like a demo reel. v3 kept the best parts (the 3D space) and restructured everything around "portfolio first, film second".
3. **Scroll engine.** GSAP ScrollTrigger scrubs video and text; Lenis smooths the scroll. Getting these two to agree was the hardest bug (below).
4. **3D space.** React Three Fiber scene with planets, ships and asteroids. Third-party models are credited on the site and kept out of this repo for licence reasons.
5. **Music.** A Supabase public storage bucket holds the audio. Dropping a file in the bucket publishes it; row-level security means visitors can only read.
6. **Performance.** Videos are re-encoded in desktop and mobile sizes, loaded lazily, and cached for a long time (`public/_headers`).
7. **Deploy.** `next build` exports plain files, uploaded to a Cloudflare Worker that only serves static assets on `yousef.unilinkcampus.com`.

## 5. What went wrong (and what I learned)

- **Scroll and video out of sync.** Lenis and ScrollTrigger were updating on different ticks, so text and video drifted. Fix: run Lenis first on every frame, resize it after each ScrollTrigger refresh, and remove scrub smoothing delays.
- **Clicking "home" mid-film.** Next.js jumped to the top while Lenis was still gliding, so scenes visibly rewound. Fix: close a curtain, jump while hidden, flush the scrubbed animations, then reveal.
- **Wrangler did something I didn't ask for.** Deploying without a config made it install a framework adapter and edit my files on its own. Fix: a committed `wrangler.jsonc` that pins exactly what gets deployed.
- **A heavy first load.** The first version was too big for phones; re-encoding and lazy loading fixed most of it. Performance is still being tuned.

## 6. Security thinking

Because this lives on a subdomain of my main project (UniLink), the rule was: **the portfolio must not be able to hurt UniLink.** So it is static files only, sets no cookies, has no forms or login, uses a separate Cloudflare Worker, and exposes only a read-only public key. Details are in the README.

## 7. Credits

Third-party 3D models and textures are credited in the site's credits list (Sketchfab authors and Solar System Scope). Fonts: Archivo, Inter, JetBrains Mono (Google Fonts, OFL).
