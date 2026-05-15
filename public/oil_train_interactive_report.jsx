import { useState, useEffect, useRef } from "react"

// ============================================================================
// PUBLIC SAFETY "IMPACT" INTERACTIVE NEWSLETTER
// DC OIL TRAIN SAFETY & HAZARDOUS MATERIALS RISK REPORT
// Continuous Scroll Civic Risk Intelligence Interface
// ============================================================================

// --- TYPE DEFINITIONS ---
}

// --- SIMULATED DATA ---
const RAIL_SEGMENTS = [
  { id: "SEG-01", name: "Virginia Avenue Tunnel Approach", zone: "Southwest DC", populationAdjacency: 0.89, infrastructureCondition: 0.72, accidentLikelihood: 0.18, inspectionCompliance: 0.91, lastInspection: "2024-01-15" },
  { id: "SEG-02", name: "Anacostia River Crossing", zone: "Southeast DC", populationAdjacency: 0.76, infrastructureCondition: 0.68, accidentLikelihood: 0.22, inspectionCompliance: 0.85, lastInspection: "2024-02-03" },
  { id: "SEG-03", name: "Union Station Rail Yard", zone: "Northeast DC", populationAdjacency: 0.94, infrastructureCondition: 0.81, accidentLikelihood: 0.12, inspectionCompliance: 0.95, lastInspection: "2024-01-28" },
  { id: "SEG-04", name: "Rhode Island Avenue Corridor", zone: "Northeast DC", populationAdjacency: 0.82, infrastructureCondition: 0.74, accidentLikelihood: 0.16, inspectionCompliance: 0.88, lastInspection: "2024-01-20" },
  { id: "SEG-05", name: "Benning Road Industrial", zone: "Far Northeast", populationAdjacency: 0.71, infrastructureCondition: 0.65, accidentLikelihood: 0.24, inspectionCompliance: 0.79, lastInspection: "2023-12-10" },
  { id: "SEG-06", name: "CSX Metropolitan Branch", zone: "Northwest DC", populationAdjacency: 0.88, infrastructureCondition: 0.77, accidentLikelihood: 0.14, inspectionCompliance: 0.92, lastInspection: "2024-02-01" },
]

const COMMUNITY_EXPOSURES = [
  { id: "CE-01", name: "Amidon-Bowen Elementary", type: "school", population: 420, distanceToRail: 180, evacuationScore: 0.72, vulnerabilityIndex: 0.81, coordinates: { x: 35, y: 42 } },
  { id: "CE-02", name: "Providence Hospital", type: "hospital", population: 1200, distanceToRail: 340, evacuationScore: 0.58, vulnerabilityIndex: 0.89, coordinates: { x: 62, y: 28 } },
  { id: "CE-03", name: "Capitol Hill Towers", type: "housing", population: 890, distanceToRail: 220, evacuationScore: 0.65, vulnerabilityIndex: 0.74, coordinates: { x: 48, y: 55 } },
  { id: "CE-04", name: "Department of Transportation HQ", type: "federal", population: 2400, distanceToRail: 450, evacuationScore: 0.82, vulnerabilityIndex: 0.62, coordinates: { x: 28, y: 38 } },
  { id: "CE-05", name: "Navy Yard Metro Station", type: "transit", population: 15000, distanceToRail: 280, evacuationScore: 0.71, vulnerabilityIndex: 0.78, coordinates: { x: 42, y: 68 } },
  { id: "CE-06", name: "Anacostia High School", type: "school", population: 1100, distanceToRail: 390, evacuationScore: 0.69, vulnerabilityIndex: 0.76, coordinates: { x: 72, y: 62 } },
  { id: "CE-07", name: "Howard University Hospital", type: "hospital", population: 1800, distanceToRail: 520, evacuationScore: 0.61, vulnerabilityIndex: 0.85, coordinates: { x: 55, y: 22 } },
  { id: "CE-08", name: "Ivy City Residential Complex", type: "housing", population: 2200, distanceToRail: 150, evacuationScore: 0.54, vulnerabilityIndex: 0.88, coordinates: { x: 68, y: 35 } },
]

const HISTORICAL_INCIDENTS = [
  { id: "INC-2019-04", type: "near_miss", date: "2019-04-12", severity: "moderate", responseTime: 0, environmentalImpact: 0, description: "Bearing overheat detected 200m before residential zone. Train halted successfully.", segment: "SEG-05" },
  { id: "INC-2020-08", type: "inspection_failure", date: "2020-08-23", severity: "minor", responseTime: 0, environmentalImpact: 0, description: "Track geometry deviation identified during routine FRA inspection.", segment: "SEG-02" },
  { id: "INC-2021-02", type: "leak", date: "2021-02-15", severity: "minor", responseTime: 42, environmentalImpact: 0.12, description: "Minor valve leak on tank car. Contained within 45 minutes.", segment: "SEG-04" },
  { id: "INC-2022-11", type: "near_miss", date: "2022-11-08", severity: "moderate", responseTime: 0, environmentalImpact: 0, description: "Signal system malfunction near Union Station. Automatic PTC intervention.", segment: "SEG-03" },
  { id: "INC-2023-06", type: "inspection_failure", date: "2023-06-19", severity: "minor", responseTime: 0, environmentalImpact: 0, description: "Rail flaw detected via ultrasonic testing. Section replaced.", segment: "SEG-01" },
]

// --- CALCULATION ENGINES ---

// Engine 1: Hazmat Risk Propagation
function calculateHazmatRiskPropagation(segment, cargoType, weather) {
  const baseRisk = segment.accidentLikelihood
  const cargoMultiplier = cargoType === "crude_oil" ? 1.4 : cargoType === "refined_petroleum" ? 1.2 : 1.0
  const weatherMultiplier = weather.precipitation === "heavy" ? 1.3 : weather.precipitation === "light" ? 1.1 : 1.0
  const windMultiplier = weather.wind > 20 ? 1.25 : weather.wind > 10 ? 1.1 : 1.0
  const inversionMultiplier = weather.inversionLayer ? 1.35 : 1.0
  return Math.min(baseRisk * cargoMultiplier * weatherMultiplier * windMultiplier * inversionMultiplier, 1.0)
}

// Engine 2: Train Frequency Exposure
function calculateFrequencyExposure(trains, segment) {
  const trainsInSegment = trains.filter(t => t.routeSegment === segment.id).length
  const frequencySum = trains.reduce((sum, t) => sum + t.frequency, 0)
  const exposureIndex = (trainsInSegment * 0.4) + (frequencySum / 100 * 0.6)
  return Math.min(exposureIndex * segment.populationAdjacency, 1.0)
}

// Engine 3: Population Impact
function calculatePopulationImpact(community, riskLevel) {
  const distanceFactor = Math.max(0, 1 - (community.distanceToRail / 1000))
  const vulnerabilityWeight = community.vulnerabilityIndex
  const populationScale = Math.log10(community.population + 1) / 5
  return distanceFactor * vulnerabilityWeight * populationScale * riskLevel
}

// Engine 4: Infrastructure Failure Probability
function calculateInfrastructureFailure(segment, daysSinceInspection) {
  const conditionBase = 1 - segment.infrastructureCondition
  const inspectionDecay = Math.min(daysSinceInspection / 365, 1) * 0.3
  const compliancePenalty = (1 - segment.inspectionCompliance) * 0.25
  return Math.min(conditionBase + inspectionDecay + compliancePenalty, 1.0)
}

// Engine 5: Emergency Response Timing
function calculateResponseTiming(community, segment): { responseTime; feasibility } {
  const baseTime = 8 + (community.distanceToRail / 50)
  const infrastructurePenalty = (1 - segment.infrastructureCondition) * 5
  const evacuationFactor = community.evacuationScore
  const responseTime = baseTime + infrastructurePenalty
  const feasibility = evacuationFactor * (1 - (responseTime / 30))
  return { responseTime: Math.round(responseTime), feasibility: Math.max(feasibility, 0) }
}

// Engine 6: Incident Forecast (FRA-style)
function calculateIncidentForecast(segment, weather, historicalIncidents) {
  const segmentIncidents = historicalIncidents.filter(i => i.segment === segment.id).length
  const historicalWeight = segmentIncidents * 0.08
  const conditionRisk = (1 - segment.infrastructureCondition) * 0.35
  const weatherRisk = (weather.precipitation !== "none" ? 0.15 : 0) + (weather.temperature < 32 ? 0.12 : 0)
  return Math.min(segment.accidentLikelihood + historicalWeight + conditionRisk + weatherRisk, 1.0)
}

// Engine 7: NEPA Environmental Impact
function calculateEnvironmentalImpact(segment, community, spillProbability): { airQuality; soilRisk; waterRisk } {
  const baseImpact = spillProbability * 0.7
  const proximityFactor = Math.max(0, 1 - (community.distanceToRail / 800))
  return {
    airQuality: baseImpact * proximityFactor * 1.2,
    soilRisk: baseImpact * 0.85,
    waterRisk: segment.zone.includes("Anacostia") ? baseImpact * 1.4 : baseImpact * 0.6
  }
}

// Engine 8: Regulatory Compliance (FRA Alignment)
function calculateRegulatoryCompliance(segment): { score; status; findings[] } {
  const findings[] = []
  let score = segment.inspectionCompliance * 100
  
  if (segment.infrastructureCondition < 0.7) {
    score -= 10
    findings.push("Infrastructure condition below FRA threshold")
  }
  if (segment.accidentLikelihood > 0.2) {
    score -= 8
    findings.push("Elevated accident probability requires mitigation plan")
  }
  
  const status = score >= 90 ? "COMPLIANT" : score >= 75 ? "CONDITIONAL" : "NON-COMPLIANT"
  return { score: Math.max(score, 0), status, findings }
}

// Engine 9: Systemic Risk Amplification
function calculateSystemicRisk(segments, primaryFailure) {
  const failedSegment = segments.find(s => s.id === primaryFailure)
  if (!failedSegment) return 0
  
  const adjacentRisk = segments
    .filter(s => s.id !== primaryFailure)
    .reduce((sum, s) => sum + (s.accidentLikelihood * 0.3), 0)
  
  const cascadeMultiplier = failedSegment.populationAdjacency > 0.85 ? 1.5 : 1.0
  return Math.min(failedSegment.accidentLikelihood + adjacentRisk * cascadeMultiplier, 1.0)
}

// Engine 10: Tank Car Fleet Risk
function calculateTankCarRisk(train) {
  const tankCarRisk = { "DOT-111": 0.35, "CPC-1232": 0.18, "DOT-117": 0.08 }
  return tankCarRisk[train.tankCarType] || 0.2
}

// Engine 11: Environmental Justice Index
function calculateEnvironmentalJustice(community, cumulativeExposure) {
  const socioeconomicWeight = community.type === "housing" ? 1.3 : community.type === "school" ? 1.5 : 1.0
  const proximityBurden = Math.max(0, 1 - (community.distanceToRail / 500)) * 1.2
  return Math.min(cumulativeExposure * socioeconomicWeight * proximityBurden * community.vulnerabilityIndex, 1.0)
}

// Engine 12: Vapor Cloud Ignition Model (Bakken Crude)
function calculateVaporIgnitionRisk(weather, distanceFromSource) {
  const baseVolatility = 0.42 // Bakken crude high vapor pressure
  const windDispersion = weather.wind > 15 ? 0.7 : weather.wind > 5 ? 0.85 : 1.0
  const temperatureEffect = weather.temperature > 80 ? 1.3 : weather.temperature > 60 ? 1.1 : 1.0
  const distanceDecay = Math.max(0, 1 - (distanceFromSource / 300))
  return baseVolatility * windDispersion * temperatureEffect * distanceDecay
}

// --- MAIN COMPONENT ---
export default function DCOilTrainSafetyNewsletter() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeLayer, setActiveLayer] = useState(1)
  const [weather, setWeather] = useState({ temperature: 68, precipitation: "none", wind: 8, inversionLayer: false })
  const [trains, setTrains] = useState([
    { id: "HM-4471", cargoType: "crude_oil", routeSegment: "SEG-01", speed: 35, frequency: 12, riskClass: "Class 3", position: 15, tankCarType: "DOT-117" },
    { id: "HM-4472", cargoType: "refined_petroleum", routeSegment: "SEG-03", speed: 28, frequency: 8, riskClass: "Class 3", position: 45, tankCarType: "CPC-1232" },
    { id: "HM-4473", cargoType: "crude_oil", routeSegment: "SEG-05", speed: 32, frequency: 15, riskClass: "Class 3", position: 72, tankCarType: "DOT-111" },
  ])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [systemTime, setSystemTime] = useState(new Date())
  const containerRef = useRef(null)

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = Math.min(scrollTop / docHeight, 1)
        setScrollProgress(progress)
        
        // Determine active layer based on scroll
        if (progress < 0.15) setActiveLayer(1)
        else if (progress < 0.30) setActiveLayer(2)
        else if (progress < 0.45) setActiveLayer(3)
        else if (progress < 0.60) setActiveLayer(4)
        else if (progress < 0.75) setActiveLayer(5)
        else if (progress < 0.90) setActiveLayer(6)
        else setActiveLayer(7)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Simulation loop - train movement
  useEffect(() => {
    const interval = setInterval(() => {
      setTrains(prev => prev.map(train => ({
        ...train,
        position: (train.position + 0.5) % 100
      })))
      setSystemTime(new Date())
      
      // Random weather fluctuation
      if (Math.random() < 0.05) {
        setWeather(prev => ({
          ...prev,
          wind: Math.max(0, Math.min(35, prev.wind + (Math.random() - 0.5) * 5)),
          temperature: Math.max(20, Math.min(95, prev.temperature + (Math.random() - 0.5) * 3))
        }))
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Calculate aggregate risk metrics
  const aggregateRisk = RAIL_SEGMENTS.reduce((sum, seg) => {
    return sum + calculateHazmatRiskPropagation(seg, "crude_oil", weather)
  }, 0) / RAIL_SEGMENTS.length

  const populationAtRisk = COMMUNITY_EXPOSURES.reduce((sum, com) => {
    const impact = calculatePopulationImpact(com, aggregateRisk)
    return sum + (impact > 0.3 ? com.population : 0)
  }, 0)

  const complianceAverage = RAIL_SEGMENTS.reduce((sum, seg) => {
    return sum + calculateRegulatoryCompliance(seg).score
  }, 0) / RAIL_SEGMENTS.length

  return (
    <>
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Fixed Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-200">
        <div 
          className="h-full bg-amber-600 transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Fixed Header Bar */}
      <header className="fixed top-1 left-0 right-0 z-40 bg-white/95 border-b border-neutral-200 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neutral-900 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">FRA</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-900 tracking-wide">PUBLIC SAFETY IMPACT</div>
                <div className="text-[10px] text-neutral-500">HAZARDOUS MATERIALS RISK INTELLIGENCE</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">CORRIDOR RISK:</span>
              <span className={`font-mono font-semibold ${aggregateRisk > 0.25 ? "text-red-600" : aggregateRisk > 0.15 ? "text-amber-600" : "text-emerald-600"}`}>
                {(aggregateRisk * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-300" />
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">ACTIVE TRAINS:</span>
              <span className="font-mono font-semibold text-neutral-900">{trains.length}</span>
            </div>
            <div className="h-4 w-px bg-neutral-300" />
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">LAYER:</span>
              <span className="font-mono font-semibold text-neutral-900">{activeLayer}/7</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========== SCROLL LAYER 1=========== */}
      <section className="min-h-screen pt-24 px-6 flex flex-col justify-center bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold tracking-wider rounded mb-4">
              FEDERAL RAILROAD ADMINISTRATION / PHMSA ALIGNED
            </span>
            <h1 className="text-5xl font-serif font-bold text-neutral-900 leading-tight mb-6">
              Oil Train Safety in the<br />Washington DC Corridor
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl">
              A continuous intelligence briefing on hazardous materials rail transport risk, 
              population exposure, and regulatory compliance across the District&apos;s freight rail network.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-white border border-neutral-200 rounded-lg">
              <div className="text-3xl font-mono font-bold text-neutral-900">{RAIL_SEGMENTS.length}</div>
              <div className="text-sm text-neutral-600 mt-1">Rail Corridor Segments</div>
              <div className="text-xs text-neutral-400 mt-2">Under continuous FRA monitoring</div>
            </div>
            <div className="p-6 bg-white border border-neutral-200 rounded-lg">
              <div className="text-3xl font-mono font-bold text-amber-600">{populationAtRisk.toLocaleString()}</div>
              <div className="text-sm text-neutral-600 mt-1">Population in Exposure Zone</div>
              <div className="text-xs text-neutral-400 mt-2">Within 500m of active rail lines</div>
            </div>
            <div className="p-6 bg-white border border-neutral-200 rounded-lg">
              <div className="text-3xl font-mono font-bold text-neutral-900">{complianceAverage.toFixed(0)}%</div>
              <div className="text-sm text-neutral-600 mt-1">FRA Compliance Score</div>
              <div className="text-xs text-neutral-400 mt-2">Aggregate corridor assessment</div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-center">
            <div className="flex flex-col items-center text-neutral-400">
              <span className="text-xs tracking-wider mb-2">SCROLL TO CONTINUE</span>
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* =========== SCROLL LAYER 2: CORRIDOR REVEAL =========== */}
      <section className="min-h-screen px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-amber-600 tracking-wider">LAYER 02 / GEOSPATIAL ACTIVATION</span>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mt-2 mb-4">
              The DC Rail Corridor Network
            </h2>
            <p className="text-neutral-600 max-w-2xl leading-relaxed">
              Hazardous materials freight traverses six primary rail segments through Washington DC, 
              each presenting distinct risk profiles based on infrastructure condition, population adjacency, 
              and historical incident patterns.
            </p>
          </div>

          {/* Fixed DC Rail Map Visualization */}
          <div className="relative bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden" style={{ height: "500px" }}>
            {/* Satellite-style base layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-150 to-neutral-200 opacity-50" />
            
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(10)].map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-neutral-400" style={{ top: `${i * 10}%` }} />
              ))}
              {[...Array(10)].map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-neutral-400" style={{ left: `${i * 10}%` }} />
              ))}
            </div>

            {/* Rail corridor lines */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Main CSX line */}
              <path 
                d="M 50 480 Q 150 400 250 350 Q 350 280 450 250 Q 550 200 650 150" 
                stroke="#374151" 
                strokeWidth="4" 
                fill="none"
                strokeDasharray={activeLayer >= 2 ? "0" : "8 4"}
                className="transition-all duration-1000"
                opacity={activeLayer >= 2 ? 1 : 0.3}
              />
              {/* Norfolk Southern branch */}
              <path 
                d="M 250 350 Q 300 380 350 420 Q 400 450 500 470" 
                stroke="#6B7280" 
                strokeWidth="3" 
                fill="none"
                opacity={activeLayer >= 2 ? 0.8 : 0.2}
              />
              {/* Risk gradient overlays */}
              {RAIL_SEGMENTS.map((seg, idx) => {
                const risk = calculateHazmatRiskPropagation(seg, "crude_oil", weather)
                const x = 100 + idx * 90
                const y = 400 - idx * 50
                return (
                  <circle
                    key={seg.id}
                    cx={x}
                    cy={y}
                    r={activeLayer >= 2 ? 30 + risk * 40 : 10}
                    fill={risk > 0.25 ? "rgba(220, 38, 38, 0.2)" : risk > 0.15 ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.15)"}
                    className="transition-all duration-1000"
                  />
                )
              })}
            </svg>

            {/* Train position indicators */}
            {trains.map(train => {
              const x = 80 + (train.position / 100) * 500
              const y = 420 - (train.position / 100) * 300
              return (
                <div
                  key={train.id}
                  className="absolute w-4 h-4 bg-amber-500 border-2 border-white rounded-full shadow-lg transition-all duration-1000"
                  style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                    {train.id}
                  </div>
                </div>
              )
            })}

            {/* Community exposure markers */}
            {activeLayer >= 2 && COMMUNITY_EXPOSURES.slice(0, 5).map(com => {
              const impact = calculatePopulationImpact(com, aggregateRisk)
              return (
                <div
                  key={com.id}
                  className="absolute transition-all duration-500"
                  style={{ 
                    left: `${com.coordinates.x}%`, 
                    top: `${com.coordinates.y}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow ${
                    com.type === "school" ? "bg-blue-500" :
                    com.type === "hospital" ? "bg-red-500" :
                    com.type === "housing" ? "bg-purple-500" :
                    "bg-neutral-500"
                  }`} />
                  {impact > 0.3 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              )
            })}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 border border-neutral-200 rounded p-3 text-xs">
              <div className="font-semibold text-neutral-700 mb-2">MAP LEGEND</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-neutral-700" />
                  <span className="text-neutral-600">CSX Freight Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <span className="text-neutral-600">Active Hazmat Train</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  <span className="text-neutral-600">School</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <span className="text-neutral-600">Hospital</span>
                </div>
              </div>
            </div>

            {/* Coordinates */}
            <div className="absolute top-4 right-4 bg-white/95 border border-neutral-200 rounded px-3 py-2 text-xs font-mono">
              <div className="text-neutral-500">38.9072 N, 77.0369 W</div>
              <div className="text-neutral-400">WASHINGTON, DC</div>
            </div>
          </div>

          {/* Segment data table */}
          <div className="mt-8 border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Segment</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-700">Zone</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-700">Pop. Adjacency</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-700">Infrastructure</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-700">Risk Level</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-700">FRA Status</th>
                </tr>
              </thead>
              <tbody>
                {RAIL_SEGMENTS.map(seg => {
                  const compliance = calculateRegulatoryCompliance(seg)
                  const risk = calculateHazmatRiskPropagation(seg, "crude_oil", weather)
                  return (
                    <tr key={seg.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900">{seg.name}</div>
                        <div className="text-xs text-neutral-500">{seg.id}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{seg.zone}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center">
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${seg.populationAdjacency * 100}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs font-mono">{(seg.populationAdjacency * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs ${seg.infrastructureCondition > 0.75 ? "text-emerald-600" : seg.infrastructureCondition > 0.65 ? "text-amber-600" : "text-red-600"}`}>
                          {(seg.infrastructureCondition * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          risk > 0.25 ? "bg-red-100 text-red-700" :
                          risk > 0.15 ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                          {(risk * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          compliance.status === "COMPLIANT" ? "bg-emerald-100 text-emerald-700" :
                          compliance.status === "CONDITIONAL" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {compliance.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========== SCROLL LAYER 3: INCIDENT HISTORY =========== */}
      <section className="min-h-screen px-6 py-24 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-amber-600 tracking-wider">LAYER 03 / INCIDENT HISTORY</span>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mt-2 mb-4">
              Historical Safety Events
            </h2>
            <p className="text-neutral-600 max-w-2xl leading-relaxed">
              Analysis of past incidents, near-misses, and inspection findings along the DC corridor 
              reveals patterns that inform current risk modeling and regulatory priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline */}
            <div className="space-y-4">
              {HISTORICAL_INCIDENTS.map((incident, idx) => {
                const segment = RAIL_SEGMENTS.find(s => s.id === incident.segment)
                return (
                  <div 
                    key={incident.id}
                    className={`p-5 bg-white border rounded-lg cursor-pointer transition-all ${
                      selectedIncident?.id === incident.id ? "border-amber-500 shadow-md" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          incident.type === "derailment" ? "bg-red-100 text-red-700" :
                          incident.type === "leak" ? "bg-amber-100 text-amber-700" :
                          incident.type === "near_miss" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {incident.type.replace("_", " ").toUpperCase()}
                        </span>
                        <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs ${
                          incident.severity === "severe" ? "bg-red-50 text-red-600" :
                          incident.severity === "moderate" ? "bg-amber-50 text-amber-600" :
                          "bg-neutral-100 text-neutral-600"
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 font-mono">{incident.date}</span>
                    </div>
                    <p className="text-sm text-neutral-700 mb-2">{incident.description}</p>
                    <div className="text-xs text-neutral-500">
                      Location: {segment?.name || incident.segment}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Analysis Panel */}
            <div className="space-y-6">
              <div className="p-6 bg-white border border-neutral-200 rounded-lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Incident Pattern Analysis</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Near-Miss Events</span>
                      <span className="font-mono text-neutral-900">{HISTORICAL_INCIDENTS.filter(i => i.type === "near_miss").length}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Inspection Failures</span>
                      <span className="font-mono text-neutral-900">{HISTORICAL_INCIDENTS.filter(i => i.type === "inspection_failure").length}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Material Releases</span>
                      <span className="font-mono text-neutral-900">{HISTORICAL_INCIDENTS.filter(i => i.type === "leak").length}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">NTSB Root Cause Classification</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Track Geometry</span>
                      <span className="font-mono">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Equipment Failure</span>
                      <span className="font-mono">34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Human Factors</span>
                      <span className="font-mono">22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Signal Systems</span>
                      <span className="font-mono">16%</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedIncident && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-3">Selected Incident Detail</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Incident ID:</span>
                      <span className="font-mono text-amber-900">{selectedIncident.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Response Time:</span>
                      <span className="font-mono text-amber-900">{selectedIncident.responseTime > 0 ? `${selectedIncident.responseTime} min` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Environmental Impact:</span>
                      <span className="font-mono text-amber-900">{(selectedIncident.environmentalImpact * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========== SCROLL LAYER 4: LIVE RISK SIMULATION =========== */}
      <section className="min-h-screen px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-amber-600 tracking-wider">LAYER 04 / LIVE RISK SIMULATION</span>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mt-2 mb-4">
              Real-Time Hazard Modeling
            </h2>
            <p className="text-neutral-600 max-w-2xl leading-relaxed">
              Active oil train movements through the DC corridor generate dynamic risk fields 
              that fluctuate based on cargo type, tank car specifications, weather conditions, 
              and infrastructure state.
            </p>
          </div>

          {/* Live Train Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {trains.map(train => {
              const tankRisk = calculateTankCarRisk(train)
              const segment = RAIL_SEGMENTS.find(s => s.id === train.routeSegment)
              const vaporRisk = calculateVaporIgnitionRisk(weather, 200)
              
              return (
                <div key={train.id} className="p-5 bg-white border border-neutral-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">{train.id}</div>
                        <div className="text-xs text-neutral-500">{train.cargoType.replace("_", " ")}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      tankRisk > 0.25 ? "bg-red-100 text-red-700" :
                      tankRisk > 0.15 ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {train.tankCarType}
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Current Position</span>
                      <span className="font-mono">{train.position.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Speed</span>
                      <span className="font-mono">{train.speed} mph</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Tank Car Risk</span>
                      <span className={`font-mono ${tankRisk > 0.25 ? "text-red-600" : tankRisk > 0.15 ? "text-amber-600" : "text-emerald-600"}`}>
                        {(tankRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Vapor Ignition Risk</span>
                      <span className={`font-mono ${vaporRisk > 0.3 ? "text-red-600" : vaporRisk > 0.2 ? "text-amber-600" : "text-emerald-600"}`}>
                        {(vaporRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <div className="text-xs text-neutral-400">
                      Route: {segment?.name || train.routeSegment}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Weather & Environmental Conditions */}
          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg mb-8">
            <h3 className="font-semibold text-neutral-900 mb-4">Current Environmental Conditions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Temperature</div>
                <div className="text-2xl font-mono font-semibold text-neutral-900">{weather.temperature.toFixed(0)}F</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Wind Speed</div>
                <div className="text-2xl font-mono font-semibold text-neutral-900">{weather.wind.toFixed(0)} mph</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Precipitation</div>
                <div className="text-2xl font-mono font-semibold text-neutral-900 capitalize">{weather.precipitation}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Inversion Layer</div>
                <div className={`text-2xl font-mono font-semibold ${weather.inversionLayer ? "text-amber-600" : "text-emerald-600"}`}>
                  {weather.inversionLayer ? "PRESENT" : "CLEAR"}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Propagation Narrative */}
          <div className="prose prose-neutral max-w-none">
            <p className="text-lg leading-relaxed text-neutral-700">
              Under current conditions, <span className="font-semibold">Segment {RAIL_SEGMENTS[0].id}</span> ({RAIL_SEGMENTS[0].name}) 
              exhibits a <span className={`font-mono font-semibold ${aggregateRisk > 0.2 ? "text-red-600" : "text-amber-600"}`}>
              {(calculateHazmatRiskPropagation(RAIL_SEGMENTS[0], "crude_oil", weather) * 100).toFixed(1)}%</span> elevated 
              hazmat propagation risk, with adjacent population exposure affecting approximately <span className="font-semibold">
              {COMMUNITY_EXPOSURES.filter(c => c.distanceToRail < 300).reduce((sum, c) => sum + c.population, 0).toLocaleString()}</span> residents 
              within the 300-meter primary impact buffer.
            </p>
            <p className="text-lg leading-relaxed text-neutral-700 mt-4">
              The presence of <span className="font-semibold">{trains.filter(t => t.tankCarType === "DOT-111").length}</span> legacy DOT-111 
              tank cars in the current freight manifest represents a <span className="text-amber-600 font-semibold">35% higher</span> puncture 
              vulnerability compared to modern DOT-117 specifications, contributing to an elevated systemic risk profile of {" "}
              <span className="font-mono font-semibold">{(calculateSystemicRisk(RAIL_SEGMENTS, "SEG-01") * 100).toFixed(1)}%</span>.
            </p>
          </div>
        </div>
      </section>

      {/* =========== SCROLL LAYER 5: COMMUNITY IMPACT =========== */}
      <section className="min-h-screen px-6 py-24 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-amber-600 tracking-wider">LAYER 05 / COMMUNITY IMPACT</span>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mt-2 mb-4">
              Population Exposure & Environmental Justice
            </h2>
            <p className="text-neutral-600 max-w-2xl leading-relaxed">
              Vulnerable populations—including schools, hospitals, and residential communities—face 
              disproportionate exposure to hazardous materials rail risk based on proximity and 
              socioeconomic factors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Community Cards */}
            <div className="space-y-4">
              {COMMUNITY_EXPOSURES.map(com => {
                const impact = calculatePopulationImpact(com, aggregateRisk)
                const ejIndex = calculateEnvironmentalJustice(com, aggregateRisk)
                const response = calculateResponseTiming(com, RAIL_SEGMENTS[0])
                
                return (
                  <div key={com.id} className="p-5 bg-white border border-neutral-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          com.type === "school" ? "bg-blue-100" :
                          com.type === "hospital" ? "bg-red-100" :
                          com.type === "housing" ? "bg-purple-100" :
                          com.type === "federal" ? "bg-neutral-100" :
                          "bg-amber-100"
                        }`}>
                          {com.type === "school" && (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                            </svg>
                          )}
                          {com.type === "hospital" && (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                          {com.type === "housing" && (
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                          {com.type === "federal" && (
                            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {com.type === "transit" && (
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{com.name}</div>
                          <div className="text-xs text-neutral-500">{com.distanceToRail}m from rail corridor</div>
                        </div>
                      </div>
                      {impact > 0.35 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          HIGH EXPOSURE
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">Population</div>
                        <div className="font-mono font-semibold">{com.population.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">Impact Index</div>
                        <div className={`font-mono font-semibold ${impact > 0.35 ? "text-red-600" : impact > 0.2 ? "text-amber-600" : "text-emerald-600"}`}>
                          {(impact * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">EJ Index</div>
                        <div className={`font-mono font-semibold ${ejIndex > 0.5 ? "text-red-600" : ejIndex > 0.3 ? "text-amber-600" : "text-emerald-600"}`}>
                          {(ejIndex * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between text-xs">
                      <span className="text-neutral-500">Est. Response Time: <span className="font-mono text-neutral-700">{response.responseTime} min</span></span>
                      <span className="text-neutral-500">Evacuation Feasibility: <span className={`font-mono ${response.feasibility > 0.5 ? "text-emerald-600" : "text-amber-600"}`}>{(response.feasibility * 100).toFixed(0)}%</span></span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Environmental Justice Summary */}
            <div className="space-y-6">
              <div className="p-6 bg-white border border-neutral-200 rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-4">Environmental Justice Analysis</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  EPA-aligned environmental justice methodology identifies communities experiencing 
                  disproportionate cumulative exposure to hazardous materials transport risk.
                </p>

                <div className="space-y-3">
                  {COMMUNITY_EXPOSURES.filter(c => calculateEnvironmentalJustice(c, aggregateRisk) > 0.4).map(com => {
                    const ej = calculateEnvironmentalJustice(com, aggregateRisk)
                    return (
                      <div key={com.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded">
                        <div>
                          <div className="font-medium text-red-900 text-sm">{com.name}</div>
                          <div className="text-xs text-red-600">Disproportionate exposure zone</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-semibold text-red-700">{(ej * 100).toFixed(0)}%</div>
                          <div className="text-xs text-red-500">EJ Index</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2">NEPA Compliance Note</h4>
                <p className="text-sm text-amber-800">
                  Under National Environmental Policy Act requirements, proposed rail infrastructure 
                  modifications within 500m of identified high-impact communities require enhanced 
                  environmental review and public comment periods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========== SCROLL LAYER 6: EMERGENCY RESPONSE =========== */}
      <section className="min-h-screen px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-amber-600 tracking-wider">LAYER 06 / EMERGENCY RESPONSE</span>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mt-2 mb-4">
              Response Readiness & Evacuation Analysis
            </h2>
            <p className="text-neutral-600 max-w-2xl leading-relaxed">
              Emergency response timing, hazmat unit availability, and evacuation feasibility 
              determine the outcome severity of any rail incident along the DC corridor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white border border-neutral-200 rounded-lg">
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Avg Response Time</div>
              <div className="text-4xl font-mono font-bold text-neutral-900">12.4</div>
              <div className="text-sm text-neutral-600 mt-1">minutes to first responder</div>
              <div className="mt-4 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "62%" }} />
              </div>
              <div className="text-xs text-neutral-500 mt-2">Target: 8 minutes</div>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-lg">
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Hazmat Units Available</div>
              <div className="text-4xl font-mono font-bold text-emerald-600">4</div>
              <div className="text-sm text-neutral-600 mt-1">within 15-minute radius</div>
              <div className="mt-4 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "80%" }} />
              </div>
              <div className="text-xs text-neutral-500 mt-2">Capacity: 5 required minimum</div>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-lg">
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Evacuation Readiness</div>
              <div className="text-4xl font-mono font-bold text-amber-600">68%</div>
              <div className="text-sm text-neutral-600 mt-1">corridor-wide score</div>
              <div className="mt-4 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "68%" }} />
              </div>
              <div className="text-xs text-neutral-500 mt-2">Target: 85%</div>
            </div>
          </div>

          {/* Response Gap Analysis */}
          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-4">Response Gap Zones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RAIL_SEGMENTS.filter(seg => seg.infrastructureCondition < 0.75).map(seg => {
                const failure = calculateInfrastructureFailure(seg, 45)
                return (
                  <div key={seg.id} className="p-4 bg-white border border-neutral-200 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-neutral-900">{seg.name}</div>
                        <div className="text-xs text-neutral-500">{seg.zone}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                        GAP IDENTIFIED
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 mt-2">
                      Infrastructure failure probability: <span className="font-mono font-semibold text-amber-600">{(failure * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========== SCROLL LAYER 7: POLICY IMPLICATIONS =========== */}
      <section className="min-h-screen px-6 py-24 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-amber-400 tracking-wider">LAYER 07 / POLICY IMPLICATIONS</span>
            <h2 className="text-3xl font-serif font-bold text-white mt-2 mb-4">
              Regulatory Context & Recommendations
            </h2>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-neutral-300 leading-relaxed">
              The Federal Railroad Administration, in coordination with PHMSA, maintains oversight of 
              hazardous materials transport through urban corridors under 49 CFR Part 174. Current 
              regulatory frameworks require enhanced braking systems (ECP brakes) for high-hazard 
              flammable trains exceeding 70 cars, though implementation timelines remain contested.
            </p>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">Key Regulatory Findings</h3>
            
            <ul className="space-y-3 text-neutral-300">
              <li>
                <strong className="text-white">Tank Car Modernization:</strong> {trains.filter(t => t.tankCarType === "DOT-111").length > 0 ? 
                  `${trains.filter(t => t.tankCarType === "DOT-111").length} legacy DOT-111 cars remain in active service, presenting elevated puncture risk.` :
                  "Fleet modernization to DOT-117 standards is progressing within compliance timelines."}
              </li>
              <li>
                <strong className="text-white">Positive Train Control:</strong> PTC implementation across the DC corridor 
                has reduced signal-related incident probability by an estimated 34%.
              </li>
              <li>
                <strong className="text-white">Inspection Frequency:</strong> FRA track geometry inspections in 
                high-population segments average {Math.round(RAIL_SEGMENTS.reduce((sum, s) => sum + s.inspectionCompliance, 0) / RAIL_SEGMENTS.length * 100)}% compliance 
                with mandated schedules.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-8 mb-4">Recommended Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-amber-400 font-semibold mb-2">Immediate Priority</div>
                <p className="text-sm text-neutral-400">
                  Accelerate DOT-111 phase-out in urban corridor service to reduce 
                  catastrophic release probability.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-amber-400 font-semibold mb-2">Medium-Term</div>
                <p className="text-sm text-neutral-400">
                  Enhance emergency response coordination between FRA, DC Fire & EMS, 
                  and railroad operators.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-amber-400 font-semibold mb-2">Long-Term</div>
                <p className="text-sm text-neutral-400">
                  Evaluate route modification options to reduce population exposure 
                  in highest-vulnerability corridors.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="text-amber-400 font-semibold mb-2">Ongoing</div>
                <p className="text-sm text-neutral-400">
                  Maintain continuous monitoring and public transparency reporting 
                  per NEPA disclosure requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Report Generated</div>
                <div className="font-mono text-neutral-300">{systemTime.toISOString().split("T")[0]}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Classification</div>
                <div className="font-mono text-neutral-300">PUBLIC DISCLOSURE</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Data Sources</div>
                <div className="font-mono text-neutral-300">FRA / PHMSA / NTSB (Simulated)</div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-neutral-500 leading-relaxed">
                This interactive public safety intelligence report was produced demonstration of 
                FRA-aligned hazardous materials risk communication methodology. All data presented is 
                simulated for illustrative purposes and does not represent actual operational conditions. 
                For official rail safety information, consult FRA.gov and PHMSA.dot.gov.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* End marker */}
      <div className="h-24 bg-neutral-900 flex items-center justify-center">
        <span className="text-neutral-500 text-sm tracking-wider">END OF REPORT</span>
      </div>
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
        <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (TSX), Python (Pandas, GeoPandas, scikit-learn), PostgreSQL (FRA incident schema, PHMSA tank car registry, DOT corridor attributes), PostGIS (spatial corridor risk modeling), ArcGIS Pro (route segment visualization), Elasticsearch (incident event indexing), D3.js (population exposure overlays), FRA Safety Data API (incident reporting schema), PHMSA HMIS data pipeline, AWS S3 (static report archiving), dbt (risk metric transforms)
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        <strong style={{ color: "#1a1a14" }}>Methods:</strong> Per-segment risk scoring composite: (accident likelihood × population adjacency × infrastructure condition × inspection compliance inverse); tank car type risk weighting (DOT-111 elevated, CPC-1232 moderate, DOT-117 compliant); population exposure model using radial buffer zones per route segment, weighted by vulnerability index and evacuation score; weather-adjusted risk multipliers (precipitation, inversion layer, wind speed); real-time train movement simulation on DC corridor with 20-second position updates; regulatory compliance scoring vs. FRA inspection benchmarks; all rail movement data, incident records, community exposure metrics, and infrastructure condition scores are simulated based on publicly available FRA, PHMSA, and NTSB documentation
      </p>
      <p style={{ margin: 0 }}>
        <strong style={{ color: "#1a1a14" }}>Sources:</strong> Federal Railroad Administration (FRA) Office of Safety; Pipeline and Hazardous Materials Safety Administration (PHMSA) incident data schema; NTSB rail accident investigation reports; DC Office of Planning transportation corridor data; WMATA rail corridor GIS layers; DOT Emergency Response Guidebook (ERG) hazmat classifications; tank car safety reform data from AAR and RSI; incident and movement data simulated from FRA.gov and PHMSA.dot.gov public documentation
      </p>
    </div>
    </>
  )
}
