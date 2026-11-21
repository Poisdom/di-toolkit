// Control del lunes 23/11 (solved by hand): the 5 changes in the professor's e-mail as topics, on ONE linked data set
// (the bearing feeds the circlip, the pulley bore feeds the key and the nut). Pure (no DOM) so node test.js checks it;
// app.js draws it. Every number comes from the calculators in calc/*.js.
(function (G) {
  'use strict';
  const { f, pm } = G.KIT;
  const C = id => G.CALCS.find(c => c.id === id);
  const n = x => parseFloat(String(x ?? '').replace(',', '.'));
  const sheets = (plano, names) => plano.filter(([s]) => names.includes(s));

  // the professor's solution (ex.bearings) with the changes his e-mail announces (6211, belt A)
  const defaults = { rod: '6211', eje: 'k5', amin: '2', amax: '25', caja: 'G3', jmin: '2', jmax: '34',
    seat: '65', m: '5', z: '21', beta: '20', mano: 'LH', fw: '15', wd: '70', wa: '5', wn: '4', we: '35', correa: 'A', dpol: '40', hub: '50' };

  const bearing = ex => { const { serie, d } = C('rodamiento').parse(ex.rod); return { serie, d, st: { serie, eje: ex.eje, amin: ex.amin, amax: ex.amax, caja: ex.caja, jmin: ex.jmin, jmax: ex.jmax } }; };
  const gearSt = ex => ({ m: ex.m, z: ex.z, beta: ex.beta, mano: ex.mano, fw: ex.fw, correa: ex.correa, dpol: ex.dpol, wa: ex.wa, wn: ex.wn, we: ex.we, wd: ex.wd });

  const topics = [
    { id: 'rodamiento', title: 'Rodamiento y tolerancia del eje', short: 'Rodamiento',
      pide: 'Cambiar el rodamiento por otro de la misma norma (6210 → 6211) y recalcular la tolerancia del eje. Con 50 k5 el apriete es de 2 a 25 µm.',
      entregas: 'La designación nueva con sus medidas, la clase del eje que mantiene el apriete y la cota del asiento (y la de la caja).',
      fields: [['rod', 'Rodamiento', 'el profesor: 6210', 'text'], ['eje', 'Clase del eje', 'k5', 'text'], ['amin', 'Apriete mín. (µm)', '', 'num'], ['amax', 'Apriete máx. (µm)', '', 'num'],
        ['caja', 'Clase de la caja', 'G3', 'text'], ['jmin', 'Juego mín. (µm)', '', 'num'], ['jmax', 'Juego máx. (µm)', '', 'num']],
      solve(ex) {
        const c = C('rodamiento'), { d, st } = bearing(ex), R = c.calc(d, st), r = c.run(d, st), sb = R.ls.best, hb = R.lh.best;
        return { alerts: r.alerts.filter(a => a[0] === 'warn'), steps: c.mano(d, st), sketches: r.sketches, plano: sheets(r.plano, ['Hoja del eje', 'Hoja de la caja']),
          answer: [['Rodamiento', `${R.name} · d ${R.d} × D ${R.D} × B ${R.B}`],
            [`Eje ${R.shaft.cls}`, `Ø${R.d} ${R.shaft.cls} (${pm([R.shaft.up, R.shaft.low])}) · apriete ${R.shaft.min} a ${R.shaft.max} µm`],
            [`Apriete ${R.amin}–${R.amax}`, sb ? `Ø${R.d} ${sb.cls} (${pm([sb.up, sb.low])}) · ${sb.min} a ${sb.max} µm` : 'ninguna de esa letra: mira la escala IT'],
            [`Caja · juego ${R.jmin}–${R.jmax}`, hb ? `Ø${R.D} ${hb.cls} (${pm([hb.up, hb.low])}) · ${hb.min} a ${hb.max} µm` : 'ninguna de esa letra']] };
      } },
    { id: 'anillos', title: 'Anillos de retención (circlips)', short: 'Circlips',
      pide: 'Faltan los anillos de retención que impiden que los rodamientos se muevan axialmente.',
      entregas: 'El anillo DIN 471 para el agujero del rodamiento, la ranura con sus tolerancias y su posición.',
      fields: [],
      solve(ex) {
        const { d } = bearing(ex), R = C('rodamiento').calc(d, bearing(ex).st), a = C('anillo'), st = { apoyo: String(R.B) }, r = a.run(d, st);
        const c = DI.circlipFor(d);
        return { linked: `Agujero del rodamiento ${R.name}: Ø${d} (tema 1)`, alerts: r.alerts, steps: a.mano(d, st),
          sketches: [r.sketches[0], C('rodamiento').run(d, bearing(ex).st).sketches[1]], plano: r.plano,
          answer: [['Anillo', `DIN 471 - ${c.d1} x ${f(c.s)}`], ['Ranura', `Ø${f(c.d2)} ${c.d2Class} (${pm([c.d2Up, c.d2Lo])}) × ${f(c.m)} H13 (${pm([c.mUp, c.mLo])})`],
            ['Posición', `a ${R.B} del collar (el ancho B del rodamiento)`]] };
      } },
    { id: 'engranaje', title: 'Engranaje: m, z y β nuevos', short: 'Engranaje',
      pide: 'Calcular las dimensiones del engranaje con otro módulo, otro número de dientes y otro ángulo de hélice.',
      entregas: 'dp, de y df, la tabla del plano (m, z, β, dp, de), el agujero con su tolerancia y la soldadura al eje.',
      fields: [['m', 'Módulo m', 'el profesor: 5', 'num'], ['z', 'Dientes z', '21', 'num'], ['beta', 'Hélice β (°)', '20', 'num'], ['mano', 'Hélice', '', 'select', [['LH', 'Izquierda'], ['RH', 'Derecha']]],
        ['fw', 'Ancho del diente', '15', 'num'], ['seat', 'Ø del asiento', '65', 'num'], ['wd', 'Ø del cordón', 'el collar: 70', 'num'], ['wa', 'Garganta a', '5', 'num'], ['wn', 'Cordones n', '4', 'num'], ['we', 'Separación e', '35', 'num']],
      solve(ex) {
        const c = C('engranaje'), d = n(ex.seat), st = gearSt(ex), r = c.run(d, st), { g, w } = c.calc(d, st);
        const eje = r.plano.find(([s]) => s === 'Hoja del eje')[1].filter(([k]) => k.startsWith('Asiento'));
        return { alerts: r.alerts.filter(a => !/chaveta/.test(a[1])), steps: c.manoGear(d, st), sketches: [r.sketches[0]],
          plano: [...sheets(r.plano, ['Hoja del engranaje']), ['Hoja del eje', eje], ...sheets(r.plano, ['Hoja del conjunto'])],
          answer: [['dp · de · df', `${f(g.dp)} · ${f(g.de)} · ${f(g.df)}`], ['Tabla del plano', `m ${g.m} · z ${g.z} · β ${g.beta}° · dp ${g.dp.toFixed(1)} · de ${g.de.toFixed(1)}`],
            ['Agujero', `Ø${f(d)} H8 (${pm(DI.dev(d, 'H8'))})`], ['Soldadura', `${f(w.a)} ◺ ${w.n}x${f(w.l)}(${f(w.gap)}) · tabla ${w.n}X${f(w.l)}(${f(w.gap)}){${f(w.total)}}`]] };
      } },
    { id: 'polea', title: 'Polea: agujero nuevo, chaveta y correa', short: 'Polea',
      pide: 'Cambiar el diámetro interior de la polea (así cambia la chaveta) y el tipo de correa (Z → A).',
      entregas: 'La chaveta DIN 6885 y los dos chaveteros con tolerancias, y la garganta y el Ø de la polea para la correa nueva.',
      fields: [['correa', 'Correa', 'el profesor: Z', 'select', ['Z', 'A', 'B', 'C', 'D', 'E'].map(t => [t, 'Tipo ' + t])], ['dpol', 'Agujero de la polea (mm)', 'el profesor: 40', 'num']],
      solve(ex) {
        const e = C('engranaje'), k = C('chaveta'), d = n(ex.seat), st = gearSt(ex), r = e.run(d, st), { P, dk, k: key, L } = e.calc(d, st), kr = k.run(dk, { fit: 'libre' }, { seat: '' });
        const eje = r.plano.find(([s]) => s === 'Hoja del eje')[1].filter(([s]) => !s.startsWith('Asiento'));
        return { linked: `dp del engranaje: ${f(e.calc(d, st).g.dp)} (tema 3)`, alerts: r.alerts.filter(a => /chaveta/.test(a[1])),
          steps: [...e.manoPolea(d, st), ...k.mano(dk, { fit: 'libre' }, { seat: '' }).slice(1, -1)],   // its key and length steps are already in manoPolea,
          sketches: [r.sketches[1], kr.sketches[0], kr.sketches[1]], plano: [['Hoja del eje', eje], ...sheets(r.plano, ['Hoja de la polea'])],
          answer: [['Polea', `correa ${P.type} · D ${P.D} · d ${P.d} · garganta a ${P.a}, h ${P.h}, c ${P.c}, β ${P.ang}°`],
            ['Chaveta', `A ${key.b} × ${key.h} × ${L || 'L'} DIN 6885`], ['Chavetero del eje', `${key.b} H9 · t1 ${f(key.t1)} (d − t1 = ${f(dk - key.t1)})`],
            ['Chavetero de la polea', `${key.b} D10 · t2 ${f(key.t2)} (d + t2 = ${f(dk + key.t2)})`], ['Agujero', `Ø${f(dk)} H8 (${pm(DI.dev(dk, 'H8'))})`]] };
      } },
    { id: 'tuerca', title: 'Tuerca y contratuerca en el extremo', short: 'Tuerca',
      pide: 'Alargar el eje con un diámetro inferior al interior de la polea y colocar tuerca y contratuerca.',
      entregas: 'La rosca del extremo, las dos tuercas ISO y los largos del asiento y de la rosca.',
      fields: [['hub', 'Ancho del cubo de la polea', 'el profesor: 50', 'num']],
      solve(ex) {
        const c = C('tuerca'), d = n(ex.dpol), st = { hub: ex.hub, m: '' }, r = c.run(d, st), T = c.calc(d, st);
        return { linked: `Agujero de la polea: Ø${f(d)} (tema 4)`, alerts: r.alerts, steps: c.mano(d, st), sketches: r.sketches, plano: r.plano,
          answer: [['Rosca', `M${T.M} × ${T.L} · fondo Ø${f(+T.d3.toFixed(2))}`], ['Tuerca', `ISO 4032 - M${T.M} (m ${T.m})`], ['Contratuerca', `ISO 4035 - M${T.M} (m ${T.mt})`],
            ['Asiento de la polea', `${f(T.seat)} (cubo ${f(T.hub)} − 2)`]] };
      } },
  ];
  topics.forEach((t, i) => { t.n = i + 1; });

  function solveAll(ex) {
    const out = {};
    for (const t of topics) { try { out[t.id] = t.solve(ex); } catch (e) { out[t.id] = { error: e.message }; } }
    return out;
  }
  G.EXAM = { date: '2026-11-23', defaults, topics, solveAll };
})(globalThis);
