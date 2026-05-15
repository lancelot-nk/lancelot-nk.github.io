import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const C = {
  bg: "#fafaf7",
  bgWhite: "#ffffff",
  bgPanel: "#f3f4f0",
  bgDark: "#1c2b1c",
  border: "#dde0d8",
  borderDark: "#b8c0b0",
  text: "#1a2018",
  textMid: "#3a4838",
  textMute: "#7a8c78",
  gold: "#b5860d",
  goldLight: "#e8c84a",
  goldPale: "#fdf6d8",
  green: "#2d6a3a",
  greenLight: "#4a9e5a",
  greenPale: "#e8f4ea",
  red: "#8b2a20",
  redPale: "#fce9e7",
  orange: "#a04010",
  orangePale: "#fdf0e5",
  blue: "#1c4878",
  bluePale: "#e8eef8",
  purple: "#5a2d82",
  purplePale: "#f0eaf8",
  teal: "#1a6060",
  tealPale: "#e5f4f4",
};

// ─── SAMPLE DONOR DATABASE ──────────────────────────────────────────────────
// Simulated NoSQL documents — modeled after Cosmos DB document structure
const DONORS = [
  {
    _id: "donor_001", _partition: "segment_major", _ts: 1747180000,
    name: "Margaret Osei-Bonsu", title: "Director of Philanthropy", org: "Sunrise Family Foundation",
    email: "m.osei-bonsu@sunriseff.org", phone: "+1 (202) 555-0142", location: "Washington, DC",
    segment: "MAJOR", status: "ACTIVE", score: 94,
    totalGiven: 42000, lastGift: 12000, lastGiftDate: "2024-11-12",
    capacity: 75000, likeliness: 92, avgGiftSize: 10500,
    tags: ["Solar Advocate", "Board Connection", "Annual Giver", "Planned Giving Prospect"],
    outreachSteps: [
      { date:"2024-02-10", type:"In-Person Meeting", by:"James Okafor", result:"Positive — interested in solar school program", responded: true },
      { date:"2024-05-15", type:"Major Gift Proposal", by:"James Okafor", result:"Submitted $15K ask for Kenya pilot", responded: true },
      { date:"2024-07-20", type:"Site Visit", by:"James Okafor", result:"Toured Nairobi school site — very moved", responded: true },
      { date:"2024-11-12", type:"Gift Received", by:"System", result:"$12,000 received — Nairobi Schools Initiative", responded: true },
      { date:"2025-02-01", type:"Stewardship Call", by:"Amara Diallo", result:"Thank you call + impact report sent", responded: true },
    ],
    nextActions: ["Submit FY26 major gift proposal ($20K) by September 2025", "Invite to annual gala — keynote table", "Explore planned giving conversation"],
    notes: "Champion of women-led solar enterprises. Introduced two peer donors. Responds best to site visit reports with photos.",
    acquisitionChannel: "Board Referral",
    firstContactDate: "2023-09-15",
    emailOpen: 0.88, emailClick: 0.62, eventAttend: 3,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_002", _partition: "segment_mid", _ts: 1747180100,
    name: "Daniel Ferrara", title: "Principal", org: "Ferrara & Associates Architecture",
    email: "d.ferrara@ferrara-arch.com", phone: "+1 (415) 555-0289", location: "San Francisco, CA",
    segment: "MID", status: "ACTIVE", score: 81,
    totalGiven: 8500, lastGift: 3500, lastGiftDate: "2024-09-03",
    capacity: 20000, likeliness: 78, avgGiftSize: 2833,
    tags: ["Recurring Donor", "Event Attendee", "Design Connection"],
    outreachSteps: [
      { date:"2023-11-02", type:"Email Campaign", by:"System", result:"Opened + clicked — signed up for newsletter", responded: true },
      { date:"2024-01-18", type:"Welcome Call", by:"Amara Diallo", result:"Engaged — mentioned interest in East Africa work", responded: true },
      { date:"2024-06-10", type:"Event Invitation", by:"Amara Diallo", result:"Attended SF solar event", responded: true },
      { date:"2024-09-03", type:"Gift Received", by:"System", result:"$3,500 — Mid-Year Fund", responded: true },
      { date:"2025-01-14", type:"Impact Email", by:"System", result:"Sent annual impact report — opened 4x", responded: true },
    ],
    nextActions: ["Upgrade ask to $5,000 for FY26", "Invite to virtual program tour", "Send architect-focused solar design case study"],
    notes: "Passionate about sustainable design. Has professional network of architects who might be cultivation prospects.",
    acquisitionChannel: "Email Campaign",
    firstContactDate: "2023-11-02",
    emailOpen: 0.74, emailClick: 0.48, eventAttend: 1,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_003", _partition: "segment_major", _ts: 1747180200,
    name: "Priya Venkataraman", title: "VP of Corporate Sustainability", org: "Helios Energy Group",
    email: "pvenkat@heliosgroup.com", phone: "+1 (312) 555-0371", location: "Chicago, IL",
    segment: "MAJOR", status: "ACTIVE", score: 89,
    totalGiven: 55000, lastGift: 25000, lastGiftDate: "2025-01-28",
    capacity: 100000, likeliness: 87, avgGiftSize: 13750,
    tags: ["Corporate Partnership", "Solar Sector", "High Capacity", "Strategic Alliance"],
    outreachSteps: [
      { date:"2022-09-01", type:"Conference Introduction", by:"James Okafor", result:"Met at CleanEnergy Summit — exchanged info", responded: true },
      { date:"2023-02-14", type:"Partnership Proposal", by:"James Okafor", result:"Presented corporate giving framework", responded: true },
      { date:"2023-07-10", type:"Corporate Gift Received", by:"System", result:"$15,000 — corporate partner grant", responded: true },
      { date:"2024-03-05", type:"Program Review", by:"James Okafor", result:"Quarterly impact review — positive", responded: true },
      { date:"2025-01-28", type:"Gift Received", by:"System", result:"$25,000 — solar stove deployment expansion", responded: true },
    ],
    nextActions: ["Propose 3-year $75K partnership agreement", "Co-branding opportunity on Uganda rollout", "Invite to board observer seat"],
    notes: "Helios Energy has CSR budget aligned to SDG 7. Priya has authority to approve gifts up to $50K without board approval.",
    acquisitionChannel: "Conference / Event",
    firstContactDate: "2022-09-01",
    emailOpen: 0.91, emailClick: 0.70, eventAttend: 4,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_004", _partition: "segment_cold", _ts: 1747180300,
    name: "Robert Callahan", title: "Retired Attorney", org: "Self",
    email: "rob.callahan55@gmail.com", phone: "+1 (617) 555-0198", location: "Boston, MA",
    segment: "LAPSED", status: "COLD", score: 38,
    totalGiven: 2000, lastGift: 500, lastGiftDate: "2022-06-01",
    capacity: 15000, likeliness: 24, avgGiftSize: 667,
    tags: ["Lapsed Donor", "Re-engagement Needed", "Retirement Wealth"],
    outreachSteps: [
      { date:"2021-12-01", type:"Direct Mail", by:"System", result:"Responded — $500 gift", responded: true },
      { date:"2022-06-01", type:"Gift Received", by:"System", result:"$500 — Annual Fund", responded: true },
      { date:"2023-02-10", type:"Re-engagement Email", by:"System", result:"No response", responded: false },
      { date:"2023-08-15", type:"Phone Call Attempt", by:"Amara Diallo", result:"Voicemail left — no callback", responded: false },
      { date:"2024-03-20", type:"Re-engagement Email", by:"System", result:"Email opened, no click", responded: false },
    ],
    nextActions: ["Personalized handwritten note from ED", "Send condensed 1-page impact report", "Offer free giving society membership"],
    notes: "Was responsive early; changed email once. High retirement capacity per wealth screening. Needs personal touchpoint.",
    acquisitionChannel: "Direct Mail",
    firstContactDate: "2021-12-01",
    emailOpen: 0.32, emailClick: 0.05, eventAttend: 0,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_005", _partition: "segment_potential", _ts: 1747180400,
    name: "Aisha Nakamura", title: "Founder & CEO", org: "ClimateFirst Ventures",
    email: "aisha@climatefirstvc.com", phone: "+1 (650) 555-0512", location: "Palo Alto, CA",
    segment: "PROSPECT", status: "WARM", score: 71,
    totalGiven: 0, lastGift: 0, lastGiftDate: null,
    capacity: 50000, likeliness: 68, avgGiftSize: 0,
    tags: ["Climate Tech", "High Capacity", "Warm Prospect", "VC Network"],
    outreachSteps: [
      { date:"2024-08-12", type:"LinkedIn Outreach", by:"James Okafor", result:"Connected — positive exchange", responded: true },
      { date:"2024-10-05", type:"Informational Meeting", by:"James Okafor", result:"1hr Zoom — expressed strong interest in solar stoves", responded: true },
      { date:"2025-01-15", type:"Program Deck Sent", by:"Amara Diallo", result:"Opened + forwarded to two colleagues", responded: true },
      { date:"2025-03-22", type:"Site Visit Invitation", by:"Amara Diallo", result:"Accepted — visiting Uganda site June 2025", responded: true },
    ],
    nextActions: ["Prepare customized Uganda site visit agenda", "Draft first gift proposal $10K–$15K", "Introduce to Margaret Osei-Bonsu"],
    notes: "Controls LP allocations with social impact component. Investment thesis aligned with our work. Site visit is key cultivation milestone.",
    acquisitionChannel: "LinkedIn / Social",
    firstContactDate: "2024-08-12",
    emailOpen: 0.85, emailClick: 0.60, eventAttend: 0,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_006", _partition: "segment_mid", _ts: 1747180500,
    name: "Thomas Obeng", title: "Professor of Development Economics", org: "Georgetown University",
    email: "tobeng@georgetown.edu", phone: "+1 (202) 555-0634", location: "Washington, DC",
    segment: "MID", status: "ACTIVE", score: 76,
    totalGiven: 6000, lastGift: 2500, lastGiftDate: "2024-12-19",
    capacity: 15000, likeliness: 74, avgGiftSize: 1500,
    tags: ["Academic", "East Africa Expertise", "Thought Leader", "Recurring"],
    outreachSteps: [
      { date:"2023-04-20", type:"Panel Introduction", by:"James Okafor", result:"Met at Georgetown solar panel discussion", responded: true },
      { date:"2023-09-10", type:"Coffee Meeting", by:"James Okafor", result:"Deep conversation — offered to write impact essay", responded: true },
      { date:"2024-04-05", type:"Gift Received", by:"System", result:"$1,500 — First gift", responded: true },
      { date:"2024-09-01", type:"Speaking Invitation", by:"Amara Diallo", result:"Spoke at annual luncheon — well received", responded: true },
      { date:"2024-12-19", type:"Year-End Gift", by:"System", result:"$2,500 — upgraded from last year", responded: true },
    ],
    nextActions: ["Commission impact essay for annual report", "Propose $5,000 named fellowship", "Connect with board for research partnership"],
    notes: "Credibility asset as well as donor. Could anchor academic advisory council. Georgetown has matching gift program.",
    acquisitionChannel: "Event / Speaking",
    firstContactDate: "2023-04-20",
    emailOpen: 0.79, emailClick: 0.52, eventAttend: 2,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_007", _partition: "segment_cold", _ts: 1747180600,
    name: "Sarah-Jane Whitmore", title: "Marketing Director", org: "Coastal Media Group",
    email: "sjwhitmore@coastalmedia.net", phone: "+1 (212) 555-0745", location: "New York, NY",
    segment: "LAPSED", status: "COLD", score: 29,
    totalGiven: 750, lastGift: 250, lastGiftDate: "2021-10-15",
    capacity: 8000, likeliness: 18, avgGiftSize: 250,
    tags: ["Lapsed", "Low Engagement", "Small Donor", "Email Unresponsive"],
    outreachSteps: [
      { date:"2021-10-15", type:"Online Gift", by:"System", result:"$250 one-time online gift", responded: true },
      { date:"2022-03-01", type:"Welcome Series Email", by:"System", result:"Opened twice", responded: false },
      { date:"2022-12-01", type:"Year-End Appeal", by:"System", result:"Unopened", responded: false },
      { date:"2023-06-15", type:"Re-engagement Email", by:"System", result:"Unopened", responded: false },
    ],
    nextActions: ["Consider 1-year suppression before final outreach attempt", "Try text message outreach", "Move to low-cost digital re-engagement track"],
    notes: "Acquired through social media ad. Low engagement throughout. May have changed roles.",
    acquisitionChannel: "Social Media Ad",
    firstContactDate: "2021-10-15",
    emailOpen: 0.08, emailClick: 0.00, eventAttend: 0,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_008", _partition: "segment_potential", _ts: 1747180700,
    name: "Kwame Asante-Hughes", title: "Senior Partner", org: "Asante-Hughes Capital",
    email: "kwame@ahcapital.com", phone: "+1 (404) 555-0867", location: "Atlanta, GA",
    segment: "PROSPECT", status: "WARM", score: 83,
    totalGiven: 0, lastGift: 0, lastGiftDate: null,
    capacity: 100000, likeliness: 80, avgGiftSize: 0,
    tags: ["High Capacity", "Africa Diaspora", "Peer Introduction", "Major Gift Prospect"],
    outreachSteps: [
      { date:"2024-11-01", type:"Peer Introduction", by:"Margaret Osei-Bonsu", result:"Warm introduction from Margaret — very strong connection", responded: true },
      { date:"2025-01-20", type:"Discovery Call", by:"James Okafor", result:"Strong alignment — grew up near Kumasi solar project area", responded: true },
      { date:"2025-03-10", type:"Program Visit", by:"James Okafor", result:"Toured DC HQ + viewed Ghana footage — visibly emotional", responded: true },
      { date:"2025-04-28", type:"Gift Proposal Sent", by:"James Okafor", result:"$25K ask submitted — awaiting response", responded: false },
    ],
    nextActions: ["Follow-up call on proposal — week of May 20", "Prepare matching gift briefing", "Offer board nomination if gift received"],
    notes: "Diaspora connection to Ghana is powerful motivation. Peer-referred by Margaret. Has made $50K+ gifts to other orgs. High priority.",
    acquisitionChannel: "Peer Referral",
    firstContactDate: "2024-11-01",
    emailOpen: 0.90, emailClick: 0.72, eventAttend: 1,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_009", _partition: "segment_mid", _ts: 1747180800,
    name: "Elena Rossi-Park", title: "Sustainability Officer", org: "Pacific Heritage Bank",
    email: "erossipark@pacheritage.com", phone: "+1 (503) 555-0921", location: "Portland, OR",
    segment: "MID", status: "ACTIVE", score: 68,
    totalGiven: 4500, lastGift: 1500, lastGiftDate: "2024-06-30",
    capacity: 12000, likeliness: 65, avgGiftSize: 1500,
    tags: ["Corporate Giving", "Bank CRA", "Mid-Level", "ESG Aligned"],
    outreachSteps: [
      { date:"2023-06-01", type:"Grant Application", by:"Amara Diallo", result:"Submitted to PHB Community Grant", responded: true },
      { date:"2023-09-15", type:"Grant Received", by:"System", result:"$1,500 — CRA grant Year 1", responded: true },
      { date:"2024-02-10", type:"Relationship Meeting", by:"Amara Diallo", result:"Relationship call — bank expanding ESG scope", responded: true },
      { date:"2024-06-30", type:"Grant Received", by:"System", result:"$1,500 — CRA grant Year 2 renewal", responded: true },
      { date:"2025-02-14", type:"Renewal Proposal", by:"Amara Diallo", result:"Year 3 renewal submitted at $3,000", responded: false },
    ],
    nextActions: ["Follow up on Year 3 CRA renewal ($3,000)", "Explore employee giving match program", "Invite Elena to speak on ESG panel"],
    notes: "CRA compliance motivation. Bank has employee matching program not yet activated for our org. Could double gift value.",
    acquisitionChannel: "Grant / Foundation",
    firstContactDate: "2023-06-01",
    emailOpen: 0.61, emailClick: 0.38, eventAttend: 0,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_010", _partition: "segment_potential", _ts: 1747180900,
    name: "Fatima Al-Rashid", title: "Executive Director", org: "Gulf-Atlantic Foundation",
    email: "falrashid@gulfatlanticfnd.org", phone: "+1 (305) 555-1012", location: "Miami, FL",
    segment: "PROSPECT", status: "COLD_PROSPECT", score: 55,
    totalGiven: 0, lastGift: 0, lastGiftDate: null,
    capacity: 200000, likeliness: 45, avgGiftSize: 0,
    tags: ["Foundation", "High Capacity", "MENA Connection", "Uncultivated"],
    outreachSteps: [
      { date:"2024-09-05", type:"Prospect Research", by:"System", result:"Identified via IRS 990 research — Gulf-Atlantic funds SDG 7 programs", responded: false },
      { date:"2025-01-10", type:"Cold Email", by:"Amara Diallo", result:"Opened — no response", responded: false },
      { date:"2025-03-18", type:"LinkedIn Message", by:"James Okafor", result:"No response", responded: false },
    ],
    nextActions: ["Research mutual board connections for warm introduction", "Submit LOI to Gulf-Atlantic RFP (due Aug 2025)", "Assign to cultivation track — 6-month plan"],
    notes: "Foundation has $2M+ in solar/clean energy grants outstanding per 990s. Cold outreach has not broken through. Need warm intro.",
    acquisitionChannel: "Prospect Research",
    firstContactDate: "2024-09-05",
    emailOpen: 0.22, emailClick: 0.00, eventAttend: 0,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_011", _partition: "segment_mid", _ts: 1747181000,
    name: "Carlos Mendez-Vidal", title: "Civil Engineer", org: "Meridian Infrastructure",
    email: "cmendez@meridian-infra.com", phone: "+1 (713) 555-1134", location: "Houston, TX",
    segment: "MID", status: "ACTIVE", score: 72,
    totalGiven: 5000, lastGift: 2000, lastGiftDate: "2025-01-10",
    capacity: 18000, likeliness: 70, avgGiftSize: 1667,
    tags: ["Engineering Background", "Recurring Donor", "Technical Champion"],
    outreachSteps: [
      { date:"2023-03-10", type:"Website Donation", by:"System", result:"$1,000 unsolicited — found org via Google", responded: true },
      { date:"2023-05-20", type:"Welcome Call", by:"Amara Diallo", result:"Very enthusiastic — wants technical updates", responded: true },
      { date:"2023-10-15", type:"Technical Site Report", by:"Amara Diallo", result:"Sent engineering efficiency data — loved it", responded: true },
      { date:"2024-04-01", type:"Gift Received", by:"System", result:"$2,000 upgraded gift", responded: true },
      { date:"2025-01-10", type:"Gift Received", by:"System", result:"$2,000 — recurring annual", responded: true },
    ],
    nextActions: ["Send stove efficiency engineering white paper", "Explore in-kind services — infrastructure design support", "Propose $5,000 technical leadership gift"],
    notes: "Very engaged with technical content. Forwarded our efficiency report to 3 colleagues. May volunteer as pro-bono engineer.",
    acquisitionChannel: "Organic Search / Website",
    firstContactDate: "2023-03-10",
    emailOpen: 0.82, emailClick: 0.66, eventAttend: 0,
    cosmosCollection: "donors", container: "crm-prod",
  },
  {
    _id: "donor_012", _partition: "segment_cold", _ts: 1747181100,
    name: "Patricia Leung-Forsythe", title: "Retired Teacher", org: "Self",
    email: "pat.leungf@yahoo.com", phone: "+1 (206) 555-1245", location: "Seattle, WA",
    segment: "LAPSED", status: "COLD", score: 22,
    totalGiven: 350, lastGift: 350, lastGiftDate: "2020-12-31",
    capacity: 5000, likeliness: 14, avgGiftSize: 350,
    tags: ["Lapsed", "Low Value", "Former Teacher", "Inactive 4+ Years"],
    outreachSteps: [
      { date:"2020-12-31", type:"Year-End Appeal", by:"System", result:"$350 one-time gift", responded: true },
      { date:"2021-06-15", type:"Email Newsletter", by:"System", result:"Opened 1x", responded: false },
      { date:"2022-01-10", type:"Re-engagement", by:"System", result:"Bounced — email changed", responded: false },
    ],
    nextActions: ["Attempt email verification / data append", "Low-cost postcard re-engagement", "Suppress if no response by Q4 2025"],
    notes: "4+ years lapsed. Email may be invalid. Low capacity but potentially warm to education angle (former teacher + solar for schools).",
    acquisitionChannel: "Direct Mail",
    firstContactDate: "2020-12-31",
    emailOpen: 0.05, emailClick: 0.00, eventAttend: 0,
    cosmosCollection: "donors", container: "crm-prod",
  },
];

// ─── PIPELINE / ETL SIMULATION DATA ────────────────────────────────────────
const ETL_PIPELINE = {
  name: "SolarCRM-ETL-v2",
  status: "HEALTHY",
  lastRun: "2025-05-14 04:15 UTC",
  nextScheduled: "2025-05-15 04:15 UTC",
  stages: [
    { name: "Ingest — CRM Source", type: "Source", tool: "Azure Data Factory", status: "OK", rowsProcessed: 1247, latencyMs: 320 },
    { name: "Validate & Cleanse", type: "Transform", tool: "Azure Synapse Analytics (T-SQL)", status: "OK", rowsProcessed: 1231, latencyMs: 890, rowsDropped: 16, cleaningNotes: "16 rows: 8 invalid emails, 5 duplicate _ids, 3 null required fields" },
    { name: "Deduplicate (Fuzzy Match)", type: "Transform", tool: "Synapse Spark Pool", status: "OK", rowsProcessed: 1231, latencyMs: 1420, dupesMerged: 4 },
    { name: "Score & Segment", type: "Enrich", tool: "Synapse ML / Donor Scoring Model", status: "OK", rowsProcessed: 1231, latencyMs: 540 },
    { name: "Write — Cosmos DB", type: "Sink", tool: "Azure Cosmos DB (Core SQL API)", status: "OK", rowsProcessed: 1231, latencyMs: 210 },
    { name: "Write — Blob / Data Lake Gen2", type: "Sink", tool: "Azure Data Lake Gen2", status: "OK", rowsProcessed: 1231, latencyMs: 185 },
    { name: "Refresh — Power BI Semantic", type: "Report", tool: "Power BI Premium", status: "OK", rowsProcessed: 1231, latencyMs: 3100 },
  ],
  dataQualityScore: 97.4,
  lastCleaningResult: { emailsFixed: 8, dupesRemoved: 4, nullsFilled: 3, totalChanged: 16 },
};

const DB_ARCHITECTURE = {
  cosmosDb: { name:"Azure Cosmos DB (Core SQL API)", role:"Primary CRM document store", partitionKey:"segment", throughputRU: 4000, containers:["donors","campaigns","interactions","gifts"], replication:"Multi-region (East US, West Europe, West US 2)" },
  synapseLink: { name:"Azure Synapse Link (HTAP)", role:"Zero-ETL analytical queries over Cosmos DB — no impact on OLTP throughput" },
  synapse: { name:"Azure Synapse Analytics", role:"Large-scale T-SQL analytics, ML scoring, batch ETL transforms" },
  dataFactory: { name:"Azure Data Factory", role:"Orchestration — 6 pipelines, nightly + event-triggered" },
  dataLake: { name:"Azure Data Lake Gen2", role:"Cold storage, historical archive, BI data export" },
  blobStorage: { name:"Azure Blob Storage", role:"Email template storage, attachment blobs, report PDFs" },
  powerBI: { name:"Power BI Premium", role:"Executive dashboard, board reports, campaign analytics" },
  mysql: { name:"MySQL (Legacy)", role:"Historical donor records pre-2020 — being migrated via ADF pipeline" },
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const SEG_COLOR = { MAJOR:"#2d6a3a", MID:"#1c4878", PROSPECT:"#5a2d82", LAPSED:"#8b2a20" };
const SEG_PALE = { MAJOR:C.greenPale, MID:C.bluePale, PROSPECT:C.purplePale, LAPSED:C.redPale };
const STATUS_COLOR = { ACTIVE:C.green, WARM:C.teal, COLD:C.red, COLD_PROSPECT:C.orange };
const STATUS_LABEL = { ACTIVE:"Active", WARM:"Warm Prospect", COLD:"Lapsed/Cold", COLD_PROSPECT:"Cold Prospect" };
const STEP_COLOR = { "Gift Received":C.green, "In-Person Meeting":C.blue, "Site Visit":C.teal, "Major Gift Proposal":C.purple, "Stewardship Call":C.green, "Email Campaign":C.gold, "Welcome Call":C.blue, "Impact Email":C.gold, "Conference Introduction":C.blue, "Partnership Proposal":C.purple, "Program Review":C.teal, "Coffee Meeting":C.teal, "Speaking Invitation":C.blue, "Year-End Gift":C.green, "Grant Application":C.orange, "Grant Received":C.green, "Renewal Proposal":C.orange, "LinkedIn Outreach":C.blue, "Informational Meeting":C.teal, "Program Deck Sent":C.gold, "Site Visit Invitation":C.teal, "Peer Introduction":C.purple, "Discovery Call":C.blue, "Program Visit":C.teal, "Gift Proposal Sent":C.purple, "Website Donation":C.green, "Technical Site Report":C.teal, "Prospect Research":C.textMute, "Cold Email":C.orange, "LinkedIn Message":C.blue, "Online Gift":C.green, "Welcome Series Email":C.gold, "Year-End Appeal":C.gold, "Re-engagement Email":C.orange, "Phone Call Attempt":C.orange, "Direct Mail":C.gold, "Panel Introduction":C.blue, "Re-engagement":C.orange };

function scoreColor(s) { return s >= 80 ? C.green : s >= 60 ? C.teal : s >= 40 ? C.orange : C.red; }
function fmtDate(d) { if (!d) return "—"; const dt = new Date(d); return dt.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
function fmtCurrency(n) { return n > 0 ? "$"+n.toLocaleString() : "—"; }

// Funnel data
const FUNNEL = [
  { stage:"Identified Prospects", count:24, pct:100, color:C.gold },
  { stage:"Qualified / Researched", count:18, pct:75, color:C.teal },
  { stage:"Cultivated (1+ Contact)", count:12, pct:50, color:C.blue },
  { stage:"Proposals Submitted", count:8, pct:33, color:C.purple },
  { stage:"Gifts Received", count:6, pct:25, color:C.green },
];

const CAMPAIGN_DATA = [
  { name:"Year-End 2024 Appeal", type:"Email", sent:847, opened:412, clicked:189, converted:34, raised:18400 },
  { name:"Spring 2025 Mid-Year", type:"Email", sent:903, opened:389, clicked:156, converted:21, raised:9200 },
  { name:"Major Gift FY25", type:"Personal", sent:14, opened:14, clicked:14, converted:7, raised:52000 },
  { name:"Corporate Outreach Q1", type:"Proposal", sent:9, opened:9, clicked:9, converted:3, raised:30000 },
  { name:"Peer-to-Peer Social", type:"Social", sent:1200, opened:680, clicked:210, converted:18, raised:4500 },
  { name:"Event Follow-Up", type:"Email", sent:320, opened:198, clicked:110, converted:15, raised:7800 },
];

const MONTHLY_GIVING = [
  {month:"Jun '24",gifts:6,amount:5200},{month:"Jul '24",gifts:4,amount:3800},
  {month:"Aug '24",gifts:5,amount:4600},{month:"Sep '24",gifts:8,amount:9400},
  {month:"Oct '24",gifts:6,amount:5800},{month:"Nov '24",gifts:14,amount:22100},
  {month:"Dec '24",gifts:22,amount:38500},{month:"Jan '25",gifts:9,amount:31200},
  {month:"Feb '25",gifts:7,amount:6400},{month:"Mar '25",gifts:8,amount:8900},
  {month:"Apr '25",gifts:6,amount:5600},{month:"May '25",gifts:4,amount:3200},
];

// ─── DB SYNC SIMULATION ──────────────────────────────────────────────────────
function useDbSync() {
  const [syncState, setSyncState] = useState("idle"); // idle | syncing | done | cleaning | cleanDone
  const [syncLog, setSyncLog] = useState([]);
  const [cleanResult, setCleanResult] = useState(null);

  const runSync = () => {
    setSyncState("syncing");
    setSyncLog([]);
    const steps = [
      [300, "⟳ Authenticating with Azure AD (OAuth 2.0)..."],
      [700, "⟳ Connecting to Cosmos DB endpoint — solarcrm-prod.documents.azure.com"],
      [1200, "✓ Cosmos DB handshake OK — throughput: 4,000 RU/s"],
      [1800, "⟳ Querying Synapse Link (HTAP) for analytical snapshot..."],
      [2400, "✓ Synapse Link pull: 1,231 documents, 7 collections"],
      [3000, "⟳ Running ADF pipeline: SolarCRM-ETL-v2..."],
      [3600, "✓ Data Factory pipeline completed — 0 errors"],
      [4000, "✓ Power BI semantic model refresh triggered"],
      [4400, "✓ Sync complete — last write: " + new Date().toISOString().slice(0,19) + " UTC"],
    ];
    steps.forEach(([delay, msg]) => {
      setTimeout(() => {
        setSyncLog(l => [...l, msg]);
        if (delay === 4400) setSyncState("done");
      }, delay);
    });
  };

  const runClean = () => {
    setSyncState("cleaning");
    setSyncLog([]);
    const steps = [
      [300, "⟳ Loading raw donor records from Data Lake Gen2 (Parquet)..."],
      [800, "⟳ Running T-SQL VALIDATE procedure on Synapse Analytics..."],
      [1400, "⚠ Detected 8 records with invalid email format — flagging for correction"],
      [2000, "⚠ Detected 4 duplicate _id entries — merging via fuzzy match logic"],
      [2600, "⚠ Detected 3 records with NULL required fields — applying default fill"],
      [3200, "⟳ Running deduplication (Spark Pool, Levenshtein distance < 0.15)..."],
      [3800, "✓ Deduplicated 4 near-matches → merged into canonical records"],
      [4200, "⟳ Scoring model re-run on cleaned records (XGBoost classifier)..."],
      [4700, "✓ All 1,231 records scored — avg score: 61.4 | median: 68"],
      [5100, "⟳ Writing cleaned records back to Cosmos DB and Data Lake Gen2..."],
      [5600, "✓ Data cleaning complete — quality score improved: 94.1% → 97.4%"],
    ];
    steps.forEach(([delay, msg]) => {
      setTimeout(() => {
        setSyncLog(l => [...l, msg]);
        if (delay === 5600) {
          setSyncState("cleanDone");
          setCleanResult({ emailsFixed:8, dupesRemoved:4, nullsFilled:3, totalChanged:16, beforeScore:94.1, afterScore:97.4 });
        }
      }, delay);
    });
  };

  return { syncState, syncLog, cleanResult, runSync, runClean };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function ScoreBar({ score, size = "md" }) {
  const h = size === "sm" ? 6 : 10;
  const color = scoreColor(score);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, background:C.border, borderRadius:4, height:h, overflow:"hidden" }}>
        <div style={{ width:`${score}%`, height:"100%", background:color, borderRadius:4, transition:"width 0.6s ease" }}/>
      </div>
      <span style={{ fontSize: size === "sm" ? 11 : 13, fontWeight:700, color, minWidth:26 }}>{score}</span>
    </div>
  );
}

function Badge({ label, color, pale }) {
  return <span style={{ background:pale||"#eee", color:color||C.textMid, padding:"2px 9px", borderRadius:12, fontSize:11, fontWeight:700, border:`1px solid ${color||C.border}30` }}>{label}</span>;
}

function Stat({ label, value, color, sub }) {
  return (
    <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"14px 18px" }}>
      <div style={{ fontSize:11, color:C.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color:color||C.text, fontFamily:"'Georgia',serif" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.textMute, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ─── TAB 1: DONOR DASHBOARD ─────────────────────────────────────────────────
function Tab1Dashboard() {
  const [segFilter, setSegFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("score");

  const segments = ["ALL","MAJOR","MID","PROSPECT","LAPSED"];
  const filtered = DONORS
    .filter(d => segFilter === "ALL" || d.segment === segFilter)
    .sort((a,b) => sortBy === "score" ? b.score - a.score : sortBy === "giving" ? b.totalGiven - a.totalGiven : sortBy === "last" ? new Date(b.lastGiftDate||0) - new Date(a.lastGiftDate||0) : b.score - a.score);

  const totals = { raised: DONORS.reduce((s,d)=>s+d.totalGiven,0), active: DONORS.filter(d=>d.status==="ACTIVE").length, prospects: DONORS.filter(d=>d.segment==="PROSPECT").length, lapsed: DONORS.filter(d=>d.status==="COLD").length, avgScore: Math.round(DONORS.reduce((s,d)=>s+d.score,0)/DONORS.length) };
  const segCounts = { MAJOR: DONORS.filter(d=>d.segment==="MAJOR").length, MID: DONORS.filter(d=>d.segment==="MID").length, PROSPECT: DONORS.filter(d=>d.segment==="PROSPECT").length, LAPSED: DONORS.filter(d=>d.segment==="LAPSED").length };
  const maxMonth = Math.max(...MONTHLY_GIVING.map(m=>m.amount));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
        <Stat label="Total Raised (Tracked)" value={`$${(totals.raised/1000).toFixed(1)}K`} color={C.green} sub="Sample dataset — 12 contacts"/>
        <Stat label="Active Donors" value={totals.active} color={C.blue} sub="Gave in last 18 months"/>
        <Stat label="Warm Prospects" value={totals.prospects} color={C.purple} sub="No gift yet received"/>
        <Stat label="Lapsed / Cold" value={totals.lapsed} color={C.red} sub="Needs re-engagement"/>
        <Stat label="Avg. Donor Score" value={totals.avgScore} color={scoreColor(totals.avgScore)} sub="0–100 proprietary score"/>
      </div>

      {/* Segment + Funnel row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Segment breakdown */}
        <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"16px 20px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginBottom:14 }}>Donor Segments</div>
          {[["MAJOR","Major Donors ($10K+)",C.green,C.greenPale],["MID","Mid-Level ($1K–$9.9K)",C.blue,C.bluePale],["PROSPECT","Prospects (No Gift)",C.purple,C.purplePale],["LAPSED","Lapsed / Cold",C.red,C.redPale]].map(([seg,label,color,pale])=>{
            const cnt = segCounts[seg];
            const pct = Math.round(cnt / DONORS.length * 100);
            return (
              <div key={seg} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, color:C.text, fontWeight:600 }}>{label}</span>
                  <span style={{ fontSize:13, color, fontWeight:700 }}>{cnt} <span style={{ fontWeight:400, color:C.textMute }}>({pct}%)</span></span>
                </div>
                <div style={{ background:C.border, borderRadius:4, height:8 }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:4 }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Funnel */}
        <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"16px 20px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginBottom:14 }}>Cultivation Funnel</div>
          {FUNNEL.map((f,i) => (
            <div key={f.stage} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:12, color:C.textMid }}>{f.stage}</span>
                <span style={{ fontSize:12, fontWeight:700, color:f.color }}>{f.count} <span style={{ color:C.textMute, fontWeight:400 }}>({f.pct}%)</span></span>
              </div>
              <div style={{ background:C.border, borderRadius:4, height:7 }}>
                <div style={{ width:`${f.pct}%`, height:"100%", background:f.color, borderRadius:4 }}/>
              </div>
            </div>
          ))}
          <div style={{ marginTop:10, fontSize:12, color:C.textMute, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>Conversion: Identified → Gift = <strong style={{color:C.green}}>25%</strong></div>
        </div>
      </div>

      {/* Monthly giving chart */}
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"16px 20px" }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginBottom:16 }}>Monthly Giving Volume (Trailing 12 Months)</div>
        <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:120 }}>
          {MONTHLY_GIVING.map((m,i) => {
            const h = Math.round((m.amount / maxMonth) * 100);
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:9, color:C.textMute, fontWeight:700 }}>{m.gifts}</div>
                <div style={{ width:"100%", height:h, background:m.amount>20000?C.gold:m.amount>10000?C.green:C.teal, borderRadius:"3px 3px 0 0", minHeight:4, position:"relative" }}
                  title={`${m.month}: $${m.amount.toLocaleString()}`}/>
                <div style={{ fontSize:8, color:C.textMute, textAlign:"center", lineHeight:1.2 }}>{m.month.split(" ")[0]}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:C.textMute }}>Bar height = gift amount · Number above bar = # gifts</span>
          <span style={{ fontSize:11, color:C.gold, fontWeight:700 }}>■ $20K+</span>
          <span style={{ fontSize:11, color:C.green, fontWeight:700 }}>■ $10K–$20K</span>
          <span style={{ fontSize:11, color:C.teal, fontWeight:700 }}>■ Under $10K</span>
        </div>
      </div>

      {/* Campaign performance */}
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"16px 20px" }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginBottom:14 }}>Campaign Performance</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:C.bgPanel }}>
                {["Campaign","Type","Sent","Open Rate","Click Rate","Conversions","Raised"].map(h=>(
                  <th key={h} style={{ padding:"9px 12px", textAlign: h==="Campaign"||h==="Type"?"left":"right", color:C.textMid, borderBottom:`2px solid ${C.borderDark}`, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGN_DATA.map((c,i) => (
                <tr key={c.name} style={{ background:i%2===0?"white":C.bgPanel, borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:"9px 12px", fontWeight:600, color:C.text }}>{c.name}</td>
                  <td style={{ padding:"9px 12px" }}><Badge label={c.type} color={C.blue} pale={C.bluePale}/></td>
                  <td style={{ padding:"9px 12px", textAlign:"right", color:C.textMid }}>{c.sent.toLocaleString()}</td>
                  <td style={{ padding:"9px 12px", textAlign:"right", color:C.teal, fontWeight:700 }}>{Math.round(c.opened/c.sent*100)}%</td>
                  <td style={{ padding:"9px 12px", textAlign:"right", color:C.blue, fontWeight:700 }}>{Math.round(c.clicked/c.sent*100)}%</td>
                  <td style={{ padding:"9px 12px", textAlign:"right", color:C.green, fontWeight:700 }}>{c.converted}</td>
                  <td style={{ padding:"9px 12px", textAlign:"right", color:C.gold, fontWeight:700 }}>${c.raised.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donor grid */}
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"16px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5 }}>Donor Portfolio — {segFilter === "ALL" ? "All Segments" : segFilter} ({filtered.length})</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <div style={{ display:"flex", gap:4 }}>
              {segments.map(s=>(
                <button key={s} onClick={()=>setSegFilter(s)} style={{ padding:"4px 10px", borderRadius:3, border:`1px solid ${segFilter===s?(SEG_COLOR[s]||C.green):C.border}`, background:segFilter===s?(SEG_PALE[s]||C.greenPale):"white", color:segFilter===s?(SEG_COLOR[s]||C.green):C.textMute, fontSize:11, cursor:"pointer", fontWeight:segFilter===s?700:400 }}>{s}</button>
              ))}
            </div>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ fontSize:11, border:`1px solid ${C.border}`, borderRadius:3, padding:"4px 8px", background:"white", color:C.textMid }}>
              <option value="score">Sort: Score</option>
              <option value="giving">Sort: Total Giving</option>
              <option value="last">Sort: Last Gift</option>
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
          {filtered.map(d => {
            const segColor = SEG_COLOR[d.segment] || C.textMid;
            const segPale = SEG_PALE[d.segment] || C.bgPanel;
            return (
              <div key={d._id} style={{ background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:6, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:C.text, lineHeight:1.3 }}>{d.name}</div>
                    <div style={{ fontSize:11, color:C.textMute, marginTop:2 }}>{d.title}</div>
                    <div style={{ fontSize:11, color:C.textMute }}>{d.org}</div>
                  </div>
                  <Badge label={d.segment} color={segColor} pale={segPale}/>
                </div>
                <ScoreBar score={d.score} size="sm"/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:10 }}>
                  <div style={{ fontSize:11, color:C.textMute }}>Total Raised<br/><strong style={{color:C.gold}}>{fmtCurrency(d.totalGiven)}</strong></div>
                  <div style={{ fontSize:11, color:C.textMute }}>Last Gift<br/><strong style={{color:C.text}}>{fmtCurrency(d.lastGift)}</strong></div>
                  <div style={{ fontSize:11, color:C.textMute }}>Capacity Est.<br/><strong style={{color:C.textMid}}>{fmtCurrency(d.capacity)}</strong></div>
                  <div style={{ fontSize:11, color:C.textMute }}>Likeliness<br/><strong style={{color:scoreColor(d.likeliness)}}>{d.likeliness}%</strong></div>
                </div>
                <div style={{ marginTop:8, display:"flex", gap:4, flexWrap:"wrap" }}>
                  <span style={{ fontSize:10, background:"white", color:STATUS_COLOR[d.status]||C.textMute, padding:"1px 7px", borderRadius:10, border:`1px solid ${STATUS_COLOR[d.status]||C.border}30`, fontWeight:700 }}>{STATUS_LABEL[d.status]||d.status}</span>
                  <span style={{ fontSize:10, color:C.textMute, padding:"1px 7px" }}>📍 {d.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: DONOR DETAIL TABLE ───────────────────────────────────────────────
function Tab2DonorDetail() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [simEmail, setSimEmail] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const filtered = DONORS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.org.toLowerCase().includes(search.toLowerCase()) ||
    d.segment.toLowerCase().includes(search.toLowerCase())
  );

  const donor = selected ? DONORS.find(d=>d._id===selected) : null;

  const EMAIL_TEMPLATES = {
    ACTIVE: { subject:`Impact Update: Solar Stoves Reaching More Families in East Africa`, body:`Dear [Name],\n\nI wanted to share some remarkable news from our programs in Kenya and Uganda that I thought you'd appreciate, given your generous support.\n\nThis quarter, thanks to donors like you, our teams deployed 847 solar cooking stoves across 12 schools and 200 family households — reducing indoor air pollution exposure for an estimated 4,200 people.\n\nI'd love to schedule a brief call to share more and discuss how your partnership might grow with us in the year ahead.\n\nWith gratitude,\nJames Okafor\nExecutive Director, SolarCook International` },
    PROSPECT: { subject:`Introduction to SolarCook International — Solar Cooking for East Africa`, body:`Dear [Name],\n\nA mutual connection suggested I reach out — they mentioned your work in clean energy and thought there might be meaningful common ground.\n\nSolarCook International deploys solar cooking technology to communities in Kenya, Uganda, and Ghana — eliminating reliance on wood-burning stoves that cause respiratory disease and deforestation. We're reaching 50,000+ people annually.\n\nI'd welcome a 20-minute conversation at your convenience to share what we're working on and explore whether there might be a fit for your philanthropic interests.\n\nWarm regards,\nJames Okafor` },
    LAPSED: { subject:`We miss you — and so do the families you helped`, body:`Dear [Name],\n\nIt's been a while since we've connected, and I wanted to personally reach out.\n\nA lot has changed since your last gift. Our programs have grown to reach three countries, and the impact stories are truly remarkable. I'd love to share our annual impact report with you — just click below.\n\nYour past support mattered deeply. If you're open to it, I'd love to reconnect and tell you about what your generosity made possible.\n\nWith sincere thanks,\nAmara Diallo\nDevelopment Officer` },
    COLD_PROSPECT: { subject:`SolarCook International — Grant Inquiry`, body:`Dear [Name],\n\nI'm writing to introduce SolarCook International and inquire about alignment with your foundation's solar energy and climate access programs.\n\nWe are a registered 501(c)(3) deploying solar cooking technology across East and West Africa. Our programs address SDG 7 (Clean Energy), SDG 3 (Health), and SDG 13 (Climate Action) — areas your foundation has prioritized per your published guidelines.\n\nI would welcome the opportunity to submit a Letter of Inquiry. Would you be open to a brief introductory call?\n\nRespectfully,\nJames Okafor, Executive Director` },
  };

  const sendSimEmail = (d) => {
    setSimEmail(d);
    setEmailSent(false);
    setTimeout(()=>setEmailSent(true), 1200);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search donors, organizations, segments..." style={{ flex:1, minWidth:200, padding:"8px 14px", border:`1px solid ${C.border}`, borderRadius:4, fontSize:13, fontFamily:"inherit", background:C.bgWhite, color:C.text, outline:"none" }}/>
        <div style={{ fontSize:12, color:C.textMute }}>{filtered.length} records</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: donor ? "1fr 1.4fr" : "1fr", gap:16, alignItems:"start" }}>
        {/* Donor list */}
        <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:C.bgPanel }}>
                {["Donor","Org","Segment","Score","Total Given","Last Gift","Status"].map(h=>(
                  <th key={h} style={{ padding:"9px 12px", textAlign:h==="Score"||h==="Total Given"||h==="Last Gift"?"right":"left", fontSize:11, fontWeight:700, color:C.textMid, borderBottom:`2px solid ${C.borderDark}`, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d,i) => {
                const isSel = selected === d._id;
                return (
                  <tr key={d._id} onClick={()=>setSelected(isSel?null:d._id)}
                    style={{ background: isSel ? C.goldPale : i%2===0?"white":C.bgPanel, cursor:"pointer", borderBottom:`1px solid ${C.border}`, transition:"background 0.1s" }}>
                    <td style={{ padding:"9px 12px", fontWeight:600, color:C.text }}>{d.name}</td>
                    <td style={{ padding:"9px 12px", color:C.textMute, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.org}</td>
                    <td style={{ padding:"9px 12px" }}><Badge label={d.segment} color={SEG_COLOR[d.segment]} pale={SEG_PALE[d.segment]}/></td>
                    <td style={{ padding:"9px 12px", textAlign:"right", fontWeight:700, color:scoreColor(d.score) }}>{d.score}</td>
                    <td style={{ padding:"9px 12px", textAlign:"right", color:C.gold, fontWeight:700 }}>{fmtCurrency(d.totalGiven)}</td>
                    <td style={{ padding:"9px 12px", textAlign:"right", color:C.textMid }}>{fmtDate(d.lastGiftDate)}</td>
                    <td style={{ padding:"9px 12px" }}><span style={{ fontSize:10, color:STATUS_COLOR[d.status], fontWeight:700 }}>{STATUS_LABEL[d.status]}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Donor detail */}
        {donor && (
          <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontSize:11, color:C.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>Donor Record · {donor._id}</div>
                <h3 style={{ margin:0, fontSize:18, color:C.text, fontFamily:"'Georgia',serif" }}>{donor.name}</h3>
                <div style={{ fontSize:12, color:C.textMute, marginTop:3 }}>{donor.title} · {donor.org}</div>
                <div style={{ fontSize:12, color:C.textMute }}>{donor.email} · {donor.location}</div>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Badge label={donor.segment} color={SEG_COLOR[donor.segment]} pale={SEG_PALE[donor.segment]}/>
                <Badge label={STATUS_LABEL[donor.status]} color={STATUS_COLOR[donor.status]} pale={STATUS_COLOR[donor.status]+"18"}/>
              </div>
            </div>

            {/* Scores */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              <div style={{ background:C.bgPanel, borderRadius:4, padding:"10px 14px" }}>
                <div style={{ fontSize:10, color:C.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>Donor Score</div>
                <ScoreBar score={donor.score}/>
              </div>
              <div style={{ background:C.bgPanel, borderRadius:4, padding:"10px 14px" }}>
                <div style={{ fontSize:10, color:C.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>Gift Likeliness</div>
                <ScoreBar score={donor.likeliness}/>
              </div>
              <div style={{ background:C.bgPanel, borderRadius:4, padding:"10px 14px" }}>
                <div style={{ fontSize:10, color:C.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Email Engagement</div>
                <div style={{ fontSize:13, color:C.text }}><strong style={{color:C.teal}}>{Math.round(donor.emailOpen*100)}%</strong> open · <strong style={{color:C.blue}}>{Math.round(donor.emailClick*100)}%</strong> click</div>
              </div>
            </div>

            {/* Financials */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
              {[["Total Given",fmtCurrency(donor.totalGiven),C.gold],["Capacity Estimate",fmtCurrency(donor.capacity),C.teal],["Avg. Gift Size",fmtCurrency(donor.avgGiftSize),C.blue],["Last Gift",fmtCurrency(donor.lastGift),C.green],["Last Gift Date",fmtDate(donor.lastGiftDate),C.textMid],["Events Attended",donor.eventAttend+" events",C.purple]].map(([k,v,c])=>(
                <div key={k} style={{ background:C.bgPanel, borderRadius:4, padding:"8px 12px" }}>
                  <div style={{ fontSize:10, color:C.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:c }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Contact history */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Contact History ({donor.outreachSteps.length} touchpoints)</div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {donor.outreachSteps.map((step,i)=>{
                  const dotColor = STEP_COLOR[step.type] || C.textMute;
                  return (
                    <div key={i} style={{ display:"flex", gap:12, paddingBottom:12, position:"relative" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:dotColor, marginTop:3, flexShrink:0, border:`2px solid white`, boxShadow:`0 0 0 2px ${dotColor}40` }}/>
                        {i < donor.outreachSteps.length-1 && <div style={{ width:2, flex:1, background:C.border, marginTop:3 }}/>}
                      </div>
                      <div style={{ flex:1, paddingBottom:2 }}>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:dotColor }}>{step.type}</span>
                          <span style={{ fontSize:11, color:C.textMute }}>{fmtDate(step.date)}</span>
                          <span style={{ fontSize:11, color:C.textMute }}>by {step.by}</span>
                          <span style={{ fontSize:10, background:step.responded?C.greenPale:C.redPale, color:step.responded?C.green:C.red, padding:"1px 6px", borderRadius:8, fontWeight:700 }}>{step.responded?"Responded":"No Response"}</span>
                        </div>
                        <div style={{ fontSize:12, color:C.textMid, lineHeight:1.5 }}>{step.result}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next actions */}
            <div style={{ background:C.goldPale, border:`1px solid ${C.gold}30`, borderRadius:4, padding:"12px 16px", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.gold, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Next Actions</div>
              {donor.nextActions.map((a,i)=>(
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <span style={{ color:C.gold, fontWeight:700, fontSize:13 }}>→</span>
                  <span style={{ fontSize:13, color:C.textMid, lineHeight:1.5 }}>{a}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:C.textMute, marginBottom:6 }}>Tags</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {donor.tags.map(t=><span key={t} style={{ background:C.bgPanel, color:C.textMid, padding:"2px 8px", borderRadius:12, fontSize:11, border:`1px solid ${C.border}` }}>{t}</span>)}
              </div>
            </div>

            {/* Notes */}
            <div style={{ background:C.bgPanel, borderRadius:4, padding:"10px 14px", marginBottom:16, fontSize:13, color:C.textMid, lineHeight:1.6 }}>
              <strong style={{color:C.textMid, fontSize:11, textTransform:"uppercase", letterSpacing:0.5}}>Staff Notes: </strong>{donor.notes}
            </div>

            {/* Email simulation */}
            <div style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:"14px 18px", background:"white" }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Outreach Email Simulator</div>
              <div style={{ background:C.bgPanel, borderRadius:4, padding:"12px 16px", marginBottom:12 }}>
                <div style={{ fontSize:11, color:C.textMute, marginBottom:4 }}>Template: {donor.segment} — Auto-selected based on segment</div>
                <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:6 }}>Subject: {EMAIL_TEMPLATES[donor.segment]?.subject}</div>
                <pre style={{ fontSize:12, color:C.textMid, lineHeight:1.7, margin:0, whiteSpace:"pre-wrap", fontFamily:"'Georgia',serif" }}>
                  {EMAIL_TEMPLATES[donor.segment]?.body.replace("[Name]", donor.name.split(" ")[0])}
                </pre>
              </div>
              <button onClick={()=>sendSimEmail(donor)}
                style={{ background:C.green, color:"white", border:"none", borderRadius:4, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer", marginRight:10 }}>
                ✉ Simulate Send
              </button>
              {simEmail?._id === donor._id && (
                <span style={{ fontSize:12, color: emailSent ? C.green : C.gold, fontWeight:700 }}>
                  {emailSent ? `✓ Simulated send — logged to outreach history for ${donor.name.split(" ")[0]}` : "⟳ Queuing..."}
                </span>
              )}
            </div>

            {/* Cosmos DB document metadata */}
            <details style={{ marginTop:14 }}>
              <summary style={{ fontSize:11, color:C.textMute, cursor:"pointer", userSelect:"none" }}>View raw Cosmos DB document metadata ▾</summary>
              <pre style={{ fontSize:10, background:C.bgPanel, borderRadius:4, padding:"10px 14px", marginTop:8, color:C.textMid, overflowX:"auto", lineHeight:1.6 }}>{JSON.stringify({ _id:donor._id, _partition:donor._partition, _ts:donor._ts, cosmosCollection:donor.cosmosCollection, container:donor.container, _etag:`"${donor._id}-${donor._ts}"`, _self:`dbs/solarcrm-prod/colls/donors/docs/${donor._id}` }, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 3: STRATEGY REPORT ─────────────────────────────────────────────────
function Tab3Strategy() {
  const [openSection, setOpenSection] = useState("what-worked");
  const secs = [
    {id:"what-worked",label:"What Worked"},
    {id:"dropoffs",label:"Drop-Off Points"},
    {id:"improvements",label:"Suggested Improvements"},
    {id:"scoring",label:"Donor Scoring Model"},
    {id:"segments",label:"Segment Strategy"},
  ];

  const Section = ({id, children}) => openSection === id ? (
    <div style={{ background:"white", border:`1px solid ${C.green}`, borderTop:"none", borderRadius:"0 0 6px 6px", padding:"20px 24px" }}>{children}</div>
  ) : null;

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, marginBottom:20 }}>
        <Stat label="Best Channel ROI" value="Personal Ask" color={C.green} sub="Major gift = $7,428/donor avg"/>
        <Stat label="Email Open Rate" value="52%" color={C.teal} sub="Across all campaigns"/>
        <Stat label="Peer Referral Rate" value="2.3×" color={C.gold} sub="vs. cold acquisition"/>
        <Stat label="Lapsed Recovery" value="14%" color={C.orange} sub="Industry avg: 16–18%"/>
        <Stat label="Avg. Upgrade Rate" value="38%" color={C.blue} sub="Year-over-year gift increase"/>
      </div>

      {secs.map(sec => (
        <div key={sec.id} style={{ marginBottom:6 }}>
          <button onClick={() => setOpenSection(openSection===sec.id?null:sec.id)}
            style={{ width:"100%", background: openSection===sec.id ? C.greenPale : C.bgPanel, border:`1px solid ${openSection===sec.id?C.green:C.border}`, borderRadius: openSection===sec.id ? "6px 6px 0 0" : 6, padding:"13px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", color: openSection===sec.id ? C.green : C.text, fontSize:14, fontWeight:700, textAlign:"left" }}>
            {sec.label}<span style={{ fontSize:11, color:C.textMute }}>{openSection===sec.id?"▲":"▼"}</span>
          </button>

          <Section id={sec.id}>
            {sec.id === "what-worked" && (
              <div style={{ fontSize:13, color:C.textMid, lineHeight:1.8 }}>
                {[
                  ["Peer-to-Peer Referral", "The single highest-performing acquisition channel. Donors introduced by Margaret Osei-Bonsu (Kwame Asante-Hughes) and board connections entered the pipeline with 2.3× higher conversion rates and 3.1× higher first gift averages than cold outreach. The peer network effect compresses cultivation timelines from 18+ months to 6–9 months on average.","#01"],
                  ["Site Visit as Conversion Tool", "100% of prospects who completed a site visit either gave or are in active proposal stage. Priya Venkataraman and Margaret Osei-Bonsu both made their largest gifts within 90 days of field visits. Aisha Nakamura accepted a Uganda site visit invitation and has moved to proposal stage.","#02"],
                  ["Technical Content for Technical Donors", "Carlos Mendez-Vidal upgraded his gift after receiving the engineering efficiency report. Thomas Obeng gave his largest gift after being invited to speak. Tailoring content to professional identity significantly increases engagement scores.","#03"],
                  ["Year-End and Major Gift Concentration", "December 2024 produced $38,500 — 5× the monthly average. January 2025 produced $31,200 driven by Priya Venkataraman's $25K corporate gift. Concentration around fiscal year-end incentives justifies heavy Q4 major gift cultivation investment.","#04"],
                  ["Corporate and CRA Channel", "Elena Rossi-Park (Pacific Heritage Bank) and Priya Venkataraman (Helios Energy Group) both entered via institutional channels. Corporate relationships convert to recurring giving reliably. Bank CRA grant is a stable, underexploited channel — Elena's bank also has an employee matching program not yet activated.","#05"],
                ].map(([title, desc, num])=>(
                  <div key={num} style={{ display:"flex", gap:14, marginBottom:16, borderBottom:`1px solid ${C.border}`, paddingBottom:16 }}>
                    <div style={{ background:C.greenPale, color:C.green, borderRadius:4, padding:"4px 10px", fontSize:14, fontWeight:700, fontFamily:"'Georgia',serif", minWidth:36, textAlign:"center", height:"fit-content" }}>{num}</div>
                    <div><div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:4 }}>{title}</div><p style={{ margin:0 }}>{desc}</p></div>
                  </div>
                ))}
              </div>
            )}

            {sec.id === "dropoffs" && (
              <div>
                {[
                  { stage:"Cold Outreach → First Response", rate:"18%", benchmark:"20–25%", status:"BELOW", notes:"Cold email and LinkedIn outreach to Fatima Al-Rashid and Sarah-Jane Whitmore produced zero responses. Cold channel is consistently underperforming. Personalization and warm introduction should be pre-requisites before cold contact." },
                  { stage:"First Response → Cultivation Meeting", rate:"67%", benchmark:"55–65%", status:"ABOVE", notes:"Strong. Prospects who respond to initial outreach convert to cultivation meetings at above-benchmark rates. The quality of first touchpoint message is the key determinant." },
                  { stage:"Cultivation Meeting → Proposal", rate:"50%", benchmark:"40–60%", status:"OK", notes:"Within normal range. Robert Callahan is the primary drop-off — lapsed 3 years ago without re-engaging despite phone and email attempts. Personalized handwritten note from ED is the recommended next intervention." },
                  { stage:"Proposal → Gift", rate:"75%", benchmark:"60–70%", status:"ABOVE", notes:"Strong close rate on proposals. Kwame Asante-Hughes proposal is outstanding (submitted April 2025). Success rate will depend on follow-up call in May." },
                  { stage:"First Gift → Upgraded Gift", rate:"38%", benchmark:"30–45%", status:"OK", notes:"Upgrade rate is within benchmark. Thomas Obeng and Daniel Ferrara both upgraded year-over-year. Carlos Mendez-Vidal upgraded once. Key is consistent upgrade cultivation cycle — proposal submission in year 2 is non-negotiable." },
                  { stage:"Active → Lapsed (Attrition)", rate:"25%", benchmark:"20–30%", status:"OK", notes:"3 of 12 tracked contacts are lapsed. Patricia Leung-Forsythe has an invalid email; Sarah-Jane Whitmore is unresponsive since 2021. Attrition prevention requires consistent stewardship regardless of gift size." },
                ].map(item => {
                  const statusColor = item.status==="ABOVE"?C.green:item.status==="BELOW"?C.red:C.teal;
                  return (
                    <div key={item.stage} style={{ background:C.bgPanel, borderRadius:6, padding:"14px 18px", marginBottom:10, border:`1px solid ${C.border}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, marginBottom:6 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:C.text }}>{item.stage}</span>
                        <div style={{ display:"flex", gap:8 }}>
                          <Badge label={`Our rate: ${item.rate}`} color={statusColor} pale={statusColor+"18"}/>
                          <Badge label={`Benchmark: ${item.benchmark}`} color={C.textMute} pale={C.bgPanel}/>
                          <Badge label={item.status} color={statusColor} pale={statusColor+"18"}/>
                        </div>
                      </div>
                      <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.6 }}>{item.notes}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {sec.id === "improvements" && (
              <div>
                {[
                  { priority:"P1", title:"Systematize Peer Referral Program", action:"Development / Board", desc:"Formalize the peer referral channel with a structured Donor Ambassador program. Each active major donor should be asked to identify 2–3 peers annually. Margaret Osei-Bonsu introduced Kwame Asante-Hughes with exceptional results. Scale this deliberately." },
                  { priority:"P1", title:"Activate Pacific Heritage Bank Employee Match", action:"Amara Diallo / Elena Rossi-Park", desc:"Elena Rossi-Park's bank has an employee match program not yet registered for our organization. Activation could double CRA grant value with minimal staff effort. Estimated additional yield: $1,500–$3,000/yr." },
                  { priority:"P2", title:"Deploy Lapsed Donor Win-Back Sequence", action:"Development / Systems", desc:"Three lapsed contacts (Robert Callahan, Sarah-Jane Whitmore, Patricia Leung-Forsythe) have received automated outreach without success. Escalate to personalized handwritten note from ED for Callahan (capacity: $15K). Verify Leung-Forsythe email via data append. Suppress Whitmore for 12 months." },
                  { priority:"P2", title:"Invest in Video/Site Visit Content for Remote Donors", action:"Programs / Comms", desc:"Aisha Nakamura and Kwame Asante-Hughes (both high-capacity prospects) are engaging heavily with program stories. Invest in a short-form video (4–6 min) replicating the site visit experience for prospects who cannot travel. Estimated conversion lift: 15–25%." },
                  { priority:"P3", title:"Unlock Gulf-Atlantic Foundation via Warm Intro", action:"Executive Director", desc:"Fatima Al-Rashid's Gulf-Atlantic Foundation has $2M+ in active solar/clean energy grants per IRS 990. Cold outreach has not broken through. Research board member connections and pursue warm introduction before their August 2025 LOI deadline." },
                  { priority:"P3", title:"Launch Recurring Giving / Monthly Donor Track", action:"Development", desc:"Zero current donors are on a recurring monthly giving schedule. Monthly donors have 90%+ retention vs. 40–60% for annual donors. Target mid-level donors (Carlos Mendez-Vidal, Thomas Obeng) for conversion to $200–$250/month commitment." },
                ].map(rec => {
                  const pc = rec.priority==="P1" ? C.red : rec.priority==="P2" ? C.orange : C.teal;
                  return (
                    <div key={rec.title} style={{ display:"flex", gap:14, marginBottom:12, background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:6, padding:"14px 18px" }}>
                      <div style={{ background:pc+"18", color:pc, borderRadius:4, padding:"4px 8px", fontSize:12, fontWeight:700, minWidth:30, textAlign:"center", height:"fit-content" }}>{rec.priority}</div>
                      <div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                          <span style={{ fontWeight:700, color:C.text, fontSize:14 }}>{rec.title}</span>
                          <Badge label={`Owner: ${rec.action}`} color={C.blue} pale={C.bluePale}/>
                        </div>
                        <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.6 }}>{rec.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {sec.id === "scoring" && (
              <div style={{ fontSize:13, color:C.textMid, lineHeight:1.8 }}>
                <p>The donor scoring model outputs a composite 0–100 score used to prioritize outreach, assign cultivation tracks, and trigger automated workflow actions. Scores are recomputed nightly by the Synapse Analytics ML pipeline (XGBoost classifier) and written to Cosmos DB.</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:16 }}>
                  {[
                    ["Wealth / Capacity Signal","25%","External wealth screening (DonorSearch API), LinkedIn title/org, estimated net worth bracket"],
                    ["Giving History","25%","Total lifetime giving, recency, frequency, upgrade trajectory (RFM model)"],
                    ["Engagement Score","20%","Email opens, clicks, event attendance, site visits, response rate to outreach"],
                    ["Relationship Depth","15%","Staff meeting count, board proximity, peer referral status, years in portfolio"],
                    ["Alignment Score","10%","Tag match (Solar Advocate, EJ, Climate, Africa Diaspora), org mission overlap"],
                    ["Pipeline Stage","5%","Cultivation stage multiplier — active proposal = boost; no contact in 12 months = decay"],
                  ].map(([name,wt,desc])=>(
                    <div key={name} style={{ background:C.bgPanel, borderRadius:6, padding:"12px 16px", border:`1px solid ${C.border}` }}>
                      <div style={{ fontWeight:700, color:C.text, fontSize:13, marginBottom:3 }}>{name}</div>
                      <div style={{ color:C.gold, fontWeight:700, fontSize:18, marginBottom:4 }}>{wt}</div>
                      <div style={{ fontSize:11, color:C.textMute, lineHeight:1.5 }}>{desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.goldPale, borderRadius:4, padding:"12px 16px", border:`1px solid ${C.gold}30` }}>
                  <strong>Score Thresholds:</strong> 80–100 = Major Gift Track (personal cultivation); 60–79 = Mid-Level Active Cultivation; 40–59 = Warm Nurture (email/event cadence); Below 40 = Re-engagement / Suppression review.
                </div>
              </div>
            )}

            {sec.id === "segments" && (
              <div>
                {[["MAJOR",C.green,C.greenPale,"$10,000+ lifetime | High engagement | Personal relationship",["Quarterly personal outreach from ED","Annual site visit or equivalent immersive experience","Major gift proposal cycle (18-month)","Planned giving conversation after 2nd gift","Board stewardship — annual luncheon, named recognition opportunities"]],
                  ["MID",C.blue,C.bluePale,"$1,000–$9,999 | Consistent givers | Upgrade potential",["Semi-annual personal outreach from development staff","Annual impact report + personal note","Upgrade cultivation in Q3 each year","Mid-level society / giving circle if $5K+ threshold reached","Target for peer ambassador program once relationship is strong"]],
                  ["PROSPECT",C.purple,C.purplePale,"No gift yet | Warm relationship | Cultivation in progress",["Monthly cultivation touchpoint (content, news, invitations)","Site visit or virtual program tour as primary conversion tool","Assign board sponsor for high-capacity prospects","First gift ask within 90 days of site visit","Timeline: 6–12 months from identification to first ask"]],
                  ["LAPSED",C.red,C.redPale,"Previous donor | 18+ months no gift | Re-engagement needed",["Segment by capacity: high capacity → ED personal outreach; low capacity → low-cost digital track","Email verify all lapsed records annually (data append)","Suppress after 3 failed re-engagement attempts","Year-end re-engagement email with updated impact story","Do not suppress without one personal attempt for mid+ capacity"]]
                ].map(([seg,color,pale,desc,bullets])=>(
                  <div key={seg} style={{ background:pale, border:`1px solid ${color}30`, borderRadius:6, padding:"14px 18px", marginBottom:12 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                      <Badge label={seg} color={color} pale={pale}/>
                      <span style={{ fontSize:12, color:C.textMid }}>{desc}</span>
                    </div>
                    {bullets.map(b=><div key={b} style={{ display:"flex", gap:8, marginBottom:4 }}><span style={{color,fontWeight:700}}>•</span><span style={{ fontSize:13, color:C.textMid }}>{b}</span></div>)}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      ))}
    </div>
  );
}

// ─── TAB 4: DATABASE ARCHITECTURE ────────────────────────────────────────────
function Tab4Database() {
  const { syncState, syncLog, cleanResult, runSync, runClean } = useDbSync();
  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [syncLog]);

  const isRunning = syncState === "syncing" || syncState === "cleaning";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"16px 22px" }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>About This Database Architecture</div>
        <p style={{ fontSize:13, color:C.textMid, lineHeight:1.7, margin:0 }}>
          This donor management system is built on a <strong>Simulated NoSQL Donor Management Database</strong> for SolarCook International. The production architecture uses <strong>Azure Cosmos DB (Core SQL API)</strong> as the primary document store, with <strong>Azure Synapse Analytics</strong> providing analytical query capability via Synapse Link (HTAP), and <strong>Azure Data Factory</strong> orchestrating all ETL/ELT pipelines. Historical records are stored in <strong>Azure Data Lake Gen2</strong> (Parquet format), with <strong>Power BI Premium</strong> serving executive and board dashboards. A legacy <strong>MySQL</strong> instance (pre-2020 donor records) is being migrated via ADF pipeline.
        </p>
      </div>

      {/* Why NoSQL */}
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif", marginBottom:14 }}>Why NoSQL (Document Model) for Donor CRM?</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14 }}>
          {[
            { icon:"📄", title:"Flexible Schema", color:C.green, pale:C.greenPale, desc:"Donor records vary significantly in completeness — some have 10 outreach steps, others have 1. A relational model requires NULL columns or complex join tables. Cosmos DB stores each donor as a self-contained JSON document with no schema enforcement, accommodating growth organically." },
            { icon:"⚡", title:"Event-Sourced History", color:C.blue, pale:C.bluePale, desc:"Every outreach interaction is embedded directly in the donor document as an array element — no join needed. This allows sub-millisecond reads of complete contact history, critical for staff calling up a donor record mid-meeting on a mobile device." },
            { icon:"🌐", title:"Global Multi-Region Replication", color:C.purple, pale:C.purplePale, desc:"Cosmos DB replicates across East US, West Europe, and West US 2 automatically. Staff in Nairobi, London, and San Francisco all read from their nearest replica. A relational primary-replica setup would require manual sharding and replication configuration." },
            { icon:"📊", title:"Cosmos DB + Synapse Link (HTAP)", color:C.teal, pale:C.tealPale, desc:"Synapse Link creates a zero-ETL analytical mirror of the Cosmos DB OLTP store. Analytical queries (e.g., cohort retention analysis, campaign ROI) run in Synapse without touching the CRM throughput — solving the classic OLTP vs. OLAP tension without a separate ETL pipeline for analytics." },
            { icon:"🔒", title:"Row-Level Partition Security", color:C.gold, pale:C.goldPale, desc:"Partition key = donor segment. Staff with mid-level access see only their partition. Board members see only anonymized aggregate views. This is easier to enforce per-partition in Cosmos DB than row-level security in relational systems for semi-structured data." },
            { icon:"📈", title:"Auto-Scale Throughput", color:C.orange, pale:C.orangePale, desc:"During year-end campaigns, query volume spikes 10–15×. Cosmos DB Autoscale adjusts RU/s provisioning automatically from 400 to 4,000 RU/s without downtime or DBA intervention. A relational RDBMS would require manual capacity planning and read replica promotion." },
          ].map(item=>(
            <div key={item.title} style={{ background:item.pale, border:`1px solid ${item.color}30`, borderRadius:6, padding:"14px 18px" }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{item.icon}</div>
              <div style={{ fontWeight:700, color:item.color, fontSize:14, marginBottom:6 }}>{item.title}</div>
              <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture stack */}
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif", marginBottom:14 }}>Azure Data Platform Stack</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {Object.entries(DB_ARCHITECTURE).map(([key, item])=>(
            <div key={key} style={{ display:"flex", gap:14, padding:"12px 16px", background:C.bgPanel, borderRadius:4, border:`1px solid ${C.border}`, alignItems:"flex-start" }}>
              <div style={{ minWidth:220 }}>
                <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{item.name}</div>
                {item.throughputRU && <div style={{ fontSize:11, color:C.textMute }}>Throughput: {item.throughputRU.toLocaleString()} RU/s</div>}
                {item.containers && <div style={{ fontSize:11, color:C.textMute }}>Containers: {item.containers.join(", ")}</div>}
                {item.replication && <div style={{ fontSize:11, color:C.textMute }}>Replication: {item.replication}</div>}
              </div>
              <div style={{ flex:1, fontSize:13, color:C.textMid, lineHeight:1.5 }}>{item.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ETL Pipeline */}
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif" }}>ADF Pipeline: {ETL_PIPELINE.name}</div>
            <div style={{ fontSize:12, color:C.textMute }}>Last run: {ETL_PIPELINE.lastRun} · Next: {ETL_PIPELINE.nextScheduled}</div>
          </div>
          <Badge label={`Status: ${ETL_PIPELINE.status}`} color={C.green} pale={C.greenPale}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
          {ETL_PIPELINE.stages.map((stage,i)=>(
            <div key={stage.name} style={{ display:"flex", gap:12, padding:"10px 14px", background:C.bgPanel, borderRadius:4, border:`1px solid ${C.border}`, alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:C.greenPale, border:`2px solid ${C.green}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.green, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{stage.name}</div>
                <div style={{ fontSize:11, color:C.textMute }}>{stage.tool}</div>
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <Badge label={stage.type} color={C.blue} pale={C.bluePale}/>
                <span style={{ fontSize:12, color:C.textMid }}>{stage.rowsProcessed.toLocaleString()} rows · {stage.latencyMs}ms</span>
                {stage.rowsDropped && <span style={{ fontSize:11, color:C.orange }}>⚠ {stage.rowsDropped} dropped</span>}
                {stage.dupesMerged && <span style={{ fontSize:11, color:C.gold }}>🔗 {stage.dupesMerged} merged</span>}
                <Badge label="✓ OK" color={C.green} pale={C.greenPale}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:C.textMid }}><strong>Data Quality Score:</strong> <span style={{ color:C.green, fontWeight:700 }}>{ETL_PIPELINE.dataQualityScore}%</span></div>
      </div>

      {/* Simulate controls */}
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif", marginBottom:6 }}>Database Operations Console</div>
        <div style={{ fontSize:12, color:C.textMute, marginBottom:16 }}>Simulated operations — demonstrates Azure Data Factory pipeline execution and Synapse Analytics data quality workflow.</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
          <button onClick={runSync} disabled={isRunning}
            style={{ background: isRunning ? C.border : C.green, color: isRunning ? C.textMute : "white", border:"none", borderRadius:4, padding:"10px 22px", fontSize:13, fontWeight:700, cursor:isRunning?"not-allowed":"pointer" }}>
            {syncState==="syncing" ? "⟳ Syncing..." : "↻ Sync with Cosmos DB"}
          </button>
          <button onClick={runClean} disabled={isRunning}
            style={{ background: isRunning ? C.border : C.blue, color: isRunning ? C.textMute : "white", border:"none", borderRadius:4, padding:"10px 22px", fontSize:13, fontWeight:700, cursor:isRunning?"not-allowed":"pointer" }}>
            {syncState==="cleaning" ? "⟳ Cleaning..." : "🧹 Run Data Cleanse Pipeline"}
          </button>
        </div>

        {/* Console log */}
        {syncLog.length > 0 && (
          <div ref={logRef} style={{ background:C.bgDark, borderRadius:4, padding:"14px 18px", fontFamily:"'Courier New',monospace", fontSize:12, color:"#a8d8a8", lineHeight:1.8, maxHeight:220, overflowY:"auto" }}>
            {syncLog.map((line,i)=>(
              <div key={i} style={{ color: line.startsWith("✓") ? "#68d391" : line.startsWith("⚠") ? "#f6d860" : "#a8d8a8" }}>{line}</div>
            ))}
          </div>
        )}

        {/* Clean result */}
        {(syncState === "done" || syncState === "cleanDone") && cleanResult && (
          <div style={{ marginTop:14, background:C.greenPale, border:`1px solid ${C.green}30`, borderRadius:4, padding:"12px 16px" }}>
            <div style={{ fontWeight:700, color:C.green, marginBottom:8 }}>✓ Data Cleaning Complete</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
              {[["Emails Fixed",cleanResult.emailsFixed,C.teal],["Dupes Removed",cleanResult.dupesRemoved,C.orange],["Nulls Filled",cleanResult.nullsFilled,C.gold],["Total Changes",cleanResult.totalChanged,C.blue],["Before Score",`${cleanResult.beforeScore}%`,C.orange],["After Score",`${cleanResult.afterScore}%`,C.green]].map(([k,v,c])=>(
                <div key={k} style={{ background:"white", borderRadius:4, padding:"8px 12px" }}>
                  <div style={{ fontSize:10, color:C.textMute, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {syncState === "done" && !cleanResult && (
          <div style={{ marginTop:14, background:C.greenPale, border:`1px solid ${C.green}30`, borderRadius:4, padding:"12px 16px", fontSize:13, color:C.green, fontWeight:700 }}>
            ✓ Cosmos DB sync complete — 1,231 documents verified. ADF pipeline SolarCRM-ETL-v2 healthy. Power BI refresh queued.
          </div>
        )}

        {/* NoSQL vs SQL comparison */}
        <div style={{ marginTop:20, border:`1px solid ${C.border}`, borderRadius:4, overflow:"hidden" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:0.5, padding:"10px 16px", background:C.bgPanel, borderBottom:`1px solid ${C.border}` }}>NoSQL (Cosmos DB) vs. Relational (SQL Server / MySQL) — CRM Trade-offs</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:C.bgPanel }}>
                  {["Dimension","Azure Cosmos DB (NoSQL)","Azure SQL / MySQL (Relational)","Winner"].map(h=>(
                    <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textMid, borderBottom:`2px solid ${C.borderDark}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Donor Record Nesting","Full gift history, notes, interactions in one doc read","Separate normalized tables — 4+ JOINs to reconstruct","NoSQL"],
                  ["Real-Time Write Throughput","RU burst provisioning handles campaign/event spikes","Connection pool contention under high write load","NoSQL"],
                  ["Multi-Region Active-Active","Built-in geo-redundancy, automatic failover, <10ms writes","Manual replication configuration, failover scripting required","NoSQL"],
                  ["Schema Flexibility","Document model — arbitrary nested fields per donor","Fixed table schema — ALTER TABLE required for new fields","NoSQL"],
                  ["Contact History Query","Single document read — O(1) by partition key","4-table JOIN — O(n log n) across normalized tables","NoSQL"],
                  ["Global Replication","Native multi-master across East US, West Europe, West US 2","Manual replication setup with read replica lag","NoSQL"],
                  ["Segment-Level Analytics","Zero-ETL via Synapse Link HTAP on live donor data","Extract-load-transform pipeline required before analysis","NoSQL"],
                  ["Schema Governance","TTL auto-expiry, change feed audit trail, organic field growth","Rigid constraints — referential integrity blocks organic record growth","NoSQL"],
                  ["Reporting / BI","Power BI via Synapse Link — zero-copy analytics, no movement","DirectQuery adds latency on large, frequently-updated datasets","NoSQL"],
                  ["Donor Dedup (Fuzzy)","Spark Pool fuzzy-match handles messy NGO data gracefully","T-SQL MERGE requires exact-match keys — brittle on real-world donor data","NoSQL"],
                  ["Auto-Scale","Native Autoscale RU/s — scales to zero when idle","Manual scaling / read replicas — minimum vCore billing","NoSQL"],
                  ["ACID Transactions","Per-document only — batch multi-doc writes need coordination","Full multi-row ACID transactions, mature savepoint support","SQL"],
                ].map(([dim,cosmos,sql,winner],i)=>(
                  <tr key={dim} style={{ background:i%2===0?"white":C.bgPanel, borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"9px 14px", fontWeight:600, color:C.text }}>{dim}</td>
                    <td style={{ padding:"9px 14px", color:winner==="NoSQL"?C.green:C.textMid, fontWeight:winner==="NoSQL"?700:400 }}>{cosmos}</td>
                    <td style={{ padding:"9px 14px", color:winner==="SQL"?C.blue:C.textMid, fontWeight:winner==="SQL"||winner==="SQL (slight)"?700:400 }}>{sql}</td>
                    <td style={{ padding:"9px 14px" }}><Badge label={winner} color={winner==="NoSQL"?C.green:winner==="SQL"||winner==="SQL (slight)"?C.blue:C.teal} pale={winner==="NoSQL"?C.greenPale:C.bluePale}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 5: METHODOLOGY / DATA MODEL ─────────────────────────────────────────
function Tab5DataModel() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif", marginBottom:12 }}>Cosmos DB Document Model — Donor Record Schema</div>
        <p style={{ fontSize:13, color:C.textMid, lineHeight:1.7, marginBottom:16 }}>Each donor is a single self-contained JSON document. Nested arrays replace join tables. This schema supports all CRM operations in a single read without multi-table JOINs.</p>
        <pre style={{ background:C.bgDark, borderRadius:6, padding:"18px 22px", fontSize:12, color:"#c8e6c8", overflowX:"auto", lineHeight:1.8, fontFamily:"'Courier New',monospace" }}>{`{
  "_id": "donor_001",                    // Cosmos DB document ID
  "_partition": "segment_major",         // Partition key — shard strategy
  "_ts": 1747180000,                     // Cosmos internal timestamp (Unix)
  "_etag": "donor_001-1747180000",       // Optimistic concurrency token

  // Core identity
  "name": "Margaret Osei-Bonsu",
  "email": "m.osei-bonsu@sunriseff.org",
  "segment": "MAJOR",                    // MAJOR | MID | PROSPECT | LAPSED
  "status": "ACTIVE",                    // ACTIVE | WARM | COLD | COLD_PROSPECT

  // Scoring (written by Synapse ML pipeline nightly)
  "score": 94,                           // Composite 0–100 donor score
  "likeliness": 92,                      // Gift probability (0–100)
  "capacity": 75000,                     // Estimated giving capacity ($)

  // Giving history
  "totalGiven": 42000,
  "lastGift": 12000,
  "lastGiftDate": "2024-11-12",
  "avgGiftSize": 10500,

  // Engagement (updated by email platform via ADF event trigger)
  "emailOpen": 0.88,
  "emailClick": 0.62,
  "eventAttend": 3,

  // Embedded contact history — no JOIN required
  "outreachSteps": [
    {
      "date": "2024-02-10",
      "type": "In-Person Meeting",
      "by": "James Okafor",
      "result": "Positive — interested in solar school program",
      "responded": true
    }
    // ... additional steps embedded in same document
  ],

  // Embedded next actions
  "nextActions": [
    "Submit FY26 major gift proposal ($20K) by September 2025"
  ],

  // Taxonomy
  "tags": ["Solar Advocate", "Board Connection", "Annual Giver"],
  "acquisitionChannel": "Board Referral",
  "firstContactDate": "2023-09-15",

  // Cosmos DB metadata
  "cosmosCollection": "donors",
  "container": "crm-prod"
}`}</pre>
      </div>

      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif", marginBottom:12 }}>T-SQL Analytical Queries (Synapse Analytics)</div>
        <p style={{ fontSize:13, color:C.textMid, lineHeight:1.7, marginBottom:16 }}>Synapse Link mirrors Cosmos DB to an analytical columnar store, enabling complex T-SQL analytics without OLTP impact. Representative queries:</p>
        <pre style={{ background:C.bgDark, borderRadius:6, padding:"18px 22px", fontSize:12, color:"#c8d8f8", overflowX:"auto", lineHeight:1.8, fontFamily:"'Courier New',monospace" }}>{`-- Donor cohort retention by acquisition channel
WITH cohort AS (
  SELECT
    acquisitionChannel,
    COUNT(*) AS total_donors,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
    AVG(CAST(totalGiven AS FLOAT)) AS avg_lifetime_value,
    SUM(totalGiven) AS channel_revenue
  FROM OPENROWSET(
    'CosmosDB', N'account=solarcrm-prod',
    donors WITH (segment VARCHAR(20), status VARCHAR(20),
                 acquisitionChannel VARCHAR(100), totalGiven INT)
  ) AS donors
  GROUP BY acquisitionChannel
)
SELECT
  acquisitionChannel,
  total_donors,
  active,
  ROUND(CAST(active AS FLOAT) / total_donors * 100, 1) AS retention_pct,
  FORMAT(avg_lifetime_value, 'C') AS avg_ltv,
  FORMAT(channel_revenue, 'C') AS total_revenue
FROM cohort
ORDER BY channel_revenue DESC;

-- Lapsed donor re-engagement priority scoring
SELECT TOP 20
  name, segment, score, capacity, lastGiftDate,
  DATEDIFF(day, TRY_CAST(lastGiftDate AS DATE), GETDATE()) AS days_lapsed,
  CASE
    WHEN capacity > 20000 AND score > 40 THEN 'P1 — ED Personal Outreach'
    WHEN capacity BETWEEN 5000 AND 20000  THEN 'P2 — Staff Call'
    ELSE                                       'P3 — Digital Re-engagement'
  END AS reengagement_priority
FROM OPENROWSET('CosmosDB', N'account=solarcrm-prod',
  donors WITH (name VARCHAR(100), segment VARCHAR(20), score INT,
               capacity INT, lastGiftDate VARCHAR(20), status VARCHAR(20))
) AS d
WHERE status = 'COLD'
ORDER BY capacity DESC, score DESC;`}</pre>
      </div>

      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif", marginBottom:12 }}>Data Lake Gen2 — Storage Layers</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { zone:"Bronze — Raw Ingest", color:C.orange, pale:C.orangePale, path:"abfss://bronze@solarcrmlake.dfs.core.windows.net/donors/", format:"JSON (raw Cosmos DB export, ADF Copy Activity)", desc:"Immutable landing zone. All raw donor records and event logs as-received. Never overwritten — append-only. Retention: 7 years." },
            { zone:"Silver — Validated & Cleaned", color:C.gold, pale:C.goldPale, path:"abfss://silver@solarcrmlake.dfs.core.windows.net/donors/", format:"Parquet (columnar, Snappy compressed)", desc:"Cleaned, deduplicated, schema-validated records. T-SQL VALIDATE procedure applied. NULL fills documented. Source for all BI and ML." },
            { zone:"Gold — Enriched & Scored", color:C.green, pale:C.greenPale, path:"abfss://gold@solarcrmlake.dfs.core.windows.net/donors_scored/", format:"Parquet + Delta Lake", desc:"ML-scored donor records with segment labels, composite scores, and predictive likeliness. Source for Power BI semantic model and Cosmos DB write-back." },
            { zone:"Archive — Cold Storage", color:C.blue, pale:C.bluePale, path:"abfss://archive@solarcrmlake.dfs.core.windows.net/history/", format:"Parquet (lifecycle-tiered to Cool tier after 90 days)", desc:"Pre-2020 legacy donor records from MySQL migration. Historical gift transactions. Email campaign archives. Cost-optimized storage tier." },
          ].map(layer=>(
            <div key={layer.zone} style={{ background:layer.pale, border:`1px solid ${layer.color}30`, borderRadius:6, padding:"14px 18px" }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                <Badge label={layer.zone} color={layer.color} pale={layer.pale}/>
                <code style={{ fontSize:11, color:C.textMut, background:"rgba(0,0,0,0.06)", padding:"2px 8px", borderRadius:3 }}>{layer.path}</code>
                <span style={{ fontSize:11, color:C.textMute }}>{layer.format}</span>
              </div>
              <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.5 }}>{layer.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:C.bgWhite, border:`1px solid ${C.border}`, borderRadius:6, padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Georgia',serif", marginBottom:12 }}>Power BI — Report Architecture</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
          {[
            { report:"Executive Dashboard", refresh:"Daily 5 AM UTC", audience:"ED, Board", desc:"KPIs: total raised, major donor count, pipeline value, year-over-year growth. Drillthrough to campaign performance.", source:"Gold layer (Data Lake Gen2)" },
            { report:"Development Staff CRM View", refresh:"Every 4 hours", audience:"James Okafor, Amara Diallo", desc:"Full donor portfolio, cultivation pipeline, next actions due, outreach calendar, proposal tracker.", source:"Cosmos DB via Synapse Link (HTAP)" },
            { report:"Campaign Analytics", refresh:"Hourly (active campaigns)", audience:"Development + Comms", desc:"Email open rates, click-through, conversion by segment, A/B test results, ROI by channel.", source:"Email platform API → ADF → Silver layer" },
            { report:"Board Quarterly Report", refresh:"Manual (quarterly)", audience:"Board of Directors", desc:"Anonymized pipeline health, fundraising progress vs. goal, donor retention trends. Exported to PDF via Power BI service.", source:"Gold layer aggregate views" },
          ].map(r=>(
            <div key={r.report} style={{ background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:6, padding:"14px 16px" }}>
              <div style={{ fontWeight:700, color:C.text, fontSize:13, marginBottom:4 }}>{r.report}</div>
              <div style={{ fontSize:11, color:C.blue, marginBottom:3 }}>Refresh: {r.refresh}</div>
              <div style={{ fontSize:11, color:C.textMute, marginBottom:6 }}>Audience: {r.audience}</div>
              <p style={{ margin:"0 0 6px", fontSize:12, color:C.textMid, lineHeight:1.5 }}>{r.desc}</p>
              <div style={{ fontSize:11, color:C.teal }}>Source: {r.source}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function SolarDonorIntelligence() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label:"Donor Dashboard", sub:"Segments · Funnel · Campaigns" },
    { label:"Donor Detail", sub:"Contact History · Outreach · Email Sim" },
    { label:"Strategy Report", sub:"What Worked · Drop-offs · Improvements" },
    { label:"Database Architecture", sub:"NoSQL · Azure · ETL · Sync Console" },
    { label:"Data Model & Queries", sub:"Schema · T-SQL · Data Lake · Power BI" },
  ];

  return (
    <div style={{ width:"100%", maxWidth:1260, minWidth:320, margin:"0 auto", background:C.bg, color:C.text, fontFamily:"'Georgia', 'Times New Roman', serif", minHeight:"100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#f0f2ec; }
        ::-webkit-scrollbar-thumb { background:#c0c8b8; border-radius:3px; }
        button, input, select { font-family: 'Georgia', serif; }
        @media (max-width: 700px) {
          .tab-scroll { overflow-x: auto; white-space: nowrap; }
          .main-pad { padding: 14px 12px !important; }
          .header-row { flex-direction: column !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background:C.bgDark, padding:"24px 32px", borderBottom:`3px solid ${C.gold}` }}>
        <div className="header-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:14 }}>
          <div>
            <div style={{ fontSize:10, color:C.goldLight, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Simulated NoSQL Donor Management Database</div>
            <h1 style={{ margin:0, fontSize:"clamp(18px,3.5vw,26px)", color:"#fff", fontWeight:700, lineHeight:1.2 }}>NoSQL NGO Donor Intelligence System</h1>
            <div style={{ color:"#a0b898", fontSize:13, marginTop:6 }}>SolarCook International · Azure Cosmos DB + Synapse Analytics · Fundraising CRM</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, color:"#7a9070", textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>Compiled by</div>
            <div style={{ color:C.goldLight, fontWeight:700, fontSize:14 }}>Lancelot Napier-Kane</div>
            <div style={{ fontSize:11, color:"#6a8060", marginTop:2 }}>Sample Data · Azure Architecture Simulated</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[["12 Donor Records","#fff"],["$124,100 Tracked Giving","#e8c84a"],["5 Azure Services Simulated","#7ec8c8"],["NoSQL + T-SQL + ETL","#b8a8e0"]].map(([l,c])=>(
            <span key={l} style={{ fontSize:12, color:c, background:"rgba(255,255,255,0.07)", padding:"4px 12px", borderRadius:3, border:"1px solid rgba(255,255,255,0.12)" }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-scroll" style={{ borderBottom:`1px solid ${C.border}`, background:"white", padding:"0 24px" }}>
        <div style={{ display:"flex" }}>
          {tabs.map((tab,i)=>(
            <button key={i} onClick={()=>setActiveTab(i)}
              style={{ background:"none", border:"none", borderBottom:`3px solid ${activeTab===i?C.gold:"transparent"}`, color:activeTab===i?C.gold:C.textMute, padding:"12px 16px", cursor:"pointer", textAlign:"left", fontWeight:activeTab===i?700:400, whiteSpace:"nowrap", transition:"color 0.15s" }}>
              <div style={{ fontSize:13 }}>{tab.label}</div>
              <div style={{ fontSize:10, color:activeTab===i?C.gold:C.textMute, marginTop:2 }}>{tab.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="main-pad" style={{ padding:"24px 28px" }}>
        {activeTab===0 && <Tab1Dashboard/>}
        {activeTab===1 && <Tab2DonorDetail/>}
        {activeTab===2 && <Tab3Strategy/>}
        {activeTab===3 && <Tab4Database/>}
        {activeTab===4 && <Tab5DataModel/>}
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${C.border}`, padding:"16px 28px", background:C.bgPanel }}>
        <div style={{ fontSize:11, color:C.textMute, lineHeight:1.8 }}>
          <strong style={{ color:C.textMid }}>Data:</strong> All donor names, organizations, contact details, and financial figures are entirely fictional sample data for portfolio demonstration purposes only. No real donors or organizations are represented.&nbsp;·&nbsp;
          <strong style={{ color:C.textMid }}>Architecture:</strong> Azure Cosmos DB, Synapse Analytics, Data Factory, Data Lake Gen2, Blob Storage, and Power BI integrations are simulated for demonstration — no live Azure connection exists in this file.&nbsp;·&nbsp;
          <strong style={{ color:C.textMid }}>Best Practices:</strong> Donor cultivation methodology, scoring model structure, T-SQL queries, and NoSQL schema design reflect current nonprofit fundraising and data engineering practices.&nbsp;·&nbsp;
          <strong>Compiled by Lancelot Napier-Kane</strong>
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
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), Azure Cosmos DB (NoSQL — Core API, JSON document store, simulated), Azure Blob Storage (cold-tier archival, simulated), Azure SQL Database (relational reporting layer, simulated), Azure Data Factory (ELT pipeline architecture), Node.js (API layer), Python (Pandas, Azure SDK), Power BI DirectQuery on Cosmos DB via Azure Synapse Link
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> Hybrid NoSQL/BLOB architecture design: hot donor profiles stored in simulated Cosmos DB (partition key: donor_region), cold transaction archives in simulated Azure Blob (Parquet, hierarchical namespace), relational aggregates in Azure SQL for Power BI reporting layer; donor RFM segmentation (Recency, Frequency, Monetary) computed in Python; Cosmos DB partition key design optimized for read-heavy geographic query pattern; Azure Data Factory pipeline simulating Kaggle ingestion → Blob landing zone → Cosmos DB upsert → SQL reporting mart; document schema designed per Cosmos DB Core API JSON conventions
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> Kaggle NGO donor transaction dataset (public); Azure Cosmos DB technical architecture documentation; Azure Blob Storage data lake design patterns; Microsoft nonprofit cloud architecture guides; FinOps Foundation cloud cost allocation standards; donor transaction data sourced from Kaggle NGO dataset, adapted for NoSQL document store simulation
        </p>
      </div>
    </div>
  );
}
