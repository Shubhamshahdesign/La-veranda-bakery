// La Véranda Bakery — small helpers + GSAP fade-ins

// Hours by weekday (0 = Sunday). [open, close] in 24h decimal.
const HOURS = { 0: [6, 16], 1: [6, 18], 2: [6, 18], 3: [6, 18], 4: [6, 18], 5: [6, 17], 6: [6, 16] };
const fmt = h => (h > 12 ? h - 12 : h) + (h >= 12 ? 'pm' : 'am');

// London time, so the badge is right wherever the page is opened
function londonNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, time: Number(get('hour')) % 24 + Number(get('minute')) / 60 };
}

const { day, time } = londonNow();
const [open, close] = HOURS[day];

const status = document.querySelector('[data-status]');
if (status) {
  if (time >= open && time < close) {
    status.textContent = `Open now until ${fmt(close)}`;
    status.classList.add('is-open');
  } else {
    const nextOpen = time < open ? `today at ${fmt(open)}` : `tomorrow at ${fmt(HOURS[(day + 1) % 7][0])}`;
    status.textContent = `Closed, opens ${nextOpen}`;
    status.classList.add('is-closed');
  }
}
document.querySelectorAll('[data-today]').forEach(el => (el.textContent = `${fmt(open)}–${fmt(close)}`));
document.querySelector(`.hours tr[data-day="${day}"]`)?.classList.add('today');
document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen);
  toggle.textContent = isOpen ? 'Close' : 'Menu';
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Menu';
}));

// Vegetarian filter
const veg = document.getElementById('vegToggle');
const paper = document.querySelector('.paper');
veg?.addEventListener('change', () => paper.classList.toggle('veg-only', veg.checked));

// Highlight current menu section in the index
const links = [...document.querySelectorAll('.menu-index a')];
if ('IntersectionObserver' in window && links.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.menu-group').forEach(g => io.observe(g));
}

// Fade-ins (GSAP). Content stays visible if GSAP fails to load or motion is reduced.
window.addEventListener('load', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Front page: a gentle staggered entrance
  const front = gsap.utils.toArray('.front [data-fade]');
  gsap.from(front, { opacity: 0, y: 18, duration: 1.1, ease: 'power2.out', stagger: 0.12 });

  // Everything else: fade in as it scrolls into view
  const rest = gsap.utils.toArray('[data-fade]').filter(el => !el.closest('.front'));
  gsap.set(rest, { opacity: 0, y: 24 });
  ScrollTrigger.batch(rest, {
    start: 'top 88%',
    once: true,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', stagger: 0.1 })
  });
});
