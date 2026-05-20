"use client"

import React, { useState, useEffect, useCallback } from "react"

// Types
interface Report {
  id: string
  type: "ui-bug" | "employee-negligence" | "civil-rights" | "financial" | "safety" | "accessibility"
  severity: "critical" | "high" | "medium" | "low"
  status: "new" | "triaged" | "investigating" | "resolved" | "escalated"
  office: string
  program: string
  dateSubmitted: string
  lastUpdated: string
  summary: string
  assignedTo: string | null
  complianceFlags: string[]
  anonymous: boolean
  daysOpen: number
}

interface HotspotData {
  office: string
  region: string
  totalReports: number
  criticalCount: number
  trend: "up" | "down" | "stable"
  riskScore: number
  coordinates: { x: number; y: number }
}

interface AuditLog {
  id: string
  timestamp: string
  action: string
  user: string
  details: string
  reportId?: string
}

// Mock Data
const mockReports: Report[] = [
  { id: "PR-2024-0847", type: "civil-rights", severity: "critical", status: "investigating", office: "Downtown Benefits Center", program: "SNAP", dateSubmitted: "2024-01-15", lastUpdated: "2024-01-18", summary: "Alleged discriminatory denial of benefits based on national origin", assignedTo: "M. Rodriguez", complianceFlags: ["Title VI", "ADA"], anonymous: false, daysOpen: 12 },
  { id: "PR-2024-0846", type: "employee-negligence", severity: "high", status: "triaged", office: "Eastside Regional", program: "TANF", dateSubmitted: "2024-01-16", lastUpdated: "2024-01-17", summary: "Case worker failed to process renewal for 6 months resulting in benefit termination", assignedTo: "K. Thompson", complianceFlags: ["Due Process"], anonymous: true, daysOpen: 11 },
  { id: "PR-2024-0845", type: "ui-bug", severity: "medium", status: "new", office: "Online Portal", program: "All Programs", dateSubmitted: "2024-01-17", lastUpdated: "2024-01-17", summary: "Submit button unresponsive on mobile devices during peak hours", assignedTo: null, complianceFlags: ["508 Compliance"], anonymous: false, daysOpen: 10 },
  { id: "PR-2024-0844", type: "financial", severity: "critical", status: "escalated", office: "Northgate Office", program: "Medicaid", dateSubmitted: "2024-01-10", lastUpdated: "2024-01-18", summary: "Systematic underpayment of provider claims affecting 200+ recipients", assignedTo: "Director Williams", complianceFlags: ["CMS", "State Audit"], anonymous: false, daysOpen: 17 },
  { id: "PR-2024-0843", type: "safety", severity: "high", status: "investigating", office: "Southside Center", program: "Child Welfare", dateSubmitted: "2024-01-14", lastUpdated: "2024-01-16", summary: "Physical altercation in waiting area, inadequate security response", assignedTo: "S. Chen", complianceFlags: ["OSHA"], anonymous: true, daysOpen: 13 },
  { id: "PR-2024-0842", type: "accessibility", severity: "medium", status: "resolved", office: "Main Campus", program: "WIC", dateSubmitted: "2024-01-08", lastUpdated: "2024-01-15", summary: "Wheelchair ramp blocked by delivery vehicles during morning hours", assignedTo: "Facilities", complianceFlags: ["ADA"], anonymous: false, daysOpen: 0 },
  { id: "PR-2024-0841", type: "employee-negligence", severity: "critical", status: "new", office: "Call Center", program: "General Inquiry", dateSubmitted: "2024-01-18", lastUpdated: "2024-01-18", summary: "Caller placed on hold for 4 hours, disconnected without resolution", assignedTo: null, complianceFlags: ["Service Standards"], anonymous: true, daysOpen: 9 },
  { id: "PR-2024-0840", type: "civil-rights", severity: "high", status: "triaged", office: "Westbrook Branch", program: "Housing Assistance", dateSubmitted: "2024-01-12", lastUpdated: "2024-01-14", summary: "Language access denied - no interpreter provided for LEP applicant", assignedTo: "L. Nguyen", complianceFlags: ["Title VI", "EO 13166"], anonymous: false, daysOpen: 15 },
]

const mockHotspots: HotspotData[] = [
  { office: "Downtown Benefits Center", region: "Central", totalReports: 47, criticalCount: 8, trend: "up", riskScore: 78, coordinates: { x: 45, y: 35 } },
  { office: "Eastside Regional", region: "East", totalReports: 32, criticalCount: 3, trend: "stable", riskScore: 52, coordinates: { x: 75, y: 40 } },
  { office: "Northgate Office", region: "North", totalReports: 28, criticalCount: 5, trend: "up", riskScore: 65, coordinates: { x: 50, y: 20 } },
  { office: "Southside Center", region: "South", totalReports: 41, criticalCount: 6, trend: "down", riskScore: 61, coordinates: { x: 55, y: 70 } },
  { office: "Westbrook Branch", region: "West", totalReports: 19, criticalCount: 2, trend: "stable", riskScore: 38, coordinates: { x: 20, y: 45 } },
  { office: "Call Center", region: "Virtual", totalReports: 156, criticalCount: 12, trend: "up", riskScore: 82, coordinates: { x: 85, y: 65 } },
  { office: "Online Portal", region: "Virtual", totalReports: 89, criticalCount: 4, trend: "down", riskScore: 45, coordinates: { x: 15, y: 75 } },
]

const mockAuditLog: AuditLog[] = [
  { id: "AL-001", timestamp: "2024-01-18 14:32:15", action: "STATUS_CHANGE", user: "M. Rodriguez", details: "Changed status from 'triaged' to 'investigating'", reportId: "PR-2024-0847" },
  { id: "AL-002", timestamp: "2024-01-18 13:45:00", action: "ESCALATION", user: "System", details: "Auto-escalated due to 14-day SLA breach", reportId: "PR-2024-0844" },
  { id: "AL-003", timestamp: "2024-01-18 11:20:33", action: "ASSIGNMENT", user: "K. Thompson", details: "Self-assigned from triage queue", reportId: "PR-2024-0846" },
  { id: "AL-004", timestamp: "2024-01-18 10:00:00", action: "SYNC_COMPLETE", user: "System", details: "HMIS data sync completed - 12 new records ingested" },
  { id: "AL-005", timestamp: "2024-01-17 16:55:21", action: "COMPLIANCE_FLAG", user: "L. Nguyen", details: "Added 'EO 13166' compliance flag", reportId: "PR-2024-0840" },
  { id: "AL-006", timestamp: "2024-01-17 15:30:00", action: "RESOLUTION", user: "Facilities", details: "Issue resolved - permanent signage installed", reportId: "PR-2024-0842" },
]

// Component
export default function PRICASSystem() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState("2024-01-18 14:30:00")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [triageQueue, setTriageQueue] = useState<Report[]>([])
  const [showNewReportModal, setShowNewReportModal] = useState(false)
  const [auditLogs] = useState<AuditLog[]>(mockAuditLog)
  const [complianceMetrics, setComplianceMetrics] = useState({
    titleVI: 94,
    ada: 87,
    hipaa: 99,
    serviceStandards: 76,
    duProcess: 91
  })
  const [animatingMetric, setAnimatingMetric] = useState<string | null>(null)
  const [pulseEffect, setPulseEffect] = useState(false)

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus
    const matchesSeverity = filterSeverity === "all" || r.severity === filterSeverity
    const matchesSearch = searchTerm === "" || 
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.office.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSeverity && matchesSearch
  })

  // Initialize triage queue
  useEffect(() => {
    setTriageQueue(reports.filter(r => r.status === "new"))
  }, [reports])

  // Simulated real-time pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(prev => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Simulate database sync
  const handleSync = useCallback(() => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      const now = new Date()
      setLastSync(now.toISOString().replace("T", " ").slice(0, 19))
      // Simulate metric changes
      setComplianceMetrics(prev => ({
        ...prev,
        serviceStandards: Math.min(100, prev.serviceStandards + Math.floor(Math.random() * 3))
      }))
    }, 3000)
  }, [])

  // Assign report
  const handleAssign = (reportId: string, assignee: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, assignedTo: assignee, status: "triaged" as const, lastUpdated: new Date().toISOString().slice(0, 10) }
        : r
    ))
    setAnimatingMetric(reportId)
    setTimeout(() => setAnimatingMetric(null), 1000)
  }

  // Status change
  const handleStatusChange = (reportId: string, newStatus: Report["status"]) => {
    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, status: newStatus, lastUpdated: new Date().toISOString().slice(0, 10), daysOpen: newStatus === "resolved" ? 0 : r.daysOpen }
        : r
    ))
  }

  // Module content renderer
  const renderModuleContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardView reports={reports} hotspots={mockHotspots} complianceMetrics={complianceMetrics} pulseEffect={pulseEffect} />
      case "reports":
        return (
          <ReportsView 
            reports={filteredReports}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterSeverity={filterSeverity}
            setFilterSeverity={setFilterSeverity}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            onStatusChange={handleStatusChange}
            animatingMetric={animatingMetric}
          />
        )
      case "triage":
        return (
          <TriageView 
            queue={triageQueue}
            onAssign={handleAssign}
            animatingMetric={animatingMetric}
          />
        )
      case "hotspots":
        return <HotspotsView hotspots={mockHotspots} />
      case "compliance":
        return <ComplianceView metrics={complianceMetrics} reports={reports} />
      case "audit":
        return <AuditLogView logs={auditLogs} />
      case "intake":
        return <IntakeFormView onClose={() => setActiveModule("dashboard")} />
      default:
        return null
    }
  }

  const modules = [
    { id: "dashboard", label: "Command Center", icon: "◈", description: "Real-time metrics & KPIs" },
    { id: "reports", label: "Case Registry", icon: "◉", description: "All submitted reports" },
    { id: "triage", label: "Triage Queue", icon: "⬡", description: `${triageQueue.length} awaiting review` },
    { id: "hotspots", label: "Risk Mapping", icon: "◎", description: "Geographic analysis" },
    { id: "compliance", label: "Compliance Tracker", icon: "◇", description: "Regulatory adherence" },
    { id: "audit", label: "Audit Trail", icon: "◆", description: "System activity log" },
    { id: "intake", label: "New Report", icon: "⊕", description: "Submit incident" },
  ]

  return (
    <div className="pricas-root" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d0018 0%, #1a0530 50%, #3d0066 100%)",
      fontFamily: "'Crimson Pro', 'Georgia', serif",
      color: "#e8d5b7",
      position: "relative",
      overflowX: "hidden"
    }}>
      <style>{`
        @media (max-width: 640px) {
          .pricas-root { overflow-x: hidden !important; }

          /* ── Header ── */
          .pricas-header {
            flex-wrap: wrap !important;
            padding: 0.75rem 1rem !important;
            gap: 0.5rem !important;
            height: auto !important;
            align-items: flex-start !important;
          }
          .pricas-header > div:first-child { min-width: 0; flex-shrink: 1; }
          .pricas-header-right {
            flex-wrap: wrap !important;
            width: 100% !important;
            gap: 0.5rem !important;
            justify-content: flex-start !important;
            align-items: center !important;
          }
          /* Sync button & user info: natural size, no stretch */
          .pricas-header-right > button,
          .pricas-header-right > div {
            flex-shrink: 0 !important;
            height: auto !important;
          }
          /* Last-sync text block: smaller */
          .pricas-header-right > div:nth-child(2) { font-size: 0.7rem !important; }
          /* Hide user full name block on very tight screens */
          .pricas-header-right > div:last-child { display: none !important; }

          /* ── Module selector grid: 2 columns ── */
          .pricas-module-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            max-width: 100% !important;
            gap: 0.75rem !important;
          }
          .pricas-module-grid > button { padding: 1rem !important; }

          /* ── Stats ribbon: unwrap from pill ── */
          .pricas-stats-ribbon {
            border-radius: 16px !important;
            padding: 1rem !important;
            gap: 0.75rem !important;
            flex-wrap: wrap !important;
            justify-content: space-around !important;
          }
          .pricas-stats-ribbon > div { min-width: 42% !important; }
          .pricas-stats-ribbon .font-bold,
          .pricas-stats-ribbon [style*="1.75rem"] { font-size: 1.25rem !important; }

          /* ── Dashboard view grid: single column ── */
          .pricas-dash-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          /* Metrics row: 2-column inside single-col outer */
          .pricas-metrics-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
          .pricas-metrics-row > div { padding: 0.75rem !important; }

          /* ── Reports layout: stack vertically ── */
          .pricas-reports-layout {
            flex-direction: column !important;
            gap: 1rem !important;
          }

          /* ── Reports table: horizontal scroll ── */
          .pricas-table-wrap {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch;
          }
          .pricas-table-inner,
          .pricas-table-rows { min-width: 620px !important; }

          /* ── Detail panel: full width ── */
          .pricas-detail-panel {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          /* ── General layout ── */
          .pricas-root main { padding: 1rem !important; }
          .pricas-root h1 { font-size: 1.1rem !important; }
          .pricas-root h2 { font-size: 1.3rem !important; }
          .pricas-root h3 { font-size: 0.9rem !important; word-break: break-word; overflow-wrap: break-word; }
          .pricas-root p { word-break: break-word; overflow-wrap: break-word; }
        }
      `}</style>
      {/* Animated background pattern */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 81, 169, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(232, 213, 183, 0.05) 0%, transparent 50%),
          repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(232, 213, 183, 0.02) 100px, rgba(232, 213, 183, 0.02) 101px)
        `,
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Header */}
      <header className="pricas-header" style={{
        position: "relative",
        zIndex: 10,
        padding: "1.5rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(232, 213, 183, 0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #7851a9 0%, #9b6dff 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            boxShadow: "0 4px 20px rgba(120, 81, 169, 0.4)"
          }}>
            ⟁
          </div>
          <div>
            <h1 style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              margin: 0,
              fontFamily: "'Playfair Display', 'Georgia', serif"
            }}>
              PR-ICAS
            </h1>
            <p style={{
              fontSize: "0.75rem",
              opacity: 0.7,
              margin: 0,
              letterSpacing: "0.15em",
              textTransform: "uppercase"
            }}>
              Peer-Report & Internal Complaint Auditing System
            </p>
          </div>
        </div>

        <div className="pricas-header-right" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {/* Sync indicator */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: isSyncing 
                ? "linear-gradient(90deg, rgba(120, 81, 169, 0.3), rgba(155, 109, 255, 0.3))"
                : "rgba(232, 213, 183, 0.1)",
              border: "1px solid rgba(232, 213, 183, 0.2)",
              borderRadius: "8px",
              color: "#e8d5b7",
              cursor: isSyncing ? "wait" : "pointer",
              transition: "all 0.3s ease",
              fontFamily: "inherit"
            }}
          >
            <span style={{
              display: "inline-block",
              animation: isSyncing ? "spin 1s linear infinite" : "none"
            }}>
              ⟳
            </span>
            <span style={{ fontSize: "0.8rem" }}>
              {isSyncing ? "Syncing..." : "Sync HMIS"}
            </span>
          </button>

          <div style={{ textAlign: "right", fontSize: "0.75rem", opacity: 0.7 }}>
            <div>Last sync: {lastSync}</div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              justifyContent: "flex-end"
            }}>
              <span style={{
                width: "8px",
                height: "8px",
                background: "#4ade80",
                borderRadius: "50%",
                animation: pulseEffect ? "pulse 1s ease-in-out" : "none"
              }} />
              System Operational
            </div>
          </div>

          {/* User info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.5rem 1rem",
            background: "rgba(232, 213, 183, 0.05)",
            borderRadius: "8px"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #c9a959 0%, #f4d03f 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1a1a2e",
              fontWeight: "bold",
              fontSize: "0.9rem"
            }}>
              AW
            </div>
            <div style={{ fontSize: "0.8rem" }}>
              <div style={{ fontWeight: 600 }}>A. Williams</div>
              <div style={{ opacity: 0.7, fontSize: "0.7rem" }}>Risk Manager</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main style={{
        position: "relative",
        zIndex: 5,
        padding: "2rem",
        minHeight: "calc(100vh - 100px)"
      }}>
        {activeModule === null ? (
          // Central Hub Navigation
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            gap: "2rem"
          }}>
            {/* Central orb */}
            <div style={{
              position: "relative",
              width: "180px",
              height: "180px"
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, rgba(120, 81, 169, 0.4) 0%, transparent 70%)",
                borderRadius: "50%",
                animation: "breathe 3s ease-in-out infinite"
              }} />
              <div style={{
                position: "absolute",
                inset: "20px",
                background: "linear-gradient(135deg, #7851a9 0%, #4a2c6a 100%)",
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(232, 213, 183, 0.3)",
                boxShadow: "0 0 60px rgba(120, 81, 169, 0.5), inset 0 0 30px rgba(0,0,0,0.3)"
              }}>
                <span style={{ fontSize: "2rem" }}>⟁</span>
                <span style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: "0.25rem" }}>SELECT MODULE</span>
              </div>

              {/* Critical alerts badge */}
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                color: "white",
                padding: "0.25rem 0.6rem",
                borderRadius: "12px",
                fontSize: "0.7rem",
                fontWeight: "bold",
                boxShadow: "0 2px 10px rgba(220, 38, 38, 0.5)",
                animation: "pulse 2s ease-in-out infinite"
              }}>
                {reports.filter(r => r.severity === "critical" && r.status !== "resolved").length} CRITICAL
              </div>
            </div>

            {/* Module selector - circular arrangement */}
            <div className="pricas-module-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              maxWidth: "900px"
            }}>
              {modules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  style={{
                    padding: "1.5rem",
                    background: "rgba(26, 0, 48, 0.8)",
                    border: "1px solid rgba(232, 213, 183, 0.15)",
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    textAlign: "center",
                    color: "#e8d5b7",
                    fontFamily: "inherit",
                    position: "relative",
                    overflow: "hidden",
                    transform: `translateY(${Math.sin(index * 0.5) * 5}px)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px) scale(1.02)"
                    e.currentTarget.style.borderColor = "rgba(120, 81, 169, 0.6)"
                    e.currentTarget.style.boxShadow = "0 10px 40px rgba(120, 81, 169, 0.3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `translateY(${Math.sin(index * 0.5) * 5}px)`
                    e.currentTarget.style.borderColor = "rgba(232, 213, 183, 0.15)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, rgba(120, 81, 169, 0.1) 0%, transparent 50%)",
                    opacity: 0,
                    transition: "opacity 0.3s"
                  }} />
                  <div style={{
                    fontSize: "2rem",
                    marginBottom: "0.75rem",
                    opacity: 0.9
                  }}>
                    {module.icon}
                  </div>
                  <div style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    {module.label}
                  </div>
                  <div style={{
                    fontSize: "0.7rem",
                    opacity: 0.6
                  }}>
                    {module.description}
                  </div>
                  {module.id === "triage" && triageQueue.length > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#f59e0b",
                      color: "#1a1a2e",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {triageQueue.length}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Quick stats ribbon */}
            <div className="pricas-stats-ribbon" style={{
              display: "flex",
              gap: "2rem",
              padding: "1.5rem 3rem",
              background: "rgba(26, 0, 48, 0.6)",
              borderRadius: "100px",
              border: "1px solid rgba(232, 213, 183, 0.1)",
              marginTop: "1rem"
            }}>
              {[
                { label: "Open Cases", value: reports.filter(r => r.status !== "resolved").length, color: "#e8d5b7" },
                { label: "Critical", value: reports.filter(r => r.severity === "critical" && r.status !== "resolved").length, color: "#ef4444" },
                { label: "Avg Resolution", value: "4.2 days", color: "#4ade80" },
                { label: "Compliance Score", value: "89%", color: "#7851a9" }
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ 
                    fontSize: "1.75rem", 
                    fontWeight: "bold",
                    color: stat.color,
                    fontFamily: "'Space Mono', monospace"
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Module content
          <div>
            {/* Breadcrumb / back navigation */}
            <button
              onClick={() => {
                setActiveModule(null)
                setSelectedReport(null)
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "transparent",
                border: "1px solid rgba(232, 213, 183, 0.2)",
                borderRadius: "8px",
                color: "#e8d5b7",
                cursor: "pointer",
                marginBottom: "1.5rem",
                fontFamily: "inherit",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232, 213, 183, 0.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              ← Return to Hub
            </button>

            {/* Module title */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem"
            }}>
              <span style={{ fontSize: "2rem" }}>
                {modules.find(m => m.id === activeModule)?.icon}
              </span>
              <div>
                <h2 style={{
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  margin: 0,
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {modules.find(m => m.id === activeModule)?.label}
                </h2>
                <p style={{ margin: 0, opacity: 0.6, fontSize: "0.85rem" }}>
                  {modules.find(m => m.id === activeModule)?.description}
                </p>
              </div>
            </div>

            {renderModuleContent()}
          </div>
        )}
      </main>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 81, 169, 0.5) rgba(26, 0, 48, 0.5);
        }
        
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(26, 0, 48, 0.5);
        }
        
        *::-webkit-scrollbar-thumb {
          background: rgba(120, 81, 169, 0.5);
          border-radius: 4px;
        }
      `}</style>

      {/* ── PROJECT FOOTER ──────────────────────────────────────────── */}
      <div style={{
        marginTop: '3rem', padding: '1.5rem 2rem',
        background: '#f9f9f7', borderTop: '1px solid #e0ddd6',
        fontFamily: "'Trebuchet MS', 'Gill Sans', sans-serif",
        fontSize: '0.78rem', color: '#444', lineHeight: 1.9,
      }}>
        <p style={{ margin: 0 }}>
          <strong>Lancelot Napier-Kane</strong> —{' '}
          <strong>Stack:</strong> React, TypeScript, PostgreSQL (simulated via in-component state), Redis pub/sub (simulated event sync), Node.js REST API (simulated), Azure Active Directory (simulated RBAC), Power Automate (simulated workflow routing) —{' '}
          <strong>Methods:</strong> Designed a multi-module compliance intake system modeled on internal agency reporting workflows; simulated real-time triage queue processing, geographic hotspot analysis, and compliance scoring across Title VI, ADA, HIPAA, and due process standards; implemented audit log generation and escalation routing logic consistent with federal records management practices —{' '}
          <strong>Sources:</strong> NYC HRA internal compliance reporting frameworks; EEOC complaint classification standards; federal agency incident management guidelines; Title VI enforcement documentation; ADA self-evaluation requirements
        </p>
      </div>
    </div>
  )
}

// Dashboard View Component
function DashboardView({ reports, hotspots, complianceMetrics, pulseEffect }: {
  reports: Report[]
  hotspots: HotspotData[]
  complianceMetrics: Record<string, number>
  pulseEffect: boolean
}) {
  const statusCounts = {
    new: reports.filter(r => r.status === "new").length,
    triaged: reports.filter(r => r.status === "triaged").length,
    investigating: reports.filter(r => r.status === "investigating").length,
    escalated: reports.filter(r => r.status === "escalated").length,
    resolved: reports.filter(r => r.status === "resolved").length
  }

  const severityCounts = {
    critical: reports.filter(r => r.severity === "critical" && r.status !== "resolved").length,
    high: reports.filter(r => r.severity === "high" && r.status !== "resolved").length,
    medium: reports.filter(r => r.severity === "medium" && r.status !== "resolved").length,
    low: reports.filter(r => r.severity === "low" && r.status !== "resolved").length
  }

  const typeCounts = {
    "civil-rights": reports.filter(r => r.type === "civil-rights").length,
    "employee-negligence": reports.filter(r => r.type === "employee-negligence").length,
    "ui-bug": reports.filter(r => r.type === "ui-bug").length,
    "financial": reports.filter(r => r.type === "financial").length,
    "safety": reports.filter(r => r.type === "safety").length,
    "accessibility": reports.filter(r => r.type === "accessibility").length
  }

  return (
    <div className="pricas-dash-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1.5rem",
      animation: "slideIn 0.5s ease-out"
    }}>
      {/* Key Metrics Row */}
      <div className="pricas-metrics-row" style={{
        gridColumn: "1 / -1",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "1rem"
      }}>
        {[
          { label: "Total Open", value: reports.filter(r => r.status !== "resolved").length, icon: "◉", color: "#e8d5b7" },
          { label: "Critical Active", value: severityCounts.critical, icon: "⚠", color: "#ef4444" },
          { label: "Awaiting Triage", value: statusCounts.new, icon: "⬡", color: "#f59e0b" },
          { label: "Under Investigation", value: statusCounts.investigating, icon: "⟐", color: "#7851a9" },
          { label: "Escalated", value: statusCounts.escalated, icon: "↑", color: "#dc2626" }
        ].map(metric => (
          <div key={metric.label} style={{
            padding: "1.25rem",
            background: "rgba(26, 0, 48, 0.8)",
            borderRadius: "12px",
            border: "1px solid rgba(232, 213, 183, 0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem", opacity: 0.7 }}>{metric.icon}</div>
            <div style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: metric.color,
              fontFamily: "'Space Mono', monospace"
            }}>
              {metric.value}
            </div>
            <div style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Status Pipeline */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "1rem",
          fontFamily: "'Playfair Display', serif",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span style={{ opacity: 0.7 }}>◈</span> Case Pipeline
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: {
                  new: "#f59e0b",
                  triaged: "#7851a9",
                  investigating: "#a21090",
                  escalated: "#ef4444",
                  resolved: "#4ade80"
                }[status]
              }} />
              <span style={{ flex: 1, fontSize: "0.85rem", textTransform: "capitalize" }}>{status}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: "bold" }}>{count}</span>
              <div style={{
                width: "100px",
                height: "6px",
                background: "rgba(232, 213, 183, 0.1)",
                borderRadius: "3px",
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${(count / reports.length) * 100}%`,
                  background: {
                    new: "#f59e0b",
                    triaged: "#7851a9",
                    investigating: "#a21090",
                    escalated: "#ef4444",
                    resolved: "#4ade80"
                  }[status],
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Severity Breakdown */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "1rem",
          fontFamily: "'Playfair Display', serif",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span style={{ opacity: 0.7 }}>◎</span> Severity Distribution
        </h3>
        <div style={{ display: "flex", gap: "0.5rem", height: "120px", alignItems: "flex-end" }}>
          {Object.entries(severityCounts).map(([severity, count]) => (
            <div key={severity} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: `${Math.max((count / Math.max(...Object.values(severityCounts))) * 100, 10)}px`,
                background: {
                  critical: "linear-gradient(to top, #991b1b, #ef4444)",
                  high: "linear-gradient(to top, #b45309, #f59e0b)",
                  medium: "linear-gradient(to top, #4338ca, #7851a9)",
                  low: "linear-gradient(to top, #166534, #4ade80)"
                }[severity],
                borderRadius: "4px 4px 0 0",
                transition: "height 0.5s ease",
                position: "relative"
              }}>
                <span style={{
                  position: "absolute",
                  top: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  fontFamily: "'Space Mono', monospace"
                }}>
                  {count}
                </span>
              </div>
              <div style={{ 
                fontSize: "0.65rem", 
                marginTop: "0.5rem", 
                textTransform: "uppercase",
                opacity: 0.7 
              }}>
                {severity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Type Breakdown */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "1rem",
          fontFamily: "'Playfair Display', serif",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span style={{ opacity: 0.7 }}>◇</span> Report Categories
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              fontSize: "0.8rem"
            }}>
              <span style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%",
                background: {
                  "civil-rights": "#ef4444",
                  "employee-negligence": "#f59e0b",
                  "ui-bug": "#a21090",
                  "financial": "#10b981",
                  "safety": "#dc2626",
                  "accessibility": "#8b5cf6"
                }[type]
              }} />
              <span style={{ flex: 1, textTransform: "capitalize" }}>
                {type.replace("-", " ")}
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: "bold" }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Quick View */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "1rem",
          fontFamily: "'Playfair Display', serif",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span style={{ opacity: 0.7 }}>⬡</span> Compliance Scores
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { label: "Title VI", value: complianceMetrics.titleVI },
            { label: "ADA", value: complianceMetrics.ada },
            { label: "HIPAA", value: complianceMetrics.hipaa },
            { label: "Service Standards", value: complianceMetrics.serviceStandards },
            { label: "Due Process", value: complianceMetrics.duProcess }
          ].map(metric => (
            <div key={metric.label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                <span>{metric.label}</span>
                <span style={{ 
                  fontWeight: "bold",
                  color: metric.value >= 90 ? "#4ade80" : metric.value >= 75 ? "#f59e0b" : "#ef4444"
                }}>
                  {metric.value}%
                </span>
              </div>
              <div style={{
                height: "4px",
                background: "rgba(232, 213, 183, 0.1)",
                borderRadius: "2px",
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${metric.value}%`,
                  background: metric.value >= 90 ? "#4ade80" : metric.value >= 75 ? "#f59e0b" : "#ef4444",
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Hotspots */}
      <div style={{
        padding: "1.5rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "1rem",
          fontFamily: "'Playfair Display', serif",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span style={{ opacity: 0.7 }}>⚡</span> Risk Hotspots
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {hotspots.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map(spot => (
            <div key={spot.office} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.5rem",
              background: spot.riskScore >= 70 ? "rgba(239, 68, 68, 0.1)" : "transparent",
              borderRadius: "6px",
              fontSize: "0.8rem"
            }}>
              <span style={{
                color: spot.trend === "up" ? "#ef4444" : spot.trend === "down" ? "#4ade80" : "#e8d5b7"
              }}>
                {spot.trend === "up" ? "↑" : spot.trend === "down" ? "↓" : "→"}
              </span>
              <span style={{ flex: 1 }}>{spot.office}</span>
              <span style={{
                padding: "0.125rem 0.5rem",
                background: spot.riskScore >= 70 ? "#ef4444" : spot.riskScore >= 50 ? "#f59e0b" : "#4ade80",
                color: "#1a1a2e",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: "bold"
              }}>
                {spot.riskScore}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        gridColumn: "1 / -1",
        padding: "1.5rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "1rem",
          fontFamily: "'Playfair Display', serif",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span style={{ opacity: 0.7 }}>◆</span> Recent Critical Reports
        </h3>
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {reports.filter(r => r.severity === "critical" || r.severity === "high").slice(0, 4).map(report => (
            <div key={report.id} style={{
              minWidth: "280px",
              padding: "1rem",
              background: "rgba(232, 213, 183, 0.05)",
              borderRadius: "12px",
              borderLeft: `3px solid ${report.severity === "critical" ? "#ef4444" : "#f59e0b"}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem" }}>{report.id}</span>
                <span style={{
                  padding: "0.125rem 0.5rem",
                  background: report.severity === "critical" ? "#ef4444" : "#f59e0b",
                  color: "#1a1a2e",
                  borderRadius: "4px",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  textTransform: "uppercase"
                }}>
                  {report.severity}
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", margin: "0 0 0.5rem 0", lineHeight: 1.4 }}>
                {report.summary.slice(0, 80)}...
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", opacity: 0.6 }}>
                <span>{report.office}</span>
                <span>{report.daysOpen} days open</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Reports View Component
function ReportsView({ 
  reports, 
  filterStatus, 
  setFilterStatus, 
  filterSeverity, 
  setFilterSeverity,
  searchTerm,
  setSearchTerm,
  selectedReport,
  setSelectedReport,
  onStatusChange,
  animatingMetric
}: {
  reports: Report[]
  filterStatus: string
  setFilterStatus: (s: string) => void
  filterSeverity: string
  setFilterSeverity: (s: string) => void
  searchTerm: string
  setSearchTerm: (s: string) => void
  selectedReport: Report | null
  setSelectedReport: (r: Report | null) => void
  onStatusChange: (id: string, status: Report["status"]) => void
  animatingMetric: string | null
}) {
  return (
    <div className="pricas-reports-layout" style={{ display: "flex", gap: "1.5rem", animation: "slideIn 0.5s ease-out" }}>
      {/* Reports List */}
      <div style={{ flex: 1 }}>
        {/* Filters */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap"
        }}>
          <input
            type="text"
            placeholder="Search by ID, summary, or office..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "250px",
              padding: "0.75rem 1rem",
              background: "rgba(26, 0, 48, 0.8)",
              border: "1px solid rgba(232, 213, 183, 0.2)",
              borderRadius: "8px",
              color: "#e8d5b7",
              fontSize: "0.9rem",
              fontFamily: "inherit"
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(26, 0, 48, 0.8)",
              border: "1px solid rgba(232, 213, 183, 0.2)",
              borderRadius: "8px",
              color: "#e8d5b7",
              fontSize: "0.9rem",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="triaged">Triaged</option>
            <option value="investigating">Investigating</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(26, 0, 48, 0.8)",
              border: "1px solid rgba(232, 213, 183, 0.2)",
              borderRadius: "8px",
              color: "#e8d5b7",
              fontSize: "0.9rem",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Results count */}
        <div style={{ 
          fontSize: "0.8rem", 
          opacity: 0.6, 
          marginBottom: "1rem",
          fontFamily: "'Space Mono', monospace"
        }}>
          Showing {reports.length} reports
        </div>

        {/* Reports table */}
        <div className="pricas-table-wrap" style={{
          background: "rgba(26, 0, 48, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(232, 213, 183, 0.1)",
          overflow: "hidden"
        }}>
          <div className="pricas-table-inner" style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 120px 100px 100px 80px",
            padding: "1rem",
            background: "rgba(232, 213, 183, 0.05)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "1px solid rgba(232, 213, 183, 0.1)"
          }}>
            <span>Case ID</span>
            <span>Summary</span>
            <span>Office</span>
            <span>Severity</span>
            <span>Status</span>
            <span>Days</span>
          </div>
          <div className="pricas-table-rows" style={{ maxHeight: "500px", overflowY: "auto" }}>
            {reports.map(report => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 120px 100px 100px 80px",
                  padding: "1rem",
                  borderBottom: "1px solid rgba(232, 213, 183, 0.05)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: selectedReport?.id === report.id 
                    ? "rgba(120, 81, 169, 0.2)" 
                    : animatingMetric === report.id 
                      ? "rgba(74, 222, 128, 0.2)" 
                      : "transparent"
                }}
                onMouseEnter={(e) => {
                  if (selectedReport?.id !== report.id) {
                    e.currentTarget.style.background = "rgba(232, 213, 183, 0.05)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedReport?.id !== report.id) {
                    e.currentTarget.style.background = "transparent"
                  }
                }}
              >
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem" }}>
                  {report.id}
                </span>
                <span style={{ fontSize: "0.85rem", paddingRight: "1rem" }}>
                  {report.summary.slice(0, 60)}...
                </span>
                <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {report.office.slice(0, 15)}...
                </span>
                <span>
                  <span style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: {
                      critical: "#ef4444",
                      high: "#f59e0b",
                      medium: "#7851a9",
                      low: "#4ade80"
                    }[report.severity],
                    color: "#1a1a2e"
                  }}>
                    {report.severity}
                  </span>
                </span>
                <span>
                  <span style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    textTransform: "capitalize",
                    border: "1px solid",
                    borderColor: {
                      new: "#f59e0b",
                      triaged: "#7851a9",
                      investigating: "#3b82f6",
                      escalated: "#ef4444",
                      resolved: "#4ade80"
                    }[report.status],
                    color: {
                      new: "#f59e0b",
                      triaged: "#7851a9",
                      investigating: "#3b82f6",
                      escalated: "#ef4444",
                      resolved: "#4ade80"
                    }[report.status]
                  }}>
                    {report.status}
                  </span>
                </span>
                <span style={{ 
                  fontFamily: "'Space Mono', monospace",
                  color: report.daysOpen > 14 ? "#ef4444" : report.daysOpen > 7 ? "#f59e0b" : "#e8d5b7"
                }}>
                  {report.daysOpen}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Detail Panel */}
      {selectedReport && (
        <div className="pricas-detail-panel" style={{
          width: "400px",
          background: "rgba(26, 0, 48, 0.9)",
          borderRadius: "16px",
          border: "1px solid rgba(232, 213, 183, 0.15)",
          padding: "1.5rem",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontFamily: "'Space Mono', monospace",
                fontSize: "1.1rem"
              }}>
                {selectedReport.id}
              </h3>
              {selectedReport.anonymous && (
                <span style={{ 
                  fontSize: "0.7rem", 
                  background: "rgba(232, 213, 183, 0.2)", 
                  padding: "0.125rem 0.5rem",
                  borderRadius: "4px"
                }}>
                  Anonymous Report
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#e8d5b7",
                fontSize: "1.2rem",
                cursor: "pointer",
                opacity: 0.6
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <span style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "4px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background: {
                critical: "#ef4444",
                high: "#f59e0b",
                medium: "#7851a9",
                low: "#4ade80"
              }[selectedReport.severity],
              color: "#1a1a2e"
            }}>
              {selectedReport.severity.toUpperCase()}
            </span>
            <span style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "4px",
              fontSize: "0.75rem",
              background: "rgba(232, 213, 183, 0.1)",
              textTransform: "capitalize"
            }}>
              {selectedReport.type.replace("-", " ")}
            </span>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Summary
            </label>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", lineHeight: 1.5 }}>
              {selectedReport.summary}
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "1rem",
            marginBottom: "1.5rem"
          }}>
            <div>
              <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Office
              </label>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>{selectedReport.office}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Program
              </label>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>{selectedReport.program}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Submitted
              </label>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>{selectedReport.dateSubmitted}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Last Updated
              </label>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>{selectedReport.lastUpdated}</p>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Assigned To
              </label>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                {selectedReport.assignedTo || "Unassigned"}
              </p>
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Days Open
              </label>
              <p style={{ 
                margin: "0.25rem 0 0 0", 
                fontSize: "0.85rem",
                color: selectedReport.daysOpen > 14 ? "#ef4444" : selectedReport.daysOpen > 7 ? "#f59e0b" : "#e8d5b7"
              }}>
                {selectedReport.daysOpen} days
              </p>
            </div>
          </div>

          {/* Compliance Flags */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Compliance Flags
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {selectedReport.complianceFlags.map(flag => (
                <span key={flag} style={{
                  padding: "0.25rem 0.75rem",
                  background: "rgba(120, 81, 169, 0.3)",
                  border: "1px solid rgba(120, 81, 169, 0.5)",
                  borderRadius: "4px",
                  fontSize: "0.75rem"
                }}>
                  {flag}
                </span>
              ))}
            </div>
          </div>

          {/* Status Actions */}
          <div>
            <label style={{ 
              fontSize: "0.7rem", 
              opacity: 0.6, 
              textTransform: "uppercase", 
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "0.5rem"
            }}>
              Update Status
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(["triaged", "investigating", "escalated", "resolved"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => onStatusChange(selectedReport.id, status)}
                  disabled={selectedReport.status === status}
                  style={{
                    padding: "0.5rem 1rem",
                    background: selectedReport.status === status 
                      ? "rgba(120, 81, 169, 0.5)" 
                      : "rgba(232, 213, 183, 0.1)",
                    border: "1px solid rgba(232, 213, 183, 0.2)",
                    borderRadius: "6px",
                    color: "#e8d5b7",
                    fontSize: "0.8rem",
                    cursor: selectedReport.status === status ? "default" : "pointer",
                    fontFamily: "inherit",
                    textTransform: "capitalize",
                    transition: "all 0.2s"
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Triage View Component
function TriageView({ queue, onAssign, animatingMetric }: {
  queue: Report[]
  onAssign: (id: string, assignee: string) => void
  animatingMetric: string | null
}) {
  const [selectedForAssign, setSelectedForAssign] = useState<string | null>(null)
  
  const investigators = [
    "M. Rodriguez",
    "K. Thompson",
    "L. Nguyen",
    "S. Chen",
    "J. Martinez",
    "Director Williams"
  ]

  return (
    <div style={{ animation: "slideIn 0.5s ease-out" }}>
      {queue.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem",
          background: "rgba(26, 0, 48, 0.8)",
          borderRadius: "16px",
          border: "1px solid rgba(232, 213, 183, 0.1)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>⬡</div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontFamily: "'Playfair Display', serif" }}>
            Triage Queue Empty
          </h3>
          <p style={{ margin: 0, opacity: 0.6, fontSize: "0.9rem" }}>
            All incoming reports have been processed.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "1.5rem"
        }}>
          {queue.map((report, index) => (
            <div
              key={report.id}
              style={{
                background: animatingMetric === report.id 
                  ? "rgba(74, 222, 128, 0.2)" 
                  : "rgba(26, 0, 48, 0.8)",
                borderRadius: "16px",
                border: "1px solid rgba(232, 213, 183, 0.1)",
                overflow: "hidden",
                transition: "all 0.3s ease",
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Priority Banner */}
              <div style={{
                padding: "0.5rem 1rem",
                background: {
                  critical: "linear-gradient(90deg, #991b1b, #dc2626)",
                  high: "linear-gradient(90deg, #b45309, #f59e0b)",
                  medium: "linear-gradient(90deg, #4338ca, #7851a9)",
                  low: "linear-gradient(90deg, #166534, #22c55e)"
                }[report.severity],
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  {report.severity} Priority
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem" }}>
                  {report.id}
                </span>
              </div>

              <div style={{ padding: "1.25rem" }}>
                {/* Type badge */}
                <div style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  background: "rgba(232, 213, 183, 0.1)",
                  borderRadius: "100px",
                  fontSize: "0.75rem",
                  marginBottom: "0.75rem",
                  textTransform: "capitalize"
                }}>
                  {report.type.replace("-", " ")}
                </div>

                {/* Summary */}
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  {report.summary}
                </p>

                {/* Meta info */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  fontSize: "0.8rem"
                }}>
                  <div>
                    <span style={{ opacity: 0.6 }}>Office: </span>
                    {report.office}
                  </div>
                  <div>
                    <span style={{ opacity: 0.6 }}>Program: </span>
                    {report.program}
                  </div>
                  <div>
                    <span style={{ opacity: 0.6 }}>Submitted: </span>
                    {report.dateSubmitted}
                  </div>
                  <div>
                    <span style={{ opacity: 0.6 }}>Days waiting: </span>
                    <span style={{ color: report.daysOpen > 3 ? "#f59e0b" : "#e8d5b7" }}>
                      {report.daysOpen}
                    </span>
                  </div>
                </div>

                {/* Compliance Flags */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {report.complianceFlags.map(flag => (
                      <span key={flag} style={{
                        padding: "0.125rem 0.5rem",
                        background: "rgba(120, 81, 169, 0.3)",
                        borderRadius: "4px",
                        fontSize: "0.7rem"
                      }}>
                        {flag}
                      </span>
                    ))}
                    {report.anonymous && (
                      <span style={{
                        padding: "0.125rem 0.5rem",
                        background: "rgba(232, 213, 183, 0.2)",
                        borderRadius: "4px",
                        fontSize: "0.7rem"
                      }}>
                        Anonymous
                      </span>
                    )}
                  </div>
                </div>

                {/* Assignment */}
                {selectedForAssign === report.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>Assign to investigator:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {investigators.map(inv => (
                        <button
                          key={inv}
                          onClick={() => {
                            onAssign(report.id, inv)
                            setSelectedForAssign(null)
                          }}
                          style={{
                            padding: "0.5rem 0.75rem",
                            background: "rgba(120, 81, 169, 0.3)",
                            border: "1px solid rgba(120, 81, 169, 0.5)",
                            borderRadius: "6px",
                            color: "#e8d5b7",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(120, 81, 169, 0.5)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(120, 81, 169, 0.3)"
                          }}
                        >
                          {inv}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedForAssign(null)}
                      style={{
                        padding: "0.5rem",
                        background: "transparent",
                        border: "1px solid rgba(232, 213, 183, 0.2)",
                        borderRadius: "6px",
                        color: "#e8d5b7",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        marginTop: "0.25rem"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedForAssign(report.id)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "linear-gradient(135deg, #7851a9 0%, #5a3d82 100%)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#e8d5b7",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(120, 81, 169, 0.4)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  >
                    Assign & Triage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Hotspots View Component
function HotspotsView({ hotspots }: { hotspots: HotspotData[] }) {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null)
  const [mapView, setMapView] = useState<"risk" | "volume">("risk")

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "1fr 350px", 
      gap: "1.5rem",
      animation: "slideIn 0.5s ease-out"
    }}>
      {/* Map visualization */}
      <div style={{
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)",
        padding: "1.5rem",
        position: "relative",
        minHeight: "500px"
      }}>
        {/* Map controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem"
        }}>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
            Geographic Risk Analysis
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setMapView("risk")}
              style={{
                padding: "0.5rem 1rem",
                background: mapView === "risk" ? "rgba(120, 81, 169, 0.5)" : "rgba(232, 213, 183, 0.1)",
                border: "1px solid rgba(232, 213, 183, 0.2)",
                borderRadius: "6px",
                color: "#e8d5b7",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              Risk Score
            </button>
            <button
              onClick={() => setMapView("volume")}
              style={{
                padding: "0.5rem 1rem",
                background: mapView === "volume" ? "rgba(120, 81, 169, 0.5)" : "rgba(232, 213, 183, 0.1)",
                border: "1px solid rgba(232, 213, 183, 0.2)",
                borderRadius: "6px",
                color: "#e8d5b7",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              Volume
            </button>
          </div>
        </div>

        {/* Simulated map */}
        <div style={{
          position: "relative",
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden"
        }}>
          {/* Tacoma, WA satellite base layer */}
          <img
            src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=-122.52,47.20,-122.40,47.32&bboxSR=4326&size=800,400&imageSR=4326&format=png&f=image"
            alt="Tacoma WA satellite"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.72) saturate(0.8)" }}
          />
          {/* Semi-transparent overlay to blend with theme */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(22, 20, 48, 0.35)", pointerEvents: "none" }} />
          {/* Map label */}
          <div style={{ position: "absolute", bottom: 8, left: 10, fontSize: "0.65rem", color: "rgba(232,213,183,0.55)", fontFamily: "monospace", pointerEvents: "none" }}>
            Tacoma, WA · ESRI World Imagery
          </div>
          {hotspots.map(spot => {
            const size = mapView === "risk" 
              ? 20 + (spot.riskScore / 100) * 40
              : 20 + (spot.totalReports / 200) * 60
            const color = spot.riskScore >= 70 
              ? "rgba(239, 68, 68, 0.8)" 
              : spot.riskScore >= 50 
                ? "rgba(245, 158, 11, 0.8)" 
                : "rgba(74, 222, 128, 0.8)"

            return (
              <div
                key={spot.office}
                onClick={() => setSelectedHotspot(spot)}
                style={{
                  position: "absolute",
                  left: `${spot.coordinates.x}%`,
                  top: `${spot.coordinates.y}%`,
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                  zIndex: selectedHotspot?.office === spot.office ? 10 : 1
                }}
              >
                {/* Pulse effect */}
                <div style={{
                  position: "absolute",
                  width: size * 1.5,
                  height: size * 1.5,
                  borderRadius: "50%",
                  background: color,
                  opacity: 0.3,
                  animation: spot.trend === "up" ? "ripple 2s ease-out infinite" : "none",
                  transform: "translate(-50%, -50%)",
                  left: "50%",
                  top: "50%"
                }} />
                {/* Main marker */}
                <div style={{
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: color,
                  border: selectedHotspot?.office === spot.office 
                    ? "3px solid #e8d5b7" 
                    : "2px solid rgba(232, 213, 183, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  color: "#1a1a2e",
                  boxShadow: `0 0 20px ${color}`,
                  transition: "all 0.3s ease"
                }}>
                  {mapView === "risk" ? spot.riskScore : spot.totalReports}
                </div>
                {/* Label */}
                {selectedHotspot?.office === spot.office && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "0.5rem",
                    padding: "0.25rem 0.75rem",
                    background: "rgba(26, 0, 48, 0.95)",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                    border: "1px solid rgba(232, 213, 183, 0.2)"
                  }}>
                    {spot.office}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginTop: "1rem",
          fontSize: "0.75rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444" }} />
            High Risk (70+)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b" }} />
            Medium Risk (50-69)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#4ade80" }} />
            Low Risk (&lt;50)
          </div>
        </div>
      </div>

      {/* Hotspot Details Panel */}
      <div style={{
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)",
        padding: "1.5rem"
      }}>
        <h3 style={{ 
          margin: "0 0 1rem 0", 
          fontFamily: "'Playfair Display', serif",
          fontSize: "1rem"
        }}>
          Location Analysis
        </h3>

        {selectedHotspot ? (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div style={{
              padding: "1rem",
              background: "rgba(232, 213, 183, 0.05)",
              borderRadius: "12px",
              marginBottom: "1rem"
            }}>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>
                {selectedHotspot.office}
              </h4>
              <span style={{
                padding: "0.25rem 0.5rem",
                background: "rgba(120, 81, 169, 0.3)",
                borderRadius: "4px",
                fontSize: "0.75rem"
              }}>
                {selectedHotspot.region} Region
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Risk Score */}
              <div>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  marginBottom: "0.5rem",
                  fontSize: "0.8rem"
                }}>
                  <span>Risk Score</span>
                  <span style={{
                    fontWeight: "bold",
                    color: selectedHotspot.riskScore >= 70 ? "#ef4444" : selectedHotspot.riskScore >= 50 ? "#f59e0b" : "#4ade80"
                  }}>
                    {selectedHotspot.riskScore}/100
                  </span>
                </div>
                <div style={{
                  height: "8px",
                  background: "rgba(232, 213, 183, 0.1)",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${selectedHotspot.riskScore}%`,
                    background: selectedHotspot.riskScore >= 70 
                      ? "linear-gradient(90deg, #dc2626, #ef4444)" 
                      : selectedHotspot.riskScore >= 50 
                        ? "linear-gradient(90deg, #d97706, #f59e0b)"
                        : "linear-gradient(90deg, #16a34a, #4ade80)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease"
                  }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "0.75rem" 
              }}>
                <div style={{
                  padding: "0.75rem",
                  background: "rgba(232, 213, 183, 0.05)",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "bold",
                    fontFamily: "'Space Mono', monospace"
                  }}>
                    {selectedHotspot.totalReports}
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>Total Reports</div>
                </div>
                <div style={{
                  padding: "0.75rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ 
                    fontSize: "1.5rem", 
                    fontWeight: "bold",
                    fontFamily: "'Space Mono', monospace",
                    color: "#ef4444"
                  }}>
                    {selectedHotspot.criticalCount}
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>Critical Cases</div>
                </div>
              </div>

              {/* Trend */}
              <div style={{
                padding: "0.75rem",
                background: selectedHotspot.trend === "up" 
                  ? "rgba(239, 68, 68, 0.1)" 
                  : selectedHotspot.trend === "down"
                    ? "rgba(74, 222, 128, 0.1)"
                    : "rgba(232, 213, 183, 0.05)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <span style={{
                  fontSize: "1.5rem",
                  color: selectedHotspot.trend === "up" 
                    ? "#ef4444" 
                    : selectedHotspot.trend === "down"
                      ? "#4ade80"
                      : "#e8d5b7"
                }}>
                  {selectedHotspot.trend === "up" ? "↑" : selectedHotspot.trend === "down" ? "↓" : "→"}
                </span>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, textTransform: "capitalize" }}>
                    {selectedHotspot.trend === "up" ? "Increasing" : selectedHotspot.trend === "down" ? "Decreasing" : "Stable"} Trend
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                    vs. previous 30 days
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: "0.5rem" }}>
                  RECOMMENDED ACTIONS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedHotspot.riskScore >= 70 && (
                    <div style={{
                      padding: "0.5rem 0.75rem",
                      background: "rgba(239, 68, 68, 0.1)",
                      borderLeft: "3px solid #ef4444",
                      fontSize: "0.8rem"
                    }}>
                      Schedule immediate site review
                    </div>
                  )}
                  {selectedHotspot.criticalCount >= 5 && (
                    <div style={{
                      padding: "0.5rem 0.75rem",
                      background: "rgba(245, 158, 11, 0.1)",
                      borderLeft: "3px solid #f59e0b",
                      fontSize: "0.8rem"
                    }}>
                      Escalate to regional director
                    </div>
                  )}
                  {selectedHotspot.trend === "up" && (
                    <div style={{
                      padding: "0.5rem 0.75rem",
                      background: "rgba(120, 81, 169, 0.1)",
                      borderLeft: "3px solid #7851a9",
                      fontSize: "0.8rem"
                    }}>
                      Conduct staff training session
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "3rem 1rem",
            opacity: 0.6
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>◎</div>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>
              Select a location on the map to view detailed analysis
            </p>
          </div>
        )}

        {/* All Locations List */}
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ 
            fontSize: "0.75rem", 
            opacity: 0.6, 
            marginBottom: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            All Locations by Risk
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {hotspots.sort((a, b) => b.riskScore - a.riskScore).map(spot => (
              <div
                key={spot.office}
                onClick={() => setSelectedHotspot(spot)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 0.75rem",
                  background: selectedHotspot?.office === spot.office 
                    ? "rgba(120, 81, 169, 0.2)" 
                    : "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (selectedHotspot?.office !== spot.office) {
                    e.currentTarget.style.background = "rgba(232, 213, 183, 0.05)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedHotspot?.office !== spot.office) {
                    e.currentTarget.style.background = "transparent"
                  }
                }}
              >
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: spot.riskScore >= 70 ? "#ef4444" : spot.riskScore >= 50 ? "#f59e0b" : "#4ade80"
                }} />
                <span style={{ flex: 1 }}>{spot.office}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: "bold" }}>
                  {spot.riskScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Compliance View Component
function ComplianceView({ metrics, reports }: { metrics: Record<string, number>, reports: Report[] }) {
  const complianceAreas = [
    {
      id: "titleVI",
      name: "Title VI (Civil Rights Act)",
      score: metrics.titleVI,
      description: "Non-discrimination in federally assisted programs",
      relatedReports: reports.filter(r => r.complianceFlags.includes("Title VI")).length,
      requirements: [
        "Language access for LEP individuals",
        "Non-discriminatory service delivery",
        "Complaint tracking and resolution",
        "Staff civil rights training"
      ]
    },
    {
      id: "ada",
      name: "ADA Compliance",
      score: metrics.ada,
      description: "Americans with Disabilities Act requirements",
      relatedReports: reports.filter(r => r.complianceFlags.includes("ADA")).length,
      requirements: [
        "Physical accessibility of facilities",
        "Accessible digital services (WCAG 2.1)",
        "Reasonable accommodations",
        "Effective communication"
      ]
    },
    {
      id: "hipaa",
      name: "HIPAA Privacy",
      score: metrics.hipaa,
      description: "Health information privacy and security",
      relatedReports: reports.filter(r => r.program === "Medicaid" || r.program === "WIC").length,
      requirements: [
        "PHI safeguarding",
        "Breach notification compliance",
        "Business associate agreements",
        "Security risk assessments"
      ]
    },
    {
      id: "serviceStandards",
      name: "Service Standards",
      score: metrics.serviceStandards,
      description: "Agency service delivery benchmarks",
      relatedReports: reports.filter(r => r.complianceFlags.includes("Service Standards")).length,
      requirements: [
        "Application processing timeliness",
        "Customer service metrics",
        "Wait time standards",
        "Case management quality"
      ]
    },
    {
      id: "duProcess",
      name: "Due Process",
      score: metrics.duProcess,
      description: "Constitutional procedural requirements",
      relatedReports: reports.filter(r => r.complianceFlags.includes("Due Process")).length,
      requirements: [
        "Proper notice of actions",
        "Right to appeal",
        "Hearing procedures",
        "Documentation requirements"
      ]
    }
  ]

  const [expandedArea, setExpandedArea] = useState<string | null>(null)

  return (
    <div style={{ animation: "slideIn 0.5s ease-out" }}>
      {/* Overall compliance score */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        padding: "2rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)",
        marginBottom: "1.5rem"
      }}>
        <div style={{
          position: "relative",
          width: "150px",
          height: "150px"
        }}>
          {/* Circular progress */}
          <svg width="150" height="150" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="75"
              cy="75"
              r="65"
              fill="none"
              stroke="rgba(232, 213, 183, 0.1)"
              strokeWidth="10"
            />
            <circle
              cx="75"
              cy="75"
              r="65"
              fill="none"
              stroke={Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length >= 85 ? "#4ade80" : "#f59e0b"}
              strokeWidth="10"
              strokeDasharray={`${(Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length / 100) * 408} 408`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              fontFamily: "'Space Mono', monospace",
              color: Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length >= 85 ? "#4ade80" : "#f59e0b"
            }}>
              {Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length)}%
            </span>
            <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>OVERALL</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontFamily: "'Playfair Display', serif" }}>
            Regulatory Compliance Overview
          </h3>
          <p style={{ margin: "0 0 1rem 0", opacity: 0.7, fontSize: "0.9rem" }}>
            Tracking adherence across federal and state regulatory requirements for benefit programs.
          </p>
          <div style={{ display: "flex", gap: "2rem" }}>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4ade80" }}>
                {complianceAreas.filter(a => a.score >= 90).length}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>Compliant Areas</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f59e0b" }}>
                {complianceAreas.filter(a => a.score >= 75 && a.score < 90).length}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>Needs Attention</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ef4444" }}>
                {complianceAreas.filter(a => a.score < 75).length}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>At Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance areas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {complianceAreas.map(area => (
          <div
            key={area.id}
            style={{
              background: "rgba(26, 0, 48, 0.8)",
              borderRadius: "12px",
              border: "1px solid rgba(232, 213, 183, 0.1)",
              overflow: "hidden"
            }}
          >
            <div
              onClick={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.25rem",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232, 213, 183, 0.05)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              {/* Score indicator */}
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "12px",
                background: area.score >= 90 
                  ? "rgba(74, 222, 128, 0.2)" 
                  : area.score >= 75 
                    ? "rgba(245, 158, 11, 0.2)"
                    : "rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: "bold",
                fontFamily: "'Space Mono', monospace",
                color: area.score >= 90 ? "#4ade80" : area.score >= 75 ? "#f59e0b" : "#ef4444"
              }}>
                {area.score}%
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{area.name}</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.6 }}>{area.description}</p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{
                  padding: "0.25rem 0.75rem",
                  background: "rgba(232, 213, 183, 0.1)",
                  borderRadius: "100px",
                  fontSize: "0.75rem",
                  marginBottom: "0.25rem"
                }}>
                  {area.relatedReports} related reports
                </div>
                <span style={{
                  fontSize: "1rem",
                  transition: "transform 0.3s",
                  display: "inline-block",
                  transform: expandedArea === area.id ? "rotate(180deg)" : "rotate(0)"
                }}>
                  ▼
                </span>
              </div>
            </div>

            {/* Expanded content */}
            {expandedArea === area.id && (
              <div style={{
                padding: "0 1.25rem 1.25rem 1.25rem",
                borderTop: "1px solid rgba(232, 213, 183, 0.1)",
                animation: "fadeIn 0.3s ease-out"
              }}>
                <div style={{ paddingTop: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: "0.75rem" }}>
                    KEY REQUIREMENTS
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {area.requirements.map((req, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          background: "rgba(232, 213, 183, 0.05)",
                          borderRadius: "6px",
                          fontSize: "0.8rem"
                        }}
                      >
                        <span style={{ color: "#4ade80" }}>✓</span>
                        {req}
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      fontSize: "0.75rem",
                      marginBottom: "0.5rem"
                    }}>
                      <span>Compliance Progress</span>
                      <span>{area.score}% complete</span>
                    </div>
                    <div style={{
                      height: "8px",
                      background: "rgba(232, 213, 183, 0.1)",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${area.score}%`,
                        background: area.score >= 90 
                          ? "linear-gradient(90deg, #16a34a, #4ade80)" 
                          : area.score >= 75 
                            ? "linear-gradient(90deg, #d97706, #f59e0b)"
                            : "linear-gradient(90deg, #dc2626, #ef4444)",
                        borderRadius: "4px",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Audit Log View Component
function AuditLogView({ logs }: { logs: AuditLog[] }) {
  const [filterAction, setFilterAction] = useState<string>("all")

  const actionTypes = [...new Set(logs.map(l => l.action))]

  const filteredLogs = filterAction === "all" 
    ? logs 
    : logs.filter(l => l.action === filterAction)

  const getActionIcon = (action: string) => {
    switch (action) {
      case "STATUS_CHANGE": return "↔"
      case "ESCALATION": return "↑"
      case "ASSIGNMENT": return "→"
      case "SYNC_COMPLETE": return "⟳"
      case "COMPLIANCE_FLAG": return "⚑"
      case "RESOLUTION": return "✓"
      default: return "•"
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "STATUS_CHANGE": return "#a21090"
      case "ESCALATION": return "#ef4444"
      case "ASSIGNMENT": return "#7851a9"
      case "SYNC_COMPLETE": return "#4ade80"
      case "COMPLIANCE_FLAG": return "#f59e0b"
      case "RESOLUTION": return "#10b981"
      default: return "#e8d5b7"
    }
  }

  return (
    <div style={{ animation: "slideIn 0.5s ease-out" }}>
      {/* Filter */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setFilterAction("all")}
          style={{
            padding: "0.5rem 1rem",
            background: filterAction === "all" ? "rgba(120, 81, 169, 0.5)" : "rgba(232, 213, 183, 0.1)",
            border: "1px solid rgba(232, 213, 183, 0.2)",
            borderRadius: "6px",
            color: "#e8d5b7",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontFamily: "inherit"
          }}
        >
          All Actions
        </button>
        {actionTypes.map(action => (
          <button
            key={action}
            onClick={() => setFilterAction(action)}
            style={{
              padding: "0.5rem 1rem",
              background: filterAction === action ? "rgba(120, 81, 169, 0.5)" : "rgba(232, 213, 183, 0.1)",
              border: "1px solid rgba(232, 213, 183, 0.2)",
              borderRadius: "6px",
              color: "#e8d5b7",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span style={{ color: getActionColor(action) }}>{getActionIcon(action)}</span>
            {action.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)",
        padding: "1.5rem"
      }}>
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{
            position: "absolute",
            left: "16px",
            top: "0",
            bottom: "0",
            width: "2px",
            background: "rgba(232, 213, 183, 0.1)"
          }} />

          {filteredLogs.map((log, index) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                gap: "1.5rem",
                marginBottom: index === filteredLogs.length - 1 ? 0 : "1.5rem",
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
              }}
            >
              {/* Timeline dot */}
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(26, 0, 48, 1)",
                border: `2px solid ${getActionColor(log.action)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                zIndex: 1
              }}>
                <span style={{ color: getActionColor(log.action) }}>{getActionIcon(log.action)}</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: "0.25rem" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "0.5rem"
                }}>
                  <div>
                    <span style={{
                      padding: "0.125rem 0.5rem",
                      background: `${getActionColor(log.action)}20`,
                      border: `1px solid ${getActionColor(log.action)}40`,
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      color: getActionColor(log.action),
                      marginRight: "0.75rem"
                    }}>
                      {log.action.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "0.85rem" }}>{log.details}</span>
                  </div>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    opacity: 0.6,
                    fontFamily: "'Space Mono', monospace",
                    whiteSpace: "nowrap"
                  }}>
                    {log.timestamp}
                  </span>
                </div>
                <div style={{ 
                  display: "flex", 
                  gap: "1rem", 
                  fontSize: "0.75rem",
                  opacity: 0.6
                }}>
                  <span>By: {log.user}</span>
                  {log.reportId && (
                    <span>Case: {log.reportId}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Intake Form View Component
function IntakeFormView({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    type: "",
    severity: "",
    office: "",
    program: "",
    summary: "",
    anonymous: false,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    witnessNames: "",
    incidentDate: "",
    desiredOutcome: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
        padding: "4rem 2rem",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)",
        animation: "slideIn 0.5s ease-out"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
          fontSize: "2rem"
        }}>
          ✓
        </div>
        <h2 style={{ margin: "0 0 1rem 0", fontFamily: "'Playfair Display', serif" }}>
          Report Submitted Successfully
        </h2>
        <p style={{ margin: "0 0 0.5rem 0", opacity: 0.8 }}>
          Your report has been received and assigned case number:
        </p>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "1.25rem",
          color: "#7851a9",
          marginBottom: "1.5rem"
        }}>
          PR-2024-0848
        </p>
        <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "2rem" }}>
          Our triage team will review this report within 24-48 hours. You may be contacted for additional information.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #7851a9 0%, #5a3d82 100%)",
            border: "none",
            borderRadius: "8px",
            color: "#e8d5b7",
            fontSize: "1rem",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 600
          }}
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ animation: "slideIn 0.5s ease-out" }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "rgba(26, 0, 48, 0.8)",
        borderRadius: "16px",
        border: "1px solid rgba(232, 213, 183, 0.1)",
        overflow: "hidden"
      }}>
        {/* Form header */}
        <div style={{
          padding: "1.5rem",
          background: "rgba(120, 81, 169, 0.2)",
          borderBottom: "1px solid rgba(232, 213, 183, 0.1)"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontFamily: "'Playfair Display', serif" }}>
            Submit New Report
          </h3>
          <p style={{ margin: 0, opacity: 0.7, fontSize: "0.85rem" }}>
            All reports are reviewed by our compliance and risk management team within 24-48 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          {/* Classification section */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ 
              margin: "0 0 1rem 0", 
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              opacity: 0.7
            }}>
              Report Classification
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  Report Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(232, 213, 183, 0.05)",
                    border: "1px solid rgba(232, 213, 183, 0.2)",
                    borderRadius: "8px",
                    color: "#e8d5b7",
                    fontSize: "0.9rem",
                    fontFamily: "inherit"
                  }}
                >
                  <option value="">Select type...</option>
                  <option value="civil-rights">Civil Rights Violation</option>
                  <option value="employee-negligence">Employee Negligence</option>
                  <option value="financial">Financial/Billing Issue</option>
                  <option value="safety">Safety Concern</option>
                  <option value="accessibility">Accessibility Issue</option>
                  <option value="ui-bug">Portal/Technical Bug</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  Severity Level *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(232, 213, 183, 0.05)",
                    border: "1px solid rgba(232, 213, 183, 0.2)",
                    borderRadius: "8px",
                    color: "#e8d5b7",
                    fontSize: "0.9rem",
                    fontFamily: "inherit"
                  }}
                >
                  <option value="">Select severity...</option>
                  <option value="critical">Critical - Immediate harm or danger</option>
                  <option value="high">High - Significant impact, urgent</option>
                  <option value="medium">Medium - Moderate impact</option>
                  <option value="low">Low - Minor issue</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  Office/Location *
                </label>
                <select
                  value={formData.office}
                  onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(232, 213, 183, 0.05)",
                    border: "1px solid rgba(232, 213, 183, 0.2)",
                    borderRadius: "8px",
                    color: "#e8d5b7",
                    fontSize: "0.9rem",
                    fontFamily: "inherit"
                  }}
                >
                  <option value="">Select office...</option>
                  <option value="Downtown Benefits Center">Downtown Benefits Center</option>
                  <option value="Eastside Regional">Eastside Regional</option>
                  <option value="Northgate Office">Northgate Office</option>
                  <option value="Southside Center">Southside Center</option>
                  <option value="Westbrook Branch">Westbrook Branch</option>
                  <option value="Call Center">Call Center</option>
                  <option value="Online Portal">Online Portal</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  Program *
                </label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(232, 213, 183, 0.05)",
                    border: "1px solid rgba(232, 213, 183, 0.2)",
                    borderRadius: "8px",
                    color: "#e8d5b7",
                    fontSize: "0.9rem",
                    fontFamily: "inherit"
                  }}
                >
                  <option value="">Select program...</option>
                  <option value="SNAP">SNAP (Food Assistance)</option>
                  <option value="TANF">TANF (Cash Assistance)</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="WIC">WIC</option>
                  <option value="Housing Assistance">Housing Assistance</option>
                  <option value="Child Welfare">Child Welfare</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="All Programs">All Programs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Incident details */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ 
              margin: "0 0 1rem 0", 
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              opacity: 0.7
            }}>
              Incident Details
            </h4>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                Date of Incident
              </label>
              <input
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                style={{
                  padding: "0.75rem",
                  background: "rgba(232, 213, 183, 0.05)",
                  border: "1px solid rgba(232, 213, 183, 0.2)",
                  borderRadius: "8px",
                  color: "#e8d5b7",
                  fontSize: "0.9rem",
                  fontFamily: "inherit"
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                Detailed Summary *
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
                rows={5}
                placeholder="Please provide a detailed description of the incident, including what happened, who was involved, and any relevant circumstances..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(232, 213, 183, 0.05)",
                  border: "1px solid rgba(232, 213, 183, 0.2)",
                  borderRadius: "8px",
                  color: "#e8d5b7",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                Witness Names (if any)
              </label>
              <input
                type="text"
                value={formData.witnessNames}
                onChange={(e) => setFormData({ ...formData, witnessNames: e.target.value })}
                placeholder="Enter names separated by commas"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(232, 213, 183, 0.05)",
                  border: "1px solid rgba(232, 213, 183, 0.2)",
                  borderRadius: "8px",
                  color: "#e8d5b7",
                  fontSize: "0.9rem",
                  fontFamily: "inherit"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                Desired Outcome
              </label>
              <textarea
                value={formData.desiredOutcome}
                onChange={(e) => setFormData({ ...formData, desiredOutcome: e.target.value })}
                rows={2}
                placeholder="What resolution or action would you like to see taken?"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(232, 213, 183, 0.05)",
                  border: "1px solid rgba(232, 213, 183, 0.2)",
                  borderRadius: "8px",
                  color: "#e8d5b7",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            </div>
          </div>

          {/* Contact info */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ 
              margin: "0 0 1rem 0", 
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              opacity: 0.7
            }}>
              Contact Information
            </h4>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
              padding: "0.75rem",
              background: "rgba(232, 213, 183, 0.05)",
              borderRadius: "8px"
            }}>
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.anonymous}
                onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#7851a9" }}
              />
              <label htmlFor="anonymous" style={{ fontSize: "0.9rem", cursor: "pointer" }}>
                Submit this report anonymously
              </label>
            </div>

            {!formData.anonymous && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(232, 213, 183, 0.05)",
                      border: "1px solid rgba(232, 213, 183, 0.2)",
                      borderRadius: "8px",
                      color: "#e8d5b7",
                      fontSize: "0.9rem",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(232, 213, 183, 0.05)",
                      border: "1px solid rgba(232, 213, 183, 0.2)",
                      borderRadius: "8px",
                      color: "#e8d5b7",
                      fontSize: "0.9rem",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(232, 213, 183, 0.05)",
                      border: "1px solid rgba(232, 213, 183, 0.2)",
                      borderRadius: "8px",
                      color: "#e8d5b7",
                      fontSize: "0.9rem",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: "1rem",
            background: "rgba(232, 213, 183, 0.05)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "0.8rem",
            opacity: 0.7,
            lineHeight: 1.5
          }}>
            <strong>Notice:</strong> By submitting this report, you affirm that the information provided is true and accurate to the best of your knowledge. False reporting may result in disciplinary action. All reports are confidential and will be handled in accordance with agency policy and applicable laws.
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "1rem",
              background: isSubmitting 
                ? "rgba(120, 81, 169, 0.5)" 
                : "linear-gradient(135deg, #7851a9 0%, #5a3d82 100%)",
              border: "none",
              borderRadius: "8px",
              color: "#e8d5b7",
              fontSize: "1rem",
              cursor: isSubmitting ? "wait" : "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem"
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                Submitting Report...
              </>
            ) : (
              <>
                Submit Report
                <span>→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}