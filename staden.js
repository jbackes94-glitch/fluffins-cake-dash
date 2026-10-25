'use strict';
/* Saarbrücker Staden: the promenade along the Saar. Art, scenery and the landmark for the fourth map.
   Loaded after art.js and scenery.js, before game.js. */

// ---------------- enemies ----------------
EN.nutria = (g, f) => {
  const b = Math.sin(f / 4 * TAU);
  g.beginPath(); g.moveTo(16, -7); g.quadraticCurveTo(28, -4 + b, 34, -9 + b); stroke(g, 3, '#6f5c52');
  seg(g, -9 + b * 3, -8, -11 + b * 4, 0, 4, '#4a3426'); seg(g, 9 - b * 3, -8, 11 - b * 4, 0, 4, '#4a3426');
  g.fillStyle = lgrad(g, 0, -24, 0, -2, [[0, '#9a7452'], [1, '#6e4f36']]); g.beginPath(); g.ellipse(2, -12, 17, 10.5, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(70,45,28,.45)'; g.lineWidth = 1; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-8 + k * 4.5, -20); g.quadraticCurveTo(-6 + k * 4.5, -16, -9 + k * 4.5, -12); g.stroke(); }
  seg(g, -5 - b * 3, -8, -7 - b * 4, 0, 4, '#5a4030'); seg(g, 6 + b * 3, -8, 8 + b * 4, 0, 4, '#5a4030');
  blob(g, -14, -15, 8, '#8a6646', '#a8835e');
  ell(g, -21, -12, 5, 4, 0, '#c9b29a'); circ(g, -25, -13.5, 1.6, '#2a1a10');
  rr(g, -23, -10, 2.6, 4.5, 0.8, '#ff9a1a'); rr(g, -20.6, -10, 2.6, 4.5, 0.8, '#ff9a1a');
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 0.6;
  for (const dy of [-1.5, 0, 1.5]) { g.beginPath(); g.moveTo(-22, -12 + dy); g.lineTo(-30, -13 + dy * 2); g.stroke(); }
  circ(g, -10, -22, 2.8, '#7a5a3e'); circ(g, -10, -22, 1.4, '#4a3426');
  circ(g, -16, -18, 1.6, '#140c08'); circ(g, -15.6, -18.4, 0.55, '#ffffff');
};
EN.nilgans = (g, f, st) => {
  const b = Math.sin(f / 4 * TAU) * 1.5, angry = st === 'angry';
  seg(g, -2, -10, -4 + b, 0, 2.5, '#e88a8a'); seg(g, 5, -10, 6 - b, 0, 2.5, '#e88a8a');
  g.fillStyle = lgrad(g, 0, -30, 0, -6, [[0, '#d8c3a6'], [1, '#b39a7c']]); g.beginPath(); g.ellipse(4, -18, 18, 11, 0, 0, TAU); g.fill();
  ell(g, 0, -12, 12, 5.5, 0, '#e9dcc6');
  ell(g, 8, -21, 12, 7, -0.15, '#8a5a3a'); ell(g, 3, -24, 6, 3.5, -0.15, '#f4f1ea'); rr(g, 10, -21, 9, 3, 1.5, '#2f7a5a');
  ell(g, 21, -21, 5, 3, 0.2, '#2a2420'); circ(g, 1, -16, 2.4, '#7a4a2e');
  g.beginPath(); g.moveTo(-8, -24); g.quadraticCurveTo(-15, -34 + b, -12, -42 + b); stroke(g, 6, '#e3d6c2');
  ell(g, -14, -44 + b, 7, 5.5, 0, '#ece2d2');
  ell(g, -15.5, -45 + b, 3.2, 2.6, 0, '#7a4a2e');
  tri(g, -20, -46 + b, -26, -43 + b, -20, -41 + b, '#e89a9a');
  circ(g, -16, -45.5 + b, 1.3, angry ? '#ff4a3a' : '#f2c14a');
  if (angry) { g.beginPath(); g.moveTo(-6, -56); g.lineTo(-2, -52); g.moveTo(-2, -56); g.lineTo(-6, -52); stroke(g, 2, '#ff5a4a'); }
};
EN.scooter = (g, f) => {
  // a runaway e-scooter, nobody on it
  for (const wx of [-15, 13]) { circ(g, wx, -4.5, 4.6, '#1f1f22'); circ(g, wx, -4.5, 1.8, '#9aa3ab'); }
  g.fillStyle = lgrad(g, 0, -10, 0, -4, [[0, '#33c2b0'], [1, '#1d8f80']]); rrPath(g, -15, -10, 30, 5, 2.5); g.fill();
  rr(g, -12, -10.6, 22, 1.4, 0.7, 'rgba(255,255,255,.45)');
  seg(g, -14, -8, -18, -38, 3, '#2a2d33');
  seg(g, -23, -38, -13, -38, 3, '#2a2d33'); rr(g, -25, -40, 4, 4, 1.5, '#111111');
  rr(g, -20.5, -32, 4, 3, 1, f % 2 ? '#fff3b0' : '#ffe27a');
  rr(g, 10, -12, 6, 3, 1.5, '#ff4a3a');
};
EN_BOX.nutria = [-32, -30, 36, 3];
EN_BOX.nilgans = [-30, -62, 30, 2];
EN_BOX.scooter = [-28, -44, 20, 2];
SKIN.staden = {pigeon: 'pigeon', high: 'high', turkey: 'nutria', squirrel: 'squirrel', hedgehog: 'hedgehog', goose: 'nilgans', hoover: 'scooter'};

// boss decoration: a miner's helmet with a lamp ("Glück auf!")
function drawGrubenhelm(g, f) {
  g.save(); g.translate(-36, -60 + Math.sin(f / 4 * TAU) * 1.2);
  g.fillStyle = lgrad(g, 0, -14, 0, 0, [[0, '#ffffff'], [1, '#d9dde0']]);
  g.beginPath(); g.ellipse(0, 0, 15, 12, 0, Math.PI, 0); g.fill();
  rr(g, -19, -2, 38, 4, 2, '#cfd4d8'); rr(g, -3, -13, 6, 12, 2, '#e8ebed');
  rr(g, -22, -10, 8, 7, 2, '#3a3d42'); circ(g, -22, -6.5, 2.8, '#fff1a8');
  g.restore();
}

// ---------------- items ----------------
IT.schwenker = g => {
  // a Schwenker (grilled neck steak) in a bread roll
  g.fillStyle = lgrad(g, 0, -2, 0, 9, [[0, '#f2c27a'], [1, '#c98a44']]); g.beginPath(); g.ellipse(0, 4, 13, 5, 0, 0, Math.PI); g.fill();
  g.fillStyle = lgrad(g, 0, -4, 0, 3, [[0, '#a45a36'], [1, '#7a3c22']]); rrPath(g, -15, -3, 30, 6, 3); g.fill();
  g.strokeStyle = 'rgba(40,20,10,.7)'; g.lineWidth = 1.2; for (let x = -10; x <= 10; x += 5) { g.beginPath(); g.moveTo(x - 2, -3); g.lineTo(x + 2, 3); g.stroke(); }
  g.beginPath(); g.moveTo(-11, -3.5); g.quadraticCurveTo(-5, -6, 0, -3.5); g.quadraticCurveTo(5, -1, 11, -3.5); stroke(g, 1.3, '#7cc35a');
  g.fillStyle = lgrad(g, 0, -12, 0, -4, [[0, '#f6cf8a'], [1, '#d99a52']]); g.beginPath(); g.ellipse(0, -5, 12.5, 6.5, 0, Math.PI, 0); g.fill();
  seg(g, -5, -9, -2, -6.5, 1, '#b77f3a'); seg(g, 3, -10, 6, -7.5, 1, '#b77f3a');
};
IT.grumbeer = g => {
  g.fillStyle = lgrad(g, 0, -8, 0, 8, [[0, '#e2b878'], [1, '#b98647']]); g.beginPath(); g.ellipse(0, 0, 10, 7.5, -0.25, 0, TAU); g.fill();
  [[-4, -2], [3, 1], [1, -4], [-1, 3], [5, -2]].forEach(([x, y]) => circ(g, x, y, 0.9, '#8a5f2e'));
  ell(g, -4, -3.5, 3, 1.4, -0.4, 'rgba(255,255,255,.35)');
};
IT.maggi = g => {
  // the brown seasoning bottle every Saarland kitchen has
  g.fillStyle = lgrad(g, -6, 0, 6, 0, [[0, '#4a2a16'], [0.5, '#6e3e20'], [1, '#3a2010']]);
  g.beginPath(); g.moveTo(-6, 11); g.lineTo(-6, -1); g.quadraticCurveTo(-6, -6, -2.4, -8); g.lineTo(-2.4, -12); g.lineTo(2.4, -12); g.lineTo(2.4, -8); g.quadraticCurveTo(6, -6, 6, -1); g.lineTo(6, 11); g.closePath(); g.fill();
  rr(g, -3, -16, 6, 5, 1.5, '#e8262e'); rr(g, -3, -16, 6, 1.4, 0.7, 'rgba(255,255,255,.4)');
  rr(g, -6, 0, 12, 8, 1, '#ffd21f'); poly(g, [-6, 8, 6, 2, 6, 8], '#e8262e');
  rr(g, -4, -5, 1.6, 14, 0.8, 'rgba(255,255,255,.25)');
};
IT.giftLyoner = g => {
  IT.lyoner(g);
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, 3); g.bezierCurveTo(-4, -0.5, -2, -3.5, 0, -1.6); g.bezierCurveTo(2, -3.5, 4, -0.5, 0, 3); g.fill();
};
const IT_BOX_X = {schwenker: [-16, -13, 16, 10], grumbeer: [-11, -9, 11, 9], maggi: [-8, -17, 8, 12], giftLyoner: [-13, -14, 13, 13]};
const _itemSpriteBase = itemSprite;
itemSprite = function (kind, v, R) {
  if (!IT_BOX_X[kind]) return _itemSpriteBase(kind, v, R);
  return spr('it:' + kind + ':' + (v || 0), IT_BOX_X[kind], g => IT[kind](g, v), {outline: 1, oc: 'rgba(40,24,14,.75)', shade: true, R});
};

// ---------------- the Schwenker man (tosses a Lyoner ring) ----------------
function drawKalle(g, f, toss) {
  const s = toss ? 0 : Math.sin(f / 4 * TAU);
  seg(g, -4, -18, -5 + s * 3, 0, 4, '#3d4a63'); seg(g, 5, -18, 6 - s * 3, 0, 4, '#3d4a63');
  rr(g, -10 + s * 3, -2, 9, 3, 1.5, '#2a2420'); rr(g, 2 - s * 3, -2, 9, 3, 1.5, '#2a2420');
  g.fillStyle = lgrad(g, 0, -46, 0, -16, [[0, '#ffffff'], [1, '#dfe5ea']]); g.beginPath(); g.ellipse(1, -31, 13, 16, 0, 0, TAU); g.fill();
  g.fillStyle = '#2f5fb3'; rrPath(g, -7, -40, 16, 26, 4); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1; for (let y = -36; y < -16; y += 5) { g.beginPath(); g.moveTo(-6, y); g.lineTo(8, y); g.stroke(); }
  if (toss) { seg(g, -6, -40, -17, -52, 3.6, '#ffffff'); circ(g, -18, -53, 2.7, '#f0c4a0'); }
  else {
    seg(g, -8, -38, -13, -26, 3.6, '#ffffff'); circ(g, -13.5, -25, 2.6, '#f0c4a0');
    seg(g, -14, -25, -24, -31, 1.4, '#9aa3ab'); seg(g, -14, -24, -24, -28, 1.4, '#9aa3ab');
  }
  blob(g, 0, -53, 7.5, '#f0c4a0', '#ffdcc0');
  ell(g, -1, -49.5, 5, 2, 0, '#6b4a2e');
  circ(g, -3.5, -54.5, 1, '#2a1a10');
  ell(g, -5.5, -51.5, 1.6, 1, 0, 'rgba(230,120,110,.45)');
  g.fillStyle = '#2a3a5a'; g.beginPath(); g.ellipse(1, -59, 8.4, 4.2, 0, Math.PI, 0); g.fill(); rr(g, -11, -60, 10, 2.4, 1.2, '#2a3a5a');
}
function kalleSprite(f, toss, R) { return spr('kalle:' + f + ':' + (toss ? 1 : 0), [-26, -66, 16, 2], g => drawKalle(g, f, toss), {outline: 1.1, oc: 'rgba(30,30,40,.85)', shade: true, R}); }

// ---------------- platforms ----------------
PL.rowboat = (g, w, h) => {
  g.fillStyle = lgrad(g, 0, 0, 0, h, [[0, '#b0793f'], [1, '#7a4f26']]);
  g.beginPath(); g.moveTo(-4, 1); g.lineTo(w + 4, 1); g.quadraticCurveTo(w - 4, h - 4, w - 14, h - 4); g.lineTo(10, h - 4); g.quadraticCurveTo(2, h - 6, -4, 1); g.fill();
  rr(g, -4, 0, w + 8, 3, 1.5, '#5e3c1c'); rr(g, -2, 6, w + 2, 2.4, 1, '#ffffff'); rr(g, w * 0.4, -2, 3, 6, 1, '#5e3c1c');
  seg(g, w * 0.2, 2, w * 0.05, h + 2, 1.6, '#8a6a46');
  g.beginPath(); g.moveTo(-2, h - 3); g.lineTo(w + 2, h - 3); stroke(g, 1.2, 'rgba(255,255,255,.6)');
};
PL.bridge = (g, w, h) => {
  // an old sandstone bridge in the style of the Alte Brücke
  const stone = '#c98d6a', dark = '#a46a4c';
  g.fillStyle = lgrad(g, 0, 0, 0, h, [[0, '#d9a07c'], [1, stone]]); g.fillRect(0, 0, w, h);
  const n = Math.max(1, Math.round((w - 20) / 70)), aw = (w - 20) / n;
  for (let i = 0; i < n; i++) {
    const cx = 10 + aw * i + aw / 2;
    g.fillStyle = '#4f7f9a'; g.beginPath(); g.moveTo(cx - aw / 2 + 8, h + 2); g.lineTo(cx - aw / 2 + 8, h * 0.62); g.arc(cx, h * 0.62, aw / 2 - 8, Math.PI, 0); g.lineTo(cx + aw / 2 - 8, h + 2); g.closePath(); g.fill();
    g.beginPath(); g.arc(cx, h * 0.62, aw / 2 - 8, Math.PI, 0); stroke(g, 2, dark);
  }
  g.strokeStyle = 'rgba(120,70,45,.35)'; g.lineWidth = 0.8;
  for (let y = 9; y < h * 0.5; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  rr(g, -3, -2, w + 6, 6, 2, '#b97a58'); rr(g, -3, -2, w + 6, 1.4, 0.7, 'rgba(255,255,255,.35)');
  for (let x = 4; x < w; x += 9) rr(g, x, -12, 3.5, 10, 1.2, dark);
  rr(g, -3, -14, w + 6, 3, 1.5, '#b97a58');
};
PLAT_H.rowboat = 20; PLAT_H.bridge = 46;
const _platformSpriteBase = platformSprite;
platformSprite = function (kind, w, R) {
  if (kind === 'rowboat') return spr('plat:rowboat:' + w, [-8, -6, w + 8, 24], g => PL.rowboat(g, w, 20), {outline: 1.1, oc: 'rgba(35,22,12,.8)', shade: true, R});
  if (kind === 'bridge') return spr('plat:bridge:' + w, [-6, -16, w + 6, 50], g => PL.bridge(g, w, 46), {outline: 1, oc: 'rgba(60,35,20,.7)', shade: false, R});
  return _platformSpriteBase(kind, w, R);
};

// ---------------- scenery ----------------
SCENE.staden = {};
function foerderturm(g, x, y, s, col) {
  // a pithead frame: the symbol of Saarland mining
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = col; g.lineWidth = 2.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-14, 0); g.lineTo(-4, -62); g.moveTo(14, 0); g.lineTo(4, -62); g.moveTo(-4, -62); g.lineTo(4, -62); g.stroke();
  g.lineWidth = 1.4; for (let k = 0; k < 5; k++) { const y0 = -k * 12, w0 = 14 - k * 2; g.beginPath(); g.moveTo(-w0, y0); g.lineTo(w0 - 2, y0 - 12); g.moveTo(w0, y0); g.lineTo(-w0 + 2, y0 - 12); g.stroke(); }
  g.lineWidth = 2; g.beginPath(); g.moveTo(4, -50); g.lineTo(32, 0); g.stroke();
  g.fillStyle = col; g.beginPath(); g.arc(-3, -64, 5, 0, TAU); g.arc(3, -64, 5, 0, TAU); g.fill();
  g.fillRect(14, -16, 26, 16);
  g.restore();
}
SCENE.staden.far = (g, ex, v) => {
  const r1 = periodic([[14, 2, 0.6], [6, 5, 2.2], [3, 10, 0.9]]);
  fillRidge(g, r1, -128, '#b8ccb6');
  crownRow(g, r1, -128, 9, 5, 8, ['#adc3aa', '#a5bca2'], 21);
  foerderturm(g, 300, -128 + r1(300) + 4, 0.9, 'rgba(150,120,110,.85)');
  // the TV tower on the hill
  const tx = 940, ty = -128 + r1(940) + 4;
  g.fillStyle = 'rgba(190,196,200,.95)'; g.fillRect(tx - 3, ty - 70, 6, 70); rr(g, tx - 9, ty - 58, 18, 8, 3, 'rgba(190,196,200,.95)'); g.fillRect(tx - 1, ty - 92, 2, 22);
  const r2 = periodic([[8, 3, 1.4], [4, 7, 0.3]]);
  fillRidge(g, r2, -92, '#a9c5a2');
  crownRow(g, r2, -92, 10, 6, 9, ['#9dbd96', '#94b48e'], 33);
  // church towers of the old town
  const c = 'rgba(214,206,190,.95)';
  g.fillStyle = c; g.fillRect(560, -150, 16, 64); tri(g, 556, -150, 568, -186, 580, -150, 'rgba(160,140,120,.95)');
  g.fillRect(704, -136, 24, 52); g.beginPath(); g.ellipse(716, -137, 11, 9, 0, Math.PI, 0); g.fill();
  g.fillRect(712, -160, 8, 16); g.beginPath(); g.ellipse(716, -160, 5, 6, 0, Math.PI, 0); g.fill(); g.fillRect(715, -172, 2, 8);
  g.fillStyle = 'rgba(178,110,90,.9)'; g.fillRect(380, -144, 14, 60); tri(g, 377, -144, 387, -170, 397, -144, 'rgba(120,90,80,.95)');
};
SCENE.staden.mid = (g, ex, v) => {
  // the far bank: a row of town houses above the quay wall
  const cols = ['#f1e2c4', '#e9cfc0', '#dfe3d4', '#f3d9a8', '#e6d8cf', '#d9e2e8'];
  const roofs = ['#8e4f3c', '#5a5f6a', '#a35a42', '#6b4a3e'];
  for (let x = -20, i = 0; x < TILE_W + 20; i++) {
    const w = 34 + hashN(i * 3 + v * 17) * 26, h = 30 + hashN(i * 7 + v) * 22;
    if (hashN(i * 11 + v * 5) < 0.18) { blob(g, x + w / 2, -60, 15, '#5e8f52', '#7ca86a'); x += w; continue; }
    g.fillStyle = cols[i % cols.length]; g.fillRect(x, -44 - h, w, h + 8);
    poly(g, [x - 2, -44 - h, x + w / 2, -44 - h - 12 - hashN(i) * 6, x + w + 2, -44 - h], roofs[i % roofs.length]);
    for (let k = 0; k < Math.floor((w - 6) / 10); k++) for (let r = 0; r < Math.floor(h / 13); r++) rr(g, x + 5 + k * 10, -40 - h + 5 + r * 13, 5, 7, 0.6, '#8ea3b5');
    x += w;
  }
  // quay wall, the road and the Saarbahn line
  g.fillStyle = '#b9a58c'; g.fillRect(0, -44, TILE_W, 10); g.fillStyle = '#9e8b72'; g.fillRect(0, -36, TILE_W, 2);
  rr(g, 0, -46, TILE_W, 2, 0, '#6a645c');
  ex.rail = -46;
  // the Saar
  g.fillStyle = lgrad(g, 0, -34, 0, 2, [[0, '#7fb6cf'], [1, '#3f7e9e']]); g.fillRect(0, -34, TILE_W, 36);
  g.fillStyle = 'rgba(160,140,110,.25)'; g.fillRect(0, -34, TILE_W, 4);
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.1;
  for (let i = 0; i < 50; i++) { const x = hashN(i * 3 + v + 40) * TILE_W, y = -26 + hashN(i * 5 + 9) * 22, l = 6 + hashN(i + 3) * 14; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
  if (v === 0) {
    // the old stone bridge across the river
    const bx = 760, bw = 300, top = -54;
    g.fillStyle = '#c98d6a'; g.fillRect(bx, top, bw, 18);
    for (let k = 0; k < 5; k++) {
      const ax = bx + 10 + k * 58;
      g.fillStyle = '#c98d6a'; g.fillRect(ax, top + 16, 58, 18);
      g.fillStyle = '#4f86a3'; g.beginPath(); g.moveTo(ax + 6, top + 36); g.lineTo(ax + 6, top + 26); g.arc(ax + 29, top + 26, 23, Math.PI, 0); g.lineTo(ax + 52, top + 36); g.fill();
      g.beginPath(); g.arc(ax + 29, top + 26, 23, Math.PI, 0); stroke(g, 1.6, '#a46a4c');
    }
    rr(g, bx - 4, top - 4, bw + 8, 5, 2, '#b97a58');
    for (let x = bx; x < bx + bw; x += 7) rr(g, x, top - 11, 2.6, 8, 1, '#a46a4c');
    rr(g, bx - 4, top - 13, bw + 8, 2.4, 1, '#b97a58');
  }
  for (let i = 0; i < 4; i++) ex.boats.push([100 + i * 300 + hashN(i + v * 9) * 120, -18 + hashN(i * 7) * 8, hashN(i * 5 + v + 2)]);
  ex.ship = -22;
};
function plane(g, x, s, i) {
  // plane tree: pale mottled trunk, wide airy crown
  g.fillStyle = '#cfc6a8'; rrPath(g, x - 4.5 * s, -54 * s, 9 * s, 54 * s, 3); g.fill();
  for (let k = 0; k < 7; k++) ell(g, x + (hashN(i * 7 + k) - 0.5) * 6 * s, (-8 - k * 7) * s, 2.6 * s, 1.8 * s, 0, k % 2 ? '#9a9478' : '#e4dcc2');
  seg(g, x, -48 * s, x - 14 * s, -64 * s, 3 * s, '#cfc6a8'); seg(g, x, -50 * s, x + 14 * s, -66 * s, 3 * s, '#cfc6a8');
  [[0, -78, 24, '#5f9447'], [-22, -66, 17, '#558a3f'], [22, -68, 18, '#6ea653'], [-10, -90, 15, '#78b05b'], [12, -88, 15, '#64994b']]
    .forEach(([dx, dy, r, c]) => blob(g, x + dx * s, dy * s, r * s, c, '#92c472'));
}
function kiosk(g, x) {
  rr(g, x - 30, -40, 60, 40, 3, '#f3ead6');
  rr(g, x - 26, -30, 52, 18, 2, '#3a3d42'); rr(g, x - 24, -28, 48, 14, 1, '#ffe7a8');
  for (let k = 0; k < 7; k++) poly(g, [x - 34 + k * 10, -40, x - 24 + k * 10, -40, x - 26 + k * 10, -50, x - 32 + k * 10, -50], k % 2 ? '#ffffff' : '#2f5fb3');
  rr(g, x - 32, -58, 64, 9, 2, '#2f5fb3');
  g.fillStyle = '#ffffff'; g.font = '600 6.6px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Lyoner & Schwenker', x, -53.4);
  rr(g, x - 30, -6, 60, 6, 1, '#d9cdb4');
}
SCENE.staden.near = (g, ex, v) => {
  const items = v === 0
    ? [[80, 'plane'], [230, 'lamp'], [330, 'parasol'], [400, 'parasol'], [470, 'schwenker'], [600, 'plane'], [740, 'sign'], [860, 'lamp'], [990, 'kiosk'], [1120, 'plane']]
    : [[60, 'lamp'], [190, 'plane'], [360, 'bench'], [450, 'flowers'], [560, 'lamp'], [700, 'plane'], [860, 'sign2'], [960, 'parasol'], [1030, 'schwenker'], [1150, 'lamp']];
  items.forEach(([x, k]) => {
    if (k === 'plane') plane(g, x, 1, x);
    else if (k === 'lamp') lamp(g, x, ex);
    else if (k === 'parasol') parasol(g, x);
    else if (k === 'schwenker') { schwenkerStatic(g, x); ex.smoke.push([x + 2, -22]); }
    else if (k === 'sign') signpost(g, x, 'Staden');
    else if (k === 'sign2') signpost(g, x, 'Saarbrücken');
    else if (k === 'bench') benchDecor(g, x);
    else if (k === 'kiosk') kiosk(g, x);
    else if (k === 'flowers') { rr(g, x - 30, -8, 60, 8, 3, '#7a5a3a'); for (let i = 0; i < 12; i++) circ(g, x - 26 + i * 4.6, -10 - hashN(i + x) * 5, 2.2, ['#ff8fb1', '#ffd23f', '#ffffff', '#b28dff'][i % 4]); }
  });
};
function drawTheater(g) {
  // a neoclassical theatre on the river, in the spirit of the Staatstheater
  const w = 210, h = 70, wall = '#efe2c4', trim = '#d9c79e';
  rr(g, -w / 2 - 10, -6, w + 20, 8, 3, '#cfc6b4');
  g.fillStyle = lgrad(g, 0, -h, 0, 0, [[0, '#f6ead0'], [1, wall]]); g.fillRect(-w / 2, -h, w, h);
  g.fillStyle = '#7fa08a'; g.beginPath(); g.moveTo(-w / 2 - 6, -h); g.lineTo(-w / 2 + 10, -h - 14); g.lineTo(w / 2 - 10, -h - 14); g.lineTo(w / 2 + 6, -h); g.fill();
  rr(g, -w / 2 - 6, -h - 2, w + 12, 4, 1, trim);
  for (const side of [-1, 1]) for (let k = 0; k < 3; k++) for (let r = 0; r < 2; r++) {
    const wx = side * (62 + k * 14) - 4, wy = -h + 10 + r * 26;
    rr(g, wx, wy, 8, 16, 3, '#6d8299'); rr(g, wx - 1, wy + 16, 10, 2, 1, trim);
  }
  // portico
  g.fillStyle = wall; g.fillRect(-46, -h - 4, 92, h + 4);
  tri(g, -54, -h - 4, 0, -h - 32, 54, -h - 4, '#e6d6b2'); tri(g, -46, -h - 6, 0, -h - 27, 46, -h - 6, '#f3e6c8');
  rr(g, -54, -h - 6, 108, 4, 1, trim);
  for (let k = 0; k < 6; k++) { const cx = -40 + k * 16; g.fillStyle = lgrad(g, cx - 4, 0, cx + 4, 0, [[0, '#fbf3e0'], [1, '#d9c8a2']]); g.fillRect(cx - 4, -h + 2, 8, h - 12); rr(g, cx - 5.5, -h - 1, 11, 4, 1, trim); }
  rr(g, -50, -10, 100, 4, 1, trim); rr(g, -56, -6, 112, 6, 1, '#d6c9ad');
  g.fillStyle = '#8a6a3a'; g.font = '600 6.4px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('THEATER', 0, -h - 12);
  for (let k = 0; k < 3; k++) rr(g, -30 + k * 22, -36, 16, 26, 7, '#5a4630');
}
const _landmarkBase = landmarkSprite;
landmarkSprite = function (map, R) {
  if (map === 'staden') return spr('lm:theater', [-130, -122, 130, 4], g => drawTheater(g), {outline: 1, oc: 'rgba(60,45,30,.5)', R});
  return _landmarkBase(map, R);
};
GROUNDS.staden = {grass: '#69aa4d', grassD: '#5a9842', path: '#dcd5c6', pathD: '#bdb4a2', soil: '#4f8a3c', deep: '#5f4430'};

// Saarbahn tram on the far bank
function drawTram(g, x, y, night) {
  for (let c = 0; c < 3; c++) {
    const cx = x + c * 50;
    rr(g, cx, y - 15, 48, 14, c === 0 ? 5 : 2, '#f4f4f0'); g.fillStyle = '#d42a33'; g.fillRect(cx + 1, y - 5, 46, 2.4);
    for (let w = 0; w < 5; w++) rr(g, cx + 4 + w * 9, y - 12.5, 6, 5, 1.5, night > 0.5 ? '#ffe39a' : '#33475c');
    circ(g, cx + 10, y, 2, '#333333'); circ(g, cx + 38, y, 2, '#333333');
  }
  seg(g, x + 70, y - 15, x + 78, y - 24, 1, '#444444'); seg(g, x + 78, y - 24, x + 86, y - 15, 1, '#444444');
}
function drawShip(g, x, y) {
  // the white excursion boat on the Saar
  g.fillStyle = '#f7f7f2'; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 104, y); g.lineTo(x + 96, y + 9); g.lineTo(x + 6, y + 9); g.closePath(); g.fill();
  rr(g, x - 4, y + 4, 108, 2, 1, '#2f5fb3');
  rr(g, x + 14, y - 12, 74, 12, 2, '#ffffff'); for (let k = 0; k < 8; k++) rr(g, x + 18 + k * 8.6, y - 9, 6, 5, 1, '#5f7f9a');
  rr(g, x + 30, y - 20, 40, 8, 2, '#ffffff'); rr(g, x + 34, y - 18, 32, 4, 1, '#5f7f9a');
  rr(g, x + 58, y - 28, 6, 8, 1, '#2f5fb3');
}
