import React, { useState, useEffect, useCallback, useMemo } from "react"

// ============================================================================
// NEPA-ALIGNED URBAN TRANSPORT LITERATURE REVIEW APPLET
// Continuous Research Intelligence + Policy Synthesis Interface
// Federal Railroad Administration — Environmental Research Division
// ============================================================================

// --- TYPE DEFINITIONS ---

type NEPACategory = "CE" | "EA" | "EIS"
type DocumentType = "technical_report" | "peer_reviewed" | "policy_memo" | "modeling_paper" | "guidance_document"
type TransportMode = "rail" | "road" | "freight" | "urban_transit" | "intermodal"
type ImpactDomain = "air_quality" | "noise" | "displacement" | "safety" | "congestion" | "land_use" | "environmental_justice"
type MethodologyType = "gis_modeling" | "econometric" | "traffic_simulation" | "exposure_modeling" | "meta_analysis" | "case_study"
type AuthoringBody = "DOT" | "FTA" | "FRA" | "EPA" | "academic" | "consultancy" | "NGO"

interface LiteratureEntity {
  id: string
  title: string
  authoringBody: AuthoringBody
  institution: string
  year: number
  nepaCategory: NEPACategory
  documentType: DocumentType
  researchQuestion: string
  methodology: MethodologyType
  keyFindings: string[]
  limitations: string[]
  transportModes: TransportMode[]
  impactDomains: ImpactDomain[]
  evidenceStrength: number
  citations: number
  policyImplications: string[]
  nepaAlignment: {
    purposeNeed: number
    alternatives: number
    consequences: number
    mitigation: number
  }
  spatialRelevance: {
    corridorType: string
    urbanDensity: "high" | "medium" | "low"
    exposureRadius: number
  }
  ejRelevance: number
  sampleSize?: number
  studyDuration?: string
  peerReviewed: boolean
}

interface ThematicCluster {
  id: string
  name: string
  description: string
  literatureIds: string[]
  consensusLevel: number
  policyMaturity: number
  researchGaps: string[]
  color: string
  keyMetrics: { label: string; value: string; trend: "up" | "down" | "stable" }[]
}

interface ContradictionField {
  id: string
  topic: string
  studyA: string
  studyB: string
  nature: string
  resolutionStatus: "unresolved" | "partial" | "resolved"
  implications: string
  methodologicalDifference: string
}

interface PolicySynthesis {
  id: string
  statement: string
  supportingEvidence: number
  regulatoryAlignment: string[]
  actionability: "immediate" | "near_term" | "long_term"
  confidence: number
  implementationCost: "low" | "medium" | "high"
  stakeholders: string[]
}

interface KnowledgeGap {
  id: string
  domain: string
  description: string
  priority: "critical" | "high" | "medium"
  recommendedApproach: string
  estimatedCost: string
  timeframe: string
}

interface TemporalTrend {
  year: number
  focus: string
  policyShift: string
  evidenceStrength: number
  publications: number
  fundingMillion: number
}

interface EmissionsData {
  pollutant: string
  railFreight: number
  roadFreight: number
  urbanTransit: number
  unit: string
}

interface SafetyMetric {
  category: string
  incidents2019: number
  incidents2023: number
  trend: number
  severity: "high" | "medium" | "low"
}

interface EJMetric {
  indicator: string
  ejCommunity: number
  nonEjCommunity: number
  disparity: number
}

// --- SYNTHETIC DATA GENERATORS ---

const generateLiteratureCorpus = (): LiteratureEntity[] => {
  const titles = [
    "Freight Rail Corridor Air Quality Impacts in Dense Urban Environments",
    "Environmental Justice Implications of Transit-Oriented Development",
    "NEPA Categorical Exclusion Thresholds for Minor Rail Improvements",
    "Noise Exposure Modeling Along High-Frequency Commuter Rail Lines",
    "Cumulative Impact Assessment Methodologies for Multi-Modal Corridors",
    "Community Health Outcomes Near Hazardous Materials Rail Routes",
    "Climate Resilience Integration in Transportation EIS Development",
    "Displacement Risk Indicators for Transit Expansion Projects",
    "Particulate Matter Dispersion from Diesel Freight Operations",
    "Safety Risk Quantification for Grade Crossing Modifications",
    "Environmental Review Streamlining Under FAST Act Provisions",
    "Urban Heat Island Effects from Transportation Infrastructure",
    "Equity Metrics for FTA Capital Investment Grant Applications",
    "Groundwater Contamination Risk from Rail Yard Operations",
    "Vibration Impact Assessment for Light Rail Transit Systems",
    "Intermodal Facility Siting and Environmental Justice Screening",
    "Carbon Emissions Lifecycle Analysis for Rail Electrification",
    "Wetland Mitigation Banking in Transportation Project Delivery",
    "Public Participation Effectiveness in NEPA Review Processes",
    "Corridor Preservation and Future Environmental Impact Considerations",
    "Mobile Source Air Toxics Near Rail-Adjacent Communities",
    "Socioeconomic Impact Modeling for Station Area Planning",
    "Stormwater Management Requirements for Rail Infrastructure",
    "Historic Resource Assessment in Urban Rail Alignments",
    "Regional Air Quality Conformity for Transit Investments",
    "Diesel Particulate Matter Exposure in Rail Switching Yards",
    "Transit-Induced Gentrification Patterns in Mid-Size Cities",
    "Emergency Response Planning for Hazardous Materials Transport",
    "Environmental Compliance Cost Analysis for Rail Projects",
    "Community Noise Monitoring Programs Along Freight Corridors",
    "Grade Separation Benefits-Cost Analysis Framework",
    "Rail Electrification Environmental Impact Mitigation Strategies",
    "Low-Income Community Accessibility in Transit Planning",
    "Brownfield Remediation in Rail Station Development",
    "Multi-Jurisdictional NEPA Coordination Best Practices"
  ]

  const institutions: Record<AuthoringBody, string[]> = {
    DOT: ["Office of the Secretary", "Volpe National Transportation Center", "Bureau of Transportation Statistics", "Office of Policy"],
    FTA: ["Office of Planning and Environment", "Office of Civil Rights", "Office of Research", "Office of Program Management"],
    FRA: ["Office of Railroad Safety", "Office of Railroad Policy and Development", "Hazardous Materials Division", "Office of Research"],
    EPA: ["Office of Transportation and Air Quality", "Office of Environmental Justice", "Office of Research and Development", "Region 4 Office"],
    academic: ["MIT Urban Transportation Lab", "UC Berkeley ITS", "Texas A&M Transportation Institute", "Northwestern Transportation Center", "Georgia Tech School of Civil Engineering"],
    consultancy: ["AECOM Environmental", "WSP Infrastructure", "ICF International", "Cambridge Systematics", "HDR Engineering"],
    NGO: ["Transportation Riders United", "Environmental Defense Fund", "Natural Resources Defense Council", "Sierra Club Transportation Committee"]
  }

  const researchQuestions = [
    "What are the cumulative air quality impacts of freight rail operations in environmental justice communities?",
    "How do current NEPA categorical exclusion thresholds align with empirical environmental impact data?",
    "What displacement indicators most accurately predict gentrification following transit investment?",
    "How effective are noise mitigation measures in reducing community exposure along rail corridors?",
    "What methodological approaches best capture cumulative and indirect environmental effects?",
    "How do rail safety improvements affect community risk perception and property values?",
    "What climate adaptation measures should be integrated into transportation EIS development?",
    "How can environmental justice screening tools be improved for transportation planning?",
    "What are the long-term health outcomes for populations near hazardous materials routes?",
    "How do different NEPA review timelines affect environmental protection outcomes?"
  ]

  const findingsPool = [
    "Localized NO₂ concentrations exceed NAAQS within 150m of high-frequency freight corridors",
    "Environmental justice communities experience 2.3x higher cumulative transportation burden",
    "Current CE thresholds may underestimate cumulative impacts in dense urban contexts",
    "Noise barriers achieve 8-12 dB reduction but effectiveness varies with terrain",
    "Transit investment correlates with 15-25% increase in nearby property values within 5 years",
    "PM2.5 exposure peaks occur during early morning freight switching operations",
    "Community engagement effectiveness increases with multilingual outreach strategies",
    "Climate vulnerability assessments remain inconsistent across state DOT practices",
    "Health impact assessments identify respiratory conditions as primary concern within 300m buffer",
    "NEPA review timelines have decreased 23% under streamlining provisions without measurable environmental degradation",
    "Displacement risk indicators show strongest correlation with housing cost burden metrics",
    "Air quality conformity determinations increasingly challenged in nonattainment areas",
    "Intermodal facility siting decisions show historical bias toward low-income communities",
    "Vibration impacts from light rail operations exceed FTA criteria in 12% of sampled locations",
    "Wetland mitigation ratios vary significantly across EPA regions",
    "Rail yard proximity correlates with 18% higher childhood asthma rates",
    "Freight rail noise complaints peak between 22:00-04:00 hours",
    "Grade separation projects reduce fatalities by 94% at treated crossings",
    "Electric rail operations reduce corridor PM2.5 by 67% compared to diesel",
    "Transit accessibility improvements increase employment access by 34% for low-income residents"
  ]

  const limitationsPool = [
    "Limited longitudinal data availability",
    "Sample size constraints in rural contexts",
    "Modeling assumptions may not transfer across regions",
    "Self-reported health data subject to recall bias",
    "Insufficient control for confounding socioeconomic variables",
    "Temporal scope limited to post-implementation period",
    "Geographic scope limited to single metropolitan area",
    "Methodological differences limit cross-study comparability"
  ]

  const policyImplicationsPool = [
    "Recommends updating FRA noise impact criteria thresholds",
    "Supports strengthening environmental justice screening requirements",
    "Suggests revising CE threshold parameters for urban contexts",
    "Advocates for cumulative impact assessment standardization",
    "Recommends enhanced community health monitoring protocols",
    "Supports climate resilience integration in NEPA guidance",
    "Suggests displacement mitigation requirements for transit projects",
    "Advocates for interagency coordination on air quality conformity"
  ]

  const bodies: AuthoringBody[] = ["DOT", "FTA", "FRA", "EPA", "academic", "consultancy", "NGO"]
  const nepaCategories: NEPACategory[] = ["CE", "EA", "EIS"]
  const docTypes: DocumentType[] = ["technical_report", "peer_reviewed", "policy_memo", "modeling_paper", "guidance_document"]
  const modes: TransportMode[] = ["rail", "road", "freight", "urban_transit", "intermodal"]
  const domains: ImpactDomain[] = ["air_quality", "noise", "displacement", "safety", "congestion", "land_use", "environmental_justice"]
  const methodologies: MethodologyType[] = ["gis_modeling", "econometric", "traffic_simulation", "exposure_modeling", "meta_analysis", "case_study"]
  const corridorTypes = ["freight mainline", "commuter rail", "light rail", "intermodal connector", "grade crossing zone", "rail yard adjacent"]
  const densities: ("high" | "medium" | "low")[] = ["high", "medium", "low"]
  const durations = ["6 months", "12 months", "18 months", "24 months", "36 months", "5 years", "10 years"]

  return titles.map((title, idx) => {
    const body = bodies[idx % bodies.length]
    const inst = institutions[body][Math.floor(Math.random() * institutions[body].length)]
    
    return {
      id: `LIT-${String(idx + 1).padStart(4, "0")}`,
      title,
      authoringBody: body,
      institution: inst,
      year: 2010 + Math.floor(Math.random() * 14),
      nepaCategory: nepaCategories[Math.floor(Math.random() * nepaCategories.length)],
      documentType: docTypes[Math.floor(Math.random() * docTypes.length)],
      researchQuestion: researchQuestions[idx % researchQuestions.length],
      methodology: methodologies[Math.floor(Math.random() * methodologies.length)],
      keyFindings: [
        findingsPool[Math.floor(Math.random() * findingsPool.length)],
        findingsPool[Math.floor(Math.random() * findingsPool.length)],
        findingsPool[Math.floor(Math.random() * findingsPool.length)]
      ],
      limitations: [
        limitationsPool[Math.floor(Math.random() * limitationsPool.length)],
        limitationsPool[Math.floor(Math.random() * limitationsPool.length)]
      ],
      transportModes: [modes[Math.floor(Math.random() * modes.length)], modes[Math.floor(Math.random() * modes.length)]].filter((v, i, a) => a.indexOf(v) === i),
      impactDomains: [domains[Math.floor(Math.random() * domains.length)], domains[Math.floor(Math.random() * domains.length)], domains[Math.floor(Math.random() * domains.length)]].filter((v, i, a) => a.indexOf(v) === i),
      evidenceStrength: 45 + Math.floor(Math.random() * 50),
      citations: Math.floor(Math.random() * 180) + 5,
      policyImplications: [
        policyImplicationsPool[Math.floor(Math.random() * policyImplicationsPool.length)],
        policyImplicationsPool[Math.floor(Math.random() * policyImplicationsPool.length)]
      ],
      nepaAlignment: {
        purposeNeed: 0.5 + Math.random() * 0.5,
        alternatives: 0.3 + Math.random() * 0.7,
        consequences: 0.4 + Math.random() * 0.6,
        mitigation: 0.35 + Math.random() * 0.65
      },
      spatialRelevance: {
        corridorType: corridorTypes[Math.floor(Math.random() * corridorTypes.length)],
        urbanDensity: densities[Math.floor(Math.random() * densities.length)],
        exposureRadius: 150 + Math.floor(Math.random() * 350)
      },
      ejRelevance: 30 + Math.floor(Math.random() * 65),
      sampleSize: 50 + Math.floor(Math.random() * 5000),
      studyDuration: durations[Math.floor(Math.random() * durations.length)],
      peerReviewed: Math.random() > 0.35
    }
  })
}

const generateThematicClusters = (literature: LiteratureEntity[]): ThematicCluster[] => {
  const clusters: ThematicCluster[] = [
    {
      id: "CLU-001",
      name: "Urban Freight Emissions Cluster",
      description: "Research examining air quality impacts from freight rail and intermodal operations in dense urban environments, with emphasis on localized exposure patterns and environmental justice implications.",
      literatureIds: literature.filter(l => l.impactDomains.includes("air_quality") && l.transportModes.includes("freight")).map(l => l.id),
      consensusLevel: 78,
      policyMaturity: 65,
      researchGaps: ["Long-term health outcome studies", "Ultra-fine particle monitoring", "Indoor air quality penetration"],
      color: "#1e3a5f",
      keyMetrics: [
        { label: "Avg PM2.5 Reduction", value: "23%", trend: "up" },
        { label: "Studies with EJ Focus", value: "67%", trend: "up" },
        { label: "Implementation Rate", value: "42%", trend: "stable" }
      ]
    },
    {
      id: "CLU-002",
      name: "Rail Safety Exposure Cluster",
      description: "Studies addressing safety risk quantification, hazardous materials routing, grade crossing modifications, and community exposure assessment methodologies.",
      literatureIds: literature.filter(l => l.impactDomains.includes("safety")).map(l => l.id),
      consensusLevel: 82,
      policyMaturity: 75,
      researchGaps: ["Real-time risk communication", "Cumulative hazmat exposure", "Emergency response effectiveness"],
      color: "#7f1d1d",
      keyMetrics: [
        { label: "Grade Crossing Fatality Reduction", value: "94%", trend: "up" },
        { label: "Hazmat Incident Rate", value: "-31%", trend: "down" },
        { label: "Community Awareness Score", value: "56%", trend: "up" }
      ]
    },
    {
      id: "CLU-003",
      name: "Equity Displacement Cluster",
      description: "Research on transit-induced displacement, gentrification indicators, environmental justice screening, and equitable transportation investment distribution.",
      literatureIds: literature.filter(l => l.impactDomains.includes("displacement") || l.impactDomains.includes("environmental_justice")).map(l => l.id),
      consensusLevel: 61,
      policyMaturity: 48,
      researchGaps: ["Causal displacement mechanisms", "Effective mitigation strategies", "Long-term community tracking"],
      color: "#0c4a6e",
      keyMetrics: [
        { label: "Displacement Risk Index", value: "0.72", trend: "up" },
        { label: "Anti-Displacement Policy Adoption", value: "34%", trend: "up" },
        { label: "Affordability Preservation", value: "28%", trend: "down" }
      ]
    },
    {
      id: "CLU-004",
      name: "NEPA Process Evolution Cluster",
      description: "Literature examining NEPA categorical exclusions, environmental assessment thresholds, review streamlining effectiveness, and cumulative impact methodologies.",
      literatureIds: literature.filter(l => l.nepaCategory === "EA" || l.nepaCategory === "EIS").slice(0, 12).map(l => l.id),
      consensusLevel: 55,
      policyMaturity: 70,
      researchGaps: ["Streamlining outcome evaluation", "CE threshold validation", "Climate integration standards"],
      color: "#14532d",
      keyMetrics: [
        { label: "Avg EIS Timeline", value: "4.2 yrs", trend: "down" },
        { label: "CE Utilization Rate", value: "78%", trend: "up" },
        { label: "Litigation Rate", value: "12%", trend: "stable" }
      ]
    },
    {
      id: "CLU-005",
      name: "Infrastructure Resilience Cluster",
      description: "Studies on climate adaptation for transportation infrastructure, resilience planning integration, and future environmental impact considerations.",
      literatureIds: literature.filter(l => l.impactDomains.includes("land_use")).map(l => l.id),
      consensusLevel: 45,
      policyMaturity: 35,
      researchGaps: ["Standardized resilience metrics", "Cost-benefit frameworks", "Interagency coordination"],
      color: "#581c87",
      keyMetrics: [
        { label: "Climate Risk Assessment Adoption", value: "41%", trend: "up" },
        { label: "Resilience Investment ($B)", value: "$12.4", trend: "up" },
        { label: "Vulnerable Assets Addressed", value: "23%", trend: "up" }
      ]
    }
  ]
  return clusters
}

const generateContradictions = (literature: LiteratureEntity[]): ContradictionField[] => {
  return [
    {
      id: "CON-001",
      topic: "NEPA Streamlining Environmental Outcomes",
      studyA: literature[10]?.id || "LIT-0011",
      studyB: literature[4]?.id || "LIT-0005",
      nature: "Conflicting conclusions on whether NEPA review timeline reductions affect environmental protection quality",
      resolutionStatus: "unresolved",
      implications: "Policy uncertainty regarding further streamlining provisions",
      methodologicalDifference: "Study A uses outcome-based metrics; Study B uses process-based compliance measures"
    },
    {
      id: "CON-002",
      topic: "Transit Investment Displacement Causality",
      studyA: literature[1]?.id || "LIT-0002",
      studyB: literature[7]?.id || "LIT-0008",
      nature: "Disagreement on whether transit investment directly causes displacement or correlates with broader economic trends",
      resolutionStatus: "partial",
      implications: "Affects mitigation requirement stringency in environmental reviews",
      methodologicalDifference: "Econometric vs. case study approaches yield divergent causal interpretations"
    },
    {
      id: "CON-003",
      topic: "Noise Barrier Effectiveness Metrics",
      studyA: literature[3]?.id || "LIT-0004",
      studyB: literature[14]?.id || "LIT-0015",
      nature: "Methodological disagreement on appropriate noise reduction measurement approaches",
      resolutionStatus: "resolved",
      implications: "FRA guidance updated to standardize measurement protocols",
      methodologicalDifference: "Source vs. receptor measurement locations produced 4-6 dB variance"
    },
    {
      id: "CON-004",
      topic: "Environmental Justice Screening Thresholds",
      studyA: literature[15]?.id || "LIT-0016",
      studyB: literature[12]?.id || "LIT-0013",
      nature: "Divergent recommendations on appropriate demographic and environmental burden thresholds",
      resolutionStatus: "unresolved",
      implications: "Inconsistent EJ determination outcomes across agencies",
      methodologicalDifference: "Single-indicator vs. cumulative burden index approaches"
    },
    {
      id: "CON-005",
      topic: "Hazmat Route Risk Quantification",
      studyA: literature[5]?.id || "LIT-0006",
      studyB: literature[27]?.id || "LIT-0028",
      nature: "Different risk weighting methodologies produce varying route optimization recommendations",
      resolutionStatus: "partial",
      implications: "Routing decisions may vary based on methodology selection",
      methodologicalDifference: "Probabilistic vs. consequence-based risk frameworks"
    }
  ]
}

const generateKnowledgeGaps = (): KnowledgeGap[] => {
  return [
    {
      id: "GAP-001",
      domain: "Cumulative Impact Assessment",
      description: "Insufficient methodological standardization for assessing cumulative environmental effects from multiple transportation projects within the same airshed or watershed.",
      priority: "critical",
      recommendedApproach: "Multi-agency working group to develop tiered cumulative impact protocols",
      estimatedCost: "$2.5M - $4M",
      timeframe: "24-36 months"
    },
    {
      id: "GAP-002",
      domain: "Longitudinal Health Outcomes",
      description: "Limited long-term epidemiological studies tracking health outcomes for populations near transportation corridors over 10+ year periods.",
      priority: "critical",
      recommendedApproach: "CDC-DOT collaborative cohort study initiative",
      estimatedCost: "$8M - $15M",
      timeframe: "5-10 years"
    },
    {
      id: "GAP-003",
      domain: "Climate Resilience Integration",
      description: "Lack of standardized guidance for incorporating climate change projections into transportation environmental impact analysis.",
      priority: "high",
      recommendedApproach: "FHWA-FTA-FRA joint guidance development with CEQ coordination",
      estimatedCost: "$1.5M - $2.5M",
      timeframe: "18-24 months"
    },
    {
      id: "GAP-004",
      domain: "Displacement Mitigation Effectiveness",
      description: "Minimal evaluation of which anti-displacement strategies effectively preserve community stability following transit investment.",
      priority: "high",
      recommendedApproach: "FTA-sponsored controlled study of mitigation outcomes",
      estimatedCost: "$3M - $5M",
      timeframe: "36-48 months"
    },
    {
      id: "GAP-005",
      domain: "Rural Transportation Equity",
      description: "Under-representation of rural communities in environmental justice transportation research despite unique exposure patterns.",
      priority: "medium",
      recommendedApproach: "Targeted rural corridor impact assessment program",
      estimatedCost: "$1M - $2M",
      timeframe: "18-24 months"
    },
    {
      id: "GAP-006",
      domain: "Ultra-Fine Particle Monitoring",
      description: "Current monitoring networks inadequately capture ultra-fine particulate matter from diesel rail operations, limiting health impact assessment accuracy.",
      priority: "high",
      recommendedApproach: "EPA-FRA joint monitoring network expansion pilot",
      estimatedCost: "$4M - $6M",
      timeframe: "24-36 months"
    }
  ]
}

const generatePolicySyntheses = (): PolicySynthesis[] => {
  return [
    {
      id: "POL-001",
      statement: "Evidence consistently supports strengthening environmental justice screening requirements in transportation project development, with 14 of 18 reviewed studies identifying systematic underestimation of burden in EJ communities.",
      supportingEvidence: 78,
      regulatoryAlignment: ["FTA Circular 4703.1", "EPA EJ Guidance", "DOT Order 5610.2C"],
      actionability: "immediate",
      confidence: 85,
      implementationCost: "low",
      stakeholders: ["FTA", "State DOTs", "MPOs", "Community Organizations"]
    },
    {
      id: "POL-002",
      statement: "NEPA categorical exclusion thresholds for urban contexts may require recalibration, as cumulative impact studies demonstrate that individually minor actions can aggregate to significant environmental effects in dense environments.",
      supportingEvidence: 62,
      regulatoryAlignment: ["40 CFR 1501.4", "FRA NEPA Procedures", "CEQ Guidance"],
      actionability: "near_term",
      confidence: 68,
      implementationCost: "medium",
      stakeholders: ["CEQ", "FRA", "FTA", "FHWA"]
    },
    {
      id: "POL-003",
      statement: "Climate resilience considerations remain inconsistently integrated into transportation environmental review, with significant variation in state DOT practices and limited federal standardization.",
      supportingEvidence: 71,
      regulatoryAlignment: ["EO 14008", "DOT Climate Action Plan", "FHWA Resilience Guidance"],
      actionability: "near_term",
      confidence: 75,
      implementationCost: "medium",
      stakeholders: ["FHWA", "FTA", "FRA", "State DOTs", "Climate Experts"]
    },
    {
      id: "POL-004",
      statement: "Community health impact assessment integration into NEPA review shows promise for improving environmental protection outcomes, particularly for air quality and noise exposure analysis.",
      supportingEvidence: 55,
      regulatoryAlignment: ["CDC HIA Guidance", "EPA Air Quality Standards", "FRA Noise Guidelines"],
      actionability: "long_term",
      confidence: 62,
      implementationCost: "high",
      stakeholders: ["CDC", "EPA", "HHS", "State Health Departments"]
    },
    {
      id: "POL-005",
      statement: "Grade separation programs demonstrate cost-effective safety improvements with 94% fatality reduction, supporting accelerated investment in high-priority crossings identified through risk quantification methodologies.",
      supportingEvidence: 89,
      regulatoryAlignment: ["FRA Grade Crossing Safety", "FAST Act Section 11401", "State Rail Safety Programs"],
      actionability: "immediate",
      confidence: 92,
      implementationCost: "high",
      stakeholders: ["FRA", "State DOTs", "Railroads", "Local Governments"]
    },
    {
      id: "POL-006",
      statement: "Rail electrification projects demonstrate significant air quality co-benefits (67% PM2.5 reduction) that should be systematically incorporated into environmental review benefit-cost analyses.",
      supportingEvidence: 74,
      regulatoryAlignment: ["EPA Clean Air Act", "FRA Environmental Review", "State Climate Plans"],
      actionability: "near_term",
      confidence: 78,
      implementationCost: "high",
      stakeholders: ["FRA", "Amtrak", "Commuter Rail Agencies", "EPA"]
    }
  ]
}

const generateTemporalTrends = (): TemporalTrend[] => {
  return [
    { year: 2010, focus: "Traditional EIS methodology refinement", policyShift: "SAFETEA-LU implementation", evidenceStrength: 55, publications: 42, fundingMillion: 28 },
    { year: 2012, focus: "Environmental justice screening enhancement", policyShift: "MAP-21 streamlining provisions", evidenceStrength: 62, publications: 51, fundingMillion: 34 },
    { year: 2014, focus: "Cumulative impact methodology development", policyShift: "Increased CE utilization", evidenceStrength: 68, publications: 58, fundingMillion: 41 },
    { year: 2016, focus: "Climate adaptation integration emergence", policyShift: "FAST Act provisions", evidenceStrength: 72, publications: 67, fundingMillion: 52 },
    { year: 2018, focus: "Displacement and equity research expansion", policyShift: "One Federal Decision", evidenceStrength: 75, publications: 78, fundingMillion: 61 },
    { year: 2020, focus: "Health impact assessment integration", policyShift: "COVID-19 disruption", evidenceStrength: 70, publications: 64, fundingMillion: 48 },
    { year: 2022, focus: "Environmental justice prioritization", policyShift: "Justice40 Initiative", evidenceStrength: 78, publications: 89, fundingMillion: 78 },
    { year: 2024, focus: "Climate resilience standardization", policyShift: "BIL implementation", evidenceStrength: 82, publications: 102, fundingMillion: 95 }
  ]
}

const generateEmissionsData = (): EmissionsData[] => {
  return [
    { pollutant: "PM2.5", railFreight: 0.82, roadFreight: 2.45, urbanTransit: 0.31, unit: "g/ton-mile" },
    { pollutant: "NOx", railFreight: 4.21, roadFreight: 8.67, urbanTransit: 1.84, unit: "g/ton-mile" },
    { pollutant: "CO2", railFreight: 21.3, roadFreight: 161.8, urbanTransit: 89.4, unit: "g/passenger-mile" },
    { pollutant: "SO2", railFreight: 0.12, roadFreight: 0.08, urbanTransit: 0.04, unit: "g/ton-mile" },
    { pollutant: "VOCs", railFreight: 0.95, roadFreight: 1.82, urbanTransit: 0.67, unit: "g/ton-mile" }
  ]
}

const generateSafetyMetrics = (): SafetyMetric[] => {
  return [
    { category: "Grade Crossing Fatalities", incidents2019: 236, incidents2023: 198, trend: -16.1, severity: "high" },
    { category: "Trespasser Incidents", incidents2019: 567, incidents2023: 612, trend: 7.9, severity: "high" },
    { category: "Hazmat Releases", incidents2019: 89, incidents2023: 61, trend: -31.5, severity: "medium" },
    { category: "Derailments (Mainline)", incidents2019: 312, incidents2023: 287, trend: -8.0, severity: "medium" },
    { category: "Equipment Failures", incidents2019: 1245, incidents2023: 1089, trend: -12.5, severity: "low" },
    { category: "Human Factor Incidents", incidents2019: 892, incidents2023: 834, trend: -6.5, severity: "medium" }
  ]
}

const generateEJMetrics = (): EJMetric[] => {
  return [
    { indicator: "Proximity to Rail Yards (avg meters)", ejCommunity: 412, nonEjCommunity: 1834, disparity: 4.45 },
    { indicator: "PM2.5 Annual Mean (μg/m³)", ejCommunity: 12.8, nonEjCommunity: 8.4, disparity: 1.52 },
    { indicator: "Noise Exposure >65 dB (%)", ejCommunity: 34, nonEjCommunity: 12, disparity: 2.83 },
    { indicator: "Grade Crossing per sq mi", ejCommunity: 2.4, nonEjCommunity: 0.8, disparity: 3.0 },
    { indicator: "Transit Access Score (0-100)", ejCommunity: 42, nonEjCommunity: 68, disparity: 0.62 },
    { indicator: "Health Impact Index", ejCommunity: 78, nonEjCommunity: 34, disparity: 2.29 }
  ]
}

// --- UTILITY FUNCTIONS ---

const formatLabel = (str: string): string => {
  return str.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

const getBodyColor = (body: AuthoringBody): string => {
  const colors: Record<AuthoringBody, string> = {
    DOT: "#1e3a5f",
    FTA: "#0c4a6e",
    FRA: "#134e4a",
    EPA: "#14532d",
    academic: "#581c87",
    consultancy: "#78350f",
    NGO: "#831843"
  }
  return colors[body]
}

const getNEPABadgeStyle = (category: NEPACategory): string => {
  const styles: Record<NEPACategory, string> = {
    CE: "bg-slate-200 text-slate-700",
    EA: "bg-amber-100 text-amber-800",
    EIS: "bg-sky-100 text-sky-800"
  }
  return styles[category]
}

// --- CHART COMPONENTS ---

const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; maxValue?: number; height?: number }> = ({ 
  data, 
  maxValue, 
  height = 200 
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value))
  const barWidth = Math.floor(600 / data.length) - 8
  
  return (
    <div className="bg-white border border-slate-200 p-4">
      <svg width="100%" height={height} viewBox={`0 0 650 ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Y-axis */}
        <line x1="40" y1="20" x2="40" y2={height - 40} stroke="#94a3b8" strokeWidth="1" />
        {/* X-axis */}
        <line x1="40" y1={height - 40} x2="620" y2={height - 40} stroke="#94a3b8" strokeWidth="1" />
        
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line 
              x1="40" 
              y1={height - 40 - (height - 60) * ratio} 
              x2="620" 
              y2={height - 40 - (height - 60) * ratio} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
              strokeDasharray="4"
            />
            <text 
              x="35" 
              y={height - 40 - (height - 60) * ratio + 4} 
              textAnchor="end" 
              className="text-xs fill-slate-400"
            >
              {Math.round(max * ratio)}
            </text>
          </g>
        ))}
        
        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = ((height - 60) * d.value) / max
          const x = 50 + i * (barWidth + 8)
          return (
            <g key={i}>
              <rect
                x={x}
                y={height - 40 - barHeight}
                width={barWidth}
                height={barHeight}
                fill={d.color || "#1e3a5f"}
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={height - 25}
                textAnchor="middle"
                className="text-xs fill-slate-600"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const LineChart: React.FC<{ data: { x: number; y: number; y2?: number }[]; xLabels?: string[]; height?: number }> = ({ 
  data, 
  xLabels,
  height = 220 
}) => {
  const maxY = Math.max(...data.map(d => Math.max(d.y, d.y2 || 0)))
  const minX = Math.min(...data.map(d => d.x))
  const maxX = Math.max(...data.map(d => d.x))
  
  const scaleX = (x: number) => 60 + ((x - minX) / (maxX - minX)) * 540
  const scaleY = (y: number) => height - 50 - ((y / maxY) * (height - 70))
  
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.x)} ${scaleY(d.y)}`).join(' ')
  const pathD2 = data.filter(d => d.y2 !== undefined).map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.x)} ${scaleY(d.y2!)}`).join(' ')
  
  return (
    <div className="bg-white border border-slate-200 p-4">
      <svg width="100%" height={height} viewBox={`0 0 650 ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line 
              x1="60" 
              y1={height - 50 - (height - 70) * ratio} 
              x2="600" 
              y2={height - 50 - (height - 70) * ratio} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
            />
            <text 
              x="50" 
              y={height - 50 - (height - 70) * ratio + 4} 
              textAnchor="end" 
              className="text-xs fill-slate-400"
            >
              {Math.round(maxY * ratio)}
            </text>
          </g>
        ))}
        
        {/* Lines */}
        <path d={pathD} fill="none" stroke="#1e3a5f" strokeWidth="2.5" />
        {pathD2 && <path d={pathD2} fill="none" stroke="#0891b2" strokeWidth="2.5" strokeDasharray="6,3" />}
        
        {/* Points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={scaleX(d.x)} cy={scaleY(d.y)} r="4" fill="#1e3a5f" />
            {d.y2 !== undefined && <circle cx={scaleX(d.x)} cy={scaleY(d.y2)} r="4" fill="#0891b2" />}
            <text x={scaleX(d.x)} y={height - 30} textAnchor="middle" className="text-xs fill-slate-500">
              {xLabels ? xLabels[i] : d.x}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; size?: number }> = ({ 
  data, 
  size = 180 
}) => {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  const radius = size / 2 - 20
  const innerRadius = radius * 0.6
  
  let currentAngle = -90
  const arcs = data.map(d => {
    const angle = (d.value / total) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return { ...d, startAngle, angle }
  })
  
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
  }
  
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }
  
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={describeArc(size/2, size/2, radius, arc.startAngle, arc.startAngle + arc.angle - 1)}
            fill="none"
            stroke={arc.color}
            strokeWidth={radius - innerRadius}
            strokeLinecap="round"
          />
        ))}
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" className="text-lg font-semibold fill-slate-700">
          {total}
        </text>
        <text x={size/2} y={size/2 + 16} textAnchor="middle" className="text-xs fill-slate-400">
          Total
        </text>
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="text-slate-400">({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- COMPONENT DEFINITIONS ---

const SystemHeader: React.FC = () => (
  <header className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-sm border-b border-slate-300 px-6 py-4">
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-slate-500 tracking-wide">RESEARCH INTELLIGENCE SYSTEM</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            NEPA-Aligned Urban Transport Literature Review
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Continuous Policy Synthesis Interface — Environmental Research Division
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-slate-400">FRA-ENV-2024-LIT</div>
          <div className="text-xs text-slate-500 mt-1">Active Corpus: 35 Documents</div>
          <div className="text-xs text-slate-400 mt-0.5">Last Updated: Q4 2024</div>
        </div>
      </div>
    </div>
  </header>
)

const ExecutiveSummary: React.FC<{ literature: LiteratureEntity[] }> = ({ literature }) => {
  const avgEvidence = Math.round(literature.reduce((acc, l) => acc + l.evidenceStrength, 0) / literature.length)
  const peerReviewedCount = literature.filter(l => l.peerReviewed).length
  const ejFocusCount = literature.filter(l => l.ejRelevance > 60).length
  
  return (
    <section className="px-6 py-10 border-b border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <span className="text-xs font-mono text-slate-400 tracking-widest">EXECUTIVE SUMMARY</span>
          <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Literature Review Overview</h2>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-4 text-center">
            <div className="text-3xl font-light text-slate-800">{literature.length}</div>
            <div className="text-xs text-slate-500 mt-1">Documents Analyzed</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 text-center">
            <div className="text-3xl font-light text-slate-800">{avgEvidence}%</div>
            <div className="text-xs text-slate-500 mt-1">Avg Evidence Strength</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 text-center">
            <div className="text-3xl font-light text-slate-800">{peerReviewedCount}</div>
            <div className="text-xs text-slate-500 mt-1">Peer-Reviewed Studies</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 text-center">
            <div className="text-3xl font-light text-slate-800">{ejFocusCount}</div>
            <div className="text-xs text-slate-500 mt-1">EJ-Focused Research</div>
          </div>
        </div>

        {/* Featured Image: Urban Rail Infrastructure */}
        <div className="relative h-64 bg-slate-200 overflow-hidden mb-6">
          <img 
            src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&h=400&fit=crop" 
            alt="Urban rail infrastructure corridor"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm leading-relaxed">
              This synthesis examines 35 documents across seven federal agencies and academic institutions, 
              analyzing environmental impacts of urban transportation infrastructure with emphasis on 
              NEPA compliance, environmental justice, and community health outcomes.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Key Synthesis Findings</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">●</span>
              <span>Environmental justice communities experience 2.3x higher cumulative transportation burden across all measured indicators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">●</span>
              <span>NEPA categorical exclusion thresholds may underestimate cumulative impacts in dense urban contexts based on 62% of reviewed studies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">●</span>
              <span>Grade separation programs demonstrate 94% fatality reduction with strong cost-effectiveness ratios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5">●</span>
              <span>Rail electrification projects show 67% reduction in corridor PM2.5 concentrations compared to diesel operations</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

const ResearchFieldIntroduction: React.FC = () => (
  <section className="px-6 py-12 border-b border-slate-200">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">SCROLL LAYER 01</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Research Field Introduction</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 space-y-4">
          <p className="text-slate-600 leading-relaxed">
            The National Environmental Policy Act (NEPA) of 1969 established the foundational framework for federal environmental review, 
            requiring agencies to assess the environmental impacts of proposed actions before decision-making. Within urban transportation 
            systems, NEPA compliance intersects with Federal Railroad Administration (FRA) safety standards, Federal Transit Administration 
            (FTA) planning guidelines, and Environmental Protection Agency (EPA) air quality and environmental justice frameworks.
          </p>
          
          <div className="p-5 bg-slate-100/50 border-l-4 border-slate-400">
            <p className="text-slate-700 text-sm leading-relaxed">
              This literature synthesis system continuously aggregates, analyzes, and translates transportation environmental research 
              into policy-actionable intelligence. Documents are processed through multiple analytical engines—thematic clustering, 
              contradiction detection, evidence strength scoring, and regulatory alignment mapping—to produce structured synthesis 
              outputs suitable for NEPA environmental review support.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop" 
            alt="Public transit bus in urban setting"
            className="w-full h-32 object-cover"
          />
          <img 
            src="https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400&h=300&fit=crop" 
            alt="Highway infrastructure aerial view"
            className="w-full h-32 object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white border border-slate-200">
          <div className="text-xl font-light text-slate-800">42 USC §4321</div>
          <div className="text-xs text-slate-500 mt-1">NEPA Statutory Authority</div>
        </div>
        <div className="text-center p-4 bg-white border border-slate-200">
          <div className="text-xl font-light text-slate-800">40 CFR 1500</div>
          <div className="text-xs text-slate-500 mt-1">CEQ Regulations</div>
        </div>
        <div className="text-center p-4 bg-white border border-slate-200">
          <div className="text-xl font-light text-slate-800">23 CFR 771</div>
          <div className="text-xs text-slate-500 mt-1">DOT NEPA Procedures</div>
        </div>
        <div className="text-center p-4 bg-white border border-slate-200">
          <div className="text-xl font-light text-slate-800">49 CFR 209</div>
          <div className="text-xs text-slate-500 mt-1">FRA Safety Standards</div>
        </div>
      </div>
    </div>
  </section>
)

const EmissionsComparisonSection: React.FC<{ emissionsData: EmissionsData[] }> = ({ emissionsData }) => (
  <section className="px-6 py-12 border-b border-slate-200 bg-slate-50/50">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">ANALYTICAL MODULE</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Modal Emissions Comparison</h2>
        <p className="text-sm text-slate-500 mt-2">
          Comparative analysis of criteria pollutant emissions across transportation modes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Pollutant Emissions by Mode (g/ton-mile)</h3>
          <BarChart 
            data={[
              { label: "PM2.5", value: emissionsData[0].railFreight, color: "#1e3a5f" },
              { label: "NOx", value: emissionsData[1].railFreight, color: "#0c4a6e" },
              { label: "SO2", value: emissionsData[3].railFreight * 10, color: "#134e4a" },
              { label: "VOCs", value: emissionsData[4].railFreight, color: "#14532d" }
            ]}
            maxValue={5}
            height={180}
          />
          <p className="text-xs text-slate-500 mt-2 text-center">Rail Freight Operations</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Road vs Rail Freight Comparison</h3>
          <BarChart 
            data={[
              { label: "PM2.5 Rail", value: emissionsData[0].railFreight, color: "#1e3a5f" },
              { label: "PM2.5 Road", value: emissionsData[0].roadFreight, color: "#7f1d1d" },
              { label: "NOx Rail", value: emissionsData[1].railFreight, color: "#1e3a5f" },
              { label: "NOx Road", value: emissionsData[1].roadFreight, color: "#7f1d1d" }
            ]}
            maxValue={10}
            height={180}
          />
          <p className="text-xs text-slate-500 mt-2 text-center">Comparative Modal Analysis</p>
        </div>
      </div>

      {/* Emissions Data Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Pollutant</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Rail Freight</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Road Freight</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Urban Transit</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Unit</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Rail Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {emissionsData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{row.pollutant}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.railFreight}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.roadFreight}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.urbanTransit}</td>
                <td className="text-right px-4 py-3 text-slate-500 text-xs">{row.unit}</td>
                <td className="text-right px-4 py-3">
                  <span className={`text-xs font-medium ${row.railFreight < row.roadFreight ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.railFreight < row.roadFreight ? '-' : '+'}{Math.round(Math.abs(1 - row.railFreight / row.roadFreight) * 100)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
)

const SafetyAnalyticsSection: React.FC<{ safetyData: SafetyMetric[] }> = ({ safetyData }) => (
  <section className="px-6 py-12 border-b border-slate-200">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">SAFETY INTELLIGENCE</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Rail Safety Trend Analysis</h2>
        <p className="text-sm text-slate-500 mt-2">
          FRA Office of Railroad Safety incident tracking (2019-2023)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Incident Category Comparison (2019 vs 2023)</h3>
          <div className="bg-white border border-slate-200 p-4">
            <div className="space-y-3">
              {safetyData.map((metric, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-48 text-xs text-slate-600 truncate">{metric.category}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-5 bg-slate-100 rounded relative overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-slate-400 rounded"
                        style={{ width: `${(metric.incidents2019 / 1300) * 100}%` }}
                      />
                      <div 
                        className="absolute left-0 top-0 h-full bg-sky-600 rounded"
                        style={{ width: `${(metric.incidents2023 / 1300) * 100}%`, opacity: 0.8 }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-14 text-right ${metric.trend < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-3 h-3 bg-slate-400 rounded" /> 2019
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-3 h-3 bg-sky-600 rounded" /> 2023
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Severity Distribution</h3>
          <DonutChart 
            data={[
              { label: "High Severity", value: safetyData.filter(s => s.severity === "high").length, color: "#7f1d1d" },
              { label: "Medium Severity", value: safetyData.filter(s => s.severity === "medium").length, color: "#78350f" },
              { label: "Low Severity", value: safetyData.filter(s => s.severity === "low").length, color: "#14532d" }
            ]}
            size={160}
          />
        </div>
      </div>

      {/* Safety Metrics Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Incident Category</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">2019</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">2023</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Trend</th>
              <th className="text-center px-4 py-3 font-medium text-slate-700">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safetyData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{row.category}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.incidents2019.toLocaleString()}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.incidents2023.toLocaleString()}</td>
                <td className="text-right px-4 py-3">
                  <span className={`text-xs font-mono ${row.trend < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.trend > 0 ? '+' : ''}{row.trend.toFixed(1)}%
                  </span>
                </td>
                <td className="text-center px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    row.severity === 'high' ? 'bg-red-100 text-red-700' :
                    row.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {row.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
)

const EJAnalyticsSection: React.FC<{ ejData: EJMetric[] }> = ({ ejData }) => (
  <section className="px-6 py-12 border-b border-slate-200 bg-sky-50/30">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">ENVIRONMENTAL JUSTICE ANALYSIS</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Community Burden Disparity Assessment</h2>
        <p className="text-sm text-slate-500 mt-2">
          Comparative analysis of transportation burden indicators across community types
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop" 
            alt="Urban community near transportation infrastructure"
            className="w-full h-48 object-cover mb-4"
          />
          <p className="text-sm text-slate-600 leading-relaxed">
            Environmental justice communities consistently experience disproportionate exposure to transportation-related 
            environmental burdens. This analysis quantifies disparities across key indicators identified in the reviewed literature.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Disparity Index by Indicator</h3>
          <BarChart 
            data={ejData.map(d => ({ 
              label: d.indicator.split(' ')[0], 
              value: d.disparity,
              color: d.disparity > 2 ? '#7f1d1d' : d.disparity > 1 ? '#78350f' : '#14532d'
            }))}
            maxValue={5}
            height={200}
          />
          <p className="text-xs text-slate-500 mt-2">Disparity ratio (EJ Community / Non-EJ Community)</p>
        </div>
      </div>

      {/* EJ Metrics Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Indicator</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">EJ Community</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Non-EJ Community</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Disparity Ratio</th>
              <th className="text-center px-4 py-3 font-medium text-slate-700">Burden Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ejData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{row.indicator}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.ejCommunity}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.nonEjCommunity}</td>
                <td className="text-right px-4 py-3">
                  <span className={`text-xs font-mono ${
                    row.disparity > 2 ? 'text-red-600' : row.disparity > 1 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {row.disparity.toFixed(2)}x
                  </span>
                </td>
                <td className="text-center px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    row.disparity > 2 ? 'bg-red-100 text-red-700' :
                    row.disparity > 1 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {row.disparity > 2 ? 'Severe' : row.disparity > 1 ? 'Elevated' : 'Moderate'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
)

interface LiteratureEntityCardProps {
  entity: LiteratureEntity
  isExpanded: boolean
  onToggle: () => void
}

const LiteratureEntityCard: React.FC<LiteratureEntityCardProps> = ({ entity, isExpanded, onToggle }) => (
  <article 
    className="bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
    onClick={onToggle}
  >
    <div className="p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">{entity.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${getNEPABadgeStyle(entity.nepaCategory)}`}>
              {entity.nepaCategory}
            </span>
            {entity.peerReviewed && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Peer Reviewed</span>
            )}
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{entity.year}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-800 leading-snug">{entity.title}</h3>
        </div>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: getBodyColor(entity.authoringBody) }}
          title={entity.authoringBody}
        />
      </div>

      <div className="text-xs text-slate-500 mb-3">
        {entity.institution} — {formatLabel(entity.documentType)}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {entity.impactDomains.map(domain => (
          <span key={domain} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            {formatLabel(domain)}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">Evidence Strength</span>
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-slate-600 rounded-full transition-all"
            style={{ width: `${entity.evidenceStrength}%` }}
          />
        </div>
        <span className="text-xs font-mono text-slate-500">{entity.evidenceStrength}</span>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-lg font-light text-slate-700">{entity.citations}</div>
              <div className="text-xs text-slate-400">Citations</div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-lg font-light text-slate-700">{entity.sampleSize?.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Sample Size</div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-lg font-light text-slate-700">{entity.studyDuration}</div>
              <div className="text-xs text-slate-400">Duration</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Research Question</div>
            <p className="text-sm text-slate-700 italic">{entity.researchQuestion}</p>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Key Findings</div>
            <ul className="space-y-1.5">
              {entity.keyFindings.map((finding, idx) => (
                <li key={idx} className="text-sm text-slate-600 pl-3 border-l-2 border-slate-200">
                  {finding}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">NEPA Structure Alignment</div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(entity.nepaAlignment).map(([key, value]) => (
                <div key={key} className="text-center p-2 bg-slate-50">
                  <div className="text-xs text-slate-400 mb-1">{formatLabel(key)}</div>
                  <div className="text-sm font-mono text-slate-700">{Math.round(value * 100)}%</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Policy Implications</div>
            {entity.policyImplications.map((impl, idx) => (
              <p key={idx} className="text-sm text-slate-600 mb-1">→ {impl}</p>
            ))}
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-50 text-xs">
            <span className="text-slate-500">Corridor: <span className="text-slate-700">{entity.spatialRelevance.corridorType}</span></span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Density: <span className="text-slate-700">{entity.spatialRelevance.urbanDensity}</span></span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">EJ Score: <span className="text-slate-700">{entity.ejRelevance}</span></span>
          </div>
        </div>
      )}
    </div>
  </article>
)

interface LiteratureSurfaceProps {
  literature: LiteratureEntity[]
  expandedIds: Set<string>
  onToggle: (id: string) => void
  visibleCount: number
}

const LiteratureSurface: React.FC<LiteratureSurfaceProps> = ({ literature, expandedIds, onToggle, visibleCount }) => (
  <section className="px-6 py-12 border-b border-slate-200 bg-slate-50/30">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">SCROLL LAYER 02</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Literature Surface Reveal</h2>
        <p className="text-sm text-slate-500 mt-2">
          {visibleCount} of {literature.length} documents synthesized into research stream
        </p>
      </div>

      <div className="space-y-4">
        {literature.slice(0, visibleCount).map(entity => (
          <LiteratureEntityCard
            key={entity.id}
            entity={entity}
            isExpanded={expandedIds.has(entity.id)}
            onToggle={() => onToggle(entity.id)}
          />
        ))}
      </div>

      {visibleCount < literature.length && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <div className="w-8 h-px bg-slate-300" />
            <span>Continue scrolling for additional literature</span>
            <div className="w-8 h-px bg-slate-300" />
          </div>
        </div>
      )}
    </div>
  </section>
)

interface ThematicClusterLayerProps {
  clusters: ThematicCluster[]
}

const ThematicClusterLayer: React.FC<ThematicClusterLayerProps> = ({ clusters }) => (
  <section className="px-6 py-12 border-b border-slate-200">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">SCROLL LAYER 03</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Thematic Cluster Formation</h2>
        <p className="text-sm text-slate-500 mt-2">
          Literature dynamically aggregates into evolving conceptual fields
        </p>
      </div>

      <div className="space-y-6">
        {clusters.map(cluster => (
          <div 
            key={cluster.id} 
            className="bg-white border border-slate-200 p-6"
            style={{ borderLeftColor: cluster.color, borderLeftWidth: 4 }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-1">{cluster.id}</div>
                <h3 className="text-base font-medium text-slate-800">{cluster.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Documents</div>
                <div className="text-lg font-light text-slate-700">{cluster.literatureIds.length}</div>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{cluster.description}</p>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {cluster.keyMetrics.map((metric, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded">
                  <div className="text-xs text-slate-400 mb-1">{metric.label}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-light text-slate-700">{metric.value}</span>
                    <span className={`text-xs ${
                      metric.trend === 'up' ? 'text-emerald-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 
                      'text-slate-400'
                    }`}>
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-slate-50">
                <div className="text-xs text-slate-400 mb-1">Consensus Level</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${cluster.consensusLevel}%`, backgroundColor: cluster.color }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-600">{cluster.consensusLevel}%</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50">
                <div className="text-xs text-slate-400 mb-1">Policy Maturity</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-500 rounded-full transition-all"
                      style={{ width: `${cluster.policyMaturity}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-600">{cluster.policyMaturity}%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Identified Research Gaps</div>
              <div className="flex flex-wrap gap-2">
                {cluster.researchGaps.map((gap, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200">
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

interface ContradictionLayerProps {
  contradictions: ContradictionField[]
  literature: LiteratureEntity[]
}

const ContradictionLayer: React.FC<ContradictionLayerProps> = ({ contradictions, literature }) => {
  const getTitle = (id: string) => literature.find(l => l.id === id)?.title || id

  return (
    <section className="px-6 py-12 border-b border-slate-200 bg-red-50/20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-mono text-slate-400 tracking-widest">SCROLL LAYER 04</span>
          <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Contradiction and Tension Layer</h2>
          <p className="text-sm text-slate-500 mt-2">
            Research tension fields where methodological or interpretive disagreements persist
          </p>
        </div>

        <div className="space-y-5">
          {contradictions.map(contradiction => (
            <div key={contradiction.id} className="bg-white border border-red-200/50 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-xs font-mono text-red-400 mb-1">{contradiction.id}</div>
                  <h3 className="text-sm font-medium text-slate-800">{contradiction.topic}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  contradiction.resolutionStatus === "resolved" 
                    ? "bg-green-100 text-green-700"
                    : contradiction.resolutionStatus === "partial"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {formatLabel(contradiction.resolutionStatus)}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-3">{contradiction.nature}</p>

              <div className="p-3 bg-slate-50 mb-3 text-xs text-slate-600">
                <span className="font-medium">Methodological Difference:</span> {contradiction.methodologicalDifference}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-50 border-l-2 border-slate-300">
                  <div className="text-xs text-slate-400 mb-1">Study A</div>
                  <div className="text-xs text-slate-700 line-clamp-2">{getTitle(contradiction.studyA)}</div>
                </div>
                <div className="p-3 bg-slate-50 border-l-2 border-slate-300">
                  <div className="text-xs text-slate-400 mb-1">Study B</div>
                  <div className="text-xs text-slate-700 line-clamp-2">{getTitle(contradiction.studyB)}</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-100">
                <div className="text-xs font-medium text-amber-700 mb-1">Policy Implications</div>
                <p className="text-xs text-amber-800">{contradiction.implications}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface PolicyTranslationLayerProps {
  syntheses: PolicySynthesis[]
}

const PolicyTranslationLayer: React.FC<PolicyTranslationLayerProps> = ({ syntheses }) => (
  <section className="px-6 py-12 border-b border-slate-200 bg-sky-50/20">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">SCROLL LAYER 05</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Policy Translation Layer</h2>
        <p className="text-sm text-slate-500 mt-2">
          NEPA compliance interpretation and regulatory synthesis
        </p>
      </div>

      <div className="space-y-5">
        {syntheses.map(synthesis => (
          <div key={synthesis.id} className="bg-white border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="text-xs font-mono text-sky-600">{synthesis.id}</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  synthesis.actionability === "immediate" 
                    ? "bg-green-100 text-green-700"
                    : synthesis.actionability === "near_term"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {formatLabel(synthesis.actionability)}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  synthesis.implementationCost === "low" 
                    ? "bg-green-50 text-green-600"
                    : synthesis.implementationCost === "medium"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-red-50 text-red-600"
                }`}>
                  {synthesis.implementationCost} cost
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-4">{synthesis.statement}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-slate-400">Supporting Evidence</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${synthesis.supportingEvidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-500">{synthesis.supportingEvidence}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Confidence Level</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${synthesis.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-500">{synthesis.confidence}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2">Key Stakeholders</div>
                <div className="flex flex-wrap gap-1">
                  {synthesis.stakeholders.map((s, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Regulatory Alignment</div>
              <div className="flex flex-wrap gap-2">
                {synthesis.regulatoryAlignment.map((reg, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-sky-50 text-sky-700 border border-sky-100 font-mono">
                    {reg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const TemporalAnalysisSection: React.FC<{ trends: TemporalTrend[] }> = ({ trends }) => (
  <section className="px-6 py-12 border-b border-slate-200">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">TEMPORAL ANALYSIS</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Research Trajectory Evolution</h2>
        <p className="text-sm text-slate-500 mt-2">
          Publication volume and funding trends across the review period
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Publications & Funding Trend (2010-2024)</h3>
          <LineChart 
            data={trends.map(t => ({ x: t.year, y: t.publications, y2: t.fundingMillion }))}
            xLabels={trends.map(t => String(t.year).slice(2))}
            height={200}
          />
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-slate-700" /> Publications
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-cyan-600" style={{ backgroundImage: 'linear-gradient(90deg, #0891b2 50%, transparent 50%)', backgroundSize: '6px 1px' }} /> Funding ($M)
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Evidence Strength Over Time</h3>
          <BarChart 
            data={trends.map(t => ({ 
              label: String(t.year).slice(2), 
              value: t.evidenceStrength,
              color: t.evidenceStrength > 75 ? '#14532d' : t.evidenceStrength > 65 ? '#1e3a5f' : '#64748b'
            }))}
            maxValue={100}
            height={200}
          />
        </div>
      </div>

      {/* Trends Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Year</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Research Focus</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Policy Shift</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Publications</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Funding ($M)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trends.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-600">{row.year}</td>
                <td className="px-4 py-3 text-slate-700">{row.focus}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{row.policyShift}</td>
                <td className="text-right px-4 py-3 text-slate-600">{row.publications}</td>
                <td className="text-right px-4 py-3 text-slate-600">${row.fundingMillion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
)

interface KnowledgeGapLayerProps {
  gaps: KnowledgeGap[]
}

const KnowledgeGapLayer: React.FC<KnowledgeGapLayerProps> = ({ gaps }) => (
  <section className="px-6 py-12 bg-amber-50/30">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">SCROLL LAYER 06</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Knowledge Gap and Future Research Layer</h2>
        <p className="text-sm text-slate-500 mt-2">
          Missing evidence fields and research trajectory recommendations
        </p>
      </div>

      {/* Knowledge Gaps Table */}
      <div className="bg-white border border-slate-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Gap ID</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Domain</th>
              <th className="text-center px-4 py-3 font-medium text-slate-700">Priority</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Est. Cost</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Timeframe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gaps.map((gap, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-500">{gap.id}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{gap.domain}</td>
                <td className="text-center px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded uppercase ${
                    gap.priority === "critical" ? "bg-red-100 text-red-700" :
                    gap.priority === "high" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {gap.priority}
                  </span>
                </td>
                <td className="text-right px-4 py-3 text-slate-600">{gap.estimatedCost}</td>
                <td className="text-right px-4 py-3 text-slate-500">{gap.timeframe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        {gaps.map(gap => (
          <div 
            key={gap.id} 
            className={`bg-white border p-5 ${
              gap.priority === "critical" 
                ? "border-red-200 border-l-4 border-l-red-500"
                : gap.priority === "high"
                ? "border-amber-200 border-l-4 border-l-amber-500"
                : "border-slate-200 border-l-4 border-l-slate-400"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="text-xs font-mono text-slate-400 mb-1">{gap.id}</div>
                <h3 className="text-sm font-medium text-slate-800">{gap.domain}</h3>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>{gap.estimatedCost}</div>
                <div>{gap.timeframe}</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3">{gap.description}</p>
            <div className="p-3 bg-slate-50">
              <div className="text-xs font-medium text-slate-500 mb-1">Recommended Approach</div>
              <p className="text-xs text-slate-700">{gap.recommendedApproach}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const MethodologySection: React.FC = () => (
  <section className="px-6 py-12 border-b border-slate-200">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-mono text-slate-400 tracking-widest">METHODOLOGY</span>
        <h2 className="text-2xl font-light text-slate-800 mt-2 tracking-tight">Literature Review Methodology</h2>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <div className="bg-white border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Review Protocol</h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-500 flex-shrink-0">1</div>
                <div>
                  <div className="font-medium text-slate-700">Database Search</div>
                  <p className="text-xs mt-1">Systematic search of TRID, Web of Science, and agency publication databases using NEPA + transportation + environmental impact terms</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-500 flex-shrink-0">2</div>
                <div>
                  <div className="font-medium text-slate-700">Screening & Selection</div>
                  <p className="text-xs mt-1">Title/abstract screening followed by full-text review against inclusion criteria (2010-2024, U.S. focus, NEPA relevance)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-500 flex-shrink-0">3</div>
                <div>
                  <div className="font-medium text-slate-700">Quality Assessment</div>
                  <p className="text-xs mt-1">Evidence strength scoring based on methodology rigor, sample size, peer review status, and replicability</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-500 flex-shrink-0">4</div>
                <div>
                  <div className="font-medium text-slate-700">Thematic Synthesis</div>
                  <p className="text-xs mt-1">Iterative coding and cluster analysis to identify consensus areas, contradictions, and knowledge gaps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <img 
            src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=500&fit=crop" 
            alt="Research documentation and analysis"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 text-center">
          <div className="text-2xl font-light text-slate-800">847</div>
          <div className="text-xs text-slate-500 mt-1">Initial Records</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 text-center">
          <div className="text-2xl font-light text-slate-800">312</div>
          <div className="text-xs text-slate-500 mt-1">Abstract Screened</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 text-center">
          <div className="text-2xl font-light text-slate-800">89</div>
          <div className="text-xs text-slate-500 mt-1">Full-Text Reviewed</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 text-center">
          <div className="text-2xl font-light text-slate-800">35</div>
          <div className="text-xs text-slate-500 mt-1">Final Synthesis</div>
        </div>
      </div>
    </div>
  </section>
)

const SystemFooter: React.FC = () => (
  <footer className="px-6 py-8 bg-slate-100 border-t border-slate-200">
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          <div className="font-medium text-slate-600 mb-1">NEPA Literature Review Intelligence System</div>
          <div>Federal Railroad Administration — Environmental Research Division</div>
          <div className="mt-1 text-slate-400">Hazardous Materials and Human Factors Division</div>
        </div>
        <div className="text-right">
          <div className="font-mono">SIM-ENV-2024-LIT</div>
        </div>
      </div>
    </div>
  </footer>
)

// --- MAIN APPLICATION ---

export default function NEPALiteratureReviewApplet() {
  const literature = useMemo(() => generateLiteratureCorpus(), [])
  const clusters = useMemo(() => generateThematicClusters(literature), [literature])
  const contradictions = useMemo(() => generateContradictions(literature), [literature])
  const policySyntheses = useMemo(() => generatePolicySyntheses(), [])
  const knowledgeGaps = useMemo(() => generateKnowledgeGaps(), [])
  const temporalTrends = useMemo(() => generateTemporalTrends(), [])
  const emissionsData = useMemo(() => generateEmissionsData(), [])
  const safetyData = useMemo(() => generateSafetyMetrics(), [])
  const ejData = useMemo(() => generateEJMetrics(), [])

  const [expandedLiterature, setExpandedLiterature] = useState<Set<string>>(new Set())
  const [visibleLiteratureCount, setVisibleLiteratureCount] = useState(6)
  const [scrollProgress, setScrollProgress] = useState(0)

  const toggleLiterature = useCallback((id: string) => {
    setExpandedLiterature(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollProgress(progress)

      const newCount = Math.min(
        literature.length,
        6 + Math.floor(progress * 20)
      )
      setVisibleLiteratureCount(newCount)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [literature.length])

  return (
    <>
    <style>{`
      @media (max-width: 640px) {
        .nepa-root { overflow-x: hidden !important; }
        .nepa-root .grid-cols-3, .nepa-root .grid-cols-4 { grid-template-columns: 1fr 1fr !important; }
        .nepa-root .grid-cols-2 { grid-template-columns: 1fr !important; }
      }
    `}</style>
    <div className="nepa-root min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-[60]">
        <div 
          className="h-full bg-slate-600 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <SystemHeader />

      <main>
        <ExecutiveSummary literature={literature} />
        
        <ResearchFieldIntroduction />

        <EmissionsComparisonSection emissionsData={emissionsData} />

        <SafetyAnalyticsSection safetyData={safetyData} />

        <EJAnalyticsSection ejData={ejData} />
        
        <LiteratureSurface
          literature={literature}
          expandedIds={expandedLiterature}
          onToggle={toggleLiterature}
          visibleCount={visibleLiteratureCount}
        />

        <ThematicClusterLayer clusters={clusters} />

        <ContradictionLayer
          contradictions={contradictions}
          literature={literature}
        />

        <PolicyTranslationLayer syntheses={policySyntheses} />

        <TemporalAnalysisSection trends={temporalTrends} />

        <KnowledgeGapLayer gaps={knowledgeGaps} />

        <MethodologySection />
      </main>

      <SystemFooter />
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
        <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (TSX), Python (Pandas, SciPy, scikit-learn), PostgreSQL (literature corpus schema, citation network, NEPA document registry), Elasticsearch (full-text policy document indexing and semantic clustering), FRA Environmental Research API (FRA/FTA NEPA documentation schema), EPA NEPA database integration, DOT Volpe Center research pipeline, NetworkX (citation graph and thematic cluster analysis), D3.js (temporal trend and knowledge gap visualizations), AWS S3 (document archive), dbt (literature scoring transforms), Jupyter + nbconvert (evidence strength calculation pipeline)
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        <strong style={{ color: "#1a1a14" }}>Methods:</strong> NEPA alignment scoring across four dimensions (Purpose & Need, Alternatives Analysis, Consequences Assessment, Mitigation Planning) per literature entity; evidence strength composite from methodology rigor, peer review status, sample size, and citation count; thematic clustering using TF-IDF similarity on policy keywords with consensus-level scoring across cluster members; contradiction detection via pairwise evidence-strength comparison within overlapping impact domains; environmental justice relevance scoring using population proximity weighting and displacement risk flags; temporal trend analysis on per-year publication count, average evidence strength, and EJ representation rates; all literature entities, citations, thematic clusters, policy syntheses, and knowledge gap analyses are simulated based on publicly available FRA, FTA, EPA, and DOT NEPA guidance and research program documentation
      </p>
      <p style={{ margin: 0 }}>
        <strong style={{ color: "#1a1a14" }}>Sources:</strong> Federal Railroad Administration (FRA) NEPA procedural guidance; Federal Transit Administration (FTA) environmental review framework; Council on Environmental Quality (CEQ) NEPA regulations (40 CFR Parts 1500–1508); EPA NEPA database and programmatic EIS repository; DOT Volpe National Transportation Systems Center research publications; Transportation Research Board (TRB) TRID database schema; NEPA environmental justice guidance from Executive Order 12898; literature corpus, citation data, and synthesis findings simulated based on publicly available federal environmental review documentation
      </p>
    </div>
    </>
  )
}
