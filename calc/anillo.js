// Anillo de seguridad para ejes (circlip), DIN 471. Numbers from engine.js (circlipFor).
(function () {
  'use strict';
  const { f, num, tvd, pm, defs, dim, lab, svg, pid } = KIT;
  const name = c => `DIN 471 - ${c.d1} x ${f(c.s)}`;
  const note = (d, c) => `Ø${f(d)} no es un tamaño DIN 471 (vecinos ${c.below} / ${c.above}): se usa el anillo de ${c.d1} con su ranura normalizada Ø${f(c.d2)}${c.d1 > d ? ', el grande, porque su ranura todavía entra en el eje' : ''}. En un diseño real se cambiaría el Ø del eje a un tamaño normalizado.`;

  // groove detail as in the professor's 5:1 detail: enlarged groove, the distance to the shoulder not to scale
  function grooveSvg(d, c, a) {
    const p = pid(), s = 60 / c.m, top = 120, gx = 170, gw = 60, gd = Math.max(c.depth * s, 6), yb = top + gd, sh = 400;
    return svg(470, 300, `Detalle de la ranura: Ø${f(c.d2)} ${c.d2Class}, ancho ${f(c.m)} H13, profundidad ${f(c.depth)}${a ? `, a ${f(a)} del collar` : ''}`, `${defs(p)}
      <path class="body" d="M30 ${top} H${gx} V${yb} H${gx + gw} V${top} H${sh} V74 H450 V290 H30 Z"/>
      <path class="ext" d="M${gx} ${top - 3} V62 M${gx + gw} ${top - 3} V62"/>${dim(gx, 68, gx + gw, 68, p)}
      ${lab(gx + gw / 2, 56, f(c.m), 'H13', pm([c.mUp, c.mLo]))}
      <line class="dim" x1="${gx + 14}" y1="${yb}" x2="${gx + 14}" y2="286" marker-start="url(#${p}-b)"/>
      ${lab(gx + 22, 214, 'Ø' + f(c.d2), c.d2Class, '', 'start')}${lab(gx + 22, 234, '', '', pm([c.d2Up, c.d2Lo]), 'start')}
      <path class="ext" d="M${gx - 3} ${yb} H${gx - 40}"/>${dim(gx - 32, top, gx - 32, yb, p, 1)}
      ${lab(gx - 40, top + gd / 2 + 30, 'prof. ' + f(c.depth), '', '', 'end', true)}
      <path class="ext" d="M${gx + gw} ${top - 3} V96 M${sh} 70 V96"/>${dim(gx + gw, 102, sh, 102, p)}
      ${lab((gx + gw + sh) / 2, 94, a ? f(a) : 'lo que sujeta')}
      <text x="425" y="64" text-anchor="middle">collar</text>
      <text x="30" y="${top - 10}">eje</text>`);
  }

  CALCS.push({
    id: 'anillo', group: 'Uniones y piezas normalizadas', title: 'Anillo de seguridad (circlip)', norma: 'DIN 471',
    blurb: 'Anillo para ejes y su ranura',
    intro: 'Con el Ø del eje: qué anillo va, cómo es la ranura y dónde se cota.',
    casos: 'golden.json',
    defaults: { apoyo: '' },
    preview(d) {
      const c = DI.circlipFor(d);
      if (!c) throw new Error('fuera de tabla');
      return `${c.d1} × ${f(c.s)} · ranura Ø${f(c.d2)} × ${f(c.m)}`;
    },
    form: () => `<label class="fld">Ø del eje (mm)<input class="fv" data-s="anillo.d" type="number" min="3" max="200" step="any" inputmode="decimal"></label>
      <label class="fld">Ancho de lo que sujeta <span class="opt">opcional: la ranura va a esa distancia del collar</span><input class="fv" data-s="anillo.apoyo" type="number" min="0" step="any" inputmode="decimal" placeholder="—"></label>`,
    mano(d, st) {
      const c = DI.circlipFor(d), a = num(st.apoyo);
      if (!c) throw new Error('La tabla DIN 471 de la app va de Ø3 a Ø200.');
      return [
        ['Anillo', `Tabla DIN 471 con Ø${f(d)}: <b>${name(c)}</b> (d1 ${c.d1}, espesor s ${f(c.s)})${c.exact ? '' : ' · Ø no normalizado, se usa el vecino'}`],
        ['Fondo de la ranura', `d2 = <b>${f(c.d2)} ${c.d2Class}</b> (${pm([c.d2Up, c.d2Lo])})`],
        ['Ancho de la ranura', `m = <b>${f(c.m)} H13</b> (${pm([c.mUp, c.mLo])})`],
        ['Profundidad', `(d − d2) / 2 = (${f(d)} − ${f(c.d2)}) / 2 = ${f(c.depth)}`],
        ['Posición', a > 0 ? `a <b>${f(a)}</b> del collar (el ancho de lo que sujeta)` : 'a la distancia del ancho de lo que sujeta, desde el collar (con un rodamiento: su B)'],
      ];
    },
    run(d, st) {
      const c = DI.circlipFor(d), a = num(st.apoyo);
      if (!c) throw new Error('La tabla DIN 471 de la app va de Ø3 a Ø200.');
      return {
        alerts: c.exact ? [] : [['warn', note(d, c)]],
        tiles: [['Anillo', name(c), 'Toolbox: Circlip for shafts normal'], ['Ranura', `Ø${f(c.d2)} × ${f(c.m)}`, 'Ø del fondo × ancho'], ['Profundidad', f(c.depth), `(Ø${f(d)} − Ø${f(c.d2)}) / 2`]],
        more: `<article class="panel"><div class="row"><span class="k">Espesor del anillo s</span><span class="v big">${f(c.s)}</span></div></article>`,
        sketches: [['Hoja del eje · detalle de la ranura', 'Como el detalle 5:1 del profesor: la ranura ampliada; la distancia al collar no va a escala.', grooveSvg(d, c, a > 0 ? a : 0)]],
        plano: [
          ['Hoja del eje', [
            ['Ranura · Ø del fondo d2', tvd('Ø' + f(c.d2), [c.d2Up, c.d2Lo], c.d2Class)],
            ['Ranura · ancho m', tvd(f(c.m), [c.mUp, c.mLo], 'H13')],
            ['Ranura · posición', a > 0 ? `<span class="big">${f(a)}</span> <span class="small">del collar a la pared de la ranura</span>` : '<span class="small">ancho de la pieza que sujeta, desde el collar</span>'],
          ]],
          ['Lista de materiales', [['Anillo', `<span class="mono">${name(c)}</span>`]]],
        ],
        source: `<p><b>Norma:</b> DIN 471:2011-04 (Sicherungsringe für Wellen, Regelausführung). DIN Media anuncia una edición nueva de 2026-05; los tamaños de la ranura son los mismos del Toolbox.</p>
          <p><b>Tolerancias de la ranura:</b> m H13; d2 h10 (hasta Ø9), h11 (hasta Ø22), h12 (hasta Ø100), h13 (más), según las hojas de los fabricantes.</p>
          <p><b>Oficial (de pago):</b> <a href="https://dinmedia.de/en/standard/din-471/138166354" target="_blank" rel="noopener">DIN 471 (DIN Media)</a></p>
          <p><b>Gratis, para la captura:</b> <a href="https://fasten.it/en/Norms/Norm/DIN%20471" target="_blank" rel="noopener">fasten.it: tabla DIN 471</a> · <a href="https://smarthost.maedler.de/datenblaetter/K43_N79_EN.pdf" target="_blank" rel="noopener">Mädler: hoja DIN 471 (PDF)</a> · <a href="https://shop.sdp-si.com/media/pdf/80510036.pdf" target="_blank" rel="noopener">SDP/SI: anillos DIN 471 (PDF)</a></p>
          <p><b>Captura:</b> la ficha DIN 471 de un fabricante para tu tamaño (d2 / G y m / W con su clase), por ejemplo <a href="https://accu-components.com/us/external-circlips/73259-HEC-45-A2" target="_blank" rel="noopener">accu-components, DIN 471 de 45 mm</a>. Y la ventana del Toolbox <i>Circlip for shafts normal</i> con tu tamaño.</p>`,
      };
    },
  });
})();
