// Chaveta paralela, DIN 6885-1. Numbers from engine.js (keyFor, dev, chordRef, spec). The drawings are reused by the
// guided exercise (app.js), so they live on this calculator as `draw`.
(function () {
  'use strict';
  const { f, n1, num, tv, tvd, pm, defs, dim, lab, svg, pid } = KIT;
  const FIT_NAMES = { libre: 'Libre · H9 / D10', normal: 'Normal · N9 / JS9', forzado: 'Forzado · P9 / P9' };

  // Hoja del eje: section through the keyway. seatFit (e.g. 'h9') only when the exercise knows it.
  function shaftSec(d, k, fs, seatFit) {
    const p = pid(), cx = 170, cy = 186, R = 104, sc = R / (d / 2), bw = k.b * sc, x1 = cx - bw / 2, x2 = cx + bw / 2;
    const yw = cy - Math.sqrt(R * R - (bw / 2) ** 2), top = cy - R, yb = top + k.t1 * sc, xd = cx + R + 22, c45 = R * Math.SQRT1_2;
    return svg(410, 320, `Sección del eje Ø${f(d)} por el chavetero: ancho ${k.b} ${fs}, d menos t1 = ${f(d - k.t1)}`, `${defs(p)}
      <path class="sec-body" fill="url(#${p}-h)" d="M${x2} ${yw} A${R} ${R} 0 1 1 ${x1} ${yw} L${x1} ${yb} L${x2} ${yb} Z"/>
      <line class="cl" x1="${cx - R - 14}" y1="${cy}" x2="${cx + R + 14}" y2="${cy}"/><line class="cl" x1="${cx}" y1="${yb + 6}" x2="${cx}" y2="${cy + R + 14}"/>
      <path class="ext" d="M${x1} ${yw - 3} V${top - 34} M${x2} ${yw - 3} V${top - 34}"/>${dim(x1, top - 26, x2, top - 26, p)}
      ${lab(cx, top - 36, n1(k.b), fs, pm(DI.dev(k.b, fs)))}
      <path class="ext" d="M${x2 + 3} ${yb} H${xd + 8} M${cx + 6} ${cy + R} H${xd + 8}"/>${dim(xd, yb, xd, cy + R, p)}
      ${lab(xd + 8, (yb + cy + R) / 2 - 4, f(d - k.t1), '', '', 'start')}${lab(xd + 8, (yb + cy + R) / 2 + 14, '', '', `0/−${f(k.dt)}`, 'start')}
      ${dim(cx - c45, cy + c45, cx + c45, cy - c45, p, 1)}
      ${lab(cx - 40, cy + 60, 'Ø' + f(d), seatFit || '', '', 'middle', true)}`);
  }

  // Hoja de la polea: front view. With od (exercise) the outer Ø is drawn to scale and the bore is yours (blue).
  function hubFront(d, k, fh, od, boreFit) {
    const p = pid(), cx = 165, cy = 180, Ro = 124, R = od ? Ro * d / od : 80, sc = R / (d / 2), bw = k.b * sc, x1 = cx - bw / 2, x2 = cx + bw / 2;
    const yw = cy - Math.sqrt(R * R - (bw / 2) ** 2), yt = cy - R - k.t2 * sc, xd = cx + Ro + 16;
    return svg(430, od ? 362 : 320, `Polea de frente: agujero Ø${f(d)}, chavetero ${k.b} ${fh}, d más t2 = ${f(d + k.t2)}${od ? `, exterior Ø${od}` : ''}`, `${defs(p)}
      <path class="hub" d="M${cx - Ro} ${cy} A${Ro} ${Ro} 0 1 0 ${cx + Ro} ${cy} A${Ro} ${Ro} 0 1 0 ${cx - Ro} ${cy} Z M${x1} ${yw} A${R} ${R} 0 1 0 ${x2} ${yw} L${x2} ${yt} L${x1} ${yt} Z"/>
      <line class="cl" x1="${cx - Ro - 12}" y1="${cy}" x2="${cx + Ro + 12}" y2="${cy}"/><line class="cl" x1="${cx}" y1="${cy - Ro - 12}" x2="${cx}" y2="${cy + Ro + 12}"/>
      <path class="ext" d="M${x1} ${yt - 3} V${cy - Ro - 22} M${x2} ${yt - 3} V${cy - Ro - 22}"/>${dim(x1, cy - Ro - 16, x2, cy - Ro - 16, p)}
      ${lab(cx, cy - Ro - 26, n1(k.b), fh, pm(DI.dev(k.b, fh)))}
      <path class="ext" d="M${x2 + 3} ${yt} H${xd + 8} M${cx + 6} ${cy + R} H${xd + 8}"/>${dim(xd, yt, xd, cy + R, p)}
      ${lab(xd + 8, cy + 24, f(d + k.t2), '', '', 'start')}${lab(xd + 8, cy + 42, '', '', `+${f(k.dt)}/0`, 'start')}
      <path class="ext" d="M${x1 - 3} ${yt} H${x1 - 22} M${x1 - 3} ${yw} H${x1 - 22}"/>${dim(x1 - 16, yt, x1 - 16, yw, p, 1)}
      ${lab(x1 - 22, (yt + yw) / 2 + 24, `(${f(DI.chordRef(d, k.b, k.t2))})`, '', '', 'end', true)}
      ${lab(cx, cy + 6, 'Ø' + f(d), boreFit || '', boreFit ? pm(DI.dev(d, boreFit)) : '', 'middle', !od)}
      ${od ? `<path class="ext" d="M${cx - Ro} ${cy + 4} V${cy + Ro + 30} M${cx + Ro} ${cy + 4} V${cy + Ro + 30}"/>${dim(cx - Ro, cy + Ro + 24, cx + Ro, cy + Ro + 24, p)}${lab(cx, cy + Ro + 18, 'Ø' + od)}` : `<text x="${cx}" y="${cy + R + 30}" text-anchor="middle">polea</text>`}`);
  }

  // Hoja de la polea: the hub keyway enlarged, so t2 (from the top of the bore) and the chord can be told apart
  function hubDetail(d, k, fh) {
    const p = pid(), s = 150 / k.b, cx = 240, y0 = 210, r = d / 2 * s, yc = y0 + r, X1 = 100, X2 = 380;
    const ay = x => yc - Math.sqrt(r * r - (x - cx) ** 2), x1 = cx - 75, x2 = cx + 75, ych = ay(x1), yt = y0 - k.t2 * s;
    return svg(470, 352, `Detalle del chavetero de la polea: t2 ${f(k.t2)} desde lo más alto del agujero, cuerda ${f(DI.chordRef(d, k.b, k.t2))}`, `${defs(p)}
      <path class="hub" d="M${X1} 80 H${X2} V${ay(X2)} A${r} ${r} 0 0 0 ${x2} ${ych} V${yt} H${x1} V${ych} A${r} ${r} 0 0 0 ${X1} ${ay(X1)} Z"/>
      <rect class="frame" x="${X1}" y="80" width="${X2 - X1}" height="220"/>
      <line class="cl" x1="${cx}" y1="88" x2="${cx}" y2="292"/>
      <line class="dim" x1="${X1 + 8}" y1="${y0}" x2="${X2 - 8}" y2="${y0}" stroke-dasharray="7 3"/>
      <text x="${cx}" y="${y0 + 26}" text-anchor="middle">lo más alto del agujero</text>
      <path class="ext" d="M${x1} ${yt - 3} V58 M${x2} ${yt - 3} V58"/>${dim(x1, 64, x2, 64, p)}${lab(cx, 54, n1(k.b), fh, pm(DI.dev(k.b, fh)))}
      <path class="ext" d="M${x2 + 3} ${yt} H${X2 + 30}"/>${dim(X2 + 22, y0, X2 + 22, yt, p)}
      ${lab(X2 + 30, (y0 + yt) / 2 - 2, 't2 ' + f(k.t2), '', '', 'start')}${lab(X2 + 30, (y0 + yt) / 2 + 16, '', '', `+${f(k.dt)}/0`, 'start')}
      <path class="ext" d="M${x1 - 3} ${yt} H${X1 - 30} M${x1 - 3} ${ych} H${X1 - 30}"/>${dim(X1 - 22, ych, X1 - 22, yt, p, 1)}
      ${lab(X1 - 28, (ych + yt) / 2 + 6, `(${f(DI.chordRef(d, k.b, k.t2))})`, '', '', 'end', true)}
      ${lab(X1, 324, `t2 ${f(k.t2)} desde lo más alto del agujero`, '', '', 'start')}
      ${lab(X1, 344, `o d + t2 = ${f(d + k.t2)} desde lo más bajo`, '', '', 'start')}`);
  }

  // Hoja del eje: side view of the keyway on the seat, lengths to scale (not the Ø)
  function sideView(seat, hub, L, k) {
    const p = pid(), x0 = 64, sx = 380 / seat, cy = 128, R = 48, X = v => x0 + v * sx, st = (hub - L) / 2, sh = Math.min(k.b * sx, R * 0.8);
    return svg(470, 256, `Vista lateral: chavetero de ${L} que empieza a ${f(st)} del collar, polea de ${hub}`, `${defs(p)}
      <rect class="zone" x="${x0}" y="${cy - R - 28}" width="${hub * sx}" height="${2 * R + 56}"/>
      <path class="body" d="M${x0 - 40} ${cy - R - 16} H${x0} V${cy - R} H${X(seat)} V${cy + R} H${x0} V${cy + R + 16} H${x0 - 40} Z"/>
      <rect class="cut" x="${X(st)}" y="${cy - sh / 2}" width="${L * sx}" height="${sh}" rx="${sh / 2}"/>
      <line class="cl" x1="${x0 - 52}" y1="${cy}" x2="${X(seat) + 12}" y2="${cy}"/>
      <path class="ext" d="M${X(st)} ${cy - 4} V${cy - sh / 2 - 16} M${X(st + L)} ${cy - 4} V${cy - sh / 2 - 16}"/>${dim(X(st), cy - sh / 2 - 10, X(st + L), cy - sh / 2 - 10, p)}
      ${lab(X(st + L / 2), cy - sh / 2 - 16, 'chavetero L ' + L)}
      <path class="ext" d="M${x0} ${cy + R + 18} V${cy + R + 46} M${X(st)} ${cy + 4} V${cy + R + 46}"/>${dim(x0, cy + R + 40, X(st), cy + R + 40, p)}
      ${lab(Math.max(X(st), x0 + 20) + 8, cy + R + 46, f(st) + ' desde el collar', '', '', 'start')}
      <path class="ext" d="M${x0} ${cy - R - 20} V${cy - R - 48} M${X(hub)} ${cy - R - 30} V${cy - R - 48}"/>${dim(x0, cy - R - 42, X(hub), cy - R - 42, p)}
      ${lab(X(hub / 2), cy - R - 48, 'ancho de la polea ' + hub)}
      <text x="${x0 - 20}" y="${cy + R + 36}" text-anchor="middle">collar</text>`);
  }

  // key length from the seat (course convention in engine.suggest); null without a seat
  function keyLength(d, seat) {
    const j = seat > 0 ? DI.spec(d, seat).join : null;
    return { j, L: j ? (j.key || j.short) : null };
  }

  CALCS.push({
    id: 'chaveta', group: 'Uniones y piezas normalizadas', title: 'Chaveta paralela', norma: 'DIN 6885-1',
    blurb: 'Chaveta, chavetero del eje y de la polea',
    intro: 'Con el Ø del eje: qué chaveta va, cómo es el chavetero del eje y el de la polea, y qué cotas llevan en el plano.',
    casos: 'golden.json',
    defaults: { fit: 'libre' },
    draw: { shaftSec, hubFront, hubDetail, sideView },
    preview(d, st, S) {
      const k = DI.keyFor(d), { L } = keyLength(d, num(S.seat));
      return `${k.b} × ${k.h}${L ? ' × ' + L : ''} · t1 ${f(k.t1)} · t2 ${f(k.t2)}`;
    },
    form: () => `<label class="fld">Ø del eje (mm)<input class="fv" data-s="chaveta.d" type="number" min="6.1" max="230" step="any" inputmode="decimal"></label>
      <label class="fld">Ajuste del chavetero<select class="fv" data-s="chaveta.fit">${Object.entries(FIT_NAMES).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>
      <label class="fld">Largo del asiento <span class="opt">opcional, para el largo L</span><input class="fv" data-s="seat" type="number" min="0" step="any" inputmode="decimal" placeholder="—"></label>`,
    mano(d, st, S) {
      const k = DI.keyFor(d), [fs, fh] = DI.KEY_FITS[st.fit] || DI.KEY_FITS.libre, { j, L } = keyLength(d, num(S && S.seat)), dt = f(k.dt);
      return [
        ['Chaveta', `Tabla DIN 6885 con Ø${f(d)}: <b>b × h = ${k.b} × ${k.h}</b>`],
        ['Profundidades', `t1 = <b>${f(k.t1)}</b> en el eje · t2 = <b>${f(k.t2)}</b> en el agujero · tolerancia +${dt}`],
        ['Ancho del chavetero', `${FIT_NAMES[st.fit] || FIT_NAMES.libre}: eje <b>${k.b} ${fs}</b> (${pm(DI.dev(k.b, fs))}) · polea <b>${k.b} ${fh}</b> (${pm(DI.dev(k.b, fh))})`],
        ['Cotas de profundidad', `eje d − t1 = ${f(d)} − ${f(k.t1)} = <b>${f(d - k.t1)}</b> (0/−${dt}) · polea d + t2 = ${f(d)} + ${f(k.t2)} = <b>${f(d + k.t2)}</b> (+${dt}/0)`],
        ['Largo L', L && j.hub > 0 ? `<b>${L}</b>, centrada en una polea de ${j.hub}` : k.lens ? `del Toolbox, la más corta que quepa en el cubo: ${k.lens.join(', ')}` : `no está en el Toolbox: DIN 6885 ${DI.DIN_LEN.slice(0, 12).join(', ')}…`],
      ];
    },
    run(d, st, S) {
      const k = DI.keyFor(d), [fs, fh] = DI.KEY_FITS[st.fit] || DI.KEY_FITS.libre, seat = num(S.seat);
      const { j, L } = keyLength(d, seat), ok = L && j.hub > 0, dt = k.dt.toFixed(3), alerts = [];
      if (!(seat > 0)) alerts.push(['info', 'Sin el largo del asiento no hay largo L ni vista lateral. Mídelo en SolidWorks (Tools › Evaluate › Measure: cara del collar + extremo del eje) y escríbelo arriba.']);
      else if (!ok) alerts.push(['warn', `Asiento de ${f(seat)} demasiado corto para una polea con chaveta ${k.b}×${k.h} y ranura de circlip.`]);
      else if (!j.key) alerts.push(['warn', `Asiento de ${f(seat)} corto para las chavetas ${k.b}×${k.h}${k.lens ? ' del Toolbox' : ''} (la más corta mide ${j.pool0}): polea de ${j.hub} y chaveta modelada por ti con L = ${L}.`]);
      if (!k.lens) alerts.push(['warn', `El Toolbox no tiene chaveta ${k.b}×${k.h}: modélala tú (ranura ${k.b} × L, extruye ${k.h}) y guárdala como «Parallel key A${k.b} x ${k.h} x L DIN 6885».`]);
      const cfg = `Parallel key A${k.b} x ${k.h} x ${ok ? L : 'L'} DIN 6885`;
      return {
        alerts,
        tiles: [['Chaveta', `A ${k.b} × ${k.h} × ${ok ? L : 'L'}`, cfg], ['Chavetero del eje', `${n1(k.b)} × ${f(k.t1)}`, 'ancho × profundidad t1'], ['Chavetero de la polea', `${n1(k.b)} × ${f(k.t2)}`, 'ancho × profundidad t2']],
        more: `<article class="panel">
          <div class="row"><span class="k">Ajuste del chavetero</span><span class="v big">${fs} eje · ${fh} polea</span></div>
          <div class="row"><span class="k">Radio del fondo r</span><span class="v big">${k.rmin} – ${k.rmax}</span></div>
          ${ok ? `<div class="row"><span class="k">Polea (ancho) · chaveta centrada</span><span class="v big">${j.hub} · empieza a ${f((j.hub - L) / 2)} del collar</span></div>` : ''}
          <div class="row"><span class="k">Longitudes L</span><span class="v wrap">${k.lens ? `Toolbox: ${k.lens.join(', ')}` : `No está en el Toolbox de SolidWorks: se modela. DIN 6885: ${DI.DIN_LEN.join(', ')}`}</span></div></article>`,
        sketches: [
          ['Hoja del eje · sección por el chavetero', `Cota la profundidad desde abajo (d − t1) o desde arriba (t1 = ${f(k.t1)}).`, shaftSec(d, k, fs)],
          ['Hoja de la polea · vista de frente', `Profundidad desde lo más bajo del agujero (d + t2), o t2 = ${f(k.t2)} desde lo más alto. La cuerda va entre paréntesis.`, hubFront(d, k, fh)],
          ['Hoja de la polea · detalle del chavetero', 't2 se mide desde lo más alto del agujero, no desde donde las paredes tocan el agujero (eso es la cuerda).', hubDetail(d, k, fh)],
          ...(ok ? [['Hoja del eje · vista lateral', 'Largos a escala; el Ø no. La chaveta, centrada en la polea.', sideView(seat, j.hub, L, k)]] : []),
        ],
        plano: [
          ['Hoja del eje', [
            ['Chavetero · ancho b', tvd(n1(k.b), DI.dev(k.b, fs), fs)],
            ['Chavetero · profundidad d − t1 <span class="small">(o t1)</span>', `${tv(n1(f(d - k.t1)), '0.000', '-' + dt)} <span class="small">o</span> ${tv(n1(k.t1), '+' + dt, '0.000')}`],
            ...(ok ? [['Chavetero · largo y posición', `<span class="big">${L}</span> <span class="small">a ${f((j.hub - L) / 2)} del collar</span>`]] : []),
          ]],
          ['Hoja de la polea', [
            ['Chavetero · ancho b', tvd(n1(k.b), DI.dev(k.b, fh), fh)],
            ['Chavetero · profundidad d + t2 <span class="small">(o t2)</span>', `${tv(n1(f(d + k.t2)), '+' + dt, '0.000')} <span class="small">o</span> ${tv(n1(k.t2), '+' + dt, '0.000')}`],
            ['Cuerda <span class="small">(referencia, opcional)</span>', tv(`(${f(DI.chordRef(d, k.b, k.t2))})`, null, null, null, true)],
          ]],
          ['Lista de materiales', [['Chaveta', `<span class="mono">${cfg}</span>`]]],
        ],
        source: `<p><b>Norma:</b> DIN 6885-1 (Passfedern, hohe Form; edición vigente 2021-11, la tabla clásica es la de 1968).</p>
          <p><b>Ajustes del chavetero:</b> libre H9 (eje) / D10 (polea), el del curso. Normal N9 / JS9. Forzado P9 / P9. Anchos según ISO 286.</p>
          <p><b>Profundidades:</b> t1 en el eje desde arriba, t2 en la polea desde lo más alto del agujero. Tolerancia +0.1 (b ≤ 6), +0.2 (hasta 32), +0.3 (más). d − t1 → 0/−x; d + t2 → +x/0.</p>
          <p><b>Largos L:</b> los del Toolbox de SolidWorks (DIN › Keys › Parallel Keys › Parallel Key (form A)); si tu tamaño no está, se modela.</p>
          <p><b>Oficial (de pago):</b> <a href="https://dinmedia.de/en/standard/din-6885-1/346315269" target="_blank" rel="noopener">DIN 6885-1 (DIN Media)</a></p>
          <p><b>Gratis, para la captura:</b> <a href="https://live-katalog.ganternorm.com/pdf/ganter/en/6885_1.pdf" target="_blank" rel="noopener">Ganter: hoja DIN 6885-1 (PDF)</a> · <a href="https://engineersedge.com/hardware/parallel_key_and_taper_keys_dimensions_15236.htm" target="_blank" rel="noopener">Engineers Edge</a> · <a href="https://fasten.it/en/search/suppliers/205" target="_blank" rel="noopener">fasten.it: t1 y t2 por ancho</a></p>
          <p><b>Captura:</b> la tabla de chavetas de los apuntes (DI-S15t, Moodle), la fila de tu Ø. La que pegó el profesor solo llega a Ø22, así que necesitas la tabla completa. Pégala con Insert › Picture en la hoja del eje y en la de la polea.</p>`,
        figure: ['img/ejemplo-14.jpg', 1100, 738, 'Tabla de chavetas pegada en el plano del profesor', 'Así pegó el profesor la tabla (H9 / D10, N9 / JS9, P9) en sus hojas del eje y de la polea.'],
      };
    },
  });
})();
