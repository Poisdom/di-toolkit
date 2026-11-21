// node test.js — checks engine.js against known answers and test/golden.json
// (golden.json = values of the original Python calculator, which was verified against SolidWorks' ISO tables).
const assert = require('assert');
const E = require('./engine.js');
const G = require('./test/golden.json');
const eq = (a, b, what) => assert(Math.abs(a - b) < 1e-6, `${what}: got ${a}, expected ${b}`);

// course answers (DI-S07t / S08t) and the professor's example (Ø15)
eq(E.dev(15, 'h9')[1], -43, '15h9'); eq(E.dev(15, 'D10')[0], 120, '15D10'); eq(E.dev(15, 'D10')[1], 50, '15D10');
eq(E.dev(30, 'F7')[0], 41, '30F7'); eq(E.dev(50, 'T6')[0], -49, '50T6'); eq(E.dev(50, 'S7')[0], -34, '50S7');
eq(E.dev(90, 'G5')[1], 12, '90G5'); eq(E.dev(25, 'N9')[1], -52, '25N9'); eq(E.dev(40, 'P9')[1], -88, '40P9');
let f = E.fit(50, 'H7', 'f6'); eq(f.jmin, 25, 'H7/f6'); eq(f.jmax, 66, 'H7/f6'); assert.equal(f.kind, 'clearance');
assert.equal(E.fit(50, 'H7', 'k6').kind, 'transition'); assert.equal(E.fit(50, 'H7', 'p6').kind, 'interference');
// ISO 286-1 special cases
assert.deepEqual(E.dev(3, 'N9'), [-4, -29]); assert.deepEqual(E.dev(2, 'N9'), [-4, -29]);
assert.deepEqual(E.dev(300, 'M6'), [-9, -41]);
// formatting and bad input
assert.equal(E.mm(0), '0.000'); assert.equal(E.mm(-43), '-0.043'); assert.equal(E.mm(21.5), '+0.0215');
for (const bad of ['', 'H', '7', 'Js9', 'x6', 'H99']) assert.throws(() => E.dev(50, bad), Error, bad);
assert.throws(() => E.dev(600, 'H7')); assert.throws(() => E.dev(0, 'H7')); assert.throws(() => E.dev(10, 't6'));
assert.throws(() => E.fit(50, 'h7', 'g6')); assert.throws(() => E.fit(50, 'H7', 'G6'));
assert.throws(() => E.keyFor(6)); assert.throws(() => E.keyFor(231)); assert.equal(E.circlipFor(250), null);
assert.throws(() => E.weld(50, 3, 60)); assert.throws(() => E.weld(50, 2.5));
assert.throws(() => E.dev(50, 'K1')); assert.throws(() => E.dev(50, 'P2')); assert.deepEqual(E.dev(50, 'h2'), [0, -2.5]);
// a fallback key is never shorter than it is wide (Ø39, seat 22: b 12 would get L 10)
assert.equal(E.spec(39, 22).join.short, null);
for (let d = 7; d <= 200; d++) for (let s = 1; s <= 400; s++) { const x = E.spec(d, s); assert(!x.join.short || x.join.short >= x.key.b, `Ø${d} seat ${s} short key`); }
// circlips with no ring of their own size
assert.equal(E.circlipFor(156).d1, 160); assert.equal(E.circlipFor(141).d1, 140); assert.equal(E.circlipFor(152).d1, 155);
// SolidWorks must count exactly n beads
for (const d of [15, 52, 60, 100, 152, 176]) { const w = E.weld(d); assert(w.n * w.pitch >= Math.PI * d - 1e-9 && (w.n - 1) * w.pitch < Math.PI * d); }

let n = 0;
for (const [d, code, up, lo] of G.dev) {
  if (up === null) { assert.throws(() => E.dev(d, code), Error, `${d} ${code} should be undefined`); n++; continue; }
  const r = E.dev(d, code); eq(r[0], up, `${d} ${code} upper`); eq(r[1], lo, `${d} ${code} lower`); n++;
}
for (const [d, seat, g] of G.spec) {
  const s = E.spec(d, seat), k = s.key, c = s.circlip, w = s.weld, t = `Ø${d} seat ${seat}`;
  assert.deepEqual([k.b, k.h, k.t1, k.t2, k.dt, s.chord], [g.b, g.h, g.t1, g.t2, g.dt, g.chord], t + ' key');
  assert.deepEqual([`DIN 471 - ${c.d1} x ${c.s}`, c.d2, c.d2Class, c.d2Up, c.d2Lo, c.m, c.mUp, c.mLo, c.depth],
    [g.ring, g.d2, g.d2c, g.d2u, g.d2l, g.m, g.mu, g.ml, g.depth], t + ' circlip');
  assert.deepEqual([w.l, w.gap, w.pitch, w.total, s.od], [g.wl, g.wg, g.wp, g.wt, g.od], t + ' weld');
  assert.deepEqual(s.join ? [s.join.hub, s.join.key] : [null, null], [g.hub ?? null, g.key], t + ' join');
  n++;
}
// calculators: the list is the <script src="calc/..."> lines of index.html. Each one names its standard, brings its own
// known-good cases (test/<casos>) and gives a page (tiles, sketches, drawing rows, source) or a clear Error for every Ø.
const fs = require('fs');
global.DI = E;
const files = [...fs.readFileSync(__dirname + '/index.html', 'utf8').matchAll(/<script src="(calc\/[^"]+)"/g)].map(m => m[1]);
files.forEach(p => require('./' + p));
assert(CALCS.length === files.length - 1, 'every calc file pushes one calculator');
for (const c of CALCS) {
  for (const k of ['id', 'group', 'title', 'norma', 'blurb', 'intro', 'casos']) assert(c[k], `${c.id}: missing ${k}`);
  assert(fs.existsSync(`${__dirname}/test/${c.casos}`), `${c.id}: test/${c.casos} not found`);
  const S = { d: 0, seat: '40' }; for (const x of CALCS) S[x.id] = { ...x.defaults };
  for (const d of [3, 7, 15, 32, 50, 99.5, 156, 200, 230, 400]) {
    S.d = d;
    let r; try { r = c.run(d, S[c.id], S); } catch (e) { assert(e instanceof Error && e.message, `${c.id} Ø${d}: ${e}`); continue; }
    assert(r.tiles.length && r.sketches.length && r.plano.length && r.source, `${c.id} Ø${d}: incomplete page`);
    for (const [, , s] of r.sketches) assert(/^<svg[\s\S]*<\/svg>$/.test(s.trim()) && !/NaN|undefined/.test(s), `${c.id} Ø${d}: bad sketch`);
    try { c.preview(d, S[c.id], S); } catch (e) { assert(e instanceof Error, `${c.id} preview Ø${d}`); }
  }
}
// gear + pulley: the professor's DI-S38t example and Tarea 38
const EG = CALCS.find(c => c.id === 'engranaje');
for (const t of require('./test/engranaje.json').cases) {
  const r = EG.calc(t.d, { ...EG.defaults, ...t.in }), k = r.k;
  assert(Math.abs(r.g.dp - t.dp) < 1e-3 && Math.abs(r.g.de - t.de) < 1e-3, `gear ${t.cfg}: dp ${r.g.dp} de ${r.g.de}`);
  assert.deepEqual(r.P, t.pulley, t.cfg + ' pulley'); assert.deepEqual([k.b, k.h, r.L, k.t1, k.t2], t.key, t.cfg + ' key'); assert.equal(r.cfg, t.cfg); n++;
}
// bearings: the professor's 50 k5 → 2..25 and G3 for Ø90; nuts: Toolbox heights
const ER = CALCS.find(c => c.id === 'rodamiento');
for (const t of require('./test/rodamiento.json').cases) {
  const r = ER.calc(t.d, { ...ER.defaults, ...t.in }), sh = r.shaft, ho = r.hole;
  assert.deepEqual([r.name, r.D, r.B, r.lo, r.LO], [t.name, t.D, t.B, ...t.ring], t.name);
  assert.deepEqual([sh.cls, sh.up, sh.low, sh.min, sh.max], t.shaft, t.name + ' shaft'); assert.equal(r.ls.best.cls, t.best, t.name + ' best shaft');
  assert.deepEqual([ho.cls, ho.up, ho.low, ho.min, ho.max], t.hole, t.name + ' hole'); assert.equal(r.lh.best.cls, t.hbest, t.name + ' best hole'); n++;
}
const ET = CALCS.find(c => c.id === 'tuerca');
for (const t of require('./test/tuerca.json').cases) {
  const r = ET.calc(t.d, { ...ET.defaults, ...t.in });
  assert.deepEqual([r.M, r.m, r.mt, r.s, r.seat, r.L], [t.M, t.m, t.mt, t.s, t.seat, t.L], 'nut Ø' + t.d); n++;
}
// gear weld on another Ø (ex.bearings: collar Ø70, a5, 4 beads, gap 35 → 4X20(35){80})
{ const w = EG.calc(50, { ...EG.defaults, wd: '70', wa: '5', wn: '4', we: '35' }).w; assert(Math.abs(w.l - 20) < 0.05 && Math.abs(w.total - 80) < 0.1, 'weld on Ø70'); n++; }
// hand steps: every calculator explains itself, with no NaN/undefined
for (const c of CALCS) {
  assert(typeof c.mano === 'function', c.id + ': mano missing');
  const S = { seat: '40' }; for (const x of CALCS) S[x.id] = { ...x.defaults };
  for (const d of [15, 40, 50, 55, 65]) {
    let st; try { st = c.mano(d, S[c.id], S); } catch (e) { assert(e instanceof Error && e.message, `${c.id} mano Ø${d}`); continue; }
    assert(st.length >= 2 && st.every(([t, h]) => t && h && !/NaN|undefined/.test(t + h)), `${c.id} mano Ø${d}`);
  }
}
const steps55 = ER.mano(55, ER.defaults).map(s => s.join(' ')).join(' ');
assert(/0 \/ −15/.test(steps55) && /2 a 30/.test(steps55) && /k4/.test(steps55), '6211 hand steps: ring 0/−15, k5 2 a 30, k4');
assert.deepEqual(ER.parse('6211'), { serie: '62', d: 55 }); assert.deepEqual(ER.parse('6203'), { serie: '62', d: 17 });
assert.deepEqual(ER.parse('7210B'), { serie: '72B', d: 50 }); assert.deepEqual(ER.parse(' 6010 '), { serie: '60', d: 50 });
assert.throws(() => ER.parse('6299')); assert.throws(() => ER.parse('abc'));
// the exam tab: 5 linked topics with Monday's defaults; a bad input only breaks the topics that use it
require('./exam.js');
const X = EXAM.solveAll({ ...EXAM.defaults });
assert.deepEqual(EXAM.topics.map(t => t.id), ['rodamiento', 'anillos', 'engranaje', 'polea', 'tuerca']);
for (const t of EXAM.topics) { const r = X[t.id]; assert(!r.error, t.id + ': ' + r.error);
  assert(r.answer.length && r.steps.length && r.sketches.length && r.plano.length, t.id + ' incomplete');
  assert(!/NaN|undefined/.test(JSON.stringify(r)), t.id + ' NaN'); n++; }
const txt = id => JSON.stringify(X[id].answer);
assert(/6211/.test(txt('rodamiento')) && /55 k4/.test(txt('rodamiento')), 'exam: 6211 → 55 k4');
assert(/DIN 471 - 55/.test(txt('anillos')), 'exam: circlip follows the bearing');
assert(/correa A/.test(txt('polea')) && /12 × 8/.test(txt('polea')), 'exam: belt A, key 12×8 for Ø40');
assert(/M36/.test(txt('tuerca')), 'exam: M36 under Ø40');
const bad = EXAM.solveAll({ ...EXAM.defaults, rod: '6299', z: '3' });
assert(bad.rodamiento.error && bad.anillos.error && bad.engranaje.error && !bad.tuerca.error, 'bad input stays in its topics');
console.log(`OK: ${n} golden cases + known answers · ${CALCS.length} calculators (${CALCS.map(c => c.id).join(', ')})`);
