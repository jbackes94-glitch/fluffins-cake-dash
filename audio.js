'use strict';
/* Sound: synthesised effects and a small looping tune per map (plus a boss tune), scheduled ahead on the
   audio clock so the music stays steady even when frames drop. */
const SND = {ctx: null, master: null, sfxBus: null, musicBus: null, muted: false, song: null, nextT: 0, idx: 0, loopStart: 0, timer: null};
function audioInit() {
  if (!SND.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      SND.ctx = new AC();
      SND.master = SND.ctx.createGain(); SND.master.connect(SND.ctx.destination);
      SND.sfxBus = SND.ctx.createGain(); SND.sfxBus.gain.value = 0.9; SND.sfxBus.connect(SND.master);
      SND.musicBus = SND.ctx.createGain(); SND.musicBus.gain.value = 0.32; SND.musicBus.connect(SND.master);
      SND.master.gain.value = SND.muted ? 0 : 1;
    } catch (e) { SND.ctx = null; }
  }
  if (SND.ctx && SND.ctx.state === 'suspended') SND.ctx.resume().catch(() => {});
}
function setMuted(m) { SND.muted = m; if (SND.master) SND.master.gain.setTargetAtTime(m ? 0 : 1, SND.ctx.currentTime, 0.02); }
function tone(f1, f2, dur, type, vol, delay, bus) {
  const A = SND; if (!A.ctx) return;
  try {
    const t0 = A.ctx.currentTime + (delay || 0), o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f1, t0); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.06, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus || A.sfxBus); o.start(t0); o.stop(t0 + dur + 0.03);
  } catch (e) {}
}
let noiseBuf = null;
function noise(dur, vol, hp, delay) {
  const A = SND; if (!A.ctx) return;
  try {
    if (!noiseBuf) { noiseBuf = A.ctx.createBuffer(1, A.ctx.sampleRate * 0.5, A.ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const t0 = A.ctx.currentTime + (delay || 0), s = A.ctx.createBufferSource(), f = A.ctx.createBiquadFilter(), g = A.ctx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp || 1200;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(A.sfxBus); s.start(t0); s.stop(t0 + dur);
  } catch (e) {}
}
const SFX = {
  jump: () => tone(360, 720, 0.12, 'square', 0.035),
  jump2: () => tone(520, 1040, 0.13, 'square', 0.035),
  boing: () => { tone(180, 720, 0.25, 'triangle', 0.09); tone(360, 1200, 0.2, 'sine', 0.04, 0.03); },
  stomp: c => { tone(240 + c * 50, 90, 0.12, 'triangle', 0.12); tone(660 + c * 110, 1100 + c * 150, 0.08, 'square', 0.03, 0.04); },
  cake: () => tone(880, 1320, 0.09, 'sine', 0.07),
  ball: () => tone(1180, 1180, 0.05, 'square', 0.022),
  rare: () => [660, 880, 1100].forEach((f, i) => tone(f, f, 0.08, 'triangle', 0.07, i * 0.06)),
  sock: () => { tone(660, 660, 0.08, 'triangle', 0.08); tone(990, 990, 0.12, 'triangle', 0.08, 0.08); },
  hurt: () => { tone(320, 80, 0.32, 'sawtooth', 0.06); noise(0.12, 0.05, 800); },
  splash: () => { noise(0.45, 0.12, 500); tone(300, 90, 0.3, 'sine', 0.07); },
  power: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.1, 'square', 0.04, i * 0.07)),
  life: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.1, 'triangle', 0.07, i * 0.08)),
  honk: () => { tone(250, 190, 0.16, 'sawtooth', 0.045); tone(250, 190, 0.14, 'sawtooth', 0.035, 0.2); },
  bossIn: () => [220, 196, 175, 147].forEach((f, i) => tone(f, f * 0.98, 0.22, 'sawtooth', 0.05, i * 0.18)),
  bossHit: () => { tone(160, 60, 0.25, 'square', 0.1); noise(0.15, 0.08, 300); },
  bossDown: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.08, i * 0.09)),
  over: () => [392, 330, 262].forEach((f, i) => tone(f, f * 0.97, 0.24, 'triangle', 0.08, i * 0.2)),
  tick: () => tone(1500, 1500, 0.03, 'square', 0.02)
};

// ---------------- music ----------------
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = {
  common: {bpm: 128, bar: 4, chords: [48, 43, 41, 48, 48, 43, 41, 48], third: [52, 47, 45, 52, 52, 47, 45, 52], style: 'bounce',
    mel: [[72, .5], [76, .5], [79, .5], [76, .5], [77, 1], [74, 1], [72, .5], [76, .5], [79, .5], [84, .5], [83, 1], [79, 1],
      [81, .5], [79, .5], [77, .5], [76, .5], [74, 1], [77, 1], [76, .5], [74, .5], [72, .5], [71, .5], [72, 2],
      [72, .5], [76, .5], [79, .5], [76, .5], [77, 1], [74, 1], [71, .5], [74, .5], [77, .5], [74, .5], [76, 1], [72, 1],
      [69, .5], [72, .5], [77, .5], [76, .5], [74, 1], [71, 1], [72, 1], [79, 1], [72, 2]]},
  weiher: {bpm: 160, bar: 3, chords: [41, 48, 48, 41, 46, 41, 48, 41], third: [45, 52, 52, 45, 50, 45, 52, 45], style: 'waltz',
    mel: [[77, 1], [81, 1], [84, 1], [79, 2], [76, 1], [79, 1], [82, 1], [84, 1], [81, 3], [82, 1], [86, 1], [84, 1], [81, 2], [77, 1], [79, 1], [76, 1], [79, 1], [77, 3]]},
  garden: {bpm: 118, bar: 4, chords: [43, 40, 36, 38, 43, 40, 36, 38], third: [47, 43, 40, 42, 47, 43, 40, 42], style: 'bounce',
    mel: [[79, .5], [81, .5], [83, 1], [86, 1], [83, 1], [81, .5], [79, .5], [76, 1], [79, 2], [76, .5], [79, .5], [84, 1], [83, 1], [81, 1], [78, 1], [81, 1], [86, 2],
      [83, .5], [86, .5], [88, 1], [86, 1], [83, 1], [79, 1], [83, 1], [81, 2], [79, .5], [81, .5], [83, 1], [84, 1], [76, 1], [78, 1], [74, 1], [79, 2]]},
  staden: {bpm: 136, bar: 4, chords: [50, 45, 50, 45, 43, 45, 50, 45], third: [54, 49, 54, 49, 47, 49, 54, 49], style: 'bounce',
    mel: [[74, .5], [78, .5], [81, 1], [78, .5], [74, .5], [76, 1], [73, .5], [76, .5], [79, 1], [76, .5], [73, .5], [74, 1],
      [78, .5], [81, .5], [86, 1], [85, .5], [83, .5], [81, 1], [79, .5], [78, .5], [76, .5], [73, .5], [74, 2],
      [71, .5], [74, .5], [79, 1], [78, .5], [76, .5], [74, 1], [76, .5], [78, .5], [81, .5], [78, .5], [76, 1], [73, 1],
      [74, .5], [76, .5], [78, .5], [79, .5], [81, 1], [76, 1], [74, 1], [69, 1], [74, 2]]},
  boss: {bpm: 152, bar: 4, chords: [45, 41, 43, 40], third: [48, 45, 47, 44], style: 'drive',
    mel: [[69, .5], [72, .5], [76, .5], [72, .5], [69, .5], [72, .5], [76, .5], [77, .5], [77, .5], [76, .5], [72, .5], [69, .5], [65, 1], [72, 1],
      [74, .5], [71, .5], [67, .5], [71, .5], [74, .5], [79, .5], [74, .5], [71, .5], [68, 1], [71, 1], [76, 2]]}
};
function buildEvents(S) {
  const ev = [], beat = 60 / S.bpm;
  let t = 0;
  S.mel.forEach(([n, d]) => { ev.push({t, f: midi(n), d: d * beat * 0.9, type: 'square', v: 0.05}); t += d; });
  S.chords.forEach((root, b) => {
    const bt = b * S.bar;
    if (S.style === 'waltz') {
      ev.push({t: bt, f: midi(root), d: beat * 0.9, type: 'triangle', v: 0.12});
      ev.push({t: bt + 1, f: midi(S.third[b] + 12), d: beat * 0.4, type: 'triangle', v: 0.05});
      ev.push({t: bt + 2, f: midi(root + 19), d: beat * 0.4, type: 'triangle', v: 0.05});
    } else {
      for (let q = 0; q < S.bar; q++) {
        const n = q % 2 ? root + 7 : root;
        ev.push({t: bt + q, f: midi(n), d: beat * (S.style === 'drive' ? 0.45 : 0.8), type: 'triangle', v: 0.13});
        if (S.style === 'drive') ev.push({t: bt + q + 0.5, f: midi(n), d: beat * 0.4, type: 'triangle', v: 0.09});
        ev.push({t: bt + q + 0.5, hat: true});
      }
    }
  });
  ev.sort((a, b) => a.t - b.t);
  return {ev, len: Math.max(t, S.chords.length * S.bar), beat};
}
const SONG_CACHE = {};
function playSong(name) {
  const A = SND; if (!A.ctx) return;
  if (A.song && A.song.name === name) return;
  stopSong();
  const S = SONGS[name]; if (!S) return;
  const b = SONG_CACHE[name] || (SONG_CACHE[name] = buildEvents(S));
  A.song = Object.assign({name}, b);
  A.idx = 0; A.loopStart = A.ctx.currentTime + 0.1;
  A.musicBus.gain.cancelScheduledValues(A.ctx.currentTime);
  A.musicBus.gain.setValueAtTime(0.0001, A.ctx.currentTime); A.musicBus.gain.exponentialRampToValueAtTime(0.32, A.ctx.currentTime + 0.4);
  A.timer = setInterval(scheduleMusic, 30);
  scheduleMusic();
}
function stopSong() {
  const A = SND;
  if (A.timer) clearInterval(A.timer);
  A.timer = null; A.song = null;
}
function scheduleMusic() {
  const A = SND, s = A.song; if (!s || !A.ctx) return;
  const ahead = A.ctx.currentTime + 0.15;
  for (let guard = 0; guard < 64; guard++) {
    const e = s.ev[A.idx], when = A.loopStart + e.t * s.beat;
    if (when > ahead) break;
    if (when > A.ctx.currentTime - 0.05) {
      if (e.hat) { try { const t0 = when, src = A.ctx.createBufferSource(), f = A.ctx.createBiquadFilter(), g = A.ctx.createGain();
        if (!noiseBuf) noise(0.01, 0.0001); src.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 7000;
        g.gain.setValueAtTime(0.025, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
        src.connect(f); f.connect(g); g.connect(A.musicBus); src.start(t0); src.stop(t0 + 0.06); } catch (er) {} }
      else { try { const o = A.ctx.createOscillator(), g = A.ctx.createGain();
        o.type = e.type; o.frequency.value = e.f;
        g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(e.v, when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, when + e.d);
        o.connect(g); g.connect(A.musicBus); o.start(when); o.stop(when + e.d + 0.02); } catch (er) {} }
    }
    A.idx++;
    if (A.idx >= s.ev.length) { A.idx = 0; A.loopStart += s.len * s.beat; }
  }
}
