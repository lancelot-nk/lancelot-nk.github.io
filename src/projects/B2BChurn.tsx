import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Building2,
  DollarSign,
  Activity,
  Calendar,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Phone,
  Mail,
  Video,
  AlertCircle,
  Zap,
  Shield,
  RefreshCw,
  ChevronRight,
  Layers,
  PieChart,
  LineChart,
  Settings,
  Database,
  Cpu,
  Globe,
  Truck,
  Camera,
  Signal,
  MapPin,
  Gauge,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================================================
// TYPE DEFINITIONS - ENTERPRISE SALES OPERATIONS DATA MODEL
// ============================================================================

interface SalesRep {
  id: string
  name: string
  territory: string
  accountPortfolioSize: number
  avgDealSize: number
  conversionRate: number
  renewalSuccessRate: number
  engagementFrequency: number
  pipelineVelocity: number
  quotaAttainment: number
  activityIndex: number
  calls: number
  emails: number
  meetings: number
  trend: "up" | "down" | "stable"
  avatarSeed: number
}

interface Account {
  id: string
  name: string
  industry: string
  contractValue: number
  contractStartDate: Date
  renewalDate: Date
  productTier: "starter" | "professional" | "enterprise" | "fleet-enterprise"
  usageIntensity: number
  supportTicketVolume: number
  expansionPotential: number
  churnRiskBaseline: number
  assignedRep: string
  healthScore: number
  loginFrequency: number
  featureAdoption: number
  executiveSponsorEngagement: number
  netRetentionContribution: number
  lastContactDate: Date
  fleetSize: number
  telematicsUtilization: number
  safetyScore: number
}

interface Deal {
  id: string
  accountId: string
  accountName: string
  stage: "prospecting" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
  value: number
  velocity: number
  closeProbability: number
  stakeholderEngagement: number
  competitorPresence: number
  assignedRep: string
  expectedCloseDate: Date
  daysInStage: number
}

interface ChurnPrediction {
  accountId: string
  accountName: string
  probability: number
  drivers: string[]
  recommendedAction: string
  urgency: "critical" | "high" | "medium" | "low"
  timeToRenewal: number
  usageDecayRate: number
  engagementDropRate: number
  supportEscalationCount: number
}

interface SeasonalTrend {
  quarter: string
  month: string
  churnRate: number
  renewalRate: number
  expansionRate: number
  budgetImpact: number
  fiscalAlignment: number
}

interface TerritoryMetrics {
  territory: string
  accountCount: number
  totalARR: number
  avgHealthScore: number
  churnRisk: number
  coverageGap: number
  repCount: number
}

interface InterventionRecommendation {
  accountId: string
  accountName: string
  action: string
  priority: "immediate" | "soon" | "monitor"
  expectedImpact: number
  reasoning: string
  repReassignment?: string
}

// ============================================================================
// DATA GENERATION ENGINES - SIMULATED ENTERPRISE FLEET MANAGEMENT DATA
// ============================================================================

const TERRITORIES = [
  "West Coast - Pacific Fleet",
  "Southwest - Desert Operations",
  "Midwest - Central Logistics",
  "Southeast - Gulf Fleet",
  "Northeast - Atlantic Corridor",
  "Mountain - Alpine Transport",
  "Texas - Lone Star Fleet",
  "Great Lakes - Industrial",
]

const INDUSTRIES = [
  "Transportation & Logistics",
  "Construction & Heavy Equipment",
  "Field Services & Utilities",
  "Food & Beverage Distribution",
  "Waste Management",
  "Municipal Fleet Services",
  "Oil & Gas Field Operations",
  "Healthcare & Medical Transport",
  "Retail Distribution",
  "Agriculture & Farming",
]

const COMPANY_NAMES = [
  "Northbridge Logistics", "Pacific Fleet Solutions", "Midwest Transport Co",
  "Gulf Coast Carriers", "Alpine Heavy Haul", "Desert Sun Trucking",
  "Great Lakes Distribution", "Atlantic Freight Systems", "Mountain Pass Logistics",
  "Prairie Express", "Coastal Fleet Management", "Valley Transport Services",
  "Metro Delivery Systems", "Interstate Haulers", "Regional Fleet Partners",
  "National Logistics Corp", "United Fleet Services", "Premium Transport Inc",
  "Elite Carrier Group", "Frontier Trucking Co", "Summit Fleet Operations",
  "Heritage Transport", "Legacy Freight", "Titan Fleet Management",
  "Phoenix Distribution", "Sterling Logistics", "Apex Fleet Services",
  "Vanguard Transport", "Cardinal Carriers", "Horizon Fleet Solutions",
]

const REP_NAMES = [
  "Marcus Chen", "Sarah Mitchell", "David Rodriguez", "Emily Thompson",
  "James Wilson", "Amanda Foster", "Michael Brown", "Jessica Martinez",
  "Robert Taylor", "Nicole Anderson", "Christopher Lee", "Stephanie Garcia",
]

function generateSalesReps(): SalesRep[] {
  return REP_NAMES.map((name, idx) => ({
    id: `REP-${String(idx + 1).padStart(3, "0")}`,
    name,
    territory: TERRITORIES[idx % TERRITORIES.length],
    accountPortfolioSize: Math.floor(Math.random() * 15) + 8,
    avgDealSize: Math.floor(Math.random() * 150000) + 50000,
    conversionRate: Math.random() * 0.3 + 0.2,
    renewalSuccessRate: Math.random() * 0.25 + 0.7,
    engagementFrequency: Math.random() * 0.4 + 0.5,
    pipelineVelocity: Math.random() * 0.5 + 0.3,
    quotaAttainment: Math.random() * 0.6 + 0.5,
    activityIndex: Math.random() * 0.4 + 0.5,
    calls: Math.floor(Math.random() * 40) + 20,
    emails: Math.floor(Math.random() * 80) + 40,
    meetings: Math.floor(Math.random() * 15) + 5,
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
    avatarSeed: Math.floor(Math.random() * 1000),
  }))
}

function generateAccounts(reps: SalesRep[]): Account[] {
  return COMPANY_NAMES.map((name, idx) => {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 24) - 6)
    const renewalDate = new Date(startDate)
    renewalDate.setMonth(renewalDate.getMonth() + 12)
    const lastContact = new Date()
    lastContact.setDate(lastContact.getDate() - Math.floor(Math.random() * 30))

    const tier = ["starter", "professional", "enterprise", "fleet-enterprise"][
      Math.floor(Math.random() * 4)
    ] as Account["productTier"]

    const baseValue = tier === "fleet-enterprise" ? 250000 :
      tier === "enterprise" ? 120000 :
        tier === "professional" ? 45000 : 18000

    return {
      id: `ACC-${String(idx + 1).padStart(4, "0")}`,
      name,
      industry: INDUSTRIES[idx % INDUSTRIES.length],
      contractValue: baseValue + Math.floor(Math.random() * baseValue * 0.5),
      contractStartDate: startDate,
      renewalDate,
      productTier: tier,
      usageIntensity: Math.random() * 0.6 + 0.3,
      supportTicketVolume: Math.floor(Math.random() * 20),
      expansionPotential: Math.random(),
      churnRiskBaseline: Math.random() * 0.4,
      assignedRep: reps[idx % reps.length].id,
      healthScore: Math.random() * 0.5 + 0.4,
      loginFrequency: Math.floor(Math.random() * 100) + 20,
      featureAdoption: Math.random() * 0.5 + 0.3,
      executiveSponsorEngagement: Math.random(),
      netRetentionContribution: Math.random() * 0.4 + 0.8,
      lastContactDate: lastContact,
      fleetSize: Math.floor(Math.random() * 500) + 20,
      telematicsUtilization: Math.random() * 0.4 + 0.5,
      safetyScore: Math.random() * 30 + 70,
    }
  })
}

function generateDeals(accounts: Account[], reps: SalesRep[]): Deal[] {
  const stages: Deal["stage"][] = ["prospecting", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]
  return accounts.slice(0, 20).map((account, idx) => {
    const stage = stages[Math.floor(Math.random() * 4)]
    const expectedClose = new Date()
    expectedClose.setDate(expectedClose.getDate() + Math.floor(Math.random() * 90) + 15)

    return {
      id: `DEAL-${String(idx + 1).padStart(4, "0")}`,
      accountId: account.id,
      accountName: account.name,
      stage,
      value: Math.floor(account.contractValue * (Math.random() * 0.5 + 0.8)),
      velocity: Math.random() * 0.6 + 0.2,
      closeProbability: stage === "negotiation" ? 0.7 + Math.random() * 0.25 :
        stage === "proposal" ? 0.4 + Math.random() * 0.3 :
          stage === "qualified" ? 0.2 + Math.random() * 0.2 : Math.random() * 0.2,
      stakeholderEngagement: Math.random(),
      competitorPresence: Math.random() * 0.5,
      assignedRep: account.assignedRep,
      expectedCloseDate: expectedClose,
      daysInStage: Math.floor(Math.random() * 30) + 3,
    }
  })
}

function generateChurnPredictions(accounts: Account[]): ChurnPrediction[] {
  return accounts
    .filter(a => a.churnRiskBaseline > 0.25 || a.healthScore < 0.6)
    .map(account => {
      const daysToRenewal = Math.ceil(
        (account.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      const usageDecay = (1 - account.usageIntensity) * 0.6
      const engagementDrop = (1 - account.featureAdoption) * 0.4
      const probability = Math.min(
        0.95,
        account.churnRiskBaseline + usageDecay * 0.3 + engagementDrop * 0.2 +
        (account.supportTicketVolume > 10 ? 0.15 : 0)
      )

      const drivers: string[] = []
      if (account.usageIntensity < 0.5) drivers.push("Low telematics utilization")
      if (account.featureAdoption < 0.4) drivers.push("Limited feature adoption")
      if (account.supportTicketVolume > 10) drivers.push("High support ticket volume")
      if (account.executiveSponsorEngagement < 0.3) drivers.push("Weak executive sponsorship")
      if (account.telematicsUtilization < 0.6) drivers.push("Underutilized DriveCam devices")

      return {
        accountId: account.id,
        accountName: account.name,
        probability,
        drivers,
        recommendedAction: probability > 0.7
          ? "Immediate executive intervention required"
          : probability > 0.5
            ? "Schedule QBR and success planning session"
            : "Increase proactive engagement cadence",
        urgency: probability > 0.7 ? "critical" :
          probability > 0.5 ? "high" :
            probability > 0.3 ? "medium" : "low",
        timeToRenewal: daysToRenewal,
        usageDecayRate: usageDecay,
        engagementDropRate: engagementDrop,
        supportEscalationCount: account.supportTicketVolume,
      }
    })
    .sort((a, b) => b.probability - a.probability)
}

function generateSeasonalTrends(): SeasonalTrend[] {
  const quarters = ["Q1", "Q2", "Q3", "Q4"]
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months.map((month, idx) => ({
    quarter: quarters[Math.floor(idx / 3)],
    month,
    churnRate: idx === 11 || idx === 0 ? 0.12 + Math.random() * 0.05 :
      idx >= 9 ? 0.08 + Math.random() * 0.04 :
        0.04 + Math.random() * 0.03,
    renewalRate: idx <= 2 ? 0.75 + Math.random() * 0.1 :
      idx >= 9 ? 0.65 + Math.random() * 0.1 :
        0.8 + Math.random() * 0.1,
    expansionRate: idx >= 3 && idx <= 5 ? 0.15 + Math.random() * 0.1 :
      0.08 + Math.random() * 0.05,
    budgetImpact: idx >= 9 ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3,
    fiscalAlignment: idx === 11 || idx <= 2 ? 0.9 : 0.5 + Math.random() * 0.3,
  }))
}

function generateTerritoryMetrics(accounts: Account[], reps: SalesRep[]): TerritoryMetrics[] {
  return TERRITORIES.map(territory => {
    const territoryAccounts = accounts.filter(a =>
      reps.find(r => r.id === a.assignedRep)?.territory === territory
    )
    const territoryReps = reps.filter(r => r.territory === territory)
    return {
      territory,
      accountCount: territoryAccounts.length,
      totalARR: territoryAccounts.reduce((sum, a) => sum + a.contractValue, 0),
      avgHealthScore: territoryAccounts.length > 0
        ? territoryAccounts.reduce((sum, a) => sum + a.healthScore, 0) / territoryAccounts.length
        : 0,
      churnRisk: territoryAccounts.length > 0
        ? territoryAccounts.reduce((sum, a) => sum + a.churnRiskBaseline, 0) / territoryAccounts.length
        : 0,
      coverageGap: Math.max(0, territoryAccounts.length - territoryReps.length * 12) / Math.max(1, territoryAccounts.length),
      repCount: territoryReps.length,
    }
  })
}

function generateInterventions(
  predictions: ChurnPrediction[],
  accounts: Account[],
  reps: SalesRep[]
): InterventionRecommendation[] {
  return predictions.slice(0, 8).map(pred => {
    const account = accounts.find(a => a.id === pred.accountId)!
    const currentRep = reps.find(r => r.id === account.assignedRep)
    const betterRep = reps.find(r =>
      r.renewalSuccessRate > (currentRep?.renewalSuccessRate || 0) + 0.1 &&
      r.territory === currentRep?.territory
    )

    return {
      accountId: pred.accountId,
      accountName: pred.accountName,
      action: pred.probability > 0.7
        ? "Deploy retention playbook with executive escalation"
        : pred.probability > 0.5
          ? "Schedule strategic business review"
          : "Increase touchpoint frequency",
      priority: pred.urgency === "critical" ? "immediate" :
        pred.urgency === "high" ? "soon" : "monitor",
      expectedImpact: pred.probability > 0.5 ? account.contractValue * 0.8 : account.contractValue * 0.4,
      reasoning: `${pred.drivers.slice(0, 2).join("; ")}. Contract value at risk: $${account.contractValue.toLocaleString()}.`,
      repReassignment: betterRep && pred.probability > 0.6 ? betterRep.name : undefined,
    }
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function getHealthColor(score: number): string {
  if (score >= 0.8) return "text-emerald-400"
  if (score >= 0.6) return "text-amber-400"
  return "text-red-400"
}

function getRiskColor(risk: number): string {
  if (risk >= 0.7) return "text-red-400"
  if (risk >= 0.4) return "text-amber-400"
  return "text-emerald-400"
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30"
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    default: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  }
}

// ============================================================================
// MAIN COMPONENT - B2B CHURN PREDICTOR SIMULATION
// ============================================================================

export default function B2BChurnPredictorSimulation() {
  // State Management
  const [systemTime, setSystemTime] = useState(new Date())
  const [simulationCycle, setSimulationCycle] = useState(0)
  const [activeSection, setActiveSection] = useState(0)

  // Core Data State
  const [salesReps, setSalesReps] = useState<SalesRep[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [churnPredictions, setChurnPredictions] = useState<ChurnPrediction[]>([])
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([])
  const [territoryMetrics, setTerritoryMetrics] = useState<TerritoryMetrics[]>([])
  const [interventions, setInterventions] = useState<InterventionRecommendation[]>([])

  // Derived Metrics
  const totalARR = useMemo(() =>
    accounts.reduce((sum, a) => sum + a.contractValue, 0), [accounts])
  const avgChurnRisk = useMemo(() =>
    accounts.length > 0
      ? accounts.reduce((sum, a) => sum + a.churnRiskBaseline, 0) / accounts.length
      : 0, [accounts])
  const pipelineValue = useMemo(() =>
    deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage))
      .reduce((sum, d) => sum + d.value * d.closeProbability, 0), [deals])
  const avgHealthScore = useMemo(() =>
    accounts.length > 0
      ? accounts.reduce((sum, a) => sum + a.healthScore, 0) / accounts.length
      : 0, [accounts])
  const totalFleetVehicles = useMemo(() =>
    accounts.reduce((sum, a) => sum + a.fleetSize, 0), [accounts])

  // Initialize simulation data
  useEffect(() => {
    const reps = generateSalesReps()
    const accts = generateAccounts(reps)
    const dls = generateDeals(accts, reps)
    const predictions = generateChurnPredictions(accts)
    const trends = generateSeasonalTrends()
    const territories = generateTerritoryMetrics(accts, reps)
    const actions = generateInterventions(predictions, accts, reps)

    setSalesReps(reps)
    setAccounts(accts)
    setDeals(dls)
    setChurnPredictions(predictions)
    setSeasonalTrends(trends)
    setTerritoryMetrics(territories)
    setInterventions(actions)
  }, [])

  // Real-time simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(new Date())
      setSimulationCycle(prev => prev + 1)

      // Simulate data fluctuations
      setSalesReps(prev => prev.map(rep => ({
        ...rep,
        activityIndex: Math.max(0.3, Math.min(0.95, rep.activityIndex + (Math.random() - 0.5) * 0.05)),
        quotaAttainment: Math.max(0.3, Math.min(1.2, rep.quotaAttainment + (Math.random() - 0.5) * 0.02)),
      })))

      setAccounts(prev => prev.map(account => ({
        ...account,
        healthScore: Math.max(0.2, Math.min(0.95, account.healthScore + (Math.random() - 0.5) * 0.02)),
        usageIntensity: Math.max(0.2, Math.min(0.95, account.usageIntensity + (Math.random() - 0.5) * 0.03)),
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Recalculate predictions on account changes
  useEffect(() => {
    if (accounts.length > 0) {
      const newPredictions = generateChurnPredictions(accounts)
      setChurnPredictions(newPredictions)
      setInterventions(generateInterventions(newPredictions, accounts, salesReps))
    }
  }, [accounts, salesReps])

  // Track scroll position for section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-section]")
      let currentSection = 0
      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 200) currentSection = idx
      })
      setActiveSection(currentSection)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {/* System Header Bar */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-slate-700">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-slate-900">Lytx Fleet Intelligence</h1>
                    <p className="text-[10px] text-slate-500">B2B Target Tracker & Churn Predictor</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-8 bg-slate-300" />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Signal className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span>Live Simulation</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono">{systemTime.toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600 text-[10px]">
                  <Database className="mr-1 h-3 w-3" />
                  Salesforce Sync
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px]">
                  <Camera className="mr-1 h-3 w-3" />
                  DriveCam API
                </Badge>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
                  <Gauge className="mr-1 h-3 w-3" />
                  Telematics Live
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="mx-auto max-w-7xl px-4 py-6">
          {/* ================================================================
              SCROLL LAYER 1 — EXECUTIVE SALES OVERVIEW
              ================================================================ */}
          <section data-section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Executive Narrative Block */}
              <div className="mb-8 rounded-xl border border-slate-200 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6">
                <div className="flex items-start justify-between">
                  <div className="max-w-3xl">
                    <h2 className="mb-3 text-xl font-semibold text-white">
                      Revenue Operations Intelligence — Enterprise Fleet Management
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      This simulation models the complete B2B sales operations environment for a fleet management
                      SaaS platform, tracking <span className="text-blue-600 font-medium">{accounts.length} enterprise accounts</span> across{" "}
                      <span className="text-blue-600 font-medium">{TERRITORIES.length} territories</span> with{" "}
                      <span className="text-blue-600 font-medium">{salesReps.length} sales representatives</span>.
                      Current tracking coverage includes <span className="text-emerald-400 font-medium">{totalFleetVehicles.toLocaleString()} fleet vehicles</span> with
                      integrated telematics and DriveCam safety monitoring. The system continuously evaluates
                      churn risk, renewal timing, and expansion opportunities using predictive analytics
                      derived from engagement decay patterns, support escalation frequency, and seasonal
                      behavioral modeling.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Cycle #{simulationCycle}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                <KPICard
                  title="Total ARR"
                  value={formatCurrency(totalARR)}
                  subtitle="Annual Recurring Revenue"
                  icon={<DollarSign className="h-4 w-4" />}
                  trend={2.4}
                  color="cyan"
                />
                <KPICard
                  title="Active Accounts"
                  value={accounts.length.toString()}
                  subtitle="Enterprise Fleet Clients"
                  icon={<Building2 className="h-4 w-4" />}
                  trend={1.2}
                  color="blue"
                />
                <KPICard
                  title="Pipeline Value"
                  value={formatCurrency(pipelineValue)}
                  subtitle="Weighted Opportunities"
                  icon={<Target className="h-4 w-4" />}
                  trend={-0.8}
                  color="purple"
                />
                <KPICard
                  title="Avg Health Score"
                  value={formatPercent(avgHealthScore)}
                  subtitle="Customer Success Index"
                  icon={<Activity className="h-4 w-4" />}
                  trend={0.5}
                  color="emerald"
                />
                <KPICard
                  title="Churn Risk"
                  value={formatPercent(avgChurnRisk)}
                  subtitle="Portfolio Average"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  trend={-1.2}
                  color="amber"
                  inverted
                />
                <KPICard
                  title="Fleet Vehicles"
                  value={totalFleetVehicles.toLocaleString()}
                  subtitle="Under Management"
                  icon={<Truck className="h-4 w-4" />}
                  trend={3.1}
                  color="cyan"
                />
              </div>
            </motion.div>
          </section>

          {/* ================================================================
              SCROLL LAYER 2 — SALES REP PERFORMANCE LAYER
              ================================================================ */}
          <section data-section className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title="Sales Representative Performance Matrix"
                subtitle="Real-time activity tracking, quota attainment, and pipeline velocity metrics across the entire sales organization"
                icon={<Users className="h-5 w-5" />}
              />

              {/* Rep Performance Grid */}
              <div className="space-y-3">
                {salesReps.map((rep, idx) => (
                  <RepPerformanceCard key={rep.id} rep={rep} rank={idx + 1} accounts={accounts} />
                ))}
              </div>

              {/* Performance Summary Narrative */}
              <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">
                  <span className="text-slate-900 font-medium">Performance Analysis:</span>{" "}
                  The top quartile of representatives maintains an average quota attainment of{" "}
                  <span className="text-emerald-400 font-medium">
                    {formatPercent(salesReps.slice(0, 3).reduce((sum, r) => sum + r.quotaAttainment, 0) / 3)}
                  </span>{" "}
                  with a combined pipeline velocity score of{" "}
                  <span className="text-blue-600 font-medium">
                    {(salesReps.slice(0, 3).reduce((sum, r) => sum + r.pipelineVelocity, 0) / 3 * 100).toFixed(0)}
                  </span>.
                  The organization shows a renewal success rate variance of ±12% across territories,
                  indicating potential for territory rebalancing to optimize coverage efficiency.
                </p>
              </div>
            </motion.div>
          </section>

          {/* ================================================================
              SCROLL LAYER 3 — ACCOUNT HEALTH MONITORING LAYER
              ================================================================ */}
          <section data-section className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title="Account Health Intelligence Dashboard"
                subtitle="Customer lifecycle tracking with engagement scoring, feature adoption rates, and telematics utilization metrics"
                icon={<Activity className="h-5 w-5" />}
              />

              {/* Account Health Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.slice(0, 12).map(account => (
                  <AccountHealthCard
                    key={account.id}
                    account={account}
                    rep={salesReps.find(r => r.id === account.assignedRep)}
                  />
                ))}
              </div>

              {/* Segmentation Summary */}
              <div className="mt-6 grid grid-cols-5 gap-3">
                <SegmentCard
                  label="High Value Stable"
                  count={accounts.filter(a => a.healthScore > 0.7 && a.contractValue > 100000).length}
                  color="emerald"
                />
                <SegmentCard
                  label="High Value at Risk"
                  count={accounts.filter(a => a.healthScore < 0.5 && a.contractValue > 100000).length}
                  color="red"
                />
                <SegmentCard
                  label="Growth Potential"
                  count={accounts.filter(a => a.expansionPotential > 0.6).length}
                  color="cyan"
                />
                <SegmentCard
                  label="Dormant Risk"
                  count={accounts.filter(a => a.usageIntensity < 0.4).length}
                  color="amber"
                />
                <SegmentCard
                  label="Expansion Ready"
                  count={accounts.filter(a => a.featureAdoption > 0.7 && a.expansionPotential > 0.5).length}
                  color="purple"
                />
              </div>
            </motion.div>
          </section>

          {/* ================================================================
              SCROLL LAYER 4 — RENEWAL TIMELINE INTELLIGENCE LAYER
              ================================================================ */}
          <section data-section className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title="Renewal Timeline Intelligence"
                subtitle="Contract lifecycle monitoring with risk-adjusted intervention windows and pricing sensitivity analysis"
                icon={<Calendar className="h-5 w-5" />}
              />

              {/* Renewal Timeline Visualization */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">Upcoming Renewals — 90 Day Window</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-500">Low Risk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-slate-500">Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-slate-500">High Risk</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {accounts
                    .filter(a => {
                      const daysToRenewal = Math.ceil(
                        (a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                      return daysToRenewal > 0 && daysToRenewal <= 90
                    })
                    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())
                    .slice(0, 8)
                    .map(account => (
                      <RenewalTimelineRow key={account.id} account={account} />
                    ))}
                </div>
              </div>

              {/* Renewal Risk Distribution */}
              <div className="mt-4 grid grid-cols-4 gap-4">
                <RenewalMetricCard
                  label="Renewals This Month"
                  value={accounts.filter(a => {
                    const daysToRenewal = Math.ceil(
                      (a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                    return daysToRenewal > 0 && daysToRenewal <= 30
                  }).length.toString()}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <RenewalMetricCard
                  label="ARR at Renewal"
                  value={formatCurrency(
                    accounts
                      .filter(a => {
                        const daysToRenewal = Math.ceil(
                          (a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                        )
                        return daysToRenewal > 0 && daysToRenewal <= 90
                      })
                      .reduce((sum, a) => sum + a.contractValue, 0)
                  )}
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <RenewalMetricCard
                  label="Avg Risk Score"
                  value={formatPercent(
                    accounts
                      .filter(a => {
                        const daysToRenewal = Math.ceil(
                          (a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                        )
                        return daysToRenewal > 0 && daysToRenewal <= 90
                      })
                      .reduce((sum, a) => sum + a.churnRiskBaseline, 0) /
                    Math.max(1, accounts.filter(a => {
                      const daysToRenewal = Math.ceil(
                        (a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                      return daysToRenewal > 0 && daysToRenewal <= 90
                    }).length)
                  )}
                  icon={<AlertTriangle className="h-4 w-4" />}
                />
                <RenewalMetricCard
                  label="Expansion Pipeline"
                  value={formatCurrency(
                    accounts
                      .filter(a => a.expansionPotential > 0.6)
                      .reduce((sum, a) => sum + a.contractValue * a.expansionPotential * 0.3, 0)
                  )}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
              </div>
            </motion.div>
          </section>

          {/* ================================================================
              SCROLL LAYER 5 — CHURN FORECASTING LAYER
              ================================================================ */}
          <section data-section className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title="Predictive Churn Intelligence Engine"
                subtitle="ML-driven churn probability modeling with driver analysis, engagement decay patterns, and intervention recommendations"
                icon={<AlertTriangle className="h-5 w-5" />}
              />

              {/* High Risk Accounts Detail */}
              <div className="space-y-4">
                {churnPredictions.slice(0, 6).map(prediction => (
                  <ChurnPredictionCard
                    key={prediction.accountId}
                    prediction={prediction}
                    account={accounts.find(a => a.id === prediction.accountId)}
                  />
                ))}
              </div>

              {/* Churn Distribution Summary */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-medium text-slate-900">Portfolio Churn Risk Distribution</h3>
                <div className="flex items-end justify-between gap-2">
                  {[
                    { range: "0-20%", label: "Low", color: "bg-emerald-500" },
                    { range: "20-40%", label: "Moderate", color: "bg-cyan-500" },
                    { range: "40-60%", label: "Elevated", color: "bg-amber-500" },
                    { range: "60-80%", label: "High", color: "bg-orange-500" },
                    { range: "80-100%", label: "Critical", color: "bg-red-500" },
                  ].map((bucket, idx) => {
                    const count = accounts.filter(a => {
                      const risk = a.churnRiskBaseline
                      const min = idx * 0.2
                      const max = (idx + 1) * 0.2
                      return risk >= min && risk < max
                    }).length
                    const height = Math.max(20, (count / accounts.length) * 200)
                    return (
                      <div key={bucket.range} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={`w-full rounded-t ${bucket.color} transition-all duration-500`}
                          style={{ height: `${height}px` }}
                        />
                        <span className="text-xs text-slate-500">{bucket.range}</span>
                        <span className="text-xs font-medium text-slate-700">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </section>

          {/* ================================================================
              SCROLL LAYER 6 — SEASONAL TREND ANALYSIS LAYER
              ================================================================ */}
          <section data-section className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title="Seasonal Churn & Renewal Patterns"
                subtitle="Macro-level analysis of quarterly budget impacts, fiscal year alignment effects, and industry-specific seasonal variations"
                icon={<LineChart className="h-5 w-5" />}
              />

              {/* Seasonal Trends Visualization */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">Monthly Churn & Renewal Rate Trends</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-4 rounded bg-red-500/70" />
                      <span className="text-slate-500">Churn Rate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-4 rounded bg-emerald-500/70" />
                      <span className="text-slate-500">Renewal Rate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-4 rounded bg-blue-500/70" />
                      <span className="text-slate-500">Expansion</span>
                    </div>
                  </div>
                </div>

                {/* Chart Grid */}
                <div className="grid grid-cols-12 gap-2">
                  {seasonalTrends.map((trend, idx) => (
                    <SeasonalTrendBar key={trend.month} trend={trend} isCurrentMonth={idx === new Date().getMonth()} />
                  ))}
                </div>

                {/* Quarter Labels */}
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {["Q1", "Q2", "Q3", "Q4"].map(quarter => (
                    <div key={quarter} className="text-center text-xs text-slate-500">
                      {quarter}
                    </div>
                  ))}
                </div>
              </div>

              {/* Seasonal Insights Narrative */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Q4 Budget Tightening Alert</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Historical patterns indicate a <span className="text-amber-400">34% increase</span> in churn
                    risk during October-December due to annual budget reconciliation cycles. Fleet management
                    contracts are particularly susceptible as companies evaluate operational cost centers.
                    Proactive renewal discussions should begin 90+ days before year-end.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-cyan-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Q2 Expansion Opportunity Window</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    April-June presents a <span className="text-blue-600">22% higher expansion rate</span> as
                    companies deploy new fiscal year budgets. Fleet expansion decisions typically coincide
                    with Q2 operational planning. Target high-adoption accounts for upsell campaigns during
                    this period for maximum conversion efficiency.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ================================================================
              SCROLL LAYER 7 — EXECUTIVE ACTION RECOMMENDATION LAYER
              ================================================================ */}
          <section data-section className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                title="Executive Action Intelligence"
                subtitle="AI-synthesized intervention recommendations with prioritized action items, rep reassignment suggestions, and expected impact analysis"
                icon={<Zap className="h-5 w-5" />}
              />

              {/* Priority Action Queue */}
              <div className="mb-6 rounded-xl border border-slate-200 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">Priority Intervention Queue</h3>
                  <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400 text-[10px]">
                    {interventions.filter(i => i.priority === "immediate").length} Immediate Actions
                  </Badge>
                </div>

                <div className="space-y-3">
                  {interventions.map((intervention, idx) => (
                    <InterventionCard key={intervention.accountId} intervention={intervention} index={idx + 1} />
                  ))}
                </div>
              </div>

              {/* Territory Rebalancing Analysis */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-medium text-slate-900">Territory Performance & Coverage Analysis</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {territoryMetrics.map(territory => (
                    <TerritoryCard key={territory.territory} territory={territory} />
                  ))}
                </div>
              </div>

              {/* Final Executive Summary */}
              <div className="mt-6 rounded-xl border border-blue-200 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Executive Summary — Recommended Actions</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>
                    <span className="text-slate-900 font-medium">1. Immediate Retention Focus:</span>{" "}
                    {churnPredictions.filter(p => p.probability > 0.6).length} accounts require immediate intervention,
                    representing <span className="text-red-400 font-medium">
                      {formatCurrency(accounts.filter(a =>
                        churnPredictions.find(p => p.accountId === a.id && p.probability > 0.6)
                      ).reduce((sum, a) => sum + a.contractValue, 0))}
                    </span> in at-risk ARR.
                  </p>
                  <p>
                    <span className="text-slate-900 font-medium">2. Territory Optimization:</span>{" "}
                    {territoryMetrics.filter(t => t.coverageGap > 0.2).length} territories show coverage gaps
                    exceeding 20%. Consider rep reallocation to balance workload distribution.
                  </p>
                  <p>
                    <span className="text-slate-900 font-medium">3. Expansion Opportunity:</span>{" "}
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(accounts.filter(a => a.expansionPotential > 0.6)
                        .reduce((sum, a) => sum + a.contractValue * a.expansionPotential * 0.3, 0))}
                    </span>{" "}
                    in identified upsell pipeline across {accounts.filter(a => a.expansionPotential > 0.6).length} expansion-ready accounts.
                  </p>
                  <p>
                    <span className="text-slate-900 font-medium">4. Seasonal Preparation:</span>{" "}
                    Q4 budget compression begins in 6 weeks. Accelerate renewal conversations for all accounts
                    with December-February renewal dates.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* System Footer */}
          <footer className="mt-16 border-t border-slate-200 pt-6 pb-8">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="font-mono">SIMULATION ACTIVE</span>
                <Separator orientation="vertical" className="h-3 bg-gray-700" />
                <span>Portfolio Showcase — B2B Sales Operations Intelligence</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Simulated Data Sources: Salesforce, Gainsight, Zendesk, HubSpot, Lytx DriveCam API</span>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] text-slate-600 leading-relaxed">
                <span className="text-slate-500 font-medium">SIMULATION DISCLAIMER:</span>{" "}
                This interface is a portfolio-grade systems design demonstration, not a production deployment.
                All datasets, metrics, behavioral signals, and operational workflows are artificially generated
                within the front-end layer. No real customer data, CRM integrations, or backend systems are
                connected. This simulation demonstrates advanced systems thinking across B2B SaaS analytics,
                sales operations, retention modeling, and predictive forecasting systems design.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </TooltipProvider>
    {/* === PROJECT FOOTER === */}
    <div style={{background:"#0f172a",color:"#94a3b8",fontSize:"11px",padding:"18px 32px",borderTop:"2px solid #1e293b",fontFamily:"monospace",lineHeight:1.7}}>
      <div style={{marginBottom:6,color:"#e2e8f0",fontWeight:700,fontSize:13,letterSpacing:1}}>PROJECT FOOTNOTE</div>
      <div><strong style={{color:"#f1f5f9"}}>Stack:</strong> React · TypeScript · Tailwind CSS · Framer Motion · Radix UI — standalone simulation, no backend</div>
      <div><strong style={{color:"#f1f5f9"}}>Methods:</strong> B2B SaaS churn prediction modeling · Account health scoring · Sales rep performance KPIs · Seasonal renewal trend analysis · Territory coverage gap detection · Intervention priority ranking</div>
      <div><strong style={{color:"#f1f5f9"}}>Sources:</strong> Sales operations metrics modeled from Gainsight/Salesforce CSM frameworks; churn indicators based on published SaaS retention research; all data procedurally generated — no real CRM data</div>
    </div>
    </>
  )
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <p className="text-sm text-slate-500 pl-11">{subtitle}</p>
    </div>
  )
}

function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  inverted = false,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend: number
  color: string
  inverted?: boolean
}) {
  const isPositive = inverted ? trend < 0 : trend > 0
  const colorMap: Record<string, string> = {
    cyan: "from-blue-500/20 to-blue-500/5 border-blue-200",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  }
  const iconColorMap: Record<string, string> = {
    cyan: "text-blue-600",
    blue: "text-blue-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  }

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`${iconColorMap[color]}`}>{icon}</span>
        <div className={`flex items-center gap-0.5 text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{subtitle}</div>
    </div>
  )
}

function RepPerformanceCard({
  rep,
  rank,
  accounts,
}: {
  rep: SalesRep
  rank: number
  accounts: Account[]
}) {
  const repAccounts = accounts.filter(a => a.assignedRep === rep.id)
  const repARR = repAccounts.reduce((sum, a) => sum + a.contractValue, 0)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm
          ${rank <= 3 ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white" : "bg-slate-200 text-slate-500"}`}>
          #{rank}
        </div>

        {/* Rep Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{rep.name}</span>
            {rep.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
            {rep.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span>{rep.territory}</span>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Tooltip>
            <TooltipTrigger>
              <div className="text-center">
                <div className="text-slate-900 font-medium">{formatPercent(rep.quotaAttainment)}</div>
                <div className="text-[10px] text-slate-500">Quota</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Quota Attainment</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-center">
                <div className="text-slate-900 font-medium">{formatPercent(rep.renewalSuccessRate)}</div>
                <div className="text-[10px] text-slate-500">Renewal</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Renewal Success Rate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-center">
                <div className="text-slate-900 font-medium">{repAccounts.length}</div>
                <div className="text-[10px] text-slate-500">Accounts</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Active Account Portfolio</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-center">
                <div className="text-blue-600 font-medium">{formatCurrency(repARR)}</div>
                <div className="text-[10px] text-slate-500">ARR</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Total ARR Under Management</TooltipContent>
          </Tooltip>
        </div>

        {/* Activity Indicators */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{rep.calls}</span>
            </TooltipTrigger>
            <TooltipContent>Calls This Week</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span>{rep.emails}</span>
            </TooltipTrigger>
            <TooltipContent>Emails This Week</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              <span>{rep.meetings}</span>
            </TooltipTrigger>
            <TooltipContent>Meetings This Week</TooltipContent>
          </Tooltip>
        </div>

        {/* Activity Progress */}
        <div className="w-24">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-500">Activity</span>
            <span className="text-slate-500">{formatPercent(rep.activityIndex)}</span>
          </div>
          <Progress value={rep.activityIndex * 100} className="h-1.5" />
        </div>
      </div>
    </motion.div>
  )
}

function AccountHealthCard({
  account,
  rep,
}: {
  account: Account
  rep?: SalesRep
}) {
  const daysToRenewal = Math.ceil(
    (account.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const daysSinceContact = Math.ceil(
    (Date.now() - account.lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const tierColors: Record<string, string> = {
    "fleet-enterprise": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    enterprise: "bg-blue-100 text-blue-600 border-blue-200",
    professional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    starter: "bg-gray-500/20 text-slate-500 border-gray-500/30",
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-slate-900 truncate">{account.name}</h4>
          <p className="text-xs text-slate-500">{account.industry}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${tierColors[account.productTier]}`}>
          {account.productTier.replace("-", " ")}
        </Badge>
      </div>

      {/* Health Score Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500">Health Score</span>
          <span className={getHealthColor(account.healthScore)}>{formatPercent(account.healthScore)}</span>
        </div>
        <Progress
          value={account.healthScore * 100}
          className="h-2"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="rounded-lg bg-slate-100 p-2">
          <div className="text-xs font-medium text-slate-700">{account.fleetSize}</div>
          <div className="text-[10px] text-slate-500">Vehicles</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <div className="text-xs font-medium text-slate-700">{formatPercent(account.telematicsUtilization)}</div>
          <div className="text-[10px] text-slate-500">Telematics</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <div className={`text-xs font-medium ${account.safetyScore > 85 ? "text-emerald-400" : account.safetyScore > 70 ? "text-amber-400" : "text-red-400"}`}>
            {account.safetyScore.toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-500">Safety</div>
        </div>
      </div>

      {/* Contract Info */}
      <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-3">
        <div>
          <span className="text-slate-500">ARR: </span>
          <span className="text-blue-600 font-medium">{formatCurrency(account.contractValue)}</span>
        </div>
        <div className={`flex items-center gap-1 ${daysToRenewal < 30 ? "text-red-400" : daysToRenewal < 60 ? "text-amber-400" : "text-slate-500"}`}>
          <Clock className="h-3 w-3" />
          <span>{daysToRenewal}d to renewal</span>
        </div>
      </div>

      {/* Rep Assignment */}
      {rep && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <Users className="h-3 w-3" />
          <span>{rep.name}</span>
          {daysSinceContact > 14 && (
            <Badge variant="outline" className="ml-auto text-[9px] border-amber-500/30 bg-amber-500/10 text-amber-400">
              {daysSinceContact}d since contact
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

function SegmentCard({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    cyan: "border-blue-200 bg-blue-50 text-blue-600",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  }

  return (
    <div className={`rounded-lg border p-3 text-center ${colorMap[color]}`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
    </div>
  )
}

function RenewalTimelineRow({ account }: { account: Account }) {
  const daysToRenewal = Math.ceil(
    (account.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const progress = Math.max(0, Math.min(100, ((90 - daysToRenewal) / 90) * 100))
  const riskColor = account.churnRiskBaseline > 0.5 ? "bg-red-500" :
    account.churnRiskBaseline > 0.3 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-3">
      <div className={`h-2 w-2 rounded-full ${riskColor}`} />
      <div className="w-48 truncate text-sm text-slate-900">{account.name}</div>
      <div className="flex-1">
        <div className="relative h-2 rounded-full bg-slate-200">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all ${riskColor}`}
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border-2 border-gray-900"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
      <div className="w-24 text-right">
        <span className={`text-sm font-medium ${daysToRenewal < 30 ? "text-red-400" : daysToRenewal < 60 ? "text-amber-400" : "text-slate-600"}`}>
          {daysToRenewal} days
        </span>
      </div>
      <div className="w-24 text-right text-sm text-blue-600">
        {formatCurrency(account.contractValue)}
      </div>
      <Badge variant="outline" className={`text-[10px] ${getRiskColor(account.churnRiskBaseline)} border-current/30 bg-current/10`}>
        {formatPercent(account.churnRiskBaseline)} risk
      </Badge>
    </div>
  )
}

function RenewalMetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  )
}

function ChurnPredictionCard({
  prediction,
  account,
}: {
  prediction: ChurnPrediction
  account?: Account
}) {
  if (!account) return null

  return (
    <div className={`rounded-xl border p-5 ${prediction.urgency === "critical"
      ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-500/5"
      : prediction.urgency === "high"
        ? "border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-500/5"
        : "border-slate-200 bg-white"
      }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-slate-900">{prediction.accountName}</h4>
            <Badge variant="outline" className={getUrgencyColor(prediction.urgency)}>
              {prediction.urgency.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">{account.industry} • {account.fleetSize} vehicles</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getRiskColor(prediction.probability)}`}>
            {formatPercent(prediction.probability)}
          </div>
          <div className="text-xs text-slate-500">Churn Probability</div>
        </div>
      </div>

      {/* Churn Drivers */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 mb-2">Risk Drivers Identified:</div>
        <div className="flex flex-wrap gap-2">
          {prediction.drivers.map((driver, idx) => (
            <Badge key={idx} variant="outline" className="border-slate-300 bg-slate-200 text-slate-600 text-[10px]">
              {driver}
            </Badge>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="rounded-lg bg-slate-100 p-2 text-center">
          <div className="text-sm font-medium text-slate-900">{prediction.timeToRenewal}d</div>
          <div className="text-[10px] text-slate-500">To Renewal</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2 text-center">
          <div className={`text-sm font-medium ${prediction.usageDecayRate > 0.3 ? "text-red-400" : "text-slate-600"}`}>
            {formatPercent(prediction.usageDecayRate)}
          </div>
          <div className="text-[10px] text-slate-500">Usage Decay</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2 text-center">
          <div className={`text-sm font-medium ${prediction.engagementDropRate > 0.3 ? "text-red-400" : "text-slate-600"}`}>
            {formatPercent(prediction.engagementDropRate)}
          </div>
          <div className="text-[10px] text-slate-500">Engagement Drop</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2 text-center">
          <div className={`text-sm font-medium ${prediction.supportEscalationCount > 10 ? "text-amber-400" : "text-slate-600"}`}>
            {prediction.supportEscalationCount}
          </div>
          <div className="text-[10px] text-slate-500">Support Tickets</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 p-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-600">{prediction.recommendedAction}</span>
        </div>
        <div className="text-sm text-slate-500">
          ARR at Risk: <span className="text-red-400 font-medium">{formatCurrency(account.contractValue)}</span>
        </div>
      </div>
    </div>
  )
}

function SeasonalTrendBar({
  trend,
  isCurrentMonth,
}: {
  trend: SeasonalTrend
  isCurrentMonth: boolean
}) {
  return (
    <div className={`flex flex-col items-center ${isCurrentMonth ? "bg-blue-50 rounded-lg p-1 -m-1" : ""}`}>
      <div className="flex flex-col items-center gap-1 h-32 justify-end w-full">
        <Tooltip>
          <TooltipTrigger className="w-full">
            <div
              className="w-full rounded-t bg-red-500/70 transition-all hover:bg-red-500"
              style={{ height: `${Math.min(trend.churnRate * 200, 45)}px` }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-medium">{trend.month}</div>
              <div>Churn: {formatPercent(trend.churnRate)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <div
              className="w-full rounded-t bg-emerald-500/70 transition-all hover:bg-emerald-500"
              style={{ height: `${Math.min(trend.renewalRate * 50, 43)}px` }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-medium">{trend.month}</div>
              <div>Renewal: {formatPercent(trend.renewalRate)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <div
              className="w-full rounded-t bg-blue-500/70 transition-all hover:bg-blue-500"
              style={{ height: `${Math.min(trend.expansionRate * 100, 25)}px` }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-medium">{trend.month}</div>
              <div>Expansion: {formatPercent(trend.expansionRate)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className={`text-[10px] mt-2 ${isCurrentMonth ? "text-blue-600 font-medium" : "text-slate-500"}`}>
        {trend.month.slice(0, 3)}
      </div>
    </div>
  )
}

function InterventionCard({
  intervention,
  index,
}: {
  intervention: InterventionRecommendation
  index: number
}) {
  const priorityColors: Record<string, string> = {
    immediate: "border-l-red-500 bg-red-500/5",
    soon: "border-l-amber-500 bg-amber-500/5",
    monitor: "border-l-emerald-500 bg-emerald-500/5",
  }

  return (
    <div className={`rounded-r-lg border-l-4 border border-slate-200 p-4 ${priorityColors[intervention.priority]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
            {index}
          </div>
          <div>
            <h4 className="font-medium text-slate-900">{intervention.accountName}</h4>
            <p className="text-xs text-slate-500">{intervention.action}</p>
          </div>
        </div>
        <Badge variant="outline" className={getUrgencyColor(intervention.priority === "immediate" ? "critical" : intervention.priority === "soon" ? "high" : "medium")}>
          {intervention.priority}
        </Badge>
      </div>
      <p className="text-xs text-slate-500 mb-2">{intervention.reasoning}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Expected Impact: <span className="text-emerald-400 font-medium">{formatCurrency(intervention.expectedImpact)}</span>
        </span>
        {intervention.repReassignment && (
          <span className="text-amber-400">
            Suggested Reassignment: {intervention.repReassignment}
          </span>
        )}
      </div>
    </div>
  )
}

function TerritoryCard({ territory }: { territory: TerritoryMetrics }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-900 truncate">{territory.territory}</h4>
        <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500">
          {territory.repCount} reps
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Accounts</span>
          <span className="text-slate-900">{territory.accountCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Total ARR</span>
          <span className="text-blue-600">{formatCurrency(territory.totalARR)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Avg Health</span>
          <span className={getHealthColor(territory.avgHealthScore)}>{formatPercent(territory.avgHealthScore)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Coverage Gap</span>
          <span className={territory.coverageGap > 0.2 ? "text-red-400" : "text-emerald-400"}>
            {formatPercent(territory.coverageGap)}
          </span>
        </div>
      </div>
    </div>
  )
}
