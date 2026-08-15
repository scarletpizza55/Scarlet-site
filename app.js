/* ============================================================
   Scarlet Deli & Pizza — site behaviour
   1. Mobile navigation
   2. Open / closed indicator
   3. Menu category scrollspy
   4. Reveal on scroll
   ============================================================ */

/* ---------- 1. Mobile navigation ---------- */
(function () {
  var toggle = document.getElementById('menuToggle');
  var panel  = document.getElementById('mobileNav');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', function () {
    var open = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  panel.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
})();


/* ============================================================
   2. Opening hours + open/closed indicator

   Hours come from notice.txt when it is readable, and fall back to
   the values written into each page otherwise. That fallback matters:
   if this script fails, visitors still see hours rather than a blank.
   ============================================================ */

// Baseline, used until notice.txt is read and if it can't be read.
// 24-hour numbers; a closing time after midnight is above 24, so 1am = 25.
var HOURS = {
  0: [10, 23],   // Sunday
  1: [10, 23],   // Monday
  2: [10, 23],   // Tuesday
  3: [10, 23],   // Wednesday
  4: [10, 24],   // Thursday
  5: [10, 25],   // Friday
  6: [10, 25]    // Saturday
};

var DAY_KEYS  = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
var DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var DAY_LONG  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* Accepts "10:00", "10", "10am", "10:30 PM", "23:00". Returns decimal hours. */
function parseTime(raw) {
  if (!raw) return null;
  var t = raw.trim().toLowerCase().replace(/\s+/g, '');
  var pm = /pm$/.test(t), am = /am$/.test(t);
  t = t.replace(/[ap]m$/, '');
  var bits = t.split(':');
  var h = parseInt(bits[0], 10);
  var m = bits.length > 1 ? parseInt(bits[1], 10) : 0;
  if (isNaN(h) || isNaN(m) || h < 0 || h > 24 || m < 0 || m > 59) return null;
  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  return h + m / 60;
}

/* "10am", "11pm", "12am", "10:30pm" */
function fmtTime(v) {
  var h = Math.floor(v % 24), m = Math.round((v % 1) * 60);
  var suffix = (h >= 12 && h < 24) ? 'pm' : 'am';
  var display = (h % 12 === 0) ? 12 : h % 12;
  return display + (m ? ':' + (m < 10 ? '0' + m : m) : '') + suffix;
}

function dayLabel(d) {
  var h = HOURS[d];
  return h ? fmtTime(h[0]) + '\u2013' + fmtTime(h[1]) : 'Closed';
}

/* Collapses consecutive days with identical hours into ranges. */
function groupDays() {
  var out = [], i = 0;
  while (i < 7) {
    var label = dayLabel(i), j = i;
    while (j + 1 < 7 && dayLabel(j + 1) === label) j++;
    out.push({ from: i, to: j, hours: label });
    i = j + 1;
  }
  return out;
}

function renderHours() {
  var groups = groupDays();

  var list = document.querySelector('.js-hours-list');
  if (list) {
    list.innerHTML = groups.map(function (g) {
      var name = (g.from === g.to) ? DAY_LONG[g.from]
               : DAY_SHORT[g.from] + '\u2013' + DAY_SHORT[g.to];
      return '<li>' + name + ' \u00b7 ' + g.hours + '</li>';
    }).join('');
  }

  var short = document.querySelector('.js-hours-short');
  if (short) {
    short.textContent = groups.map(function (g) {
      var name = (g.from === g.to) ? DAY_SHORT[g.from]
               : DAY_SHORT[g.from] + '\u2013' + DAY_SHORT[g.to];
      return name + ' ' + g.hours;
    }).join(' \u00b7 ');
  }

  var long = document.querySelector('.js-hours-long');
  if (long) {
    long.innerHTML = groups.map(function (g) {
      var name = (g.from === g.to) ? DAY_LONG[g.from]
               : DAY_LONG[g.from] + '\u2013' + DAY_LONG[g.to];
      return name + ' \u00b7 ' + g.hours;
    }).join('<br>');
  }
}

function checkOpen() {
  var el = document.getElementById('status');
  var text = document.getElementById('statusText');
  if (!el || !text) return;

  // Evaluated in New Jersey time, not the visitor's timezone.
  var nowNJ = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  var day = nowNJ.getDay();
  var hour = nowNJ.getHours() + nowNJ.getMinutes() / 60;

  var open = false, closesAt = null;

  var today = HOURS[day];
  if (today && hour >= today[0] && hour < today[1]) {
    open = true; closesAt = today[1];
  }

  // A window that began yesterday may still be running past midnight.
  var yday = HOURS[(day + 6) % 7];
  if (!open && yday && yday[1] > 24 && hour < yday[1] - 24) {
    open = true; closesAt = yday[1] - 24;
  }

  if (open) {
    el.setAttribute('data-open', 'yes');
    text.textContent = 'Open now \u2014 until ' + fmtTime(closesAt);
  } else {
    el.setAttribute('data-open', 'no');
    text.textContent = 'Currently closed';
  }
}

checkOpen();
setInterval(checkOpen, 60000);


/* ---------- 3. Menu category scrollspy ---------- */
(function () {
  var links = document.querySelectorAll('.cat-nav a');
  if (!links.length || !('IntersectionObserver' in window)) return;

  var map = {};
  var targets = [];
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) { map[id] = a; targets.push(section); }
  });

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove('is-active'); });
      var active = map[entry.target.id];
      if (!active) return;
      active.classList.add('is-active');
      // Keep the active pill in view on narrow screens
      var strip = active.parentElement;
      if (strip && strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({
          left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2,
          behavior: 'smooth'
        });
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  targets.forEach(function (t) { spy.observe(t); });
})();


/* ---------- 4. Reveal on scroll ---------- */
(function () {
  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (!entry.isIntersecting) return;
      setTimeout(function () { entry.target.classList.add('is-in'); }, i * 65);
      seen.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  items.forEach(function (el) { seen.observe(el); });
})();


/* ============================================================
   5. Form submission — Web3Forms
   Submits in the background so the person stays on the page and
   sees a confirmation, rather than being bounced to a third-party
   "success" page that looks nothing like this site.
   ============================================================ */

(function () {
  var forms = document.querySelectorAll('.js-w3form');
  if (!forms.length) return;

  forms.forEach(function (form) {
    var status = form.querySelector('.form-status');
    var done   = form.parentElement.querySelector('.form-done');
    var button = form.querySelector('button[type="submit"]');

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status' + (kind ? ' form-status--' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var key = form.querySelector('[name="access_key"]');
      if (!key || key.value.indexOf('YOUR_ACCESS_KEY') !== -1) {
        say('This form isn\u2019t connected yet. Please call (732) 214-8800.', 'err');
        console.error(
          'Web3Forms: access_key is still the placeholder. Paste your key from ' +
          'web3forms.com into the hidden access_key field in catering.html and contact.html.'
        );
        return;
      }

      var original = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Sending\u2026'; }
      say('Sending your message\u2026', 'busy');

      var data = Object.fromEntries(new FormData(form));

      // Field names double as the labels in the notification email, so they're
      // written for humans ("Event Date", not "event_date"). That means the
      // usual auto-detection of a field called `email` no longer fires, so set
      // reply-to explicitly — otherwise hitting Reply on an inquiry goes nowhere.
      if (data['Email']) { data.replyto = data['Email']; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
      .then(function (r) {
        if (r.ok && r.body.success) {
          if (done) {
            form.hidden = true;
            done.hidden = false;
            done.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            form.reset();
            say('Thanks — your message has been sent.', 'ok');
          }
        } else {
          throw new Error((r.body && r.body.message) || 'Submission failed');
        }
      })
      .catch(function (err) {
        console.error('Web3Forms error:', err);
        say('Sorry — that didn\u2019t send. Please try again, or call us on (732) 214-8800.', 'err');
      })
      .finally(function () {
        if (button) { button.disabled = false; button.textContent = original; }
      });
    });
  });
})();


/* ============================================================
   6. Announcement bar
   Hidden by default in the HTML so it can never flash on screen
   before this runs. Shown unless the visitor dismissed it, and
   the dismissal is remembered for 14 days.
   ============================================================ */

(function () {
  var bar = document.getElementById('announce');
  var close = document.getElementById('announceClose');
  if (!bar) return;

  var KEY = 'sdp-announce-dismissed';
  var DAYS = 14;

  var dismissed = false;
  try {
    var until = window.localStorage.getItem(KEY);
    dismissed = until && Date.now() < parseInt(until, 10);
  } catch (e) {
    // Private browsing can block localStorage. Showing the bar is the safe default.
  }

  if (!dismissed) bar.hidden = false;

  if (close) {
    close.addEventListener('click', function () {
      bar.hidden = true;
      try {
        window.localStorage.setItem(KEY, String(Date.now() + DAYS * 864e5));
      } catch (e) {}
    });
  }
})();


/* ============================================================
   7. Site settings from notice.txt
   One fetch drives both the banner and the opening hours. Edit
   that file on GitHub and the site updates within a minute.

   Fails silent: if the file is missing, unreachable or malformed,
   no banner shows and the hours written into the page are kept.
   ============================================================ */

(function () {
  var bar = document.getElementById('notice');
  var text = document.getElementById('noticeText');

  // Cloudflare caches static files hard. A closure notice that appears
  // two hours late is worse than useless, so read it fresh every time.
  fetch('/notice.txt?v=' + Date.now(), { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('notice.txt not reachable');
      return res.text();
    })
    .then(function (raw) {
      var cfg = {};
      raw.split(/\r?\n/).forEach(function (line) {
        line = line.trim();
        if (!line || line.charAt(0) === '#') return;     // skip blanks and comments
        var i = line.indexOf(':');
        if (i === -1) return;
        var key = line.slice(0, i).trim().toUpperCase();
        var val = line.slice(i + 1).trim();              // colons inside a message are fine
        if (!(key in cfg)) cfg[key] = val;               // first occurrence wins
      });

      // ---------- hours ----------
      // Applied only if EVERY day parses. A half-updated table would be
      // worse than the baseline it replaced.
      var parsed = {}, complete = true;
      for (var d = 0; d < 7; d++) {
        var v = cfg[DAY_KEYS[d]];
        if (!v) { complete = false; break; }
        if (/^closed$/i.test(v.trim())) { parsed[d] = null; continue; }

        var parts = v.split(/\s*(?:-|\u2013|\u2014|to)\s*/i);
        if (parts.length < 2) { complete = false; break; }
        var o = parseTime(parts[0]), c = parseTime(parts[1]);
        if (o === null || c === null) { complete = false; break; }
        if (c <= o) c += 24;                              // closes after midnight
        parsed[d] = [o, c];
      }

      if (complete) {
        for (var k = 0; k < 7; k++) {
          HOURS[k] = parsed[k] || [0, 0];                 // [0,0] never matches, so: closed
        }
        renderHours();
        checkOpen();
      } else {
        console.warn('Hours in notice.txt incomplete or malformed \u2014 keeping the built-in hours.');
      }

      // ---------- banner ----------
      if (!bar || !text) return;
      var show = (cfg.SHOW || '').toUpperCase();
      var on = (show === 'Y' || show === 'YES' || show === 'TRUE' || show === '1');
      if (!on || !cfg.MESSAGE) return;

      var style = (cfg.STYLE || 'alert').toLowerCase();
      if (['alert', 'notice', 'info'].indexOf(style) === -1) style = 'alert';

      text.textContent = cfg.MESSAGE;
      bar.className = 'notice notice--' + style;
      bar.hidden = false;

      // One banner at a time. An operational notice outranks marketing.
      var promo = document.getElementById('announce');
      if (promo) promo.hidden = true;
    })
    .catch(function (err) {
      console.warn('notice.txt not applied:', err.message);
    });
})();
