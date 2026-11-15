/* ============================================================
   Даша — interactions
   ============================================================ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pl = (n, [one, few, many]) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
};

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

/* ---------- cat markup ---------- */
let catUid = 0;
function makeCat() {
  const u = ++catUid;
  return `<svg class="cat" viewBox="-56 0 720 870" aria-hidden="true">
  <defs>
    <radialGradient id="cb${u}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e0202f" stop-opacity=".64"/>
      <stop offset="100%" stop-color="#e0202f" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="eyeClip${u}">
      <ellipse cx="224.5" cy="284.5" rx="30.5" ry="24"/>
      <ellipse cx="378.5" cy="284.0" rx="33" ry="25"/>
    </clipPath>
  </defs>
  <ellipse cx="304" cy="844" rx="224" ry="28" fill="#000" opacity=".64"/>
  <g class="cat-head">
    <image href="media/img/cat-sit.webp?v=3" x="0" y="0" width="608" height="870"/>
    <g class="cat-eyes-open" clip-path="url(#eyeClip${u})">
      <g class="cat-pupils">
        <image href="media/img/cat-sit-irises.webp?v=3" x="172" y="242" width="264" height="86"/>
      </g>
      <ellipse cx="235.3" cy="267.4" rx="6.2" ry="4.8" transform="rotate(-18 235.3 267.4)" fill="#fff" opacity=".95"/>
      <ellipse cx="383.6" cy="267.7" rx="5.8" ry="4.8" transform="rotate(-18 383.6 267.7)" fill="#fff" opacity=".95"/>
    </g>
    <image class="cat-blink-layer" href="media/img/cat-sit-happy.webp?v=3" x="0" y="0" width="608" height="870"/>
    <image class="cat-eyes-happy" href="media/img/cat-sit-happy.webp?v=3" x="0" y="0" width="608" height="870"/>
    <ellipse class="cat-blush" cx="176" cy="332" rx="40" ry="24" fill="url(#cb${u})"/>
    <ellipse class="cat-blush" cx="428" cy="332" rx="40" ry="24" fill="url(#cb${u})"/>
  </g>
</svg>`;
}

function makeWalker() {
  return `<span class="w-stage" aria-hidden="true"><img class="w-strip" src="media/img/cat-walk-sprite.webp?v=4" alt="" decoding="async"></span>`;
}

$$('[data-cat]').forEach(el => el.innerHTML = makeCat());
$$('[data-walker]').forEach(el => el.innerHTML = makeWalker());

/* ---------- torn paper ---------- */
function tear(el) {
  const paper = document.createElement('i');
  paper.className = 'paper';
  el.prepend(paper);
  const n = 28, pts = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(2)}% ${(rnd(0, 7)).toFixed(1)}px`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(2)}% calc(100% - ${(rnd(0, 7)).toFixed(1)}px)`);
  const cp = `polygon(${pts.join(',')})`;
  paper.style.clipPath = cp;
  paper.style.webkitClipPath = cp;
  const cv = el.querySelector('canvas');
  if (cv) { cv.style.clipPath = cp; cv.style.webkitClipPath = cp; }
}
$$('.torn').forEach(tear);

/* ---------- FX ---------- */
const fxLayer = $('#fx');
const HEART = '<svg viewBox="0 0 32 29"><path d="M16 28.5S0 18.6 0 8.6C0 3.8 3.8 0 8.5 0c3 0 5.7 1.6 7.5 4 1.8-2.4 4.5-4 7.5-4C28.2 0 32 3.8 32 8.6c0 10-16 19.9-16 19.9z"/></svg>';
const PAW = '<svg viewBox="0 0 32 32"><ellipse cx="16" cy="21.5" rx="8" ry="7"/><ellipse cx="6.3" cy="12.5" rx="3.2" ry="4"/><ellipse cx="12.4" cy="6.6" rx="3.2" ry="4.2"/><ellipse cx="19.6" cy="6.6" rx="3.2" ry="4.2"/><ellipse cx="25.7" cy="12.5" rx="3.2" ry="4"/></svg>';

function particle(x, y, o) {
  const el = document.createElement('div');
  el.className = 'fx';
  el.innerHTML = o.html;
  const s = o.size;
  el.style.cssText = `width:${s}px;height:${s}px;color:${o.color || '#e0202f'};left:${x - s / 2}px;top:${y - s / 2}px;font-size:${s}px;text-align:center`;
  fxLayer.appendChild(el);
  const a = el.animate([
    { transform: `translate(0,0) scale(${o.from ?? .3}) rotate(0deg)`, opacity: 1 },
    { transform: `translate(${o.dx * .7}px,${o.dy * .7}px) scale(1) rotate(${o.rot * .7}deg)`, opacity: 1, offset: .6 },
    { transform: `translate(${o.dx}px,${o.dy}px) scale(.8) rotate(${o.rot}deg)`, opacity: 0 }
  ], { duration: o.dur, delay: o.delay || 0, easing: o.ease || 'cubic-bezier(.15,.7,.3,1)', fill: 'both' });
  a.onfinish = () => el.remove();
}
function burst(x, y, n = 8, spread = 90) {
  if (reduce) n = Math.min(n, 4);
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, d = spread * rnd(.4, 1.2), paw = Math.random() < .22;
    particle(x, y, {
      html: paw ? PAW : HEART,
      size: paw ? rnd(13, 22) : rnd(12, 28),
      color: paw ? '#f1e8e3' : (Math.random() < .55 ? '#e0202f' : '#9e0b19'),
      dx: Math.cos(ang) * d, dy: Math.sin(ang) * d - 30, rot: rnd(-70, 70), dur: rnd(800, 1400)
    });
  }
}
function rain(n = 36) {
  if (reduce) n = 8;
  const items = ['❤️', '🖤', '🐈‍⬛', '🐾', '🌹', '🐱', '❤️', '🖤'];
  for (let i = 0; i < n; i++) {
    particle(rnd(0, innerWidth), -40, {
      html: items[Math.floor(Math.random() * items.length)], size: rnd(22, 42), from: 1,
      dx: rnd(-60, 60), dy: innerHeight + 100, rot: rnd(-300, 300), dur: rnd(2400, 4200), delay: i * 70,
      ease: 'cubic-bezier(.4,.1,.6,1)'
    });
  }
}

/* ---------- lightweight petals ---------- */
(function petals() {
  if (reduce) return;
  const c = $('#petals'), ctx = c.getContext('2d');
  let W, H, raf = 0, last = 0;
  const cols = ['#9e0b19', '#c1121f', '#e0202f', '#6d0711'];
  function size() {
    W = innerWidth; H = innerHeight;
    c.width = W; c.height = H;
  }
  size(); addEventListener('resize', size);
  const spawn = init => ({
    x: rnd(0, W), y: init ? rnd(0, H) : -20, s: rnd(5, 11), vy: rnd(.6, 1.7), vx: rnd(-.35, .35),
    a: rnd(0, 6.28), va: rnd(-.04, .04), sw: rnd(0, 6.28), col: cols[Math.floor(Math.random() * 4)], o: rnd(.25, .6)
  });
  const P = Array.from({ length: W < 600 ? 12 : 18 }, () => spawn(true));
  function draw(now) {
    raf = requestAnimationFrame(draw);
    if (now - last < 28) return;
    last = now;
    ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      p.sw += .035; p.x += p.vx + Math.sin(p.sw) * .75; p.y += p.vy; p.a += p.va;
      if (p.y > H + 20) Object.assign(p, spawn(false));
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.globalAlpha = p.o; ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * .8, -p.s * .6, p.s * .7, p.s * .6, 0, p.s);
      ctx.bezierCurveTo(-p.s * .7, p.s * .6, -p.s * .8, -p.s * .6, 0, -p.s);
      ctx.fill(); ctx.restore();
    }
  }
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(draw);
  });
  raf = requestAnimationFrame(draw);
})();

/* ============================================================
   PLAYER
   ============================================================ */
const TRACKS = [
  { src: 'media/music/1-cvety.mp3',         title: 'цветы',                   artist: 'тёмный принц' },
  { src: 'media/music/2-face-24-7.mp4',     title: '24 на 7',                 artist: 'FACE' },
  { src: 'media/music/3-unplugged-2.mp3',   title: 'Unplugged 2: Love Kills', artist: 'PHARAOH feat. White Punk' },
  { src: 'media/music/4-gde-by-ya-ni-byl.mp3', title: 'Где Бы Я Ни Был',      artist: 'Bushido Zho' },
  { src: 'media/music/4-baby.mp4',          title: 'Baby',                    artist: 'FACE' },
  { src: 'media/music/5-odnim-celym.mp3',   title: 'Одним Целым',             artist: 'PHARAOH' },
  { src: 'media/music/6-more.mp3',          title: 'Море',                    artist: 'MAYOT' },
  { src: 'media/music/7-na-lune.mp3',       title: 'На Луне',                 artist: 'PHARAOH' },
  { src: 'media/music/8-serdce-vremya.mp3', title: 'Сердце & Время',          artist: 'OG Buda' },
];
const audio = $('#audio'), player = $('#player'), plList = $('#plList');
let cur = 0;

/* ---------- smooth volume crossfade ---------- */
const fadeRaf = new WeakMap();
const canFade = (() => {
  try {
    const prev = audio.volume;
    audio.volume = 0.5;
    const ok = Math.abs(audio.volume - 0.5) < 0.05;
    audio.volume = prev;
    return ok;
  } catch (e) { return false; }
})();
function cancelFade(el) {
  const id = fadeRaf.get(el);
  if (id) { cancelAnimationFrame(id); fadeRaf.delete(el); }
}
function fadeVol(el, to, dur = 560, done) {
  cancelFade(el);
  if (!canFade || dur <= 0) {
    try { el.volume = to; } catch (e) {}
    if (done) done();
    return;
  }
  const from = clamp(el.volume, 0, 1);
  if (Math.abs(from - to) < 0.01) { el.volume = to; if (done) done(); return; }
  const t0 = performance.now();
  function tick(now) {
    const k = clamp((now - t0) / dur, 0, 1);
    const v = to > from
      ? from + (to - from) * Math.sin(k * Math.PI * 0.5)
      : to + (from - to) * Math.cos(k * Math.PI * 0.5);
    el.volume = clamp(v, 0, 1);
    if (k < 1) fadeRaf.set(el, requestAnimationFrame(tick));
    else { fadeRaf.delete(el); if (done) done(); }
  }
  fadeRaf.set(el, requestAnimationFrame(tick));
}

function renderList() {
  plList.innerHTML = `<div class="pl-list-head">наши треки <span>по кругу ↻</span></div>` + TRACKS.map((t, i) =>
    `<button data-i="${i}" class="${i === cur ? 'cur' : ''}"><span class="n">${i + 1}</span><span><b></b><small></small></span></button>`).join('');
  $$('button', plList).forEach((b, i) => { b.querySelector('b').textContent = TRACKS[i].title; b.querySelector('small').textContent = TRACKS[i].artist; });
}
function setMeta(t) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: t.artist, album: 'для Даши 🖤',
      artwork: [{ src: 'media/img/cover.jpg', sizes: '960x1280', type: 'image/jpeg' }]
    });
  } catch (e) {}
}
function loadTrack(i, autoplay) {
  cur = (i + TRACKS.length) % TRACKS.length;
  const t = TRACKS[cur];
  audio.src = t.src;
  $('#plTitle').textContent = t.title;
  $('#plArtist').textContent = t.artist;
  $('#plBar').style.transform = 'scaleX(0)';
  renderList(); setMeta(t);
  if (autoplay) {
    cancelFade(audio); audio.volume = soundVideo ? 0 : 1;
    audio.play().catch(() => player.classList.add('need-tap'));
  }
}
loadTrack(0, false);

audio.addEventListener('ended', () => loadTrack(cur + 1, true));   // loop through the playlist forever
function uiPlaying() {
  player.classList.add('playing'); player.classList.remove('need-tap');
  $('#playIcon').setAttribute('href', '#i-pause');
  fadingOutAudio = false;
  fadeVol(audio, 1, 520);
  if (soundVideo) { resumeMusic = false; setSound(soundVideo, false, false); }
}
audio.addEventListener('play', () => { if (opened && !audio.muted) uiPlaying(); });
audio.addEventListener('pause', () => {
  player.classList.remove('playing');
  $('#playIcon').setAttribute('href', '#i-play');
});
audio.addEventListener('timeupdate', () => {
  if (audio.duration) $('#plBar').style.transform = `scaleX(${audio.currentTime / audio.duration})`;
});
$('#playBtn').addEventListener('click', () => {
  if (audio.paused) { resumeMusic = false; audio.volume = soundVideo ? 0 : 1; audio.play().catch(() => {}); }
  else { cancelFade(audio); fadingOutAudio = false; audio.pause(); audio.volume = 1; }
});
$('#nextBtn').addEventListener('click', () => loadTrack(cur + 1, true));
$('#prevBtn').addEventListener('click', () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    if (soundVideo) audio.volume = 0;
    audio.play().catch(() => {});
  } else loadTrack(cur - 1, true);
});
$('#discBtn').addEventListener('click', () => player.classList.toggle('list-open'));
$('#plBarWrap').addEventListener('click', e => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * audio.duration;
});
plList.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  loadTrack(+b.dataset.i, true); player.classList.remove('list-open');
});
document.addEventListener('pointerdown', e => { if (!player.contains(e.target)) player.classList.remove('list-open'); });
if ('mediaSession' in navigator) {
  try {
    navigator.mediaSession.setActionHandler('nexttrack', () => loadTrack(cur + 1, true));
    navigator.mediaSession.setActionHandler('previoustrack', () => loadTrack(cur - 1, true));
    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  } catch (e) {}
}

/* ============================================================
   GATE
   ============================================================ */
let opened = false, unlocked = false;
const gate = $('#gate'), gateHeart = $('#gateHeart'), wave = $('#ghWave'), gateHint = $('#gateHint');
let gp = 0, holding = false, lastT = 0, rafG = 0, phase = 0, buzz = 0;

function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  audio.muted = true;
  const pr = audio.play();
  if (pr && pr.then) pr.then(() => {
    if (!opened) { audio.pause(); audio.currentTime = 0; }
    audio.muted = false;
  }).catch(() => { unlocked = false; audio.muted = false; });
}
function drawWave() {
  const y = -1 + 31 * (1 - gp), amp = gp > 0 && gp < 1 ? 1.1 : 0;
  let d = `M -2 ${y.toFixed(2)}`;
  for (let x = -2; x <= 34; x += 2) d += ` L ${x} ${(y + Math.sin(x * .45 + phase) * amp).toFixed(2)}`;
  wave.setAttribute('d', d + ' L 34 32 L -2 32 Z');
}
drawWave();
function gateLoop(t) {
  const dt = Math.min(50, t - (lastT || t)); lastT = t;
  gp = clamp(gp + (holding ? dt / 1500 : -dt / 800), 0, 1);
  phase += dt * .009;
  gateHeart.style.setProperty('--p', gp.toFixed(3));
  drawWave();
  const step = Math.floor(gp * 6);
  if (holding && step > buzz) { buzz = step; vibrate(10); }
  if (!holding) buzz = step;
  if (gp >= 1) { openSite(); return; }
  if (holding || gp > 0) rafG = requestAnimationFrame(gateLoop); else { rafG = 0; lastT = 0; }
}
function startHold(e) {
  if (opened || holding) return;
  if (e && e.cancelable) e.preventDefault();
  holding = true;
  gateHeart.classList.add('holding');
  unlockAudio();
  gateHint.textContent = 'держи-держи…';
  if (!rafG) { lastT = 0; rafG = requestAnimationFrame(gateLoop); }
}
function endHold() {
  if (!holding) return;
  holding = false;
  gateHeart.classList.remove('holding');
  if (!opened) gateHint.textContent = gp > .05 ? 'ещё чуть-чуть, не отпускай' : 'зажми сердечко и не отпускай';
}
gateHeart.addEventListener('pointerdown', startHold);
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => gateHeart.addEventListener(ev, endHold));
gateHeart.addEventListener('contextmenu', e => e.preventDefault());
gateHeart.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); startHold(); } });
gateHeart.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') endHold(); });

function fitHeroName() {
  const svg = $('#heroName'), svgFill = $('#heroNameFill'), t = svg && svg.querySelector('.hn-stroke');
  if (!svg || !t || !t.getBBox) return;
  try {
    const bb = t.getBBox();
    if (!bb.width) return;
    const vw = Math.max(440, bb.width + 26), cx = bb.x + bb.width / 2;
    const vb = `${(cx - vw / 2).toFixed(1)} 0 ${vw.toFixed(1)} 220`;
    svg.setAttribute('viewBox', vb);
    if (svgFill) svgFill.setAttribute('viewBox', vb);
    const grad = $('#heroRuby');
    if (grad) {
      grad.setAttribute('x1', bb.x.toFixed(1));
      grad.setAttribute('y1', Math.max(0, bb.y).toFixed(1));
      grad.setAttribute('x2', (bb.x + bb.width).toFixed(1));
      grad.setAttribute('y2', (bb.y + bb.height).toFixed(1));
    }
  } catch (e) {}
}
fitHeroName();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroName);

function openSite() {
  if (opened) return;
  fitHeroName();
  opened = true; holding = false;
  vibrate([30, 40, 70]);
  const r = gateHeart.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 28, 170);
  audio.muted = false;
  try { audio.currentTime = 0; } catch (e) {}
  audio.play().then(() => { if (!audio.paused) uiPlaying(); }).catch(() => player.classList.add('need-tap'));
  gate.classList.add('open');
  document.body.classList.remove('locked');
  setTimeout(() => document.body.classList.add('go'), 80);
  setTimeout(() => gate.remove(), 1300);
  setTimeout(walk, 9000);
  requestAnimationFrame(() => { buildThread(); revealCheck(); });
}

/* tap anywhere = little hearts (+ retry blocked autoplay on first tap if needed) */
document.addEventListener('pointerdown', e => {
  if (!opened) return;
  if (player.classList.contains('need-tap') && !e.target.closest('.player')) {
    audio.play().then(() => uiPlaying()).catch(() => {});
  }
  if (e.target.closest('button,a,.stack,.compare,#scratch,.pet-cat,.reels,.screen-frame,.lb,.player,.polaroid,.phone-body,.peek,.sleepy')) return;
  burst(e.clientX, e.clientY, 6, 60);
});

/* ============================================================
   COUNTER
   ============================================================ */
const START = new Date(2026, 9, 26, 0, 0, 0);   // 26.10.2026
const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
const pad = n => String(n).padStart(2, '0');
let countedUp = false, countingUp = false;

function setTick(sel, val) {
  const el = $(sel);
  if (el.textContent !== val) {
    el.textContent = val;
    el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
  }
}
function tickCounter() {
  const now = new Date();
  const diff = Math.max(0, now - START);
  const days = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  if (!countingUp || countedUp) $('#cDays').textContent = days;
  $('#cDaysW').textContent = pl(days, ['день', 'дня', 'дней']);
  setTick('#cH', pad(h)); setTick('#cM', pad(m)); setTick('#cS', pad(s));
  $('#cHW').textContent = pl(h, ['час', 'часа', 'часов']);
  $('#cMW').textContent = pl(m, ['минута', 'минуты', 'минут']);
  $('#cSW').textContent = pl(s, ['секунда', 'секунды', 'секунд']);

  let k = 1; while (addMonths(START, k) <= now) k++;
  const left = addMonths(START, k) - now;
  const ld = Math.floor(left / 864e5), lh = Math.floor(left / 36e5) % 24, lm = Math.floor(left / 6e4) % 60;
  let label;
  if (k === 1) label = 'до нашего первого месяца';
  else if (k % 12 === 0) label = k === 12 ? 'до нашего первого годика' : `до ${k / 12} ${pl(k / 12, ['года', 'лет', 'лет'])} вместе`;
  else label = `до ${k} ${pl(k, ['месяца', 'месяцев', 'месяцев'])} вместе`;
  $('#nextLabel').textContent = label;
  $('#nextLeft').textContent = ld > 0
    ? `${ld} ${pl(ld, ['день', 'дня', 'дней'])} ${lh} ${pl(lh, ['час', 'часа', 'часов'])}`
    : `${lh} ${pl(lh, ['час', 'часа', 'часов'])} ${lm} ${pl(lm, ['минута', 'минуты', 'минут'])}`;
  $('#beats').textContent = Math.floor(diff / 6e4 * 75).toLocaleString('ru-RU');
  return days;
}
tickCounter();
setInterval(tickCounter, 1000);

function countUp() {
  if (countingUp || countedUp) return;
  countingUp = true;
  const target = Math.floor(Math.max(0, new Date() - START) / 864e5);
  const from = Math.max(0, target - 9);
  const t0 = performance.now(), dur = reduce ? 10 : 750;
  (function f(t) {
    const k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
    $('#cDays').textContent = Math.round(from + (target - from) * e);
    if (k < 1) requestAnimationFrame(f); else { countedUp = true; tickCounter(); }
  })(t0);
}

/* ============================================================
   REVEALS
   ============================================================ */
const revealEls = $$('.reveal,.h,.peek,#counter');
function showReveal(el) {
  if (el.classList.contains('in')) return;
  el.classList.add('in');
  rio.unobserve(el);
  if (el.id === 'counter') countUp();
  if (el.id === 'compare') nudgeCompare();
}
function revealCheck() {
  if (!opened) return;
  const lim = innerHeight * 0.96;
  revealEls.forEach(el => {
    if (!el.classList.contains('in') && el.getBoundingClientRect().top < lim) showReveal(el);
  });
}
const rio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) showReveal(e.target);
}), { threshold: .01, rootMargin: '90px 0px 90px 0px' });
revealEls.forEach(el => rio.observe(el));

/* helper: pick next phrase without immediate repeats */
function makeDeck(items) {
  let bag = [], last = '';
  return () => {
    if (!bag.length) {
      bag = [...items];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    last = bag.pop();
    return last;
  };
}

/* peeking & sleeping cat interactions */
const nextPeekLine = makeDeck([
  'мяу? кто тут такая красивая 🖤',
  'привет, Дашуль 🐾',
  'подглядываю за самой милой девочкой 👀',
  'ку-ку, красотка 🖤',
  'цём тебя в щёчку 🖤',
  'я тут караулю твою улыбку ✨',
  'тап-тап лапкой по твоему сердечку 🐾',
  'самая любимая девочка тут!',
  'мяу, ты сегодня просто шикарна 🖤',
  'листай дальше, там столько нежности!',
  'хочу к Даше на ручки 🐾'
]);
const peekCat = $('#peekCat');
if (peekCat) {
  let peekT = 0;
  const pokePeek = e => {
    e.stopPropagation();
    $('.peek-bubble', peekCat).textContent = nextPeekLine();
    peekCat.classList.add('poked');
    const c = $('.cat', peekCat); c.classList.add('happy');
    const r = peekCat.getBoundingClientRect();
    burst(r.left + r.width * .5, r.top + 20, 8, 60); vibrate(12);
    clearTimeout(peekT);
    peekT = setTimeout(() => { peekCat.classList.remove('poked'); c.classList.remove('happy'); }, 2100);
  };
  peekCat.addEventListener('click', pokePeek);
}
const nextSleepyLine = makeDeck([
  'мрр… мне снится Даша 💤',
  'ещё пять минуточек на ручках…',
  'сквозь сон мурчу для тебя 🖤',
  'обними меня и спим дальше 🐾',
  'мрр… самая сладкая девочка разбудила',
  'сонный цём для Дашеньки 💤',
  'укрой меня своей любовью… мрр 🖤',
  'даже во сне тебя обожаю 🐾',
  'мрр… под твой голосок так сладко спится',
  'сейчас проснусь и зацелую тебя 🖤'
]);
const sleepyCat = $('#sleepyCat');
if (sleepyCat) {
  let sleepT = 0;
  sleepyCat.addEventListener('click', () => {
    $('#sleepyBubble').textContent = nextSleepyLine();
    sleepyCat.classList.add('woke');
    const r = sleepyCat.getBoundingClientRect();
    burst(r.left + r.width * .3, r.top + 24, 6, 55); vibrate(10);
    clearTimeout(sleepT);
    sleepT = setTimeout(() => sleepyCat.classList.remove('woke'), 2200);
  });
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
const lbAll = $$('[data-lb]');
const lb = $('#lb'), lbImg = $('#lbImg');
let lbGroup = lbAll, lbI = 0, lbOpen = false;
lbAll.forEach(img => {
  const t = img.closest('.polaroid, .phone-body');
  if (t) t.addEventListener('click', () => openLB(img));
});
function applyLB() {
  const it = lbGroup[lbI];
  lbImg.src = it.currentSrc || it.src;
  $('#lbCap').textContent = it.dataset.cap;
  $('#lbNum').textContent = `${lbI + 1} из ${lbGroup.length}`;
}
function openLB(target) {
  const img = typeof target === 'number' ? lbAll[target] : target;
  if (!img) return;
  const gName = img.dataset.lbGroup;
  lbGroup = gName ? lbAll.filter(x => x.dataset.lbGroup === gName) : lbAll;
  lbI = Math.max(0, lbGroup.indexOf(img));
  lb.classList.toggle('single', lbGroup.length <= 1);
  applyLB();
  lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); lbOpen = true;
  document.body.style.overflow = 'hidden';
  lbImg.style.transform = '';
  lbImg.animate([{ transform: 'scale(.8) rotate(-4deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
}
function closeLB() {
  lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbOpen = false;
  document.body.style.overflow = '';
}
let lbStepping = false;
function stepLB(dir) {
  if (lbStepping || lbGroup.length <= 1) return;
  lbStepping = true;
  const from = lbImg.style.transform || 'none';
  lbImg.animate([{ transform: from, opacity: 1 }, { transform: `translateX(${-dir * 70}%) rotate(${-dir * 10}deg)`, opacity: 0 }], { duration: 190, easing: 'ease-in', fill: 'forwards' })
    .onfinish = () => {
      lbI = (lbI + dir + lbGroup.length) % lbGroup.length; applyLB();
      lbImg.style.transform = '';
      lbImg.getAnimations().forEach(x => x.cancel());
      lbImg.animate([{ transform: `translateX(${dir * 70}%) rotate(${dir * 10}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.2,.9,.3,1)' })
        .onfinish = () => { lbStepping = false; };
    };
  vibrate(6);
}
$('#lbClose').addEventListener('click', closeLB);
$('#lbPrev').addEventListener('click', e => { e.stopPropagation(); stepLB(-1); });
$('#lbNext').addEventListener('click', e => { e.stopPropagation(); stepLB(1); });
(function lbSwipe() {
  let sx = 0, sy = 0, dx = 0, dy = 0, down = false;
  lb.addEventListener('pointerdown', e => {
    if (e.target.closest('.lb-close,.lb-nav')) return;
    down = true; sx = e.clientX; sy = e.clientY; dx = dy = 0;
  });
  lb.addEventListener('pointermove', e => {
    if (!down) return;
    dx = e.clientX - sx; dy = e.clientY - sy;
    const xMove = lbGroup.length > 1 ? dx : dx * .25;
    lbImg.style.transform = `translate(${xMove}px, ${Math.max(0, dy)}px) rotate(${xMove / 22}deg) scale(${1 - Math.max(0, dy) / 1500})`;
  });
  const up = e => {
    if (!down) return; down = false;
    if (dy > 110 && Math.abs(dy) > Math.abs(dx)) { closeLB(); return; }
    if (lbGroup.length > 1 && dx < -60) return stepLB(1);
    if (lbGroup.length > 1 && dx > 60) return stepLB(-1);
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && e && e.target !== lbImg) { closeLB(); return; }
    lbImg.animate([{ transform: lbImg.style.transform || 'none' }, { transform: 'none' }], { duration: 250, easing: 'ease-out' });
    lbImg.style.transform = '';
  };
  lb.addEventListener('pointerup', up);
  lb.addEventListener('pointercancel', up);
})();
addEventListener('keydown', e => {
  if (!lbOpen) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowRight') stepLB(1);
  if (e.key === 'ArrowLeft') stepLB(-1);
});

/* ============================================================
   COMPARE (рядом с нашим пляжиком)
   ============================================================ */
const cmp = $('#compare');
const capL = $('.cmp-cap.left', cmp), capR = $('.cmp-cap.right', cmp);
function setPos(p) {
  p = clamp(p, 0, 100);
  cmp.style.setProperty('--pos', p + '%');
  capL.style.opacity = p < 30 ? 0 : 1;
  capR.style.opacity = p > 70 ? 0 : 1;
}
let cmpDown = false, cmpDrag = false, cmpTouched = false, cmpSx = 0, cmpSy = 0;
const posFromX = x => { const r = cmp.getBoundingClientRect(); return (x - r.left) / r.width * 100; };
cmp.addEventListener('pointerdown', e => {
  cmpDown = true; cmpSx = e.clientX; cmpSy = e.clientY;
  cmpDrag = !!e.target.closest('.cmp-handle');
  if (cmpDrag) {
    cmpTouched = true;
    try { cmp.setPointerCapture(e.pointerId); } catch (_) {}
    setPos(posFromX(e.clientX));
  }
});
cmp.addEventListener('pointermove', e => {
  if (!cmpDown) return;
  const dx = e.clientX - cmpSx, dy = e.clientY - cmpSy;
  if (!cmpDrag) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { cmpDown = false; return; }
    if (Math.abs(dx) > 6) {
      cmpDrag = true; cmpTouched = true;
      try { cmp.setPointerCapture(e.pointerId); } catch (_) {}
    } else return;
  }
  setPos(posFromX(e.clientX));
});
const cmpUp = e => {
  if (!cmpDown) return;
  if (!cmpDrag && Math.hypot(e.clientX - cmpSx, e.clientY - cmpSy) < 8) {
    cmpTouched = true; setPos(posFromX(e.clientX));
  }
  cmpDown = false; cmpDrag = false;
};
cmp.addEventListener('pointerup', cmpUp);
cmp.addEventListener('pointercancel', () => { cmpDown = false; cmpDrag = false; });
function nudgeCompare() {
  if (reduce) return;
  const keys = [50, 78, 24, 50], t0 = performance.now(), dur = 2200;
  setTimeout(() => (function f(t) {
    if (cmpTouched) return;
    const k = clamp((t - t0 - 500) / dur, 0, 1), seg = Math.min(2, Math.floor(k * 3)), lk = k * 3 - seg;
    const e = lk < .5 ? 2 * lk * lk : 1 - Math.pow(-2 * lk + 2, 2) / 2;
    setPos(keys[seg] + (keys[seg + 1] - keys[seg]) * e);
    if (k < 1) requestAnimationFrame(f);
  })(performance.now()), 500);
}

/* ============================================================
   VIDEOS
   ============================================================ */
let soundVideo = null, resumeMusic = false, fadingOutAudio = false;
const vids = $$('video.vid');
function setSound(v, on, resume = true) {
  const box = v.parentElement, btn = $('.snd', box);
  if (on) {
    if (soundVideo && soundVideo !== v) setSound(soundVideo, false, false);
    soundVideo = v;
    if (!audio.paused && !fadingOutAudio) {
      resumeMusic = true;
      fadingOutAudio = true;
      fadeVol(audio, 0, 580, () => {
        fadingOutAudio = false;
        if (soundVideo) { audio.pause(); audio.volume = 1; }
      });
    } else if (fadingOutAudio) {
      resumeMusic = true;
    }
    cancelFade(v);
    v.volume = canFade ? 0 : 1;
    v.muted = false;
    if (v.paused) v.play().catch(() => {});
    fadeVol(v, 1, 580);
  } else {
    if (soundVideo === v) {
      soundVideo = null;
      if (resume && resumeMusic) {
        resumeMusic = false;
        cancelFade(audio);
        fadingOutAudio = false;
        if (audio.paused) {
          audio.volume = canFade ? 0 : 1;
          audio.play().catch(() => {});
        }
        fadeVol(audio, 1, 600);
      }
    }
    if (!v.muted) {
      fadeVol(v, 0, 480, () => {
        if (soundVideo !== v) { v.muted = true; v.volume = 1; }
      });
    } else {
      cancelFade(v);
      v.muted = true; v.volume = 1;
    }
  }
  const active = on;
  $('use', btn).setAttribute('href', active ? '#i-sound-on' : '#i-sound-off');
  btn.classList.toggle('on', active);
}
const vio = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting && e.intersectionRatio >= .6) v.play().catch(() => {});
  else { if (soundVideo === v) setSound(v, false, true); v.pause(); }
}), { threshold: [0, .6] });
vids.forEach(v => {
  vio.observe(v);
  const box = v.parentElement, bar = $('.vbar', box);
  v.addEventListener('timeupdate', () => { if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + '%'; });
  let lastTap = 0, timer = 0;
  box.addEventListener('click', e => {
    if (e.target.closest('.snd')) { clearTimeout(timer); lastTap = 0; setSound(v, soundVideo !== v); return; }
    const now = Date.now();
    if (now - lastTap < 300) {
      clearTimeout(timer); lastTap = 0;
      const r = box.getBoundingClientRect();
      const h = document.createElement('div');
      h.className = 'pop-heart'; h.innerHTML = HEART;
      h.style.left = (e.clientX - r.left) + 'px'; h.style.top = (e.clientY - r.top) + 'px';
      box.appendChild(h); setTimeout(() => h.remove(), 950);
      burst(e.clientX, e.clientY, 10, 90); vibrate(15);
      return;
    }
    lastTap = now;
    timer = setTimeout(() => setSound(v, soundVideo !== v), 260);
  });
});
/* reel dots + active reel sync */
const reels = $('#reels'), dots = $$('#reelDots i');
let reelIdx = 0;
reels.addEventListener('scroll', () => {
  const first = reels.children[0];
  const step = first.offsetWidth + 14;
  const i = clamp(Math.round(reels.scrollLeft / step), 0, dots.length - 1);
  if (i !== reelIdx) {
    reelIdx = i;
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    $$('.reel video', reels).forEach((rv, k) => {
      if (k === i) rv.play().catch(() => {});
      else { rv.pause(); if (soundVideo === rv) setSound(rv, false, true); }
    });
  }
}, { passive: true });

/* ============================================================
   FOOD STACK
   ============================================================ */
const stack = $('#stack');
let cards = $$('.card', stack);
const total = cards.length;
const ROT = [0, -4, 3.5, -2.5, 2, -1.5, 1];
cards.forEach((c, i) => {
  c.dataset.i = i;
  c.insertAdjacentHTML('beforeend', '<span class="stamp yum">ням</span><span class="stamp love">обожаю</span>');
});
function layoutStack() {
  cards.forEach((c, i) => {
    if (c.classList.contains('flying')) return;
    c.style.zIndex = String(total - i);
    const k = Math.min(i, 3);
    c.style.transform = i === 0 ? 'rotate(0deg)' : `translateY(${k * 12}px) scale(${1 - k * .045}) rotate(${ROT[i]}deg)`;
    c.style.opacity = i < 4 ? '1' : '0';
    $$('.stamp', c).forEach(s => s.style.opacity = 0);
  });
  $('#stackNum').textContent = +cards[0].dataset.i + 1;
}
layoutStack();
function stackFly(sign, dy = 0) {
  const c = cards[0];
  c.classList.add('flying');
  cards.push(cards.shift());
  c.style.pointerEvents = 'none';
  c.style.zIndex = String(total + 5);
  c.style.transform = `translate(${sign * innerWidth * 1.15}px, ${dy * .35 + 40}px) rotate(${sign * 30}deg)`;
  c.style.opacity = '0';
  const r = stack.getBoundingClientRect();
  burst(sign > 0 ? r.right - 20 : r.left + 20, r.top + r.height * .4, 9, 70);
  vibrate(12);
  layoutStack();
  setTimeout(() => {
    c.classList.add('drag');
    c.classList.remove('flying');
    c.style.pointerEvents = '';
    layoutStack();
    void c.offsetWidth;
    c.classList.remove('drag');
  }, 380);
}
function stackPrev() {
  const c = cards.pop();
  cards.unshift(c);
  c.classList.add('drag');
  c.style.zIndex = String(total + 5);
  c.style.transform = `translate(${-innerWidth * .9}px, 20px) rotate(-22deg)`;
  c.style.opacity = '0';
  void c.offsetWidth;
  c.classList.remove('drag');
  layoutStack();
  vibrate(8);
}
$$('[data-stack-dir]').forEach(btn => btn.addEventListener('click', () => {
  if (+btn.dataset.stackDir < 0) stackPrev();
  else stackFly(1, 0);
}));
(function stackDrag() {
  let sx = 0, sy = 0, dx = 0, dy = 0, down = false, moved = false, card = null;
  stack.addEventListener('pointerdown', e => {
    card = cards[0];
    if (!card.contains(e.target)) return;
    down = true; moved = false; sx = e.clientX; sy = e.clientY; dx = dy = 0;
  });
  stack.addEventListener('pointermove', e => {
    if (!down) return;
    dx = e.clientX - sx; dy = e.clientY - sy;
    if (!moved) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { down = false; layoutStack(); return; }
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        moved = true; card.classList.add('drag');
        try { card.setPointerCapture(e.pointerId); } catch (_) {}
      } else return;
    }
    card.style.transform = `translate(${dx}px, ${dy * .35}px) rotate(${dx / 14}deg)`;
    $('.stamp.yum', card).style.opacity = clamp(-dx / 110, 0, 1);
    $('.stamp.love', card).style.opacity = clamp(dx / 110, 0, 1);
  });
  function release(cancel) {
    if (!down) return; down = false;
    card.classList.remove('drag');
    if (!cancel && moved && Math.abs(dx) > 75) {
      stackFly(Math.sign(dx), dy);
    } else {
      if (!cancel && !moved) openLB($('img', card));
      layoutStack();
    }
  }
  stack.addEventListener('pointerup', () => release(false));
  stack.addEventListener('pointercancel', () => release(true));
})();

/* ============================================================
   PET THE CAT
   ============================================================ */
const petBox = $('#petCat'), petCat = $('.cat', petBox), bubble = $('#petBubble'), purrBar = $('#purrBar');
let petting = false, petDist = 0, petMoved = 0, lx = 0, ly = 0, purr = 0, bubbleT = 0, lastLook = 0;
let petCount = +(localStorage.getItem('dasha-pets') || 0);
const nextPetStroke = makeDeck([
  'кааак хорошо 🖤',
  'да-да, вот тут за ушком почеши!',
  'у тебя самые тёплые и нежные ручки',
  'мрр-мрр, не останавливайся 🐾',
  'кайфую от твоих ладошек…',
  'ещё-ещё почеши, Дашенька 🖤',
  'мурчу только для тебя, красотка',
  'ой, щекотно усикам! 🐾',
  'так бы вечно у тебя на ручках сидел',
  'ты гладишь лучше всех на свете 🖤',
  'мрр… сейчас растаю от нежности',
  'под шейкой тоже почеши 🐾',
  'люблю когда ты меня гладишь 🖤',
  'самая ласковая девочка в мире ✨',
  'моё маленькое сердечко тает от тебя',
  'мур-мур, какая же ты милая, Дашуль 🖤'
]);
const nextPetTap = makeDeck([
  'мяу, Дашуль 🖤',
  'погладь меня ещё пальчиком 🐾',
  'ты самая милая девочка 🖤',
  'чухать за ушком тут!',
  'мяу-мяу, красавица ✨',
  'обнимашки? 🐾',
  'хочу на ручки к Даше 🖤',
  'цём тебя в носик 🐾',
  'ты так вкусно пахнешь любовью',
  'не уходи, погладь ещё чуть-чуть!',
  'у тебя самые нежные ручки 🖤',
  'я уже соскучился по тебе!',
  'почеши пузико 🐾',
  'ты моё любимое солнышко 🖤',
  'передаю тебе миллион поцелуйчиков ❤️'
]);
const nextPetFull = makeDeck([
  'обожаю тебя, Дашуль! 🖤',
  'максимум мурчания! ты самая лучшая 🐾',
  'всё, я официально твой котик навечно 🖤',
  'передоз нежности! зацелую тебя ❤️',
  'он тебя безумно любит (а я еще больше!) 🖤',
  'сердечко котика (и мое) полностью украдено Дашулей 🐾❤️'
]);
function showPetCount() { $('#petCount').textContent = petCount; $('#petWord').textContent = pl(petCount, ['раз', 'раза', 'раз']); }
showPetCount();
function say(text, ms = 1800) {
  bubble.textContent = text; bubble.classList.add('show');
  clearTimeout(bubbleT); bubbleT = setTimeout(() => bubble.classList.remove('show'), ms);
}
const PET_ANIMS = ['anim-nuzzle', 'anim-knead', 'anim-stretch', 'anim-wiggle'];
let petAnimIdx = 0, petAnimT = 0, petIdleT = 0, petHappyT = 0, strokeStep = 0;
let petSayIn = 5 + Math.floor(Math.random() * 6);
function maybePetSay(fn, ms = 1900) {
  if (--petSayIn > 0) return;
  petSayIn = 5 + Math.floor(Math.random() * 6);
  say(fn(), ms);
}
function playPetAnim(cls, dur = 950) {
  petCat.classList.remove(...PET_ANIMS, 'anim-joy', 'bounce');
  void petCat.offsetWidth;
  petCat.classList.add(cls);
  clearTimeout(petAnimT);
  petAnimT = setTimeout(() => petCat.classList.remove(cls), dur);
}
function updatePetLean(clientX, clientY) {
  const r = petBox.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const nx = clamp((clientX - (r.left + r.width * .5)) / (r.width * .45), -1, 1);
  const ny = clamp((clientY - (r.top + r.height * .48)) / (r.height * .45), -1, 1);
  petCat.style.setProperty('--dx', (nx * 14).toFixed(1) + 'px');
  petCat.style.setProperty('--dy', (ny * 9 - 4).toFixed(1) + 'px');
  petCat.style.setProperty('--rot', (nx * 6.5).toFixed(2) + 'deg');
}
function resetPetPose(delay = 420) {
  clearTimeout(petIdleT);
  petCat.style.setProperty('--dx', '0px');
  petCat.style.setProperty('--dy', '0px');
  petCat.style.setProperty('--rot', '0deg');
  clearTimeout(petHappyT);
  petHappyT = setTimeout(() => {
    if (!petting) petCat.classList.remove('happy');
  }, delay);
}
function armPetWatchdog() {
  clearTimeout(petIdleT);
  petIdleT = setTimeout(() => {
    petting = false;
    resetPetPose(180);
  }, 900);
}
petBox.addEventListener('pointerdown', e => {
  petting = true; petMoved = 0; lx = e.clientX; ly = e.clientY;
  clearTimeout(petHappyT);
  try { petBox.setPointerCapture(e.pointerId); } catch (_) {}
  petCat.classList.add('happy');
  updatePetLean(e.clientX, e.clientY);
  armPetWatchdog();
});
petBox.addEventListener('pointermove', e => {
  if (!petting) return;
  armPetWatchdog();
  updatePetLean(e.clientX, e.clientY);
  const d = Math.hypot(e.clientX - lx, e.clientY - ly);
  lx = e.clientX; ly = e.clientY; petDist += d; petMoved += d;
  if (petDist > 85) {
    petDist = 0;
    strokeStep++;
    purr = Math.min(1, purr + .08);
    purrBar.style.width = purr * 100 + '%';
    petCount++; localStorage.setItem('dasha-pets', petCount); showPetCount();
    particle(e.clientX, e.clientY - 20, { html: Math.random() < .3 ? PAW : HEART, size: rnd(14, 24), color: '#e0202f', dx: rnd(-30, 30), dy: -rnd(60, 110), rot: rnd(-30, 30), dur: 1000 });
    vibrate(8);
    if (purr < 1) {
      if (strokeStep % 2 === 1) {
        const anim = PET_ANIMS[petAnimIdx++ % PET_ANIMS.length];
        playPetAnim(anim, 950);
      }
      maybePetSay(nextPetStroke, 1800);
    }
    if (purr >= 1) {
      purr = 0;
      setTimeout(() => purrBar.style.width = '0', 600);
      const r = petBox.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * .35, 26, 150);
      playPetAnim('anim-joy', 1120);
      petSayIn = 5 + Math.floor(Math.random() * 6);
      say(nextPetFull(), 2600);
      vibrate([20, 30, 20, 30, 60]);
    }
  }
});
function endPet() {
  if (!petting) return;
  petting = false;
  clearTimeout(petIdleT);
  if (petMoved < 10) {
    maybePetSay(nextPetTap, 1900);
    const anim = PET_ANIMS[petAnimIdx++ % PET_ANIMS.length];
    playPetAnim(anim, 950);
    const r = petBox.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * .32, 6, 55);
    vibrate(15);
    resetPetPose(820);
  } else {
    resetPetPose(500);
  }
}
['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach(ev => petBox.addEventListener(ev, endPet));
addEventListener('pointerup', endPet, { passive: true });
addEventListener('pointercancel', endPet, { passive: true });
setInterval(() => { if (!petting && purr > 0) { purr = Math.max(0, purr - .02); purrBar.style.width = purr * 100 + '%'; } }, 400);

/* eyes follow your finger */
const pupilGroups = $$('.cat-pupils');
function lookAt(x, y) {
  pupilGroups.forEach(g => {
    const svg = g.ownerSVGElement, r = svg.getBoundingClientRect();
    if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) return;
    const ex = r.left + r.width * .5, ey = r.top + r.height * (284 / 870);
    const a = Math.atan2(y - ey, x - ex), dist = Math.min(1, Math.hypot(x - ex, y - ey) / 160);
    g.style.transform = `translate(${(Math.cos(a) * 11.5 * dist).toFixed(2)}px, ${(Math.sin(a) * 7.2 * dist).toFixed(2)}px)`;
  });
}
addEventListener('pointermove', e => { lastLook = Date.now(); lookAt(e.clientX, e.clientY); }, { passive: true });
addEventListener('pointerdown', e => { lastLook = Date.now(); lookAt(e.clientX, e.clientY); }, { passive: true });
setInterval(() => { if (Date.now() - lastLook > 2500) lookAt(rnd(0, innerWidth), rnd(0, innerHeight)); }, 2200);

/* ============================================================
   SCRATCH
   ============================================================ */
const sc = $('#scratchCanvas'), sctx = sc.getContext('2d', { willReadFrequently: true });
let scDone = false, scDown = false, scLast = null, scMoves = 0, scW = 0;
function heartPath(ctx, x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y + s * .3);
  ctx.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3);
  ctx.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s);
  ctx.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3);
  ctx.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3);
  ctx.fill();
}
function paintScratch() {
  if (scDone) return;
  const r = sc.getBoundingClientRect();
  if (!r.width) return;
  scW = r.width;
  const d = Math.min(2, devicePixelRatio || 1);
  sc.width = r.width * d; sc.height = r.height * d;
  sctx.setTransform(d, 0, 0, d, 0, 0);
  const w = r.width, h = r.height;
  sctx.globalCompositeOperation = 'source-over';
  const g = sctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#4a050c'); g.addColorStop(.5, '#9e0b19'); g.addColorStop(1, '#3a040a');
  sctx.fillStyle = g; sctx.fillRect(0, 0, w, h);
  sctx.fillStyle = 'rgba(241,232,227,.07)';
  for (let i = 0; i < 46; i++) heartPath(sctx, rnd(0, w), rnd(0, h), rnd(8, 20));
  sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
  sctx.fillStyle = 'rgba(241,232,227,.92)';
  sctx.font = 'italic 600 31px "Cormorant Garamond", serif';
  sctx.fillText('сотри меня пальчиком', w / 2, h / 2 - 10);
  sctx.fillStyle = 'rgba(241,232,227,.6)';
  sctx.font = '22px "Marck Script", cursive';
  sctx.fillText('тут кое-что для тебя', w / 2, h / 2 + 28);
}
function scratchAt(x, y) {
  const r = sc.getBoundingClientRect();
  const p = { x: x - r.left, y: y - r.top };
  sctx.globalCompositeOperation = 'destination-out';
  sctx.lineWidth = 42; sctx.lineCap = 'round'; sctx.lineJoin = 'round';
  sctx.beginPath();
  if (scLast) { sctx.moveTo(scLast.x, scLast.y); sctx.lineTo(p.x, p.y); sctx.stroke(); }
  else { sctx.arc(p.x, p.y, 21, 0, Math.PI * 2); sctx.fill(); }
  scLast = p;
  if (++scMoves % 10 === 0) checkScratch();
}
function checkScratch() {
  const data = sctx.getImageData(0, 0, sc.width, sc.height).data;
  let clear = 0, n = 0;
  for (let i = 3; i < data.length; i += 4 * 23) { n++; if (data[i] < 120) clear++; }
  if (clear / n > .5) revealSecret();
}
function revealSecret() {
  if (scDone) return;
  scDone = true;
  sc.classList.add('gone');
  const r = sc.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 30, 160);
  rain(26);
  vibrate([40, 50, 40, 50, 120]);
}
sc.addEventListener('pointerdown', e => { scDown = true; scLast = null; try { sc.setPointerCapture(e.pointerId); } catch (_) {} scratchAt(e.clientX, e.clientY); });
sc.addEventListener('pointermove', e => { if (scDown) scratchAt(e.clientX, e.clientY); });
['pointerup', 'pointercancel'].forEach(ev => sc.addEventListener(ev, () => { scDown = false; scLast = null; }));
(document.fonts ? document.fonts.ready : Promise.resolve()).then(paintScratch);
setTimeout(paintScratch, 1500);
addEventListener('resize', () => { const w = sc.getBoundingClientRect().width; if (Math.abs(w - scW) > 2) paintScratch(); });

/* ============================================================
   FINALE
   ============================================================ */
const finLines = ['люблю тебя 🖤', 'ещё разок?', 'моя девочка', 'ты самая-самая', 'целуюю', 'бесконечно люблю', 'обнимаю крепко-крепко'];
let finN = 0;
$('#bigHeart').addEventListener('click', e => {
  const r = e.currentTarget.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 22, 160);
  rain(finN === 0 ? 46 : 16);
  vibrate([30, 40, 60]);
  $('#finCount').textContent = finLines[finN % finLines.length];
  finN++;
});

/* ============================================================
   WALKING CAT
   ============================================================ */
const walker = $('#walker');
const nextWalkerLine = makeDeck([
  'топаю к Дашее 🐾',
  'классная песенка, да? 🎧',
  'мяу, любимка 🖤',
  'тыгидык-тыгидык за сердечками!',
  'танцую под ваш плейлист 🐾',
  'бегу обнимать Дашулю 🖤',
  'ты супер милая!',
  'ловлю вайбик вместе с тобой ✨',
  'цём от маленького котёнка 🐾',
  'гуляю по твоей страничке 🖤'
]);
function walk() {
  if (document.hidden || lbOpen) { setTimeout(walk, 8000); return; }
  walker.classList.remove('walk', 'meow'); void walker.offsetWidth;
  // ~22–27s across the screen: matches the 1.42s gait cycle so paws don't "skate"
  walker.style.setProperty('--dur', rnd(22, 27).toFixed(1) + 's');
  walker.classList.add('walk');
}
walker.addEventListener('animationend', e => {
  if (e.animationName !== 'walkacross') return;
  walker.classList.remove('walk', 'meow');
  setTimeout(walk, rnd(22000, 40000));
});
let walkerT = 0;
walker.addEventListener('click', () => {
  const wb = $('.walker-bubble', walker);
  const r = walker.getBoundingClientRect();
  if (wb) {
    wb.textContent = nextWalkerLine();
    const cx = r.left + r.width * .5;
    const half = 104;
    let shift = 0;
    if (cx + half > innerWidth - 12) shift = (innerWidth - 12) - (cx + half);
    else if (cx - half < 12) shift = 12 - (cx - half);
    wb.style.setProperty('--wb-x', shift.toFixed(1) + 'px');
  }
  walker.classList.remove('meow'); void walker.offsetWidth; walker.classList.add('meow');
  burst(r.left + r.width / 2, r.top, 8, 60); vibrate(15);
  clearTimeout(walkerT);
  walkerT = setTimeout(() => walker.classList.remove('meow'), 1900);
});

/* ============================================================
   RED THREAD + SCROLL
   ============================================================ */
const main = $('#main'), thread = $('#thread'), tglow = $('#threadGlow'), tpath = $('#threadPath'), tip = $('#threadTip');
let tLen = 0, samples = [];
function offsetIn(el) {
  let x = 0, y = 0, e = el;
  while (e && e !== main) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return { x, y };
}
function buildThread() {
  const W = main.clientWidth, H = main.scrollHeight;
  const knots = $$('[data-knot]').map((el, i) => {
    const o = offsetIn(el);
    const side = i % 2 ? .8 : .2;
    return { x: o.x + el.offsetWidth * side, y: o.y + Math.min(el.offsetHeight * .12, 34) };
  });
  const start = { x: W * .5, y: $('#hero').offsetHeight - 40 };
  const pts = [start, ...knots].filter((p, i, a) => i === 0 || p.y > a[i - 1].y);
  let d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dy = b.y - a.y;
    d += ` C ${a.x.toFixed(1)} ${(a.y + dy * .48).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - dy * .48).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  thread.setAttribute('viewBox', `0 0 ${W} ${H}`);
  thread.style.height = H + 'px';
  if (tglow) tglow.setAttribute('d', d);
  tpath.setAttribute('d', d);
  tLen = tpath.getTotalLength();
  if (tglow) tglow.style.strokeDasharray = tLen;
  tpath.style.strokeDasharray = tLen;
  samples = [];
  const N = Math.max(200, Math.round(tLen / 20));
  for (let k = 0; k <= N; k++) {
    const l = tLen * k / N, pt = tpath.getPointAtLength(l);
    samples.push({ l, x: pt.x, y: pt.y });
  }
  updateThread();
}
function updateThread() {
  if (!tLen || !samples.length) return;
  const targetY = innerHeight * .72 - main.getBoundingClientRect().top;
  let lo = 0, hi = samples.length - 1, idx = 0;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (samples[mid].y <= targetY) { idx = mid; lo = mid + 1; } else hi = mid - 1; }
  const s = samples[idx];
  const off = tLen - s.l;
  if (tglow) tglow.style.strokeDashoffset = off;
  tpath.style.strokeDashoffset = off;
  tip.style.transform = `translate3d(${(s.x - 8).toFixed(1)}px, ${(s.y - 7).toFixed(1)}px, 0)`;
  tip.style.opacity = s.l > 2 && s.l < tLen - 2 ? 1 : 0;
}
let rebuildT = 0;
const rebuild = () => { clearTimeout(rebuildT); rebuildT = setTimeout(buildThread, 150); };
$$('img').forEach(img => { if (!img.complete) img.addEventListener('load', rebuild); });
if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(main);
(document.fonts ? document.fonts.ready : Promise.resolve()).then(rebuild);

const bar = $('#progressBar'), pcat = $('#progressCat');
const pstage = pcat.querySelector('.w-stage') || pcat.firstElementChild;
let lastY = 0, scrollT = 0, ticking = false, progW = innerWidth, pcatRunning = false;
function onScroll() {
  ticking = false;
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? clamp(y / max, 0, 1) : 0;
  bar.style.transform = `scaleX(${p.toFixed(4)})`;
  pcat.style.transform = `translate3d(${(21 + p * (progW - 42)).toFixed(1)}px, 0, 0) translateX(-50%)`;
  if (pstage) pstage.style.transform = y < lastY ? 'scaleX(-1)' : '';
  if (!pcatRunning) { pcatRunning = true; pcat.classList.add('run'); }
  clearTimeout(scrollT); scrollT = setTimeout(() => { pcatRunning = false; pcat.classList.remove('run'); }, 160);
  lastY = y;
  revealCheck();
  updateThread();
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', () => { progW = innerWidth; requestAnimationFrame(onScroll); });

/* pause stuff when hidden */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) vids.forEach(v => v.pause());
});
})();
