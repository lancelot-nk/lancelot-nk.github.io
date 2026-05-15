import { useState, useEffect, useCallback, useMemo } from "react"

// ============================================================================
// ARCGIS MAPPED CLIENT DATA REPORT TOOL (WASHINGTON STATE)
// Comprehensive Life Resources — Program & Data Manager Simulation
// A unified geospatial operational reality layer for human services delivery
// ============================================================================

// TYPE DEFINITIONS
// ============================================================================

timeToStability } => {
  const baseProb = 0.5
  const historyBonus = client.serviceHistory.length * 0.02
  const stabilityBonus = client.housingStabilityScore * 0.3
  const retentionBonus = client.serviceRetentionRate * 0.2
  
  const successProbability = Math.min(0.95, baseProb + historyBonus + stabilityBonus + retentionBonus)
  const timeToStability = Math.round(180 - (successProbability * 100))
  
  return { successProbability, timeToStability }
}

// 4. GRANT PERFORMANCE ENGINE
const calculateGrantPerformance = (programs): { totalUtilization: number; avgCostPerOutcome: number; complianceRisk } => {
  const totalCapacity = programs.reduce((sum, p) => sum + p.capacity, 0)
  const totalActive = programs.reduce((sum, p) => sum + p.activeCaseload, 0)
  const totalUtilization = totalActive / totalCapacity
  
  const avgCostPerOutcome = programs.reduce((sum, p) => sum + p.costPerOutcome, 0) / programs.length
  
  const lowPerformers = programs.filter(p => p.completionRate < 0.6).length
  const complianceRisk = lowPerformers / programs.length
  
  return { totalUtilization, avgCostPerOutcome, complianceRisk }
}

// 5. CASE MANAGER LOAD BALANCING ENGINE
const calculateCaseloadBalance = (clients): Map<string, number> => {
  const loads = new Map<string, number>()
  clients.forEach(client => {
    const current = loads.get(client.caseManagerId) || 0
    loads.set(client.caseManagerId, current + 1)
  })
  return loads
}

// 6. EQUITY & ACCESS ENGINE
const calculateEquityMetrics = (counties): { underserved: string[], oversaturated: string[] } => {
  const underserved: string[] = []
  const oversaturated: string[] = []
  
  counties.forEach(county => {
    if (county.outreachCoverage < 0.55) underserved.push(county.name)
    if (county.serviceSaturationIndex > 0.85) oversaturated.push(county.name)
  })
  
  return { underserved, oversaturated }
}

// 7. ANOMALY DETECTION ENGINE
const detectAnomalies = (counties, events): string[] => {
  const anomalies: string[] = []
  
  counties.forEach(county => {
    if (county.dataReportingIntegrity < 0.8) {
      anomalies.push(`Data integrity warning: ${county.name} (${(county.dataReportingIntegrity * 100).toFixed(0)}%)`)
    }
    if (county.shelterOccupancy / county.shelterCapacity > 0.95) {
      anomalies.push(`Capacity critical: ${county.name} shelter at ${((county.shelterOccupancy / county.shelterCapacity) * 100).toFixed(0)}%`)
    }
  })
  
  // Check for event anomalies
  const recentEvents = events.slice(-50)
  const intakeCount = recentEvents.filter(e => e.type === "intake").length
  if (intakeCount > 30) {
    anomalies.push(`Intake surge detected: ${intakeCount} new intakes in recent window`)
  }
  
  return anomalies
}

// 8. SEASONAL STRESS ENGINE
const calculateSeasonalStress = (): { stressLevel: number; projectedPeakDays: number; recommendation } => {
  const month = new Date().getMonth()
  const winterMonths = [10, 11, 0, 1, 2] // Nov-Mar
  const isWinter = winterMonths.includes(month)
  
  const baseStress = isWinter ? 0.75 : 0.45
  const stressLevel = baseStress + Math.random() * 0.15
  const projectedPeakDays = isWinter ? Math.floor(Math.random() * 30) + 15 : Math.floor(Math.random() * 60) + 45
  
  const recommendation = stressLevel > 0.7 
    ? "Activate emergency winter protocols" 
    : stressLevel > 0.5 
    ? "Monitor capacity closely" 
    : "Standard operations"
  
  return { stressLevel, projectedPeakDays, recommendation }
}

// GENERATE SIMULATED DATA
// ============================================================================

const generateClients = (count) => {
  const statuses = ["unsheltered", "emergency_shelter", "transitional", "permanent_supportive", "housed"]
  const statusWeights = [0.35, 0.25, 0.2, 0.12, 0.08]
  
  return Array.from({ length: count }, () => {
    const county = getRandomElement(WA_COUNTIES)
    const rand = Math.random()
    let cumulative = 0
    let status = "unsheltered"
    
    for (let i = 0; i < statusWeights.length; i++) {
      cumulative += statusWeights[i]
      if (rand < cumulative) {
        status = statuses[i]
        break
      }
    }
    
    const riskLevels = ["critical", "high", "moderate", "low", "stable"]
    const riskWeights = status === "unsheltered" ? [0.3, 0.35, 0.25, 0.08, 0.02] : [0.05, 0.15, 0.35, 0.3, 0.15]
    let riskRand = Math.random()
    let riskCumulative = 0
    let risk = "moderate"
    
    for (let i = 0; i < riskWeights.length; i++) {
      riskCumulative += riskWeights[i]
      if (riskRand < riskCumulative) {
        risk = riskLevels[i]
        break
      }
    }
    
    const city = WA_CITIES.find(c => c.county === county.name) || WA_CITIES[0]
    
    return {
      id: generateClientId(),
      housingStatus: status,
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.2,
        lng: city.lng + (Math.random() - 0.5) * 0.3,
        name: city.name,
        county: county.name
      },
      serviceZone: county.name,
      mobilityRadius: Math.random() * 15 + 2,
      intakeDate: formatDate(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)),
      caseManagerId: `CM-${Math.floor(Math.random() * 200) + 1}`,
      programEnrollments: county.programs.slice(0, Math.floor(Math.random() * 2) + 1),
      housingStabilityScore: Math.random() * 0.6 + (status === "housed" ? 0.4 : 0),
      serviceRetentionRate: Math.random() * 0.5 + 0.3,
      reengagementProbability: Math.random() * 0.4 + 0.2,
      lastContact: formatDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
      riskLevel: risk,
      serviceHistory: []
    }
  })
}

const generateCaseEvents = (clients, count) => {
  const eventTypes = ["intake", "outreach_contact", "shelter_placement", "housing_referral", "follow_up", "exit"]
  const outcomes = ["successful", "pending", "no_response", "declined", "completed", "in_progress"]
  
  return Array.from({ length: count }, () => {
    const client = getRandomElement(clients)
    return {
      id: generateEventId(),
      clientId: client.id,
      type: getRandomElement(eventTypes),
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: client.location,
      workerId: `WK-${Math.floor(Math.random() * 150) + 1}`,
      outcome: getRandomElement(outcomes),
      notes: ""
    }
  })
}

// MAIN COMPONENT
// ============================================================================

export default function ArcGISWAStateTool() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [depthLayer, setDepthLayer] = useState(1)
  const [selectedCounty, setSelectedCounty] = useState(null)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [clients, setClients] = useState([])
  const [caseEvents, setCaseEvents] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    totalActiveClients: 0,
    housedRatio: 0,
    systemThroughput: 0,
    caseBacklog: 0,
    avgDaysToHousing: 0,
    outreachContactsToday: 0,
    shelterOccupancyRate: 0,
    grantUtilization: 0,
    dataCompletenessScore: 0,
    complianceRiskScore: 0
  })
  const [activeView, setActiveView] = useState("map")
  const [liveEventFeed, setLiveEventFeed] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [seasonalData, setSeasonalData] = useState({ stressLevel: 0, projectedPeakDays: 0, recommendation: "" })

  // Initialize data
  useEffect(() => {
    const initialClients = generateClients(500)
    const initialEvents = generateCaseEvents(initialClients, 200)
    setClients(initialClients)
    setCaseEvents(initialEvents)
    setLiveEventFeed(initialEvents.slice(-15))
    
    const grantPerf = calculateGrantPerformance(PROGRAMS)
    const totalShelterOccupancy = WA_COUNTIES.reduce((sum, c) => sum + c.shelterOccupancy, 0)
    const totalShelterCapacity = WA_COUNTIES.reduce((sum, c) => sum + c.shelterCapacity, 0)
    
    setSystemMetrics({
      totalActiveClients: initialClients.length,
      housedRatio: initialClients.filter(c => c.housingStatus === "housed").length / initialClients.length,
      systemThroughput: Math.floor(Math.random() * 50) + 120,
      caseBacklog: Math.floor(Math.random() * 200) + 340,
      avgDaysToHousing: 147,
      outreachContactsToday: Math.floor(Math.random() * 100) + 180,
      shelterOccupancyRate: totalShelterOccupancy / totalShelterCapacity,
      grantUtilization: grantPerf.totalUtilization,
      dataCompletenessScore: 0.89,
      complianceRiskScore: grantPerf.complianceRisk
    })
    
    setSeasonalData(calculateSeasonalStress())
    setAnomalies(detectAnomalies(WA_COUNTIES, initialEvents))
  }, [])

  // Live simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      
      // Simulate client flow
      setClients(prev => simulateClientFlow(prev))
      
      // Generate new events occasionally
      if (Math.random() < 0.3) {
        const newEvent = {
          id: generateEventId(),
          clientId: clients[Math.floor(Math.random() * clients.length)]?.id || "CL-UNKNOWN",
          type: getRandomElement(["intake", "outreach_contact", "shelter_placement", "housing_referral", "follow_up"]),
          timestamp: new Date().toISOString(),
          location: getRandomElement(WA_CITIES),
          workerId: `WK-${Math.floor(Math.random() * 150) + 1}`,
          outcome: getRandomElement(["successful", "pending", "in_progress"]),
          notes: ""
        }
        setCaseEvents(prev => [...prev, newEvent])
        setLiveEventFeed(prev => [newEvent, ...prev.slice(0, 14)])
      }
      
      // Update metrics
      setSystemMetrics(prev => ({
        ...prev,
        outreachContactsToday: prev.outreachContactsToday + (Math.random() < 0.2 ? 1 : 0),
        systemThroughput: Math.max(80, Math.min(200, prev.systemThroughput + Math.floor((Math.random() - 0.5) * 5))),
        caseBacklog: Math.max(200, Math.min(600, prev.caseBacklog + Math.floor((Math.random() - 0.45) * 3)))
      }))
      
    }, 3000)
    
    return () => clearInterval(interval)
  }, [clients])

  // Calculate derived data
  const capacityData = useMemo(() => calculateServiceCapacity(WA_COUNTIES), [])
  const equityData = useMemo(() => calculateEquityMetrics(WA_COUNTIES), [])
  
  const getEventIcon = (type) => {
    const icons: Record<CaseEventType, string> = {
      intake: "I",
      outreach_contact: "O",
      shelter_placement: "S",
      housing_referral: "H",
      follow_up: "F",
      exit: "E"
    }
    return icons[type]
  }

  const getEventColor = (type) => {
    const colors: Record<CaseEventType, string> = {
      intake: "#3b82f6",
      outreach_contact: "#8b5cf6",
      shelter_placement: "#f59e0b",
      housing_referral: "#10b981",
      follow_up: "#6b7280",
      exit: "#ef4444"
    }
    return colors[type]
  }

  const depthLabels = {
    1: "State Overview",
    2: "County Intelligence", 
    3: "Field Operations",
    4: "Micro Case Layer"
  }

  return (
    <>
    <div className="h-screen w-full bg-stone-100 text-stone-800 flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* HEADER BAR */}
      <header className="h-12 bg-stone-800 text-stone-100 flex items-center justify-between px-4 border-b border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-xs font-bold text-white">WA</div>
            <span className="font-semibold text-sm">ARCGIS CLIENT DATA REPORT TOOL</span>
          </div>
          <span className="text-stone-400 text-xs">Washington State Human Services Intelligence Layer</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400">HMIS</span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400">CONNECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-400">PRISM</span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            <span className="text-emerald-400">SYNCED</span>
          </div>
          <div className="text-stone-300 font-mono">{formatTime(currentTime)}</div>
          <div className="text-stone-400">{formatDate(currentTime)}</div>
        </div>
      </header>

      {/* SECONDARY NAV */}
      <nav className="h-10 bg-stone-200 border-b border-stone-300 flex items-center px-4 gap-1 flex-shrink-0">
        {(["map", "reports", "forecast", "audit"] as const).map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
              activeView === view 
                ? "bg-stone-700 text-white" 
                : "text-stone-600 hover:bg-stone-300"
            }`}
          >
            {view === "map" && "GEOSPATIAL OPERATIONS"}
            {view === "reports" && "COMPLIANCE REPORTS"}
            {view === "forecast" && "FORECASTING"}
            {view === "audit" && "AUDIT TRAIL"}
          </button>
        ))}
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>DEPTH:</span>
          {([1, 2, 3, 4]).map(d => (
            <button
              key={d}
              onClick={() => setDepthLayer(d)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                depthLayer === d 
                  ? "bg-stone-700 text-white" 
                  : "bg-stone-300 text-stone-600 hover:bg-stone-400"
              }`}
            >
              {d}
            </button>
          ))}
          <span className="ml-2 text-stone-600 font-medium">{depthLabels[depthLayer]}</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - CASE FLOW STREAM */}
        <aside className="w-72 bg-white border-r border-stone-300 flex flex-col flex-shrink-0">
          <div className="p-3 bg-stone-100 border-b border-stone-300">
            <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wide">LIVE CASE FLOW</h2>
            <p className="text-xs text-stone-500 mt-0.5">Real-time service events</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {liveEventFeed.map((event, idx) => (
              <div 
                key={event.id} 
                className={`p-3 border-b border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors ${idx === 0 ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: getEventColor(event.type) }}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-800 capitalize">{event.type.replace("_", " ")}</span>
                      <span className="text-xs text-stone-400">{new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5 truncate">
                      {event.location.name}, {event.location.county} County
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-400">{event.clientId}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        event.outcome === "successful" ? "bg-emerald-100 text-emerald-700" :
                        event.outcome === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-stone-100 text-stone-600"
                      }`}>
                        {event.outcome}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER - MAP VIEW */}
        <main className="flex-1 flex flex-col bg-stone-200 overflow-hidden">
          {activeView === "map" && (
            <>
              {/* MAP CONTAINER */}
              <div className="flex-1 relative bg-gradient-to-br from-stone-300 to-stone-400 overflow-hidden">
                {/* Simulated WA State Map Background */}
                <div className="absolute inset-0">
                  <svg viewBox="0 0 100 90" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {/* Water/Ocean background */}
                    <rect x="0" y="0" width="100" height="90" fill="#c5d5e4" />
                    
                    {/* Washington State Shape (simplified) */}
                    <path
                      d="M 30 5 L 95 5 L 95 8 L 92 12 L 95 18 L 95 65 L 88 65 L 88 75 L 52 75 L 52 85 L 48 85 L 48 75 L 35 75 L 35 65 L 30 65 L 30 55 L 25 50 L 25 35 L 30 30 L 32 20 L 30 15 L 30 5"
                      fill="#d4c9b8"
                      stroke="#9a8c7a"
                      strokeWidth="0.5"
                    />
                    
                    {/* Major highways (simplified) */}
                    <path d="M 35 38 L 95 38" stroke="#e8e0d4" strokeWidth="0.8" strokeDasharray="2,1" opacity="0.6" />
                    <path d="M 70 5 L 70 75" stroke="#e8e0d4" strokeWidth="0.8" strokeDasharray="2,1" opacity="0.6" />
                    
                    {/* Cascade Range (mountain ridge indication) */}
                    <path d="M 65 5 L 62 30 L 58 50 L 55 75" stroke="#b8a898" strokeWidth="1.5" fill="none" opacity="0.4" />
                    
                    {/* Service Density Heatfields (Layer 2+) */}
                    {depthLayer >= 2 && WA_COUNTIES.map((county, idx) => {
                      const intensity = county.clientCount / 15000
                      const radius = 4 + intensity * 8
                      return (
                        <circle
                          key={county.code}
                          cx={county.center.x}
                          cy={county.center.y}
                          r={radius}
                          fill={getRiskColor(county.riskLevel)}
                          opacity={0.25 + intensity * 0.2}
                          className="transition-all duration-500"
                        />
                      )
                    })}
                    
                    {/* Case Flow Vectors (Layer 3+) */}
                    {depthLayer >= 3 && (
                      <>
                        <defs>
                          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#6b7280" opacity="0.6" />
                          </marker>
                        </defs>
                        {/* Flow from rural to urban */}
                        <path d="M 42 50 Q 55 45 68 48" stroke="#6b7280" strokeWidth="0.5" fill="none" markerEnd="url(#arrowhead)" opacity="0.4" />
                        <path d="M 78 52 Q 75 45 72 38" stroke="#6b7280" strokeWidth="0.5" fill="none" markerEnd="url(#arrowhead)" opacity="0.4" />
                        <path d="M 82 38 Q 78 35 74 28" stroke="#6b7280" strokeWidth="0.5" fill="none" markerEnd="url(#arrowhead)" opacity="0.4" />
                      </>
                    )}
                    
                    {/* County markers */}
                    {WA_COUNTIES.map((county) => {
                      const isSelected = selectedCounty?.code === county.code
                      const markerSize = depthLayer >= 2 ? 2.5 : 2
                      return (
                        <g key={county.code}>
                          <circle
                            cx={county.center.x}
                            cy={county.center.y}
                            r={isSelected ? markerSize + 1 : markerSize}
                            fill={isSelected ? "#1e40af" : getRiskColor(county.riskLevel)}
                            stroke={isSelected ? "#1e40af" : "#fff"}
                            strokeWidth={isSelected ? 1 : 0.5}
                            className="cursor-pointer transition-all duration-200 hover:opacity-80"
                            onClick={() => setSelectedCounty(isSelected ? null : county)}
                          />
                          {depthLayer >= 2 && (
                            <text
                              x={county.center.x}
                              y={county.center.y + 5}
                              fontSize="2.5"
                              fill="#44403c"
                              textAnchor="middle"
                              className="pointer-events-none font-medium"
                            >
                              {county.code}
                            </text>
                          )}
                        </g>
                      )
                    })}
                    
                    {/* City labels (Layer 1+) */}
                    {WA_CITIES.slice(0, depthLayer >= 2 ? 8 : 5).map((city) => {
                      const county = WA_COUNTIES.find(c => c.name === city.county)
                      if (!county) return null
                      return (
                        <text
                          key={city.name}
                          x={county.center.x}
                          y={county.center.y - 4}
                          fontSize="2.2"
                          fill="#57534e"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          {city.name}
                        </text>
                      )
                    })}
                    
                    {/* Individual case points (Layer 4 only) */}
                    {depthLayer === 4 && clients.slice(0, 100).map((client, idx) => {
                      const county = WA_COUNTIES.find(c => c.name === client.location.county)
                      if (!county) return null
                      const offsetX = (Math.random() - 0.5) * 6
                      const offsetY = (Math.random() - 0.5) * 6
                      return (
                        <circle
                          key={client.id}
                          cx={county.center.x + offsetX}
                          cy={county.center.y + offsetY}
                          r={0.8}
                          fill={getStatusColor(client.housingStatus)}
                          opacity={0.7}
                        />
                      )
                    })}
                  </svg>
                </div>
                
                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs">
                  <div className="font-semibold text-stone-700 mb-2">Risk Stratification</div>
                  <div className="space-y-1">
                    {(["critical", "high", "moderate", "low", "stable"]).map(level => (
                      <div key={level} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskColor(level) }}></div>
                        <span className="capitalize text-stone-600">{level}</span>
                      </div>
                    ))}
                  </div>
                  {depthLayer >= 4 && (
                    <>
                      <div className="font-semibold text-stone-700 mt-3 mb-2">Housing Status</div>
                      <div className="space-y-1">
                        {(["unsheltered", "emergency_shelter", "transitional", "housed"]).map(status => (
                          <div key={status} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(status) }}></div>
                            <span className="capitalize text-stone-600">{status.replace("_", " ")}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Selected County Panel */}
                {selectedCounty && (
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 w-72">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-stone-800">{selectedCounty.name} County</h3>
                      <button onClick={() => setSelectedCounty(null)} className="text-stone-400 hover:text-stone-600 text-lg leading-none">&times;</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-stone-500">Active Clients</div>
                        <div className="text-lg font-semibold text-stone-800">{selectedCounty.clientCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-stone-500">Shelter Load</div>
                        <div className="text-lg font-semibold" style={{ color: selectedCounty.shelterOccupancy / selectedCounty.shelterCapacity > 0.9 ? "#dc2626" : "#16a34a" }}>
                          {((selectedCounty.shelterOccupancy / selectedCounty.shelterCapacity) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-stone-500">Outreach Coverage</div>
                        <div className="text-lg font-semibold text-stone-800">{(selectedCounty.outreachCoverage * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-stone-500">Data Integrity</div>
                        <div className="text-lg font-semibold" style={{ color: selectedCounty.dataReportingIntegrity > 0.85 ? "#16a34a" : "#ca8a04" }}>
                          {(selectedCounty.dataReportingIntegrity * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <div className="text-xs text-stone-500 mb-1">Active Programs</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedCounty.programs.length > 0 ? selectedCounty.programs.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{p}</span>
                        )) : <span className="text-stone-400 text-xs">No FHARP coverage</span>}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">Risk Level:</span>
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-medium text-white capitalize"
                          style={{ backgroundColor: getRiskColor(selectedCounty.riskLevel) }}
                        >
                          {selectedCounty.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* BOTTOM STATUS BAR */}
              <div className="h-20 bg-white border-t border-stone-300 flex items-center px-4 gap-6 flex-shrink-0">
                <div className="flex-1 grid grid-cols-8 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-800">{systemMetrics.totalActiveClients.toLocaleString()}</div>
                    <div className="text-xs text-stone-500">Active Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{(systemMetrics.housedRatio * 100).toFixed(1)}%</div>
                    <div className="text-xs text-stone-500">Housed Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-800">{systemMetrics.systemThroughput}</div>
                    <div className="text-xs text-stone-500">Daily Throughput</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: systemMetrics.caseBacklog > 400 ? "#dc2626" : "#ca8a04" }}>{systemMetrics.caseBacklog}</div>
                    <div className="text-xs text-stone-500">Case Backlog</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-800">{systemMetrics.avgDaysToHousing}</div>
                    <div className="text-xs text-stone-500">Avg Days to Housing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{systemMetrics.outreachContactsToday}</div>
                    <div className="text-xs text-stone-500">Outreach Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: systemMetrics.shelterOccupancyRate > 0.9 ? "#dc2626" : "#16a34a" }}>
                      {(systemMetrics.shelterOccupancyRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-stone-500">Shelter Occupancy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-800">{(systemMetrics.grantUtilization * 100).toFixed(0)}%</div>
                    <div className="text-xs text-stone-500">Grant Utilization</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === "reports" && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Compliance Reports</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* HUD Compliance Report */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-stone-800">Quarterly HUD Compliance Report</h3>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">READY</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Sheltered Count</span>
                      <span className="font-medium">{clients.filter(c => c.housingStatus !== "unsheltered").length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Unsheltered Count</span>
                      <span className="font-medium">{clients.filter(c => c.housingStatus === "unsheltered").length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Program Entry Flow</span>
                      <span className="font-medium">+{Math.floor(Math.random() * 200) + 300}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Housing Retention Rate</span>
                      <span className="font-medium text-emerald-600">78.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Data Completeness</span>
                      <span className="font-medium">{(systemMetrics.dataCompletenessScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full py-2 bg-stone-800 text-white text-sm rounded hover:bg-stone-700 transition-colors">
                    Generate Full Report
                  </button>
                </div>
                
                {/* WA State Grant Performance */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-stone-800">WA State Grant Performance</h3>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">REVIEW NEEDED</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Total Funding Utilized</span>
                      <span className="font-medium">${((systemMetrics.grantUtilization * 12500000)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Cost per Housed Individual</span>
                      <span className="font-medium">$17,340</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Cost per Outreach Contact</span>
                      <span className="font-medium">$847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Operational Efficiency</span>
                      <span className="font-medium text-emerald-600">+12% YoY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Underperforming Programs</span>
                      <span className="font-medium text-amber-600">2 flagged</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full py-2 bg-stone-800 text-white text-sm rounded hover:bg-stone-700 transition-colors">
                    Generate Full Report
                  </button>
                </div>
                
                {/* County Scorecards */}
                <div className="bg-white rounded-lg shadow p-5 col-span-2">
                  <h3 className="font-semibold text-stone-800 mb-4">County Performance Scorecards</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200">
                          <th className="text-left py-2 text-stone-500 font-medium">County</th>
                          <th className="text-center py-2 text-stone-500 font-medium">Housing Stability</th>
                          <th className="text-center py-2 text-stone-500 font-medium">Service Saturation</th>
                          <th className="text-center py-2 text-stone-500 font-medium">Outreach Coverage</th>
                          <th className="text-center py-2 text-stone-500 font-medium">Data Integrity</th>
                          <th className="text-center py-2 text-stone-500 font-medium">Risk Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {WA_COUNTIES.slice(0, 10).map(county => (
                          <tr key={county.code} className="border-b border-stone-100 hover:bg-stone-50">
                            <td className="py-2 font-medium text-stone-800">{county.name}</td>
                            <td className="text-center">
                              <span className={`px-2 py-0.5 rounded text-xs ${county.housingStabilityIndex > 0.7 ? "bg-emerald-100 text-emerald-700" : county.housingStabilityIndex > 0.6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                {(county.housingStabilityIndex * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`px-2 py-0.5 rounded text-xs ${county.serviceSaturationIndex > 0.8 ? "bg-red-100 text-red-700" : county.serviceSaturationIndex > 0.7 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {(county.serviceSaturationIndex * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`px-2 py-0.5 rounded text-xs ${county.outreachCoverage > 0.7 ? "bg-emerald-100 text-emerald-700" : county.outreachCoverage > 0.55 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                {(county.outreachCoverage * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`px-2 py-0.5 rounded text-xs ${county.dataReportingIntegrity > 0.85 ? "bg-emerald-100 text-emerald-700" : county.dataReportingIntegrity > 0.75 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                {(county.dataReportingIntegrity * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="text-center">
                              <span 
                                className="px-2 py-0.5 rounded text-xs text-white capitalize"
                                style={{ backgroundColor: getRiskColor(county.riskLevel) }}
                              >
                                {county.riskLevel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "forecast" && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Forecasting & Projections</h2>
              <div className="grid grid-cols-3 gap-6">
                {/* Seasonal Stress */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-stone-800 mb-4">Seasonal Stress Projection</h3>
                  <div className="mb-4">
                    <div className="text-3xl font-bold" style={{ color: seasonalData.stressLevel > 0.7 ? "#dc2626" : seasonalData.stressLevel > 0.5 ? "#ca8a04" : "#16a34a" }}>
                      {(seasonalData.stressLevel * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-stone-500">Current System Stress</div>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full mb-4">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${seasonalData.stressLevel * 100}%`,
                        backgroundColor: seasonalData.stressLevel > 0.7 ? "#dc2626" : seasonalData.stressLevel > 0.5 ? "#ca8a04" : "#16a34a"
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-stone-600 mb-2">
                    <span className="font-medium">Projected Peak:</span> {seasonalData.projectedPeakDays} days
                  </div>
                  <div className="p-3 bg-stone-100 rounded text-sm text-stone-700">
                    <span className="font-medium">Recommendation:</span> {seasonalData.recommendation}
                  </div>
                </div>
                
                {/* Housing Outcome Forecast */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-stone-800 mb-4">Housing Outcome Model</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-500">Successful Placements (30d)</span>
                        <span className="font-medium">~{Math.floor(systemMetrics.systemThroughput * 0.67)}</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "67%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-500">Long-term Stability (90d)</span>
                        <span className="font-medium">~{Math.floor(systemMetrics.systemThroughput * 0.52)}</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "52%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-500">Return to Unsheltered</span>
                        <span className="font-medium text-amber-600">~{Math.floor(systemMetrics.systemThroughput * 0.18)}</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Policy Impact Simulator */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-stone-800 mb-4">Policy Impact Simulator</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="font-medium text-blue-800">+20% FHARP Funding</div>
                      <div className="text-blue-600">Projected: -12% unsheltered pop.</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                      <div className="font-medium text-emerald-800">New Rural Outreach</div>
                      <div className="text-emerald-600">Projected: +8% service coverage</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded border border-amber-200">
                      <div className="font-medium text-amber-800">Shelter Capacity +200</div>
                      <div className="text-amber-600">Projected: -15% overflow events</div>
                    </div>
                  </div>
                </div>
                
                {/* Service Desert Map */}
                <div className="bg-white rounded-lg shadow p-5 col-span-2">
                  <h3 className="font-semibold text-stone-800 mb-4">Service Coverage Gaps</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-stone-600 mb-2">Underserved Counties</div>
                      <div className="space-y-2">
                        {equityData.underserved.map(county => (
                          <div key={county} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>{county}</span>
                            <span className="text-stone-400 text-xs ml-auto">{"<"}55% coverage</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-600 mb-2">Oversaturated Counties</div>
                      <div className="space-y-2">
                        {equityData.oversaturated.map(county => (
                          <div key={county} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>{county}</span>
                            <span className="text-stone-400 text-xs ml-auto">{">"}85% saturation</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Capacity Alerts */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-stone-800 mb-4">Capacity Alerts</h3>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-stone-600">Overloaded Regions</div>
                    {capacityData.overloaded.map(county => (
                      <div key={county} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {county} County - Shelter at capacity
                      </div>
                    ))}
                    {capacityData.overloaded.length === 0 && (
                      <div className="text-sm text-stone-400">No critical capacity issues</div>
                    )}
                    <div className="text-sm font-medium text-stone-600 mt-4">Underutilized Resources</div>
                    {capacityData.underutilized.slice(0, 3).map(county => (
                      <div key={county} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        {county} County - Available capacity
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "audit" && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Audit Trail & Data Quality</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Anomaly Detection */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-stone-800 mb-4">System Anomalies</h3>
                  <div className="space-y-2">
                    {anomalies.map((anomaly, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 border-l-4 border-amber-400 text-sm text-amber-800">
                        {anomaly}
                      </div>
                    ))}
                    {anomalies.length === 0 && (
                      <div className="text-sm text-stone-400">No anomalies detected</div>
                    )}
                  </div>
                </div>
                
                {/* Data Quality Metrics */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="font-semibold text-stone-800 mb-4">HMIS Data Quality</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-600">Field Completeness</span>
                        <span className="font-medium">{(systemMetrics.dataCompletenessScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${systemMetrics.dataCompletenessScore * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-600">Timestamp Consistency</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94.2%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-600">Duplicate Detection</span>
                        <span className="font-medium text-amber-600">12 flagged</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "2.4%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Audit Events */}
                <div className="bg-white rounded-lg shadow p-5 col-span-2">
                  <h3 className="font-semibold text-stone-800 mb-4">Recent System Activity</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200">
                          <th className="text-left py-2 text-stone-500 font-medium">Timestamp</th>
                          <th className="text-left py-2 text-stone-500 font-medium">Action</th>
                          <th className="text-left py-2 text-stone-500 font-medium">Entity</th>
                          <th className="text-left py-2 text-stone-500 font-medium">User</th>
                          <th className="text-left py-2 text-stone-500 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseEvents.slice(-10).reverse().map(event => (
                          <tr key={event.id} className="border-b border-stone-100 hover:bg-stone-50">
                            <td className="py-2 text-stone-600 font-mono text-xs">
                              {new Date(event.timestamp).toLocaleString()}
                            </td>
                            <td className="py-2 capitalize">{event.type.replace("_", " ")}</td>
                            <td className="py-2 font-mono text-xs">{event.clientId}</td>
                            <td className="py-2 font-mono text-xs">{event.workerId}</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                event.outcome === "successful" ? "bg-emerald-100 text-emerald-700" :
                                event.outcome === "pending" ? "bg-amber-100 text-amber-700" :
                                "bg-stone-100 text-stone-600"
                              }`}>
                                {event.outcome}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT PANEL - PROGRAM STATE */}
        <aside className="w-80 bg-white border-l border-stone-300 flex flex-col flex-shrink-0">
          <div className="p-3 bg-stone-100 border-b border-stone-300">
            <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wide">PROGRAM INTELLIGENCE</h2>
            <p className="text-xs text-stone-500 mt-0.5">FHARP & Partner Systems</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {PROGRAMS.map(program => (
              <div 
                key={program.id}
                onClick={() => setSelectedProgram(selectedProgram?.id === program.id ? null : program)}
                className={`p-3 border-b border-stone-200 cursor-pointer transition-colors ${
                  selectedProgram?.id === program.id ? "bg-blue-50" : "hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stone-800">{program.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    program.utilizationRate > 0.9 ? "bg-emerald-100 text-emerald-700" :
                    program.utilizationRate > 0.7 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {(program.utilizationRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-stone-500 mb-2">{program.agency}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400">Caseload</span>
                    <div className="font-medium text-stone-700">{program.activeCaseload}/{program.capacity}</div>
                  </div>
                  <div>
                    <span className="text-stone-400">Completion</span>
                    <div className="font-medium text-stone-700">{(program.completionRate * 100).toFixed(0)}%</div>
                  </div>
                </div>
                {selectedProgram?.id === program.id && (
                  <div className="mt-3 pt-3 border-t border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Avg Time to Stability</span>
                      <span className="font-medium">{program.avgTimeToStability} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Cost per Outcome</span>
                      <span className="font-medium">${program.costPerOutcome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Equity Score</span>
                      <span className="font-medium">{(program.equityScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Funding</span>
                      <span className="font-medium">{program.fundingSource}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Quick Stats Footer */}
          <div className="p-3 bg-stone-100 border-t border-stone-300">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-stone-500">Total Programs</div>
                <div className="text-lg font-semibold text-stone-800">{PROGRAMS.length}</div>
              </div>
              <div>
                <div className="text-stone-500">Total Capacity</div>
                <div className="text-lg font-semibold text-stone-800">{PROGRAMS.reduce((sum, p) => sum + p.capacity, 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </aside>
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
        <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (TSX), Python (FastAPI, GeoPandas, Pandas, SQLAlchemy), PostgreSQL (HMIS client schema, case event log, program enrollment records), PostGIS (county geometry, service zone polygons, client location indexing), ArcGIS Online (Washington State administrative boundary layers, spatial risk overlays), ESRI ArcGIS REST API (feature service queries, map image exports), Washington State HMIS data integration (SHA homeless management data schema), PRISM case management platform schema, Elasticsearch (client history indexing, outreach event search), Redis (active caseload caching), AWS GovCloud (S3 report archiving, Lambda event triggers), dbt (housing stability and equity score transforms)
      </p>
      <p style={{ margin: "0 0 4px 0" }}>
        <strong style={{ color: "#1a1a14" }}>Methods:</strong> Multi-depth geospatial intelligence layering (State Overview → County Intelligence → Field Operations → Micro Case Layer) with progressive data disclosure at each depth tier; housing stability score composite from service retention rate, reengagement probability, and time-since-last-contact decay; service saturation index per county using active caseload ÷ program capacity with equity-weighted adjustment; client risk classification (critical/high/moderate/low/stable) via multi-factor logistic model on housing status trajectory, service engagement frequency, and program exit outcomes; outreach coverage ratio calculation using worker dispatch records vs. estimated unsheltered population per zone; equity score computation using environmental justice metrics — income decile, transit access, language barrier weighting; all client records, case event histories, program metrics, and county-level statistics are simulated based on Washington State HMIS documentation and SHA Homeless Management public reports
      </p>
      <p style={{ margin: 0 }}>
        <strong style={{ color: "#1a1a14" }}>Sources:</strong> Washington State Department of Commerce Homelessness Data; Seattle/King County HMIS public annual reports; Washington State Homeless Management Information System (HMIS) data dictionary; HUD Homeless Data Exchange (HDX) program reporting schema; ESRI ArcGIS Washington State boundary and service area datasets; SHA (Seattle Housing Authority) housing stability outcome data; Washington State PRISM integrated case management platform documentation; client, case, and program data simulated from publicly available Washington State homeless services and HMIS documentation
      </p>
    </div>
    </>
  )
}
