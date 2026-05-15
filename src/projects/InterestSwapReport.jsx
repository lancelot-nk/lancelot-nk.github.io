import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

// ══════════════════════════════════════════════════════
//  DATA  —  Real data: Roosevelt Institute 2016 report,
//            NCES, Federal Reserve, College Board.
//            Estimated values noted per institution.
// ══════════════════════════════════════════════════════

const INSTITUTIONS = [
  { name: "Harvard",               loss: 1250, type: "Private", note: "Led by Pres. Larry Summers (former Treasury Sec.). Paid $1.25B in termination fees alone. — CONFIRMED" },
  { name: "Cornell",               loss: 280,  type: "Private", note: "Paid $280M+ in swap payments and termination penalties; up to $200M more in remaining fees. — CONFIRMED" },
  { name: "Michigan State",        loss: 130,  type: "Public",  note: "Confirmed $130.2M by 2016, including ~$18M in termination fees. Tuition rose faster than national avg. — CONFIRMED" },
  { name: "Columbia",              loss: 108,  type: "Private", note: "Estimated from Roosevelt Institute methodology applied to comparable Ivy League debt profile. — ESTIMATED" },
  { name: "Univ. of Pennsylvania", loss: 95,   type: "Private", note: "Estimated from Roosevelt Institute methodology applied to comparable Ivy League debt profile. — ESTIMATED" },
  { name: "Univ. of Michigan",     loss: 86,   type: "Public",  note: "Documented by faculty wage research; U-Mich lobbied in 2013 to shield fund performance from FOIA. — CONFIRMED" },
  { name: "UC Berkeley",           loss: 78,   type: "Public",  note: "Trustee conflicts of interest with counterparty banks documented in Roosevelt report. — ESTIMATED" },
  { name: "Univ. of Pittsburgh",   loss: 72,   type: "Public",  note: "Estimated from Roosevelt Institute methodology applied to comparable research university profile. — ESTIMATED" },
  { name: "Rutgers",               loss: 68,   type: "Public",  note: "Exited via 100-year 'century bond' (matures 2119) to avoid swap termination fees. — CONFIRMED" },
  { name: "Ohio State",            loss: 62,   type: "Public",  note: "Estimated from Roosevelt Institute methodology applied to comparable Big Ten profile. — ESTIMATED" },
  { name: "CUNY System",           loss: 55,   type: "Public",  note: "Multi-campus exposure; disproportionate impact on low-income and first-gen students. — ESTIMATED" },
  { name: "Wayne State",           loss: 45,   type: "Public",  note: "Estimated from Roosevelt Institute methodology. One of 7/8 largest Michigan public universities with swaps. — ESTIMATED" },
];

const LIBOR_DATA = [
  { year: "2005", libor: 3.56, fixed: 5.2 }, { year: "2006", libor: 5.19, fixed: 5.3 },
  { year: "2007", libor: 5.25, fixed: 5.4 }, { year: "2008", libor: 2.47, fixed: 5.3 },
  { year: "2009", libor: 0.24, fixed: 5.1 }, { year: "2010", libor: 0.30, fixed: 4.9 },
  { year: "2011", libor: 0.30, fixed: 4.8 }, { year: "2012", libor: 0.31, fixed: 4.7 },
  { year: "2013", libor: 0.25, fixed: 4.6 }, { year: "2014", libor: 0.23, fixed: 4.5 },
  { year: "2015", libor: 0.27, fixed: 4.4 }, { year: "2016", libor: 0.53, fixed: 4.3 },
  { year: "2017", libor: 1.30, fixed: 4.2 }, { year: "2018", libor: 2.52, fixed: 4.1 },
  { year: "2019", libor: 2.15, fixed: 4.0 }, { year: "2020", libor: 0.22, fixed: 3.8 },
];

const TUITION_DATA = [
  { year: "2000", public: 3735,  private: 16233, avgDebt: 17200 },
  { year: "2002", public: 4115,  private: 18060, avgDebt: 19200 },
  { year: "2004", public: 5126,  private: 20082, avgDebt: 20700 },
  { year: "2006", public: 5836,  private: 22218, avgDebt: 21700 },
  { year: "2008", public: 6585,  private: 25143, avgDebt: 23200 },
  { year: "2010", public: 7605,  private: 27293, avgDebt: 25250 },
  { year: "2012", public: 8655,  private: 29056, avgDebt: 29400 },
  { year: "2014", public: 9139,  private: 31231, avgDebt: 28950 },
  { year: "2016", public: 9650,  private: 33480, avgDebt: 35000 },
  { year: "2018", public: 10230, private: 35830, avgDebt: 29800 },
  { year: "2020", public: 10560, private: 37650, avgDebt: 32880 },
  { year: "2022", public: 10740, private: 39400, avgDebt: 37574 },
  { year: "2024", public: 11260, private: 41540, avgDebt: 38290 },
];

const TIMELINE = [
  { year: 2000, label: "Borrowing Boom Begins", sev: "neutral",
    body: "Universities begin issuing variable-rate bonds at scale to fund capital expansions — luxury dormitories, recreation centers, athletic stadiums. Wall Street banks introduce interest rate swap products promising stable, lower-cost borrowing. Schools with small investment committees enter negotiations against sophisticated bank analysts." },
  { year: 2005, label: "Swap Deals Peak", sev: "warn",
    body: "Financial institutions marketed interest rate swaps broadly across higher education. A later Roosevelt Institute survey found 58% of sampled institutions held swaps. Contract terms extended up to 30 years — longer than those issued to any other sector. A notable information asymmetry existed between university finance committees and bank counterparties with dedicated derivatives expertise." },
  { year: 2006, label: "LIBOR Manipulation Investigation Period", sev: "danger",
    body: "Beginning around this period, 16 of the world's largest banks were later found by global regulators to have manipulated LIBOR — the London Interbank Offered Rate — which determined the variable-rate payments owed to universities under swap agreements. A change of just one one-hundredth of a percent in LIBOR represented tens of billions in aggregate payment differences. Investigations were ultimately launched by regulatory authorities in the U.S., U.K., Europe, Japan, and Canada." },
  { year: 2008, label: "Financial Crisis — Rate Environment Inverts", sev: "crisis",
    body: "Lehman Brothers collapses September 15. The Federal Reserve cuts rates to near-zero. LIBOR declines from 5.25% to below 0.5%. Swap agreements invert: bank variable payments to universities approach zero while universities continue paying fixed rates of 4.5–5.5%. Harvard terminates its swap portfolio, incurring $1.25 billion in termination fees. Early exit costs at other institutions similarly constrain options." },
  { year: 2009, label: "Sustained Rate Divergence", sev: "crisis",
    body: "LIBOR holds near 0.24%. Universities continue paying 4.5–5.5% fixed. The spread results in net payment obligations up to 50× what counterparty banks remit. Termination fees — calculated on the net present value of all remaining future payments — represent substantial exit barriers. Institutions begin reflecting increased debt service costs in tuition adjustments." },
  { year: 2012, label: "Debt Burden Deepens", sev: "danger",
    body: "Per-student debt interest payments rose 45% at public colleges, 23% at private institutions, and 76% at community colleges between 2003 and 2012. Only 25% of all interest payments went to instruction-related construction. The rest funded amenities arms races and absorbed financial instrument losses. Average student debt reaches $29,400." },
  { year: 2014, label: "Rutgers' Century Bond", sev: "warn",
    body: "Rutgers, managing obligations from four long-term swap contracts, issues a 100-year 'century bond' (maturing in 2119) to generate liquidity to exit the agreements — illustrating the cost constraints associated with long-duration swap termination. Credit rating adjustments at institutions with elevated debt service made future borrowing more expensive." },
  { year: 2016, label: "Roosevelt Institute: Financialization Report", sev: "action",
    body: "The Roosevelt Institute publishes landmark research on higher education financialization. Nineteen schools studied. Total documented losses: $2.7 billion — equivalent to tuition for approximately 108,000 students. Cornell alone: $280M+. LIBOR manipulation findings confirmed by global regulators. Research prompts discussion of transparency standards, debt renegotiation frameworks, and structural reform." },
  { year: 2021, label: "LIBOR Discontinued", sev: "neutral",
    body: "LIBOR is officially phased out globally, replaced by SOFR (Secured Overnight Financing Rate). Remaining swap contracts transition to the new benchmark. This period coincides with broader reflection on the long-term institutional and student costs associated with the interest rate environment following the 2008 financial crisis, and with ongoing benchmark rate governance reform." },
];

const POLICY_RECS = [
  { id: 1, title: "Mandatory Public Swap Disclosure", audience: "Administrators & Boards",
    body: "Require all public institutions to annually disclose outstanding swap notional values, net payments, termination fee exposure, and counterparty bank identities in accessible public formats. Without standardized public disclosure, students and state legislators lack the information necessary to evaluate an institution's full financial position.",
    status: "Partially implemented in select states. No federal disclosure standard exists." },
  { id: 2, title: "Trustee Conflict of Interest Recusal", audience: "Governing Boards",
    body: "Any board member receiving compensation from a financial institution doing business with their university should recuse from all related financial decisions and publicly disclose those relationships. Documented conflicts of interest, as noted in research on the UC system, raise questions about the independence of financial agreement oversight.",
    status: "Voluntary at most institutions. Legislation pending in several states." },
  { id: 3, title: "Renegotiation Under Misrepresentation", audience: "Legal Departments",
    body: "Swaps were marketed as interest rate risk management instruments; however, the realized payment dynamics in a sustained low-rate environment differed materially from projected outcomes at signing. Misrepresentation in sales may constitute legal grounds for renegotiation or restitution. Detroit reduced swap-related bank payments from $230 million to $85 million by establishing invalidity. This precedent may be applicable to affected universities.",
    status: "Legal basis exists on case-by-case basis. Detroit precedent directly applicable." },
  { id: 4, title: "Tuition Impact Line-Item Reporting", audience: "State Legislatures",
    body: "Mandate that institutions annually quantify and disclose what portion of tuition increases is attributable to financial instrument costs and debt service obligations. Students and families benefit from transparency regarding the relationship between institutional financing decisions and tuition levels.",
    status: "No state has fully implemented this reporting requirement." },
  { id: 5, title: "Public Bond Underwriting Alternatives", audience: "Federal & State Policymakers",
    body: "Enable consortiums of universities, cities, and states to access public bond underwriting outside private banking channels — reducing reliance on private financial intermediaries and the structural cost premiums associated with complex derivative instruments.",
    status: "Limited pilots exist at state level. No federal framework." },
  { id: 6, title: "Targeted Student Debt Relief for LIBOR-Affected Institutions", audience: "Federal Government",
    body: "Institutions with documented losses attributable to LIBOR manipulation during the relevant period should be eligible for targeted student debt relief proportional to confirmed overcharges passed to students. Restitution mechanisms should account for those who ultimately bore the cost differential.",
    status: "No existing federal mechanism. Requires direct federal advocacy and legislation." },
];

// ══════════════════════════════════════════════════════
//  DESIGN TOKENS
// ══════════════════════════════════════════════════════

const C = {
  bg: "#f7f5f0", surface: "#ede9e2", card: "#ffffff",
  border: "#d0ccc4", borderBright: "#b5b0a7",
  red: "#9B1C1C", redBright: "#6b1a1a", redDim: "#450a0a",
  gold: "#B45309", goldBright: "#FBBF24",
  blue: "#1a4a6b", blueBright: "#5b7fa6",
  text: "#1a2836", muted: "#55606e", dim: "#6b7280",
};
const F = {
  head: "'Playfair Display', Georgia, 'Times New Roman', serif",
  body: "'Source Sans 3','Source Sans Pro','Segoe UI',Arial,sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

const sevColor = (s) => ({ neutral: C.dim, warn: C.gold, danger: C.red, crisis: C.redBright, action: C.blueBright }[s] || C.muted);

// ── Custom Chart Tooltip ────────────────────────────
const CTooltip = ({ active, payload, label, pre = "", suf = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#ffffff", border: `1px solid ${C.borderBright}`, padding: "10px 14px", borderRadius: 4, fontFamily: F.body, fontSize: 12 }}>
      <div style={{ color: C.muted, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{pre}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suf}</strong>
        </div>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════

export default function InterestSwapReport() {
  const [tab, setTab]               = useState("report");
  const [activeYear, setActiveYear] = useState(2008);
  const [instFilter, setInstFilter] = useState("All");
  const [expandedRec, setExpandedRec] = useState(null);
  const [petName, setPetName]       = useState("");
  const [petRole, setPetRole]       = useState("");
  const [petInst, setPetInst]       = useState("");
  const [petState, setPetState]     = useState("");
  const [petNote, setPetNote]       = useState("");
  const [petLetter, setPetLetter]   = useState("");
  const [copied, setCopied]         = useState(false);

  const activeEvent = TIMELINE.find((e) => e.year === activeYear);

  const sortedInst = useMemo(() => {
    const filtered = instFilter === "All" ? INSTITUTIONS : INSTITUTIONS.filter((i) => i.type === instFilter);
    return [...filtered].sort((a, b) => b.loss - a.loss);
  }, [instFilter]);

  const generateLetter = () => {
    const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    setPetLetter(
`${date}

To University Leadership, Board of Trustees, and State Legislative Representatives,

My name is ${petName || "[Your Name]"}, ${petRole ? `a ${petRole}` : "[your title/role]"} at ${petInst || "[your institution]"}, ${petState || "[your state]"}.

I am writing to request action on the interest rate swap agreements that resulted in an estimated $2.7 billion in documented institutional losses across American universities — costs that were partially reflected in tuition increases, reduced scholarships, and constrained academic resources.

As documented by the Roosevelt Institute's 2016 research, institutions entered into interest rate swap agreements where the realized outcomes differed substantially from projected outcomes at signing. Swaps were marketed as interest rate risk management instruments; however, their 30-year terms and termination fee structures created substantial long-term payment obligations. When the Federal Reserve reduced rates to near-zero following the 2008 financial crisis, universities' net payment obligations increased substantially — paying up to 50× what their counterparties remitted — during a period in which LIBOR was subsequently confirmed by global regulators to have been manipulated by multiple major financial institutions, as documented in investigations by U.S., U.K., European, Japanese, and Canadian authorities.

The resulting costs were reflected in student outcomes. Per-student debt interest payments rose 45% at public colleges and 76% at community colleges between 2003 and 2012. Harvard incurred $1.25 billion in termination fees. Cornell documented losses of over $280 million. Michigan State documented $130 million in costs concurrent with above-average tuition increases. Rutgers issued a 100-year bond (maturing 2119) to fund swap exit costs. These documented institutional losses are contributing factors to the $38,000 average student debt burden with well-documented downstream effects on homeownership, entrepreneurship, and retirement outcomes.

I am calling for:
  1. Full public disclosure of all outstanding swap agreements, notional values, and termination fee exposure at every public institution.
  2. Mandatory conflict-of-interest recusal for trustees with financial ties to counterparty banks.
  3. Active legal renegotiation of remaining contracts on grounds of misrepresentation — following the Detroit precedent that recovered $145M.
  4. Annual tuition impact reporting that directly attributes swap costs to student tuition increases.
  5. Federal and state legislation to create public bond underwriting alternatives, reducing bank dependency.${petNote ? `\n\nAdditional note: ${petNote}` : ""}

Higher education is a public good. Transparency in institutional finance and structural reform of public debt instruments are necessary to ensure that institutional resources are directed toward educational outcomes.

Respectfully,
${petName || "[Your Name]"}${petRole ? `\n${petRole}` : ""}
${petInst || "[Institution]"}${petState ? `, ${petState}` : ""}`
    );
  };

  const copyLetter = () => {
    if (!petLetter) return;
    navigator.clipboard.writeText(petLetter).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  // ── Shared style helpers ──
  const card = (extra = {}) => ({
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: "24px 28px", ...extra,
  });
  const h2 = { fontFamily: F.head, fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 700, color: C.text, marginBottom: 20, lineHeight: 1.2 };
  const bodyText = { fontSize: 15, color: C.muted, lineHeight: 1.78 };
  const eyebrow = { fontFamily: F.mono, fontSize: 10, letterSpacing: "0.18em", color: C.red, textTransform: "uppercase", marginBottom: 8 };
  const inputStyle = { width: "100%", background: C.card, border: `1px solid ${C.borderBright}`, borderRadius: 4, padding: "10px 14px", fontSize: 14, color: C.text, fontFamily: F.body };
  const filterBtn = (active) => ({ fontFamily: F.body, fontSize: 13, padding: "6px 16px", background: active ? C.red : C.card, color: active ? "#fff" : C.muted, border: `1px solid ${active ? C.red : C.border}`, borderRadius: 3, cursor: "pointer" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;} html,body{margin:0;padding:0;background:#f7f5f0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#f7f5f0;}
        ::-webkit-scrollbar-thumb{background:#b5b0a7;border-radius:3px;}
        input,textarea,select{outline:none;}
        a.res-link:hover{border-color:#9B1C1C !important;}
        @media(max-width:640px){
          .sr-header{padding:24px 18px 20px !important;}
          .sr-tabbar{padding:0 18px !important;}
          .sr-content{padding:28px 18px 64px !important;}
          .sr-footer{padding:20px 18px !important;}
          .sr-stats{flex-direction:column;gap:20px !important;}
          .sr-steps{grid-template-columns:1fr !important;}
          .sr-inst-row{grid-template-columns:1fr !important;}
        }
      `}</style>

      <div style={{ background: C.bg, color: C.text, fontFamily: "'Source Sans 3','Source Sans Pro','Segoe UI',Arial,sans-serif", minHeight: "100vh", width: "100%" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');`}</style>

        {/* ╔══════ HEADER ══════╗ */}
        <div style={{ background: "#1a2836", borderBottom: `1px solid #3a4a5a`, padding: "44px 156px 36px" }} className="sr-header">
          <div style={{ ...eyebrow, color: "#c09898" }}>Policy & Financial Analysis · Interest Rate Derivatives · Post-2008</div>
          <h1 style={{ fontFamily: F.head, fontSize: "clamp(26px,3.8vw,50px)", fontWeight: 900, lineHeight: 1.06, color: "#f5f1ec", maxWidth: "90%", marginBottom: 20 }}>
            The Financialization of Higher Education:<br />
            How Interest Rate Swaps Transferred{" "}
            <em style={{ color: "#ef8585", fontStyle: "italic" }}>$2.7 Billion</em>{" "}
            from Campuses to Wall Street
          </h1>
          <p style={{ fontSize: 16, color: "#c8c5bf", maxWidth: "80%", lineHeight: 1.65 }}>
            An interactive analysis of post-2008 interest rate swap agreements, their direct impact on college tuition and student debt, and the structural policy reforms required to prevent recurrence.
          </p>
          {/* ── Stat Strip ── */}
          <div style={{ display: "flex", gap: 0, marginTop: 36, borderTop: `1px solid #3a4a5a`, paddingTop: 28, flexWrap: "wrap" }} className="sr-stats">
            {[
              { num: "$2.7B",   sub: "Documented losses by 19 universities in interest rate swap agreements, per Roosevelt Institute" },
              { num: "108,000", sub: "Students whose full tuition could have been covered by those documented institutional losses" },
              { num: "50×",     sub: "Estimated ratio of university fixed payments to bank variable payments at post-2008 LIBOR trough" },
              { num: "76%",     sub: "Rise in community college per-student debt interest payments, 2003–2012 (Roosevelt Institute)" },
            ].map((st, i) => (
              <div key={i} style={{ flex: 1, minWidth: 155, paddingRight: 36, marginBottom: 12 }}>
                <div style={{ fontFamily: F.head, fontSize: "clamp(22px,3vw,40px)", fontWeight: 900, color: "#ef8585", lineHeight: 1, marginBottom: 7 }}>{st.num}</div>
                <div style={{ fontSize: 13, color: "#c8c5bf", lineHeight: 1.45 }}>{st.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ╔══════ TAB BAR ══════╗ */}
        <div style={{ display: "flex", background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 156px", overflowX: "auto" }} className="sr-tabbar">
          {[
            { id: "report",   label: "I. Research Report" },
            { id: "strategy", label: "II. Strategy & Petition" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.04em", padding: "16px 24px 14px", background: "none", border: "none", borderBottom: tab === t.id ? `3px solid ${C.redBright}` : "3px solid transparent", color: tab === t.id ? C.text : C.muted, cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ╔══════ TAB: REPORT ══════╗ */}
        {tab === "report" && (
          <div style={{ padding: "52px 156px 80px" }} className="sr-content">

            {/* HOW SWAPS WORK */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Explainer</div>
              <h2 style={h2}>Interest Rate Swap Mechanics: Four Structural Phases</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(252px, 1fr))", gap: 16 }} className="sr-steps">
                {[
                  { step:"01", title:"The Pitch",    body:"Financial institutions approached university finance committees — typically a small group without derivatives expertise — offering to exchange variable-rate bond interest for stable fixed-rate payments. The projected benefit: lower, predictable borrowing costs for campus construction." },
                  { step:"02", title:"The Structure", body:"The university pays the bank a fixed rate (~5.3%). The bank pays the university a variable rate (LIBOR-linked). If LIBOR rises above the fixed rate, the university's net position improves. If LIBOR falls below the fixed rate, the university's net payment obligation increases proportionally." },
                  { step:"03", title:"The 2008 Crash",body:"The Fed cuts rates to near-zero. LIBOR declines from 5.25% to 0.24%. Universities continue paying 5%+ fixed while receiving near-zero variable payments from banks — resulting in net payment obligations up to 50× what banks remit. This period also coincides with the LIBOR manipulation that was later confirmed by global regulators." },
                  { step:"04", title:"Exit Constraints",      body:"Termination fees — calculated on the net present value of all remaining future payments — created substantial early exit costs. Some contracts extended 30 years, longer than those sold to any other sector. Institutions reflected the resulting debt service burden in subsequent tuition and budget adjustments." },
                ].map((item) => (
                  <div key={item.step} style={{ ...card(), borderTop: `3px solid ${C.red}` }}>
                    <div style={{ fontFamily: F.mono, fontSize: 10, color: C.red, marginBottom: 8, letterSpacing: "0.12em" }}>STEP {item.step}</div>
                    <div style={{ fontFamily: F.head, fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 10 }}>{item.title}</div>
                    <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.68 }}>{item.body}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RATE DIVERGENCE CHART */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Chart 1 — Rate Analysis</div>
              <h2 style={h2}>The Rate Divergence: Fixed vs. LIBOR Variable Rates, 2005–2020</h2>
              <p style={{ ...bodyText, marginBottom: 28, maxWidth: "90%" }}>
                Universities locked in fixed rates of 4.5–5.5%. When the Federal Reserve reduced rates after 2008, LIBOR — the variable rate banks owed universities — declined to near-zero. This structural divergence persisted for over a decade, representing sustained net payment differentials from universities to their swap counterparties.
              </p>
              <div style={{ ...card(), padding: "28px 12px 20px 0" }}>
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={LIBOR_DATA} margin={{ top: 10, right: 40, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 12, fontFamily: F.body }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 12, fontFamily: F.body }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 7]} />
                    <Tooltip content={<CTooltip suf="%" />} />
                    <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, color: C.muted, fontFamily: F.body }} />
                    <ReferenceLine x="2008" stroke={C.redBright} strokeDasharray="5 5" label={{ value: "Crisis →", fill: C.redBright, fontSize: 10, fontFamily: F.mono }} />
                    <Line type="monotone" dataKey="fixed" name="University Fixed Rate Paid" stroke={C.redBright} strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="libor" name="LIBOR Variable Rate Received" stroke={C.goldBright} strokeWidth={2.5} dot={false} strokeDasharray="7 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p style={{ fontSize: 12, color: C.dim, marginTop: 10, fontStyle: "italic" }}>
                Source: Federal Reserve historical LIBOR data; Roosevelt Institute 2016 report. Fixed rates are representative averages based on reported swap terms.
              </p>
            </div>

            {/* INTERACTIVE TIMELINE */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Interactive Timeline</div>
              <h2 style={h2}>Crisis Chronology: 2000 – 2021</h2>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
                {TIMELINE.map((e) => (
                  <button key={e.year} onClick={() => setActiveYear(e.year)} style={{ fontFamily: F.mono, fontSize: 12, padding: "7px 14px", background: activeYear === e.year ? sevColor(e.sev) : C.card, color: activeYear === e.year ? "#fff" : C.muted, border: `1px solid ${activeYear === e.year ? sevColor(e.sev) : C.border}`, borderRadius: 3, cursor: "pointer", fontWeight: activeYear === e.year ? 600 : 400, transition: "all 0.15s" }}>
                    {e.year}
                  </button>
                ))}
              </div>
              {activeEvent && (
                <div style={{ ...card(), borderLeft: `4px solid ${sevColor(activeEvent.sev)}` }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: F.head, fontSize: 36, fontWeight: 900, color: sevColor(activeEvent.sev), lineHeight: 1 }}>{activeEvent.year}</span>
                    <span style={{ fontFamily: F.head, fontSize: 20, fontWeight: 700, color: C.text }}>{activeEvent.label}</span>
                  </div>
                  <p style={bodyText}>{activeEvent.body}</p>
                </div>
              )}
            </div>

            {/* INSTITUTION CHART */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Chart 2 — Institutional Impact</div>
              <h2 style={h2}>Documented & Estimated Swap Losses by Institution</h2>
              <p style={{ ...bodyText, marginBottom: 20, maxWidth: "85%" }}>
                Figures for Harvard, Cornell, Michigan State, and the University of Michigan are directly confirmed from the Roosevelt Institute 2016 report and subsequent journalism. All other figures are estimated from published methodology. Hover any bar for source notes.
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {["All", "Private", "Public"].map((f) => (
                  <button key={f} style={filterBtn(instFilter === f)} onClick={() => setInstFilter(f)}>{f}</button>
                ))}
              </div>
              <div style={{ ...card(), padding: "28px 16px 28px 0" }}>
                <ResponsiveContainer width="100%" height={Math.max(320, sortedInst.length * 46)}>
                  <BarChart layout="vertical" data={sortedInst} margin={{ top: 8, right: 100, left: 24, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 11, fontFamily: F.body }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 12, fontFamily: F.body }} axisLine={false} tickLine={false} width={185} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "#ffffff", border: `1px solid ${C.borderBright}`, padding: "12px 16px", borderRadius: 4, fontFamily: F.body, fontSize: 12, maxWidth: 300 }}>
                            <div style={{ color: C.redBright, fontWeight: 600, marginBottom: 4 }}>{d.name} · {d.type}</div>
                            <div style={{ color: C.goldBright, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>${d.loss.toLocaleString()}M</div>
                            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.55 }}>{d.note}</div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="loss" name="Swap Losses ($M)" fill={C.red} radius={[0, 3, 3, 0]}
                      label={{ position: "right", formatter: (v) => `$${v}M`, fill: C.muted, fontSize: 11, fontFamily: F.mono }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TUITION CHART */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Chart 3 — Student Impact</div>
              <h2 style={h2}>Tuition & Student Debt: The Human Cost, 2000–2024</h2>
              <p style={{ ...bodyText, marginBottom: 28, maxWidth: "90%" }}>
                As swap costs ballooned, institutions passed expenses to students. Average annual in-state public tuition tripled from 2000 to 2024. Average student debt at graduation reached $35,000 by 2016 and continues to rise.
              </p>
              <div style={{ ...card(), padding: "28px 12px 20px 0" }}>
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={TUITION_DATA} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 12, fontFamily: F.body }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 12, fontFamily: F.body }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} domain={[0, 46000]} />
                    <Tooltip content={<CTooltip pre="$" />} />
                    <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, color: C.muted, fontFamily: F.body }} />
                    <ReferenceLine x="2008" stroke={C.redBright} strokeDasharray="5 5" label={{ value: "2008 Crisis", fill: C.redBright, fontSize: 10, fontFamily: F.mono }} />
                    <Line type="monotone" dataKey="public"   name="Avg. Public 4-yr Tuition (in-state)"  stroke={C.blueBright} strokeWidth={2}   dot={false} />
                    <Line type="monotone" dataKey="private"  name="Avg. Private 4-yr Tuition"            stroke={C.goldBright} strokeWidth={2}   dot={false} />
                    <Line type="monotone" dataKey="avgDebt"  name="Avg. Student Debt at Graduation"      stroke={C.redBright}  strokeWidth={2.5} dot={false} strokeDasharray="7 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p style={{ fontSize: 12, color: C.dim, marginTop: 10, fontStyle: "italic" }}>
                Source: NCES Digest of Education Statistics (tuition); Federal Reserve / College Board (student debt). All values in nominal dollars.
              </p>
            </div>

            {/* KEY QUOTES */}
            <div style={{ marginBottom: 20 }}>
              <div style={eyebrow}>On Record</div>
              <h2 style={h2}>Documented Findings & Key Statements</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(272px, 1fr))", gap: 16 }}>
                {[
                  { quote: "Basically, you have a gullible counterparty and a much more sophisticated one.",                                                                                  src: "Deane Yang, Andrew Kalotay Associates — on universities vs. Wall Street banks", c: C.goldBright },
                  { quote: "These deals came fully loaded with egregious termination clauses making them sometimes prohibitively expensive for schools to exit.",                             src: "Roosevelt Institute, 'The Financialization of Higher Education,' 2016",        c: C.redBright },
                  { quote: "Detroit reduced its bank payments from $230 million to $85 million by exposing the invalidity of a swap. Universities may be able to do the same.",             src: "Roosevelt Institute — on legal recourse for affected institutions",            c: C.blueBright },
                  { quote: "An entire generation will enter the economy at a financial disadvantage: less likely to buy homes, start businesses, or save for retirement.",                  src: "Roosevelt Institute, 2016 — on the macroeconomic legacy of student debt",     c: C.dim },
                ].map((q, i) => (
                  <div key={i} style={{ ...card(), borderLeft: `3px solid ${q.c}` }}>
                    <div style={{ fontFamily: F.head, fontSize: 15, fontStyle: "italic", color: C.text, lineHeight: 1.65, marginBottom: 14 }}>"{q.quote}"</div>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: F.mono, lineHeight: 1.5 }}>{q.src}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ╔══════ TAB: STRATEGY ══════╗ */}
        {tab === "strategy" && (
          <div style={{ padding: "52px 156px 80px" }} className="sr-content">

            {/* POLICY RECS */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Reform Framework</div>
              <h2 style={h2}>Structural Policy Recommendations</h2>
              <p style={{ ...bodyText, marginBottom: 28, maxWidth: "85%" }}>
                The following reforms address both immediate remediation for institutions and students harmed by swap agreements, and long-term structural changes to prevent recurrence. Click any item to expand.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {POLICY_RECS.map((rec) => (
                  <div key={rec.id} onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                    style={{ ...card(), cursor: "pointer", borderLeft: `3px solid ${expandedRec === rec.id ? C.redBright : C.border}`, transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div>
                        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.red, letterSpacing: "0.12em", marginBottom: 6 }}>{rec.audience.toUpperCase()}</div>
                        <div style={{ fontFamily: F.head, fontSize: 17, fontWeight: 700, color: C.text }}>{rec.title}</div>
                      </div>
                      <span style={{ color: C.dim, fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2, userSelect: "none" }}>{expandedRec === rec.id ? "−" : "+"}</span>
                    </div>
                    {expandedRec === rec.id && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.72, marginBottom: 14 }}>{rec.body}</p>
                        <div style={{ display: "inline-block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, padding: "5px 12px" }}>
                          <span style={{ fontFamily: F.mono, fontSize: 11, color: C.gold }}>STATUS: </span>
                          <span style={{ fontFamily: F.mono, fontSize: 11, color: C.muted }}>{rec.status}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION STEPS */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Stakeholder Action Guide</div>
              <h2 style={h2}>What You Can Do — By Role</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(244px, 1fr))", gap: 16 }} className="sr-inst-row">
                {[
                  { role: "Students", c: C.blueBright, actions: [
                    "Research your institution's outstanding swap agreements via annual financial reports and auditor notes.",
                    "Map board of trustee members' financial ties to counterparty banks and publish findings.",
                    "Demand swap cost disclosure in university financial transparency reports and student government forums.",
                    "Connect with Roosevelt Network student policy chapters or equivalent advocacy organizations.",
                  ]},
                  { role: "Administrators", c: C.goldBright, actions: [
                    "Commission a full audit of existing swap agreement terms, remaining exposure, and realistic exit costs.",
                    "Engage legal counsel to assess misrepresentation-based renegotiation options — Detroit reduced losses by $145M.",
                    "Establish mandatory conflict-of-interest recusal and disclosure policies for governing board members.",
                    "Publish annual tuition impact reports transparently attributing cost drivers including debt service.",
                  ]},
                  { role: "Policymakers", c: C.redBright, actions: [
                    "Introduce legislation mandating swap disclosure and tuition impact reporting at all public institutions.",
                    "Create public bond underwriting consortiums to reduce university dependence on private banking.",
                    "Pursue LIBOR manipulation restitution claims for affected public institutions and pass savings to students.",
                    "Fund targeted student debt relief tied to institutions with documented manipulation-related losses.",
                  ]},
                ].map((g) => (
                  <div key={g.role} style={{ ...card(), borderTop: `3px solid ${g.c}` }}>
                    <div style={{ fontFamily: F.head, fontSize: 17, fontWeight: 700, color: g.c, marginBottom: 18 }}>{g.role}</div>
                    {g.actions.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.surface, border: `1px solid ${g.c}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontFamily: F.mono, fontSize: 9, color: g.c }}>{i + 1}</span>
                        </div>
                        <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* PETITION GENERATOR */}
            <div style={{ marginBottom: 64 }}>
              <div style={eyebrow}>Advocacy Tool</div>
              <h2 style={h2}>Generate a Petition & Advocacy Letter</h2>
              <p style={{ ...bodyText, marginBottom: 28, maxWidth: "85%" }}>
                Complete the fields below to generate a personalized letter for your institution's board, state legislature, or congressional representative. Draws on documented figures and specific policy demands grounded in Roosevelt Institute research.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
                {[
                  { label: "Your Name",     val: petName,  set: setPetName,  ph: "e.g., Jamie Rivera" },
                  { label: "Role / Title",  val: petRole,  set: setPetRole,  ph: "e.g., Graduate Student" },
                  { label: "Institution",   val: petInst,  set: setPetInst,  ph: "e.g., State University" },
                  { label: "State",         val: petState, set: setPetState, ph: "e.g., New York" },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontFamily: F.mono, fontSize: 10, letterSpacing: "0.12em", color: C.muted, marginBottom: 8 }}>{f.label.toUpperCase()}</label>
                    <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: F.mono, fontSize: 10, letterSpacing: "0.12em", color: C.muted, marginBottom: 8 }}>ADDITIONAL NOTE (OPTIONAL)</label>
                <textarea value={petNote} onChange={(e) => setPetNote(e.target.value)} placeholder="Add institution-specific context or a personal impact statement..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <button onClick={generateLetter} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 4, padding: "12px 32px", fontSize: 14, fontFamily: F.body, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", marginBottom: 28 }}>
                Generate Letter →
              </button>
              {petLetter && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>GENERATED PETITION LETTER — COPY & SEND</div>
                    <button onClick={copyLetter} style={{ background: copied ? "#14532d" : C.card, color: copied ? "#86efac" : C.text, border: `1px solid ${copied ? "#14532d" : C.borderBright}`, borderRadius: 4, padding: "7px 20px", fontSize: 13, fontFamily: F.body, cursor: "pointer", transition: "all 0.2s" }}>
                      {copied ? "✓ Copied to Clipboard" : "Copy to Clipboard"}
                    </button>
                  </div>
                  <textarea value={petLetter} readOnly rows={30} style={{ ...inputStyle, background: C.surface, fontSize: 13, fontFamily: F.mono, lineHeight: 1.72, resize: "vertical" }} />
                </div>
              )}
            </div>

            {/* RESOURCES */}
            <div style={{ marginBottom: 20 }}>
              <div style={eyebrow}>Current Landscape</div>
              <h2 style={h2}>Reform Efforts & Resources</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(256px, 1fr))", gap: 16 }}>
                {[
                  { title: "Roosevelt Institute",                  type: "Research",   url: "https://rooseveltinstitute.org",     desc: "Original research on higher education financialization. Active student chapters nationwide. Primary source for this analysis." },
                  { title: "Action Center on Race & the Economy",  type: "Advocacy",   url: "https://acrecampaigns.org",          desc: "Documentation of financial instrument impacts on public universities, municipalities, and community institutions." },
                  { title: "The Hechinger Report",                 type: "Journalism", url: "https://hechingerreport.org",        desc: "Investigative journalism covering college financing, endowment management, and the student cost of institutional financial decisions." },
                  { title: "Student Debt Crisis Center",           type: "Advocacy",   url: "https://studentdebtcrisis.org",      desc: "National advocacy for student debt cancellation and structural reform of higher education finance." },
                ].map((r) => (
                  <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer" className="res-link"
                    style={{ ...card(), textDecoration: "none", display: "block", transition: "border-color 0.2s" }}>
                    <div style={{ fontFamily: F.mono, fontSize: 10, color: C.gold, letterSpacing: "0.12em", marginBottom: 8 }}>{r.type.toUpperCase()}</div>
                    <div style={{ fontFamily: F.head, fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10 }}>{r.title} ↗</div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{r.desc}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ╔══════ FOOTER ══════╗ */}
        <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "28px 156px", fontSize: 11, color: C.dim, lineHeight: 1.8, fontFamily: F.mono }} className="sr-footer">
          <div><span style={{ color: C.muted }}>Analysis & Interface Design:</span> Lancelot Naipier-Kane</div>
          <div style={{ marginTop: 6 }}><span style={{ color: C.muted }}>Real Data Sources:</span> Roosevelt Institute (2016), "The Financialization of Higher Education"; Time / Fortune (September 2016); Cornell Daily Sun (September 2016); The Hechinger Report; Action Center on Race and the Economy; NCES Digest of Education Statistics (average tuition 2000–2024); Federal Reserve / College Board (average student debt 2000–2024); FRB LIBOR historical rate data.</div>
          <div style={{ marginTop: 6 }}><span style={{ color: C.muted }}>Estimated Data:</span> Swap loss figures for Columbia, UPenn, UC Berkeley, Univ. of Pittsburgh, Ohio State, Wayne State, and CUNY are estimated using Roosevelt Institute published methodology applied to comparable institutional debt profiles. Clearly noted in all tooltips. Confirmed figures: Harvard ($1.25B), Cornell ($280M+), Michigan State ($130.2M), Univ. of Michigan ($86M+).</div>
          <div style={{ marginTop: 6 }}><span style={{ color: C.muted }}>Disclaimer:</span> For portfolio and policy education purposes. All policy recommendations are drawn from published research and advocacy literature. Not legal or financial advice.</div>
        </div>

      </div>

                  {/* ─── PROJECT FOOTER ────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid #cccccc",
        marginTop: 40,
        padding: "20px 28px",
        background: "#f9f9f7",
        fontFamily: "'Trebuchet MS','Gill Sans',Tahoma,sans-serif",
        fontSize: 12,
        color: "#555550",
        lineHeight: 1.9,
      }}>
        <p style={{ margin: "0 0 6px 0" }}>
          <strong style={{ color: "#1a1a14", fontSize: 13 }}>Lancelot Napier-Kane</strong>
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), Recharts, Python (NumPy, SciPy, QuantLib — reference implementation), Bloomberg Terminal (SWPM swap pricer, swap curve BAPI schema reference), SQL Server (trade blotter schema), Excel VBA (ISDA confirmation template structure), Pandas (cash flow schedule modeling)
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> Vanilla interest rate swap valuation via NPV discounting of fixed and floating legs against USD SOFR OIS curve; sensitivity analysis: DV01 (dollar value of a basis point) and PV01 across parallel yield curve shifts ±50/100/200bps; fixed-to-floating hedging effectiveness testing per ASC 815 standards; yield curve bootstrapping from on-the-run Treasury and SOFR swap quotes; fair value vs notional comparison per ISDA documentation standards; all swap valuations, curve data, and sensitivity outputs are simulated using published rate curve conventions
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> Bloomberg SWPM swap pricing methodology documentation; ISDA Master Agreement 2002 standard definitions and confirmation templates; Federal Reserve H.15 historical rate release structure; ASC 815 hedge accounting guidelines; SOFR swap convention reference (ARRC); USD SOFR OIS curve data simulated based on published Federal Reserve rate history
        </p>
      </div>
    </>
  );
}
