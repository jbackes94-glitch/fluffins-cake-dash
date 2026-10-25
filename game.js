'use strict';
/* Engine: world-space runner. All heights are relative to the ground line (negative = up), all x in world units.
   40 world units = 1 metre. */
const $ = id => document.getElementById(id);
const cv = $('game'), stage = $('stage'), probe = $('probe');
const mainCtx = cv.getContext('2d');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
};
const FONT_D = "'Lilita One', Fredoka, ui-rounded, system-ui, sans-serif";
const FONT_B = "Fredoka, ui-rounded, system-ui, sans-serif";
const UPM = 40, GRAV = 2000, MAX_LIVES = 5;

// ---------------- settings ----------------
const saved = store.get('fluffin-lang');
let lang = saved === 'de' || saved === 'en' ? saved : ((navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en');
let langChosen = saved === 'de' || saved === 'en';
const MAPS = ['common', 'weiher', 'garden', 'staden'];
let map = MAPS.includes(store.get('fluffin-map')) ? store.get('fluffin-map') : 'common';
let char = store.get('fluffin-char') === 'marli' ? 'marli' : 'fluffin';
let outfit = store.get('fluffin-outfit') || 'none';
let socksTotal = +store.get('fluffin-socks-total') || 0;
SND.muted = store.get('fluffin-muted') === '1';
const OUTFITS = [['none', 0], ['raincoat', 0], ['bandana', 5], ['shades', 15], ['santa', 30]];
if (!OUTFITS.some(([o, n]) => o === outfit && socksTotal >= n)) outfit = 'none';
const BEST_KEYS = {common: 'fluffin-cake-dash-best', weiher: 'fluffin-cake-dash-best-weiher', garden: 'fluffin-cake-dash-best-garten', staden: 'fluffin-cake-dash-best-staden'};
const bestOf = m => +store.get(BEST_KEYS[m]) || 0;
const S = () => STR[lang];
const M = (m) => STR[lang].maps[m || map];
const T = k => (M()[k] !== undefined ? M()[k] : S()[k]);
const stLabel = k => (M().st && M().st[k]) || S().st[k];
const quips = k => (M().quips && M().quips[k]) || S().quips[k] || ['Ouch'];
const ART_ROW = {common: 'ball', weiher: 'apple', garden: 'treat', staden: 'grumbeer'};
const ART_ARC = {common: 'cake', weiher: 'fk', garden: 'cheese', staden: 'schwenker'};
const ART_RARE = {common: null, weiher: 'lyoner', garden: 'liver', staden: 'maggi'};
const rideKind = () => map === 'common' ? 'capy' : (char === 'marli' ? 'fluffin' : 'marli');

// ---------------- viewport and quality ----------------
let W = 600, H = 320, GROUND = 268, scale = 1, dpr = 1, R = 2, safe = {t: 0, r: 0, b: 0, l: 0}, DOGX = 110;
const QF = [1, 0.78, 0.6];
let quality = 0;
function resize() {
  const cssW = stage.clientWidth || innerWidth, cssH = stage.clientHeight || innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const px = dpr * QF[quality];
  cv.width = Math.round(cssW * px); cv.height = Math.round(cssH * px);
  scale = Math.min(cssH / 320, cssW / 460);
  W = cssW / scale; H = cssH / scale;
  GROUND = H > 380 ? Math.round(Math.max(268, H * 0.64)) : Math.round(H - 52);
  const newR = Math.round(scale * px * 100) / 100;
  if (newR !== R) { R = newR; Sprites.R = R; clearSprites(); GroundStrip.key = ''; Scenery.R = 0; }
  DOGX = clamp(W * 0.2, 96, 170);
  const cs = getComputedStyle(probe);
  safe = {t: (parseFloat(cs.paddingTop) || 0) / scale, r: (parseFloat(cs.paddingRight) || 0) / scale, b: (parseFloat(cs.paddingBottom) || 0) / scale, l: (parseFloat(cs.paddingLeft) || 0) / scale};
}
const perf = {ema: 16, timer: 0, slowFor: 0};
function watchPerf(rawMs, dt) {
  if (state !== 'play') return;
  perf.ema = perf.ema * 0.95 + Math.min(rawMs, 100) * 0.05;
  perf.slowFor = perf.ema > 21 ? perf.slowFor + dt : 0;
  if (perf.slowFor > 1.6 && quality < QF.length - 1) { quality++; perf.slowFor = 0; perf.ema = 16; resize(); }
}

// ---------------- run state ----------------
let state = 'menu', G = null;
function newRun(attract) {
  G = {t: 0, scroll: 0, speed: attract ? 90 : 210, target: attract ? 90 : 210, base: 210, attract,
    genX: 0, pits: [], plats: [], enemies: [], items: [], npcs: [], projs: [], parts: [], pops: [], trail: [],
    dog: {ry: 0, vy: 0, prevY: 0, jumps: 0, onGround: true, coyote: 0, run: 0, squash: 0, glide: 0, swim: 0},
    lives: 3, shield: 0, bossIntro: null, invuln: 0, zoom: 0, zen: 0, ride: null, rideT: 0, combo: 0, shake: 0, flash: 0,
    bonus: 0, cakes: 0, balls: 0, rare: 0, socks: 0, sockSet: 0, booped: 0, bosses: 0,
    nextBossM: 600, boss: null, arena: null, banner: null, lastPhase: 'day', nextMilestone: 500,
    rideAt: rand(18, 26), omaAt: rand(10, 18), holding: false, jumpBuffer: 0};
  G.genX = 0;
  genFlatSafe(0, attract ? 900 : 650);
  genAhead();
}
const metres = () => Math.floor(G.scroll / UPM);
const score = () => metres() + G.bonus;
const dogX = () => G.scroll + DOGX;
const diff = () => clamp(metres() / 1600, 0, 1);

// ---------------- level generation ----------------
const DEF = {
  pigeon: {w: 26, h: 20, oy: 0, vx: [20, 50]}, high: {w: 30, h: 18, oy: -104, vx: [55, 85]}, turkey: {w: 30, h: 40, oy: 0, vx: [0, 30]},
  squirrel: {w: 24, h: 22, oy: 0, vx: [130, 170]}, hedgehog: {w: 30, h: 20, oy: 0, vx: [10, 25]}, goose: {w: 34, h: 46, oy: 0, vx: [20, 35], hp: 2},
  hoover: {w: 36, h: 16, oy: 0, vx: [35, 55]}
};
function defFor(k) {
  const d = Object.assign({}, DEF[k]);
  if (map === 'weiher' && k === 'turkey') Object.assign(d, {w: 40, h: 26});
  if (map === 'weiher' && k === 'hoover') Object.assign(d, {w: 40, h: 32});
  if (map === 'garden' && k === 'turkey') Object.assign(d, {w: 44, h: 30, vx: [30, 70]});
  if (map === 'garden' && k === 'goose') Object.assign(d, {w: 22, h: 52});
  if (map === 'garden' && k === 'pigeon') Object.assign(d, {w: 24, h: 18});
  if (map === 'staden' && k === 'turkey') Object.assign(d, {w: 44, h: 24, vx: [15, 45]});
  if (map === 'staden' && k === 'hoover') Object.assign(d, {w: 34, h: 34, vx: [45, 70]});
  return d;
}
const flier = k => k === 'high';
function addEnemy(k, x) {
  const d = defFor(k);
  const e = {k, x, ry: d.oy, base: d.oy, w: d.w, h: d.h, vx: rand(d.vx[0], d.vx[1]), hp: d.hp || 1, ph: rand(0, 6), vy: 0, hop: rand(0.5, 1.4), hitCD: 0, f: 0};
  G.enemies.push(e); return e;
}
function addItem(kind, x, ry, extra) { const it = Object.assign({kind, x, ry, ph: rand(0, 6), v: Math.floor(Math.random() * 4)}, extra || {}); G.items.push(it); return it; }
function addPlat(kind, x, w, top, extra) { const p = Object.assign({kind, x, w, top}, extra || {}); G.plats.push(p); return p; }
function enemyPool() {
  const m = G.genX / UPM, pool = [['pigeon', 2.6], ['turkey', 2.2], ['squirrel', 2.6]];
  if (m > 120) pool.push(['high', 1.8]);
  if (m > 330) pool.push(['hedgehog', 2]);
  if (m > 480) pool.push(['goose', 1.8]);
  if (m > 720) pool.push(['hoover', 1.4]);
  return pool;
}
function pickWeighted(pool) { let r = Math.random() * pool.reduce((a, p) => a + p[1], 0); for (const [n, w] of pool) if ((r -= w) <= 0) return n; return pool[0][0]; }
function itemRow(x, ry, n, gap) { for (let i = 0; i < n; i++) addItem('row', x + i * (gap || 26), ry); }
function itemArc(x, ry, n, gap, lift) { for (let i = 0; i < n; i++) addItem('arc', x + i * (gap || 32), ry - Math.sin(i / Math.max(1, n - 1) * Math.PI) * (lift || 40)); }
function extras(x) {
  const m = G.genX / UPM;
  if (m > 50 && Math.random() < 0.16) addItem('sock', x + rand(0, 120), -rand(150, 185));
  if (m > 260 && Math.random() < 0.06) addItem('gold', x + rand(0, 120), -128);
  if (ART_RARE[map] && Math.random() < 0.13) addItem('rare', x + rand(40, 160), -rand(118, 160));
  if (map === 'garden' && m > 120 && Math.random() < 0.05) addItem('lickmat', x + rand(0, 100), -60);
}
function genFlatSafe(x, len) {
  if (G.attract) for (let k = x + 260; k < x + len - 100; k += 260) itemRow(k, -rand(30, 70), 4);
  G.genX = x + len;
}
function chunkFlat(x) {
  const len = rand(520, 820), d = diff(), pool = enemyPool();
  let n = 1 + (Math.random() < 0.35 + d * 0.4 ? 1 : 0) + (d > 0.45 && Math.random() < 0.3 ? 1 : 0);
  const sp = (len - 200) / n;
  for (let i = 0; i < n; i++) {
    const k = pickWeighted(pool), ex = x + 160 + i * sp + rand(0, sp * 0.4), e = addEnemy(k, ex);
    if (!flier(k) && k !== 'hedgehog' && Math.random() < 0.35) itemArc(ex - 26, -e.h - 44, 3, 26, 12);
  }
  if (Math.random() < 0.6) { if (Math.random() < 0.5) itemRow(x + rand(40, 200), -rand(26, 100), 5); else itemArc(x + rand(40, 200), -rand(30, 90), 4, 32, 38); }
  if (G.t > 0 && !G.rideSpawned && G.rideAt <= 0) { G.rideSpawned = true; addItem('ride', x + len - 120, 0); }
  if ((map === 'garden' || map === 'staden') && G.omaAt <= 0 && !G.omaSpawned) { G.omaSpawned = true; G.npcs.push({k: 'oma', x: x + len - 40, ry: 0, state: 'walk', t: 0, f: 0}); }
  extras(x);
  return x + len;
}
const FURN = {common: ['bench', 'log', 'table'], weiher: ['bench', 'stump'], garden: ['gtable', 'bench'], staden: ['bench', 'table']};
function chunkFurniture(x) {
  let cur = x + 120;
  const n = 2 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const kind = pick(FURN[map]), w = kind === 'stump' ? 34 : Math.round(rand(96, 140)), top = -PLAT_H[kind];
    addPlat(kind, cur, w, top);
    if (kind !== 'stump') itemRow(cur + 14, top - 16, Math.max(2, Math.floor((w - 20) / 26)));
    if (i === 0 && Math.random() < 0.45) addEnemy(pick(['pigeon', 'squirrel']), cur + w / 2);
    cur += w + rand(70, 130);
  }
  extras(x);
  return cur + 80;
}
function chunkPit(x) {
  const d = diff(), w = clamp(rand(70, 120 + d * 70), 70, Math.min(210, G.base * 0.62)), x0 = x + 110;
  G.pits.push({x0, x1: x0 + w});
  const n = 5; for (let i = 0; i < n; i++) { const t = i / (n - 1); addItem('row', x0 - 20 + t * (w + 40), -40 - Math.sin(t * Math.PI) * 70); }
  return x0 + w + 150;
}
function chunkPitPlat(x) {
  const w = rand(250, 330), x0 = x + 110, kind = map === 'garden' ? 'floatie' : map === 'weiher' ? 'pedalo' : map === 'staden' ? 'rowboat' : 'log';
  G.pits.push({x0, x1: x0 + w});
  const pw = kind === 'log' ? 74 : 66, px = x0 + w / 2 - pw / 2;
  addPlat(kind, px, pw, kind === 'log' ? -10 : -6, {floating: true});
  itemArc(px - 50, -60, 6, (pw + 100) / 5, 50);
  return x0 + w + 160;
}
function chunkSpecial(x) {
  if (map === 'garden') {
    if (Math.random() < 0.55) {
      const w = 230; addPlat('carport', x + 160, w, -PLAT_H.carport);
      itemRow(x + 180, -PLAT_H.carport - 18, 7, 28);
      addEnemy(Math.random() < 0.5 ? 'hoover' : 'pigeon', x + 160 + w * 0.6);
      if (Math.random() < 0.5) addItem('sock', x + 160 + w / 2, -PLAT_H.carport - 80);
      return x + 160 + w + 140;
    }
    addPlat('trampoline', x + 160, 64, -PLAT_H.trampoline, {bouncy: true});
    for (let i = 0; i < 5; i++) addItem(i === 2 ? (Math.random() < 0.5 ? 'sock' : 'rare') : 'arc', x + 150 + i * 28, -190 - Math.sin(i / 4 * Math.PI) * 50);
    return x + 420;
  }
  if (map === 'staden' && Math.random() < 0.6) {
    // the old stone bridge over a side arm of the Saar
    const w = rand(260, 330), x0 = x + 120;
    G.pits.push({x0, x1: x0 + w});
    addPlat('bridge', x0 - 30, w + 60, -PLAT_H.bridge);
    itemRow(x0 + 10, -PLAT_H.bridge - 18, 7, 34);
    if (Math.random() < 0.5) addItem('sock', x0 + w / 2, -PLAT_H.bridge - 100);
    return x0 + w + 160;
  }
  if (map === 'weiher' || map === 'staden') {
    const w = rand(320, 400), x0 = x + 110;
    G.pits.push({x0, x1: x0 + w});
    const a = rand(110, 150);
    addPlat('jetty', x0 + 24, a, -6); addPlat('jetty', x0 + w - 24 - (w - 48 - a - 70), w - 48 - a - 70, -6);
    itemRow(x0 + 40, -22, 4); itemArc(x0 + a + 10, -70, 3, 30, 30);
    if (Math.random() < 0.5) addEnemy('pigeon', x0 + 60);
    return x0 + w + 150;
  }
  addPlat('bench', x + 140, 110, -PLAT_H.bench);
  addPlat('table', x + 320, 130, -PLAT_H.table);
  itemRow(x + 156, -PLAT_H.bench - 16, 3); itemRow(x + 336, -PLAT_H.table - 16, 4);
  addItem('sock', x + 385, -PLAT_H.table - 120);
  return x + 520;
}
function chunk() {
  const m = G.genX / UPM;
  if (!G.attract && m >= G.nextBossM && !G.arena) {
    G.arena = {x: G.genX + 260};
    G.genX += 1500;
    return;
  }
  if (G.attract) { genFlatSafe(G.genX, 900); return; }
  const opts = [['flat', 3]];
  if (m > 30) opts.push(['furn', 2]);
  if (m > 70) opts.push(['pit', 1.8]);
  if (m > 200) opts.push(['pitplat', 1.3]);
  if (m > 140) opts.push(['special', 1.2]);
  const c = pickWeighted(opts);
  const x = G.genX;
  G.genX = c === 'flat' ? chunkFlat(x) : c === 'furn' ? chunkFurniture(x) : c === 'pit' ? chunkPit(x) : c === 'pitplat' ? chunkPitPlat(x) : chunkSpecial(x);
}
function genAhead() { let guard = 0; while (G.genX < G.scroll + W + 800 && guard++ < 20) { if (G.arena && G.genX > G.arena.x + 1000 && (G.boss || !G.arenaDone)) break; chunk(); } }
function pitAt(x) { for (const p of G.pits) if (x > p.x0 && x < p.x1) return p; return null; }

// ---------------- popups and particles ----------------
function popup(x, ry, text, color, size) {
  for (const p of G.pops) if (p.life > 0.5 && Math.abs(p.x - x) < 90 && Math.abs(p.ry - ry) < 20) ry = p.ry - 22;
  G.pops.push({x, ry, text, color: color || '#fff6e4', life: 1, size: size || 15}); }
function burst(x, ry, colors, n, power) {
  if (reduceMotion || quality === 2) n = Math.ceil(n / 2);
  for (let i = 0; i < n && G.parts.length < 180; i++) { const life = rand(0.45, 0.85); G.parts.push({x, ry, vx: rand(-1, 1) * (power || 240), vy: -rand(60, 320), g: 900, life, max: life, c: pick(colors), r: rand(1.8, 4)}); }
}
function dust(x) { for (let i = 0; i < 6; i++) { const life = rand(0.3, 0.5); G.parts.push({x: x + rand(-14, 14), ry: 0, vx: rand(-90, 30), vy: -rand(20, 80), g: 200, life, max: life, c: 'rgba(226,204,160,.9)', r: rand(2.5, 5)}); } }
function splash(x) { for (let i = 0; i < 16; i++) { const life = rand(0.4, 0.8); G.parts.push({x: x + rand(-12, 12), ry: 4, vx: rand(-120, 120), vy: -rand(140, 380), g: 1200, life, max: life, c: pick(['#cfeeff', '#ffffff', '#8cc6e0']), r: rand(2, 4.5)}); } }
const vibrate = ms => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
const FEATHERS = {pigeon: ['#9aa1ad', '#7b8494', '#5fae8f'], high: ['#9aa1ad', '#7b8494'], turkey: ['#7a3f1f', '#c9853a', '#e9c46a'], squirrel: ['#8f939c', '#b9bcc3'], hedgehog: ['#7a5a42', '#4e3626'], goose: ['#8b7762', '#efe8da', '#1c1c1c'], hoover: ['#6fe0ff', '#ffffff', '#3d424c']};
const FEATHERS_M = {weiher: {pigeon: ['#2f7a4a', '#a69482', '#ffffff'], high: ['#9ba3ab', '#d9dde0'], turkey: ['#5a4636', '#3d3027'], goose: ['#ffffff', '#ece9df', '#f08a2a'], hoover: ['#a8743e', '#2e6fb5']},
  staden: {turkey: ['#8a6646', '#c9b29a'], goose: ['#d8c3a6', '#8a5a3a', '#ffffff'], hoover: ['#33c2b0', '#2a2d33']},
  garden: {pigeon: ['#1b1b1d', '#ffb21e'], high: ['#16181c', '#f4f4f4', '#1f2b45'], turkey: ['#ea7432', '#fff4e8'], goose: ['#d92e36', '#3c7fd1', '#f4f4f4'], hoover: ['#3f9a4a', '#ffffff']}};
const feathers = k => (FEATHERS_M[map] && FEATHERS_M[map][k]) || FEATHERS[k] || ['#ffffff'];

// ---------------- dog actions ----------------
function dogBox() {
  const x = dogX(), d = G.dog;
  if (G.ride === 'capy' || G.ride === 'marli') return {x: x - 26, y: d.ry - 76, w: 60, h: 74};
  if (char === 'marli') return {x: x - 24, y: d.ry - (G.ride === 'fluffin' ? 84 : 60), w: 62, h: G.ride === 'fluffin' ? 82 : 58};
  return {x: x - 20, y: d.ry - (G.ride === 'fluffin' ? 70 : 52), w: 56, h: G.ride === 'fluffin' ? 68 : 50};
}
function tryJump() {
  if (state !== 'play') return;
  if (G.bossIntro) { if (G.bossIntro.t > 0.6) { G.bossIntro = null; G.holding = false; SFX.power(); } return; }
  const d = G.dog, maxJ = G.ride ? 3 : 2, j1 = char === 'marli' ? -715 : -690;
  if (d.onGround || d.coyote > 0 || d.swim > 0) {
    d.vy = j1; d.jumps = 1; d.onGround = false; d.coyote = 0; d.swim = 0; d.glide = 0.9;
    SFX.jump(); dust(dogX());
  } else if (d.jumps < maxJ) {
    d.vy = -600; d.jumps++; SFX.jump2();
    burst(dogX() + 4, d.ry - 6, G.ride ? ['#ffd08a', '#f2a33a'] : ['#ffffff', '#f8dcae'], 6, 120);
  } else G.jumpBuffer = 0.13;
}
function releaseJump() { if (state === 'play' && !G.bossIntro && G.dog.vy < 0) G.dog.vy *= 0.55; }
function ouch(src, msg) {
  if (G.invuln > 0) return;
  if (G.ride) { dropRide(S().rides[G.ride].bail); return; }
  if (G.shield > 0) G.shield--; else G.lives--;
  G.invuln = G.boss ? 2 : 1.6; G.combo = 0; G.flash = 0.25;
  if (!reduceMotion) G.shake = 0.3;
  SFX.hurt(); vibrate(40);
  popup(dogX() + 14, G.dog.ry - 84, msg || pick(quips(src)), '#ffc2b3');
  burst(dogX() + 10, G.dog.ry - 30, char === 'marli' ? ['#eed7ad', '#f8ead0'] : ['#efc995', '#e4aa70', '#f8e4c4'], 8);
  if (G.lives <= 0) gameOver();
}
function dropRide(msg) {
  const r = G.ride; G.ride = null; G.rideT = 0; G.invuln = Math.max(G.invuln, 1.2); G.combo = 0;
  G.npcs.push({k: 'flee', ride: r, x: dogX(), ry: 0, t: 0});
  popup(dogX() + 14, G.dog.ry - 92, msg, '#ffe2b0');
  tone(400, 200, 0.2, 'triangle', 0.06);
}
function knock(e, byKick) {
  if (e.dead) return;
  e.dead = 'fly'; e.dt = 2; e.fvy = -520; e.fvx = 180; e.rot = 0; G.booped++;
  const pts = byKick ? 200 : 100; G.bonus += pts;
  popup(e.x, e.ry - e.h - 10, (byKick ? T('strike') : T('zoomHit')) + pts, '#ffe66b');
  burst(e.x, e.ry - e.h / 2, feathers(e.k), 8); SFX.stomp(2);
}
function stompBounce(top) {
  const d = G.dog; d.ry = top; d.prevY = top; d.vy = G.holding ? -770 : -570; d.jumps = 1; d.onGround = false; d.glide = 0.9;
}
function hitEnemy(e) {
  const top = e.ry - e.h, d = G.dog;
  if (G.zoom > 0) { knock(e, false); return; }
  if (d.vy > 0 && d.prevY <= top + 14) {
    if (e.k === 'hedgehog' && !G.ride) { d.vy = -520; d.ry = top; ouch(e.k, T('spiky')); return; }
    G.combo++;
    const pts = Math.min(1600, 50 * Math.pow(2, G.combo - 1));
    G.bonus += pts; G.booped++;
    stompBounce(top);
    burst(e.x, top, feathers(e.k), 10); SFX.stomp(G.combo); vibrate(15);
    if (!reduceMotion) G.shake = Math.max(G.shake, 0.08);
    if (e.k === 'goose' && e.hp > 1) { e.hp--; e.angry = true; e.vx += 110; e.hitCD = 0.3; e.honkT = 0.6; SFX.honk(); popup(e.x, top - 16, T('honk') + pts, '#ffb3a1'); }
    else if (e.k === 'hoover') { e.slide = true; popup(e.x, top - 16, T('kicked') + pts, '#bfefff'); }
    else { e.dead = 'squash'; e.dt = 0.45; popup(e.x, top - 16, G.combo > 1 ? T('combo') + G.combo + '! ' + pts : T('boop') + pts, G.combo > 1 ? '#ffe66b' : '#fff6e4'); }
    return;
  }
  if (e.hitCD > 0) return;
  if (G.ride) { dropRide(S().rides[G.ride].bail); e.hitCD = 1; return; }
  ouch(e.k);
}
function foodMul() { return char === 'marli' ? 2 : 1; }
function collect(it) {
  it.taken = true;
  const x = it.x, y = it.ry, k = it.kind;
  if (k === 'arc') { G.cakes++; G.bonus += 10 * foodMul(); SFX.cake(); popup(x, y - 14, foodMul() > 1 ? T('cakePop').replace('+10', '+20') : T('cakePop'), '#ffd6e6'); burst(x, y, ['#f59ac0', '#f6d58e', '#e7a08c'], 5, 120); }
  else if (k === 'row') { G.balls++; G.bonus += 5 * foodMul(); SFX.ball(); burst(x, y, ['#d9f04a', '#ffffff', '#d93a2f'], 4, 100); }
  else if (k === 'rare') { G.rare++; G.bonus += 25 * foodMul(); SFX.rare(); popup(x, y - 18, foodMul() > 1 ? T('rarePop').replace('+25', '+50') : T('rarePop'), '#ffd0c4', 17); burst(x, y, ['#e09a86', '#f2bfae', '#ffffff'], 10, 180); }
  else if (k === 'sock') {
    G.socks++; G.sockSet++; G.bonus += 50; SFX.sock();
    if (G.sockSet >= 5) { G.sockSet = 0; if (G.lives < MAX_LIVES) { G.lives++; popup(x, y - 16, T('stash'), '#ff9db4', 17); SFX.life(); } else { G.bonus += 250; popup(x, y - 16, T('stashPts'), '#ffe66b', 17); } }
    else popup(x, y - 16, T('stolen') + G.sockSet + '/5', '#fff6e4');
    burst(x, y, ['#ffffff', '#e5486b', '#2f5fb3'], 8, 160);
  }
  else if (k === 'gold') { G.zoom = 7; SFX.power(); vibrate(30); popup(x, y - 20, T('zoomies'), '#ffe66b', 22); burst(x, y, ['#ffd23f', '#ffffff', '#ff8fb1', '#8fe3ff'], 16, 260); }
  else if (k === 'lickmat') { G.zen = 6; SFX.power(); popup(x, y - 20, T('zenLabel') + '!', '#9ff0e6', 20); }
  else if (k === 'omaApple') { if (G.lives < MAX_LIVES) { G.lives++; SFX.life(); popup(x, y - 18, '+1 ♥', '#ff9db4', 20); } else { G.bonus += 100; SFX.rare(); popup(x, y - 18, '+100', '#ffe66b', 18); } burst(x, y, ['#d93a2f', '#ffffff', '#ff9db4'], 10, 160); }
  else if (k === 'ride') { G.ride = rideKind(); G.rideT = 18; SFX.power(); popup(x, -90, S().rides[G.ride].go, '#ffe2b0', 17); }
}

// ---------------- boss ----------------
const BOSS_DIM = {common: {w: 62, h: 90}, weiher: {w: 66, h: 90}, garden: {w: 104, h: 58}, staden: {w: 96, h: 62}};
function startBoss() {
  const n = G.bosses, dm = BOSS_DIM[map];
  G.boss = {hp: 3 + Math.min(2, n), max: 3 + Math.min(2, n), x: G.scroll + W + 140, ry: 0, w: dm.w, h: dm.h, state: 'enter', t: 0, vx: 0, flash: 0, f: 0, shots: 0};
  G.target = 0;
  G.banner = {text: S().bossIncoming(M().boss), life: 2.6};
  G.lives = Math.max(G.lives, 3); G.shield = 2; G.projs = [];
  G.enemies = G.enemies.filter(e => e.x < G.scroll + 40);
  G.bossIntro = {t: 0}; G.holding = false;
  SFX.bossIn(); playSong('boss');
}
function updateBoss(dt) {
  const b = G.boss; if (!b) return;
  b.t += dt; b.flash = Math.max(0, b.flash - dt); b.f += dt * (b.state === 'charge' ? 12 : 6);
  const rest = G.scroll + W * 0.74, spd = 200 + (b.max - b.hp) * 28 + G.bosses * 22, idleT = Math.max(1.25, 2.0 - G.bosses * 0.2);
  if (b.state === 'enter') { b.x -= 230 * dt; if (b.x <= rest) { b.x = rest; b.state = 'idle'; b.t = 0; b.shots = 0; } }
  else if (b.state === 'idle') {
    const fireAt = G.bosses ? [0.4, 0.95] : [0.5];
    if (map !== 'common' && b.shots < fireAt.length && b.t > fireAt[b.shots]) { b.shots++; fireProj(b); }
    if (map === 'common' && b.t > 0.3 && b.t < idleT - 0.8 && b.ry === 0 && Math.random() < 0.02) b.vyJ = -480;
    b.warn = b.t > idleT - 0.7 && b.ry === 0;
    if (b.t > idleT && b.ry === 0) { b.state = 'charge'; b.t = 0; b.warn = false; SFX.honk(); }
  } else if (b.state === 'charge') {
    b.x -= spd * dt;
    if (map === 'common' && G.bosses > 0 && b.ry === 0 && Math.abs(b.x - dogX()) < 160 && Math.random() < 0.02) b.vyJ = -520;
    if (b.x < G.scroll - 140) { b.x = G.scroll + W + 140; b.state = 'enter'; }
  } else if (b.state === 'retreat') { b.x += 340 * dt; if (b.x >= rest) { b.x = rest; b.state = 'idle'; b.t = 0; b.shots = 0; } }
  if (b.vyJ !== undefined) { b.ry += b.vyJ * dt; b.vyJ += GRAV * dt; if (b.ry >= 0) { b.ry = 0; b.vyJ = undefined; } }
  // collisions
  const d = G.dog, db = dogBox(), bb = {x: b.x - b.w / 2, y: b.ry - b.h, w: b.w, h: b.h};
  if (overlap(db, bb) && b.state !== 'dying') {
    const top = b.ry - b.h;
    if (d.vy > 0 && d.prevY <= top + 30) {
      b.hp--; b.flash = 0.5; stompBounce(top); d.vy = -820; SFX.bossHit(); vibrate(30);
      if (!reduceMotion) G.shake = 0.25;
      burst(b.x, top, feathers(map === 'garden' ? 'hoover' : map === 'staden' ? 'turkey' : 'goose'), 14, 260);
      popup(b.x, top - 20, S().bossHit, '#ffe66b', 20);
      if (b.hp <= 0) return bossDefeated();
      b.state = 'retreat'; G.invuln = Math.max(G.invuln, 0.8);
    } else if (b.state !== 'retreat') ouch('boss', pick(S().quips.boss));
  }
}
function fireProj(b) {
  if (map === 'weiher') { const high = Math.random() < 0.5; G.projs.push({x: b.x - 30, ry: high ? -96 : -18, vx: -300, vy: 0, g: 0, r: 10}); }
  else { G.projs.push({x: b.x - 40, ry: -40, vx: -rand(240, 300), vy: -rand(300, 420), g: 900, r: 10, lob: true}); }
  SFX.honk();
}
function bossDefeated() {
  const b = G.boss; G.bosses++;
  const pts = 500 * G.bosses; G.bonus += pts;
  burst(b.x, b.ry - b.h / 2, ['#ffd23f', '#ff8fb1', '#8fe3ff', '#ffffff', '#9be15d'], 40, 360);
  popup(b.x, b.ry - b.h - 30, '+' + pts, '#ffe66b', 24);
  G.shield = 0; G.lives = Math.min(MAX_LIVES, Math.max(3, G.lives + 1)); SFX.life();
  G.banner = {text: S().bossDown(M().boss), life: 2.8};
  SFX.bossDown();
  G.boss = null; G.arena = null; G.arenaDone = false; G.nextBossM += 1000; G.target = G.base;
  G.projs = [];
  playSong(map);
}

// ---------------- update ----------------
const box = e => ({x: e.x - e.w / 2, y: e.ry - e.h, w: e.w, h: e.h});
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function update(rdt) {
  const g = G, d = g.dog;
  if (g.bossIntro) { g.bossIntro.t += rdt; return; }
  g.zen = Math.max(0, g.zen - rdt);
  const dt = rdt * (g.zen > 0 ? 0.6 : 1);
  g.t += dt;
  if (!g.attract) {
    g.base = Math.min(Math.min(420, 320 + 30 * g.bosses), g.base + 1.7 * dt);
    if (!g.boss) g.target = g.base;
    g.rideAt -= dt; g.omaAt -= dt;
  }
  const zoomMul = g.zoom > 0 ? 1.35 : 1;
  g.speed += (g.target * zoomMul - g.speed) * Math.min(1, dt * (g.boss ? 3 : 1.5));
  if (Math.abs(g.speed) < 2 && g.boss) g.speed = 0;
  g.scroll += g.speed * dt;
  const x = dogX();

  // boss arena trigger
  if (g.arena && !g.boss && !g.arenaDone && x >= g.arena.x) { g.arenaDone = true; startBoss(); }

  // dog physics with platforms, pits and swimming
  d.prevY = d.ry;
  if (g.attract) { d.ry = 0; d.vy = 0; d.onGround = true; }
  else {
    d.vy += GRAV * dt;
    if (char === 'fluffin' && g.holding && d.vy > 0 && d.jumps >= 1 && d.glide > 0 && !g.ride) { d.vy = Math.min(d.vy, 150); d.glide -= dt; d.gliding = true; } else d.gliding = false;
    d.ry += d.vy * dt;
    let landed = false;
    if (d.vy >= 0) {
      for (const p of g.plats) {
        if (x + 22 < p.x || x - 16 > p.x + p.w) continue;
        if (d.prevY <= p.top + 1 && d.ry >= p.top) {
          d.ry = p.top; landed = true;
          if (p.bouncy) { d.vy = -1060; d.jumps = 1; d.onGround = false; landed = false; SFX.boing(); popup(x, p.top - 40, T('boing'), '#9fdcff'); p.squish = 0.25; break; }
          break;
        }
      }
    }
    const pit = pitAt(x) && pitAt(x + 6);
    if (!landed && d.ry >= 0 && !pit) { if (d.prevY > 2 && !d.swim) { /* came out of the water */ } landed = true; d.ry = 0; }
    if (!landed && pit && d.ry >= 10) {
      if (!d.swim) {
        d.swim = 1.0; splash(x); SFX.splash();
        popup(x, -60, T('splash'), '#cfeeff', 18);
        if (g.ride) dropRide(S().rides[g.ride].bail); else ouch('pit', S().paddle);
        if (state !== 'play') return;
      }
      d.ry = 10; d.vy = 0; d.jumps = 0; landed = true;
    }
    if (landed) {
      if (!d.onGround && d.vy > 450) { dust(x); d.squash = 0.12; }
      if (!d.onGround) g.combo = 0;
      if (d.vy >= 0) { d.vy = 0; d.jumps = 0; d.onGround = true; d.coyote = 0.08; d.glide = 0.9; }
    } else { d.onGround = false; d.coyote -= dt; }
    if (d.swim > 0 && !pit) d.swim = 0;
    if (g.jumpBuffer > 0) { g.jumpBuffer -= dt; if (d.onGround) { g.jumpBuffer = 0; tryJump(); } }
  }
  d.run += dt * Math.max(0.35, g.speed / 230);
  d.squash = Math.max(0, d.squash - dt);
  g.invuln = Math.max(0, g.invuln - rdt);
  g.shake = Math.max(0, g.shake - rdt);
  g.flash = Math.max(0, g.flash - rdt);
  if (g.zoom > 0) { g.zoom -= dt; if (g.zoom <= 0) { g.zoom = 0; popup(x + 20, d.ry - 90, T('zoomOver'), '#fff6e4'); g.invuln = Math.max(g.invuln, 0.8); } }
  if (g.ride) { g.rideT -= dt; if (g.rideT <= 0) dropRide(S().rides[g.ride].nap); }
  if (g.rideSpawned && g.rideAt <= -20) { g.rideSpawned = false; g.rideAt = rand(24, 36); }
  if (g.omaSpawned && g.omaAt <= -25) { g.omaSpawned = false; g.omaAt = rand(28, 40); }

  genAhead();
  updateBoss(dt);
  if (state !== 'play' && !g.attract) return;

  // enemies
  const db = dogBox();
  for (const e of g.enemies) {
    if (e.dead) {
      e.dt -= dt;
      if (e.dead === 'fly') { e.x += e.fvx * dt; e.ry += e.fvy * dt; e.fvy += 1300 * dt; e.rot += 9 * dt; }
      else if (e.dead === 'sink') { e.ry += 60 * dt; }
      continue;
    }
    e.f += dt * (e.k === 'high' ? 12 : 8);
    if (e.slide) {
      e.x += (g.speed + 380) * dt;
      for (const o of g.enemies) if (o !== e && !o.dead && !o.slide && overlap(box(e), box(o))) knock(o, true);
      if (Math.random() < 0.4) g.parts.push({x: e.x - 18, ry: -4, vx: -rand(40, 120), vy: -rand(20, 120), g: 600, life: 0.3, max: 0.3, c: map === 'garden' ? '#9be15d' : '#bfefff', r: 1.6});
      continue;
    }
    e.x -= e.vx * dt;
    if (e.hitCD > 0) e.hitCD -= dt;
    if (e.k === 'pigeon') e.ry = Math.min(0, Math.sin(g.t * 9 + e.ph)) * 3;
    else if (e.k === 'high') e.ry = e.base + Math.sin(g.t * 4 + e.ph) * 7;
    else if (e.k === 'squirrel') {
      e.hop -= dt;
      if (e.hop <= 0 && e.ry >= 0) { e.vy = -330; e.hop = rand(0.7, 1.6); }
      e.vy += 1500 * dt; e.ry += e.vy * dt;
      if (e.ry > 0 && !pitAt(e.x)) { e.ry = 0; e.vy = 0; }
    } else if (e.k === 'goose') {
      if (!e.honked && e.x - g.scroll < W - 30) { e.honked = true; e.honkT = 0.5; if (!g.attract) SFX.honk(); }
      if (e.honkT > 0) e.honkT -= dt;
    }
    if (!flier(e.k) && e.ry >= -2 && pitAt(e.x) && e.k !== 'squirrel') { e.dead = 'sink'; e.dt = 0.6; splash(e.x); continue; }
    if (e.k === 'squirrel' && e.ry > 8) { e.dead = 'sink'; e.dt = 0.5; splash(e.x); continue; }
    if (g.attract) continue;
    if (overlap(db, box(e))) { hitEnemy(e); if (state !== 'play') return; }
  }
  // projectiles
  for (const p of g.projs) {
    p.x += (p.vx - 0) * dt; p.vy += p.g * dt; p.ry += p.vy * dt;
    if (p.lob && p.ry >= -8) { p.ry = -8; p.vy = 0; p.g = 0; p.vx = -180; }
    if (!p.dead && overlap(db, {x: p.x - p.r, y: p.ry - p.r, w: p.r * 2, h: p.r * 2})) { p.dead = true; ouch('proj', pick(S().quips.proj)); if (state !== 'play') return; }
  }
  // items
  for (const it of g.items) {
    if (it.vx) { it.x += it.vx * dt; it.vy += 900 * dt; it.ry += it.vy * dt; if (it.ry >= -10) { it.ry = -10; it.vx = 0; it.vy = 0; } }
    if (it.taken || g.attract) continue;
    const r = it.kind === 'ride' ? 26 : 12;
    if (overlap(db, {x: it.x - r, y: it.ry - r * (it.kind === 'ride' ? 2 : 1), w: r * 2, h: r * 2})) collect(it);
  }
  // npcs (Oma Doris, runaway rides)
  for (const n of g.npcs) {
    n.t += dt; n.f = (n.f || 0) + dt * 6;
    if (n.k === 'flee') { n.x -= 260 * dt; continue; }
    if (n.k === 'oma') {
      if (n.state === 'walk') { n.x -= 30 * dt; if (n.x - x < W * 0.62 && !g.attract) { n.state = 'toss'; n.t = 0; } }
      else if (n.state === 'toss' && n.t > 0.45 && !n.tossed) {
        n.tossed = true;
        const tx = x + 40, flight = 1.0;
        addItem('omaApple', n.x - 12, -54, {vx: (tx - (n.x - 12)) / flight + g.speed, vy: -430});
        popup(n.x, -80, map === 'staden' ? (lang === 'de' ? 'Hauptsach gudd gess!' : 'Get that down you!') : (lang === 'de' ? 'Hier, mein Schatz!' : 'Here you go, love!'), '#ffe2b0', 14);
      } else if (n.state === 'toss' && n.t > 1.4) n.state = 'leave';
      else if (n.state === 'leave') n.x -= 20 * dt;
    }
  }
  // tidy up
  const left = g.scroll - 200;
  g.enemies = g.enemies.filter(e => e.x > left && e.x < g.scroll + W + 2400 && !(e.dead && e.dt <= 0));
  g.items = g.items.filter(it => !it.taken && it.x > left);
  g.plats = g.plats.filter(p => p.x + p.w > left);
  g.pits = g.pits.filter(p => p.x1 > left);
  g.npcs = g.npcs.filter(n => n.x > left);
  g.projs = g.projs.filter(p => !p.dead && p.x > left && p.x < g.scroll + W + 300);

  if (g.zoom > 0 && quality < 2) { g.trail.push({x: x - 6, ry: d.ry - (g.ride ? 48 : 30)}); if (g.trail.length > 16) g.trail.shift(); } else if (g.trail.length) g.trail.shift();
  if (!g.attract) {
    if (metres() >= g.nextMilestone) { popup(g.scroll + W / 2, -(GROUND - 96 - safe.t), g.nextMilestone + T('milestone'), '#cfeeff', 18); g.nextMilestone += 500; }
    const sky = skyAt(metres());
    if (sky.phase !== g.lastPhase) { g.lastPhase = sky.phase; g.banner = {text: phaseName(sky.phase), life: 2.6}; }
  }
  updateFx(rdt);
}
function updateFx(dt) {
  const g = G;
  for (const p of g.parts) { p.vy += p.g * dt; p.x += p.vx * dt; p.ry += p.vy * dt; p.life -= dt; }
  g.parts = g.parts.filter(p => p.life > 0);
  for (const p of g.pops) { p.life -= dt * 0.8; p.ry -= 30 * dt; }
  g.pops = g.pops.filter(p => p.life > 0);
  if (g.banner) { g.banner.life -= dt; if (g.banner.life <= 0) g.banner = null; }
  for (const p of g.plats) if (p.squish) p.squish = Math.max(0, p.squish - dt);
}

// ---------------- sky ----------------
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mixc(a, b, f) { const A = hex(a), B = hex(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',') + ')'; }
const SKY = {
  day: {top: '#7cc3ec', bot: '#e6f4dc', n: 0}, sun: {top: '#ef8a74', bot: '#ffd99e', n: 0.2},
  night: {top: '#0c1736', bot: '#2b3b69', n: 1}, dawn: {top: '#a3b4e6', bot: '#ffdcc0', n: 0.25}
};
const KEYS = [[0, 'day'], [700, 'day'], [800, 'sun'], [960, 'sun'], [1060, 'night'], [1380, 'night'], [1470, 'dawn'], [1540, 'dawn'], [1600, 'day']];
function skyAt(m) {
  const p = ((m % 1600) + 1600) % 1600;
  let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= p) i++;
  const [a, ka] = KEYS[i], [b, kb] = KEYS[i + 1], f = (p - a) / (b - a), A = SKY[ka], B = SKY[kb];
  return {top: mixc(A.top, B.top, f), bot: mixc(A.bot, B.bot, f), n: A.n + (B.n - A.n) * f, phase: f < 0.5 ? ka : kb};
}
const phaseName = p => p === 'day' ? M().day : S().sky[p];
const clouds = Array.from({length: 7}, (_, i) => ({x: i * 170 + rand(0, 80), yf: Math.random(), v: i % 3, s: rand(0.75, 1.25)}));
const stars = Array.from({length: 70}, () => ({x: Math.random(), y: Math.random(), r: rand(0.6, 1.7), tw: rand(0, 6)}));

// ---------------- render ----------------
function text(g, str, x, y, size, align, fill, font) {
  g.font = (font ? '' : '600 ') + size + 'px ' + (font || FONT_B);
  g.textAlign = align || 'left'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(11,20,8,.72)'; g.fillText(str, x + size * 0.06, y + size * 0.1);
  g.lineJoin = 'round'; g.lineWidth = Math.max(2.5, size / 5.5); g.strokeStyle = 'rgba(11,20,8,.85)'; g.strokeText(str, x, y);
  g.fillStyle = fill || '#fff6e4'; g.fillText(str, x, y);
}
function draw() {
  const g = mainCtx, gm = G;
  g.setTransform(R, 0, 0, R, 0, 0);
  if (gm.shake > 0) g.translate((Math.random() - 0.5) * 20 * gm.shake, (Math.random() - 0.5) * 20 * gm.shake);
  const m = gm.scroll / UPM, sky = skyAt(m), sc = gm.scroll;
  buildScenery(map, R);
  // sky
  g.fillStyle = lgrad(g, 0, 0, 0, GROUND, [[0, sky.top], [1, sky.bot]]); g.fillRect(-20, -20, W + 40, GROUND + 20);
  if (sky.n > 0.05) {
    for (const s of stars) { g.globalAlpha = sky.n * (0.55 + 0.45 * Math.sin(gm.t * 2 + s.tw)); g.fillStyle = '#ffffff'; g.fillRect(((s.x * W * 1.3 - sc * 0.02) % W + W) % W, 14 + s.y * (GROUND - 120), s.r, s.r); }
    g.globalAlpha = 1;
  }
  if (sky.n < 0.65) { const a = 1 - sky.n / 0.65, sx = W * 0.8, sy = 56 + sky.n * 90; g.globalAlpha = a * 0.35; circ(g, sx, sy, 36, '#fff3b0'); g.globalAlpha = a; circ(g, sx, sy, 21, '#fff1a8'); g.globalAlpha = 1; }
  if (sky.n > 0.45) { const a = (sky.n - 0.45) / 0.55; g.globalAlpha = a; circ(g, W * 0.22, 58, 15, '#f4f1dc'); circ(g, W * 0.22 - 4, 55, 3, '#dcd8c0'); circ(g, W * 0.22 + 5, 62, 2.2, '#dcd8c0'); g.globalAlpha = 1; }
  g.globalAlpha = 0.95 - sky.n * 0.6;
  for (const c of clouds) { const x = ((c.x - sc * 0.06) % (W + 240) + W + 240) % (W + 240) - 120, y = 30 + c.yf * Math.max(40, GROUND - 190); blit(g, cloudSprite(c.v, R), x, y, c.s); }
  g.globalAlpha = 1;
  // parallax layers with a haze that follows the sky colour
  const [far, mid, near] = LAYERS;
  drawLayer(g, far, sc, W, GROUND);
  g.globalAlpha = 0.26; g.fillStyle = sky.bot; g.fillRect(-20, -20, W + 40, GROUND + BELOW + 20); g.globalAlpha = 1;
  drawLayer(g, mid, sc, W, GROUND);
  midLive(g, mid, sc, sky);
  const lm = landmarkSprite(map, R);
  if (lm) { const span = 1900, par = 0.45, lx = (((W * 0.62 + 300 - sc * par) % span) + span) % span - 300; if (lx > -200 && lx < W + 200) blit(g, lm, lx, GROUND - 2); }
  g.globalAlpha = 0.09; g.fillStyle = sky.bot; g.fillRect(-20, -20, W + 40, GROUND + 20); g.globalAlpha = 1;
  drawLayer(g, near, sc, W, GROUND);
  nearLive(g, near, sc);
  // ground and water
  drawGround(g, sc);
  // platforms
  for (const p of gm.plats) {
    const sx = p.x - sc; if (sx > W + 20 || sx + p.w < -20) continue;
    const bob = p.floating ? Math.sin(gm.t * 2.4 + p.x) * 1.5 : 0, sq = p.squish ? p.squish * 14 : 0;
    blit(g, platformSprite(p.kind, Math.round(p.w), R), sx, GROUND + p.top + bob + sq * 0.3);
  }
  // night: tint the world behind the characters, then light the lamps
  if (sky.n > 0.01) {
    g.fillStyle = 'rgba(16,24,60,' + (sky.n * 0.38).toFixed(3) + ')'; g.fillRect(-20, -20, W + 40, H + 40);
    if (quality < 2) {
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = sky.n * 0.75;
      const gl = glowSprite(R, 'rgba(255,214,130,.55)');
      for (const [x, y, s] of liveLamps) blit(g, gl, x, GROUND + y, s || 1);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
  }
  // items
  for (const it of gm.items) {
    const sx = it.x - sc; if (sx < -40 || sx > W + 40) continue;
    const y = GROUND + it.ry + (it.vx ? 0 : Math.sin(gm.t * 4 + it.ph) * 2.5);
    if (it.kind === 'ride') { drawRideIdle(g, sx, GROUND, gm.t); continue; }
    if (it.kind === 'gold') { g.globalAlpha = 0.5 + Math.sin(gm.t * 6) * 0.2; blit(g, glowSprite(R, 'rgba(255,230,107,.9)'), sx, y, 0.42); g.globalAlpha = 1; }
    if (it.kind === 'sock' || it.kind === 'rare' || it.kind === 'lickmat') { g.globalAlpha = 0.35; blit(g, glowSprite(R, 'rgba(255,255,255,.8)'), sx, y, 0.3); g.globalAlpha = 1; }
    const art = it.kind === 'row' ? ART_ROW[map] : it.kind === 'arc' ? ART_ARC[map] : it.kind === 'rare' ? ART_RARE[map] : it.kind === 'omaApple' && map === 'staden' ? 'giftLyoner' : it.kind;
    blit(g, itemSprite(art, art === 'apple' || art === 'sock' ? it.v : 0, R), sx, y);
  }
  // npcs
  for (const n of gm.npcs) {
    const sx = n.x - sc; if (sx < -80 || sx > W + 80) continue;
    if (n.k === 'oma') blit(g, (map === 'staden' ? kalleSprite : omaSprite)(Math.floor(n.f) % 4, n.state === 'toss' && n.t < 0.8, R), sx, GROUND);
    else drawRideRun(g, n.ride, sx, GROUND, gm.t * 2, true);
  }
  // enemies
  for (const e of gm.enemies) {
    const sx = e.x - sc; if (sx < -60 || sx > W + 60) continue;
    const art = SKIN[map][e.k], f = Math.floor(e.f) % 4, s = enemySprite(art, e.slide ? Math.floor(gm.t * 20) % 4 : f, e.angry ? 'angry' : '', R);
    const y = GROUND + e.ry + (flier(e.k) ? e.h / 2 : 0);
    if (e.dead === 'squash') { g.save(); g.globalAlpha = Math.max(0, e.dt / 0.45); g.translate(sx, GROUND + e.ry); g.scale(1.3, 0.35); blit(g, s, 0, 0); g.restore(); }
    else if (e.dead === 'fly') { g.save(); g.translate(sx, y - e.h / 2); g.rotate(e.rot); blit(g, s, 0, e.h / 2); g.restore(); }
    else if (e.dead === 'sink') { g.save(); g.beginPath(); g.rect(sx - 60, 0, 120, GROUND + 6); g.clip(); blit(g, s, sx, y); g.restore(); }
    else {
      blit(g, s, sx, y);
      if (e.honkT > 0) text(g, T('honkSmall'), sx - 30, y - e.h - 10, 11, 'center', '#ffe0d8');
      if (e.slide) { g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(sx - 26 - i * 6, y - 10 + i * 4); g.lineTo(sx - 40 - i * 10, y - 10 + i * 4); g.stroke(); } }
    }
  }
  // boss
  if (gm.boss) {
    const b = gm.boss, sx = b.x - sc;
    const s = bossSprite(map, Math.floor(b.f) % 4, b.flash > 0 && Math.floor(gm.t * 20) % 2 ? 'hurt' : '', R);
    ellipse0(g, sx, GROUND + 3, b.w * 0.7, 6, 'rgba(0,0,0,.18)');
    blit(g, s, sx, GROUND + b.ry);
    if (b.warn && Math.floor(gm.t * 8) % 2 === 0) { const wy = GROUND + b.ry - b.h - 34; circ(g, sx, wy, 15, '#ff4d5e'); g.lineWidth = 3; g.strokeStyle = '#fff6e4'; g.stroke(); text(g, '!', sx, wy + 1, 22, 'center', '#fff6e4', FONT_D); }
  }
  for (const p of gm.projs) blit(g, projSprite(map, R), p.x - sc, GROUND + p.ry);
  // rainbow trail
  gm.trail.forEach((p, i) => { g.globalAlpha = (i / gm.trail.length) * 0.55; g.fillStyle = 'hsl(' + ((i * 24 + gm.t * 500) % 360) + ',90%,65%)'; g.beginPath(); g.arc(p.x - sc, GROUND + p.ry, 4 + i * 0.6, 0, TAU); g.fill(); });
  g.globalAlpha = 1;
  drawPlayer(g);
  // particles
  for (const p of gm.parts) { g.globalAlpha = Math.max(0, p.life / p.max); g.fillStyle = p.c; g.beginPath(); g.arc(p.x - sc, GROUND + p.ry, p.r, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  if (gm.zen > 0) { g.fillStyle = 'rgba(120,230,220,' + (0.08 + Math.sin(gm.t * 3) * 0.03).toFixed(3) + ')'; g.fillRect(-20, -20, W + 40, H + 40); }
  if (gm.flash > 0) { g.fillStyle = 'rgba(255,80,80,' + (gm.flash * 0.6).toFixed(3) + ')'; g.fillRect(-20, -20, W + 40, H + 40); }
  if (state !== 'menu') drawHUD(g);
  if (gm.bossIntro && state === 'play') drawBossIntro(g);
}
function ellipse0(g, x, y, rx, ry, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); }
let liveLamps = [];
function midLive(g, L, sc, sky) {
  liveLamps = [];
  eachTile(L, sc, W, (i, v, x) => {
    const ex = Scenery.ex.mid[v];
    ex.sails.forEach(([sx, sy]) => drawSails(g, x + sx, GROUND + sy, G.t * 0.9));
    ex.smoke.forEach(([sx, sy]) => smokePuffs(g, x + sx, GROUND + sy));
    ex.boats.forEach(([bx, by, kind], j) => {
      const xx = x + bx, yy = GROUND + by + Math.sin(G.t * 1.8 + j * 2) * 1.2;
      if (xx < -40 || xx > W + 40) return;
      if (kind < 0.45) swimSwan(g, xx + Math.sin(G.t * 0.4 + j) * 12, yy);
      else { g.save(); g.translate(xx, yy - 6); g.scale(0.6, 0.6); blit(g, platformSprite(map === 'staden' ? 'rowboat' : 'pedalo', 60, R), -30, 0); g.restore(); }
    });
    ex.lamps.forEach(([lx, ly, s]) => liveLamps.push([x + lx, ly, (s || 1) * 0.6]));
    if (ex.rail !== null && map === 'weiher' && v === 0) {
      const tx = x + 1400 - ((G.t * 80) % 1800);
      if (tx > -170 && tx < W + 20) drawTrain(g, tx, GROUND + ex.rail, sky.n);
    }
    if (map === 'staden' && v === 0) {
      const tx = x - 200 + ((G.t * 55) % 1700);
      if (tx > -170 && tx < W + 20) drawTram(g, tx, GROUND + ex.rail, sky.n);
      const bx = x + 1300 - ((G.t * 14) % 1600);
      if (bx > -120 && bx < W + 20) drawShip(g, bx, GROUND + ex.ship);
    }
  });
}
function nearLive(g, L, sc) {
  eachTile(L, sc, W, (i, v, x) => {
    const ex = Scenery.ex.near[v];
    ex.smoke.forEach(([sx, sy]) => smokePuffs(g, x + sx, GROUND + sy));
    ex.lamps.forEach(([lx, ly, s]) => liveLamps.push([x + lx, ly, s || 1]));
  });
}
function smokePuffs(g, x, y) {
  if (x < -60 || x > W + 60) return;
  for (let k = 0; k < 3; k++) { const p = (G.t * 0.5 + k / 3) % 1; g.fillStyle = 'rgba(232,232,232,' + (0.5 * (1 - p)).toFixed(3) + ')'; g.beginPath(); g.arc(x + k * 3 + p * 12, y - p * 46, 4 + p * 8, 0, TAU); g.fill(); }
}
function swimSwan(g, x, y) {
  ellipse0(g, x, y, 8, 3.5, '#f7f5ef'); tri(g, x + 6, y - 2, x + 11, y - 6, x + 8, y + 1, '#f7f5ef');
  g.beginPath(); g.moveTo(x - 4, y - 2); g.quadraticCurveTo(x - 9, y - 7, x - 6, y - 12); stroke(g, 2, '#f7f5ef');
  tri(g, x - 7, y - 12.5, x - 10, y - 11.5, x - 7, y - 10.6, '#f08a2a');
}
function drawTrain(g, x, y, night) {
  for (let c = 0; c < 2; c++) {
    const cx = x + c * 74;
    rr(g, cx, y - 15, 70, 14, c === 0 ? 5 : 3, '#d42a33'); g.fillStyle = '#f2f0ea'; g.fillRect(cx + 2, y - 6, 66, 2);
    for (let w = 0; w < 7; w++) rr(g, cx + 6 + w * 9, y - 12.5, 6, 5, 1.5, night > 0.5 ? '#ffe39a' : '#2f3f52');
    circ(g, cx + 12, y, 2.2, '#333333'); circ(g, cx + 58, y, 2.2, '#333333');
  }
}
function drawGround(g, sc) {
  const strip = groundStrip(map, R), C = GROUNDS[map];
  // solid segments between pits
  const pits = G.pits.filter(p => p.x1 > sc - 20 && p.x0 < sc + W + 20).sort((a, b) => a.x0 - b.x0);
  let cur = sc - 20;
  const segs = [];
  for (const p of pits) { if (p.x0 > cur) segs.push([cur, p.x0]); cur = Math.max(cur, p.x1); }
  if (cur < sc + W + 20) segs.push([cur, sc + W + 20]);
  for (const [a, b] of segs) {
    const x0 = a - sc, x1 = b - sc;
    g.save(); g.beginPath(); g.rect(x0, GROUND - 8, x1 - x0, H - GROUND + 16); g.clip();
    const off = ((sc % 192) + 192) % 192;
    for (let x = -off; x < W + 192; x += 192) { if (x + 192 < x0 || x > x1) continue; g.drawImage(strip, x, GROUND - 4, 193, 54); }
    if (H - GROUND > 50) { g.fillStyle = C.deep; g.fillRect(x0, GROUND + 50, x1 - x0, H - GROUND); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = GROUND + 76; y < H; y += 34) g.fillRect(x0, y, x1 - x0, 3); }
    g.restore();
  }
  // water
  for (const p of pits) {
    const x0 = p.x0 - sc, x1 = p.x1 - sc, wl = GROUND + 6;
    if (map === 'garden') {
      rr(g, x0 - 8, GROUND - 2, 12, 10, 2, '#e7e2d8'); rr(g, x1 - 4, GROUND - 2, 12, 10, 2, '#e7e2d8');
      g.fillStyle = lgrad(g, 0, wl, 0, H, [[0, '#5ec9ec'], [1, '#2378b5']]); g.fillRect(x0 + 2, wl, x1 - x0 - 4, H - wl);
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1; for (let y = wl + 12; y < Math.min(H, wl + 60); y += 12) { g.beginPath(); g.moveTo(x0 + 2, y); g.lineTo(x1 - 2, y); g.stroke(); }
      seg(g, x0 + 8, GROUND - 14, x0 + 8, GROUND + 26, 2, '#cfd5da'); seg(g, x0 + 16, GROUND - 14, x0 + 16, GROUND + 26, 2, '#cfd5da');
      g.beginPath(); g.arc(x0 + 12, GROUND - 14, 4, Math.PI, 0); stroke(g, 2, '#cfd5da');
    } else {
      const wet = map === 'weiher' || map === 'staden', top = map === 'staden' ? '#7fb6cf' : wet ? '#7fbcd9' : '#7fae9a', bot = map === 'staden' ? '#3f7e9e' : wet ? '#2f6f96' : '#3f6e5a';
      g.fillStyle = lgrad(g, 0, wl, 0, H, [[0, top], [1, bot]]); g.fillRect(x0, wl, x1 - x0, H - wl);
      for (const ex of [x0, x1]) { ellipse0(g, ex, GROUND + 6, 10, 6, wet ? '#8a8a82' : '#6b5a3e'); ellipse0(g, ex, GROUND + 2, 7, 4, wet ? '#a9a99f' : '#5a9842'); }
    }
    g.beginPath(); g.moveTo(x0, wl);
    for (let x = x0; x <= x1; x += 6) g.lineTo(x, wl + Math.sin((x + sc) * 0.08 + G.t * 3) * 1.4);
    stroke(g, 1.6, 'rgba(255,255,255,.75)');
  }
}
function drawRideIdle(g, x, y, t) { drawRideRun(g, rideKind(), x, y, 0, false, true); }
function drawRideRun(g, kind, x, y, t, flip, idle) {
  const f = Math.floor(t * 4) % 4;
  if (kind === 'capy') blit(g, capySprite(idle ? 0 : f, R), x, y, 1.1, flip);
  else if (kind === 'marli') blit(g, dogSprite('marli', 'none', idle ? 'sit' : 'run', idle ? 0 : Math.floor(t * 8) % 8, R), x, y, 0.94, flip);
  else blit(g, dogSprite('fluffin', 'none', idle ? 'sit' : 'run', idle ? 0 : Math.floor(t * 8) % 8, R), x, y, 0.8, flip);
}
function drawPlayer(g) {
  const gm = G, d = gm.dog, x = DOGX, y = GROUND + d.ry;
  if (gm.invuln > 0 && Math.floor(gm.t * 14) % 2 === 0 && state === 'play') return;
  const air = !d.onGround && d.swim <= 0;
  const pose = air ? (d.gliding ? 'glide' : d.vy < 0 ? 'up' : 'down') : 'run', frame = air ? 0 : Math.floor(d.run * 8) % 8;
  const shadowK = Math.max(0.35, 1 - Math.max(0, -d.ry) / 230);
  if (!d.swim) ellipse0(g, x + 6, GROUND + 3, 30 * shadowK, 4.5 * shadowK, 'rgba(0,0,0,.17)');
  if (gm.zoom > 0) { g.globalAlpha = 0.6; blit(g, glowSprite(R, 'rgba(255,230,107,.9)'), x + 8, y - 38, 0.9); g.globalAlpha = 1; }
  if (d.swim > 0) { g.save(); g.beginPath(); g.rect(x - 80, 0, 160, GROUND + 14); g.clip(); }
  const sq = d.squash > 0 ? d.squash : 0;
  g.save(); g.translate(x, y); if (sq) g.scale(1 + sq * 1.2, 1 - sq * 1.2);
  if (gm.ride === 'capy') { blit(g, capySprite(Math.floor(d.run * 4) % 4, R), -4, 0, 1.15); blit(g, dogSprite(char, outfit, 'sit', 0, R), 2, -34, 0.78); }
  else if (gm.ride === 'marli') { blit(g, dogSprite('marli', 'none', air ? pose : 'run', frame, R), -6, 0, 0.98); blit(g, dogSprite(char, outfit, 'sit', 0, R), 6, -42, 0.74); }
  else {
    blit(g, dogSprite(char, outfit, pose, frame, R), 0, 0, char === 'marli' ? 0.94 : 1);
    if (gm.ride === 'fluffin') blit(g, dogSprite('fluffin', 'none', 'sit', 0, R), -4, -48, 0.62);
  }
  g.restore();
  if (d.swim > 0) { g.restore(); g.beginPath(); g.ellipse(x + 8, GROUND + 12, 34, 4, 0, 0, TAU); stroke(g, 1.6, 'rgba(255,255,255,.75)'); }
}

// ---------------- HUD ----------------
function plain(g, str, x, y, size, align, fill, font, weight) {
  g.font = (font ? '' : (weight || '500') + ' ') + size + 'px ' + (font || FONT_B);
  g.textAlign = align || 'left'; g.textBaseline = 'middle'; g.fillStyle = fill || '#fff6e4'; g.fillText(str, x, y);
}
function wrapLines(g, str, maxW) {
  const words = str.split(' '), out = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}
function drawBossIntro(g) {
  const it = G.bossIntro, a = Math.min(1, it.t * 4);
  g.globalAlpha = a * 0.62; g.fillStyle = '#09100a'; g.fillRect(-20, -20, W + 40, H + 40); g.globalAlpha = a;
  const pw = Math.min(520, W - 32), ph = Math.min(H - 24, 262), px = (W - pw) / 2, py = (H - ph) / 2 + (1 - a) * 16;
  rr(g, px, py + 5, pw, ph, 20, '#0c180e'); rr(g, px, py, pw, ph, 20, '#1a3020');
  g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.1)'; rrPath(g, px + 0.5, py + 0.5, pw - 1, ph - 1, 20); g.stroke();
  const artW = pw > 430 ? 150 : 0, tx = px + 20 + artW, tw = pw - 40 - artW;
  if (artW) {
    rr(g, px + 14, py + 14, artW - 6, ph - 28, 16, '#2c5232');
    const dm = BOSS_DIM[map], s = bossSprite(map, Math.floor(it.t * 6) % 4, '', R), sc = Math.min(1.1, (artW - 24) / (dm.w * (map === 'staden' ? 1.5 : map === 'garden' ? 1.2 : 1.5)), (ph - 60) / (dm.h * 1.3)), fy = map === 'garden' || map === 'staden' ? py + ph * 0.66 : py + ph - 40;
    ellipse0(g, px + 11 + artW / 2, fy + 2, dm.w * 0.55 * sc, 5, 'rgba(0,0,0,.25)');
    blit(g, s, px + 11 + artW / 2, fy, sc);
  }
  let y = py + 26;
  plain(g, S().bossEyebrow.toUpperCase(), tx, y, 11, 'left', '#d9f04a', null, '600'); y += 24;
  plain(g, M().boss, tx, y, 26, 'left', '#fff6e4', FONT_D); y += 28;
  g.font = '500 12.5px ' + FONT_B;
  const steps = S().bossSteps(G.boss ? G.boss.max : 3, M().proj);
  steps.forEach((st, i) => {
    const lines = wrapLines(g, st, tw - 26);
    circ(g, tx + 9, y + 1, 9, i === 3 ? '#f0b52a' : '#2d5034');
    plain(g, String(i + 1), tx + 9, y + 1.5, 11, 'center', i === 3 ? '#2a1c05' : '#d9f04a', null, '700');
    lines.forEach((l, k) => plain(g, l, tx + 26, y + k * 15, 12.5, 'left', '#e6efdf'));
    y += lines.length * 15 + 7;
  });
  const pulse = 0.7 + Math.sin(it.t * 5) * 0.3;
  g.globalAlpha = a * (it.t > 0.6 ? pulse : 0.35);
  const bw = Math.min(tw, 240), by = Math.min(py + ph - 30, y + 10);
  rr(g, tx, by - 15, bw, 30, 15, '#ff9fc4');
  plain(g, S().bossTap, tx + bw / 2, by, 13, 'center', '#2a0f1c', null, '600');
  g.globalAlpha = 1;
}
function drawHUD(g) {
  const gm = G, L = 14 + safe.l, Tp = 12 + safe.t;
  text(g, String(score()), L, Tp + 15, 30, 'left', '#fff6e4', FONT_D);
  text(g, metres() + ' m', L + 2, Tp + 40, 13, 'left', '#d9f04a');
  const slots = Math.max(3, gm.lives);
  for (let i = 0; i < slots; i++) blit(g, itemSprite(i < gm.lives ? 'heart' : 'heartEmpty', 0, R), L + 10 + i * 22, Tp + 60, 0.9);
  for (let i = 0; i < gm.shield; i++) blit(g, itemSprite('heartGold', 0, R), L + 10 + (slots + i) * 22, Tp + 60, 0.9 + Math.sin(gm.t * 6 + i) * 0.06);
  const y = Tp + 84;
  blit(g, itemSprite(ART_ARC[map], 0, R), L + 10, y, 0.7); text(g, String(gm.cakes), L + 24, y + 1, 13);
  blit(g, itemSprite(ART_ROW[map], 0, R), L + 62, y, 0.8); text(g, String(gm.balls), L + 74, y + 1, 13);
  blit(g, itemSprite('sock', 0, R), L + 112, y, 0.7); text(g, gm.sockSet + '/5', L + 122, y + 1, 13);
  if (ART_RARE[map]) { blit(g, itemSprite(ART_RARE[map], 0, R), L + 168, y, 0.65); text(g, String(gm.rare), L + 180, y + 1, 13); }
  let by = y + 22;
  const bar = (label, col, frac, c2) => {
    text(g, label, L, by, 12, 'left', col);
    rr(g, L + 66, by - 4, 82, 8, 4, 'rgba(11,20,8,.55)');
    g.fillStyle = c2 || col; rrPath(g, L + 66, by - 4, Math.max(8, 82 * frac), 8, 4); g.fill();
    by += 18;
  };
  if (gm.zoom > 0) bar(T('zoomLabel'), '#ffe66b', gm.zoom / 7, lgrad(g, L + 66, 0, L + 148, 0, [[0, '#ff6b8b'], [0.3, '#ffd23f'], [0.6, '#9be15d'], [1, '#6fd3ff']]));
  if (gm.zen > 0) bar(T('zenLabel'), '#9ff0e6', gm.zen / 6);
  if (gm.ride) bar(S().rides[gm.ride].label, '#ffe2b0', gm.rideT / 18, gm.ride === 'capy' ? '#c48a4f' : '#f0dcb8');
  if (gm.boss) {
    const b = gm.boss, bw = Math.min(280, W * 0.5), bx = W / 2 - bw / 2, bt = Tp + 6;
    text(g, M().boss, W / 2, bt + 4, 15, 'center', '#ffe0d8', FONT_D);
    rr(g, bx, bt + 14, bw, 11, 5.5, 'rgba(11,20,8,.6)');
    rr(g, bx + 2, bt + 16, Math.max(6, (bw - 4) * b.hp / b.max), 7, 3.5, '#ff5d7e');
    if (!gm.banner || gm.banner.life <= 0) text(g, b.warn ? S().bossWarn : S().bossTip, W / 2, bt + 40, 13, 'center', b.warn ? '#ff8f8f' : '#fff6e4');
  }
  for (const p of gm.pops) { g.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); text(g, p.text, p.x - gm.scroll, GROUND + p.ry, p.size, 'center', p.color); }
  g.globalAlpha = 1;
  if (gm.banner && !gm.boss) { g.globalAlpha = Math.min(1, gm.banner.life * 1.5, (2.6 - gm.banner.life) * 3); text(g, gm.banner.text, W / 2, Tp + 70, 22, 'center', '#fff6e4', FONT_D); g.globalAlpha = 1; }
  else if (gm.banner && gm.boss) { g.globalAlpha = Math.min(1, gm.banner.life * 1.5); text(g, gm.banner.text, W / 2, Tp + 58, 22, 'center', '#ffd0c4', FONT_D); g.globalAlpha = 1; }
}
