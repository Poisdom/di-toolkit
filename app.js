// DI Toolkit shell: state, router, the three top sections (Examen 23/11 · Calculadoras · Consulta), the calculator page
// (data + answer, then folding sections), the exam topics (exam.js), the guided exercise of Control 2.
// To add a calculator: write calc/<id>.js (copy calc/anillo.js: CALCS.push({ id, group, title, norma, casos, form, run, mano, ... }))
// and add its <script> line in index.html. List, page, route and saved inputs come from that. node test.js checks it.
'use strict';
const E = DI, { esc, f, n1, num, tv, tvd, pid, defs, dim, lab, svg } = KIT;
const $ = id => document.getElementById(id);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const BY = Object.fromEntries(CALCS.map(c => [c.id, c]));

// ---- state: every calculator keeps its own inputs under its id, the exam under S.exam; d + seat = guided exercise
const S = { d: 50, seat: '' };
try { Object.assign(S, JSON.parse(store.get('ditk') || '{}')); } catch (e) {}
if ('hole' in S || 'wn' in S) {   // v1 kept everything flat
  Object.assign(S, JSON.parse(JSON.stringify({ ajuste: { hole: S.hole, shaft: S.shaft }, chaveta: { fit: S.keyFit }, soldadura: { n: S.wn, e: S.wgap, a: S.wa } })));
  for (const k of ['hole', 'shaft', 'keyFit', 'wn', 'wgap', 'wa']) delete S[k];
}
// v3 shared one Ø across every calculator; now each keeps its own (S.d stays as the guided exercise's Ø)
for (const c of CALCS) S[c.id] = { d: String(S.d ?? 50), ...c.defaults, ...S[c.id] };
S.exam = { ...EXAM.defaults, ...S.exam };
const get = k => k.split('.').reduce((o, p) => o == null ? o : o[p], S) ?? '';
function set(k, v) {
  const ps = k.split('.'); let o = S;
  while (ps.length > 1) o = o[ps.shift()];
  o[ps[0]] = v; store.set('ditk', JSON.stringify(S));
}
const sync = except => document.querySelectorAll('[data-s]').forEach(el => { if (el !== except && el.value !== String(get(el.dataset.s))) el.value = get(el.dataset.s); });
function bind(root) {
  root.querySelectorAll('[data-s]').forEach(el => {
    el.value = get(el.dataset.s);
    el.addEventListener('input', () => { set(el.dataset.s, el.value.trim()); sync(el); render(); });
  });
  root.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => {
    for (const [k, v] of Object.entries(JSON.parse(b.dataset.set))) set(k, v);
    sync(); render();
  }));
}
const alertBox = ([kind, t]) => `<div class="alert${kind === 'info' ? ' info' : ''}">${esc(t)}</div>`;

// ---- tabs (WAI-ARIA pattern): arrows / Home / End move between tabs; the chosen tab is remembered per kind of page
function tabs(root, key) {
  const ts = [...root.querySelectorAll('[role=tab]')], k = 'ditk-tab-' + key;
  const show = (t, focus) => {
    ts.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $(x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
    store.set(k, t.dataset.tab);
  };
  ts.forEach(t => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', e => {
      const on = ts.filter(x => !x.hidden), i = on.indexOf(t), j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: on.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault(); show(on[(j + on.length) % on.length], true);
    });
  });
  show(ts.find(t => t.dataset.tab === store.get(k)) || ts[0]);
  return { show, ts };
}

const EJ = [['medidas', 'Tus medidas', 'Ø y asiento → tu eje y tu polea a escala, con cotas'], ['pasos', 'Paso a paso', '21 pasos en SolidWorks'],
  ['ejemplo', 'Ejemplo del profesor', 'Las piezas y el plano hoja a hoja'], ['claude', 'Con Claude', 'Si usas el kit: qué decirle y qué hacer si algo falla']];

// ---- shared blocks for the calculator pages and the exam topics
const stepsHtml = st => `<ol class="hand">${st.map(([t, h]) => `<li><b>${t}</b><span>${h}</span></li>`).join('')}</ol>`;
const factsHtml = rows => rows.map(([k, v, s]) => `<div><dt>${k}</dt><dd><b>${v}</b>${s ? `<span>${s}</span>` : ''}</dd></div>`).join('');
const LEGEND = `<p class="legend"><span><i style="background:var(--you)"></i>lo que modelas y acotas</span><span><i style="background:var(--cl)"></i>tolerancia</span><span><i style="background:var(--grey)"></i>geometría que ya venía dada</span></p>`;
const sketchesHtml = sk => LEGEND + `<div class="sketches">${sk.map(([t, s, svg]) => `<figure class="sk"><figcaption>${t}<span>${s}</span></figcaption>${svg}</figure>`).join('')}</div>`;
const planoHtml = pl => `<div class="tw"><table class="plano"><thead><tr><th scope="col">Cota</th><th scope="col">Se escribe</th></tr></thead><tbody>${pl.map(([sheet, rows]) =>
  `<tr class="sheet"><th colspan="2" scope="colgroup">${sheet}</th></tr>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}`).join('')}</tbody></table></div>`;
// a folding section; re-renders only fill its body, so what he opened stays open
const sec = (id, title, open) => `<details class="sec" id="${id}"${open ? ' open' : ''}><summary><h2>${title}</h2></summary><div class="sec-b" id="${id}-b"></div></details>`;
const CHECK = '<svg class="ck" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';

// ---- Calculadoras: the list, by group
$('calc-list').innerHTML = [...new Set(CALCS.map(c => c.group))].map((g, i) => `<section aria-labelledby="ag-${i}"><h2 id="ag-${i}">${esc(g)}</h2><ul class="links">${CALCS.filter(c => c.group === g).map(c =>
  `<li><a href="#/${c.id}"><b>${esc(c.title)} <small>${esc(c.norma)}</small></b><span>${esc(c.blurb)}</span></a></li>`).join('')}</ul></section>`).join('');

// ---- calculator page: your data and the answer side by side, everything else folded underneath
function buildCalc(c) {
  $('v-calc').innerHTML = `<p class="crumb"><a href="#/calculadoras">Calculadoras</a></p>
    <header class="page-h"><h1 id="h-calc">${esc(c.title)} <span class="norma-tag">${esc(c.norma)}</span></h1><p>${esc(c.intro)}</p></header>
    <div class="ask">
      <section class="data" aria-labelledby="h-c1"><h2 id="h-c1">Tus datos</h2><div class="form">${c.form()}</div></section>
      <section class="answer" aria-labelledby="h-c2"><h2 id="h-c2">Respuesta</h2><div class="alerts" id="c-alerts" aria-live="polite"></div><dl class="facts" id="c-tiles"></dl></section>
    </div>
    <div class="secs" id="c-out">${c.mano ? sec('c-mano', 'Cómo se hace a mano') : ''}${sec('c-sk', 'Croquis', true)}${sec('c-plano', 'Lo que escribes en el plano')}${sec('c-more', 'Valores y Toolbox')}${sec('c-src', 'Norma y de dónde salen los números')}</div>`;
  bind($('v-calc'));
}
function renderCalc(c) {
  const d = num(S[c.id].d);
  let r;
  try {
    if (!(d > 0)) throw new Error('Escribe un Ø en mm.');
    r = c.run(d, S[c.id], S);
  } catch (e) { $('c-alerts').innerHTML = alertBox(['warn', e.message]); $('c-tiles').innerHTML = ''; $('c-out').hidden = true; return; }
  $('c-out').hidden = false;
  $('c-alerts').innerHTML = (r.alerts || []).map(alertBox).join('');
  $('c-tiles').innerHTML = factsHtml(r.tiles);
  if (c.mano) $('c-mano-b').innerHTML = stepsHtml(c.mano(d, S[c.id], S));
  $('c-sk-b').innerHTML = sketchesHtml(r.sketches);
  $('c-plano-b').innerHTML = planoHtml(r.plano);
  $('c-more').hidden = !r.more;
  $('c-more-b').innerHTML = r.more || '';
  const fg = r.figure;
  $('c-src-b').innerHTML = `<div class="norma"><div class="src">${r.source}<p class="ok">Comprobado con los casos conocidos de <span class="mono">test/${esc(c.casos)}</span> (<span class="mono">node test.js</span>).</p></div>${fg ? `<figure class="fig"><div class="pic"><img src="${fg[0]}" width="${fg[1]}" height="${fg[2]}" loading="lazy" alt="${esc(fg[3])}"></div><figcaption><p class="small">${esc(fg[4])}</p></figcaption></figure>` : ''}</div>`;
}

// ---- Examen: the 5 topics of Monday's control (exam.js) on one linked data set, ticked off as he learns them
const TK = (() => { try { return JSON.parse(store.get('ditk-exam-ticks') || '{}'); } catch (e) { return {}; } })();
const TOP = Object.fromEntries(EXAM.topics.map(t => [t.id, t]));
let exT = null;
function examList() {
  const done = EXAM.topics.filter(t => TK[t.id]).length;
  $('ex-count').textContent = `${done}/${EXAM.topics.length} temas listos`;
  $('ex-bar').style.transform = `scaleX(${done / EXAM.topics.length})`;
  $('ex-topics').innerHTML = EXAM.topics.map(t => `<li><a href="#/examen/${t.id}"${t === exT ? ' aria-current="step"' : ''}${TK[t.id] ? ' class="done"' : ''}>
    <span class="no" aria-hidden="true">${TK[t.id] ? CHECK : t.n}</span><span class="tl">${esc(t.title)}</span><span class="ts">${esc(t.short)}</span>${TK[t.id] ? '<span class="vh">(listo)</span>' : ''}</a></li>`).join('');
}
const field = ([k, label, hint, kind, opts]) => `<label class="fld">${esc(label)}${hint && hint !== EXAM.defaults[k] ? ` <span class="opt">${esc(hint)}</span>` : ''}${kind === 'select'
  ? `<select class="fv" name="${k}" data-s="exam.${k}">${opts.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join('')}</select>`
  : `<input class="fv" name="${k}" autocomplete="off" data-s="exam.${k}"${kind === 'num' ? ' type="number" step="any" inputmode="decimal"' : ' spellcheck="false"'}>`}</label>`;
function buildExam(id) {
  exT = TOP[id] || TOP[store.get('ditk-exam-last')] || EXAM.topics[0];
  store.set('ditk-exam-last', exT.id);
  const next = EXAM.topics[exT.n] || null;
  $('ex-topic').innerHTML = `<header class="topic-h"><h2><span class="no" aria-hidden="true">${exT.n}</span>${esc(exT.title)}</h2></header>
    <section class="pide" aria-labelledby="ex-h1"><h3 id="ex-h1">Qué te pedirá</h3><p>${esc(exT.pide)}</p><p class="small">Lo que entregas: ${esc(exT.entregas)}</p>
      ${exT.fields.length ? `<div class="form">${exT.fields.map(field).join('')}</div>` : ''}<p class="linked" id="ex-linked"></p></section>
    <div class="alerts" id="ex-alerts" aria-live="polite"></div>
    <div class="secs" id="ex-out">${sec('ex-mano', 'Hazlo a mano', true)}${sec('ex-ans', 'Compruébalo', true)}${sec('ex-sk', 'Croquis')}${sec('ex-plano', 'Lo que escribes en el plano')}</div>
    <footer class="topic-f"><label class="donebox"><input type="checkbox" id="ex-done"${TK[exT.id] ? ' checked' : ''}> Ya sé hacerlo</label>
      ${next ? `<a class="btn" href="#/examen/${next.id}">Siguiente: ${esc(next.short)} →</a>` : '<a class="btn" href="#/examen/rodamiento">Volver al primero</a>'}</footer>`;
  bind($('ex-topic'));
  $('ex-done').addEventListener('change', e => { TK[exT.id] = e.target.checked; store.set('ditk-exam-ticks', JSON.stringify(TK)); examList(); });
  examList();
}
function renderExam() {
  const r = EXAM.solveAll(S.exam)[exT.id];
  $('ex-linked').textContent = r.linked || '';
  $('ex-out').hidden = !!r.error;
  $('ex-alerts').innerHTML = r.error ? alertBox(['warn', r.error]) : (r.alerts || []).map(alertBox).join('');
  if (r.error) return;
  $('ex-mano-b').innerHTML = stepsHtml(r.steps);
  $('ex-ans-b').innerHTML = `<dl class="facts">${factsHtml(r.answer)}</dl>`;
  $('ex-sk-b').innerHTML = sketchesHtml(r.sketches);
  $('ex-plano-b').innerHTML = planoHtml(r.plano);
}

// ---- guided exercise: shaft + pulley, fixed fits h9 / D10 and keyway H9 / D10 as in the course example
document.querySelectorAll('[data-ejnav]').forEach(ol => {
  ol.innerHTML = EJ.map(([id, t, s], i) => `<li><a href="#/ejercicio/${id}" data-ej="${id}"><span class="no" aria-hidden="true">${i + 1}</span><b>${t}</b><span>${s}${id === 'pasos' ? ' · <span class="mono" data-cnt="pasos"></span>' : ''}</span></a></li>`).join('');
});
tabs($('v-medidas'), 'ej');
const depths = (d, k) => { const dt = k.dt.toFixed(3); return [tv(n1(k.t1), '+' + dt, '0.000'), tv(n1(f(d - k.t1)), '0.000', '-' + dt), tv(n1(k.t2), '+' + dt, '0.000'), tv(n1(f(d + k.t2)), '+' + dt, '0.000')]; };
const weldTxt = w => `${f(w.a)} ◺ ${w.n}x${f(w.l)}(${f(w.gap)})`;

// Tu eje: free end on the left, the keyed pulley against the collar, the welded seat on the right (STEP parts in proportion)
function shaftSide(d, seat, hub, L, c, k) {
  const p = pid(), cl = 0.4 * seat, T = 2 * seat + cl, sc = Math.min(398 / T, 190 / (1.3 * d)), x0 = 36, cy = 190;
  const X = v => x0 + v * sc, R = d / 2 * sc, Rc = 1.3 * R, xc = X(seat), xc2 = X(seat + cl), xe = X(T);
  const gx2 = xc - hub * sc, gw = Math.max(c.m * sc, 4), gx1 = gx2 - gw, gd = Math.max(c.depth * sc, 3), st = (hub - L) / 2;
  const k1 = xc - (st + L) * sc, k2 = xc - st * sc, sh = Math.min(k.b * sc, R * 0.8), yb = cy + Rc + 80;
  return svg(470, yb + 12, `Tu eje: asiento Ø${f(d)} × ${f(seat)}, polea de ${hub} contra el collar, chavetero ${L} centrado, ranura Ø${f(c.d2)} × ${f(c.m)} a ${hub} del collar`, `${defs(p)}
    <rect class="zone" x="${gx2}" y="${cy - Rc - 8}" width="${hub * sc}" height="${2 * Rc + 16}"/>
    <path class="body" d="M${x0} ${cy - R} H${gx1} V${cy - R + gd} H${gx2} V${cy - R} H${xc} V${cy - Rc} H${xc2} V${cy - R} H${xe} V${cy + R} H${xc2} V${cy + Rc} H${xc} V${cy + R} H${gx2} V${cy + R - gd} H${gx1} V${cy + R} H${x0} Z"/>
    <path class="edge" d="M${xc} ${cy - R} V${cy + R} M${xc2} ${cy - R} V${cy + R}"/>
    <rect class="cut" x="${k1}" y="${cy - sh / 2}" width="${L * sc}" height="${sh}" rx="${sh / 2}"/>
    <line class="cl" x1="${x0 - 14}" y1="${cy}" x2="${xe + 14}" y2="${cy}"/>
    <path class="ext" d="M${gx2} ${cy - Rc - 10} V30 M${xc} ${cy - Rc - 2} V30 M${k1} ${cy - sh / 2 - 2} V62 M${k2} ${cy - sh / 2 - 2} V62"/>
    ${dim(gx2, 36, xc, 36, p)}${lab((gx2 + xc) / 2, 28, 'ancho polea ' + hub)}
    ${dim(k1, 68, k2, 68, p)}${lab((k1 + k2) / 2, 60, `chavetero ${L}`)}
    <path class="ld" d="M${gx1 + gw / 2} ${cy + R - gd / 2} L${gx1 + gw / 2 + 14} ${cy + Rc + 30}"/>
    ${lab(gx1 + gw / 2 + 4, cy + Rc + 46, `ranura Ø${f(c.d2)} × ${f(c.m)} · prof. ${f(c.depth)}`, '', '', 'start')}
    ${lab((xc + xc2) / 2, cy + Rc + 20, 'collar', '', '', 'middle', true)}
    ${lab(xe, cy - R - 10, 'polea soldada', '', '', 'end', true)}
    ${dim((xc2 + xe) / 2 + 30, cy - R, (xc2 + xe) / 2 + 30, cy + R, p, 1)}${lab((xc2 + xe) / 2 + 38, cy + 6, 'Ø' + f(d), 'h9', '', 'start', true)}
    <path class="ext" d="M${x0} ${cy + R + 4} V${yb + 6} M${xc} ${cy + Rc + 2} V${yb + 6}"/>${dim(x0, yb, xc, yb, p, 1)}${lab((x0 + xc) / 2, yb - 6, 'asiento ' + f(seat), '', '', 'middle', true)}`);
}
// Tu polea, section: width, outer Ø, bore with its class
function pulleySec(d, od, hub) {
  const p = pid(), sc = Math.min(240 / od, 180 / hub), cx = 270, cy = 150, x1 = cx - hub * sc / 2, x2 = cx + hub * sc / 2, Ro = od / 2 * sc, R = d / 2 * sc;
  return svg(470, 330, `Sección de la polea: ancho ${hub}, exterior Ø${od}, agujero Ø${f(d)} D10`, `${defs(p)}
    <rect class="sec-body" fill="url(#${p}-h)" x="${x1}" y="${cy - Ro}" width="${hub * sc}" height="${Ro - R}"/>
    <rect class="sec-body" fill="url(#${p}-h)" x="${x1}" y="${cy + R}" width="${hub * sc}" height="${Ro - R}"/>
    <line class="cl" x1="${x1 - 14}" y1="${cy}" x2="${x2 + 14}" y2="${cy}"/>
    <path class="ext" d="M${x1 - 3} ${cy - R} H${x1 - 40} M${x1 - 3} ${cy + R} H${x1 - 40}"/>${dim(x1 - 32, cy - R, x1 - 32, cy + R, p)}
    ${lab(x1 - 40, cy - 4, 'Ø' + f(d), 'D10', '', 'end')}${lab(x1 - 40, cy + 14, '', '', KIT.pm(E.dev(d, 'D10')), 'end')}
    <path class="ext" d="M${x2 + 3} ${cy - Ro} H${x2 + 34} M${x2 + 3} ${cy + Ro} H${x2 + 34}"/>${dim(x2 + 26, cy - Ro, x2 + 26, cy + Ro, p)}${lab(x2 + 34, cy + 6, 'Ø' + od, '', '', 'start')}
    <path class="ext" d="M${x1} ${cy + Ro + 3} V${cy + Ro + 34} M${x2} ${cy + Ro + 3} V${cy + Ro + 34}"/>${dim(x1, cy + Ro + 28, x2, cy + Ro + 28, p)}${lab(cx, cy + Ro + 22, String(hub))}`);
}

let V = {};
function renderExercise(d) {
  const seat = num(S.seat), no = '—', al = [], K = BY.chaveta.draw, nosk = t => `<p class="small nosk">${t}</p>`;
  V = {};
  try {
    if (!(d > 0)) throw new Error('Escribe el Ø del asiento.');
    const s = E.spec(d, seat), k = s.key, c = s.circlip, j = s.join;
    if (!c) throw new Error(`El ejercicio necesita un circlip DIN 471 (Ø3 a Ø200). Para Ø${f(d)} usa las calculadoras.`);
    const keyL = j ? (j.key || j.short) : null, ok = j && keyL && j.hub > 0, cl = E.fit(d, 'D10', 'h9');
    [V.tT1, V.tDT1, V.tT2, V.tDT2] = depths(d, k);
    Object.assign(V, {
      b: f(k.b), t1: f(k.t1), t2: f(k.t2), m: f(c.m), d2: 'Ø' + f(c.d2), dD: 'Ø' + f(d), dpt2: f(d + k.t2),
      L: ok ? String(keyL) : no, hub: ok ? String(j.hub) : no, start: ok ? f((j.hub - keyL) / 2) : no, seatTxt: j ? f(seat) : no,
      odD: 'Ø' + s.od, pulleyShort: `Ø${s.od} × ${ok ? j.hub : no}`, ring: `DIN 471 - ${c.d1} x ${f(c.s)}`,
      keyCfg: `Parallel key A${k.b} x ${k.h} x ${keyL || 'L'} DIN 6885`, weld: weldTxt(s.weld),
      tSeat: tvd('Ø' + f(d), cl.shaft, 'h9'), tBore: tvd('Ø' + f(d), cl.hole, 'D10'),
      tKwS: tvd(n1(k.b), E.dev(k.b, 'H9'), 'H9'), tKwH: tvd(n1(k.b), E.dev(k.b, 'D10'), 'D10'),
      tD2: tvd('Ø' + f(c.d2), [c.d2Up, c.d2Lo], c.d2Class), tM: tvd(f(c.m), [c.mUp, c.mLo], 'H13'), tChord: tv(`(${f(s.chord)})`, null, null, null, true),
      clear: `${KIT.mn(E.mm(cl.jmin))} … ${KIT.mn(E.mm(cl.jmax))} mm`,
      keyTip: k.lens ? `Longitudes del Toolbox para ${k.b}×${k.h}: ${k.lens.join(', ')}.`
        : `El Toolbox no tiene chaveta ${k.b}×${k.h}: modélala tú (ranura ${k.b} × L, extruye ${k.h}) y guárdala como «Parallel key A${k.b} x ${k.h} x L DIN 6885».`,
      ejeSvg: ok ? shaftSide(d, seat, j.hub, keyL, c, k) : nosk('Escribe el largo del asiento para ver tu eje con la polea, el chavetero y la ranura.'),
      secSvg: K.shaftSec(d, k, 'H9', 'h9'), poleaSvg: K.hubFront(d, k, 'D10', s.od, 'D10'), detSvg: K.hubDetail(d, k, 'D10'),
      psecSvg: ok ? pulleySec(d, s.od, j.hub) : nosk('Escribe el largo del asiento: de él sale el ancho de la polea.'),
    });
    if (!j) al.push(['info', 'Sin largo de asiento faltan el ancho de la polea, el largo de la chaveta y las posiciones. Mídelo en SolidWorks (Tools › Evaluate › Measure: cara del collar + extremo del eje) y escríbelo arriba.']);
    else if (!ok) al.push(['warn', `Asiento de ${f(seat)} demasiado corto para una polea con chaveta ${k.b}×${k.h} y ranura de circlip.`]);
    else if (!j.key) al.push(['warn', `Asiento de ${f(seat)} corto para las chavetas ${k.b}×${k.h}${k.lens ? ' del Toolbox' : ''} (la más corta mide ${j.pool0}): polea de ${j.hub} y chaveta modelada por ti con L = ${keyL}.`]);
    if (!c.exact) al.push(['warn', `Ø${f(d)} no es un tamaño DIN 471 (vecinos ${c.below} / ${c.above}): se usa el anillo de ${c.d1} con su ranura normalizada Ø${f(c.d2)}. Detalle en Anillo.`]);
    if (!k.lens) al.push(['warn', `El Toolbox no tiene chaveta ${k.b}×${k.h}: tendrás que modelarla tú.`]);
  } catch (e) { al.push(['warn', e.message]); }
  $('ej-alerts').innerHTML = al.map(alertBox).join('');
  document.querySelectorAll('[data-v]').forEach(el => { el.innerHTML = el.dataset.v in V ? V[el.dataset.v] : '—'; });
  $('copy').disabled = !('keyCfg' in V);
}

// ---- table Ø7-200
{
  const pair = a => a.map(E.mm).map(KIT.mn).join(' / '), rows = [];
  for (let d = 7; d <= 200; d++) {
    const s = E.spec(d), k = s.key, c = s.circlip;
    rows.push(`<tr data-d="${d}"><td><button type="button" class="lnk">${d}</button></td><td class="m">${k.b}×${k.h}</td><td class="m">${f(k.t1)} / ${f(k.t2)}</td><td class="m">${pair(E.dev(d, 'h9'))}</td><td class="m">${pair(E.dev(d, 'D10'))}</td><td class="m">${pair(E.dev(k.b, 'H9'))}</td><td class="m">${pair(E.dev(k.b, 'D10'))}</td><td class="m">${c.d1} × ${f(c.s)}${c.exact ? '' : ' *'}</td><td class="m">Ø${f(c.d2)} ${c.d2Class} (${pair([c.d2Up, c.d2Lo])})</td><td class="m">${f(c.m)} (${pair([c.mUp, c.mLo])})</td><td class="m">${weldTxt(s.weld)}</td></tr>`);
  }
  const tb = $('full').querySelector('tbody');
  tb.innerHTML = rows.join('');
  tb.addEventListener('click', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    for (const k of ['d', 'ajuste.d', 'chaveta.d', 'anillo.d', 'soldadura.d']) set(k, tr.dataset.d);
    sync(); render();
    $('tabla-msg').innerHTML = `Ø${tr.dataset.d} cargado en <a href="#/ajuste">Ajuste</a>, <a href="#/chaveta">Chaveta</a>, <a href="#/anillo">Anillo</a>, <a href="#/soldadura">Soldadura</a> y el ejercicio guiado.`;
  });
}

// ---- hand-in checklist
const ENTREGA = [
  ['Piezas y ensamblaje', [
    ['Material asignado en todas las piezas', 'El peso del cajetín y de la lista de materiales sale de ahí.'],
    ['Piezas normalizadas con su designación', 'Tornillos, chavetas, anillos: del Toolbox y del tamaño que toca (DIN / ISO).'],
    ['Sin errores ni interferencias', 'Árbol sin avisos de reconstrucción. Evaluate › Interference Detection en el ensamblaje.'],
  ]],
  ['Plano', [
    ['Formato y cajetín', 'Plantilla del curso, tamaño de hoja que toca, y nombre, fecha, título, escala, material y peso rellenos en cada hoja.'],
    ['Una hoja por pieza que se fabrica + conjunto', 'Las piezas normalizadas no llevan plano: van en la lista de materiales.'],
    ['Conjunto con globos y lista de materiales', 'La lista encima del cajetín y con las columnas que pide el curso.'],
    ['Vistas, secciones y detalles', 'Las justas para entender la pieza, con su etiqueta y su escala. Ejes de simetría y centros.'],
    ['Cotas', 'Todas las necesarias para fabricar, ninguna repetida, ninguna encima de otra.'],
    ['Tolerancias en las cotas que ajustan', 'Asientos, agujeros, chaveteros, ranuras: mira las calculadoras (Ajuste, Chaveta, Anillo).'],
  ]],
  ['Archivos', [
    ['PDF con todas las hojas', 'Ábrelo y míralo hoja a hoja: textos legibles, nada cortado, colores correctos.'],
    ['Pack and Go en zip', 'File › Pack and Go, con el plano abierto. Comprueba que dentro están todas las piezas.'],
    ['Nombres de archivo como pide el enunciado', ''],
    ['Subido, y abierto lo subido', 'Descarga lo que has subido y comprueba que es la versión buena.'],
  ]],
];
$('entrega-list').innerHTML = ENTREGA.map(([title, items]) => `<div class="phase">${title}</div><ol class="steps">${items.map(([t, s]) =>
  `<li class="step"><input type="checkbox"><div><div class="hd"><b>${t}</b></div>${s ? `<div class="bd"><ul><li>${s}</li></ul></div>` : ''}</div></li>`).join('')}</ol>`).join('');

// ---- checklists (any section with data-list); "Borrar marcas" can be undone for 5 s
// shortcut: ticks are stored by position, so adding or reordering steps shifts old marks; give steps ids if lists start changing often
document.querySelectorAll('[data-list]').forEach(sec => {
  const name = sec.dataset.list, key = 'ditk-ticks-' + name, boxes = [...sec.querySelectorAll('.step input[type=checkbox]')];
  let ticks = []; try { ticks = JSON.parse(store.get(key) || '[]'); } catch (e) {}
  const prog = () => {
    const n = boxes.filter(b => b.checked).length;
    document.querySelectorAll(`[data-cnt="${name}"]`).forEach(el => { el.textContent = `${n}/${boxes.length}`; });
    sec.querySelector('[data-progtxt]').textContent = `${n} de ${boxes.length} hechos`;
    sec.querySelector('.prog i').style.transform = `scaleX(${n / boxes.length})`;
    boxes.forEach(b => b.closest('.step').classList.toggle('done', b.checked));
    store.set(key, JSON.stringify(boxes.map(b => b.checked)));
  };
  boxes.forEach((b, i) => {
    b.checked = !!ticks[i]; b.addEventListener('change', prog);
    b.setAttribute('aria-label', 'Hecho: ' + b.closest('.step').querySelector('.hd b').textContent);
  });
  const btn = sec.querySelector('[data-reset]');
  let undo = null, timer = 0;
  const idle = () => { undo = null; btn.textContent = 'Borrar marcas'; };
  btn.addEventListener('click', () => {
    clearTimeout(timer);
    if (undo) { boxes.forEach((b, i) => { b.checked = undo[i]; }); idle(); prog(); return; }
    undo = boxes.map(b => b.checked); boxes.forEach(b => { b.checked = false; }); prog();
    btn.textContent = 'Deshacer'; timer = setTimeout(idle, 5000);
  });
  prog();
});

// ---- copy the exercise data sheet
$('copy').addEventListener('click', () => {
  const t = h => { const x = document.createElement('div'); x.innerHTML = h; return x.textContent.replace(/\s+/g, ' ').trim(); };
  const txt = [`FICHA ${V.dD} · asiento ${V.seatTxt}`, `Chaveta: ${V.keyCfg}`, `Circlip: ${V.ring}`, `Polea: ${V.pulleyShort} · soldadura ${V.weld}`,
    `Eje chavetero: b ${V.b} · L ${V.L} · t1 ${V.t1} · empieza a ${V.start}`, `Ranura: ${V.d2} × ${V.m} · a ${V.hub} del collar`,
    `Polea chavetero: b ${V.b} · t2 ${V.t2} (o ${V.dpt2})`,
    `Tolerancias: asiento ${t(V.tSeat)} · agujero ${t(V.tBore)} · b eje ${t(V.tKwS)} · t1 ${t(V.tT1)} · b polea ${t(V.tKwH)} · t2 ${t(V.tT2)} · d2 ${t(V.tD2)} · m ${t(V.tM)}`].join('\n');
  const done = msg => { $('copy-msg').textContent = msg; setTimeout(() => { $('copy-msg').textContent = ''; }, 2500); };
  navigator.clipboard.writeText(txt).then(() => done('Copiada'), () => done('No se pudo copiar'));
});

// ---- routing: #/examen[/topic], #/calculadoras, #/<calculator id>, #/consulta, #/tabla, #/entrega, #/ejercicio/<page>
// #/ (and anything unknown) opens Examen until the day of the control, Calculadoras afterwards
const ROUTES = { calculadoras: ['v-calcs', 'calculadoras', 'Calculadoras'], consulta: ['v-consulta', 'consulta', 'Consulta'],
  tabla: ['v-tabla', 'consulta', 'Tabla Ø 7–200'], entrega: ['v-entrega', 'consulta', 'Antes de entregar'] };
for (const [id, t] of EJ) ROUTES['ejercicio/' + id] = ['v-' + id, 'consulta', t];
const home = () => new Date().toLocaleDateString('sv') <= EXAM.date ? 'examen' : 'calculadoras';
let cur = '';
function render() {
  if (BY[cur]) renderCalc(BY[cur]);
  else if (cur === 'examen') renderExam();
  else renderExercise(num(S.d));   // cheap; also fills the exercise numbers used by Pasos and Ejemplo
  document.querySelectorAll('#full tbody tr').forEach(tr => tr.classList.toggle('hit', +tr.dataset.d === num(S.d)));
  document.querySelectorAll('[data-set]').forEach(b => b.setAttribute('aria-pressed', Object.entries(JSON.parse(b.dataset.set)).every(([k, v]) => get(k) === v)));
}
function route() {
  let h = location.hash.replace(/^#\/?/, ''), topic = null;
  if (/^examen(\/|$)/.test(h)) [h, topic] = h.split('/');
  if (!BY[h] && !ROUTES[h] && h !== 'examen') h = home();
  cur = h;
  const c = BY[h], [view, top, title] = c ? ['v-calc', 'calculadoras', c.title] : h === 'examen' ? ['v-examen', 'examen', 'Examen 23/11'] : ROUTES[h];
  if (c) buildCalc(c);
  if (h === 'examen') buildExam(topic);
  document.querySelectorAll('main .in > .view').forEach(v => { v.hidden = v.id !== view; });
  document.querySelectorAll('[data-top]').forEach(a => { if (a.dataset.top === top) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.querySelectorAll('[data-ej]').forEach(a => { if (a.getAttribute('href') === '#/' + cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.title = `${title} · DI Toolkit`;
  render();
  window.scrollTo(0, 0);
}
bind(document);
addEventListener('hashchange', () => { route(); $('main').focus({ preventScroll: true }); });
route();
