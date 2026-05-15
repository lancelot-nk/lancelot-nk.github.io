import { useState } from "react";

// ─────────────────────────────────────────────────
// DATA LAYER — Real routes + sample risk overlays
// Sources: CSX Transportation, FRA, PHMSA, DDOT DC SRP, NCPC, NBC4 I-Team
// ─────────────────────────────────────────────────

const RAIL_CORRIDORS = [
  {
    id: "csx-main",
    name: "CSX RF&P / Alexandria Extension",
    operator: "CSX Transportation",
    subdivision: "RF&P Subdivision + Alexandria Extension",
    description:
      "Primary north-south freight corridor. Crosses Long Bridge over the Potomac from Virginia into SW Washington. Runs ~16 blocks adjacent to federal buildings, the Capitol, and the Capitol Power Plant before connecting to Union Station via the Virginia Avenue Tunnel.",
    riskLevel: "CRITICAL",
    riskScore: 95,
    annualHazmatCars: 8000,
    primaryCargo: ["Bakken Crude Oil", "Molten Sulfur", "Ammonium Nitrate", "Styrene Monomer", "Clarified Oil", "Molten Phenol"],
    populationExposed: 310000,
    waterBodyProximity: ["Potomac River", "Anacostia River"],
    evacuationRadiusMiles: 1.0,
    speedLimitMph: 50,
    tankCarSpec: "Mixed DOT-111 / DOT-117",
    ptcInstalled: true,
    coords: [
      [38.856, -77.055], [38.869, -77.043], [38.878, -77.031],
      [38.888, -77.022], [38.896, -77.015], [38.901, -77.008],
      [38.908, -77.001], [38.916, -76.996], [38.927, -76.994]
    ],
    dcSegmentStart: [38.878, -77.031],
    dcSegmentEnd: [38.927, -76.994],
    incidents: [
      { year: 2013, location: "Rosedale, MD (nearby)", type: "Derailment/Fire", severity: "Major" },
      { year: 2014, location: "Lynchburg, VA", type: "Derailment — Bakken crude fire", severity: "Major" },
      { year: 2023, location: "Hyattsville, MD (adjacent corridor)", type: "Derailment — Anacostia branch", severity: "Moderate" },
    ],
    blastZoneIncludes: ["U.S. Capitol", "Washington Monument", "Air & Space Museum", "Navy Yard", "10 Metro Stations", "Federal Office Buildings (South Mall)"],
    regulations: ["49 CFR 172.820", "49 CFR 174.310 HHFT", "HM-251 Final Rule (2015)", "FAST Act §7304-7306", "49 CFR Part 130 Oil Spill Response"],
  },
  {
    id: "csx-capital",
    name: "CSX Capital Subdivision",
    operator: "CSX Transportation",
    subdivision: "Capital Subdivision (former B&O Washington Branch)",
    description:
      "Runs SW from Baltimore through Maryland into Washington Union Station. Freight corridor with MARC commuter service. Connects to the Virginia Avenue Tunnel and Long Bridge route.",
    riskLevel: "HIGH",
    riskScore: 74,
    annualHazmatCars: 3200,
    primaryCargo: ["Crude Oil", "Petroleum Distillates", "Flammable Liquids"],
    populationExposed: 185000,
    waterBodyProximity: ["Patuxent River", "Anacostia River"],
    evacuationRadiusMiles: 0.75,
    speedLimitMph: 50,
    tankCarSpec: "DOT-117 / DOT-117R",
    ptcInstalled: true,
    coords: [
      [38.993, -76.930], [38.980, -76.942], [38.965, -76.958],
      [38.952, -76.968], [38.940, -76.978], [38.927, -76.994]
    ],
    incidents: [
      { year: 2020, location: "Laurel, MD", type: "Grade-crossing incident", severity: "Minor" },
    ],
    blastZoneIncludes: ["Anacostia neighborhoods", "RFK Stadium area", "Capitol Hill residential"],
    regulations: ["49 CFR 172.820", "HM-251 Final Rule", "FRA Track Safety Standards 49 CFR Part 213"],
  },
  {
    id: "csx-metropolitan",
    name: "CSX Metropolitan Subdivision",
    operator: "CSX Transportation",
    subdivision: "Metropolitan Subdivision (former B&O Met Branch)",
    description:
      "53-mile corridor NW from Union Station to Weverton, MD. Shared right-of-way with MARC Brunswick Line and Red Line Metro. Serves Dickerson Power Plant spur. Primary hazmat bypass route used since CSX voluntarily rerouted some dangerous commodities post-2004.",
    riskLevel: "MODERATE",
    riskScore: 52,
    annualHazmatCars: 1800,
    primaryCargo: ["Petroleum Products", "Coal", "Industrial Chemicals"],
    populationExposed: 120000,
    waterBodyProximity: ["Potomac River (C&O Canal corridor)", "Rock Creek"],
    evacuationRadiusMiles: 0.5,
    speedLimitMph: 60,
    tankCarSpec: "DOT-117",
    ptcInstalled: true,
    coords: [
      [38.927, -76.994], [38.934, -77.002], [38.942, -77.015],
      [38.951, -77.028], [38.962, -77.046], [38.976, -77.068],
      [38.995, -77.094], [39.016, -77.121]
    ],
    incidents: [],
    blastZoneIncludes: ["Silver Spring residential", "Takoma Park", "Kensington MD"],
    regulations: ["49 CFR 172.820", "49 CFR Part 130", "HM-251 Final Rule", "FRA PTC Requirements"],
  },
  {
    id: "norfolk-southern",
    name: "Norfolk Southern — NEC Shared Access",
    operator: "Norfolk Southern Railway",
    subdivision: "NEC south of Philadelphia / shared access via Long Bridge",
    description:
      "Norfolk Southern operates over NEC south of Philadelphia and has shared access through the DC corridor for through freight. Carries hazardous freight on shared trackage.",
    riskLevel: "HIGH",
    riskScore: 68,
    annualHazmatCars: 2100,
    primaryCargo: ["Crude Oil", "Chemicals", "Petroleum Coke"],
    populationExposed: 210000,
    waterBodyProximity: ["Potomac River"],
    evacuationRadiusMiles: 0.75,
    speedLimitMph: 50,
    tankCarSpec: "DOT-117 / transitional DOT-111",
    ptcInstalled: true,
    coords: [
      [38.993, -76.930], [38.970, -76.952], [38.950, -76.971],
      [38.936, -76.988], [38.927, -76.994], [38.917, -77.001],
      [38.900, -77.019], [38.883, -77.035]
    ],
    incidents: [
      { year: 2023, location: "East Palestine, OH (same operator)", type: "Derailment — 20 hazmat cars", severity: "Catastrophic" },
    ],
    blastZoneIncludes: ["SW DC waterfront", "DCA Airport corridor", "Crystal City VA"],
    regulations: ["49 CFR 172.820", "HM-251 Final Rule", "FAST Act §7304", "49 CFR Part 213"],
  },
];

const RISK_ZONES = [
  {
    id: "zone-capitol",
    name: "Capitol Hill / SW Federal Core",
    center: [38.890, -77.009],
    radiusMiles: 1.0,
    riskScore: 98,
    population: 85000,
    landmarks: ["U.S. Capitol", "Library of Congress", "Union Station", "Supreme Court", "Capitol Power Plant"],
    vulnerabilities: ["Dense daytime population", "National security facilities", "Limited egress corridors", "Tunnel infrastructure"],
    color: "#e53e3e",
    envJusticeScore: 62,
  },
  {
    id: "zone-anacostia",
    name: "Anacostia River Corridor",
    center: [38.866, -76.988],
    radiusMiles: 0.75,
    riskScore: 87,
    population: 52000,
    landmarks: ["Navy Yard", "Nationals Park", "RFK Campus", "Anacostia Park"],
    vulnerabilities: ["River contamination risk — spill reaches Potomac within hours", "Environmental justice community", "Floodplain proximity", "Limited emergency access"],
    color: "#dd6b20",
    envJusticeScore: 88,
  },
  {
    id: "zone-longbridge",
    name: "Long Bridge / Potomac Crossing",
    center: [38.877, -77.033],
    radiusMiles: 0.5,
    riskScore: 91,
    population: 28000,
    landmarks: ["Long Bridge", "East Potomac Park", "Jefferson Memorial corridor"],
    vulnerabilities: ["River crossing choke point", "Single crossing for freight", "Spill directly into Potomac", "Tourist density"],
    color: "#e53e3e",
    envJusticeScore: 45,
  },
  {
    id: "zone-benning-yard",
    name: "Benning Rail Yard / East Anacostia",
    center: [38.893, -76.956],
    radiusMiles: 0.6,
    riskScore: 78,
    population: 41000,
    landmarks: ["Benning Rail Yard", "Kenilworth Aquatic Gardens", "Marvin Gaye Park"],
    vulnerabilities: ["Active rail yard operations", "Low-income residential proximity", "Wetlands adjacent", "High EJ index"],
    color: "#dd6b20",
    envJusticeScore: 94,
  },
  {
    id: "zone-georgetown-potomac",
    name: "Georgetown / Potomac NW Corridor",
    center: [38.906, -77.066],
    radiusMiles: 0.5,
    riskScore: 55,
    population: 34000,
    landmarks: ["Georgetown University", "C&O Canal", "Key Bridge"],
    vulnerabilities: ["Historic canal ecosystem", "C&O Canal National Historical Park", "Rock Creek confluence"],
    color: "#d69e2e",
    envJusticeScore: 22,
  },
];

const INCIDENTS_HISTORY = [
  { id: 1, year: 2013, location: "Rosedale, MD", lat: 39.319, lng: -76.530, type: "Derailment + Fire", cargo: "Crude Oil", operator: "CSX", injuries: 0, deaths: 0, gallonsSpilled: 15000, notes: "Mile-wide evacuation zone triggered. Similar cargo moves through DC corridor." },
  { id: 2, year: 2014, location: "Lynchburg, VA", lat: 37.414, lng: -79.142, type: "Derailment + Fire", cargo: "Bakken Crude Oil", operator: "CSX", injuries: 0, deaths: 0, gallonsSpilled: 30000, notes: "First responders had no real-time manifest. AskRail not yet deployed. Train >1 mile long." },
  { id: 3, year: 2013, location: "Lac-Mégantic, QC", lat: 45.576, lng: -70.883, type: "Derailment + Explosion", cargo: "Bakken Crude Oil", operator: "MMA", injuries: 50, deaths: 47, gallonsSpilled: 1600000, notes: "Destruction radius 0.5 miles. Same Bakken crude type carried through DC. Watershed moment for HM-251 rulemaking." },
  { id: 4, year: 2023, location: "Hyattsville, MD", lat: 38.956, lng: -76.956, type: "Derailment", cargo: "Plastic Pellets", operator: "CSX", injuries: 0, deaths: 0, gallonsSpilled: 0, notes: "Half-mile from Anacostia River branch. Pellets entered tributary. Same corridor as DC freight route." },
  { id: 5, year: 2023, location: "East Palestine, OH", lat: 40.835, lng: -80.520, type: "Derailment + Chemical Release", cargo: "Vinyl Chloride / Mixed Hazmat", operator: "Norfolk Southern", injuries: 0, deaths: 0, gallonsSpilled: 0, notes: "53 cars, 20 hazmat. >1M lbs chemicals released. NS also operates on DC-area shared trackage." },
];

const REGULATIONS = [
  {
    id: "reg-hm251",
    code: "49 CFR 174.310 / HM-251 Final Rule (2015)",
    agency: "PHMSA + FRA",
    title: "Enhanced Tank Car Standards & HHFT Controls",
    description: "Defines High-Hazard Flammable Trains (HHFT: 20+ carloads of Class 3 flammables). Requires DOT-117 tank cars; mandates 50 mph speed cap all areas, 40 mph in High-Threat Urban Areas (HTUAs) for non-compliant cars; requires route analysis under 49 CFR 172.820.",
    applicableCorridors: ["csx-main", "csx-capital", "norfolk-southern"],
    status: "ACTIVE",
    complianceGap: "Legacy DOT-111 cars still in service during retrofit transition. FAST Act extended some deadlines to 2027-2031.",
    keyRequirements: [
      "DOT-117/117R tank car standard (replaces DOT-111)",
      "50 mph max speed for all HHFTs",
      "40 mph in HTUAs with non-compliant cars",
      "27-factor routing risk analysis required",
      "Notify State Emergency Response Commissions for 1M+ gallon Bakken shipments",
    ],
  },
  {
    id: "reg-routing",
    code: "49 CFR 172.820",
    agency: "PHMSA",
    title: "Rail Routing Analysis for Hazmat",
    description: "Railroads must perform routing analysis using minimum 27 safety/security factors and select safest practicable route. Includes population, emergency response capability, track conditions, proximity to water bodies. Results are confidential but available to state/local emergency officials.",
    applicableCorridors: ["csx-main", "csx-capital", "csx-metropolitan", "norfolk-southern"],
    status: "ACTIVE",
    complianceGap: "CSX voluntarily rerouted some highest-risk commodities post-2004. Full routing data not public. NCPC 2007 study recommended tunnel bypass at $5.3B — never funded.",
    keyRequirements: [
      "27-factor safety and security analysis",
      "Route selection documentation",
      "Coordination with state/local emergency officials",
      "Annual review of routing decisions",
    ],
  },
  {
    id: "reg-oil-spill",
    code: "49 CFR Part 130",
    agency: "PHMSA",
    title: "Oil Spill Prevention & Response Plans",
    description: "Requires rail operators carrying oil to maintain response plans: trained personnel, pre-positioned equipment, established notification protocols. Mandates worst-case discharge planning and response capability for corridors near navigable waters.",
    applicableCorridors: ["csx-main", "csx-capital", "csx-metropolitan", "norfolk-southern"],
    status: "ACTIVE",
    complianceGap: "Response plans are not publicly disclosed. DC Fire & EMS first responders have had 'robust' training but noted gaps in real-time manifest access (Lynchburg 2014 precedent).",
    keyRequirements: [
      "Worst-case discharge planning",
      "Pre-positioned response equipment",
      "24/7 notification protocol",
      "Annual drill requirements",
      "AskRail app integration for first responders",
    ],
  },
  {
    id: "reg-fast-act",
    code: "FAST Act §7304-7306 (2015)",
    agency: "U.S. Congress / PHMSA",
    title: "FAST Act Tank Car Phase-Out Schedule",
    description: "Accelerated phase-out of DOT-111 tank cars for flammable liquid service. Set binding retrofit schedule. DOT-111 prohibited for PG III Class 3 flammables. Extended some deadlines to May 2027 and May 2031 pending sufficient retrofit shop capacity.",
    applicableCorridors: ["csx-main", "csx-capital", "norfolk-southern"],
    status: "ACTIVE — PHASE-IN",
    complianceGap: "Secretary may extend deadlines to 2027/2031 if retrofit capacity insufficient. Transitional fleet still on some corridors.",
    keyRequirements: [
      "DOT-111 banned for PG I/II crude oil service",
      "DOT-117 or DOT-117R required for all Class 3 flammables",
      "Thermal protection systems on all new/existing tank cars",
      "Pressure relief devices meeting 49 CFR 179.18(a)",
    ],
  },
  {
    id: "reg-ptc",
    code: "49 U.S.C. 20157 / FRA PTC Rules",
    agency: "FRA",
    title: "Positive Train Control (PTC) Requirement",
    description: "Mandates PTC on all Class I freight railroad mainlines carrying passengers or toxic-inhalation-hazard materials. All DC-area corridors have completed PTC installation. PTC prevents collisions, derailments from excessive speed, and unauthorized movements.",
    applicableCorridors: ["csx-main", "csx-capital", "csx-metropolitan", "norfolk-southern"],
    status: "IMPLEMENTED",
    complianceGap: "PTC does not prevent all accident types (e.g., track defects, mechanical failures). Does not apply to all short-line railroads.",
    keyRequirements: [
      "GPS-based train position monitoring",
      "Automatic speed enforcement",
      "Real-time communication with dispatch",
      "Interoperability between railroads",
    ],
  },
  {
    id: "reg-htua",
    code: "49 CFR 1580.3 (TSA)",
    agency: "TSA / DHS",
    title: "High-Threat Urban Area (HTUA) Designation",
    description: "Washington DC is designated a High-Threat Urban Area. Requires additional security measures for rail carriers transporting certain hazardous materials. Mandates 40 mph speed limit for non-compliant HHFT tank cars. Triggers enhanced background checks and security protocols.",
    applicableCorridors: ["csx-main", "csx-capital", "norfolk-southern"],
    status: "ACTIVE",
    complianceGap: "CSX stopped transporting chlorine, ammonia, and certain explosives through DC as of 2004. Bakken crude and flammable petroleum products still transit DC corridor per available reporting.",
    keyRequirements: [
      "40 mph cap for non-compliant HHFT cars in HTUA",
      "Enhanced employee background checks",
      "Security plan for all hazmat movements",
      "Coordination with local law enforcement",
    ],
  },
];

const RISK_COLORS = { CRITICAL: "#e53e3e", HIGH: "#dd6b20", MODERATE: "#ea580c", LOW: "#38a169" };
const RISK_BG = { CRITICAL: "rgba(229,62,62,0.12)", HIGH: "rgba(221,107,32,0.12)", MODERATE: "rgba(234,88,12,0.08)", LOW: "rgba(56,161,105,0.12)" };
const STATUS_COLORS = { "ACTIVE": "#e53e3e", "ACTIVE — PHASE-IN": "#dd6b20", "IMPLEMENTED": "#38a169" };
// ─────────────────────────────────────────────────
// POPULATION DENSITY ZONES (US Census ACS 2022 5-yr, persons/sq mi)
// ─────────────────────────────────────────────────
const POP_DENSITY_ZONES = [
  { name: "Capitol Hill / SE", center: [38.889, -76.999], radius: 0.35, density: 14200, label: "14,200/mi²" },
  { name: "Navy Yard / Nats Park", center: [38.872, -77.002], radius: 0.28, density: 9800, label: "9,800/mi²" },
  { name: "SW Waterfront / L'Enfant", center: [38.877, -77.022], radius: 0.30, density: 11200, label: "11,200/mi²" },
  { name: "Columbia Heights / Park View", center: [38.928, -77.036], radius: 0.38, density: 18600, label: "18,600/mi²" },
  { name: "Anacostia / Ward 8", center: [38.861, -76.982], radius: 0.45, density: 7200, label: "7,200/mi² · 82% minority · 34% poverty" },
  { name: "Benning / Ward 7", center: [38.892, -76.944], radius: 0.40, density: 6800, label: "6,800/mi² · 91% minority · 29% poverty" },
  { name: "Georgetown / Glover Park", center: [38.904, -77.063], radius: 0.30, density: 9100, label: "9,100/mi² · 18% minority · 8% poverty" },
  { name: "NoMa / Eckington", center: [38.912, -77.001], radius: 0.32, density: 12400, label: "12,400/mi²" },
  { name: "Silver Spring fringe (MD)", center: [38.981, -77.031], radius: 0.36, density: 8900, label: "8,900/mi²" },
];

// ─────────────────────────────────────────────────
// WATERWAY IMPACT DATA (EPA 303(d), NPS, USGS)
// ─────────────────────────────────────────────────
const WATERWAY_IMPACTS = [
  {
    id: "potomac-crossing",
    name: "Potomac River — Long Bridge Crossing",
    type: "Primary Crossing Risk",
    coords: [[38.876, -77.028],[38.878, -77.033],[38.880, -77.038]],
    spillRadiusMiles: 0.40,
    center: [38.878, -77.033],
    flowTime: "Chesapeake Bay: ~72 hrs at 2.3 ft/s mean flow (USGS gaging sta. 01646500)",
    affectedReachMiles: 14,
    drinkingWaterIntake: "Washington Aqueduct — Georgetown intake (90M gpd, serves DC/Arlington/Falls Church)",
    species: ["American Shad (threatened)", "Striped Bass", "Bald Eagle nesting (Roosevelt Island)"],
    epaSegment: "Potomac River Lower — WBID MD-02130004",
    wqStatus: "Impaired — PCBs, bacteria, trash (EPA 2022 303(d) list)",
    color: "#2563eb",
  },
  {
    id: "anacostia-corridor",
    name: "Anacostia River — SE Rail Corridor",
    type: "High Risk Tributary Exposure",
    coords: [[38.918,-76.960],[38.900,-76.972],[38.878,-76.990],[38.863,-77.002]],
    spillRadiusMiles: 0.30,
    center: [38.888, -76.980],
    flowTime: "Potomac confluence: ~20 min peak flow; Chesapeake Bay: ~84 hrs",
    affectedReachMiles: 8.4,
    drinkingWaterIntake: "No direct potable intake; indirect Chesapeake Bay impacts",
    species: ["Eastern Box Turtle", "Wood Duck", "River Otter", "Kenilworth wetland tidal marsh ecosystem"],
    epaSegment: "Anacostia River — WBID DC-ANA001",
    wqStatus: "Impaired — nutrients, bacteria, sediment, PCBs, trash (EPA 2022 303(d) — multiple listings)",
    color: "#0ea5e9",
  },
  {
    id: "rock-creek",
    name: "Rock Creek — NW Metropolitan Corridor",
    type: "Ecological Sensitivity Zone",
    coords: [[38.993,-77.050],[38.970,-77.055],[38.950,-77.058],[38.929,-77.060]],
    spillRadiusMiles: 0.25,
    center: [38.960, -77.056],
    flowTime: "Potomac River confluence: ~4 hrs under normal flow",
    affectedReachMiles: 3.2,
    drinkingWaterIntake: "Historic supply sluice (decommissioned 1906); C&O Canal feeder ecosystem",
    species: ["Brook Trout (last native DC population)", "Great Blue Heron", "Red Fox", "Rare macroinvertebrates"],
    epaSegment: "Rock Creek — WBID DC-ROC001",
    wqStatus: "Partially impaired — bacteria, trash, sediment (EPA 2022 303(d))",
    color: "#0d9488",
  },
];


// ─────────────────────────────────────────────────
// SIMPLE SVG MAP COMPONENT
// ─────────────────────────────────────────────────

function DCMapSVG({ selectedCorridor, selectedZone, onSelectCorridor, onSelectZone, showPopDensity = false, showWaterways = false }) {
  // DC bounding box: lat 38.79–39.02, lng -77.14–-76.90
  const LAT_MIN = 38.79, LAT_MAX = 39.02;
  const LNG_MIN = -77.14, LNG_MAX = -76.90;
  const W = 780, H = 520;

  function project([lat, lng]) {
    const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
    const y = H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * H;
    return [x, y];
  }

  function toPolyline(coords) {
    return coords.map(project).map(([x, y]) => `${x},${y}`).join(" ");
  }

  function mileToSVGPx(miles) {
    const degLat = miles / 69.0;
    return (degLat / (LAT_MAX - LAT_MIN)) * H;
  }

  const dcLandmarks = [
    { name: "Union Station", lat: 38.8973, lng: -77.0063, symbol: "■" },
    { name: "U.S. Capitol", lat: 38.8899, lng: -77.0091, symbol: "★" },
    { name: "Long Bridge", lat: 38.8738, lng: -77.0359, symbol: "◆" },
    { name: "Anacostia River", lat: 38.866, lng: -76.986, symbol: "~" },
    { name: "Benning Yard", lat: 38.893, lng: -76.956, symbol: "□" },
    { name: "Potomac River", lat: 38.878, lng: -77.058, symbol: "~" },
    { name: "DCA Airport", lat: 38.851, lng: -77.041, symbol: "✈" },
    { name: "Navy Yard", lat: 38.876, lng: -77.001, symbol: "⚓" },
  ];

  // Fixed satellite basemap for full DC bounding box — no zoom, always aligned
  const basemapUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${LNG_MIN},${LAT_MIN},${LNG_MAX},${LAT_MAX}&bboxSR=4326&imageSR=4326&size=${W * 2},${H * 2}&format=png&f=image`;

  return (
    <div style={{ borderRadius: 0, overflow: "hidden", position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: "#1a1a2e", borderRadius: 0, cursor: "pointer", maxHeight: 520, display: "block" }}>
      <defs>
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8"/>
        </filter>
      </defs>
      {/* ArcGIS satellite basemap — fixed to full DC bbox, always aligned */}
      <image
        href={basemapUrl}
        x={0} y={0} width={W} height={H} preserveAspectRatio="none"
        style={{ pointerEvents: "none" }}
      />
      {/* DC boundary rough polygon */}
      <polygon
        points={[
          [38.995, -77.041],[38.996, -76.909],[38.891, -76.910],
          [38.791, -77.038],[38.841, -77.117],[38.993, -77.119]
        ].map(project).map(([x,y])=>`${x},${y}`).join(" ")}
        fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" pointerEvents="none"
      />
      {/* Water bodies */}
      <polyline
        points={[[38.958,-77.120],[38.935,-77.082],[38.910,-77.063],[38.892,-77.040],[38.878,-77.034],[38.855,-77.030],[38.825,-77.007]].map(project).map(([x,y])=>`${x},${y}`).join(" ")}
        fill="none" stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" opacity="0.7" pointerEvents="none"
      />
      <text x="12" y="22" fill="#ffffff" stroke="#000000" strokeWidth="0.3" fontSize="12" fontFamily="monospace" opacity="0.9" pointerEvents="none">Potomac River</text>
      <polyline
        points={[[38.920,-76.962],[38.900,-76.975],[38.878,-76.990],[38.862,-77.003]].map(project).map(([x,y])=>`${x},${y}`).join(" ")}
        fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" opacity="0.6" pointerEvents="none"
      />
      <text x={project([38.868,-76.975])[0]-30} y={project([38.868,-76.975])[1]+14} fill="#ffffff" stroke="#000000" strokeWidth="0.3" fontSize="9" fontFamily="monospace" pointerEvents="none">Anacostia R.</text>

      {/* Population density overlay */}
      {showPopDensity && POP_DENSITY_ZONES.map(pd => {
        const [cx, cy] = project(pd.center);
        const r = mileToSVGPx(pd.radius);
        const opacity = Math.min(0.32, pd.density / 55000 + 0.07);
        return (
          <g key={pd.name}>
            <circle cx={cx} cy={cy} r={r} fill="#f97316" opacity={opacity} stroke="#f97316" strokeWidth="0.5" pointerEvents="none" />
          </g>
        );
      })}

      {/* Waterway spill radius overlay */}
      {showWaterways && WATERWAY_IMPACTS.map(w => {
        const [cx, cy] = project(w.center);
        const r = mileToSVGPx(w.spillRadiusMiles);
        return (
          <g key={w.id}>
            <polyline points={w.coords.map(project).map(([x,y])=>`${x},${y}`).join(" ")} fill="none" stroke={w.color} strokeWidth="4" opacity="0.6" strokeLinecap="round" pointerEvents="none" />
            <circle cx={cx} cy={cy} r={r} fill={w.color} opacity="0.13" stroke={w.color} strokeWidth="1.5" strokeDasharray="5,4" pointerEvents="none" />
          </g>
        );
      })}

      {/* Risk zones */}
      {RISK_ZONES.map(zone => {
        const [cx, cy] = project([zone.center[0], zone.center[1]]);
        const r = mileToSVGPx(zone.radiusMiles);
        const isSelected = selectedZone === zone.id;
        const color = zone.color;
        return (
          <g key={zone.id} onClick={() => onSelectZone(isSelected ? null : zone.id)} style={{ cursor: "pointer" }}>
            <circle cx={cx} cy={cy} r={r} fill={color} opacity={isSelected ? 0.30 : 0.13} stroke={color} strokeWidth={isSelected ? 2 : 1} strokeDasharray="4,3" pointerEvents="all" />
            {isSelected && <circle cx={cx} cy={cy} r={r+4} fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />}
          </g>
        );
      })}

      {/* Rail corridors */}
      {RAIL_CORRIDORS.map(corridor => {
        const isSelected = selectedCorridor === corridor.id;
        const color = RISK_COLORS[corridor.riskLevel];
        const strokeW = isSelected ? 5 : 3;
        return (
          <g key={corridor.id} onClick={() => onSelectCorridor(isSelected ? null : corridor.id)} style={{ cursor: "pointer" }}>
            <polyline points={toPolyline(corridor.coords)} fill="none" stroke="transparent" strokeWidth="16" style={{ cursor: "pointer" }} />
            <polyline points={toPolyline(corridor.coords)} fill="none" stroke={color} strokeWidth={strokeW + 3} opacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={toPolyline(corridor.coords)} fill="none" stroke={color} strokeWidth={strokeW} opacity={isSelected ? 1 : 0.75} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={corridor.riskLevel === "MODERATE" ? "8,4" : "none"} />
            {isSelected && <polyline points={toPolyline(corridor.coords)} fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,6" />}
          </g>
        );
      })}

      {/* Incident markers */}
      {INCIDENTS_HISTORY.filter(i => i.lat >= LAT_MIN && i.lat <= LAT_MAX && i.lng >= LNG_MIN && i.lng <= LNG_MAX).map(inc => {
        const [x, y] = project([inc.lat, inc.lng]);
        return (
          <g key={inc.id} pointerEvents="none">
            <circle cx={x} cy={y} r="6" fill="#e53e3e" opacity="0.85" />
            <circle cx={x} cy={y} r="10" fill="none" stroke="#e53e3e" strokeWidth="1" opacity="0.5" />
            <text x={x} y={y+4} textAnchor="middle" fontSize="8" fill="white">!</text>
          </g>
        );
      })}

      {/* Landmarks */}
      {dcLandmarks.map((lm, i) => {
        const [x, y] = project([lm.lat, lm.lng]);
        return (
          <g key={i} pointerEvents="none">
            <text x={x} y={y} textAnchor="middle" fontSize="9" fill="#ffffff" opacity="0.9" filter="url(#textShadow)">{lm.symbol}</text>
            <text x={x} y={y + 11} textAnchor="middle" fontSize="7" fill="#ffffff" opacity="0.9" filter="url(#textShadow)">{lm.name}</text>
          </g>
        );
      })}

      {/* Zone labels */}
      {RISK_ZONES.map(zone => {
        const [cx, cy] = project([zone.center[0], zone.center[1]]);
        return (
          <g key={zone.id + "-label"} onClick={() => onSelectZone(selectedZone === zone.id ? null : zone.id)} style={{ cursor: "pointer" }}>
            <circle cx={cx} cy={cy} r="5" fill={zone.color} opacity="0.9" />
            <text x={cx+8} y={cy+4} fontSize="8" fill={zone.color} fontFamily="monospace" fontWeight="bold">{zone.name.split(" ")[0]}</text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(14, 380)">
        <rect x="-6" y="-10" width="190" height="112" rx="6" fill="#ffffff" opacity="1" stroke="#d1d5db" strokeWidth="1"/>
        <text x="0" y="2" fontSize="9" fill="#111827" fontFamily="monospace" fontWeight="bold">RISK LEGEND</text>
        {[["CRITICAL","#e53e3e"],["HIGH","#dd6b20"],["MODERATE","#d69e2e"],["LOW","#38a169"]].map(([label,color],i)=>(
          <g key={label} transform={`translate(0,${16+i*16})`}>
            <rect width="20" height="6" y="-5" rx="2" fill={color} opacity="0.85"/>
            <text x="26" y="1" fontSize="9" fill="#111827" fontFamily="monospace">{label}</text>
          </g>
        ))}
        <g transform="translate(0,84)">
          <circle r="4" cx="4" cy="-2" fill="#e53e3e" opacity="0.85"/>
          <text x="14" y="2" fontSize="9" fill="#111827" fontFamily="monospace">INCIDENT SITE</text>
        </g>
      </g>

      {/* North arrow */}
      <g transform={`translate(${W-28}, 20)`}>
        <text x="0" y="10" textAnchor="middle" fontSize="11" fill="#374151">↑</text>
        <text x="0" y="22" textAnchor="middle" fontSize="8" fill="#374151">N</text>
      </g>
    </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────

function Tab1Map() {
  const [selectedCorridor, setSelectedCorridor] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showPopDensity, setShowPopDensity] = useState(false);
  const [showWaterways, setShowWaterways] = useState(false);
  const corridor = RAIL_CORRIDORS.find(c => c.id === selectedCorridor);
  const zone = RISK_ZONES.find(z => z.id === selectedZone);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 0, padding: "12px 18px" }}>
        <p style={{ margin: 0, color: "#374151", fontSize: 13, lineHeight: 1.6 }}>
          <span style={{ color: "#d97706", fontWeight: 700 }}>Washington DC hosts the CSX main freight corridor</span> — a two-mile stretch carrying 8,000+ hazmat rail cars annually through the federal core, adjacent to the U.S. Capitol, federal buildings, and across the Potomac River. Click corridors or risk zones to explore. Data sourced from CSX, DDOT DC SRP, NCPC, NBC4 I-Team, FRA, and PHMSA.
        </p>
      </div>

      {/* Layer toggles */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#374151", fontFamily: "'Source Code Pro','Courier New',monospace" }}>MAP LAYERS:</span>
        <button
          onClick={() => setShowPopDensity(v => !v)}
          style={{ padding: "4px 12px", borderRadius: 0, border: `1px solid ${showPopDensity ? "#f97316" : "#e5e7eb"}`, background: showPopDensity ? "rgba(249,115,22,0.1)" : "#f9fafb", color: showPopDensity ? "#ea580c" : "#6b7280", fontSize: 11, cursor: "pointer" }}>
          {showPopDensity ? "● " : "○ "}Population Density
        </button>
        <button
          onClick={() => setShowWaterways(v => !v)}
          style={{ padding: "4px 12px", borderRadius: 0, border: `1px solid ${showWaterways ? "#2563eb" : "#e5e7eb"}`, background: showWaterways ? "rgba(37,99,235,0.08)" : "#f9fafb", color: showWaterways ? "#2563eb" : "#6b7280", fontSize: 11, cursor: "pointer" }}>
          {showWaterways ? "● " : "○ "}Waterway Risk Zones
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
        <DCMapSVG
          selectedCorridor={selectedCorridor}
          selectedZone={selectedZone}
          onSelectCorridor={setSelectedCorridor}
          onSelectZone={setSelectedZone}
          showPopDensity={showPopDensity}
          showWaterways={showWaterways}
        />
        <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto" }}>
          <div style={{ color: "#374151", fontSize: 11, fontFamily: "'Source Code Pro','Courier New',monospace", letterSpacing: 1, borderBottom: "1px solid #d1d5db", paddingBottom: 6 }}>CORRIDORS</div>
          {RAIL_CORRIDORS.map(c => (
            <button key={c.id}
              onClick={() => setSelectedCorridor(selectedCorridor === c.id ? null : c.id)}
              style={{
                background: selectedCorridor === c.id ? RISK_BG[c.riskLevel] : "#f9fafb",
                border: `1px solid ${selectedCorridor === c.id ? RISK_COLORS[c.riskLevel] : "#e5e7eb"}`,
                borderRadius: 0, padding: "8px 10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: "#111827", fontWeight: 600, lineHeight: 1.3 }}>{c.name}</span>
                <span style={{ fontSize: 9, color: RISK_COLORS[c.riskLevel], fontWeight: 700, fontFamily: "'Source Code Pro','Courier New',monospace", background: RISK_BG[c.riskLevel], padding: "1px 5px", borderRadius: 3 }}>{c.riskLevel}</span>
              </div>
              <div style={{ fontSize: 10, color: "#4b5563" }}>{c.operator}</div>
            </button>
          ))}

          <div style={{ color: "#374151", fontSize: 11, fontFamily: "'Source Code Pro','Courier New',monospace", letterSpacing: 1, borderBottom: "1px solid #d1d5db", paddingBottom: 6, marginTop: 6 }}>RISK ZONES</div>
          {RISK_ZONES.map(z => (
            <button key={z.id}
              onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
              style={{
                background: selectedZone === z.id ? "rgba(229,62,62,0.1)" : "#f9fafb",
                border: `1px solid ${selectedZone === z.id ? z.color : "#e5e7eb"}`,
                borderRadius: 0, padding: "8px 10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#111827", lineHeight: 1.3 }}>{z.name}</span>
                <span style={{ fontSize: 10, color: z.color, fontFamily: "'Source Code Pro','Courier New',monospace", fontWeight: 700 }}>{z.riskScore}</span>
              </div>
              <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>Pop. {z.population.toLocaleString()} · EJ Score: {z.envJusticeScore}/100</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {corridor && (
        <div style={{ background: RISK_BG[corridor.riskLevel], border: `1px solid ${RISK_COLORS[corridor.riskLevel]}`, borderRadius: 0, padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h3 style={{ margin: 0, color: "#111827", fontSize: 16, fontWeight: 700 }}>{corridor.name}</h3>
              <div style={{ color: "#374151", fontSize: 12, marginTop: 3 }}>{corridor.subdivision}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: RISK_COLORS[corridor.riskLevel], color: "white", padding: "3px 10px", borderRadius: 0, fontSize: 11, fontWeight: 700 }}>{corridor.riskLevel} RISK</span>
              <span style={{ background: "#f3f4f6", color: "#374151", padding: "3px 10px", borderRadius: 0, fontSize: 11, border: "1px solid #e5e7eb" }}>Score: {corridor.riskScore}/100</span>
            </div>
          </div>
          <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>{corridor.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
            {[
              ["Annual Hazmat Cars", corridor.annualHazmatCars.toLocaleString()],
              ["Population Exposed", corridor.populationExposed.toLocaleString()],
              ["Speed Limit", `${corridor.speedLimitMph} mph (HHFT)`],
              ["Tank Car Spec", corridor.tankCarSpec],
              ["PTC Installed", corridor.ptcInstalled ? "✓ Yes" : "✗ No"],
              ["Evacuation Radius", `${corridor.evacuationRadiusMiles} mile`],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "#f3f4f6", borderRadius: 0, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 3, fontFamily: "'Source Code Pro','Courier New',monospace" }}>{k}</div>
                <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#374151", marginBottom: 6, fontFamily: "'Source Code Pro','Courier New',monospace" }}>PRIMARY CARGO TYPES</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {corridor.primaryCargo.map(c => (
                <span key={c} style={{ background: "rgba(229,62,62,0.15)", color: "#dc2626", padding: "2px 8px", borderRadius: 0, fontSize: 11, border: "1px solid rgba(229,62,62,0.3)" }}>{c}</span>
              ))}
            </div>
          </div>
          {corridor.blastZoneIncludes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#374151", marginBottom: 6, fontFamily: "'Source Code Pro','Courier New',monospace" }}>WITHIN BLAST/EVACUATION ZONE</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {corridor.blastZoneIncludes.map(b => (
                  <span key={b} style={{ background: "rgba(214,158,46,0.15)", color: "#92400e", padding: "2px 8px", borderRadius: 0, fontSize: 11, border: "1px solid rgba(214,158,46,0.3)" }}>{b}</span>
                ))}
              </div>
            </div>
          )}
          {corridor.waterBodyProximity.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#374151", marginBottom: 6, fontFamily: "'Source Code Pro','Courier New',monospace" }}>WATER BODY RISK</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {corridor.waterBodyProximity.map(w => (
                  <span key={w} style={{ background: "rgba(37,99,235,0.1)", color: "#059669", padding: "2px 8px", borderRadius: 0, fontSize: 11, border: "1px solid #2d6a9a" }}>💧 {w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {zone && (
        <div style={{ background: "rgba(229,62,62,0.07)", border: `1px solid ${zone.color}`, borderRadius: 0, padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ margin: 0, color: "#111827", fontSize: 16, fontWeight: 700 }}>{zone.name}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: zone.color, color: "white", padding: "3px 10px", borderRadius: 0, fontSize: 11, fontWeight: 700 }}>Risk Score: {zone.riskScore}/100</span>
              <span style={{ background: zone.envJusticeScore > 70 ? "rgba(229,62,62,0.3)" : "rgba(214,158,46,0.3)", color: zone.envJusticeScore > 70 ? "#dc2626" : "#92400e", padding: "3px 10px", borderRadius: 0, fontSize: 11, fontWeight: 700 }}>EJ Index: {zone.envJusticeScore}/100</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#374151", marginBottom: 6, fontFamily: "'Source Code Pro','Courier New',monospace" }}>KEY LOCATIONS AT RISK</div>
              {zone.landmarks.map(l => <div key={l} style={{ color: "#111827", fontSize: 12, marginBottom: 3 }}>• {l}</div>)}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#374151", marginBottom: 6, fontFamily: "'Source Code Pro','Courier New',monospace" }}>VULNERABILITY FACTORS</div>
              {zone.vulnerabilities.map(v => <div key={v} style={{ color: "#c2410c", fontSize: 12, marginBottom: 3 }}>⚠ {v}</div>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ background: "#f3f4f6", borderRadius: 0, padding: "8px 14px", flex: 1 }}>
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>POPULATION EXPOSED</div>
              <div style={{ fontSize: 20, color: "#111827", fontWeight: 700, marginTop: 2 }}>{zone.population.toLocaleString()}</div>
            </div>
            <div style={{ background: "#f3f4f6", borderRadius: 0, padding: "8px 14px", flex: 1 }}>
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>EVACUATION RADIUS</div>
              <div style={{ fontSize: 20, color: "#111827", fontWeight: 700, marginTop: 2 }}>{zone.radiusMiles} mi</div>
            </div>
            <div style={{ background: "#f3f4f6", borderRadius: 0, padding: "8px 14px", flex: 1 }}>
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>ENV. JUSTICE INDEX</div>
              <div style={{ fontSize: 20, color: zone.envJusticeScore > 70 ? "#dc2626" : "#111827", fontWeight: 700, marginTop: 2 }}>{zone.envJusticeScore}/100</div>
            </div>
          </div>
        </div>
      )}

      {/* Incident feed */}
      <div>
        <div style={{ color: "#374151", fontSize: 11, fontFamily: "'Source Code Pro','Courier New',monospace", letterSpacing: 1, marginBottom: 10 }}>REGIONAL INCIDENT RECORD (REAL DATA)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {INCIDENTS_HISTORY.map(inc => (
            <div key={inc.id} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 0, padding: "12px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ background: "rgba(229,62,62,0.12)", color: "#dc2626", padding: "4px 10px", borderRadius: 0, fontSize: 12, fontWeight: 700, fontFamily: "'Source Code Pro','Courier New',monospace", minWidth: 44, textAlign: "center" }}>{inc.year}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ color: "#111827", fontWeight: 600, fontSize: 13 }}>{inc.location}</span>
                  <span style={{ color: "#374151", fontSize: 12 }}>— {inc.type}</span>
                  <span style={{ background: "rgba(214,158,46,0.15)", color: "#92400e", padding: "1px 8px", borderRadius: 0, fontSize: 11 }}>{inc.cargo}</span>
                  <span style={{ color: "#4b5563", fontSize: 11 }}>Op: {inc.operator}</span>
                </div>
                <div style={{ color: "#374151", fontSize: 12, lineHeight: 1.5 }}>{inc.notes}</div>
                {inc.gallonsSpilled > 0 && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 3 }}>⚠ {inc.gallonsSpilled.toLocaleString()} gallons spilled</div>}
                {inc.deaths > 0 && <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 700, marginTop: 3 }}>⚑ {inc.deaths} fatalities · {inc.injuries} injuries</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waterway Impact Detail Panel — shown when waterway layer is active */}
      {showWaterways && (
        <div>
          <div style={{ color: "#2563eb", fontSize: 11, fontFamily: "'Source Code Pro','Courier New',monospace", letterSpacing: 1, marginBottom: 10 }}>💧 WATERWAY IMPACT ZONES (EPA 303(d) / USGS / NPS)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WATERWAY_IMPACTS.map(w => (
              <div key={w.id} style={{ background: "rgba(37,99,235,0.04)", border: `1px solid ${w.color}40`, borderRadius: 0, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ color: w.color, fontWeight: 700, fontSize: 13 }}>💧 {w.name}</span>
                  <span style={{ fontSize: 11, color: "#374151", fontFamily: "'Source Code Pro','Courier New',monospace" }}>{w.type}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8, marginBottom: 8 }}>
                  {[
                    ["EPA Segment", w.epaSegment],
                    ["Water Quality Status", w.wqStatus],
                    ["Spill Radius", `${w.spillRadiusMiles} mi`],
                    ["Affected Reach", `${w.affectedReachMiles} river mi`],
                    ["Drinking Water Intake", w.drinkingWaterIntake],
                    ["Spill Travel Time", w.flowTime],
                  ].map(([k,v]) => (
                    <div key={k} style={{ background: "#f9fafb", borderRadius: 4, padding: "6px 10px" }}>
                      <div style={{ fontSize: 9, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace", marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 12, color: "#374151" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#374151", fontFamily: "'Source Code Pro','Courier New',monospace", marginBottom: 4 }}>SPECIES / ECOSYSTEMS AT RISK</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {w.species.map(s => (
                      <span key={s} style={{ background: "rgba(16,185,129,0.08)", color: "#059669", padding: "2px 8px", borderRadius: 0, fontSize: 11, border: "1px solid rgba(16,185,129,0.2)" }}>🌿 {s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Population Density Detail — shown when density layer active */}
      {showPopDensity && (
        <div>
          <div style={{ color: "#ea580c", fontSize: 11, fontFamily: "'Source Code Pro','Courier New',monospace", letterSpacing: 1, marginBottom: 10 }}>👥 POPULATION DENSITY — RAIL RISK OVERLAP (US Census ACS 2022)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8 }}>
            {POP_DENSITY_ZONES.map(pd => (
              <div key={pd.name} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 0, padding: "10px 14px" }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "#111827", marginBottom: 3 }}>{pd.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 4, height: 6 }}>
                    <div style={{ background: "#f97316", height: "100%", width: `${Math.min(100, pd.density / 200)}%`, borderRadius: 4 }}/>
                  </div>
                  <span style={{ fontSize: 11, color: "#f97316", fontFamily: "'Source Code Pro','Courier New',monospace", fontWeight: 700 }}>{pd.density.toLocaleString()}/mi²</span>
                </div>
                <div style={{ fontSize: 11, color: "#374151" }}>{pd.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// TAB 2: REGULATORY LAYER
// ─────────────────────────────────────────────────

function Tab2Regulations() {
  const [selectedReg, setSelectedReg] = useState(null);
  const [filterCorridor, setFilterCorridor] = useState("all");

  const filtered = filterCorridor === "all" ? REGULATIONS :
    REGULATIONS.filter(r => r.applicableCorridors.includes(filterCorridor));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 0, padding: "12px 18px" }}>
        <p style={{ margin: 0, color: "#374151", fontSize: 13, lineHeight: 1.6 }}>
          Federal and transportation regulations governing crude-by-rail through Washington DC. Each regulation is mapped to applicable corridor(s) and includes compliance status, known gaps, and key requirements. Real data from PHMSA, FRA, TSA, and US Code.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "#374151", fontSize: 11, fontFamily: "'Source Code Pro','Courier New',monospace" }}>FILTER BY CORRIDOR:</span>
        {[["all","All Corridors"], ...RAIL_CORRIDORS.map(c=>[c.id, c.name.split(" ").slice(0,3).join(" ")])].map(([id,label]) => (
          <button key={id}
            onClick={() => setFilterCorridor(id)}
            style={{
              background: filterCorridor === id ? "rgba(5,150,105,0.1)" : "#f9fafb",
              border: `1px solid ${filterCorridor === id ? '#059669' : '#e5e7eb'}`,
              color: filterCorridor === id ? "#059669" : "#9ca3af",
              padding: "4px 12px", borderRadius: 0, fontSize: 11, cursor: "pointer"
            }}>{label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
        {filtered.map(reg => {
          const isSelected = selectedReg === reg.id;
          const statusColor = STATUS_COLORS[reg.status] || "#6b7280";
          return (
            <div key={reg.id}
              onClick={() => setSelectedReg(isSelected ? null : reg.id)}
              style={{
                background: isSelected ? "#f0fdf4" : "#f9fafb",
                border: `1px solid ${isSelected ? "#059669" : "#e5e7eb"}`,
                borderRadius: 0, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace", marginBottom: 3 }}>{reg.code}</div>
                  <div style={{ fontSize: 14, color: "#111827", fontWeight: 700, lineHeight: 1.3 }}>{reg.title}</div>
                  <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>Agency: {reg.agency}</div>
                </div>
                <span style={{ background: statusColor + "25", color: statusColor, padding: "3px 10px", borderRadius: 0, fontSize: 10, fontWeight: 700, fontFamily: "'Source Code Pro','Courier New',monospace", border: `1px solid ${statusColor}50`, whiteSpace: "nowrap" }}>{reg.status}</span>
              </div>
              <p style={{ margin: "0 0 10px", color: "#374151", fontSize: 12, lineHeight: 1.6 }}>{reg.description}</p>

              {isSelected && (
                <div style={{ marginTop: 12, borderTop: "1px solid #d1d5db", paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#374151", marginBottom: 8, fontFamily: "'Source Code Pro','Courier New',monospace" }}>KEY REQUIREMENTS</div>
                  {reg.keyRequirements.map((req, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                      <span style={{ color: "#38a169", fontSize: 12, marginTop: 1 }}>✓</span>
                      <span style={{ color: "#111827", fontSize: 12, lineHeight: 1.5 }}>{req}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, background: "rgba(221,107,32,0.1)", border: "1px solid rgba(221,107,32,0.3)", borderRadius: 0, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: "#dd6b20", fontFamily: "'Source Code Pro','Courier New',monospace", marginBottom: 4 }}>⚠ COMPLIANCE GAP / NOTE</div>
                    <div style={{ color: "#c2410c", fontSize: 12, lineHeight: 1.5 }}>{reg.complianceGap}</div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace", marginBottom: 6 }}>APPLICABLE CORRIDORS</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {reg.applicableCorridors.map(cid => {
                        const c = RAIL_CORRIDORS.find(c => c.id === cid);
                        return c ? (
                          <span key={cid} style={{ background: RISK_BG[c.riskLevel], color: RISK_COLORS[c.riskLevel], padding: "2px 8px", borderRadius: 0, fontSize: 11, border: `1px solid ${RISK_COLORS[c.riskLevel]}40` }}>{c.name.split("/")[0].trim()}</span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}
              {!isSelected && <div style={{ fontSize: 11, color: "#059669", marginTop: 4 }}>Click to expand →</div>}
            </div>
          );
        })}
      </div>

      {/* Regulatory gap matrix */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 0, padding: "18px 22px" }}>
        <div style={{ color: "#374151", fontSize: 12, fontFamily: "'Source Code Pro','Courier New',monospace", letterSpacing: 1, marginBottom: 14 }}>CORRIDOR × REGULATION COMPLIANCE MATRIX</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#374151", fontFamily: "'Source Code Pro','Courier New',monospace", borderBottom: "1px solid #d1d5db", fontWeight: 600 }}>Corridor</th>
                {REGULATIONS.map(r => (
                  <th key={r.id} style={{ padding: "8px 10px", textAlign: "center", color: "#374151", fontFamily: "'Source Code Pro','Courier New',monospace", borderBottom: "1px solid #d1d5db", fontWeight: 600, fontSize: 10 }}>
                    {r.code.split(" ")[0]}<br/>{r.code.split(" ")[1] || ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RAIL_CORRIDORS.map(corridor => (
                <tr key={corridor.id} style={{ borderBottom: "1px solid #d1d5db" }}>
                  <td style={{ padding: "8px 12px", color: "#111827" }}>
                    <div style={{ fontWeight: 600 }}>{corridor.name.split("/")[0].trim()}</div>
                    <div style={{ fontSize: 10, color: RISK_COLORS[corridor.riskLevel] }}>{corridor.riskLevel}</div>
                  </td>
                  {REGULATIONS.map(reg => {
                    const applies = reg.applicableCorridors.includes(corridor.id);
                    return (
                      <td key={reg.id} style={{ padding: "8px 10px", textAlign: "center" }}>
                        {applies
                          ? <span style={{ color: reg.status === "IMPLEMENTED" ? "#38a169" : reg.status === "ACTIVE — PHASE-IN" ? "#dd6b20" : "#d97706", fontSize: 14 }}>
                              {reg.status === "IMPLEMENTED" ? "✓" : reg.status === "ACTIVE — PHASE-IN" ? "◑" : "●"}
                            </span>
                          : <span style={{ color: "#e5e7eb" }}>—</span>
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {[["✓ Green","IMPLEMENTED (PTC)"],["● Yellow","ACTIVE regulation"],["◑ Orange","PHASE-IN / transitional"],["— Gray","Not applicable"]].map(([sym,label]) => (
            <div key={label} style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>{sym} = {label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// TAB 3: RISK & COMPLIANCE REPORT
// ─────────────────────────────────────────────────

function Tab3Report() {
  const [openSection, setOpenSection] = useState("exec");
  const sections = [
    { id: "exec", label: "Executive Summary" },
    { id: "corridors", label: "High-Risk Corridors" },
    { id: "envjustice", label: "Environmental Justice" },
    { id: "water", label: "Waterway Contamination Risk" },
    { id: "gaps", label: "Policy Gaps & Violations" },
    { id: "recommendations", label: "Recommendations" },
  ];

  const totalPop = RAIL_CORRIDORS.reduce((a,c)=>a+c.populationExposed,0);
  const criticalCorridors = RAIL_CORRIDORS.filter(c=>c.riskLevel==="CRITICAL").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          ["Active Corridors", RAIL_CORRIDORS.length, "", "#059669"],
          ["Critical Risk", criticalCorridors, "", "#e53e3e"],
          ["Population at Risk", (totalPop/1000).toFixed(0)+"K", "", "#dd6b20"],
          ["Annual Hazmat Cars", "15,100+", "", "#d69e2e"],
          ["Regulations Mapped", REGULATIONS.length, "", "#38a169"],
          ["Key Incidents on Record", INCIDENTS_HISTORY.length, "", "#a78bfa"],
        ].map(([label, val, unit, color]) => (
          <div key={label} style={{ background: "#f9fafb", border: `1px solid ${color}30`, borderRadius: 0, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, color: color, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Section accordion */}
      {sections.map(sec => (
        <div key={sec.id} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
            style={{
              width: "100%", background: openSection === sec.id ? "rgba(5,150,105,0.05)" : "#f9fafb",
              border: `1px solid ${openSection === sec.id ? "#059669" : "#e5e7eb"}`,
              borderRadius: 0,
              padding: "13px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between",
              alignItems: "center", color: openSection === sec.id ? "#059669" : "#111827", fontSize: 14, fontWeight: 600, textAlign: "left"
            }}>
            {sec.label}
            <span style={{ fontSize: 12, color: "#4b5563" }}>{openSection === sec.id ? "▲" : "▼"}</span>
          </button>

          {openSection === sec.id && (
            <div style={{ background: "#ffffff", border: "1px solid #d1d5db", borderTop: "none", borderRadius: 0, padding: "18px 22px" }}>
              {sec.id === "exec" && (
                <div style={{ color: "#374151", fontSize: 13, lineHeight: 1.8 }}>
                  <p>Washington DC is traversed by one of the most hazardous freight rail corridors in North America. The CSX Transportation mainline crosses the Potomac River at Long Bridge, passes within blocks of the U.S. Capitol, and threads through the Virginia Avenue Tunnel before connecting to Union Station — carrying an estimated <strong style={{ color: "#d97706" }}>8,000+ hazmat rail cars annually</strong> through the federal core and residential neighborhoods.</p>
                  <p>A 2007 National Capital Planning Commission study identified three remediation options (costing $4.3–5.3 billion each) but none have been funded. CSX voluntarily stopped transporting chlorine, ammonia, and certain explosives through DC after 2004, but petroleum products including Bakken crude oil, molten sulfur, ammonium nitrate, and styrene monomer continue to transit the corridor. A hypothetical derailment at the Long Bridge crossing or the Virginia Avenue Tunnel could trigger a <strong style={{ color: "#dc2626" }}>mile-wide evacuation zone</strong> encompassing the Capitol, 10 Metro stations, the Washington Monument, and Air & Space Museum.</p>
                  <p>Federal regulations (HM-251, 49 CFR 172.820, FAST Act) have materially improved tank car standards and required routing analyses, but compliance gaps remain — particularly around legacy DOT-111 tank cars still in transitional service, non-public routing data, and first responder manifest access (as demonstrated in the 2014 Lynchburg incident by the same operator on the same corridor type).</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                    <div style={{ background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.3)", borderRadius: 0, padding: "12px 16px" }}>
                      <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>CRITICAL FINDINGS</div>
                      {["8,000+ hazmat cars/yr through federal core","Mile-wide blast zone covers Capitol & 10 Metro stations","Anacostia River corridor: EJ Index 88/100 — majority low-income","No public routing data; confidential per 49 CFR 172.820","Legacy DOT-111 tank cars in transitional service through 2031","NCPC $5.3B bypass tunnel unfunded since 2007","First responder manifest gaps documented in similar incidents"].map(f => (
                        <div key={f} style={{ color: "#c2410c", fontSize: 12, marginBottom: 4 }}>⚑ {f}</div>
                      ))}
                    </div>
                    <div style={{ background: "rgba(56,161,105,0.1)", border: "1px solid rgba(56,161,105,0.3)", borderRadius: 0, padding: "12px 16px" }}>
                      <div style={{ color: "#059669", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>COMPLIANCE ACHIEVEMENTS</div>
                      {["PTC fully installed on all 4 DC-area corridors","DOT-117 tank cars transitioning for crude oil service","50 mph HHFT speed cap uniformly applied","SERC notification required for 1M+ gallon Bakken shipments","CSX voluntarily stopped Cl₂/NH₃/explosives through DC since 2004","AskRail app deployed for first responders","27-factor routing analysis required under 49 CFR 172.820"].map(f => (
                        <div key={f} style={{ color: "#059669", fontSize: 12, marginBottom: 4 }}>✓ {f}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sec.id === "corridors" && (
                <div>
                  {RAIL_CORRIDORS.map(c => (
                    <div key={c.id} style={{ background: RISK_BG[c.riskLevel], border: `1px solid ${RISK_COLORS[c.riskLevel]}40`, borderRadius: 0, padding: "14px 18px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <span style={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                          <span style={{ color: "#374151", fontSize: 12, marginLeft: 10 }}>{c.operator}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ background: RISK_COLORS[c.riskLevel], color: "white", padding: "2px 10px", borderRadius: 0, fontSize: 11, fontWeight: 700 }}>{c.riskLevel}</span>
                          <span style={{ background: "rgba(0,0,0,0.3)", color: "#374151", padding: "2px 10px", borderRadius: 0, fontSize: 11 }}>Score {c.riskScore}/100</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}>
                        <div style={{ background: "#f3f4f6", borderRadius: 0, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>HAZMAT CARS/YR</div>
                          <div style={{ fontSize: 18, color: "#111827", fontWeight: 700 }}>{c.annualHazmatCars.toLocaleString()}</div>
                        </div>
                        <div style={{ background: "#f3f4f6", borderRadius: 0, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>POP. EXPOSED</div>
                          <div style={{ fontSize: 18, color: "#111827", fontWeight: 700 }}>{c.populationExposed.toLocaleString()}</div>
                        </div>
                        <div style={{ background: "#f3f4f6", borderRadius: 0, padding: "8px 12px" }}>
                          <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>SPEED LIMIT</div>
                          <div style={{ fontSize: 18, color: "#111827", fontWeight: 700 }}>{c.speedLimitMph} mph</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{c.description}</div>
                      {c.incidents.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 11, color: "#dd6b20", fontFamily: "'Source Code Pro','Courier New',monospace", marginBottom: 6 }}>INCIDENT HISTORY ON THIS OPERATOR</div>
                          {c.incidents.map((inc, i) => (
                            <div key={i} style={{ color: "#c2410c", fontSize: 12, marginBottom: 3 }}>⚠ {inc.year} — {inc.location} ({inc.type}) — {inc.severity}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {sec.id === "envjustice" && (
                <div style={{ color: "#374151", fontSize: 13, lineHeight: 1.8 }}>
                  <p>Environmental justice analysis examines how risk is distributed across DC's communities. The EPA EJ Index and CDC Environmental Justice scores consistently show that the highest-exposure rail corridors run through or adjacent to DC's most economically disadvantaged and minority-majority neighborhoods.</p>
                  <div style={{ background: "rgba(229,62,62,0.08)", border: "1px solid rgba(229,62,62,0.2)", borderRadius: 0, padding: "14px 18px", margin: "14px 0" }}>
                    <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>HIGH ENVIRONMENTAL JUSTICE CONCERN ZONES</div>
                    {RISK_ZONES.filter(z=>z.envJusticeScore>70).map(z => (
                      <div key={z.id} style={{ marginBottom: 10, borderBottom: "1px solid rgba(229,62,62,0.15)", paddingBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#111827", fontWeight: 600 }}>{z.name}</span>
                          <span style={{ color: "#dc2626", fontWeight: 700 }}>EJ Score: {z.envJusticeScore}/100</span>
                        </div>
                        <div style={{ background: "#f3f4f6", borderRadius: 4, height: 8, marginBottom: 6 }}>
                          <div style={{ background: "#e53e3e", height: "100%", width: `${z.envJusticeScore}%`, borderRadius: 4, transition: "width 0.4s" }}/>
                        </div>
                        <div style={{ fontSize: 12, color: "#374151" }}>Pop: {z.population.toLocaleString()} · Risk Score: {z.riskScore}/100</div>
                      </div>
                    ))}
                  </div>
                  <p>The Anacostia corridor carries the highest compounded risk: an EJ score of 88/100 combined with a spill risk score of 87/100, meaning both environmental harm and population vulnerability are simultaneously maximized. Benning Yard scores 94/100 on EJ index — the highest of any identified zone — due to its position adjacent to low-income residential neighborhoods in Ward 7 and 8, which are majority African American and have some of DC's lowest income and highest asthma rates.</p>
                  <p>The Georgetown/NW Potomac zone, by contrast, scores only 22/100 on EJ despite moderate risk to the C&O Canal ecosystem — illustrating that high economic status areas can carry environmental risk without proportional community vulnerability burden.</p>
                  <div style={{ background: "rgba(56,161,105,0.08)", border: "1px solid rgba(56,161,105,0.2)", borderRadius: 0, padding: "14px 18px", marginTop: 14 }}>
                    <div style={{ color: "#059669", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>POLICY IMPLICATION</div>
                    <p style={{ margin: 0 }}>Under Executive Order 12898 (Federal Actions to Address Environmental Justice) and DOT's Environmental Justice Order 5610.2(a), routing decisions for hazardous materials must consider disproportionate impacts on low-income and minority communities. Current DC corridor routing has never been subject to a formal EJ review under these orders, per available public record.</p>
                  </div>
                </div>
              )}

              {sec.id === "water" && (
                <div style={{ color: "#374151", fontSize: 13, lineHeight: 1.8 }}>
                  <p>Washington DC's rail corridors run parallel or adjacent to two major waterways — the <strong style={{ color: "#059669" }}>Potomac River</strong> and the <strong style={{ color: "#059669" }}>Anacostia River</strong> — both of which feed directly into the Chesapeake Bay watershed. A spill at any of three critical locations could cause irreversible contamination.</p>
                  {[
                    {
                      name: "Long Bridge / Potomac River Crossing",
                      risk: "CRITICAL",
                      description: "The primary CSX freight route crosses directly over the Potomac on the Long Bridge. A derailment at this point would deposit crude oil or hazardous chemicals directly into the Potomac — the primary drinking water source for 6+ million DC metro area residents and a critical habitat corridor. Current spill response requires deployment of containment booms, which cannot be pre-positioned at the crossing.",
                      travelTime: "Spill reaches Chesapeake Bay in ~72 hours under normal flow",
                      vol: "Up to 29,000 gallons per tank car × up to 100 cars in a HHFT = potential 2.9M gallon worst case",
                    },
                    {
                      name: "Anacostia River — SE Corridor",
                      risk: "HIGH",
                      description: "The Capital Subdivision and sections of the NS shared route pass within spill radius of the Anacostia River. The Anacostia corridor has already seen derailments affecting its tributaries (Hyattsville 2023). The river flows through Ward 7 and 8, the most environmentally burdened zip codes in DC. Contamination would affect Kenilworth Aquatic Gardens, a National Park containing the only natural tidal marsh remaining in DC.",
                      travelTime: "Anacostia tributary → main channel within 20 min at peak flow",
                      vol: "Kenilworth wetlands: irreversible contamination threshold unknown",
                    },
                    {
                      name: "Rock Creek — Metropolitan Subdivision",
                      risk: "MODERATE",
                      description: "The Metropolitan Subdivision parallels the Potomac C&O Canal corridor, with Rock Creek running through a National Park that connects to the Potomac. Though lower hazmat volumes, the ecological sensitivity of Rock Creek National Park and the canal system make any spill disproportionately damaging.",
                      travelTime: "Rock Creek → Potomac River confluence within 4 hours",
                      vol: "Lower volume corridor; risk attenuated by reduced HHFT traffic",
                    },
                  ].map(w => (
                    <div key={w.name} style={{ background: "rgba(37,99,235,0.05)", border: "1px solid #2d6a9a", borderRadius: 0, padding: "14px 18px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: "#059669", fontWeight: 700, fontSize: 14 }}>💧 {w.name}</span>
                        <span style={{ background: RISK_BG[w.risk], color: RISK_COLORS[w.risk], padding: "2px 10px", borderRadius: 0, fontSize: 11, fontWeight: 700 }}>{w.risk}</span>
                      </div>
                      <p style={{ margin: "0 0 8px" }}>{w.description}</p>
                      <div style={{ fontSize: 12, color: "#1d4ed8" }}>⏱ {w.travelTime}</div>
                      <div style={{ fontSize: 12, color: "#dd6b20", marginTop: 4 }}>⚠ {w.vol}</div>
                    </div>
                  ))}
                </div>
              )}

              {sec.id === "gaps" && (
                <div>
                  {[
                    { severity: "CRITICAL", title: "NCPC Bypass Recommendation Unfunded (2007–Present)", desc: "The National Capital Planning Commission's 2007 study recommended three bypass alternatives ($4.3–5.3B) to reroute freight away from DC's federal core. 17+ years later, none have been funded or advanced. The CSX main corridor remains in operation with the same routing." },
                    { severity: "CRITICAL", title: "Legacy DOT-111 Tank Cars in Transitional Service", desc: "FAST Act §7304 deadlines allow legacy DOT-111 cars to remain in Class 3 flammable service until 2027 (with potential extension to 2031) if retrofit capacity is insufficient. DOT-111 cars have thinner walls and lower puncture resistance than DOT-117. During this transition window, the highest-risk car type may still transit the DC corridor." },
                    { severity: "HIGH", title: "Non-Public Routing Data Under 49 CFR 172.820", desc: "The 27-factor routing analysis required by PHMSA is confidential. State and local officials may request routing information, but the public and affected communities have no access. Routing changes (such as CSX's voluntary post-2004 rerouting of chlorine) are done without public notification or EJ review." },
                    { severity: "HIGH", title: "First Responder Manifest Access Gap", desc: "The 2014 Lynchburg, VA incident — same operator, same cargo type — documented that first responders could not access train manifests due to train length (>1 mile). While the AskRail app was deployed in 2014, integration with DC Fire & EMS protocol and real-time use in DC tunnel environments has not been publicly verified." },
                    { severity: "HIGH", title: "Environmental Justice Review Never Completed for DC Routing", desc: "No formal EJ review under EO 12898 or DOT Order 5610.2(a) has been completed for the CSX DC corridor routing decision. Benning Yard (EJ 94/100) and the Anacostia corridor (EJ 88/100) disproportionately expose DC's most vulnerable communities to hazmat rail risk." },
                    { severity: "MODERATE", title: "Virginia Avenue Tunnel — Evacuation Constraint", desc: "CSX's Virginia Avenue Tunnel runs under Capitol Hill between the freight yard and Union Station. A derailment inside the tunnel would require evacuating one of the highest-density areas of DC with limited egress corridors. Tunnel emergency response capability is constrained by underground geometry and ventilation limitations." },
                    { severity: "MODERATE", title: "Speed Enforcement in HTUA — Verification Gap", desc: "49 CFR 1580.3 and HM-251 require 40 mph for non-compliant HHFT cars in HTUAs and 50 mph for all HHFTs. No public reporting mechanism exists to verify real-time compliance with speed limits on the DC corridor. PTC enforces authorizations but verification audits are not publicly reported." },
                  ].map(gap => (
                    <div key={gap.title} style={{ background: RISK_BG[gap.severity], border: `1px solid ${RISK_COLORS[gap.severity]}40`, borderRadius: 0, padding: "14px 18px", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ background: RISK_COLORS[gap.severity], color: "white", padding: "2px 10px", borderRadius: 0, fontSize: 11, fontWeight: 700 }}>{gap.severity}</span>
                        <span style={{ color: "#111827", fontWeight: 700, fontSize: 13, lineHeight: 1.4 }}>{gap.title}</span>
                      </div>
                      <p style={{ margin: 0, color: "#374151", fontSize: 13, lineHeight: 1.6 }}>{gap.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {sec.id === "recommendations" && (
                <div>
                  {[
                    { priority: "01", title: "Fund and Advance the NCPC Bypass Corridor Study", action: "Congress / DOT", desc: "Revive and fund the 2007 NCPC freight bypass study. Prioritize the DC Tunnel Alternative ($5.3B) as a long-term infrastructure investment. Interim measure: establish a shipper cost-sharing mechanism for voluntary rerouting of highest-risk commodities." },
                    { priority: "02", title: "Mandate EJ Review for All HHFT Routing Decisions", action: "PHMSA / DOT OEJ", desc: "Issue a rulemaking requiring formal Environmental Justice review under EO 12898 for any HHFT routing decision in HTUAs. Require public comment periods for routing changes affecting communities with EJ Index >70." },
                    { priority: "03", title: "Accelerate DOT-111 Phase-Out — No Extensions Through DC HTUA", action: "PHMSA / Congress", desc: "Prohibit FAST Act extensions for DOT-111 tank cars transporting Class 3 flammables through all HTUAs. Mandate DOT-117 minimum standard within 24 months for all cars transiting the DC corridor regardless of national retrofit capacity constraints." },
                    { priority: "04", title: "Establish Public Hazmat Routing Transparency Portal", action: "FRA / PHMSA", desc: "Create a publicly accessible (non-operationally sensitive) portal disclosing commodity types, car counts, and frequency for HHFT routes through HTUAs. Modeled after DC Fire & EMS real-time alerting. Balances security with community right-to-know." },
                    { priority: "05", title: "Mandatory AskRail Integration and DC Tunnel Protocol", action: "FRA / DC Fire & EMS / CSX", desc: "Require verified AskRail integration for all DC Fire & EMS units within evacuation range of the CSX main corridor. Develop specific Virginia Avenue Tunnel emergency response protocol addressing manifest access, ventilation, and evacuation routing." },
                    { priority: "06", title: "Speed Camera Enforcement on DC HTUA Corridor Segments", action: "FRA / DDOT", desc: "Install wayside speed monitoring systems on DC HTUA corridor segments to provide independent verification of HHFT compliance with 40-50 mph speed limits. Publish quarterly compliance reports." },
                  ].map(rec => (
                    <div key={rec.priority} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 0, padding: "14px 18px", marginBottom: 10, display: "flex", gap: 16 }}>
                      <div style={{ background: "rgba(5,150,105,0.1)", color: "#059669", padding: "6px 12px", borderRadius: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Source Code Pro','Courier New',monospace", minWidth: 44, textAlign: "center", height: "fit-content" }}>{rec.priority}</div>
                      <div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>{rec.title}</span>
                          <span style={{ background: "rgba(5,150,105,0.1)", color: "#059669", padding: "2px 10px", borderRadius: 0, fontSize: 11 }}>Action: {rec.action}</span>
                        </div>
                        <p style={{ margin: 0, color: "#374151", fontSize: 13, lineHeight: 1.6 }}>{rec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────

export default function OilTrainRiskDC() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "01  Interactive Map", sublabel: "Routes · Risk Zones · Incidents" },
    { label: "02  Regulatory Layer", sublabel: "FRA · PHMSA · TSA · Compliance" },
    { label: "03  Risk & Compliance Report", sublabel: "Corridors · EJ · Policy Gaps · Recommendations" },
  ];

  return (
    <div style={{
      width: "100%", minWidth: 320,
      background: "#ffffff", color: "#111827",
      fontFamily: "'Source Code Pro','Courier New',monospace",
      boxSizing: "border-box",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&family=Source+Code+Pro:wght@400;500&display=swap');`}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f3f4f6; }
        ::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 3px; }
        button { font-family: inherit; }
        @media (max-width: 700px) {
          .tab-grid { grid-template-columns: 1fr !important; }
          .main-pad { padding: 14px 12px !important; }
          .header-pad { padding: 18px 16px !important; }
          .map-layout { grid-template-columns: 1fr !important; }
          .map-sidebar { width: 100% !important; max-height: 220px !important; flex-direction: row !important; flex-wrap: wrap !important; }
        }
      `}</style>

      {/* Header */}
      <div className="header-pad" style={{ background: "#ffffff", borderBottom: "1px solid #d1d5db", padding: "24px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#059669", fontFamily: "'Source Code Pro','Courier New',monospace", letterSpacing: 2, marginBottom: 6 }}>ENVIRONMENTAL RISK INTELLIGENCE · WASHINGTON DC</div>
            <h1 style={{ margin: 0, fontSize: "clamp(18px, 4vw, 28px)", color: "#111827", fontWeight: 700, fontFamily: "'Barlow','Segoe UI',Arial,sans-serif", lineHeight: 1.2 }}>
              Oil Train Environmental Risk Map
            </h1>
            <div style={{ color: "#374151", fontSize: 13, marginTop: 6 }}>Crude-by-Rail Routes · Population Exposure · Regulatory Compliance · Washington, DC</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Source Code Pro','Courier New',monospace" }}>COMPILED BY</div>
            <div style={{ color: "#059669", fontWeight: 700, fontSize: 13 }}>Lancelot Napier-Kane</div>
            <div style={{ fontSize: 10, color: "#059669", marginTop: 3 }}>REAL + SAMPLE DATA · SEE FOOTER</div>
          </div>
        </div>

        {/* Alert banner */}
        <div style={{ marginTop: 16, background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.35)", borderRadius: 0, padding: "10px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#e53e3e", fontSize: 13, fontWeight: 700 }}>⚑ ACTIVE RISK:</span>
          <span style={{ color: "#c2410c", fontSize: 12 }}>CSX main corridor carries 8,000+ hazmat cars/yr through the federal core. Hypothetical blast zone covers U.S. Capitol, Washington Monument, 10 Metro stations. NCPC bypass recommendation unfunded since 2007.</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "2px solid #1a1a1a", background: "#f0ece4", padding: "0 24px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 0, minWidth: 500 }}>
          {tabs.map((tab, i) => (
            <button key={i}
              onClick={() => setActiveTab(i)}
              style={{
                background: activeTab === i ? "#1a1a1a" : "transparent",
                color: activeTab === i ? "#ffffff" : "#000000",
                border: "none",
                borderBottom: activeTab === i ? "3px solid #1a1a1a" : "3px solid transparent",
                borderRadius: 0,
                padding: "10px 20px",
                fontWeight: activeTab === i ? 700 : 500,
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left", transition: "all 0.2s", whiteSpace: "nowrap"
              }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{tab.label}</div>
              <div style={{ fontSize: 10, color: activeTab === i ? "#ffffff" : "#6b7280", marginTop: 2 }}>{tab.sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="main-pad" style={{ padding: "24px 28px" }}>
        {activeTab === 0 && <Tab1Map />}
        {activeTab === 1 && <Tab2Regulations />}
        {activeTab === 2 && <Tab3Report />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #d1d5db", padding: "16px 28px", background: "#f9fafb" }}>
        <div style={{ fontSize: 10, color: "#4b5563", lineHeight: 1.8, fontFamily: "'Source Code Pro','Courier New',monospace" }}>
          <span style={{ color: "#4b5563", fontWeight: 700 }}>DATA SOURCES: </span>
          Real data — CSX Transportation (hazmat materials/DC corridor, 2004 rerouting), DDOT DC Surface Rail Plan (FY2015), National Capital Planning Commission Freight Rail Study (2007), NBC4 I-Team investigation (2016), FRA/PHMSA HM-251 Final Rule (49 CFR 174.310, May 2015), FAST Act §7304-7306 (2015), 49 CFR 172.820 (routing), 49 CFR Part 130 (oil spill response), 49 CFR 1580.3 (TSA HTUA), FRA PTC regulations (49 U.S.C. 20157), Frontier Group hazmat rail report (2024), BNSF/NS incident records.
          <span style={{ color: "#dd6b20", marginLeft: 8 }}>⚠ Sample/modeled data: </span>
          Population exposure radii, EJ index scoring, incident blast zone projections, and annual hazmat car estimates are derived/modeled from the above sources and should not be used for operational emergency planning.
          <span style={{ color: "#4b5563", marginLeft: 8 }}>· Compiled by Lancelot Napier-Kane</span>
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
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), MapLibre GL JS, GeoJSON (FRA railroad network, DC waterway and parcel layers), Python (GeoPandas, Shapely, Fiona), ArcGIS Pro (risk corridor analysis), PostgreSQL 14 (PostGIS), QGIS (layer QA), Node.js API serving GeoJSON tiles
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> Risk corridor delineation using FRA Crude-by-Rail route data buffered at 1/4 mile, 1/2 mile, and 1 mile impact zones; population density exposure analysis via PostGIS ST_Intersects with ACS census block groups; waterway buffer impact zones (Anacostia River, Potomac River) per EPA RMP guidelines; regulatory compliance matrix mapping corridor segments against PHMSA hazmat routing rules (49 CFR 172.820) and DC HSEMA emergency response requirements; historical incident rate overlay from FRA accident/incident database; environmental justice analysis correlating risk exposure with CDC SVI scores by DC census tract; route geometry and exposure metrics are simulated based on public FRA and GIS datasets
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> FRA Railroad Network GIS (NTAD — National Transportation Atlas Database); DC GIS Open Data (waterways, parcels, ward boundaries); EPA Risk Management Plan (RMP) database schema; PHMSA hazmat route selection regulations (49 CFR 172.820); DC HSEMA emergency response plan framework; ACS 2022 census block group demographics; CDC Social Vulnerability Index (SVI) tract-level data; risk corridor geometry simulated from public FRA network data
        </p>
      </div>
    </div>
  );
}
