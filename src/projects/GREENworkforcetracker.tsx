import { useState, useEffect, useMemo } from "react"
import {
  Leaf,
  Droplets,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Activity,
  Layers,
  TreeDeciduous,
  Sprout,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Award,
  BarChart3,
  PieChart,
  ChevronRight,
  ChevronDown,
  Building2,
  ClipboardCheck,
  Globe,
  Waves,
  Mountain,
  CloudRain,
  Home,
  Settings,
  HelpCircle,
  Filter,
  Search,
  Download,
  Linkedin,
  Youtube,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

// ============================================================================
// TYPE DEFINITIONS - CIVIC ENVIRONMENTAL WORKFORCE DATA MODEL
// ============================================================================

interface WorkforceParticipant {
  id: string
  name: string
  enrollmentDate: Date
  pathway: "horticulture" | "hydrology" | "restoration" | "infrastructure" | "conservation"
  trainingStage: number
  certifications: string[]
  skillLevel: number
  jobReadinessIndex: number
  retentionProbability: number
  crossProgramDensity: number
  engagementScore: number
  civicImpactScore: number
  hoursCompleted: number
  placementStatus: "training" | "placed" | "searching" | "graduated"
  cohortId: string
  department: string
}

interface GreenProgram {
  id: string
  name: string
  fundingSource: string
  curriculumComplexity: number
  cohortCapacity: number
  currentEnrollment: number
  completionRate: number
  placementSuccessRate: number
  integrationScore: number
  budgetAllocated: number
  budgetSpent: number
  startDate: Date
  endDate: Date
}

interface EcologicalSite {
  id: string
  name: string
  designation: string
  typology: "wetland" | "rain-garden" | "urban-canopy" | "shoreline" | "meadow"
  soilRecoveryIndex: number
  hydrologicalCapacity: number
  biodiversityIndex: number
  vegetationDensity: number
  climateResilienceScore: number
  acreage: number
  restorationPhase: number
  workforceDeployed: number
  tasksCompleted: number
  tasksPending: number
  lastAssessmentDate: Date
  location: { lat: number; lng: number }
}

interface Grant {
  id: string
  name: string
  source: string
  totalAmount: number
  disbursed: number
  remaining: number
  lifecycleStage: "application" | "awarded" | "active" | "reporting" | "closeout"
  complianceScore: number
  reportingCadence: "monthly" | "quarterly" | "annual"
  nextDeadline: Date
  deliverables: number
  deliverablesComplete: number
  auditReadiness: number
}

interface DeploymentTask {
  id: string
  siteId: string
  siteName: string
  classification: "planting" | "soil-remediation" | "infrastructure" | "monitoring" | "maintenance"
  assignedParticipants: number
  durationDays: number
  completionPercent: number
  ecologicalImpact: number
  dependencies: string[]
  seasonalConstraint: string | null
}

interface EnvironmentalImpact {
  metric: string
  baseline: number
  current: number
  projected: number
  unit: string
  trend: "improving" | "stable" | "declining"
}

interface ProgramIntegration {
  fromProgram: string
  toProgram: string
  participantFlow: number
  skillTransferRate: number
  synergyScore: number
}

// ============================================================================
// DATA GENERATION ENGINES
// ============================================================================

const PARTICIPANT_NAMES = [
  "Marcus Johnson", "Aisha Williams", "Carlos Rivera", "Destiny Brown",
  "Jamal Thompson", "Keisha Davis", "Miguel Santos", "Tamara Wilson",
  "Devon Harris", "Aaliyah Jackson", "Rashid Ahmed", "Brianna Moore",
  "Tyrone Clark", "Jasmine Lewis", "Andre Robinson", "Crystal Martinez",
  "Darnell White", "Latoya Green", "Isaiah Young", "Monique Allen",
  "Brandon King", "Shaniqua Scott", "Jerome Wright", "Tiffany Hill",
  "Malik Turner", "Danielle Adams", "Terrell Baker", "Keyana Nelson",
  "Dwayne Carter", "Shanice Mitchell", "Lamar Phillips", "Ebony Campbell",
]

const PATHWAYS: WorkforceParticipant["pathway"][] = [
  "horticulture", "hydrology", "restoration", "infrastructure", "conservation"
]

const DEPARTMENTS = ["Wetland Ops", "Urban Forestry", "Stormwater", "Habitat", "Community"]

const CERTIFICATIONS = [
  "Stormwater Management Basics",
  "Native Plant Identification",
  "Soil Health Assessment",
  "Rain Garden Installation",
  "Wetland Ecology Fundamentals",
  "Urban Forestry Practices",
  "Water Quality Monitoring",
  "Erosion Control Techniques",
  "Pollinator Habitat Design",
  "Green Infrastructure Maintenance",
  "OSHA Safety Certification",
  "CPR/First Aid",
]

const PROGRAM_NAMES = [
  { name: "Kingman Island Restoration Corps", source: "DOEE Environmental Grant" },
  { name: "Urban Canopy Training Initiative", source: "EPA Urban Waters" },
  { name: "Stormwater Stewards Program", source: "DC Water Partnership" },
  { name: "Green Jobs Accelerator", source: "Workforce Investment Board" },
  { name: "Eco-Ambassadors Youth Program", source: "Foundation Grant" },
  { name: "Rain Garden Installation Cohort", source: "DOEE Green Infrastructure" },
]

const SITE_DATA = [
  { name: "Kingman Island Wetland", designation: "Anacostia Watershed", typology: "wetland" as const, acreage: 45, lat: 38.89, lng: -76.97 },
  { name: "Kenilworth Rain Gardens", designation: "DOEE Demo Site", typology: "rain-garden" as const, acreage: 3.2, lat: 38.91, lng: -76.94 },
  { name: "Anacostia Riverwalk", designation: "Urban Forestry", typology: "urban-canopy" as const, acreage: 12, lat: 38.87, lng: -76.99 },
  { name: "Bladensburg Shoreline", designation: "Erosion Control", typology: "shoreline" as const, acreage: 8.5, lat: 38.93, lng: -76.93 },
  { name: "Capitol Hill Meadow", designation: "Community Space", typology: "meadow" as const, acreage: 2.1, lat: 38.88, lng: -77.00 },
  { name: "Marvin Gaye Park", designation: "Park Partnership", typology: "urban-canopy" as const, acreage: 18, lat: 38.90, lng: -76.95 },
  { name: "Watts Branch Buffer", designation: "Stream Restoration", typology: "wetland" as const, acreage: 6.3, lat: 38.92, lng: -76.96 },
  { name: "Langston Golf Rain Capture", designation: "Green Infra Pilot", typology: "rain-garden" as const, acreage: 4.7, lat: 38.89, lng: -76.98 },
]

const GRANT_SOURCES = [
  "DOEE Environmental Quality",
  "EPA Urban Waters Federal Partnership",
  "DC Water Stormwater Program",
  "National Fish & Wildlife Foundation",
  "Chesapeake Bay Trust",
  "Meyer Foundation",
  "Morris & Gwendolyn Cafritz Foundation",
]

function generateParticipants(): WorkforceParticipant[] {
  return PARTICIPANT_NAMES.map((name, idx) => {
    const enrollDate = new Date()
    enrollDate.setMonth(enrollDate.getMonth() - Math.floor(Math.random() * 12) - 1)
    const pathway = PATHWAYS[idx % PATHWAYS.length]
    const trainingStage = Math.floor(Math.random() * 5) + 1
    const numCerts = Math.floor(Math.random() * 4) + 1
    const certs = CERTIFICATIONS.slice(0, numCerts).sort(() => Math.random() - 0.5)

    return {
      id: `PART-${String(idx + 1).padStart(4, "0")}`,
      name,
      enrollmentDate: enrollDate,
      pathway,
      trainingStage,
      certifications: certs,
      skillLevel: Math.random() * 0.5 + trainingStage * 0.1,
      jobReadinessIndex: trainingStage >= 4 ? Math.random() * 0.3 + 0.6 : Math.random() * 0.4 + 0.2,
      retentionProbability: Math.random() * 0.3 + 0.6,
      crossProgramDensity: Math.random() * 0.6,
      engagementScore: Math.random() * 0.4 + 0.5,
      civicImpactScore: Math.random() * 0.5 + trainingStage * 0.1,
      hoursCompleted: Math.floor(Math.random() * 400) + trainingStage * 80,
      placementStatus: trainingStage >= 5 ? (Math.random() > 0.3 ? "placed" : "graduated") :
        trainingStage >= 4 ? "searching" : "training",
      cohortId: `COH-${Math.floor(idx / 6) + 1}`,
      department: DEPARTMENTS[idx % DEPARTMENTS.length],
    }
  })
}

function generatePrograms(): GreenProgram[] {
  return PROGRAM_NAMES.map((prog, idx) => {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 6) - 3)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 12)
    const budget = Math.floor(Math.random() * 200000) + 75000

    return {
      id: `PROG-${String(idx + 1).padStart(3, "0")}`,
      name: prog.name,
      fundingSource: prog.source,
      curriculumComplexity: Math.random() * 0.4 + 0.5,
      cohortCapacity: Math.floor(Math.random() * 10) + 8,
      currentEnrollment: Math.floor(Math.random() * 8) + 4,
      completionRate: Math.random() * 0.25 + 0.65,
      placementSuccessRate: Math.random() * 0.3 + 0.55,
      integrationScore: Math.random() * 0.4 + 0.4,
      budgetAllocated: budget,
      budgetSpent: budget * (Math.random() * 0.4 + 0.3),
      startDate,
      endDate,
    }
  })
}

function generateSites(): EcologicalSite[] {
  return SITE_DATA.map((site, idx) => {
    const assessmentDate = new Date()
    assessmentDate.setDate(assessmentDate.getDate() - Math.floor(Math.random() * 30))

    return {
      id: `SITE-${String(idx + 1).padStart(3, "0")}`,
      name: site.name,
      designation: site.designation,
      typology: site.typology,
      soilRecoveryIndex: Math.random() * 0.5 + 0.3,
      hydrologicalCapacity: Math.random() * 0.4 + 0.4,
      biodiversityIndex: Math.random() * 0.5 + 0.25,
      vegetationDensity: Math.random() * 0.4 + 0.3,
      climateResilienceScore: Math.random() * 0.4 + 0.4,
      acreage: site.acreage,
      restorationPhase: Math.floor(Math.random() * 5) + 1,
      workforceDeployed: Math.floor(Math.random() * 8) + 2,
      tasksCompleted: Math.floor(Math.random() * 20) + 5,
      tasksPending: Math.floor(Math.random() * 15) + 3,
      lastAssessmentDate: assessmentDate,
      location: { lat: site.lat, lng: site.lng },
    }
  })
}

function generateGrants(): Grant[] {
  return GRANT_SOURCES.map((source, idx) => {
    const total = Math.floor(Math.random() * 300000) + 100000
    const disbursed = total * (Math.random() * 0.6 + 0.2)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 60) + 15)
    const deliverables = Math.floor(Math.random() * 8) + 4
    const stages: Grant["lifecycleStage"][] = ["application", "awarded", "active", "reporting", "closeout"]

    return {
      id: `GRANT-${String(idx + 1).padStart(3, "0")}`,
      name: `FY2024 ${source.split(" ").slice(0, 2).join(" ")} Award`,
      source,
      totalAmount: total,
      disbursed,
      remaining: total - disbursed,
      lifecycleStage: stages[Math.min(Math.floor(Math.random() * 3) + 1, 4)],
      complianceScore: Math.random() * 0.25 + 0.7,
      reportingCadence: ["monthly", "quarterly", "annual"][Math.floor(Math.random() * 3)] as Grant["reportingCadence"],
      nextDeadline: deadline,
      deliverables,
      deliverablesComplete: Math.floor(deliverables * (Math.random() * 0.6 + 0.2)),
      auditReadiness: Math.random() * 0.3 + 0.6,
    }
  })
}

function generateDeploymentTasks(sites: EcologicalSite[]): DeploymentTask[] {
  const classifications: DeploymentTask["classification"][] = [
    "planting", "soil-remediation", "infrastructure", "monitoring", "maintenance"
  ]
  const tasks: DeploymentTask[] = []

  sites.forEach((site, sIdx) => {
    const numTasks = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < numTasks; i++) {
      tasks.push({
        id: `TASK-${String(sIdx * 10 + i + 1).padStart(4, "0")}`,
        siteId: site.id,
        siteName: site.name,
        classification: classifications[Math.floor(Math.random() * classifications.length)],
        assignedParticipants: Math.floor(Math.random() * 5) + 2,
        durationDays: Math.floor(Math.random() * 14) + 3,
        completionPercent: Math.random() * 0.8 + 0.1,
        ecologicalImpact: Math.random() * 0.5 + 0.3,
        dependencies: [],
        seasonalConstraint: Math.random() > 0.6 ? ["Spring planting window", "Fall seeding period", "Summer maintenance"][Math.floor(Math.random() * 3)] : null,
      })
    }
  })
  return tasks
}

function generateEnvironmentalImpacts(): EnvironmentalImpact[] {
  return [
    { metric: "Stormwater Retention", baseline: 12500, current: 18200, projected: 24000, unit: "gal/acre/yr", trend: "improving" },
    { metric: "Native Species Count", baseline: 45, current: 68, projected: 95, unit: "species", trend: "improving" },
    { metric: "Heat Island Reduction", baseline: 0, current: 2.3, projected: 4.1, unit: "deg F", trend: "improving" },
    { metric: "Carbon Sequestration", baseline: 8.2, current: 14.7, projected: 22.5, unit: "tons CO2/yr", trend: "improving" },
    { metric: "Soil Permeability", baseline: 0.32, current: 0.48, projected: 0.65, unit: "index", trend: "improving" },
    { metric: "Pollinator Habitat", baseline: 2.1, current: 5.8, projected: 12.4, unit: "acres", trend: "improving" },
    { metric: "Runoff Pollution", baseline: 85, current: 62, projected: 38, unit: "lbs/acre/yr", trend: "improving" },
  ]
}

function generateProgramIntegrations(programs: GreenProgram[]): ProgramIntegration[] {
  const integrations: ProgramIntegration[] = []
  for (let i = 0; i < programs.length; i++) {
    for (let j = i + 1; j < programs.length; j++) {
      if (Math.random() > 0.4) {
        integrations.push({
          fromProgram: programs[i].name,
          toProgram: programs[j].name,
          participantFlow: Math.floor(Math.random() * 8) + 1,
          skillTransferRate: Math.random() * 0.4 + 0.4,
          synergyScore: Math.random() * 0.5 + 0.4,
        })
      }
    }
  }
  return integrations
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
  return value.toFixed(0)
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

// ============================================================================
// SIDEBAR NAVIGATION COMPONENT
// ============================================================================

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
        active
          ? "bg-white text-green-800 shadow-md"
          : "text-green-900/70 hover:bg-white/50 hover:text-green-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// ============================================================================
// KPI CARD COMPONENT (Training Dashboard Style)
// ============================================================================

interface KpiCardProps {
  value: string | number
  label: string
  sublabel?: string
}

function KpiCard({ value, label, sublabel }: KpiCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-lg border border-green-200">
      <p className="text-3xl font-bold text-green-800">{value}</p>
      <p className="text-xs font-medium text-green-700 mt-1">{label}</p>
      {sublabel && <p className="text-xs text-green-600/70">{sublabel}</p>}
    </div>
  )
}

// ============================================================================
// BAR CHART COMPONENT (Green Gradient Style)
// ============================================================================

interface BarChartData {
  label: string
  value: number
}

function GreenBarChart({ data, title }: { data: BarChartData[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg border border-green-200">
      <h3 className="text-sm font-semibold text-green-900 mb-4">{title}</h3>
      <div className="flex items-end justify-between gap-3 h-48">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1">
            <span className="text-xs font-medium text-green-800 mb-1">
              {formatNumber(item.value)}
            </span>
            <div 
              className="w-full rounded-t-lg bg-gradient-to-t from-green-600 to-green-400 transition-all duration-500"
              style={{ height: `${(item.value / maxValue) * 150}px` }}
            />
            <span className="text-xs text-green-700 mt-2 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// DONUT CHART COMPONENT
// ============================================================================

interface DonutData {
  label: string
  value: number
  color: string
}

function DonutChart({ data, title }: { data: DonutData[]; title: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulativePercent = 0
  
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg border border-green-200">
      <h3 className="text-sm font-semibold text-green-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center gap-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {data.map((item, idx) => {
              const percent = (item.value / total) * 100
              const dashArray = `${percent} ${100 - percent}`
              const dashOffset = -cumulativePercent
              cumulativePercent += percent
              return (
                <circle
                  key={idx}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="3.5"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-green-800">
                {item.label} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// RADIAL PROGRESS COMPONENT
// ============================================================================

function RadialProgress({ value, label }: { value: number; label: string }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (value / 100) * circumference
  
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg border border-green-200">
      <h3 className="text-sm font-semibold text-green-900 mb-4">{label}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#greenGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-green-700">{value}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SITE MAP COMPONENT (DC Area Visualization)
// ============================================================================

function SiteMapVisualization({ sites }: { sites: EcologicalSite[] }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg border border-green-200">
      <h3 className="text-sm font-semibold text-green-900 mb-4">Site Locations - DC Region</h3>
      <div className="relative h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden border border-green-200">
        {/* Simplified DC Area Map Background */}
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            {/* Anacostia River representation */}
            <path
              d="M 50 150 Q 150 120 200 180 Q 250 240 350 200"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              opacity="0.3"
            />
            {/* Potomac representation */}
            <path
              d="M 0 100 Q 100 150 150 250 L 150 300"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="12"
              opacity="0.2"
            />
          </svg>
        </div>
        
        {/* Site markers */}
        {sites.map((site, idx) => {
          const x = 50 + (idx % 4) * 75
          const y = 50 + Math.floor(idx / 4) * 100
          return (
            <div
              key={site.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              <div className="relative">
                <div className="w-6 h-6 bg-green-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-green-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {site.name}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1 text-xs text-green-800">
          {sites.length} Active Sites
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// FILTER DROPDOWN COMPONENT
// ============================================================================

function FilterDropdown({ label, options, value, onChange }: { 
  label: string
  options: string[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-green-700 font-medium">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-green-300 rounded-lg px-3 py-2 pr-8 text-sm text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 pointer-events-none" />
      </div>
    </div>
  )
}

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================

function DataTable({ participants }: { participants: WorkforceParticipant[] }) {
  return (
    <div className="rounded-xl bg-white shadow-lg border border-green-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Participant</th>
              <th className="px-4 py-3 text-left font-semibold">Pathway</th>
              <th className="px-4 py-3 text-left font-semibold">Department</th>
              <th className="px-4 py-3 text-center font-semibold">Stage</th>
              <th className="px-4 py-3 text-center font-semibold">Readiness</th>
              <th className="px-4 py-3 text-center font-semibold">Hours</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100">
            {participants.slice(0, 8).map((p, idx) => (
              <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-green-50/50"}>
                <td className="px-4 py-3 font-medium text-green-900">{p.name}</td>
                <td className="px-4 py-3 capitalize text-green-700">{p.pathway}</td>
                <td className="px-4 py-3 text-green-700">{p.department}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                    {p.trainingStage}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        style={{ width: `${p.jobReadinessIndex * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-green-700">{formatPercent(p.jobReadinessIndex)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-green-700">{p.hoursCompleted}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.placementStatus === "placed" ? "bg-green-100 text-green-700" :
                    p.placementStatus === "searching" ? "bg-amber-100 text-amber-700" :
                    p.placementStatus === "graduated" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {p.placementStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// GRANT CARD COMPONENT
// ============================================================================

function GrantCard({ grant }: { grant: Grant }) {
  const percentUsed = (grant.disbursed / grant.totalAmount) * 100
  
  return (
    <div className="rounded-xl bg-white p-4 shadow-lg border border-green-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-green-900 text-sm">{grant.name}</h4>
          <p className="text-xs text-green-600">{grant.source}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          grant.lifecycleStage === "active" ? "bg-green-100 text-green-700" :
          grant.lifecycleStage === "reporting" ? "bg-amber-100 text-amber-700" :
          "bg-gray-100 text-gray-700"
        }`}>
          {grant.lifecycleStage}
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-700">Disbursed: {formatCurrency(grant.disbursed)}</span>
          <span className="text-green-600">Total: {formatCurrency(grant.totalAmount)}</span>
        </div>
        <div className="h-3 bg-green-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-green-600">Compliance</span>
          <p className="font-semibold text-green-800">{formatPercent(grant.complianceScore)}</p>
        </div>
        <div>
          <span className="text-green-600">Deliverables</span>
          <p className="font-semibold text-green-800">{grant.deliverablesComplete}/{grant.deliverables}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GreenWorkforceTrackerSimulation() {
  const [activeNav, setActiveNav] = useState("overview")
  const [systemTime, setSystemTime] = useState(new Date())
  const [simulationCycle, setSimulationCycle] = useState(0)

  // Filter state
  const [pathwayFilter, setPathwayFilter] = useState("All")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")

  // Core Data State
  const [participants, setParticipants] = useState<WorkforceParticipant[]>([])
  const [programs, setPrograms] = useState<GreenProgram[]>([])
  const [sites, setSites] = useState<EcologicalSite[]>([])
  const [grants, setGrants] = useState<Grant[]>([])
  const [tasks, setTasks] = useState<DeploymentTask[]>([])
  const [impacts, setImpacts] = useState<EnvironmentalImpact[]>([])
  const [integrations, setIntegrations] = useState<ProgramIntegration[]>([])

  // Derived Metrics
  const totalParticipants = participants.length
  const activeTrainees = useMemo(() =>
    participants.filter(p => p.placementStatus === "training").length, [participants])
  const placedParticipants = useMemo(() =>
    participants.filter(p => p.placementStatus === "placed").length, [participants])
  const avgJobReadiness = useMemo(() =>
    participants.length > 0
      ? participants.reduce((sum, p) => sum + p.jobReadinessIndex, 0) / participants.length
      : 0, [participants])
  const totalGrantFunding = useMemo(() =>
    grants.reduce((sum, g) => sum + g.totalAmount, 0), [grants])
  const totalHours = useMemo(() =>
    participants.reduce((sum, p) => sum + p.hoursCompleted, 0), [participants])
  const avgFeedbackScore = useMemo(() =>
    participants.length > 0
      ? (participants.reduce((sum, p) => sum + p.engagementScore, 0) / participants.length) * 10
      : 0, [participants])

  // Training status for donut chart
  const trainingStatus = useMemo(() => [
    { label: "Completed", value: placedParticipants + participants.filter(p => p.placementStatus === "graduated").length, color: "#16a34a" },
    { label: "In Progress", value: activeTrainees, color: "#22c55e" },
    { label: "Searching", value: participants.filter(p => p.placementStatus === "searching").length, color: "#86efac" },
  ], [participants, placedParticipants, activeTrainees])

  // Department costs data
  const departmentData = useMemo(() => 
    DEPARTMENTS.map(dept => ({
      label: dept,
      value: Math.floor(Math.random() * 150000) + 100000,
    })), [])

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      if (pathwayFilter !== "All" && p.pathway !== pathwayFilter.toLowerCase()) return false
      if (departmentFilter !== "All" && p.department !== departmentFilter) return false
      if (statusFilter !== "All" && p.placementStatus !== statusFilter.toLowerCase()) return false
      return true
    })
  }, [participants, pathwayFilter, departmentFilter, statusFilter])

  // Initialize simulation data
  useEffect(() => {
    const parts = generateParticipants()
    const progs = generatePrograms()
    const siteData = generateSites()
    const grantData = generateGrants()
    const taskData = generateDeploymentTasks(siteData)
    const impactData = generateEnvironmentalImpacts()
    const integrationData = generateProgramIntegrations(progs)

    setParticipants(parts)
    setPrograms(progs)
    setSites(siteData)
    setGrants(grantData)
    setTasks(taskData)
    setImpacts(impactData)
    setIntegrations(integrationData)
  }, [])

  // Real-time simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date())
      setSimulationCycle(prev => prev + 1)

      setParticipants(prev => prev.map(p => ({
        ...p,
        engagementScore: Math.max(0.3, Math.min(0.95, p.engagementScore + (Math.random() - 0.5) * 0.04)),
        skillLevel: Math.max(0.2, Math.min(1, p.skillLevel + (Math.random() - 0.45) * 0.02)),
        jobReadinessIndex: Math.max(0.1, Math.min(0.95, p.jobReadinessIndex + (Math.random() - 0.48) * 0.02)),
      })))

      setSites(prev => prev.map(s => ({
        ...s,
        soilRecoveryIndex: Math.max(0.2, Math.min(0.95, s.soilRecoveryIndex + (Math.random() - 0.45) * 0.015)),
        biodiversityIndex: Math.max(0.15, Math.min(0.9, s.biodiversityIndex + (Math.random() - 0.45) * 0.012)),
        vegetationDensity: Math.max(0.2, Math.min(0.9, s.vegetationDensity + (Math.random() - 0.45) * 0.018)),
      })))

      setGrants(prev => prev.map(g => ({
        ...g,
        disbursed: Math.min(g.totalAmount, g.disbursed + (Math.random() * g.totalAmount * 0.005)),
        remaining: Math.max(0, g.totalAmount - g.disbursed),
      })))
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { id: "overview", label: "Overview", icon: <Home className="w-4 h-4" /> },
    { id: "participants", label: "Participant Details", icon: <Users className="w-4 h-4" /> },
    { id: "programs", label: "Program Analysis", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "grants", label: "Grant Tracking", icon: <DollarSign className="w-4 h-4" /> },
    { id: "sites", label: "Site Development", icon: <MapPin className="w-4 h-4" /> },
    { id: "performance", label: "Impact Metrics", icon: <TrendingUp className="w-4 h-4" /> },
  ]

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-lime-100">
      <style>{`
@media (max-width: 640px) {
  .gwt-layout { flex-direction: column !important; }
  .gwt-sidebar { width: 100% !important; min-height: unset !important; max-height: 220px; overflow-y: auto; border-right: none !important; border-bottom: 1px solid #86efac; }
}
`}</style>
      {/* Top Header Banner */}
      <header className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white py-3 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Green Workforce Development Dashboard</h1>
              <p className="text-green-200 text-xs">Living Classrooms Foundation DC | Kingman Island Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-green-200">Cycle {simulationCycle}</span>
            </div>
            <div className="text-right">
              <p className="font-medium">{systemTime.toLocaleDateString()}</p>
              <p className="text-green-200 text-xs">{systemTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gwt-layout">
        {/* Left Sidebar */}
        <aside className="w-56 min-h-screen bg-gradient-to-b from-green-100 to-green-200 border-r border-green-300 p-4 shadow-lg gwt-sidebar">
          {/* Logo Area */}
          <div className="mb-6 p-3 bg-white rounded-xl shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-800">Living Classrooms</p>
                <p className="text-xs text-green-600">DC Foundation</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
              />
            ))}
          </nav>

          {/* Social Links */}
          <div className="mt-8 pt-6 border-t border-green-300">
            <p className="text-xs text-green-700 mb-3 font-medium">Connect With Us</p>
            <div className="flex gap-2">
              <a href="#" className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Tool Integration Status */}
          <div className="mt-6 p-3 bg-white/80 rounded-xl">
            <p className="text-xs font-medium text-green-800 mb-2">Data Sources</p>
            <div className="space-y-1">
              {["Salesforce NPSP", "VolunteerHub", "E-Grants (DOEE)", "SMART Tracking"].map(tool => (
                <div key={tool} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-green-700">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <FilterDropdown
                  label="Pathway"
                  options={["All", "Horticulture", "Hydrology", "Restoration", "Infrastructure", "Conservation"]}
                  value={pathwayFilter}
                  onChange={setPathwayFilter}
                />
                <FilterDropdown
                  label="Department"
                  options={["All", ...DEPARTMENTS]}
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                />
                <FilterDropdown
                  label="Status"
                  options={["All", "Training", "Placed", "Searching", "Graduated"]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Calendar className="w-4 h-4" />
                  <span>{systemTime.toLocaleDateString()}</span>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <KpiCard value={totalParticipants} label="Total Participants" sublabel="Active Trainees" />
            <KpiCard value={programs.length} label="Active Programs" sublabel="Funded Initiatives" />
            <KpiCard value={formatNumber(totalHours)} label="Training Hours" sublabel="Completed" />
            <KpiCard value={avgFeedbackScore.toFixed(2)} label="Avg. Engagement" sublabel="Score /10" />
            <KpiCard value={formatCurrency(totalGrantFunding)} label="Total Grant Funding" sublabel="FY2024" />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Bar Chart - Training Costs by Department */}
            <div className="col-span-1">
              <GreenBarChart data={departmentData} title="Budget by Department" />
            </div>

            {/* Site Map */}
            <div className="col-span-2">
              <SiteMapVisualization sites={sites} />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Donut Chart - Training Status */}
            <DonutChart data={trainingStatus} title="Participant Status Distribution" />

            {/* Radial Progress */}
            <RadialProgress value={Math.round(avgJobReadiness * 100)} label="Job Readiness Index" />

            {/* Program Performance */}
            <div className="rounded-xl bg-white p-5 shadow-lg border border-green-200">
              <h3 className="text-sm font-semibold text-green-900 mb-4">Top Programs</h3>
              <div className="space-y-3">
                {programs.slice(0, 4).map(prog => (
                  <div key={prog.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 truncate pr-2">{prog.name.split(" ").slice(0, 2).join(" ")}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-600 to-green-400"
                            style={{ width: `${prog.completionRate * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-green-600">{formatPercent(prog.completionRate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Participant Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-900">Participant Training Details</h2>
              <span className="text-sm text-green-600">{filteredParticipants.length} participants</span>
            </div>
            <DataTable participants={filteredParticipants} />
          </div>

          {/* Grant Cards */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-green-900 mb-4">Grant Portfolio</h2>
            <div className="grid grid-cols-3 gap-4">
              {grants.slice(0, 6).map(grant => (
                <GrantCard key={grant.id} grant={grant} />
              ))}
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-green-200">
            <h2 className="text-lg font-bold text-green-900 mb-4">Environmental Impact Metrics</h2>
            <div className="grid grid-cols-4 gap-4">
              {impacts.slice(0, 4).map((impact, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 mb-1">{impact.metric}</p>
                  <p className="text-2xl font-bold text-green-800">{formatNumber(impact.current)}</p>
                  <p className="text-xs text-green-500">{impact.unit}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {((impact.current - impact.baseline) / impact.baseline * 100).toFixed(0)}% from baseline
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
    {/* === PROJECT FOOTER === */}
    <div style={{background:"#0f172a",color:"#94a3b8",fontSize:"11px",padding:"18px 32px",borderTop:"2px solid #1e293b",fontFamily:"monospace",lineHeight:1.7}}>
      <div style={{marginBottom:6,color:"#e2e8f0",fontWeight:700,fontSize:13,letterSpacing:1}}>PROJECT FOOTNOTE</div>
      <div><strong style={{color:"#f1f5f9"}}>Stack:</strong> React · TypeScript · Tailwind CSS · Radix UI Progress — standalone simulation, no backend</div>
      <div><strong style={{color:"#f1f5f9"}}>Methods:</strong> Green workforce pathway tracking · Job readiness index modeling · Ecological site recovery metrics · Grant disbursement tracking · Cross-program integration scoring · Participant retention forecasting</div>
      <div><strong style={{color:"#f1f5f9"}}>Sources:</strong> Workforce development metrics modeled from Living Classrooms Foundation / DC DOEE / AmeriCorps program frameworks; ecological restoration data based on Kingman Island Ecological Area plans; all data procedurally generated — no real participant data</div>
    </div>
    </>
  )
}
