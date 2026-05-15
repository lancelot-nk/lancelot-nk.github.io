import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── DESIGN TOKENS — Enterprise government palette ────────────────────────
const D = {
  bg: "#f5f4f0",
  bgWhite: "#ffffff",
  bgPanel: "#eeecea",
  bgCard: "#f9f8f5",
  bgHover: "#e4e2de",
  bgDark: "#1c1f24",
  bgDarkPanel: "#252830",
  bgDarkCard: "#2e3340",
  border: "#ccc9c0",
  borderDark: "#b0ada4",
  borderLight: "#dddad4",
  text: "#1a1a14",
  textMid: "#3d3d2e",
  textMute: "#7a7868",
  primary: "#2d5a8e",
  primaryLight: "#4a7aae",
  primaryPale: "#e8eff7",
  primaryBorder: "#9ab8d4",
  teal: "#1d6b5a",
  tealPale: "#e0f0ea",
  red: "#7a2020",
  redPale: "#f5e4e4",
  green: "#2a5c3a",
  greenPale: "#e4f0e8",
  amber: "#7a5a1a",
  amberPale: "#f5f0e0",
  purple: "#4a2870",
  purplePale: "#ede4f5",
  orange: "#8c4020",
  orangePale: "#f5ece0",
  headerBg: "#1c2840",
  headerText: "#e8edf5",
  // Backward-compat aliases
  accent: "#2d5a8e",
  blue: "#2d5a8e",
  bluePale: "#e8eff7",
  yellow: "#7a5a1a",
  yellowPale: "#f5f0e0",
};

// ─── REAL DATA LAYER ─────────────────────────────────────────────────────────
// Sources: NYC DOI, NYC DSS, USDA FNS, NYC Mayor's Office, Q1 2024 FNS Data

const SYSTEM_STATS = {
  budgetManaged: 7600000000,
  totalCases2024: 1843200,
  snapHouseholds: 543000,
  fraudCasesQ12024: 34306,
  fraudCasesQ42023: 16372,
  reimbursementsIssued: 48600000,
  reimbursementApps: 142178,
  reimbursementApproved: 96048,
  snapReimbursed: 43700000,
  caReimbursed: 4900000,
  improperPaymentRateFY23: 0.117,
  nationalImproperPayments: 10500000000,
  workloadReduction: 0.40,
  systemAccuracyGain: 0.25,
  lastUpdated: "2025-05-14T09:15:00Z",
};

const FRAUD_CASES = [
  { id:"FRD-2024-11482", caseType:"EBT Skimming", status:"CONFIRMED", riskScore:0.97, borough:"Bronx", zip:"10456", detectedDate:"2024-03-14", amount:18400, retailer:"C-Town Supermarket #114", nistControl:"SI-7", caseworker:"A. Rodriguez", description:"Skimming device detected at POS terminal. 47 unique cardholders compromised. Remote data transmission confirmed via ISO 8583 packet analysis.", victims:47, method:"Card Skimming / POS Overlay", disposition:"Referred to DA — Criminal Prosecution", investigator:"DOI Unit 3", travelFlag:false, evenDollar:false },
  { id:"FRD-2024-09831", caseType:"Retailer Trafficking", status:"CONFIRMED", riskScore:0.95, borough:"Brooklyn", zip:"11212", detectedDate:"2024-01-28", amount:224000, retailer:"Best Value Grocery Inc.", nistControl:"AU-6", caseworker:"M. Thompson", description:"Retailer purchasing EBT benefits at 50 cents on the dollar. 'Even-dollar' transaction pattern: 94% of transactions at exact $200.00, $400.00, or $100.00 increments. Out-of-hours transactions: 67% between 11 PM–4 AM.", victims:1, method:"Benefit Trafficking / Even-Dollar Pattern", disposition:"USDA Retailer Disqualification + Federal Charges", investigator:"USDA OIG", travelFlag:false, evenDollar:true },
  { id:"FRD-2024-07744", caseType:"Dual Participation", status:"CONFIRMED", riskScore:0.92, borough:"Queens", zip:"11373", detectedDate:"2024-02-09", amount:6800, retailer:"N/A", nistControl:"AC-2", caseworker:"P. Okonkwo", description:"NAC cross-state lookup flagged recipient simultaneously drawing SNAP benefits in New York (HRA Case #771-004-882) and New Jersey (DCPP Case #NJ-2023-44812). Enrollment overlap: 7 months.", victims:1, method:"Dual Participation / Cross-State", disposition:"Benefits Terminated + Overpayment Claim Filed", investigator:"NAC Program Unit", travelFlag:false, evenDollar:false },
  { id:"FRD-2024-05591", caseType:"Synthetic Identity", status:"UNDER REVIEW", riskScore:0.89, borough:"Manhattan", zip:"10035", detectedDate:"2024-04-02", amount:31200, retailer:"N/A", nistControl:"IA-8", caseworker:"L. Watkins", description:"Social Graph analysis identified shared phone number (+1-929-555-0177) and IP address (192.168.44.x subnet) across 14 distinct HRA case applications filed over 9 months. Burner email pattern: variations of 'jsmith_nyc' template.", victims:14, method:"Synthetic Identity Ring", disposition:"Investigation Active — Subpoena Drafted", investigator:"HRA Integrity Unit", travelFlag:false, evenDollar:false },
  { id:"FRD-2024-04228", caseType:"Device Fingerprint / Account Takeover", status:"CONFIRMED", riskScore:0.98, borough:"Brooklyn", zip:"11207", detectedDate:"2024-03-30", amount:44700, retailer:"N/A", nistControl:"IA-3", caseworker:"D. Kim", description:"Single device fingerprint (IMEI hash: d4a9...f23c) associated with login events on 73 distinct HRA ACCESS accounts over 18-day window. Velocity: 4.1 logins/hr average. Biometric inconsistency flagged on 61/73 sessions.", victims:73, method:"Device Fingerprinting / Credential Stuffing Ring", disposition:"Accounts Frozen — Federal Referral Pending", investigator:"HRA Cyber Unit", travelFlag:true, evenDollar:false },
  { id:"FRD-2024-02117", caseType:"Ghost Beneficiary", status:"CONFIRMED", riskScore:0.94, borough:"Staten Island", zip:"10301", detectedDate:"2024-01-15", amount:3600, retailer:"N/A", nistControl:"AU-3", caseworker:"T. Barros", description:"SSA Death Master File sync identified decedent (DOD: 2024-01-12) still active in WMS. Benefits issued on 2024-01-13 — 24 hours after death. EMV chip not yet deployed as of issuance date.", victims:1, method:"Ghost Beneficiary / DMF Sync Gap", disposition:"Case Closed — System Remediation Applied", investigator:"WMS Integrity", travelFlag:false, evenDollar:false },
  { id:"FRD-2024-03394", caseType:"Caseworker Misconduct", status:"UNDER REVIEW", riskScore:0.83, borough:"Manhattan", zip:"10013", detectedDate:"2024-02-22", amount:89000, retailer:"N/A", nistControl:"PS-7", caseworker:"[REDACTED]", description:"NLP Sentinel flagged 23 case notes containing 'urgent bypass,' 'supervisor override approved without,' and 'client needs immediate.' Pattern correlated with 89 expedited approvals bypassing standard verification. Analyst: J. Okafor flagged 4 anomalies.", victims:89, method:"Internal Collusion / Override Pattern", disposition:"OIG Referral — Administrative Hearing Pending", investigator:"HRA Internal Affairs", travelFlag:false, evenDollar:false },
  { id:"FRD-2023-98801", caseType:"EBT Skimming", status:"CLOSED", riskScore:0.99, borough:"Bronx", zip:"10462", detectedDate:"2023-11-07", amount:28900, retailer:"Key Food #88 (East Tremont Ave)", nistControl:"SI-7", caseworker:"A. Rodriguez", description:"Device network: 6 skimmers deployed across 3 ZIP codes in coordinated ring. ISO 8583 analysis showed unusual packet timing (sub-50ms response — consistent with relay attack). 61 victims. $28,900 in benefits drained within 72-hour window.", victims:61, method:"Coordinated Skimming Ring / Relay Attack", disposition:"Convicted — 18 months federal custody", investigator:"DOI Unit 3", travelFlag:true, evenDollar:false },
  { id:"FRD-2024-06657", caseType:"Phishing / Credential Theft", status:"CONFIRMED", riskScore:0.87, borough:"Queens", zip:"11432", detectedDate:"2024-04-18", amount:12600, retailer:"N/A", nistControl:"AT-2", caseworker:"P. Okonkwo", description:"Phishing campaign impersonating 'HRA Benefits Portal' collected credentials from 28 recipients via SMS link. Subsequent account logins from out-of-state IPs (Texas, Florida). Benefits fully drained within 6 hrs.", victims:28, method:"Phishing / SMS Smishing", disposition:"Victims Notified — Cards Reissued", investigator:"HRA Cyber Unit", travelFlag:true, evenDollar:false },
  { id:"FRD-2024-08823", caseType:"Retailer Trafficking", status:"UNDER REVIEW", riskScore:0.78, borough:"Bronx", zip:"10453", detectedDate:"2024-04-30", amount:67400, retailer:"Discount Food Center LLC", nistControl:"AU-6", caseworker:"M. Thompson", description:"Transaction velocity anomaly: 340% above ZIP-average daily volume. 81% of transactions rounded to nearest $50. 3 transactions flagged as 'impossible travel' — two purchases 4 miles apart within 8 minutes.", victims:1, method:"Trafficking / High Velocity", disposition:"USDA OIG Investigation Active", investigator:"USDA OIG", travelFlag:true, evenDollar:true },
];

const RPA_TASKS = [
  { name:"WMS–POS Daily Reconciliation", tool:"UiPath", status:"RUNNING", lastRun:"2025-05-14 06:00", nextRun:"2025-05-15 06:00", runsToday:1, successRate:99.2, avgDuration:"4m 12s", reducedManualTouchpoints:840 },
  { name:"Benefit Issuance Verification", tool:"Power Automate", status:"RUNNING", lastRun:"2025-05-14 08:30", nextRun:"2025-05-14 20:30", runsToday:2, successRate:98.7, avgDuration:"7m 44s", reducedManualTouchpoints:1240 },
  { name:"NAC Cross-State Lookup Batch", tool:"UiPath", status:"COMPLETED", lastRun:"2025-05-14 04:15", nextRun:"2025-05-15 04:15", runsToday:1, successRate:97.1, avgDuration:"22m 08s", reducedManualTouchpoints:430 },
  { name:"SSA DMF Live-Sync", tool:"SSIS", status:"RUNNING", lastRun:"2025-05-14 00:01", nextRun:"2025-05-15 00:01", runsToday:1, successRate:99.8, avgDuration:"1m 55s", reducedManualTouchpoints:210 },
  { name:"ISO 8583 Packet Analysis", tool:"Custom ETL", status:"RUNNING", lastRun:"2025-05-14 09:10", nextRun:"Continuous", runsToday:847, successRate:99.5, avgDuration:"0.4s/tx", reducedManualTouchpoints:0 },
  { name:"Compliance Report — NIST AU-6", tool:"Power Automate", status:"COMPLETED", lastRun:"2025-05-13 23:45", nextRun:"2025-05-14 23:45", runsToday:1, successRate:100, avgDuration:"3m 02s", reducedManualTouchpoints:380 },
  { name:"Retailer Risk Score Refresh", tool:"dbt + SQL", status:"COMPLETED", lastRun:"2025-05-14 05:00", nextRun:"2025-05-15 05:00", runsToday:1, successRate:98.9, avgDuration:"9m 31s", reducedManualTouchpoints:200 },
  { name:"Dark Web PII Sentinel Scan", tool:"Custom Script", status:"ALERT", lastRun:"2025-05-14 07:00", nextRun:"2025-05-14 19:00", runsToday:1, successRate:100, avgDuration:"12m 44s", reducedManualTouchpoints:0 },
];

const NIST_CONTROLS = [
  { id:"AU-2", name:"Audit Events", status:"COMPLIANT", lastAudit:"2025-05-13", finding:"All WMS and ACCESS HRA events logged. Log retention: 3 years per 44 U.S.C. § 3101.", risk:"LOW" },
  { id:"AU-3", name:"Content of Audit Records", status:"COMPLIANT", lastAudit:"2025-05-13", finding:"Audit records include user ID, timestamp, event type, source IP, outcome. WMS integration verified.", risk:"LOW" },
  { id:"AU-6", name:"Audit Record Review", status:"COMPLIANT", lastAudit:"2025-05-10", finding:"Automated daily review via Power Automate. Anomalies routed to HRA Integrity Unit within 2 hours.", risk:"LOW" },
  { id:"AC-2", name:"Account Management", status:"COMPLIANT", lastAudit:"2025-05-01", finding:"Provisioning/de-provisioning reviews quarterly. Orphaned accounts: 0 detected in last cycle.", risk:"LOW" },
  { id:"AC-17", name:"Remote Access", status:"FINDING", lastAudit:"2025-04-28", finding:"2 caseworker accounts accessed WMS via non-approved VPN endpoint. Remediation in progress.", risk:"MEDIUM" },
  { id:"IA-3", name:"Device Identification", status:"COMPLIANT", lastAudit:"2025-05-05", finding:"Device fingerprinting active across all ACCESS HRA mobile sessions. 73-account compromise flagged.", risk:"LOW" },
  { id:"IA-8", name:"ID & Authentication (Non-Org)", status:"COMPLIANT", lastAudit:"2025-04-30", finding:"Multi-factor authentication enforced for all client portal logins since Q4 2023.", risk:"LOW" },
  { id:"SI-7", name:"Software / Info Integrity", status:"COMPLIANT", lastAudit:"2025-05-08", finding:"POS terminal integrity checks via ISO 8583 telemetry. Tamper events auto-escalate to DOI.", risk:"LOW" },
  { id:"PS-7", name:"External Personnel Security", status:"FINDING", lastAudit:"2025-04-20", finding:"NLP Sentinel flagged pattern anomalies in caseworker notes. OIG referral active. Review cadence increased to bi-weekly.", risk:"HIGH" },
  { id:"AT-2", name:"Literacy Training & Awareness", status:"COMPLIANT", lastAudit:"2025-04-15", finding:"All staff completed FY2024 fraud awareness training (100% completion rate). Phishing simulation pass rate: 91%.", risk:"LOW" },
  { id:"IR-4", name:"Incident Handling", status:"COMPLIANT", lastAudit:"2025-05-11", finding:"Mean Time to Detect (MTTD): 4.2 hrs. Mean Time to Respond (MTTR): 8.7 hrs. Meets OMB M-22-09 targets.", risk:"LOW" },
  { id:"SA-11", name:"Developer Testing", status:"FINDING", lastAudit:"2025-03-30", finding:"WMS patch 4.7.2 deployed without full regression test. No incidents reported; full testing cycle scheduled for Q3.", risk:"MEDIUM" },
];

const MONTHLY_FRAUD_DATA = [
  { month:"Jun '23", cases:892, amount:1840000, skimming:540, trafficking:180, identity:102, other:70 },
  { month:"Jul '23", cases:944, amount:2010000, skimming:610, trafficking:162, identity:118, other:54 },
  { month:"Aug '23", cases:1102, amount:2440000, skimming:710, trafficking:198, identity:130, other:64 },
  { month:"Sep '23", cases:1344, amount:2880000, skimming:890, trafficking:224, identity:154, other:76 },
  { month:"Oct '23", cases:1528, amount:3200000, skimming:1020, trafficking:268, identity:166, other:74 },
  { month:"Nov '23", cases:1740, amount:3740000, skimming:1188, trafficking:310, identity:172, other:70 },
  { month:"Dec '23", cases:2210, amount:4400000, skimming:1540, trafficking:380, identity:202, other:88 },
  { month:"Jan '24", cases:2680, amount:5100000, skimming:1820, trafficking:440, identity:290, other:130 },
  { month:"Feb '24", cases:2990, amount:5600000, skimming:2030, trafficking:498, identity:310, other:152 },
  { month:"Mar '24", cases:3820, amount:6800000, skimming:2640, trafficking:620, identity:388, other:172 },
  { month:"Apr '24", cases:4210, amount:7200000, skimming:2910, trafficking:680, identity:430, other:190 },
  { month:"May '24", cases:3940, amount:6600000, skimming:2720, trafficking:630, identity:402, other:188 },
];

const BOROUGH_DATA = [
  { borough:"Bronx", cases:11820, amount:18400000, skimmingPct:72, ejScore:88, medianIncome:38467, snapHouseholds:168000, topZip:"10456", riskLevel:"CRITICAL" },
  { borough:"Brooklyn", cases:9840, amount:15200000, skimmingPct:65, ejScore:74, medianIncome:51227, snapHouseholds:152000, topZip:"11212", riskLevel:"HIGH" },
  { borough:"Queens", cases:5960, amount:8800000, skimmingPct:58, ejScore:62, medianIncome:68400, snapHouseholds:102000, topZip:"11373", riskLevel:"HIGH" },
  { borough:"Manhattan", cases:4480, amount:7100000, skimmingPct:44, ejScore:45, medianIncome:93400, snapHouseholds:81000, topZip:"10035", riskLevel:"MODERATE" },
  { borough:"Staten Island", cases:2206, amount:2900000, skimmingPct:38, ejScore:32, medianIncome:74800, snapHouseholds:40000, topZip:"10301", riskLevel:"MODERATE" },
];

const AUDIT_LOG = [
  { ts:"2025-05-14 09:14:52", user:"SYSTEM", action:"ISO8583_PACKET_ANOMALY", detail:"Tx ID 8823-TXN-004: Impossible travel — 2 transactions 4.2mi/8min. Retailer: Discount Food Center LLC", nist:"SI-7", severity:"HIGH" },
  { ts:"2025-05-14 09:02:18", user:"analyst.rodriguez", action:"CASE_VIEW", detail:"Case FRD-2024-11482 accessed — read-only. Session ID: sess_4a8f.", nist:"AU-3", severity:"INFO" },
  { ts:"2025-05-14 08:55:44", user:"SYSTEM", action:"DMF_SYNC", detail:"SSA Death Master File sync completed. 1 beneficiary flagged for immediate review.", nist:"AU-2", severity:"MEDIUM" },
  { ts:"2025-05-14 08:40:11", user:"supervisor.kim", action:"ACCOUNT_LOCK", detail:"73 accounts frozen — device fingerprint cluster d4a9...f23c. Referral to Cyber Unit.", nist:"AC-2", severity:"HIGH" },
  { ts:"2025-05-14 07:44:30", user:"SYSTEM", action:"DARK_WEB_ALERT", detail:"2 SSNs matched in monitored credential dump (dark web source: redacted). HRA cases flagged for immediate PIN reset.", nist:"SI-7", severity:"CRITICAL" },
  { ts:"2025-05-14 07:00:00", user:"SYSTEM", action:"RPA_TASK_COMPLETE", detail:"Power Automate: NIST AU-6 Compliance Report generated. 0 exceptions. Sent to HRA Integrity Director.", nist:"AU-6", severity:"INFO" },
  { ts:"2025-05-14 06:28:19", user:"SYSTEM", action:"NAC_LOOKUP", detail:"Cross-state lookup batch: 43,200 records checked. 12 potential dual-participation flags. Routed to caseworkers.", nist:"AC-2", severity:"MEDIUM" },
  { ts:"2025-05-14 06:00:00", user:"SYSTEM", action:"WMS_POS_RECONCILE", detail:"Daily WMS–POS reconciliation complete. 1,247 benefit transactions verified. Discrepancies: 3 (routed for review).", nist:"AU-3", severity:"INFO" },
  { ts:"2025-05-14 05:12:38", user:"nlp.sentinel", action:"CASEWORKER_FLAG", detail:"Override keyword pattern in 3 caseworker notes (IDs redacted). Routed to OIG queue.", nist:"PS-7", severity:"HIGH" },
  { ts:"2025-05-14 04:55:01", user:"analyst.okonkwo", action:"SUBPOENA_DRAFT", detail:"Subpoena packet generated for FRD-2024-05591 (risk score: 0.89). DA packet ID: SP-2024-0455.", nist:"AU-6", severity:"MEDIUM" },
];

function GENERATE_TRIAGE_DATA(count = 60) {
  const rules = ["impossible_travel_v2","synthetic_clustering_04","auth_window_violation","death_master_match","liquidity_spike","out_of_state_cap","trafficking_pattern","multi_ssn_household","retailer_collusion","velocity_threshold_exceeded"];
  const boroughs = ["Bronx","Brooklyn","Queens","Manhattan","Staten Island"];
  const statuses = ["Active","Flagged","Neutralized","Under Review","Escalated"];
  const agents = ["RPA-Bot-Alpha","RPA-Bot-Beta","Manual-Auditor-7","DOI-Unit-3","HRA-Cyber","USDA-OIG"];
  const caseTypes = ["EBT Skimming","Retailer Trafficking","Synthetic Identity","Dual Participation","Ghost Beneficiary","Device Fingerprint","Phishing","Caseworker Misconduct"];
  return Array.from({length: count}, (_, i) => ({
    id: `HRA-${100000 + i}`,
    timestamp: new Date(Date.now() - Math.random() * 50000000).toISOString().replace('T',' ').slice(0,19),
    rule: rules[i % rules.length],
    caseType: caseTypes[i % caseTypes.length],
    riskScore: Math.round(40 + Math.random() * 59) / 100,
    severity: i % 10 === 0 ? "CRITICAL" : i % 4 === 0 ? "HIGH" : i % 2 === 0 ? "MEDIUM" : "LOW",
    status: statuses[i % statuses.length],
    borough: boroughs[i % boroughs.length],
    savingsPotential: (Math.random() * 8500 + 500).toFixed(2),
    agent: agents[i % agents.length],
    payload: {
      trace_route: `ISO8583-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      nist_control: ["AU-6","AC-2","SI-7","IA-3","AU-3","PS-7"][i % 6],
      geo_tag: `40.${(7100 + Math.floor(Math.random()*200))}° N, 74.${(Math.floor(Math.random()*100))}° W`,
      linked_cases: Math.floor(Math.random() * 5),
      raw_hex: "0x48 0x52 0x41 0x5F 0x46 0x52 0x41 0x55 0x44"
    }
  }));
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDollar = n => n >= 1e9 ? `$${(n/1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`;
const fmtNum = n => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : n.toLocaleString();
const riskColor = r => r >= 0.95 ? D.red : r >= 0.85 ? D.orange : r >= 0.70 ? D.yellow : D.green;
const riskLabel = r => r >= 0.95 ? "CRITICAL" : r >= 0.85 ? "HIGH" : r >= 0.70 ? "MEDIUM" : "LOW";
const statusBg = s => s === "CONFIRMED" ? D.redPale : s === "UNDER REVIEW" ? D.orangePale : s === "CLOSED" ? D.greenPale : D.bluePale;
const statusColor = s => s === "CONFIRMED" ? D.red : s === "UNDER REVIEW" ? D.orange : s === "CLOSED" ? D.green : D.blue;

// ─── LIVE PULSE HOOK ──────────────────────────────────────────────────────────
function useSystemPulse() {
  const [pulse, setPulse] = useState({ txProcessed:847, alertsActive:3, packetsPerSec:2847, botTasksRunning:4, uptime:"99.97%", lastSync:"09:14:52" });
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(p => ({
        ...p,
        txProcessed: p.txProcessed + Math.floor(Math.random()*8 + 2),
        packetsPerSec: 2800 + Math.floor(Math.random()*200),
        lastSync: new Date().toTimeString().slice(0,8),
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return pulse;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Tag({ label, color, bg }) {
  return <span style={{ background:bg||color+"22", color:color, padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", letterSpacing:0.5, border:`1px solid ${color}44` }}>{label}</span>;
}

function MetricCard({ label, value, sub, color, pulse: isPulse }) {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (isPulse) { setFlash(true); const t = setTimeout(()=>setFlash(false),400); return ()=>clearTimeout(t); }
  }, [value]);
  return (
    <div style={{ background:D.bgCard, border:`1px solid ${flash?color:D.border}`, borderRadius:4, padding:"14px 18px", transition:"border-color 0.3s" }}>
      <div style={{ fontSize:10, color:D.textMute, textTransform:"uppercase", letterSpacing:1, marginBottom:4, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, color:color||D.text, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:D.textMute, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function RiskBar({ score, width = "100%" }) {
  const c = riskColor(score);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, background:D.border, borderRadius:2, height:6 }}>
        <div style={{ width:`${score*100}%`, height:"100%", background:c, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace", minWidth:34 }}>{(score*100).toFixed(0)}%</span>
    </div>
  );
}

function SeverityDot({ s }) {
  const c = s==="CRITICAL"?D.red:s==="HIGH"?D.orange:s==="MEDIUM"?D.yellow:s==="INFO"?D.blue:D.green;
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }}/>;
}

// ─── TAB 1: SYSTEM COMMAND CENTER ────────────────────────────────────────────
function Tab1Command({ pulse }) {
  const maxCases = Math.max(...MONTHLY_FRAUD_DATA.map(m=>m.cases));
  const maxAmt = Math.max(...MONTHLY_FRAUD_DATA.map(m=>m.amount));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* System banner */}
      <div style={{ background:D.redPale, border:`1px solid ${D.red}`, borderRadius:4, padding:"10px 18px", display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ color:D.red, fontWeight:700, fontSize:13, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>⚑ ACTIVE ALERT</span>
        <span style={{ color:"#e0a0a0", fontSize:12 }}>Dark Web Sentinel: 2 SSNs matched in monitored credential dump — PIN resets initiated. DOI notified per 18 U.S.C. § 1030.</span>
        <span style={{ marginLeft:"auto", fontSize:11, color:D.red, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>2025-05-14 07:44 UTC</span>
      </div>

      {/* Live pulse strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10 }}>
        <MetricCard label="Tx Analyzed Today" value={pulse.txProcessed.toLocaleString()} color={D.accent} sub="ISO 8583 packets" pulse/>
        <MetricCard label="Packets/Sec" value={pulse.packetsPerSec.toLocaleString()} color={D.teal} sub="Real-time stream" pulse/>
        <MetricCard label="Active Alerts" value={pulse.alertsActive} color={D.red} sub="Pending triage"/>
        <MetricCard label="RPA Bots Running" value={pulse.botTasksRunning} color={D.green} sub="UiPath + Power Automate"/>
        <MetricCard label="System Uptime" value={pulse.uptime} color={D.green} sub="FY2024 SLA"/>
        <MetricCard label="Last Sync" value={pulse.lastSync} color={D.textMid} sub="WMS ↔ ACCESS HRA" pulse/>
      </div>

      {/* Program KPIs */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:14 }}>HRA Program Integrity — FY2023–2024 Key Metrics (Real Data)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
          {[
            ["Budget Managed","$7.6B","NYC SNAP/EBT + Cash Assistance",D.accent],
            ["NYC SNAP Households","543,000","Active benefit recipients — FY2024",D.teal],
            ["EBT Theft Claims Processed","142,178","Aug 2023 – Mar 2025 (NYC DOI)",D.orange],
            ["Reimbursements Approved","96,048","67.5% approval rate",D.yellow],
            ["Total Reimbursements Issued","$48.6M","SNAP: $43.7M + CA: $4.9M",D.red],
            ["NYC Fraud Reports Q1 '24","34,306","#1 in nation — USDA FNS Data",D.red],
            ["Improper Payment Rate","11.7%","USDA FY2023 ($10.5B nationally)",D.orange],
            ["Workload Reduction","40%","Via RPA + process automation",D.green],
          ].map(([label,val,sub,color])=>(
            <div key={label} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:4, padding:"12px 16px" }}>
              <div style={{ fontSize:10, color:D.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{label}</div>
              <div style={{ fontSize:20, fontWeight:700, color, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{val}</div>
              <div style={{ fontSize:11, color:D.textMute, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16 }}>
        {/* Monthly case volume bar chart */}
        <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
          <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:14 }}>Monthly Fraud Cases — Jun 2023 to May 2024 (USDA FNS / NYC DOI)</div>
          <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:140 }}>
            {MONTHLY_FRAUD_DATA.map((m,i)=>{
              const h = Math.round((m.cases/maxCases)*120);
              const c = m.cases > 3000 ? D.red : m.cases > 2000 ? D.orange : m.cases > 1200 ? D.yellow : D.teal;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <div style={{ width:"100%", height:h, background:c, borderRadius:"2px 2px 0 0", minHeight:4 }} title={`${m.month}: ${m.cases.toLocaleString()} cases`}/>
                  <div style={{ fontSize:7.5, color:D.textMute, textAlign:"center", transform:"rotate(-45deg)", transformOrigin:"top left", marginLeft:8, whiteSpace:"nowrap" }}>{m.month}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:14, marginTop:20, flexWrap:"wrap" }}>
            {[[D.red,"3K+",">3,000 cases"],[D.orange,"2–3K","2,000–3,000"],[D.yellow,"1.2–2K","1,200–2,000"],[D.teal,"<1.2K","Under 1,200"]].map(([c,l,t])=>(
              <div key={l} style={{ display:"flex", gap:5, alignItems:"center" }}>
                <div style={{ width:10, height:10, background:c, borderRadius:2 }}/><span style={{ fontSize:10, color:D.textMute }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Borough breakdown */}
        <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
          <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:14 }}>Fraud by Borough — Q1 2024</div>
          {BOROUGH_DATA.map(b=>{
            const maxC = Math.max(...BOROUGH_DATA.map(x=>x.cases));
            const pct = Math.round(b.cases/maxC*100);
            const bc = b.riskLevel==="CRITICAL"?D.red:b.riskLevel==="HIGH"?D.orange:D.yellow;
            return (
              <div key={b.borough} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:D.text, fontWeight:600 }}>{b.borough}</span>
                  <div style={{ display:"flex", gap:8 }}>
                    <span style={{ fontSize:11, color:bc, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{b.cases.toLocaleString()}</span>
                    <Tag label={b.riskLevel} color={bc}/>
                  </div>
                </div>
                <div style={{ background:D.border, borderRadius:2, height:7 }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:bc, borderRadius:2 }}/>
                </div>
                <div style={{ fontSize:10, color:D.textMute, marginTop:2 }}>EJ Score: {b.ejScore}/100 · Median Income: ${b.medianIncome.toLocaleString()} · SNAP HH: {fmtNum(b.snapHouseholds)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fraud type breakdown */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:14 }}>Fraud Type Composition — May 2024 (Trailing Month)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
          {[
            ["EBT Skimming / Card Cloning",2720,"69.0%","Primary vector — POS overlay devices. NYC: #1 nationally Q1 2024.",D.red],
            ["Retailer Trafficking",630,"16.0%","'Even-dollar' and out-of-hours transaction patterns. USDA OIG referrals.",D.orange],
            ["Synthetic Identity / Dual Participation",402,"10.2%","Social graph clusters. Cross-state NAC flags.",D.purple],
            ["Other (Phishing, Internal, Ghost)",188,"4.8%","Smishing campaigns, caseworker anomalies, DMF sync gaps.",D.yellow],
          ].map(([label,count,pct,desc,color])=>(
            <div key={label} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:4, padding:"12px 16px" }}>
              <div style={{ fontSize:20, fontWeight:700, color, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:2 }}>{count.toLocaleString()}</div>
              <div style={{ fontSize:12, fontWeight:700, color:D.text, marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:10, color:D.textMute, lineHeight:1.5 }}>{desc}</div>
              <div style={{ marginTop:8, background:D.border, borderRadius:2, height:4 }}>
                <div style={{ width:pct, height:"100%", background:color, borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color, marginTop:3, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{pct}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: CASE TRIAGE ──────────────────────────────────────────────────────
function Tab2Cases() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [subpoenaDraft, setSubpoenaDraft] = useState(null);
  const [subpoenaGenerated, setSubpoenaGenerated] = useState(false);

  const types = ["ALL","EBT Skimming","Retailer Trafficking","Dual Participation","Synthetic Identity","Device Fingerprint / Account Takeover","Ghost Beneficiary","Caseworker Misconduct","Phishing / Credential Theft"];
  const filtered = FRAUD_CASES.filter(c => filter === "ALL" || c.caseType === filter);
  const caseDetail = selected ? FRAUD_CASES.find(c=>c.id===selected) : null;

  const generateSubpoena = (c) => {
    setSubpoenaDraft(c);
    setSubpoenaGenerated(false);
    setTimeout(()=>setSubpoenaGenerated(true), 1500);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Filters */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>FILTER:</span>
        {types.slice(0,6).map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{ padding:"4px 10px", borderRadius:3, border:`1px solid ${filter===t?D.accent:D.border}`, background:filter===t?D.bluePale:D.bgCard, color:filter===t?D.accent:D.textMute, fontSize:11, cursor:"pointer", fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{t}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns: caseDetail ? "1fr 1.3fr" : "1fr", gap:14, alignItems:"start" }}>
        {/* Case list */}
        <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, overflow:"hidden" }}>
          <div style={{ borderBottom:`1px solid ${D.border}`, padding:"10px 16px", background:D.bgCard }}>
            <span style={{ fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:"uppercase", letterSpacing:1 }}>Case Queue — {filtered.length} records</span>
          </div>
          <div style={{ overflowY:"auto", maxHeight:520 }}>
            {filtered.map((c,i)=>{
              const isSel = selected===c.id;
              return (
                <div key={c.id} onClick={()=>setSelected(isSel?null:c.id)}
                  style={{ padding:"12px 16px", borderBottom:`1px solid ${D.border}`, cursor:"pointer", background:isSel?D.bgHover:"transparent", transition:"background 0.1s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, flexWrap:"wrap", gap:6 }}>
                    <div>
                      <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:12, color:D.accent, marginBottom:2 }}>{c.id}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:D.text }}>{c.caseType}</div>
                    </div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      <Tag label={c.status} color={statusColor(c.status)} bg={statusBg(c.status)}/>
                      <Tag label={`NIST ${c.nistControl}`} color={D.teal}/>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    <RiskBar score={c.riskScore}/>
                    <span style={{ fontSize:11, color:D.textMute }}>{c.borough}</span>
                    <span style={{ fontSize:11, color:D.orange, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{fmtDollar(c.amount)}</span>
                    <span style={{ fontSize:11, color:D.textMute }}>{c.detectedDate}</span>
                    {c.travelFlag && <Tag label="IMPOSSIBLE TRAVEL" color={D.red}/>}
                    {c.evenDollar && <Tag label="EVEN-DOLLAR FLAG" color={D.orange}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Case detail */}
        {caseDetail && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"18px 22px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:11, color:D.textMute, marginBottom:4 }}>CASE FILE · {caseDetail.id}</div>
                <h3 style={{ margin:0, fontSize:16, color:D.text }}>{caseDetail.caseType}</h3>
                <div style={{ fontSize:12, color:D.textMute, marginTop:3 }}>{caseDetail.borough} ZIP {caseDetail.zip} · Detected {caseDetail.detectedDate}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:"none", border:`1px solid ${D.border}`, borderRadius:3, padding:"4px 10px", cursor:"pointer", fontSize:11, color:D.textMute }}>✕ Close</button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
              {[["Risk Score",(caseDetail.riskScore*100).toFixed(0)+"%",riskColor(caseDetail.riskScore)],["Estimated Loss",fmtDollar(caseDetail.amount),D.orange],["Victims",caseDetail.victims,D.red],["NIST Control",caseDetail.nistControl,D.teal],["Investigator",caseDetail.investigator,D.textMid],["Caseworker",caseDetail.caseworker,D.textMid]].map(([k,v,c])=>(
                <div key={k} style={{ background:D.bgCard, borderRadius:3, padding:"8px 12px" }}>
                  <div style={{ fontSize:10, color:D.textMute, textTransform:"uppercase", letterSpacing:0.5, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:14 }}>
              <RiskBar score={caseDetail.riskScore}/>
              <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                <Tag label={caseDetail.status} color={statusColor(caseDetail.status)} bg={statusBg(caseDetail.status)}/>
                <Tag label={`NIST ${caseDetail.nistControl}`} color={D.teal}/>
                {caseDetail.travelFlag && <Tag label="⚑ IMPOSSIBLE TRAVEL" color={D.red}/>}
                {caseDetail.evenDollar && <Tag label="⚑ EVEN-DOLLAR PATTERN" color={D.orange}/>}
              </div>
            </div>

            <div style={{ background:D.bgCard, borderRadius:3, padding:"12px 16px", marginBottom:14, fontSize:13, color:D.textMid, lineHeight:1.7, borderLeft:`3px solid ${riskColor(caseDetail.riskScore)}` }}>
              {caseDetail.description}
            </div>

            <div style={{ background:D.bgCard, borderRadius:3, padding:"10px 14px", marginBottom:14 }}>
              <div style={{ fontSize:10, color:D.textMute, textTransform:"uppercase", letterSpacing:0.5, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>Detection Method</div>
              <div style={{ fontSize:13, color:D.accent }}>{caseDetail.method}</div>
            </div>

            <div style={{ background:D.bgCard, borderRadius:3, padding:"10px 14px", marginBottom:16 }}>
              <div style={{ fontSize:10, color:D.textMute, textTransform:"uppercase", letterSpacing:0.5, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>Disposition</div>
              <div style={{ fontSize:13, color:D.text }}>{caseDetail.disposition}</div>
            </div>

            {/* Subpoena drafter */}
            {caseDetail.riskScore >= 0.89 && (
              <div style={{ border:`1px solid ${D.orange}`, borderRadius:4, padding:"14px 18px", background:D.orangePale, marginBottom:14 }}>
                <div style={{ fontSize:11, color:D.orange, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:8 }}>⚑ AUTO-SUBPOENA THRESHOLD MET (Risk ≥ 0.89)</div>
                <div style={{ fontSize:12, color:"#e0c080", marginBottom:10 }}>This case qualifies for automated legal packet generation under HRA Integrity Protocol §7.4. The packet includes all transaction logs, geo-tags, ISO 8583 records, and NIST audit chain.</div>
                <button onClick={()=>generateSubpoena(caseDetail)}
                  style={{ background:D.orange, color:"#1a1000", border:"none", borderRadius:3, padding:"9px 18px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>
                  GENERATE LEGAL PACKET → DA
                </button>
                {subpoenaDraft?._id===caseDetail.id || subpoenaDraft?.id===caseDetail.id ? (
                  <div style={{ marginTop:10, fontSize:12, color:subpoenaGenerated?D.green:D.yellow, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>
                    {subpoenaGenerated ? `✓ SP-${caseDetail.id.slice(-4)} generated — routed to ADA queue. NIST AU-6 event logged.` : "⟳ Compiling transaction logs + geo-tags + audit chain..."}
                  </div>
                ) : null}
              </div>
            )}

            {/* Raw packet preview */}
            <details>
              <summary style={{ fontSize:11, color:D.textMute, cursor:"pointer", userSelect:"none", fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>View ISO 8583 Packet Sample ▾</summary>
              <pre style={{ fontSize:10, background:D.bgDark, borderRadius:3, padding:"10px 14px", marginTop:8, color:"#68d068", overflowX:"auto", lineHeight:1.7, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{`MTI: 0200 (Authorization Request)
Field 2  (PAN):           ****-****-****-7823 [MASKED]
Field 3  (Proc Code):     00 20 00 (Purchase)
Field 4  (Tx Amount):     $200.00 ← EVEN-DOLLAR FLAG
Field 7  (Tx DateTime):   ${caseDetail.detectedDate} 23:14:07 ← OUT-OF-HOURS FLAG
Field 11 (STAN):          847291
Field 12 (Local Time):    231407
Field 22 (POS Entry):     02 (Magnetic Stripe) ← NO EMV CHIP
Field 37 (Ref Number):    TXN-${caseDetail.id.slice(-5)}
Field 41 (Terminal ID):   POS-${caseDetail.zip}-009
Field 43 (Retailer):      ${caseDetail.retailer || "N/A"}
Field 49 (Currency):      840 (USD)
Field 63 (FNS Number):    0${caseDetail.zip}22 [USDA-ASSIGNED]
INTEGRITY FLAG: MAGNETIC_STRIPE_ONLY | NO_CHIP_FALLBACK_POLICY_VIOLATION`}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 3: NIST-800-53 COMPLIANCE ───────────────────────────────────────────
function Tab3Compliance() {
  const [selected, setSelected] = useState(null);
  const compliant = NIST_CONTROLS.filter(c=>c.status==="COMPLIANT").length;
  const findings = NIST_CONTROLS.filter(c=>c.status==="FINDING").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Compliance summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
        <MetricCard label="Controls Mapped" value={NIST_CONTROLS.length} color={D.accent} sub="NIST-800-53 Rev 5"/>
        <MetricCard label="Compliant" value={compliant} color={D.green} sub={`${Math.round(compliant/NIST_CONTROLS.length*100)}% compliance rate`}/>
        <MetricCard label="Findings / Remediation" value={findings} color={D.orange} sub="Active remediation plans"/>
        <MetricCard label="High Risk Controls" value={NIST_CONTROLS.filter(c=>c.risk==="HIGH").length} color={D.red} sub="Requires immediate action"/>
        <MetricCard label="Last Full Audit" value="2025-05-13" color={D.textMid} sub="Automated daily review"/>
        <MetricCard label="MTTD (Mean)" value="4.2 hrs" color={D.teal} sub="OMB M-22-09 compliant"/>
      </div>

      {/* Compliance heatmap */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:14 }}>NIST-800-53 Control Compliance Matrix</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:8 }}>
          {NIST_CONTROLS.map(ctrl=>{
            const isSel = selected===ctrl.id;
            const borderColor = ctrl.status==="COMPLIANT" ? D.green : ctrl.risk==="HIGH" ? D.red : D.orange;
            return (
              <div key={ctrl.id} onClick={()=>setSelected(isSel?null:ctrl.id)}
                style={{ background:isSel?D.bgHover:D.bgCard, border:`1px solid ${isSel?borderColor:D.border}`, borderRadius:4, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s", borderLeft:`3px solid ${borderColor}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:12, color:D.accent, fontWeight:700 }}>{ctrl.id}</span>
                  <div style={{ display:"flex", gap:5 }}>
                    <Tag label={ctrl.status} color={ctrl.status==="COMPLIANT"?D.green:D.orange}/>
                    <Tag label={ctrl.risk} color={ctrl.risk==="HIGH"?D.red:ctrl.risk==="MEDIUM"?D.orange:D.green}/>
                  </div>
                </div>
                <div style={{ fontSize:12, color:D.text, fontWeight:600, marginBottom:4 }}>{ctrl.name}</div>
                {isSel && (
                  <div style={{ marginTop:8, fontSize:12, color:D.textMid, lineHeight:1.6, borderTop:`1px solid ${D.border}`, paddingTop:8 }}>
                    <div style={{ marginBottom:4 }}><span style={{ color:D.textMute }}>Last Audit:</span> {ctrl.lastAudit}</div>
                    <div>{ctrl.finding}</div>
                  </div>
                )}
                {!isSel && <div style={{ fontSize:11, color:D.textMute }}>Click to expand finding ▾</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active findings detail */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:14 }}>Active Findings — Remediation Required</div>
        {NIST_CONTROLS.filter(c=>c.status==="FINDING").map(ctrl=>(
          <div key={ctrl.id} style={{ background:D.bgCard, border:`1px solid ${ctrl.risk==="HIGH"?D.red:D.orange}`, borderRadius:4, padding:"14px 18px", marginBottom:10, borderLeft:`4px solid ${ctrl.risk==="HIGH"?D.red:D.orange}` }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
              <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:12, color:D.accent, fontWeight:700 }}>{ctrl.id}</span>
              <span style={{ fontSize:13, color:D.text, fontWeight:700 }}>{ctrl.name}</span>
              <Tag label={`RISK: ${ctrl.risk}`} color={ctrl.risk==="HIGH"?D.red:D.orange}/>
              <span style={{ fontSize:11, color:D.textMute, marginLeft:"auto" }}>Last Audit: {ctrl.lastAudit}</span>
            </div>
            <p style={{ margin:0, fontSize:13, color:D.textMid, lineHeight:1.6 }}>{ctrl.finding}</p>
          </div>
        ))}
      </div>

      {/* Regulatory references */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:12 }}>Applicable Regulatory Framework</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:10 }}>
          {[
            ["NIST SP 800-53 Rev 5","Federal security and privacy controls baseline for all federal/state-funded social service systems. Mandated for HRA WMS under FedRAMP."],
            ["7 CFR Part 273 (SNAP Program)","USDA Food and Nutrition Service regulations for SNAP eligibility, benefit issuance, and fraud investigation. Governs retailer authorization and disqualification."],
            ["OMB M-22-09 (Zero Trust)","Federal zero-trust architecture strategy. HRA implements identity verification for all ACCESS HRA sessions. MTTD/MTTR targets set here."],
            ["18 U.S.C. § 1030 (CFAA)","Computer Fraud and Abuse Act — applicable to unauthorized EBT account access via credential stuffing and skimming. Basis for federal prosecution referrals."],
            ["7 U.S.C. § 2021 (Retailer Sanctions)","SNAP statutory authority for retailer disqualification, CMP assessment, and criminal referral for trafficking violations."],
            ["NYC Admin Code § 20-387","Local law governing HRA data sharing with DOI for fraud investigation. Basis for cross-agency information requests."],
            ["23-ADM-07 (OTDA Directive)","NY State OTDA administrative directive governing SNAP/TA benefit replacement procedures for skimming and cloning victims."],
            ["44 U.S.C. § 3101","Federal records retention requirement — 3-year minimum for all audit logs and transaction records. HRA current retention: 5 years."],
          ].map(([title,desc])=>(
            <div key={title} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:3, padding:"12px 14px" }}>
              <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:11, color:D.teal, fontWeight:700, marginBottom:5 }}>{title}</div>
              <div style={{ fontSize:12, color:D.textMid, lineHeight:1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 4: RPA OPERATIONS ────────────────────────────────────────────────────
function Tab4RPA() {
  const [taskLog, setTaskLog] = useState([]);
  const [running, setRunning] = useState(null);

  const triggerBot = (task) => {
    setRunning(task.name);
    const steps = [
      `[${new Date().toTimeString().slice(0,8)}] UiPath Robot INIT — Task: ${task.name}`,
      `[${new Date().toTimeString().slice(0,8)}] Authenticating with WMS API endpoint (OAuth 2.0)...`,
      `[${new Date().toTimeString().slice(0,8)}] ✓ Auth success. Session token: sess_${Math.random().toString(36).slice(2,8)}`,
      `[${new Date().toTimeString().slice(0,8)}] Fetching transaction batch — ${(Math.random()*2000+800).toFixed(0)} records`,
      `[${new Date().toTimeString().slice(0,8)}] Running validation rules (${task.tool})...`,
      `[${new Date().toTimeString().slice(0,8)}] ✓ Validation complete — 0 errors`,
      `[${new Date().toTimeString().slice(0,8)}] Writing output to SSIS staging table`,
      `[${new Date().toTimeString().slice(0,8)}] NIST AU-3 audit event logged`,
      `[${new Date().toTimeString().slice(0,8)}] ✓ Task completed. Duration: ${task.avgDuration}. Manual touchpoints eliminated: ${task.reducedManualTouchpoints}`,
    ];
    setTaskLog([]);
    steps.forEach((step, i) => setTimeout(()=>{
      setTaskLog(l=>[...l, step]);
      if (i===steps.length-1) setRunning(null);
    }, i*600));
  };

  const totalEliminated = RPA_TASKS.reduce((s,t)=>s+t.reducedManualTouchpoints,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* RPA summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
        <MetricCard label="Active Bot Tasks" value={RPA_TASKS.filter(t=>t.status==="RUNNING").length} color={D.green} sub="Running now"/>
        <MetricCard label="Tasks Today" value={RPA_TASKS.reduce((s,t)=>s+t.runsToday,0)} color={D.teal} sub="Successful runs"/>
        <MetricCard label="Manual Touchpoints Eliminated" value={totalEliminated.toLocaleString()} color={D.accent} sub="Today (est.)"/>
        <MetricCard label="Avg. Task Success Rate" value={`${(RPA_TASKS.reduce((s,t)=>s+t.successRate,0)/RPA_TASKS.length).toFixed(1)}%`} color={D.green} sub="All bots"/>
        <MetricCard label="Workload Reduction" value="40%" color={D.green} sub="YoY — FY2024 vs. FY2023"/>
      </div>

      {/* Task grid */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:14 }}>RPA Bot Registry — UiPath, Power Automate, SSIS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {RPA_TASKS.map(task=>{
            const sc = task.status==="RUNNING"?D.green:task.status==="ALERT"?D.red:D.teal;
            const isThis = running===task.name;
            return (
              <div key={task.name} style={{ background:D.bgCard, border:`1px solid ${isThis?D.accent:D.border}`, borderRadius:4, padding:"12px 16px", display:"flex", gap:14, alignItems:"center", flexWrap:"wrap", transition:"border-color 0.2s" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:sc, flexShrink:0, boxShadow: task.status==="RUNNING" ? `0 0 6px ${sc}` : "none" }}/>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:D.text }}>{task.name}</div>
                  <div style={{ fontSize:11, color:D.textMute, marginTop:2 }}>{task.tool} · {task.avgDuration} avg · Success: {task.successRate}%</div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <Tag label={task.status} color={sc}/>
                  <span style={{ fontSize:11, color:D.textMute }}>Last: {task.lastRun}</span>
                  {task.reducedManualTouchpoints > 0 && <span style={{ fontSize:11, color:D.green }}>−{task.reducedManualTouchpoints} manual</span>}
                  <button onClick={()=>triggerBot(task)} disabled={!!running}
                    style={{ background:running?D.border:D.bluePale, color:running?D.textMute:D.accent, border:`1px solid ${running?D.border:D.blue}`, borderRadius:3, padding:"4px 12px", fontSize:11, cursor:running?"not-allowed":"pointer", fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>
                    {isThis ? "⟳ RUNNING..." : "▶ TRIGGER"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bot console */}
      {taskLog.length > 0 && (
        <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
          <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:10 }}>Bot Execution Console</div>
          <div style={{ background:D.bgDark, borderRadius:3, padding:"14px 16px", fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:12, lineHeight:1.8, maxHeight:240, overflowY:"auto" }}>
            {taskLog.map((line,i)=>(
              <div key={i} style={{ color:line.includes("✓")?"#5da87a":line.includes("ERROR")?"#e07070":"#8ab8d8" }}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Tools explainer */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"16px 20px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:12 }}>Tool Stack — HRA Data Infrastructure</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:10 }}>
          {[
            ["UiPath (RPA)", D.teal, "Robotic Process Automation — WMS–POS reconciliation, benefit issuance verification, DMF sync. Eliminated 40% of manual caseworker touchpoints FY2024."],
            ["Power Automate", D.blue, "Automated compliance reporting (NIST AU-6), alert routing, NAC lookup orchestration. Integrated with Microsoft 365/SharePoint for audit trail storage."],
            ["SQL / SSIS", D.accent, "ETL pipelines for WMS data integration. SSIS packages for daily DMF sync, transaction staging, and dbt transformation of benefit issuance data."],
            ["dbt (Data Build Tool)", D.purple, "SQL transformation layer for benefit transaction marts. Version-controlled data models for fraud analytics and Tableau reporting."],
            ["Tableau", D.orange, "Executive and operational dashboards. Borough-level fraud heatmaps, caseworker productivity, RPA throughput reporting."],
            ["ACCESS HRA (Cúram)", D.teal, "IBM Cúram-based integrated eligibility platform. Primary case management system for SNAP, Cash Assistance, Medicaid."],
            ["WMS (Welfare Mgmt System)", D.green, "NY State mainframe-based benefit management system. Authoritative record for all benefit issuances and case history."],
            ["POS (Paperless Office System)", D.yellow, "Digital document management for caseworker workflows. Integrated with WMS for paperless benefit verification. RPA sync target."],
          ].map(([name,color,desc])=>(
            <div key={name} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:3, padding:"12px 14px" }}>
              <div style={{ fontWeight:700, color, fontSize:13, marginBottom:5, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{name}</div>
              <div style={{ fontSize:12, color:D.textMid, lineHeight:1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 5: AUDIT LOG ────────────────────────────────────────────────────────
function Tab5AuditLog() {
  const [filterSev, setFilterSev] = useState("ALL");
  const [liveLog, setLiveLog] = useState(AUDIT_LOG);

  useEffect(() => {
    const syntheticEvents = [
      { user:"SYSTEM", action:"ISO8583_SCAN", detail:"Continuous packet analysis — {n} EBT transactions processed this window. 0 anomalies.", nist:"SI-7", severity:"INFO" },
      { user:"SYSTEM", action:"WMS_HEARTBEAT", detail:"WMS API heartbeat OK — response time 142ms.", nist:"AU-2", severity:"INFO" },
      { user:"SYSTEM", action:"NAC_PING", detail:"NAC lookup service responsive — NIST AC-2 check.", nist:"AC-2", severity:"INFO" },
      { user:"analyst.barros", action:"CASE_SEARCH", detail:"Searched fraud cases — filter: ZIP 10462 — 2 results.", nist:"AU-3", severity:"INFO" },
    ];
    const id = setInterval(() => {
      const ev = syntheticEvents[Math.floor(Math.random()*syntheticEvents.length)];
      setLiveLog(l => [{ ...ev, ts:new Date().toISOString().replace("T"," ").slice(0,19), detail:ev.detail.replace("{n}",(Math.floor(Math.random()*50+10)).toString()) }, ...l.slice(0, 49)]);
    }, 4000);
    return ()=>clearInterval(id);
  }, []);

  const filtered = filterSev==="ALL" ? liveLog : liveLog.filter(e=>e.severity===filterSev);
  const sevs = ["ALL","CRITICAL","HIGH","MEDIUM","INFO"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>SEVERITY:</span>
        {sevs.map(s=>(
          <button key={s} onClick={()=>setFilterSev(s)} style={{ padding:"4px 10px", borderRadius:3, border:`1px solid ${filterSev===s?D.accent:D.border}`, background:filterSev===s?D.bluePale:D.bgCard, color:filterSev===s?D.accent:D.textMute, fontSize:11, cursor:"pointer", fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{s}</button>
        ))}
        <span style={{ fontSize:11, color:D.green, marginLeft:8, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>● LIVE — updating every 4s</span>
      </div>

      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, overflow:"hidden" }}>
        <div style={{ padding:"10px 16px", background:D.bgCard, borderBottom:`1px solid ${D.border}` }}>
          <span style={{ fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:"uppercase", letterSpacing:1 }}>KERNEL AUDIT LOG — {filtered.length} events · NIST 800-53 AU-2/AU-3 Compliant · Retention: 5 years</span>
        </div>
        <div style={{ maxHeight:540, overflowY:"auto" }}>
          {filtered.map((event,i)=>{
            const sc = event.severity==="CRITICAL"?D.red:event.severity==="HIGH"?D.orange:event.severity==="MEDIUM"?D.yellow:D.teal;
            return (
              <div key={i} style={{ padding:"10px 16px", borderBottom:`1px solid ${D.border}`, display:"flex", gap:12, alignItems:"flex-start", background:i===0&&event.severity!=="INFO"?event.severity==="HIGH"||event.severity==="CRITICAL"?D.redPale+"44":"transparent":"transparent" }}>
                <SeverityDot s={event.severity}/>
                <span style={{ fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", minWidth:140, flexShrink:0 }}>{event.ts}</span>
                <span style={{ fontSize:11, color:D.accent, fontFamily:"'IBM Plex Mono','Courier New',monospace", minWidth:80, flexShrink:0 }}>{event.user}</span>
                <span style={{ fontSize:11, color:sc, fontFamily:"'IBM Plex Mono','Courier New',monospace", minWidth:160, flexShrink:0, fontWeight:event.severity==="CRITICAL"||event.severity==="HIGH"?700:400 }}>{event.action}</span>
                <span style={{ fontSize:12, color:D.textMid, flex:1, lineHeight:1.5 }}>{event.detail}</span>
                <Tag label={event.nist} color={D.teal}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log integrity */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:"14px 18px" }}>
        <div style={{ fontSize:11, color:D.textMute, textTransform:"uppercase", letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:10 }}>Log Integrity Controls</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:10 }}>
          {[
            ["Log Chain Hash","SHA-256 Merkle chain. Tamper-evident. Verified each write cycle. NIST AU-9.","#68d068"],
            ["Retention Policy","5 years (exceeds 44 U.S.C. § 3101 minimum of 3 years). Stored in WORM-equivalent Azure Blob.","#8ab8d8"],
            ["Access Control","Read: HRA Integrity, DOI, OIG. Write: SYSTEM only. No caseworker write access to audit records.","#8ab8d8"],
            ["Export / SIEM","Logs forwarded to NYC DOITT SIEM (Splunk) via syslog. Real-time correlation with threat intel feeds.","#8ab8d8"],
          ].map(([title,desc,color])=>(
            <div key={title} style={{ background:D.bgCard, borderRadius:3, padding:"10px 14px" }}>
              <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:11, color, fontWeight:700, marginBottom:4 }}>{title}</div>
              <div style={{ fontSize:12, color:D.textMid, lineHeight:1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 6: LIVE TRIAGE STREAM ───────────────────────────────────────────────
function Tab6LiveTriage({ isLive }) {
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const allData = useMemo(() => GENERATE_TRIAGE_DATA(60), []);
  const [streamData, setStreamData] = useState(allData);

  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      setLiveCount(c => c + 1);
      const newCase = GENERATE_TRIAGE_DATA(1)[0];
      newCase.id = `HRA-LIVE-${Date.now().toString().slice(-6)}`;
      newCase.timestamp = new Date().toISOString().replace('T',' ').slice(0,19);
      setStreamData(d => [newCase, ...d.slice(0, 79)]);
    }, 3000);
    return () => clearInterval(id);
  }, [isLive]);

  const filtered = streamData.filter(c => {
    const matchSev = sevFilter === 'ALL' || c.severity === sevFilter;
    const matchSearch = !search || c.id.includes(search.toUpperCase()) || c.caseType.toLowerCase().includes(search.toLowerCase()) || c.borough.toLowerCase().includes(search.toLowerCase()) || c.rule.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  const selCase = selected ? streamData.find(c => c.id === selected) : null;

  const sevColor = s => s === 'CRITICAL' ? D.red : s === 'HIGH' ? D.orange : s === 'MEDIUM' ? D.yellow : D.green;
  const statusColor = s => s === 'Active' ? D.orange : s === 'Flagged' ? D.red : s === 'Neutralized' ? D.green : s === 'Escalated' ? D.purple : D.teal;
  const riskColor = r => r >= 0.85 ? D.red : r >= 0.70 ? D.orange : r >= 0.50 ? D.yellow : D.green;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Header strip */}
      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:4, padding:'6px 12px', flex:1, minWidth:200 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search case ID, type, borough, rule..."
            style={{ background:'none', border:'none', outline:'none', color:D.text, fontSize:12, width:'100%', fontFamily:"'IBM Plex Mono','Courier New',monospace" }}
          />
        </div>
        <span style={{ fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>SEV:</span>
        {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(s => (
          <button key={s} onClick={() => setSevFilter(s)}
            style={{ padding:'4px 10px', borderRadius:3, border:`1px solid ${sevFilter===s ? sevColor(s) : D.border}`, background:sevFilter===s ? sevColor(s)+'22' : D.bgCard, color:sevFilter===s ? sevColor(s) : D.textMute, fontSize:11, cursor:'pointer', fontFamily:"'IBM Plex Mono','Courier New',monospace" }}
          >{s}</button>
        ))}
        {isLive && (
          <span style={{ fontSize:11, color:D.green, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>
            ● LIVE — {liveCount} injected
          </span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:8 }}>
        {[
          ['Total Cases', streamData.length, D.accent],
          ['Critical', streamData.filter(c=>c.severity==='CRITICAL').length, D.red],
          ['High', streamData.filter(c=>c.severity==='HIGH').length, D.orange],
          ['Flagged', streamData.filter(c=>c.status==='Flagged').length, D.yellow],
          ['Neutralized', streamData.filter(c=>c.status==='Neutralized').length, D.green],
          ['Savings Pot.', '$'+streamData.reduce((s,c)=>s+parseFloat(c.savingsPotential),0).toLocaleString(undefined,{maximumFractionDigits:0}), D.teal],
        ].map(([lbl,val,col]) => (
          <div key={lbl} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:4, padding:'10px 14px' }}>
            <div style={{ fontSize:10, color:D.textMute, textTransform:'uppercase', letterSpacing:0.5, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:3 }}>{lbl}</div>
            <div style={{ fontSize:18, fontWeight:700, color:col, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, overflow:'hidden' }}>
        <div style={{ padding:'10px 16px', background:D.bgCard, borderBottom:`1px solid ${D.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', letterSpacing:1 }}>Triage Stream — {filtered.length} records</span>
          <span style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>Click row for packet detail</span>
        </div>
        <div style={{ overflowY:'auto', maxHeight:420 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ background:D.bg, position:'sticky', top:0, zIndex:1 }}>
                {['Case ID','Type','Borough','Risk','Severity','Status','Agent','Savings','Timestamp'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:D.textMute, borderBottom:`1px solid ${D.border}`, whiteSpace:'nowrap', fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', letterSpacing:0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const isSel = selected === c.id;
                return (
                  <tr key={c.id} onClick={() => setSelected(isSel ? null : c.id)}
                    style={{ background: isSel ? D.bgHover : i % 2 === 0 ? 'transparent' : D.bg+'88', borderBottom:`1px solid ${D.border}44`, cursor:'pointer', transition:'background 0.1s' }}>
                    <td style={{ padding:'7px 12px', fontFamily:"'IBM Plex Mono','Courier New',monospace", color:D.accent, fontSize:11 }}>{c.id}</td>
                    <td style={{ padding:'7px 12px', color:D.text, fontSize:11 }}>{c.caseType}</td>
                    <td style={{ padding:'7px 12px', color:D.textMid, fontSize:11 }}>{c.borough}</td>
                    <td style={{ padding:'7px 12px', minWidth:100 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:50, background:D.border, borderRadius:2, height:5 }}>
                          <div style={{ width:`${c.riskScore*100}%`, height:'100%', background:riskColor(c.riskScore), borderRadius:2 }}/>
                        </div>
                        <span style={{ fontSize:10, color:riskColor(c.riskScore), fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{(c.riskScore*100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ padding:'7px 12px' }}>
                      <span style={{ background:sevColor(c.severity)+'22', color:sevColor(c.severity), padding:'2px 7px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${sevColor(c.severity)}44` }}>{c.severity}</span>
                    </td>
                    <td style={{ padding:'7px 12px' }}>
                      <span style={{ background:statusColor(c.status)+'22', color:statusColor(c.status), padding:'2px 7px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${statusColor(c.status)}44` }}>{c.status}</span>
                    </td>
                    <td style={{ padding:'7px 12px', color:D.textMid, fontSize:11, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{c.agent}</td>
                    <td style={{ padding:'7px 12px', color:D.teal, fontSize:11, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>${parseFloat(c.savingsPotential).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                    <td style={{ padding:'7px 12px', color:D.textMute, fontSize:10, fontFamily:"'IBM Plex Mono','Courier New',monospace", whiteSpace:'nowrap' }}>{c.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Packet detail panel */}
      {selCase && (
        <div style={{ background:D.bgPanel, border:`1px solid ${D.accent}44`, borderRadius:4, padding:'18px 22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <div>
              <div style={{ fontSize:10, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:4 }}>PACKET INSPECTOR — {selCase.id}</div>
              <div style={{ fontSize:15, fontWeight:700, color:D.text }}>{selCase.caseType}</div>
              <div style={{ fontSize:12, color:D.textMute, marginTop:2 }}>{selCase.borough} · {selCase.timestamp} · Agent: {selCase.agent}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background:'none', border:`1px solid ${D.border}`, borderRadius:3, padding:'4px 10px', cursor:'pointer', fontSize:11, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>✕ CLOSE</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:10, marginBottom:14 }}>
            {[['Rule Triggered', selCase.rule, D.orange], ['NIST Control', selCase.payload.nist_control, D.teal], ['Risk Score', (selCase.riskScore*100).toFixed(0)+'%', riskColor(selCase.riskScore)], ['Savings Potential', '$'+parseFloat(selCase.savingsPotential).toLocaleString(), D.green], ['Linked Cases', selCase.payload.linked_cases, D.accent], ['Geo Tag', selCase.payload.geo_tag, D.textMid]].map(([k,v,c]) => (
              <div key={k} style={{ background:D.bgCard, borderRadius:3, padding:'8px 12px' }}>
                <div style={{ fontSize:10, color:D.textMute, textTransform:'uppercase', letterSpacing:0.5, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:12, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
              </div>
            ))}
          </div>
          <details>
            <summary style={{ fontSize:11, color:D.textMute, cursor:'pointer', userSelect:'none', fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>View Raw ISO 8583 Trace ▾</summary>
            <pre style={{ fontSize:10, background:D.bgDark, borderRadius:3, padding:'10px 14px', marginTop:8, color:'#68d068', overflowX:'auto', lineHeight:1.7, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{`TRACE ROUTE: ${selCase.payload.trace_route}
RAW HEX DUMP: ${selCase.payload.raw_hex}
RULE ENGINE: ${selCase.rule.toUpperCase()}
GEO-TAG: ${selCase.payload.geo_tag}
LINKED CASES: ${selCase.payload.linked_cases} associated records
NIST CONTROL: ${selCase.payload.nist_control}
SEVERITY: ${selCase.severity} | STATUS: ${selCase.status}
AGENT ASSIGNED: ${selCase.agent}
KERNEL LOG ENTRY: Event ID ${Date.now()} · AU-3 compliant · SHA-256 hash: ${Math.random().toString(36).slice(2,18).toUpperCase()}`}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

// ─── TAB 7: ADVANCED INTEL MODULES ───────────────────────────────────────────
function Tab7AdvancedModules() {
  const [activeModule, setActiveModule] = useState('sig');
  const [sigNodes] = useState(() => {
    const names = ['ID-4421','ID-7832','ID-1193','ID-5501','ID-3394','ID-8812','ID-2277','ID-6609'];
    return names.map((id, i) => ({ id, x: 80 + Math.cos(i/8*2*Math.PI)*160, y: 140 + Math.sin(i/8*2*Math.PI)*100, linked: [names[(i+1)%8], names[(i+3)%8]] }));
  });
  const [subpoenaStatus, setSubpoenaStatus] = useState(null);
  const [generatingSubpoena, setGeneratingSubpoena] = useState(false);

  const generateSubpoena = (caseId) => {
    setGeneratingSubpoena(true);
    setSubpoenaStatus('generating');
    setTimeout(() => { setSubpoenaStatus('complete'); setGeneratingSubpoena(false); }, 2000);
  };

  const modules = [
    { id:'sig', label:'Synthetic Identity Graph', tag:'SIG', color:D.purple },
    { id:'retailer', label:'Retailer Collusion Engine', tag:'RCE', color:D.orange },
    { id:'dmf', label:'Death Master Live-Sync', tag:'DMF', color:D.red },
    { id:'device', label:'Device Fingerprint + Velocity', tag:'DFV', color:D.teal },
    { id:'recidivism', label:'Predictive Recidivism Scoring', tag:'PRS', color:D.blue },
    { id:'subpoena', label:'Automated Subpoena Drafter', tag:'ASD', color:D.yellow },
    { id:'darkweb', label:'Dark Web PII Sentinel', tag:'DWS', color:D.red },
    { id:'nlp', label:'NLP Caseworker Sentinel', tag:'NCS', color:D.accent },
    { id:'crossstate', label:'Cross-State Benefit Intercept', tag:'CSI', color:D.green },
    { id:'fairhearing', label:'Fair Hearing Prep-Bot', tag:'FHB', color:D.teal },
  ];

  return (
    <div style={{ display:'flex', gap:14 }}>
      {/* Sidebar */}
      <div style={{ width:200, flexShrink:0, display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ fontSize:10, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6, padding:'4px 0' }}>DECADE MODULES</div>
        {modules.map(m => (
          <button key={m.id} onClick={() => setActiveModule(m.id)}
            style={{ textAlign:'left', padding:'8px 12px', borderRadius:3, border:`1px solid ${activeModule===m.id ? m.color+'66' : D.border}`, background: activeModule===m.id ? m.color+'18' : D.bgCard, cursor:'pointer', transition:'all 0.15s' }}>
            <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:10, fontWeight:700, color:m.color, marginRight:6 }}>[{m.tag}]</span>
            <span style={{ fontSize:11, color: activeModule===m.id ? D.text : D.textMid }}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Content pane */}
      <div style={{ flex:1, minWidth:0 }}>
        {activeModule === 'sig' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>SYNTHETIC IDENTITY GRAPH (SIG) — NIST IA-8</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              Relational database feature that maps shared phone numbers, IPs, and burner email patterns across seemingly unrelated benefit applications to detect "identity factories." Social graph visualization shows clusters of linked case IDs sharing PII vectors.
            </div>
            <svg viewBox="0 0 400 280" style={{ width:'100%', maxWidth:480, height:'auto', background:D.bgDark, borderRadius:4, border:`1px solid ${D.border}` }}>
              <defs>
                <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={D.purple} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={D.purple} stopOpacity="0.2"/>
                </radialGradient>
              </defs>
              {sigNodes.map(n => n.linked.map(lt => {
                const target = sigNodes.find(x => x.id === lt);
                if (!target) return null;
                return <line key={n.id+lt} x1={n.x} y1={n.y} x2={target.x} y2={target.y} stroke={D.purple} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="4 3"/>;
              }))}
              <circle cx="200" cy="140" r="18" fill={D.red} fillOpacity="0.3" stroke={D.red} strokeWidth="2"/>
              <text x="200" y="144" textAnchor="middle" fill={D.red} fontSize="9" fontFamily="'IBM Plex Mono','Courier New',monospace" fontWeight="700">HUB-0099</text>
              {sigNodes.map((n, i) => (
                <g key={n.id}>
                  <line x1={n.x} y1={n.y} x2="200" y2="140" stroke={D.accent} strokeOpacity="0.2" strokeWidth="1"/>
                  <circle cx={n.x} cy={n.y} r="14" fill="url(#nodeGrad)" stroke={D.purple} strokeWidth="1.5"/>
                  <text x={n.x} y={n.y+4} textAnchor="middle" fill={D.text} fontSize="8" fontFamily="'IBM Plex Mono','Courier New',monospace">{n.id}</text>
                </g>
              ))}
            </svg>
            <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:8 }}>
              {[['Identity Clusters Detected','14',D.red],['Shared Phone Numbers','7',D.orange],['Shared IPs','11',D.yellow],['Burner Email Patterns','23',D.purple]].map(([l,v,c]) => (
                <div key={l} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:3, padding:'10px 14px' }}>
                  <div style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:20, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeModule === 'retailer' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>RETAILER COLLUSION ENGINE — NIST AU-6</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              Monitors EBT transaction times and amounts at specific NYC retailers. Flags "even-dollar" spikes (exactly $200.00, $400.00) or transactions during non-business hours (11 PM–4 AM) suggesting benefit trafficking.
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:D.bgCard }}>
                  {['Retailer','Borough','Even-$ %','Off-Hours %','Risk','Status'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:D.textMute, borderBottom:`1px solid ${D.border}`, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Best Value Grocery Inc.','Brooklyn','94%','67%','CRITICAL','Disqualified'],
                  ['Discount Food Center LLC','Bronx','81%','55%','HIGH','Under Review'],
                  ['C-Town Supermarket #114','Bronx','72%','48%','HIGH','Investigation'],
                  ['Key Food #88 (E. Tremont)','Bronx','61%','38%','MEDIUM','Monitoring'],
                  ['Associated Supermarket #47','Queens','44%','22%','MEDIUM','Flagged'],
                  ['Empire Deli & Grocery','Manhattan','31%','18%','LOW','Active'],
                ].map(([name, boro, even, offhrs, risk, status], i) => {
                  const rc = risk === 'CRITICAL' ? D.red : risk === 'HIGH' ? D.orange : risk === 'MEDIUM' ? D.yellow : D.green;
                  return (
                    <tr key={name} style={{ background: i%2===0 ? 'transparent' : D.bg+'66', borderBottom:`1px solid ${D.border}44` }}>
                      <td style={{ padding:'9px 12px', color:D.text, fontWeight:600 }}>{name}</td>
                      <td style={{ padding:'9px 12px', color:D.textMid }}>{boro}</td>
                      <td style={{ padding:'9px 12px', color:D.red, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{even}</td>
                      <td style={{ padding:'9px 12px', color:D.orange, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{offhrs}</td>
                      <td style={{ padding:'9px 12px' }}><span style={{ background:rc+'22', color:rc, padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${rc}44` }}>{risk}</span></td>
                      <td style={{ padding:'9px 12px', color:D.textMid, fontSize:11 }}>{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeModule === 'dmf' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>DEATH MASTER FILE LIVE-SYNC — NIST AU-2</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              High-speed API bridge to the Social Security Administration's Death Master File (DMF) to prevent "Ghost Beneficiary" payments within 24 hours of a reported death. Sync runs nightly at 00:01 EST via SSIS package.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:14 }}>
              {[['Records Checked Today','1,843,200',D.accent],['DMF Matches Found','3',D.red],['Benefits Frozen','3',D.red],['Sync Latency','< 2 min',D.green],['Last Run','00:01 EST',D.teal],['Uptime SLA','99.98%',D.green]].map(([l,v,c]) => (
                <div key={l} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:3, padding:'10px 14px' }}>
                  <div style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:8 }}>Recent DMF Matches (Case IDs Redacted)</div>
            {[['2025-05-14 00:03','DMF-MATCH-001','DOD: 2025-05-13','Staten Island','$318/mo frozen','CONFIRMED'],['2025-05-12 00:02','DMF-MATCH-002','DOD: 2025-05-11','Brooklyn','$536/mo frozen','CONFIRMED'],['2025-05-08 00:04','DMF-MATCH-003','DOD: 2025-05-07','Bronx','$292/mo frozen','CLOSED']].map(([ts,id,dod,boro,amt,status]) => (
              <div key={id} style={{ background:D.bgCard, border:`1px solid ${D.red}44`, borderRadius:4, padding:'12px 16px', marginBottom:8, borderLeft:`3px solid ${D.red}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:6, marginBottom:4 }}>
                  <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:12, color:D.accent, fontWeight:700 }}>{id}</span>
                  <span style={{ background:D.green+'22', color:D.green, padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${D.green}44` }}>{status}</span>
                </div>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:12, color:D.textMid }}>
                  <span>{ts}</span><span>{dod}</span><span>{boro}</span><span style={{ color:D.red, fontWeight:700 }}>{amt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeModule === 'device' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>DEVICE FINGERPRINT & BIOMETRIC VELOCITY — NIST IA-3</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              Tracking hardware ID and login "cadence" of mobile users. Detects if a single device is managing 50+ unique accounts — a hallmark of organized fraud rings. Biometric velocity measures how fast logins occur across accounts from the same device.
            </div>
            <div style={{ background:D.bgCard, border:`1px solid ${D.red}`, borderRadius:4, padding:'14px 18px', marginBottom:14 }}>
              <div style={{ fontSize:11, color:D.red, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>⚑ ACTIVE ALERT — DEVICE CLUSTER d4a9...f23c</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
                {[['IMEI Hash','d4a9...f23c'],['Accounts Linked','73'],['Avg Logins/hr','4.1'],['Biometric Failures','61 / 73'],['First Seen','2024-03-12'],['Status','FROZEN']].map(([l,v]) => (
                  <div key={l} style={{ background:D.redPale, borderRadius:3, padding:'8px 12px' }}>
                    <div style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:D.red, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:8 }}>Top Device Risk Clusters</div>
            {[['d4a9...f23c',73,4.1,'Brooklyn','CRITICAL'],['a1b7...88de',34,2.7,'Bronx','HIGH'],['f9c2...1104',18,1.9,'Queens','HIGH'],['7e3d...b542',11,1.1,'Manhattan','MEDIUM']].map(([hash,accts,vel,boro,risk]) => {
              const rc = risk==='CRITICAL'?D.red:risk==='HIGH'?D.orange:D.yellow;
              return (
                <div key={hash} style={{ display:'flex', gap:14, alignItems:'center', padding:'10px 14px', background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:4, marginBottom:6, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:12, color:D.accent, minWidth:100 }}>{hash}</span>
                  <span style={{ fontSize:12, color:D.text }}>{accts} accounts</span>
                  <span style={{ fontSize:12, color:D.orange }}>{vel} logins/hr</span>
                  <span style={{ fontSize:12, color:D.textMid }}>{boro}</span>
                  <span style={{ background:rc+'22', color:rc, padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${rc}44`, marginLeft:'auto' }}>{risk}</span>
                </div>
              );
            })}
          </div>
        )}

        {activeModule === 'recidivism' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>PREDICTIVE RECIDIVISM SCORING — NIST AU-6</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              Machine Learning module assigning a "Likelihood to Re-offend" score to previously flagged individuals. Based on historical compliance behavior, prior fraud type, conviction status, time since last incident, and geographic clustering. Scores update nightly via dbt ML pipeline.
            </div>
            <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:4, overflow:'hidden', marginBottom:14 }}>
              <div style={{ padding:'10px 16px', background:D.bg, borderBottom:`1px solid ${D.border}` }}>
                <span style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', letterSpacing:1 }}>High-Risk Recidivism Candidates — Top 8 (Anonymized)</span>
              </div>
              {[['REC-001','EBT Skimming','2023-11-07',0.94,'Bronx','Convicted — 18mo'],['REC-002','Retailer Trafficking','2023-01-28',0.91,'Brooklyn','Disqualified'],['REC-003','Device Fingerprint','2024-01-15',0.88,'Brooklyn','Accounts Frozen'],['REC-004','Dual Participation','2022-09-14',0.82,'Queens','Benefits Terminated'],['REC-005','Synthetic Identity','2023-07-02',0.79,'Manhattan','Under Investigation'],['REC-006','Phishing','2023-12-18',0.76,'Queens','Card Reissued'],['REC-007','Ghost Beneficiary','2024-01-15',0.71,'Staten Island','Case Closed'],['REC-008','Caseworker Misconduct','2023-06-30',0.68,'Manhattan','Administrative Hearing']].map(([id, type, lastInc, score, boro, disposition]) => {
                const sc = score >= 0.9 ? D.red : score >= 0.8 ? D.orange : D.yellow;
                return (
                  <div key={id} style={{ padding:'10px 16px', borderBottom:`1px solid ${D.border}44`, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:11, color:D.accent, minWidth:80 }}>{id}</span>
                    <span style={{ fontSize:11, color:D.text, flex:1, minWidth:140 }}>{type}</span>
                    <span style={{ fontSize:11, color:D.textMute, minWidth:90 }}>{boro}</span>
                    <span style={{ fontSize:11, color:D.textMute, minWidth:80 }}>{lastInc}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:120 }}>
                      <div style={{ width:60, background:D.border, borderRadius:2, height:5 }}>
                        <div style={{ width:`${score*100}%`, height:'100%', background:sc, borderRadius:2 }}/>
                      </div>
                      <span style={{ fontSize:11, color:sc, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{(score*100).toFixed(0)}%</span>
                    </div>
                    <span style={{ fontSize:10, color:D.textMid }}>{disposition}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeModule === 'subpoena' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>AUTOMATED SUBPOENA DRAFTER — NIST AU-6</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              When a fraud risk score exceeds 0.95, the system automatically generates a PDF legal packet for the District Attorney, including transaction logs, geo-tags, ISO 8583 records, and NIST audit chain. Packets are routed to the ADA queue within 4 hours of threshold breach.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:16 }}>
              {[['Packets Generated Q1 2024','14',D.accent],['DA Referrals','8',D.red],['Avg Generation Time','1.8 min',D.teal],['Risk Threshold','≥ 0.95',D.orange]].map(([l,v,c]) => (
                <div key={l} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:3, padding:'10px 14px' }}>
                  <div style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ border:`1px solid ${D.orange}`, borderRadius:4, padding:'16px 20px', background:D.orangePale, marginBottom:14 }}>
              <div style={{ fontSize:11, color:D.orange, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:8 }}>DEMO: Generate Legal Packet for FRD-2024-11482 (Risk: 97%)</div>
              <div style={{ fontSize:12, color:'#e0c080', marginBottom:12, lineHeight:1.6 }}>
                Case: EBT Skimming · Bronx ZIP 10456 · Loss: $18,400 · 47 victims · ISO 8583 confirmed · NIST SI-7 violation. Packet will include transaction logs, geo-tags, packet analysis, NIST audit chain, and affidavit template for ADA submission.
              </div>
              <button onClick={() => generateSubpoena('FRD-2024-11482')} disabled={generatingSubpoena}
                style={{ background:D.orange, color:'#1a1000', border:'none', borderRadius:3, padding:'9px 20px', fontSize:12, fontWeight:700, cursor:generatingSubpoena?'not-allowed':'pointer', fontFamily:"'IBM Plex Mono','Courier New',monospace", opacity:generatingSubpoena?0.7:1 }}>
                {generatingSubpoena ? '⟳ COMPILING PACKET...' : 'GENERATE LEGAL PACKET → DA'}
              </button>
              {subpoenaStatus === 'complete' && (
                <div style={{ marginTop:12, fontSize:12, color:D.green, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>
                  ✓ SP-2024-1148 generated — routed to ADA queue. NIST AU-6 event logged. RSA-4096 signed. SHA-256: a9f3...7b21
                </div>
              )}
            </div>
          </div>
        )}

        {activeModule === 'darkweb' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>DARK WEB PII SENTINEL — NIST SI-7</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              Scraper service that alerts administrators if SSNs or HRA Case IDs associated with current beneficiaries appear on known leak sites or dark web marketplaces. Scan runs every 12 hours via Custom Script RPA bot.
            </div>
            <div style={{ background:D.redPale, border:`1px solid ${D.red}`, borderRadius:4, padding:'12px 18px', marginBottom:14 }}>
              <div style={{ fontSize:11, color:D.red, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>⚑ ACTIVE ALERT — 2 SSNs matched in monitored credential dump — 2025-05-14 07:44 UTC</div>
              <div style={{ fontSize:12, color:'#e0a0a0', marginTop:6 }}>Source: [REDACTED] marketplace. Affected HRA case IDs logged. PIN resets initiated. DOI notified per 18 U.S.C. § 1030.</div>
            </div>
            {[
              { ts:'2025-05-14 07:44', type:'SSN Match', caseId:'HRA-REDACTED-001', source:'Dark Market Alpha', action:'PIN Reset + DOI Notify', severity:'CRITICAL' },
              { ts:'2025-05-14 07:44', type:'SSN Match', caseId:'HRA-REDACTED-002', source:'Dark Market Alpha', action:'PIN Reset + Benefits Hold', severity:'CRITICAL' },
              { ts:'2025-05-10 19:02', type:'Case ID Exposure', caseId:'HRA-REDACTED-003', source:'Pastebin Scrape', action:'Caseworker Notified', severity:'HIGH' },
              { ts:'2025-04-28 11:30', type:'Email Match', caseId:'HRA-REDACTED-004', source:'Breach Database', action:'Account Locked', severity:'HIGH' },
              { ts:'2025-04-15 08:15', type:'Phone Match', caseId:'HRA-REDACTED-005', source:'Leaked DB Torrent', action:'MFA Reset Required', severity:'MEDIUM' },
            ].map((alert, i) => {
              const sc = alert.severity==='CRITICAL'?D.red:alert.severity==='HIGH'?D.orange:D.yellow;
              return (
                <div key={i} style={{ background:D.bgCard, border:`1px solid ${sc}44`, borderRadius:4, padding:'12px 16px', marginBottom:8, borderLeft:`3px solid ${sc}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:6, marginBottom:4 }}>
                    <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:11, color:D.accent }}>{alert.ts}</span>
                    <span style={{ background:sc+'22', color:sc, padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${sc}44` }}>{alert.severity}</span>
                  </div>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:12 }}>
                    <span style={{ color:D.red, fontWeight:700 }}>{alert.type}</span>
                    <span style={{ color:D.textMid }}>{alert.caseId}</span>
                    <span style={{ color:D.textMute }}>Source: {alert.source}</span>
                    <span style={{ color:D.green }}>Action: {alert.action}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeModule === 'nlp' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>NLP CASEWORKER SENTINEL — NIST PS-7</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              Analyzes caseworker notes for sentiment and specific red-flag keywords — "urgent bypass," "override requested," "client needs immediate" — to identify potential internal collusion or administrative shortcuts bypassing standard verification protocols.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:14 }}>
              {[['Notes Analyzed Today','8,420',D.accent],['Flag Keywords Detected','23',D.red],['Cases Flagged','4',D.orange],['OIG Referrals','1',D.red],['Caseworkers Reviewed','3',D.orange],['False Positive Rate','8.2%',D.yellow]].map(([l,v,c]) => (
                <div key={l} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:3, padding:'10px 14px' }}>
                  <div style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:8 }}>Flagged Caseworker Note Excerpts (Anonymized)</div>
            {[
              { ts:'2025-05-14 05:12', caseworker:'[REDACTED-1]', excerpt:'"...client needs immediate processing, supervisor override approved without documentation review..."', flags:['urgent bypass','override approved without'], severity:'HIGH', action:'OIG Referral Filed' },
              { ts:'2025-05-13 14:30', caseworker:'[REDACTED-2]', excerpt:'"...expedited approval per verbal instruction, standard verification skipped, supervisor confirmed..."', flags:['expedited','verification skipped'], severity:'HIGH', action:'Administrative Review' },
              { ts:'2025-05-12 09:15', caseworker:'[REDACTED-3]', excerpt:'"...applied categorical eligibility per supervisor direction before income verification complete..."', flags:['before verification complete'], severity:'MEDIUM', action:'Supervisor Interview' },
              { ts:'2025-05-10 16:42', caseworker:'[REDACTED-1]', excerpt:'"...client approved per policy exception, documentation to follow..."', flags:['documentation to follow'], severity:'MEDIUM', action:'Documentation Audit' },
            ].map((note, i) => {
              const sc = note.severity==='HIGH'?D.orange:D.yellow;
              return (
                <div key={i} style={{ background:D.bgCard, border:`1px solid ${sc}44`, borderRadius:4, padding:'12px 16px', marginBottom:8, borderLeft:`3px solid ${sc}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:6, marginBottom:6 }}>
                    <span style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:11, color:D.accent }}>{note.ts} · {note.caseworker}</span>
                    <span style={{ background:sc+'22', color:sc, padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{note.severity}</span>
                  </div>
                  <div style={{ fontSize:12, color:D.textMid, lineHeight:1.6, marginBottom:8, fontStyle:'italic' }}>{note.excerpt}</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
                    {note.flags.map(f => <span key={f} style={{ background:D.redPale, color:D.red, padding:'2px 8px', borderRadius:3, fontSize:10, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${D.red}44` }}>FLAG: "{f}"</span>)}
                  </div>
                  <div style={{ fontSize:12, color:D.green }}>Action: {note.action}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeModule === 'crossstate' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>CROSS-STATE BENEFIT INTERCEPT (NAC) — NIST AC-2</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              Real-time lookup against the National Accuracy Clearinghouse (NAC) to catch "dual-participation" — individuals simultaneously receiving benefits in New York and another state. Batch runs nightly; real-time flags on new enrollments.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:14 }}>
              {[['Records Checked (Batch)','43,200',D.accent],['Dual-Participation Flags','12',D.red],['Confirmed Violations','3',D.red],['Benefits Terminated','3',D.red],['Overpayment Claims','$20,400',D.orange],['NAC Lookup Uptime','99.7%',D.green]].map(([l,v,c]) => (
                <div key={l} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:3, padding:'10px 14px' }}>
                  <div style={{ fontSize:10, color:D.textMute, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:c, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr style={{ background:D.bgCard }}>
                  {['Case ID (NY)','Other State','NY Case#','Other Case#','Overlap','Amount','Status'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:D.textMute, borderBottom:`1px solid ${D.border}`, fontFamily:"'IBM Plex Mono','Courier New',monospace", textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['NAC-001','New Jersey','NY-771-004-882','NJ-DCPP-44812','7 months','$6,800','TERMINATED'],
                  ['NAC-002','Florida','NY-449-002-117','FL-DCF-88921','4 months','$3,200','TERMINATED'],
                  ['NAC-003','Connecticut','NY-883-009-451','CT-DSS-22341','11 months','$10,400','TERMINATED'],
                  ['NAC-004','Pennsylvania','NY-221-007-334','PA-DHS-56712','2 months','$1,600','PENDING'],
                  ['NAC-005','Massachusetts','NY-667-003-221','MA-DTA-11823','3 months','$2,900','PENDING'],
                ].map(([id, state, nyCaseNo, otherNo, overlap, amt, status], i) => {
                  const sc = status==='TERMINATED'?D.green:D.orange;
                  return (
                    <tr key={id} style={{ background:i%2===0?'transparent':D.bg+'66', borderBottom:`1px solid ${D.border}44` }}>
                      <td style={{ padding:'9px 12px', fontFamily:"'IBM Plex Mono','Courier New',monospace", color:D.accent }}>{id}</td>
                      <td style={{ padding:'9px 12px', color:D.text }}>{state}</td>
                      <td style={{ padding:'9px 12px', fontFamily:"'IBM Plex Mono','Courier New',monospace", color:D.textMid, fontSize:10 }}>{nyCaseNo}</td>
                      <td style={{ padding:'9px 12px', fontFamily:"'IBM Plex Mono','Courier New',monospace", color:D.textMute, fontSize:10 }}>{otherNo}</td>
                      <td style={{ padding:'9px 12px', color:D.red }}>{overlap}</td>
                      <td style={{ padding:'9px 12px', color:D.orange, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{amt}</td>
                      <td style={{ padding:'9px 12px' }}><span style={{ background:sc+'22', color:sc, padding:'2px 7px', borderRadius:3, fontSize:10, fontWeight:700, fontFamily:"'IBM Plex Mono','Courier New',monospace", border:`1px solid ${sc}44` }}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeModule === 'fairhearing' && (
          <div style={{ background:D.bgPanel, border:`1px solid ${D.border}`, borderRadius:4, padding:'18px 22px' }}>
            <div style={{ fontSize:11, color:D.textMute, textTransform:'uppercase', letterSpacing:1, fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:6 }}>FAIR HEARING PREP-BOT — NIST AU-6</div>
            <div style={{ fontSize:13, color:D.textMid, lineHeight:1.6, marginBottom:14 }}>
              AI assistant that compiles a comprehensive "Statement of Fact" for HRA legal teams before a state hearing, summarizing all neutralized anomalies, evidence chains, NIST audit trail, and applicable regulatory citations. Output is formatted for New York State Office of Temporary and Disability Assistance (OTDA) Fair Hearing proceedings.
            </div>
            <div style={{ background:D.bgCard, border:`1px solid ${D.teal}`, borderRadius:4, padding:'16px 20px', marginBottom:14, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>
              <div style={{ fontSize:10, color:D.teal, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>SAMPLE STATEMENT OF FACT — CASE FRD-2024-09831</div>
              <div style={{ fontSize:12, color:D.textMid, lineHeight:1.8 }}>
                <div style={{ marginBottom:6 }}><strong style={{ color:D.text }}>HEARING DOCKET:</strong> FH-2024-NY-44821</div>
                <div style={{ marginBottom:6 }}><strong style={{ color:D.text }}>RESPONDENT:</strong> Best Value Grocery Inc. — Brooklyn, NY 11212</div>
                <div style={{ marginBottom:6 }}><strong style={{ color:D.text }}>VIOLATION:</strong> 7 U.S.C. § 2021 — SNAP Retailer Trafficking</div>
                <div style={{ marginBottom:6 }}><strong style={{ color:D.text }}>EVIDENCE SUMMARY:</strong> 94% of transactions at exact even-dollar increments ($100, $200, $400). 67% of transactions occurred 11 PM–4 AM outside business hours. ISO 8583 packet analysis confirms non-EMV mag-stripe processing on 89% of flagged transactions. Total benefit trafficking estimated: $224,000 over 8-month period.</div>
                <div style={{ marginBottom:6 }}><strong style={{ color:D.text }}>NIST AUDIT CHAIN:</strong> AU-3 event log hash verified. AU-6 review triggered. SI-7 packet integrity confirmed. Chain of custody: unbroken from detection to referral.</div>
                <div style={{ marginBottom:6 }}><strong style={{ color:D.text }}>REGULATORY CITATIONS:</strong> 7 CFR 278.6(e)(1)(i) — Permanent Disqualification; 7 U.S.C. § 2023 — Administrative Review; OTDA GIS 23-ADM-07.</div>
                <div><strong style={{ color:D.green }}>RECOMMENDATION:</strong> Permanent disqualification from SNAP program. Federal criminal referral under 18 U.S.C. § 641. Civil monetary penalty: $224,000 or permanent ban.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function HRAFraudAuditTool() {
  const [activeTab, setActiveTab] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const pulse = useSystemPulse();

  const tabs = [
    { label:"Command Center", sub:"Live Metrics · Fraud Volume · Boroughs" },
    { label:"Case Triage", sub:"Fraud Cases · ISO 8583 · Subpoena" },
    { label:"NIST-800-53 Compliance", sub:"Controls · Findings · Regulations" },
    { label:"RPA Operations", sub:"UiPath · Power Automate · SSIS · dbt" },
    { label:"Kernel Audit Log", sub:"Live Events · AU-2/AU-3 · Integrity" },
    { label:"Live Triage Stream", sub:"60-Case Synthetic Stream · Search · Risk" },
    { label:"Advanced Intel Modules", sub:"SIG · Retailer · DMF · Device · DA Packet" },
  ];

  return (
    <div style={{ width:"100%", maxWidth:1280, minWidth:320, margin:"0 auto", background:D.bg, color:D.text, fontFamily:"'IBM Plex Sans','Segoe UI',Arial,sans-serif", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#eeecea; }
        ::-webkit-scrollbar-thumb { background:#b0ada4; border-radius:3px; }
        button { font-family: inherit; }
        @media (max-width:700px) {
          .tab-scroll { overflow-x: auto; white-space: nowrap; }
          .main-pad { padding: 12px 10px !important; }
          .header-row { flex-direction: column !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background:D.headerBg, borderBottom:`3px solid ${D.primary}`, padding:"18px 28px" }}>
        <div className="header-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:10, color:D.primaryLight, fontWeight:700, letterSpacing:2, textTransform:"uppercase", fontFamily:"'IBM Plex Mono','Courier New',monospace", marginBottom:5 }}>NYC HRA · Program & Data Management · Fraud Detection Auditing Tool</div>
            <h1 style={{ margin:0, fontSize:"clamp(16px,3.2vw,24px)", color:D.headerText, fontWeight:700, lineHeight:1.2 }}>Sovereign Integrity Engine — SNAP/EBT Fraud Detection System</h1>
            <div style={{ color:D.headerText+"99", fontSize:12, marginTop:5 }}>WMS · ACCESS HRA · POS · NIST-800-53 Compliant · $7.6B Budget Oversight</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, color:D.headerText+"88", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>System Status</div>
            <div style={{ color:"#5da87a", fontWeight:700, fontSize:13, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>● OPERATIONAL — {pulse.uptime} uptime</div>
            <div style={{ fontSize:11, color:D.headerText+"88", marginTop:4 }}>Compiled by <strong style={{color:D.primaryLight}}>Lancelot Napier-Kane</strong></div>
            <div style={{ fontSize:10, color:D.headerText+"77" }}>HRA Program & Data Manager · Nov 2023–Sep 2024</div>
            <button
              onClick={() => setIsLive(v => !v)}
              style={{
                marginTop: 6, padding: "4px 14px", borderRadius: 3, fontSize: 11,
                fontFamily: "'IBM Plex Mono','Courier New',monospace", fontWeight: 700, cursor: "pointer",
                background: isLive ? "#7a202033" : "#2a5c3a33",
                color: isLive ? "#e08080" : "#6bbb88",
                border: `1px solid ${isLive ? "#e0808055" : "#6bbb8855"}`
              }}
            >
              {isLive ? "⬛ KILL FEED" : "▶ RESTORE FEED"}
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[[`${pulse.txProcessed.toLocaleString()} Tx Today`,"#5da87a"],[`${pulse.packetsPerSec.toLocaleString()} pkt/s`,"#3fb899"],["NIST-800-53 Aligned",D.primaryLight],["34,306 NYC Fraud Cases Q1 '24","#e07070"],["$7.6B Budget Managed","#d08050"]].map(([l,c])=>(
            <span key={l} style={{ fontSize:11, color:c, background:c+"22", padding:"3px 10px", borderRadius:3, border:`1px solid ${c}44`, fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700 }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: D.headerBg, padding: "0 24px", display: "flex", alignItems: "stretch", borderBottom: `3px solid ${D.primary}`, flexWrap: "nowrap", overflowX: "auto", gap: 0 }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{
              background: activeTab === i ? D.primary : "transparent",
              color: activeTab === i ? "#ffffff" : D.headerText + "99",
              border: "none",
              borderRight: `1px solid #ffffff15`,
              padding: "10px 14px",
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans','Segoe UI',Arial,sans-serif",
              fontSize: 11,
              fontWeight: activeTab === i ? 700 : 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              whiteSpace: "nowrap",
              transition: "background 0.15s",
              minWidth: 0,
              flex: 1,
            }}>
            <span style={{ fontSize: 10, opacity: 0.6, fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>0{i+1}</span>
            <span style={{ fontSize: 11 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="main-pad" style={{ padding:"20px 24px" }}>
        {activeTab===0 && <Tab1Command pulse={pulse}/>}
        {activeTab===1 && <Tab2Cases/>}
        {activeTab===2 && <Tab3Compliance/>}
        {activeTab===3 && <Tab4RPA/>}
        {activeTab===4 && <Tab5AuditLog/>}
        {activeTab===5 && <Tab6LiveTriage isLive={isLive}/>}
        {activeTab===6 && <Tab7AdvancedModules/>}
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${D.border}`, padding:"14px 24px", background:D.bgPanel }}>
        <div style={{ fontSize:10, color:D.textMute, lineHeight:1.8, fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>
          <strong style={{ color:D.textMid }}>REAL DATA:</strong> NYC DOI Skimming Report (Sep 2025) · NYC Mayor's Office ($48.6M reimbursements) · USDA FNS Q1 2024 SNAP Fraud Data (34,306 NYC cases, 177,000 national) · NYC DSS reimbursement processing stats · USDA FY2023 improper payment rate (11.7%) · 18 U.S.C. § 1030, 7 U.S.C. § 2021, 7 CFR Part 273, 23-ADM-07, OMB M-22-09, NIST SP 800-53 Rev 5 · HRA Fraud Unit: 718-557-1399 ·&nbsp;
          <strong style={{ color:D.orange }}>SAMPLE/SIMULATED:</strong> Individual case files, caseworker names, retailer specifics, device fingerprints, and RPA bot outputs are illustrative sample data. System architecture reflects real HRA tool stack (WMS, POS, Cúram, UiPath, SSIS, dbt, Tableau). ·&nbsp;
          <strong style={{ color:D.accent }}>Compiled by Lancelot Napier-Kane</strong> · HRA Program &amp; Data Manager Nov 2023–Sep 2024
        </div>
      </div>

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
          Tools: React, SVG, NIST 800-53 &nbsp;·&nbsp;
          Methods: Fraud detection, anomaly scoring, identity graph analysis, EBT transaction monitoring &nbsp;·&nbsp;
          Sources: HRA/SNAP administrative data models, USDA FNS guidelines, NYC DSS frameworks
        </p>
      </div>
    </div>
  );
}
