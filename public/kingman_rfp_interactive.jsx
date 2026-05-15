import { useState } from "react";

// ── Inline SVG Line Chart (no external dependency) ──────────────────────────
function SvgLineChart({ data, xKey, yKey, color = '#86efac', yLabel = '' }) {
  const [tooltip, setTooltip] = useState(null);
  const W = 560, H = 260, PAD = { top: 20, right: 20, bottom: 44, left: 58 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const ys = data.map(d => d[yKey]);
  const minY = Math.min(...ys) - 0.2;
  const maxY = Math.max(...ys) + 0.2;
  const toX = i => PAD.left + (i / (data.length - 1)) * innerW;
  const toY = v => PAD.top + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d[yKey])}`).join(' ');
  const areaClose = `${toX(data.length - 1)},${PAD.top + innerH} ${PAD.left},${PAD.top + innerH}`;

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => minY + (i / 4) * (maxY - minY));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <line key={i}
            x1={PAD.left} y1={toY(v)} x2={PAD.left + innerW} y2={toY(v)}
            stroke="rgba(255,255,255,0.08)" strokeDasharray="4 3"
          />
        ))}
        {/* Y-axis label */}
        <text
          x={12} y={H / 2}
          fill="#94a3b8" fontSize={10} textAnchor="middle"
          transform={`rotate(-90, 12, ${H / 2})`}
        >{yLabel}</text>
        {/* Y-axis ticks */}
        {yTicks.map((v, i) => (
          <text key={i}
            x={PAD.left - 6} y={toY(v) + 4}
            fill="#94a3b8" fontSize={10} textAnchor="end"
          >{v.toFixed(1)}</text>
        ))}
        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i}
            x={toX(i)} y={PAD.top + innerH + 18}
            fill="#94a3b8" fontSize={9} textAnchor="middle"
          >{d[xKey]}</text>
        ))}
        {/* Area fill */}
        <polygon
          points={`${points} ${areaClose}`}
          fill={color} fillOpacity={0.08}
        />
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i}
            cx={toX(i)} cy={toY(d[yKey])} r={5}
            fill={color} stroke="rgba(6,26,11,0.9)" strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setTooltip({ i, x: toX(i), y: toY(d[yKey]), d })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
        {/* Tooltip */}
        {tooltip && (() => {
          const tx = tooltip.x + 10;
          const ty = tooltip.y - 36;
          return (
            <g>
              <rect x={tx} y={ty} width={108} height={30} rx={6}
                fill="rgba(7,20,11,0.93)" stroke="rgba(134,239,172,0.35)" strokeWidth={1}
              />
              <text x={tx + 54} y={ty + 12} fill="#86efac" fontSize={10} textAnchor="middle" fontWeight="600">
                {tooltip.d[xKey]}
              </text>
              <text x={tx + 54} y={ty + 24} fill="#fff" fontSize={10} textAnchor="middle">
                {tooltip.d[yKey]}M gal
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

export default function KingmanIslandRFP() {
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [expandedDeliverable, setExpandedDeliverable] = useState(null);

  const metrics = [
    { label: 'Funding Request', value: '$400K', subtext: 'Four-year allocation' },
    { label: 'Grant Duration', value: '4 Years', subtext: 'Multi-phase deployment' },
    { label: 'Annual Cohort', value: '15–20', subtext: 'Young adults aged 18-24' },
    { label: 'Rain Gardens', value: '40/Qtr', subtext: '160 annual maintenance cycles' },
  ];

  const deliverables = [
    {
      title: 'NGICP Workforce Certification',
      detail: 'National Green Infrastructure Certification Program preparation through UDC partnership, including classroom instruction and field deployment integration.',
      metric: '10+ certifications annually'
    },
    {
      title: 'Stormwater Management Deployment',
      detail: 'Hands-on training in rain garden maintenance, bioswale inspection, and RiverSmart system operations across District watersheds.',
      metric: '40 rain gardens/quarter'
    },
    {
      title: 'Rain Garden Maintenance & Inspection',
      detail: 'Quarterly maintenance protocols including vegetation management, soil testing, drainage inspection, and structural assessment.',
      metric: '160 annual inspections'
    },
    {
      title: 'Invasive Species Removal',
      detail: 'Systematic removal of invasive vegetation including English ivy, Japanese knotweed, and other non-native species threatening watershed health.',
      metric: '1 acre annually'
    },
    {
      title: 'Environmental Monitoring & Analysis',
      detail: 'Stream monitoring protocols, water quality testing, macroinvertebrate surveys, and data collection across 11 restoration sites.',
      metric: '11 monitoring sites'
    },
    {
      title: 'Career Readiness Pathways',
      detail: 'Job readiness training, professional certification support, employment networking, and career advancement coaching with case worker support.',
      metric: '70%+ placement rate'
    },
    {
      title: 'Hospitality & Stewardship Rangers',
      detail: 'Master Naturalist training focused on public engagement, environmental interpretation, and site stewardship operations.',
      metric: 'Ranger certification'
    },
    {
      title: 'RiverSmart Operations',
      detail: 'Maintenance and inspection of RiverSmart Homes stormwater infrastructure supporting District impervious surface reduction goals.',
      metric: '10% of RS portfolio'
    },
  ];

  const phases = [
    {
      title: 'Phase 1 • Recruitment & Candidate Assessment',
      weeks: 'Weeks 1-4',
      body: 'Living Classrooms utilizes a verified recruitment model incorporating information sessions, interviews, CASA math and reading assessments, and early engagement events targeting DC residents ages 18–24. Transportation assistance and wraparound case management begin immediately upon acceptance.',
      activities: [
        'Information sessions (2 mandatory)',
        'Individual candidate interviews',
        'CASA math & reading assessment',
        'Case worker assignment & support',
        'Metro card distribution',
        'Baseline skills evaluation'
      ],
      outcomes: '20-25 participants selected from ~30 initial candidates'
    },
    {
      title: 'Phase 2 • Education, Training & Certification',
      weeks: 'Weeks 5-36',
      body: 'Participants complete UDC-led NGICP coursework integrated with applied field instruction across Kingman Island. Curriculum includes stormwater systems, ecological restoration, environmental monitoring, erosion mitigation, maintenance protocols, habitat restoration, and green infrastructure inspection.',
      activities: [
        'NGICP curriculum (UDC partnership)',
        'Hands-on field deployment',
        'Soft skills & job readiness',
        'Test preparation support',
        'Landscape maintenance training',
        'Master Naturalist certification prep'
      ],
      outcomes: '15-20 NGICP certified graduates ready for employment'
    },
    {
      title: 'Phase 3 • Workforce Integration & Deployment',
      weeks: 'Weeks 37-52',
      body: 'Graduates transition into employment pathways supporting RiverSmart systems, restoration crews, rain garden maintenance, landscaping operations, stewardship programming, environmental monitoring, and Living Classrooms re-hire opportunities aligned with DOEE operational goals.',
      activities: [
        'Employment placement coordination',
        'Living Classrooms re-hire pool (5 positions)',
        'External employment networking',
        'Apprenticeship opportunities',
        'Higher education pathways (UDC)',
        'Ongoing career support'
      ],
      outcomes: '10+ employment placements within 3 months post-certification'
    },
  ];

  const budgetData = [
    { category: 'Program Personnel', yr1: 68000, yr2: 72000, yr3: 75000, yr4: 78000, total: 293000 },
    { category: 'Field Equipment', yr1: 14000, yr2: 8000, yr3: 8000, yr4: 8000, total: 38000 },
    { category: 'Transportation & Support', yr1: 10000, yr2: 10000, yr3: 10000, yr4: 10000, total: 40000 },
    { category: 'Environmental Monitoring', yr1: 8000, yr2: 7000, yr3: 7000, yr4: 7000, total: 29000 },
    { category: 'Education & Certification', yr1: 15000, yr2: 15000, yr3: 15000, yr4: 15000, total: 60000 },
    { category: 'Operations & Maintenance', yr1: 11000, yr2: 12000, yr3: 13000, yr4: 14000, total: 50000 },
  ];

  const impactMetrics = [
    { name: 'Participant Training', value: 85, color: '#86efac' },
    { name: 'Employment Placement', value: 70, color: '#34d399' },
    { name: 'Certification Success', value: 90, color: '#4ade80' },
    { name: 'Retention Rate', value: 75, color: '#a78bfa' },
  ];

  const waterRetentionData = [
    { year: '2016', gallons: 2.1 },
    { year: '2017', gallons: 2.5 },
    { year: '2018', gallons: 2.9 },
    { year: '2019', gallons: 3.2 },
    { year: '2020', gallons: 3.5 },
    { year: '2021', gallons: 3.8 },
    { year: '2022', gallons: 4.0 },
    { year: '2023', gallons: 4.2 },
    { year: '2024 (Proj)', gallons: 4.5 },
  ];

  const partnerOrgs = [
    {
      name: 'University of the District of Columbia',
      role: 'NGICP Curriculum & Certification',
      responsibilities: [
        'NGICP course instruction',
        'Field coordination with crew leads',
        'Test preparation support',
        'Educational resource sharing',
        'Post-employment networking'
      ],
      contact: 'Dr. Dwane Jones, Acting Dean'
    },
    {
      name: 'DC Water',
      role: 'Green Infrastructure Standards',
      responsibilities: [
        'NGICP program partnership',
        'Technical standards alignment',
        'Employment pathway coordination',
        'Workforce development support'
      ],
      contact: 'Technical Partnership'
    },
    {
      name: 'Water Environment Federation',
      role: 'National Certification Standards',
      responsibilities: [
        'NGICP exam administration',
        'National certification standards',
        'Industry best practices',
        '500+ active nationwide certificates'
      ],
      contact: 'National Standards Body'
    },
  ];

  const pastGrants = [
    { year: '2019', agency: 'DOEE', amount: '$20,000', purpose: 'Green Zone Watershed Education', status: 'Completed' },
    { year: '2019', agency: 'DOEE', amount: '$19,397', purpose: 'Kingman Island Access Beautification', status: 'Completed' },
    { year: '2019', agency: 'DOEE', amount: '$19,996', purpose: 'Middle School Watershed Education', status: 'Completed' },
    { year: '2017', agency: 'DDOT', amount: '$26,520', purpose: 'Kingman Island Trail Maintenance', status: 'Completed' },
    { year: '2017', agency: 'DOEE', amount: '$20,000', purpose: 'Community Stormwater Solutions', status: 'Completed' },
    { year: '2016', agency: 'DOEE', amount: '$19,963', purpose: 'Watershed Experiences for 3rd-8th Grade', status: 'Completed' },
  ];

  const COLORS = ['#86efac', '#34d399', '#4ade80', '#a78bfa', '#f472b6', '#fb923c'];

  return (
    <div style={{ width:'100%', maxWidth:'100%', background:'linear-gradient(180deg, #061a0b 0%, #0a1f10 100%)', color:'white', overflowX:'hidden', position:'relative' }}>
      <style>{`
        * { scroll-behavior: smooth; }

        .glass {
          background: rgba(7,20,11,0.72);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(74,222,128,0.16);
          box-shadow: 0 10px 35px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.03);
        }

        .glass-soft {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }

        .hero-grid {
          background-image:
            linear-gradient(rgba(74,222,128,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,222,128,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .gradient-text {
          background: linear-gradient(90deg, #bbf7d0 0%, #ffffff 45%, #bbf7d0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cyan-glow { box-shadow: 0 0 80px rgba(74,222,128,0.18); }

        .floating {
          animation: float 8s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .section-title {
          font-size: clamp(2rem,4vw,3rem);
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .ambient {
          position: absolute;
          border-radius: 999px;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }

        .card-hover {
          transition: all .35s ease;
        }

        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(134,239,172,0.32);
        }

        .tab-nav {
          display: flex;
          gap: 0;
          border-bottom: 1px solid rgba(74,222,128,0.16);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tab-nav::-webkit-scrollbar { display: none; }

        .tab-btn {
          padding: 16px 28px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          border: none;
          background: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: rgba(255,255,255,0.8);
        }

        .tab-btn.active {
          color: #86efac;
          border-bottom-color: #86efac;
        }

        .expandable {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .expandable:hover {
          transform: translateX(4px);
        }

        .progress-ring {
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }

        @media (max-width: 768px) {
          .tab-btn { padding: 12px 20px; font-size: 11px; }
        }
      `}</style>

      <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none" />

      <div className="ambient w-[520px] h-[520px] bg-cyan-400 top-[-120px] left-[-100px]" />
      <div className="ambient w-[420px] h-[420px] bg-emerald-400 bottom-[5%] right-[-120px]" />

      {/* HEADER */}
      <header style={{ background: '#0a2012' }} className="relative px-6 md:px-14 xl:px-20 pt-12 pb-8 border-b border-cyan-400/10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full px-5 py-2 glass text-[11px] uppercase tracking-[0.32em] text-cyan-100 mb-4">
              Living Classrooms Foundation • DOEE Grant Proposal • FY2024-2028
            </div>
            <h1 className="gradient-text text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.95] tracking-[-0.05em]">
              Kingman Island Green Infrastructure<br />
              Workforce Development Program
            </h1>
            <p className="mt-4 text-slate-400 text-sm uppercase tracking-wider">
              Watershed Restoration & Education Project
            </p>
          </div>
          <div className="glass rounded-[1.8rem] p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70 mb-2">Contact</div>
            <div className="text-lg font-bold">Doug Siglin</div>
            <div className="text-sm text-slate-300">Regional Director, NCR</div>
            <div className="text-xs text-slate-400 mt-2">202-997-7399</div>
            <div className="text-xs text-cyan-300">dsiglin@livingclassroomsdc.org</div>
          </div>
        </div>
      </header>

      {/* HERO METRICS */}
      <section className="relative px-6 md:px-14 xl:px-20 py-8 border-b border-cyan-400/10">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((item, idx) => (
            <div key={idx} className="glass rounded-[1.8rem] p-6 cyan-glow card-hover">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">
                {item.label}
              </div>
              <div className="mt-3 text-4xl font-black">{item.value}</div>
              <div className="text-xs text-slate-400 mt-2">{item.subtext}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RFP METADATA */}
      <section id="rfp-metadata" className="relative px-6 md:px-14 xl:px-20 py-8 border-b border-cyan-400/10">
        <div className="glass rounded-[2rem] p-8">
          <div className="text-xs uppercase tracking-[0.28em] text-cyan-200 mb-6">Solicitation Information</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            {[
              ['Solicitation Number', 'DOEE-OCTO-GI-FY2024-001', 'text-cyan-300'],
              ['Issuing Agency', 'DC Dept. of Energy & Environment (DOEE)', 'text-slate-200'],
              ['Program Title', 'Stormwater GI Workforce Development Grant', 'text-slate-200'],
              ['Submission Deadline', 'March 31, 2024 — 5:00 PM EST', 'text-amber-300'],
              ['Grant Period', 'October 1, 2024 – September 30, 2028', 'text-slate-200'],
              ['Total Funding Available', '$400,000 (Four-Year Award)', 'text-emerald-300'],
              ['Eligible Applicants', 'DC-based 501(c)(3) Nonprofits', 'text-slate-200'],
              ['Point of Contact', 'DOEE Office of Contracts & Procurement', 'text-slate-200'],
              ['CFDA Number', '66.460 — Nonpoint Source Implementation', 'text-slate-200'],
            ].map(([label, value, colorClass]) => (
              <div key={label} className="glass-soft rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                <div className={`font-semibold ${colorClass}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION NAV */}
      <div style={{ position:'sticky', top:0, zIndex:50 }} className="glass border-b border-cyan-400/10">
        <div className="px-6 md:px-14 xl:px-20">
          <nav style={{ display:'flex', gap:0, borderBottom:'none', overflowX:'auto' }} className="scrollbar-hide">
            {[['#overview','Overview'],['#program','Program'],['#budget','Budget'],['#impact','Impact'],['#partners','Partners'],['#justification','Justification']].map(([href, label]) => (
              <a key={href} href={href} style={{ padding:'14px 22px', fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600, border:'none', background:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', borderBottom:'2px solid transparent', textDecoration:'none', whiteSpace:'nowrap', display:'block', transition:'color 0.3s' }}
                onMouseEnter={e => { e.target.style.color='rgba(255,255,255,0.8)'; }}
                onMouseLeave={e => { e.target.style.color='rgba(255,255,255,0.5)'; }}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="relative">

        {/* SECTION 01: OVERVIEW */}
        <section id="overview" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(74,222,128,0.1)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(74,222,128,0.08)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(134,239,172,0.7)', marginBottom:'0.5rem' }}>Section 01</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Program Overview</div>
          </div>
          <div className="space-y-10">
            {/* Hero Image + Summary */}
            <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="relative floating">
                <div className="relative h-full min-h-[520px] overflow-hidden rounded-[2.5rem] border border-cyan-300/20">
                  <img
                    src="https://images.squarespace-cdn.com/content/v1/5c365ed8f93fd43123a41bd6/1620402582676-9KDVS9JBX2JMDN2743EJ/Arial+view.jpg?format=1500w"
                    className="absolute inset-0 h-full w-full object-cover"
                    alt="Kingman Island Aerial View"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061a0b] via-[#061a0b]/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 glass rounded-[2rem] p-6">
                    <div className="text-xs uppercase tracking-[0.28em] text-cyan-200 mb-3">
                      Project Focus Area
                    </div>
                    <div className="text-3xl font-black">Kingman & Heritage Islands</div>
                    <p className="mt-3 text-slate-300 leading-7 text-[15px]">
                      120-acre ecological restoration corridor within the Anacostia River system,
                      managed by Living Classrooms since 2009, serving as outdoor classroom for
                      environmental education, workforce development, and watershed stewardship.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2rem] p-8 h-fit">
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-200 mb-4">
                  Executive Summary
                </div>
                <h2 className="section-title mb-6">Learning By Doing</h2>
                <div className="space-y-5 text-slate-300 leading-8 text-[15px]">
                  <p>
                    Living Classrooms Foundation, in partnership with the University of the District
                    of Columbia, proposes an innovative four-year workforce training program providing
                    15-20 young adults annually with National Green Infrastructure Certification
                    Program (NGICP) credentials and direct employment pathways.
                  </p>
                  <p>
                    This initiative addresses critical District needs: stormwater management workforce
                    capacity, impervious surface reduction, watershed protection, and environmental
                    justice through targeted youth employment in green infrastructure operations.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    <div className="glass-soft rounded-3xl p-5">
                      <div className="text-sm text-cyan-100 mb-2 font-semibold">Target Audience</div>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li>• Ages 18–24</li>
                        <li>• DC Residents (Wards 5-8 focus)</li>
                        <li>• GED / High School Diploma</li>
                        <li>• CASA Assessment screening</li>
                      </ul>
                    </div>
                    <div className="glass-soft rounded-3xl p-5">
                      <div className="text-sm text-cyan-100 mb-2 font-semibold">District Outcomes</div>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li>• 4.2M gallons water captured annually</li>
                        <li>• 160 rain garden maintenance cycles</li>
                        <li>• 1 acre invasive species removal</li>
                        <li>• 10+ workforce placements/year</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Visual */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass rounded-[2rem] p-8 text-center">
                <div className="text-6xl font-black text-cyan-300 mb-3">66</div>
                <div className="text-sm uppercase tracking-wider text-slate-400">
                  Active NGICP Certifications in DC
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  500+ nationwide through UDC partnership
                </div>
              </div>
              <div className="glass rounded-[2rem] p-8 text-center">
                <div className="text-6xl font-black text-emerald-300 mb-3">14+</div>
                <div className="text-sm uppercase tracking-wider text-slate-400">
                  Years Managing Kingman Island
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Since 2009 under Living Classrooms stewardship
                </div>
              </div>
              <div className="glass rounded-[2rem] p-8 text-center">
                <div className="text-6xl font-black text-purple-300 mb-3">4,700+</div>
                <div className="text-sm uppercase tracking-wider text-slate-400">
                  Annual Visitors Served
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Through environmental education programs
                </div>
              </div>
            </div>

            {/* Deliverables Grid */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-6">
                Core Program Deliverables
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-soft rounded-2xl p-6 expandable"
                    onClick={() => setExpandedDeliverable(expandedDeliverable === idx ? null : idx)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-lg font-bold mb-2 text-cyan-100">{item.title}</div>
                        <div className="text-xs text-emerald-300 font-mono mb-3">▸ {item.metric}</div>
                        {expandedDeliverable === idx && (
                          <div className="text-sm text-slate-300 leading-relaxed mt-3 border-t border-white/10 pt-3">
                            {item.detail}
                          </div>
                        )}
                      </div>
                      <div className="text-cyan-400 text-xl">
                        {expandedDeliverable === idx ? '−' : '+'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: PROGRAM DETAILS */}
        <section id="program" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(74,222,128,0.1)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(74,222,128,0.08)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(134,239,172,0.7)', marginBottom:'0.5rem' }}>Section 02</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Program Architecture</div>
          </div>
          <div className="space-y-10">
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                Program Architecture
              </div>
              <h2 className="section-title mb-10">Three-Phase Implementation Model</h2>

              <div className="space-y-8">
                {phases.map((phase, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className="glass-soft rounded-2xl p-6 expandable"
                      onClick={() => setExpandedPhase(expandedPhase === idx ? null : idx)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="h-10 w-10 rounded-full bg-cyan-300/20 border-2 border-cyan-300 flex items-center justify-center text-cyan-300 font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="text-2xl font-black">{phase.title}</div>
                              <div className="text-xs text-cyan-300 font-mono mt-1">{phase.weeks}</div>
                            </div>
                          </div>
                          <div className="text-slate-300 leading-7 text-[15px] ml-14">
                            {phase.body}
                          </div>
                        </div>
                        <div className="text-cyan-400 text-2xl">
                          {expandedPhase === idx ? '−' : '+'}
                        </div>
                      </div>

                      {expandedPhase === idx && (
                        <div className="ml-14 border-t border-white/10 pt-6 space-y-4">
                          <div>
                            <div className="text-sm font-semibold text-cyan-100 mb-3">Key Activities:</div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {phase.activities.map((activity, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shrink-0" />
                                  <div className="text-sm text-slate-300">{activity}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-xl bg-emerald-400/10 border border-emerald-300/20 p-4">
                            <div className="text-sm font-semibold text-emerald-100 mb-2">Expected Outcomes:</div>
                            <div className="text-sm text-slate-300">{phase.outcomes}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience Details */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                  Recruitment Criteria
                </div>
                <h3 className="text-3xl font-black mb-6">Candidate Assessment Process</h3>
                <div className="space-y-6">
                  <div className="glass-soft rounded-xl p-5">
                    <div className="font-bold mb-2 text-cyan-100">Initial Pool</div>
                    <div className="text-3xl font-black mb-2">~30 Candidates</div>
                    <div className="text-sm text-slate-300">
                      Gathered through early interest events, high school senior outreach, and advertised functions
                    </div>
                  </div>
                  <div className="glass-soft rounded-xl p-5">
                    <div className="font-bold mb-2 text-cyan-100">Information Sessions</div>
                    <div className="text-3xl font-black mb-2">2 Required</div>
                    <div className="text-sm text-slate-300">
                      Mandatory attendance at one of two sessions covering program expectations and requirements
                    </div>
                  </div>
                  <div className="glass-soft rounded-xl p-5">
                    <div className="font-bold mb-2 text-cyan-100">CASA Assessment</div>
                    <div className="text-3xl font-black mb-2">Math & Reading</div>
                    <div className="text-sm text-slate-300">
                      Baseline skills evaluation to ensure participant readiness for technical curriculum
                    </div>
                  </div>
                  <div className="glass-soft rounded-xl p-5 border-2 border-emerald-300/30">
                    <div className="font-bold mb-2 text-emerald-100">Final Cohort</div>
                    <div className="text-3xl font-black mb-2">15-20 Selected</div>
                    <div className="text-sm text-slate-300">
                      Participants receive case worker, metro cards, wraparound support services
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="glass rounded-[2rem] p-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                    Support Services
                  </div>
                  <h3 className="text-2xl font-black mb-6">Wraparound Model</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">🎯</span>
                      </div>
                      <div>
                        <div className="font-semibold text-cyan-100 mb-1">Case Worker Assignment</div>
                        <div className="text-sm text-slate-300">
                          Individual support from recruitment through post-employment placement
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">🚇</span>
                      </div>
                      <div>
                        <div className="font-semibold text-cyan-100 mb-1">Transportation Assistance</div>
                        <div className="text-sm text-slate-300">
                          Metro cards provided for all program-related activities and field work
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">💼</span>
                      </div>
                      <div>
                        <div className="font-semibold text-cyan-100 mb-1">Job Readiness Training</div>
                        <div className="text-sm text-slate-300">
                          Resume building, interview prep, professional development coaching
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">🌱</span>
                      </div>
                      <div>
                        <div className="font-semibold text-cyan-100 mb-1">Ongoing Career Support</div>
                        <div className="text-sm text-slate-300">
                          Post-program networking, advancement opportunities, alumni engagement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <img
                  src="https://caseytrees.org/wp-content/uploads/2022/09/kingman-rangers-1024x512.png"
                  className="rounded-[2rem] object-cover h-[280px] w-full border border-cyan-300/20"
                  alt="Kingman Rangers in training"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: BUDGET & TIMELINE */}
        <section id="budget" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(74,222,128,0.1)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(74,222,128,0.08)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(134,239,172,0.7)', marginBottom:'0.5rem' }}>Section 03</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Budget & Financial Plan</div>
          </div>
          <div className="space-y-10">
            <div className="glass rounded-[2rem] p-8">
              <div className="flex flex-wrap items-center justify-between gap-5 mb-8">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-3">
                    Financial Planning
                  </div>
                  <div className="section-title">Four-Year Budget Allocation</div>
                  <div className="text-slate-400 text-sm mt-2">Total Request: $400,000</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-[1.8rem] border border-white/10 mb-8">
                <table className="w-full min-w-[920px] text-left">
                  <thead className="bg-cyan-400/10 text-cyan-100 uppercase tracking-[0.2em] text-xs">
                    <tr>
                      <th className="p-5">Category</th>
                      <th className="p-5">Year 1</th>
                      <th className="p-5">Year 2</th>
                      <th className="p-5">Year 3</th>
                      <th className="p-5">Year 4</th>
                      <th className="p-5">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {budgetData.map((row, idx) => (
                      <tr key={idx} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-5 font-semibold">{row.category}</td>
                        <td className="p-5">${row.yr1.toLocaleString()}</td>
                        <td className="p-5">${row.yr2.toLocaleString()}</td>
                        <td className="p-5">${row.yr3.toLocaleString()}</td>
                        <td className="p-5">${row.yr4.toLocaleString()}</td>
                        <td className="p-5 font-bold text-cyan-100">${row.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-cyan-300/30 font-bold text-lg">
                      <td className="p-5">TOTAL</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr1, 0).toLocaleString()}</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr2, 0).toLocaleString()}</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr3, 0).toLocaleString()}</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr4, 0).toLocaleString()}</td>
                      <td className="p-5 text-cyan-300">$400,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-soft rounded-xl p-6">
                  <div className="text-xs uppercase tracking-wider text-cyan-200 mb-2">Personnel</div>
                  <div className="text-4xl font-black mb-2">$293K</div>
                  <div className="text-sm text-slate-300">
                    Program coordinators, field instructors, case workers, admin support (73%)
                  </div>
                </div>
                <div className="glass-soft rounded-xl p-6">
                  <div className="text-xs uppercase tracking-wider text-emerald-200 mb-2">Equipment & Operations</div>
                  <div className="text-4xl font-black mb-2">$88K</div>
                  <div className="text-sm text-slate-300">
                    Field equipment, monitoring tools, maintenance supplies (22%)
                  </div>
                </div>
                <div className="glass-soft rounded-xl p-6">
                  <div className="text-xs uppercase tracking-wider text-purple-200 mb-2">Education & Support</div>
                  <div className="text-4xl font-black mb-2">$60K</div>
                  <div className="text-sm text-slate-300">
                    NGICP curriculum, certification fees, training materials (15%)
                  </div>
                </div>
              </div>
            </div>

            {/* In-Kind Match */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                  In-Kind Contributions
                </div>
                <h3 className="text-3xl font-black mb-6">Non-Cash Match Value</h3>
                <div className="space-y-4">
                  {[
                    { item: 'Kingman Island Facility Access', value: 'Site use, infrastructure, outdoor classroom space' },
                    { item: 'Volunteer Network Hours', value: 'Established partner volunteer coordination and support' },
                    { item: 'Case Management Services', value: 'Wraparound support infrastructure and systems' },
                    { item: 'Recruitment Infrastructure', value: 'Screening, assessment, placement facilitation' },
                    { item: 'Educational Partnerships', value: 'UDC curriculum access, instructor coordination' },
                  ].map((item, idx) => (
                    <div key={idx} className="glass-soft rounded-xl p-4 flex justify-between items-start gap-4">
                      <div>
                        <div className="font-semibold text-cyan-100 mb-1">{item.item}</div>
                        <div className="text-sm text-slate-300">{item.value}</div>
                      </div>
                      <div className="text-emerald-300 text-2xl">✓</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-[2rem] p-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                    Annual Timeline
                  </div>
                  <h3 className="text-2xl font-black mb-6">52-Week Program Cycle</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-24 bg-cyan-400/30 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-cyan-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-cyan-300">Weeks 1-4:</span> Recruitment
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-24 bg-emerald-400/30 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-emerald-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-emerald-300">Weeks 5-36:</span> Training & Certification
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-24 bg-purple-400/30 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-purple-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-purple-300">Weeks 37-52:</span> Employment Integration
                      </div>
                    </div>
                  </div>
                </div>

                <img
                  src="https://images.squarespace-cdn.com/content/v1/61dca93540574b05602e6466/13daa2bd-a3fe-4f79-8092-a36054c4cb48/20220422_114451.jpg"
                  className="rounded-[2rem] object-cover h-[240px] w-full border border-cyan-300/20"
                  alt="Field work training"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: IMPACT METRICS */}
        <section id="impact" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(74,222,128,0.1)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(74,222,128,0.08)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(134,239,172,0.7)', marginBottom:'0.5rem' }}>Section 04</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Impact Metrics & Outcomes</div>
          </div>
          <div className="space-y-10">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Water Retention Chart */}
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                  Environmental Impact
                </div>
                <h3 className="text-3xl font-black mb-6">Annual Water Capture Trends</h3>
                <SvgLineChart
                  data={waterRetentionData}
                  xKey="year"
                  yKey="gallons"
                  color="#86efac"
                  yLabel="Million Gallons"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-cyan-400/10 border border-cyan-300/20 p-4">
                    <div className="text-xs text-cyan-200 uppercase tracking-wider mb-1">Current</div>
                    <div className="text-3xl font-black">4.2M</div>
                    <div className="text-xs text-slate-400 mt-1">Gallons/year (2023)</div>
                  </div>
                  <div className="rounded-xl bg-emerald-400/10 border border-emerald-300/20 p-4">
                    <div className="text-xs text-emerald-200 uppercase tracking-wider mb-1">Projected</div>
                    <div className="text-3xl font-black">4.5M</div>
                    <div className="text-xs text-slate-400 mt-1">Gallons/year (2024)</div>
                  </div>
                </div>
              </div>

              {/* Program Performance */}
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                  Program Performance
                </div>
                <h3 className="text-3xl font-black mb-6">Success Metrics</h3>
                <div className="space-y-6">
                  {impactMetrics.map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">{metric.name}</span>
                        <span className="text-lg font-bold" style={{ color: metric.color }}>
                          {metric.value}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${metric.value}%`,
                            background: metric.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantifiable Measures */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-6">
                Annual Measurable Outcomes
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Participants Trained', value: '15-20', unit: 'Young Adults', color: 'cyan' },
                  { label: 'Employment Placements', value: '10+', unit: 'Within 3 Months', color: 'emerald' },
                  { label: 'Rain Garden Maintenance', value: '160', unit: 'Quarterly Cycles', color: 'blue' },
                  { label: 'Invasive Species Removal', value: '1 Acre', unit: 'Annual Goal', color: 'purple' },
                  { label: 'Stream Monitoring Sites', value: '11', unit: 'Active Locations', color: 'pink' },
                  { label: 'NGICP Certifications', value: '70%+', unit: 'Pass Rate', color: 'orange' },
                ].map((item, idx) => (
                  <div key={idx} className="glass-soft rounded-xl p-6 text-center">
                    <div className="text-xs uppercase tracking-wider text-slate-400 mb-3">
                      {item.label}
                    </div>
                    <div className={`text-5xl font-black mb-2 text-${item.color}-300`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-slate-400">{item.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Impact */}
            <div className="grid lg:grid-cols-3 gap-6">
              <img
                src="https://wtop.com/wp-content/uploads/2020/12/kingman_5-1672x1254.jpg"
                className="rounded-[2rem] object-cover h-[280px] w-full border border-cyan-300/20"
                alt="Watershed education"
              />
              <img
                src="https://doee.dc.gov/sites/default/files/dc/sites/ddoe/Kingman%20ariel3.jpg"
                className="rounded-[2rem] object-cover h-[280px] w-full border border-cyan-300/20"
                alt="Aerial restoration view"
              />
              <img
                src="https://wtop.com/wp-content/uploads/2020/12/kingman_1-e1606970267753.jpg"
                className="rounded-[2rem] object-cover h-[280px] w-full border border-cyan-300/20"
                alt="Educational programming"
              />
            </div>
          </div>
        </section>

        {/* SECTION 05: PARTNERS & HISTORY */}
        <section id="partners" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(74,222,128,0.1)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(74,222,128,0.08)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(134,239,172,0.7)', marginBottom:'0.5rem' }}>Section 05</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Strategic Partnerships & History</div>
          </div>
          <div className="space-y-10">
            {/* Key Partners */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-6">
                Strategic Partnerships
              </div>
              <div className="space-y-6">
                {partnerOrgs.map((partner, idx) => (
                  <div key={idx} className="glass-soft rounded-xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-cyan-100 mb-2">{partner.name}</h4>
                        <div className="text-sm text-emerald-300 font-semibold">{partner.role}</div>
                      </div>
                      <div className="text-xs text-slate-400">{partner.contact}</div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      {partner.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shrink-0" />
                          <div className="text-sm text-slate-300">{resp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grant History */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                Track Record
              </div>
              <h3 className="text-3xl font-black mb-6">Recent DC Government Grant History</h3>
              <div className="text-sm text-slate-300 mb-6">
                All grant requirements have been fulfilled according to agreements. No disputes, investigations, or audits on record.
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-cyan-400/10 text-cyan-100 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 text-left">Year</th>
                      <th className="p-4 text-left">Agency</th>
                      <th className="p-4 text-left">Amount</th>
                      <th className="p-4 text-left">Purpose</th>
                      <th className="p-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-300">
                    {pastGrants.map((grant, idx) => (
                      <tr key={idx} className="border-t border-white/5 hover:bg-white/5">
                        <td className="p-4">{grant.year}</td>
                        <td className="p-4 font-semibold">{grant.agency}</td>
                        <td className="p-4 text-emerald-300 font-mono">{grant.amount}</td>
                        <td className="p-4">{grant.purpose}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs">
                            {grant.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Personnel */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                  Leadership Team
                </div>
                <h3 className="text-2xl font-black mb-6">Key Personnel</h3>
                <div className="space-y-5">
                  {[
                    { name: 'Doug Siglin', title: 'Managing Director, NCR', exp: '37+ years in DC environmental policy' },
                    { name: 'Lee Cain', title: 'Director, Kingman Island', exp: '13 years directing Anacostia programs' },
                    { name: 'Teresa Martin', title: 'Outreach & Education Coordinator', exp: 'Social work & environmental education since 2014' },
                    { name: 'Jasmine Campbell', title: 'Director, Workforce Development', exp: 'NYC and Baltimore workforce program experience' },
                    { name: 'Dr. Dwane Jones', title: 'UDC Acting Dean', exp: 'College of Agriculture & Environmental Science' },
                    { name: 'Dr. Kamran Zendehdel', title: 'UDC Professor', exp: 'Center for Sustainable Development' },
                  ].map((person, idx) => (
                    <div key={idx} className="pb-4 border-b border-white/10 last:border-0">
                      <div className="font-bold text-cyan-100 mb-1">{person.name}</div>
                      <div className="text-sm text-emerald-300 mb-1">{person.title}</div>
                      <div className="text-xs text-slate-400">{person.exp}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-[2rem] p-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                    Organizational Profile
                  </div>
                  <h3 className="text-2xl font-black mb-6">Living Classrooms Foundation</h3>
                  <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                    <p>
                      Founded in Baltimore in 1985, Living Classrooms opened its National Capital Region
                      affiliate in 2001. The organization serves thousands of DC children, youth, and adults
                      through hands-on outdoor environmental education and career training programs.
                    </p>
                    <p>
                      Most programs target students from Title I schools and residents of Wards 5, 6, 7, and 8,
                      with a focus on environmental justice and workforce equity.
                    </p>
                  </div>
                </div>

                <img
                  src="https://images.squarespace-cdn.com/content/v1/61dca93540574b05602e6466/424a4579-2307-4e62-b871-4423e8678584/1000014318.jpg"
                  className="rounded-[2rem] object-cover h-[240px] w-full border border-cyan-300/20"
                  alt="Living Classrooms programs"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 06: JUSTIFICATION */}
        <section id="justification" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(74,222,128,0.1)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(74,222,128,0.08)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(134,239,172,0.7)', marginBottom:'0.5rem' }}>Section 06</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Funding Justification & Policy Alignment</div>
          </div>
          <div className="space-y-10">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                  Continuing Funding Justification
                </div>
                <h2 className="section-title mb-8">Why This Program Deserves Investment</h2>
                <div className="space-y-6 text-slate-300 leading-8 text-[15px]">
                  <p>
                    Living Classrooms has demonstrated measurable operational success through watershed education,
                    environmental restoration, trail maintenance, workforce training deployments, and DOEE-supported
                    sustainability initiatives across Kingman Island since 2009.
                  </p>
                  <p>
                    <strong className="text-cyan-100">Proven Track Record:</strong> Our pilot Green Infrastructure
                    training program solidified the critical need for GI workforce development to meet both environmental
                    and community goals within the District. We've successfully completed numerous DOEE and DDOT grants
                    with zero disputes or audit issues.
                  </p>
                  <p>
                    <strong className="text-cyan-100">Scalable Model:</strong> Continued investment allows us to scale
                    beyond pilot implementation and establish stable environmental workforce infrastructure directly aligned
                    with District resilience and stormwater mitigation priorities outlined in Sustainable DC 2.0.
                  </p>
                  <p>
                    <strong className="text-cyan-100">Dual Benefit:</strong> This proposal positions Kingman Island as both
                    a public-facing environmental education campus AND an operational green infrastructure workforce hub
                    producing measurable environmental outcomes and employment placements for DC youth.
                  </p>
                  <p>
                    <strong className="text-cyan-100">Alignment with District Goals:</strong> The program directly supports
                    MS4 compliance, impervious surface reduction, Anacostia River restoration, environmental justice
                    expansion, and workforce development in high-need wards.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-[2rem] p-6 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 border-cyan-300/30">
                  <div className="text-xs uppercase tracking-wider text-cyan-200 mb-3">Policy Alignment</div>
                  <h4 className="text-xl font-black mb-4">Regulatory Support</h4>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-300 mt-0.5">✓</span>
                      <span>DOEE Stormwater Management Regulations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-300 mt-0.5">✓</span>
                      <span>Clean Water Act Objectives</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-300 mt-0.5">✓</span>
                      <span>Sustainable DC 2.0 Goals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-300 mt-0.5">✓</span>
                      <span>Anacostia River Restoration Strategy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-300 mt-0.5">✓</span>
                      <span>MS4 Permit Compliance Support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-300 mt-0.5">✓</span>
                      <span>Environmental Justice Expansion</span>
                    </li>
                  </ul>
                </div>

                <img
                  src="https://images.squarespace-cdn.com/content/v1/60300e73eaa16a54d368dfa5/1617369128283-QT2EY2UV51912SP3PLRQ/Kingman+Bridge_newly+built.jpg"
                  className="rounded-[2rem] object-cover h-[280px] w-full border border-cyan-300/20"
                  alt="Kingman Bridge infrastructure"
                />

                <img
                  src="https://images.squarespace-cdn.com/content/v1/61dca93540574b05602e6466/5941fbf6-0dec-45e9-ac09-c79a35fe2993/20220610_120233+%281%29.jpg"
                  className="rounded-[2rem] object-cover h-[280px] w-full border border-cyan-300/20"
                  alt="Field education activities"
                />
              </div>
            </div>

            {/* Historical Context */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-200 mb-4">
                Historical Context
              </div>
              <h3 className="text-3xl font-black mb-6">
                From Commercial Development to Ecological Restoration Corridor
              </h3>
              <div className="space-y-6 text-slate-300 leading-8 text-[15px]">
                <p>
                  Kingman Island evolved from a historically proposed commercial development corridor into one of
                  Washington DC's most important urban ecological restoration landscapes. Environmental advocacy and
                  public stewardship redirected the site toward sustainability, watershed restoration, and environmental
                  education beginning in the 1990s.
                </p>
                <p>
                  Since assuming management operations in 2009, Living Classrooms has transformed the 120-acre corridor
                  into a functioning outdoor classroom integrating STEM education, restoration deployment, trail systems,
                  stewardship initiatives, habitat recovery, and workforce development. The site now serves over 4,700
                  visitors annually through educational programming.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="glass-soft rounded-xl p-5 text-center">
                    <div className="text-4xl font-black text-cyan-300 mb-2">120</div>
                    <div className="text-sm text-slate-400">Acres Under Management</div>
                  </div>
                  <div className="glass-soft rounded-xl p-5 text-center">
                    <div className="text-4xl font-black text-emerald-300 mb-2">14+</div>
                    <div className="text-sm text-slate-400">Years of Stewardship</div>
                  </div>
                  <div className="glass-soft rounded-xl p-5 text-center">
                    <div className="text-4xl font-black text-purple-300 mb-2">2009</div>
                    <div className="text-sm text-slate-400">Management Start Year</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative px-6 md:px-14 xl:px-20 py-12 border-t border-cyan-400/10">
        <div className="glass rounded-[2rem] p-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-cyan-200 mb-2">Grant Proposal Document</div>
              <div className="text-2xl font-black mb-3">
                Watershed Restoration & Green Infrastructure Job Training Program
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                <div>Living Classrooms Foundation • National Capital Region</div>
                <div>802 S. Caroline Street, Baltimore, MD 21231-3332</div>
                <div>Prepared for: DC Department of Energy & Environment (DOEE)</div>
                <div>Grant Period: 4 Years • Funding Request: $400,000</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-2">Analysis & Design</div>
              <div className="font-bold text-cyan-100">Lancelot Naipier-Kane</div>
              <div className="text-sm text-slate-400">Data Analyst & Policy Researcher</div>
              <div className="text-xs text-slate-500 mt-2">lancelot-nk.github.io</div>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── PROJECT FOOTER ────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid #cccccc",
        marginTop: 40,
        padding: "18px 24px",
        background: "#f9f9f7",
        fontFamily: "'Trebuchet MS','Gill Sans',Tahoma,sans-serif",
        fontSize: 12,
        color: "#555550",
        lineHeight: 1.7,
      }}>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Lancelot Napier-Kane</strong> &nbsp;·&nbsp;
          Tools: React, SVG &nbsp;·&nbsp;
          Methods: RFP documentation, infrastructure planning, cost-benefit analysis &nbsp;·&nbsp;
          Sources: NYC Parks Department, public infrastructure records
        </p>
      </div>
    </div>
  );
}