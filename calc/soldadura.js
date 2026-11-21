// Soldadura intermitente alrededor de un eje. Symbol per ISO 2553; the bead/gap split is the course convention (engine.weld).
(function () {
  'use strict';
  const { f, num, defs, dim, lab, svg, pid } = KIT;
  const txt = w => `${f(w.a)} ◺ ${w.n}x${f(w.l)}(${f(w.gap)})`;

  // the circle unrolled: n beads of l with gaps e
  function unrolledSvg(w, d) {
    const p = pid(), x0 = 30, W = 410, sc = W / w.perimeter, X = v => x0 + v * sc, y = 110;
    const beads = Array.from({ length: w.n }, (_, i) => `<rect class="bead" x="${X(i * w.pitch)}" y="${y - 10}" width="${Math.max(w.l * sc, 2)}" height="20" rx="3"/>`).join('');
    return svg(470, 200, `La vuelta del eje Ø${f(d)} desarrollada: ${w.n} cordones de ${f(w.l)} con separación ${f(w.gap)}`, `${defs(p)}
      <line class="edge" x1="${x0}" y1="${y}" x2="${x0 + W}" y2="${y}"/>${beads}
      <path class="ext" d="M${X(0)} ${y - 12} V30 M${X(w.l)} ${y - 12} V76 M${X(w.pitch)} ${y - 12} V30"/>
      ${dim(X(0), 82, X(w.l), 82, p)}${lab(X(w.l / 2), 74, 'l ' + f(w.l))}
      ${w.n > 1 ? `${dim(X(w.l), 82, X(w.pitch), 82, p)}${lab(X((w.l + w.pitch) / 2) + 6, 74, 'e ' + f(w.gap), '', '', 'start')}` : ''}
      ${dim(X(0), 38, X(w.pitch), 38, p)}${lab(X(w.pitch / 2), 30, 'paso ' + f(w.pitch))}
      <path class="ext" d="M${x0} ${y + 12} V172 M${x0 + W} ${y + 4} V172"/>${dim(x0, 166, x0 + W, 166, p, 1)}
      ${lab(x0 + W / 2, 160, `π · d = ${f(w.perimeter)}`, '', '', 'middle', true)}
      <text x="${x0 + W / 2}" y="192" text-anchor="middle">la vuelta del eje, desenrollada</text>`);
  }

  function symbolSvg(w) {
    const p = pid();
    return svg(470, 190, `Símbolo de soldadura: a${f(w.a)}, ${w.n} por ${f(w.l)}, separación ${f(w.gap)}`, `${defs(p)}
      <line class="edge" x1="74" y1="160" x2="150" y2="84" marker-start="url(#${p}-b)" style="stroke-width:1.4"/>
      <line class="edge" x1="150" y1="84" x2="450" y2="84" style="stroke-width:1.4"/>
      <path class="edge" d="M250 84 V58 L276 84" style="stroke-width:1.6"/>
      ${lab(242, 78, 'a' + f(w.a), '', '', 'end')}${lab(286, 78, `${w.n} × ${f(w.l)} (${f(w.gap)})`, '', '', 'start')}
      <text x="80" y="182">unión eje–polea</text>
      ${lab(450, 130, `En SolidWorks: ${txt(w)}`, '', '', 'end', true)}`);
  }

  CALCS.push({
    id: 'soldadura', group: 'Uniones y piezas normalizadas', title: 'Soldadura intermitente', norma: 'ISO 2553',
    blurb: 'Cordones alrededor del eje y su símbolo',
    intro: 'Cordones de soldadura repartidos alrededor de un Ø: largo de cada cordón, separación, paso para SolidWorks y el símbolo del plano.',
    casos: 'golden.json',
    defaults: { n: '3', e: '', a: '5' },
    preview(d, st) { return txt(this.calc(d, st)); },
    calc(d, st) {
      const a = st.a === '' ? 5 : num(st.a);
      if (!(a > 0)) throw new Error('La garganta a tiene que ser mayor que 0.');
      return DI.weld(d, st.n === '' ? 3 : num(st.n), st.e === '' ? null : num(st.e), a);
    },
    form: () => `<label class="fld">Ø del eje (mm)<input class="fv" data-s="soldadura.d" type="number" min="0.1" step="any" inputmode="decimal"></label>
      <label class="fld">Cordones n<input class="fv" data-s="soldadura.n" type="number" min="1" step="1" inputmode="numeric"></label>
      <label class="fld">Separación e <span class="opt">vacío = automática</span><input class="fv" data-s="soldadura.e" type="number" min="0" step="any" inputmode="decimal" placeholder="auto"></label>
      <label class="fld">Garganta a<input class="fv" data-s="soldadura.a" type="number" min="0" step="any" inputmode="decimal"></label>`,
    mano(d, st) {
      const w = this.calc(d, st);
      return [
        ['Perímetro', `π · d = π · ${f(d)} = ${f(w.perimeter)}`],
        ['Paso', `π · d / n = ${f(w.perimeter)} / ${w.n} → <b>${f(w.pitch)}</b> (redondeado hacia arriba)`],
        ['Separación e', st.e === '' ? `un tercio del paso, redondeado a 0.5 → <b>${f(w.gap)}</b>` : `la del enunciado: <b>${f(w.gap)}</b>`],
        ['Largo de cada cordón', `l = paso − e = ${f(w.pitch)} − ${f(w.gap)} = <b>${f(w.l)}</b>`],
        ['Símbolo', `<b>${txt(w)}</b> · total soldado n · l = ${f(w.total)}`],
      ];
    },
    run(d, st) {
      const w = this.calc(d, st);
      return {
        tiles: [['Símbolo', txt(w), 'garganta ◺ n × l (e)'], ['Largo de cada cordón l', f(w.l), 'mm'], ['Paso l + e', f(w.pitch), 'mm · el que pide SolidWorks']],
        more: `<article class="panel">
          <div class="row"><span class="k">Separación e</span><span class="v big">${f(w.gap)}</span></div>
          <div class="row"><span class="k">Total soldado n · l</span><span class="v big">${f(w.total)}</span></div>
          <div class="row"><span class="k">Perímetro π · d</span><span class="v big">${f(w.perimeter)}</span></div>
          <div class="row"><span class="k">En SolidWorks</span><span class="v">Insert › Assembly Feature › Weld Bead · tamaño ${f(w.a)} · Intermittent · largo ${f(w.l)} · paso ${f(w.pitch)}</span></div></article>`,
        sketches: [
          ['Los cordones, con la vuelta desenrollada', 'A escala: n · (l + e) = π · d. El paso va redondeado hacia arriba para que SolidWorks cuente n cordones.', unrolledSvg(w, d)],
          ['Hoja del conjunto · el símbolo', 'La flecha toca la unión; garganta a la izquierda del triángulo, n × l (e) a la derecha.', symbolSvg(w)],
        ],
        plano: [
          ['Hoja del conjunto', [['Símbolo de soldadura', `<span class="big">${txt(w)}</span>`], ['Tabla de soldadura', '<span class="small">encima de la lista de materiales</span>']]],
        ],
        source: `<p><b>Norma del símbolo:</b> ISO 2553 (representación simbólica de soldaduras): garganta a, triángulo de soldadura en ángulo, n × l (e) para cordones intermitentes.</p>
          <p><b>Reparto l / e:</b> convención del curso, no de la norma: la separación es un tercio del paso, redondeada a 0.5 (ejemplo del profesor, Ø15 → 5 ◺ 3x11.5(5)). Si el enunciado da otra separación, escríbela arriba.</p>
          <p><b>Cuenta:</b> n · (l + e) = π · d; garganta 5 y 3 cordones en el ejercicio del curso.</p>`,
        figure: ['img/ejemplo-09.jpg', 1100, 231, 'Tabla de soldadura sobre la lista de materiales del profesor', 'Así puso el profesor la tabla de soldadura, justo encima de la lista de materiales.'],
      };
    },
  });
})();
