// Engranaje helicoidal soldado + polea trapecial con chaveta (Tarea 38 / DI-S38t). The shared Ø is the gear seat.
// Toolbox fields and the configuration name come from SolidWorks' own database (swbrowser.sldedb, DIN_CFG_PT_GEAR_HELICAL);
// the pulley table is the one on the professor's slide (DI-S38t p. 5), read row by row with the scan's skew corrected.
(function () {
  'use strict';
  const { f, num, tvd, pm, defs, dim, lab, svg, pid } = KIT;
  const r1 = x => (+x).toFixed(1);
  // Toolbox › DIN › Power Transmission › Gears › Helical Gear: module list, teeth 10-300, Nominal Shaft Diameter list
  const TB_MOD = [0.05, 0.055, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.25, 0.28, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
    1, 1.125, 1.25, 1.375, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.5, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 25, 27, 28, 30, 32, 36, 39, 40, 42, 45, 50, 55, 60, 70];
  const TB_BORE = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.25, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 22, 24, 25, 26, 28, 30, 32, 35, 36, 38, 40, 42, 45, 48, 50,
    55, 56, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290,
    300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500];
  // V-belt pulleys, professor's table: a, b, h, c per belt type; D per row with the groove angle of that row
  const BELT = ['Z', 'A', 'B', 'C', 'D', 'E'];
  const GROOVE = { a: [10, 13, 17, 22, 32, 38], b: [6, 8, 11, 14, 19, 25], h: [12, 14, 17, 24, 30, 36], c: [13, 16, 20, 27, 37, 45] };
  const D_ROWS = [
    [34, 77, 98, 0, 0, 0, 0], [34, 86, 108, 151, 238, 374, 525], [34, 0, 0, 0, 0, 419, 585], [36, 96, 120, 171, 264, 469, 655],
    [36, 106, 133, 191, 294, 519, 735], [36, 0, 0, 0, 0, 579, 825], [38, 118, 148, 211, 329, 649, 925], [38, 131, 168, 235, 369, 729, 1025],
    [38, 146, 188, 261, 414, 819, 1145], [40, 166, 208, 291, 464, 919, 1275], [40, 186, 232, 326, 514, 1019, 1425], [40, 206, 258, 366, 574, 1139, 1625],
    [40, 230, 288, 411, 644, 1269, 1826], [40, 256, 323, 461, 724, 1419, 2025], [40, 286, 363, 511, 814, 1619, 2265], [40, 321, 408, 571, 914, 1819, 2525],
    [40, 361, 458, 641, 1014, 2019, 2825],
  ];
  const HAND = { LH: 'Left hand', RH: 'Right hand' };

  function gear(st) {
    const m = num(st.m), z = num(st.z), beta = num(st.beta), fw = num(st.fw);
    if (!(m > 0)) throw new Error('Escribe el módulo m.');
    if (!(Number.isInteger(z) && z >= 5)) throw new Error('El número de dientes z tiene que ser un entero (5 o más).');
    if (!(beta >= 0 && beta < 45)) throw new Error('El ángulo de hélice β va de 0 a 45°.');
    if (!(fw > 0)) throw new Error('Escribe el ancho del diente (Face Width).');
    const dp = m * z / Math.cos(beta * Math.PI / 180);   // m is the normal module, as in Toolbox and the professor's table
    return { m, z, beta, fw, dp, de: dp + 2 * m, df: dp - 2.5 * m };   // Toolbox: addendum 1·m, dedendum 1.25·m
  }
  // the D of that belt type whose pitch Ø d = D − b is closest to the gear's dp (professor: Z, dp 111.7 → D 118, d 112)
  function pulley(type, dp) {
    const i = Math.max(0, BELT.indexOf(type)), [a, b, h, c] = ['a', 'b', 'h', 'c'].map(k => GROOVE[k][i]);
    const row = D_ROWS.filter(r => r[i + 1]).reduce((x, y) => Math.abs(y[i + 1] - b - dp) < Math.abs(x[i + 1] - b - dp) ? y : x);
    return { type: BELT[i], a, b, h, c, D: row[i + 1], ang: row[0], d: row[i + 1] - b };
  }
  function calc(d, st) {
    const g = gear(st), P = pulley(st.correa, g.dp), dk = num(st.dpol);
    if (!(dk > 0)) throw new Error('Escribe el Ø del extremo del eje donde va la polea.');
    const k = DI.keyFor(dk), wd = num(st.wd) > 0 ? num(st.wd) : d, w = DI.weld(wd, num(st.wn), st.we === '' ? null : num(st.we), num(st.wa));
    const cfg = `DIN - ${st.mano} Helical gear ${g.m}M ${g.z}T ${g.beta}HA 20PA ${g.fw}FW ---${g.z}A75H50L${d}N`;
    return { g, P, dk, k, L: k.lens ? k.lens[0] : null, w, wd, cfg };
  }

  // Hoja del engranaje: front view to scale, teeth as trapezia between df and de
  function gearSvg(g, d) {
    const p = pid(), cx = 180, cy = 190, s = 150 / (g.de / 2), Re = g.de / 2 * s, Rp = g.dp / 2 * s, Rf = g.df / 2 * s, Rb = d / 2 * s, w = Math.PI / (2 * g.z);
    const P = (a, r) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy - r * Math.sin(a)).toFixed(1)}`;
    const teeth = Array.from({ length: g.z }, (_, i) => { const t = 2 * Math.PI * i / g.z + Math.PI / 2; return `${P(t - 1.35 * w, Rf)} L${P(t - 0.55 * w, Re)} L${P(t + 0.55 * w, Re)} L${P(t + 1.35 * w, Rf)}`; }).join(' L');
    const lead = (r, ang, y, txt, cls) => { const a = ang * Math.PI / 180, x0 = cx + r * Math.cos(a), y0 = cy - r * Math.sin(a);
      return `<path class="ld" d="M${x0.toFixed(1)} ${y0.toFixed(1)} L350 ${y} H356"/><circle cx="${x0.toFixed(1)}" cy="${y0.toFixed(1)}" r="2.5" class="arg"/>${lab(360, y + 5, txt, '', '', 'start', cls)}`; };
    return svg(470, 380, `Engranaje de frente: exterior Ø${r1(g.de)}, primitivo Ø${r1(g.dp)}, agujero Ø${f(d)} H8`, `${defs(p)}
      <path class="hub" d="M${teeth} Z M${cx - Rb} ${cy} A${Rb} ${Rb} 0 1 0 ${cx + Rb} ${cy} A${Rb} ${Rb} 0 1 0 ${cx - Rb} ${cy} Z"/>
      <circle class="cl" style="fill:none" cx="${cx}" cy="${cy}" r="${Rp}"/>
      <line class="cl" x1="${cx - Re - 12}" y1="${cy}" x2="${cx + Re + 12}" y2="${cy}"/><line class="cl" x1="${cx}" y1="${cy - Re - 12}" x2="${cx}" y2="${cy + Re + 12}"/>
      ${lead(Re, 40, 40, `Ø${r1(g.de)} de`, 1)}${lead(Rp, 22, 80, `Ø${r1(g.dp)} dp`, 1)}${lead(Rf, 8, 120, `Ø${r1(g.df)} df`, 1)}
      ${dim(cx - Rb, cy + 26, cx + Rb, cy + 26, p)}${lab(cx, cy + 20, 'Ø' + f(d), 'H8')}${lab(cx, cy + 48, '', '', pm(DI.dev(d, 'H8')))}
      <text x="12" y="372">${g.z} dientes · m ${g.m} · β ${g.beta}°</text>`);
  }

  // Hoja de la polea: half section through the axis like the professor's section C-C; groove to scale, the rest broken
  function pulleySvg(P, dk) {
    const p = pid(), s = 180 / Math.max(P.c, P.h * 1.4), x0 = 170, x1 = x0 + P.c * s, xm = (x0 + x1) / 2, y0 = 70, yg = y0 + P.h * s;
    const ta = P.a / 2 * s, tb = Math.max(P.a / 2 - P.h * Math.tan(P.ang * Math.PI / 360), 0) * s, yB = yg + 40, yb = yB + 52, ya = yb + 30;
    const zig = (y, back) => back ? `L${x1} ${y} L${xm + 10} ${y} L${xm + 4} ${y - 8} L${xm - 4} ${y + 8} L${xm - 10} ${y} L${x0} ${y}` : `L${x0} ${y} L${xm - 10} ${y} L${xm - 4} ${y + 8} L${xm + 4} ${y - 8} L${xm + 10} ${y} L${x1} ${y}`;
    return svg(470, ya + 30, `Polea ${P.type}${P.D} en sección: ancho c ${P.c}, garganta a ${P.a}, profundidad h ${P.h}, β ${P.ang}°, agujero Ø${f(dk)} H8`, `${defs(p)}
      <path class="sec-body" fill="url(#${p}-h)" d="M${x0} ${y0} L${xm - ta} ${y0} L${xm - tb} ${yg} L${xm + tb} ${yg} L${xm + ta} ${y0} L${x1} ${y0} ${zig(yB, 1)} Z"/>
      <path class="sec-body" fill="url(#${p}-h)" d="M${x0} ${yB + 16} ${zig(yB + 16)} L${x1} ${yb} L${x0} ${yb} Z"/>
      <line class="cl" x1="${x0 - 30}" y1="${ya}" x2="${x1 + 30}" y2="${ya}"/>
      <line class="hid" x1="${x0}" y1="${y0 + P.b / 2 * s}" x2="${x1}" y2="${y0 + P.b / 2 * s}"/>
      <path class="ext" d="M${x0} ${y0 - 3} V${y0 - 52} M${x1} ${y0 - 3} V${y0 - 52} M${xm - ta} ${y0 - 3} V${y0 - 24} M${xm + ta} ${y0 - 3} V${y0 - 24}"/>
      ${dim(x0, y0 - 46, x1, y0 - 46, p)}${lab(xm, y0 - 52, 'c ' + P.c)}${dim(xm - ta, y0 - 18, xm + ta, y0 - 18, p)}${lab(xm, y0 - 24, 'a ' + P.a)}
      <path class="ext" d="M${x1 + 3} ${yg} H${x1 + 36} M${xm + tb + 3} ${yg} H${x1}"/>${dim(x1 + 28, y0, x1 + 28, yg, p)}${lab(x1 + 34, (y0 + yg) / 2 + 5, 'h ' + P.h, '', '', 'start')}
      <path class="ext" d="M${x0 - 3} ${y0 + P.b * s} H${x0 - 30}"/>${dim(x0 - 22, y0, x0 - 22, y0 + P.b * s, p)}${lab(x0 - 28, y0 + P.b * s / 2 + 5, 'b ' + P.b, '', '', 'end')}
      ${lab(xm, yg + 26, `β ${P.ang}°`)}
      <path class="ext" d="M${x1 + 3} ${y0} H${x1 + 76}"/>${dim(x1 + 68, y0, x1 + 68, ya, p)}${lab(x1 + 74, yB + 30, 'Ø' + P.D, '', '', 'start')}
      <path class="ext" d="M${x0 - 3} ${yb} H${x0 - 70}"/>${dim(x0 - 62, yb, x0 - 62, ya, p)}${lab(x0 - 68, yb - 10, 'Ø' + f(dk), 'H8', '', 'end')}${lab(x0 - 68, ya + 22, '', '', pm(DI.dev(dk, 'H8')), 'end')}
      <text x="${xm}" y="${ya + 24}" text-anchor="middle">bajo la rotura, sin escala</text>`);
  }

  const row = (k, v) => `<div class="row"><span class="k">${k}</span><span class="v big">${v}</span></div>`;

  CALCS.push({
    id: 'engranaje', group: 'Transmisión', title: 'Engranaje + polea (Tarea 38)', norma: 'Toolbox DIN · correas Z–E',
    blurb: 'Helicoidal soldado, polea trapecial con chaveta',
    intro: 'Con tu m, z y β: lo que pones en el Toolbox para el engranaje, la tabla del plano, la polea de la tabla del profesor, la chaveta y la soldadura. El Ø de arriba es el asiento del engranaje en el eje.',
    casos: 'engranaje.json',
    defaults: { m: '5', z: '21', beta: '20', mano: 'LH', fw: '15', correa: 'Z', dpol: '40', wa: '4', wn: '2', we: '25', wd: '' },
    calc,
    preview(d, st) { const { g, P } = calc(d, st); return `dp ${r1(g.dp)} · de ${r1(g.de)} · polea ${P.type}${P.D}`; },
    form: () => `<fieldset><legend>Engranaje</legend><div class="fg"><label class="fld">Ø del asiento del engranaje (mm)<input class="fv" data-s="engranaje.d" type="number" min="1" step="any" inputmode="decimal"></label>
      <label class="fld">Módulo m<input class="fv" data-s="engranaje.m" type="number" min="0" step="any" inputmode="decimal"></label>
      <label class="fld">Dientes z<input class="fv" data-s="engranaje.z" type="number" min="5" step="1" inputmode="numeric"></label>
      <label class="fld">Ángulo de hélice β (°)<input class="fv" data-s="engranaje.beta" type="number" min="0" max="45" step="any" inputmode="decimal"></label>
      <label class="fld">Hélice<select class="fv" data-s="engranaje.mano"><option value="LH">Izquierda (Left hand)</option><option value="RH">Derecha (Right hand)</option></select></label>
      <label class="fld">Ancho del diente <span class="opt">Face Width; el profesor puso 15</span><input class="fv" data-s="engranaje.fw" type="number" min="0" step="any" inputmode="decimal"></label></div></fieldset>
      <fieldset><legend>Polea y chaveta</legend><div class="fg">
      <label class="fld">Correa de la polea<select class="fv" data-s="engranaje.correa">${BELT.map(t => `<option value="${t}">Tipo ${t}</option>`).join('')}</select></label>
      <label class="fld">Ø del eje en la polea (mm)<input class="fv" data-s="engranaje.dpol" type="number" min="6.1" step="any" inputmode="decimal"></label></div></fieldset>
      <fieldset><legend>Soldadura engranaje–eje</legend><div class="fg">
      <label class="fld">Garganta a<input class="fv" data-s="engranaje.wa" type="number" min="0" step="any" inputmode="decimal"></label>
      <label class="fld">Cordones n<input class="fv" data-s="engranaje.wn" type="number" min="1" step="1" inputmode="numeric"></label>
      <label class="fld">Separación e <span class="opt">vacío = automática</span><input class="fv" data-s="engranaje.we" type="number" min="0" step="any" inputmode="decimal" placeholder="auto"></label>
      <label class="fld">Ø donde va el cordón <span class="opt">vacío = el asiento; ex.bearings: 70 (el collar)</span><input class="fv" data-s="engranaje.wd" type="number" min="1" step="any" inputmode="decimal" placeholder="asiento"></label></div></fieldset>`,
    manoGear(d, st) {
      const { g, w, wd } = calc(d, st), cb = Math.cos(g.beta * Math.PI / 180), mt = g.m / cb;
      return [
        ['Módulo transversal', `mt = mn / cos β = ${g.m} / cos ${g.beta}° = ${f(mt)}`],
        ['Ø primitivo', `dp = mt · z = ${f(mt)} · ${g.z} = <b>${f(g.dp)}</b>`],
        ['Ø exterior', `de = dp + 2·mn = ${f(g.dp)} + ${f(2 * g.m)} = <b>${f(g.de)}</b>`],
        ['Ø de fondo', `df = dp − 2.5·mn = ${f(g.dp)} − ${f(2.5 * g.m)} = <b>${f(g.df)}</b>`],
        ['Alturas del diente', `ha = mn = ${f(g.m)} · hf = 1.25·mn = ${f(1.25 * g.m)} · h = 2.25·mn = ${f(2.25 * g.m)}`],
        ['Tabla del plano', `m ${g.m} · z ${g.z} · β ${g.beta}° ${HAND[st.mano] || ''} · dp ${r1(g.dp)} · de ${r1(g.de)}`],
        ['Agujero', `Ø${f(d)} H8 (${pm(DI.dev(d, 'H8'))}) · el asiento del eje Ø${f(d)} h7`],
        ['Soldadura', `π · ${f(wd)} / ${w.n} = paso ${f(w.pitch)} → l = ${f(w.pitch)} − ${f(w.gap)} = ${f(w.l)} → <b>${f(w.a)} ◺ ${w.n}x${f(w.l)}(${f(w.gap)})</b> · tabla ${w.n}X${f(w.l)}(${f(w.gap)}){${f(w.total)}}`],
      ];
    },
    manoPolea(d, st) {
      const { g, P, dk, k, L } = calc(d, st);
      return [
        [`Correa ${P.type}`, `tabla del profesor: a ${P.a} · b ${P.b} · h ${P.h} · c ${P.c}`],
        ['Ø exterior D', `el D con d = D − b más cerca de dp ${r1(g.dp)}: <b>D ${P.D}</b> (d = ${P.D} − ${P.b} = ${P.d})`],
        ['Ángulo de la garganta', `el de esa fila: <b>β ${P.ang}°</b>`],
        ['Agujero de la polea', `Ø${f(dk)} H8 (${pm(DI.dev(dk, 'H8'))}) · el extremo del eje Ø${f(dk)} h7`],
        ['Chaveta', `DIN 6885 con Ø${f(dk)}: ${k.b} × ${k.h} × ${L || 'L'} (la más corta del Toolbox)`],
      ];
    },
    mano(d, st) { return [...this.manoGear(d, st), ...this.manoPolea(d, st)]; },
    run(d, st) {
      const { g, P, dk, k, L, w, wd, cfg } = calc(d, st), alerts = [], rim = (g.df - d) / 2, keyCfg = `Parallel key A${k.b} x ${k.h} x ${L || 'L'} DIN 6885`;
      const [fs, fh] = DI.KEY_FITS.libre, weldTxt = `${f(w.a)} ◺ ${w.n}x${f(w.l)}(${f(w.gap)})`, weldTab = `${w.n}X${f(w.l)}(${f(w.gap)}){${f(w.total)}}`;
      if (!TB_MOD.includes(g.m)) alerts.push(['warn', `El Toolbox no tiene módulo ${g.m} en la lista (Module): revisa el dato.`]);
      if (g.z < 10 || g.z > 300) alerts.push(['warn', `El Toolbox ofrece de 10 a 300 dientes; z = ${g.z} no está en la lista.`]);
      if (!TB_BORE.includes(d)) alerts.push(['warn', `Ø${f(d)} no está en la lista Nominal Shaft Diameter del Toolbox. Elige el más cercano por debajo (${TB_BORE.filter(x => x < d).pop() ?? '—'}) y agranda el agujero a Ø${f(d)} con un corte.`]);
      if (rim < g.m) alerts.push(['warn', `El agujero Ø${f(d)} deja ${f(rim)} mm bajo el pie del diente (Ø${r1(g.df)}): menos de un módulo, no cabe. Usa un asiento más fino.`]);
      if (!L) alerts.push(['warn', `El Toolbox no tiene chaveta ${k.b}×${k.h}: modélala tú.`]);
      return {
        alerts,
        tiles: [['Engranaje · Toolbox', `m${g.m} · z${g.z} · β${g.beta}° ${st.mano}`, `ancho ${g.fw} · agujero Ø${f(d)}`], ['dp / de', `${r1(g.dp)} / ${r1(g.de)}`, `m·z/cos β = ${f(g.dp)} · dp + 2m`],
          ['Polea', `${P.type} · D ${P.D}`, `d = D − b = ${P.d} ≈ dp ${r1(g.dp)}`], ['Chaveta (polea)', `A ${k.b} × ${k.h} × ${L || 'L'}`, `Ø${f(dk)} · t1 ${f(k.t1)} · t2 ${f(k.t2)}`], ['Soldadura', weldTxt, `sobre Ø${f(wd)} · tabla ${weldTab}`]],
        more: `<article class="panel"><h3>A mano (examen): las medidas del engranaje</h3>
            ${row('Módulo normal mn · transversal mt = mn / cos β', `${g.m} · ${f(g.m / Math.cos(g.beta * Math.PI / 180))}`)}
            ${row('Ø primitivo dp = mt · z = mn · z / cos β', f(g.dp))}${row('Ø exterior de = dp + 2·mn', f(g.de))}${row('Ø de fondo df = dp − 2.5·mn', f(g.df))}
            ${row('Addendum ha = mn · dedendum hf = 1.25·mn · altura h = 2.25·mn', `${f(g.m)} · ${f(1.25 * g.m)} · ${f(2.25 * g.m)}`)}
            ${row('Paso normal pn = π·mn · paso transversal pt = π·mt', `${f(Math.PI * g.m)} · ${f(Math.PI * g.m / Math.cos(g.beta * Math.PI / 180))}`)}
            ${g.beta > 0 ? row('Paso de la hélice pz = π·dp / tan β', f(Math.PI * g.dp / Math.tan(g.beta * Math.PI / 180))) : ''}${row('Ancho b (Face Width)', g.fw)}</article>
          <article class="panel"><h3>1 · Toolbox › DIN › Power Transmission › Gears › Helical Gear (Configure Component)</h3>
            ${row('Module', g.m)}${row('Number of Teeth', g.z)}${row('Helix Direction', HAND[st.mano])}${row('Helix Angle', g.beta)}${row('Pressure Angle', 20)}
            ${row('Face Width', g.fw)}${row('Hub Style', 'Type A')}${row('Nominal Shaft Diameter', f(d))}${row('Keyway', 'None <span class="small">(va soldado)</span>')}
            <div class="row"><span class="k">Nombre que sale</span><span class="v mono wrap">${cfg}</span></div></article>
          <article class="panel"><h3>2 · Weld Bead (en el ensamblaje)</h3>
            ${row('Weld Geometry', 'cara lateral del engranaje + cara del asiento del eje')}${row('Bead size', f(w.a))}${row('Intermittent Weld', 'Gap and weld length')}
            ${row('Weld length', f(w.l))}${row('Gap', f(w.gap))}</article>
          <article class="panel"><h3>3 · Polea ${P.type}${P.D} (pieza tuya, revolución)</h3>
            ${row('D exterior', P.D)}${row('a · ancho de la garganta arriba', P.a)}${row('h · profundidad', P.h)}${row('b', P.b)}${row('c · ancho de la polea', P.c)}${row('β · ángulo de la garganta', P.ang + '°')}
            ${row('Agujero', `Ø${f(dk)} H8 + chavetero ${k.b} × t2 ${f(k.t2)}`)}</article>
          <article class="panel"><h3>4 · Chaveta y eje</h3>
            ${row('Toolbox › DIN › Keys › Parallel Keys', `<span class="mono">${keyCfg}</span>`)}${row('Chavetero del eje', `${k.b} × L ${L || 'L'} · t1 ${f(k.t1)}`)}
            ${row('Asiento del engranaje', `Ø${f(d)} h7`)}${row('Extremo de la polea', `Ø${f(dk)} h7, largo ≥ ${L || 'L'}`)}</article>`,
        sketches: [
          ['Hoja del engranaje · vista de frente', 'A escala. La tabla m, z, β, dp, de va junto a la vista; el agujero lleva H8.', gearSvg(g, d)],
          [`Hoja de la polea · sección (como la C-C del profesor)`, `La garganta a escala; la línea discontinua es el Ø primitivo d = D − b = ${P.d}.`, pulleySvg(P, dk)],
        ],
        plano: [
          ['Hoja del engranaje', [
            ['Tabla · m / z / beta', `<span class="big">${g.m} · ${g.z} · ${g.beta}°</span>`],
            ['Tabla · dp / de', `<span class="big">${r1(g.dp)} · ${r1(g.de)}</span> <span class="small">(${f(g.dp)} · ${f(g.de)})</span>`],
            ['Agujero', tvd('Ø' + f(d), DI.dev(d, 'H8'), 'H8')], ['Ancho', `<span class="big">${g.fw}</span>`],
          ]],
          ['Hoja del eje', [
            ['Asiento del engranaje', tvd('Ø' + f(d), DI.dev(d, 'h7'), 'h7')], ['Extremo de la polea', tvd('Ø' + f(dk), DI.dev(dk, 'h7'), 'h7')],
            ['Chavetero · ancho b', tvd(String(k.b), DI.dev(k.b, fs), fs)], ['Chavetero · largo · profundidad t1', `<span class="big">${L || 'L'} · ${f(k.t1)}</span>`],
          ]],
          ['Hoja de la polea', [
            ['Ø exterior D · ancho c', `<span class="big">Ø${P.D} · ${P.c}</span>`], ['Garganta a · h · b · β', `<span class="big">${P.a} · ${P.h} · ${P.b} · ${P.ang}°</span>`],
            ['Agujero', tvd('Ø' + f(dk), DI.dev(dk, 'H8'), 'H8')], ['Chavetero · ancho b · t2', `${tvd(String(k.b), DI.dev(k.b, fh), fh)} <span class="big">· ${f(k.t2)}</span>`],
          ]],
          ['Hoja del conjunto', [['Símbolo de soldadura', `<span class="big">${weldTxt}</span>`], ['Tabla de soldadura · SIZE · LENGTH', `<span class="big">${f(w.a)} · ${weldTab}</span> <span class="small">({} = largo total n·l)</span>`], ['Lista de materiales', `<span class="mono">${cfg}</span> · <span class="mono">${keyCfg}</span> · <span class="mono">Pulley-${P.type}${P.D}</span>`]]],
        ],
        source: `<p><b>Engranaje:</b> m es el módulo normal (el del Toolbox): dp = m·z / cos β, de = dp + 2m, df = dp − 2.5m. Ejemplo del profesor (DI-S38t): m 5, z 21, β 20° → dp 111.7, de 121.7, agujero Ø65 H8, ancho 15.</p>
          <p><b>Campos del Toolbox:</b> sacados de la base de datos del propio SolidWorks (DIN, Helical Gear). El nombre de la configuración es «DIN - mano Helical gear mM zT βHA 20PA anchoFW ---z A 75 H 50 L agujero N»; con Hub Style A el 75 y el 50 no se usan.</p>
          <p><b>Polea:</b> tabla de correas trapeciales de la diapositiva 5 (Z, A, B, C, D, E). Se toma el D cuyo d = D − b queda más cerca del dp del engranaje y el β de esa fila (profesor: Z → D 118, d 112, β 38°).</p>
          <p><b>Chaveta:</b> DIN 6885-1 por el Ø del extremo, la longitud más corta del Toolbox (profesor: Ø40 → 12 × 8 × 32, t1 5, t2 3.3). Tolerancias del chavetero como en la calculadora Chaveta (libre H9 / D10).</p>
          <p><b>Ajustes:</b> los del plano del profesor: agujeros H8, eje h7 (engranaje y polea).</p>
          <p><b>Soldadura:</b> n · (l + e) = π · d sobre el asiento. El profesor puso 4 ◺ 2x80(25) en Ø65 (redondeado; la cuenta exacta da l = 77.11). En la solución con rodamientos (ex.bearings) el cordón va en el collar Ø70: 5 ◺ 4x20(35), tabla 4X20(35){80}.</p>`,
      };
    },
  });
})();
