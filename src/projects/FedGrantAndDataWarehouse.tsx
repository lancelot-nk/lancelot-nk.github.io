"use client"

import { useState, useEffect, useCallback } from "react"
import {
  AlertTriangle,
  Shield,
  DollarSign,
  Clock,
  Building2,
  Users,
  FileCheck,
  TrendingUp,
  Activity,
  ChevronRight,
  X,
  RefreshCw,
  Flag,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  Layers,
  BarChart3,
  FileWarning,
  Briefcase,
  Calendar,
  Target,
  Zap,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface AuditEvent {
  date: string
  event: string
  severity: "info" | "warning" | "critical"
}

interface Project {
  id: string
  name: string
  agency: string
  program: string
  contractor: string
  subcontractors: string[]
  fundingSource: string
  awardType: string
  congressionalDistrict: string
  totalBudget: number
  obligatedAmount: number
  actualSpend: number
  remainingBudget: number
  burnRate: number
  monthlySpendRate: number
  forecastedTotalSpend: number
  fundingReallocationFlag: boolean
  costOverrunIndicator: boolean
  financialEfficiencyScore: number
  startDate: string
  endDate: string
  daysElapsed: number
  daysRemaining: number
  percentTimeUsed: number
  lifecyclePhase: "Awarded" | "Obligating" | "Executing" | "Closing" | "Closed"
  nistRmfScore: number
  complianceFlags: number
  complianceStage: "Initial Review" | "Mid Compliance Check" | "Final Audit"
  auditFindings: number
  lastAuditDate: string
  nextAuditDue: string
  reportingCadence: "Monthly" | "Quarterly"
  lastReportSubmitted: string
  missingReportsIndicator: boolean
  riskLevel: "Red" | "Orange" | "Yellow" | "Green"
  riskTags: string[]
  slaRemaining: number
  slaRiskLevel: "High" | "Medium" | "Low"
  incidentCount: number
  escalationStatus: boolean
  priorityScore: number
  programManager: string
  complianceOfficer: string
  lastUpdated: string
  auditHistory: AuditEvent[]
  notes: string
}

interface ContractorMetrics {
  name: string
  activeProjects: number
  avgComplianceScore: number
  incidentRate: number
  riskRating: "Low" | "Medium" | "High"
  totalBudgetManaged: number
  deliveryEfficiency: number
}

interface ProgramMetrics {
  name: string
  projectCount: number
  totalBudget: number
  totalSpend: number
  avgCompliance: number
  riskDistribution: { red: number; orange: number; yellow: number; green: number }
}

interface NavigationModule {
  id: string
  label: string
  icon: React.ElementType
  description: string
  category: "operations" | "compliance" | "analytics" | "management"
  alertCount: number
  status: "healthy" | "warning" | "critical"
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATION DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

const AGENCIES = ["DOT", "HUD", "EPA", "DHS", "DOE", "HHS", "DOD", "VA"]
const PROGRAMS = ["Infrastructure", "Climate Resilience", "Cybersecurity", "Public Health", "Housing", "Veterans Services", "Emergency Response", "Transportation"]
const CONTRACTORS = ["Accenture Federal", "Deloitte GPS", "Booz Allen Hamilton", "Leidos", "SAIC", "Northrop Grumman", "General Dynamics IT", "Lockheed Martin"]
const FUNDING_SOURCES = ["IIJA", "ARPA", "General Fund", "Emergency Allocation", "Supplemental Appropriation"]
const AWARD_TYPES = ["Grant", "Cooperative Agreement", "Contract", "IDIQ Task Order"]
const RISK_TAGS = ["Procurement Delay", "Vendor Risk", "Staffing Gap", "Regulatory Delay", "Funding Gap", "Scope Creep", "Technical Debt"]
const PROGRAM_MANAGERS = ["J. Morrison", "K. Patel", "R. Chen", "M. Williams", "S. Johnson", "A. Garcia", "T. Nguyen", "L. Davis"]
const COMPLIANCE_OFFICERS = ["D. Thompson", "E. Martinez", "F. Robinson", "G. Anderson", "H. Taylor", "I. Brown", "C. Wilson", "B. Moore"]

function generateProject(index: number): Project {
  const totalBudget = Math.floor(Math.random() * 45000000) + 5000000
  const percentComplete = Math.random() * 0.85 + 0.1
  const actualSpend = Math.floor(totalBudget * percentComplete * (0.7 + Math.random() * 0.5))
  const obligatedAmount = Math.floor(totalBudget * (0.6 + Math.random() * 0.4))
  const totalDays = Math.floor(Math.random() * 720) + 180
  const daysElapsed = Math.floor(totalDays * percentComplete)
  const daysRemaining = totalDays - daysElapsed
  const timeRatio = daysElapsed / totalDays
  const spendRatio = actualSpend / totalBudget
  const burnRate = timeRatio > 0 ? spendRatio / timeRatio : 0
  const nistScore = Math.random() * 0.4 + 0.55
  const complianceFlags = Math.floor(Math.random() * 8)
  const auditFindings = Math.floor(Math.random() * 5)

  let riskLevel: "Red" | "Orange" | "Yellow" | "Green" = "Green"
  if (burnRate > 1.3 || nistScore < 0.6 || complianceFlags > 5) riskLevel = "Red"
  else if (burnRate > 1.1 || nistScore < 0.7 || complianceFlags > 3) riskLevel = "Orange"
  else if (burnRate > 0.95 || nistScore < 0.8 || complianceFlags > 1) riskLevel = "Yellow"

  const priorityScore = (riskLevel === "Red" ? 0.4 : riskLevel === "Orange" ? 0.3 : riskLevel === "Yellow" ? 0.2 : 0.1) +
    (complianceFlags > 3 ? 0.3 : complianceFlags > 1 ? 0.2 : 0.1) +
    (burnRate > 1.1 ? 0.3 : burnRate < 0.8 ? 0.2 : 0.1)

  return {
    id: `PRJ-${2024}-${String(index + 1).padStart(4, "0")}`,
    name: `${PROGRAMS[index % PROGRAMS.length]} Initiative ${Math.floor(index / PROGRAMS.length) + 1}`,
    agency: AGENCIES[index % AGENCIES.length],
    program: PROGRAMS[index % PROGRAMS.length],
    contractor: CONTRACTORS[index % CONTRACTORS.length],
    subcontractors: Math.random() > 0.5 ? [CONTRACTORS[(index + 3) % CONTRACTORS.length]] : [],
    fundingSource: FUNDING_SOURCES[index % FUNDING_SOURCES.length],
    awardType: AWARD_TYPES[index % AWARD_TYPES.length],
    congressionalDistrict: `DC-${Math.floor(Math.random() * 8) + 1}`,
    totalBudget,
    obligatedAmount,
    actualSpend,
    remainingBudget: totalBudget - actualSpend,
    burnRate,
    monthlySpendRate: actualSpend / Math.max(daysElapsed / 30, 1),
    forecastedTotalSpend: Math.floor(actualSpend / Math.max(percentComplete, 0.1)),
    fundingReallocationFlag: Math.random() > 0.85,
    costOverrunIndicator: burnRate > 1.15,
    financialEfficiencyScore: Math.min(1, Math.max(0, 1 - Math.abs(burnRate - 1) * 0.5)),
    startDate: "2023-01-15",
    endDate: "2025-06-30",
    daysElapsed,
    daysRemaining,
    percentTimeUsed: timeRatio * 100,
    lifecyclePhase: percentComplete < 0.15 ? "Awarded" : percentComplete < 0.3 ? "Obligating" : percentComplete < 0.85 ? "Executing" : percentComplete < 0.95 ? "Closing" : "Closed",
    nistRmfScore: nistScore,
    complianceFlags,
    complianceStage: percentComplete < 0.4 ? "Initial Review" : percentComplete < 0.75 ? "Mid Compliance Check" : "Final Audit",
    auditFindings,
    lastAuditDate: "2024-09-15",
    nextAuditDue: "2025-03-15",
    reportingCadence: Math.random() > 0.5 ? "Monthly" : "Quarterly",
    lastReportSubmitted: "2024-11-01",
    missingReportsIndicator: Math.random() > 0.8,
    riskLevel,
    riskTags: RISK_TAGS.filter(() => Math.random() > 0.75).slice(0, 3),
    slaRemaining: daysRemaining,
    slaRiskLevel: daysRemaining < 30 ? "High" : daysRemaining < 90 ? "Medium" : "Low",
    incidentCount: Math.floor(Math.random() * 4),
    escalationStatus: riskLevel === "Red",
    priorityScore,
    programManager: PROGRAM_MANAGERS[index % PROGRAM_MANAGERS.length],
    complianceOfficer: COMPLIANCE_OFFICERS[index % COMPLIANCE_OFFICERS.length],
    lastUpdated: new Date().toISOString(),
    auditHistory: [
      { date: "2024-03-15", event: "Initial compliance review completed", severity: "info" },
      { date: "2024-06-20", event: "Mid-cycle audit performed", severity: "info" },
      { date: "2024-09-15", event: auditFindings > 0 ? `${auditFindings} findings identified` : "No findings", severity: auditFindings > 2 ? "critical" : auditFindings > 0 ? "warning" : "info" },
    ],
    notes: "Standard monitoring protocols in effect. Quarterly review scheduled.",
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function calculateBurnRate(actualSpend: number, budget: number, daysElapsed: number, totalDays: number): number {
  const timeRatio = daysElapsed / totalDays
  if (timeRatio === 0) return 0
  return (actualSpend / budget) / timeRatio
}

function calculateComplianceScore(nistScore: number, flags: number, auditFindings: number): number {
  const baseScore = nistScore * 0.6
  const flagPenalty = flags * 0.05
  const auditPenalty = auditFindings * 0.08
  return Math.max(0, Math.min(1, baseScore + 0.4 - flagPenalty - auditPenalty))
}

function calculatePriorityScore(riskLevel: string, complianceScore: number, burnRate: number): number {
  const riskWeight = riskLevel === "Red" ? 1 : riskLevel === "Orange" ? 0.7 : riskLevel === "Yellow" ? 0.4 : 0.1
  const complianceBreach = complianceScore < 0.7 ? 1 : complianceScore < 0.85 ? 0.5 : 0
  const budgetVariance = Math.abs(burnRate - 1)
  return (riskWeight * 0.4) + (complianceBreach * 0.3) + (budgetVariance * 0.3)
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SentinelDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeView, setActiveView] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [systemTime, setSystemTime] = useState<Date>(new Date())

  // Initialize projects
  useEffect(() => {
    const initialProjects = Array.from({ length: 24 }, (_, i) => generateProject(i))
    setProjects(initialProjects)
  }, [])

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setSystemTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Simulation: Data drift
  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(prev => prev.map(p => ({
        ...p,
        actualSpend: p.actualSpend + Math.floor(Math.random() * 50000),
        daysElapsed: Math.min(p.daysElapsed + 0.1, p.daysElapsed + p.daysRemaining),
        nistRmfScore: Math.min(1, Math.max(0.4, p.nistRmfScore + (Math.random() - 0.5) * 0.02)),
        burnRate: calculateBurnRate(p.actualSpend, p.totalBudget, p.daysElapsed, p.daysElapsed + p.daysRemaining),
      })))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleSync = useCallback(() => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setLastSync(new Date())
    }, 2500)
  }, [])

  // Derived metrics
  const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0)
  const totalSpend = projects.reduce((sum, p) => sum + p.actualSpend, 0)
  const avgCompliance = projects.length > 0 ? projects.reduce((sum, p) => sum + calculateComplianceScore(p.nistRmfScore, p.complianceFlags, p.auditFindings), 0) / projects.length : 0
  const criticalProjects = projects.filter(p => p.riskLevel === "Red").length
  const atRiskProjects = projects.filter(p => p.riskLevel === "Orange").length

  // Contractor metrics
  const contractorMetrics: ContractorMetrics[] = CONTRACTORS.map(name => {
    const contractorProjects = projects.filter(p => p.contractor === name)
    return {
      name,
      activeProjects: contractorProjects.length,
      avgComplianceScore: contractorProjects.length > 0 ? contractorProjects.reduce((sum, p) => sum + calculateComplianceScore(p.nistRmfScore, p.complianceFlags, p.auditFindings), 0) / contractorProjects.length : 0,
      incidentRate: contractorProjects.length > 0 ? contractorProjects.reduce((sum, p) => sum + p.incidentCount, 0) / contractorProjects.length : 0,
      riskRating: contractorProjects.some(p => p.riskLevel === "Red") ? "High" : contractorProjects.some(p => p.riskLevel === "Orange") ? "Medium" : "Low",
      totalBudgetManaged: contractorProjects.reduce((sum, p) => sum + p.totalBudget, 0),
      deliveryEfficiency: contractorProjects.length > 0 ? contractorProjects.reduce((sum, p) => sum + p.financialEfficiencyScore, 0) / contractorProjects.length : 0,
    }
  })

  // Program metrics
  const programMetrics: ProgramMetrics[] = PROGRAMS.map(name => {
    const programProjects = projects.filter(p => p.program === name)
    return {
      name,
      projectCount: programProjects.length,
      totalBudget: programProjects.reduce((sum, p) => sum + p.totalBudget, 0),
      totalSpend: programProjects.reduce((sum, p) => sum + p.actualSpend, 0),
      avgCompliance: programProjects.length > 0 ? programProjects.reduce((sum, p) => sum + calculateComplianceScore(p.nistRmfScore, p.complianceFlags, p.auditFindings), 0) / programProjects.length : 0,
      riskDistribution: {
        red: programProjects.filter(p => p.riskLevel === "Red").length,
        orange: programProjects.filter(p => p.riskLevel === "Orange").length,
        yellow: programProjects.filter(p => p.riskLevel === "Yellow").length,
        green: programProjects.filter(p => p.riskLevel === "Green").length,
      },
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // NAVIGATION MODULES CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════════

  const navigationModules: NavigationModule[] = [
    {
      id: "projects",
      label: "Project Portfolio",
      icon: Layers,
      description: "Active grants, contracts, and task orders",
      category: "operations",
      alertCount: criticalProjects,
      status: criticalProjects > 0 ? "critical" : atRiskProjects > 0 ? "warning" : "healthy",
    },
    {
      id: "alerts",
      label: "Risk Alerts",
      icon: AlertTriangle,
      description: "Flagged items requiring attention",
      category: "operations",
      alertCount: criticalProjects + atRiskProjects,
      status: criticalProjects > 0 ? "critical" : atRiskProjects > 0 ? "warning" : "healthy",
    },
    {
      id: "analytics",
      label: "Analytics & Insights",
      icon: BarChart3,
      description: "Burn rate analysis and forecasting",
      category: "analytics",
      alertCount: projects.filter(p => p.burnRate > 1.1).length,
      status: projects.filter(p => p.burnRate > 1.1).length > 3 ? "warning" : "healthy",
    },
    {
      id: "compliance",
      label: "Compliance Tracker",
      icon: Shield,
      description: "NIST-800-53 scoring and audit status",
      category: "compliance",
      alertCount: projects.filter(p => p.complianceFlags > 2).length,
      status: projects.filter(p => p.nistRmfScore < 0.6).length > 0 ? "critical" : projects.filter(p => p.complianceFlags > 2).length > 0 ? "warning" : "healthy",
    },
    {
      id: "programs",
      label: "Program Intelligence",
      icon: Target,
      description: "Cross-project program analytics",
      category: "analytics",
      alertCount: 0,
      status: "healthy",
    },
    {
      id: "contractors",
      label: "Contractor Performance",
      icon: Building2,
      description: "Vendor metrics and risk ratings",
      category: "management",
      alertCount: contractorMetrics.filter(c => c.riskRating === "High").length,
      status: contractorMetrics.filter(c => c.riskRating === "High").length > 0 ? "warning" : "healthy",
    },
    {
      id: "audit",
      label: "Audit Queue",
      icon: FileCheck,
      description: "Pending reviews and findings",
      category: "compliance",
      alertCount: projects.filter(p => p.auditFindings > 0).length,
      status: projects.filter(p => p.auditFindings > 2).length > 0 ? "critical" : projects.filter(p => p.auditFindings > 0).length > 0 ? "warning" : "healthy",
    },
  ]

  const riskColorMap = {
    Red: "bg-red-50 border-red-200 text-red-700",
    Orange: "bg-amber-50 border-amber-200 text-amber-700",
    Yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    Green: "bg-emerald-50 border-emerald-200 text-emerald-700",
  }

  const riskDotMap = {
    Red: "bg-red-500",
    Orange: "bg-amber-500",
    Yellow: "bg-yellow-500",
    Green: "bg-emerald-500",
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const renderProjectsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.sort((a, b) => b.priorityScore - a.priorityScore).map(project => (
        <div
          key={project.id}
          onClick={() => setSelectedProject(project)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${riskColorMap[project.riskLevel]}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs text-gray-500 font-mono">{project.id}</div>
              <div className="font-semibold text-gray-900 mt-0.5">{project.name}</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${riskDotMap[project.riskLevel]} animate-pulse`} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="text-gray-600">{project.agency} / {project.contractor}</div>
            <div className="text-right text-gray-600">{project.program}</div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/60 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500">Burn</div>
              <div className={`font-mono text-sm ${project.burnRate > 1.1 ? "text-red-600" : project.burnRate < 0.8 ? "text-amber-600" : "text-emerald-600"}`}>
                {(project.burnRate * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-white/60 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500">NIST</div>
              <div className={`font-mono text-sm ${project.nistRmfScore < 0.7 ? "text-red-600" : project.nistRmfScore < 0.85 ? "text-amber-600" : "text-emerald-600"}`}>
                {(project.nistRmfScore * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-white/60 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500">SLA</div>
              <div className={`font-mono text-sm ${project.slaRemaining < 30 ? "text-red-600" : project.slaRemaining < 90 ? "text-amber-600" : "text-gray-700"}`}>
                {project.slaRemaining}d
              </div>
            </div>
            <div className="bg-white/60 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500">Flags</div>
              <div className={`font-mono text-sm ${project.complianceFlags > 3 ? "text-red-600" : project.complianceFlags > 1 ? "text-amber-600" : "text-gray-700"}`}>
                {project.complianceFlags}
              </div>
            </div>
          </div>

          {project.riskTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {project.riskTags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-white/80 text-gray-600 rounded border border-gray-200">{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderAlertsView = () => {
    const sortedByRisk = [...projects].sort((a, b) => {
      const order = { Red: 0, Orange: 1, Yellow: 2, Green: 3 }
      return order[a.riskLevel] - order[b.riskLevel]
    })

    return (
      <div className="space-y-2">
        {sortedByRisk.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all hover:shadow-sm ${riskColorMap[project.riskLevel]}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${riskDotMap[project.riskLevel]}`} />
              <div>
                <div className="font-medium text-gray-900">{project.name}</div>
                <div className="text-xs text-gray-500">{project.id} / {project.agency} / {project.contractor}</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-xs text-gray-500">Priority</div>
                <div className="font-mono text-gray-800">{(project.priorityScore * 100).toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">SLA</div>
                <div className={`font-mono ${project.slaRemaining < 30 ? "text-red-600" : "text-gray-800"}`}>{project.slaRemaining}d</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Burn</div>
                <div className={`font-mono ${project.burnRate > 1.1 ? "text-red-600" : "text-gray-800"}`}>{(project.burnRate * 100).toFixed(0)}%</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Layers className="w-4 h-4" />
            Total Projects
          </div>
          <div className="text-3xl font-semibold text-gray-900">{projects.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            Total Budget
          </div>
          <div className="text-3xl font-semibold text-gray-900">{formatCurrency(totalBudget)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            Total Spend
          </div>
          <div className="text-3xl font-semibold text-blue-600">{formatCurrency(totalSpend)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Shield className="w-4 h-4" />
            Avg Compliance
          </div>
          <div className={`text-3xl font-semibold ${avgCompliance < 0.7 ? "text-red-600" : avgCompliance < 0.85 ? "text-amber-600" : "text-emerald-600"}`}>
            {formatPercent(avgCompliance)}
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
        <div className="flex items-end gap-3 h-40">
          {[
            { label: "Critical", count: projects.filter(p => p.riskLevel === "Red").length, color: "bg-red-500" },
            { label: "At Risk", count: projects.filter(p => p.riskLevel === "Orange").length, color: "bg-amber-500" },
            { label: "Monitor", count: projects.filter(p => p.riskLevel === "Yellow").length, color: "bg-yellow-500" },
            { label: "Stable", count: projects.filter(p => p.riskLevel === "Green").length, color: "bg-emerald-500" },
          ].map(item => (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full ${item.color} rounded-t transition-all duration-500`}
                style={{ height: `${Math.max(8, (item.count / projects.length) * 100)}%` }}
              />
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="font-mono text-gray-800 font-semibold">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Burn Rate Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 text-sm mb-1 font-medium">Over-Expenditure</div>
          <div className="text-3xl font-semibold text-red-600">{projects.filter(p => p.burnRate > 1.1).length}</div>
          <div className="text-xs text-red-500 mt-1">{"Burn Rate > 110%"}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-amber-700 text-sm mb-1 font-medium">Under-Utilization</div>
          <div className="text-3xl font-semibold text-amber-600">{projects.filter(p => p.burnRate < 0.8).length}</div>
          <div className="text-xs text-amber-500 mt-1">{"Burn Rate < 80%"}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="text-emerald-700 text-sm mb-1 font-medium">On Track</div>
          <div className="text-3xl font-semibold text-emerald-600">{projects.filter(p => p.burnRate >= 0.8 && p.burnRate <= 1.1).length}</div>
          <div className="text-xs text-emerald-500 mt-1">{"80% <= Burn <= 110%"}</div>
        </div>
      </div>

      {/* Forecasting */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Forecasted Expenditure</h3>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm text-gray-500 mb-1">Projected Total Spend</div>
            <div className="text-3xl font-semibold text-gray-900">{formatCurrency(projects.reduce((sum, p) => sum + p.forecastedTotalSpend, 0))}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Budget Variance</div>
            <div className={`text-3xl font-semibold ${projects.reduce((sum, p) => sum + p.forecastedTotalSpend, 0) > totalBudget ? "text-red-600" : "text-emerald-600"}`}>
              {formatCurrency(Math.abs(projects.reduce((sum, p) => sum + p.forecastedTotalSpend, 0) - totalBudget))}
              <span className="text-lg ml-2 font-normal">{projects.reduce((sum, p) => sum + p.forecastedTotalSpend, 0) > totalBudget ? "over" : "under"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderComplianceView = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">NIST-800-53 Compliance Model</span>
        </div>
        <div className="text-sm text-blue-700 font-mono">
          Score = (NIST RMF x 0.60) + (40% Base) - (Flags x 0.05) - (Findings x 0.08)
        </div>
      </div>

      {projects
        .sort((a, b) => calculateComplianceScore(a.nistRmfScore, a.complianceFlags, a.auditFindings) - calculateComplianceScore(b.nistRmfScore, b.complianceFlags, b.auditFindings))
        .map(project => {
          const score = calculateComplianceScore(project.nistRmfScore, project.complianceFlags, project.auditFindings)
          return (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-xs text-gray-500">{project.id} / {project.complianceStage}</div>
                </div>
                <div className={`text-2xl font-semibold ${score < 0.6 ? "text-red-600" : score < 0.75 ? "text-amber-600" : "text-emerald-600"}`}>
                  {formatPercent(score)}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500">NIST RMF</div>
                  <div className="font-mono text-gray-700">{formatPercent(project.nistRmfScore)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Flags</div>
                  <div className={`font-mono ${project.complianceFlags > 3 ? "text-red-600" : "text-gray-700"}`}>{project.complianceFlags}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Audit Findings</div>
                  <div className={`font-mono ${project.auditFindings > 2 ? "text-red-600" : "text-gray-700"}`}>{project.auditFindings}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Next Audit</div>
                  <div className="font-mono text-gray-700">{project.nextAuditDue}</div>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${score < 0.6 ? "bg-red-500" : score < 0.75 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          )
        })}
    </div>
  )

  const renderProgramsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {programMetrics.map(program => (
        <div key={program.name} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-800">{program.name}</span>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{program.projectCount} projects</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Total Budget</div>
              <div className="font-semibold text-lg text-gray-900">{formatCurrency(program.totalBudget)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Spend</div>
              <div className="font-semibold text-lg text-blue-600">{formatCurrency(program.totalSpend)}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Avg Compliance</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${program.avgCompliance < 0.6 ? "bg-red-500" : program.avgCompliance < 0.75 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${program.avgCompliance * 100}%` }}
                />
              </div>
              <span className="font-mono text-sm text-gray-700">{formatPercent(program.avgCompliance)}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">Risk Distribution</div>
            <div className="flex gap-2">
              {program.riskDistribution.red > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded text-xs text-red-600 border border-red-200">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  {program.riskDistribution.red}
                </div>
              )}
              {program.riskDistribution.orange > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded text-xs text-amber-600 border border-amber-200">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  {program.riskDistribution.orange}
                </div>
              )}
              {program.riskDistribution.yellow > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-600 border border-yellow-200">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  {program.riskDistribution.yellow}
                </div>
              )}
              {program.riskDistribution.green > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded text-xs text-emerald-600 border border-emerald-200">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {program.riskDistribution.green}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderContractorsView = () => (
    <div className="space-y-3">
      {contractorMetrics.sort((a, b) => b.avgComplianceScore - a.avgComplianceScore).map(contractor => (
        <div key={contractor.name} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-semibold text-gray-800">{contractor.name}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              contractor.riskRating === "High" ? "bg-red-100 text-red-700 border border-red-200" :
              contractor.riskRating === "Medium" ? "bg-amber-100 text-amber-700 border border-amber-200" :
              "bg-emerald-100 text-emerald-700 border border-emerald-200"
            }`}>
              {contractor.riskRating} Risk
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">Active Projects</div>
              <div className="font-semibold text-gray-800">{contractor.activeProjects}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Avg Compliance</div>
              <div className={`font-semibold ${contractor.avgComplianceScore < 0.7 ? "text-red-600" : contractor.avgComplianceScore < 0.85 ? "text-amber-600" : "text-emerald-600"}`}>
                {formatPercent(contractor.avgComplianceScore)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Incident Rate</div>
              <div className={`font-semibold ${contractor.incidentRate > 1.5 ? "text-red-600" : "text-gray-800"}`}>{contractor.incidentRate.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Budget Managed</div>
              <div className="font-semibold text-gray-800">{formatCurrency(contractor.totalBudgetManaged)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Delivery Efficiency</div>
              <div className={`font-semibold ${contractor.deliveryEfficiency < 0.7 ? "text-red-600" : "text-emerald-600"}`}>
                {formatPercent(contractor.deliveryEfficiency)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderAuditView = () => {
    const auditQueue = projects.filter(p => p.auditFindings > 0 || p.complianceStage === "Final Audit")
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Audit Queue</span>
            </div>
            <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{auditQueue.length} items pending review</span>
          </div>
        </div>

        {auditQueue.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-gray-900">{project.name}</div>
                <div className="text-xs text-gray-500">{project.id} / {project.agency}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.auditFindings > 2 ? "bg-red-100 text-red-700 border border-red-200" :
                project.auditFindings > 0 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                "bg-gray-100 text-gray-600 border border-gray-200"
              }`}>
                {project.auditFindings} findings
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500">Stage</div>
                <div className="text-gray-700">{project.complianceStage}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Last Audit</div>
                <div className="font-mono text-gray-700">{project.lastAuditDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Next Due</div>
                <div className="font-mono text-gray-700">{project.nextAuditDue}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">NIST Score</div>
                <div className={`font-mono ${project.nistRmfScore < 0.7 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatPercent(project.nistRmfScore)}
                </div>
              </div>
            </div>
            {project.auditHistory.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Recent Audit Events</div>
                <div className="space-y-1">
                  {project.auditHistory.slice(-2).map((event, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {event.severity === "critical" ? <XCircle className="w-3 h-3 text-red-500" /> :
                       event.severity === "warning" ? <AlertCircle className="w-3 h-3 text-amber-500" /> :
                       <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      <span className="text-gray-400">{event.date}</span>
                      <span className="text-gray-600">{event.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderDetailPanel = () => {
    if (!selectedProject) return null
    const compScore = calculateComplianceScore(selectedProject.nistRmfScore, selectedProject.complianceFlags, selectedProject.auditFindings)
    
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
            <div>
              <div className="text-xs text-gray-500 font-mono">{selectedProject.id}</div>
              <div className="text-xl font-semibold text-gray-900">{selectedProject.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {selectedProject.agency} / {selectedProject.contractor} / {selectedProject.program}
              </div>
            </div>
            <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Financial Overview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Total Budget</div>
                  <div className="text-xl font-semibold text-gray-900">{formatCurrency(selectedProject.totalBudget)}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Actual Spend</div>
                  <div className="text-xl font-semibold text-blue-600">{formatCurrency(selectedProject.actualSpend)}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Forecasted Total</div>
                  <div className={`text-xl font-semibold ${selectedProject.forecastedTotalSpend > selectedProject.totalBudget ? "text-red-600" : "text-gray-900"}`}>
                    {formatCurrency(selectedProject.forecastedTotalSpend)}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Burn Rate</div>
                  <div className={`text-xl font-semibold ${selectedProject.burnRate > 1.1 ? "text-red-600" : selectedProject.burnRate < 0.8 ? "text-amber-600" : "text-emerald-600"}`}>
                    {(selectedProject.burnRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                Formula: Spend_Actual / (Budget x (Days_Elapsed / Days_Total)) = {selectedProject.burnRate.toFixed(3)}
              </div>
            </div>

            {/* Compliance Overview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Compliance Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Compliance Score</div>
                  <div className={`text-xl font-semibold ${compScore < 0.6 ? "text-red-600" : compScore < 0.75 ? "text-amber-600" : "text-emerald-600"}`}>
                    {formatPercent(compScore)}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">NIST RMF Score</div>
                  <div className="text-xl font-semibold text-gray-900">{formatPercent(selectedProject.nistRmfScore)}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Compliance Flags</div>
                  <div className={`text-xl font-semibold ${selectedProject.complianceFlags > 3 ? "text-red-600" : "text-gray-900"}`}>
                    {selectedProject.complianceFlags}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Audit Findings</div>
                  <div className={`text-xl font-semibold ${selectedProject.auditFindings > 2 ? "text-red-600" : "text-gray-900"}`}>
                    {selectedProject.auditFindings}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${compScore < 0.6 ? "bg-red-500" : compScore < 0.75 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${compScore * 100}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Stage: {selectedProject.complianceStage} / Next Audit: {selectedProject.nextAuditDue}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Days Elapsed</div>
                  <div className="text-xl font-semibold text-gray-900">{Math.floor(selectedProject.daysElapsed)}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Days Remaining</div>
                  <div className={`text-xl font-semibold ${selectedProject.daysRemaining < 30 ? "text-red-600" : "text-gray-900"}`}>
                    {selectedProject.daysRemaining}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Time Used</div>
                  <div className="text-xl font-semibold text-gray-900">{selectedProject.percentTimeUsed.toFixed(1)}%</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Lifecycle Phase</div>
                  <div className="text-lg font-medium text-gray-900">{selectedProject.lifecyclePhase}</div>
                </div>
              </div>
            </div>

            {/* Risk & Alerts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk & Alerts
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${riskColorMap[selectedProject.riskLevel]}`}>
                  {selectedProject.riskLevel} Risk
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedProject.slaRiskLevel === "High" ? "bg-red-50 text-red-700 border border-red-200" :
                  selectedProject.slaRiskLevel === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  "bg-gray-100 text-gray-600 border border-gray-200"
                }`}>
                  SLA: {selectedProject.slaRiskLevel}
                </div>
                {selectedProject.escalationStatus && (
                  <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Escalated
                  </div>
                )}
              </div>
              {selectedProject.riskTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedProject.riskTags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded border border-gray-200">{tag}</span>
                  ))}
                </div>
              )}
              <div className="mt-3 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                Priority Score: {(calculatePriorityScore(selectedProject.riskLevel, compScore, selectedProject.burnRate) * 100).toFixed(0)} = (RiskLevel x 0.4) + (ComplianceBreach x 0.3) + (BudgetVariance x 0.3)
              </div>
            </div>

            {/* Audit History */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Audit History
              </h3>
              <div className="space-y-2">
                {selectedProject.auditHistory.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {event.severity === "critical" ? <XCircle className="w-4 h-4 text-red-500" /> :
                     event.severity === "warning" ? <AlertCircle className="w-4 h-4 text-amber-500" /> :
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    <span className="text-xs text-gray-400 font-mono">{event.date}</span>
                    <span className="text-sm text-gray-700">{event.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync to Database"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium">
                <Flag className="w-4 h-4" />
                Flag for Audit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium">
                <ArrowUpRight className="w-4 h-4" />
                Escalate
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CENTRAL HUB NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════════

  const renderCentralHub = () => {
    const categories = {
      operations: { label: "Operations", color: "blue" },
      compliance: { label: "Compliance & Audit", color: "emerald" },
      analytics: { label: "Analytics & Intelligence", color: "purple" },
      management: { label: "Management", color: "amber" },
    }

    const getCategoryModules = (category: string) => 
      navigationModules.filter(m => m.category === category)

    return (
      <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center p-8">
        {/* Central Hub Diagram */}
        <div className="relative w-full max-w-5xl">
          {/* Center Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white">
              <Database className="w-10 h-10 text-white mb-1" />
              <span className="text-white font-semibold text-sm">Data</span>
              <span className="text-white/80 text-xs">Warehouse</span>
            </div>
          </div>

          {/* Connection Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600">
            {/* Lines from center to each quadrant */}
            <line x1="400" y1="300" x2="150" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="400" y1="300" x2="650" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="400" y1="300" x2="150" y2="480" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="400" y1="300" x2="650" y2="480" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Operations - Top Left */}
          <div className="absolute top-0 left-0 w-[45%]">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-800">Operations</h3>
              </div>
              <div className="space-y-2">
                {getCategoryModules("operations").map(mod => {
                  const Icon = mod.icon
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveView(mod.id)}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        mod.status === "critical" ? "bg-red-100 text-red-600" :
                        mod.status === "warning" ? "bg-amber-100 text-amber-600" :
                        "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800 text-sm">{mod.label}</div>
                        <div className="text-xs text-gray-500">{mod.description}</div>
                      </div>
                      {mod.alertCount > 0 && (
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          mod.status === "critical" ? "bg-red-500 text-white" :
                          mod.status === "warning" ? "bg-amber-500 text-white" :
                          "bg-gray-200 text-gray-600"
                        }`}>
                          {mod.alertCount}
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Analytics - Top Right */}
          <div className="absolute top-0 right-0 w-[45%]">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800">Analytics & Intelligence</h3>
              </div>
              <div className="space-y-2">
                {getCategoryModules("analytics").map(mod => {
                  const Icon = mod.icon
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveView(mod.id)}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-purple-100 hover:border-purple-400 hover:shadow-md transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        mod.status === "critical" ? "bg-red-100 text-red-600" :
                        mod.status === "warning" ? "bg-amber-100 text-amber-600" :
                        "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800 text-sm">{mod.label}</div>
                        <div className="text-xs text-gray-500">{mod.description}</div>
                      </div>
                      {mod.alertCount > 0 && (
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          mod.status === "critical" ? "bg-red-500 text-white" :
                          mod.status === "warning" ? "bg-amber-500 text-white" :
                          "bg-gray-200 text-gray-600"
                        }`}>
                          {mod.alertCount}
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Compliance - Bottom Left */}
          <div className="absolute bottom-0 left-0 w-[45%]">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-emerald-800">Compliance & Audit</h3>
              </div>
              <div className="space-y-2">
                {getCategoryModules("compliance").map(mod => {
                  const Icon = mod.icon
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveView(mod.id)}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 hover:shadow-md transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        mod.status === "critical" ? "bg-red-100 text-red-600" :
                        mod.status === "warning" ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800 text-sm">{mod.label}</div>
                        <div className="text-xs text-gray-500">{mod.description}</div>
                      </div>
                      {mod.alertCount > 0 && (
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          mod.status === "critical" ? "bg-red-500 text-white" :
                          mod.status === "warning" ? "bg-amber-500 text-white" :
                          "bg-gray-200 text-gray-600"
                        }`}>
                          {mod.alertCount}
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Management - Bottom Right */}
          <div className="absolute bottom-0 right-0 w-[45%]">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-amber-800">Management</h3>
              </div>
              <div className="space-y-2">
                {getCategoryModules("management").map(mod => {
                  const Icon = mod.icon
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveView(mod.id)}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-400 hover:shadow-md transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        mod.status === "critical" ? "bg-red-100 text-red-600" :
                        mod.status === "warning" ? "bg-amber-100 text-amber-600" :
                        "bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800 text-sm">{mod.label}</div>
                        <div className="text-xs text-gray-500">{mod.description}</div>
                      </div>
                      {mod.alertCount > 0 && (
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          mod.status === "critical" ? "bg-red-500 text-white" :
                          mod.status === "warning" ? "bg-amber-500 text-white" :
                          "bg-gray-200 text-gray-600"
                        }`}>
                          {mod.alertCount}
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Spacer for layout */}
          <div className="h-[600px]" />
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 tracking-tight">SENTINEL</div>
                  <div className="text-xs text-gray-500">Federal Grant Compliance & Data Warehouse</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-gray-500">Critical:</span>
                  <span className="font-semibold text-red-600">{criticalProjects}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-gray-500">At Risk:</span>
                  <span className="font-semibold text-amber-600">{atRiskProjects}</span>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(totalBudget)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Compliance:</span>
                  <span className={`font-semibold ${avgCompliance < 0.7 ? "text-red-600" : avgCompliance < 0.85 ? "text-amber-600" : "text-emerald-600"}`}>
                    {formatPercent(avgCompliance)}
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-200" />

              {/* System Status */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Operational</span>
                </div>
                <div className="text-gray-400">
                  Sync: {lastSync.toLocaleTimeString()}
                </div>
                <div className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {systemTime.toLocaleTimeString()} EST
                </div>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing" : "Sync"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeView === null ? (
          renderCentralHub()
        ) : (
          <div className="p-6">
            {/* Breadcrumb / Back Button */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveView(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700 font-medium shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Hub
                </button>
                <div className="h-6 w-px bg-gray-200" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigationModules.find(n => n.id === activeView)?.label || "Dashboard"}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>

            {/* View Content */}
            {activeView === "projects" && renderProjectsView()}
            {activeView === "alerts" && renderAlertsView()}
            {activeView === "analytics" && renderAnalyticsView()}
            {activeView === "compliance" && renderComplianceView()}
            {activeView === "programs" && renderProgramsView()}
            {activeView === "contractors" && renderContractorsView()}
            {activeView === "audit" && renderAuditView()}
          </div>
        )}
      </main>

      {/* Detail Panel Modal */}
      {renderDetailPanel()}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">SENTINEL v2.4.1</span>
            <span className="text-gray-300">|</span>
            <span>NIST 800-53 Rev. 5 Compliant</span>
            <span className="text-gray-300">|</span>
            <span>FedRAMP Authorized</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Classification: UNCLASSIFIED // FOUO</span>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-600 font-medium">Session Active</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
