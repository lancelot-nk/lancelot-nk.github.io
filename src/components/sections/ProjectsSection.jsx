import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, Code, Clock, ExternalLink, Maximize2, X } from 'lucide-react';
import JsxViewer from '../JsxViewer';

// Lazy-load heavy viewers only when first expanded
const IpynbViewer          = lazy(() => import('../IpynbViewer'));
const LazyPrimeFields      = lazy(() => import('../../projects/PrimeFields'));
const LazyInterestSwap     = lazy(() => import('../../projects/InterestSwapReport'));
const LazyMockHRA          = lazy(() => import('../../projects/MockHRA'));
const LazyOilTrainRisk     = lazy(() => import('../../projects/OilTrainRiskDC'));
const LazyNYCEvents        = lazy(() => import('../../projects/NYCEventsSimulation'));
const LazySolarDonor       = lazy(() => import('../../projects/SolarDonorIntelligence'));
const LazyFinOpsDash       = lazy(() => import('../../projects/FinOpsDashboard'));
const LazyHomelessSvc      = lazy(() => import('../../projects/HomelessServicesDashboard'));
const LazyLytxCSM          = lazy(() => import('../../projects/LytxCSMExample'));
const LazyKingmanRFP       = lazy(() => import('../../projects/KingmanRFPInteractive'));
const LazyHRAFraud         = lazy(() => import('../../projects/HRAFraudAuditTool'));
const LazyHRABudget        = lazy(() => import('../../projects/HRABudgetVarianceEngine'));
const LazyEventsConversion = lazy(() => import('../../projects/EventsConversion'));
const LazyMASIP            = lazy(() => import('../../projects/MASIPDashboard'));
const LazyPeerReport       = lazy(() => import('../../projects/PeerReportSimulation'));
const LazyNYCEventsAnnual  = lazy(() => import('../../projects/NYCEventsAnnualReport'));
const LazyFedGrant         = lazy(() => import('../../projects/FedGrantAndDataWarehouse'));
const LazyARCGIS           = lazy(() => import('../../projects/ARCGIScaseviewer'));
const LazyNISTAudit        = lazy(() => import('../../projects/NISTcyberAudit'));
const LazyOilTrainReport   = lazy(() => import('../../projects/OilTrainInteractiveReport'));
const LazyNEPAReview       = lazy(() => import('../../projects/NEPALiteratureReview'));
const LazySalesMatrix      = lazy(() => import('../../projects/SalesMatrix'));
const LazyB2BChurn         = lazy(() => import('../../projects/B2BChurn'));
const LazyGreenWorkforce   = lazy(() => import('../../projects/GREENworkforcetracker'));
const LazyNGOBudget        = lazy(() => import('../../projects/NGOBudgetTracker'));
const LazySHEAnnual        = lazy(() => import('../../projects/SHEAnnualInteractive'));
const LazyFXBInteractive   = lazy(() => import('../../projects/FXBInteractive'));
const LazyMalariaBiomedical = lazy(() => import('../../projects/MalariaBiomedical3D'));
const LazyElectroLarynx    = lazy(() => import('../../projects/realfinalelectrolarynx'));
const LazyDAW              = lazy(() => import('../../projects/nearfinaldaw'));

// ── Image Imports ────────────────────────────────────────────────────────────
import img1 from '../../assets/project1.jpg';
import img2 from '../../assets/project2.jpg';
import img3 from '../../assets/project3.jpg';
import img4 from '../../assets/project4.jpg';
import img5 from '../../assets/project_prime_fields.png';
import img6 from '../../assets/project_interest_swap.jpg';
import img7 from '../../assets/project_mock_hra.jpg';
import img8 from '../../assets/project_oil_train.jpg';
import img9  from '../../assets/project_nyc_events.jpg';
import img10 from '../../assets/project_solar_donor.jpg';
import img11 from '../../assets/project_finops.jpg';
import img12 from '../../assets/project_homeless_services.jpg';
import img13 from '../../assets/project_lytx_csm.jpg';
import img14 from '../../assets/project_kingman_rfp.jpg';
import img15 from '../../assets/project_hra_fraud.jpg';
import img16 from '../../assets/project_budget.jpg';
import imgNIST from '../../assets/project_nist_cyber.jpg';
import imgARCGIS from '../../assets/project_arcgis_wa.jpg';
import imgFedGrant from '../../assets/project_federal_grant.jpg';
import imgMASIP from '../../assets/project_masip.jpg';
import imgCompliance from '../../assets/project_compliance.jpg';
import imgFunnel from '../../assets/project_events_funnel.jpg';
import imgNEPA from '../../assets/project_nepa.jpg';
import imgRail from '../../assets/project_rail.jpg';
import imgSalesMatrix from '../../assets/project_sales_matrix.jpg';
import imgB2BChurn from '../../assets/project_b2b_churn.jpg';
import imgHRAIntegrity from '../../assets/project_hra_integrity.jpg';
import imgGreenWorkforce from '../../assets/project_green_workforce.jpg';
import imgNGOBudget from '../../assets/project_ngo_budget.jpg';
import imgSHEAnnual from '../../assets/project_she_annual.jpg';
import imgFXBInteractive from '../../assets/project_fxb_interactive.jpg';
import imgMalariaBiomedical from '../../assets/project_malaria_biomedical.jpg';
import imgElectroLarynx from '../../assets/project_electrolarynx.jpg';
import imgDAW from '../../assets/project_daw.jpg';

// ── Brand Colors ─────────────────────────────────────────────────────────────
const PINK   = '#B8004E';
const VIOLET = '#5800B8';
const DEEP   = '#0F001E';
const MID    = '#320040';
const SOFT   = '#6A0A50';
const BORDER = 'rgba(184,0,78,0.22)';

export const PROJECTS = [
  {
    title: 'Mock NYC HRA SNAP System',
    desc: 'Simulated NYC Human Resources Administration intake & case management — SNAP eligibility determination, pipeline kanban, and compliance analytics.',
    tech: ['React', 'Tailwind', 'Social Policy', 'Government Systems', 'Data Simulation'],
    link: '/mock_hra.jsx',
    type: 'jsx',
    component: LazyMockHRA,
    img: img7,
  },
  {
    title: 'FinOps Cloud Cost Dashboard',
    desc: 'Multi-cloud FinOps console — billing centers with monthly spend analysis, anomaly detection, risk audit, allocation maps, and rolling forecast charts across AWS, Azure, and GCP.',
    tech: ['React', 'FinOps', 'AWS', 'Azure', 'GCP', 'NIST CSF', 'Cloud Governance'],
    link: '/finops_dashboard.jsx',
    type: 'jsx',
    component: LazyFinOpsDash,
    img: img11,
  },
  {
    title: 'ArcGIS WA Human Services Mapping Tool',
    desc: 'Washington State geospatial human services operational platform — ArcGIS county-level client case mapping, housing stability scoring, outreach coverage modeling, program performance analytics, equity metrics, service saturation indices, and policy impact simulation for homelessness response.',
    tech: ['React', 'TypeScript', 'ArcGIS', 'GeoPandas', 'PostGIS', 'Washington State', 'DSHS', 'Human Services', 'Spatial Analytics'],
    link: '/arcgis_case_viewer.jsx',
    type: 'jsx',
    component: LazyARCGIS,
    img: imgARCGIS,
  },
  {
    title: 'NIST Cybersecurity Audit & Continuity Simulator',
    desc: 'Federal-grade NIST cybersecurity operations environment — FISMA system monitoring, RMF lifecycle management, ATO authorization pipeline, CVE vulnerability tracking, COOP scenario simulation, supply chain risk assessment, and incident response phase tracking across federal enclaves.',
    tech: ['React', 'TypeScript', 'NIST 800-53', 'FISMA', 'FedRAMP', 'RMF', 'COOP', 'Incident Response', 'Cybersecurity'],
    link: '/nist_cyber_audit.jsx',
    type: 'jsx',
    component: LazyNISTAudit,
    img: imgNIST,
  },
  {
    title: 'Homeless Services Case Management',
    desc: 'Simulated HMIS-style backend for homeless services — client intake, shelter bed tracking, case management pipeline, outcome reporting, and compliance analytics modeled on real municipal systems.',
    tech: ['React', 'HMIS', 'Social Services', 'Case Management', 'Government Systems'],
    link: '/homeless_services_dashboard.jsx',
    type: 'jsx',
    component: LazyHomelessSvc,
    img: img12,
  },
  {
    title: 'Federal Grant & Data Warehouse (SENTINEL)',
    desc: 'Federal grant lifecycle management and data warehouse platform — multi-agency project tracking, financial compliance scoring, NIST RMF audit trails, burn rate analytics, risk flagging, and FedRAMP-authorized grant intelligence.',
    tech: ['React', 'TypeScript', 'Federal Grants', 'NIST 800-53', 'FedRAMP', 'Data Warehouse', 'Government'],
    link: '/fed_grant_data_warehouse.jsx',
    type: 'jsx',
    component: LazyFedGrant,
    img: imgFedGrant,
  },
  {
    title: 'HRA Sovereign Integrity Engine',
    desc: 'War-room fraud detection system for NYC HRA SNAP/EBT — live case triage, NIST-800-53 compliance matrix, RPA operations command, ISO 8583 packet inspection, advanced intel modules (SIG, DMF, Device Fingerprint, Subpoena Drafter), and kernel audit log. Real $7.6B budget oversight.',
    tech: ['React', 'NIST-800-53', 'EBT Fraud', 'HRA', 'SNAP', 'RPA', 'ISO 8583', 'NYC Government'],
    link: '/hra_fraud_audit_tool.jsx',
    type: 'jsx',
    component: LazyHRAFraud,
    img: imgHRAIntegrity,
  },
  {
    title: 'HRA SNAP Budget Variance Engine',
    desc: "Federal SNAP benefit issuance analytics engine — FY2025 COLA allotment calculations, 100K synthetic household simulation, over/under-issuance variance detection, borough breakdown, regulatory root cause analysis, and utilization gap modeling across NYC's 543K SNAP households.",
    tech: ['React', 'SNAP Benefits', 'Federal Policy', 'USDA FNS', 'Budget Analytics', 'HRA', 'NYC Government'],
    link: '/hra_budget_variance_engine.jsx',
    type: 'jsx',
    component: LazyHRABudget,
    img: img16,
  },
  {
    title: 'NYC Events Management System',
    desc: 'Citywide event tracking and analytics platform — filterable event calendar, Cvent/Eventbrite/Partiful platform comparisons, borough heatmap, SQL schema architecture, and AI-style outcome assertions.',
    tech: ['React', 'SVG Charts', 'Cvent', 'Eventbrite', 'SQL', 'Event Analytics'],
    link: '/nyc_events_simulation.jsx',
    type: 'jsx',
    component: LazyNYCEvents,
    img: img9,
  },
  {
    title: 'NYC Events Outreach & Conversion Funnel',
    desc: 'Automated multi-channel outreach system for NYC event promotion — conversion funnel analytics, campaign performance tracking, lead management, channel attribution, and live attendee simulation.',
    tech: ['React', 'Recharts', 'CRM', 'Email Automation', 'Funnel Analytics', 'NYC Events'],
    link: '/events_conversion.jsx',
    type: 'jsx',
    component: LazyEventsConversion,
    img: imgFunnel,
  },
  {
    title: 'NYC Events FY2024 Annual Report',
    desc: "Interactive public-facing annual report for NYC Events & Community Data Program — FY2024 attendance analytics, borough breakdowns, monthly trends, funding allocation, platform performance, and outcomes scorecard across 847 events reaching 284K attendees.",
    tech: ['React', 'TypeScript', 'NYC Events', 'Annual Report', 'Data Visualization', 'Public Sector'],
    link: '/nyc_events_annual_report.jsx',
    type: 'jsx',
    component: LazyNYCEventsAnnual,
    img: img9,
  },
  {
    title: 'Multi-Agency Situational Intelligence Pipeline',
    desc: 'Federal-grade multi-agency data fusion platform — real-time agency sync dashboards, classified data stream monitoring, compliance scoring, pipeline architecture visualization, and cross-agency intelligence reporting.',
    tech: ['React', 'TypeScript', 'Federal Intelligence', 'Data Fusion', 'Compliance', 'API Integration'],
    link: '/masip_dashboard.jsx',
    type: 'jsx',
    component: LazyMASIP,
    img: imgMASIP,
  },
  {
    title: 'Peer Reporting & Compliance System (PRICAS)',
    desc: 'Internal agency compliance dashboard — anonymous peer report intake, multi-category triage queue, hotspot heatmap analysis, audit log, and multi-channel report submission workflow.',
    tech: ['React', 'TypeScript', 'Compliance Systems', 'Government Operations', 'Internal Audit'],
    link: '/peer_report_simulation.jsx',
    type: 'jsx',
    component: LazyPeerReport,
    img: imgCompliance,
  },
  {
    title: 'DC Oil Train Environmental Risk',
    desc: 'Government-grade risk analysis of crude-by-rail corridors through DC — interactive SVG map, waterway impact zones, population density, and regulatory compliance matrix.',
    tech: ['React', 'SVG Maps', 'Environmental Policy', 'Rail Safety', 'Government Analysis'],
    link: '/oil_train_risk_dc.jsx',
    type: 'jsx',
    component: LazyOilTrainRisk,
    img: img8,
  },
  {
    title: 'NoSQL NGO Donor Intelligence System',
    desc: 'Donor intelligence and prospect research platform for solar/clean energy — verified donor profiles, clout scoring, interest distribution analysis, and geographic targeting.',
    tech: ['React', 'Donor Analytics', 'Clean Energy', 'CRM Intelligence', 'Prospect Research'],
    link: '/solar_donor_intelligence.jsx',
    type: 'jsx',
    component: LazySolarDonor,
    img: img10,
  },
  {
    title: 'Green Workforce & Ecological Restoration Tracker',
    desc: 'Civic workforce development platform simulating Living Classrooms / DC DOEE green jobs program — participant pathway tracking, ecological site recovery metrics, grant disbursement monitoring, job readiness index scoring, and AmeriCorps cross-program integration.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Radix UI', 'Workforce Development', 'Civic Tech', 'Environmental Justice', 'AmeriCorps'],
    link: '/green_workforce_tracker.jsx',
    type: 'jsx',
    component: LazyGreenWorkforce,
    img: imgGreenWorkforce,
  },
  {
    title: 'NGO Program & Facilities Budget Audit System',
    desc: 'Civic grant financial oversight platform simulating Living Classrooms Foundation DC — program burn rate tracking, facility utilization scoring, expenditure compliance tagging, audit finding severity classification, grant drawdown monitoring, and fiscal efficiency indexing.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Framer Motion', 'Civic Finance', 'NGO', 'Grant Compliance', 'Audit', 'DOEE'],
    link: '/ngo_budget_tracker.jsx',
    type: 'jsx',
    component: LazyNGOBudget,
    img: imgNGOBudget,
  },
  {
    title: 'SHE 2019 Annual Report — Interactive Edition',
    desc: 'Interactive visualization of Solar Household Energy\'s 2019 Annual Report — impact metrics storytelling, donor program highlights, global reach mapping, photovoltaic program data, and nonprofit communications dashboard. Built from actual report content.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Nonprofit', 'Annual Report', 'Data Visualization', 'Donor Communications', 'Solar Energy'],
    link: '/she_annual_interactive.jsx',
    type: 'jsx',
    component: LazySHEAnnual,
    img: imgSHEAnnual,
  },
  {
    title: 'FXB Interactive Multi-Company Project Proposal',
    desc: 'Interactive multi-page proposal document for the Cociner@s Solares program — a SHE + FXB International solar cooking intervention across rural Oaxaca. 14-slide booklet with page-flip animation, budget tables, KPI framework, risk analysis, and partnership structure. Content from the actual March 2020 proposal.',
    tech: ['React', 'JSX', 'CSS Animations', 'Nonprofit', 'Solar Energy', 'Program Design', 'FXB International', 'Solar Household Energy', 'Oaxaca'],
    link: '/fxb_interactive.jsx',
    type: 'jsx',
    component: LazyFXBInteractive,
    img: imgFXBInteractive,
  },
  {
    title: 'Lytx Fleet Intelligence Platform',
    desc: 'Enterprise fleet CSM simulation — Salesforce-integrated command center with AI risk scoring, driver coaching decision trees, escalation engine, telematics dashboards, and renewal pipeline.',
    tech: ['React', 'Salesforce', 'Fleet Telematics', 'CSM', 'Enterprise SaaS', 'AI Risk Scoring'],
    link: '/lytx_csm_example.jsx',
    type: 'jsx',
    component: LazyLytxCSM,
    img: img13,
  },
  {
    title: 'Sales Team Hardware Compatibility & Need Matrix',
    desc: 'Interactive fleet telematics sales engineering matrix — J1939/OBD-II/CAN FD hardware compatibility scoring, CRM pipeline simulation, live telemetry event stream, and deal stage analytics for enterprise fleet accounts.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Fleet Telematics', 'Sales Engineering', 'CRM', 'J1939', 'OBD-II'],
    link: '/sales_matrix.jsx',
    type: 'jsx',
    component: LazySalesMatrix,
    img: imgSalesMatrix,
  },
  {
    title: 'B2B Target Tracker & Seasonal Churn Predictor',
    desc: 'Enterprise B2B SaaS churn prediction platform — account health scoring, rep performance matrix, renewal timeline visualization, churn forecasting with driver analysis, seasonal trend modeling, and AI-driven intervention recommendations.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Framer Motion', 'Churn Modeling', 'B2B SaaS', 'Sales Ops', 'Gainsight', 'Salesforce'],
    link: '/b2b_churn.jsx',
    type: 'jsx',
    component: LazyB2BChurn,
    img: imgB2BChurn,
  },
  {
    title: 'DC Oil Train Safety Interactive Report',
    desc: 'Continuous-scroll civic risk intelligence report — real-time rail corridor hazmat monitoring, tank car risk classification, community exposure modeling, weather-adjusted risk scoring, and incident tracking across DC-area rail infrastructure.',
    tech: ['React', 'TypeScript', 'FRA Data', 'PHMSA', 'Risk Modeling', 'Public Safety', 'Hazmat', 'Rail Safety'],
    link: '/oil_train_interactive_report.jsx',
    type: 'jsx',
    component: LazyOilTrainReport,
    img: imgRail,
  },
  {
    title: 'NEPA Urban Transport Literature Review',
    desc: 'Federal environmental research synthesis system — NEPA alignment scoring, thematic clustering, contradiction detection, evidence strength analysis, environmental justice metrics, and policy translation across FRA/FTA/EPA literature.',
    tech: ['React', 'TypeScript', 'NEPA', 'FRA', 'Environmental Justice', 'Literature Analysis', 'Policy Synthesis', 'DOT'],
    link: '/nepa_literature_review.jsx',
    type: 'jsx',
    component: LazyNEPAReview,
    img: imgNEPA,
  },
  {
    title: 'Kingman Island Green Infrastructure RFP',
    desc: 'Interactive DOEE grant proposal — workforce training program analysis with budget allocations, phase timelines, impact metrics, partner networks, and environmental outcome visualizations.',
    tech: ['React', 'SVG Charts', 'Grant Writing', 'Environmental Policy', 'Workforce Development', 'DC Government'],
    link: '/kingman_rfp_interactive.jsx',
    type: 'jsx',
    component: LazyKingmanRFP,
    img: img14,
  },
  {
    title: 'Python & Statistics Analysis',
    desc: 'Data analysis over a restaurant industry dataset applying statistical methods, data cleaning, and Python visualization.',
    tech: ['Python', 'Pandas', 'NumPy', 'Seaborn', 'Statistics'],
    link: '/PythonAndStats_LancelotNK.ipynb',
    img: img1,
  },
  {
    title: 'ML Recommendation System',
    desc: 'Machine learning model over an Amazon item dataset applying model tuning, Scikit-Learn pipelines, and evaluation metrics.',
    tech: ['Python', 'Scikit-Learn', 'ML', 'Model Tuning', 'Jupyter'],
    link: '/LancelotNaipierKaneRecommendationSystemsFullLearnerNotebookComplete%20(1).ipynb',
    img: img2,
  },
  {
    title: 'AI Music Recommendation',
    desc: 'AI-driven hybrid SVD system for music recommendation over a large dataset, applying deep learning and collaborative filtering.',
    tech: ['Python', 'AI', 'SVD', 'Deep Learning', 'NLP'],
    link: '/LancelotNaipierKane_Music_Recommendation_System_Full_Code%20(2).ipynb',
    img: img3,
  },
  {
    title: 'Azure SQL & Cloud Integration',
    desc: 'Hybrid BLOB storage architecture with Azure SQL and NoSQL over a Kaggle sales dataset, applying cloud ETL and data lake design.',
    tech: ['Azure', 'SQL', 'NoSQL', 'Blob Storage', 'ETL'],
    link: '/LancelotNaipierKaneAzureSqlNotebook.ipynb',
    img: img4,
  },
  {
    title: 'Interest Rate Swap Report',
    desc: 'Data-driven analysis of university interest rate swap losses post-2008 — LIBOR collapse, tuition impacts, and institutional timelines.',
    tech: ['React', 'Recharts', 'Finance', 'Data Analysis', 'Policy Research'],
    link: '/interest_swap_report.jsx',
    type: 'jsx',
    component: LazyInterestSwap,
    img: img6,
  },
  {
    title: 'Prime Field Functions',
    desc: 'Interactive explorer for ζ-weighted functions over ordered prime pairs — scatter plot and |F| heatmap views, complex plane analysis.',
    tech: ['React', 'Recharts', 'Complex Analysis', 'Number Theory', 'Visualization'],
    link: '/prime_fields.jsx',
    type: 'jsx',
    component: LazyPrimeFields,
    img: img5,
  },
  {
    title: 'Malaria Biomedical 3D Modeling System',
    desc: 'Interactive 3D visualization of P. falciparum cellular biology — rotatable RBC morphology, fluorescence microscopy, TEM cross-sections, SEIR infection dynamics, protein structure docking, and ML-based parasitemia detection. Built on Three.js with real biomedical data models.',
    tech: ['Three.js', 'React', 'JavaScript', 'Biomedical', 'Machine Learning', 'Data Visualization'],
    link: '/malaria_biomedical_3d.jsx',
    img: imgMalariaBiomedical,
    type: 'jsx',
    component: LazyMalariaBiomedical,
    tags: ['data', 'ml', 'visualization'],
  },
  {
    title: 'VRACS v5 — Electrolarynx Voice Restoration System',
    desc: 'Real-time DSP pipeline for electrolarynx voice restoration — phase-by-phase noise cancellation, harmonic synthesis, bandwidth extension, and ML-enhanced intelligibility scoring. Record speech, simulate laryngectomy degradation, and compare 6+ restoration algorithms with PESQ/STOI metrics.',
    tech: ['React', 'TypeScript', 'Web Audio API', 'DSP', 'Machine Learning', 'Signal Processing'],
    link: '/vracs_electrolarynx.jsx',
    img: imgElectroLarynx,
    type: 'jsx',
    component: LazyElectroLarynx,
    tags: ['data', 'ml', 'audio'],
  },
  {
    title: 'Alpha DAW — Browser-Native Sequencer',
    desc: '32-pad step sequencer with live Freesound sample packs, real-time DSP (reverb, delay, distortion, filter, chorus, bitcrush), ADSR envelope editor, chaos engine, composition timeline, BPM-synced recording, and 27 genre presets. Sounds are cached per device via Cache API + localStorage.',
    tech: ['React', 'TypeScript', 'Web Audio API', 'Freesound API', 'framer-motion', 'DSP', 'Step Sequencer'],
    link: '/daw',
    img: imgDAW,
    type: 'jsx',
    component: LazyDAW,
    fullscreen: true,
    tags: ['audio', 'dsp', 'creative'],
  },
];

const COMING_SOON = [
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
];

function NotebookFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', gap: 10 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: PINK, animation: 'ps-spin 0.7s linear infinite' }} />
      <span style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT }}>Loading notebook…</span>
      <style>{`@keyframes ps-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FullscreenOverlay({ project, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Thin close bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px', background: 'rgba(0,0,0,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>
          {project.title}
        </span>
        <button
          onClick={onClose}
          title="Close fullscreen (Esc)"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
      {/* Component fills remaining space */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Suspense fallback={<NotebookFallback />}>
          <project.component />
        </Suspense>
      </div>
    </div>,
    document.body
  );
}

function ProjectTile({ project, i, resetToken }) {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Close (and unload) when parent signals that section is no longer visible
  useEffect(() => { if (resetToken > 0) { setOpen(false); setFullscreen(false); } }, [resetToken]);

  return (
    // ps-tile-wrap: 70% centered on desktop, full-width on mobile
    <div className="ps-tile-wrap">
      {/* ── Tile Header (always visible) ─────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.93)',
          border: `2px solid ${open ? PINK : BORDER}`,
          borderBottom: open ? 'none' : `2px solid ${BORDER}`,
          borderRadius: open ? '0.75rem 0.75rem 0 0' : '0.75rem',
          boxShadow: open ? `0 6px 28px rgba(184,0,78,0.13)` : '0 2px 10px rgba(15,0,30,0.05)',
          transition: 'border-color 0.2s, box-shadow 0.2s, border-radius 0.2s',
          cursor: 'pointer', textAlign: 'left',
          overflow: 'hidden',
        }}
        aria-expanded={open}
      >
        {/* Thumbnail */}
        <div className="ps-thumb" style={{
          width: 72, height: 48, borderRadius: 8,
          overflow: 'hidden', flexShrink: 0, background: DEEP,
        }}>
          {project.img && (
            <img src={project.img} alt={project.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        {/* Title + tech */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <Code style={{ width: 13, height: 13, color: PINK, flexShrink: 0 }} />
            <span className="ps-title" style={{ fontSize: '0.92rem', fontWeight: 800, color: DEEP, lineHeight: 1.2 }}>
              {project.title}
            </span>
          </div>
          <p className="ps-desc" style={{ margin: 0, fontSize: '0.78rem', color: MID, lineHeight: 1.5, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.desc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {project.tech.map(t => (
              <span key={t} style={{
                fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
                fontWeight: 700, letterSpacing: '0.05em', padding: '2px 7px',
                border: `1px solid ${BORDER}`, borderRadius: 4, color: SOFT,
                background: 'rgba(106,10,80,0.06)',
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Open/close + external link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="Open raw notebook"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 6, border: `1px solid ${BORDER}`,
                background: 'rgba(184,0,78,0.06)', color: PINK, textDecoration: 'none',
              }}
            >
              <ExternalLink style={{ width: 13, height: 13 }} />
            </a>
          )}
          {project.fullscreen && project.component && (
            <button
              onClick={e => { e.stopPropagation(); setFullscreen(true); }}
              title="Open fullscreen (Esc to close)"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 6, border: `1px solid ${BORDER}`,
                background: 'rgba(88,0,184,0.08)', color: VIOLET, cursor: 'pointer',
              }}
            >
              <Maximize2 style={{ width: 13, height: 13 }} />
            </button>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 6,
            background: open ? PINK : 'rgba(184,0,78,0.07)',
            color: open ? '#fff' : PINK,
            transition: 'all 0.2s',
          }}>
            {open ? <ChevronUp style={{ width: 15, height: 15 }} /> : <ChevronDown style={{ width: 15, height: 15 }} />}
          </div>
        </div>
      </button>

      {/* ── Expanded: inline preview — viewer chosen by project.type ───── */}
      {open && project.link && (
        <div className="ps-preview-wrap">
          <div className="ps-preview-inner">
            {project.type === 'jsx'
              ? <JsxViewer LazyComponent={project.component} />
              : (
              <Suspense fallback={<NotebookFallback />}>
                <IpynbViewer src={project.link} />
              </Suspense>
              )}
          </div>
        </div>
      )}

      {/* ── Fullscreen overlay portal ───── */}
      {fullscreen && project.component && (
        <FullscreenOverlay project={project} onClose={() => setFullscreen(false)} />
      )}
    </div>
  );
}

function ComingSoonTile({ i }) {
  return (
    <div className="ps-tile-wrap">
      <div style={{
        borderRadius: '0.75rem', border: `2px solid rgba(184,0,78,0.1)`,
        background: 'rgba(255,255,255,0.5)', overflow: 'hidden',
        opacity: 0.6, display: 'flex', alignItems: 'center', gap: 14,
        padding: '0.9rem 1.1rem',
      }}>
        <div style={{ width: 72, height: 48, borderRadius: 8, background: 'rgba(184,0,78,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock style={{ width: 20, height: 20, color: 'rgba(184,0,78,0.2)' }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: MID }}>Coming Soon</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: SOFT, opacity: 0.7 }}>New project in development — check back soon.</p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const outerRef = useRef(null);
  const [resetToken, setResetToken] = useState(0);

  // When the section scrolls out of view, close & unload all project previews
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) setResetToken(t => t + 1); },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <>
      {/* ── Responsive layout styles ─────────────────────────────────── */}
      <style>{`
        /* Break out of ContentPanel's max-w-[1040px] px-6 container.
           ContentPanel uses px-6 (1.5rem each side), so -1.5rem cancels it.
           Then we add our own small padding so tiles don't kiss the viewport edge. */
        .ps-outer {
          margin-left: -1.5rem;
          margin-right: -1.5rem;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .ps-tile-wrap {
          width: 100%;
        }
        /* Desktop: also escape the 1040px cap via a wide max-width */
        @media (min-width: 768px) {
          .ps-outer {
            /* Push the content panel's own max-width aside by allowing full viewport.
               Since ContentPanel centres itself, we use a viewport-relative trick. */
            margin-left: calc(-50vw + 50%);
            margin-right: calc(-50vw + 50%);
            width: 100vw;
            padding-left: clamp(1rem, 2vw, 2rem);
            padding-right: clamp(1rem, 2vw, 2rem);
          }
          /* Tile + its dropdown share the same 70%-wide centered container */
          .ps-tile-wrap {
            width: 70%;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* ── Preview container: always-visible styled scrollbar ─────────── */
        .ps-preview-wrap {
          overflow-x: hidden;
          overflow-y: auto;
          max-height: 72vh;
          border-left: 2px solid ${PINK};
          border-right: 2px solid ${PINK};
          border-bottom: 2px solid ${PINK};
          border-radius: 0 0 0.75rem 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: ${PINK} ${DEEP};
          /* contain fixed-position children (e.g. slide-over panels) */
          transform: translateZ(0);
        }
        .ps-preview-inner {
          padding: 0.5rem;
        }
        .ps-preview-wrap::-webkit-scrollbar { width: 12px; }
        .ps-preview-wrap::-webkit-scrollbar-track {
          background: ${DEEP};
          border-radius: 6px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
        }
        .ps-preview-wrap::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${PINK} 0%, ${VIOLET} 100%);
          border-radius: 6px;
          border: 3px solid ${DEEP};
          box-shadow: inset 0 0 8px rgba(0,0,0,0.35);
        }
        .ps-preview-wrap::-webkit-scrollbar-thumb:hover { filter: brightness(1.08); }

        /* Desktop: 20% taller preview container (expanded by 20%) */
        @media (min-width: 641px) {
          .ps-preview-wrap { max-height: min(100vh, calc(86vh * 1.2)); }
          .ps-preview-inner { padding: 0.5rem; }
        }

        /* Mobile: scale preview content down so it fits without horizontal scroll */
        @media (max-width: 640px) {
          .ps-preview-wrap {
            overflow-x: hidden;
            max-height: 65vh;
          }
          .ps-preview-wrap > * {
            transform: scale(0.82);
            transform-origin: top left;
            width: calc(100% / 0.82);
            overflow-y: visible;
            overflow-x: hidden;
          }

          /* Title: clamp to 2 lines, shrink font to fit tile height */
          .ps-title {
            font-size: 0.78rem !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            white-space: normal !important;
            line-height: 1.25 !important;
          }

          /* Keep description single-line ellipsis on mobile too */
          .ps-desc {
            font-size: 0.72rem !important;
          }

          /* Thumbnail slightly smaller on mobile */
          .ps-thumb {
            width: 56px !important;
            height: 40px !important;
          }
        }
      `}</style>

      <div ref={outerRef} className="ps-outer" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Mobile-only disclaimer */}
        <div className="ps-mobile-disclaimer" style={{ display: 'none' }}>
          <div style={{
            background: 'rgba(184,0,78,0.12)',
            border: '1px solid rgba(184,0,78,0.35)',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.85rem',
            marginBottom: '0.25rem',
            fontSize: '0.75rem',
            color: '#B8004E',
            fontWeight: 600,
            textAlign: 'center',
            letterSpacing: '0.01em',
          }}>
            📱 Projects are better viewed on desktop but have correct mobile optimizations
          </div>
        </div>
        <style>{`
          @media (max-width: 640px) {
            .ps-mobile-disclaimer { display: block !important; }
          }
        `}</style>
        {PROJECTS.map((p, i) => <ProjectTile key={p.title} project={p} i={i} resetToken={resetToken} />)}

        <div style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
          margin: '0.5rem 0',
        }} />

        {COMING_SOON.map((_, i) => <ComingSoonTile key={i} i={i} />)}
      </div>
    </>
  );
}
