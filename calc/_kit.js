// Shared formatting and drawing helpers for calc/*.js and app.js. No DOM, so node test.js can load it.
// Sketch colours: blue (.v, .dim) = what you model and dimension, ochre (.c, .dv) = tolerance, grey (.g, .dimg) = given geometry.
// Sketches use a viewBox at most 480 wide with 16 px text, so labels stay >= 11 px on a 360 px phone.
(function (G) {
  'use strict';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const mn = s => String(s).replace(/^-/, '−');
  const f = x => String(+(+x).toFixed(3));
  const n1 = x => Number.isInteger(+x) ? (+x).toFixed(1) : f(x);
  const num = x => parseFloat(String(x ?? '').replace(',', '.'));
  // a tolerance as on a drawing: nominal, class, stacked deviations
  const tv = (nom, up, lo, fit, ref) => `<span class="tv${ref ? ' ref' : ''}"><span class="n">${nom}</span>${fit ? `<span class="ft">${esc(fit)}</span>` : ''}${up !== null ? `<span class="dv"><span>${mn(up)}</span><span>${mn(lo)}</span></span>` : ''}</span>`;
  const tvd = (nom, dv, fit) => tv(nom, G.DI.mm(dv[0]), G.DI.mm(dv[1]), fit);
  // deviations in um -> "+0.025/0" for sketch labels
  const short = um => mn(um === 0 ? '0' : (um > 0 ? '+' : '') + f(um / 1000));
  const pm = dv => `${short(dv[0])}/${short(dv[1])}`;

  const mk = (id, cls) => `<marker id="${id}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="${cls}" d="M0 1 L10 5 L0 9 z"/></marker>`;
  // every svg gets its own prefix p: markers p-b (blue), p-g (grey), hatch p-h
  const defs = p => `<defs>${mk(p + '-b', 'ar')}${mk(p + '-g', 'arg')}<pattern id="${p}-h" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line class="hatch" x1="0" y1="0" x2="0" y2="7"/></pattern></defs>`;
  const dim = (x1, y1, x2, y2, p, grey) => `<line class="${grey ? 'dimg' : 'dim'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-start="url(#${p}-${grey ? 'g' : 'b'})" marker-end="url(#${p}-${grey ? 'g' : 'b'})"/>`;
  // label: value in blue (grey if g), fit class and deviations in ochre
  const lab = (x, y, val, cls, dev, anchor = 'middle', g) => `<text class="${g ? 'g' : 'v'} lbl" x="${x}" y="${y}" text-anchor="${anchor}">${val}${cls ? ` <tspan class="c">${esc(cls)}</tspan>` : ''}${dev ? ` <tspan class="dv">${dev}</tspan>` : ''}</text>`;
  const svg = (w, h, label, body) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;

  let uid = 0;
  const pid = () => 's' + (++uid);

  G.KIT = { esc, mn, f, n1, num, tv, tvd, short, pm, defs, dim, lab, svg, pid };
  G.CALCS = G.CALCS || [];
})(globalThis);
