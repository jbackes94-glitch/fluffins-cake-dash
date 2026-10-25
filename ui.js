'use strict';
/* Menus, leaderboard, input and the main loop. */
const screens = {lang: $('langScreen'), menu: $('menuScreen'), pause: $('pauseScreen'), over: $('overScreen')};
const btnSound = $('btnSound'), btnFs = $('btnFs'), btnPause = $('btnPause');
const mapBtns = Array.from(document.querySelectorAll('.map-btn'));
const charBtns = Array.from(document.querySelectorAll('[data-char]'));
const tabBtns = Array.from(document.querySelectorAll('[data-tab]'));
const langBtns = Array.from(document.querySelectorAll('[data-lang]'));
const boardSegBtns = Array.from(document.querySelectorAll('[data-bmap]'));
const outfitsEl = $('outfits'), heroCv = $('hero'), heroLang = $('heroLang');
let tab = 'play', boardMap = map;

function showScreen(name) {
  for (const k in screens) screens[k].hidden = k !== name;
  btnPause.hidden = name !== null;
}

// ---------------- text ----------------
function renderTexts() {
  const L = S();
  document.documentElement.lang = lang === 'de' ? 'de' : 'en-GB';
  langBtns.forEach(b => { if (b.closest('#langSeg')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
  $('tabBtnPlay').textContent = L.tabs.play; $('tabBtnBoard').textContent = L.tabs.board; $('tabBtnHow').textContent = L.tabs.how;
  $('lblChar').textContent = L.charLabel; $('lblMap').textContent = L.mapLabel; $('lblOutfit').textContent = L.outfitLabel;
  $('charDescF').textContent = L.chars.fluffin.desc; $('charDescM').textContent = L.chars.marli.desc;
  mapBtns.forEach(b => { const m = STR[lang].maps[b.dataset.map]; b.querySelector('b').textContent = m.name; b.querySelector('small').textContent = m.desc; b.setAttribute('aria-pressed', String(b.dataset.map === map)); });
  charBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.char === char)));
  tabBtns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $('tabPlay').hidden = tab !== 'play'; $('tabBoard').hidden = tab !== 'board'; $('tabHow').hidden = tab !== 'how';
  $('startLbl').textContent = L.start;
  const b = bestOf(map); $('bestChip').innerHTML = ''; $('bestChip').append(document.createTextNode(L.best + ' '));
  const em = document.createElement('em'); em.textContent = b; $('bestChip').append(em); $('bestChip').hidden = !b;
  $('ovHint').innerHTML = L.hint; $('ovRotate').textContent = L.rotate; $('howHint').textContent = L.howHint;
  boardSegBtns.forEach(x => { x.textContent = x.dataset.bmap === 'common' ? 'Wimbledon' : x.dataset.bmap === 'weiher' ? 'Weiher' : x.dataset.bmap === 'staden' ? 'Staden' : (lang === 'de' ? 'Garten' : 'Garden'); x.setAttribute('aria-pressed', String(x.dataset.bmap === boardMap)); });
  $('lblNick').textContent = L.board.nick; $('nick').placeholder = L.board.nickPh;
  $('resumeBtn').textContent = L.resume; $('pauseMenuBtn').textContent = L.menu; $('againBtn').textContent = L.again; $('overMenuBtn').textContent = L.menu;
  $('pauseEyebrow').textContent = L.eyebrowPause; $('pauseTitle').textContent = L.pauseTitle; $('pauseBody').textContent = L.pauseBody;
  buildOutfits(); buildLegend(); renderBoard(); paintButtons();
}

// ---------------- outfits, legend, thumbnails, hero ----------------
function buildOutfits() {
  outfitsEl.textContent = '';
  OUTFITS.forEach(([o, need]) => {
    const locked = socksTotal < need;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'outfit';
    b.setAttribute('aria-pressed', String(o === outfit)); if (locked) b.setAttribute('aria-disabled', 'true');
    const c = document.createElement('canvas'); c.width = 112; c.height = 92;
    const nm = document.createElement('b'); nm.textContent = S().outfits[o];
    b.append(c, nm);
    if (locked) { const s = document.createElement('small'); s.textContent = S().locked(need - socksTotal); b.append(s); }
    b.addEventListener('click', e => { e.stopPropagation(); if (locked) { SFX.tick(); return; } outfit = o; store.set('fluffin-outfit', o); renderTexts(); });
    outfitsEl.append(b);
    const g = c.getContext('2d'), s = dogSprite(char, o, 'sit', 0, 1.1);
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (locked) g.globalAlpha = 0.45;
    const k = char === 'marli' ? 0.92 : 1;
    g.drawImage(s.c, 52 + s.x0 * 1.1 * k - (char === 'marli' ? 6 : 4), 92 + s.y0 * 1.1 * k + 2, s.w * 1.1 * k, s.h * 1.1 * k);
  });
}
const LEG_ART = {
  pigeon: ['en', 'pigeon'], duck: ['en', 'duck'], blackbird: ['en', 'blackbird'], squirrel: ['en', 'squirrel'], hedgehog: ['en', 'hedgehog'],
  goose: ['en', 'goose'], swan: ['en', 'swan'], gnome: ['en', 'gnome'], hoover: ['en', 'hoover'], cart: ['en', 'cart'], mower: ['en', 'mower'],
  boar: ['en', 'boar'], heron: ['en', 'heron'], magpie: ['en', 'magpie'], fox: ['en', 'fox'],
  ball: ['it', 'ball'], cake: ['it', 'cake'], apple: ['it', 'apple'], fk: ['it', 'fk'], lyoner: ['it', 'lyoner'], treat: ['it', 'treat'], cheese: ['it', 'cheese'],
  liver: ['it', 'liver'], sock: ['it', 'sock'], gold: ['it', 'gold'], lickmat: ['it', 'lickmat'], oma: ['oma'], capy: ['capy'], marli: ['marli'],
  plat_bench: ['plat', 'bench'], plat_jetty: ['plat', 'pedalo'], plat_carport: ['plat', 'trampoline'], pit: ['pit'],
  boss: ['boss', 'common'], boss_swan: ['boss', 'weiher'], boss_mower: ['boss', 'garden'], boss_nutria: ['boss', 'staden'],
  nutria: ['en', 'nutria'], nilgans: ['en', 'nilgans'], scooter: ['en', 'scooter'], schwenker: ['it', 'schwenker'], grumbeer: ['it', 'grumbeer'], maggi: ['it', 'maggi'], kalle: ['kalle'], plat_bridge: ['plat', 'rowboat']
};
function buildLegend() {
  const ul = $('legend'); ul.textContent = '';
  M().legend.forEach(([id, title, desc]) => {
    const li = document.createElement('li'), c = document.createElement('canvas'); c.width = 96; c.height = 96;
    const d = document.createElement('div'), b = document.createElement('b'), sp = document.createElement('span');
    b.textContent = title; sp.textContent = desc; d.append(b, sp); li.append(c, d); ul.append(li);
    const g = c.getContext('2d'), a = LEG_ART[id] || ['it', 'sock'];
    let s, k = 1, oy = 0;
    const r = 2.2;
    if (a[0] === 'en') { s = enemySprite(a[1], 0, '', r); }
    else if (a[0] === 'it') { s = itemSprite(a[1], 0, r); k = 1.35; }
    else if (a[0] === 'oma') { s = omaSprite(0, false, r); k = 0.75; }
    else if (a[0] === 'kalle') { s = kalleSprite(0, false, r); k = 0.72; }
    else if (a[0] === 'capy') { s = capySprite(0, r); k = 0.85; }
    else if (a[0] === 'marli') { s = dogSprite('marli', 'none', 'sit', 0, r); k = 0.52; }
    else if (a[0] === 'plat') { s = platformSprite(a[1], 60, r); k = 0.7; }
    else if (a[0] === 'boss') { s = bossSprite(a[1], 0, '', 1); k = 0.32; }
    if (a[0] === 'pit') { g.fillStyle = lgrad(g, 0, 40, 0, 96, [[0, '#7fbcd9'], [1, '#2f6f96']]); g.fillRect(14, 46, 68, 50); g.fillStyle = '#5a9842'; g.fillRect(0, 40, 16, 56); g.fillRect(80, 40, 16, 56); return; }
    const sc = (a[0] === 'boss' ? 1 : r) * k;
    const cx = 48 - (s.x0 + s.w / 2) * sc, cy = 48 - (s.y0 + s.h / 2) * sc;
    g.drawImage(s.c, cx + s.x0 * sc, cy + s.y0 * sc, s.w * sc, s.h * sc);
  });
}
function drawThumbs() { mapBtns.forEach(b => drawThumb(b.querySelector('canvas'), b.dataset.map)); }
function drawHero(c) {
  const g = c.getContext('2d'), W2 = c.width, H2 = c.height, k = W2 / 480, r = 2.7 * k;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W2, H2);
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(W2 * 0.5, H2 * 0.86, 120 * k, 12 * k, 0, 0, TAU); g.fill();
  const t = performance.now() / 1000, s = dogSprite(char, outfit, 'run', Math.floor(t * 9) % 8, r);
  const sc = char === 'marli' ? 0.92 : 1;
  g.save(); g.translate(W2 * 0.46, H2 * 0.87); g.scale(sc, sc); g.drawImage(s.c, s.x0 * r, s.y0 * r, s.w * r, s.h * r); g.restore();
}

// ---------------- leaderboard (shared db) ----------------
let db = null, userCap = null, myId = null, canWrite = null, boardDocs = [], boardNames = {}, boardState = 'loading', synced = false;
let nick = store.get('fluffin-nick') || '';
const mine = () => boardDocs.find(d => d.id === myId) || null;
async function initBoard() {
  if (!(window.claude && window.claude.use)) { boardState = 'off'; renderBoard(); return; }
  try { [db, userCap] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); } catch (e) { db = null; }
  if (!db) { boardState = 'off'; renderBoard(); return; }
  if (userCap) {
    try { myId = await userCap.id(); } catch (e) { myId = null; }
    try { canWrite = await userCap.can('data.write'); } catch (e) { canWrite = null; }
    if (!nick) { try { const n = await userCap.name(); if (n) nick = n.split(' ')[0].slice(0, 16); } catch (e) {} }
  }
  if (!myId) canWrite = false;
  $('nick').value = nick;
  db.collection('scores').onSnapshot(snap => {
    boardDocs = snap.docs.filter(d => d.exists).map(d => Object.assign({id: d.id}, d.data()));
    boardState = 'ready'; resolveNames(); renderBoard();
    if (!synced) { synced = true; syncLocalBests(); }
  }, () => { boardState = 'error'; renderBoard(); });
  renderBoard();
}
async function resolveNames() {
  if (!userCap) return;
  const ids = boardDocs.filter(d => !d.nick).map(d => d.id);
  if (!ids.length) return;
  try { boardNames = await userCap.profiles(ids) || {}; renderBoard(); } catch (e) {}
}
async function writeMine(patch) {
  if (!db || !myId || canWrite === false) return;
  const m = mine() || {};
  const data = {nick: (nick || '').slice(0, 16), common: +m.common || 0, weiher: +m.weiher || 0, garden: +m.garden || 0, staden: +m.staden || 0, updatedAt: Date.now()};
  Object.assign(data, patch);
  if (m.nick === data.nick && m.common === data.common && m.weiher === data.weiher && m.garden === data.garden && m.staden === data.staden) return;
  try { await db.doc('scores/' + myId).set(data); } catch (e) { if (e && e.code === 'invalid_argument') { canWrite = false; renderBoard(); } }
}
function syncLocalBests() {
  const m = mine() || {}, patch = {};
  for (const k of MAPS) if (bestOf(k) > (+m[k] || 0)) patch[k] = bestOf(k);
  if (Object.keys(patch).length) writeMine(patch);
}
function familyTop(m, excludeMe) { return boardDocs.reduce((a, d) => (excludeMe && d.id === myId) ? a : Math.max(a, +d[m] || 0), 0); }
function fillBoard(ol, m, limit) {
  const L = S().board;
  const rows = boardDocs.filter(d => (+d[m] || 0) > 0).sort((a, b) => (+b[m] || 0) - (+a[m] || 0)).slice(0, limit);
  ol.textContent = '';
  for (const d of rows) {
    const li = document.createElement('li'); if (d.id === myId) li.className = 'me';
    const who = document.createElement('span'); who.className = 'who';
    who.textContent = (d.nick || (boardNames[d.id] && boardNames[d.id].name) || L.someone) + (d.id === myId ? L.you : '');
    const pts = document.createElement('span'); pts.className = 'pts'; pts.textContent = +d[m] || 0;
    li.append(who, pts); ol.append(li);
  }
  return rows.length;
}
function renderBoard() {
  const L = S().board;
  if (boardState === 'off') {
    const ol = $('boardList'); ol.textContent = '';
    const b = bestOf(boardMap);
    if (b) { const li = document.createElement('li'); li.className = 'me'; const w = document.createElement('span'); w.className = 'who'; w.textContent = (nick || (lang === 'de' ? 'Du' : 'You')); const p = document.createElement('span'); p.className = 'pts'; p.textContent = b; li.append(w, p); ol.append(li); }
    $('boardNote').textContent = L.off; $('boardNote').hidden = false; $('nameRow').hidden = false; return;
  }
  const n = fillBoard($('boardList'), boardMap, 10);
  let note = boardState === 'off' ? L.off : boardState === 'error' ? L.error : boardState === 'loading' ? L.loading : !n ? L.empty : '';
  if (boardState === 'ready' && canWrite === false) note = (note ? note + ' ' : '') + L.read;
  $('boardNote').textContent = note; $('boardNote').hidden = !note;
  $('nameRow').hidden = false;
}
$('nick').addEventListener('change', () => { nick = $('nick').value.trim().slice(0, 16); store.set('fluffin-nick', nick); if (mine()) writeMine({}); renderBoard(); });

// ---------------- flow ----------------
function toMenu() {
  state = 'menu'; stopSong();
  newRun(true);
  showScreen(langChosen ? 'menu' : 'lang');
  renderTexts();
}
function startGame() {
  audioInit();
  if (coarse && fsSupported && !isFS()) enterFS(true);
  state = 'play'; quality = Math.min(quality, 1); perf.ema = 16; perf.slowFor = 0;
  newRun(false);
  G.banner = {text: M().day, life: 2.6};
  showScreen(null);
  playSong(map);
  last = performance.now();
}
function gameOver() {
  state = 'over'; G.holding = false; stopSong(); SFX.over();
  const s = score(), prev = bestOf(map), isBest = s > prev;
  if (isBest) store.set(BEST_KEYS[map], s);
  socksTotal += G.socks; store.set('fluffin-socks-total', socksTotal);
  const fam = boardState === 'ready' && s > familyTop(map, true) && s > 0;
  const m = mine() || {};
  if (s > (+m[map] || 0)) writeMine({[map]: s});
  const L = S();
  $('overEyebrow').textContent = L.eyebrowOver + ' · ' + M().name;
  $('overTitle').textContent = fam ? L.familyBest : isBest ? L.newBest : pick(T('overTitles') || L.overTitles || ['Fluffin needs a lie-down']);
  $('overBody').textContent = M().overBody(metres());
  const st = $('overStats'); st.textContent = '';
  const add = (v, key, hot) => { const li = document.createElement('li'); if (hot) li.className = 'hot'; const b = document.createElement('b'); b.textContent = v; li.append(b, document.createTextNode(stLabel(key))); st.append(li); };
  add(s, 'score', isBest || fam); add(Math.max(s, prev), 'best'); add(G.cakes, 'cake'); add(G.balls, 'balls');
  if (ART_RARE[map]) add(G.rare, 'rare');
  add(G.socks, G.socks === 1 ? 'sock' : 'socks'); add(G.booped, 'boops'); if (G.bosses) add(G.bosses, 'bosses');
  const ob = $('overBoard'); const n = boardState === 'ready' ? fillBoard(ob, map, 5) : 0; ob.hidden = !n;
  showScreen('over');
  $('againBtn').focus({preventScroll: true});
}
STR.en.overTitles = ['Fluffin needs a lie-down', 'Time for the Kältebad', 'Beaten by the birds', 'Off for a nap on the sofa'];
STR.de.overTitles = ['Fluffin braucht eine Pause', 'Zeit fürs Kältebad', 'Von den Vögeln besiegt', 'Ab aufs Sofa zum Nickerchen'];
function pause() {
  if (state !== 'play') return;
  state = 'paused'; G.holding = false; stopSong();
  showScreen('pause'); $('resumeBtn').focus({preventScroll: true});
}
function resume() { audioInit(); state = 'play'; showScreen(null); playSong(G.boss ? 'boss' : map); last = performance.now(); }

// ---------------- fullscreen and buttons ----------------
const root = document.documentElement;
const fsSupported = !!(root.requestFullscreen || root.webkitRequestFullscreen);
const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
const ICON = {
  fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  fsx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  on: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>'
};
function paintButtons() {
  const A = S().aria;
  btnSound.innerHTML = SND.muted ? ICON.off : ICON.on; btnSound.setAttribute('aria-label', SND.muted ? A.soundOn : A.soundOff);
  btnFs.innerHTML = isFS() ? ICON.fsx : ICON.fs; btnFs.setAttribute('aria-label', isFS() ? A.fsOut : A.fsIn);
  btnPause.setAttribute('aria-label', A.pause);
}
function enterFS(silent) {
  try {
    const p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root, {navigationUI: 'hide'});
    const lock = () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} };
    if (p && p.then) p.then(lock).catch(() => { btnFs.hidden = true; if (!silent && state === 'play') popup(G.scroll + W / 2, -100, T('noFs'), '#fff6e4'); });
    else lock();
  } catch (e) { btnFs.hidden = true; }
}
function toggleFS() { if (isFS()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } else enterFS(false); }
if (!fsSupported) btnFs.hidden = true;
const click = (el, fn) => el.addEventListener('click', e => { e.stopPropagation(); fn(e); });
click(btnFs, toggleFS);
click(btnSound, () => { setMuted(!SND.muted); store.set('fluffin-muted', SND.muted ? '1' : '0'); audioInit(); paintButtons(); if (!SND.muted) SFX.ball(); });
click(btnPause, pause);
click($('startBtn'), startGame);
click($('resumeBtn'), resume);
click($('againBtn'), startGame);
click($('pauseMenuBtn'), toMenu);
click($('overMenuBtn'), toMenu);
langBtns.forEach(b => click(b, () => { lang = b.dataset.lang; langChosen = true; store.set('fluffin-lang', lang); showScreen('menu'); renderTexts(); $('startBtn').focus({preventScroll: true}); }));
mapBtns.forEach(b => click(b, () => { if (map === b.dataset.map) return; map = b.dataset.map; boardMap = map; store.set('fluffin-map', map); newRun(true); renderTexts(); }));
charBtns.forEach(b => click(b, () => { char = b.dataset.char; store.set('fluffin-char', char); renderTexts(); }));
tabBtns.forEach(b => click(b, () => { tab = b.dataset.tab; renderTexts(); }));
boardSegBtns.forEach(b => click(b, () => { boardMap = b.dataset.bmap; renderTexts(); }));
document.addEventListener('fullscreenchange', () => { paintButtons(); resize(); });
document.addEventListener('webkitfullscreenchange', () => { paintButtons(); resize(); });

// ---------------- input ----------------
stage.addEventListener('pointerdown', e => {
  if (e.target.closest('button') || e.target.closest('.screen') || e.target.closest('input')) return;
  if (state === 'play') { e.preventDefault(); G.holding = true; tryJump(); }
});
const up = () => { if (G && G.holding) { G.holding = false; releaseJump(); } };
window.addEventListener('pointerup', up);
window.addEventListener('pointercancel', up);
stage.addEventListener('contextmenu', e => e.preventDefault());
const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
window.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (JUMP_KEYS.includes(e.code)) {
    if (state !== 'play' && document.activeElement && document.activeElement.tagName === 'BUTTON') return;
    e.preventDefault(); if (e.repeat) return;
    if (state === 'play') { G.holding = true; tryJump(); }
    else if (state === 'menu' && langChosen) startGame();
    else if (state === 'paused') resume();
    else if (state === 'over') startGame();
  } else if (e.code === 'KeyP' || e.code === 'Escape') { if (state === 'play') pause(); else if (state === 'paused' && e.code === 'KeyP') resume(); }
  else if (e.code === 'KeyF') { if (fsSupported) toggleFS(); }
  else if (e.code === 'KeyM') btnSound.click();
});
window.addEventListener('keyup', e => { if (JUMP_KEYS.includes(e.code)) up(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); stopSong(); } });
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 150));

// ---------------- main loop ----------------
let last = performance.now();
function loop(now) {
  const raw = now - last, dt = Math.min(0.05, raw / 1000); last = now;
  if (state === 'play') { update(dt); watchPerf(raw, dt); }
  else if (state === 'menu') { update(dt); }
  else updateFx(dt);
  draw();
  if (state === 'menu') { if (!langChosen) drawHero(heroLang); else if (tab === 'play') drawHero(heroCv); }
  requestAnimationFrame(loop);
}
resize();
newRun(true);
toMenu();
drawThumbs();
initBoard();
requestAnimationFrame(loop);
