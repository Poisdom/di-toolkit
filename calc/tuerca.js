// Extremo roscado del eje con tuerca y contratuerca (examen 23/11: "alargar el eje con diámetro inferior al interior de la
// polea y colocar tuerca y contratuerca"). Nut sizes from SolidWorks' Toolbox database (DIN EN 24032 = ISO 4032 = ex DIN 934,
// DIN EN 24035 = ISO 4035 = ex DIN 439). The 2 mm the seat stays short of the hub is my choice, so the nut clamps the hub.
(function () {
  'use strict';
  const { f, num, defs, dim, lab, svg, pid } = KIT;
  // [M, pitch P, across flats s, ISO 4032 height m, ISO 4035 thin height]
  const NUTS = [[3, 0.5, 5.5, 2.4, 1.8], [4, 0.7, 7, 3.2, 2.2], [5, 0.8, 8, 4.7, 2.7], [6, 1, 10, 5.2, 3.2], [8, 1.25, 13, 6.8, 4], [10, 1.5, 16, 8.4, 5],
    [12, 1.75, 18, 10.8, 6], [16, 2, 24, 14.8, 8], [20, 2.5, 30, 18, 10], [24, 3, 36, 21.5, 12], [30, 3.5, 46, 25.6, 15], [36, 4, 55, 31, 18],
    [42, 4.5, 65, 34, 21], [48, 5, 75, 38, 24], [56, 5.5, 85, 45, 28], [64, 6, 95, 51, 32]];
  const GAP = 2;   // seat shorter than the hub by this much
  const up5 = x => Math.ceil(x / 5 - 1e-9) * 5;

  function calc(d, st) {
    const hub = num(st.hub), want = num(st.m);
    if (!(hub > 0)) throw new Error('Escribe el ancho del cubo de la polea.');
    const n = want > 0 ? NUTS.find(r => r[0] === want) : NUTS.filter(r => r[0] < d).pop();
    if (!n) throw new Error(want > 0 ? `M${want} no está en la tabla (M3–M64, serie preferente).` : `El agujero Ø${f(d)} es demasiado pequeño: no hay métrica por debajo.`);
    const [M, P, s, m, mt] = n, d3 = M - 1.22687 * P, ch = Math.ceil((M - d3) / 2 * 2) / 2;
    const Lmin = GAP + mt + m + 2 * P;
    return { M, P, s, m, mt, d3, ch, hub, seat: hub - GAP, Lmin, L: up5(Lmin), e: s / Math.cos(Math.PI / 6) };
  }

  // side view: Ø seat inside the hub (grey, given), threaded end, thin nut against the hub, normal nut on top
  function endSvg(d, T) {
    const p = pid(), H = Math.max(1.8 * d, T.e * 1.1), sc = Math.min(390 / (T.hub + T.L + 10), 200 / H), cy = 150, x0 = 30;
    const X = v => x0 + v * sc, R = d / 2 * sc, Rm = T.M / 2 * sc, R3 = T.d3 / 2 * sc, Rh = H / 2 * sc * 0.9, E = T.e / 2 * sc;
    const xs = X(T.seat), xh = X(T.hub), xe = X(T.seat + T.L), xn1 = xh + T.mt * sc, xn2 = xn1 + T.m * sc;
    return svg(470, 330, `Extremo del eje: asiento Ø${f(d)} de ${f(T.seat)} dentro del cubo de ${f(T.hub)}, rosca M${T.M} de ${T.L}, contratuerca de ${T.mt} y tuerca de ${T.m}`, `${defs(p)}
      <rect class="zone" x="${x0}" y="${cy - Rh}" width="${T.hub * sc}" height="${2 * Rh}"/>
      <path class="body" d="M${x0 - 8} ${cy - R} H${xs} V${cy - Rm} H${xe - T.ch * sc} L${xe} ${cy - Rm + T.ch * sc} V${cy + Rm - T.ch * sc} L${xe - T.ch * sc} ${cy + Rm} H${xs} V${cy + R} H${x0 - 8}"/>
      <path class="ext" d="M${xs} ${cy - R3} H${xe - T.ch * sc} M${xs} ${cy + R3} H${xe - T.ch * sc}"/>
      <rect class="cut" x="${xh}" y="${cy - E}" width="${T.mt * sc}" height="${2 * E}"/><rect class="cut" x="${xn1}" y="${cy - E}" width="${T.m * sc}" height="${2 * E}"/>
      <line class="cl" x1="${x0 - 14}" y1="${cy}" x2="${xe + 14}" y2="${cy}"/>
      <path class="ext" d="M${x0} ${cy + Rh + 2} V${cy + Rh + 60} M${xs} ${cy + R + 2} V${cy + Rh + 30} M${xh} ${cy + E + 2} V${cy + Rh + 60} M${xe} ${cy + Rm + 2} V${cy + Rh + 30}"/>
      ${dim(x0, cy + Rh + 24, xs, cy + Rh + 24, p)}${lab((x0 + xs) / 2, cy + Rh + 18, 'asiento ' + f(T.seat))}
      ${dim(xs, cy + Rh + 24, xe, cy + Rh + 24, p)}${lab((xs + xe) / 2, cy + Rh + 18, 'rosca ' + T.L)}
      ${dim(x0, cy + Rh + 54, xh, cy + Rh + 54, p, 1)}${lab((x0 + xh) / 2, cy + Rh + 48, 'cubo ' + f(T.hub), '', '', 'middle', true)}
      ${lab(xe + 6, cy - Rm - 8, 'M' + T.M, '', '', 'start')}${lab(x0 + 4, cy - R - 8, 'Ø' + f(d), '', '', 'start', true)}
      ${lab((xh + xn1) / 2, cy - E - 10, String(T.mt), '', '', 'middle', true)}${lab((xn1 + xn2) / 2, cy - E - 10, String(T.m), '', '', 'middle', true)}
      <text x="${x0 + 4}" y="24">polea (gris) · contratuerca · tuerca</text>`);
  }

  const row = (k, v) => `<div class="row"><span class="k">${k}</span><span class="v big">${v}</span></div>`;

  CALCS.push({
    id: 'tuerca', group: 'Uniones y piezas normalizadas', title: 'Tuerca + contratuerca (extremo del eje)', norma: 'ISO 4032 / 4035',
    blurb: 'Alarga el eje con una rosca menor que el agujero de la polea',
    intro: 'Con el Ø del agujero de la polea: la métrica del extremo roscado (la mayor que pasa por el agujero), la tuerca, la contratuerca y los largos que acotas.',
    casos: 'tuerca.json', calc,
    defaults: { hub: '50', m: '' },
    preview(d, st) { const T = calc(d, st); return `M${T.M} · rosca ${T.L} · tuerca ${T.m} + contratuerca ${T.mt}`; },
    form: () => `<label class="fld">Ø del agujero de la polea (mm)<input class="fv" data-s="tuerca.d" type="number" min="4" step="any" inputmode="decimal"></label>
      <label class="fld">Ancho del cubo de la polea (mm) <span class="opt">el profesor: 50</span><input class="fv" data-s="tuerca.hub" type="number" min="1" step="any" inputmode="decimal"></label>
      <label class="fld">Métrica <span class="opt">vacío = la mayor por debajo del agujero</span><input class="fv" data-s="tuerca.m" type="number" min="3" step="1" inputmode="numeric" placeholder="auto"></label>`,
    mano(d, st) {
      const T = calc(d, st);
      return [
        ['Rosca', `la mayor métrica por debajo del agujero Ø${f(d)}: <b>M${T.M}</b>, paso ${T.P}`],
        ['Tuerca y contratuerca', `ISO 4032 m = <b>${T.m}</b> · ISO 4035 m = <b>${T.mt}</b> · entrecaras ${T.s}`],
        ['Asiento de la polea', `cubo − ${GAP} = ${f(T.hub)} − ${GAP} = <b>${f(T.seat)}</b> (así la tuerca aprieta el cubo)`],
        ['Largo roscado', `${GAP} + ${T.mt} + ${T.m} + 2·${T.P} = ${f(T.Lmin)} → <b>${T.L}</b> (redondeado a 5)`],
        ['Fondo de rosca', `d3 = M − 1.2269·P = ${T.M} − 1.2269·${T.P} = <b>${f(+T.d3.toFixed(2))}</b> · chaflán ${f(T.ch)} × 45°`],
      ];
    },
    run(d, st) {
      const T = calc(d, st), alerts = [];
      if (T.M >= d) alerts.push(['warn', `M${T.M} no pasa por el agujero Ø${f(d)}: la rosca tiene que ser menor que el agujero de la polea.`]);
      if (T.s <= d) alerts.push(['warn', `La tuerca (entrecaras ${T.s}) cabe por el agujero Ø${f(d)}: pon una arandela o elige una métrica mayor.`]);
      if (!(st.m > 0) && d > 70) alerts.push(['info', 'La tabla llega a M64: para agujeros más grandes se usa tuerca ranurada (DIN 981 / KM).']);
      return {
        alerts,
        tiles: [['Rosca del extremo', `M${T.M}`, `paso ${T.P} (gruesa) · fondo Ø${f(+T.d3.toFixed(2))}`], ['Largo roscado', String(T.L), `≥ ${f(T.Lmin)} = ${GAP} + ${T.mt} + ${T.m} + 2·${T.P}`],
          ['Tuerca', `ISO 4032 - M${T.M}`, `m ${T.m} · entrecaras ${T.s} (ex DIN 934)`], ['Contratuerca', `ISO 4035 - M${T.M}`, `m ${T.mt} · entrecaras ${T.s} (ex DIN 439)`],
          ['Asiento de la polea', f(T.seat), `${f(T.hub)} − ${GAP}: así la tuerca aprieta el cubo`]],
        more: `<article class="panel"><h3>Toolbox › DIN › Nuts › Hex Nuts</h3>
            ${row('Tuerca', `Style 1 (EN 24032) · Size M${T.M}`)}${row('Contratuerca', `Thin (Chamfered) (EN 24035) · Size M${T.M}`)}
            ${row('Orden', 'contratuerca fina contra la polea, tuerca normal encima')}${row('Rosca en el eje', `Cosmetic Thread M${T.M} × ${T.L} en el extremo`)}</article>`,
        sketches: [['Hoja del eje / conjunto · extremo roscado', 'La rosca empieza 2 mm dentro del cubo: si el asiento fuera igual de largo que el cubo, la tuerca apretaría contra el escalón y no contra la polea.', endSvg(d, T)]],
        plano: [
          ['Hoja del eje', [['Rosca', `<span class="big">M${T.M} × ${T.L}</span>`], ['Línea fina del fondo de rosca', `<span class="big">Ø${f(+T.d3.toFixed(2))}</span> <span class="small">(¾ de círculo en la vista de frente)</span>`],
            ['Chaflán del extremo', `<span class="big">${f(T.ch)} × 45°</span>`], ['Largo del asiento de la polea', `<span class="big">${f(T.seat)}</span> <span class="small">(cubo ${f(T.hub)} − ${GAP})</span>`]]],
          ['Lista de materiales', [['Tuerca', `<span class="mono">ISO 4032 - M${T.M}</span>`], ['Contratuerca', `<span class="mono">ISO 4035 - M${T.M}</span>`]]],
        ],
        source: `<p><b>Rosca:</b> la mayor métrica gruesa de serie preferente menor que el agujero de la polea, para que la polea entre por el extremo (Ø40 → M36). Fondo de rosca d3 = d − 1.2269·P.</p>
          <p><b>Tuercas:</b> alturas y entrecaras de la base de datos del Toolbox (DIN EN 24032 = ISO 4032, antes DIN 934; DIN EN 24035 = ISO 4035, antes DIN 439). También vale poner dos ISO 4032 iguales.</p>
          <p><b>Largos (criterio mío, no del profesor):</b> el asiento ${GAP} mm más corto que el cubo; rosca = ${GAP} + contratuerca + tuerca + 2 hilos sobrantes, redondeado a 5.</p>`,
      };
    },
  });
})();
