import { useState, useEffect, useRef } from "react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.fxb-root {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #2A2520;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 2400px;
  font-family: 'Crimson Pro', Georgia, serif;
  color: #1C1916;
  user-select: none;
  overflow: hidden;
}

.fxb-book {
  position: relative;
  width: min(100vw, 1200px);
  height: min(100vh, 820px);
  box-shadow: 0 60px 120px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.04);
  overflow: hidden;
  border-radius: 2px;
}

.fxb-page {
  position: absolute;
  inset: 0;
  background: #F4EFE4;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateX(100%);
  transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
  will-change: transform;
}

.fxb-page.active { transform: translateX(0); z-index: 2; }
.fxb-page.prev  { transform: translateX(-100%); z-index: 1; }

.fxb-page.active::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, rgba(0,0,0,0.08));
  pointer-events: none;
  z-index: 10;
}

.fxb-page::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 50px;
  background: linear-gradient(to right, rgba(0,0,0,0.10), transparent);
  pointer-events: none;
  z-index: 10;
}

.fxb-texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

.fxb-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 48px 72px 40px 80px;
  overflow: hidden;
  position: relative;
}

.fxb-inner > * { position: relative; z-index: 1; }

.fxb-hdr {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #C8BAA6;
  margin-bottom: 36px;
  flex-shrink: 0;
}

.fxb-doc { font-family: 'Crimson Pro', serif; font-size: 13px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #4A403A; }
.fxb-pnum { font-family: 'Cormorant Garamond', serif; font-size: 13px; font-style: italic; color: #4A403A; letter-spacing: 0.08em; }

.fxb-kicker { font-family: 'Crimson Pro', serif; font-size: 12px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: #3D5E42; margin-bottom: 12px; }

.fxb-h2 {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  font-size: clamp(26px, 3.4vw, 44px);
  line-height: 1.1;
  color: #1C1916;
  letter-spacing: -0.01em;
  margin-bottom: 20px;
}

.fxb-lead {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(17px, 2.1vw, 22px);
  font-weight: 400;
  font-style: italic;
  line-height: 1.55;
  color: #1C1916;
  margin-bottom: 24px;
  max-width: 700px;
}

.fxb-body {
  font-family: 'Crimson Pro', serif;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.72;
  color: #1C1916;
  max-width: 680px;
}

.fxb-body p { margin-bottom: 14px; }
.fxb-body strong { font-weight: 600; color: #1C1916; }

.fxb-rule { border: none; border-top: 1px solid #C8BAA6; margin: 22px 0; }

.fxb-pq {
  border-left: 3px solid #9A7B2E;
  padding: 10px 0 10px 22px;
  margin: 20px 0;
}
.fxb-pq p { font-family: 'Cormorant Garamond', serif; font-size: clamp(16px, 1.9vw, 20px); font-style: italic; line-height: 1.5; color: #1C1916; margin: 0; }
.fxb-pq cite { display: block; font-family: 'Crimson Pro', serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #4A403A; margin-top: 8px; font-style: normal; }

.fxb-scroll { overflow-y: auto; overflow-x: hidden; scrollbar-width: none; flex: 1; }
.fxb-scroll::-webkit-scrollbar { display: none; }

.fxb-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }

.fxb-data-row { display: flex; gap: 28px; flex-wrap: wrap; margin: 18px 0; }
.fxb-dc { display: flex; flex-direction: column; gap: 4px; min-width: 110px; }
.fxb-dc .num { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 3.4vw, 44px); font-weight: 300; color: #3D5E42; line-height: 1; letter-spacing: -0.02em; }
.fxb-dc .lbl { font-family: 'Crimson Pro', serif; font-size: 13px; font-weight: 600; letter-spacing: 0.13em; text-transform: uppercase; color: #4A403A; }

.fxb-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 30px; margin-top: 12px; }
.fxb-rc { border-top: 2px solid #DDD3BE; padding-top: 14px; }
.fxb-rc .ag { font-family: 'Crimson Pro', serif; font-size: 12px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #1B3A5C; margin-bottom: 6px; }
.fxb-rc .rn { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 400; color: #1C1916; margin-bottom: 6px; line-height: 1.2; }
.fxb-rc .rd { font-family: 'Crimson Pro', serif; font-size: 15px; font-weight: 400; line-height: 1.55; color: #1C1916; }

.fxb-ws-row { display: flex; gap: 20px; margin-top: 12px; }
.fxb-wc { flex: 1; background: #DDD3BE; padding: 18px 20px; border-top: 3px solid #3D5E42; }
.fxb-wc .wn { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: #3D5E42; line-height: 1; margin-bottom: 6px; }
.fxb-wc .wt { font-family: 'Crimson Pro', serif; font-size: 13px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #1C1916; margin-bottom: 10px; }
.fxb-wc .wd { font-family: 'Crimson Pro', serif; font-size: 15px; font-weight: 400; color: #1C1916; line-height: 1.55; }

.fxb-budget { width: 100%; border-collapse: collapse; font-family: 'Crimson Pro', serif; font-size: 15px; margin-top: 8px; }
.fxb-budget thead th { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #4A403A; text-align: left; padding: 0 12px 10px 0; border-bottom: 1.5px solid #C8BAA6; font-weight: 600; }
.fxb-budget tbody td { padding: 8px 12px 8px 0; border-bottom: 1px solid #EAE2D2; color: #1C1916; vertical-align: top; line-height: 1.4; }
.fxb-budget tbody tr:last-child td, .fxb-budget tbody tr:nth-last-child(2) td { border-bottom: 1px solid #C8BAA6; }
.fxb-budget tbody tr:last-child td { font-weight: 600; color: #1C1916; padding-top: 12px; border-bottom: none; }
.fxb-budget .amt { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

.fxb-risk-list { list-style: none; margin-top: 8px; }
.fxb-ri { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #EAE2D2; align-items: flex-start; }
.fxb-rind { flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; }
.fxb-rind.hi { background: #7A2E2E; }
.fxb-rind.me { background: #9A7B2E; }
.fxb-rind.lo { background: #3D5E42; }
.fxb-rname { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; color: #1C1916; margin-bottom: 4px; }
.fxb-rmit { font-family: 'Crimson Pro', serif; font-size: 14.5px; font-weight: 400; color: #4A403A; line-height: 1.55; }

.fxb-kpi-list { list-style: none; margin-top: 8px; }
.fxb-ki { display: flex; justify-content: space-between; align-items: baseline; padding: 11px 0; border-bottom: 1px solid #EAE2D2; gap: 14px; }
.fxb-kn { font-family: 'Crimson Pro', serif; font-size: 16px; font-weight: 500; color: #1C1916; line-height: 1.3; }
.fxb-kt { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 500; color: #3D5E42; white-space: nowrap; flex-shrink: 0; }

.fxb-tl { display: flex; margin-top: 20px; position: relative; }
.fxb-tl::before { content: ''; position: absolute; top: 18px; left: 12px; right: 12px; height: 1px; background: #C8BAA6; z-index: 0; }
.fxb-ti { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
.fxb-td { width: 12px; height: 12px; border-radius: 50%; background: #DDD3BE; border: 2px solid #C8BAA6; margin-bottom: 12px; flex-shrink: 0; }
.fxb-td.on { background: #3D5E42; border-color: #3D5E42; }
.fxb-tlabel { font-family: 'Crimson Pro', serif; font-size: 13px; font-weight: 600; text-align: center; color: #1C1916; line-height: 1.4; padding: 0 4px; }
.fxb-tsub { font-size: 12px; color: #4A403A; font-weight: 500; letter-spacing: 0.06em; }

.fxb-steps { margin-top: 12px; }
.fxb-step { display: flex; gap: 18px; padding: 13px 0; border-bottom: 1px solid #EAE2D2; align-items: flex-start; }
.fxb-snum { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 300; color: #DDD3BE; line-height: 1; flex-shrink: 0; width: 36px; }
.fxb-stitle { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 500; color: #1C1916; margin-bottom: 4px; }
.fxb-sdesc { font-family: 'Crimson Pro', serif; font-size: 15px; font-weight: 400; color: #1C1916; line-height: 1.5; }

/* ── COVER ── */
.fxb-cv { display: flex; height: 100%; }
.fxb-cvl { flex: 0 0 58%; padding: 56px 56px 44px 76px; display: flex; flex-direction: column; justify-content: space-between; background: #F4EFE4; position: relative; }
.fxb-cvr { flex: 0 0 42%; background: #3D5E42; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 44px 38px; }
.fxb-cvr::before { content: ''; position: absolute; inset: 0; background-image: repeating-linear-gradient(45deg,transparent,transparent 28px,rgba(255,255,255,0.025) 28px,rgba(255,255,255,0.025) 30px); }
.fxb-sun { position: absolute; top: -80px; right: -80px; width: 420px; height: 420px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.08); background: radial-gradient(circle at 60% 40%, rgba(202,168,76,0.18) 0%, transparent 70%); }
.fxb-sun::after { content: ''; position: absolute; top: 60px; left: 60px; right: 60px; bottom: 60px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.05); }
.fxb-crt { position: relative; z-index: 1; color: rgba(255,255,255,0.9); }
.fxb-crl { font-family: 'Crimson Pro', serif; font-size: 12px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 4px; margin-top: 20px; }
.fxb-crl:first-child { margin-top: 0; }
.fxb-crs { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 4.8vw, 60px); font-weight: 300; color: white; line-height: 1; margin-bottom: 4px; }
.fxb-crd { font-family: 'Crimson Pro', serif; font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.7); line-height: 1.45; max-width: 200px; }
.fxb-cvtitle { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(42px, 5.5vw, 70px); line-height: 1.0; color: #1C1916; letter-spacing: -0.02em; margin: 22px 0 8px; }
.fxb-cvtitle em { font-style: italic; color: #3D5E42; }
.fxb-cvsub { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-style: italic; font-weight: 400; color: #3A342D; line-height: 1.45; max-width: 360px; margin-bottom: 22px; }
.fxb-cvey { font-family: 'Crimson Pro', serif; font-size: 12px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase; color: #3D5E42; }
.fxb-cvdr { font-family: 'Crimson Pro', serif; font-size: 13px; font-weight: 500; color: #4A403A; letter-spacing: 0.08em; margin-top: 4px; }
.fxb-cvgeo { display: flex; align-items: center; gap: 12px; font-family: 'Crimson Pro', serif; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: #9A7B2E; }
.fxb-cvgeo::before { content: ''; display: block; width: 28px; height: 1px; background: #9A7B2E; }
.fxb-partners { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
.fxb-pbadge { font-family: 'Crimson Pro', serif; font-size: 13px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #3D5040; }
.fxb-psep { color: #C8BAA6; }

/* ── CLOSING PAGE ── */
.fxb-ask { margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 24px; }
.fxb-askamt { font-family: 'Cormorant Garamond', serif; font-size: clamp(44px, 5.5vw, 78px); font-weight: 300; color: #C9A84C; letter-spacing: -0.02em; line-height: 1; margin-bottom: 8px; }
.fxb-asklbl { font-family: 'Crimson Pro', serif; font-size: 14px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
.fxb-cpbadge { border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; font-family: 'Crimson Pro', serif; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.5); }

/* ── NAV ── */
.fxb-nav {
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: min(100vw, 1200px);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 0 20px;
  z-index: 100;
  pointer-events: none;
}
.fxb-arr { pointer-events: all; background: rgba(28,25,22,0.4); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); cursor: pointer; padding: 10px 18px; font-family: 'Cormorant Garamond', serif; font-size: 18px; letter-spacing: 0.08em; transition: all 0.25s ease; backdrop-filter: blur(4px); line-height: 1; }
.fxb-arr:hover { background: rgba(28,25,22,0.75); color: rgba(255,255,255,0.9); border-color: rgba(255,255,255,0.4); }
.fxb-arr:disabled { opacity: 0.2; cursor: not-allowed; }
.fxb-nav-mid { pointer-events: all; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.fxb-dots { display: flex; gap: 5px; }
.fxb-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.25); cursor: pointer; transition: all 0.2s ease; border: none; padding: 0; }
.fxb-dot.on { background: rgba(255,255,255,0.8); transform: scale(1.3); }
.fxb-navlbl { font-family: 'Crimson Pro', serif; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.45); }

@media (max-width: 768px) {
  .fxb-inner { padding: 28px 28px 24px 36px; }
  .fxb-cvl { padding: 36px 28px 28px 36px; }
  .fxb-2col { grid-template-columns: 1fr; gap: 16px; }
  .fxb-role-grid { grid-template-columns: 1fr; }
  .fxb-ws-row { flex-direction: column; }
  .fxb-h2 { font-size: clamp(20px, 5vw, 30px); }
  .fxb-lead { font-size: clamp(14px, 3.5vw, 18px); }
  .fxb-root { height: auto; min-height: 100svh; }
  .fxb-book { height: 78vw; min-height: 500px; }
  .fxb-nav { position: relative; bottom: auto; left: auto; transform: none; width: 100%; padding: 12px 16px; background: rgba(28,25,22,0.85); display: flex; justify-content: space-between; align-items: center; }
}
`;

const PAGE_LABELS = [
  "Cover","Executive Summary","Problem Context","Strategic Framework",
  "Multi-Agency Roles","Program Implementation","Cultural Adaptation",
  "Impact Projection","Funding Structure","Risk + Mitigation",
  "Scalability Model","Monitoring + Evaluation","Partnership Value","The Ask"
];

const HDR = ({ num, section }) => (
  <div className="fxb-hdr">
    <span className="fxb-doc">Cociner@s Solares · SHE / FXB Partnership</span>
    <span className="fxb-pnum">{num} · {section}</span>
  </div>
);

export default function CocinerosSolares() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]     = useState(null);
  const [busy, setBusy]     = useState(false);
  const touchX              = useRef(0);
  const TOTAL               = 14;

  const goTo = (idx) => {
    if (idx === current || busy || idx < 0 || idx >= TOTAL) return;
    setPrev(current);
    setCurrent(idx);
    setBusy(true);
    setTimeout(() => { setPrev(null); setBusy(false); }, 700);
  };

  const flip = (d) => goTo(current + d);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") flip(1);
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   flip(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const cls = (i) => {
    let c = "fxb-page";
    if (i === current) c += " active";
    else if (i === prev) c += " prev";
    return c;
  };

  const tr = (i) => {
    if (i === current) return "translateX(0)";
    if (i === prev)    return "translateX(-100%)";
    return i < current ? "translateX(-100%)" : "translateX(100%)";
  };

  const budgetRows = [
    ["SHE Project Management",        "$40,000 annual @ 20% time",                           "$8,000"],
    ["SHE Technical Consultant",      "$30/hr × 162 hours annually",                         "$4,860"],
    ["Project Director (Local)",      "$1,500/month × 12 months, Oaxaca",                    "$18,000"],
    ["Community Promoter",            "$500/month × 12 months",                              "$6,000"],
    ["International Travel",          "DC → Oaxaca, 1 round trip + 6-day per diem",          "$1,645"],
    ["Equipment — 100 Solar Ovens",   "$58/unit incl. assembly, shipping, 16% import tax",   "$5,800"],
    ["Training Workshops (4)",        "Remote communities scenario, 100 recipients",         "$3,600"],
    ["Subtotal",                      "",                                                    "$47,905"],
    ["SHE Overhead @ 10%",            "",                                                     "$4,790"],
    ["Total Year 1",                  "",                                                    "$52,695"],
  ];

  const risks = [
    { lv:"hi", name:"Cultural Resistance to Technology Change",    mit:"Mitigation: Immersive live cooking demonstrations with traditional Oaxacan dishes; community scouting prior to all workshops; promoter selection from within the community; complementary (not replacement) framing. Social proof architecture embedded throughout curriculum." },
    { lv:"me", name:"Seasonal + Climatic Variation",               mit:"Mitigation: Program explicitly frames solar cooking as a seasonal complement. Rainy season and low-insolation periods acknowledged in training. Usage monitored quarterly with dynamic adjustments to expectations and metrics." },
    { lv:"me", name:"Logistical Complexity — Remote Regions",      mit:"Mitigation: Two-day workshop format consolidates travel costs for coastal and Istmo communities. Vehicle insurance and maintenance budgeted. Project Director holds 14 years of established community relationships across Oaxaca's regions." },
    { lv:"lo", name:"Equipment Durability + Supply Chain",         mit:"Mitigation: Years 2–3 provisions include parts replacement. SHE R&D pipeline may introduce enhanced designs. Import tax and assembly already in Year 1 per-unit pricing ($58/unit). Local fabrication initiative underway as long-term supply alternative." },
    { lv:"lo", name:"Data Quality + Measurement Accuracy",         mit:"Mitigation: Analyst site visit deepens on-the-ground understanding. Quarterly data cycles allow methodology refinement. Evaluation aligned with Clean Cooking Alliance standards. Surveys designed collaboratively by Project Director and Technical Analyst." },
  ];

  const kpis = [
    ["Rate of solar oven adoption — frequency of use per household per week",               "Target: ≥ 4×/week"],
    ["Reduction in firewood + LP gas consumption vs. baseline",                             "Target: 35–50%"],
    ["Estimated carbon emissions reduced per household per year",                           "Target: Calculated"],
    ["Self-reported improvement in indoor air quality and health",                          "Quarterly Survey"],
    ["Household income generated from solar-cooked product sales",                         "Track per Cohort"],
    ["Social spread — households using ovens not direct recipients",                        "Promoter Reports"],
    ["Promoter visit completion rate per community",                                        "Monthly: 100%"],
  ];

  return (
    <>
    <div
      className="fxb-root"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e)   => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) flip(dx < 0 ? 1 : -1); }}
    >
      <style>{STYLES}</style>

      <div className="fxb-book">

        {/* ── PAGE 1: COVER ── */}
        <div className={cls(0)} style={{ transform: tr(0) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner" style={{ padding: 0 }}>
            <div className="fxb-cv">
              <div className="fxb-cvl">
                <div>
                  <div className="fxb-cvey">Multi-Agency Development Proposal</div>
                  <div className="fxb-cvdr">SHE — FXB Partnership · Oaxaca, México · March 2020</div>
                </div>
                <div>
                  <h1 className="fxb-cvtitle">Cociner<em>@</em>s<br />Solares</h1>
                  <p className="fxb-cvsub">A multi-actor solar cooking intervention for rural communities of Oaxaca — reducing energy poverty, improving indoor air quality, and empowering women through clean technology adoption.</p>
                  <div className="fxb-cvgeo">Oaxaca · Mexico · Year 1 Pilot</div>
                </div>
                <div>
                  <hr className="fxb-rule" />
                  <div className="fxb-partners">
                    <span className="fxb-pbadge">Solar Household Energy</span>
                    <span className="fxb-psep">&amp;</span>
                    <span className="fxb-pbadge">FXB International</span>
                  </div>
                </div>
              </div>
              <div className="fxb-cvr">
                <div className="fxb-sun" />
                <div className="fxb-crt">
                  <div className="fxb-crl">Year One Target</div>
                  <div className="fxb-crs">100</div>
                  <div className="fxb-crd">households reached across rural Oaxacan communities</div>
                  <div className="fxb-crl">Program Investment</div>
                  <div className="fxb-crs">$52,695</div>
                  <div className="fxb-crd">total Year 1 budget with 10% overhead included</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 2: EXECUTIVE SUMMARY ── */}
        <div className={cls(1)} style={{ transform: tr(1) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="ii" section="Executive Summary" />
            <div className="fxb-kicker">Executive Summary</div>
            <h2 className="fxb-h2">A coordinated intervention<br />at the intersection of<br />energy, health, and culture.</h2>
            <p className="fxb-lead">This proposal presents a structured, multi-agency pilot program to deploy Haines solar cooking technology across 100 rural households in Oaxaca, Mexico — in partnership with FXB International and Solar Household Energy, Inc.</p>
            <hr className="fxb-rule" />
            <div className="fxb-2col" style={{ gap: "48px" }}>
              <div className="fxb-body">
                <p>Oaxaca holds one of Mexico's highest insolation rates alongside deep rural poverty. Women and children in these communities spend 3–7 hours daily exposed to toxic combustion byproducts from traditional wood-fire cooking — a public health crisis with documented links to respiratory illness, premature birth, and lung cancer.</p>
                <p>The Cociner@s Solares program combines <strong>hardware deployment</strong> (100 Haines solar ovens), <strong>structured training workshops</strong>, and <strong>ongoing community promoter support</strong> to achieve measurable adoption of clean cooking technology over a 12-month pilot cycle.</p>
              </div>
              <div className="fxb-data-row" style={{ flexDirection:"column", gap:"16px" }}>
                {[["100","Households Targeted"],["3–4","Workshops per Cohort"],["35–50%","Projected Fuel Reduction"],["$52,695","Year 1 Total Budget"]].map(([n,l],i)=>(
                  <div key={i} className="fxb-dc"><span className="num">{n}</span><span className="lbl">{l}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 3: PROBLEM CONTEXT ── */}
        <div className={cls(2)} style={{ transform: tr(2) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="1" section="Problem Context" />
            <div className="fxb-kicker">The Problem</div>
            <h2 className="fxb-h2">Firewood, poverty, and<br />2 tonnes of smoke<br />per household, per year.</h2>
            <div className="fxb-scroll">
              <p className="fxb-lead">Oaxaca sits among Mexico's most sun-rich and economically vulnerable states. Its rural communities share a centuries-old dependence on wood and charcoal — a practice that is simultaneously cultural, economic, and catastrophic.</p>
              <div className="fxb-pq">
                <p>"The causes of high firewood consumption in the Central Valleys are tied not only to custom but to the ease of access and low cost compared to LP gas — a practice directly linked to deforestation, soil erosion, and degraded hydrological capacity."</p>
                <cite>— Secretaría de Finanzas, Oaxaca (2008)</cite>
              </div>
              <div className="fxb-body">
                <p>Combustion byproducts from traditional fogones include documented carcinogens and respiratory irritants linked to acute infections, adverse birth outcomes, chronic obstructive lung disease, and pulmonary tuberculosis. Women and children bear the highest exposure — spending 3 to 7 hours per day in smoke-filled interiors during most of their lives.</p>
                <p>Rising LP gas prices, supply irregularities in remote areas, and depleting local forest stocks have created a structural opening: rural communities are increasingly receptive to alternatives — making this a timely, feasible moment for solar cooking technology introduction.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 4: STRATEGIC FRAMEWORK ── */}
        <div className={cls(3)} style={{ transform: tr(3) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="2" section="Strategic Framework" />
            <div className="fxb-kicker">Strategic Architecture</div>
            <h2 className="fxb-h2">Technology deployed<br />within a system<br />of sustained adoption.</h2>
            <p className="fxb-lead">Distributing solar ovens alone does not produce lasting change. This program is structured as a three-layer intervention: equipment, education, and embedded community support.</p>
            <div className="fxb-tl">
              {[
                { lbl: ["Equipment","Deployment"],  sub: "100 Haines Units", on: true },
                { lbl: ["Workshop","Series"],        sub: "3–4 Sessions",    on: true },
                { lbl: ["Promoter","Network"],       sub: "Monthly Visits",  on: true },
                { lbl: ["Quarterly","Data Review"],  sub: "Dynamic Refinement", on: true },
                { lbl: ["Years 2–3","Expansion"],    sub: "Scaled Replication",  on: false },
              ].map((item, i) => (
                <div key={i} className="fxb-ti">
                  <div className={`fxb-td${item.on ? " on" : ""}`} />
                  <div className="fxb-tlabel">
                    {item.lbl[0]}<br />{item.lbl[1]}<br /><span className="fxb-tsub">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            <hr className="fxb-rule" style={{ marginTop:"28px" }} />
            <div className="fxb-body" style={{ marginTop:"16px" }}>
              <p>The Haines solar oven requires only 2–3 hours of direct sunlight to cook a full meal — available to every rural household with an exterior courtyard. Slow-cooking preserves nutrients, prevents burning, and frees women from fire-tending, enabling productive activity outside the home during cooking hours.</p>
              <p>The program is explicitly designed as a <strong>complement</strong> to traditional cooking, not a replacement — reducing dependency on firewood during peak solar hours while respecting seasonal, cultural, and climatic realities.</p>
            </div>
          </div>
        </div>

        {/* ── PAGE 5: MULTI-AGENCY ROLES ── */}
        <div className={cls(4)} style={{ transform: tr(4) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="3" section="Multi-Agency Roles" />
            <div className="fxb-kicker">Agency Architecture</div>
            <h2 className="fxb-h2">Each actor<br />in precise role.</h2>
            <div className="fxb-role-grid">
              {[
                { ag:"Solar Household Energy, Inc.", rn:"Technical Lead &\nProgram Management",       rd:"Manages financial operations, donor communications, graphic materials, and data analysis. The SHE Program Manager provides logistical support and disseminates findings to the global solar cooking community. Budget allocation: $8,000 (20% of $40K annual salary)." },
                { ag:"FXB International",             rn:"Community Infrastructure &\nVillage Integration",  rd:"Provides the existing FXB village network — holistic development sites across Oaxaca from which all program activities radiate. Solar cooking integrates into FXB's multi-domain community uplift model, ensuring cultural grounding and institutional trust." },
                { ag:"Project Director (Field)",      rn:"Lorena Harp Iturribarría\n— Oaxaca",          rd:"14 years of solar cooking expertise. Manages on-the-ground deployment, workshop facilitation, promoter supervision, community scouting, and liaison with UNAM research partners. Salary: $1,500/month. Prior: 1,500+ solar ovens distributed across Oaxaca." },
                { ag:"Community Promoters",            rn:"Local Adoption & Monitoring",                rd:"One promoter per community selected from within the village network. Conducts monthly household visits, applies usage questionnaires, tracks adoption patterns, and escalates support needs to the Project Director. Salary: $500/month." },
              ].map((c, i) => (
                <div key={i} className="fxb-rc">
                  <div className="ag">{c.ag}</div>
                  <div className="rn">{c.rn.split("\n").map((l,j)=><span key={j}>{l}{j===0&&<br/>}</span>)}</div>
                  <div className="rd">{c.rd}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PAGE 6: PROGRAM IMPLEMENTATION ── */}
        <div className={cls(5)} style={{ transform: tr(5) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="4" section="Program Implementation" />
            <div className="fxb-kicker">Workshop Model</div>
            <h2 className="fxb-h2">Three workshops.<br />One year of<br />embedded practice.</h2>
            <p className="fxb-lead">Each cohort of 20–25 women completes three structured workshop sessions spaced one month apart — ensuring adoption depth rather than surface exposure.</p>
            <div className="fxb-ws-row">
              {[
                { n:"I",   t:"Learning to Use My Solar Oven",       d:"Participants assemble their own Haines oven with promoter guidance. Five groups prepare traditional Oaxacan dishes. Health, economic, and environmental benefits presented alongside practical technique. Myths vs. realities addressed. Duration: 6 hours." },
                { n:"II",  t:"Preserves, Pastries & Income",         d:"Each woman brings her oven and assembles independently. Teams prepare conserves, sauces, and pastries with direct income potential. Cost accounting and profit margin instruction enables small business launch. Duration: 6 hours." },
                { n:"III", t:"Medicinal Salves & Organic Products",  d:"Advanced application of solar heat for herbal tinctures and medicinal pomades. Introduces traditional plant knowledge as viable small-enterprise sector. Products are topical, non-prescription, and commercially viable. Duration: 6 hours." },
              ].map((w, i) => (
                <div key={i} className="fxb-wc">
                  <div className="wn">{w.n}</div>
                  <div className="wt">{w.t}</div>
                  <div className="wd">{w.d}</div>
                </div>
              ))}
            </div>
            <div className="fxb-body" style={{ marginTop:"18px" }}>
              <p><strong>Near communities</strong> (Oaxaca Valley): 1-day format, groups of 20. <strong>Remote communities</strong> (Costa, Istmo de Tehuantepec): 2-day format, groups of 50 across two visits. All workshops include photographic documentation and social media dissemination coordinated with SHE and FXB.</p>
            </div>
          </div>
        </div>

        {/* ── PAGE 7: CULTURAL ADAPTATION ── */}
        <div className={cls(6)} style={{ transform: tr(6) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="5" section="Cultural Adaptation" />
            <div className="fxb-kicker">Cultural Integration Layer</div>
            <h2 className="fxb-h2">Tradition honored.<br />Technology introduced<br />through the kitchen.</h2>
            <p className="fxb-lead">The primary adoption challenge is not technical — it is cultural. Oaxaca's culinary traditions are ancient, precise, and deeply social. The intervention succeeds only if it enters these traditions with respect.</p>
            <div className="fxb-2col" style={{ gap:"44px" }}>
              <div className="fxb-body">
                <p><strong>Community Scouting:</strong> Before any workshop, the Project Director conducts direct fieldwork with community members and civil society partners, mapping prior technology exposure, trust networks, and cultural sensitivities. This prevents generic deployment and enables genuine local resonance.</p>
                <p><strong>The Taste Test Strategy:</strong> The most effective proof is flavor. Workshops demonstrate that traditional Oaxacan dishes — mole, tamales, frijoles — taste identical or better when solar-cooked. A woman who experiences this firsthand becomes the strongest possible advocate within her social network.</p>
              </div>
              <div className="fxb-body">
                <p><strong>Complementary Framing:</strong> The program never asks women to abandon traditional cooking. It positions solar cooking as an addition — active during 9am–4pm solar hours — while gas, wood, and traditional fogones remain available for evening cooking, rainy seasons, and cultural occasions where fire is ceremonially appropriate.</p>
                <p><strong>Social Proof Architecture:</strong> Promoters are recruited from within the communities they serve — familiar faces with established trust. Year 1 graduates become facilitators in Years 2–3, amplifying peer-to-peer adoption. Community leaders, not external technicians, drive behavioral change.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 8: IMPACT PROJECTION ── */}
        <div className={cls(7)} style={{ transform: tr(7) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="6" section="Impact Projection" />
            <div className="fxb-kicker">Projected Outcomes</div>
            <h2 className="fxb-h2">Health. Fuel. Carbon.<br />Income. Three years<br />of measurable change.</h2>
            <div className="fxb-data-row" style={{ marginBottom:"22px" }}>
              {[["2T","Annual Firewood Reduced per Household"],["35–50%","Projected Fuel Consumption Reduction"],["100","Households in Year 1 Pilot"],["$527","Estimated Cost per Household, Year 1"]].map(([n,l],i)=>(
                <div key={i} className="fxb-dc"><span className="num">{n}</span><span className="lbl">{l}</span></div>
              ))}
            </div>
            <hr className="fxb-rule" />
            <div className="fxb-2col" style={{ gap:"44px", marginTop:"16px" }}>
              <div className="fxb-body">
                <p><strong>Health Outcomes:</strong> Reduction of indoor combustion exposure — estimated at 3–7 hours daily for women and children — directly reduces incidence of acute respiratory infections, adverse birth outcomes, and chronic pulmonary conditions associated with biomass combustion.</p>
                <p><strong>Economic Outcomes:</strong> Decreased fuel expenditure generates direct household savings. Workshop curriculum includes income-generating product skills — jams, conserves, pastries, salves — providing supplemental revenue for women in low-income rural households.</p>
              </div>
              <div className="fxb-body">
                <p><strong>Environmental Outcomes:</strong> Each participating household reduces approximately 2 tonnes of annual firewood consumption. Across 100 households, Year 1 achieves an estimated 200 tonnes of avoided deforestation pressure, with proportional reductions in soil erosion and watershed degradation.</p>
                <p><strong>Carbon Accounting:</strong> Per-household carbon savings evaluated against Clean Cooking Alliance standards, with quarterly data cycles informing final Year 1 carbon reduction calculations — feeding directly into SHE's global R&amp;D and donor impact communications.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 9: FUNDING STRUCTURE ── */}
        <div className={cls(8)} style={{ transform: tr(8) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="7" section="Funding Structure" />
            <div className="fxb-kicker">Year 1 Budget Narrative</div>
            <h2 className="fxb-h2">A transparent budget<br />for a first-year<br />proof of concept.</h2>
            <p className="fxb-lead">A projected investment of $52,695 enables deployment of 100 Haines solar ovens, 4 workshops, 12 months of community promoter support, and a complete quarterly evaluation cycle aligned with Clean Cooking Alliance standards.</p>
            <table className="fxb-budget">
              <thead>
                <tr>
                  <th>Line Item</th>
                  <th>Description</th>
                  <th className="amt">Amount (USD)</th>
                </tr>
              </thead>
              <tbody>
                {budgetRows.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row[0]}</strong></td>
                    <td>{row[1]}</td>
                    <td className="amt">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PAGE 10: RISK + MITIGATION ── */}
        <div className={cls(9)} style={{ transform: tr(9) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="8" section="Risk + Mitigation" />
            <div className="fxb-kicker">Risk Analysis</div>
            <h2 className="fxb-h2">Known risks,<br />addressed by design.</h2>
            <div className="fxb-scroll">
              <ul className="fxb-risk-list">
                {risks.map((r, i) => (
                  <li key={i} className="fxb-ri">
                    <div className={`fxb-rind ${r.lv}`} />
                    <div>
                      <div className="fxb-rname">{r.name}</div>
                      <div className="fxb-rmit">{r.mit}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── PAGE 11: SCALABILITY ── */}
        <div className={cls(10)} style={{ transform: tr(10) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="9" section="Scalability Model" />
            <div className="fxb-kicker">Expansion Architecture</div>
            <h2 className="fxb-h2">From 100 families<br />to a state-wide<br />solar movement.</h2>
            <p className="fxb-lead">Oaxaca's exceptional insolation conditions make it a natural proving ground for replication across Mexico and the broader Latin American solar belt. This pilot is designed as a scalable template.</p>
            <div className="fxb-steps">
              {[
                { n:"01", t:"Year 1 — Pilot Validation",        d:"100 households across near and remote Oaxacan communities. Data collected quarterly. Program model refined. Community leader network seeded. Local fabrication scoping initiated." },
                { n:"02", t:"Years 2–3 — Regional Deepening",   d:"Continuation with existing cohorts plus expansion to new FXB villages. Promoter network scales. Year 1 graduates become facilitators. UNAM / IER research partnership formalized through Cocina Colaboratorio." },
                { n:"03", t:"Years 4+ — State-Level Replication",d:"Oaxaca becomes a model state for solar cooking adoption. Partnership with Abuelas Solares (Cachimbo) provides international proof-of-concept. Local Haines stove fabrication reduces per-unit cost. Additional Mexican states invited to replicate the model." },
              ].map((s, i) => (
                <div key={i} className="fxb-step">
                  <div className="fxb-snum">{s.n}</div>
                  <div><div className="fxb-stitle">{s.t}</div><div className="fxb-sdesc">{s.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PAGE 12: M&E ── */}
        <div className={cls(11)} style={{ transform: tr(11) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="10" section="Monitoring + Evaluation" />
            <div className="fxb-kicker">Monitoring + Evaluation Framework</div>
            <h2 className="fxb-h2">How we know<br />it's working.</h2>
            <p className="fxb-lead">Evaluation follows Clean Cooking Alliance standards, coordinated between the SHE Technical Analyst (Washington, D.C.) and the Project Director (Oaxaca), with quarterly reporting cycles and a final-year synthesis report.</p>
            <ul className="fxb-kpi-list">
              {kpis.map(([n, t], i) => (
                <li key={i} className="fxb-ki">
                  <span className="fxb-kn">{n}</span>
                  <span className="fxb-kt">{t}</span>
                </li>
              ))}
            </ul>
            <div className="fxb-body" style={{ marginTop:"16px" }}>
              <p>The Technical Analyst visits Oaxaca mid-project for an on-site evaluation that deepens understanding of ground conditions and informs Year 2/3 refinements. Data cycles feed directly back to workshop curriculum, promoter protocols, and budget formulation.</p>
            </div>
          </div>
        </div>

        {/* ── PAGE 13: PARTNERSHIP VALUE ── */}
        <div className={cls(12)} style={{ transform: tr(12) }}>
          <div className="fxb-texture" />
          <div className="fxb-inner">
            <HDR num="11" section="Partnership Value" />
            <div className="fxb-kicker">Why This Partnership Works</div>
            <h2 className="fxb-h2">Complementary strengths.<br />Aligned mission.<br />Shared constituencies.</h2>
            <div className="fxb-2col" style={{ gap:"48px", marginTop:"8px", overflow:"auto" }}>
              <div>
                <div className="fxb-body">
                  <p><strong>For FXB International:</strong> Solar cooking extends FXB's holistic village development model into the energy and health domains without new infrastructure investment. The program integrates naturally into FXB's existing community trust networks — and delivers measurable environmental outcomes that strengthen FXB's reporting to donors and institutional partners.</p>
                </div>
                <hr className="fxb-rule" />
                <div className="fxb-body">
                  <p><strong>For Solar Household Energy:</strong> FXB's village network provides pre-vetted, high-trust community access that would otherwise require years to develop. The multi-year program structure generates the longitudinal impact data that strengthens SHE's R&amp;D case and donor relationships globally.</p>
                </div>
              </div>
              <div>
                <div className="fxb-body">
                  <p><strong>For research institutions:</strong> The Cocina Colaboratorio linkage with UNAM and the Instituto de Energías Renovables creates an academic data-sharing layer that elevates scientific credibility and opens pathways to research funding. Quarterly datasets provide rigorous ground-truth for solar cooking adoption modeling across Mexico.</p>
                </div>
                <hr className="fxb-rule" />
                <div className="fxb-body">
                  <p><strong>For funders:</strong> This program offers a rare combination — proven technology, experienced field leadership, institutional infrastructure, and a three-year data commitment. The cost-per-household of approximately <strong>$527</strong> in Year 1 positions this as a high-impact, cost-competitive clean energy intervention relative to comparable programs globally.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAGE 14: THE ASK (dark) ── */}
        <div className={cls(13)} style={{ transform: tr(13) }}>
          <div className="fxb-texture" style={{ opacity: 0.15 }} />
          <div className="fxb-inner" style={{ background: "#1C1916" }}>
            <div className="fxb-hdr" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <span className="fxb-doc" style={{ color: "rgba(255,255,255,0.3)" }}>Cociner@s Solares · SHE / FXB Partnership</span>
              <span className="fxb-pnum" style={{ color: "rgba(255,255,255,0.3)" }}>12 · The Ask</span>
            </div>
            <div className="fxb-kicker" style={{ color: "#C9A84C" }}>Funding Request + Partnership Invitation</div>
            <h2 className="fxb-h2" style={{ color: "#F4EFE4" }}>Join us in bringing<br />the sun into<br />100 kitchens.</h2>
            <p className="fxb-lead" style={{ color: "rgba(244,239,228,0.85)" }}>This proposal requests full Year 1 funding support of $52,695 and continued partnership through a three-year program commitment that will generate the evidence base for solar cooking replication across Mexico and the Latin American region.</p>
            <div className="fxb-ask">
              <div className="fxb-askamt">$52,695</div>
              <div className="fxb-asklbl">Year 1 Full Program Budget — Solar Household Energy, Inc. + FXB International</div>
            </div>
            <div className="fxb-body" style={{ marginTop: "22px", color: "rgba(244,239,228,0.75)" }}>
              <p>A projected investment of $52,695 enables deployment of 100 Haines solar ovens, 4 structured training workshops, 12 months of community promoter support, quarterly evaluation cycles, and a full Year 1 impact report — reaching approximately 100 households and reducing an estimated 35–50% of their annual solid fuel consumption.</p>
              <p>We invite your organization to participate as a named partner in a program that is simultaneously a public health intervention, an environmental program, an economic empowerment initiative, and a cultural bridge — all delivered through one beautifully simple technology: the sun.</p>
            </div>
            <div style={{ display:"flex", gap:"16px", marginTop:"24px", flexWrap:"wrap" }}>
              {["Solar Household Energy, Inc.", "FXB International", "Oaxaca, México — 2020"].map((b, i) => (
                <span key={i} className="fxb-cpbadge">{b}</span>
              ))}
            </div>
          </div>
        </div>

      </div>{/* /book */}

      {/* ── NAVIGATION ── */}
      <div className="fxb-nav">
        <button className="fxb-arr" onClick={() => flip(-1)} disabled={current === 0}>← prev</button>
        <div className="fxb-nav-mid">
          <div className="fxb-dots">
            {PAGE_LABELS.map((_, i) => (
              <button key={i} className={`fxb-dot${i === current ? " on" : ""}`} onClick={() => goTo(i)} aria-label={`Page ${i+1}`} />
            ))}
          </div>
          <div className="fxb-navlbl">{PAGE_LABELS[current]}</div>
        </div>
        <button className="fxb-arr" onClick={() => flip(1)} disabled={current === TOTAL - 1}>next →</button>
      </div>

    </div>
  );
    <div style={{background:"#0f172a",color:"#94a3b8",fontSize:"11px",padding:"18px 32px",borderTop:"2px solid #1e293b",fontFamily:"monospace",lineHeight:1.7}}>
      <div style={{marginBottom:6,color:"#e2e8f0",fontWeight:700,fontSize:13,letterSpacing:1}}>PROJECT FOOTNOTE</div>
      <div><strong style={{color:"#f1f5f9"}}>Stack:</strong> React, JSX, CSS-in-JS (injected &lt;style&gt; tag), Cormorant Garamond + Crimson Pro fonts, CSS transforms</div>
      <div><strong style={{color:"#f1f5f9"}}>Methods:</strong> Interactive multi-page proposal document, page-flip animation, touch/keyboard navigation, solar cooking program data visualization, multi-agency partnership proposal design</div>
      <div><strong style={{color:"#f1f5f9"}}>Sources:</strong> FXB International + Solar Household Energy partnership proposal (Oaxaca, México, March 2020) — role: Program Analyst; data analysis, publication design, donor communications. Content from actual Cociner@s Solares proposal.</div>
    </div>
    </>
  );
}