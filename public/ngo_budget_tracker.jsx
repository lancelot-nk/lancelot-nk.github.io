import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  FileText, DollarSign, Building2, AlertTriangle, TrendingUp, 
  CheckCircle2, XCircle, Clock, FileWarning, Scale, Landmark,
  ClipboardCheck, BarChart3, PieChart, Activity, ArrowRight,
  ChevronDown, Filter, Calendar, Printer, Download, Search,
  Home, FolderOpen, Receipt, Building, ShieldCheck, LineChart,
  FileSpreadsheet, Users, Leaf, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react"

// ============================================================================
// TYPE DEFINITIONS - CIVIC FINANCE AUDIT ENTITY MODELS
// ============================================================================


  fiscalEfficiencyScore
  status: "on-track" | "at-risk" | "over-budget" | "under-utilized"
}











// ============================================================================
// SIMULATION ENGINES
// ============================================================================

// Engine 1: Budget Utilization Engine
function useBudgetUtilizationEngine() {
  const [programs, setPrograms] = useState([
    {
      id: "PRG-001",
      programName: "Kingman Island Restoration",
      allocatedBudget: 485000,
      actualExpenditure: 312450,
      burnRate: 64.4,
      varianceRatio: -8.2,
      fundingSource: "DOEE Environmental Grant",
      costBreakdown: { labor: 145000, materials: 89000, admin: 34450, facilities: 44000 },
      fiscalEfficiencyScore: 87.3,
      status: "on-track"
    },
    {
      id: "PRG-002",
      programName: "Green Jobs Workforce Development",
      allocatedBudget: 320000,
      actualExpenditure: 298750,
      burnRate: 93.4,
      varianceRatio: 12.8,
      fundingSource: "DC Workforce Innovation Fund",
      costBreakdown: { labor: 198000, materials: 42000, admin: 28750, facilities: 30000 },
      fiscalEfficiencyScore: 72.1,
      status: "at-risk"
    },
    {
      id: "PRG-003",
      programName: "Youth Environmental Education",
      allocatedBudget: 175000,
      actualExpenditure: 89200,
      burnRate: 51.0,
      varianceRatio: -22.5,
      fundingSource: "EPA Environmental Education",
      costBreakdown: { labor: 52000, materials: 18200, admin: 9000, facilities: 10000 },
      fiscalEfficiencyScore: 68.4,
      status: "under-utilized"
    },
    {
      id: "PRG-004",
      programName: "Rainwater Retention Gardens",
      allocatedBudget: 245000,
      actualExpenditure: 267890,
      burnRate: 109.3,
      varianceRatio: 18.7,
      fundingSource: "DC Water Infrastructure Grant",
      costBreakdown: { labor: 98000, materials: 124890, admin: 22000, facilities: 23000 },
      fiscalEfficiencyScore: 58.2,
      status: "over-budget"
    },
    {
      id: "PRG-005",
      programName: "Community Garden Network",
      allocatedBudget: 128000,
      actualExpenditure: 94320,
      burnRate: 73.7,
      varianceRatio: -4.1,
      fundingSource: "USDA Community Foods Grant",
      costBreakdown: { labor: 48000, materials: 28320, admin: 8000, facilities: 10000 },
      fiscalEfficiencyScore: 91.7,
      status: "on-track"
    }
  ])

  const simulateBudgetFluctuation = useCallback(() => {
    setPrograms(prev => prev.map(prog => {
      const expenditureChange = (Math.random() - 0.45) * prog.allocatedBudget * 0.008
      const newExpenditure = Math.max(0, prog.actualExpenditure + expenditureChange)
      const newBurnRate = (newExpenditure / prog.allocatedBudget) * 100
      const newVariance = newBurnRate - (prog.burnRate > 80 ? 85 : 75)
      const efficiencyDelta = (Math.random() - 0.5) * 2
      
      let status: ProgramBudget["status"] = "on-track"
      if (newBurnRate > 100) status = "over-budget"
      else if (newBurnRate > 90) status = "at-risk"
      else if (newBurnRate < 55) status = "under-utilized"

      return {
        ...prog,
        actualExpenditure: newExpenditure,
        burnRate: newBurnRate,
        varianceRatio: newVariance,
        fiscalEfficiencyScore: Math.min(100, Math.max(0, prog.fiscalEfficiencyScore + efficiencyDelta)),
        status
      }
    }))
  }, [])

  return { programs, simulateBudgetFluctuation }
}

// Engine 2: Facility Usage Optimization Engine
function useFacilityEngine() {
  const [facilities, setFacilities] = useState([
    { id: "FAC-001", name: "Kingman Island Education Center", siteType: "education", utilizationPercent: 78.5, occupancyCycles: 42, maintenanceCostIndex: 0.85, operationalCapacity: 120, sharedUsageConflicts: 3, efficiencyRank: 2 },
    { id: "FAC-002", name: "Anacostia Restoration Site", siteType: "restoration", utilizationPercent: 92.1, occupancyCycles: 28, maintenanceCostIndex: 1.12, operationalCapacity: 45, sharedUsageConflicts: 1, efficiencyRank: 1 },
    { id: "FAC-003", name: "Ward 7 Training Facility", siteType: "training", utilizationPercent: 61.3, occupancyCycles: 35, maintenanceCostIndex: 0.72, operationalCapacity: 80, sharedUsageConflicts: 5, efficiencyRank: 4 },
    { id: "FAC-004", name: "DC Green Admin Office", siteType: "administrative", utilizationPercent: 88.9, occupancyCycles: 52, maintenanceCostIndex: 0.45, operationalCapacity: 25, sharedUsageConflicts: 0, efficiencyRank: 3 },
    { id: "FAC-005", name: "Benning Road Garden Site", siteType: "restoration", utilizationPercent: 45.2, occupancyCycles: 18, maintenanceCostIndex: 0.92, operationalCapacity: 60, sharedUsageConflicts: 7, efficiencyRank: 5 }
  ])

  const simulateFacilityUsage = useCallback(() => {
    setFacilities(prev => prev.map(fac => ({
      ...fac,
      utilizationPercent: Math.min(100, Math.max(20, fac.utilizationPercent + (Math.random() - 0.5) * 8)),
      occupancyCycles: Math.max(0, fac.occupancyCycles + Math.floor((Math.random() - 0.4) * 3)),
      maintenanceCostIndex: Math.max(0.3, fac.maintenanceCostIndex + (Math.random() - 0.5) * 0.08),
      sharedUsageConflicts: Math.max(0, fac.sharedUsageConflicts + Math.floor((Math.random() - 0.6) * 2))
    })))
  }, [])

  return { facilities, simulateFacilityUsage }
}

// Engine 3: Audit Risk Detection Engine
function useAuditEngine() {
  const [findings, setFindings] = useState([
    { id: "AUD-001", severity: "high", category: "Documentation", discrepancyType: "Missing receipts", documentationScore: 45, resolutionStatus: "open", description: "Q2 material purchases lack supporting documentation for 23 transactions totaling $12,450", financialImpact: 12450 },
    { id: "AUD-002", severity: "medium", category: "Cost Allocation", discrepancyType: "Indirect cost miscoding", documentationScore: 72, resolutionStatus: "in-progress", description: "Administrative costs incorrectly allocated to direct program expenses in Green Jobs program", financialImpact: 8200 },
    { id: "AUD-003", severity: "low", category: "Reporting", discrepancyType: "Late submission", documentationScore: 88, resolutionStatus: "resolved", description: "Monthly progress report submitted 3 days past deadline for Youth Education program", financialImpact: 0 },
    { id: "AUD-004", severity: "critical", category: "Compliance", discrepancyType: "Unallowable expense", documentationScore: 32, resolutionStatus: "open", description: "Equipment purchase exceeds grant-allowable threshold without prior approval", financialImpact: 28750 },
    { id: "AUD-005", severity: "medium", category: "Procurement", discrepancyType: "Vendor documentation", documentationScore: 65, resolutionStatus: "in-progress", description: "Competitive bidding documentation incomplete for landscaping contract", financialImpact: 15600 }
  ])

  const [auditRiskScore, setAuditRiskScore] = useState(67.4)

  const simulateAuditChanges = useCallback(() => {
    setFindings(prev => prev.map(finding => ({
      ...finding,
      documentationScore: Math.min(100, Math.max(0, finding.documentationScore + (Math.random() - 0.4) * 5)),
      resolutionStatus: Math.random() > 0.92 
        ? (finding.resolutionStatus === "open" ? "in-progress" : finding.resolutionStatus === "in-progress" ? "resolved" : finding.resolutionStatus)
        : finding.resolutionStatus
    })))
    setAuditRiskScore(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 3)))
  }, [])

  return { findings, auditRiskScore, simulateAuditChanges }
}

// Engine 4: Grant Compliance Engine
function useGrantEngine() {
  const [grants, setGrants] = useState([
    { id: "GRT-001", name: "DOEE Environmental Restoration FY24", totalAward: 485000, drawnAmount: 312450, reportingCadence: "Quarterly", complianceThreshold: 95, auditRiskLevel: "low", nextReportDue: "2024-03-31", allowableCostRules: ["Direct labor", "Materials", "Equipment < $5000", "Training"] },
    { id: "GRT-002", name: "DC Workforce Innovation Grant", totalAward: 320000, drawnAmount: 298750, reportingCadence: "Monthly", complianceThreshold: 90, auditRiskLevel: "medium", nextReportDue: "2024-02-15", allowableCostRules: ["Participant stipends", "Instructor salaries", "Certification fees", "Transportation"] },
    { id: "GRT-003", name: "EPA Environmental Education Award", totalAward: 175000, drawnAmount: 89200, reportingCadence: "Semi-Annual", complianceThreshold: 92, auditRiskLevel: "low", nextReportDue: "2024-06-30", allowableCostRules: ["Curriculum development", "Field trips", "Educational materials", "Outreach"] },
    { id: "GRT-004", name: "DC Water Infrastructure Fund", totalAward: 245000, drawnAmount: 267890, reportingCadence: "Quarterly", complianceThreshold: 88, auditRiskLevel: "high", nextReportDue: "2024-02-28", allowableCostRules: ["Construction materials", "Engineering services", "Permits", "Labor"] }
  ])

  const simulateGrantProgress = useCallback(() => {
    setGrants(prev => prev.map(grant => ({
      ...grant,
      drawnAmount: Math.min(grant.totalAward * 1.15, grant.drawnAmount + (Math.random() * grant.totalAward * 0.005)),
      complianceThreshold: Math.min(100, Math.max(75, grant.complianceThreshold + (Math.random() - 0.5) * 2))
    })))
  }, [])

  return { grants, simulateGrantProgress }
}

// Engine 5: Expenditure Flow Engine
function useExpenditureEngine() {
  const [expenditures] = useState([
    { id: "EXP-001", description: "Native plant materials - Phase 2", category: "Materials", amount: 8450, program: "Kingman Island Restoration", facility: "Anacostia Restoration Site", complianceTag: "compliant", approvalStatus: "approved", date: "2024-01-15" },
    { id: "EXP-002", description: "Instructor salary - January", category: "Labor", amount: 4200, program: "Green Jobs Workforce Development", facility: "Ward 7 Training Facility", complianceTag: "compliant", approvalStatus: "approved", date: "2024-01-31" },
    { id: "EXP-003", description: "Heavy equipment rental", category: "Equipment", amount: 12800, program: "Rainwater Retention Gardens", facility: "Benning Road Garden Site", complianceTag: "review", approvalStatus: "pending", date: "2024-02-02" },
    { id: "EXP-004", description: "Field trip transportation", category: "Transportation", amount: 890, program: "Youth Environmental Education", facility: "Kingman Island Education Center", complianceTag: "compliant", approvalStatus: "approved", date: "2024-02-05" },
    { id: "EXP-005", description: "Office supplies - Admin", category: "Administrative", amount: 342, program: "Community Garden Network", facility: "DC Green Admin Office", complianceTag: "flagged", approvalStatus: "rejected", date: "2024-02-08" },
    { id: "EXP-006", description: "Soil amendment materials", category: "Materials", amount: 5670, program: "Community Garden Network", facility: "Benning Road Garden Site", complianceTag: "compliant", approvalStatus: "approved", date: "2024-02-10" }
  ])

  return { expenditures }
}

// Engine 6: Budget Forecast Engine
function useForecastEngine() {
  const [forecasts, setForecasts] = useState([
    { month: "Jan", projected: 95000, actual: 89200, burnRate: 7.1 },
    { month: "Feb", projected: 105000, actual: 112450, burnRate: 8.4 },
    { month: "Mar", projected: 118000, actual: 108900, burnRate: 8.1 },
    { month: "Apr", projected: 125000, actual: 134200, burnRate: 10.0 },
    { month: "May", projected: 132000, actual: 128750, burnRate: 9.6 },
    { month: "Jun", projected: 145000, actual: 0, burnRate: 0 },
    { month: "Jul", projected: 152000, actual: 0, burnRate: 0 },
    { month: "Aug", projected: 148000, actual: 0, burnRate: 0 }
  ])

  const simulateForecast = useCallback(() => {
    setForecasts(prev => prev.map((f, i) => ({
      ...f,
      projected: f.projected + (Math.random() - 0.5) * 5000,
      actual: i < 5 ? f.actual + (Math.random() - 0.5) * 3000 : 0
    })))
  }, [])

  return { forecasts, simulateForecast }
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function formatCurrency(amount): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
  return `$${amount.toFixed(0)}`
}

function getSeverityColor(severity): string {
  switch (severity) {
    case "critical": return "bg-red-600 text-white"
    case "high": return "bg-orange-500 text-white"
    case "medium": return "bg-amber-400 text-amber-900"
    case "low": return "bg-green-500 text-white"
    default: return "bg-gray-400 text-white"
  }
}

function getStatusColor(status): string {
  switch (status) {
    case "on-track": return "text-green-700 bg-green-100"
    case "at-risk": return "text-amber-700 bg-amber-100"
    case "over-budget": return "text-red-700 bg-red-100"
    case "under-utilized": return "text-blue-700 bg-blue-100"
    default: return "text-gray-700 bg-gray-100"
  }
}

function getComplianceColor(tag): string {
  switch (tag) {
    case "compliant": return "text-green-700 bg-green-50 border-green-200"
    case "review": return "text-amber-700 bg-amber-50 border-amber-200"
    case "flagged": return "text-red-700 bg-red-50 border-red-200"
    default: return "text-gray-700 bg-gray-50 border-gray-200"
  }
}

function VarianceIndicator({ value }: { value: number }) {
  if (value > 5) return <span className="flex items-center text-red-600 font-semibold"><ArrowUpRight className="w-4 h-4" />+{value.toFixed(1)}%</span>
  if (value < -5) return <span className="flex items-center text-blue-600 font-semibold"><ArrowDownRight className="w-4 h-4" />{value.toFixed(1)}%</span>
  return <span className="flex items-center text-gray-600"><Minus className="w-4 h-4" />{value.toFixed(1)}%</span>
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BudgetAuditPage() {
  const { programs, simulateBudgetFluctuation } = useBudgetUtilizationEngine()
  const { facilities, simulateFacilityUsage } = useFacilityEngine()
  const { findings, auditRiskScore, simulateAuditChanges } = useAuditEngine()
  const { grants, simulateGrantProgress } = useGrantEngine()
  const { expenditures } = useExpenditureEngine()
  const { forecasts, simulateForecast } = useForecastEngine()

  const [activeNav, setActiveNav] = useState("overview")
  const [simulationCycle, setSimulationCycle] = useState(0)

  // Aggregate calculations
  const totalAllocated = programs.reduce((sum, p) => sum + p.allocatedBudget, 0)
  const totalExpended = programs.reduce((sum, p) => sum + p.actualExpenditure, 0)
  const overallBurnRate = (totalExpended / totalAllocated) * 100
  const avgEfficiency = programs.reduce((sum, p) => sum + p.fiscalEfficiencyScore, 0) / programs.length
  const openFindings = findings.filter(f => f.resolutionStatus === "open").length
  const criticalFindings = findings.filter(f => f.severity === "critical" || f.severity === "high").length

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      simulateBudgetFluctuation()
      simulateFacilityUsage()
      simulateAuditChanges()
      simulateGrantProgress()
      simulateForecast()
      setSimulationCycle(c => c + 1)
    }, 3500)
    return () => clearInterval(interval)
  }, [simulateBudgetFluctuation, simulateFacilityUsage, simulateAuditChanges, simulateGrantProgress, simulateForecast])

  const navItems = [
    { id: "overview", label: "Financial Overview", icon: BarChart3 },
    { id: "programs", label: "Program Budgets", icon: FolderOpen },
    { id: "facilities", label: "Facilities Audit", icon: Building },
    { id: "expenditures", label: "Expenditure Ledger", icon: Receipt },
    { id: "compliance", label: "Grant Compliance", icon: ShieldCheck },
    { id: "findings", label: "Audit Findings", icon: FileWarning },
    { id: "forecast", label: "Budget Forecast", icon: LineChart }
  ]

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white shadow-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Program & Facilities Budget Audit System</h1>
                <p className="text-emerald-200 text-sm">Civic Grant Financial Oversight + Utilization Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-emerald-300">Fiscal Year 2024</p>
                <p className="text-sm font-semibold">Living Classrooms Foundation DC</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs">Cycle {simulationCycle}</span>
              </div>
              <a href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Home className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1800px] mx-auto">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 min-h-[calc(100vh-80px)] bg-white/60 backdrop-blur-sm border-r border-emerald-200 p-4 sticky top-0">
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeNav === item.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Audit Risk Gauge */}
          <div className="mt-8 p-4 bg-white rounded-xl border border-emerald-200 shadow-sm">
            <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-3">Audit Risk Score</h3>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#d1fae5" strokeWidth="12" />
                <circle
                  cx="64" cy="64" r="56" fill="none"
                  stroke={auditRiskScore > 70 ? "#ef4444" : auditRiskScore > 50 ? "#f59e0b" : "#22c55e"}
                  strokeWidth="12"
                  strokeDasharray={`${(auditRiskScore / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-emerald-900">{auditRiskScore.toFixed(0)}</span>
                <span className="text-xs text-emerald-600">/ 100</span>
              </div>
            </div>
            <p className="text-center text-xs text-emerald-700 mt-2">
              {auditRiskScore > 70 ? "High Risk" : auditRiskScore > 50 ? "Moderate Risk" : "Low Risk"}
            </p>
          </div>

          {/* Tool Stack */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <h3 className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-3">Connected Systems</h3>
            <div className="space-y-2 text-xs">
              {["Salesforce NPSP", "E-Grants Portal", "Excel VBA", "SMART Tracking"].map(tool => (
                <div key={tool} className="flex items-center gap-2 text-emerald-700">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {tool}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Filters:</span>
              </div>
              <select className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <option>All Programs</option>
                {programs.map(p => <option key={p.id}>{p.programName}</option>)}
              </select>
              <select className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <option>All Facilities</option>
                {facilities.map(f => <option key={f.id}>{f.name}</option>)}
              </select>
              <select className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <option>All Grants</option>
                {grants.map(g => <option key={g.id}>{g.name}</option>)}
              </select>
              <div className="flex items-center gap-2 ml-auto">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">FY2024 Q1-Q2</span>
              </div>
              <button className="p-2 hover:bg-emerald-100 rounded-lg transition-colors">
                <Printer className="w-4 h-4 text-emerald-600" />
              </button>
              <button className="p-2 hover:bg-emerald-100 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SCROLL LAYER 1: FINANCIAL OVERVIEW LEDGER */}
          {/* ============================================================ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-5 gap-4"
          >
            {[
              { label: "Total Allocated", value: formatCurrency(totalAllocated), icon: DollarSign, color: "emerald" },
              { label: "Total Expended", value: formatCurrency(totalExpended), icon: Receipt, color: "teal" },
              { label: "Burn Rate", value: `${overallBurnRate.toFixed(1)}%`, icon: TrendingUp, color: "green" },
              { label: "Avg Efficiency", value: `${avgEfficiency.toFixed(1)}%`, icon: Activity, color: "cyan" },
              { label: "Open Findings", value: openFindings.toString(), icon: AlertTriangle, color: "amber", highlight: criticalFindings > 0 }
            ].map((kpi, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl border shadow-sm p-5 ${
                  kpi.highlight ? "border-amber-300 bg-amber-50" : "border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">{kpi.label}</span>
                  <kpi.icon className={`w-5 h-5 text-${kpi.color}-500`} />
                </div>
                <p className="text-3xl font-bold text-emerald-900">{kpi.value}</p>
              </div>
            ))}
          </motion.section>

          {/* ============================================================ */}
          {/* OVERVIEW DASHBOARD: clickable nav tiles (overview only) */}
          {/* ============================================================ */}
          {activeNav === "overview" && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                {
                  id: "programs",
                  label: "Program Budgets",
                  icon: FolderOpen,
                  stat: `${programs.filter(p => p.status === "on-track").length}/${programs.length} on-track`,
                  sub: `${formatCurrency(totalAllocated)} allocated across ${programs.length} programs`,
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  id: "facilities",
                  label: "Facilities Audit",
                  icon: Building,
                  stat: `${facilities.length} sites tracked`,
                  sub: `Avg utilization ${(facilities.reduce((s,f)=>s+f.utilizationPercent,0)/facilities.length).toFixed(0)}% · ${facilities.reduce((s,f)=>s+f.sharedUsageConflicts,0)} scheduling conflicts`,
                  color: "from-teal-500 to-cyan-500",
                },
                {
                  id: "expenditures",
                  label: "Expenditure Ledger",
                  icon: Receipt,
                  stat: `${expenditures.length} transactions`,
                  sub: `${expenditures.filter(e=>e.complianceTag==="flagged").length} flagged · ${expenditures.filter(e=>e.approvalStatus==="pending").length} pending approval`,
                  color: "from-cyan-500 to-emerald-500",
                },
                {
                  id: "compliance",
                  label: "Grant Compliance",
                  icon: ShieldCheck,
                  stat: `${grants.length} active grants`,
                  sub: `${formatCurrency(grants.reduce((s,g)=>s+g.totalAward,0))} total award · ${grants.filter(g=>g.auditRiskLevel==="high").length} high-risk`,
                  color: "from-green-500 to-emerald-600",
                },
                {
                  id: "findings",
                  label: "Audit Findings",
                  icon: FileWarning,
                  stat: `${openFindings} open findings`,
                  sub: `${criticalFindings} critical/high · ${findings.filter(f=>f.resolutionStatus==="resolved").length} resolved`,
                  color: "from-amber-500 to-orange-500",
                },
                {
                  id: "forecast",
                  label: "Budget Forecast",
                  icon: LineChart,
                  stat: `${overallBurnRate.toFixed(1)}% burn rate`,
                  sub: `Projected depletion Q3 FY24 · Audit readiness ${(100-auditRiskScore).toFixed(0)}%`,
                  color: "from-emerald-700 to-teal-700",
                },
              ].map(card => (
                <button
                  key={card.id}
                  onClick={() => setActiveNav(card.id)}
                  className="text-left bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className={`bg-gradient-to-r ${card.color} px-5 py-3 flex items-center justify-between`}>
                    <span className="font-semibold text-white text-sm">{card.label}</span>
                    <card.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-xl font-bold text-emerald-900">{card.stat}</p>
                    <p className="text-xs text-emerald-600 mt-1 leading-relaxed">{card.sub}</p>
                  </div>
                  <div className="px-5 pb-3">
                    <span className="text-xs font-medium text-emerald-500 group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
                      <ArrowRight className="w-3 h-3" /> Open full view
                    </span>
                  </div>
                </button>
              ))}
            </motion.section>
          )}

          {/* ============================================================ */}
          {/* SCROLL LAYER 2: PROGRAM BUDGET ANALYSIS */}
          {/* ============================================================ */}
          {(activeNav === "overview" || activeNav === "programs") && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Program Budget Utilization Analysis
              </h2>
            </div>
            <div className="p-6">
              {/* Budget Bar Chart */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-emerald-800 mb-4">Budget Allocation by Program</h3>
                <div className="space-y-4">
                  {programs.map(prog => (
                    <div key={prog.id} className="flex items-center gap-4">
                      <div className="w-48 text-sm text-emerald-800 truncate">{prog.programName}</div>
                      <div className="flex-1 h-8 bg-emerald-100 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-500 ${
                            prog.status === "over-budget" ? "bg-gradient-to-r from-red-400 to-red-500" :
                            prog.status === "at-risk" ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                            "bg-gradient-to-r from-emerald-400 to-teal-500"
                          }`}
                          style={{ width: `${Math.min(100, prog.burnRate)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                          <span className="text-xs font-semibold text-emerald-900">{formatCurrency(prog.actualExpenditure)}</span>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(prog.status)}`}>
                          {prog.burnRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Detail Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-50 border-b border-emerald-200">
                      <th className="text-left p-3 font-semibold text-emerald-800">Program</th>
                      <th className="text-right p-3 font-semibold text-emerald-800">Allocated</th>
                      <th className="text-right p-3 font-semibold text-emerald-800">Expended</th>
                      <th className="text-right p-3 font-semibold text-emerald-800">Variance</th>
                      <th className="text-right p-3 font-semibold text-emerald-800">Efficiency</th>
                      <th className="text-center p-3 font-semibold text-emerald-800">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(prog => (
                      <tr key={prog.id} className="border-b border-emerald-100 hover:bg-emerald-50/50">
                        <td className="p-3">
                          <div className="font-medium text-emerald-900">{prog.programName}</div>
                          <div className="text-xs text-emerald-600">{prog.fundingSource}</div>
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-800">{formatCurrency(prog.allocatedBudget)}</td>
                        <td className="p-3 text-right font-mono text-emerald-800">{formatCurrency(prog.actualExpenditure)}</td>
                        <td className="p-3 text-right"><VarianceIndicator value={prog.varianceRatio} /></td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-emerald-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${prog.fiscalEfficiencyScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-emerald-700">{prog.fiscalEfficiencyScore.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(prog.status)}`}>
                            {prog.status.replace("-", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
          )}

          {/* ============================================================ */}
          {/* SCROLL LAYER 3: FACILITY UTILIZATION */}
          {/* ============================================================ */}
          {(activeNav === "overview" || activeNav === "facilities") && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {/* Facility Cards */}
            <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Facilities Utilization Matrix
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {facilities.map(fac => (
                  <div key={fac.id} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-emerald-900">{fac.name}</h4>
                        <span className="text-xs text-emerald-600 capitalize">{fac.siteType}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-1 rounded-full">
                        Rank #{fac.efficiencyRank}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xl font-bold text-emerald-800">{fac.utilizationPercent.toFixed(0)}%</p>
                        <p className="text-xs text-emerald-600">Utilization</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-emerald-800">{fac.occupancyCycles}</p>
                        <p className="text-xs text-emerald-600">Cycles</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-amber-600">{fac.sharedUsageConflicts}</p>
                        <p className="text-xs text-emerald-600">Conflicts</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fac.utilizationPercent > 85 ? "bg-teal-500" :
                          fac.utilizationPercent > 60 ? "bg-emerald-500" :
                          "bg-amber-500"
                        }`}
                        style={{ width: `${fac.utilizationPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Allocation Pie */}
            <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Cost Category Distribution
                </h2>
              </div>
              <div className="p-6">
                {/* Aggregate cost breakdown */}
                {(() => {
                  const totals = programs.reduce((acc, p) => ({
                    labor: acc.labor + p.costBreakdown.labor,
                    materials: acc.materials + p.costBreakdown.materials,
                    admin: acc.admin + p.costBreakdown.admin,
                    facilities: acc.facilities + p.costBreakdown.facilities
                  }), { labor: 0, materials: 0, admin: 0, facilities: 0 })
                  const total = totals.labor + totals.materials + totals.admin + totals.facilities
                  const categories = [
                    { name: "Labor", value: totals.labor, color: "bg-emerald-500" },
                    { name: "Materials", value: totals.materials, color: "bg-teal-500" },
                    { name: "Administrative", value: totals.admin, color: "bg-cyan-500" },
                    { name: "Facilities", value: totals.facilities, color: "bg-green-500" }
                  ]
                  return (
                    <div className="flex items-center gap-8">
                      {/* Donut Chart */}
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          {categories.reduce((acc, cat, i) => {
                            const pct = (cat.value / total) * 100
                            const offset = acc.offset
                            const colors = ["#10b981", "#14b8a6", "#06b6d4", "#22c55e"]
                            acc.elements.push(
                              <circle
                                key={i}
                                cx="50" cy="50" r="40"
                                fill="none"
                                stroke={colors[i]}
                                strokeWidth="20"
                                strokeDasharray={`${pct * 2.51} 251`}
                                strokeDashoffset={-offset * 2.51}
                              />
                            )
                            acc.offset += pct
                            return acc
                          }, { elements: [] .Element[], offset: 0 }).elements}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-emerald-900">{formatCurrency(total)}</span>
                          <span className="text-xs text-emerald-600">Total Cost</span>
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="space-y-3">
                        {categories.map(cat => (
                          <div key={cat.name} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded ${cat.color}`} />
                            <div>
                              <p className="font-medium text-emerald-900">{cat.name}</p>
                              <p className="text-sm text-emerald-600">
                                {formatCurrency(cat.value)} ({((cat.value / total) * 100).toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </motion.section>
          )}

          {/* ============================================================ */}
          {/* SCROLL LAYER 4: EXPENDITURE LEDGER */}
          {/* ============================================================ */}
          {(activeNav === "overview" || activeNav === "expenditures") && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Expenditure Ledger
              </h2>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-white/70" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="bg-white/20 border-0 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-50 border-b border-emerald-200">
                    <th className="text-left p-3 font-semibold text-emerald-800">Date</th>
                    <th className="text-left p-3 font-semibold text-emerald-800">Description</th>
                    <th className="text-left p-3 font-semibold text-emerald-800">Category</th>
                    <th className="text-left p-3 font-semibold text-emerald-800">Program</th>
                    <th className="text-right p-3 font-semibold text-emerald-800">Amount</th>
                    <th className="text-center p-3 font-semibold text-emerald-800">Compliance</th>
                    <th className="text-center p-3 font-semibold text-emerald-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map(exp => (
                    <tr key={exp.id} className="border-b border-emerald-100 hover:bg-emerald-50/50">
                      <td className="p-3 text-emerald-700">{exp.date}</td>
                      <td className="p-3 font-medium text-emerald-900">{exp.description}</td>
                      <td className="p-3 text-emerald-700">{exp.category}</td>
                      <td className="p-3 text-emerald-700 text-xs">{exp.program}</td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-900">{formatCurrency(exp.amount)}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded border ${getComplianceColor(exp.complianceTag)}`}>
                          {exp.complianceTag}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {exp.approvalStatus === "approved" && <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />}
                        {exp.approvalStatus === "pending" && <Clock className="w-5 h-5 text-amber-500 mx-auto" />}
                        {exp.approvalStatus === "rejected" && <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
          )}

          {/* ============================================================ */}
          {/* SCROLL LAYER 5: GRANT COMPLIANCE */}
          {/* ============================================================ */}
          {(activeNav === "overview" || activeNav === "compliance") && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {grants.map(grant => (
              <div key={grant.id} className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                <div className={`px-6 py-4 ${
                  grant.auditRiskLevel === "high" ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                  grant.auditRiskLevel === "medium" ? "bg-gradient-to-r from-teal-500 to-emerald-500" :
                  "bg-gradient-to-r from-green-500 to-emerald-500"
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white">{grant.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/20 text-white`}>
                      {grant.auditRiskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-emerald-600">Total Award</p>
                      <p className="text-2xl font-bold text-emerald-900">{formatCurrency(grant.totalAward)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-emerald-600">Drawn</p>
                      <p className="text-xl font-bold text-emerald-800">{formatCurrency(grant.drawnAmount)}</p>
                    </div>
                  </div>
                  <div className="h-3 bg-emerald-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (grant.drawnAmount / grant.totalAward) > 1 ? "bg-red-500" :
                        (grant.drawnAmount / grant.totalAward) > 0.9 ? "bg-amber-500" :
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, (grant.drawnAmount / grant.totalAward) * 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-600">Reporting</p>
                      <p className="font-medium text-emerald-900">{grant.reportingCadence}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Next Report Due</p>
                      <p className="font-medium text-emerald-900">{grant.nextReportDue}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.section>
          )}

          {/* ============================================================ */}
          {/* SCROLL LAYER 6: AUDIT FINDINGS */}
          {/* ============================================================ */}
          {(activeNav === "overview" || activeNav === "findings") && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileWarning className="w-5 h-5" />
                Audit Findings Register
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {findings.map(finding => (
                <div
                  key={finding.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    finding.severity === "critical" ? "border-l-red-600 bg-red-50" :
                    finding.severity === "high" ? "border-l-orange-500 bg-orange-50" :
                    finding.severity === "medium" ? "border-l-amber-400 bg-amber-50" :
                    "border-l-green-500 bg-green-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityColor(finding.severity)}`}>
                          {finding.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-emerald-800">{finding.category}</span>
                        <span className="text-xs text-emerald-600">| {finding.discrepancyType}</span>
                      </div>
                      <p className="text-sm text-emerald-800">{finding.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-emerald-600">Financial Impact</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(finding.financialImpact)}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        finding.resolutionStatus === "resolved" ? "bg-green-200 text-green-800" :
                        finding.resolutionStatus === "in-progress" ? "bg-amber-200 text-amber-800" :
                        "bg-red-200 text-red-800"
                      }`}>
                        {finding.resolutionStatus}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600">Documentation Score:</span>
                      <div className="w-24 h-2 bg-emerald-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            finding.documentationScore > 70 ? "bg-green-500" :
                            finding.documentationScore > 50 ? "bg-amber-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${finding.documentationScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-emerald-700">{finding.documentationScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
          )}

          {/* ============================================================ */}
          {/* SCROLL LAYER 7: BUDGET FORECAST */}
          {/* ============================================================ */}
          {(activeNav === "overview" || activeNav === "forecast") && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Budget Forecast & Depletion Analysis
              </h2>
            </div>
            <div className="p-6">
              {/* Forecast Chart */}
              <div className="h-64 flex items-end gap-2 mb-6">
                {forecasts.map((f, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 justify-center" style={{ height: "200px" }}>
                      <div
                        className="w-5 bg-emerald-300 rounded-t transition-all duration-500"
                        style={{ height: `${(f.projected / 160000) * 100}%` }}
                        title={`Projected: ${formatCurrency(f.projected)}`}
                      />
                      {f.actual > 0 && (
                        <div
                          className="w-5 bg-teal-600 rounded-t transition-all duration-500"
                          style={{ height: `${(f.actual / 160000) * 100}%` }}
                          title={`Actual: ${formatCurrency(f.actual)}`}
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-emerald-700">{f.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-300 rounded" />
                  <span className="text-sm text-emerald-700">Projected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-600 rounded" />
                  <span className="text-sm text-emerald-700">Actual</span>
                </div>
              </div>

              {/* Depletion Warning */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Budget Depletion Alert</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      At current burn rate, the Rainwater Retention Gardens program is projected to exhaust allocated funds by mid-Q3 FY24.
                      Green Jobs Workforce Development shows elevated burn rate requiring immediate reallocation review.
                      Recommend fund transfer from under-utilized Youth Environmental Education budget.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
          )}

          {/* ============================================================ */}
          {/* FINAL SYNTHESIS LAYER */}
          {/* ============================================================ */}
          {(activeNav === "overview" || activeNav === "forecast") && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-xl shadow-lg p-8 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <ClipboardCheck className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Executive Audit Synthesis</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-emerald-200 mb-3">Corrective Actions Required</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-amber-400" />
                    <span>Resolve critical equipment procurement finding within 15 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-amber-400" />
                    <span>Submit missing Q2 documentation for DOEE compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-amber-400" />
                    <span>Reallocate $45K from Youth Education to Rainwater Gardens</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-emerald-200 mb-3">Facility Optimization</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-cyan-400" />
                    <span>Increase Benning Road utilization from 45% to target 70%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-cyan-400" />
                    <span>Resolve 7 scheduling conflicts at Benning Road site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-cyan-400" />
                    <span>Consolidate Ward 7 and Kingman Island training sessions</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-emerald-200 mb-3">Fiscal Health Indicators</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Efficiency</span>
                      <span className="font-bold">{avgEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${avgEfficiency}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Audit Readiness</span>
                      <span className="font-bold">{(100 - auditRiskScore).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${100 - auditRiskScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Grant Compliance</span>
                      <span className="font-bold">87.2%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: "87.2%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
          )}

          {/* Footer */}
          <footer className="text-center py-8 text-emerald-700 text-sm">
            <p>Program & Facilities Budget Audit System | Living Classrooms Foundation DC</p>
            <p className="text-emerald-500 mt-1">Civic Grant Financial Oversight Simulation | FY2024</p>
          </footer>
        </main>
      </div>
    </div>
    {/* === PROJECT FOOTER === */}
    <div style={{background:"#0f172a",color:"#94a3b8",fontSize:"11px",padding:"18px 32px",borderTop:"2px solid #1e293b",fontFamily:"monospace",lineHeight:1.7}}>
      <div style={{marginBottom:6,color:"#e2e8f0",fontWeight:700,fontSize:13,letterSpacing:1}}>PROJECT FOOTNOTE</div>
      <div><strong style={{color:"#f1f5f9"}}>Stack:</strong> React · TypeScript · Tailwind CSS · Framer Motion · Lucide Icons — standalone simulation, no backend</div>
      <div><strong style={{color:"#f1f5f9"}}>Methods:</strong> Program budget variance tracking · Burn rate analysis · Facility utilization scoring · Expenditure compliance tagging · Grant drawdown monitoring · Audit finding severity classification · Fiscal efficiency indexing</div>
      <div><strong style={{color:"#f1f5f9"}}>Sources:</strong> Budget and program structures modeled after Living Classrooms Foundation DC / Kingman Island Ecological Area grant frameworks; grant reporting standards based on DOEE / DC Workforce Innovation Fund compliance requirements; all financial figures procedurally generated — no real organizational data</div>
    </div>
    </>
  )
}
