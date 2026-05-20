import { useState, useEffect, useMemo, useCallback } from "react";

// ============================================================================
// SALES TEAM HARDWARE COMPATIBILITY & NEED MATRIX
// Enterprise Fleet Telematics + Sales Engineering Intelligence Simulator
// Standalone Portfolio Simulation — All Data Procedurally Generated
// ============================================================================

// --- TYPE DEFINITIONS ---

interface DecisionNode {
  id: string;
  label: string;
  description: string;
  icon: string;
  children?: DecisionNode[];
  isTerminal?: boolean;
  metadata?: Record<string, string | number>;
  color?: string;
}

interface FleetClient {
  id: string;
  companyName: string;
  industry: string;
  fleetSize: number;
  avgVehicleAge: number;
  digitalMaturity: number;
  telematicsPenetration: number;
  annualRevenue: string;
  region: string;
  riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  crmStage: string;
  healthScore: number;
  lastContact: string;
  primaryContact: string;
  existingStack: string[];
}

interface HardwareDevice {
  id: string;
  name: string;
  category: string;
  compatibilityScore: number;
  obdSupport: string[];
  canBusVersion: string;
  evCompatible: boolean;
  thermalTolerance: string;
  gpuInference: boolean;
  pricePerUnit: number;
  installationHours: number;
  warrantyMonths: number;
}

interface SalesPackage {
  id: string;
  name: string;
  tier: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "GOVERNMENT";
  monthlyBase: number;
  perDeviceFee: number;
  includedDevices: string[];
  features: string[];
  slaLevel: string;
  contractMinMonths: number;
  discountEligible: boolean;
  marginPercent: number;
}

interface CompatibilityResult {
  overallScore: number;
  hardwareMatch: number;
  networkReadiness: number;
  installComplexity: number;
  retrofitRequired: boolean;
  estimatedDeploymentDays: number;
  riskFlags: string[];
  recommendations: string[];
}

interface SalesScript {
  openingPitch: string;
  technicalJustification: string;
  objectionHandlers: { objection: string; response: string }[];
  roiFraming: string;
  complianceReassurance: string;
  closingStatement: string;
}

interface CRMSignal {
  source: string;
  metric: string;
  value: number;
  trend: "UP" | "DOWN" | "STABLE";
  lastUpdated: string;
  weight: number;
}

interface TelematicsEvent {
  id: string;
  timestamp: string;
  vehicleId: string;
  eventType: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  latitude: number;
  longitude: number;
  speed: number;
  description: string;
}

// --- SYNTHETIC DATA GENERATORS ---

const INDUSTRY_VERTICALS = [
  "Logistics & Distribution",
  "Construction & Heavy Equipment",
  "Municipal & Government",
  "Last-Mile Delivery",
  "Field Services",
  "Passenger Transport",
  "Waste Management",
  "Utilities & Energy",
  "Food & Beverage Distribution",
  "Pharmaceutical Logistics",
];

const VEHICLE_TYPES = [
  "Class 8 Semi-Trucks",
  "Class 6-7 Medium Duty",
  "Sprinter Vans",
  "Pickup Trucks",
  "Box Trucks",
  "Refrigerated Units",
  "Construction Equipment",
  "Municipal Vehicles",
  "Electric Vehicles",
  "Mixed Fleet",
];

const CRM_STAGES = [
  "Lead Qualification",
  "Discovery",
  "Technical Assessment",
  "Proposal Submitted",
  "Negotiation",
  "Contract Review",
  "Closed Won",
  "Onboarding",
  "Active Customer",
  "Renewal Pipeline",
];

const EXISTING_STACKS = [
  "Geotab",
  "Samsara",
  "Verizon Connect",
  "Omnitracs",
  "KeepTruckin",
  "Teletrac Navman",
  "GPS Trackit",
  "None",
  "Legacy OEM",
  "Custom Solution",
];

// Tile colors for the decision matrix
const TILE_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-lime-500",
  "bg-sky-500",
];

const generateFleetClients = (): FleetClient[] => {
  const companies = [
    "Apex Logistics Corp",
    "BuildRight Construction",
    "Metro Transit Authority",
    "QuickShip Delivery",
    "TechServ Field Solutions",
    "GreenWaste Management",
    "PharmaMove Inc",
    "ColdChain Distributors",
    "United Utilities Corp",
    "FreshFood Logistics",
    "Continental Freight",
    "Urban Mobility Services",
    "Industrial Fleet Co",
    "Regional Express",
    "SafeHaul Transport",
    "Precision Delivery",
    "MegaFleet Industries",
    "EcoTransport LLC",
    "Prime Logistics Group",
    "National Service Fleet",
  ];

  return companies.map((name, i) => ({
    id: `FLC-${String(i + 1).padStart(4, "0")}`,
    companyName: name,
    industry: INDUSTRY_VERTICALS[i % INDUSTRY_VERTICALS.length],
    fleetSize: Math.floor(Math.random() * 2000) + 50,
    avgVehicleAge: Math.floor(Math.random() * 8) + 2,
    digitalMaturity: Math.floor(Math.random() * 40) + 60,
    telematicsPenetration: Math.floor(Math.random() * 60) + 20,
    annualRevenue: `$${Math.floor(Math.random() * 500) + 10}M`,
    region: ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific Northwest"][i % 6],
    riskTier: (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const)[Math.floor(Math.random() * 4)],
    crmStage: CRM_STAGES[Math.floor(Math.random() * CRM_STAGES.length)],
    healthScore: Math.floor(Math.random() * 40) + 60,
    lastContact: `${Math.floor(Math.random() * 14) + 1} days ago`,
    primaryContact: ["VP Operations", "Fleet Manager", "CFO", "Procurement Director", "Safety Director"][i % 5],
    existingStack: [EXISTING_STACKS[Math.floor(Math.random() * EXISTING_STACKS.length)]],
  }));
};

const generateHardwareDevices = (): HardwareDevice[] => [
  {
    id: "HW-DC-PRO",
    name: "DriveCam AI Pro",
    category: "Dual-Facing Camera",
    compatibilityScore: 94,
    obdSupport: ["OBD-II", "J1939", "J1708"],
    canBusVersion: "CAN 2.0B",
    evCompatible: true,
    thermalTolerance: "-40°F to 185°F",
    gpuInference: true,
    pricePerUnit: 449,
    installationHours: 1.5,
    warrantyMonths: 36,
  },
  {
    id: "HW-DC-LITE",
    name: "DriveCam Lite",
    category: "Forward-Facing Camera",
    compatibilityScore: 98,
    obdSupport: ["OBD-II"],
    canBusVersion: "CAN 2.0A",
    evCompatible: true,
    thermalTolerance: "-22°F to 158°F",
    gpuInference: false,
    pricePerUnit: 249,
    installationHours: 0.75,
    warrantyMonths: 24,
  },
  {
    id: "HW-DC-360",
    name: "DriveCam 360 Surround",
    category: "Multi-Camera Array",
    compatibilityScore: 82,
    obdSupport: ["OBD-II", "J1939", "J1708", "ISO 15765"],
    canBusVersion: "CAN FD",
    evCompatible: true,
    thermalTolerance: "-40°F to 185°F",
    gpuInference: true,
    pricePerUnit: 899,
    installationHours: 3.5,
    warrantyMonths: 36,
  },
  {
    id: "HW-TLM-EDGE",
    name: "Telematics Edge Gateway",
    category: "Data Gateway",
    compatibilityScore: 91,
    obdSupport: ["OBD-II", "J1939"],
    canBusVersion: "CAN 2.0B",
    evCompatible: true,
    thermalTolerance: "-22°F to 158°F",
    gpuInference: false,
    pricePerUnit: 189,
    installationHours: 0.5,
    warrantyMonths: 24,
  },
  {
    id: "HW-GPS-PRO",
    name: "GPS Tracker Pro",
    category: "Asset Tracker",
    compatibilityScore: 99,
    obdSupport: ["Standalone"],
    canBusVersion: "N/A",
    evCompatible: true,
    thermalTolerance: "-40°F to 185°F",
    gpuInference: false,
    pricePerUnit: 99,
    installationHours: 0.25,
    warrantyMonths: 24,
  },
  {
    id: "HW-SENSOR-HUB",
    name: "IoT Sensor Hub",
    category: "Environmental Sensor",
    compatibilityScore: 95,
    obdSupport: ["Bluetooth", "Zigbee"],
    canBusVersion: "N/A",
    evCompatible: true,
    thermalTolerance: "-4°F to 140°F",
    gpuInference: false,
    pricePerUnit: 149,
    installationHours: 0.5,
    warrantyMonths: 18,
  },
];

const generateSalesPackages = (): SalesPackage[] => [
  {
    id: "PKG-STARTER",
    name: "Fleet Safety Starter",
    tier: "STARTER",
    monthlyBase: 299,
    perDeviceFee: 29,
    includedDevices: ["DriveCam Lite", "GPS Tracker Pro"],
    features: ["Basic Event Detection", "GPS Tracking", "Driver Scorecards", "Email Alerts", "Standard Reports"],
    slaLevel: "Business Hours",
    contractMinMonths: 12,
    discountEligible: false,
    marginPercent: 42,
  },
  {
    id: "PKG-PRO",
    name: "Fleet Safety Professional",
    tier: "PROFESSIONAL",
    monthlyBase: 599,
    perDeviceFee: 49,
    includedDevices: ["DriveCam AI Pro", "Telematics Edge Gateway"],
    features: [
      "AI Event Detection",
      "Real-Time Coaching",
      "Advanced Analytics",
      "API Access",
      "Custom Dashboards",
      "24/7 Support",
    ],
    slaLevel: "24/7 Priority",
    contractMinMonths: 24,
    discountEligible: true,
    marginPercent: 48,
  },
  {
    id: "PKG-ENTERPRISE",
    name: "Enterprise Fleet Intelligence",
    tier: "ENTERPRISE",
    monthlyBase: 1299,
    perDeviceFee: 69,
    includedDevices: ["DriveCam 360 Surround", "Telematics Edge Gateway", "IoT Sensor Hub"],
    features: [
      "Full AI Suite",
      "Predictive Maintenance",
      "Custom Integrations",
      "Dedicated CSM",
      "SLA Guarantees",
      "White-Label Options",
    ],
    slaLevel: "Dedicated Support",
    contractMinMonths: 36,
    discountEligible: true,
    marginPercent: 52,
  },
  {
    id: "PKG-GOV",
    name: "Government & Municipal",
    tier: "GOVERNMENT",
    monthlyBase: 999,
    perDeviceFee: 59,
    includedDevices: ["DriveCam AI Pro", "GPS Tracker Pro", "Telematics Edge Gateway"],
    features: [
      "FedRAMP Compliance",
      "CJIS Compatibility",
      "Audit Trails",
      "Data Residency Options",
      "Public Records Support",
    ],
    slaLevel: "Government SLA",
    contractMinMonths: 36,
    discountEligible: false,
    marginPercent: 45,
  },
];

const generateTelematicsEvents = (): TelematicsEvent[] => {
  const eventTypes = [
    "Hard Brake",
    "Rapid Acceleration",
    "Harsh Cornering",
    "Speeding",
    "Distracted Driving",
    "Following Too Close",
    "Lane Departure",
    "Collision Warning",
    "Fatigue Alert",
    "Phone Use Detected",
  ];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `EVT-${String(i + 1).padStart(5, "0")}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    vehicleId: `VEH-${String(Math.floor(Math.random() * 500) + 1).padStart(4, "0")}`,
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    severity: (["INFO", "WARNING", "CRITICAL"] as const)[Math.floor(Math.random() * 3)],
    latitude: 32.7157 + (Math.random() - 0.5) * 2,
    longitude: -117.1611 + (Math.random() - 0.5) * 2,
    speed: Math.floor(Math.random() * 40) + 35,
    description: "AI-detected safety event captured by edge device",
  }));
};

const generateCRMSignals = (): CRMSignal[] => [
  { source: "Salesforce", metric: "Pipeline Value", value: 2450000, trend: "UP", lastUpdated: "2 hrs ago", weight: 0.25 },
  { source: "Salesforce", metric: "Win Rate", value: 34, trend: "STABLE", lastUpdated: "1 day ago", weight: 0.2 },
  { source: "Gainsight", metric: "Health Score Avg", value: 78, trend: "UP", lastUpdated: "4 hrs ago", weight: 0.2 },
  { source: "Gainsight", metric: "Churn Risk", value: 12, trend: "DOWN", lastUpdated: "1 day ago", weight: 0.15 },
  { source: "Zendesk", metric: "CSAT Score", value: 4.2, trend: "STABLE", lastUpdated: "6 hrs ago", weight: 0.1 },
  { source: "Zendesk", metric: "Avg Resolution Time", value: 4.8, trend: "DOWN", lastUpdated: "12 hrs ago", weight: 0.05 },
  { source: "HubSpot", metric: "Email Open Rate", value: 28, trend: "UP", lastUpdated: "3 hrs ago", weight: 0.05 },
];

// --- DECISION TREE STRUCTURE ---

const DECISION_TREE: DecisionNode[] = [
  {
    id: "fleet-type",
    label: "Fleet Type",
    description: "Primary fleet composition and vehicle classification",
    icon: "TRUCK",
    color: "bg-blue-500",
    children: [
      { id: "ft-logistics", label: "Logistics Fleet", description: "Long-haul and regional distribution", icon: "BOX", isTerminal: true, color: "bg-blue-400" },
      { id: "ft-construction", label: "Construction Fleet", description: "Heavy equipment and work trucks", icon: "CRANE", isTerminal: true, color: "bg-blue-400" },
      { id: "ft-municipal", label: "Municipal Fleet", description: "Government and public service vehicles", icon: "BUILDING", isTerminal: true, color: "bg-blue-400" },
      { id: "ft-delivery", label: "Delivery Fleet", description: "Last-mile and parcel delivery", icon: "PACKAGE", isTerminal: true, color: "bg-blue-400" },
      { id: "ft-mixed", label: "Mixed Commercial", description: "Heterogeneous vehicle composition", icon: "GRID", isTerminal: true, color: "bg-blue-400" },
      { id: "ft-highrisk", label: "High-Risk Transport", description: "Hazmat, fuel, and specialized cargo", icon: "ALERT", isTerminal: true, color: "bg-blue-400" },
    ],
  },
  {
    id: "industry",
    label: "Industry Vertical",
    description: "Client business sector and operational context",
    icon: "BRIEFCASE",
    color: "bg-emerald-500",
    children: [
      { id: "ind-logistics", label: "Logistics & 3PL", description: "Third-party logistics providers", icon: "NETWORK", isTerminal: true, color: "bg-emerald-400" },
      { id: "ind-construction", label: "Construction", description: "Building and infrastructure", icon: "HAMMER", isTerminal: true, color: "bg-emerald-400" },
      { id: "ind-government", label: "Government", description: "Federal, state, and local agencies", icon: "FLAG", isTerminal: true, color: "bg-emerald-400" },
      { id: "ind-retail", label: "Retail & E-Commerce", description: "Consumer goods distribution", icon: "CART", isTerminal: true, color: "bg-emerald-400" },
      { id: "ind-healthcare", label: "Healthcare & Pharma", description: "Medical supply chain", icon: "MEDICAL", isTerminal: true, color: "bg-emerald-400" },
      { id: "ind-energy", label: "Energy & Utilities", description: "Power and resource companies", icon: "BOLT", isTerminal: true, color: "bg-emerald-400" },
    ],
  },
  {
    id: "vehicle-age",
    label: "Vehicle Age Profile",
    description: "Fleet age distribution and hardware compatibility",
    icon: "CALENDAR",
    color: "bg-amber-500",
    children: [
      { id: "va-new", label: "New Fleet (0-3 yrs)", description: "Modern vehicles with native connectivity", icon: "STAR", isTerminal: true, color: "bg-amber-400" },
      { id: "va-mid", label: "Mid-Age (3-7 yrs)", description: "Standard retrofit requirements", icon: "CHECK", isTerminal: true, color: "bg-amber-400" },
      { id: "va-legacy", label: "Legacy (7-12 yrs)", description: "Complex integration needs", icon: "WRENCH", isTerminal: true, color: "bg-amber-400" },
      { id: "va-mixed", label: "Mixed Age", description: "Variable compatibility requirements", icon: "LAYERS", isTerminal: true, color: "bg-amber-400" },
    ],
  },
  {
    id: "connectivity",
    label: "Connectivity Profile",
    description: "Network coverage and data transmission capability",
    icon: "SIGNAL",
    color: "bg-rose-500",
    children: [
      { id: "conn-urban", label: "Urban Coverage", description: "Consistent LTE/5G availability", icon: "CITY", isTerminal: true, color: "bg-rose-400" },
      { id: "conn-suburban", label: "Suburban/Regional", description: "Mixed coverage quality", icon: "HOME", isTerminal: true, color: "bg-rose-400" },
      { id: "conn-rural", label: "Rural Operations", description: "Limited connectivity, edge buffering required", icon: "TREE", isTerminal: true, color: "bg-rose-400" },
      { id: "conn-mixed", label: "Mixed Routes", description: "Variable coverage patterns", icon: "MAP", isTerminal: true, color: "bg-rose-400" },
    ],
  },
  {
    id: "risk-profile",
    label: "Risk Severity Profile",
    description: "Driver safety and operational risk assessment",
    icon: "SHIELD",
    color: "bg-violet-500",
    children: [
      { id: "risk-low", label: "Low Risk", description: "Experienced drivers, established routes", icon: "THUMBUP", isTerminal: true, color: "bg-violet-400" },
      { id: "risk-moderate", label: "Moderate Risk", description: "Standard commercial operations", icon: "MINUS", isTerminal: true, color: "bg-violet-400" },
      { id: "risk-high", label: "High Risk", description: "New drivers, hazardous conditions", icon: "WARNING", isTerminal: true, color: "bg-violet-400" },
      { id: "risk-critical", label: "Critical Risk", description: "Regulatory scrutiny, incident history", icon: "ALERT", isTerminal: true, color: "bg-violet-400" },
    ],
  },
  {
    id: "sales-tier",
    label: "Sales Tier",
    description: "Account size and strategic importance",
    icon: "DOLLAR",
    color: "bg-cyan-500",
    children: [
      { id: "tier-smb", label: "SMB (10-99 units)", description: "Small-medium business segment", icon: "USERS", isTerminal: true, color: "bg-cyan-400" },
      { id: "tier-mid", label: "Mid-Market (100-499)", description: "Growing commercial accounts", icon: "TRENDING", isTerminal: true, color: "bg-cyan-400" },
      { id: "tier-enterprise", label: "Enterprise (500+)", description: "Large fleet deployments", icon: "BUILDING", isTerminal: true, color: "bg-cyan-400" },
      { id: "tier-strategic", label: "Strategic Account", description: "Named accounts with expansion potential", icon: "TARGET", isTerminal: true, color: "bg-cyan-400" },
    ],
  },
  {
    id: "deployment-speed",
    label: "Deployment Timeline",
    description: "Required implementation velocity",
    icon: "CLOCK",
    color: "bg-orange-500",
    children: [
      { id: "deploy-urgent", label: "Urgent (< 30 days)", description: "Regulatory or incident-driven", icon: "LIGHTNING", isTerminal: true, color: "bg-orange-400" },
      { id: "deploy-standard", label: "Standard (30-90 days)", description: "Normal procurement cycle", icon: "CALENDAR", isTerminal: true, color: "bg-orange-400" },
      { id: "deploy-phased", label: "Phased (90+ days)", description: "Gradual rollout approach", icon: "LAYERS", isTerminal: true, color: "bg-orange-400" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance Requirements",
    description: "Regulatory and certification needs",
    icon: "CERTIFICATE",
    color: "bg-teal-500",
    children: [
      { id: "comp-eld", label: "ELD Mandate", description: "Hours of Service compliance", icon: "CLOCK", isTerminal: true, color: "bg-teal-400" },
      { id: "comp-dvir", label: "DVIR Required", description: "Daily vehicle inspection reports", icon: "CLIPBOARD", isTerminal: true, color: "bg-teal-400" },
      { id: "comp-hazmat", label: "Hazmat Certified", description: "Dangerous goods transport", icon: "HAZARD", isTerminal: true, color: "bg-teal-400" },
      { id: "comp-fedramp", label: "FedRAMP/CJIS", description: "Government security standards", icon: "LOCK", isTerminal: true, color: "bg-teal-400" },
      { id: "comp-none", label: "Standard Commercial", description: "No special compliance needs", icon: "CHECK", isTerminal: true, color: "bg-teal-400" },
    ],
  },
  {
    id: "budget",
    label: "Budget Sensitivity",
    description: "Price elasticity and procurement constraints",
    icon: "WALLET",
    color: "bg-pink-500",
    children: [
      { id: "budget-premium", label: "Premium Budget", description: "Value-focused, feature-driven", icon: "DIAMOND", isTerminal: true, color: "bg-pink-400" },
      { id: "budget-standard", label: "Standard Budget", description: "Balanced cost-value approach", icon: "BALANCE", isTerminal: true, color: "bg-pink-400" },
      { id: "budget-constrained", label: "Constrained Budget", description: "Price-sensitive procurement", icon: "LOCK", isTerminal: true, color: "bg-pink-400" },
      { id: "budget-government", label: "Government/Grant", description: "Fixed budget cycles", icon: "FLAG", isTerminal: true, color: "bg-pink-400" },
    ],
  },
  {
    id: "existing-stack",
    label: "Existing Telematics",
    description: "Current technology deployment status",
    icon: "LAYERS",
    color: "bg-indigo-500",
    children: [
      { id: "stack-none", label: "Greenfield", description: "No existing telematics solution", icon: "PLUS", isTerminal: true, color: "bg-indigo-400" },
      { id: "stack-legacy", label: "Legacy System", description: "Outdated solution requiring replacement", icon: "ARCHIVE", isTerminal: true, color: "bg-indigo-400" },
      { id: "stack-competitor", label: "Competitor Installed", description: "Active competitive displacement", icon: "SWITCH", isTerminal: true, color: "bg-indigo-400" },
      { id: "stack-partial", label: "Partial Coverage", description: "Incomplete fleet coverage", icon: "PIECHART", isTerminal: true, color: "bg-indigo-400" },
    ],
  },
  {
    id: "maturity",
    label: "Digital Maturity",
    description: "Technology adoption readiness",
    icon: "CHIP",
    color: "bg-lime-500",
    children: [
      { id: "mat-advanced", label: "Advanced", description: "API-first, data-driven operations", icon: "CODE", isTerminal: true, color: "bg-lime-400" },
      { id: "mat-developing", label: "Developing", description: "Building digital capabilities", icon: "TRENDING", isTerminal: true, color: "bg-lime-400" },
      { id: "mat-basic", label: "Basic", description: "Manual processes, limited tech", icon: "HAND", isTerminal: true, color: "bg-lime-400" },
    ],
  },
  {
    id: "integration",
    label: "Integration Needs",
    description: "Enterprise system connectivity requirements",
    icon: "PLUG",
    color: "bg-sky-500",
    children: [
      { id: "int-erp", label: "ERP Integration", description: "NetSuite, SAP, Oracle connectivity", icon: "DATABASE", isTerminal: true, color: "bg-sky-400" },
      { id: "int-tms", label: "TMS Integration", description: "Transportation management systems", icon: "ROUTE", isTerminal: true, color: "bg-sky-400" },
      { id: "int-custom", label: "Custom API", description: "Bespoke integration requirements", icon: "CODE", isTerminal: true, color: "bg-sky-400" },
      { id: "int-standalone", label: "Standalone", description: "No integration required", icon: "BOX", isTerminal: true, color: "bg-sky-400" },
    ],
  },
];

// --- COMPATIBILITY ENGINE ---

const calculateCompatibility = (selections: string[]): CompatibilityResult => {
  const baseScore = 85;
  const modifiers = selections.length * 2;
  const hasLegacy = selections.some(s => s.includes("legacy") || s.includes("Legacy"));
  const hasRural = selections.some(s => s.includes("rural") || s.includes("Rural"));
  const hasHighRisk = selections.some(s => s.includes("high") || s.includes("critical"));
  
  const overallScore = Math.min(98, Math.max(65, baseScore + modifiers - (hasLegacy ? 12 : 0) - (hasRural ? 8 : 0)));
  
  return {
    overallScore,
    hardwareMatch: Math.min(99, overallScore + Math.floor(Math.random() * 10)),
    networkReadiness: hasRural ? 72 : 94,
    installComplexity: hasLegacy ? 78 : 92,
    retrofitRequired: hasLegacy,
    estimatedDeploymentDays: hasLegacy ? 45 : 21,
    riskFlags: [
      ...(hasLegacy ? ["Legacy vehicle retrofit complexity may increase installation time"] : []),
      ...(hasRural ? ["Rural connectivity may require edge buffering configuration"] : []),
      ...(hasHighRisk ? ["High-risk profile warrants enhanced monitoring package"] : []),
    ],
    recommendations: [
      "Recommend phased deployment starting with newest vehicles",
      "Include driver training module in initial rollout",
      hasLegacy ? "Budget for OBD-II adapter kits for pre-2012 vehicles" : "Standard installation kit sufficient",
    ],
  };
};

// --- SALES SCRIPT GENERATOR ---

const generateSalesScript = (selections: string[], packageName: string): SalesScript => {
  const isEnterprise = selections.some(s => s.includes("enterprise") || s.includes("Enterprise") || s.includes("500+"));
  const isGovernment = selections.some(s => s.includes("government") || s.includes("Government") || s.includes("Municipal"));
  const hasCompetitor = selections.some(s => s.includes("competitor") || s.includes("Competitor"));
  
  return {
    openingPitch: isGovernment
      ? `"I understand fleet safety and compliance are top priorities for your agency. Our ${packageName} solution is specifically designed to meet FedRAMP and CJIS requirements while delivering measurable safety improvements..."`
      : isEnterprise
      ? `"Given the scale of your fleet operations, I want to show you how our ${packageName} platform has helped similar enterprises reduce incident rates by 35% while cutting insurance premiums..."`
      : `"Let me walk you through how ${packageName} can transform your fleet safety program with AI-powered event detection and real-time coaching..."`,
    technicalJustification: `"Our edge-computing architecture processes video locally on the device, meaning you get instant alerts without bandwidth constraints. The system supports J1939, OBD-II, and CAN FD protocols, ensuring compatibility across your mixed fleet."`,
    objectionHandlers: [
      {
        objection: "We already have GPS tracking",
        response: "GPS shows you where vehicles are, but our AI vision system shows you what drivers are doing. We've helped fleets reduce distracted driving incidents by 60% within 90 days—something GPS alone cannot address.",
      },
      {
        objection: "The per-device cost seems high",
        response: "I understand the concern. Let me share a quick ROI analysis: the average cost of a preventable accident is $74,000. If our system prevents just one incident per 100 vehicles annually, you're looking at a 400% return on investment.",
      },
      {
        objection: "Our drivers will resist being monitored",
        response: "That's a common concern. Our approach focuses on coaching, not punishment. 87% of drivers report feeling safer with the system, and we've seen driver retention actually improve because they appreciate the professional development.",
      },
      {
        objection: "Implementation seems complex",
        response: "We've streamlined the process significantly. Our certified technicians handle installation in under 2 hours per vehicle with zero downtime. We'll have your fleet fully operational within 30 days.",
      },
    ],
    roiFraming: `"Based on your fleet size and current risk profile, we're projecting annual savings of $${(Math.floor(Math.random() * 200) + 150)}K in reduced incidents, plus an estimated 12-18% reduction in insurance premiums upon policy renewal."`,
    complianceReassurance: isGovernment
      ? "Our platform maintains FedRAMP Moderate authorization and supports CJIS compliance for law enforcement applications. All data residency requirements can be configured to your specifications."
      : "We maintain SOC 2 Type II certification and support data retention policies that align with DOT requirements. Full audit trails are available for regulatory review.",
    closingStatement: hasCompetitor
      ? `"I know switching providers feels like a big decision. We offer a 90-day parallel run option so you can validate performance before fully transitioning. What questions do you have about the migration process?"`
      : `"Based on everything we've discussed, ${packageName} is clearly the right fit for your fleet. I can have a contract ready for review by end of week—does that timeline work for your procurement process?"`,
  };
};

// --- ICON COMPONENT ---

const Icon = ({ name, className = "" }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    TRUCK: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H3a1 1 0 00-1 1v10h11zm0 0h6a1 1 0 001-1v-4.586a1 1 0 00-.293-.707l-3.414-3.414A1 1 0 0015.586 6H13" />,
    BOX: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    BRIEFCASE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    CALENDAR: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    SIGNAL: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.142 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />,
    SHIELD: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    DOLLAR: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    CLOCK: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    CERTIFICATE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    WALLET: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    LAYERS: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
    CHIP: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />,
    PLUG: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    ARROW_LEFT: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
    CHECK: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />,
    WARNING: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    ALERT: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    TRENDING: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    TARGET: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    DATABASE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />,
    USERS: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    LIGHTNING: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    GRID: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    MAP: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
    ROUTE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    CODE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    NETWORK: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />,
    BUILDING: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    PLUS: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />,
    LOCK: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    REFRESH: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    PACKAGE: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  };
  
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name] || icons.BOX}
    </svg>
  );
};

// --- MINI CHART COMPONENTS ---

const MiniBarChart = ({ data, height = 60, color = "#3b82f6" }: { data: number[]; height?: number; color?: string }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all duration-300"
          style={{
            height: `${(value / max) * 100}%`,
            backgroundColor: color,
            opacity: 0.7 + (i / data.length) * 0.3,
          }}
        />
      ))}
    </div>
  );
};

const MiniLineChart = ({ data, height = 60, color = "#3b82f6" }: { data: number[]; height?: number; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height, width: "100%" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      <polyline
        fill={`${color}20`}
        stroke="none"
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
};

const MiniDonutChart = ({ value, size = 48, color = "#3b82f6" }: { value: number; size?: number; color?: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="24" textAnchor="middle" dominantBaseline="middle" fill="#374151" fontSize="11" fontWeight="600">
        {value}%
      </text>
    </svg>
  );
};

// --- MAIN COMPONENT ---

export default function FleetSalesMatrixPage() {
  const [selectionStack, setSelectionStack] = useState<{ nodeId: string; label: string }[]>([]);
  const [currentNodes, setCurrentNodes] = useState<DecisionNode[]>(DECISION_TREE);
  const [showResults, setShowResults] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [telematicsEvents, setTelematicsEvents] = useState<TelematicsEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"matrix" | "pipeline" | "telemetry" | "analytics">("matrix");
  
  const fleetClients = useMemo(() => generateFleetClients(), []);
  const hardwareDevices = useMemo(() => generateHardwareDevices(), []);
  const salesPackages = useMemo(() => generateSalesPackages(), []);
  const crmSignals = useMemo(() => generateCRMSignals(), []);
  
  // Simulation clock
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Telematics event stream
  useEffect(() => {
    const events = generateTelematicsEvents();
    setTelematicsEvents(events);
    
    const interval = setInterval(() => {
      setTelematicsEvents(prev => {
        const newEvent: TelematicsEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          vehicleId: `VEH-${String(Math.floor(Math.random() * 500) + 1).padStart(4, "0")}`,
          eventType: ["Hard Brake", "Speeding", "Distracted Driving", "Lane Departure"][Math.floor(Math.random() * 4)],
          severity: (["INFO", "WARNING", "CRITICAL"] as const)[Math.floor(Math.random() * 3)],
          latitude: 32.7157 + (Math.random() - 0.5) * 2,
          longitude: -117.1611 + (Math.random() - 0.5) * 2,
          speed: Math.floor(Math.random() * 40) + 35,
          description: "AI-detected safety event captured by edge device",
        };
        return [newEvent, ...prev.slice(0, 49)];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleNodeClick = useCallback((node: DecisionNode) => {
    if (node.children && node.children.length > 0) {
      setSelectionStack(prev => [...prev, { nodeId: node.id, label: node.label }]);
      setCurrentNodes(node.children);
    } else if (node.isTerminal) {
      setSelectionStack(prev => [...prev, { nodeId: node.id, label: node.label }]);
      if (selectionStack.length >= 3) {
        setShowResults(true);
      }
    }
  }, [selectionStack.length]);
  
  const handleBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (selectionStack.length === 0) return;
    
    const newStack = selectionStack.slice(0, -1);
    setSelectionStack(newStack);
    
    // Navigate back through tree
    let nodes = DECISION_TREE;
    for (const selection of newStack) {
      const parent = nodes.find(n => n.id === selection.nodeId);
      if (parent?.children) {
        nodes = parent.children;
      }
    }
    setCurrentNodes(nodes.length > 0 ? nodes : DECISION_TREE);
  }, [selectionStack, showResults]);
  
  const resetMatrix = useCallback(() => {
    setSelectionStack([]);
    setCurrentNodes(DECISION_TREE);
    setShowResults(false);
  }, []);
  
  const compatibility = useMemo(() => 
    calculateCompatibility(selectionStack.map(s => s.label)), 
    [selectionStack]
  );
  
  const recommendedPackage = useMemo(() => {
    const isEnterprise = selectionStack.some(s => s.label.includes("Enterprise") || s.label.includes("500+"));
    const isGovernment = selectionStack.some(s => s.label.includes("Government") || s.label.includes("Municipal"));
    if (isGovernment) return salesPackages.find(p => p.tier === "GOVERNMENT")!;
    if (isEnterprise) return salesPackages.find(p => p.tier === "ENTERPRISE")!;
    return salesPackages.find(p => p.tier === "PROFESSIONAL")!;
  }, [selectionStack, salesPackages]);
  
  const salesScript = useMemo(() => 
    generateSalesScript(selectionStack.map(s => s.label), recommendedPackage?.name || "Fleet Safety Professional"),
    [selectionStack, recommendedPackage]
  );
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  
  return (
    <>
    <style>{`
      @media (max-width: 640px) {
        .sales-root { overflow-x: hidden !important; }
        .sales-root table { font-size: 11px !important; }
        .sales-root table td, .sales-root table th { padding: 4px 6px !important; }
        .sales-root .grid-cols-3, .sales-root .grid-cols-4, .sales-root .grid-cols-5 { grid-template-columns: 1fr 1fr !important; }
        .sales-root .grid-cols-6, .sales-root .grid-cols-7 { grid-template-columns: repeat(3, 1fr) !important; }

        /* Header: stack to prevent overflow */
        .sales-header > div { padding: 8px 12px !important; }
        .sales-header .sales-header-inner { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
        .sales-header h1 { font-size: 0.9rem !important; }
        .sales-header p { font-size: 0.65rem !important; }
        .sales-header .sales-header-icon { width: 28px !important; height: 28px !important; }
        /* Tab nav: wrap and shrink */
        .sales-header .sales-header-nav { flex-wrap: wrap !important; gap: 4px !important; width: 100% !important; }
        .sales-header .sales-header-nav button { padding: 4px 8px !important; font-size: 0.7rem !important; }
        .sales-header .sales-header-nav button .w-4 { display: none !important; }
        /* Status indicators: hide clock */
        .sales-header .sales-header-status { font-size: 0.65rem !important; }
        .sales-header .sales-header-clock { display: none !important; }

        /* Main content: prevent overflow */
        .sales-root main { padding: 10px 10px 20px !important; max-width: 100% !important; overflow-x: hidden !important; }
        .sales-root .max-w-\\[1800px\\] { max-width: 100% !important; padding-left: 10px !important; padding-right: 10px !important; }

        /* Horizontal flex containers above footnote: wrap */
        .sales-root .flex.items-center.justify-between { flex-wrap: wrap !important; gap: 6px !important; }
        .sales-root .flex.items-center.gap-6 { flex-wrap: wrap !important; gap: 6px !important; }
        .sales-root .flex.items-center.gap-4 { flex-wrap: wrap !important; gap: 4px !important; }

        /* Fixed-width containers that bleed */
        .sales-root .w-10, .sales-root .h-10 { width: 28px !important; height: 28px !important; }

        /* Footer: mobile-friendly */
        .sales-footer > div { padding: 10px 12px !important; }
        .sales-footer .flex.items-center.justify-between { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
        .sales-footer .flex.items-center.gap-6 { flex-wrap: wrap !important; gap: 4px !important; }
        .sales-footer .flex.items-center.gap-4 { flex-wrap: wrap !important; gap: 4px !important; }
      }
    `}</style>
    <div className="sales-root min-h-screen bg-gray-50 text-gray-900">
      {/* === HEADER === */}
      <header className="sales-header bg-blue-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="sales-header-inner flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="sales-header-icon w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon name="TRUCK" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">Fleet Sales Intelligence Matrix</h1>
                  <p className="text-xs text-blue-100">Hardware Compatibility & Need Assessment System</p>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <nav className="sales-header-nav flex items-center gap-1">
              {[
                { id: "matrix", label: "Decision Matrix", icon: "GRID" },
                { id: "pipeline", label: "CRM Pipeline", icon: "USERS" },
                { id: "telemetry", label: "Live Telemetry", icon: "SIGNAL" },
                { id: "analytics", label: "Analytics", icon: "TRENDING" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <Icon name={tab.icon} className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
            
            {/* Status Indicators */}
            <div className="sales-header-status flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Live</span>
              </div>
              <div className="sales-header-clock text-sm font-mono bg-white/10 px-3 py-1 rounded">
                {formatTime(simulationTime)}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* === MAIN CONTENT === */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {activeTab === "matrix" && (
          <div className="space-y-8">
            {/* Breadcrumb & Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectionStack.length > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Icon name="ARROW_LEFT" className="w-4 h-4" />
                    Back
                  </button>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Path:</span>
                  {selectionStack.length === 0 ? (
                    <span className="text-gray-700 font-medium">Select a category</span>
                  ) : (
                    selectionStack.map((sel, i) => (
                      <span key={sel.nodeId} className="flex items-center gap-2">
                        {i > 0 && <span className="text-gray-400">/</span>}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {sel.label}
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
              {selectionStack.length > 0 && (
                <button
                  onClick={resetMatrix}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Reset Matrix
                </button>
              )}
            </div>
            
            {/* Decision Matrix Grid */}
            {!showResults ? (
              <div className="grid grid-cols-4 gap-4">
                {currentNodes.map((node, index) => {
                  const tileColor = node.color || TILE_COLORS[index % TILE_COLORS.length];
                  const lightTile = tileColor.includes('amber') || tileColor.includes('lime') || tileColor.includes('yellow');
                  return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`group relative p-6 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${tileColor} ${lightTile ? 'text-gray-900' : 'text-white'}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg ${lightTile ? 'bg-black/10' : 'bg-white/20'} flex items-center justify-center`}>
                        <Icon name={node.icon} className="w-6 h-6" />
                      </div>
                      {node.children && (
                        <span className={`text-xs ${lightTile ? 'bg-black/10' : 'bg-white/20'} px-2 py-1 rounded`}>
                          {node.children.length} options
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{node.label}</h3>
                    <p className={`text-sm ${lightTile ? 'text-gray-700' : 'text-white/80'} leading-relaxed`}>{node.description}</p>
                    {node.isTerminal && (
                      <div className="absolute bottom-4 right-4">
                        <span className={`text-xs ${lightTile ? 'bg-black/10' : 'bg-white/20'} px-2 py-1 rounded`}>Select</span>
                      </div>
                    )}
                  </button>
                  );
                })}
              </div>
            ) : (
              /* Results Panel */
              <div className="space-y-6">
                {/* Compatibility Summary */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Compatibility Analysis Results</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6 mb-8">
                      {[
                        { label: "Overall Score", value: compatibility.overallScore, color: "text-blue-600" },
                        { label: "Hardware Match", value: compatibility.hardwareMatch, color: "text-emerald-600" },
                        { label: "Network Ready", value: compatibility.networkReadiness, color: "text-amber-600" },
                        { label: "Install Score", value: compatibility.installComplexity, color: "text-violet-600" },
                      ].map((metric, i) => (
                        <div key={i} className="text-center">
                          <MiniDonutChart value={metric.value} size={80} color={
                            metric.color === "text-blue-600" ? "#2563eb" :
                            metric.color === "text-emerald-600" ? "#059669" :
                            metric.color === "text-amber-600" ? "#d97706" : "#7c3aed"
                          } />
                          <p className="mt-2 text-sm font-medium text-gray-700">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Risk Flags & Recommendations */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Flags</h3>
                        {compatibility.riskFlags.length > 0 ? (
                          <ul className="space-y-2">
                            {compatibility.riskFlags.map((flag, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                                <Icon name="WARNING" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {flag}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                            <Icon name="CHECK" className="w-4 h-4" />
                            No significant risk factors identified
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {compatibility.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              <Icon name="CHECK" className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recommended Package */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-blue-600 text-white">
                    <h2 className="text-lg font-semibold">Recommended Package: {recommendedPackage.name}</h2>
                    <p className="text-sm text-blue-100">Based on your selection criteria</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900">${recommendedPackage.monthlyBase}</p>
                        <p className="text-xs text-gray-500">Monthly Base</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900">${recommendedPackage.perDeviceFee}</p>
                        <p className="text-xs text-gray-500">Per Device/Mo</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900">{recommendedPackage.contractMinMonths}</p>
                        <p className="text-xs text-gray-500">Month Minimum</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-emerald-600">{recommendedPackage.marginPercent}%</p>
                        <p className="text-xs text-gray-500">Margin</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Included Devices</h4>
                        <ul className="space-y-1">
                          {recommendedPackage.includedDevices.map((device, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {device}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
                        <ul className="space-y-1">
                          {recommendedPackage.features.map((feature, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                              <Icon name="CHECK" className="w-3 h-3 text-emerald-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sales Script */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Generated Sales Script</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Opening Pitch</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg italic">{salesScript.openingPitch}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Technical Justification</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg italic">{salesScript.technicalJustification}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">ROI Framing</h4>
                      <p className="text-sm text-gray-600 bg-emerald-50 p-4 rounded-lg italic">{salesScript.roiFraming}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Objection Handlers</h4>
                      <div className="space-y-3">
                        {salesScript.objectionHandlers.map((handler, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-4 py-2 bg-amber-50 text-sm font-medium text-amber-800">
                              Objection: {handler.objection}
                            </div>
                            <div className="px-4 py-3 text-sm text-gray-600">
                              {handler.response}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Hardware Catalog Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Hardware Catalog</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Device</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Compatibility</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">OBD Support</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">EV Ready</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">GPU</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Install (hrs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hardwareDevices.map((device) => (
                      <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{device.name}</p>
                            <p className="text-xs text-gray-500">{device.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{device.category}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            device.compatibilityScore >= 95 ? "bg-emerald-100 text-emerald-700" :
                            device.compatibilityScore >= 85 ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {device.compatibilityScore}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {device.obdSupport.map((obd, i) => (
                              <span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                {obd}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {device.evCompatible ? (
                            <span className="text-emerald-600"><Icon name="CHECK" className="w-5 h-5 inline" /></span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {device.gpuInference ? (
                            <span className="text-blue-600"><Icon name="CHIP" className="w-5 h-5 inline" /></span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">${device.pricePerUnit}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{device.installationHours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-6 gap-4">
              {[
                { label: "Active Leads", value: "147", trend: "+12%", color: "bg-blue-500" },
                { label: "Pipeline Value", value: "$2.4M", trend: "+18%", color: "bg-emerald-500" },
                { label: "Win Rate", value: "34%", trend: "+3%", color: "bg-violet-500" },
                { label: "Avg Deal Size", value: "$84K", trend: "+8%", color: "bg-amber-500" },
                { label: "Devices Deployed", value: "12,847", trend: "+24%", color: "bg-rose-500" },
                { label: "NPS Score", value: "72", trend: "+5", color: "bg-cyan-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-2 h-2 rounded-full ${stat.color}`} />
                    <span className="text-xs text-emerald-600 font-medium">{stat.trend}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            {/* CRM Signal Fusion */}
            <div className="grid grid-cols-7 gap-3">
              {crmSignals.map((signal, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">{signal.source}</span>
                    <span className={`text-xs font-medium ${
                      signal.trend === "UP" ? "text-emerald-600" :
                      signal.trend === "DOWN" ? "text-rose-600" : "text-gray-500"
                    }`}>
                      {signal.trend === "UP" ? "+" : signal.trend === "DOWN" ? "-" : "~"}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {signal.metric === "Pipeline Value" ? `$${(signal.value / 1000000).toFixed(1)}M` : 
                     typeof signal.value === "number" && signal.value < 100 ? signal.value.toFixed(1) : signal.value}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{signal.metric}</p>
                </div>
              ))}
            </div>
            
            {/* Pipeline Stages */}
            <div className="grid grid-cols-5 gap-4">
              {["Discovery", "Technical Assessment", "Proposal", "Negotiation", "Closed Won"].map((stage, i) => {
                const stageValue = (Math.random() * 0.5 + 0.3).toFixed(1);
                const stageCount = Math.floor(Math.random() * 20) + 5;
                return (
                  <div key={stage} className={`rounded-xl p-4 text-white ${
                    ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-emerald-500"][i]
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white/80">{stage}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{stageCount}</span>
                    </div>
                    <p className="text-xl font-bold">${stageValue}M</p>
                    <div className="mt-3">
                      <MiniLineChart data={[12, 18, 15, 22, 19, 25, 28].map(v => v + i * 5)} height={40} color="#ffffff" />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Client Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Active Pipeline Accounts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Industry</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Fleet Size</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Health</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stage</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Risk</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Last Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fleetClients.slice(0, 12).map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{client.companyName}</p>
                            <p className="text-xs text-gray-500">{client.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{client.industry}</td>
                        <td className="px-4 py-3 text-center font-mono text-sm text-gray-700">{client.fleetSize.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <MiniDonutChart value={client.healthScore} size={36} color={client.healthScore >= 80 ? "#059669" : client.healthScore >= 60 ? "#d97706" : "#dc2626"} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {client.crmStage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            client.riskTier === "LOW" ? "bg-emerald-100 text-emerald-700" :
                            client.riskTier === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                            client.riskTier === "HIGH" ? "bg-orange-100 text-orange-700" :
                            "bg-rose-100 text-rose-700"
                          }`}>
                            {client.riskTier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{client.annualRevenue}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-500">{client.lastContact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Live Telematics Stream</h2>
                <p className="text-sm text-gray-500 mt-1">Real-time event feed from connected fleet devices</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-gray-600">Streaming {telematicsEvents.length} events</span>
              </div>
            </div>
            
            {/* Event Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { type: "Hard Brake", count: telematicsEvents.filter(e => e.eventType === "Hard Brake").length, color: "bg-amber-500" },
                { type: "Speeding", count: telematicsEvents.filter(e => e.eventType === "Speeding").length, color: "bg-rose-500" },
                { type: "Distracted", count: telematicsEvents.filter(e => e.eventType === "Distracted Driving").length, color: "bg-violet-500" },
                { type: "Lane Departure", count: telematicsEvents.filter(e => e.eventType === "Lane Departure").length, color: "bg-cyan-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded ${stat.color}`} />
                    <p className="text-sm text-gray-600">{stat.type}</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                  <div className="mt-3">
                    <MiniBarChart data={[3, 5, 2, 7, 4, 6, stat.count % 10 || 3]} height={28} color={
                      stat.color === "bg-amber-500" ? "#f59e0b" : 
                      stat.color === "bg-rose-500" ? "#f43f5e" : 
                      stat.color === "bg-violet-500" ? "#8b5cf6" : "#06b6d4"
                    } />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Live Event Feed */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Event Stream</h3>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <Icon name="REFRESH" className="w-4 h-4" />
                  Auto-refresh
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Event</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Severity</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Speed</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {telematicsEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-xs font-mono text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">{event.vehicleId}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{event.eventType}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            event.severity === "INFO" ? "bg-gray-100 text-gray-600" :
                            event.severity === "WARNING" ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          }`}>
                            {event.severity}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-sm text-gray-600">{event.speed} mph</td>
                        <td className="px-4 py-2 text-right text-xs text-gray-500">
                          {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sales Analytics Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">Performance metrics and trend analysis</p>
              </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-6 gap-4 mb-8">
              {[
                { label: "Total Revenue", value: "$12.4M", change: "+18%", trend: "up", color: "bg-blue-500" },
                { label: "Closed Deals", value: "147", change: "+24%", trend: "up", color: "bg-emerald-500" },
                { label: "Avg Deal Size", value: "$84K", change: "+8%", trend: "up", color: "bg-violet-500" },
                { label: "Win Rate", value: "34%", change: "+3%", trend: "up", color: "bg-amber-500" },
                { label: "Sales Cycle", value: "62 days", change: "-12%", trend: "down", color: "bg-rose-500" },
                { label: "Expansion Rev", value: "$2.1M", change: "+31%", trend: "up", color: "bg-cyan-500" },
              ].map((kpi, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${kpi.color}`} />
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className={`text-sm mt-1 ${kpi.trend === "up" ? "text-emerald-600" : "text-amber-600"}`}>
                    {kpi.change}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
                <MiniLineChart data={[420, 480, 510, 490, 560, 620, 680, 720, 780, 850, 920, 980]} height={200} color="#3b82f6" />
                <div className="flex justify-between mt-3 text-xs text-gray-500">
                  <span>Jan</span>
                  <span>Jun</span>
                  <span>Dec</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Deals by Industry</h3>
                <div className="space-y-3">
                  {[
                    { industry: "Logistics & Distribution", value: 35, color: "#3b82f6" },
                    { industry: "Construction", value: 22, color: "#10b981" },
                    { industry: "Municipal/Government", value: 18, color: "#f59e0b" },
                    { industry: "Field Services", value: 15, color: "#8b5cf6" },
                    { industry: "Other", value: 10, color: "#6b7280" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.industry}</span>
                        <span className="text-gray-900 font-medium">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Leaderboard */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Sales Team Leaderboard</h3>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { name: "Sarah Chen", role: "Sr. Account Executive", deals: 24, revenue: "$2.1M", quota: 118 },
                  { name: "Marcus Johnson", role: "Account Executive", deals: 19, revenue: "$1.7M", quota: 104 },
                  { name: "Emily Rodriguez", role: "Sr. Account Executive", deals: 18, revenue: "$1.5M", quota: 96 },
                  { name: "David Kim", role: "Account Executive", deals: 15, revenue: "$1.2M", quota: 88 },
                  { name: "Lisa Thompson", role: "Account Executive", deals: 12, revenue: "$980K", quota: 72 },
                ].map((rep, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${i === 0 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                    {i === 0 && <span className="text-xs text-amber-600 font-medium">Top Performer</span>}
                    <p className="font-semibold text-gray-900 mt-1">{rep.name}</p>
                    <p className="text-xs text-gray-500">{rep.role}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{rep.deals}</p>
                        <p className="text-xs text-gray-500">Deals</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-600">{rep.quota}%</p>
                        <p className="text-xs text-gray-500">Quota</p>
                      </div>
                    </div>
                    <p className="text-center text-sm font-semibold text-blue-600 mt-2">{rep.revenue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* === FOOTER === */}
      <footer className="sales-footer border-t border-gray-200 bg-white mt-12">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-6">
              <span>Fleet Sales Intelligence Matrix v2.4.1</span>
              <span>|</span>
              <span>Simulation Environment</span>
              <span>|</span>
              <span>All data procedurally generated</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Session: {formatTime(simulationTime)}</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    {/* === PROJECT FOOTER === */}
    <div style={{background:"#0f172a",color:"#94a3b8",fontSize:"11px",padding:"18px 32px",borderTop:"2px solid #1e293b",fontFamily:"monospace",lineHeight:1.7}}>
      <div style={{marginBottom:6,color:"#e2e8f0",fontWeight:700,fontSize:13,letterSpacing:1}}>PROJECT FOOTNOTE</div>
      <div><strong style={{color:"#f1f5f9"}}>Stack:</strong> React · TypeScript · Tailwind CSS — standalone simulation, no backend</div>
      <div><strong style={{color:"#f1f5f9"}}>Methods:</strong> J1939/OBD-II/CAN FD hardware compatibility matrix · Fleet telematics device scoring · Salesforce/Gainsight CRM pipeline simulation · Sales engineering qualification tree · Telemetry event stream generation</div>
      <div><strong style={{color:"#f1f5f9"}}>Sources:</strong> Fleet hardware compatibility modeled from Lytx/Samsara/Geotab public spec sheets; CRM data simulated from B2B SaaS sales cycle research; all data procedurally generated — no real customer data</div>
    </div>
    </>
  );
}
