(function (root) {
  const num = (v) => typeof v === "number" && isFinite(v);

  function subset(films, st) {
    const out = [];
    const wants = (st.genres || []).map((g) => g.toLowerCase());
    for (let i = 0; i < films.length; i++) {
      const f = films[i];
      const y = f[1];
      if (!num(y) || y < st.lo || y > st.hi + 9) continue;
      if (wants.length) {
        const g = (f[2] || "").toLowerCase();
        let hit = false;
        for (let k = 0; k < wants.length; k++) {
          if (g.indexOf(wants[k]) >= 0) { hit = true; break; }
        }
        if (!hit) continue;
      }
      if (st.minVotes > 0 && !(num(f[4]) && f[4] >= st.minVotes)) continue;
      out.push(f);
    }
    return out;
  }

  function median(a) {
    if (!a.length) return null;
    const b = a.slice().sort((x, y) => x - y);
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
  }

  function kpis(films, st) {
    const d = subset(films, st);
    let rated = 0, sum = 0;
    const votes = [];
    for (const f of d) {
      if (num(f[3])) { rated++; sum += f[3]; }
      if (num(f[4])) votes.push(f[4]);
    }
    const span = Math.max(1, Math.floor((st.hi - st.lo) / 10) + 1);
    return {
      n: d.length,
      rated: rated,
      mean: rated ? sum / rated : null,
      medVotes: median(votes),
      perDecade: d.length / span,
    };
  }

  function byDecade(films, st) {
    const acc = new Map();
    for (const f of subset(films, st)) {
      const dec = Math.floor(f[1] / 10) * 10;
      let a = acc.get(dec);
      if (!a) { a = { n: 0, r: 0, k: 0 }; acc.set(dec, a); }
      a.n++;
      if (num(f[3])) { a.r += f[3]; a.k++; }
    }
    const decades = Array.from(acc.keys()).sort((x, y) => x - y);
    return {
      decades: decades,
      films: decades.map((d) => acc.get(d).n),
      rating: decades.map((d) => (acc.get(d).k ? acc.get(d).r / acc.get(d).k : null)),
    };
  }

  function quadrant(films, st) {
    const x = [], y = [], t = [], meds = { v: 0, r: 0 };
    const rv = [], rr = [];
    for (const f of subset(films, st)) {
      if (!num(f[3]) || !num(f[4])) continue;
      rv.push(f[4]); rr.push(f[3]);
    }
    meds.v = median(rv);
    meds.r = median(rr);
    for (const f of subset(films, st)) {
      if (!num(f[3]) || !num(f[4])) continue;
      x.push(Math.max(f[4], 10));
      y.push(f[3]);
      t.push(f[0] + " (" + Math.trunc(f[1]) + ")");
    }
    return { x: x, y: y, text: t, medVotes: meds.v, medRating: meds.r };
  }

  function tableRows(films, st) {
    const rows = subset(films, st).filter((f) => num(f[3]));
    rows.sort((a, b) => (num(b[4]) ? b[4] : -1) - (num(a[4]) ? a[4] : -1));
    return rows.slice(0, 60);
  }

  function genreWindow(gd, lo, hi) {
    const idx = gd.decades.map((d, i) => (d >= lo && d <= hi ? i : -1)).filter((i) => i >= 0);
    return {
      decades: idx.map((i) => gd.decades[i]),
      series: Object.keys(gd.share).map((g) => ({
        genre: g,
        values: idx.map((i) => gd.share[g][i]),
      })),
    };
  }

  const api = { subset, median, kpis, byDecade, quadrant, tableRows, genreWindow, num };
  root.HKLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

