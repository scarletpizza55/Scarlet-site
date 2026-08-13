# Scarlet Deli & Pizza — website

Six static pages. No framework, no build step required, no dependencies.
Edit the HTML directly and redeploy.

```
index.html      Home
menu.html       Full Scarlet Deli menu + Pizza Twist / Taco Twist blocks
order.html      Four external ordering cards
catering.html   Occasions + inquiry form
about.html      Story and concepts
contact.html    Details, map, contact form
style.css       All styling — design tokens at the top under :root
app.js          Mobile nav, open/closed indicator, scrollspy, scroll reveal
img/            Put your photos here
build.py …      Optional generator scripts (see "Regenerating" below)
```

---

## Launch checklist

### 1. Contact details
Placeholders appear on every page. Find and replace across all six HTML files:

| Placeholder | Where |
|---|---|
| `(732) 555-0100` | utility bar, footer, buttons |
| `+17325550100` | every `tel:` link |
| `hello@scarletdelipizza.com` | footer, contact page |

Also update the `telephone` field in the JSON-LD block near the top of `index.html`.

### 2. Ordering links
`order.html` and `menu.html` have buttons with `href="#"`. Replace each with the
real URL — open the store page, copy from the browser address bar, paste it in.
Leave `target` and `rel` exactly as they are.

- Scarlet Deli on DoorDash
- Scarlet Deli on Uber Eats
- Pizza Twist ordering site
- Taco Twist ordering site
- "View Pizza Twist Menu" and "View Taco Twist Menu" buttons on `menu.html`

### 3. Forms — required before either form will work
Both forms post to `https://formspree.io/f/YOUR_FORM_ID`, which is a placeholder.
Create a free account at formspree.io, make a form, copy the endpoint, and paste
it into the `action` attribute in **catering.html** and **contact.html**.

Free tier covers 50 submissions a month. Netlify Forms and Basin work the same
way if you prefer. Until you do this, submissions go nowhere.

### 4. Hours
Hours appear in four places and all four must agree:

- the info bar on `index.html`
- the footer on every page
- the contact page hours block
- the `HOURS` object at the top of `app.js` — **24-hour format, and a closing
  time after midnight is written as a number above 24.** A 3am close is `27`.
- the `openingHoursSpecification` in the JSON-LD block in `index.html`

### 5. Google Business Profile match
The address in the JSON-LD block in `index.html` must match your Google Business
Profile **character for character**. `Blvd` vs `Boulevard` vs `Blvd.` are three
different strings to Google's local ranking. This is the cheapest local SEO win
available and most restaurants get it wrong.

### 6. Social links
`href="#"` in the footer of every page and on the contact page.

---

## Photos

Every image on the site is currently a designed gradient placeholder, so the
layout holds up empty. To swap in a real photo:

```html
<!-- before -->
<div class="photo photo--wide ph-2"></div>

<!-- after -->
<div class="photo photo--wide" style="background-image:url('img/deli-hero.jpg')"></div>
```

Drop files into `img/`. Aspect ratio helpers: `.photo` is 4:3 by default,
`.photo--wide` is 16:9, `.photo--tall` is 3:4, `.photo--square` is 1:1.

The hero banners use a different element — edit the inline `background-image`
on `.hero__media` in each page's hero section.

**What to shoot.** Twelve to fifteen photos covers the whole site: a hero shot
of food on the counter, one per concept, four to six individual dishes, and one
of the space. Natural light near a window, no flash, camera about 30–40 degrees
above the plate. Keep each file under 300KB — most of your traffic is on
cellular data.

---

## Editing the menu

The menu on `menu.html` is plain HTML. Each item follows this pattern:

```html
<li>
  <div class="item-line">
    <span class="name">Chicken Parm Hero</span>
    <span class="badge badge--halal">Halal</span>   <!-- optional -->
    <span class="rule"></span>
    <span class="price">$12.50</span>
  </div>
  <p class="item-desc">Optional one-line description.</p>   <!-- optional -->
</li>
```

Badges available: `badge--halal`, `badge--veg`, `badge--vegan`, `badge--new`.

To add a whole category, copy an existing `.course` block, change its `id`, and
add a matching link to the `.cat-nav` strip at the top. The sticky category nav
highlights automatically as you scroll — no extra wiring needed.

---

## Regenerating (optional)

The `.py` files generated these pages from shared header/footer templates, which
is how the six pages stay consistent. You do not need them — the HTML is final
and editable by hand. But if you'd rather change the nav or footer in one place
and rebuild:

```bash
python3 pages.py && python3 page_menu.py && python3 page_rest.py && python3 page_rest2.py
```

`page_menu.py` holds the whole menu as a Python list, which is the fastest way to
do a bulk price update. **Note:** rebuilding overwrites the HTML, so any hand
edits to those files are lost. Pick one approach and stick with it. If you'd
rather just edit HTML, delete the `.py` files.

---

## Deploy

```bash
cd scarlet-site
git init && git add . && git commit -m "Initial site"
# push to a new GitHub repo, then import it at vercel.com
```

Framework preset: **Other**. Vercel serves it as-is and provisions SSL free.

**GoDaddy DNS.** Delete GoDaddy's auto-created "Parked" A record first, and if
you ever used Domain Connect or forwarding, remove that connection — it creates
locked A records that will keep Vercel stuck on "Invalid Configuration" no matter
what else you do. Then add the exact A and CNAME values shown on your Vercel
project's domain card. Don't copy IPs from tutorials; newer Vercel projects get
project-specific values.

---

## Design tokens

Top of `style.css`:

```css
--scarlet:  #CC0033;   /* Rutgers scarlet — buttons, accents, eyebrows */
--ink:      #1A1A18;   /* body text, dark sections, footer */
--canvas:   #FAF8F5;   /* alternating section background */
--sand:     #F1ECE4;   /* photo placeholder base */
--leaf:     #2E7D52;   /* halal / vegetarian / vegan badges */
--r-lg:     28px;      /* card corner radius */
```

Type: **Bricolage Grotesque** for headings, **DM Sans** for body, both from
Google Fonts.

---

## Accessibility

Built in and worth preserving if you edit: skip link, visible keyboard focus
rings, `aria-current` on the active nav item, labelled form fields, an
accessible mobile menu toggle, and `prefers-reduced-motion` support that
disables all animation. The reveal-on-scroll effect degrades to plain visible
content if JavaScript fails.
