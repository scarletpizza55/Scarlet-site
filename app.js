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
   2. Open / closed indicator
   Edit HOURS to match the real schedule. 24-hour format;
   a closing time after midnight uses a number above 24, so a
   3am close is written as 27.
   ============================================================ */

var HOURS = {
  0: [10, 23],   // Sunday    10am – 11pm
  1: [10, 23],   // Monday    10am – 11pm
  2: [10, 23],   // Tuesday   10am – 11pm
  3: [10, 23],   // Wednesday 10am – 11pm
  4: [10, 24],   // Thursday  10am – 12am
  5: [10, 25],   // Friday    10am – 1am  (25 = 1am)
  6: [10, 25]    // Saturday  10am – 1am
};

function checkOpen() {
  var el = document.getElementById('status');
  var text = document.getElementById('statusText');
  if (!el || !text) return;

  // Always evaluated in New Jersey time, not the visitor's timezone.
  var nowNJ = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  var day = nowNJ.getDay();
  var hour = nowNJ.getHours() + nowNJ.getMinutes() / 60;

  var open = false, closesAt = null;

  var today = HOURS[day];
  if (today && hour >= today[0] && hour < today[1]) {
    open = true; closesAt = today[1];
  }

  // A window that started yesterday may still be running past midnight.
  var yday = HOURS[(day + 6) % 7];
  if (!open && yday && yday[1] > 24 && hour < yday[1] - 24) {
    open = true; closesAt = yday[1] - 24;
  }

  if (open) {
    var h = Math.floor(closesAt % 24);
    var suffix = (h >= 12 && h < 24) ? 'pm' : 'am';
    var display = (h % 12 === 0) ? 12 : h % 12;
    el.setAttribute('data-open', 'yes');
    text.textContent = 'Open now — until ' + display + suffix;
  } else {
    el.setAttribute('data-open', 'no');
    text.textContent = 'Currently closed';
  }
}
checkOpen();
setInterval(checkOpen, 60000);


/* ---------- Footer year ---------- */
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();


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
