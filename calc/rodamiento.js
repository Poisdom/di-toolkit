// Rodamiento de bolas DIN 625 / DIN 628 (examen 23/11: "cambia el 6210 por el 6211 y recalcula la tolerancia del eje").
// Sizes from SolidWorks' own Toolbox database (swbrowser.sldedb: DIN_DATA_BEARINGS_RBB / _ABB). Ring tolerances: ISO 492
// normal class (the professor's numbers: bore 50 → 0/−12, outer 90 → 0/−15). Method = the professor's DI-S39t p. 4:
// fix the letter, then climb the IT grades and keep the widest one that stays inside the asked range.
(function () {
  'use strict';
  const { f, num, tvd, pm, defs, dim, lab, svg, pid } = KIT;
  // series: [d, D, B, r] (r = chamfer of the ring = max fillet on the shaft shoulder)
  const SERIES = {
    '60': [[10, 26, 8, 0.3], [12, 28, 8, 0.3], [15, 32, 9, 0.3], [17, 35, 10, 0.3], [20, 42, 12, 0.6], [25, 47, 12, 0.6], [30, 55, 13, 1], [35, 62, 14, 1], [40, 68, 15, 1], [45, 75, 16, 1], [50, 80, 16, 1], [55, 90, 18, 1.1], [60, 95, 18, 1.1], [65, 100, 18, 1.1], [70, 110, 20, 1.1], [75, 115, 20, 1.1], [80, 125, 22, 1.1], [85, 130, 22, 1.1], [90, 140, 24, 1.5], [95, 145, 24, 1.5], [100, 150, 24, 1.5], [105, 160, 26, 2], [110, 170, 28, 2], [120, 180, 28, 2]],
    '62': [[10, 30, 9, 0.6], [12, 32, 10, 0.6], [15, 35, 11, 0.6], [17, 40, 12, 0.6], [20, 47, 14, 1], [25, 52, 15, 1], [30, 62, 16, 1], [35, 72, 17, 1.1], [40, 80, 18, 1.1], [45, 85, 19, 1.1], [50, 90, 20, 1.1], [55, 100, 21, 1.5], [60, 110, 22, 1.5], [65, 120, 23, 1.5], [70, 125, 24, 1.5], [75, 130, 25, 1.5], [80, 140, 26, 2], [85, 150, 28, 2], [90, 160, 30, 2], [95, 170, 32, 2.1], [100, 180, 34, 2.1], [105, 190, 36, 2.1], [110, 200, 38, 2.1], [120, 215, 40, 2.1]],
    '63': [[10, 35, 11, 0.6], [12, 37, 12, 1], [15, 42, 13, 1], [17, 47, 14, 1], [20, 52, 15, 1.1], [25, 62, 17, 1.1], [30, 72, 19, 1.1], [35, 80, 21, 1.5], [40, 90, 23, 1.5], [45, 100, 25, 1.5], [50, 110, 27, 2], [55, 120, 29, 2], [60, 130, 31, 2.1], [65, 140, 33, 2.1], [70, 150, 35, 2.1], [75, 160, 37, 2.1], [80, 170, 39, 2.1], [85, 180, 41, 3], [90, 190, 43, 3], [95, 200, 45, 3], [100, 215, 47, 3], [110, 240, 50, 3]],
    '72B': [[10, 30, 9, 0.6], [12, 32, 10, 0.6], [15, 35, 11, 0.6], [17, 40, 12, 0.6], [20, 47, 14, 1], [25, 52, 15, 1], [30, 62, 16, 1], [35, 72, 17, 1.1], [40, 80, 18, 1.1], [45, 85, 19, 1.1], [50, 90, 20, 1.1], [55, 100, 21, 1.5], [60, 110, 22, 1.5], [65, 120, 23, 1.5], [70, 125, 24, 1.5], [75, 130, 25, 1.5], [80, 140, 26, 2], [85, 150, 28, 2], [90, 160, 30, 2], [95, 170, 32, 2.1], [100, 180, 34, 2.1], [105, 190, 36, 2.1], [110, 200, 38, 2.1], [120, 215, 40, 2.1], [130, 230, 40, 3], [140, 250, 42, 3], [150, 270, 45, 3], [160, 290, 48, 3], [170, 310, 52, 4]],
    '73B': [[12, 37, 12, 1], [15, 42, 13, 1], [17, 47, 14, 1], [20, 52, 15, 1.1], [25, 62, 17, 1.1], [30, 72, 19, 1.1], [35, 80, 21, 1.5], [40, 90, 23, 1.5], [45, 100, 25, 1.5], [50, 110, 27, 2], [55, 120, 29, 2], [60, 130, 31, 2.1], [65, 140, 33, 2.1], [70, 150, 35, 2.1], [75, 160, 37, 2.1], [80, 170, 39, 2.1], [85, 180, 41, 3], [90, 190, 43, 3], [95, 200, 45, 3], [100, 215, 47, 3], [105, 225, 49, 3], [110, 240, 50, 3], [120, 260, 55, 3], [130, 280, 58, 4], [140, 300, 62, 4], [150, 320, 65, 4], [160, 340, 68, 4], [170, 360, 72, 4]],
  };
  const SNAME = { '60': 'DIN 625 · 60xx', '62': 'DIN 625 · 62xx', '63': 'DIN 625 · 63xx', '72B': 'DIN 628 · 72xxB', '73B': 'DIN 628 · 73xxB' };
  // ISO 492 normal class: lower deviation (µm) of the bore d / of the outer Ø D, upper deviation 0
  const RING_D = [[10, -8], [18, -8], [30, -10], [50, -12], [80, -15], [120, -20], [180, -25], [250, -30]];
  const RING_OD = [[18, -8], [30, -9], [50, -11], [80, -13], [120, -15], [150, -18], [180, -25], [250, -30], [315, -35], [400, -40]];
  const ring = (t, x) => (t.find(([up]) => x <= up) || [0, null])[1];
  const code = d => ({ 10: '00', 12: '01', 15: '02', 17: '03' })[d] || String(d / 5).padStart(2, '0');
  const name = (s, d) => s.replace('B', '') + code(d) + (s.endsWith('B') ? 'B' : '');
  const din = s => s.startsWith('7') ? 'DIN 628' : 'DIN 625';
  const twin = s => ({ '62': '72B', '72B': '62', '63': '73B', '73B': '63' })[s];
  const GRADES = [3, 4, 5, 6, 7, 8];

  // fit of a class against a ring: shaft → interference (apriete), housing → clearance (juego), both in µm
  // the ring's band is [0, lo], so the same two lines give both
  function check(x, cls, lo) {
    const [up, low] = DI.dev(x, cls);
    return { cls, up, low, min: low, max: up - lo };
  }
  // the professor's ladder: same letter, IT3..IT8; the widest grade inside [tmin, tmax] wins
  function ladder(x, letter, lo, hole, tmin, tmax) {
    const rows = [];
    for (const g of GRADES) { try { const c = check(x, letter + g, lo); c.ok = c.min >= tmin && c.max <= tmax; rows.push(c); } catch (e) { /* grade not defined for this letter */ } }
    const best = rows.filter(r => r.ok).pop() || null;
    let others = [];
    if (!best) {   // no grade of that letter fits: every other letter that does, widest first
      const Ls = hole ? ['F', 'G', 'H', 'JS', 'K', 'M', 'N'] : ['g', 'h', 'js', 'k', 'm', 'n', 'p'];
      for (const L of Ls) for (const g of GRADES) { try { const c = check(x, L + g, lo); if (c.min >= tmin && c.max <= tmax) others.push(c); } catch (e) {} }
      others = others.sort((a, b) => (b.up - b.low) - (a.up - a.low)).slice(0, 4);
    }
    return { rows, best, others };
  }
  function parseCls(s, hole) {
    const m = /^([a-zA-Z]{1,2})(\d{1,2})$/.exec(String(s).trim());
    if (!m || (hole ? m[1] !== m[1].toUpperCase() : m[1] !== m[1].toLowerCase()))
      throw new Error(hole ? 'La clase de la caja va en mayúscula (ej. G3, H7, J6).' : 'La clase del eje va en minúscula (ej. k5, m6, js5).');
    return { L: m[1], g: +m[2], cls: m[0] };
  }

  function calc(d, st) {
    const s = SERIES[st.serie] ? st.serie : '62', row = SERIES[s].find(r => r[0] === d);
    if (!row) throw new Error(`No hay rodamiento ${SNAME[s]} con agujero d = ${f(d)}. Agujeros de la serie: ${SERIES[s].map(r => r[0]).join(', ')}.`);
    const [, D, B, r] = row, lo = ring(RING_D, d), LO = ring(RING_OD, D);
    const ae = parseCls(st.eje, false), ac = parseCls(st.caja, true);
    const amin = num(st.amin), amax = num(st.amax), jmin = num(st.jmin), jmax = num(st.jmax);
    if (![amin, amax, jmin, jmax].every(Number.isFinite) || amin > amax || jmin > jmax) throw new Error('Escribe los rangos de apriete y de juego (mín ≤ máx, en µm).');
    let shaft, hole;
    try { shaft = check(d, ae.cls, lo); } catch (e) { throw new Error(`Clase del eje: ${e.message}`); }
    try { hole = check(D, ac.cls, LO); } catch (e) { throw new Error(`Clase de la caja: ${e.message}`); }
    return { s, name: name(s, d), d, D, B, r, lo, LO, shaft, hole, ls: ladder(d, ae.L, lo, false, amin, amax), lh: ladder(D, ac.L, LO, true, jmin, jmax), amin, amax, jmin, jmax, circ: DI.circlipFor(d) };
  }

  const um = x => KIT.mn((x > 0 ? '+' : '') + x);
  // "6211" → { serie '62', d 55 }; 00–03 = 10/12/15/17, else × 5; angular contact (7x) always B
  function parse(s) {
    const m = /^(6[023]|7[23])(\d\d)(B?)$/i.exec(String(s).trim().toUpperCase());
    const serie = m && (m[1].startsWith('7') ? m[1] + 'B' : m[1]), d = m && ({ '00': 10, '01': 12, '02': 15, '03': 17 }[m[2]] || +m[2] * 5);
    if (!m || !SERIES[serie].some(r => r[0] === d)) throw new Error(`No reconozco la designación «${String(s).trim()}». Ejemplos: 6210, 6211, 6305, 7210B.`);
    return { serie, d };
  }
  // the professor's hand method, step by step
  function mano(d, st) {
    const R = calc(d, st), mn = KIT.mn, IT = c => c.up - c.low, cd = code(d);
    const lad = (L, w) => L.rows.map(c => `${c.cls} ${c.min} a ${c.max} ${c.ok ? '✔' : '✘'}`).join(' · ') + (L.best ? ` → <b>${L.best.cls}</b>` : ` → ninguna ${w}`);
    const out = [
      ['Designación', `${R.name}: ${+cd <= 3 ? `${cd} → d = ${d}` : `${cd} × 5 = d ${d}`} · tabla ${din(R.s)}: D ${R.D} · B ${R.B}`],
      ['Anillo interior (ISO 492)', `d ${d} → <b>0 / ${mn(R.lo)}</b> µm`],
      [`Eje ${R.shaft.cls}`, `IT = ${IT(R.shaft)} µm · ei = ${um(R.shaft.low)} → es = ${um(R.shaft.up)} µm`],
      ['Apriete', `mín = ei − 0 = ${R.shaft.min} · máx = es − (${mn(R.lo)}) = ${R.shaft.max} → <b>${R.shaft.min} a ${R.shaft.max} µm</b> ${ok(R.shaft, R.amin, R.amax) ? '✔' : '✘'} (pedido ${R.amin}–${R.amax})`],
    ];
    if (!ok(R.shaft, R.amin, R.amax) || R.ls.best?.cls !== R.shaft.cls) out.push(['Escala IT (misma letra)', lad(R.ls, R.shaft.cls.replace(/\d+/, ''))]);
    out.push(['Anillo exterior (ISO 492)', `D ${R.D} → <b>0 / ${mn(R.LO)}</b> µm`],
      [`Caja ${R.hole.cls}`, `EI = ${um(R.hole.low)} → juego mín ${R.hole.min} · ES = ${um(R.hole.up)} → juego máx = ES − (${mn(R.LO)}) = ${R.hole.max} → <b>${R.hole.min} a ${R.hole.max} µm</b> ${ok(R.hole, R.jmin, R.jmax) ? '✔' : '✘'} (pedido ${R.jmin}–${R.jmax})`]);
    if (!ok(R.hole, R.jmin, R.jmax)) out.push(['Escala IT de la caja', lad(R.lh, R.hole.cls.replace(/\d+/, ''))]);
    return out;
  }
  const ok = (c, a, b) => c.min >= a && c.max <= b;
  // tolerance zones like the professor draws them: zero line, the ring's band, your class's band(s)
  function zonesSvg(R) {
    const p = pid(), y0 = 150, vals = [R.lo, R.LO, R.shaft.up, R.hole.up, R.ls.best?.up ?? 0, R.lh.best?.up ?? 0, 1], k = 110 / Math.max(...vals.map(Math.abs));
    const Y = v => y0 - v * k;
    const band = (x, up, low, cls, t1, t2) => `<rect class="${cls}" x="${x}" y="${Y(up)}" width="44" height="${Math.max((up - low) * k, 2)}"/>${lab(x + 22, Y(up) - 6, um(up), '', '', 'middle', cls === 'zone')}${lab(x + 22, Y(low) + 16, um(low), '', '', 'middle', cls === 'zone')}<text x="${x + 22}" y="288" text-anchor="middle">${t1}</text>${t2 ? `<text x="${x + 22}" y="272" text-anchor="middle" class="v">${t2}</text>` : ''}`;
    const sb = R.ls.best && R.ls.best.cls !== R.shaft.cls ? band(160, R.ls.best.up, R.ls.best.low, 'zh', 'pedido', R.ls.best.cls) : '';
    const hb = R.lh.best && R.lh.best.cls !== R.hole.cls ? band(410, R.lh.best.up, R.lh.best.low, 'zh', 'pedido', R.lh.best.cls) : '';
    return svg(470, 300, `Zonas de tolerancia en micras: anillo interior 0/${R.lo} con el eje ${R.shaft.cls}; anillo exterior 0/${R.LO} con la caja ${R.hole.cls}`, `${defs(p)}
      <line class="edge" x1="10" y1="${y0}" x2="460" y2="${y0}"/><text x="12" y="${y0 - 6}">0</text>
      <text x="20" y="22">eje · apriete</text><text x="260" y="22">caja · juego</text><line class="ext" x1="240" y1="10" x2="240" y2="290"/>
      ${band(40, 0, R.lo, 'zone', 'anillo int.')}${band(100, R.shaft.up, R.shaft.low, 'zs', 'plano', R.shaft.cls)}${sb}
      ${band(290, 0, R.LO, 'zone', 'anillo ext.')}${band(350, R.hole.up, R.hole.low, 'zs', 'plano', R.hole.cls)}${hb}`);
  }
  // upper half section: shaft seat, bearing (simplified: rectangle with an upright cross), housing, circlip groove
  function seatSvg(R) {
    const p = pid(), c = R.circ, s = 150 / (R.D / 2), yc = 250, yd = yc - R.d / 2 * s, yD = yc - R.D / 2 * s, w = R.B * s;
    const xb = 200, xs = xb + w, ysh = yd - (R.D - R.d) / 6 * s, gw = c ? Math.max(c.m * s, 4) : 0, gd = c ? Math.max(c.depth * s, 3) : 0, xg = xb - 6 - gw;
    return svg(470, 290, `Media sección: eje Ø${R.d} ${R.shaft.cls}, rodamiento ${R.name} de ancho ${R.B}, caja Ø${R.D} ${R.hole.cls}${c ? `, anillo DIN 471 junto al rodamiento` : ''}`, `${defs(p)}
      <path class="body" d="M30 ${yc} V${yd} H${xg} ${c ? `V${yd + gd} H${xg + gw} V${yd}` : ''} H${xs} V${ysh} H440 V${yc} Z"/>
      <rect class="sec-body" fill="url(#${p}-h)" x="${xb - 40}" y="${yD - 34}" width="${w + 80}" height="34"/>
      <rect class="zone" x="${xb}" y="${yD}" width="${w}" height="${yd - yD}"/>
      <path class="edge" d="M${xb + w / 2} ${yD + (yd - yD) * .25} V${yD + (yd - yD) * .75} M${xb + w * .25} ${(yD + yd) / 2} H${xb + w * .75}"/>
      <line class="cl" x1="20" y1="${yc}" x2="450" y2="${yc}"/>
      <path class="ext" d="M${xb} ${yD - 36} V${yD - 54} M${xs} ${yD - 36} V${yD - 54}"/>${dim(xb, yD - 48, xs, yD - 48, p, 1)}${lab((xb + xs) / 2, yD - 56, 'B ' + R.B, '', '', 'middle', true)}
      ${dim(70, yc, 70, yd, p)}${lab(78, (yc + yd) / 2, 'Ø' + R.d, R.shaft.cls, '', 'start')}${lab(78, (yc + yd) / 2 + 18, '', '', pm([R.shaft.up, R.shaft.low]), 'start')}
      <path class="ext" d="M${xs + 42} ${yD} H436"/>${dim(430, yc, 430, yD, p)}${lab(424, yD + 20, 'Ø' + R.D, R.hole.cls, '', 'end')}${lab(424, yD + 38, '', '', pm([R.hole.up, R.hole.low]), 'end')}
      ${c ? `<path class="ld" d="M${xg + gw / 2} ${yd + 1} L${xg - 30} ${yd - 34}"/>${lab(xg - 34, yd - 40, `ranura Ø${f(c.d2)} × ${f(c.m)}`, '', '', 'end')}` : ''}
      ${lab((xs + 400) / 2, (ysh + yc) / 2 + 5, 'collar', '', '', 'middle', true)}<text x="${xb - 48}" y="${yD - 12}" text-anchor="end">${R.name}</text>`);
  }

  const row = (k, v) => `<div class="row"><span class="k">${k}</span><span class="v big">${v}</span></div>`;
  const fitTxt = (c, w) => `${c.cls} (${um(c.up)}/${um(c.low)}) → ${w} ${c.min} a ${c.max} µm`;
  const ladderHtml = (L, w, a, b) => `<table class="plano"><thead><tr><th>Clase</th><th>Desviaciones (µm)</th><th>${w} (µm)</th><th></th></tr></thead><tbody>${L.rows.map(c =>
    `<tr><td class="mono">${c.cls}</td><td class="mono">${um(c.up)} / ${um(c.low)}</td><td class="mono">${c.min} a ${c.max}</td><td>${c.ok ? (c === L.best ? '<b>✔ la elegida</b>' : 'cumple') : (c.max > b ? 'máx. demasiado alto' : 'mín. demasiado bajo')}</td></tr>`).join('')}</tbody></table>
    ${L.best ? '' : `<p class="small">Ninguna calidad de esa letra da ${a}–${b} µm. ${L.others.length ? 'Sí cumplen: ' + L.others.map(c => `<b class="mono">${c.cls}</b> (${c.min} a ${c.max})`).join(', ') + '.' : 'Ninguna clase de la tabla cumple: revisa el rango.'}</p>`}`;

  CALCS.push({
    id: 'rodamiento', group: 'Transmisión', title: 'Rodamiento + tolerancia del eje', norma: 'DIN 625 / 628 · ISO 492',
    blurb: 'Cambia el 6210 por otro: medidas, k5, apriete, caja',
    intro: 'Con la serie y el agujero d: las medidas del rodamiento, la tolerancia de su anillo, el apriete que da la clase del eje del plano (k5) y la que tocaría para mantener el apriete pedido. Igual para la caja con el juego.',
    casos: 'rodamiento.json', calc, parse, mano,
    defaults: { serie: '62', eje: 'k5', amin: '2', amax: '25', caja: 'G3', jmin: '2', jmax: '34' },
    preview(d, st) { const R = calc(d, st); return `${R.name} · ${R.d}×${R.D}×${R.B} · ${fitTxt(R.shaft, 'apriete')}`; },
    form: () => `<fieldset><legend>Rodamiento</legend><div class="fg">
      <label class="fld">Serie<select class="fv" data-s="rodamiento.serie">${Object.keys(SERIES).map(k => `<option value="${k}">${SNAME[k]}</option>`).join('')}</select></label>
      <label class="fld">Agujero d (mm) <span class="opt">6211 → 11 × 5 = 55; 00/01/02/03 = 10/12/15/17</span><input class="fv" data-s="rodamiento.d" type="number" min="10" step="any" inputmode="decimal"></label></div></fieldset>
      <fieldset><legend>Eje (anillo interior)</legend><div class="fg">
      <label class="fld">Clase del plano<input class="fv" data-s="rodamiento.eje" autocomplete="off" spellcheck="false"></label>
      <label class="fld">Apriete mín. (µm)<input class="fv" data-s="rodamiento.amin" type="number" step="any" inputmode="decimal"></label>
      <label class="fld">Apriete máx. (µm)<input class="fv" data-s="rodamiento.amax" type="number" step="any" inputmode="decimal"></label></div></fieldset>
      <fieldset><legend>Caja (anillo exterior)</legend><div class="fg">
      <label class="fld">Clase del plano<input class="fv" data-s="rodamiento.caja" autocomplete="off" spellcheck="false"></label>
      <label class="fld">Juego mín. (µm)<input class="fv" data-s="rodamiento.jmin" type="number" step="any" inputmode="decimal"></label>
      <label class="fld">Juego máx. (µm)<input class="fv" data-s="rodamiento.jmax" type="number" step="any" inputmode="decimal"></label></div></fieldset>`,
    run(d, st) {
      const R = calc(d, st), c = R.circ, alerts = [], tw = twin(R.s), sb = R.ls.best, hb = R.lh.best;
      if (!ok(R.shaft, R.amin, R.amax)) alerts.push(['warn', `Con ${R.shaft.cls} el apriete sale ${R.shaft.min} a ${R.shaft.max} µm, fuera de ${R.amin}–${R.amax}. ${sb ? `Para mantenerlo: ${R.d} ${sb.cls} (${sb.min} a ${sb.max} µm).` : 'Mira la tabla del eje en Valores.'}`]);
      if (!ok(R.hole, R.jmin, R.jmax)) alerts.push(['warn', `Con ${R.hole.cls} el juego sale ${R.hole.min} a ${R.hole.max} µm, fuera de ${R.jmin}–${R.jmax}. ${hb ? `Usa ${R.D} ${hb.cls}.` : 'Mira la tabla de la caja en Valores.'}`]);
      if ([R.hole, hb, R.shaft, sb].some(x => x && /\D3$/.test(x.cls))) alerts.push(['info', 'IT3 no está en SolidWorks: acótala a mano (Bilateral con las desviaciones) y añade la clase como texto, como hizo el profesor con 90 G3.']);
      if (!c) alerts.push(['warn', 'La tabla DIN 471 de la app no llega a ese Ø.']);
      return {
        alerts,
        tiles: [['Rodamiento', R.name, `d ${R.d} · D ${R.D} · B ${R.B} · ${din(R.s)}`],
          ['Eje · ' + R.shaft.cls, `Ø${R.d} ${R.shaft.cls}`, `${pm([R.shaft.up, R.shaft.low])} · apriete ${R.shaft.min} a ${R.shaft.max} µm`],
          ['Apriete ' + R.amin + '–' + R.amax, sb ? `Ø${R.d} ${sb.cls}` : 'ninguna ' + R.shaft.cls.replace(/\d+/, ''), sb ? `${pm([sb.up, sb.low])} · ${sb.min} a ${sb.max} µm` : 'mira Valores'],
          ['Caja · juego ' + R.jmin + '–' + R.jmax, hb ? `Ø${R.D} ${hb.cls}` : 'ninguna ' + R.hole.cls.replace(/\d+/, ''), hb ? `${pm([hb.up, hb.low])} · juego ${hb.min} a ${hb.max} µm` : 'mira Valores'],
          ['Anillo (circlip)', c ? `DIN 471 - ${c.d1} x ${f(c.s)}` : '—', c ? `ranura Ø${f(c.d2)} ${c.d2Class} × ${f(c.m)} H13` : '']],
        more: `<article class="panel"><h3>1 · Medidas (${din(R.s)}, tabla del Toolbox)</h3>
            ${row('Designación', R.name)}${row('d × D × B', `${R.d} × ${R.D} × ${R.B}`)}${row('Radio r del anillo', `${f(R.r)} <span class="small">(el redondeo del collar del eje, ≤ r)</span>`)}
            ${tw && SERIES[tw].find(x => x[0] === R.d) ? row('Su pareja', `${name(tw, R.d)} <span class="small">(${din(tw)}, mismas d, D y B)</span>`) : ''}
            ${row('Toolbox', `DIN › Bearings › Ball Bearings › ${din(R.s) === 'DIN 628' ? 'Angular Contact Ball DIN 628' : 'Ball DIN 625'} · Size <b>${R.name}</b>`)}</article>
          <article class="panel"><h3>2 · Anillo interior con el eje (apriete ${R.amin}–${R.amax} µm)</h3>
            <p class="small">Agujero del rodamiento d = ${R.d}: <b>0 / ${R.lo} µm</b> (ISO 492 normal). Apriete mín. = ei del eje − 0; apriete máx. = es del eje − (${R.lo}).</p>
            ${ladderHtml(R.ls, 'Apriete', R.amin, R.amax)}</article>
          <article class="panel"><h3>3 · Anillo exterior con la caja (juego ${R.jmin}–${R.jmax} µm)</h3>
            <p class="small">Exterior del rodamiento D = ${R.D}: <b>0 / ${R.LO} µm</b>. Juego mín. = EI de la caja − 0; juego máx. = ES de la caja − (${R.LO}).</p>
            ${ladderHtml(R.lh, 'Juego', R.jmin, R.jmax)}</article>`,
        sketches: [
          ['Zonas de tolerancia (en µm)', 'Línea de cero, la banda del anillo (gris) y la de tu clase. Apriete = el eje por encima del anillo; juego = la caja por encima del anillo.', zonesSvg(R)],
          ['Hoja del eje / conjunto · media sección', 'El rodamiento simplificado (rectángulo con cruz), apoyado en el collar y sujeto por el anillo DIN 471.', seatSvg(R)],
        ],
        plano: [
          ['Hoja del eje', [
            ['Asiento del rodamiento (clase del plano)', tvd('Ø' + R.d, [R.shaft.up, R.shaft.low], R.shaft.cls) + ` <span class="small">apriete ${R.shaft.min} a ${R.shaft.max} µm</span>`],
            ...(sb && sb.cls !== R.shaft.cls ? [[`Si piden apriete ${R.amin}–${R.amax}`, tvd('Ø' + R.d, [sb.up, sb.low], sb.cls)]] : []),
            ['Rugosidad del asiento', '<span class="big">N4</span> <span class="small">(como el plano del profesor)</span>'],
            ['Largo del asiento', `<span class="big">≥ ${R.B}</span> <span class="small">+ la ranura del anillo</span>`],
            ...(c ? [['Ranura del anillo · Ø d2 · ancho m', `${tvd('Ø' + f(c.d2), [c.d2Up, c.d2Lo], c.d2Class)} · ${tvd(f(c.m), [c.mUp, c.mLo], 'H13')}`], ['Ranura · posición', `<span class="big">${R.B}</span> <span class="small">del collar (el ancho del rodamiento)</span>`]] : []),
          ]],
          ['Hoja de la caja', [['Alojamiento del rodamiento', tvd('Ø' + R.D, [(hb || R.hole).up, (hb || R.hole).low], (hb || R.hole).cls)]]],
          ['Lista de materiales', [['Rodamiento', `<span class="mono">${din(R.s)} - ${R.name}</span>`], ...(c ? [['Anillo', `<span class="mono">DIN 471 - ${c.d1} x ${f(c.s)}</span>`]] : [])]],
        ],
        source: `<p><b>Designación:</b> las dos últimas cifras × 5 = d (6211 → 55); 00, 01, 02, 03 = 10, 12, 15, 17. 62 = serie ligera, 63 = media; 72xxB = de contacto angular (DIN 628) con las mismas medidas que el 62xx.</p>
          <p><b>Medidas:</b> la base de datos del Toolbox de SolidWorks (DIN 625 / DIN 628).</p>
          <p><b>Tolerancia de los anillos (ISO 492, clase normal):</b> agujero d 18–30: 0/−10 · 30–50: 0/−12 · 50–80: 0/−15 · 80–120: 0/−20 · 120–180: 0/−25. Exterior D 30–50: 0/−11 · 50–80: 0/−13 · 80–120: 0/−15 · 120–150: 0/−18 · 150–180: 0/−25. Profesor: 50 → 0/−12 (con 50 k5 = +13/+2 da apriete 2 a 25) y 90 → 0/−15.</p>
          <p><b>Método (DI-S39t p. 4):</b> con la letra fija, se prueba IT3, IT4, IT5… y se queda la calidad más ancha que no se sale del rango. Caja del profesor: juego 2–34 en Ø90 → G5 (12, 27) y G4 (12, 22) se pasan, G3 (12, 18) vale. k: ei = +2 de IT4 a IT7 (0 en IT3 y desde IT8).</p>
          <p><b>Anillo:</b> DIN 471 para el agujero del rodamiento (calculadora Anillo de seguridad), ranura a B del collar.</p>`,
      };
    },
  });
})();
