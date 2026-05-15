import React, { useState, useEffect } from "react";

// ============================================================================
// NIST-ALIGNED CYBERSECURITY AUDIT & CONTINUITY SIMULATOR
// Federal-Grade Security + RMF Operations Environment
// Professional Business Dashboard Aesthetic
// ============================================================================

// Types & Interfaces
type ImpactLevel = "LOW" | "MODERATE" | "HIGH";
type DataSensitivity = "PUBLIC" | "CUI" | "SBU" | "CLASSIFIED";
type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
type ATOStatus = "APPROVE" | "APPROVE_CONDITIONS" | "DENY" | "REMEDIATION_REQUIRED";
type RMFPhase = "PREPARE" | "CATEGORIZE" | "SELECT" | "IMPLEMENT" | "ASSESS" | "AUTHORIZE" | "MONITOR";
type ThreatLevel = "MINIMAL" | "ELEVATED" | "HIGH" | "SEVERE" | "CRITICAL";
type IRPhase = "DETECTION" | "ANALYSIS" | "CONTAINMENT" | "ERADICATION" | "RECOVERY" | "POST_INCIDENT";

interface ControlFamily {
  id: string;
  name: string;
  controlCount: number;
  implemented: number;
  partial: number;
  effectiveness: number;
  drift: number;
}

interface Vulnerability {
  id: string;
  cve: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  system: string;
  exploitProbability: number;
  daysOpen: number;
  description: string;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: "CONTROL_FAILURE" | "ACCESS_ANOMALY" | "CONFIG_CHANGE" | "THREAT_DETECTED" | "AUDIT_FINDING" | "PATCH_LAG" | "INCIDENT";
  severity: "INFO" | "WARNING" | "CRITICAL";
  system: string;
  description: string;
  controlFamily?: string;
}

interface FederalSystem {
  id: string;
  name: string;
  fismaId: string;
  agency: string;
  contractor: string;
  systemType: "MISSION_CRITICAL" | "BUSINESS_SUPPORT" | "PUBLIC_FACING" | "CLASSIFIED_ENCLAVE";
  impactLevel: ImpactLevel;
  dataSensitivity: DataSensitivity;
  informationTypes: string[];
  controlFamilies: ControlFamily[];
  residualRisk: number;
  inherentRisk: number;
  controlEffectiveness: number;
  vulnerabilityDensity: number;
  threatExposure: number;
  riskLevel: RiskLevel;
  atoStatus: ATOStatus;
  rmfPhase: RMFPhase;
  lastAssessment: Date;
  nextAssessment: Date;
  openFindings: number;
  poamItems: number;
}

interface Contractor {
  id: string;
  name: string;
  trustScore: number;
  systemsManaged: number;
  criticalDependencies: number;
  complianceScore: number;
  incidentHistory: number;
}

interface Incident {
  id: string;
  name: string;
  phase: IRPhase;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  affectedSystems: string[];
  detectionTime: Date;
  containmentTime?: Date;
  responseTimeMinutes: number;
  escalationLevel: number;
  status: "ACTIVE" | "CONTAINED" | "RESOLVED";
}

interface COOPScenario {
  id: string;
  name: string;
  type: "CYBERATTACK" | "DATACENTER_OUTAGE" | "RANSOMWARE" | "CLOUD_FAILURE" | "INSIDER_SABOTAGE";
  survivabilityScore: number;
  rtoHours: number;
  rpoHours: number;
  fallbackEfficiency: number;
  affectedSystems: number;
  status: "SIMULATING" | "PASSED" | "FAILED" | "PARTIAL";
}

// ============================================================================
// SIMULATED DATA GENERATORS
// ============================================================================

const AGENCIES = ["DHS", "DoD", "HUD", "VA", "DOJ", "Treasury", "State", "EPA"];
const CONTRACTORS = ["Booz Allen Hamilton", "Deloitte Federal", "Lockheed Martin", "Northrop Grumman", "Raytheon", "SAIC", "Leidos", "General Dynamics IT"];
const CONTROL_FAMILIES: { id: string; name: string; baseControls: number }[] = [
  { id: "AC", name: "Access Control", baseControls: 25 },
  { id: "AU", name: "Audit & Accountability", baseControls: 16 },
  { id: "CM", name: "Configuration Management", baseControls: 14 },
  { id: "IR", name: "Incident Response", baseControls: 10 },
  { id: "RA", name: "Risk Assessment", baseControls: 9 },
  { id: "SC", name: "System & Comms Protection", baseControls: 44 },
  { id: "SI", name: "System & Info Integrity", baseControls: 23 },
  { id: "CA", name: "Assessment & Authorization", baseControls: 9 },
  { id: "PL", name: "Planning", baseControls: 11 },
  { id: "PS", name: "Personnel Security", baseControls: 9 },
];

const INFO_TYPES = ["PII", "Financial", "Operational Intel", "Health Records", "Infrastructure Control", "Law Enforcement", "National Security"];

function generateControlFamilies(): ControlFamily[] {
  return CONTROL_FAMILIES.map((cf) => {
    const implemented = Math.floor(cf.baseControls * (0.5 + Math.random() * 0.4));
    const partial = Math.floor((cf.baseControls - implemented) * Math.random());
    return {
      id: cf.id,
      name: cf.name,
      controlCount: cf.baseControls,
      implemented,
      partial,
      effectiveness: 40 + Math.random() * 55,
      drift: Math.random() * 25,
    };
  });
}

function generateSystems(): FederalSystem[] {
  const systemNames = [
    "AEGIS-CORE", "SENTINEL-NET", "GUARDIAN-DB", "CITADEL-AUTH", "BASTION-API",
    "FORTRESS-CRM", "SHIELD-ANALYTICS", "BULWARK-INFRA", "RAMPART-COMMS", "VIGILANT-LOGS",
    "PATRIOT-IDENTITY", "LIBERTY-FINANCE", "JUSTICE-RECORDS", "HOMELAND-OPS", "FEDERAL-GATEWAY"
  ];
  
  return systemNames.map((name, i) => {
    const controlFamilies = generateControlFamilies();
    const avgEffectiveness = controlFamilies.reduce((a, b) => a + b.effectiveness, 0) / controlFamilies.length;
    const avgDrift = controlFamilies.reduce((a, b) => a + b.drift, 0) / controlFamilies.length;
    const inherentRisk = 20 + Math.random() * 60;
    const residualRisk = inherentRisk * (1 - avgEffectiveness / 150);
    const riskLevel: RiskLevel = residualRisk < 25 ? "LOW" : residualRisk < 45 ? "MODERATE" : residualRisk < 65 ? "HIGH" : "CRITICAL";
    
    const rmfPhases: RMFPhase[] = ["PREPARE", "CATEGORIZE", "SELECT", "IMPLEMENT", "ASSESS", "AUTHORIZE", "MONITOR"];
    
    return {
      id: `SYS-${String(i + 1).padStart(4, "0")}`,
      name,
      fismaId: `FISMA-${AGENCIES[i % AGENCIES.length]}-${String(1000 + i)}`,
      agency: AGENCIES[i % AGENCIES.length],
      contractor: CONTRACTORS[i % CONTRACTORS.length],
      systemType: ["MISSION_CRITICAL", "BUSINESS_SUPPORT", "PUBLIC_FACING", "CLASSIFIED_ENCLAVE"][i % 4] as FederalSystem["systemType"],
      impactLevel: ["LOW", "MODERATE", "HIGH"][Math.floor(Math.random() * 3)] as ImpactLevel,
      dataSensitivity: ["PUBLIC", "CUI", "SBU", "CLASSIFIED"][Math.floor(Math.random() * 4)] as DataSensitivity,
      informationTypes: INFO_TYPES.slice(0, 2 + Math.floor(Math.random() * 3)),
      controlFamilies,
      residualRisk,
      inherentRisk,
      controlEffectiveness: avgEffectiveness,
      vulnerabilityDensity: Math.random() * 40,
      threatExposure: 10 + Math.random() * 70,
      riskLevel,
      atoStatus: avgEffectiveness > 75 ? "APPROVE" : avgEffectiveness > 60 ? "APPROVE_CONDITIONS" : avgEffectiveness > 45 ? "REMEDIATION_REQUIRED" : "DENY",
      rmfPhase: rmfPhases[Math.floor(Math.random() * rmfPhases.length)],
      lastAssessment: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      nextAssessment: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      openFindings: Math.floor(Math.random() * 25),
      poamItems: Math.floor(Math.random() * 15),
    };
  });
}

function generateVulnerabilities(systems: FederalSystem[]): Vulnerability[] {
  const vulns: Vulnerability[] = [];
  const cveBase = 2024;
  
  systems.forEach((sys) => {
    const count = Math.floor(sys.vulnerabilityDensity / 5);
    for (let i = 0; i < count; i++) {
      vulns.push({
        id: `VULN-${sys.id}-${i}`,
        cve: `CVE-${cveBase}-${String(Math.floor(Math.random() * 50000)).padStart(5, "0")}`,
        severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)] as Vulnerability["severity"],
        system: sys.name,
        exploitProbability: Math.random() * 100,
        daysOpen: Math.floor(Math.random() * 120),
        description: [
          "Remote code execution via unpatched service",
          "Privilege escalation through misconfigured permissions",
          "SQL injection in legacy API endpoint",
          "Cross-site scripting in admin portal",
          "Insecure deserialization vulnerability",
          "Authentication bypass via session fixation",
          "Buffer overflow in network service",
          "Weak cryptographic implementation",
        ][Math.floor(Math.random() * 8)],
      });
    }
  });
  
  return vulns.sort((a, b) => {
    const sev = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return sev[b.severity] - sev[a.severity];
  });
}

function generateContractors(): Contractor[] {
  return CONTRACTORS.map((name, i) => ({
    id: `CONT-${i}`,
    name,
    trustScore: 50 + Math.random() * 45,
    systemsManaged: 1 + Math.floor(Math.random() * 5),
    criticalDependencies: Math.floor(Math.random() * 8),
    complianceScore: 60 + Math.random() * 35,
    incidentHistory: Math.floor(Math.random() * 5),
  }));
}

function generateIncident(): Incident {
  const types = [
    "Unauthorized Access Attempt",
    "Malware Detection",
    "Data Exfiltration Alert",
    "Phishing Campaign",
    "Credential Compromise",
    "Ransomware Indicator",
    "APT Activity Detected",
    "Insider Threat Alert",
  ];
  
  return {
    id: `INC-${Date.now()}`,
    name: types[Math.floor(Math.random() * types.length)],
    phase: ["DETECTION", "ANALYSIS", "CONTAINMENT", "ERADICATION", "RECOVERY", "POST_INCIDENT"][Math.floor(Math.random() * 6)] as IRPhase,
    severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)] as Incident["severity"],
    affectedSystems: ["AEGIS-CORE", "SENTINEL-NET", "GUARDIAN-DB"].slice(0, 1 + Math.floor(Math.random() * 3)),
    detectionTime: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
    responseTimeMinutes: Math.floor(Math.random() * 240),
    escalationLevel: 1 + Math.floor(Math.random() * 4),
    status: ["ACTIVE", "CONTAINED", "RESOLVED"][Math.floor(Math.random() * 3)] as Incident["status"],
  };
}

function generateCOOPScenarios(): COOPScenario[] {
  return [
    { id: "COOP-1", name: "Nation-State Cyberattack", type: "CYBERATTACK", survivabilityScore: 72, rtoHours: 4, rpoHours: 1, fallbackEfficiency: 85, affectedSystems: 8, status: "PASSED" },
    { id: "COOP-2", name: "Primary Datacenter Loss", type: "DATACENTER_OUTAGE", survivabilityScore: 88, rtoHours: 2, rpoHours: 0.5, fallbackEfficiency: 92, affectedSystems: 15, status: "PASSED" },
    { id: "COOP-3", name: "Enterprise Ransomware", type: "RANSOMWARE", survivabilityScore: 45, rtoHours: 72, rpoHours: 24, fallbackEfficiency: 60, affectedSystems: 12, status: "FAILED" },
    { id: "COOP-4", name: "Cloud Provider Failure", type: "CLOUD_FAILURE", survivabilityScore: 78, rtoHours: 6, rpoHours: 2, fallbackEfficiency: 80, affectedSystems: 6, status: "PARTIAL" },
    { id: "COOP-5", name: "Insider Sabotage Event", type: "INSIDER_SABOTAGE", survivabilityScore: 55, rtoHours: 12, rpoHours: 4, fallbackEfficiency: 70, affectedSystems: 4, status: "SIMULATING" },
  ];
}

// ============================================================================
// CALCULATION ENGINES
// ============================================================================

function calculateThreatExposure(system: FederalSystem, threatLevel: ThreatLevel): number {
  const threatMultipliers: Record<ThreatLevel, number> = {
    MINIMAL: 0.5, ELEVATED: 0.75, HIGH: 1.0, SEVERE: 1.25, CRITICAL: 1.5,
  };
  const baseExposure = system.vulnerabilityDensity * 0.4 + (100 - system.controlEffectiveness) * 0.4 + system.inherentRisk * 0.2;
  return Math.min(100, baseExposure * threatMultipliers[threatLevel]);
}

function calculateATOReadiness(system: FederalSystem): number {
  const controlScore = system.controlEffectiveness * 0.35;
  const findingsPenalty = Math.min(30, system.openFindings * 1.5);
  const poamPenalty = Math.min(20, system.poamItems * 2);
  const riskPenalty = system.residualRisk * 0.2;
  return Math.max(0, Math.min(100, controlScore + 50 - findingsPenalty - poamPenalty - riskPenalty));
}

function calculateSupplyChainRisk(contractors: Contractor[]): number {
  const avgTrust = contractors.reduce((a, b) => a + b.trustScore, 0) / contractors.length;
  const avgCompliance = contractors.reduce((a, b) => a + b.complianceScore, 0) / contractors.length;
  const totalIncidents = contractors.reduce((a, b) => a + b.incidentHistory, 0);
  const criticalDeps = contractors.reduce((a, b) => a + b.criticalDependencies, 0);
  return Math.min(100, (100 - avgTrust) * 0.3 + (100 - avgCompliance) * 0.3 + totalIncidents * 5 + criticalDeps * 2);
}

function calculateIREfficiency(incident: Incident): number {
  const phasePenalties: Record<IRPhase, number> = {
    DETECTION: 0, ANALYSIS: 5, CONTAINMENT: 15, ERADICATION: 25, RECOVERY: 35, POST_INCIDENT: 0,
  };
  const timePenalty = Math.min(40, incident.responseTimeMinutes / 6);
  const escalationPenalty = incident.escalationLevel * 5;
  return Math.max(0, 100 - phasePenalties[incident.phase] - timePenalty - escalationPenalty);
}

function calculateCascadeRisk(systems: FederalSystem[]): number {
  const criticalSystems = systems.filter((s) => s.systemType === "MISSION_CRITICAL");
  const avgRisk = criticalSystems.length > 0 ? criticalSystems.reduce((a, b) => a + b.residualRisk, 0) / criticalSystems.length : 0;
  const interconnectionFactor = criticalSystems.length * 3;
  return Math.min(100, avgRisk * 0.6 + interconnectionFactor);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type ViewMode = "OPERATIONS" | "RMF_LIFECYCLE" | "INCIDENT_RESPONSE" | "COOP_SIMULATION" | "AUDIT_REPORTS" | "SUPPLY_CHAIN";

export default function NISTCyberSimulator() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("OPERATIONS");
  const [systems, setSystems] = useState<FederalSystem[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [coopScenarios, setCOOPScenarios] = useState<COOPScenario[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>("ELEVATED");
  const [selectedSystem, setSelectedSystem] = useState<FederalSystem | null>(null);
  const [simulationTick, setSimulationTick] = useState(0);

  useEffect(() => {
    const sys = generateSystems();
    setSystems(sys);
    setVulnerabilities(generateVulnerabilities(sys));
    setContractors(generateContractors());
    setIncidents([generateIncident(), generateIncident(), generateIncident()]);
    setCOOPScenarios(generateCOOPScenarios());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const simTimer = setInterval(() => {
      setSimulationTick((t) => t + 1);
      
      if (Math.random() > 0.6) {
        const eventTypes: SecurityEvent["type"][] = ["CONTROL_FAILURE", "ACCESS_ANOMALY", "CONFIG_CHANGE", "THREAT_DETECTED", "AUDIT_FINDING", "PATCH_LAG"];
        const severities: SecurityEvent["severity"][] = ["INFO", "WARNING", "CRITICAL"];
        const descriptions = [
          "Failed authentication attempt from unknown IP",
          "Configuration change detected in production",
          "Control effectiveness below threshold",
          "Suspicious lateral movement detected",
          "Patch pending for 30+ days",
          "Audit finding requires remediation",
          "Unauthorized privilege escalation attempt",
          "Network anomaly in segmented zone",
        ];
        
        const newEvent: SecurityEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: new Date(),
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          system: systems[Math.floor(Math.random() * systems.length)]?.name || "UNKNOWN",
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          controlFamily: CONTROL_FAMILIES[Math.floor(Math.random() * CONTROL_FAMILIES.length)].id,
        };
        
        setSecurityEvents((prev) => [newEvent, ...prev].slice(0, 50));
      }

      setSystems((prev) =>
        prev.map((sys) => ({
          ...sys,
          controlFamilies: sys.controlFamilies.map((cf) => ({
            ...cf,
            drift: Math.min(30, cf.drift + Math.random() * 0.5),
            effectiveness: Math.max(30, cf.effectiveness - Math.random() * 0.3),
          })),
        }))
      );

      if (Math.random() > 0.95) {
        const levels: ThreatLevel[] = ["MINIMAL", "ELEVATED", "HIGH", "SEVERE", "CRITICAL"];
        const currentIdx = levels.indexOf(threatLevel);
        const newIdx = Math.max(0, Math.min(4, currentIdx + (Math.random() > 0.5 ? 1 : -1)));
        setThreatLevel(levels[newIdx]);
      }
    }, 3000);

    return () => clearInterval(simTimer);
  }, [systems, threatLevel]);

  const totalSystems = systems.length;
  const criticalVulns = vulnerabilities.filter((v) => v.severity === "CRITICAL").length;
  const highRiskSystems = systems.filter((s) => s.riskLevel === "HIGH" || s.riskLevel === "CRITICAL").length;
  const avgControlEffectiveness = systems.length > 0 ? systems.reduce((a, b) => a + b.controlEffectiveness, 0) / systems.length : 0;
  const activeIncidents = incidents.filter((i) => i.status === "ACTIVE").length;
  const supplyChainRisk = calculateSupplyChainRisk(contractors);
  const cascadeRisk = calculateCascadeRisk(systems);

  // Professional color helpers
  const getRiskColor = (level: RiskLevel | string) => {
    switch (level) {
      case "LOW": return "text-emerald-700";
      case "MODERATE": return "text-amber-600";
      case "HIGH": return "text-orange-600";
      case "CRITICAL": return "text-red-600";
      default: return "text-neutral-600";
    }
  };

  const getRiskBg = (level: RiskLevel | string) => {
    switch (level) {
      case "LOW": return "bg-emerald-50 border-emerald-200";
      case "MODERATE": return "bg-amber-50 border-amber-200";
      case "HIGH": return "bg-orange-50 border-orange-200";
      case "CRITICAL": return "bg-red-50 border-red-200";
      default: return "bg-neutral-50 border-neutral-200";
    }
  };

  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case "MINIMAL": return "text-emerald-700 bg-emerald-50 border-emerald-300";
      case "ELEVATED": return "text-amber-700 bg-amber-50 border-amber-300";
      case "HIGH": return "text-orange-700 bg-orange-50 border-orange-300";
      case "SEVERE": return "text-red-700 bg-red-50 border-red-300";
      case "CRITICAL": return "text-red-800 bg-red-100 border-red-400";
    }
  };

  const getATOBadge = (status: ATOStatus) => {
    switch (status) {
      case "APPROVE": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "APPROVE_CONDITIONS": return "bg-amber-100 text-amber-800 border-amber-300";
      case "DENY": return "bg-red-100 text-red-800 border-red-300";
      case "REMEDIATION_REQUIRED": return "bg-orange-100 text-orange-800 border-orange-300";
    }
  };

  const formatATOStatus = (status: ATOStatus) => {
    switch (status) {
      case "APPROVE": return "ATO APPROVED";
      case "APPROVE_CONDITIONS": return "CONDITIONAL";
      case "DENY": return "DENIED";
      case "REMEDIATION_REQUIRED": return "REMEDIATION";
    }
  };

  // ============================================================================
  // RENDER VIEWS
  // ============================================================================

  const renderOperationsView = () => (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel - Security Control Stream */}
      <div className="w-80 border-r border-neutral-200 bg-white flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <div className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Security Control Stream</div>
          <div className="text-xs text-neutral-500 mt-1">Live events from all monitored systems</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {securityEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${
                event.severity === "CRITICAL" ? "bg-red-50" : event.severity === "WARNING" ? "bg-amber-50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  event.severity === "CRITICAL" ? "bg-red-100 text-red-800 border-red-200" :
                  event.severity === "WARNING" ? "bg-amber-100 text-amber-800 border-amber-200" :
                  "bg-neutral-100 text-neutral-700 border-neutral-200"
                }`}>
                  {event.severity}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-neutral-800 mb-1">{event.description}</div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="font-mono">{event.system}</span>
                {event.controlFamily && (
                  <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600 border border-neutral-200">{event.controlFamily}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - System Overview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
        <div className="p-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Federal Information System Network</div>
              <div className="text-xs text-neutral-500">Authorization boundary visualization with live threat overlay</div>
            </div>
            <div className={`px-3 py-1.5 rounded font-medium text-xs border ${getThreatColor(threatLevel)}`}>
              FPCON: {threatLevel}
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-3 gap-4">
            {systems.map((sys) => (
              <div
                key={sys.id}
                onClick={() => setSelectedSystem(sys)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getRiskBg(sys.riskLevel)} ${
                  selectedSystem?.id === sys.id ? "ring-2 ring-neutral-900 ring-offset-2" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-neutral-500">{sys.fismaId}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getATOBadge(sys.atoStatus)}`}>
                    {formatATOStatus(sys.atoStatus)}
                  </span>
                </div>
                <div className="text-sm font-semibold text-neutral-900 mb-1">{sys.name}</div>
                <div className="text-xs text-neutral-500 mb-3">{sys.agency} / {sys.contractor.split(" ")[0]}</div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-neutral-500">Risk Level</div>
                    <div className={`font-semibold ${getRiskColor(sys.riskLevel)}`}>{sys.riskLevel}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Control Eff.</div>
                    <div className="font-mono text-neutral-800">{sys.controlEffectiveness.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Open Findings</div>
                    <div className="font-mono text-neutral-800">{sys.openFindings}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">RMF Phase</div>
                    <div className="font-mono text-neutral-600 text-[10px]">{sys.rmfPhase}</div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        sys.controlEffectiveness > 75 ? "bg-emerald-500" :
                        sys.controlEffectiveness > 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${sys.controlEffectiveness}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Risk & Compliance State */}
      <div className="w-80 border-l border-neutral-200 bg-white flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <div className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Risk & Compliance State</div>
        </div>
        
        {selectedSystem ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <div className="text-sm font-semibold text-neutral-900">{selectedSystem.name}</div>
              <div className="text-xs text-neutral-500 font-mono">{selectedSystem.fismaId}</div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 uppercase tracking-wide mb-2 font-medium">Identity Layer</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">Agency</span><span className="text-neutral-800 font-medium">{selectedSystem.agency}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Contractor</span><span className="text-neutral-800 font-medium">{selectedSystem.contractor.split(" ")[0]}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">System Type</span><span className="text-neutral-800 font-medium">{selectedSystem.systemType.replace(/_/g, " ")}</span></div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 uppercase tracking-wide mb-2 font-medium">Data Classification</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">FIPS 199</span><span className={`font-semibold ${getRiskColor(selectedSystem.impactLevel)}`}>{selectedSystem.impactLevel}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Sensitivity</span><span className="text-neutral-800 font-medium">{selectedSystem.dataSensitivity}</span></div>
                  <div className="mt-2">
                    <div className="text-neutral-500 mb-1">Information Types</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedSystem.informationTypes.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-white rounded text-neutral-600 text-[10px] border border-neutral-200">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 uppercase tracking-wide mb-2 font-medium">Risk Posture</div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1"><span className="text-neutral-500">Inherent Risk</span><span className="text-neutral-800 font-mono">{selectedSystem.inherentRisk.toFixed(1)}</span></div>
                    <div className="h-1.5 bg-neutral-200 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${selectedSystem.inherentRisk}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span className="text-neutral-500">Residual Risk</span><span className={`font-mono ${getRiskColor(selectedSystem.riskLevel)}`}>{selectedSystem.residualRisk.toFixed(1)}</span></div>
                    <div className="h-1.5 bg-neutral-200 rounded-full"><div className={`h-full rounded-full ${selectedSystem.residualRisk > 60 ? "bg-red-500" : selectedSystem.residualRisk > 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${selectedSystem.residualRisk}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span className="text-neutral-500">Threat Exposure</span><span className="text-neutral-800 font-mono">{calculateThreatExposure(selectedSystem, threatLevel).toFixed(1)}</span></div>
                    <div className="h-1.5 bg-neutral-200 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{ width: `${calculateThreatExposure(selectedSystem, threatLevel)}%` }} /></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 uppercase tracking-wide mb-2 font-medium">NIST 800-53 Controls</div>
                <div className="space-y-2">
                  {selectedSystem.controlFamilies.slice(0, 6).map((cf) => (
                    <div key={cf.id} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-neutral-600">{cf.id}: {cf.name.split(" ")[0]}</span>
                        <span className={cf.effectiveness > 70 ? "text-emerald-700 font-semibold" : cf.effectiveness > 50 ? "text-amber-700 font-semibold" : "text-red-700 font-semibold"}>
                          {cf.effectiveness.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-neutral-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${cf.effectiveness > 70 ? "bg-emerald-500" : cf.effectiveness > 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${cf.effectiveness}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 uppercase tracking-wide mb-2 font-medium">Authorization Status</div>
                <div className="text-center py-2">
                  <div className={`text-3xl font-bold ${calculateATOReadiness(selectedSystem) > 70 ? "text-emerald-600" : calculateATOReadiness(selectedSystem) > 50 ? "text-amber-600" : "text-red-600"}`}>
                    {calculateATOReadiness(selectedSystem).toFixed(0)}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">ATO Readiness Score</div>
                </div>
                <div className={`text-center text-xs font-semibold px-3 py-1.5 rounded border mt-2 ${getATOBadge(selectedSystem.atoStatus)}`}>
                  {formatATOStatus(selectedSystem.atoStatus)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
            Select a system to view details
          </div>
        )}
      </div>
    </div>
  );

  const renderRMFLifecycleView = () => {
    const phases: { id: RMFPhase; name: string; description: string }[] = [
      { id: "PREPARE", name: "Prepare", description: "Asset inventory, boundary definition" },
      { id: "CATEGORIZE", name: "Categorize", description: "FIPS 199 impact level assignment" },
      { id: "SELECT", name: "Select", description: "Control baseline selection" },
      { id: "IMPLEMENT", name: "Implement", description: "Control deployment tracking" },
      { id: "ASSESS", name: "Assess", description: "Control effectiveness evaluation" },
      { id: "AUTHORIZE", name: "Authorize", description: "ATO decision process" },
      { id: "MONITOR", name: "Monitor", description: "Continuous monitoring" },
    ];

    const systemsByPhase = phases.map((p) => ({
      ...p,
      systems: systems.filter((s) => s.rmfPhase === p.id),
    }));

    return (
      <div className="flex-1 p-6 overflow-auto bg-neutral-50">
        <div className="mb-6">
          <div className="text-lg font-bold text-neutral-900">NIST RMF Lifecycle Simulation</div>
          <div className="text-sm text-neutral-500">Real-time tracking of systems through authorization workflow</div>
        </div>

        <div className="flex gap-2 mb-8">
          {phases.map((phase, idx) => (
            <div key={phase.id} className="flex-1">
              <div className={`p-4 rounded-t-lg border-2 border-b-0 ${
                systemsByPhase[idx].systems.length > 0 ? "bg-white border-neutral-900" : "bg-white border-neutral-200"
              }`}>
                <div className="text-xs font-mono text-neutral-500 uppercase">{phase.id}</div>
                <div className="text-sm font-semibold text-neutral-900 mt-1">{phase.name}</div>
                <div className="text-xs text-neutral-500 mt-1">{phase.description}</div>
                <div className="text-2xl font-bold text-neutral-900 mt-2">{systemsByPhase[idx].systems.length}</div>
              </div>
              <div className={`h-1 ${systemsByPhase[idx].systems.length > 0 ? "bg-neutral-900" : "bg-neutral-300"}`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {systemsByPhase.map((phase) => (
            <div key={phase.id} className="space-y-2">
              {phase.systems.map((sys) => (
                <div
                  key={sys.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${getRiskBg(sys.riskLevel)}`}
                  onClick={() => setSelectedSystem(sys)}
                >
                  <div className="text-xs font-semibold text-neutral-800 truncate">{sys.name}</div>
                  <div className="text-xs text-neutral-500">{sys.agency}</div>
                  <div className={`text-xs font-semibold mt-1 ${getRiskColor(sys.riskLevel)}`}>{sys.riskLevel}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderIncidentResponseView = () => (
    <div className="flex-1 p-6 overflow-auto bg-neutral-50">
      <div className="mb-6">
        <div className="text-lg font-bold text-neutral-900">Incident Response Simulator</div>
        <div className="text-sm text-neutral-500">NIST IR lifecycle tracking and response workflow</div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Active Incidents</div>
          {incidents.map((inc) => (
            <div key={inc.id} className={`p-5 rounded-lg border-2 bg-white ${
              inc.severity === "CRITICAL" ? "border-red-300" :
              inc.severity === "HIGH" ? "border-orange-300" :
              "border-neutral-200"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{inc.name}</div>
                  <div className="text-xs text-neutral-500 font-mono">{inc.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                    inc.severity === "CRITICAL" ? "bg-red-100 text-red-800 border-red-200" :
                    inc.severity === "HIGH" ? "bg-orange-100 text-orange-800 border-orange-200" :
                    inc.severity === "MEDIUM" ? "bg-amber-100 text-amber-800 border-amber-200" :
                    "bg-neutral-100 text-neutral-700 border-neutral-200"
                  }`}>{inc.severity}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                    inc.status === "ACTIVE" ? "bg-red-100 text-red-800 border-red-200" :
                    inc.status === "CONTAINED" ? "bg-amber-100 text-amber-800 border-amber-200" :
                    "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}>{inc.status}</span>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {["DETECTION", "ANALYSIS", "CONTAINMENT", "ERADICATION", "RECOVERY", "POST_INCIDENT"].map((phase, idx) => {
                  const currentIdx = ["DETECTION", "ANALYSIS", "CONTAINMENT", "ERADICATION", "RECOVERY", "POST_INCIDENT"].indexOf(inc.phase);
                  return (
                    <div
                      key={phase}
                      className={`flex-1 h-2 rounded-full ${
                        idx <= currentIdx ? "bg-neutral-900" : "bg-neutral-200"
                      }`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-neutral-600 font-medium mb-3">Phase: {inc.phase}</div>

              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-neutral-500">Response Time</div>
                  <div className="text-neutral-900 font-mono font-semibold">{inc.responseTimeMinutes}m</div>
                </div>
                <div>
                  <div className="text-neutral-500">Escalation</div>
                  <div className="text-neutral-900 font-mono font-semibold">Level {inc.escalationLevel}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Efficiency</div>
                  <div className={`font-mono font-semibold ${calculateIREfficiency(inc) > 70 ? "text-emerald-700" : "text-amber-700"}`}>
                    {calculateIREfficiency(inc).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500">Systems</div>
                  <div className="text-neutral-900 font-mono font-semibold">{inc.affectedSystems.length}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Response Metrics</div>
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">Mean Time to Detect</div>
            <div className="text-2xl font-bold text-neutral-900">14.2<span className="text-sm text-neutral-400 font-normal">min</span></div>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">Mean Time to Contain</div>
            <div className="text-2xl font-bold text-neutral-900">47.8<span className="text-sm text-neutral-400 font-normal">min</span></div>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">Avg Response Efficiency</div>
            <div className="text-2xl font-bold text-emerald-700">
              {(incidents.reduce((a, b) => a + calculateIREfficiency(b), 0) / incidents.length).toFixed(0)}%
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">Active Incidents</div>
            <div className={`text-2xl font-bold ${activeIncidents > 0 ? "text-red-600" : "text-emerald-700"}`}>{activeIncidents}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCOOPView = () => (
    <div className="flex-1 p-6 overflow-auto bg-neutral-50">
      <div className="mb-6">
        <div className="text-lg font-bold text-neutral-900">Continuity of Operations (COOP) Simulation</div>
        <div className="text-sm text-neutral-500">System resilience under disruption scenarios</div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {coopScenarios.map((scenario) => (
          <div key={scenario.id} className={`p-5 rounded-lg border-2 bg-white ${
            scenario.status === "FAILED" ? "border-red-300" :
            scenario.status === "PASSED" ? "border-emerald-300" :
            scenario.status === "PARTIAL" ? "border-amber-300" :
            "border-neutral-300"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-neutral-900">{scenario.name}</div>
                <div className="text-xs text-neutral-500 font-mono">{scenario.type}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                scenario.status === "FAILED" ? "bg-red-100 text-red-800 border-red-200" :
                scenario.status === "PASSED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                scenario.status === "PARTIAL" ? "bg-amber-100 text-amber-800 border-amber-200" :
                "bg-neutral-100 text-neutral-700 border-neutral-200"
              }`}>{scenario.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-neutral-500">Survivability</div>
                <div className={`text-xl font-bold ${scenario.survivabilityScore > 70 ? "text-emerald-700" : scenario.survivabilityScore > 50 ? "text-amber-700" : "text-red-700"}`}>
                  {scenario.survivabilityScore}%
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Fallback Efficiency</div>
                <div className="text-xl font-bold text-neutral-900">{scenario.fallbackEfficiency}%</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-neutral-500">RTO</div>
                <div className="text-neutral-900 font-mono font-semibold">{scenario.rtoHours}h</div>
              </div>
              <div>
                <div className="text-neutral-500">RPO</div>
                <div className="text-neutral-900 font-mono font-semibold">{scenario.rpoHours}h</div>
              </div>
              <div>
                <div className="text-neutral-500">Systems</div>
                <div className="text-neutral-900 font-mono font-semibold">{scenario.affectedSystems}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-white rounded-lg border-2 border-neutral-200">
        <div className="text-sm font-semibold text-neutral-900 mb-4">Multi-System Interdependency Analysis</div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-neutral-500 mb-2">Cascading Failure Risk</div>
            <div className={`text-3xl font-bold ${cascadeRisk > 60 ? "text-red-600" : cascadeRisk > 40 ? "text-amber-600" : "text-emerald-700"}`}>
              {cascadeRisk.toFixed(1)}%
            </div>
            <div className="h-2 bg-neutral-200 rounded-full mt-2">
              <div className={`h-full rounded-full ${cascadeRisk > 60 ? "bg-red-500" : cascadeRisk > 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${cascadeRisk}%` }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-2">Critical System Dependencies</div>
            <div className="text-3xl font-bold text-neutral-900">
              {systems.filter(s => s.systemType === "MISSION_CRITICAL").length}
            </div>
            <div className="text-xs text-neutral-500 mt-2">Mission-critical nodes</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-2">Network Segmentation Score</div>
            <div className="text-3xl font-bold text-neutral-900">78.4%</div>
            <div className="text-xs text-neutral-500 mt-2">Isolation effectiveness</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupplyChainView = () => (
    <div className="flex-1 p-6 overflow-auto bg-neutral-50">
      <div className="mb-6">
        <div className="text-lg font-bold text-neutral-900">Supply Chain Security Analysis</div>
        <div className="text-sm text-neutral-500">Third-party risk modeling and vendor trust scoring</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
          <div className="text-xs text-neutral-500">Supply Chain Risk Index</div>
          <div className={`text-2xl font-bold ${supplyChainRisk > 50 ? "text-red-600" : supplyChainRisk > 30 ? "text-amber-600" : "text-emerald-700"}`}>
            {supplyChainRisk.toFixed(1)}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
          <div className="text-xs text-neutral-500">Active Contractors</div>
          <div className="text-2xl font-bold text-neutral-900">{contractors.length}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
          <div className="text-xs text-neutral-500">Critical Dependencies</div>
          <div className="text-2xl font-bold text-amber-600">{contractors.reduce((a, b) => a + b.criticalDependencies, 0)}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
          <div className="text-xs text-neutral-500">Avg Trust Score</div>
          <div className="text-2xl font-bold text-neutral-900">
            {(contractors.reduce((a, b) => a + b.trustScore, 0) / contractors.length).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {contractors.map((cont) => (
          <div key={cont.id} className={`p-4 rounded-lg border-2 bg-white ${
            cont.trustScore < 60 ? "border-red-300" :
            cont.trustScore < 75 ? "border-amber-300" :
            "border-neutral-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-neutral-900">{cont.name}</div>
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                cont.trustScore > 80 ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                cont.trustScore > 60 ? "bg-amber-100 text-amber-800 border-amber-200" :
                "bg-red-100 text-red-800 border-red-200"
              }`}>Trust: {cont.trustScore.toFixed(0)}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-neutral-500">Systems</div>
                <div className="text-neutral-900 font-mono font-semibold">{cont.systemsManaged}</div>
              </div>
              <div>
                <div className="text-neutral-500">Dependencies</div>
                <div className="text-neutral-900 font-mono font-semibold">{cont.criticalDependencies}</div>
              </div>
              <div>
                <div className="text-neutral-500">Compliance</div>
                <div className={`font-mono font-semibold ${cont.complianceScore > 80 ? "text-emerald-700" : "text-amber-700"}`}>{cont.complianceScore.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-neutral-500">Incidents</div>
                <div className={`font-mono font-semibold ${cont.incidentHistory > 2 ? "text-red-600" : "text-neutral-900"}`}>{cont.incidentHistory}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditReportsView = () => (
    <div className="flex-1 p-6 overflow-auto bg-neutral-50">
      <div className="mb-6">
        <div className="text-lg font-bold text-neutral-900">Compliance Reporting Engine</div>
        <div className="text-sm text-neutral-500">NIST RMF, FISMA, and FedRAMP report generation</div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {[
            { name: "NIST RMF Authorization Package", type: "RMF", status: "READY", systems: 12 },
            { name: "FISMA Compliance Summary", type: "FISMA", status: "READY", systems: 15 },
            { name: "FedRAMP Continuous Monitoring", type: "FEDRAMP", status: "GENERATING", systems: 8 },
            { name: "POA&M Status Report", type: "POAM", status: "READY", systems: 15 },
            { name: "Quarterly Security Assessment", type: "QSA", status: "READY", systems: 15 },
          ].map((report, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg border-2 border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-neutral-900">{report.name}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  <span className="font-mono text-neutral-700 font-semibold">{report.type}</span> | {report.systems} systems included
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                  report.status === "READY" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-neutral-100 text-neutral-700 border-neutral-200"
                }`}>{report.status}</span>
                <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded transition-colors">
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">Total Open Findings</div>
            <div className="text-2xl font-bold text-amber-600">{systems.reduce((a, b) => a + b.openFindings, 0)}</div>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">POA&M Items</div>
            <div className="text-2xl font-bold text-neutral-900">{systems.reduce((a, b) => a + b.poamItems, 0)}</div>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">Audit Pass Probability</div>
            <div className={`text-2xl font-bold ${avgControlEffectiveness > 75 ? "text-emerald-700" : "text-amber-700"}`}>
              {Math.min(95, avgControlEffectiveness + 15).toFixed(0)}%
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
            <div className="text-xs text-neutral-500">Documentation Completeness</div>
            <div className="text-2xl font-bold text-neutral-900">82.4%</div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-4">Critical Vulnerabilities</div>
        <div className="bg-white rounded-lg border-2 border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-neutral-200 bg-neutral-50">
                <th className="text-left p-4 text-neutral-700 font-semibold">CVE</th>
                <th className="text-left p-4 text-neutral-700 font-semibold">System</th>
                <th className="text-left p-4 text-neutral-700 font-semibold">Severity</th>
                <th className="text-left p-4 text-neutral-700 font-semibold">Days Open</th>
                <th className="text-left p-4 text-neutral-700 font-semibold">Exploit Prob.</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.filter(v => v.severity === "CRITICAL" || v.severity === "HIGH").slice(0, 8).map((vuln) => (
                <tr key={vuln.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="p-4 font-mono text-neutral-900">{vuln.cve}</td>
                  <td className="p-4 text-neutral-700">{vuln.system}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                      vuln.severity === "CRITICAL" ? "bg-red-100 text-red-800 border-red-200" : "bg-orange-100 text-orange-800 border-orange-200"
                    }`}>{vuln.severity}</span>
                  </td>
                  <td className={`p-4 font-mono ${vuln.daysOpen > 60 ? "text-red-600 font-semibold" : "text-neutral-700"}`}>{vuln.daysOpen}</td>
                  <td className="p-4 font-mono text-neutral-700">{vuln.exploitProbability.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b-2 border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-900 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">NIST CYBER OPS</div>
              <div className="text-xs text-neutral-500">Federal Cybersecurity Audit & Continuity Simulator</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Tick:</span>
            <span className="font-mono font-semibold text-neutral-900">{simulationTick}</span>
          </div>
          <div className={`px-3 py-1.5 rounded font-semibold text-xs border ${getThreatColor(threatLevel)}`}>
            FPCON: {threatLevel}
          </div>
          <div className="text-neutral-700 font-mono">
            {currentTime.toLocaleTimeString()} EST
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="h-12 border-b border-neutral-200 bg-neutral-50 flex items-center px-6 gap-2 shrink-0">
        {[
          { id: "OPERATIONS", label: "Operations Center" },
          { id: "RMF_LIFECYCLE", label: "RMF Lifecycle" },
          { id: "INCIDENT_RESPONSE", label: "Incident Response" },
          { id: "COOP_SIMULATION", label: "COOP Simulation" },
          { id: "SUPPLY_CHAIN", label: "Supply Chain" },
          { id: "AUDIT_REPORTS", label: "Audit Reports" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id as ViewMode)}
            className={`px-4 py-2 text-sm font-medium rounded transition-all ${
              viewMode === tab.id
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* System Health Bar */}
      <div className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-10">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Systems</div>
            <div className="text-xl font-bold text-neutral-900">{totalSystems}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Critical Vulns</div>
            <div className="text-xl font-bold text-red-600">{criticalVulns}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">High Risk</div>
            <div className="text-xl font-bold text-orange-600">{highRiskSystems}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Avg Control Eff.</div>
            <div className={`text-xl font-bold ${avgControlEffectiveness > 70 ? "text-emerald-700" : "text-amber-700"}`}>
              {avgControlEffectiveness.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Active Incidents</div>
            <div className={`text-xl font-bold ${activeIncidents > 0 ? "text-red-600" : "text-emerald-700"}`}>{activeIncidents}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Supply Chain Risk</div>
            <div className={`text-xl font-bold ${supplyChainRisk > 40 ? "text-amber-600" : "text-emerald-700"}`}>{supplyChainRisk.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {viewMode === "OPERATIONS" && renderOperationsView()}
        {viewMode === "RMF_LIFECYCLE" && renderRMFLifecycleView()}
        {viewMode === "INCIDENT_RESPONSE" && renderIncidentResponseView()}
        {viewMode === "COOP_SIMULATION" && renderCOOPView()}
        {viewMode === "SUPPLY_CHAIN" && renderSupplyChainView()}
        {viewMode === "AUDIT_REPORTS" && renderAuditReportsView()}
      </main>
    </div>

    {/* ─── PROJECT FOOTER ────────────────────────────────────── */}
    <div style={{
      borderTop: "1px solid #cccccc",
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
        <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (TSX), Python (FastAPI, Pandas, SQLAlchemy), PostgreSQL (FISMA system registry, POAM tracker, vulnerability catalog, ATO pipeline), Redis (real-time security event cache), AWS GovCloud (S3, Lambda, RDS, CloudTrail), NIST SP 800-53 Rev. 5 controls engine, NIST SP 800-137 continuous monitoring framework, FedRAMP authorization boundary tooling, Azure Government (COOP failover environment), Splunk (SIEM event correlation), Tenable/Nessus (vulnerability scan pipeline integration), dbt (compliance metric transforms), Tableau Government (ATO status and RMF lifecycle dashboards)
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        <strong style={{ color: "#1a1a14" }}>Methods:</strong> NIST RMF lifecycle simulation across all seven phases (Prepare → Categorize → Select → Implement → Assess → Authorize → Monitor) per federal system; FISMA impact level categorization (LOW/MODERATE/HIGH) using FIPS 199 criteria; ATO authorization decision engine (Authorize / Approve with Conditions / Deny / Remediation Required) based on residual risk, open findings, and POAM velocity; CVE-indexed vulnerability scoring using CVSS v3 base + environmental modifiers; supply chain risk assessment against NIST SP 800-161 third-party dependencies; COOP scenario simulation across four continuity tiers; incident response phase tracking (Detection → Analysis → Containment → Eradication → Recovery → Post-Incident); control family effectiveness drift modeling; all system records, vulnerabilities, contractor profiles, security events, and COOP scenarios are simulated based on NIST SP 800-53, FISMA, and FedRAMP public documentation
      </p>
      <p style={{ margin: 0 }}>
        <strong style={{ color: "#1a1a14" }}>Sources:</strong> NIST SP 800-53 Rev. 5 control catalog; NIST SP 800-37 Risk Management Framework; FISMA Implementation Project guidance; OMB Circular A-130 federal information security requirements; FedRAMP System Security Plan (SSP) template schema; CISA Cybersecurity Advisory and Known Exploited Vulnerabilities (KEV) catalog schema; DHS CDM (Continuous Diagnostics and Mitigation) program documentation; NVD/CVE vulnerability database schema; system records, ATO decisions, and security event data simulated from publicly available federal cybersecurity program documentation
      </p>
    </div>
    </>
  );
}
