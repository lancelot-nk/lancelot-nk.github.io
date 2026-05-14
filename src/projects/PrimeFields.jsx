import { useState, useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Complex Arithmetic ────────────────────────────────────────────
const C    = (re, im = 0) => ({ re, im });
const cadd = (a, b) => C(a.re + b.re, a.im + b.im);
const csub = (a, b) => C(a.re - b.re, a.im - b.im);
const cdiv = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  return d < 1e-20 ? C(0, 0) : C((a.re*b.re + a.im*b.im)/d, (a.im*b.re - a.re*b.im)/d);
};
const cabs = a => Math.sqrt(a.re*a.re + a.im*a.im);
const carg = a => Math.atan2(a.im, a.re);
const cexp = a => { const r = Math.exp(a.re); return C(r*Math.cos(a.im), r*Math.sin(a.im)); };

// n^{−s}: real n>0, complex s=a+ib → n^{−a}·(cos(b·ln n) − i·sin(b·ln n))
function ninvs(n, s) {
  const l = Math.log(n), r = Math.exp(-s.re * l);
  return C(r * Math.cos(s.im * l), -r * Math.sin(s.im * l));
}

// ζ(s) — direct sum + Euler–Maclaurin tail ∫_N^∞ x^{−s}dx = N^{1−s}/(s−1)
function zetaFn(s, N = 200) {
  let sr = 0, si = 0;
  for (let n = 1; n <= N; n++) { const c = ninvs(n, s); sr += c.re; si += c.im; }
  const lnN = Math.log(N), a = s.re, b = s.im;
  const t = Math.exp((1 - a) * lnN);
  const nRe = t * Math.cos(-b * lnN), nIm = t * Math.sin(-b * lnN);
  const dRe = a - 1, dIm = b, d2 = dRe*dRe + dIm*dIm;
  if (d2 > 1e-15) { sr += (nRe*dRe + nIm*dIm)/d2; si += (nIm*dRe - nRe*dIm)/d2; }
  const h = ninvs(N, s);
  return C(sr + 0.5*h.re, si + 0.5*h.im);
}

// ζ′(s) = −Σ ln(n)·n^{−s}
function zetaP(s, N = 200) {
  let sr = 0, si = 0;
  for (let n = 2; n <= N; n++) { const l = Math.log(n), c = ninvs(n, s); sr -= l*c.re; si -= l*c.im; }
  return C(sr, si);
}

// ζ″(s) = Σ (ln n)²·n^{−s}
function zetaPP(s, N = 200) {
  let sr = 0, si = 0;
  for (let n = 2; n <= N; n++) { const l = Math.log(n), c = ninvs(n, s); sr += l*l*c.re; si += l*l*c.im; }
  return C(sr, si);
}

const flr = Math.floor;
const fra = x => x - Math.floor(x);
const PRIMES = [2, 3, 5, 7, 11, 13];
const SERIES_COLORS = ["#3b82f6","#34d399","#f472b6","#fbbf24","#a78bfa","#f87171"];

// A(p,q)=p, D(p,q)=q (user-defined — interpreted as identity on inputs)
function computeAll(p, q) {
  const logterm = flr(q/p)*Math.log(p) - fra(q/p)*Math.log(q);

  const F = () => {
    const s = C(0.5, p + q);
    const ld = cdiv(zetaP(s), zetaFn(s));
    return cadd(cadd(csub(C(p+q), ld), C(1/p + 1/q + Math.sin(p*q))), C(logterm));
  };
  const F1 = () => {
    const Rp = 1 / (1 + Math.abs(Math.log(p/q)));
    const s1 = C(Rp, p/q + Math.sqrt(p*q));
    const ld = cdiv(zetaP(s1), zetaFn(s1));
    return cadd(cadd(csub(C(p*q), ld), C(1/p + 1/q + Math.sin(p*q))), C(logterm));
  };
  const F2 = () => {
    const s = C(0.5, p/q + Math.sqrt(p*q));
    const z = zetaFn(s), zp = zetaP(s), zpp = zetaPP(s);
    const ratio = csub(cdiv(zpp, zp), cdiv(zp, z));
    const W = Math.sin(p*q) * (1/p + 1/q);
    return cadd(cadd(csub(C(p+q), ratio), C(W)), C(logterm));
  };
  const F3 = () => {
    const s = C(0.5, p/q + Math.sqrt(p*q));
    const ld = cdiv(zetaP(s), zetaFn(s));
    const E = logterm;
    const bracket = csub(C(Math.log(p+q)), ld);
    const W3 = cdiv(cexp(C(0, Math.sin(p*q))), C(Math.max(p,q)));
    return cadd(C(E*bracket.re, E*bracket.im), W3);
  };

  return [F(), F1(), F2(), F3()];
}

const FN_LABELS   = ["F(p,q)", "F₁(p,q)", "F₂(p,q)", "F₃(p,q)"];
const FN_COLORS   = ["#3b82f6","#34d399","#f472b6","#fbbf24"];
const FN_S_DESC   = [
  "s = ½+i(p+q)",
  "s₁ = R_prime + i(p/q+√pq)",
  "s = ½+i(p/q+√pq)",
  "s = ½+i(p/q+√pq)",
];
const FN_BRACKET  = [
  "(p+q) − ζ′/ζ(s)",
  "(p·q) − ζ′/ζ(s₁)  ·  R_prime=1/(1+|ln p/q|)",
  "(p+q) − (ζ″/ζ′ − ζ′/ζ)  ·  W=sin(pq)(1/p+1/q)",
  "E·[ln(p+q)−ζ′/ζ] + e^{i·sin(pq)}/max(p,q)  ·  E=⌊q/p⌋ ln p−{q/p} ln q",
];

// Custom glow dot
const GlowDot = (props) => {
  const { cx, cy, fill } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill={fill} fillOpacity={0.05} />
      <circle cx={cx} cy={cy} r={7}  fill={fill} fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={4}  fill={fill} fillOpacity={0.9} />
    </g>
  );
};

// Heatmap color: deep blue → cyan → yellow → red
function heatColor(v, min, max) {
  const t = max === min ? 0.5 : (v - min) / (max - min);
  const stops = [
    [0.00, [4,  10, 35]],
    [0.25, [15, 70,170]],
    [0.50, [15,175,155]],
    [0.75, [215,175, 35]],
    [1.00, [215, 38, 38]],
  ];
  let lo = stops[0], hi = stops[stops.length-1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i+1][0]) { lo = stops[i]; hi = stops[i+1]; break; }
  }
  const s = lo[0] === hi[0] ? 0 : (t - lo[0]) / (hi[0] - lo[0]);
  const lerp = (a,b) => Math.round(a + s*(b-a));
  return `rgb(${lerp(lo[1][0],hi[1][0])},${lerp(lo[1][1],hi[1][1])},${lerp(lo[1][2],hi[1][2])})`;
}

export default function App() {
  const [tab,  setTab]  = useState(0);
  const [view, setView] = useState("scatter");

  const raw = useMemo(() => {
    const rows = [];
    for (const p of PRIMES)
      for (const q of PRIMES)
        try { rows.push({ p, q, vals: computeAll(p, q) }); }
        catch(e) {}
    return rows;
  }, []);

  const series = useMemo(() =>
    PRIMES.map((p, pi) => ({
      color: SERIES_COLORS[pi],
      name: `p=${p}`,
      pts: raw.filter(r => r.p === p).map(r => {
        const v = r.vals[tab];
        if (!v || !isFinite(v.re) || !isFinite(v.im)) return null;
        return {
          x: +v.re.toFixed(4), y: +v.im.toFixed(4),
          m: +cabs(v).toFixed(4), arg: +carg(v).toFixed(4),
          p: r.p, q: r.q,
        };
      }).filter(Boolean),
    }))
  , [raw, tab]);

  const flat   = series.flatMap(s => s.pts);
  const mags   = flat.map(p => p.m);
  const maxM   = Math.max(...mags, 1);
  const minM   = Math.min(...mags, 0);

  // 6×6 grid of |F| values for heatmap
  const grid = useMemo(() => {
    const g = [];
    for (let qi = 0; qi < PRIMES.length; qi++) {
      const row = [];
      for (let pi = 0; pi < PRIMES.length; pi++) {
        const r = raw.find(r => r.p === PRIMES[pi] && r.q === PRIMES[qi]);
        if (!r) { row.push(null); continue; }
        const v = r.vals[tab];
        row.push(v && isFinite(v.re) ? +cabs(v).toFixed(3) : null);
      }
      g.push(row);
    }
    return g;
  }, [raw, tab]);

  const gridFlat = grid.flat().filter(Boolean);
  const gridMax  = Math.max(...gridFlat, 1);
  const gridMin  = Math.min(...gridFlat, 0);

  const BG     = "#04090f";
  const CARD   = "#06101c";
  const BORDER = "#0c1e30";
  const MUTED  = "#0d2035";
  const accent = FN_COLORS[tab];

  return (
    <div style={{ background: BG, color: "#e2e8f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; }
        .fn-tab { transition: all 0.18s ease; }
        .fn-tab:hover { border-color: #1e3a5f !important; color: #93c5fd !important; background: #08182a !important; }
        .view-toggle { transition: all 0.15s ease; }
        .view-toggle:hover { opacity: 0.75; }
      `}</style>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "32px 22px" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 8 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: -1.2, color: "#e2e8f0", lineHeight: 1 }}>
              Prime Field Functions
            </h1>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1e3a5f", letterSpacing: 3, textTransform: "uppercase", paddingBottom: 2 }}>
              ζ × primes
            </span>
          </div>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11.5, color: "#1e3a5f", lineHeight: 1.7 }}>
            All ordered pairs (p,q) ∈ {"{"}{PRIMES.join(", ")}{"}"}<sup>2</sup>
            &nbsp;·&nbsp; A(p,q)=p &nbsp;·&nbsp; D(p,q)=q
            &nbsp;·&nbsp; N=200 terms &nbsp;·&nbsp; Euler–Maclaurin corrected
          </p>
        </div>

        {/* ── Tab row ────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          {FN_LABELS.map((l, i) => (
            <button key={i} onClick={() => setTab(i)} className="fn-tab" style={{
              padding: "6px 16px", borderRadius: 6,
              border: `1px solid ${tab===i ? FN_COLORS[i]+"55" : BORDER}`,
              background: tab===i ? FN_COLORS[i]+"12" : CARD,
              color: tab===i ? FN_COLORS[i] : "#334155",
              fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
            }}>{l}</button>
          ))}
          <div style={{ flex: 1 }} />
          {[["scatter","ℂ-PLANE"],["grid","| F | GRID"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} className="view-toggle" style={{
              padding: "6px 12px", borderRadius: 6,
              border: `1px solid ${view===v ? "#1d4ed8" : BORDER}`,
              background: view===v ? "#0f1e38" : CARD,
              color: view===v ? "#60a5fa" : "#1e3a5f",
              fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: 1.5, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        {/* ── Equation bar ───────────────────────────────────── */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderLeft: `2px solid ${accent}`,
          borderRadius: "0 7px 7px 0", padding: "10px 16px", marginBottom: 18,
          fontFamily: "JetBrains Mono, monospace", fontSize: 11, lineHeight: 1.8, overflowX: "auto",
        }}>
          <span style={{ color: accent, fontWeight: 700 }}>{FN_LABELS[tab]}</span>
          <span style={{ color: "#1e3a5f" }}> = </span>
          <span style={{ color: "#1a3a57" }}>[</span>
          <span style={{ color: "#2a5a82" }}>{FN_BRACKET[tab]}</span>
          <span style={{ color: "#1a3a57" }}>] + (⌊q/p⌋ ln p − &#123;q/p&#125; ln q) &nbsp;</span>
          <span style={{ color: "#0d2035" }}>· {FN_S_DESC[tab]}</span>
        </div>

        {/* ── Main chart card ────────────────────────────────── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 16px 14px", marginBottom: 14 }}>

          {view === "scatter" ? (
            <>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: MUTED, textAlign: "center", marginBottom: 12, textTransform: "uppercase", letterSpacing: 2 }}>
                Complex Plane &nbsp;·&nbsp; Re(F) × Im(F) &nbsp;·&nbsp; colored by p
              </div>
              <ResponsiveContainer width="100%" height={440}>
                <ScatterChart margin={{ top: 12, right: 24, bottom: 36, left: 12 }}>
                  <CartesianGrid strokeDasharray="1 10" stroke="#050e18" />
                  <XAxis dataKey="x" name="Re" type="number" domain={["auto","auto"]}
                    tick={{ fill: "#0d1e30", fontSize: 9.5, fontFamily: "JetBrains Mono, monospace" }}
                    label={{ value: "Re(F)", position: "insideBottom", offset: -20, fill: "#1e3a5f", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
                  <YAxis dataKey="y" name="Im" type="number" domain={["auto","auto"]}
                    tick={{ fill: "#0d1e30", fontSize: 9.5, fontFamily: "JetBrains Mono, monospace" }}
                    label={{ value: "Im(F)", angle: -90, position: "insideLeft", offset: 16, fill: "#1e3a5f", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
                  <Tooltip cursor={false} content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "#020810", border: "1px solid #0f2a45", borderRadius: 8, padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.9, boxShadow: `0 0 24px ${accent}22` }}>
                        <div style={{ color: accent, fontWeight: 700, marginBottom: 3 }}>p={d.p}, q={d.q}</div>
                        <div style={{ color: "#1e3a5f" }}>Re = <span style={{ color: "#60a5fa" }}>{d.x}</span></div>
                        <div style={{ color: "#1e3a5f" }}>Im = <span style={{ color: "#34d399" }}>{d.y}</span></div>
                        <div style={{ color: "#1e3a5f" }}>|F| = <span style={{ color: "#fbbf24" }}>{d.m}</span></div>
                        <div style={{ color: "#1e3a5f" }}>arg = <span style={{ color: "#a78bfa" }}>{d.arg} rad</span></div>
                      </div>
                    );
                  }} />
                  {series.map(({ name, color, pts }) => (
                    <Scatter key={name} name={name} data={pts} fill={color} shape={<GlowDot />} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                {series.map(({ name, color }) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}88` }} />
                    <span style={{ color: "#1e3a5f" }}>{name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Magnitude heatmap */
            <>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: MUTED, textAlign: "center", marginBottom: 18, textTransform: "uppercase", letterSpacing: 2 }}>
                |F(p,q)| Heatmap &nbsp;·&nbsp; columns=p, rows=q
              </div>
              <div style={{ overflowX: "auto" }}>
                <svg viewBox="0 0 458 458" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
                  {/* p column labels */}
                  {PRIMES.map((p, pi) => (
                    <text key={pi} x={65 + pi*60 + 30} y={22} textAnchor="middle"
                      fill={SERIES_COLORS[pi]} fontSize={12}
                      fontFamily="JetBrains Mono, monospace" fontWeight={700}>{p}</text>
                  ))}
                  <text x={22} y={22} fill={MUTED} fontSize={9} fontFamily="JetBrains Mono, monospace">p →</text>

                  {/* q row labels */}
                  {PRIMES.map((q, qi) => (
                    <text key={qi} x={48} y={34 + qi*62 + 35} textAnchor="middle"
                      fill="#334155" fontSize={12} fontFamily="JetBrains Mono, monospace">{q}</text>
                  ))}
                  <text x={48} y={36 + 6*62 + 8} fill={MUTED} fontSize={9} fontFamily="JetBrains Mono, monospace" textAnchor="middle">q ↓</text>

                  {/* Cells */}
                  {grid.map((row, qi) =>
                    row.map((val, pi) => {
                      if (val === null) return null;
                      const col = heatColor(val, gridMin, gridMax);
                      const t = gridMax===gridMin ? 0.5 : (val-gridMin)/(gridMax-gridMin);
                      const textColor = t > 0.55 ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.65)";
                      return (
                        <g key={`${pi}-${qi}`}>
                          <rect x={65 + pi*60} y={32 + qi*62} width={56} height={56} rx={5}
                            fill={col} fillOpacity={0.9} />
                          <text x={65 + pi*60 + 28} y={32 + qi*62 + 32}
                            textAnchor="middle" dominantBaseline="middle"
                            fill={textColor} fontSize={10.5}
                            fontFamily="JetBrains Mono, monospace">{val.toFixed(2)}</text>
                        </g>
                      );
                    })
                  )}
                </svg>
              </div>
              {/* Color scale */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1e3a5f" }}>{gridMin.toFixed(2)}</span>
                <div style={{ width: 140, height: 8, borderRadius: 4, background: "linear-gradient(to right, rgb(4,10,35), rgb(15,70,170), rgb(15,175,155), rgb(215,175,35), rgb(215,38,38))" }} />
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1e3a5f" }}>{gridMax.toFixed(2)}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: MUTED, marginLeft: 4 }}>|F|</span>
              </div>
            </>
          )}
        </div>

        {/* ── Stats strip ────────────────────────────────────── */}
        {flat.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
              {[
                ["Pairs",   flat.length],
                ["Max |F|", Math.max(...mags).toFixed(3)],
                ["Min |F|", Math.min(...mags).toFixed(4)],
                ["⟨Re(F)⟩", (flat.reduce((s,p) => s+p.x, 0)/flat.length).toFixed(3)],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{lbl}</div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: "#c7d2fe" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Top pairs table */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, color: MUTED, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>
                Top 6 pairs by |F(p,q)|
              </div>
              {[...flat].sort((a, b) => b.m - a.m).slice(0, 6).map((d, i) => (
                <div key={`${d.p}-${d.q}-${i}`} style={{
                  display: "grid", gridTemplateColumns: "90px 1fr 1fr 110px",
                  gap: 8, padding: "7px 0",
                  borderBottom: i < 5 ? `1px solid ${BORDER}` : "none",
                  fontFamily: "JetBrains Mono, monospace", fontSize: 12, alignItems: "center",
                }}>
                  <span style={{ color: SERIES_COLORS[PRIMES.indexOf(d.p)], fontWeight: 700 }}>({d.p}, {d.q})</span>
                  <span style={{ color: "#1e3a5f" }}>Re = <span style={{ color: "#60a5fa" }}>{d.x}</span></span>
                  <span style={{ color: "#1e3a5f" }}>Im = <span style={{ color: "#34d399" }}>{d.y}</span></span>
                  <span style={{ color: "#fbbf24" }}>|F| = {d.m}</span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
