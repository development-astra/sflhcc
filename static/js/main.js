// SFLHCC – main.js

/* ------------------------------------------------------------
   Photo carousel — "This Week in the Chamber"
   One main slide with a peek of the next; prev/next + dots.
   ------------------------------------------------------------ */
function initCarousel(root) {
  const track = root.querySelector('[data-carousel] .events-track, .events-track');
  const slides = Array.from(root.querySelectorAll('.events-slide'));
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
  if (!track || slides.length === 0) return;

  let index = 0;

  function step() {
    if (slides.length < 2) return track.getBoundingClientRect().width;
    // distance from one slide's left edge to the next (slide width + gap)
    return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
  }

  function update() {
    index = Math.max(0, Math.min(index, slides.length - 1));
    track.style.transform = `translateX(${-index * step()}px)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { index -= 1; update(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { index += 1; update(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { index = i; update(); }));

  let resizeRaf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(update);
  });

  update();
}

/* ------------------------------------------------------------
   Member Spotlight — YouTube facade
   A card with data-yt-id="VIDEOID" shows the YouTube thumbnail and
   loads the real embed on click. Cards with an empty id stay as
   placeholders (no embed) until an id is supplied.
   ------------------------------------------------------------ */
function initYouTubeFacade(link) {
  const id = (link.getAttribute('data-yt-id') || '').trim();
  if (!id) return;

  const thumb = link.querySelector('.spotlight-thumb');
  if (thumb) {
    thumb.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    thumb.classList.remove('is-missing');
  }

  link.addEventListener('click', (e) => {
    e.preventDefault();
    const iframe = document.createElement('iframe');
    iframe.className = 'spotlight-iframe';
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    iframe.title = link.getAttribute('aria-label') || 'Member Spotlight video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.setAttribute('tabindex', '-1');
    link.replaceWith(iframe);
    // keep keyboard users oriented: move focus into the embed
    iframe.focus();
  });
}

/* ------------------------------------------------------------
   Committee carousel — center-emphasis (active slide centered,
   neighbours peek and scale down). Also drives the solo variant.
   ------------------------------------------------------------ */
function initCommitteeCarousel(root) {
  const viewport = root.querySelector('.committee-viewport');
  const track = root.querySelector('.committee-track');
  const real = Array.from(root.querySelectorAll('.committee-slide'));
  const prevBtn = root.querySelector('[data-cc-prev]');
  const nextBtn = root.querySelector('[data-cc-next]');
  const dots = Array.from(root.querySelectorAll('[data-cc-dot]'));
  if (!viewport || !track || real.length === 0) return;

  const n = real.length;

  // Clone last->front and first->end so a neighbour always peeks on both sides.
  if (n > 1) {
    const headClone = real[n - 1].cloneNode(true);
    const tailClone = real[0].cloneNode(true);
    [headClone, tailClone].forEach(c => { c.classList.remove('is-active'); c.setAttribute('data-clone', ''); });
    track.insertBefore(headClone, real[0]);
    track.appendChild(tailClone);
  }

  const all = Array.from(track.children);
  let pos = n > 1 ? 1 : 0;   // display position (real slide k lives at k+1)
  let active = 0;            // real index

  function place(animate) {
    track.style.transition = animate ? '' : 'none';
    const el = all[pos];
    const tx = viewport.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
    track.style.transform = `translateX(${tx}px)`;
    all.forEach(s => s.classList.remove('is-active'));
    el.classList.add('is-active');
    dots.forEach((d, k) => d.classList.toggle('is-active', k === active));
    if (!animate) { void track.offsetWidth; track.style.transition = ''; }
  }

  function go(dir) { pos += dir; active = (active + dir + n) % n; place(true); }

  track.addEventListener('transitionend', (e) => {
    if (e.target !== track || n <= 1) return;
    if (pos === 0) { pos = n; place(false); }
    else if (pos === n + 1) { pos = 1; place(false); }
  });

  if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(1));
  dots.forEach((dot, k) => dot.addEventListener('click', () => { pos = k + 1; active = k; place(true); }));

  let raf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => place(false));
  });

  place(false);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  document.querySelectorAll('.spotlight-video[data-yt-id]').forEach(initYouTubeFacade);
  document.querySelectorAll('[data-committee-carousel]').forEach(initCommitteeCarousel);
});
