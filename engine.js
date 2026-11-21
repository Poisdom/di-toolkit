// DI Toolkit engine: ISO 286 fits, DIN 6885-1 keys, DIN 471 circlips, intermittent welds.
// Pure functions, no DOM. Deviations in micrometres, sizes in mm. `node test.js` checks it against test/golden.json.
// Sources: ISO 286-1/2 tables, DIN 6885-1, DIN 471 sizes as in the SolidWorks Toolbox, groove classes from supplier sheets.
(function (root) {
  'use strict';

  // ---- ISO 286 standard tolerance grades (um); main ranges: up to and including
  const IT_RANGES = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250, 315, 400, 500];
  const IT = {
    1: [0.8, 1, 1, 1.2, 1.5, 1.5, 2, 2.5, 3.5, 4.5, 6, 7, 8],
    2: [1.2, 1.5, 1.5, 2, 2.5, 2.5, 3, 4, 5, 7, 8, 9, 10],
    3: [2, 2.5, 2.5, 3, 4, 4, 5, 6, 8, 10, 12, 13, 15],
    4: [3, 4, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20],
    5: [4, 5, 6, 8, 9, 11, 13, 15, 18, 20, 23, 25, 27],
    6: [6, 8, 9, 11, 13, 16, 19, 22, 25, 29, 32, 36, 40],
    7: [10, 12, 15, 18, 21, 25, 30, 35, 40, 46, 52, 57, 63],
    8: [14, 18, 22, 27, 33, 39, 46, 54, 63, 72, 81, 89, 97],
    9: [25, 30, 36, 43, 52, 62, 74, 87, 100, 115, 130, 140, 155],
    10: [40, 48, 58, 70, 84, 100, 120, 140, 160, 185, 210, 230, 250],
    11: [60, 75, 90, 110, 130, 160, 190, 220, 250, 290, 320, 360, 400],
    12: [100, 120, 150, 180, 210, 250, 300, 350, 400, 460, 520, 570, 630],
    13: [140, 180, 220, 270, 330, 390, 460, 540, 630, 720, 810, 890, 970],
    14: [250, 300, 360, 430, 520, 620, 740, 870, 1000, 1150, 1300, 1400, 1550],
    15: [400, 480, 580, 700, 840, 1000, 1200, 1400, 1600, 1850, 2100, 2300, 2500],
    16: [600, 750, 900, 1100, 1300, 1600, 1900, 2200, 2500, 2900, 3200, 3600, 4000],
  };
  // fundamental deviations use the intermediate ranges
  const FD_RANGES = [3, 6, 10, 14, 18, 24, 30, 40, 50, 65, 80, 100, 120, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500];
  // shafts d..h: upper deviation es
  const ES = {
    d: [-20, -30, -40, -50, -50, -65, -65, -80, -80, -100, -100, -120, -120, -145, -145, -145, -170, -170, -170, -190, -190, -210, -210, -230, -230],
    e: [-14, -20, -25, -32, -32, -40, -40, -50, -50, -60, -60, -72, -72, -85, -85, -85, -100, -100, -100, -110, -110, -125, -125, -135, -135],
    f: [-6, -10, -13, -16, -16, -20, -20, -25, -25, -30, -30, -36, -36, -43, -43, -43, -50, -50, -50, -56, -56, -62, -62, -68, -68],
    g: [-2, -4, -5, -6, -6, -7, -7, -9, -9, -10, -10, -12, -12, -14, -14, -14, -15, -15, -15, -17, -17, -18, -18, -20, -20],
    h: new Array(25).fill(0),
  };
  // shafts k..t: lower deviation ei; k only for grades IT4..IT7 (0 otherwise)
  const EI = {
    k: [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5],
    m: [2, 4, 6, 7, 7, 8, 8, 9, 9, 11, 11, 13, 13, 15, 15, 15, 17, 17, 17, 20, 20, 21, 21, 23, 23],
    n: [4, 8, 10, 12, 12, 15, 15, 17, 17, 20, 20, 23, 23, 27, 27, 27, 31, 31, 31, 34, 34, 37, 37, 40, 40],
    p: [6, 12, 15, 18, 18, 22, 22, 26, 26, 32, 32, 37, 37, 43, 43, 43, 50, 50, 50, 56, 56, 62, 62, 68, 68],
    r: [10, 15, 19, 23, 23, 28, 28, 34, 34, 41, 43, 51, 54, 63, 65, 68, 77, 80, 84, 94, 98, 108, 114, 126, 132],
    s: [14, 19, 23, 28, 28, 35, 35, 43, 43, 53, 59, 71, 79, 92, 100, 108, 122, 130, 140, 158, 170, 190, 208, 232, 252],
    t: [null, null, null, null, null, null, 41, 48, 54, 66, 75, 91, 104, 122, 134, 146, 166, 180, 196, 218, 240, 268, 294, 330, 360],
  };
  const LETTERS = ['d', 'e', 'f', 'g', 'h', 'js', 'k', 'm', 'n', 'p', 'r', 's', 't'];

  function idx(ranges, d) {
    const last = ranges[ranges.length - 1];
    if (!(d > 0) || d > last) throw new Error(`Medida ${d} mm fuera de 0–${last} mm`);
    return ranges.findIndex(b => d <= b + 1e-9);
  }
  function it(g, d) {
    if (!IT[g]) throw new Error(`Grado IT${g} no disponible (IT1–IT16)`);
    return IT[g][idx(IT_RANGES, d)];
  }
  function split(code) {
    const m = /^([A-Za-z]{1,2})(\d{1,2})$/.exec(String(code).trim());
    if (!m) throw new Error(`«${code}» no es una clase de tolerancia (ejemplos: H7, g6, JS9)`);
    const L = m[1].toLowerCase();
    if ((m[1] !== L && m[1] !== L.toUpperCase()) || !LETTERS.includes(L))
      throw new Error(`Letra «${m[1]}» no disponible. Hay: ${LETTERS.join(', ')} (ejes) y las mismas en mayúscula (agujeros)`);
    return { L, hole: m[1] !== L, g: +m[2] };
  }

  // [upper, lower] deviation in um of e.g. 'h9', 'D10', 'JS9', 'N9', 'P9', 'f6', 'S7'
  function dev(d, code) {
    const { L, hole, g } = split(code);
    const t = it(g, d), i = idx(FD_RANGES, d);
    const undef = () => new Error(`${code} no está definida para ${d} mm`);
    if (L === 'js') return [t / 2, -t / 2];
    if (!hole) {
      if (L in ES) { const up = ES[L][i]; return [up, up - t]; }
      let lo = EI[L][i];
      if (lo == null) throw undef();
      if (L === 'k' && !(g >= 4 && g <= 7)) lo = 0;
      return [lo + t, lo];
    }
    if (L in ES) { const lo = -ES[L][i]; return [lo + t, lo]; }   // D..H: EI = -es
    const ei = EI[L][i];                                          // K..T: ES = -ei (+ delta for fine grades)
    if (ei == null || g < 3) throw undef();                       // ISO 286 delta (and the tables) start at grade 3
    const delta = d <= 3 ? 0 : t - it(g - 1, d);
    let up;
    if (L === 'k' || L === 'm' || L === 'n') up = g <= 8 ? -ei + delta : (L === 'm' ? -ei : 0);
    else up = g <= 7 ? -ei + delta : -ei;
    if (L === 'n' && g > 8 && d <= 3) up = -4;                    // ISO 286-1: N above IT8 is -4 up to 3 mm (N9 key 2 and 3)
    if (L === 'm' && g === 6 && d > 250 && d <= 315) up = -9;     // ISO 286-1 special case (the rule gives -11)
    return [up, up - t];
  }

  function fit(d, hole, shaft) {
    if (!split(hole).hole) throw new Error(`El agujero va en mayúscula: ${hole}`);
    if (split(shaft).hole) throw new Error(`El eje va en minúscula: ${shaft}`);
    const h = dev(d, hole), s = dev(d, shaft);
    const jmax = h[0] - s[1], jmin = h[1] - s[0];
    return { hole: h, shaft: s, jmax, jmin, kind: jmin >= 0 ? 'clearance' : jmax <= 0 ? 'interference' : 'transition' };
  }

  // signed mm string as on a drawing; half-micrometre values (js with odd IT) keep 4 decimals
  function mm(um) {
    const v = um / 1000;
    if (Math.abs(v) < 5e-7) return '0.000';
    return (v > 0 ? '+' : '') + v.toFixed(Number.isInteger(um) ? 3 : 4);
  }

  // ---- DIN 6885-1 parallel keys: [over, up to incl, b, h, t1, t2, rmin, rmax]
  const KEYS = [
    [6, 8, 2, 2, 1.2, 1.0, 0.08, 0.16], [8, 10, 3, 3, 1.8, 1.4, 0.08, 0.16], [10, 12, 4, 4, 2.5, 1.8, 0.08, 0.16],
    [12, 17, 5, 5, 3.0, 2.3, 0.16, 0.25], [17, 22, 6, 6, 3.5, 2.8, 0.16, 0.25], [22, 30, 8, 7, 4.0, 3.3, 0.16, 0.25],
    [30, 38, 10, 8, 5.0, 3.3, 0.25, 0.40], [38, 44, 12, 8, 5.0, 3.3, 0.25, 0.40], [44, 50, 14, 9, 5.5, 3.8, 0.25, 0.40],
    [50, 58, 16, 10, 6.0, 4.3, 0.25, 0.40], [58, 65, 18, 11, 7.0, 4.4, 0.25, 0.40], [65, 75, 20, 12, 7.5, 4.9, 0.40, 0.60],
    [75, 85, 22, 14, 9.0, 5.4, 0.40, 0.60], [85, 95, 25, 14, 9.0, 5.4, 0.40, 0.60], [95, 110, 28, 16, 10.0, 6.4, 0.40, 0.60],
    [110, 130, 32, 18, 11.0, 7.4, 0.40, 0.60], [130, 150, 36, 20, 12.0, 8.4, 0.70, 1.00], [150, 170, 40, 22, 13.0, 9.4, 0.70, 1.00],
    [170, 200, 45, 25, 15.0, 10.4, 0.70, 1.00], [200, 230, 50, 28, 17.0, 11.4, 0.70, 1.00],
  ];
  // key lengths the SolidWorks Toolbox offers (DIN_DATA_KEYS_TYPE1_L); it has no 2x2, 3x3, 45x25 or 50x28
  const TOOLBOX_LEN = {
    4: [10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45], 5: [12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50, 56],
    6: [16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50, 56, 63, 70], 8: [20, 22, 25, 28, 32, 36, 40, 45, 50, 56, 63, 70, 80, 90],
    10: [25, 28, 32, 36, 40, 45, 50, 56, 63, 70, 80, 90, 100, 110], 12: [32, 36, 40, 45, 50, 56, 63, 70, 80, 90, 100, 110, 125, 140],
    14: [40, 45, 50, 56, 63, 70, 80, 90, 100, 110, 125, 140, 160],
    16: [45, 50, 56, 63, 70, 80, 90, 100, 110, 125, 140, 160, 180], 18: [50, 56, 63, 70, 80, 90, 100, 110, 125, 140, 160, 180, 200],
    20: [56, 63, 70, 80, 90, 100, 110, 125, 140, 160, 180, 200, 220], 22: [63, 70, 80, 90, 100, 110, 125, 140, 160, 180, 200, 220, 250],
    25: [70, 80, 90, 100, 110, 125, 140, 160, 180, 200, 220, 250], 28: [80, 90, 100, 110, 125, 140, 160, 180, 200, 220, 250],
    32: [90, 100, 110, 125, 140, 160, 180, 200, 220, 250], 36: [100, 110, 125, 140, 160, 180, 200, 220, 250],
    40: [110, 125, 140, 160, 180, 200, 220, 250],
  };
  const DIN_LEN = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50, 56, 63, 70, 80, 90, 100, 110, 125, 140, 160,
    180, 200, 220, 250, 280, 320, 360, 400];
  // keyway width classes [shaft, hub]
  const KEY_FITS = { libre: ['H9', 'D10'], normal: ['N9', 'JS9'], forzado: ['P9', 'P9'] };

  function keyFor(d) {
    const k = KEYS.find(r => r[0] < d && d <= r[1] + 1e-9);
    if (!k) throw new Error(`DIN 6885-1 no tiene chaveta para Ø${d} (va de más de 6 a 230 mm)`);
    const b = k[2];
    return { b, h: k[3], t1: k[4], t2: k[5], rmin: k[6], rmax: k[7], dt: b <= 6 ? 0.1 : b <= 32 ? 0.2 : 0.3, lens: TOOLBOX_LEN[b] || null };
  }
  // (reference) depth of the hub keyway measured from where its walls meet the bore
  function chordRef(d, b, t2) {
    const r = d / 2;
    return +(t2 + r - Math.sqrt(r * r - (b / 2) ** 2)).toFixed(2);
  }

  // ---- DIN 471 circlips for shafts: d1: [s, d2, m]
  const CIRCLIP = {
    3: [0.4, 2.8, 0.5], 4: [0.4, 3.8, 0.5], 5: [0.6, 4.8, 0.7], 6: [0.7, 5.7, 0.8], 7: [0.8, 6.7, 0.9], 8: [0.8, 7.6, 0.9],
    9: [1, 8.6, 1.1], 10: [1, 9.6, 1.1], 11: [1, 10.5, 1.1], 12: [1, 11.5, 1.1], 13: [1, 12.4, 1.1], 14: [1, 13.4, 1.1],
    15: [1, 14.3, 1.1], 16: [1, 15.2, 1.1], 17: [1, 16.2, 1.1], 18: [1.2, 17, 1.3], 19: [1.2, 18, 1.3], 20: [1.2, 19, 1.3],
    21: [1.2, 20, 1.3], 22: [1.2, 21, 1.3], 24: [1.2, 22.9, 1.3], 25: [1.2, 23.9, 1.3], 26: [1.2, 24.9, 1.3],
    28: [1.5, 26.6, 1.6], 29: [1.5, 27.6, 1.6], 30: [1.5, 28.6, 1.6], 32: [1.5, 30.3, 1.6], 34: [1.5, 32.3, 1.6],
    35: [1.5, 33, 1.6], 36: [1.75, 34, 1.85], 38: [1.75, 36, 1.85], 40: [1.75, 37.5, 1.85], 42: [1.75, 39.5, 1.85],
    45: [1.75, 42.5, 1.85], 48: [1.75, 45.5, 1.85], 50: [2, 47, 2.15], 52: [2, 49, 2.15], 55: [2, 52, 2.15],
    56: [2, 53, 2.15], 58: [2, 55, 2.15], 60: [2, 57, 2.15], 62: [2, 59, 2.15], 63: [2, 60, 2.15], 65: [2.5, 62, 2.65],
    68: [2.5, 65, 2.65], 70: [2.5, 67, 2.65], 72: [2.5, 69, 2.65], 75: [2.5, 72, 2.65], 78: [2.5, 75, 2.65],
    80: [2.5, 76.5, 2.65], 82: [2.5, 78.5, 2.65], 85: [3, 81.5, 3.15], 88: [3, 84.5, 3.15], 90: [3, 86.5, 3.15],
    95: [3, 91.5, 3.15], 100: [3, 96.5, 3.15], 105: [4, 101, 4.15], 110: [4, 106, 4.15], 115: [4, 111, 4.15],
    120: [4, 116, 4.15], 125: [4, 121, 4.15], 130: [4, 126, 4.15], 135: [4, 131, 4.15], 140: [4, 136, 4.15],
    145: [4, 141, 4.15], 150: [4, 145, 4.15], 155: [4, 150, 4.15], 160: [4, 155, 4.15], 165: [4, 160, 4.15],
    170: [4, 165, 4.15], 175: [4, 170, 4.15], 180: [4, 175, 4.15], 185: [4, 180, 4.15], 190: [4, 185, 4.15],
    195: [4, 190, 4.15], 200: [4, 195, 4.15],
  };
  const SIZES = Object.keys(CIRCLIP).map(Number);
  const grooveClass = d1 => d1 <= 9 ? 'h10' : d1 <= 22 ? 'h11' : d1 <= 100 ? 'h12' : 'h13';

  // DIN 471 ring for shaft d, or null outside 3-200. Not every diameter has a ring (152, 156...): then the next BIGGER
  // d1 with its own groove, as long as that groove still cuts 0.5 mm into the shaft; otherwise the largest d1 below d.
  function circlipFor(d) {
    if (!(d >= 3 && d <= 200)) return null;
    const exact = SIZES.includes(d);
    const below = Math.max(...SIZES.filter(k => k < d)), above = Math.min(...SIZES.filter(k => k > d));
    const d1 = exact ? d : (isFinite(above) && CIRCLIP[above][1] <= d - 1 + 1e-9 ? above : below);
    const [s, d2, m] = CIRCLIP[d1], cls = grooveClass(d1);
    const [d2Up, d2Lo] = dev(d2, cls), [mUp, mLo] = dev(m, 'H13');
    return { d1, s, d2, m, d2Class: cls, d2Up, d2Lo, mUp, mLo, depth: +((d - d2) / 2).toFixed(3), exact, below, above };
  }

  // ---- intermittent weld: n beads around a circle of diameter d, n*(l+e) = pi*d
  function weld(d, n = 3, gap = null, a = 5) {
    const per = Math.PI * d;
    if (!(Number.isInteger(n) && n >= 1)) throw new Error('El número de cordones tiene que ser un entero ≥ 1');
    // default: gap = 1/3 of the bead pitch (course example: Ø15 -> 5), rounded to 0.5 mm
    if (gap == null) gap = Math.max(1, Math.round(per / n / 3 * 2) / 2);
    if (!(gap >= 0 && gap < per / n)) throw new Error(`La separación tiene que ser menor que ${(per / n).toFixed(2)} (π·d / n)`);
    const pitch = Math.ceil(per / n * 100) / 100;   // rounded UP so SolidWorks counts n beads, not n+1
    const l = +(pitch - gap).toFixed(2);
    return { n, l, gap, pitch, a, perimeter: +per.toFixed(2), total: +(n * l).toFixed(2) };
  }

  // ---- shaft + pulley join (course convention: hub = 0.6 x seat rounded down to 5, key = longest length <= hub - 5)
  function suggest(d, seat, k, m) {
    const pool = k.lens || DIN_LEN.filter(x => x >= ({ 45: 125, 50: 140 }[k.b] || 0));
    const bmax = Math.floor((seat - m - 5) / 5) * 5;   // the hub must leave room for the groove
    const B = Math.max(Math.floor(seat * 0.6 / 5) * 5, pool[0] + 5);
    if (B > bmax) return { hub: bmax, key: null, short: DIN_LEN.filter(x => x >= k.b && x <= bmax - 5).pop() ?? null, pool0: pool[0] };   // form A: L >= b
    return { hub: B, key: pool.filter(x => x <= B - 5).pop() };
  }
  function spec(d, seat) {
    const key = keyFor(d), circlip = circlipFor(d);
    return {
      d, key, circlip, weld: weld(d), chord: chordRef(d, key.b, key.t2),
      od: Math.round((d < 30 ? d * 10 / 3 : 2 * d) / 5) * 5,
      join: seat > 0 ? suggest(d, seat, key, circlip ? circlip.m : 2) : null,
    };
  }

  const api = { IT, LETTERS, KEY_FITS, DIN_LEN, it, dev, fit, mm, keyFor, chordRef, circlipFor, weld, spec };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DI = api;
})(this);
