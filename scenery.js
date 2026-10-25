'use strict';
/* Scenery: each map is three parallax layers baked into seamless tiles once (two variants for the
   nearer layers so the repetition is not obvious), plus a landmark sprite and a few live details. */
const TILE_W = 1200, BAND = 250, BELOW = 34;
const LAYERS = [{id: 'far', par: 0.12, res: 0.55, variants: 1}, {id: 'mid', par: 0.3, res: 0.75, variants: 2}, {id: 'near', par: 0.62, res: 1, variants: 2}];

function periodic(terms) { return x => terms.reduce((s, [a, k, p]) => s + a * Math.sin(TAU * k * x / TILE_W + p), 0); }
function fillRidge(g, fn, base, col) {
  g.fillStyle = col; g.beginPath(); g.moveTo(0, BELOW);
  for (let x = 0; x <= TILE_W; x += 6) g.lineTo(x, base + fn(x));
  g.lineTo(TILE_W, BELOW); g.closePath(); g.fill();
}
function crownRow(g, fn, base, step, rmin, rmax, cols, seed) {
  for (let x = -step; x <= TILE_W + step; x += step) {
    const xx = ((x % TILE_W) + TILE_W) % TILE_W, h = hashN(Math.round(xx) + seed);
    circ(g, x, base + fn(xx) + 3, rmin + h * (rmax - rmin), cols[Math.floor(h * cols.length) % cols.length]);
  }
}
function treeOak(g, x, s) {
  rr(g, x - 3.5 * s, -30 * s, 7 * s, 30 * s, 2, '#6b4a2e');
  [[0, -44, 20, '#5f9447'], [-14, -34, 15, '#4f823b'], [14, -35, 15, '#6ea653'], [4, -55, 13, '#78b05b'], [-7, -50, 12, '#5f9447']]
    .forEach(([dx, dy, r, c]) => blob(g, x + dx * s, dy * s, r * s, c, '#8cc06a'));
}
function treeBirch(g, x, s) {
  rr(g, x - 2.5 * s, -46 * s, 5 * s, 46 * s, 2, '#ece8de');
  for (let k = 0; k < 5; k++) rr(g, x - 2.5 * s, (-40 + k * 8) * s, 3 * s, 1.4 * s, 0.6, '#3a3a3a');
  [[0, -52, 13], [-8, -44, 10], [8, -45, 10], [0, -62, 9]].forEach(([dx, dy, r]) => blob(g, x + dx * s, dy * s, r * s, '#86b45a', '#a9d07a'));
}
function treeSpruce(g, x, s, c) {
  rr(g, x - 2 * s, -12 * s, 4 * s, 12 * s, 1, '#5a3d24');
  for (let k = 0; k < 4; k++) tri(g, x - (17 - k * 3.5) * s, (-8 - k * 13) * s, x, (-30 - k * 13) * s, x + (17 - k * 3.5) * s, (-8 - k * 13) * s, c || '#3f6b42');
}
function bush(g, x, s, c1, c2) { [[0, -9, 12], [-12, -6, 9], [12, -7, 10], [5, -15, 8]].forEach(([dx, dy, r]) => blob(g, x + dx * s, dy * s, r * s, c1, c2)); }
function lamp(g, x, ex) {
  rr(g, x - 1.6, -60, 3.2, 60, 1, '#2f3a33'); rr(g, x - 5, -4, 10, 4, 1, '#2f3a33');
  rr(g, x - 6, -68, 12, 9, 3, '#2f3a33'); circ(g, x, -63.5, 3, '#fff1c4');
  ex.lamps.push([x, -63]);
}
function signpost(g, x, label) {
  rr(g, x - 1.6, -34, 3.2, 34, 1, '#6d5236');
  g.fillStyle = lgrad(g, 0, -44, 0, -30, [[0, '#9a774f'], [1, '#7a5a38']]); rrPath(g, x - 34, -44, 68, 14, 2.5); g.fill();
  g.fillStyle = '#fff6e4'; g.font = '600 7.4px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x, -36.8);
}
function fern(g, x, s) {
  g.strokeStyle = '#6a9a3e'; g.lineWidth = 1.6 * s;
  for (let k = -3; k <= 3; k++) {
    g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + k * 5 * s, -14 * s, x + k * 9 * s, -10 * s + Math.abs(k) * 2 * s); g.stroke();
  }
}
function benchDecor(g, x) {
  rr(g, x - 18, -15, 36, 4, 1.5, '#8a5a34'); rr(g, x - 18, -24, 36, 4, 1.5, '#7a5030');
  rr(g, x - 15, -24, 3, 24, 1, '#3e3a36'); rr(g, x + 12, -24, 3, 24, 1, '#3e3a36');
}

// ---------------- WIMBLEDON COMMON ----------------
const SCENE = {common: {}, weiher: {}, garden: {}};
SCENE.common.far = (g, ex, v) => {
  // the London skyline, faint behind the heath
  g.fillStyle = 'rgba(196,212,226,.55)';
  [[180, 30, 44], [214, 18, 62], [236, 26, 36], [640, 22, 54], [666, 12, 78], [682, 24, 40], [1010, 20, 48]].forEach(([x, w, h]) => g.fillRect(x, -118 - h, w, h + 20));
  tri(g, 666, -196, 672, -222, 678, -196, 'rgba(196,212,226,.55)');
  const r1 = periodic([[12, 2, 0.4], [6, 5, 1.3], [3, 11, 2.1]]);
  fillRidge(g, r1, -122, '#c6deb5');
  crownRow(g, r1, -122, 9, 5, 8, ['#b6d2a2', '#aecb99'], 3);
  const r2 = periodic([[9, 3, 2.2], [5, 7, 0.4]]);
  fillRidge(g, r2, -86, '#b2d39b');
  crownRow(g, r2, -86, 11, 6, 10, ['#a4c98d', '#9cc285'], 9);
};
SCENE.common.mid = (g, ex, v) => {
  const r = periodic([[7, 2, 1.0], [4, 6, 2.5]]);
  g.fillStyle = lgrad(g, 0, -60, 0, BELOW, [[0, '#a6cf87'], [1, '#86b86c']]);
  g.beginPath(); g.moveTo(0, BELOW); for (let x = 0; x <= TILE_W; x += 6) g.lineTo(x, -42 + r(x)); g.lineTo(TILE_W, BELOW); g.fill();
  if (v === 0) windmill(g, 330, -42 + r(330), ex);
  const trees = v === 0 ? [[90, 'oak', 1], [150, 'birch', 0.9], [560, 'oak', 1.15], [640, 'oak', 0.85], [820, 'birch', 1], [1000, 'oak', 1.05], [1080, 'birch', 0.85]]
    : [[70, 'birch', 1], [220, 'oak', 1.1], [300, 'oak', 0.9], [480, 'birch', 1.05], [700, 'oak', 1.2], [900, 'birch', 0.9], [960, 'oak', 1], [1110, 'oak', 0.9]];
  trees.forEach(([x, k, s]) => { g.save(); g.translate(0, -40 + r(x)); (k === 'oak' ? treeOak : treeBirch)(g, x, s); g.restore(); });
  for (let i = 0; i < 9; i++) {
    const x = 60 + hashN(i * 7 + v * 31) * (TILE_W - 120), y = -38 + r(x);
    g.save(); g.translate(0, y); bush(g, x, 0.9, '#4f7f37', '#6a9a48');
    for (let k = 0; k < 7; k++) circ(g, x - 14 + hashN(i * 13 + k) * 28, -18 + hashN(i * 17 + k) * 14, 1.7, '#f6d23a');
    g.restore();
  }
};
function windmill(g, x, y, ex) {
  g.save(); g.translate(x, y);
  g.fillStyle = lgrad(g, -16, 0, 16, 0, [[0, '#f4efe4'], [1, '#d9d1c0']]);
  g.beginPath(); g.moveTo(-17, 0); g.lineTo(-12, -54); g.lineTo(12, -54); g.lineTo(17, 0); g.closePath(); g.fill();
  rr(g, -5, -16, 10, 16, 5, '#6b4a2e'); rr(g, -4, -38, 8, 10, 4, '#7b8a98'); rr(g, -18, -6, 36, 6, 1, '#cfc6b2');
  g.fillStyle = '#4e3a2c'; g.beginPath(); g.moveTo(-15, -54); g.quadraticCurveTo(0, -72, 15, -54); g.closePath(); g.fill();
  rr(g, -2, -4, 4, 4, 1, '#4e3a2c');
  g.restore();
  ex.sails.push([x + 2, y - 60]);
}
SCENE.common.near = (g, ex, v) => {
  const items = v === 0
    ? [[70, 'fern'], [160, 'bush'], [300, 'lamp'], [420, 'fern'], [520, 'sign'], [640, 'bush'], [760, 'rock'], [880, 'lamp'], [1000, 'fern'], [1100, 'bush']]
    : [[90, 'bush'], [210, 'fern'], [350, 'rock'], [470, 'lamp'], [600, 'fern'], [730, 'bush'], [860, 'fern'], [980, 'lamp'], [1110, 'rock']];
  items.forEach(([x, k]) => {
    if (k === 'fern') { fern(g, x, 1); fern(g, x + 14, 0.8); }
    else if (k === 'bush') bush(g, x, 1.1, '#467f37', '#62a04a');
    else if (k === 'lamp') lamp(g, x, ex);
    else if (k === 'sign') signpost(g, x, 'Wimbledon Common');
    else if (k === 'rock') { blob(g, x, -5, 9, '#9a9a92', '#c9c9c0'); blob(g, x + 11, -3, 6, '#8a8a82', '#b9b9b0'); }
  });
};

// ---------------- WÜRZBACHER WEIHER ----------------
SCENE.weiher.far = (g, ex, v) => {
  const r1 = periodic([[13, 2, 1.1], [7, 4, 0.2], [3, 9, 1.7]]);
  fillRidge(g, r1, -132, '#b3cbb1');
  crownRow(g, r1, -132, 8, 5, 8, ['#a8c3a5', '#9fbb9b'], 5);
  // Philippsburg ruin on the ridge
  const cx = 820, cy = -132 + r1(820) + 2;
  g.fillStyle = 'rgba(178,165,140,.9)';
  g.fillRect(cx - 24, cy - 18, 48, 18); g.fillRect(cx - 9, cy - 40, 18, 40);
  for (let k = 0; k < 4; k++) g.fillRect(cx - 10 + k * 5.4, cy - 45, 3.2, 5);
  for (let k = 0; k < 6; k++) g.fillRect(cx - 24 + k * 8.4, cy - 21, 4, 3);
  const r2 = periodic([[10, 3, 0.7], [5, 8, 2.4]]);
  fillRidge(g, r2, -98, '#97ba92');
  crownRow(g, r2, -98, 10, 6, 10, ['#88ae84', '#8fb48a', '#7fa57b'], 11);
};
SCENE.weiher.mid = (g, ex, v) => {
  const r = periodic([[6, 3, 0.3], [3, 7, 1.9]]);
  fillRidge(g, r, -62, '#5e8f52');
  for (let x = -10; x <= TILE_W + 10; x += 17) {
    const xx = ((x % TILE_W) + TILE_W) % TILE_W, h = hashN(Math.round(xx) + 77 + v * 13), y = -62 + r(xx);
    if (h < 0.2) { g.save(); g.translate(0, y + 8); treeSpruce(g, x, 0.75, '#3f6b42'); g.restore(); }
    else blob(g, x, y + 2, 9 + h * 7, h < 0.6 ? '#4f7f45' : '#5d8f4f', '#79a868');
  }
  // railway embankment
  rr(g, 0, -44, TILE_W, 5, 0, '#8a7d68'); rr(g, 0, -45, TILE_W, 1.6, 0, '#5c544a');
  ex.rail = -45;
  // the water, with the far bank mirrored in it
  g.fillStyle = lgrad(g, 0, -36, 0, 0, [[0, '#8cc6e0'], [1, '#4b8db3']]); g.fillRect(0, -36, TILE_W, 38);
  g.fillStyle = 'rgba(55,100,70,.32)'; g.beginPath(); g.moveTo(0, -36);
  for (let x = 0; x <= TILE_W; x += 8) g.lineTo(x, -29 + Math.sin(x / 19) * 2); g.lineTo(TILE_W, -36); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.1;
  for (let i = 0; i < 46; i++) { const x = hashN(i * 3 + v) * TILE_W, y = -24 + hashN(i * 5 + 2) * 20, l = 6 + hashN(i) * 12; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
  for (let i = 0; i < 6; i++) {
    const x = 60 + hashN(i * 11 + v * 7) * (TILE_W - 120), y = -6 - hashN(i * 3) * 6;
    for (let k = 0; k < 3; k++) ell(g, x + k * 9, y + (k % 2) * 3, 5.5, 2.2, 0, '#4f8a3a');
    circ(g, x + 9, y + 1, 1.9, '#f6b6c8'); circ(g, x + 9, y + 1, 0.8, '#ffe066');
  }
  for (let i = 0; i < 4; i++) ex.boats.push([120 + i * 280 + hashN(i + v * 9) * 120, -20 + hashN(i * 7) * 8, hashN(i * 5 + v)]);
};
SCENE.weiher.near = (g, ex, v) => {
  for (let x = 20; x < TILE_W - 20; x += 70) if (hashN(x + v) > 0.35) reeds(g, x + hashN(x) * 30, x);
  const items = v === 0 ? [[150, 'willow'], [380, 'parasol'], [450, 'schwenker'], [620, 'lamp'], [780, 'sign'], [960, 'willow'], [1110, 'lamp']]
    : [[100, 'lamp'], [260, 'willow'], [520, 'bench'], [700, 'parasol'], [770, 'parasol'], [900, 'sign2'], [1080, 'willow']];
  items.forEach(([x, k]) => {
    if (k === 'willow') willow(g, x, x);
    else if (k === 'parasol') parasol(g, x);
    else if (k === 'schwenker') { schwenkerStatic(g, x); ex.smoke.push([x + 2, -22]); }
    else if (k === 'lamp') lamp(g, x, ex);
    else if (k === 'sign') signpost(g, x, 'Würzbacher Weiher');
    else if (k === 'sign2') signpost(g, x, 'Annahof →');
    else if (k === 'bench') benchDecor(g, x);
  });
};
function reeds(g, x, i) {
  for (let k = 0; k < 6; k++) {
    const bx = x + k * 4, h = 16 + hashN(i * 9 + k) * 16, sw = (hashN(i + k) - 0.5) * 6;
    g.beginPath(); g.moveTo(bx, 2); g.quadraticCurveTo(bx + sw * 0.4, -h * 0.6, bx + sw, -h); stroke(g, 1.6, '#557c3a');
    if (k % 2 === 0) rr(g, bx + sw - 1.7, -h - 2, 3.4, 8, 1.7, '#6b4a2a');
  }
}
function willow(g, x, i) {
  rr(g, x - 3.5, -44, 7, 44, 2, '#6b5236');
  [[0, -50, 22, '#7aa44e'], [-15, -44, 15, '#86b05a'], [15, -45, 15, '#6f9a47']].forEach(([dx, dy, r, c]) => blob(g, x + dx, dy, r, c, '#9fc876'));
  for (let k = 0; k < 16; k++) {
    const sx = x - 28 + k * 3.8, len = 24 + hashN(i * 3 + k) * 16, y0 = -50 + Math.abs(k - 8) * 1.6;
    g.beginPath(); g.moveTo(sx, y0); g.quadraticCurveTo(sx + 1.5, y0 + len * 0.6, sx + 2.5, y0 + len); stroke(g, 1.4, k % 2 ? '#8fbb5f' : '#7aa64e');
  }
}
function parasol(g, x) {
  rr(g, x - 1, -36, 2, 36, 1, '#5a4a3a');
  rr(g, x - 13, -15, 26, 3, 1, '#7a5434'); rr(g, x - 11, -12, 2, 12, 1, '#7a5434'); rr(g, x + 9, -12, 2, 12, 1, '#7a5434');
  for (let k = 0; k < 6; k++) tri(g, x, -47, x - 25 + k * 8.4, -34, x - 16.6 + k * 8.4, -34, k % 2 ? '#ffffff' : '#c8323c');
  rr(g, x - 7, -18, 3, 3, 1, '#f2d27a'); rr(g, x + 3, -18, 3, 3, 1, '#f2d27a');
}
function schwenkerStatic(g, x) {
  seg(g, x - 15, 0, x, -44, 2.2, '#3a3632'); seg(g, x + 15, 0, x, -44, 2.2, '#3a3632'); seg(g, x, -44, x + 3, 0, 2.2, '#3a3632');
  seg(g, x, -44, x + 2, -17, 1, '#3a3632'); ell(g, x + 2, -16, 13, 2.6, 0, '#2c2c2c');
  for (let k = 0; k < 3; k++) rr(g, x - 7 + k * 6.5, -19, 5, 3, 1.4, '#a8553a');
  ell(g, x, -4, 10, 3, 0, '#2a2a2a'); circ(g, x - 3, -7, 3, '#f2a33a'); circ(g, x + 3, -8, 2.6, '#ffd23f'); circ(g, x, -9, 2, '#fff1a8');
}

// ---------------- JÖRGS GARTEN ----------------
SCENE.garden.far = (g, ex, v) => {
  const r1 = periodic([[8, 2, 2.0], [4, 6, 0.6]]);
  fillRidge(g, r1, -112, '#b9d2b0');
  crownRow(g, r1, -112, 10, 6, 10, ['#a9c79f', '#a2c198'], 21);
  // village roofs and the church tower
  const houses = [[60, 54], [138, 44], [330, 60], [404, 46], [600, 56], [780, 50], [860, 58], [1050, 46]];
  const walls = ['#efe7d8', '#f3e2c4', '#e9e4dc', '#f1dccb'];
  houses.forEach(([x, w], i) => {
    const h = 18 + hashN(i) * 9, y = -92;
    g.fillStyle = walls[i % 4]; g.fillRect(x, y - h, w, h + 22);
    poly(g, [x - 4, y - h, x + w / 2, y - h - 16 - hashN(i + 3) * 6, x + w + 4, y - h], ['#b8583f', '#4f5560', '#a34b36', '#c66a4a'][i % 4]);
    if (i % 2) rr(g, x + w * 0.7, y - h - 14, 5, 9, 0.5, '#8a8a8a');
    for (let k = 0; k < Math.floor((w - 6) / 12); k++) { rr(g, x + 6 + k * 12, y - h + 5, 5, 6, 0.6, '#8fa6b8'); rr(g, x + 6 + k * 12, y - h + 15, 5, 6, 0.6, '#8fa6b8'); }
  });
  g.fillStyle = 'rgba(232,224,210,.95)'; g.fillRect(505, -186, 26, 110);
  poly(g, [503, -186, 518, -230, 533, -186], 'rgba(90,96,108,.95)'); rr(g, 513, -170, 10, 12, 5, 'rgba(120,140,160,.7)');
  const r2 = periodic([[6, 3, 1.5], [3, 7, 0.2]]);
  fillRidge(g, r2, -82, '#a2c48f');
};
SCENE.garden.mid = (g, ex, v) => {
  // a neatly trimmed hedge
  const r = periodic([[1.6, 9, 0.3], [1, 23, 1.2]]);
  g.fillStyle = lgrad(g, 0, -64, 0, 0, [[0, '#4d8a43'], [1, '#356b31']]);
  g.beginPath(); g.moveTo(0, BELOW); for (let x = 0; x <= TILE_W; x += 6) g.lineTo(x, -62 + r(x)); g.lineTo(TILE_W, BELOW); g.fill();
  for (let i = 0; i < 520; i++) { const x = hashN(i * 2.3) * TILE_W, y = -58 + hashN(i * 4.1) * 56; circ(g, x, y, 1.6 + hashN(i) * 1.4, hashN(i * 7) > 0.5 ? '#5c9a4f' : '#2f612c'); }
  if (v === 0) { sauna(g, 250, ex); washingLine(g, 520, 700); appleTree(g, 980); }
  else { shed(g, 220); appleTree(g, 520); sauna(g, 900, ex); }
};
function sauna(g, x, ex) {
  g.save(); g.translate(x, 0);
  rr(g, -46, -6, 92, 6, 2, '#8a6a48');
  g.fillStyle = lgrad(g, 0, -60, 0, 0, [[0, '#c48a4f'], [1, '#93622f']]); g.beginPath(); g.ellipse(0, -6, 42, 44, 0, Math.PI, 0); g.fill();
  g.strokeStyle = 'rgba(90,55,25,.45)'; g.lineWidth = 1; for (let k = -36; k <= 36; k += 9) { g.beginPath(); g.moveTo(k, -6); g.lineTo(k, -6 - Math.sqrt(Math.max(0, 1 - (k / 42) ** 2)) * 44); g.stroke(); }
  rr(g, -12, -38, 24, 32, 12, '#6b4a2a'); rr(g, -8, -34, 16, 12, 8, '#b9d7e8'); circ(g, 7, -20, 1.4, '#e8c86a');
  rr(g, 18, -58, 7, 16, 1, '#4a4e57'); rr(g, 16, -60, 11, 3, 1, '#3a3e47');
  g.fillStyle = '#fff6e4'; g.font = '600 7px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('SAUNA', 0, -42);
  g.restore();
  ex.smoke.push([x + 21, -62]);
}
function washingLine(g, x0, x1) {
  rr(g, x0 - 2, -54, 4, 54, 1, '#9aa0a6'); rr(g, x1 - 2, -54, 4, 54, 1, '#9aa0a6');
  g.beginPath(); g.moveTo(x0, -52); g.quadraticCurveTo((x0 + x1) / 2, -44, x1, -52); stroke(g, 1, '#f2f2f2');
  const cols = [['#ffffff', '#e5486b'], ['#2f5fb3', '#ffd23f'], ['#3a3a3a', '#f59ac0'], ['#f3e6c8', '#4f8a3b']];
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.7) / 6.6, x = x0 + (x1 - x0) * t, y = -52 + Math.sin(t * Math.PI) * 8;
    if (i === 2) { rr(g, x - 9, y, 18, 22, 2, '#7fb3d9'); rr(g, x - 9, y + 16, 18, 3, 1, '#ffffff'); continue; }
    const [b, s] = cols[i % 4];
    g.save(); g.translate(x, y + 2); g.rotate(0.1);
    rr(g, -3, 0, 7, 13, 2, b); rr(g, -3, 10, 12, 6, 3, b); rr(g, -3, 1, 7, 2, 1, s); rr(g, -3, 5, 7, 1.6, 0.8, s);
    seg(g, 0, -2, 0, 1, 1.2, '#d9b25a');
    g.restore();
  }
}
function appleTree(g, x) {
  rr(g, x - 5, -42, 10, 42, 3, '#6b4a2e');
  [[0, -60, 26, '#4f8a43'], [-20, -48, 18, '#5c9a4f'], [20, -50, 19, '#468039'], [-6, -76, 16, '#5c9a4f'], [12, -72, 15, '#4f8a43']].forEach(([dx, dy, r, c]) => blob(g, x + dx, dy, r, c, '#7ab865'));
  [[-14, -54], [10, -62], [-2, -46], [18, -48], [-20, -64], [4, -76]].forEach(([dx, dy]) => blob(g, x + dx, dy, 3.2, '#d93a2f', '#ff8a70'));
}
function shed(g, x) {
  g.fillStyle = lgrad(g, 0, -50, 0, 0, [[0, '#7a9a6a'], [1, '#5c7a50']]); g.fillRect(x - 34, -46, 68, 46);
  poly(g, [x - 40, -46, x, -66, x + 40, -46], '#4a4e57');
  rr(g, x - 9, -34, 18, 34, 1, '#4f6a44'); rr(g, x + 14, -36, 12, 10, 1, '#cfe3ee');
  g.strokeStyle = 'rgba(40,60,35,.35)'; g.lineWidth = 1; for (let k = -30; k <= 30; k += 6) { g.beginPath(); g.moveTo(x + k, -46); g.lineTo(x + k, 0); g.stroke(); }
}
SCENE.garden.near = (g, ex, v) => {
  // a classic Jägerzaun all the way along
  for (let x = 0; x < TILE_W; x += 60) {
    rr(g, x + 1, -30, 4, 30, 1, '#9a6e44');
    g.strokeStyle = '#b08050'; g.lineWidth = 2.4; g.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      g.beginPath(); g.moveTo(x + 3 + k * 20, -2); g.lineTo(x + 23 + k * 20, -26); g.stroke();
      g.beginPath(); g.moveTo(x + 3 + k * 20, -26); g.lineTo(x + 23 + k * 20, -2); g.stroke();
    }
    rr(g, x, -31, 60, 3, 1, '#8a5f38');
  }
  const items = v === 0 ? [[90, 'bed'], [250, 'gnome'], [330, 'solar'], [470, 'rose'], [610, 'bath'], [760, 'solar'], [860, 'bed'], [1000, 'hog'], [1120, 'solar']]
    : [[80, 'solar'], [200, 'rose'], [360, 'bed'], [520, 'can'], [640, 'solar'], [780, 'gnome'], [920, 'bed'], [1080, 'rose']];
  items.forEach(([x, k]) => {
    if (k === 'bed') { ell(g, x, -2, 30, 6, 0, '#6b4a31'); for (let i = 0; i < 8; i++) { const fx = x - 24 + i * 7; seg(g, fx, -2, fx, -14 - (i % 3) * 3, 1.4, '#4f8a3a'); blob(g, fx, -15 - (i % 3) * 3, 3, ['#e5486b', '#ffd23f', '#f59ac0', '#ff7a3a'][i % 4], '#ffffff'); } }
    else if (k === 'rose') { bush(g, x, 0.9, '#3f7a3c', '#5c9a4f'); for (let i = 0; i < 6; i++) blob(g, x - 12 + hashN(i + x) * 24, -18 + hashN(i * 3 + x) * 12, 2.6, '#e23d62', '#ff9db4'); }
    else if (k === 'gnome') { g.save(); g.translate(x, 0); g.scale(0.7, 0.7); EN.gnome(g, 0, ''); g.restore(); }
    else if (k === 'solar') { rr(g, x - 1, -18, 2, 18, 1, '#4a4e57'); rr(g, x - 4, -24, 8, 7, 2, '#3a3e47'); circ(g, x, -20, 2.4, '#fff1c4'); ex.lamps.push([x, -20, 0.5]); }
    else if (k === 'bath') { rr(g, x - 3, -22, 6, 22, 2, '#cfc8b8'); ell(g, x, -24, 14, 4, 0, '#d9d2c2'); ell(g, x, -25, 10, 2.4, 0, '#8cc6e0'); }
    else if (k === 'hog') { rr(g, x - 16, -18, 32, 18, 3, '#9a6e44'); poly(g, [x - 19, -18, x, -30, x + 19, -18], '#7a5030'); rr(g, x - 5, -11, 10, 11, 5, '#2a1a10'); }
    else if (k === 'can') { rr(g, x - 9, -16, 18, 16, 3, '#3fa86a'); seg(g, x + 9, -12, x + 20, -22, 2.4, '#3fa86a'); g.beginPath(); g.arc(x, -16, 8, Math.PI, 0); stroke(g, 2, '#2f8a55'); }
  });
};

// ---------------- landmarks ----------------
function landmarkSprite(map, R) {
  if (map === 'weiher') return spr('lm:annahof', [-120, -112, 120, 4], g => drawAnnahof(g), {outline: 1, oc: 'rgba(50,35,25,.55)', R});
  if (map === 'garden') return spr('lm:house', [-140, -150, 140, 4], g => drawHouse(g), {outline: 1, oc: 'rgba(40,40,45,.55)', R});
  return null;
}
function drawAnnahof(g) {
  const w = 160, h = 46, wall = '#f0ddb0', stone = '#b65a44', roof = '#4c5260', glass = '#5b6f86';
  rr(g, -w / 2 - 34, -6, w + 68, 8, 4, '#5f9e48');
  g.fillStyle = roof;
  g.beginPath(); g.moveTo(-w / 2 - 4, -h); g.lineTo(-w / 2 + 12, -h - 24); g.lineTo(-20, -h - 24); g.lineTo(-20, -h); g.fill();
  g.beginPath(); g.moveTo(w / 2 + 4, -h); g.lineTo(w / 2 - 12, -h - 24); g.lineTo(20, -h - 24); g.lineTo(20, -h); g.fill();
  rr(g, -w / 2 + 12, -h - 26, w - 24, 3, 1, '#3b404c');
  rr(g, -54, -h - 34, 6, 10, 1, stone); rr(g, 48, -h - 34, 6, 10, 1, stone);
  for (const dx of [-60, -40, 40, 60]) { g.fillStyle = wall; g.fillRect(dx - 4, -h - 16, 8, 9); tri(g, dx - 6, -h - 16, dx, -h - 22, dx + 6, -h - 16, roof); g.fillStyle = glass; g.fillRect(dx - 2.5, -h - 14, 5, 6); }
  g.fillStyle = lgrad(g, 0, -h, 0, 0, [[0, '#f6e6c0'], [1, wall]]); g.fillRect(-w / 2, -h, w, h);
  g.fillStyle = stone; g.fillRect(-w / 2, -6, w, 6); g.fillRect(-w / 2, -h, 6, h); g.fillRect(w / 2 - 6, -h, 6, h); g.fillRect(-w / 2, -h - 2, w, 3);
  g.fillStyle = '#f7e9c8'; g.fillRect(-22, -h - 8, 44, h + 8);
  g.fillStyle = stone; g.fillRect(-22, -h - 8, 4, h + 8); g.fillRect(18, -h - 8, 4, h + 8);
  tri(g, -27, -h - 8, 0, -h - 30, 27, -h - 8, stone); tri(g, -22, -h - 9, 0, -h - 26, 22, -h - 9, '#f7e9c8');
  circ(g, 0, -h - 15, 3.6, glass);
  for (const side of [-1, 1]) for (let k = 0; k < 3; k++) for (let r = 0; r < 2; r++) {
    const wx = side * (34 + k * 15) - 4, wy = -h + 6 + r * 18;
    rr(g, wx - 1.5, wy - 1.5, 11, 15, 2, stone); rr(g, wx, wy, 8, 12, 1.5, glass);
    g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(wx + 3.6, wy, 0.8, 12); g.fillRect(wx, wy + 5.6, 8, 0.8);
  }
  rr(g, -9, -26, 18, 26, 8, stone); rr(g, -7, -24, 14, 24, 7, '#6b4227'); circ(g, 4, -11, 1, '#e8c86a');
  rr(g, -19, -h - 4, 38, 10, 2, '#2f4a3d');
  g.fillStyle = '#f2e3bf'; g.font = '600 7.5px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Annahof', 0, -h + 1.2);
  circ(g, -16, -30, 2.2, '#ffe7a8'); circ(g, 16, -30, 2.2, '#ffe7a8');
  for (const px of [-w / 2 - 16, w / 2 + 18]) { g.save(); g.translate(px, 0); parasol(g, 0); g.restore(); }
}
function drawHouse(g) {
  // Jörg's house: white render, anthracite windows, a red tiled roof, terrace with sliding doors
  const w = 220, h = 96;
  rr(g, -w / 2 - 10, -6, w + 20, 8, 3, '#bdb6a8');
  g.fillStyle = lgrad(g, 0, -h, 0, 0, [[0, '#ffffff'], [1, '#ece6da']]); g.fillRect(-w / 2, -h, w, h);
  rr(g, -w / 2, -10, w, 10, 0, '#9a948a');
  g.fillStyle = lgrad(g, 0, -h - 46, 0, -h, [[0, '#c8644a'], [1, '#9c4231']]);
  g.beginPath(); g.moveTo(-w / 2 - 14, -h + 2); g.lineTo(-w / 2 + 40, -h - 46); g.lineTo(w / 2 - 40, -h - 46); g.lineTo(w / 2 + 14, -h + 2); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(110,40,25,.45)'; g.lineWidth = 1; for (let k = 1; k < 5; k++) { const y = -h + 2 - k * 9.6; g.beginPath(); g.moveTo(-w / 2 - 14 + k * 11, y); g.lineTo(w / 2 + 14 - k * 11, y); g.stroke(); }
  rr(g, 46, -h - 60, 14, 26, 1, '#8a8a8a'); rr(g, 44, -h - 62, 18, 4, 1, '#6a6a6a');
  // dormer
  g.fillStyle = '#ffffff'; g.fillRect(-22, -h - 34, 44, 26); poly(g, [-28, -h - 34, 0, -h - 50, 28, -h - 34], '#a84a36'); rr(g, -14, -h - 30, 28, 18, 1, '#3d434c'); rr(g, -12, -h - 28, 24, 14, 1, '#a9cbe0');
  const win = (x, y, ww, hh) => { rr(g, x, y, ww, hh, 1, '#3d434c'); rr(g, x + 2, y + 2, ww - 4, hh - 4, 1, '#a9cbe0'); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(x + 4, y + 3, 3, hh - 6); };
  win(-96, -84, 30, 30); win(-48, -84, 30, 30); win(18, -84, 30, 30); win(66, -84, 30, 30);
  win(-96, -44, 30, 30); rr(g, -48, -46, 60, 46, 1, '#3d434c'); rr(g, -46, -44, 27, 44, 1, '#a9cbe0'); rr(g, -17, -44, 27, 44, 1, '#a9cbe0');
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-40, -42, 4, 40); g.fillRect(-11, -42, 4, 40);
  rr(g, 30, -52, 26, 52, 2, '#5a3a24'); circ(g, 50, -26, 1.4, '#d9d9d9'); rr(g, 66, -44, 30, 30, 1, '#3d434c'); rr(g, 68, -42, 26, 26, 1, '#a9cbe0');
  rr(g, 32, -62, 22, 8, 1, '#3d434c'); circ(g, 62, -58, 2.4, '#ffe7a8');
  // terrace pots
  for (const px of [-60, 22]) { rr(g, px - 6, -14, 12, 12, 2, '#b8664a'); blob(g, px, -20, 9, '#4f8a43', '#7ab865'); }
}

// ---------------- tile building ----------------
const Scenery = {map: null, R: 0, tiles: {}, ex: {}};
function buildScenery(map, R) {
  if (Scenery.map === map && Scenery.R === R) return;
  Scenery.map = map; Scenery.R = R; Scenery.tiles = {}; Scenery.ex = {};
  for (const L of LAYERS) {
    Scenery.tiles[L.id] = []; Scenery.ex[L.id] = [];
    for (let v = 0; v < L.variants; v++) {
      const k = R * L.res, c = makeCanvas(TILE_W * k, (BAND + BELOW) * k), g = c.getContext('2d');
      g.setTransform(k, 0, 0, k, 0, BAND * k);
      const ex = {lamps: [], smoke: [], boats: [], sails: [], rail: null, ship: null};
      SCENE[map][L.id](g, ex, v);
      Scenery.tiles[L.id].push(c); Scenery.ex[L.id].push(ex);
    }
  }
}
/* Calls fn(tileIndex, variant, screenX) for each tile copy covering the screen. */
function eachTile(L, scroll, W, fn) {
  const off = scroll * L.par, first = Math.floor(off / TILE_W);
  for (let i = first; i * TILE_W - off < W; i++) fn(i, ((i % L.variants) + L.variants) % L.variants, i * TILE_W - off);
}
function drawLayer(g, L, scroll, W, ground) {
  const tiles = Scenery.tiles[L.id];
  eachTile(L, scroll, W, (i, v, x) => g.drawImage(tiles[v], x, ground - BAND, TILE_W, BAND + BELOW));
}

// ---------------- ground ----------------
const GROUNDS = {
  common: {grass: '#6aa84f', grassD: '#5a9842', path: '#e3cf9f', pathD: '#c9b480', soil: '#4d8a3a', deep: '#6b4a31'},
  weiher: {grass: '#5f9e48', grassD: '#4f8e3a', path: '#d6c3a0', pathD: '#bda988', soil: '#4a8636', deep: '#64452e'},
  garden: {grass: '#6cb04f', grassD: '#5fa046', path: '#d9d4c7', pathD: '#bdb6a8', soil: '#5a9e45', deep: '#5e4330'}
};
const GroundStrip = {key: '', c: null};
function groundStrip(map, R) {
  const key = map + '@' + R;
  if (GroundStrip.key === key) return GroundStrip.c;
  const C = GROUNDS[map], w = 192, h = 50, c = makeCanvas(w * R, h * R), g = c.getContext('2d');
  g.setTransform(R, 0, 0, R, 0, 0);
  g.fillStyle = C.soil; g.fillRect(0, 0, w, h);
  if (map === 'garden') for (let x = 0; x < w; x += 48) { g.fillStyle = C.grassD; g.fillRect(x, 0, 24, h); }
  g.fillStyle = C.grass; g.fillRect(0, 0, w, 10);
  if (map === 'garden') { for (let x = 0; x < w; x += 48) { g.fillStyle = C.grassD; g.fillRect(x, 0, 24, 10); } }
  g.fillStyle = C.path; g.fillRect(0, 10, w, 15); g.fillStyle = C.pathD; g.fillRect(0, 23, w, 2);
  if (map === 'garden') for (let x = 6; x < w; x += 32) rr(g, x, 12, 22, 10, 4, '#e8e4d8');
  else if (map === 'staden') { g.fillStyle = C.pathD; for (let x = 0; x < w; x += 24) g.fillRect(x, 10, 1, 13); g.fillRect(0, 16, w, 1); }
  else for (let i = 0; i < 18; i++) ell(g, hashN(i * 3 + 1) * w, 13 + hashN(i * 5) * 9, 1.2 + hashN(i) * 1.6, 0.9, 0, C.pathD);
  for (let x = 2; x < w; x += 12) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x + 3, -3); g.lineTo(x + 6, 4); g.fillStyle = C.grassD; g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 25, w, 3);
  GroundStrip.key = key; GroundStrip.c = c;
  return c;
}

// ---------------- thumbnails ----------------
function drawThumb(canvas, map) {
  const g = canvas.getContext('2d'), cw = canvas.width, ch = canvas.height, k = ch / (BAND * 0.62 + 46);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = lgrad(g, 0, 0, 0, ch, [[0, '#86c9ee'], [1, '#e3f3d6']]); g.fillRect(0, 0, cw, ch);
  const groundY = ch - 26 * k;
  const off = {common: 200, weiher: 560, garden: 150, staden: 640}[map];
  for (const L of LAYERS) {
    g.save(); g.setTransform(k, 0, 0, k, -off * k * (0.5 + L.par), groundY);
    const ex = {lamps: [], smoke: [], boats: [], sails: [], rail: null};
    SCENE[map][L.id](g, ex, 0);
    if (L.id === 'mid') ex.sails.forEach(([x, y]) => drawSails(g, x, y, 0.3));
    g.restore();
    if (L.id === 'mid' && map !== 'common') {
      g.save(); g.setTransform(k * 0.8, 0, 0, k * 0.8, cw * 0.62, groundY);
      (map === 'weiher' ? drawAnnahof : map === 'staden' ? drawTheater : drawHouse)(g);
      g.restore();
    }
  }
  g.setTransform(k, 0, 0, k, 0, groundY);
  const C = GROUNDS[map];
  g.fillStyle = C.grass; g.fillRect(0, 0, cw / k, 10); g.fillStyle = C.path; g.fillRect(0, 10, cw / k, 15); g.fillStyle = C.soil; g.fillRect(0, 25, cw / k, 40);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
function drawSails(g, x, y, a) {
  g.save(); g.translate(x, y); g.rotate(a);
  for (let i = 0; i < 4; i++) {
    g.rotate(Math.PI / 2);
    rr(g, -1.6, 2, 3.2, 30, 1, '#6b4a2e');
    g.fillStyle = '#f4efe4'; g.fillRect(1.6, 9, 7, 22);
    g.strokeStyle = 'rgba(107,74,46,.6)'; g.lineWidth = 0.7; for (let k = 12; k < 31; k += 4) { g.beginPath(); g.moveTo(1.6, k); g.lineTo(8.6, k); g.stroke(); }
  }
  circ(g, 0, 0, 3, '#4e3a2c');
  g.restore();
}
