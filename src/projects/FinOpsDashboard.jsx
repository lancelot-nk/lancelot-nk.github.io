import { useState } from "react";

// ─────────────────────────────────────────────
// SIMULATED DATA LAYER
// ─────────────────────────────────────────────

const BILLING_CENTERS = [
  {
    id: "eng", name: "Engineering Platform", spend: 1372281.15, lastMonth: 2579412.89,
    budget: 1500000, trend: "down", trendPct: 46.8, owner: "Platform Team",
    region: "us-east-1 / us-central1", riskScore: 72, anomalies: 2,
    tags: ["backend", "infrastructure", "production"],
    services: ["EC2 Auto-Scaling", "GKE Cluster", "BigQuery Jobs", "CloudSQL", "S3 Storage"],
    providers: [
      { name: "Amazon Web Services", amount: 438538.70, pct: 32, color: "#ff9900" },
      { name: "Google Cloud Platform", amount: 933742.45, pct: 68, color: "#4285f4" },
    ],
  },
  {
    id: "data", name: "Data & Analytics", spend: 456834.22, lastMonth: 398721.44,
    budget: 500000, trend: "up", trendPct: 14.6, owner: "Data Engineering",
    region: "us-east-1 / eastus", riskScore: 84, anomalies: 1,
    tags: ["analytics", "data-lake", "ml"],
    services: ["Redshift", "AWS Glue", "Azure Synapse", "ADF Pipelines", "Databricks"],
    providers: [
      { name: "Amazon Web Services", amount: 278583.97, pct: 61, color: "#ff9900" },
      { name: "Microsoft Azure", amount: 178250.25, pct: 39, color: "#0078d4" },
    ],
  },
  {
    id: "prod", name: "Product Development", spend: 234129.80, lastMonth: 219045.33,
    budget: 280000, trend: "up", trendPct: 6.9, owner: "Product Engineering",
    region: "us-west-2", riskScore: 61, anomalies: 0,
    tags: ["dev", "staging", "containers"],
    services: ["EKS", "ECR", "Lambda", "API Gateway", "RDS Postgres"],
    providers: [
      { name: "Amazon Web Services", amount: 182621.24, pct: 78, color: "#ff9900" },
      { name: "Kubernetes (EKS)", amount: 51508.56, pct: 22, color: "#326ce5" },
    ],
  },
  {
    id: "mktg", name: "Marketing Technology", spend: 89234.67, lastMonth: 94102.11,
    budget: 100000, trend: "down", trendPct: 5.2, owner: "Marketing Ops",
    region: "us-east-1", riskScore: 35, anomalies: 0,
    tags: ["marketing", "cdn", "analytics"],
    services: ["CloudFront CDN", "S3 Assets", "SES Email", "Pinpoint Campaigns"],
    providers: [
      { name: "Amazon Web Services", amount: 89234.67, pct: 100, color: "#ff9900" },
    ],
  },
  {
    id: "sec", name: "Security & Compliance", spend: 78019.44, lastMonth: 71234.88,
    budget: 90000, trend: "up", trendPct: 9.5, owner: "SecOps",
    region: "eastus / westeurope", riskScore: 91, anomalies: 3,
    tags: ["security", "compliance", "nist"],
    services: ["Azure Sentinel", "Defender for Cloud", "Key Vault", "Monitor", "Log Analytics"],
    providers: [
      { name: "Microsoft Azure", amount: 78019.44, pct: 100, color: "#0078d4" },
    ],
  },
  {
    id: "devops", name: "DevOps & Infrastructure", spend: 167492.11, lastMonth: 155833.22,
    budget: 200000, trend: "up", trendPct: 7.5, owner: "Platform SRE",
    region: "us-east-1 / eastus", riskScore: 58, anomalies: 1,
    tags: ["ci-cd", "terraform", "monitoring"],
    services: ["CodePipeline", "Terraform Cloud", "Azure DevOps", "Datadog APM", "PagerDuty"],
    providers: [
      { name: "Amazon Web Services", amount: 92120.66, pct: 55, color: "#ff9900" },
      { name: "Microsoft Azure", amount: 75371.45, pct: 45, color: "#0078d4" },
    ],
  },
];

const MONTHLY_TREND = [
  { month: "Jan", AWS: 980000, Azure: 420000, GCP: 310000, budget: 2000000 },
  { month: "Feb", AWS: 1050000, Azure: 445000, GCP: 380000, budget: 2000000 },
  { month: "Mar", AWS: 1120000, Azure: 398000, GCP: 420000, budget: 2100000 },
  { month: "Apr", AWS: 1280000, Azure: 512000, GCP: 478000, budget: 2300000 },
  { month: "May", AWS: 1190000, Azure: 489000, GCP: 512000, budget: 2300000 },
  { month: "Jun", AWS: 980000, Azure: 331000, GCP: 934000, budget: 2400000 },
  { month: "Jul ▸", AWS: 1050000, Azure: 360000, GCP: 960000, budget: 2400000 },
  { month: "Aug ▸", AWS: 1100000, Azure: 380000, GCP: 980000, budget: 2400000 },
];

// Per-month spend multipliers for each billing center (Jan=0 ... Dec=11)
const MONTHLY_MULTIPLIERS = [
  // Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct   Nov   Dec
  [0.72, 0.74, 0.81, 0.92, 0.88, 1.00, 1.05, 1.08, 0.96, 0.91, 0.87, 0.95], // eng
  [0.88, 0.91, 0.94, 0.98, 1.02, 1.00, 1.04, 1.07, 1.01, 0.99, 0.97, 1.03], // data
  [0.91, 0.93, 0.95, 0.97, 0.98, 1.00, 1.03, 1.06, 1.02, 0.99, 0.97, 1.02], // prod
  [0.85, 0.88, 0.92, 0.95, 0.97, 1.00, 1.08, 1.10, 0.96, 0.92, 0.90, 0.98], // mktg
  [0.90, 0.92, 0.94, 0.96, 0.98, 1.00, 1.02, 1.04, 1.01, 0.99, 0.98, 1.01], // sec
  [0.87, 0.90, 0.93, 0.96, 0.98, 1.00, 1.04, 1.07, 1.02, 0.99, 0.97, 1.03], // devops
];

const BASE_TREND = {
  Jan:  { AWS:980000,  Azure:420000, GCP:310000 },
  Feb:  { AWS:1050000, Azure:445000, GCP:380000 },
  Mar:  { AWS:1120000, Azure:398000, GCP:420000 },
  Apr:  { AWS:1280000, Azure:512000, GCP:478000 },
  May:  { AWS:1190000, Azure:489000, GCP:512000 },
  Jun:  { AWS:980000,  Azure:331000, GCP:934000 },
  Jul:  { AWS:1050000, Azure:360000, GCP:960000 },
  Aug:  { AWS:1100000, Azure:380000, GCP:980000 },
  Sep:  { AWS:1040000, Azure:352000, GCP:920000 },
  Oct:  { AWS:1080000, Azure:395000, GCP:875000 },
  Nov:  { AWS:1150000, Azure:412000, GCP:810000 },
  Dec:  { AWS:1220000, Azure:440000, GCP:760000 },
};

function getTrendData(monthIdx) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const result = [];
  for (let i = Math.max(0, monthIdx - 5); i <= Math.min(11, monthIdx + 2); i++) {
    const m = months[i];
    const d = BASE_TREND[m];
    const isProjection = i > monthIdx;
    result.push({
      month: isProjection ? m + "▸" : m,
      AWS: d.AWS,
      Azure: d.Azure,
      GCP: d.GCP,
      budget: 2400000,
    });
  }
  return result;
}

const ALLOCATION_LAYERS = [
  {
    id: "products", name: "Products", spend: 847293, color: "#93c5fd", darkColor: "#2563eb",
    items: ["API Gateway", "Web App", "Mobile Backend", "Data API", "Auth Svc", "Notifications", "Billing Engine"],
    description: "Top-level product cost allocation across all cloud providers. Tracks per-product infrastructure COGS.",
    savings: 127000,
  },
  {
    id: "features", name: "Features", spend: 512847, color: "#1d4ed8", darkColor: "#1e3a8a",
    items: ["Search", "Recommendations", "Reporting", "Dashboards", "Integrations", "Exports", "Webhooks"],
    description: "Feature-level cost broken down by engineering allocation tags. Enables feature-level ROI analysis.",
    savings: 89000,
  },
  {
    id: "customers", name: "Customers", spend: 634120, color: "#fbbf24", darkColor: "#d97706",
    items: ["Enterprise Tier", "Business Tier", "Starter", "Free Tier", "Internal", "Partners", "Trial Users"],
    description: "Per-customer COGS tracking for unit economics. Identifies high-cost customer segments.",
    savings: 203000,
  },
  {
    id: "envs", name: "Environments", spend: 298441, color: "#7dd3fc", darkColor: "#0284c7",
    items: ["Production", "Staging", "QA", "Development", "DR Backup", "Load Test", "Sandbox"],
    description: "Environment spend ratio analysis — production vs. non-production cost breakdown.",
    savings: 45000,
  },
  {
    id: "services", name: "Microservices", spend: 423819, color: "#818cf8", darkColor: "#4338ca",
    items: ["Auth", "Payments", "Inventory", "Orders", "Shipping", "Notifications", "Analytics"],
    description: "Microservice-level cost attribution. Surfaces expensive service dependencies.",
    savings: 67000,
  },
  {
    id: "clusters", name: "Clusters", spend: 681591, color: "#f59e0b", darkColor: "#b45309",
    items: ["prod-us-east", "prod-us-west", "prod-eu", "staging-main", "dev-shared", "ml-training", "data-proc"],
    description: "Kubernetes cluster cost allocation with rightsizing and idle-node recommendations.",
    savings: 112000,
  },
];

const NIST_CONTROLS = [
  { id: "ID.AM", name: "Asset Management",              category: "Identify", score: 88, findings: 1, status: "Compliant" },
  { id: "ID.RA", name: "Risk Assessment",               category: "Identify", score: 74, findings: 3, status: "Partial"   },
  { id: "PR.AC", name: "Identity & Access Mgmt",        category: "Protect",  score: 92, findings: 0, status: "Compliant" },
  { id: "PR.DS", name: "Data Security",                 category: "Protect",  score: 81, findings: 2, status: "Compliant" },
  { id: "PR.IP", name: "Info Protection Processes",     category: "Protect",  score: 69, findings: 4, status: "Partial"   },
  { id: "DE.AE", name: "Anomalies & Events Detection",  category: "Detect",   score: 77, findings: 2, status: "Compliant" },
  { id: "DE.CM", name: "Continuous Security Monitoring",category: "Detect",   score: 85, findings: 1, status: "Compliant" },
  { id: "RS.RP", name: "Response Planning",             category: "Respond",  score: 91, findings: 0, status: "Compliant" },
  { id: "RC.RP", name: "Recovery Planning",             category: "Recover",  score: 62, findings: 6, status: "At Risk"   },
  { id: "GV.OC", name: "Organizational Context",        category: "Govern",   score: 95, findings: 0, status: "Compliant" },
];

const ANOMALIES = [
  { id:1, center:"Engineering Platform",    service:"BigQuery Jobs",         spike:"+340%", amount:"$47,823", time:"2h ago",  severity:"Critical", resolved:false },
  { id:2, center:"Engineering Platform",    service:"GKE Node Autoscale",    spike:"+89%",  amount:"$12,441", time:"6h ago",  severity:"High",     resolved:false },
  { id:3, center:"Security & Compliance",   service:"Azure Sentinel Ingest", spike:"+127%", amount:"$8,920",  time:"1d ago",  severity:"High",     resolved:false },
  { id:4, center:"Security & Compliance",   service:"Log Analytics WS",      spike:"+65%",  amount:"$4,301",  time:"2d ago",  severity:"Medium",   resolved:true  },
  { id:5, center:"Data & Analytics",        service:"Redshift Cluster",      spike:"+44%",  amount:"$6,182",  time:"3d ago",  severity:"Medium",   resolved:false },
  { id:6, center:"DevOps & Infrastructure", service:"Datadog Custom Metrics", spike:"+38%", amount:"$3,220",  time:"4d ago",  severity:"Low",      resolved:true  },
];

const FINOPS_ACTIONS = [
  { icon:"↙️", title:"Shift Cloud Cost Left",    desc:"Move cost accountability to engineering via mandatory resource tagging.",   savings:203000 },
  { icon:"🎯", title:"Measure Unit Cost",         desc:"Track cost-per-customer and per-feature to optimize COGS margins.",         savings:127000 },
  { icon:"📊", title:"Inform Executives",         desc:"Auto-generate FinOps board reports with trend analysis and projections.",   savings:0      },
  { icon:"🔄", title:"Track Migration Costs",     desc:"Monitor cloud migration spend delta vs on-prem cost savings.",             savings:89000  },
  { icon:"📋", title:"Report on COGS",            desc:"Per-product gross margin analysis inclusive of all infrastructure spend.",  savings:67000  },
  { icon:"🔮", title:"Budget & Forecast",         desc:"AI-driven 90-day spend forecasting with anomaly alerting and alerts.",     savings:45000  },
];

const SAVINGS_OPP = [
  { name:"Reserved Instances (EC2 + RDS)",  savings:287000, effort:"Low",    timeline:"30 days",  provider:"AWS"       },
  { name:"Rightsizing Idle Azure VMs",       savings:134000, effort:"Medium", timeline:"2 weeks",  provider:"Azure"     },
  { name:"GKE Cluster Rightsizing",          savings:112000, effort:"Medium", timeline:"45 days",  provider:"GCP"       },
  { name:"Untagged Resource Cleanup",        savings:89000,  effort:"Low",    timeline:"1 week",   provider:"All"       },
  { name:"Dev/Staging Auto-Shutdown",        savings:67000,  effort:"Low",    timeline:"3 days",   provider:"AWS"       },
  { name:"S3 + Blob Storage Lifecycle",      savings:43000,  effort:"Low",    timeline:"1 week",   provider:"AWS/Azure" },
];

// ─────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────

const C = {
  bg:"#f0f4f8", surface:"#ffffff", border:"#e2e8f0",
  navy:"#0f172a", blue:"#2563eb", text:"#1e293b", muted:"#64748b",
  aws:"#ff9900", azure:"#0078d4", gcp:"#4285f4", k8s:"#326ce5",
  success:"#10b981", warning:"#f59e0b", danger:"#ef4444",
};

const PROVIDER_META = {
  "Amazon Web Services":  { short:"AWS", color:"#ff9900", bg:"#fff8eb" },
  "Google Cloud Platform":{ short:"GCP", color:"#4285f4", bg:"#eff6ff" },
  "Microsoft Azure":      { short:"AZR", color:"#0078d4", bg:"#f0f9ff" },
  "Kubernetes (EKS)":     { short:"K8S", color:"#326ce5", bg:"#eff6ff" },
};

const NIST_CAT_COLORS = {
  Identify:"#8b5cf6", Protect:"#2563eb", Detect:"#f59e0b",
  Respond:"#ef4444",  Recover:"#10b981", Govern:"#0f172a",
};

const SEVERITY_STYLE = {
  Critical:{ bg:"#fef2f2", text:"#991b1b", dot:"#ef4444" },
  High:    { bg:"#fff7ed", text:"#9a3412", dot:"#f97316" },
  Medium:  { bg:"#fefce8", text:"#854d0e", dot:"#eab308" },
  Low:     { bg:"#f0fdf4", text:"#166534", dot:"#22c55e" },
};

const fmt  = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const fmtK = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const cardStyle = {
  background:"#fff", border:"1px solid #e2e8f0",
  borderRadius:12, padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.07)",
};

// ─────────────────────────────────────────────
// MICRO-COMPONENTS
// ─────────────────────────────────────────────

const Chip = ({ children, color=C.blue, bg="#eff6ff" }) => (
  <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20,
    color, background:bg, border:`1px solid ${color}30`,
    fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.3 }}>
    {children}
  </span>
);

const ProviderBar = ({ providers }) => (
  <div style={{ height:6, borderRadius:3, overflow:"hidden", display:"flex", margin:"10px 0" }}>
    {providers.map((p,i) => (
      <div key={i} style={{ width:`${p.pct}%`, background:p.color, height:"100%",
        borderRadius: i===0 ? "3px 0 0 3px" : i===providers.length-1 ? "0 3px 3px 0" : 0 }} />
    ))}
  </div>
);

const BudgetBar = ({ spend, budget }) => {
  const pct = Math.min((spend/budget)*100, 100);
  const color = pct > 95 ? C.danger : pct > 80 ? C.warning : C.success;
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted, marginBottom:3 }}>
        <span>Budget utilization</span>
        <span style={{ color, fontWeight:700 }}>{pct.toFixed(0)}% of {fmtK(budget)}</span>
      </div>
      <div style={{ height:4, background:"#f1f5f9", borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:2, transition:"width 0.6s ease" }} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BILLING CARD
// ─────────────────────────────────────────────

const BillingCard = ({ center, onClick }) => {
  const [hov, setHov] = useState(false);
  const pct = (center.spend / center.budget) * 100;
  const stripe = pct > 95 ? C.danger : pct > 80 ? C.warning : C.success;
  return (
    <div onClick={() => onClick(center)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...cardStyle, cursor:"pointer", position:"relative", overflow:"hidden",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 10px 28px rgba(0,0,0,0.13)" : "0 1px 3px rgba(0,0,0,0.07)",
        transition:"all 0.2s",
      }}>
      {/* Top stripe */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:stripe, borderRadius:"12px 12px 0 0" }} />

      {/* Anomaly badge */}
      {center.anomalies > 0 && (
        <div style={{ position:"absolute", top:14, right:14,
          background:"#fef2f2", color:"#991b1b", fontSize:10, fontWeight:700,
          padding:"2px 8px", borderRadius:20, border:"1px solid #fecaca" }}>
          ⚡ {center.anomalies} anomal{center.anomalies>1?"ies":"y"}
        </div>
      )}

      <h3 style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:C.text,
        fontFamily:"'Outfit',sans-serif", paddingRight: center.anomalies>0 ? 96 : 0 }}>
        {center.name}
      </h3>
      <div style={{ fontSize:22, fontWeight:800, color:C.navy,
        fontFamily:"'JetBrains Mono',monospace", letterSpacing:-1 }}>
        {fmt(center.spend)}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
        <span style={{ fontSize:11, color:C.muted }}>vs. {fmt(center.lastMonth)} last mo.</span>
        <span style={{ fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:4,
          color: center.trend==="up" ? "#991b1b" : "#166534",
          background: center.trend==="up" ? "#fef2f2" : "#f0fdf4" }}>
          {center.trend==="up"?"▲":"▼"} {center.trendPct}%
        </span>
      </div>

      <ProviderBar providers={center.providers} />

      {center.providers.map((p,i) => {
        const m = PROVIDER_META[p.name];
        return (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"4px 0", borderBottom: i<center.providers.length-1 ? "1px solid #f8fafc" : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Chip color={m?.color||C.muted} bg={m?.bg||"#f8fafc"}>{m?.short||"SHR"}</Chip>
              <span style={{ fontSize:11.5, color:C.text }}>{p.name}</span>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:600, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(p.amount)}</span>
              <span style={{ fontSize:10.5, color:C.muted, width:38 }}>({p.pct}%)</span>
            </div>
          </div>
        );
      })}

      <BudgetBar spend={center.spend} budget={center.budget} />
    </div>
  );
};

// ─────────────────────────────────────────────
// DRILL-DOWN MODAL
// ─────────────────────────────────────────────

const CenterModal = ({ center, onClose }) => {
  const [mTab, setMTab] = useState("overview");
  if (!center) return null;
  return (
    <div onClick={onClose} style={{ position:"absolute", top:0, left:0, right:0, bottom:0, minHeight:"100%",
      background:"rgba(0,0,0,0.48)",
      backdropFilter:"blur(4px)", zIndex:1000, display:"flex",
      alignItems:"center", justifyContent:"center", padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:18, padding:28,
        maxWidth:580, width:"100%", maxHeight:"88vh", overflowY:"auto",
        boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
          <div>
            <h2 style={{ margin:0, fontFamily:"'Outfit',sans-serif", color:C.navy, fontSize:20 }}>{center.name}</h2>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{center.owner} · {center.region}</div>
            <div style={{ display:"flex", gap:4, marginTop:6, flexWrap:"wrap" }}>
              {center.tags.map(t => <Chip key={t} color={C.blue} bg="#eff6ff">{t}</Chip>)}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8,
            width:32, height:32, cursor:"pointer", fontSize:16, color:C.muted, lineHeight:"32px" }}>✕</button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid #e2e8f0", marginBottom:20 }}>
          {["overview","services","risk"].map(t => (
            <button key={t} onClick={()=>setMTab(t)} style={{
              padding:"8px 18px", background:"none", border:"none",
              borderBottom: mTab===t ? `2px solid ${C.blue}` : "2px solid transparent",
              color: mTab===t ? C.blue : C.muted, fontWeight: mTab===t ? 700 : 400,
              cursor:"pointer", fontFamily:"inherit", fontSize:13, marginBottom:-1,
            }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        {mTab==="overview" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Current Spend",  val:fmt(center.spend),       color:C.navy    },
                { label:"Budget",         val:fmt(center.budget),      color:C.text    },
                { label:"Last Month",     val:fmt(center.lastMonth),   color:C.muted   },
                { label:"MoM Variance",   val:`${center.trend==="up"?"+":"-"}${center.trendPct}%`,
                  color: center.trend==="up" ? C.danger : C.success },
              ].map((item,i)=>(
                <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:14, border:"1px solid #e2e8f0" }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{item.label}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:item.color, fontFamily:"'JetBrains Mono',monospace" }}>{item.val}</div>
                </div>
              ))}
            </div>
            <ProviderBar providers={center.providers} />
            {center.providers.map((p,i)=>{
              const m=PROVIDER_META[p.name];
              return (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Chip color={m?.color||C.muted} bg={m?.bg||"#f8fafc"}>{m?.short}</Chip>
                    <span style={{ fontSize:13 }}>{p.name}</span>
                  </div>
                  <div style={{ display:"flex", gap:12 }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:600 }}>{fmt(p.amount)}</span>
                    <span style={{ color:C.muted, fontSize:12 }}>{p.pct}%</span>
                  </div>
                </div>
              );
            })}
            <BudgetBar spend={center.spend} budget={center.budget} />
          </div>
        )}

        {mTab==="services" && (
          <div>
            <p style={{ margin:"0 0 12px", fontSize:13, color:C.muted }}>Active cloud services contributing to billing center spend:</p>
            {center.services.map((svc,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 14px", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:C.blue }} />
                  <span style={{ fontSize:13, fontWeight:500 }}>{svc}</span>
                </div>
                <span style={{ fontSize:11, background:"#f0fdf4", color:"#166534",
                  padding:"2px 8px", borderRadius:20, border:"1px solid #bbf7d0", fontWeight:600 }}>● Active</span>
              </div>
            ))}
            <div style={{ marginTop:14, padding:14, background:"#f0f9ff", borderRadius:10, border:"1px solid #bae6fd" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#0369a1", marginBottom:4 }}>💡 Optimization Opportunity</div>
              <div style={{ fontSize:12, color:"#0c4a6e", lineHeight:1.6 }}>
                Reserved instance analysis indicates 15–20% cost reduction is achievable. Rightsizing scan detected 3 underutilized resources eligible for tier downgrade or auto-scaling adjustment.
              </div>
            </div>
          </div>
        )}

        {mTab==="risk" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:16, padding:18, borderRadius:12,
              background: center.riskScore>80 ? "#fff7ed" : center.riskScore>60 ? "#fefce8" : "#f0fdf4",
              border:`1px solid ${center.riskScore>80?"#fed7aa":center.riskScore>60?"#fde68a":"#bbf7d0"}`,
              marginBottom:16 }}>
              <div style={{ fontSize:48, fontWeight:800, fontFamily:"'JetBrains Mono',monospace",
                color: center.riskScore>80 ? C.danger : center.riskScore>60 ? C.warning : C.success }}>
                {center.riskScore}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:C.navy }}>NIST CSF 2.0 Risk Score</div>
                <div style={{ fontSize:12, color:C.muted }}>Aggregated from cloud posture assessment</div>
                <div style={{ fontSize:12, fontWeight:700, marginTop:4,
                  color: center.riskScore>80 ? C.danger : center.riskScore>60 ? C.warning : C.success }}>
                  {center.riskScore>80?"⚠ Elevated — Review Required":center.riskScore>60?"⚡ Moderate — Monitor Closely":"✓ Within Acceptable Bounds"}
                </div>
              </div>
            </div>
            <div style={{ padding:14, background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.navy, marginBottom:8 }}>Active Anomalies for this Center</div>
              {center.anomalies > 0
                ? ANOMALIES.filter(a=>a.center===center.name && !a.resolved).map((a,i)=>{
                    const sc=SEVERITY_STYLE[a.severity];
                    return (
                      <div key={i} style={{ padding:"8px 10px", background:sc.bg, borderRadius:8, marginBottom:6, border:`1px solid ${sc.dot}30` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                          <span style={{ fontWeight:700 }}>{a.service}</span>
                          <span style={{ color:sc.text, fontWeight:800 }}>{a.spike}</span>
                        </div>
                        <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{a.amount} · {a.time}</div>
                      </div>
                    );
                  })
                : <div style={{ fontSize:12, color:"#166534", padding:8, background:"#f0fdf4", borderRadius:8 }}>✓ No active anomalies detected for this center.</div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ALLOCATION MAP TAB  (Image 2 style)
// ─────────────────────────────────────────────

const AllocationMap = () => {
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const totalSavings = ALLOCATION_LAYERS.reduce((s,l)=>s+l.savings,0);

  return (
    <div>
      {/* Summary row */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        {[
          { label:"Total Cloud Spend",    value:fmtK(2398111),                                  sub:"All providers · June 2024", color:C.navy    },
          { label:"Allocated",            value:"82.3%",                                         sub:"↑ 4.1% from last month",   color:C.success },
          { label:"Unallocated",          value:"$424.8K",                                       sub:"Requires tagging",         color:C.warning },
          { label:"Potential Monthly Save",value:fmtK(totalSavings),                             sub:"Across all layers",        color:C.blue    },
        ].map((s,i)=>(
          <div key={i} style={{ ...cardStyle, flex:"1 1 180px", minWidth:140, padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>

        {/* ── LEFT: Cloud Spend Sources ── */}
        <div className="finops-sidebar" style={{ width:230, flexShrink:0, minWidth:200 }}>
          <div style={{ ...cardStyle }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.blue, marginBottom:16, fontFamily:"'Outfit',sans-serif" }}>
              Cloud Spend Sources
            </div>
            {[
              { name:"AWS",   color:"#ff9900", spend:"$1.79M", pct:74, short:"AWS" },
              { name:"Azure", color:"#0078d4", spend:"$331K",  pct:14, short:"AZR" },
              { name:"GCP",   color:"#4285f4", spend:"$287K",  pct:12, short:"GCP" },
            ].map((p,i)=>(
              <div key={i} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <Chip color={p.color} bg={p.color+"18"}>{p.short}</Chip>
                  <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{p.name}</span>
                  <span style={{ marginLeft:"auto", fontSize:12, fontWeight:700,
                    fontFamily:"'JetBrains Mono',monospace", color:C.navy }}>{p.spend}</span>
                </div>
                <div style={{ height:4, background:"#f1f5f9", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ width:`${p.pct}%`, height:"100%", background:p.color, transition:"width 0.6s" }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid #e2e8f0" }}>
              <div style={{ fontSize:10, color:C.muted, fontWeight:700, marginBottom:8,
                textTransform:"uppercase", letterSpacing:0.5 }}>Resource Categories</div>
              {["Tagged Resources","Untaggable Resources","Untagged Resources","Shared Resources","Kubernetes"].map((cat,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  padding:"5px 0", fontSize:12, color:C.text,
                  borderBottom: i<4 ? "1px solid #f8fafc" : "none" }}>
                  <span>{cat}</span>
                  <span style={{ color:C.blue, fontWeight:700 }}>→</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop:14, display:"flex", gap:6, flexWrap:"wrap" }}>
              {[{l:"GH",c:"#24292e"},{l:"GL",c:"#fc6d26"},{l:"TF",c:"#7b42bc"}].map((ic,i)=>(
                <div key={i} style={{ width:30, height:30, borderRadius:7, background:ic.c,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", fontSize:9, fontWeight:800, letterSpacing:0.3 }}>{ic.l}</div>
              ))}
              <div style={{ fontSize:10, color:C.muted, alignSelf:"center", paddingLeft:2 }}>+4 integrations</div>
            </div>
          </div>
        </div>

        {/* ── CENTER: 3D Layer Stack ── */}
        <div style={{ flex:1, minWidth:280 }}>
          <div style={{ fontSize:12, color:C.muted, textAlign:"center", marginBottom:18 }}>
            Hover each allocation layer to explore cost attribution and optimization opportunities
          </div>
          {ALLOCATION_LAYERS.map((layer)=>{
            const isActive = activeLayer===layer.id;
            return (
              <div key={layer.id} style={{ marginBottom:10 }}
                onMouseEnter={()=>setActiveLayer(layer.id)}
                onMouseLeave={()=>setActiveLayer(null)}>

                <div style={{ display:"flex", alignItems:"center", gap:14,
                  transition:"transform 0.2s", transform: isActive ? "scale(1.01)" : "scale(1)" }}>

                  {/* 3-D block grid */}
                  <div style={{ flex:1, cursor:"pointer" }}>
                    <div style={{
                      display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3,
                      padding:"9px 12px",
                      transform:"perspective(350px) rotateX(28deg) rotateZ(-4deg)",
                      transformOrigin:"left center",
                      background: layer.color+"1a",
                      borderRadius:8,
                      border:`1px solid ${layer.color}40`,
                      boxShadow: isActive ? `0 8px 22px ${layer.color}45` : `0 2px 8px ${layer.color}20`,
                      transition:"all 0.2s",
                    }}>
                      {Array(21).fill(0).map((_,j)=>(
                        <div key={j} style={{
                          height: isActive ? 15 : 12,
                          background: isActive ? layer.darkColor : layer.color,
                          borderRadius:2,
                          boxShadow:`0 2px 0 ${layer.darkColor}99`,
                          opacity: 0.6 + (j%3)*0.14,
                          transition:"all 0.2s",
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Label pill */}
                  <div style={{
                    background: isActive ? layer.darkColor : "#fff",
                    border:`1.5px solid ${isActive ? layer.darkColor : C.border}`,
                    borderRadius:24, padding:"6px 14px", fontSize:12, fontWeight:700,
                    color: isActive ? "#fff" : C.text, whiteSpace:"nowrap",
                    boxShadow: isActive ? `0 4px 14px ${layer.darkColor}45` : "0 1px 4px rgba(0,0,0,0.08)",
                    transition:"all 0.2s", display:"flex", alignItems:"center", gap:8,
                    minWidth:150, justifyContent:"space-between",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%",
                        background: isActive ? "#fff" : layer.color, flexShrink:0 }} />
                      {layer.name}
                    </div>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, opacity:0.85 }}>
                      {fmtK(layer.spend)}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isActive && (
                  <div style={{ marginTop:6, padding:"10px 14px",
                    background:`${layer.color}12`, borderRadius:8, border:`1px solid ${layer.color}28`,
                    fontSize:12, color:C.text }}>
                    <div style={{ fontWeight:700, marginBottom:6, color:layer.darkColor }}>{layer.description}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8 }}>
                      {layer.items.map(item=>(
                        <span key={item} style={{ background:layer.color+"35", color:layer.darkColor,
                          padding:"2px 8px", borderRadius:4, fontSize:11 }}>{item}</span>
                      ))}
                    </div>
                    <div style={{ color:C.success, fontWeight:700, fontSize:11 }}>
                      ✓ Est. monthly savings opportunity: {fmtK(layer.savings)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: FinOps Actions ── */}
        <div className="finops-sidebar" style={{ width:210, flexShrink:0, minWidth:190 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:12,
            fontFamily:"'Outfit',sans-serif" }}>FinOps Actions</div>
          {FINOPS_ACTIONS.map((action,i)=>(
            <div key={i} onClick={()=>setActiveAction(activeAction===i?null:i)}
              style={{ ...cardStyle, padding:"10px 14px", marginBottom:8, cursor:"pointer",
                border:`1px solid ${activeAction===i ? C.blue : C.border}`,
                background: activeAction===i ? "#eff6ff" : "#fff",
                transition:"all 0.15s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:15 }}>{action.icon}</span>
                <span style={{ fontSize:12, fontWeight:700,
                  color: activeAction===i ? C.blue : C.text, lineHeight:1.3 }}>{action.title}</span>
              </div>
              {activeAction===i && (
                <div style={{ marginTop:8 }}>
                  <div style={{ fontSize:11, color:C.muted, lineHeight:1.55 }}>{action.desc}</div>
                  {action.savings>0 && (
                    <div style={{ marginTop:6, fontSize:11, color:C.success, fontWeight:700 }}>
                      Est. savings: {fmtK(action.savings)}/mo
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div style={{ marginTop:14, padding:14, background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#166534" }}>Total Optimization</div>
            <div style={{ fontSize:22, fontWeight:800, color:C.success,
              fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>{fmtK(totalSavings)}</div>
            <div style={{ fontSize:10, color:"#166534" }}>potential monthly savings</div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TABULAR VIEW
// ─────────────────────────────────────────────

const TabularView = () => {
  const [sortKey, setSortKey] = useState("spend");
  const [sortDir, setSortDir] = useState("desc");
  const sorted = [...BILLING_CENTERS].sort((a,b)=>{
    const m = sortDir==="desc" ? -1 : 1;
    return (a[sortKey]-b[sortKey])*m;
  });
  const handleSort = (key)=>{
    if(sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("desc"); }
  };
  const TH=({label,k})=>(
    <th onClick={()=>k&&handleSort(k)} style={{ padding:"10px 14px", textAlign:"left",
      fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.5,
      cursor:k?"pointer":"default", whiteSpace:"nowrap", background:"#f8fafc",
      userSelect:"none", borderBottom:"2px solid #e2e8f0" }}>
      {label}{k ? (sortKey===k ? (sortDir==="desc"?" ↓":" ↑") : " ↕") : ""}
    </th>
  );
  const totalSpend=BILLING_CENTERS.reduce((s,c)=>s+c.spend,0);
  const totalBudget=BILLING_CENTERS.reduce((s,c)=>s+c.budget,0);
  return (
    <div style={{ overflowX:"auto", ...cardStyle, padding:0 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>
            <TH label="Billing Center"  k={null} />
            <TH label="Current Spend"   k="spend" />
            <TH label="Budget"          k="budget" />
            <TH label="Utilization"     k={null} />
            <TH label="Last Month"      k="lastMonth" />
            <TH label="Risk Score"      k="riskScore" />
            <TH label="Providers"       k={null} />
            <TH label="Status"          k={null} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((c,i)=>{
            const pct=(c.spend/c.budget)*100;
            const col=pct>95?C.danger:pct>80?C.warning:C.success;
            return (
              <tr key={c.id} style={{ borderBottom:"1px solid #f1f5f9",
                background: i%2===0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding:"12px 14px", fontWeight:700, color:C.navy }}>{c.name}</td>
                <td style={{ padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmt(c.spend)}</td>
                <td style={{ padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace", color:C.muted }}>{fmt(c.budget)}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1, height:5, background:"#e2e8f0", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ width:`${Math.min(pct,100)}%`, height:"100%", background:col, borderRadius:3 }} />
                    </div>
                    <span style={{ fontSize:11, color:col, fontWeight:700, width:38 }}>{pct.toFixed(0)}%</span>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace", color:C.muted }}>{fmt(c.lastMonth)}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ fontWeight:800, fontSize:15,
                    color:c.riskScore>80?C.danger:c.riskScore>60?C.warning:C.success }}>{c.riskScore}</span>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {c.providers.map(p=>{const m=PROVIDER_META[p.name]; return <Chip key={p.name} color={m?.color||C.muted} bg={m?.bg||"#f8fafc"}>{m?.short}</Chip>;})}
                  </div>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  {c.anomalies>0
                    ? <span style={{ fontSize:11, color:"#991b1b", background:"#fef2f2", padding:"3px 8px", borderRadius:20, fontWeight:700 }}>⚡ {c.anomalies} alert{c.anomalies>1?"s":""}</span>
                    : <span style={{ fontSize:11, color:"#166534", background:"#f0fdf4", padding:"3px 8px", borderRadius:20, fontWeight:700 }}>✓ Clean</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop:"2px solid #e2e8f0", background:"#f8fafc" }}>
            <td style={{ padding:"12px 14px", fontWeight:800, color:C.navy }}>TOTAL</td>
            <td style={{ padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace", fontWeight:800, color:C.navy }}>{fmt(totalSpend)}</td>
            <td style={{ padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:C.muted }}>{fmt(totalBudget)}</td>
            <td colSpan={5}/>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────
// RISK AUDIT TAB
// ─────────────────────────────────────────────

const RiskAudit = () => {
  const avgScore = Math.round(NIST_CONTROLS.reduce((s,c)=>s+c.score,0)/NIST_CONTROLS.length);
  const compliant = NIST_CONTROLS.filter(c=>c.status==="Compliant").length;
  const totalFindings = NIST_CONTROLS.reduce((s,c)=>s+c.findings,0);

  return (
    <div>
      {/* Scorecards */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { label:"Overall NIST Score", value:avgScore+"/100", color:avgScore>80?C.success:C.warning },
          { label:"Compliant Controls",  value:`${compliant}/${NIST_CONTROLS.length}`, color:C.blue    },
          { label:"Open Findings",       value:totalFindings,                           color:C.danger  },
          { label:"Framework Version",   value:"CSF 2.0",                               color:C.navy    },
        ].map((s,i)=>(
          <div key={i} style={{ ...cardStyle, flex:"1 1 140px", textAlign:"center", padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>

        {/* NIST Controls table */}
        <div style={{ flex:2, minWidth:300 }}>
          <div style={{ ...cardStyle }}>
            <h3 style={{ margin:"0 0 16px", fontFamily:"'Outfit',sans-serif", fontSize:15, color:C.navy }}>
              NIST CSF 2.0 Control Assessment
            </h3>
            {NIST_CONTROLS.map((ctrl,i)=>{
              const catCol=NIST_CAT_COLORS[ctrl.category]||C.blue;
              const scCol=ctrl.score>80?C.success:ctrl.score>65?C.warning:C.danger;
              return (
                <div key={i} style={{ padding:"12px 0", borderBottom:i<NIST_CONTROLS.length-1?"1px solid #f1f5f9":"none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4,
                        background:catCol+"20", color:catCol, fontFamily:"'JetBrains Mono',monospace" }}>{ctrl.id}</span>
                      <span style={{ fontSize:13, fontWeight:500, color:C.text }}>{ctrl.name}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {ctrl.findings>0 && (
                        <span style={{ fontSize:10, color:C.danger, background:"#fef2f2",
                          padding:"1px 7px", borderRadius:10, border:"1px solid #fecaca" }}>
                          {ctrl.findings} finding{ctrl.findings>1?"s":""}
                        </span>
                      )}
                      <span style={{ fontSize:13, fontWeight:800, color:scCol,
                        fontFamily:"'JetBrains Mono',monospace", minWidth:28, textAlign:"right" }}>{ctrl.score}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ flex:1, height:5, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ width:`${ctrl.score}%`, height:"100%", background:scCol, borderRadius:3, transition:"width 0.7s ease" }} />
                    </div>
                    <span style={{ fontSize:10, padding:"1px 8px", borderRadius:10, fontWeight:700, whiteSpace:"nowrap",
                      background: ctrl.status==="Compliant"?"#f0fdf4":ctrl.status==="At Risk"?"#fef2f2":"#fefce8",
                      color: ctrl.status==="Compliant"?"#166534":ctrl.status==="At Risk"?"#991b1b":"#854d0e" }}>
                      {ctrl.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly Feed */}
        <div style={{ flex:1, minWidth:250 }}>
          <div style={{ ...cardStyle }}>
            <h3 style={{ margin:"0 0 12px", fontFamily:"'Outfit',sans-serif", fontSize:15, color:C.navy }}>Anomaly Detection Feed</h3>
            <div style={{ fontSize:11, color:C.muted, marginBottom:14 }}>AI spend anomaly detection · Last 7 days</div>
            {ANOMALIES.map((a,i)=>{
              const sc=SEVERITY_STYLE[a.severity];
              return (
                <div key={i} style={{ padding:"10px 12px", borderRadius:10, marginBottom:8,
                  background:a.resolved?"#f8fafc":sc.bg, opacity:a.resolved?0.65:1,
                  border:`1px solid ${a.resolved?"#e2e8f0":sc.dot+"32"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:7, height:7, borderRadius:"50%",
                        background:a.resolved?C.muted:sc.dot, flexShrink:0 }} />
                      <span style={{ fontSize:12, fontWeight:700, color:a.resolved?C.muted:sc.text }}>{a.service}</span>
                    </div>
                    <span style={{ fontSize:11, fontWeight:800, color:a.resolved?C.muted:sc.text }}>{a.spike}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.muted }}>{a.center}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:11 }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:600,
                      color:a.resolved?C.muted:C.text }}>{a.amount}</span>
                    <span style={{ color:C.muted }}>{a.time}</span>
                  </div>
                  {a.resolved && <div style={{ marginTop:4, fontSize:10, color:"#166534", fontWeight:700 }}>✓ Resolved</div>}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SVG AREA CHART
// ─────────────────────────────────────────────

function AreaChartSVG({ data, series, height = 260 }) {
  const W = 800, H = height;
  const pad = { top: 16, right: 24, bottom: 36, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const allVals = data.flatMap(d => series.map(s => d[s.key] || 0));
  const maxV = Math.max(...allVals) * 1.1;

  const toX = (i) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v) => pad.top + chartH - (v / maxV) * chartH;

  const buildPath = (key) => {
    const pts = data.map((d, i) => `${toX(i)},${toY(d[key] || 0)}`);
    const close = `L${toX(data.length-1)},${pad.top+chartH} L${pad.left},${pad.top+chartH} Z`;
    return `M${pts.join(' L')} ${close}`;
  };
  const buildLine = (key) => {
    const pts = data.map((d, i) => `${toX(i)},${toY(d[key] || 0)}`);
    return `M${pts.join(' L')}`;
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * maxV));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
      <defs>
        {series.map(s => (
          <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={s.color} stopOpacity={0.28}/>
            <stop offset="95%" stopColor={s.color} stopOpacity={0}/>
          </linearGradient>
        ))}
      </defs>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={toY(v)} x2={pad.left+chartW} y2={toY(v)}
            stroke="#f1f5f9" strokeWidth={1} />
          <text x={pad.left-6} y={toY(v)+4} textAnchor="end" fontSize={10} fill="#94a3b8">
            ${Math.round(v/1000)}K
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#94a3b8">{d.month}</text>
      ))}
      {series.map(s => (
        <path key={`fill-${s.key}`} d={buildPath(s.key)} fill={`url(#grad-${s.key})`} />
      ))}
      {series.map(s => (
        <path key={`line-${s.key}`} d={buildLine(s.key)} fill="none" stroke={s.color} strokeWidth={2} />
      ))}
      {data[0]?.budget && (
        <path d={buildLine('budget')} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 3" />
      )}
      {series.map((s, i) => (
        <g key={`leg-${s.key}`} transform={`translate(${pad.left + i * 110}, ${H - 2})`}>
          <circle cx={6} cy={-4} r={5} fill={s.color} />
          <text x={14} y={0} fontSize={11} fill="#64748b">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// FORECAST TAB
// ─────────────────────────────────────────────

const ForecastView = ({ currentTrendData }) => {
  const totalSavings = SAVINGS_OPP.reduce((s,o)=>s+o.savings,0);
  const lastData = MONTHLY_TREND[5];
  const projectedAnnual = (lastData.AWS+lastData.Azure+lastData.GCP)*12;
  const effortColor = { Low:C.success, Medium:C.warning, High:C.danger };
  const providerColor = { AWS:"#ff9900", Azure:"#0078d4", GCP:"#4285f4", All:C.navy, "AWS/Azure":"#7c3aed" };

  return (
    <div>
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        {[
          { label:"Projected Annual Spend",  value:fmtK(projectedAnnual), color:C.navy    },
          { label:"Monthly Savings Identified",value:fmtK(totalSavings),  color:C.success },
          { label:"Annualized Savings",       value:fmtK(totalSavings*12),color:C.blue    },
          { label:"Avg. Payback Period",      value:"< 30 days",           color:C.warning },
        ].map((s,i)=>(
          <div key={i} style={{ ...cardStyle, flex:"1 1 160px", padding:"14px 18px" }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div style={{ ...cardStyle, marginBottom:20 }}>
        <h3 style={{ margin:"0 0 6px", fontFamily:"'Outfit',sans-serif", fontSize:15, color:C.navy }}>
          Multi-Cloud Spend Trend + 60-Day Projection
        </h3>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
          Months marked ▸ are forward projections · Dashed line = monthly budget ceiling
        </div>
        <AreaChartSVG
          data={currentTrendData}
          height={260}
          series={[
            { key: 'AWS', color: '#ff9900', label: 'AWS' },
            { key: 'Azure', color: '#0078d4', label: 'Azure' },
            { key: 'GCP', color: '#4285f4', label: 'GCP' },
          ]}
        />
      </div>

      {/* Savings opportunities table */}
      <div style={{ ...cardStyle }}>
        <h3 style={{ margin:"0 0 16px", fontFamily:"'Outfit',sans-serif", fontSize:15, color:C.navy }}>
          Optimization Opportunities · Ranked by Monthly Savings
        </h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:"#f8fafc", borderBottom:"2px solid #e2e8f0" }}>
                {["Opportunity","Monthly Savings","Effort","Timeline","Provider"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11,
                    fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAVINGS_OPP.map((opp,i)=>(
                <tr key={i} style={{ borderBottom:"1px solid #f1f5f9", background:i%2===0?"#fff":"#fafafa" }}>
                  <td style={{ padding:"12px 14px", fontWeight:600, color:C.navy }}>{opp.name}</td>
                  <td style={{ padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:C.success }}>{fmtK(opp.savings)}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ fontSize:11, padding:"2px 9px", borderRadius:20, fontWeight:700,
                      color:effortColor[opp.effort], background:effortColor[opp.effort]+"15",
                      border:`1px solid ${effortColor[opp.effort]}30` }}>{opp.effort}</span>
                  </td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>{opp.timeline}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <Chip color={providerColor[opp.provider]||C.blue} bg={(providerColor[opp.provider]||C.blue)+"18"}>{opp.provider}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:"2px solid #e2e8f0", background:"#f0fdf4" }}>
                <td style={{ padding:"12px 14px", fontWeight:800, color:"#166534" }}>TOTAL MONTHLY SAVINGS</td>
                <td style={{ padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace",
                  fontWeight:800, color:C.success, fontSize:15 }}>{fmtK(totalSavings)}</td>
                <td colSpan={3}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export default function FinOpsDashboard() {
  const [tab, setTab]                   = useState("allocation");
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("spend-desc");
  const [viewMode, setViewMode]         = useState("grid");
  const [selectedCenter, setSelected]   = useState(null);
  const [monthIdx, setMonthIdx]         = useState(5);

  // Derive month-adjusted billing centers
  const adjustedCenters = BILLING_CENTERS.map((c, idx) => {
    const mult = MONTHLY_MULTIPLIERS[idx]?.[monthIdx] ?? 1;
    const spend = Math.round(c.spend * mult);
    const lastMult = MONTHLY_MULTIPLIERS[idx]?.[Math.max(0, monthIdx - 1)] ?? mult;
    const lastMonth = Math.round(c.spend * lastMult);
    const trendPct = lastMonth > 0 ? Math.abs(((spend - lastMonth) / lastMonth) * 100).toFixed(1) : 0;
    return {
      ...c,
      spend,
      lastMonth,
      trendPct: parseFloat(trendPct),
      trend: spend >= lastMonth ? "up" : "down",
    };
  });

  const currentTrendData = getTrendData(monthIdx);

  const totalSpend  = adjustedCenters.reduce((s,c)=>s+c.spend,0);
  const totalBudget = adjustedCenters.reduce((s,c)=>s+c.budget,0);
  const activeAnomalies = ANOMALIES.filter(a=>!a.resolved).length;

  const filtered = adjustedCenters
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
                 c.tags.some(t=>t.includes(search.toLowerCase())))
    .sort((a,b)=>{
      const [key,dir] = sortBy.split("-");
      const keyMap = { spend:"spend", budget:"budget", risk:"riskScore" };
      const field = keyMap[key]||"spend";
      return (a[field]-b[field]) * (dir==="desc"?-1:1);
    });

  const TABS = [
    { id:"allocation", label:"Allocation Map"   },
    { id:"billing",    label:"Billing Centers"  },
    { id:"tabular",    label:"Tabular View"     },
    { id:"risk",       label:"Risk Audit"       },
    { id:"forecast",   label:"Forecast"         },
  ];

  return (
    <div className="finops-root" style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:C.bg,
      minHeight:"100vh", color:C.text, position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:#f1f5f9;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
        input:focus{outline:2px solid #2563eb !important;outline-offset:0;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        @media (max-width: 640px) {
          .finops-root > div { flex-direction: column !important; }
          .finops-sidebar { width: 100% !important; min-width: unset !important; flex-shrink: 1 !important; }
        }
      `}</style>

      {/* ── HEADER BAR ── */}
      <div style={{ background:C.navy, padding:"0 24px", display:"flex",
        alignItems:"center", gap:10, height:52, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:7, background:C.blue,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#fff", fontSize:12, fontWeight:800, letterSpacing:0.5 }}>FO</span>
          </div>
          <span style={{ color:"#fff", fontWeight:700, fontSize:15, fontFamily:"'Outfit',sans-serif" }}>
            FinOps Console
          </span>
          <span style={{ color:"#475569", fontSize:12 }}>·  Cloud / Cost Optimization / Billing Centers</span>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e",
              animation:"pulse 2s infinite" }} />
            <span style={{ color:"#94a3b8", fontSize:11 }}>Simulated Pipeline · Live Mode</span>
          </div>
          <span style={{ color:"#64748b", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
            Lancelot Naipier-Kane
          </span>
        </div>
      </div>

      {/* ── PAGE TITLE + MAIN TABS ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"0 24px" }}>
        <div style={{ paddingTop:16 }}>
          <h1 style={{ margin:"0 0 3px", fontSize:22, fontWeight:800, color:C.navy,
            fontFamily:"'Outfit',sans-serif" }}>Billing Centers</h1>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
            Costs are <strong>amortized</strong> and <strong>unblended</strong> · Azure + AWS multi-cloud simulation via Data Factory ingestion pipeline
          </div>
        </div>
        <div style={{ display:"flex", gap:0, overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"10px 20px", background:"none", border:"none",
              borderBottom: tab===t.id ? `2px solid ${C.blue}` : "2px solid transparent",
              color: tab===t.id ? C.blue : C.muted,
              fontWeight: tab===t.id ? 700 : 500,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              fontSize:13.5, whiteSpace:"nowrap", marginBottom:-1,
              transition:"color 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:"20px 24px", maxWidth:1440, margin:"0 auto" }}>

        {/* BILLING CENTERS TAB */}
        {tab==="billing" && (
          <div>
            {/* Summary stat row */}
            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              {[
                { label:"Total June Spend",    value:fmtK(totalSpend),   sub:"Across 6 centers",                      color:C.navy    },
                { label:"Budget Remaining",    value:fmtK(totalBudget-totalSpend), sub:`${(((totalBudget-totalSpend)/totalBudget)*100).toFixed(0)}% headroom remaining`, color:C.success },
                { label:"Active Anomalies",    value:activeAnomalies,    sub:"Requiring attention",                   color:C.danger  },
                { label:"Budget Utilization",  value:`${((totalSpend/totalBudget)*100).toFixed(1)}%`, sub:"of $2.67M total budget", color:C.warning },
              ].map((s,i)=>(
                <div key={i} style={{ ...cardStyle, flex:"1 1 160px", padding:"14px 18px" }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:26, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div style={{ ...cardStyle, padding:"12px 16px", marginBottom:20,
              display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flex:"1 1 240px",
                border:"1px solid #e2e8f0", borderRadius:8, padding:"0 12px", background:"#f8fafc" }}>
                <span style={{ color:C.muted }}>🔍</span>
                <input placeholder="Filter by name or tag..."
                  value={search} onChange={e=>setSearch(e.target.value)}
                  style={{ border:"none", background:"transparent", padding:"7px 0",
                    fontSize:13, width:"100%", fontFamily:"inherit", color:C.text }}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, color:C.muted }}>Sort by:</span>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  style={{ border:"1px solid #e2e8f0", borderRadius:8, padding:"7px 12px",
                    fontSize:12, fontFamily:"inherit", color:C.text, cursor:"pointer", background:"#fff" }}>
                  <option value="spend-desc">Spend (High → Low)</option>
                  <option value="spend-asc">Spend (Low → High)</option>
                  <option value="risk-desc">Risk Score (High → Low)</option>
                </select>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button onClick={()=>setMonthIdx(m=>Math.max(0,m-1))}
                  style={{ background:"#f1f5f9", border:"none", borderRadius:6,
                    padding:"6px 10px", cursor:"pointer", fontSize:15, color:C.navy }}>‹</button>
                <span style={{ fontSize:13, fontWeight:700, color:C.navy, minWidth:96, textAlign:"center" }}>
                  {MONTHS[monthIdx]} 2024
                </span>
                <button onClick={()=>setMonthIdx(m=>Math.min(11,m+1))}
                  style={{ background:"#f1f5f9", border:"none", borderRadius:6,
                    padding:"6px 10px", cursor:"pointer", fontSize:15, color:C.navy }}>›</button>
              </div>
              <div style={{ display:"flex", gap:4, marginLeft:"auto" }}>
                {["grid","list"].map(mode=>(
                  <button key={mode} onClick={()=>setViewMode(mode)}
                    style={{ padding:"6px 12px", borderRadius:6,
                      border:`1px solid ${viewMode===mode?C.blue:"#e2e8f0"}`,
                      background: viewMode===mode?"#eff6ff":"#fff",
                      color: viewMode===mode?C.blue:C.muted, cursor:"pointer", fontSize:14 }}>
                    {mode==="grid"?"⊞":"☰"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            <div style={{
              display:"grid",
              gridTemplateColumns: viewMode==="grid" ? "repeat(auto-fill,minmax(290px,1fr))" : "1fr",
              gap:16,
            }}>
              {filtered.map(center=>(
                <BillingCard key={center.id} center={center} onClick={setSelected}/>
              ))}
            </div>
            {filtered.length===0 && (
              <div style={{ textAlign:"center", padding:56, color:C.muted }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
                <div style={{ fontSize:14 }}>No billing centers match your filter.</div>
              </div>
            )}
          </div>
        )}

        {tab==="allocation" && <AllocationMap />}
        {tab==="tabular"    && <TabularView />}
        {tab==="risk"       && <RiskAudit />}
        {tab==="forecast"   && <ForecastView currentTrendData={currentTrendData} />}
      </div>

      {/* ── FOOTER ── */}

      {/* Drill-down modal */}
      {selectedCenter && <CenterModal center={selectedCenter} onClose={()=>setSelected(null)}/>}

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
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), Recharts, Python (Pandas, Boto3, Azure SDK), AWS Cost Explorer API, Azure Cost Management REST API, Terraform (infrastructure tagging schema), Apptio Cloudability, CloudHealth by VMware, Snowflake (cost allocation mart), dbt
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> FinOps Framework cost allocation across shared services using proportional tagging and activity-based allocation; cloud unit economics modeling (cost per transaction, cost per user, cost per API call); showback/chargeback report generation by business unit and cost center; reserved instance (RI) and savings plan utilization optimization via coverage/utilization gap analysis; rightsizing recommendations from EC2 and Azure VM utilization data (CPU p95, memory p90); idle resource identification and waste quantification; multi-cloud cost variance trending across AWS and Azure; FinOps crawl/walk/run maturity scoring; all billing data and utilization metrics are simulated based on published cloud pricing models
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> FinOps Foundation framework documentation and maturity model; AWS Cost Explorer API reference and CUR schema; Azure Cost Management and Billing documentation; Apptio/Cloudability unit cost methodology; CNCF FinOps white papers; cloud billing data simulated based on AWS CUR and Azure CCF schema conventions and published pricing
        </p>
      </div>
    </div>
  );
}
