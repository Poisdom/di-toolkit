// Ajuste agujero–eje, ISO 286. Numbers from engine.js (DI.fit / DI.dev).
(function () {
  'use strict';
  const { esc, mn, f, tvd, pm, defs, dim, lab, svg, pid } = KIT;
  const FITS = ['H7/g6', 'H7/h6', 'H7/k6', 'H7/n6', 'H7/p6', 'H7/s6', 'H8/f7', 'H9/d9', 'F8/h7', 'D10/h9'];
  const KIND = { clearance: 'Con juego (móvil)', interference: 'Con apriete (fijo)', transition: 'Indeterminado' };
  const abs = um => (Math.abs(um) / 1000).toFixed(Number.isInteger(um) ? 3 : 4);

  // the two parts as they go on their own sheets: shaft side view, holed part in section
  function partsSvg(d, hole, shaft, r) {
    const p = pid();
    return svg(460, 262, `Eje Ø${f(d)} ${shaft} ${pm(r.shaft)} y agujero Ø${f(d)} ${hole} ${pm(r.hole)}`, `${defs(p)}
      <rect class="body" x="40" y="84" width="160" height="100"/>
      <line class="cl" x1="28" y1="134" x2="212" y2="134"/>
      ${dim(120, 84, 120, 184, p)}${lab(120, 30, 'Ø' + f(d), shaft, pm(r.shaft))}
      <path class="ld" d="M120 84 V40"/>
      <text x="120" y="214" text-anchor="middle">eje</text>
      <rect class="sec-body" fill="url(#${p}-h)" x="270" y="44" width="150" height="40"/><rect class="sec-body" fill="url(#${p}-h)" x="270" y="184" width="150" height="40"/>
      <line class="cl" x1="258" y1="134" x2="432" y2="134"/>
      ${dim(345, 84, 345, 184, p)}${lab(345, 30, 'Ø' + f(d), hole, pm(r.hole))}
      <text x="345" y="250" text-anchor="middle">pieza con agujero (sección)</text>`);
  }

  function zoneSvg(r, hole, shaft) {
    const [hu, hl] = r.hole, [su, sl] = r.shaft;
    const top = Math.max(hu, su, 0), span = (top - Math.min(hl, sl, 0)) || 1;
    const y = u => 56 + (top - u) / span * 150;
    const bar = (x, u, l, cls, name) => `<rect class="${cls}" x="${x}" y="${y(u)}" width="110" height="${Math.max(y(l) - y(u), 2)}"/>
      <text x="${x + 55}" y="22" text-anchor="middle">${esc(name)}</text>
      <text class="c" x="${x + 55}" y="${y(u) - 7}" text-anchor="middle">${mn(DI.mm(u))}</text>
      <text class="c" x="${x + 55}" y="${y(l) + 18}" text-anchor="middle">${mn(DI.mm(l))}</text>`;
    return `<svg class="halo" viewBox="0 0 460 240" role="img" aria-label="Zonas de tolerancia: agujero ${esc(hole)} de ${DI.mm(hl)} a ${DI.mm(hu)}, eje ${esc(shaft)} de ${DI.mm(sl)} a ${DI.mm(su)}">
      <line class="cl" x1="20" y1="${y(0)}" x2="440" y2="${y(0)}"/><text x="20" y="${y(0) - 7}">0</text>
      ${bar(110, hu, hl, 'zh', 'agujero ' + hole)}${bar(260, su, sl, 'zs', 'eje ' + shaft)}</svg>`;
  }

  CALCS.push({
    id: 'ajuste', group: 'Tolerancias', title: 'Ajuste agujero–eje', norma: 'ISO 286',
    blurb: 'Desviaciones, juego o apriete, y la cota con tolerancia',
    intro: 'Con el Ø y las dos clases: cuánto se desvía el agujero y el eje, si queda juego o apriete, y cómo se escribe cada cota.',
    casos: 'golden.json',
    defaults: { hole: 'H7', shaft: 'g6' },
    preview(d, st) {
      const r = DI.fit(d, st.hole, st.shaft);
      const what = r.kind === 'clearance' ? `juego ${f(r.jmin / 1000)}–${f(r.jmax / 1000)}` : r.kind === 'interference' ? `apriete ${f(-r.jmax / 1000)}–${f(-r.jmin / 1000)}` : 'indeterminado';
      return `${esc(st.hole)}/${esc(st.shaft)} · ${what}`;
    },
    form: () => `<label class="fld">Ø (mm)<input class="fv" data-s="ajuste.d" type="number" min="0.1" max="500" step="any" inputmode="decimal"></label>
      <label class="fld">Agujero<input class="fv" data-s="ajuste.hole" maxlength="4" autocapitalize="characters" autocomplete="off" spellcheck="false"></label>
      <label class="fld">Eje<input class="fv" data-s="ajuste.shaft" maxlength="4" autocapitalize="off" autocomplete="off" spellcheck="false"></label>
      <div class="chips" role="group" aria-label="Ajustes habituales">${FITS.map(x => { const [h, s] = x.split('/'); return `<button type="button" class="chip" data-set='{"ajuste.hole":"${h}","ajuste.shaft":"${s}"}'>${x}</button>`; }).join('')}</div>
      <p class="small">Agujero en mayúscula, eje en minúscula. Letras d e f g h js k m n p r s t, grados IT1 a IT16 (agujeros K a T desde IT3), hasta 500 mm.</p>`,
    mano(d, st) {
      const r = DI.fit(d, st.hole, st.shaft), [hu, hl] = r.hole, [su, sl] = r.shaft, u = x => mn((x > 0 ? '+' : '') + x);
      const it = c => c.replace(/\D/g, '');
      return [
        [`Agujero ${esc(st.hole)}`, `IT${it(st.hole)} de Ø${f(d)} = ${hu - hl} µm · la letra da la desviación más cercana a 0 → ES ${u(hu)} · EI ${u(hl)} µm`],
        [`Eje ${esc(st.shaft)}`, `IT${it(st.shaft)} = ${su - sl} µm → es ${u(su)} · ei ${u(sl)} µm`],
        ['Juego máximo', `ES − ei = ${u(hu)} − (${u(sl)}) = <b>${u(r.jmax)} µm</b>`],
        ['Juego mínimo', `EI − es = ${u(hl)} − (${u(su)}) = <b>${u(r.jmin)} µm</b>`],
        ['Tipo de ajuste', `${KIND[r.kind]}: juego negativo = apriete`],
        ['Cotas', `agujero Ø${f(d)} ${esc(st.hole)} (${pm(r.hole)}) · eje Ø${f(d)} ${esc(st.shaft)} (${pm(r.shaft)})`],
      ];
    },
    run(d, st) {
      const { hole, shaft } = st, r = DI.fit(d, hole, shaft);
      const [aLb, a, bLb, b] = r.kind === 'clearance' ? ['Juego mínimo', r.jmin, 'Juego máximo', r.jmax]
        : r.kind === 'interference' ? ['Apriete mínimo', r.jmax, 'Apriete máximo', r.jmin] : ['Juego máximo', r.jmax, 'Apriete máximo', r.jmin];
      const lim = um => (d + um / 1000).toFixed(Number.isInteger(um) ? 3 : 4);
      const part = (name, code, dv, up, lo) => `<article class="panel"><div class="ph"><h3>${name}</h3>${tvd('Ø' + f(d), dv, code)}</div>
        <div class="row"><span class="k">Desviación superior ${up}</span><span class="v big">${mn(DI.mm(dv[0]))}</span></div>
        <div class="row"><span class="k">Desviación inferior ${lo}</span><span class="v big">${mn(DI.mm(dv[1]))}</span></div>
        <div class="row"><span class="k">Medida máxima</span><span class="v big">${lim(dv[0])}</span></div>
        <div class="row"><span class="k">Medida mínima</span><span class="v big">${lim(dv[1])}</span></div>
        <div class="row"><span class="k">Tolerancia</span><span class="v big">IT${code.replace(/\D/g, '')} = ${f((dv[0] - dv[1]) / 1000)}</span></div></article>`;
      return {
        tiles: [['Ajuste', `Ø${f(d)} ${esc(hole)}/${esc(shaft)}`, KIND[r.kind]], [aLb, abs(a), 'mm'], [bLb, abs(b), 'mm']],
        more: `<div class="grid2">${part('Agujero', hole, r.hole, 'ES', 'EI')}${part('Eje', shaft, r.shaft, 'es', 'ei')}</div>`,
        sketches: [
          ['Cada pieza en su hoja', 'El Ø del eje lleva la clase del eje; el del agujero, la del agujero.', partsSvg(d, hole, shaft, r)],
          ['Zonas de tolerancia', 'A escala entre sí. La línea 0 es el Ø nominal.', zoneSvg(r, hole, shaft)],
        ],
        plano: [
          ['Hoja de la pieza con agujero', [['Ø del agujero', tvd('Ø' + f(d), r.hole, hole)]]],
          ['Hoja del eje', [['Ø del eje', tvd('Ø' + f(d), r.shaft, shaft)]]],
          ['Hoja del conjunto', [['Ø montado (opcional)', `<span class="big">Ø${f(d)} ${esc(hole)}/${esc(shaft)}</span>`]]],
        ],
        source: `<p><b>Norma:</b> ISO 286-1:2010 (sistema ISO de tolerancias) e ISO 286-2:2010 (tablas de desviaciones de agujeros y ejes). En Europa es la misma: EN ISO 286-2 (UNE-EN / DIN EN ISO 286-2).</p>
          <p><b>Ejemplo del curso, h9 / D10:</b> ajuste libre; el eje tiene la desviación superior 0 y el agujero las dos positivas, así que siempre hay juego.</p>
          <p><b>Oficial (de pago):</b> <a href="https://www.iso.org/standard/54915.html" target="_blank" rel="noopener">ISO 286-2:2010</a> · <a href="https://www.iso.org/standard/45975.html" target="_blank" rel="noopener">ISO 286-1:2010</a></p>
          <p><b>Gratis, para la captura:</b> <a href="https://roymech.org/Useful_Tables/ISO_Tolerances.html" target="_blank" rel="noopener">RoyMech: tablas ISO 286-2</a> · <a href="https://www.cadforum.cz/en/tolerance.asp" target="_blank" rel="noopener">CADforum: tolerancias ISO 286-2</a> · <a href="https://simplybearings.co.uk/shop/Info-Pages-ISO-Limits/c4746_4779/index.html" target="_blank" rel="noopener">SimplyBearings: cómo leer la tabla</a></p>
          <p><b>Captura:</b> la tabla ISO 286 de los apuntes DI-S07t (Moodle), la fila del rango de tu Ø. En SolidWorks, la cota con <i>Fit with tolerance</i> muestra los mismos valores.</p>`,
      };
    },
  });
})();
