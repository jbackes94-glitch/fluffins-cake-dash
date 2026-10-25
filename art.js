'use strict';
/* Art: every character, enemy, item and prop, drawn once into cached sprites (outlined and shaded),
   then blitted each frame. Coordinates are logical game units; sprites are rendered at Sprites.R px per unit. */
const TAU = Math.PI * 2;

// ---------- primitives (all take the context first) ----------
function circ(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
function ell(g, x, y, rx, ry, rot, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); }
function rrPath(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function rr(g, x, y, w, h, r, c) { g.fillStyle = c; rrPath(g, x, y, w, h, r); g.fill(); }
function tri(g, a, b, c, d, e, f, col) { g.fillStyle = col; g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.lineTo(e, f); g.closePath(); g.fill(); }
function poly(g, pts, col) { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); }
function stroke(g, w, c, cap) { g.lineWidth = w; g.strokeStyle = c; g.lineCap = cap || 'round'; g.lineJoin = 'round'; g.stroke(); }
function seg(g, x1, y1, x2, y2, w, c) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); stroke(g, w, c); }
function lgrad(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function blob(g, x, y, r, base, hi) {
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.42, r * 0.08, x, y, r);
  gr.addColorStop(0, hi); gr.addColorStop(1, base);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}
function curl(g, x, y, r, base, hi, lineCol) {
  blob(g, x, y, r, base, hi);
  g.strokeStyle = lineCol || 'rgba(125,72,30,.2)'; g.lineWidth = Math.max(0.7, r * 0.12); g.lineCap = 'round';
  g.beginPath(); g.arc(x + r * 0.06, y + r * 0.1, r * 0.5, 0.5, 3.7); g.stroke();
}
function hashN(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

// ---------- sprite cache ----------
const Sprites = {R: 2, cache: new Map(), made: 0};
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
/* box = [x0, y0, x1, y1] logical bounds around the origin. opt: {outline, oc, shade, R} */
function spr(key, box, draw, opt) {
  opt = opt || {};
  const R = opt.R || Sprites.R, k = key + '@' + R.toFixed(3);
  let s = Sprites.cache.get(k);
  if (s) return s;
  const pad = (opt.outline ? opt.outline + 1 : 1);
  const x0 = box[0] - pad, y0 = box[1] - pad, w = box[2] - box[0] + pad * 2, h = box[3] - box[1] + pad * 2;
  const c = makeCanvas(w * R, h * R), g = c.getContext('2d');
  g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R);
  draw(g);
  if (opt.shade) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = lgrad(g, 0, 0, 0, c.height, [[0, 'rgba(255,250,235,.18)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(60,30,10,.2)']]);
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'source-over';
  }
  let out = c;
  if (opt.outline) {
    out = makeCanvas(c.width, c.height);
    const o = out.getContext('2d'), t = opt.outline * R;
    for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4; o.drawImage(c, Math.cos(an) * t, Math.sin(an) * t); }
    o.globalCompositeOperation = 'source-in';
    o.fillStyle = opt.oc || 'rgba(46,28,14,.9)';
    o.fillRect(0, 0, out.width, out.height);
    o.globalCompositeOperation = 'source-over';
    o.drawImage(c, 0, 0);
  }
  s = {c: out, x0, y0, w, h};
  Sprites.cache.set(k, s); Sprites.made++;
  return s;
}
function blit(g, s, x, y, sc, flip) {
  sc = sc || 1;
  if (flip) {
    g.save(); g.translate(x, y); g.scale(-sc, sc);
    g.drawImage(s.c, s.x0, s.y0, s.w, s.h);
    g.restore();
  } else g.drawImage(s.c, x + s.x0 * sc, y + s.y0 * sc, s.w * sc, s.h * sc);
}
function clearSprites() { Sprites.cache.clear(); }

// ======================================================================
// DOGS
// ======================================================================
const FL = {body: '#e4aa70', light: '#f0c792', cream: '#f8e4c4', hi: '#fff4e2', shade: '#c88a52', deep: '#a8703f', ear: '#c27d46', earL: '#d8995b', nose: '#1c1411', eye: '#2a190f', tongue: '#f2789a'};
const MA = {coat: '#eed7ad', light: '#f8ead0', hi: '#fffaf0', shade: '#d6b887', deep: '#bf9d6c', nose: '#2e2019', eye: '#2a190f', tongue: '#f2789a'};

function legPose(P, i) {
  // i: 0 near back, 1 far back, 2 near front, 3 far front
  if (P.air === 'up') return [-0.75, -0.55, 0.85, 0.65][i];
  if (P.air === 'down' || P.air === 'glide') return [-0.25, -0.1, 0.45, 0.3][i];
  if (P.sit) return [-1.25, -1.15, 0.25, 0.15][i];
  const ph = P.p * TAU, off = [0.3, 0.95, 0, 0.6][i];
  return i < 2 ? -Math.sin(ph + off) * 0.55 : Math.sin(ph + off) * 0.6;
}
function texCurls(g, cx, cy, rx, ry, n, col, seed, r0) {
  // small c-shaped strokes scattered inside an ellipse: reads as curly doodle fur
  g.strokeStyle = col; g.lineWidth = 1.05; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = hashN(i * 3.1 + seed) * TAU, d = Math.sqrt(hashN(i * 7.7 + seed)) * 0.86;
    const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, r = (r0 || 2.6) * (0.75 + hashN(i + seed * 2) * 0.5), s = hashN(i * 5 + seed) * TAU;
    g.beginPath(); g.arc(x, y, r, s, s + 3.6); g.stroke();
  }
}
function fluffEdge(g, cx, cy, rx, ry, a0, a1, n, r, col) { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; circ(g, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, r, col); } }
function softLeg(g, hx, hy, ang, len, col, paw) {
  const px = hx + Math.sin(ang) * len, py = hy + Math.cos(ang) * len, mx = (hx + px) / 2, my = (hy + py) / 2;
  g.beginPath(); g.moveTo(hx, hy); g.lineTo(px, py - 4); stroke(g, 11.5, col);
  circ(g, mx - 5, my, 2.8, col); circ(g, mx + 5, my + 1, 2.8, col);
  ell(g, px + 1.5, py - 4, 7.2, 5.2, 0, paw);
  g.strokeStyle = 'rgba(140,85,40,.25)'; g.lineWidth = 1; g.beginPath(); g.arc(mx, my, 2.4, 0.3, 3.6); g.stroke();
}
const FL_ANCH = {body: [1, -32, 26, 16], neck: [22, -42], top: [28, -73], eye: [37, -57], head: [29, -54]};
const MA_ANCH = {body: [0, -36, 31, 15], neck: [24, -48], top: [33, -76], eye: [39, -66], head: [34, -63]};

function drawFluffin(g, P, outfit) {
  const ph = P.p * TAU, air = P.air;
  const bob = air || P.sit ? 0 : -Math.abs(Math.sin(ph)) * 2.6;
  g.save(); g.translate(0, bob);
  if (air === 'up') g.rotate(-0.1); else if (air === 'down') g.rotate(0.07);
  softLeg(g, -13, -24, legPose(P, 1), 21, FL.shade, FL.shade);
  softLeg(g, 17, -24, legPose(P, 3), 21, FL.shade, FL.shade);
  // plume tail
  const wag = P.sit ? 0.15 : Math.sin(ph * 2) * 0.3;
  g.save(); g.translate(-24, -38); g.rotate(-0.45 + wag + (air ? -0.2 : 0));
  const tp = [[0, 0, 7.6], [-3, -7, 7.2], [-5, -14, 6.6], [-4.5, -21, 5.7], [-2, -27, 4.7]];
  tp.forEach(([x, y, r], i) => circ(g, x, y, r, i < 2 ? FL.body : FL.light));
  tp.forEach(([x, y, r], i) => circ(g, x + 1, y - 1, r * 0.55, i < 3 ? FL.light : FL.cream));
  texCurls(g, -3, -13, 5, 13, 8, 'rgba(150,90,40,.28)', 51, 2.2);
  g.restore();
  // body: one soft shape with a curly edge
  fluffEdge(g, 1, -32, 24, 15, 0.1, Math.PI - 0.1, 9, 4.6, FL.shade);
  ell(g, 1, -32, 26, 16, 0, FL.body);
  fluffEdge(g, 1, -32, 25, 15.5, Math.PI * 1.02, Math.PI * 1.98, 12, 5, FL.body);
  ell(g, -1, -40, 20, 6.5, 0, 'rgba(255,236,200,.38)');
  texCurls(g, 1, -32, 24, 14, 30, 'rgba(150,90,40,.26)', 1);
  texCurls(g, 0, -39, 19, 6, 10, 'rgba(255,246,228,.55)', 5, 2.2);
  if (outfit === 'raincoat') coat(g, FL_ANCH);
  softLeg(g, -16, -23, legPose(P, 0), 21, '#e9b47a', FL.light);
  softLeg(g, 13, -23, legPose(P, 2), 21, '#e9b47a', FL.light);
  // chest ruff
  circ(g, 20, -32, 9.5, FL.light); circ(g, 22, -24, 8.2, FL.cream);
  fluffEdge(g, 22, -27, 9, 9, -0.4, 1.9, 6, 3, FL.cream);
  texCurls(g, 21, -28, 7, 8, 7, 'rgba(150,90,40,.2)', 9, 2.2);
  if (outfit === 'raincoat') hood(g, FL_ANCH);
  // collar and bone tag
  g.save(); g.translate(23, -42); g.rotate(-0.55);
  rr(g, -4.6, -10.5, 9.2, 21, 4.2, '#4a4f56'); rr(g, -3.4, -2, 6.8, 2, 1, '#6c737b');
  g.restore();
  if (outfit === 'bandana') bandana(g, FL_ANCH);
  const ts = air ? -0.45 : P.sit ? 0 : Math.sin(ph + 1) * 0.3;
  g.save(); g.translate(26, -33); g.rotate(ts);
  seg(g, 0, 0, 0, 4, 1.1, '#9aa2aa'); boneTag(g, 0, 7.5, '#d7dde2');
  g.restore();
  // head
  const hb = air ? 0 : Math.sin(ph * 2) * 0.6;
  g.save(); g.translate(0, hb);
  circ(g, 29, -54, 17, FL.light);
  fluffEdge(g, 29, -54, 16, 16, Math.PI * 0.85, Math.PI * 2.05, 13, 5, FL.light);
  [[18, -66, 6.6], [25, -70.5, 7.3], [33, -69.5, 6.8], [40, -63, 5.6]].forEach(([x, y, r]) => circ(g, x, y, r, FL.cream));
  ell(g, 37, -53, 12, 11, 0.2, FL.cream);
  texCurls(g, 28, -60, 13, 9, 16, 'rgba(150,90,40,.22)', 21);
  texCurls(g, 28, -67, 10, 4, 6, 'rgba(255,250,236,.7)', 17, 2.2);
  // muzzle and beard
  ell(g, 44, -46, 10.5, 8.6, 0, FL.cream);
  fluffEdge(g, 43, -42, 9.5, 6.5, 0.15, 2.7, 7, 3.6, FL.cream);
  ell(g, 39, -39, 7, 5.5, 0, FL.cream);
  texCurls(g, 42, -43, 9, 6, 9, 'rgba(165,115,60,.2)', 31, 2);
  if (P.tongue !== false) {
    ell(g, 45, -40.5, 4.2, 2.6, 0, '#6a2b2b');
    rr(g, 41.8, -41, 7.8, 12.5, 3.9, FL.tongue);
    seg(g, 45.7, -38.5, 45.7, -31.5, 0.8, '#d65c7a'); ell(g, 43.6, -36, 1.1, 2.4, 0, 'rgba(255,255,255,.35)');
  }
  ell(g, 52, -50.5, 5.9, 4.8, 0, FL.nose); circ(g, 50.4, -52.3, 1.6, 'rgba(255,255,255,.75)'); circ(g, 53.6, -49, 0.9, 'rgba(255,255,255,.25)');
  circ(g, 37.5, -57, 3.9, '#3a2414'); circ(g, 37.5, -57, 3.2, FL.eye); circ(g, 38.8, -58.4, 1.25, '#ffffff'); circ(g, 36.5, -55.6, 0.55, 'rgba(255,255,255,.6)');
  circ(g, 36.8, -65.2, 4.6, FL.cream); circ(g, 32.5, -64.2, 4, FL.cream);
  if (outfit === 'shades') shades(g, FL_ANCH);
  // long caramel ear with a wavy edge
  const flop = air === 'up' ? -0.65 : air ? -0.3 : P.sit ? 0.1 : 0.12 + Math.sin(ph) * 0.12;
  g.save(); g.translate(20, -61); g.rotate(flop);
  ell(g, 0, 13, 8.6, 17.5, 0, FL.ear);
  fluffEdge(g, 0, 13, 8, 17, -Math.PI * 0.45, Math.PI * 1.45, 16, 3.2, FL.ear);
  ell(g, 1.8, 8, 3.6, 9.5, 0, 'rgba(232,172,112,.5)');
  texCurls(g, 0, 14, 7, 15, 14, 'rgba(110,60,25,.32)', 41, 2.4);
  g.restore();
  if (outfit === 'santa') santa(g, FL_ANCH);
  g.restore();
  g.restore();
}

function drawMarli(g, P, outfit) {
  const ph = P.p * TAU, air = P.air;
  const bob = air || P.sit ? 0 : -Math.abs(Math.sin(ph)) * 2.4;
  g.save(); g.translate(0, bob);
  if (air === 'up') g.rotate(-0.08); else if (air === 'down') g.rotate(0.06);
  const leg = (hx, hy, a, col, paw) => {
    const len = 23, px = hx + Math.sin(a) * len, py = hy + Math.cos(a) * len;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(px, py - 3); stroke(g, 10.5, col);
    ell(g, px + 2, py - 3, 6.2, 4.2, 0, paw);
  };
  leg(-17, -26, legPose(P, 1), MA.shade, MA.shade);
  leg(19, -26, legPose(P, 3), MA.shade, MA.shade);
  // otter tail
  const wag = P.sit ? 0 : Math.sin(ph * 2) * 4;
  g.beginPath(); g.moveTo(-28, -38); g.quadraticCurveTo(-40, -44 + wag * 0.5, -50, -40 + wag); stroke(g, 8.5, MA.coat);
  g.beginPath(); g.moveTo(-40, -42 + wag * 0.4); g.quadraticCurveTo(-46, -42 + wag * 0.8, -51, -40 + wag); stroke(g, 5, MA.coat);
  // body
  g.fillStyle = lgrad(g, 0, -52, 0, -20, [[0, MA.light], [0.6, MA.coat], [1, MA.shade]]);
  g.beginPath(); g.ellipse(0, -36, 31, 15.5, 0, 0, TAU); g.fill();
  circ(g, 22, -37, 13, MA.coat); circ(g, -22, -37, 12.5, MA.coat);
  ell(g, -2, -45, 22, 5, 0, 'rgba(255,255,255,.22)');
  g.strokeStyle = 'rgba(160,120,70,.25)'; g.lineWidth = 1;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-18 + k * 8, -30); g.quadraticCurveTo(-15 + k * 8, -26, -12 + k * 8, -29); g.stroke(); }
  if (outfit === 'raincoat') coat(g, MA_ANCH);
  leg(-21, -25, legPose(P, 0), MA.coat, MA.light);
  leg(15, -25, legPose(P, 2), MA.coat, MA.light);
  // neck and chest
  g.fillStyle = MA.coat; rrPath(g, 16, -60, 19, 30, 9); g.fill();
  if (outfit === 'raincoat') hood(g, MA_ANCH);
  g.save(); g.translate(25, -48); g.rotate(-0.35);
  rr(g, -3.8, -9, 7.6, 18, 3.5, '#25406a'); rr(g, -2.8, -1.5, 5.6, 1.6, 0.8, '#4d6da0');
  g.restore();
  if (outfit === 'bandana') bandana(g, MA_ANCH);
  g.save(); g.translate(27, -39); g.rotate(air ? -0.4 : Math.sin(ph + 1) * 0.25);
  seg(g, 0, 0, 0, 4, 1.1, '#b59a4a'); circ(g, 0, 7.5, 3.6, '#e6c34f'); circ(g, -1, 6.5, 1.1, 'rgba(255,255,255,.6)');
  g.restore();
  // head
  g.fillStyle = lgrad(g, 0, -78, 0, -52, [[0, MA.light], [1, MA.coat]]);
  rrPath(g, 21, -76, 28, 24, 12); g.fill();
  rr(g, 40, -69, 17, 14, 7, MA.light);
  ell(g, 44, -58, 9, 4, 0, MA.coat);
  if (P.tongue !== false) { rr(g, 46, -59, 6.5, 10, 3.2, MA.tongue); seg(g, 49.2, -57, 49.2, -51.5, 0.8, '#d65c7a'); }
  g.beginPath(); g.moveTo(43, -60); g.quadraticCurveTo(49, -57.5, 55, -61); stroke(g, 1.2, '#8a6f52');
  ell(g, 56, -66, 4.4, 3.6, 0, MA.nose); circ(g, 54.8, -67.4, 1.2, 'rgba(255,255,255,.7)');
  circ(g, 39.5, -66.5, 3.2, '#3a2414'); circ(g, 39.5, -66.5, 2.6, MA.eye); circ(g, 40.5, -67.6, 1, '#ffffff');
  g.beginPath(); g.moveTo(36, -71); g.quadraticCurveTo(39.5, -73, 43, -71); stroke(g, 1.2, 'rgba(150,110,60,.5)');
  if (outfit === 'shades') shades(g, MA_ANCH);
  const flop = air === 'up' ? -0.5 : air ? -0.25 : 0.2 + Math.sin(ph) * 0.1;
  g.save(); g.translate(27, -71); g.rotate(flop);
  g.fillStyle = lgrad(g, 0, 0, 0, 22, [[0, MA.shade], [1, MA.deep]]);
  g.beginPath(); g.moveTo(-5, 0); g.quadraticCurveTo(-8, 14, -2, 21); g.quadraticCurveTo(4, 22, 6, 14); g.quadraticCurveTo(7, 4, 4, 0); g.closePath(); g.fill();
  g.restore();
  if (outfit === 'santa') santa(g, MA_ANCH);
  g.restore();
}

// ---------- outfits (anchored, so both dogs can wear them) ----------
function boneTag(g, x, y, c) {
  rr(g, x - 3.6, y - 1.6, 7.2, 3.2, 1.2, c);
  circ(g, x - 3.6, y - 1.4, 1.7, c); circ(g, x - 3.6, y + 1.4, 1.7, c); circ(g, x + 3.6, y - 1.4, 1.7, c); circ(g, x + 3.6, y + 1.4, 1.7, c);
  rr(g, x - 2.2, y - 0.6, 4.4, 0.8, 0.4, 'rgba(255,255,255,.75)');
}
function coat(g, A) {
  const [cx, cy, rx, ry] = A.body, cut = cy + ry * 0.5;
  g.save();
  g.beginPath(); g.rect(cx - rx - 9, cy - ry - 9, rx * 2 + 18, cut - (cy - ry - 9)); g.clip();
  g.fillStyle = lgrad(g, 0, cy - ry - 3, 0, cut, [[0, '#ffe46e'], [0.6, '#ffcf2e'], [1, '#eeb11a']]);
  g.beginPath(); g.ellipse(cx, cy, rx + 2.2, ry + 2.4, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(196,138,10,.42)'; g.lineWidth = 1;
  for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * rx * 0.36, cy - ry - 3); g.quadraticCurveTo(cx + k * rx * 0.4 + 2, cy - ry * 0.3, cx + k * rx * 0.42, cut); g.stroke(); }
  ell(g, cx - rx * 0.2, cy - ry * 0.75, rx * 0.55, ry * 0.18, -0.05, 'rgba(255,255,255,.35)');
  g.restore();
  const hw = (rx + 2.2) * Math.sqrt(Math.max(0, 1 - Math.pow((cut - cy) / (ry + 2.4), 2)));
  rr(g, cx - hw, cut - 3.2, hw * 2, 3.2, 1.6, '#dfe4e8');
  
}
function hood(g, A) {
  const [nx, ny] = A.neck;
  ell(g, nx - 4, ny - 2, 9, 6.5, -0.5, '#ffd63a'); ell(g, nx - 4, ny - 1, 6, 3.8, -0.5, '#e8a914');
  circ(g, nx + 1, ny + 6, 1.4, '#cfd5da');
}
function bandana(g, A) {
  const [nx, ny] = A.neck;
  poly(g, [nx - 6, ny + 1, nx + 10, ny + 4, nx + 1, ny + 18], '#d8343c');
  [[nx, ny + 6], [nx + 4, ny + 9], [nx + 1, ny + 12]].forEach(([x, y]) => circ(g, x, y, 1.1, '#ffffff'));
  circ(g, nx - 6, ny + 1, 2.6, '#b8262e'); tri(g, nx - 7, ny + 1, nx - 13, ny - 3, nx - 11, ny + 4, '#d8343c');
}
function shades(g, A) {
  const [ex, ey] = A.eye;
  rr(g, ex - 6.5, ey - 4.5, 13.5, 8.5, 4, '#1d1d24');
  rr(g, ex - 4.5, ey - 3, 5, 2, 1, 'rgba(255,255,255,.45)');
  seg(g, ex - 6.5, ey - 2, ex - 15, ey - 4, 1.6, '#1d1d24');
}
function santa(g, A) {
  const [tx, ty] = A.top;
  g.fillStyle = lgrad(g, tx, ty - 20, tx, ty + 4, [[0, '#ef4652'], [1, '#c02632']]);
  g.beginPath(); g.moveTo(tx - 13, ty + 3); g.quadraticCurveTo(tx - 6, ty - 18, tx - 22, ty - 20); g.quadraticCurveTo(tx + 2, ty - 22, tx + 13, ty + 1); g.closePath(); g.fill();
  rr(g, tx - 15, ty - 1, 30, 7, 3.5, '#ffffff'); circ(g, tx - 23, ty - 20, 4.5, '#ffffff');
}

// ---------- dog sprites ----------
const DOG_BOX = {fluffin: [-46, -96, 62, 6], marli: [-56, -96, 64, 6]};
function dogSprite(char, outfit, pose, frame, R) {
  const P = pose === 'run' ? {p: frame / 8} : pose === 'sit' ? {p: 0, sit: true, tongue: true} : {p: 0, air: pose};
  return spr('dog:' + char + ':' + outfit + ':' + pose + ':' + frame, DOG_BOX[char],
    g => (char === 'marli' ? drawMarli : drawFluffin)(g, P, outfit), {outline: 1.3, oc: char === 'marli' ? '#7d6343' : '#6e4220', shade: true, R});
}

// ---------- capybara ----------
function drawCapy(g, f) {
  const sw = Math.sin(f / 4 * TAU) * 2.5;
  rr(g, -9 - sw, -11, 7.5, 11, 3.5, '#5c3c22'); rr(g, 14 + sw, -11, 7.5, 11, 3.5, '#5c3c22');
  g.fillStyle = lgrad(g, 0, -36, 0, -8, [[0, '#b07c50'], [1, '#86592f']]);
  rrPath(g, -25, -36, 47, 28, 14); g.fill();
  rr(g, -16 + sw, -11, 7.5, 11, 3.5, '#6b4628'); rr(g, 7 - sw, -11, 7.5, 11, 3.5, '#6b4628');
  g.fillStyle = lgrad(g, 0, -46, 0, -22, [[0, '#a2714a'], [1, '#86592f']]);
  rrPath(g, 8, -45, 28, 23, 9); g.fill();
  rr(g, 25, -40, 13, 16, 6, '#73492b');
  circ(g, 13, -45, 3.6, '#6b4628'); circ(g, 13, -45, 1.8, '#4a2f1a');
  circ(g, 21.5, -37, 2.1, '#1d140c'); circ(g, 22.2, -37.7, 0.8, '#ffffff');
  seg(g, 34, -33, 36, -32, 1.2, '#3a2717');
  blob(g, 17, -50, 6, '#f2a33a', '#ffd27a');
  ell(g, 20.5, -55.5, 3.4, 1.6, -0.5, '#5c9a3c');
}
function capySprite(f, R) { return spr('capy:' + f, [-28, -60, 42, 3], g => drawCapy(g, f), {outline: 1.2, oc: '#3d2814', shade: true, R}); }

// ======================================================================
// ENEMIES (face left; ground ones have the origin at the feet, fliers at their centre)
// ======================================================================
const EN = {};
EN.pigeon = (g, f) => {
  const s = Math.sin(f / 4 * TAU);
  g.translate(0, -11);
  seg(g, -2, 7, -3 + s * 2, 11, 2, '#d0715a'); seg(g, 3, 7, 4 - s * 2, 11, 2, '#d0715a');
  tri(g, 10, -2, 22, -6, 22, 4, '#6f7684');
  g.fillStyle = lgrad(g, 0, -9, 0, 9, [[0, '#b2b8c2'], [1, '#8a919d']]); g.beginPath(); g.ellipse(0, 0, 14, 9, 0, 0, TAU); g.fill();
  ell(g, 3, -1, 9, 5, -0.15, '#80889a'); seg(g, 0, 0, 9, -1, 1.6, '#5e6573');
  circ(g, -11, -6 + Math.max(0, s) * 1.5, 6.5, '#7b8494');
  g.beginPath(); g.arc(-11, -6, 6, 0.6, 1.9); stroke(g, 2.5, '#5fae8f');
  tri(g, -17, -7, -22, -5, -17, -4, '#4b4f57'); circ(g, -13, -8, 1.7, '#ff8a2a'); circ(g, -13.4, -8.4, 0.6, '#ffffff');
};
EN.high = (g, f) => {
  const s = Math.sin(f / 4 * TAU);
  tri(g, 10, -2, 22, -6, 22, 4, '#6f7684');
  g.fillStyle = lgrad(g, 0, -9, 0, 9, [[0, '#b2b8c2'], [1, '#8a919d']]); g.beginPath(); g.ellipse(0, 0, 14, 8.5, 0, 0, TAU); g.fill();
  circ(g, -11, -6, 6.5, '#7b8494'); g.beginPath(); g.arc(-11, -6, 6, 0.6, 1.9); stroke(g, 2.5, '#5fae8f');
  tri(g, -17, -7, -22, -5, -17, -4, '#4b4f57'); circ(g, -13, -8, 1.7, '#ff8a2a');
  poly(g, [-5, -3, 11, -3, 6, -3 - 17 * s, -2, -3 - 12 * s], '#9097a6');
};
EN.turkey = (g, f) => {
  const b = Math.sin(f / 4 * TAU) * 2;
  seg(g, -3, -10, -5 + b, 0, 3, '#e08a2e'); seg(g, 5, -10, 6 - b, 0, 3, '#e08a2e');
  const cols = ['#7a3f1f', '#c9853a', '#e9c46a', '#a85a2a', '#c9853a', '#7a3f1f', '#e9c46a'];
  for (let i = 0; i < cols.length; i++) {
    const a0 = -Math.PI * 0.95 + i * (Math.PI * 0.9 / cols.length);
    g.fillStyle = cols[i]; g.beginPath(); g.moveTo(9, -20 + b); g.arc(9, -20 + b, 25, a0, a0 + Math.PI * 0.9 / cols.length + 0.02); g.fill();
  }
  ell(g, 0, -18 + b, 15, 12, 0, '#5b3a22'); rr(g, -15, -34 + b, 6, 16, 3, '#5b3a22');
  circ(g, -13, -35 + b, 6, '#b9c7d6'); tri(g, -18, -37 + b, -24, -35 + b, -18, -33 + b, '#e8b13a');
  ell(g, -17, -29 + b, 2.5, 5, 0.2, '#d33b2f'); circ(g, -14, -37 + b, 1.6, '#1d140c');
};
EN.squirrel = (g, f) => {
  const b = Math.sin(f / 4 * TAU) * 1.5;
  [[11, -10, 7, '#8f939c'], [15, -18, 8, '#9ea2ab'], [12, -26, 7, '#a7abb3'], [7, -29, 5, '#c3c6cc']].forEach(([x, y, r, c]) => blob(g, x, y + b, r, c, '#d6d8dc'));
  g.fillStyle = lgrad(g, 0, -17, 0, -1, [[0, '#9a9ea7'], [1, '#7c8089']]); g.beginPath(); g.ellipse(-1, -9, 11, 8, 0, 0, TAU); g.fill();
  ell(g, -5, -7, 5, 5, 0, '#ebe6db');
  blob(g, -10, -15, 6.5, '#868a93', '#a9adb5'); tri(g, -11, -20, -8, -26, -5, -19, '#868a93');
  circ(g, -13, -16, 1.8, '#111111'); circ(g, -12.5, -16.6, 0.65, '#ffffff'); circ(g, -16.5, -14, 1.3, '#2a2a2a');
  blob(g, -12, -8, 2.9, '#a8743a', '#d29d5c'); rr(g, -14.6, -11.4, 5.2, 2, 1, '#6b4a2a');
  rr(g, -8, -3, 6, 3, 1.5, '#6f737c'); rr(g, 4, -3, 6, 3, 1.5, '#6f737c');
};
EN.hedgehog = (g, f) => {
  const b = Math.sin(f / 4 * TAU) * 0.8;
  for (let i = 0; i <= 13; i++) {
    const a = Math.PI * (1 + i / 13);
    poly(g, [3 + Math.cos(a - 0.17) * 12, -8 + Math.sin(a - 0.17) * 10, 3 + Math.cos(a) * 20.5, -8 + Math.sin(a) * 18.5 + b, 3 + Math.cos(a + 0.17) * 12, -8 + Math.sin(a + 0.17) * 10], i % 2 ? '#4e3626' : '#5f4430');
  }
  g.fillStyle = lgrad(g, 0, -18, 0, 0, [[0, '#8f6c50'], [1, '#6c4f39']]); g.beginPath(); g.ellipse(3, -8, 15, 9.5, 0, 0, TAU); g.fill();
  g.strokeStyle = '#b08b68'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-6 + i * 4, -6); g.lineTo(-4 + i * 4, -13); g.stroke(); }
  blob(g, -11, -5, 6.5, '#d8b98e', '#ecd6b4'); tri(g, -14, -8, -21, -4, -14, -2, '#d8b98e');
  circ(g, -21, -4, 1.9, '#1b120c'); circ(g, -12, -7, 1.5, '#1b120c'); circ(g, -11.6, -7.4, 0.5, '#ffffff');
  rr(g, -8, -2, 5, 2.5, 1, '#5a3f2c'); rr(g, 6, -2, 5, 2.5, 1, '#5a3f2c');
};
function goose(g, f, angry, swan) {
  const b = Math.sin(f / 4 * TAU) * 1.5;
  seg(g, -2, -10, -4 + b, 0, 2.5, swan ? '#3a3a3a' : '#1d1d1d'); seg(g, 5, -10, 6 - b, 0, 2.5, swan ? '#3a3a3a' : '#1d1d1d');
  if (swan) {
    g.fillStyle = lgrad(g, 0, -30, 0, -6, [[0, '#ffffff'], [1, '#e2ded2']]); g.beginPath(); g.ellipse(4, -18, 19, 12, 0, 0, TAU); g.fill();
    if (angry) ell(g, 9, -29, 14, 6, -0.6, '#ffffff');
    ell(g, 9, -21, 13, 8, -0.25, '#efebe1'); tri(g, 20, -22, 27, -27, 22, -16, '#f7f5ef');
    g.beginPath(); g.moveTo(-8, -24); g.bezierCurveTo(-3, -34 + b, -19, -36 + b, -13, -44 + b); stroke(g, 6, '#f7f5ef');
    ell(g, -14, -45 + b, 6, 4.5, 0, '#f7f5ef'); ell(g, -17.5, -45 + b, 2, 1.6, 0, '#222222');
    tri(g, -19, -47 + b, -26, -44 + b, -19, -42 + b, '#f08a2a'); circ(g, -19.5, -46.5 + b, 1.5, '#222222');
    circ(g, -15, -46.5 + b, 1.2, angry ? '#ff4a3a' : '#222222');
  } else {
    g.fillStyle = lgrad(g, 0, -30, 0, -6, [[0, '#9c876f'], [1, '#78644f']]); g.beginPath(); g.ellipse(4, -18, 18, 11, 0, 0, TAU); g.fill();
    ell(g, 0, -12.5, 12, 6, 0, '#efe8da'); ell(g, 8, -20, 12, 7, -0.15, '#6b5947'); ell(g, 21, -21, 5, 3, 0.2, '#1f1f1f');
    g.beginPath(); g.moveTo(-8, -24); g.quadraticCurveTo(-15, -34 + b, -12, -42 + b); stroke(g, 6, '#1c1c1c');
    ell(g, -14, -44 + b, 7, 5.5, 0, '#1c1c1c'); ell(g, -12, -42 + b, 3, 2.4, 0, '#f4f1ea');
    tri(g, -20, -46 + b, -26, -43 + b, -20, -41 + b, '#2a2a2a'); circ(g, -16, -46 + b, 1.4, angry ? '#ff4a3a' : '#eeeeee');
  }
  if (angry) { g.beginPath(); g.moveTo(-6, -56); g.lineTo(-2, -52); g.moveTo(-2, -56); g.lineTo(-6, -52); stroke(g, 2, '#ff5a4a'); }
}
EN.goose = (g, f, st) => goose(g, f, st === 'angry', false);
EN.swan = (g, f, st) => goose(g, f, st === 'angry', true);
EN.hoover = (g, f) => {
  rr(g, -19, -11, 38, 10, 5, '#24272d');
  g.fillStyle = lgrad(g, 0, -18, 0, -4, [[0, '#59606c'], [1, '#353a44']]); g.beginPath(); g.ellipse(0, -11, 19, 7, 0, 0, TAU); g.fill();
  ell(g, 0, -12, 11, 4, 0, '#6a7280'); circ(g, 0, -12.5, 2.4, f % 2 ? '#6fe0ff' : '#2d8fb0');
  rr(g, -21, -7, 6, 4, 2, '#8a93a3');
  g.save(); g.translate(-14, -1.5); g.rotate(f * 0.8); seg(g, -4, 0, 4, 0, 1.2, '#9aa3b3'); seg(g, 0, -4, 0, 4, 1.2, '#9aa3b3'); g.restore();
};
EN.duck = (g, f) => {
  const s = Math.sin(f / 4 * TAU);
  g.translate(0, -11);
  seg(g, -2, 8, -3 + s * 2, 11, 2, '#f08a2a'); seg(g, 3, 8, 4 - s * 2, 11, 2, '#f08a2a');
  tri(g, 11, -3, 20, -8, 17, 1, '#2b2b2b'); g.beginPath(); g.arc(17, -9, 2.4, 0.5, 3.6); stroke(g, 1.4, '#2b2b2b');
  g.fillStyle = lgrad(g, 0, -8, 0, 9, [[0, '#b8a693'], [1, '#948270']]); g.beginPath(); g.ellipse(1, 0, 14, 8.5, 0, 0, TAU); g.fill();
  ell(g, -4, 2, 8, 5, 0, '#8a5c40'); ell(g, 5, -2, 8.5, 4.5, -0.15, '#7d7064'); rr(g, 5, -2, 5, 2, 0.5, '#3b5fb5');
  blob(g, -11, -8, 6.3, '#2f7a4a', '#4fae6e'); g.beginPath(); g.arc(-11, -8, 6, 0.9, 2.1); stroke(g, 1.6, '#ffffff');
  rr(g, -23, -10, 8.5, 4, 2, '#f2c230'); circ(g, -13, -10, 1.4, '#111111');
};
EN.heron = (g, f) => {
  const s = Math.sin(f / 4 * TAU);
  seg(g, 10, 2, 28, 4, 1.6, '#d8c070'); seg(g, 10, 3, 27, 7, 1.6, '#d8c070');
  g.fillStyle = lgrad(g, 0, -6, 0, 6, [[0, '#c3cad0'], [1, '#98a1a8']]); g.beginPath(); g.ellipse(2, 0, 14, 6, 0, 0, TAU); g.fill();
  g.fillStyle = '#8e979f'; g.beginPath(); g.moveTo(-6, -2); g.quadraticCurveTo(0, -6 - 20 * s, 20, -4 - 18 * s); g.quadraticCurveTo(12, -1 - 4 * s, 14, 0); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(4, -4 - 12 * s); g.quadraticCurveTo(12, -5 - 17 * s, 20, -4 - 18 * s); stroke(g, 2.2, '#4e555e');
  g.beginPath(); g.moveTo(-10, -1); g.quadraticCurveTo(-16, 2, -14, -5); stroke(g, 4, '#c9cfd4');
  circ(g, -15, -6, 4, '#e3e7ea'); seg(g, -14, -8, -7, -10, 1.3, '#2b2f36');
  tri(g, -18, -7.5, -29, -5, -18, -4.5, '#e1b33c'); circ(g, -16, -6.6, 0.9, '#111111');
};
EN.boar = (g, f) => {
  const b = Math.sin(f / 4 * TAU);
  rr(g, -12 + b * 2, -9, 5, 9, 2, '#3a2f27'); rr(g, 9 - b * 2, -9, 5, 9, 2, '#3a2f27');
  g.beginPath(); g.moveTo(19, -16); g.quadraticCurveTo(24, -14 + b, 22, -10); stroke(g, 1.4, '#3a2f27');
  g.fillStyle = lgrad(g, 0, -26, 0, -5, [[0, '#6e5745'], [1, '#4c3b2e']]); g.beginPath(); g.ellipse(3, -15, 18, 10.5, 0, 0, TAU); g.fill();
  g.strokeStyle = '#3d3027'; g.lineWidth = 1.3;
  for (let k = 0; k < 9; k++) { const bx = -12 + k * 3.5; g.beginPath(); g.moveTo(bx, -23 + Math.abs(k - 4) * 0.6); g.lineTo(bx + 1, -28.5 + Math.abs(k - 4) * 0.8); g.stroke(); }
  rr(g, -6 - b * 2, -9, 5, 9, 2, '#2e251f'); rr(g, 14 + b * 2, -9, 5, 9, 2, '#2e251f');
  ell(g, -13, -14, 9, 7.5, 0.1, '#58463a'); tri(g, -18, -18, -27, -12, -18, -8, '#58463a');
  ell(g, -27, -12, 2.4, 3, 0, '#9a7f72'); circ(g, -27.6, -12.6, 0.6, '#3b2b25'); circ(g, -26.6, -11, 0.6, '#3b2b25');
  tri(g, -23, -10, -25, -15.5, -21, -11, '#f6eedc'); tri(g, -11, -20, -8, -27, -6, -19, '#3d3027');
  circ(g, -15, -16, 1.4, '#111111'); circ(g, -14.6, -16.4, 0.45, '#ffffff');
};
EN.cart = (g, f) => {
  // Bollerwagen: a wooden handcart with a crate of drinks
  const r = f * 0.8;
  g.fillStyle = lgrad(g, 0, -22, 0, -8, [[0, '#a8743e'], [1, '#7a4f26']]); rrPath(g, -18, -22, 36, 13, 3); g.fill();
  g.strokeStyle = '#5e3c1c'; g.lineWidth = 1; for (let k = -12; k <= 12; k += 8) { g.beginPath(); g.moveTo(k, -22); g.lineTo(k, -9); g.stroke(); }
  rr(g, -12, -30, 11, 8, 1.5, '#2e6fb5'); rr(g, 1, -30, 11, 8, 1.5, '#2e6fb5');
  for (let k = 0; k < 4; k++) circ(g, -9 + k * 6, -31, 1.6, '#3f8a3c');
  seg(g, -18, -18, -30, -28, 2, '#5e3c1c'); rr(g, -33, -31, 6, 3, 1.5, '#222222');
  for (const wx of [-11, 11]) { circ(g, wx, -5, 5.5, '#2b2b2b'); circ(g, wx, -5, 2.6, '#b0b0b0'); g.save(); g.translate(wx, -5); g.rotate(r); seg(g, -4, 0, 4, 0, 1, '#555555'); g.restore(); }
};
EN.blackbird = (g, f) => {
  const s = Math.sin(f / 4 * TAU);
  g.translate(0, -10);
  seg(g, -1, 7, -2 + s * 2, 10, 1.8, '#7a5a3a'); seg(g, 3, 7, 4 - s * 2, 10, 1.8, '#7a5a3a');
  tri(g, 9, -3, 21, -7, 19, 2, '#151515');
  g.fillStyle = lgrad(g, 0, -8, 0, 8, [[0, '#2c2c2e'], [1, '#121214']]); g.beginPath(); g.ellipse(0, 0, 12.5, 8, 0, 0, TAU); g.fill();
  blob(g, -10, -6, 6, '#1b1b1d', '#3a3a3e'); ell(g, 4, -1, 7.5, 4, -0.2, '#26262a');
  tri(g, -15, -7.5, -21, -5.5, -15, -4.5, '#ffb21e'); circ(g, -12, -7.5, 1.7, '#ffb21e'); circ(g, -12, -7.5, 1, '#111111');
};
EN.magpie = (g, f) => {
  const s = Math.sin(f / 4 * TAU);
  poly(g, [9, -1, 30, -5, 30, 1, 9, 2], '#1d2a3a');
  g.fillStyle = '#16181c'; g.beginPath(); g.ellipse(0, 0, 13, 7, 0, 0, TAU); g.fill();
  ell(g, 1, 2, 8, 4.5, 0, '#f4f4f4');
  poly(g, [-5, -2, 12, -2, 5, -4 - 17 * s], '#1f2b45'); poly(g, [-1, -2, 8, -2, 4, -3 - 11 * s], '#f4f4f4');
  blob(g, -11, -4, 5.5, '#141416', '#33363c'); tri(g, -15, -5, -22, -3.5, -15, -2.5, '#222222');
  circ(g, -12, -5, 1.2, '#ffffff');
};
EN.fox = (g, f) => {
  const b = Math.sin(f / 4 * TAU);
  seg(g, -10 + b * 3, -10, -12 + b * 4, 0, 3.6, '#2b211b'); seg(g, 10 - b * 3, -10, 12 - b * 4, 0, 3.6, '#2b211b');
  g.beginPath(); g.moveTo(16, -17); g.quadraticCurveTo(30, -22 + b * 2, 34, -14 + b * 2); stroke(g, 9, '#d8662a');
  circ(g, 34, -14 + b * 2, 4.4, '#fff4e8');
  g.fillStyle = lgrad(g, 0, -26, 0, -8, [[0, '#ef7c36'], [1, '#c4561f']]); g.beginPath(); g.ellipse(3, -17, 16, 8.5, 0, 0, TAU); g.fill();
  ell(g, -4, -12, 9, 4, 0, '#fff0e0');
  seg(g, -6 - b * 3, -10, -8 - b * 4, 0, 3.6, '#3a2c24'); seg(g, 6 + b * 3, -10, 8 + b * 4, 0, 3.6, '#3a2c24');
  blob(g, -14, -21, 7, '#ea7432', '#f8a165'); poly(g, [-18, -21, -30, -17, -17, -15], '#ea7432');
  poly(g, [-17, -18, -30, -17, -18, -14], '#fff4e8'); circ(g, -30, -17, 1.6, '#1b1210');
  tri(g, -17, -26, -14, -35, -10, -25, '#c4561f'); tri(g, -15.5, -27, -14, -32, -12, -26.5, '#2b211b');
  circ(g, -17, -22, 1.4, '#1b1210'); circ(g, -16.6, -22.4, 0.5, '#ffffff');
};
EN.gnome = (g, f, st) => {
  const b = Math.abs(Math.sin(f / 4 * TAU)) * 1.5;
  rr(g, -9, -6, 8, 6, 2.5, '#4a2c18'); rr(g, 1, -6, 8, 6, 2.5, '#4a2c18');
  g.fillStyle = lgrad(g, 0, -24, 0, -5, [[0, '#3c7fd1'], [1, '#2a5ea3']]); rrPath(g, -11, -24 - b, 22, 19, 8); g.fill();
  rr(g, -11, -13 - b, 22, 3, 1.5, '#5a3a1e');
  blob(g, 0, -29 - b, 7.5, '#f2c9a4', '#ffe2c8');
  g.fillStyle = '#f4f4f4'; g.beginPath(); g.moveTo(-7, -29 - b); g.quadraticCurveTo(-4, -14 - b, 0, -17 - b); g.quadraticCurveTo(4, -14 - b, 7, -29 - b); g.closePath(); g.fill();
  ell(g, -4.8, -27 - b, 2.2, 2.6, 0, '#e98a8a');
  circ(g, -2.5, -31 - b, 1.2, '#1b1210');
  if (st === 'angry') { seg(g, -5, -34 - b, -1, -33 - b, 1.2, '#1b1210'); circ(g, -2.5, -31 - b, 1.2, '#ff3a2a'); }
  g.fillStyle = '#d92e36'; g.beginPath(); g.moveTo(-9, -32 - b); g.quadraticCurveTo(-1, -54 - b, 7, -52 - b); g.quadraticCurveTo(4, -42 - b, 9, -32 - b); g.closePath(); g.fill();
  rr(g, -9, -35 - b, 18, 4, 2, '#b8262e');
  seg(g, 11, -18 - b, 15, -30 - b, 2, '#6b4a2a'); poly(g, [13, -32 - b, 19, -36 - b, 16, -28 - b], '#9aa2aa');
};
EN.mower = (g, f) => {
  circ(g, -12, -4.5, 4.6, '#1f1f1f'); circ(g, 12, -4.5, 4.6, '#1f1f1f'); circ(g, -12, -4.5, 1.6, '#808080'); circ(g, 12, -4.5, 1.6, '#808080');
  g.fillStyle = lgrad(g, 0, -18, 0, -5, [[0, '#55b55e'], [1, '#2f8a3c']]);
  g.beginPath(); g.moveTo(-20, -5); g.lineTo(-17, -16); g.quadraticCurveTo(0, -20, 15, -17); g.lineTo(21, -6); g.closePath(); g.fill();
  rr(g, -10, -20, 18, 5, 2.5, '#f2f2ec'); circ(g, -1, -17.6, 1.8, f % 2 ? '#ffde4a' : '#9a8a3a');
  seg(g, -16, -9, 18, -9, 1, '#246f30'); circ(g, 15, -12, 1.2, '#ff5a3a');
};

const EN_BOX = {
  pigeon: [-25, -28, 25, 2], high: [-25, -22, 25, 12], turkey: [-26, -48, 36, 2], squirrel: [-20, -36, 24, 2], hedgehog: [-23, -28, 26, 2],
  goose: [-30, -62, 30, 2], swan: [-30, -62, 30, 2], hoover: [-24, -20, 22, 2], duck: [-25, -26, 23, 2], heron: [-32, -24, 30, 10],
  boar: [-30, -32, 26, 2], cart: [-35, -36, 20, 2], blackbird: [-23, -20, 23, 2], magpie: [-24, -22, 32, 10], fox: [-32, -38, 40, 2],
  gnome: [-12, -58, 21, 2], mower: [-22, -23, 23, 2]
};
const SKIN = {
  common: {pigeon: 'pigeon', high: 'high', turkey: 'turkey', squirrel: 'squirrel', hedgehog: 'hedgehog', goose: 'goose', hoover: 'hoover'},
  weiher: {pigeon: 'duck', high: 'heron', turkey: 'boar', squirrel: 'squirrel', hedgehog: 'hedgehog', goose: 'swan', hoover: 'cart'},
  garden: {pigeon: 'blackbird', high: 'magpie', turkey: 'fox', squirrel: 'squirrel', hedgehog: 'hedgehog', goose: 'gnome', hoover: 'mower'}
};
function enemySprite(art, f, st, R) {
  return spr('en:' + art + ':' + f + ':' + (st || ''), EN_BOX[art], g => EN[art](g, f, st), {outline: 1.1, oc: 'rgba(30,24,20,.85)', shade: true, R});
}

// ---------- bosses ----------
function bossSprite(map, f, st, R) {
  const art = map === 'weiher' ? 'swan' : map === 'garden' ? 'mower' : map === 'staden' ? 'nutria' : 'goose';
  const k = art === 'mower' ? 3.2 : art === 'nutria' ? 2.5 : 2.3;
  const box = EN_BOX[art].map(v => v * k);
  box[1] -= 22;
  return spr('boss:' + map + ':' + f + ':' + st, box, g => {
    g.save(); g.scale(k, k);
    EN[art](g, f, 'angry');
    g.restore();
    if (art === 'swan') {
      // a golden crown
      g.save(); g.translate(-32, -112 + Math.sin(f / 4 * TAU) * 3);
      poly(g, [-10, 0, -10, -10, -5, -4, 0, -13, 5, -4, 10, -10, 10, 0], '#ffcf2e'); rr(g, -10, -2, 20, 4, 1, '#e8a914');
      circ(g, 0, -2, 1.6, '#e5486b'); g.restore();
    } else if (art === 'goose') {
      g.save(); g.translate(-34, -108);
      rr(g, -10, -6, 20, 6, 2, '#d8343c'); g.restore();
    } else if (art === 'nutria') {
      drawGrubenhelm(g, f);
      ell(g, -40, -46, 4, 3, 0, '#ffffff'); circ(g, -40.5, -45.5, 2, '#ff3a2a'); seg(g, -46, -52, -34, -49, 2.2, '#2a1a10');
    } else {
      // spinning blades and glaring eyes
      for (let i = 0; i < 3; i++) { const a = f * 0.7 + i * TAU / 3; seg(g, -66, -6, -66 + Math.cos(a) * 10, -6 + Math.sin(a) * 3, 2.4, '#d5dce1'); }
      ell(g, -46, -36, 7, 5, -0.2, '#ffffff'); circ(g, -48, -35.5, 2.8, '#ff3a2a'); circ(g, -48.6, -36.4, 0.9, '#ffffff');
      ell(g, -30, -40, 7, 5, -0.2, '#ffffff'); circ(g, -32, -39.5, 2.8, '#ff3a2a'); circ(g, -32.6, -40.4, 0.9, '#ffffff');
      seg(g, -54, -44, -40, -40, 2.6, '#16361c'); seg(g, -37, -46, -23, -47, 2.6, '#16361c');
      g.beginPath(); g.moveTo(-50, -24); g.lineTo(-44, -27); g.lineTo(-38, -24); g.lineTo(-32, -27); g.lineTo(-26, -24); stroke(g, 2, '#16361c');
    }
    if (st === 'hurt') { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,255,.65)'; g.fillRect(-200, -300, 400, 400); g.globalCompositeOperation = 'source-over'; }
  }, {outline: 1.6, oc: 'rgba(30,20,15,.9)', shade: true, R});
}
function projSprite(map, R) {
  return spr('proj:' + map, [-12, -12, 12, 12], g => {
    if (map === 'weiher') { g.rotate(-0.5); ell(g, 0, 0, 10, 3.6, 0, '#ffffff'); seg(g, -10, 0, 10, 0, 0.8, '#c9c4b8'); }
    else if (map === 'staden') { IT.grumbeer(g); }
    else if (map === 'garden') { for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; seg(g, 0, 2, Math.cos(a) * 9, Math.sin(a) * 6 - 2, 2, i % 2 ? '#4f9a3c' : '#6dbb4e'); } blob(g, 0, 3, 5, '#5a3f2a', '#7a5a3a'); }
    else { blob(g, 0, 0, 8, '#b9c7d6', '#ffffff'); g.font = '700 9px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#3b4b5c'; g.fillText('!', 0, 0.5); }
  }, {outline: 1, oc: 'rgba(30,24,20,.8)', R});
}

// ======================================================================
// ITEMS
// ======================================================================
const IT = {};
IT.cake = g => {
  g.fillStyle = lgrad(g, 0, -8, 0, 8, [[0, '#fbe3a6'], [1, '#e9c278']]);
  g.beginPath(); g.moveTo(-13, 2); g.lineTo(11, -8); g.lineTo(11, 8); g.lineTo(-13, 8); g.closePath(); g.fill();
  g.fillStyle = '#f2a7c3'; g.fillRect(-9, 2, 20, 2.5);
  g.beginPath(); g.moveTo(-14, 2); g.lineTo(12, -9); g.lineTo(12, -5); g.lineTo(-12, 4); g.closePath(); g.fill();
  g.fillStyle = '#fbe9b5'; g.fillRect(9, -6, 2, 14);
  blob(g, 7, -11, 3.8, '#d62a3d', '#ff8f9c');
};
IT.ball = g => {
  const r = 7.5; blob(g, 0, 0, r, '#c6df2b', '#eef98a');
  g.beginPath(); g.arc(-r * 1.05, 0, r * 0.85, -0.9, 0.9); stroke(g, 1.8, '#fbfbf0');
  g.beginPath(); g.arc(r * 1.05, 0, r * 0.85, Math.PI - 0.9, Math.PI + 0.9); stroke(g, 1.8, '#fbfbf0');
};
IT.apple = (g, v) => {
  const c = v === 3 ? '#8bc34a' : '#d93a2f', h = v === 3 ? '#c8ec8a' : '#ff8a70';
  blob(g, -2.6, 0.5, 6.4, c, h); blob(g, 2.6, 0.5, 6.4, c, h);
  seg(g, 0, -5, 1, -9, 1.5, '#6b4a2a'); ell(g, 4.2, -8.3, 3.4, 1.6, -0.5, '#4f9a3c');
};
IT.omaApple = g => {
  IT.apple(g, 0);
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, 3); g.bezierCurveTo(-4, -0.5, -2, -3.5, 0, -1.6); g.bezierCurveTo(2, -3.5, 4, -0.5, 0, 3); g.fill();
};
IT.fk = g => {
  rr(g, -12, 2, 24, 6, 3, '#d99a52');
  g.fillStyle = lgrad(g, 0, -3, 0, 3, [[0, '#f0b09c'], [1, '#d98b76']]); rrPath(g, -14, -3, 28, 6, 2); g.fill();
  rr(g, -14, -3, 28, 1.3, 0.6, '#b8664a'); circ(g, -6, 0, 0.9, 'rgba(255,255,255,.45)'); circ(g, 3, 1, 0.9, 'rgba(255,255,255,.45)');
  g.beginPath(); g.moveTo(-10, -3.5); g.quadraticCurveTo(-5, -6, 0, -3.5); g.quadraticCurveTo(5, -1, 10, -3.5); stroke(g, 1.4, '#f2d23a');
  g.fillStyle = lgrad(g, 0, -11, 0, -4, [[0, '#f0c27a'], [1, '#d99a52']]); g.beginPath(); g.ellipse(0, -5, 12.5, 6, 0, Math.PI, 0); g.fill();
  seg(g, -5, -9, -2, -6, 1, '#b77f3a'); seg(g, 2, -10, 5, -7, 1, '#b77f3a');
};
IT.lyoner = g => {
  g.beginPath(); g.arc(0, 0, 9, -1.2, 4.3); stroke(g, 6.8, '#c97b68');
  g.beginPath(); g.arc(0, 0, 9.4, -1.1, 4.2); stroke(g, 3, '#ecac9c');
  g.beginPath(); g.arc(0, 0, 10.8, 2.4, 3.6); stroke(g, 1, 'rgba(255,255,255,.55)');
  rr(g, 0.5, -12.5, 4, 5, 1, '#9aa2aa'); rr(g, -4.5, -12, 4, 5, 1, '#9aa2aa');
};
IT.treat = g => {
  // bone-shaped biscuit
  g.save(); g.rotate(-0.25);
  const c = '#d9a05c', h = '#f1c98a';
  rr(g, -8, -3, 16, 6, 2.5, c);
  blob(g, -8, -3, 3.6, c, h); blob(g, -8, 3, 3.6, c, h); blob(g, 8, -3, 3.6, c, h); blob(g, 8, 3, 3.6, c, h);
  circ(g, -3, 0, 0.8, '#b57a3c'); circ(g, 2, -1, 0.8, '#b57a3c'); circ(g, 4, 1.2, 0.8, '#b57a3c');
  g.restore();
};
IT.cheese = g => {
  poly(g, [-7, -4, 3, -9, 10, -5, 0, 0], '#ffe27a'); poly(g, [-7, -4, 0, 0, 0, 9, -7, 5], '#f6c63a'); poly(g, [0, 0, 10, -5, 10, 4, 0, 9], '#e9b22a');
  circ(g, -3.5, 2, 1.4, '#d99a1a'); circ(g, 5, 2, 1.6, '#c98a14'); circ(g, 2, -5, 1.2, '#e9b22a');
};
IT.liver = g => {
  // Leberwurst: a fat sausage with clips
  g.save(); g.rotate(-0.2);
  g.fillStyle = lgrad(g, 0, -6, 0, 6, [[0, '#d7a080'], [1, '#a8684a']]); rrPath(g, -12, -5.5, 24, 11, 5.5); g.fill();
  rr(g, -8, -4, 12, 2, 1, 'rgba(255,255,255,.3)');
  rr(g, -14.5, -2, 3, 4, 1, '#9aa2aa'); rr(g, 11.5, -2, 3, 4, 1, '#9aa2aa'); seg(g, 14.5, 0, 17, -3, 1, '#c9b38a');
  g.restore();
};
IT.lickmat = g => {
  rr(g, -11, -9, 22, 18, 4, '#3fb3a8');
  g.strokeStyle = '#2a8a80'; g.lineWidth = 1.2;
  for (let k = -6; k <= 6; k += 4) { g.beginPath(); g.moveTo(-8, k); for (let x = -8; x <= 8; x += 4) g.lineTo(x + 2, k + ((x / 4) % 2 ? 1.5 : -1.5)); g.stroke(); }
  ell(g, 3, -2, 4, 2.4, 0.3, 'rgba(165,110,70,.85)');
};
IT.sock = (g, v) => {
  const [base, str] = [['#ffffff', '#e5486b'], ['#2f5fb3', '#ffd23f'], ['#f3e6c8', '#4f8a3b'], ['#3a3a3a', '#f59ac0']][v || 0];
  const path = () => { g.beginPath(); g.moveTo(-5, -11); g.lineTo(4, -11); g.lineTo(4, 2); g.quadraticCurveTo(4, 4, 7, 4); g.lineTo(9, 4); g.arc(9, 8, 4, -Math.PI / 2, Math.PI / 2); g.lineTo(-1, 12); g.quadraticCurveTo(-6, 12, -5, 6); g.closePath(); };
  g.fillStyle = base; path(); g.fill();
  g.save(); path(); g.clip();
  g.fillStyle = str; g.fillRect(-6, -11, 11, 3); g.fillRect(-6, -5.5, 11, 2.2); circ(g, 10, 8, 3, str); circ(g, -3, 9, 2.6, str);
  g.restore();
};
IT.gold = g => {
  blob(g, 0, 0, 10, '#f2b90f', '#fff2a8');
  g.beginPath(); g.arc(-10.5, 0, 8.5, -0.9, 0.9); stroke(g, 2.4, '#fff7d1');
  g.beginPath(); g.arc(10.5, 0, 8.5, Math.PI - 0.9, Math.PI + 0.9); stroke(g, 2.4, '#fff7d1');
};
IT.heart = g => {
  g.fillStyle = lgrad(g, 0, -8, 0, 8, [[0, '#ff7c97'], [1, '#e23d62']]);
  g.beginPath(); g.moveTo(0, 7); g.bezierCurveTo(-12, -1, -8, -11, 0, -5); g.bezierCurveTo(8, -11, 12, -1, 0, 7); g.fill();
  ell(g, -4, -4, 2.4, 1.6, -0.6, 'rgba(255,255,255,.55)');
};
IT.heartGold = g => {
  g.fillStyle = lgrad(g, 0, -8, 0, 8, [[0, '#ffe98a'], [1, '#f0a81c']]);
  g.beginPath(); g.moveTo(0, 7); g.bezierCurveTo(-12, -1, -8, -11, 0, -5); g.bezierCurveTo(8, -11, 12, -1, 0, 7); g.fill();
  ell(g, -4, -4, 2.4, 1.6, -0.6, 'rgba(255,255,255,.7)');
};
IT.heartEmpty = g => {
  g.beginPath(); g.moveTo(0, 7); g.bezierCurveTo(-12, -1, -8, -11, 0, -5); g.bezierCurveTo(8, -11, 12, -1, 0, 7);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fill();
};
function itemSprite(kind, v, R) {
  const box = {cake: [-15, -16, 13, 9], fk: [-15, -12, 15, 9], ball: [-9, -9, 9, 9], apple: [-10, -11, 10, 8], omaApple: [-10, -11, 10, 8],
    lyoner: [-13, -14, 13, 13], treat: [-13, -9, 13, 9], cheese: [-9, -11, 12, 11], liver: [-16, -8, 18, 8], lickmat: [-12, -10, 12, 10],
    sock: [-7, -12, 14, 13], gold: [-12, -11, 12, 11], heart: [-11, -10, 11, 8], heartGold: [-11, -10, 11, 8], heartEmpty: [-11, -10, 11, 8]}[kind];
  return spr('it:' + kind + ':' + (v || 0), box, g => IT[kind](g, v), {outline: kind === 'heartEmpty' ? 0 : 1, oc: 'rgba(40,24,14,.75)', shade: kind !== 'heartEmpty', R});
}

// ======================================================================
// OMA DORIS (walks left, origin at the feet)
// ======================================================================
function drawOma(g, f, toss) {
  const s = toss ? 0 : Math.sin(f / 4 * TAU);
  seg(g, -3, -16, -4 + s * 3, 0, 3.4, '#6b5a4e'); seg(g, 4, -16, 5 - s * 3, 0, 3.4, '#6b5a4e');
  rr(g, -8 + s * 3, -2, 8, 3, 1.5, '#3a2e28'); rr(g, 1 - s * 3, -2, 8, 3, 1.5, '#3a2e28');
  g.fillStyle = lgrad(g, 0, -44, 0, -14, [[0, '#a7c4e0'], [1, '#7f9fc4']]); rrPath(g, -10, -44, 21, 30, 8); g.fill();
  rr(g, -10, -30, 21, 4, 2, '#e9d6b0');
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-1, -43); g.lineTo(-1, -16); g.stroke();
  // arm with basket or tossing arm
  if (toss) { seg(g, -6, -40, -16, -52, 3.4, '#a7c4e0'); circ(g, -17, -53, 2.6, '#f0c9a6'); }
  else { seg(g, -6, -38, -10, -27, 3.4, '#a7c4e0'); }
  rr(g, -19, -30, 12, 9, 3, '#b8834a'); g.beginPath(); g.arc(-13, -30, 5, Math.PI, 0); stroke(g, 1.4, '#8a5a2a');
  blob(g, -15, -31, 2.4, '#d93a2f', '#ff8a70'); blob(g, -11, -31, 2.4, '#8bc34a', '#c8ec8a');
  blob(g, 0, -51, 7.5, '#f0c9a6', '#ffe0c6');
  [[-5, -57, 4], [0, -59.5, 4.4], [5, -57, 4], [6, -52, 3.4], [-6.5, -52, 3.4]].forEach(([x, y, r]) => blob(g, x, y, r, '#d9d9df', '#ffffff'));
  g.beginPath(); g.arc(-3, -51.5, 2.6, 0, TAU); stroke(g, 0.9, '#7a5a3a'); g.beginPath(); g.moveTo(-5.6, -51.5); g.lineTo(-7, -51); stroke(g, 0.9, '#7a5a3a');
  circ(g, -3, -51.5, 0.9, '#2a1a10'); g.beginPath(); g.arc(-3.5, -47.5, 2, 0.2, 2.6); stroke(g, 0.9, '#a8574a');
  ell(g, -5.5, -48.5, 1.6, 1, 0, 'rgba(230,120,110,.4)');
}
function omaSprite(f, toss, R) { return spr('oma:' + f + ':' + (toss ? 1 : 0), [-22, -64, 14, 2], g => drawOma(g, f, toss), {outline: 1.1, oc: 'rgba(40,30,30,.85)', shade: true, R}); }

// ======================================================================
// PLATFORMS (origin at the top-left of the walkable surface)
// ======================================================================
function platformSprite(kind, w, R) {
  const h = {bench: 30, log: 26, table: 40, jetty: 60, pedalo: 22, carport: 92, gtable: 38, floatie: 20, trampoline: 32, stump: 30}[kind];
  return spr('plat:' + kind + ':' + w, [-6, -16, w + 6, h + 4], g => PL[kind](g, w, h), {outline: 1.1, oc: 'rgba(35,22,12,.8)', shade: kind !== 'jetty', R});
}
const PL = {};
PL.bench = (g, w, h) => {
  g.fillStyle = lgrad(g, 0, 0, 0, 7, [[0, '#a3703f'], [1, '#7a5030']]); rrPath(g, 0, 0, w, 7, 2.5); g.fill();
  rr(g, 2, -14, w - 4, 5, 2, '#8a5a34'); rr(g, 2, -7, w - 4, 4, 2, '#7a5030');
  for (const x of [6, w - 12]) { rr(g, x, 6, 6, h - 6, 1.5, '#3e3a36'); rr(g, x - 2, -14, 4, 20, 1.5, '#3e3a36'); }
  rr(g, 0, 1, w, 1.2, 0.6, 'rgba(255,255,255,.18)');
};
PL.log = (g, w, h) => {
  g.fillStyle = lgrad(g, 0, 0, 0, h, [[0, '#93683f'], [1, '#5e3f22']]); rrPath(g, 0, 0, w, h, h / 2); g.fill();
  g.strokeStyle = 'rgba(60,35,15,.45)'; g.lineWidth = 1; for (let x = 10; x < w - 10; x += 11) { g.beginPath(); g.moveTo(x, 4); g.quadraticCurveTo(x + 4, h / 2, x, h - 4); g.stroke(); }
  ell(g, w - h / 2 + 2, h / 2, h / 2 - 2, h / 2 - 2, 0, '#c99a62'); g.beginPath(); g.arc(w - h / 2 + 2, h / 2, h / 4, 0, TAU); stroke(g, 1, '#9a6a3a');
  ell(g, w * 0.3, 2, 8, 3, 0, '#5d8f45'); ell(g, w * 0.36, 1, 5, 2.5, 0, '#76a85a');
};
PL.table = (g, w, h) => {
  g.fillStyle = lgrad(g, 0, 0, 0, 8, [[0, '#b07a46'], [1, '#845533']]); rrPath(g, 0, 0, w, 8, 2.5); g.fill();
  seg(g, 12, 8, 4, h, 4, '#7a5030'); seg(g, 20, 8, 28, h, 4, '#7a5030'); seg(g, w - 12, 8, w - 4, h, 4, '#7a5030'); seg(g, w - 20, 8, w - 28, h, 4, '#7a5030');
  rr(g, -4, h - 16, w + 8, 5, 2, '#8a5a34');
};
PL.stump = (g, w, h) => {
  g.fillStyle = lgrad(g, 0, 0, w, 0, [[0, '#6e4a2a'], [0.5, '#8a5f38'], [1, '#5a3b20']]); g.fillRect(2, 3, w - 4, h - 3);
  ell(g, w / 2, 3, w / 2, 4, 0, '#c99a62'); g.beginPath(); g.ellipse(w / 2, 3, w / 3.2, 2.4, 0, 0, TAU); stroke(g, 0.9, '#9a6a3a');
};
PL.jetty = (g, w, h) => {
  rr(g, 0, 0, w, 6, 1.5, '#a37a52');
  g.strokeStyle = 'rgba(70,45,25,.5)'; g.lineWidth = 0.8; for (let x = 6; x < w; x += 7) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 6); g.stroke(); }
  for (let x = 6; x < w; x += Math.max(26, (w - 12) / Math.max(1, Math.round((w - 12) / 34)))) rr(g, x, 6, 5, h - 6, 1.2, '#6d5236');
  rr(g, w - 9, 6, 5, h - 6, 1.2, '#6d5236');
  rr(g, 0, 1, w, 1, 0.5, 'rgba(255,255,255,.25)');
};
PL.pedalo = (g, w, h) => {
  g.fillStyle = lgrad(g, 0, 0, 0, h, [[0, '#ffffff'], [1, '#dcd7cc']]); rrPath(g, 0, 2, w, h - 6, 8); g.fill();
  g.beginPath(); g.moveTo(8, 4); g.bezierCurveTo(4, -10, -6, -6, 0, -14); stroke(g, 4, '#ffffff');
  tri(g, -1, -15, -7, -13, -1, -12, '#f08a2a');
  ell(g, w * 0.6, 3, w * 0.25, 4, 0, '#e8e3d6');
  g.beginPath(); g.moveTo(-2, h - 3); g.lineTo(w + 2, h - 3); stroke(g, 1.2, 'rgba(255,255,255,.6)');
};
PL.floatie = (g, w, h) => {
  // unicorn pool float
  g.fillStyle = lgrad(g, 0, 0, 0, h, [[0, '#ffffff'], [1, '#f4d6ee']]); rrPath(g, 0, 2, w, h - 4, (h - 4) / 2); g.fill();
  rr(g, 6, 5, w - 12, 3, 1.5, 'rgba(255,170,220,.6)');
  g.beginPath(); g.moveTo(w - 6, 6); g.quadraticCurveTo(w + 4, -4, w - 2, -14); stroke(g, 6, '#ffffff');
  circ(g, w - 3, -15, 5.5, '#ffffff'); tri(g, w - 4, -20, w + 1, -30, w + 1, -19, '#ffd23f');
  circ(g, w - 2, -16, 1, '#2a1a10'); [['#ff8fb1', -6], ['#8fd7ff', -10], ['#b28dff', -14]].forEach(([c, y]) => ell(g, w - 9, y, 3, 2, 0.3, c));
};
PL.carport = (g, w, h) => {
  g.fillStyle = lgrad(g, 0, -6, 0, 8, [[0, '#7d858e'], [1, '#585f68']]); rrPath(g, -4, -2, w + 8, 9, 2); g.fill();
  rr(g, -4, -4, w + 8, 3, 1.5, '#9aa3ac');
  for (const x of [6, w - 12]) { g.fillStyle = lgrad(g, x, 0, x + 6, 0, [[0, '#e7e2d8'], [1, '#bdb6a8']]); g.fillRect(x, 7, 6, h - 7); }
  // car underneath
  const cx = w / 2 - 34, cy = h - 6;
  g.fillStyle = lgrad(g, 0, cy - 26, 0, cy, [[0, '#3f73b5'], [1, '#2a548a']]);
  g.beginPath(); g.moveTo(cx, cy - 6); g.lineTo(cx + 2, cy - 15); g.lineTo(cx + 18, cy - 17); g.lineTo(cx + 28, cy - 28); g.lineTo(cx + 50, cy - 28); g.lineTo(cx + 60, cy - 17); g.lineTo(cx + 68, cy - 15); g.lineTo(cx + 68, cy - 6); g.closePath(); g.fill();
  poly(g, [cx + 30, cy - 26, cx + 38, cy - 26, cx + 38, cy - 18, cx + 22, cy - 18], '#c9e4f5'); poly(g, [cx + 41, cy - 26, cx + 49, cy - 26, cx + 56, cy - 18, cx + 41, cy - 18], '#c9e4f5');
  for (const wx of [cx + 14, cx + 54]) { circ(g, wx, cy - 5, 6.5, '#1f1f1f'); circ(g, wx, cy - 5, 3, '#a0a6ac'); }
  rr(g, cx + 64, cy - 14, 4, 3, 1, '#ffe27a');
};
PL.gtable = (g, w, h) => {
  rr(g, 0, 0, w, 6, 2, '#f2f2ec'); rr(g, 0, 5, w, 2, 1, '#cfcfc5');
  seg(g, 8, 7, 6, h, 2.5, '#9aa0a6'); seg(g, w - 8, 7, w - 6, h, 2.5, '#9aa0a6');
  // a bowl of snacks on top for flavour
  g.beginPath(); g.arc(w * 0.7, 0, 7, Math.PI, 0); g.fillStyle = '#d97757'; g.fill();
};
PL.trampoline = (g, w, h) => {
  ell(g, w / 2, 3, w / 2, 5, 0, '#2a2a2e'); ell(g, w / 2, 2, w / 2 - 4, 3.2, 0, '#3a3a40');
  g.beginPath(); g.ellipse(w / 2, 3, w / 2, 5, 0, 0, TAU); stroke(g, 2.6, '#38a1db');
  for (const x of [6, w / 2, w - 6]) seg(g, x, 6, x + (x < w / 2 ? -3 : x > w / 2 ? 3 : 0), h, 2.5, '#6d7680');
  g.strokeStyle = 'rgba(56,161,219,.55)'; g.lineWidth = 1; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(w * k / 6, 5); g.lineTo(w * k / 6, -18); g.stroke(); }
  g.beginPath(); g.moveTo(0, -18); g.lineTo(w, -18); stroke(g, 1.6, '#38a1db');
};
const PLAT_H = {bench: 30, log: 26, table: 40, jetty: 60, pedalo: 22, carport: 92, gtable: 38, floatie: 20, trampoline: 32, stump: 30};

// ======================================================================
// SKY BITS
// ======================================================================
function cloudSprite(v, R) {
  return spr('cloud:' + v, [-4, -34, 92, 14], g => {
    const parts = [[[14, 0, 15], [34, -10, 19], [56, -4, 16], [72, 2, 12], [40, 4, 14]], [[12, 0, 12], [28, -8, 15], [46, -2, 12], [62, 3, 9]], [[16, 0, 14], [36, -14, 21], [60, -6, 18], [80, 2, 11]]][v];
    g.fillStyle = 'rgba(160,190,215,.35)'; parts.forEach(([x, y, r]) => { g.beginPath(); g.arc(x + 2, y + 4, r, 0, TAU); g.fill(); });
    parts.forEach(([x, y, r]) => blob(g, x, y, r, '#eef5fb', '#ffffff'));
  }, {R: R * 0.6});
}
function glowSprite(R, col) {
  return spr('glow:' + col, [-64, -64, 64, 64], g => {
    const gr = g.createRadialGradient(0, 0, 2, 0, 0, 64); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,214,130,0)');
    g.fillStyle = gr; g.fillRect(-64, -64, 128, 128);
  }, {R: Math.min(R, 1)});
}
