# EqualSplit website

Static site for EqualSplit, a 501(c)(3) nonprofit that builds and donates LiDAR sprint timing gates to school track programs.

## Stack and deploy

- Plain static HTML and CSS. No build step, no framework, no package.json.
- Hosted on GitHub Pages from `equalsplittiming/equalsplittiming.github.io`, served at the custom domain `equalsplit.org`.
- **Pushing to `main` deploys to production immediately.** There is no staging environment. Do not push without explicit approval.
- To preview locally: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`.

## Structure

```
index.html                      home
404.html                        not-found page
<section>/index.html            about, apply, contact, donate, privacy, product,
                                resources, safety, setup, testimonials, updates
resources/<slug>/index.html     long-form articles
style.css                       all shared styles
images/                         photos, og-image.jpg (1200x630 social preview)
logo.png                        650x553
```

16 pages total. URLs are directory-based (`/apply/`, not `/apply.html`).

## Google Ad Grants policy

This site is the landing destination for a Google Ad Grants account. Violating the website policy can suspend the account without notification. These are the actual published requirements:

1. **Substantial original content.** Every page needs real text written by us. The most common rejection reason is thin pages or content duplicated from elsewhere.
2. **Clear mission.** A first-time visitor should understand within seconds what EqualSplit is and what it does.
3. **No broken links or non-functional elements.** Google specifically calls out broken donation buttons. This is why `check.py` scans internal links.
4. **HTTPS on every page.** GitHub Pages handles this, but do not introduce mixed content by loading any asset over http.
5. **Mobile responsive and fast.** Pages must work on phones and load quickly. Unoptimized images are the usual culprit, which is why every `<img>` carries explicit dimensions and lazy loading.
6. **Limited commercial content.** Note this is "limited," not "none." See below for how we handle it.

## Site-specific decisions

These are our own choices, not Google rules. They still hold, but the reasoning is ours.

1. **No commerce on equalsplit.org.** The store lives at `equalsplitshop.com`. Google's policy permits limited commercial content, but we moved the store to a separate domain as a conservative reading after repeated rejections. Do not reintroduce prices, buy buttons, or checkout on this domain. Linking to the store as "our store site" is fine.
2. **Do not rename or delete page directories.** `/apply` and `/setup` are printed on the physical insert card that ships with every gate and appear in outbound coach emails and grant applications. A renamed URL breaks materials already in the field that cannot be recalled.
3. **Keep contrast readable.** Aim for WCAG AA (4.5:1 on body text). This is accessibility good practice rather than an Ad Grants requirement, but it is worth holding.

## Conventions

- Styling is a mix of `style.css` and inline `style="..."` attributes using CSS custom properties: `var(--font-display)`, `var(--navy)`, and the gold accent. Match the surrounding page rather than introducing a new system.
- Button classes: `.btn-gold`, `.btn-ghost-dark`, `.btn-ghost`. They have small-screen overrides at 600px and 430px in `style.css`.
- Every page carries the GA4 tag `G-ZQEH6G9YK7`. New pages must include it.
- Every page needs: one `<h1>`, a `<title>`, a `<meta name="description">`, `og:title` / `og:description` / `og:image` / `og:image:width` / `og:image:height`, and the four `twitter:*` tags pointing at `https://equalsplit.org/images/og-image.jpg`.
- Every `<img>` needs `alt`, explicit `width` and `height`, and `decoding="async"`. Add `loading="lazy"` unless it is above the fold.
- Every `target="_blank"` link needs `rel="noopener"`.
- Adding a page means updating `sitemap.xml` and any relevant schema markup.

## Before pushing

Run `python3 check.py` and confirm it reports clean. It scans every page for broken internal links, missing alt text and image dimensions, missing titles and meta descriptions, missing or multiple h1s, `target="_blank"` without noopener, missing analytics tags, and duplicate headings.

## Tone

Written for high school and youth coaches, many of whom are working with no budget. Plain and direct. State what the equipment does and what it costs a program (nothing, if donated). Avoid marketing voice, avoid hype, avoid em dashes.
