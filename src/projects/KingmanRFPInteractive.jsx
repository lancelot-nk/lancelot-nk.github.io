import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

// ── Recharts Area Chart (replaces inline SVG chart) ─────────────────────────
function SvgLineChart({ data, xKey, yKey, color = '#2d7a4f', yLabel = '' }) {
  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="kingmanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 3" stroke="rgba(45,106,79,0.12)"/>
          <XAxis dataKey={xKey} tick={{fontSize:9, fill:'#475569'}}/>
          <YAxis tick={{fontSize:10, fill:'#475569'}} label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: -5, style: { fill:'#475569', fontSize:10 } }}/>
          <Tooltip content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div style={{ background:'rgba(240,250,245,0.97)', border:'1px solid rgba(45,106,79,0.3)', borderRadius:6, padding:'8px 12px', fontSize:11 }}>
                  <div style={{ color:'#1a5c3a', fontWeight:600, marginBottom:2 }}>{label}</div>
                  <div style={{ color:'#0d3b1e' }}>{payload[0].value}M gal</div>
                </div>
              );
            }
            return null;
          }}/>
          <Area type="monotone" dataKey={yKey} stroke={color} fill="url(#kingmanAreaGrad)" strokeWidth={2.5} activeDot={{ r: 6, stroke:'rgba(240,250,245,0.9)', strokeWidth:2 }}/>
        </AreaChart>
      </ResponsiveContainer>
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
    { name: 'Participant Training', value: 85, color: '#1a5c3a' },
    { name: 'Employment Placement', value: 70, color: '#2d7a4f' },
    { name: 'Certification Success', value: 90, color: '#2d7a4f' },
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

  const COLORS = ['#1a5c3a', '#2d7a4f', '#2d7a4f', '#a78bfa', '#f472b6', '#fb923c'];

  return (
    <div className="kingman-root" style={{ width:'100%', maxWidth:'100%', background:'linear-gradient(180deg, #f0faf5 0%, #ddf2e8 40%, #c8ecda 100%)', color:'#0d3b1e', overflowX:'hidden', position:'relative' }}>
      <style>{`
        @media (max-width: 640px) {
          .kingman-root table { min-width: unset !important; width: 100% !important; font-size: 11px !important; }
          .kingman-root table td, .kingman-root table th { padding: 4px 6px !important; }
          .kingman-root .tab-btn { padding: 8px 10px !important; font-size: 10px !important; }
        }
      `}</style>
      <style>{`
        * { scroll-behavior: smooth; }

        .glass {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(45,106,79,0.2);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .glass-soft {
          background: rgba(240,250,245,0.7);
          border: 1px solid rgba(45,106,79,0.12);
          backdrop-filter: blur(12px);
        }

        .hero-grid {
          background-image:
            linear-gradient(rgba(45,106,79,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,106,79,0.07) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .gradient-text {
          background: linear-gradient(90deg, #1a5c3a 0%, #0d3b1e 45%, #1a5c3a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cyan-glow { box-shadow: 0 0 80px rgba(45,106,79,0.18); }

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
          border-color: rgba(45,106,79,0.32);
        }

        .tab-nav {
          display: flex;
          gap: 0;
          border-bottom: 1px solid rgba(45,106,79,0.2);
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
          color: rgba(13,59,30,0.55);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: rgba(13,59,30,0.85);
        }

        .tab-btn.active {
          color: #1a5c3a;
          border-bottom-color: #1a5c3a;
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

      <div className="ambient w-[520px] h-[520px] bg-teal-400 top-[-120px] left-[-100px]" />
      <div className="ambient w-[420px] h-[420px] bg-emerald-300 bottom-[5%] right-[-120px]" />

      {/* HEADER */}
      <header className="relative px-6 md:px-14 xl:px-20 pt-12 pb-10 border-b border-emerald-700/20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a5c3a 0%, #0d3b1e 60%, #194d35 100%)' }}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Ambient glow blobs */}
        <div className="absolute top-[-60px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-40px] left-[10%] w-[240px] h-[240px] rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full px-5 py-2 mb-4" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#bbf7d0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.32em' }}>
              🌿 Living Classrooms Foundation · DOEE Grant Proposal · FY2024–2028
            </div>
            <h1 className="text-white text-[clamp(2.2rem,5.5vw,4rem)] font-black leading-[0.95] tracking-[-0.04em]">
              Kingman Island Green Infrastructure<br />
              <span style={{ color: '#86efac' }}>Workforce Development Program</span>
            </h1>
            <p className="mt-4 text-[13px] uppercase tracking-[0.18em]" style={{ color: 'rgba(187,247,208,0.75)' }}>
              Watershed Restoration &amp; Community Education Project · Anacostia River, Washington D.C.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {['$4.2M DOEE Grant', 'Carbon Sequestration', 'Workforce Training', '3,200 Native Plantings'].map(tag => (
                <span key={tag} className="text-[11px] px-3 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.18)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[1.8rem] p-6 shrink-0" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)', minWidth: 200 }}>
            <div className="text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: 'rgba(187,247,208,0.7)' }}>Project Contact</div>
            <div className="text-lg font-bold text-white">Doug Siglin</div>
            <div className="text-sm mt-0.5" style={{ color: 'rgba(187,247,208,0.8)' }}>Regional Director, NCR</div>
            <div className="text-xs mt-3" style={{ color: 'rgba(187,247,208,0.65)' }}>202-997-7399</div>
            <div className="text-xs mt-1" style={{ color: '#86efac' }}>dsiglin@livingclassroomsdc.org</div>
          </div>
        </div>
      </header>

      {/* HERO METRICS */}
      <section className="relative px-6 md:px-14 xl:px-20 py-8 border-b border-emerald-700/15">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((item, idx) => (
            <div key={idx} className="glass rounded-[1.8rem] p-6 cyan-glow card-hover">
              <div className="text-[11px] uppercase tracking-[0.24em] text-teal-700/80">
                {item.label}
              </div>
              <div className="mt-3 text-4xl font-black">{item.value}</div>
              <div className="text-xs text-slate-800 mt-2">{item.subtext}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RFP METADATA */}
      <section id="rfp-metadata" className="relative px-6 md:px-14 xl:px-20 py-8 border-b border-emerald-700/15">
        <div className="glass rounded-[2rem] p-8">
          <div className="text-xs uppercase tracking-[0.28em] text-teal-700 mb-6">Solicitation Information</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            {[
              ['Solicitation Number', 'DOEE-OCTO-GI-FY2024-001', 'text-teal-700'],
              ['Issuing Agency', 'DC Dept. of Energy & Environment (DOEE)', 'text-slate-800'],
              ['Program Title', 'Stormwater GI Workforce Development Grant', 'text-slate-800'],
              ['Submission Deadline', 'March 31, 2024 — 5:00 PM EST', 'text-amber-700'],
              ['Grant Period', 'October 1, 2024 – September 30, 2028', 'text-slate-800'],
              ['Total Funding Available', '$400,000 (Four-Year Award)', 'text-emerald-700'],
              ['Eligible Applicants', 'DC-based 501(c)(3) Nonprofits', 'text-slate-800'],
              ['Point of Contact', 'DOEE Office of Contracts & Procurement', 'text-slate-800'],
              ['CFDA Number', '66.460 — Nonpoint Source Implementation', 'text-slate-800'],
            ].map(([label, value, colorClass]) => (
              <div key={label} className="glass-soft rounded-xl p-4">
                <div className="text-xs text-slate-800 uppercase tracking-wider mb-1">{label}</div>
                <div className={`font-semibold ${colorClass}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION NAV */}
      <div style={{ position:'sticky', top:0, zIndex:50 }} className="glass border-b border-emerald-700/20">
        <div className="px-6 md:px-14 xl:px-20">
          <nav style={{ display:'flex', gap:0, borderBottom:'none', overflowX:'auto' }} className="scrollbar-hide">
            {[['#overview','Overview'],['#program','Program'],['#budget','Budget'],['#impact','Impact'],['#partners','Partners'],['#justification','Justification']].map(([href, label]) => (
              <a key={href} href={href} style={{ padding:'14px 22px', fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600, border:'none', background:'none', color:'rgba(13,59,30,0.55)', cursor:'pointer', borderBottom:'2px solid transparent', textDecoration:'none', whiteSpace:'nowrap', display:'block', transition:'color 0.3s' }}
                onMouseEnter={e => { e.target.style.color='rgba(13,59,30,0.85)'; }}
                onMouseLeave={e => { e.target.style.color='rgba(13,59,30,0.55)'; }}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="relative">

        {/* SECTION 01: OVERVIEW */}
        <section id="overview" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(45,106,79,0.15)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(45,106,79,0.1)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(26,92,58,0.8)', marginBottom:'0.5rem' }}>Section 01</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Program Overview</div>
          </div>
          <div className="space-y-10">
            {/* Hero Image + Summary */}
            <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="relative floating">
                <div className="relative h-full min-h-[520px] overflow-hidden rounded-[2.5rem] border border-emerald-700/15">
                  <img
                    src="https://images.squarespace-cdn.com/content/v1/5c365ed8f93fd43123a41bd6/1620402582676-9KDVS9JBX2JMDN2743EJ/Arial+view.jpg?format=1500w"
                    className="absolute inset-0 h-full w-full object-cover"
                    alt="Kingman Island Aerial View"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d3b1e]/60 via-[#0d3b1e]/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 glass rounded-[2rem] p-6">
                    <div className="text-xs uppercase tracking-[0.28em] text-teal-700 mb-3">
                      Project Focus Area
                    </div>
                    <div className="text-3xl font-black">Kingman & Heritage Islands</div>
                    <p className="mt-3 text-slate-800 leading-7 text-[15px]">
                      120-acre ecological restoration corridor within the Anacostia River system,
                      managed by Living Classrooms since 2009, serving as outdoor classroom for
                      environmental education, workforce development, and watershed stewardship.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2rem] p-8 h-fit">
                <div className="text-xs uppercase tracking-[0.28em] text-teal-700 mb-4">
                  Executive Summary
                </div>
                <h2 className="section-title mb-6">Learning By Doing</h2>
                <div className="space-y-5 text-slate-800 leading-8 text-[15px]">
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
                      <div className="text-sm text-teal-800 mb-2 font-semibold">Target Audience</div>
                      <ul className="space-y-2 text-sm text-slate-800">
                        <li>• Ages 18–24</li>
                        <li>• DC Residents (Wards 5-8 focus)</li>
                        <li>• GED / High School Diploma</li>
                        <li>• CASA Assessment screening</li>
                      </ul>
                    </div>
                    <div className="glass-soft rounded-3xl p-5">
                      <div className="text-sm text-teal-800 mb-2 font-semibold">District Outcomes</div>
                      <ul className="space-y-2 text-sm text-slate-800">
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
                <div className="text-6xl font-black text-teal-600 mb-3">66</div>
                <div className="text-sm uppercase tracking-wider text-slate-800">
                  Active NGICP Certifications in DC
                </div>
                <div className="text-xs text-slate-800 mt-2">
                  500+ nationwide through UDC partnership
                </div>
              </div>
              <div className="glass rounded-[2rem] p-8 text-center">
                <div className="text-6xl font-black text-emerald-700 mb-3">14+</div>
                <div className="text-sm uppercase tracking-wider text-slate-800">
                  Years Managing Kingman Island
                </div>
                <div className="text-xs text-slate-800 mt-2">
                  Since 2009 under Living Classrooms stewardship
                </div>
              </div>
              <div className="glass rounded-[2rem] p-8 text-center">
                <div className="text-6xl font-black text-purple-600 mb-3">4,700+</div>
                <div className="text-sm uppercase tracking-wider text-slate-800">
                  Annual Visitors Served
                </div>
                <div className="text-xs text-slate-800 mt-2">
                  Through environmental education programs
                </div>
              </div>
            </div>

            {/* Deliverables Grid */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-6">
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
                        <div className="text-lg font-bold mb-2 text-teal-800">{item.title}</div>
                        <div className="text-xs text-emerald-700 font-mono mb-3">▸ {item.metric}</div>
                        {expandedDeliverable === idx && (
                          <div className="text-sm text-slate-800 leading-relaxed mt-3 border-t border-slate-200 pt-3">
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
        <section id="program" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(45,106,79,0.15)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(45,106,79,0.1)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(26,92,58,0.8)', marginBottom:'0.5rem' }}>Section 02</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Program Architecture</div>
          </div>
          <div className="space-y-10">
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
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
                            <div className="h-10 w-10 rounded-full bg-cyan-300/20 border-2 border-cyan-300 flex items-center justify-center text-teal-600 font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="text-2xl font-black">{phase.title}</div>
                              <div className="text-xs text-teal-600 font-mono mt-1">{phase.weeks}</div>
                            </div>
                          </div>
                          <div className="text-slate-700 leading-7 text-[15px] ml-14">
                            {phase.body}
                          </div>
                        </div>
                        <div className="text-cyan-400 text-2xl">
                          {expandedPhase === idx ? '−' : '+'}
                        </div>
                      </div>

                      {expandedPhase === idx && (
                        <div className="ml-14 border-t border-slate-200 pt-6 space-y-4">
                          <div>
                            <div className="text-sm font-semibold text-teal-800 mb-3">Key Activities:</div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {phase.activities.map((activity, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shrink-0" />
                                  <div className="text-sm text-slate-800">{activity}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-xl bg-emerald-100/50 border border-emerald-300/20 p-4">
                            <div className="text-sm font-semibold text-emerald-800 mb-2">Expected Outcomes:</div>
                            <div className="text-sm text-slate-800">{phase.outcomes}</div>
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
                <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                  Recruitment Criteria
                </div>
                <h3 className="text-3xl font-black mb-6">Candidate Assessment Process</h3>
                <div className="space-y-6">
                  <div className="glass-soft rounded-xl p-5">
                    <div className="font-bold mb-2 text-teal-800">Initial Pool</div>
                    <div className="text-3xl font-black mb-2">~30 Candidates</div>
                    <div className="text-sm text-slate-800">
                      Gathered through early interest events, high school senior outreach, and advertised functions
                    </div>
                  </div>
                  <div className="glass-soft rounded-xl p-5">
                    <div className="font-bold mb-2 text-teal-800">Information Sessions</div>
                    <div className="text-3xl font-black mb-2">2 Required</div>
                    <div className="text-sm text-slate-800">
                      Mandatory attendance at one of two sessions covering program expectations and requirements
                    </div>
                  </div>
                  <div className="glass-soft rounded-xl p-5">
                    <div className="font-bold mb-2 text-teal-800">CASA Assessment</div>
                    <div className="text-3xl font-black mb-2">Math & Reading</div>
                    <div className="text-sm text-slate-800">
                      Baseline skills evaluation to ensure participant readiness for technical curriculum
                    </div>
                  </div>
                  <div className="glass-soft rounded-xl p-5 border-2 border-emerald-300/30">
                    <div className="font-bold mb-2 text-emerald-800">Final Cohort</div>
                    <div className="text-3xl font-black mb-2">15-20 Selected</div>
                    <div className="text-sm text-slate-800">
                      Participants receive case worker, metro cards, wraparound support services
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="glass rounded-[2rem] p-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                    Support Services
                  </div>
                  <h3 className="text-2xl font-black mb-6">Wraparound Model</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">🎯</span>
                      </div>
                      <div>
                        <div className="font-semibold text-teal-800 mb-1">Case Worker Assignment</div>
                        <div className="text-sm text-slate-800">
                          Individual support from recruitment through post-employment placement
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">🚇</span>
                      </div>
                      <div>
                        <div className="font-semibold text-teal-800 mb-1">Transportation Assistance</div>
                        <div className="text-sm text-slate-800">
                          Metro cards provided for all program-related activities and field work
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">💼</span>
                      </div>
                      <div>
                        <div className="font-semibold text-teal-800 mb-1">Job Readiness Training</div>
                        <div className="text-sm text-slate-800">
                          Resume building, interview prep, professional development coaching
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                        <span className="text-cyan-300">🌱</span>
                      </div>
                      <div>
                        <div className="font-semibold text-teal-800 mb-1">Ongoing Career Support</div>
                        <div className="text-sm text-slate-800">
                          Post-program networking, advancement opportunities, alumni engagement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <img
                  src="https://caseytrees.org/wp-content/uploads/2022/09/kingman-rangers-1024x512.png"
                  className="rounded-[2rem] object-cover h-[280px] w-full border border-emerald-700/15"
                  alt="Kingman Rangers in training"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: BUDGET & TIMELINE */}
        <section id="budget" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(45,106,79,0.15)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(45,106,79,0.1)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(26,92,58,0.8)', marginBottom:'0.5rem' }}>Section 03</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Budget & Financial Plan</div>
          </div>
          <div className="space-y-10">
            <div className="glass rounded-[2rem] p-8">
              <div className="flex flex-wrap items-center justify-between gap-5 mb-8">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-3">
                    Financial Planning
                  </div>
                  <div className="section-title">Four-Year Budget Allocation</div>
                  <div className="text-slate-700 text-sm mt-2">Total Request: $400,000</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-[1.8rem] border border-slate-200 mb-8">
                <table className="w-full min-w-[920px] text-left">
                  <thead className="bg-emerald-100/60 text-teal-800 uppercase tracking-[0.2em] text-xs">
                    <tr>
                      <th className="p-5">Category</th>
                      <th className="p-5">Year 1</th>
                      <th className="p-5">Year 2</th>
                      <th className="p-5">Year 3</th>
                      <th className="p-5">Year 4</th>
                      <th className="p-5">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {budgetData.map((row, idx) => (
                      <tr key={idx} className="border-t border-slate-200/70 hover:bg-emerald-100/30 transition-colors">
                        <td className="p-5 font-semibold">{row.category}</td>
                        <td className="p-5">${row.yr1.toLocaleString()}</td>
                        <td className="p-5">${row.yr2.toLocaleString()}</td>
                        <td className="p-5">${row.yr3.toLocaleString()}</td>
                        <td className="p-5">${row.yr4.toLocaleString()}</td>
                        <td className="p-5 font-bold text-teal-800">${row.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-emerald-700/20 font-bold text-lg">
                      <td className="p-5">TOTAL</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr1, 0).toLocaleString()}</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr2, 0).toLocaleString()}</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr3, 0).toLocaleString()}</td>
                      <td className="p-5">${budgetData.reduce((sum, r) => sum + r.yr4, 0).toLocaleString()}</td>
                      <td className="p-5 text-teal-600">$400,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-soft rounded-xl p-6">
                  <div className="text-xs uppercase tracking-wider text-teal-700 mb-2">Personnel</div>
                  <div className="text-4xl font-black mb-2">$293K</div>
                  <div className="text-sm text-slate-800">
                    Program coordinators, field instructors, case workers, admin support (73%)
                  </div>
                </div>
                <div className="glass-soft rounded-xl p-6">
                  <div className="text-xs uppercase tracking-wider text-emerald-700 mb-2">Equipment & Operations</div>
                  <div className="text-4xl font-black mb-2">$88K</div>
                  <div className="text-sm text-slate-800">
                    Field equipment, monitoring tools, maintenance supplies (22%)
                  </div>
                </div>
                <div className="glass-soft rounded-xl p-6">
                  <div className="text-xs uppercase tracking-wider text-purple-200 mb-2">Education & Support</div>
                  <div className="text-4xl font-black mb-2">$60K</div>
                  <div className="text-sm text-slate-800">
                    NGICP curriculum, certification fees, training materials (15%)
                  </div>
                </div>
              </div>
            </div>

            {/* In-Kind Match */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
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
                        <div className="font-semibold text-teal-800 mb-1">{item.item}</div>
                        <div className="text-sm text-slate-800">{item.value}</div>
                      </div>
                      <div className="text-emerald-600 text-2xl">✓</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-[2rem] p-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                    Annual Timeline
                  </div>
                  <h3 className="text-2xl font-black mb-6">52-Week Program Cycle</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-24 bg-teal-200/40 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-cyan-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-teal-600">Weeks 1-4:</span> Recruitment
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-24 bg-emerald-200/50 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-emerald-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-emerald-700">Weeks 5-36:</span> Training & Certification
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-24 bg-purple-400/30 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-purple-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-purple-600">Weeks 37-52:</span> Employment Integration
                      </div>
                    </div>
                  </div>
                </div>

                <img
                  src="https://images.squarespace-cdn.com/content/v1/61dca93540574b05602e6466/13daa2bd-a3fe-4f79-8092-a36054c4cb48/20220422_114451.jpg"
                  className="rounded-[2rem] object-cover h-[240px] w-full border border-emerald-700/15"
                  alt="Field work training"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: IMPACT METRICS */}
        <section id="impact" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(45,106,79,0.15)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(45,106,79,0.1)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(26,92,58,0.8)', marginBottom:'0.5rem' }}>Section 04</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Impact Metrics & Outcomes</div>
          </div>
          <div className="space-y-10">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Water Retention Chart */}
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                  Environmental Impact
                </div>
                <h3 className="text-3xl font-black mb-6">Annual Water Capture Trends</h3>
                <SvgLineChart
                  data={waterRetentionData}
                  xKey="year"
                  yKey="gallons"
                  color="#2d7a4f"
                  yLabel="Million Gallons"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-100/60 border border-emerald-700/20 p-4">
                    <div className="text-xs text-teal-700 uppercase tracking-wider mb-1">Current</div>
                    <div className="text-3xl font-black">4.2M</div>
                    <div className="text-xs text-slate-800 mt-1">Gallons/year (2023)</div>
                  </div>
                  <div className="rounded-xl bg-emerald-100/50 border border-emerald-300/20 p-4">
                    <div className="text-xs text-emerald-700 uppercase tracking-wider mb-1">Projected</div>
                    <div className="text-3xl font-black">4.5M</div>
                    <div className="text-xs text-slate-800 mt-1">Gallons/year (2024)</div>
                  </div>
                </div>
              </div>

              {/* Program Performance */}
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
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
                      <div className="h-3 bg-emerald-100/30 rounded-full overflow-hidden">
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
              <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-6">
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
                    <div className="text-xs uppercase tracking-wider text-slate-800 mb-3">
                      {item.label}
                    </div>
                    <div className={`text-5xl font-black mb-2 text-${item.color}-300`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-slate-800">{item.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Impact */}
            <div className="grid lg:grid-cols-3 gap-6">
              <img
                src="https://wtop.com/wp-content/uploads/2020/12/kingman_5-1672x1254.jpg"
                className="rounded-[2rem] object-cover h-[280px] w-full border border-emerald-700/15"
                alt="Watershed education"
              />
              <img
                src="https://doee.dc.gov/sites/default/files/dc/sites/ddoe/Kingman%20ariel3.jpg"
                className="rounded-[2rem] object-cover h-[280px] w-full border border-emerald-700/15"
                alt="Aerial restoration view"
              />
              <img
                src="https://wtop.com/wp-content/uploads/2020/12/kingman_1-e1606970267753.jpg"
                className="rounded-[2rem] object-cover h-[280px] w-full border border-emerald-700/15"
                alt="Educational programming"
              />
            </div>
          </div>
        </section>

        {/* SECTION 05: PARTNERS & HISTORY */}
        <section id="partners" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(45,106,79,0.15)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(45,106,79,0.1)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(26,92,58,0.8)', marginBottom:'0.5rem' }}>Section 05</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Strategic Partnerships & History</div>
          </div>
          <div className="space-y-10">
            {/* Key Partners */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-6">
                Strategic Partnerships
              </div>
              <div className="space-y-6">
                {partnerOrgs.map((partner, idx) => (
                  <div key={idx} className="glass-soft rounded-xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-teal-800 mb-2">{partner.name}</h4>
                        <div className="text-sm text-emerald-700 font-semibold">{partner.role}</div>
                      </div>
                      <div className="text-xs text-slate-800">{partner.contact}</div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      {partner.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shrink-0" />
                          <div className="text-sm text-slate-800">{resp}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grant History */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                Track Record
              </div>
              <h3 className="text-3xl font-black mb-6">Recent DC Government Grant History</h3>
              <div className="text-sm text-slate-800 mb-6">
                All grant requirements have been fulfilled according to agreements. No disputes, investigations, or audits on record.
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-emerald-100/60 text-teal-800 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 text-left">Year</th>
                      <th className="p-4 text-left">Agency</th>
                      <th className="p-4 text-left">Amount</th>
                      <th className="p-4 text-left">Purpose</th>
                      <th className="p-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-800">
                    {pastGrants.map((grant, idx) => (
                      <tr key={idx} className="border-t border-slate-200/70 hover:bg-emerald-100/30">
                        <td className="p-4">{grant.year}</td>
                        <td className="p-4 font-semibold">{grant.agency}</td>
                        <td className="p-4 text-emerald-700 font-mono">{grant.amount}</td>
                        <td className="p-4">{grant.purpose}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
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
                <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
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
                    <div key={idx} className="pb-4 border-b border-slate-200 last:border-0">
                      <div className="font-bold text-teal-800 mb-1">{person.name}</div>
                      <div className="text-sm text-emerald-700 mb-1">{person.title}</div>
                      <div className="text-xs text-slate-800">{person.exp}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-[2rem] p-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                    Organizational Profile
                  </div>
                  <h3 className="text-2xl font-black mb-6">Living Classrooms Foundation</h3>
                  <div className="space-y-4 text-sm text-slate-800 leading-relaxed">
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
                  className="rounded-[2rem] object-cover h-[240px] w-full border border-emerald-700/15"
                  alt="Living Classrooms programs"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 06: JUSTIFICATION */}
        <section id="justification" style={{ position:'relative', paddingBottom:'4rem', borderBottom:'1px solid rgba(45,106,79,0.15)' }} className="px-6 md:px-14 xl:px-20 py-12">
          <div style={{ padding:'2rem 0 1.5rem', borderBottom:'1px solid rgba(45,106,79,0.1)', marginBottom:'2rem' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.32em', color:'rgba(26,92,58,0.8)', marginBottom:'0.5rem' }}>Section 06</div>
            <div style={{ fontSize:'clamp(1.5rem,3vw,2.5rem)', fontWeight:900, letterSpacing:'-0.04em' }}>Funding Justification & Policy Alignment</div>
          </div>
          <div className="space-y-10">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="glass rounded-[2rem] p-8">
                <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                  Continuing Funding Justification
                </div>
                <h2 className="section-title mb-8">Why This Program Deserves Investment</h2>
                <div className="space-y-6 text-slate-800 leading-8 text-[15px]">
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
                <div className="glass rounded-[2rem] p-6 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 border-emerald-700/20">
                  <div className="text-xs uppercase tracking-wider text-teal-700 mb-3">Policy Alignment</div>
                  <h4 className="text-xl font-black mb-4">Regulatory Support</h4>
                  <ul className="space-y-3 text-sm text-slate-800">
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 mt-0.5">✓</span>
                      <span>DOEE Stormwater Management Regulations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 mt-0.5">✓</span>
                      <span>Clean Water Act Objectives</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 mt-0.5">✓</span>
                      <span>Sustainable DC 2.0 Goals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 mt-0.5">✓</span>
                      <span>Anacostia River Restoration Strategy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 mt-0.5">✓</span>
                      <span>MS4 Permit Compliance Support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 mt-0.5">✓</span>
                      <span>Environmental Justice Expansion</span>
                    </li>
                  </ul>
                </div>

                <img
                  src="https://images.squarespace-cdn.com/content/v1/60300e73eaa16a54d368dfa5/1617369128283-QT2EY2UV51912SP3PLRQ/Kingman+Bridge_newly+built.jpg"
                  className="rounded-[2rem] object-cover h-[280px] w-full border border-emerald-700/15"
                  alt="Kingman Bridge infrastructure"
                />

                <img
                  src="https://images.squarespace-cdn.com/content/v1/61dca93540574b05602e6466/5941fbf6-0dec-45e9-ac09-c79a35fe2993/20220610_120233+%281%29.jpg"
                  className="rounded-[2rem] object-cover h-[280px] w-full border border-emerald-700/15"
                  alt="Field education activities"
                />
              </div>
            </div>

            {/* Historical Context */}
            <div className="glass rounded-[2rem] p-8">
              <div className="text-xs uppercase tracking-[0.26em] text-teal-700 mb-4">
                Historical Context
              </div>
              <h3 className="text-3xl font-black mb-6">
                From Commercial Development to Ecological Restoration Corridor
              </h3>
              <div className="space-y-6 text-slate-800 leading-8 text-[15px]">
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
                    <div className="text-4xl font-black text-teal-600 mb-2">120</div>
                    <div className="text-sm text-slate-800">Acres Under Management</div>
                  </div>
                  <div className="glass-soft rounded-xl p-5 text-center">
                    <div className="text-4xl font-black text-emerald-700 mb-2">14+</div>
                    <div className="text-sm text-slate-800">Years of Stewardship</div>
                  </div>
                  <div className="glass-soft rounded-xl p-5 text-center">
                    <div className="text-4xl font-black text-purple-600 mb-2">2009</div>
                    <div className="text-sm text-slate-800">Management Start Year</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative px-6 md:px-14 xl:px-20 py-12 border-t border-emerald-700/20">
        <div className="glass rounded-[2rem] p-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-teal-700 mb-2">Grant Proposal Document</div>
              <div className="text-2xl font-black mb-3">
                Watershed Restoration & Green Infrastructure Job Training Program
              </div>
              <div className="text-sm text-slate-800 space-y-1">
                <div>Living Classrooms Foundation • National Capital Region</div>
                <div>802 S. Caroline Street, Baltimore, MD 21231-3332</div>
                <div>Prepared for: DC Department of Energy & Environment (DOEE)</div>
                <div>Grant Period: 4 Years • Funding Request: $400,000</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-800 mb-2">Analysis & Design</div>
              <div className="font-bold text-teal-800">Lancelot Naipier-Kane</div>
              <div className="text-sm text-slate-800">Data Analyst & Policy Researcher</div>
              <div className="text-xs text-slate-800 mt-2">lancelot-nk.github.io</div>
            </div>
          </div>
        </div>
      </footer>

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
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), SVG (site diagram rendering), ArcGIS (site feasibility layer analysis), AutoCAD Civil 3D (referenced site plan data), Python (cost estimation modeling), NYC EDC procurement system schema, FEMA FIRMette flood map data
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> Federal and NYC procurement-compliant RFP structure per NYC Comptroller's directives; site feasibility analysis using FEMA FIRM floodplain classification and NYC DEP stormwater zone data; infrastructure cost estimation via RSMeans unit cost database with NYC borough adjustment factors; environmental impact screening per NYC CEQR Technical Manual; community engagement framework aligned with NYC DCP public review process; Kingman Island ecological restoration constraints per NYC Parks Natural Areas Conservancy standards; contract scope, milestones, and deliverables formatted per NYC City Record RFP conventions; cost figures and site data are simulated for demonstration against published NYC EDC procurement frameworks
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> NYC Parks Department Kingman Island ecological restoration records; NYC EDC RFP documentation standards; NYC City Record procurement guidelines; FEMA National Flood Insurance Program FIRM panel data; NYC DEP Green Infrastructure program documentation; RSMeans 2024 construction cost database; NYC CEQR Technical Manual; site and cost data simulated based on publicly available NYC Parks and EDC frameworks
        </p>
      </div>
    </div>
  );
}