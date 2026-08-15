# Editing guide

Everything you'll change regularly: photos, menu items, prices, hours, links.

---

## First: pick one workflow, then delete the other

The site can be edited two ways, and mixing them will lose your work.

**Option A — edit the HTML directly (recommended).**
The six `.html` files are the site. Open one, change it, save, push. Nothing to
build. Anyone can do it, including from a phone.

**Option B — regenerate from the Python scripts.**
`pages.py`, `page_menu.py`, `page_rest.py` and `page_rest2.py` produce the HTML
from templates. Useful only if you're changing the nav or footer across all six
pages at once.

**Rebuilding overwrites the HTML files completely.** If you edit `menu.html` by
hand on Monday and someone runs `python3 page_menu.py` on Tuesday, Monday's work
is gone with no warning.

Unless you plan to keep using the scripts, delete them now:

```bash
rm build.py pages.py page_menu.py page_rest.py page_rest2.py
```

The rest of this guide assumes Option A.

---

## Photos

All 25 image slots are filled with processed photos in `img/`. Nothing is a
placeholder any more.

### Swapping a photo

Every slot is a div with an inline background image. Change the filename:

```html
<div class="photo photo--wide" style="background-image:url('img/card-deli.jpg')"></div>
```

Hero banners are the same idea on a different element:

```html
<div class="hero__media" style="background-image:url('img/hero-home.jpg')" aria-hidden="true"></div>
```

### What's in `img/` and where each file is used

| File | Used on | Source |
|---|---|---|
| `hero-home.jpg` | index hero | Deli spread, full frame |
| `hero-menu.jpg` | menu hero | Deli spread, food only |
| `hero-order.jpg` | order hero | Taco bowl |
| `hero-catering.jpg` | catering hero | Cholley bhature platter |
| `hero-about.jpg` | about hero | Deli spread with signage |
| `hero-contact.jpg` | contact hero | Window and street view |
| `card-deli.jpg` | index + about, Scarlet Deli card | Philly hero sandwich |
| `card-pizzatwist.jpg` | index + about, Pizza Twist card | Tandoori fusion pizza |
| `card-tacotwist.jpg` | index + about, Taco Twist card | Fusion tacos |
| `card-doordash.jpg` | order page | Burger and shake |
| `card-ubereats.jpg` | order page | Chaat bowl |
| `card-pizza-order.jpg` | order page | Achari fusion pizza |
| `card-taco-order.jpg` | order page | Tacos on the board |
| `brand-pizzatwist.jpg` | menu, Pizza Twist block | Tikka masala fusion pizza |
| `brand-tacotwist.jpg` | menu, Taco Twist block | Taco bowl |
| `tall-burger.jpg` | index cluster | Fusion burger and fries |
| `tall-shake.jpg` | about cluster | Branded shake, burger, tacos |
| `sq-tikka-pizza.jpg` | index cluster | Tikka chicken fusion pizza |
| `sq-tacos.jpg` | index cluster | Fusion tacos |
| `sq-garlic-pizza.jpg` | about cluster | Bombay garlic fusion pizza |
| `sq-pesto-pizza.jpg` | about cluster | Palak pesto paneer pizza |
| `sq-corn-pizza.jpg` | *unused spare* | Chilli corn fusion pizza |
| `community.jpg` | index, Rutgers section | Tacos and chaat |
| `location.jpg` | about, location section | Storefront signage |

### Two things to know about these files

**The pizzas sit on a generated cream backdrop.** They arrived as top-down shots
on white. Cropping a circle into a 16:9 card would have sliced it into a wedge,
so the white was cut away and each pizza composited onto a warm canvas with a
soft contact shadow. That's why they read as catalogue shots rather than
lifestyle photos — it's deliberate, and consistent across all six.

**Several came from promotional menu boards with prices printed on them.** Those
prices were cropped out. If you re-crop any of these from the original source
files, check the result for stray price badges and headline text before
publishing — that was the single most common problem in preparing this set.

### Adding your own photos later

Drop the file in `img/` and point a slot at it. Aspect ratios: `.photo` is 4:3,
`.photo--wide` is 16:9, `.photo--tall` is 3:4, `.photo--square` is 1:1. Resize to
about 1200px on the long edge (1920px for heroes) and keep files under 300KB.
Squoosh.app does this free in the browser.

---

## Menu

The menu lives in `menu.html`, in the section starting around line 100.

### Change a price

Find the item, change the number. That's the whole job.

```html
<span class="price">$12.50</span>
```

### Add an item

Copy any existing `<li>` block and edit it. The full pattern:

```html
<li>
  <div class="item-line">
    <span class="name">Chicken Parm Hero</span>
    <span class="badge badge--halal">Halal</span>
    <span class="rule"></span>
    <span class="price">$12.50</span>
  </div>
  <p class="item-desc">Breaded cutlet, marinara, melted mozzarella, toasted.</p>
</li>
```

The `badge` and `item-desc` lines are both optional — delete either one if you
don't need it. The `<span class="rule"></span>` draws the dotted line between the
name and the price, so leave it in.

Badges available:

```html
<span class="badge badge--halal">Halal</span>
<span class="badge badge--veg">Vegetarian</span>
<span class="badge badge--vegan">Vegan</span>
<span class="badge badge--new">New</span>
```

You can put more than one on an item. Just repeat the span.

### Remove an item

Delete from `<li>` through `</li>`, including both tags.

### Mark something sold out temporarily

Rather than deleting it and retyping it next week:

```html
<span class="badge badge--new" style="background:#EEE;color:#777">Sold out today</span>
```

### Add a whole new category

Two steps — miss the second and the category exists but nobody can jump to it.

**Step 1.** Copy an existing `<div class="course reveal" id="...">` block,
paste it where you want it, and give it a new unique `id`:

```html
<div class="course reveal" id="sides">
  <div class="course__head">
    <h3 class="h-md">Sides</h3>
    <p class="course__note">Add to any sandwich</p>
  </div>
  <ul class="items">
    <li>
      <div class="item-line">
        <span class="name">French Fries</span>
        <span class="rule"></span>
        <span class="price">$4.00</span>
      </div>
    </li>
  </ul>
</div>
```

**Step 2.** Add a matching link to the sticky category strip near the top of
`menu.html` (search for `cat-nav__scroll`):

```html
<a href="#sides">Sides</a>
```

The `href` must match the `id` exactly, including case. The highlight-as-you-scroll
behaviour wires itself up automatically — no other changes needed.

### Reorder categories

Move the whole `<div class="course">` block, and move its link in `cat-nav` to
match. They're independent, so a mismatch means the strip is in a different order
from the page.

---

## Pizza Twist & Taco Twist menus

Both "View Menu" buttons on `menu.html` open PDFs hosted on Google Drive:

| Button | File | Drive ID |
|---|---|---|
| View Pizza Twist Menu | Pizzatwist Menu New Brunswick.pdf | `10CqAmaU-O7twKf2NqyDTJmuTi66ShsgN` |
| View Taco Twist Menu | Tacotwist Menu New Brunswick.pdf | `1I_JquxO1HMZ4mn4zwXRkCTGQikfsjAJo` |

Both were confirmed publicly reachable with no Google account signed in.

### Updating a menu without touching the website

This is the part that matters. In Drive, right-click the file and choose
**Manage versions → Upload new version**. The file keeps its ID, the link keeps
working, and the new menu is live immediately. No commit, no deploy.

**Do not delete the old file and upload a new one.** A new upload gets a new ID,
and the button on your site 404s with no warning. This is the single most common
way Drive-hosted links break.

### If sharing ever gets changed

The files must stay on **Anyone with the link → Viewer**. If someone tightens it
to "Restricted", customers hit a "You need access" screen instead of the menu,
and nothing on your end looks broken.

Quick check: open either link in a private or incognito window. If the menu
appears, it's public. If you see a request-access screen, fix it in Drive under
Share → General access.

### Swapping in a different link

Replace the `href` on the button in `menu.html`:

```html
<a class="btn btn--lg" href="YOUR-URL-HERE" target="_blank" rel="noopener">
```

Keep `target="_blank"` and `rel="noopener"` as they are — the first opens the
menu in a new tab so customers don't lose your site, the second is a security
measure.

### Two tradeoffs worth knowing

**Google can't read these menus.** Text inside a PDF on Drive does nothing for
your search ranking, and Drive-hosted files aren't associated with your domain at
all. Every Pizza Twist and Taco Twist dish name is invisible to search — which is
exactly why the Scarlet Deli menu is typed out as real text on the page. If
"Indian fusion pizza New Brunswick" matters to you, those menus eventually need
typing out too.

**Drive adds a step.** Tapping the button loads Google's viewer rather than the
menu itself, and on phones with the Drive app installed it may bounce out of the
browser entirely. It works, and the easy-updating tradeoff is a fair one — just
know it's slower than a PDF served from your own domain.

---

## Hours

Hours appear in **five** places and all five must agree, or the site contradicts
itself:

1. Info bar on `index.html` (search for `Open</dt>`)
2. Footer of every page (search for `<h4>Hours</h4>`)
3. Contact page hours block
4. The `HOURS` object at the top of `app.js`
5. `openingHoursSpecification` in the JSON-LD block in `index.html`

Number 4 is the one that trips people up. It uses 24-hour numbers, and a closing
time after midnight is written as a number **above 24**:

```javascript
var HOURS = {
  0: [9,  24],   // Sunday    9am – 12am
  1: [8,  25],   // Monday    8am – 1am    (25 = 1am)
  5: [8,  27],   // Friday    8am – 3am    (27 = 3am)
};
```

Get this wrong and the "Open now" badge in the top bar lies to customers.

---

## notice.txt — banner and opening hours

One file controls two things across the whole site. Edit it on GitHub, commit,
and the site updates within about a minute. **This works from your phone**,
which is the point — a power cut at 6pm is not a laptop moment.

### The banner

```
SHOW: Y
STYLE: alert
MESSAGE: Closed today due to a power outage. We expect to reopen tomorrow morning.
```

| Setting | Values |
|---|---|
| `SHOW` | `Y` shows it, `N` hides it |
| `STYLE` | `alert` (red, closures) · `notice` (amber, early close or limited menu) · `info` (dark, announcements) |
| `MESSAGE` | One or two sentences |

When the banner is on, the red "Welcome Rutgers students" marketing bar hides
itself. One banner at a time, and the urgent one wins.

**There is no expiry.** Nothing resets it. A closure notice left on `Y` tells
every visitor you're shut while you're serving. Set it back to `N` before you
unlock the door.

### Opening hours

```
SUN: 10:00 - 23:00
MON: 10:00 - 23:00
TUE: 10:00 - 23:00
WED: 10:00 - 23:00
THU: 10:00 - 00:00
FRI: 10:00 - 01:00
SAT: 10:00 - 01:00
```

Both formats work — `10:00 - 23:00` or `10am - 11pm`. For a day you're shut,
write `TUE: CLOSED`.

**Closing after midnight just works.** A closing time earlier than the opening
time is read as the next day, so `FRI: 10:00 - 01:00` means 10am until 1am
Saturday. No special syntax.

Changing hours here updates the footer on every page, the homepage info bar, the
contact page, and the live "Open now — until 11pm" badge. Consecutive days with
matching hours group automatically, so `Sun–Wed 10am–11pm` appears without you
formatting anything.

**All seven days must be present and valid**, or the file's hours are ignored
entirely and the built-in ones are used. That's deliberate — a half-applied
hours table would be worse than the one it replaced. If your edit doesn't take
effect, check every day line.

### Two things this does NOT change

**Google.** Search results and Maps read your Google Business Profile, not this
file. For a permanent hours change, update that too — it's what most customers
actually see.

**The built-in fallback.** The hours written into the pages stay as they are, so
if this file breaks the site still shows something sensible. For a permanent
change, ask to have the page hours and schema markup updated as well.

### If something goes wrong

The failure mode is silence. Delete the file, break the formatting, or lose your
connection, and: no banner appears, the built-in hours are used, and nothing else
on the site is affected. Keep each setting on one line, keep the labels exactly
as written, and lines starting with `#` are ignored so the notes in the file are
safe to leave.

---

## Forms — one key, two files

Both the catering inquiry and the contact form run on Web3Forms. To activate:

1. Go to **web3forms.com**, enter the email address where you want inquiries to
   arrive, click Create Access Key. It's emailed to you in seconds — no account,
   no password.
2. In `catering.html`, find this line near the form:

   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
   ```

   Replace `YOUR_ACCESS_KEY_HERE` with your key.
3. Do the same in `contact.html`. **Same key in both files** — one key handles
   any number of forms, and the subject line tells you which form a message
   came from.
4. Deploy, then submit both forms yourself with a real message. Check your
   inbox, and check the spam folder the first time.

**The access key is not a password.** Web3Forms designed it to be public — it's
an alias for your email address, which means your real address never appears in
the page source where spam bots scrape it. Safe in a public GitHub repo.

**Free tier is 250 submissions a month** across both forms. If catering outgrows
that, their paid plan is a few dollars.

**Until a real key is pasted in**, the forms refuse to submit and show "This form
isn't connected yet. Please call (732) 214-8800." rather than pretending to
send. That's deliberate — a form that silently swallows a $400 catering lead is
worse than no form at all.

**To change where inquiries go**, create a new key with the new email address and
swap it into both files. Nothing else changes.

**Spam protection:** each form has a hidden checkbox called `botcheck`. People
never see it; bots fill it in and get rejected. Leave it alone.

---

## Links

Search each file for `href="#"` — every one is a placeholder waiting for a real
URL.

- `order.html` — four ordering buttons
- `menu.html` — "View Pizza Twist Menu" and "View Taco Twist Menu"
- Every page footer — Instagram and Facebook
- `contact.html` — social icons

Leave `target="_blank" rel="noopener"` on external links. The `rel` attribute is
a security measure, not decoration.

---

## Publishing your changes

### Easiest: edit on GitHub in the browser

Once the repo is on GitHub, you can edit any file at github.com — click the file,
click the pencil icon, make the change, click "Commit changes". Vercel picks it
up and the live site updates in about 30 seconds.

This works on a phone. It's how you fix a wrong price at 9pm without opening a
laptop, and it's what to teach a manager who needs to update the menu.

For photos: navigate into the `img` folder, click "Add file" → "Upload files",
drag the photo in, commit. Then edit the HTML to point at it.

### From your computer

```bash
# make your edits, then:
git add .
git commit -m "Updated pizza prices"
git push
```

Vercel deploys automatically on every push.

### Check it before you push

Open the HTML file directly in your browser — double-click it, or drag it into a
Chrome tab. Everything works locally except the Google Maps embed and the forms.
Always look at it on a phone-width window before pushing; that's how most of your
customers will see it.

### If something breaks

Vercel keeps every previous deployment. In the dashboard, open Deployments, find
the last good one, and click "Promote to Production" — you're back to a working
site in seconds. Nothing to undo in the code.
