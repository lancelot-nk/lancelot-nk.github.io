/**
 * MASIP Dashboard - Multi-Agency Situational Intelligence Pipeline
 * 
 * A fully standalone, self-contained React component for portfolio demonstration.
 * 
 * Dependencies:
 *   - react (useState, useEffect, useCallback)
 *   - lucide-react (icons)
 *   - Tailwind CSS (for styling)
 * 
 * Usage:
 *   1. Install dependencies: npm install lucide-react
 *   2. Ensure Tailwind CSS is configured in your project
 *   3. Import and use: import MASIPDashboard from './MASIPDashboard'
 *   4. Render: <MASIPDashboard />
 * 
 * All data is simulated/hardcoded - no backend required.
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Database,
  Shield,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  Lock,
  Users,
  Server,
  BarChart3,
  RefreshCw,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Network,
  Layers,
  Building2,
  AlertCircle,
  ArrowRight,
  Filter,
  Download,
  Settings,
  LayoutDashboard,
  GitBranch,
  Table2,
  ShieldCheck,
  CircleDot,
  ChevronDown,
  ExternalLink,
  Workflow,
  FileBarChart,
  CalendarDays,
  Gauge,
  Zap,
  Globe,
  Radio,
} from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

interface Agency {
  id: string
  name: string
  acronym: string
  status: "connected" | "syncing" | "maintenance" | "pending"
  lastSync: Date
  recordCount: number
  dataCategory: string
  complianceScore: number
  region: string
}

interface DataStream {
  id: string
  source: string
  destination: string
  recordsPerMinute: number
  latency: number
  status: "active" | "degraded" | "inactive"
  protocol: string
  lastActivity: Date
}

interface DataQualityMetric {
  dimension: string
  score: number
  issues: number
  trend: "up" | "down" | "stable"
}

interface ETLJob {
  id: string
  name: string
  source: string
  schedule: string
  lastRun: Date
  nextRun: Date
  status: "success" | "running" | "failed" | "scheduled"
  recordsProcessed: number
  duration: number
}

interface ComplianceControl {
  id: string
  family: string
  name: string
  implemented: number
  total: number
  status: "compliant" | "partial" | "non-compliant"
  lastAssessed: Date
}

interface AccessPolicy {
  id: string
  tableName: string
  policyName: string
  scope: string
  condition: string
  lastModified: Date
  enabled: boolean
}

interface AuditEvent {
  id: string
  timestamp: Date
  user: string
  action: string
  resource: string
  status: "success" | "denied" | "error"
  agency: string
}

// ============================================================================
// SIMULATED DATA - All hardcoded for portfolio demonstration
// ============================================================================

const agencies: Agency[] = [
  { id: "gsa", name: "General Services Administration", acronym: "GSA", status: "connected", lastSync: new Date(), recordCount: 1847392, dataCategory: "Procurement & Contracts", complianceScore: 94, region: "National" },
  { id: "hhs", name: "Health & Human Services", acronym: "HHS", status: "connected", lastSync: new Date(Date.now() - 120000), recordCount: 2923847, dataCategory: "Healthcare Programs", complianceScore: 91, region: "National" },
  { id: "dot", name: "Department of Transportation", acronym: "DOT", status: "syncing", lastSync: new Date(Date.now() - 300000), recordCount: 847291, dataCategory: "Infrastructure & Transit", complianceScore: 89, region: "National" },
  { id: "epa", name: "Environmental Protection Agency", acronym: "EPA", status: "connected", lastSync: new Date(Date.now() - 60000), recordCount: 1291847, dataCategory: "Environmental Data", complianceScore: 96, region: "National" },
  { id: "treasury", name: "Department of the Treasury", acronym: "TRES", status: "connected", lastSync: new Date(Date.now() - 180000), recordCount: 3847291, dataCategory: "Financial Records", complianceScore: 98, region: "National" },
  { id: "commerce", name: "Department of Commerce", acronym: "DOC", status: "maintenance", lastSync: new Date(Date.now() - 600000), recordCount: 982741, dataCategory: "Economic & Trade", complianceScore: 92, region: "National" },
  { id: "labor", name: "Department of Labor", acronym: "DOL", status: "connected", lastSync: new Date(Date.now() - 90000), recordCount: 1472910, dataCategory: "Employment Statistics", complianceScore: 93, region: "National" },
  { id: "sba", name: "Small Business Administration", acronym: "SBA", status: "connected", lastSync: new Date(Date.now() - 45000), recordCount: 628471, dataCategory: "Business Programs", complianceScore: 90, region: "National" },
]

const dataStreams: DataStream[] = [
  { id: "ds1", source: "GSA", destination: "Data Lake", recordsPerMinute: 1247, latency: 12, status: "active", protocol: "REST API", lastActivity: new Date() },
  { id: "ds2", source: "HHS", destination: "Data Lake", recordsPerMinute: 892, latency: 18, status: "active", protocol: "SFTP", lastActivity: new Date() },
  { id: "ds3", source: "DOT", destination: "Data Lake", recordsPerMinute: 2341, latency: 45, status: "degraded", protocol: "Kafka", lastActivity: new Date(Date.now() - 30000) },
  { id: "ds4", source: "EPA", destination: "Data Lake", recordsPerMinute: 567, latency: 8, status: "active", protocol: "REST API", lastActivity: new Date() },
  { id: "ds5", source: "Treasury", destination: "Data Lake", recordsPerMinute: 1892, latency: 15, status: "active", protocol: "gRPC", lastActivity: new Date() },
  { id: "ds6", source: "DOC", destination: "Data Lake", recordsPerMinute: 0, latency: 0, status: "inactive", protocol: "REST API", lastActivity: new Date(Date.now() - 3600000) },
  { id: "ds7", source: "DOL", destination: "Data Lake", recordsPerMinute: 734, latency: 22, status: "active", protocol: "SFTP", lastActivity: new Date() },
  { id: "ds8", source: "SBA", destination: "Data Lake", recordsPerMinute: 421, latency: 11, status: "active", protocol: "REST API", lastActivity: new Date() },
]

const dataQualityMetrics: DataQualityMetric[] = [
  { dimension: "Completeness", score: 94.2, issues: 847, trend: "up" },
  { dimension: "Accuracy", score: 98.1, issues: 234, trend: "stable" },
  { dimension: "Consistency", score: 91.7, issues: 1203, trend: "up" },
  { dimension: "Timeliness", score: 96.8, issues: 412, trend: "down" },
  { dimension: "Validity", score: 99.2, issues: 89, trend: "stable" },
  { dimension: "Uniqueness", score: 97.4, issues: 312, trend: "up" },
]

const etlJobs: ETLJob[] = [
  { id: "etl1", name: "GSA Contract Ingest", source: "GSA", schedule: "Every 15 min", lastRun: new Date(Date.now() - 300000), nextRun: new Date(Date.now() + 600000), status: "success", recordsProcessed: 12847, duration: 42 },
  { id: "etl2", name: "HHS Claims Processing", source: "HHS", schedule: "Hourly", lastRun: new Date(Date.now() - 1800000), nextRun: new Date(Date.now() + 1800000), status: "running", recordsProcessed: 89234, duration: 0 },
  { id: "etl3", name: "DOT Infrastructure Sync", source: "DOT", schedule: "Every 30 min", lastRun: new Date(Date.now() - 900000), nextRun: new Date(Date.now() + 900000), status: "failed", recordsProcessed: 0, duration: 0 },
  { id: "etl4", name: "Treasury Financial Roll-up", source: "Treasury", schedule: "Daily 2:00 AM", lastRun: new Date(Date.now() - 43200000), nextRun: new Date(Date.now() + 43200000), status: "success", recordsProcessed: 1847291, duration: 847 },
  { id: "etl5", name: "Cross-Agency Reconciliation", source: "Multiple", schedule: "Daily 4:00 AM", lastRun: new Date(Date.now() - 36000000), nextRun: new Date(Date.now() + 50400000), status: "scheduled", recordsProcessed: 0, duration: 0 },
  { id: "etl6", name: "EPA Compliance Extract", source: "EPA", schedule: "Every 6 hours", lastRun: new Date(Date.now() - 10800000), nextRun: new Date(Date.now() + 10800000), status: "success", recordsProcessed: 234891, duration: 312 },
]

const complianceControls: ComplianceControl[] = [
  { id: "cc1", family: "AC", name: "Access Control", implemented: 22, total: 25, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc2", family: "AU", name: "Audit & Accountability", implemented: 14, total: 16, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc3", family: "CA", name: "Security Assessment", implemented: 8, total: 9, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc4", family: "CM", name: "Configuration Management", implemented: 10, total: 14, status: "partial", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc5", family: "CP", name: "Contingency Planning", implemented: 11, total: 13, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc6", family: "IA", name: "Identification & Authentication", implemented: 11, total: 12, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc7", family: "IR", name: "Incident Response", implemented: 7, total: 10, status: "partial", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc8", family: "SC", name: "System & Communications Protection", implemented: 39, total: 44, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc9", family: "SI", name: "System & Information Integrity", implemented: 15, total: 17, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
  { id: "cc10", family: "PL", name: "Planning", implemented: 8, total: 8, status: "compliant", lastAssessed: new Date(Date.now() - 604800000) },
]

const accessPolicies: AccessPolicy[] = [
  { id: "ap1", tableName: "agency_contracts", policyName: "agency_isolation", scope: "Row-Level", condition: "agency_id = current_setting('app.agency_id')", lastModified: new Date(Date.now() - 86400000), enabled: true },
  { id: "ap2", tableName: "financial_records", policyName: "clearance_check", scope: "Row-Level", condition: "classification_level <= user_clearance()", lastModified: new Date(Date.now() - 172800000), enabled: true },
  { id: "ap3", tableName: "personnel_data", policyName: "pii_protection", scope: "Column-Level", condition: "has_role('pii_viewer') OR mask_ssn()", lastModified: new Date(Date.now() - 259200000), enabled: true },
  { id: "ap4", tableName: "cross_agency_refs", policyName: "multi_agency_access", scope: "Row-Level", condition: "agency_id = ANY(user_agencies())", lastModified: new Date(Date.now() - 345600000), enabled: true },
  { id: "ap5", tableName: "audit_logs", policyName: "audit_read_only", scope: "Table-Level", condition: "operation = 'SELECT'", lastModified: new Date(Date.now() - 432000000), enabled: true },
  { id: "ap6", tableName: "program_metrics", policyName: "regional_filter", scope: "Row-Level", condition: "region_code IN (user_regions())", lastModified: new Date(Date.now() - 518400000), enabled: false },
]

const auditEvents: AuditEvent[] = [
  { id: "ae1", timestamp: new Date(), user: "jsmith@gsa.gov", action: "SELECT", resource: "agency_contracts", status: "success", agency: "GSA" },
  { id: "ae2", timestamp: new Date(Date.now() - 60000), user: "mjohnson@hhs.gov", action: "UPDATE", resource: "program_metrics", status: "success", agency: "HHS" },
  { id: "ae3", timestamp: new Date(Date.now() - 120000), user: "analyst@external.com", action: "SELECT", resource: "financial_records", status: "denied", agency: "External" },
  { id: "ae4", timestamp: new Date(Date.now() - 180000), user: "admin@treasury.gov", action: "INSERT", resource: "audit_logs", status: "success", agency: "Treasury" },
  { id: "ae5", timestamp: new Date(Date.now() - 240000), user: "klee@dot.gov", action: "DELETE", resource: "temp_staging", status: "success", agency: "DOT" },
  { id: "ae6", timestamp: new Date(Date.now() - 300000), user: "rgarcia@epa.gov", action: "SELECT", resource: "personnel_data", status: "denied", agency: "EPA" },
  { id: "ae7", timestamp: new Date(Date.now() - 360000), user: "system@masip.gov", action: "TRUNCATE", resource: "etl_staging", status: "success", agency: "System" },
  { id: "ae8", timestamp: new Date(Date.now() - 420000), user: "bwilson@sba.gov", action: "UPDATE", resource: "agency_contracts", status: "success", agency: "SBA" },
]

// ============================================================================
// HEXAGON NAVIGATION COMPONENT
// ============================================================================

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "agencies", label: "Agencies", icon: Building2 },
  { id: "pipelines", label: "Pipelines", icon: Workflow },
  { id: "quality", label: "Quality", icon: Gauge },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "security", label: "Security", icon: Lock },
]

function HexagonButton({ 
  icon: Icon, 
  isActive, 
  onClick, 
  label 
}: { 
  icon: React.ElementType
  isActive: boolean
  onClick: () => void
  label: string
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`relative w-14 h-16 transition-all duration-200 ${
          isActive ? "scale-105" : "hover:scale-105"
        }`}
      >
        {/* Hexagon outer border */}
        <svg viewBox="0 0 56 64" className="absolute inset-0 w-full h-full">
          <polygon 
            points="28,2 54,18 54,46 28,62 2,46 2,18" 
            className={`transition-all duration-200 ${
              isActive 
                ? "fill-slate-800 stroke-slate-700" 
                : "fill-slate-100 stroke-slate-200 group-hover:fill-slate-200"
            }`}
            strokeWidth="2"
          />
          <polygon 
            points="28,6 50,20 50,44 28,58 6,44 6,20" 
            className={`transition-all duration-200 ${
              isActive 
                ? "fill-slate-800" 
                : "fill-white"
            }`}
          />
        </svg>
        {/* Icon centered on top */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon 
            size={20} 
            className={`transition-colors duration-200 ${
              isActive ? "text-white" : "text-slate-600 group-hover:text-slate-800"
            }`} 
          />
        </div>
        {/* Active indicator dot */}
        {isActive && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        )}
      </button>
      {/* Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
      </div>
    </div>
  )
}

function HexagonSidebar({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string
  onSectionChange: (section: string) => void
}) {
  return (
    <aside className="masip-sidebar-fixed fixed left-0 top-0 h-full w-20 bg-white border-r border-slate-200 z-50 flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-slate-100">
        <div className="relative w-12 h-14">
          <svg viewBox="0 0 48 56" className="absolute inset-0 w-full h-full">
            <polygon 
              points="24,2 46,16 46,40 24,54 2,40 2,16" 
              className="fill-slate-800 stroke-slate-700"
              strokeWidth="2"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Database size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Navigation hexagons */}
      <nav className="flex-1 flex flex-col items-center py-6 gap-2">
        {navItems.map((item) => (
          <HexagonButton
            key={item.id}
            icon={item.icon}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
            label={item.label}
          />
        ))}
      </nav>

      {/* Bottom settings */}
      <div className="pb-6 flex flex-col items-center gap-2">
        <HexagonButton
          icon={Settings}
          isActive={false}
          onClick={() => {}}
          label="Settings"
        />
      </div>
    </aside>
  )
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    connected: "bg-emerald-50 text-emerald-700 border-emerald-200",
    syncing: "bg-amber-50 text-amber-700 border-amber-200",
    maintenance: "bg-slate-100 text-slate-600 border-slate-200",
    pending: "bg-blue-50 text-blue-700 border-blue-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    degraded: "bg-amber-50 text-amber-700 border-amber-200",
    inactive: "bg-slate-100 text-slate-500 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    running: "bg-blue-50 text-blue-700 border-blue-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    scheduled: "bg-slate-100 text-slate-600 border-slate-200",
    compliant: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    "non-compliant": "bg-red-50 text-red-700 border-red-200",
    denied: "bg-red-50 text-red-700 border-red-200",
    error: "bg-red-50 text-red-700 border-red-200",
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === "syncing" || status === "running" ? "animate-pulse" : ""}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function MetricCard({ 
  label, 
  value, 
  change, 
  icon: Icon,
  subtitle,
  accentColor = "slate"
}: { 
  label: string
  value: string | number
  change?: number
  icon: React.ElementType
  subtitle?: string
  accentColor?: "slate" | "emerald" | "amber" | "blue" | "red"
}) {
  const accentStyles = {
    slate: "bg-slate-50 border-slate-200",
    emerald: "bg-emerald-50/50 border-emerald-200",
    amber: "bg-amber-50/50 border-amber-200",
    blue: "bg-blue-50/50 border-blue-200",
    red: "bg-red-50/50 border-red-200",
  }
  
  const iconBgStyles = {
    slate: "bg-slate-100",
    emerald: "bg-emerald-100",
    amber: "bg-amber-100",
    blue: "bg-blue-100",
    red: "bg-red-100",
  }
  
  const iconStyles = {
    slate: "text-slate-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
    red: "text-red-600",
  }

  return (
    <div className={`border rounded-xl p-5 hover:shadow-md transition-all duration-200 ${accentStyles[accentColor]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-slate-500"}`}>
              {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : null}
              <span>{change > 0 ? "+" : ""}{change}% from last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgStyles[accentColor]}`}>
          <Icon size={22} className={iconStyles[accentColor]} />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ 
  title, 
  subtitle,
  action 
}: { 
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function Card({ 
  children, 
  className = "",
  hover = true
}: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl ${hover ? "hover:shadow-md transition-shadow duration-200" : ""} ${className}`}>
      {children}
    </div>
  )
}

function ProgressBar({ value, max, color = "slate", showLabel = true }: { value: number; max: number; color?: string; showLabel?: boolean }) {
  const percentage = Math.round((value / max) * 100)
  const colors: Record<string, string> = {
    slate: "bg-slate-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  }
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-semibold text-slate-600 w-10 text-right">{percentage}%</span>}
    </div>
  )
}

// ============================================================================
// DATA FLOW VISUALIZATION COMPONENT
// ============================================================================

function DataFlowVisualization({ agencies, streams }: { agencies: Agency[]; streams: DataStream[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(600)
  const [particles, setParticles] = useState<{ id: number; progress: number; sourceIdx: number; targetIdx: number }[]>([])

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerW(containerRef.current.clientWidth)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev
          .map(p => ({ ...p, progress: p.progress + 2 }))
          .filter(p => p.progress < 100)

        // Add new particles randomly
        if (Math.random() > 0.7 && updated.length < 8) {
          updated.push({
            id: Date.now(),
            progress: 0,
            sourceIdx: Math.floor(Math.random() * 4),
            targetIdx: Math.floor(Math.random() * 3)
          })
        }

        return updated
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const connectedAgencies = agencies.filter(a => a.status === "connected" || a.status === "syncing").slice(0, 4)

  // Layout constants derived from container width
  const leftX = 72               // right edge of agency nodes
  const centerX = containerW / 2 // horizontal center (Data Lake center)
  const rightX = containerW - 88 // left edge of output buttons (right-6=24px + w-16=64px)
  const centerY = 96             // vertical center of 192px (h-48) container

  return (
    <div ref={containerRef} className="masip-dataflow relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden border border-slate-200">
      {/* Left side - Agency nodes */}
      <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-around py-4">
        {connectedAgencies.map((agency, idx) => (
          <div key={agency.id} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ${
              agency.status === "syncing"
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-white text-slate-700 border border-slate-200"
            }`}>
              {agency.acronym}
            </div>
          </div>
        ))}
      </div>

      {/* Center - Data Lake */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center shadow-xl">
            <Database size={32} className="text-white" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-slate-800/20 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-slate-600 text-center mt-2">Data Lake</p>
      </div>

      {/* Right side - Output nodes */}
      <div className="absolute right-6 top-0 bottom-0 flex flex-col justify-around py-8">
        {["Analytics", "Reports", "APIs"].map((output) => (
          <div key={output} className="flex items-center gap-2">
            <div className="w-16 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shadow-sm">
              {output}
            </div>
          </div>
        ))}
      </div>

      {/* SVG for connection lines and particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Input lines */}
        {connectedAgencies.map((_, idx) => {
          const yPos = 24 + idx * 48 + 20
          return (
            <line
              key={`in-${idx}`}
              x1="72"
              y1={yPos}
              x2="calc(50% - 48px)"
              y2="96"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Output lines */}
        {[0, 1, 2].map((idx) => {
          const yPos = 32 + idx * 64 + 16
          return (
            <line
              key={`out-${idx}`}
              x1="calc(50% + 48px)"
              y1="96"
              x2="calc(100% - 88px)"
              y2={yPos}
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Animated particles — travel from agency node → Data Lake → output button */}
        {particles.map(particle => {
          const t = particle.progress / 100
          const yStart = 24 + particle.sourceIdx * 48 + 20
          const yEnd = 32 + particle.targetIdx * 64 + 16

          let x: number, y: number
          if (t < 0.5) {
            // Phase 1: left agency node → Data Lake center
            const seg = t * 2
            x = leftX + (centerX - 40 - leftX) * seg
            y = yStart + (centerY - yStart) * seg
          } else {
            // Phase 2: Data Lake center → output button
            const seg = (t - 0.5) * 2
            x = (centerX + 40) + (rightX - centerX - 40) * seg
            y = centerY + (yEnd - centerY) * seg
          }

          // Fade out as particle is absorbed at destination
          const opacity = t > 0.85 ? (1 - t) / 0.15 : 1

          return (
            <circle
              key={particle.id}
              cx={x}
              cy={y}
              r="4"
              fill="#10b981"
              opacity={opacity}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================================
// LIVE ACTIVITY FEED COMPONENT
// ============================================================================

function LiveActivityFeed({ events }: { events: AuditEvent[] }) {
  const [visibleEvents, setVisibleEvents] = useState(events.slice(0, 5))
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleEvents(prev => {
        const newEvent = {
          ...events[Math.floor(Math.random() * events.length)],
          id: `ae-${Date.now()}`,
          timestamp: new Date()
        }
        return [newEvent, ...prev.slice(0, 4)]
      })
    }, 5000)
    
    return () => clearInterval(interval)
  }, [events])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="space-y-2">
      {visibleEvents.map((event, idx) => (
        <div 
          key={event.id} 
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
            idx === 0 ? "bg-slate-50 border border-slate-200" : "bg-white"
          }`}
          style={{ opacity: 1 - idx * 0.15 }}
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            event.status === "success" ? "bg-emerald-500" : 
            event.status === "denied" ? "bg-red-500" : "bg-amber-500"
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 truncate">
              <span className="font-medium">{event.user}</span>
              <span className="text-slate-400 mx-1">{event.action}</span>
              <span className="font-mono text-xs text-slate-500">{event.resource}</span>
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono flex-shrink-0">
            {formatTime(event.timestamp)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function OverviewSection({ liveMetrics, agencies, etlJobs, dataStreams, auditEvents }: { 
  liveMetrics: { totalRecords: number; activeConnections: number; processingRate: number; complianceScore: number }
  agencies: Agency[]
  etlJobs: ETLJob[]
  dataStreams: DataStream[]
  auditEvents: AuditEvent[]
}) {
  const activeStreams = dataStreams.filter(s => s.status === "active").length
  const runningJobs = etlJobs.filter(j => j.status === "running").length
  const failedJobs = etlJobs.filter(j => j.status === "failed").length

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Platform Overview" 
        subtitle="Real-time metrics and system health"
        action={
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Radio size={14} className="animate-pulse" />
              Live
            </span>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Records" 
          value={liveMetrics.totalRecords} 
          change={2.4}
          icon={Database}
          accentColor="blue"
        />
        <MetricCard 
          label="Active Connections" 
          value={liveMetrics.activeConnections} 
          subtitle={`${activeStreams} streams active`}
          icon={Network}
          accentColor="emerald"
        />
        <MetricCard 
          label="Processing Rate" 
          value={`${liveMetrics.processingRate.toLocaleString()}/min`}
          change={5.2}
          icon={Zap}
          accentColor="amber"
        />
        <MetricCard 
          label="Compliance Score" 
          value={`${liveMetrics.complianceScore}%`}
          icon={ShieldCheck}
          accentColor="slate"
        />
      </div>

      {/* Data Flow Visualization */}
      <Card className="p-5" hover={false}>
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Activity size={16} />
          Data Flow Visualization
        </h3>
        <DataFlowVisualization agencies={agencies} streams={dataStreams} />
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agency Status Grid */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Building2 size={16} />
            Agency Connections
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {agencies.slice(0, 6).map(agency => (
              <div 
                key={agency.id} 
                className={`p-3 rounded-lg border transition-all ${
                  agency.status === "connected" 
                    ? "bg-emerald-50/50 border-emerald-200" 
                    : agency.status === "syncing"
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{agency.acronym}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    agency.status === "connected" ? "bg-emerald-500" :
                    agency.status === "syncing" ? "bg-amber-500 animate-pulse" :
                    "bg-slate-400"
                  }`} />
                </div>
                <p className="text-xs text-slate-500 truncate">{agency.dataCategory}</p>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  {(agency.recordCount / 1000000).toFixed(1)}M records
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Activity size={16} />
            Live Activity Feed
          </h3>
          <LiveActivityFeed events={auditEvents} />
        </Card>
      </div>

      {/* ETL Jobs Status */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Workflow size={16} />
          ETL Pipeline Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {etlJobs.slice(0, 3).map(job => (
            <div key={job.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800 text-sm">{job.name}</span>
                <StatusBadge status={job.status} />
              </div>
              <p className="text-xs text-slate-500">{job.schedule}</p>
              {job.status === "running" && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              )}
              {job.recordsProcessed > 0 && (
                <p className="text-xs font-medium text-slate-600 mt-2">
                  {job.recordsProcessed.toLocaleString()} records processed
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function AgenciesSection({ agencies }: { agencies: Agency[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.acronym.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || agency.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Agency Connections" 
        subtitle="Federal partner data sources and sync status"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
            <RefreshCw size={14} />
            Sync All
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">All Status</option>
          <option value="connected">Connected</option>
          <option value="syncing">Syncing</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Agency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgencies.map(agency => (
          <Card key={agency.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                  agency.status === "connected" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : agency.status === "syncing"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {agency.acronym}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{agency.name}</h3>
                  <p className="text-xs text-slate-500">{agency.dataCategory}</p>
                </div>
              </div>
              <StatusBadge status={agency.status} />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Records</p>
                <p className="font-semibold text-slate-800">{(agency.recordCount / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Compliance</p>
                <p className="font-semibold text-slate-800">{agency.complianceScore}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Sync</p>
                <p className="font-semibold text-slate-800">{formatTime(agency.lastSync)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Sync Progress</span>
                <span>100%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    agency.status === "syncing" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  }`}
                  style={{ width: agency.status === "syncing" ? "65%" : "100%" }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PipelinesSection({ streams, etlJobs }: { streams: DataStream[]; etlJobs: ETLJob[] }) {
  const [selectedTab, setSelectedTab] = useState<"streams" | "jobs">("streams")
  
  const totalThroughput = streams.reduce((acc, s) => acc + s.recordsPerMinute, 0)
  const avgLatency = Math.round(streams.filter(s => s.status === "active").reduce((acc, s) => acc + s.latency, 0) / streams.filter(s => s.status === "active").length)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Data Pipelines" 
        subtitle="Real-time data streams and ETL job management"
      />

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Throughput" value={`${totalThroughput.toLocaleString()}/min`} icon={Zap} accentColor="blue" />
        <MetricCard label="Avg Latency" value={`${avgLatency}ms`} icon={Clock} accentColor="emerald" />
        <MetricCard label="Active Streams" value={streams.filter(s => s.status === "active").length} icon={Activity} accentColor="amber" />
        <MetricCard label="Running Jobs" value={etlJobs.filter(j => j.status === "running").length} icon={Workflow} />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setSelectedTab("streams")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selectedTab === "streams" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Data Streams
        </button>
        <button
          onClick={() => setSelectedTab("jobs")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selectedTab === "jobs" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
          }`}
        >
          ETL Jobs
        </button>
      </div>

      {selectedTab === "streams" ? (
        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Source</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Destination</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Protocol</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Throughput</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Latency</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {streams.map((stream, idx) => (
                  <tr key={stream.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{stream.source}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-600">{stream.destination}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">
                        {stream.protocol}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-medium ${stream.recordsPerMinute > 0 ? "text-slate-800" : "text-slate-400"}`}>
                        {stream.recordsPerMinute.toLocaleString()}/min
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-medium ${
                        stream.latency < 20 ? "text-emerald-600" : 
                        stream.latency < 40 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {stream.latency}ms
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={stream.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Job Name</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Source</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Schedule</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Last Run</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Records</th>
                  <th className="text-left text-xs font-semibold text-slate-600 px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {etlJobs.map((job, idx) => (
                  <tr key={job.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{job.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-600">{job.source}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{job.schedule}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{formatTime(job.lastRun)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-800">
                        {job.recordsProcessed > 0 ? job.recordsProcessed.toLocaleString() : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

function QualitySection({ metrics }: { metrics: DataQualityMetric[] }) {
  const overallScore = Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length * 10) / 10
  const totalIssues = metrics.reduce((acc, m) => acc + m.issues, 0)

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Data Quality" 
        subtitle="Quality metrics across all data dimensions"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Overall DQ Score" value={`${overallScore}%`} icon={Gauge} accentColor="emerald" />
        <MetricCard label="Total Issues" value={totalIssues} icon={AlertCircle} accentColor="amber" />
        <MetricCard label="Dimensions Monitored" value={metrics.length} icon={Layers} accentColor="blue" />
      </div>

      {/* Quality Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <Card key={metric.dimension} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">{metric.dimension}</h3>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                metric.trend === "up" ? "text-emerald-600" : 
                metric.trend === "down" ? "text-red-600" : "text-slate-500"
              }`}>
                {metric.trend === "up" ? <TrendingUp size={12} /> : 
                 metric.trend === "down" ? <TrendingDown size={12} /> : null}
                {metric.trend.charAt(0).toUpperCase() + metric.trend.slice(1)}
              </div>
            </div>
            
            <div className="flex items-end gap-3 mb-4">
              <span className={`text-3xl font-bold ${
                metric.score >= 95 ? "text-emerald-600" :
                metric.score >= 90 ? "text-amber-600" : "text-red-600"
              }`}>
                {metric.score}%
              </span>
              <span className="text-sm text-slate-500 pb-1">
                {metric.issues.toLocaleString()} issues
              </span>
            </div>

            <ProgressBar 
              value={metric.score} 
              max={100} 
              color={metric.score >= 95 ? "emerald" : metric.score >= 90 ? "amber" : "red"} 
            />
          </Card>
        ))}
      </div>

      {/* Quality Trend Chart Placeholder */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Quality Score Trends (30 Days)</h3>
        <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
          <div className="text-center">
            <BarChart3 size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Quality trend visualization</p>
            <p className="text-xs text-slate-400 mt-1">All dimensions trending stable or improving</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ComplianceSection({ controls }: { controls: ComplianceControl[] }) {
  const compliantCount = controls.filter(c => c.status === "compliant").length
  const partialCount = controls.filter(c => c.status === "partial").length
  const totalImplemented = controls.reduce((acc, c) => acc + c.implemented, 0)
  const totalControls = controls.reduce((acc, c) => acc + c.total, 0)
  const overallPercentage = Math.round((totalImplemented / totalControls) * 100)

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Compliance Dashboard" 
        subtitle="NIST 800-53 control implementation status"
        action={
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={14} />
            Export Report
          </button>
        }
      />

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Overall Compliance" value={`${overallPercentage}%`} icon={ShieldCheck} accentColor="emerald" />
        <MetricCard label="Controls Implemented" value={`${totalImplemented}/${totalControls}`} icon={CheckCircle} accentColor="blue" />
        <MetricCard label="Fully Compliant" value={compliantCount} subtitle="control families" icon={Shield} />
        <MetricCard label="Partial Implementation" value={partialCount} subtitle="control families" icon={AlertCircle} accentColor="amber" />
      </div>

      {/* Control Families */}
      <Card hover={false}>
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Control Family Implementation</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {controls.map(control => (
            <div key={control.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {control.family}
                  </span>
                  <div>
                    <h4 className="font-medium text-slate-800">{control.name}</h4>
                    <p className="text-xs text-slate-500">
                      {control.implemented} of {control.total} controls implemented
                    </p>
                  </div>
                </div>
                <StatusBadge status={control.status} />
              </div>
              <ProgressBar 
                value={control.implemented} 
                max={control.total} 
                color={control.status === "compliant" ? "emerald" : control.status === "partial" ? "amber" : "red"} 
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SecuritySection({ policies, events }: { policies: AccessPolicy[]; events: AuditEvent[] }) {
  const enabledPolicies = policies.filter(p => p.enabled).length
  const deniedEvents = events.filter(e => e.status === "denied").length

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Access Control & Security" 
        subtitle="Row-level security policies and access audit"
      />

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Active Policies" value={enabledPolicies} subtitle={`of ${policies.length} total`} icon={Shield} accentColor="emerald" />
        <MetricCard label="Access Denials" value={deniedEvents} subtitle="last 24 hours" icon={Lock} accentColor="red" />
        <MetricCard label="Tables Protected" value={new Set(policies.map(p => p.tableName)).size} icon={Table2} accentColor="blue" />
        <MetricCard label="Audit Events" value={events.length} subtitle="recent activity" icon={FileText} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RLS Policies */}
        <Card hover={false}>
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Row-Level Security Policies</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {policies.map(policy => (
              <div key={policy.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-800">{policy.tableName}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{policy.scope}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${policy.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
                <p className="text-xs text-slate-500 mb-2">{policy.policyName}</p>
                <code className="block text-xs bg-slate-100 text-slate-700 p-2 rounded font-mono overflow-x-auto">
                  {policy.condition}
                </code>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Audit Events */}
        <Card hover={false}>
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Recent Access Audit</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {events.map(event => (
              <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      event.status === "success" ? "bg-emerald-500" : 
                      event.status === "denied" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <span className="font-medium text-slate-800 text-sm">{event.user}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {event.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    event.action === "SELECT" ? "bg-blue-50 text-blue-700" :
                    event.action === "INSERT" ? "bg-emerald-50 text-emerald-700" :
                    event.action === "UPDATE" ? "bg-amber-50 text-amber-700" :
                    "bg-red-50 text-red-700"
                  }`}>
                    {event.action}
                  </span>
                  <span className="font-mono text-slate-600">{event.resource}</span>
                  <span className="text-slate-400">via</span>
                  <span className="text-slate-600">{event.agency}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MASIPDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [liveMetrics, setLiveMetrics] = useState({
    totalRecords: 13841690,
    activeConnections: 7,
    processingRate: 8094,
    complianceScore: 94
  })

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        totalRecords: prev.totalRecords + Math.floor(Math.random() * 100),
        processingRate: 8094 + Math.floor(Math.random() * 500) - 250
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection liveMetrics={liveMetrics} agencies={agencies} etlJobs={etlJobs} dataStreams={dataStreams} auditEvents={auditEvents} />
      case "agencies":
        return <AgenciesSection agencies={agencies} />
      case "pipelines":
        return <PipelinesSection streams={dataStreams} etlJobs={etlJobs} />
      case "quality":
        return <QualitySection metrics={dataQualityMetrics} />
      case "compliance":
        return <ComplianceSection controls={complianceControls} />
      case "security":
        return <SecuritySection policies={accessPolicies} events={auditEvents} />
      default:
        return <OverviewSection liveMetrics={liveMetrics} agencies={agencies} etlJobs={etlJobs} dataStreams={dataStreams} auditEvents={auditEvents} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
@media (max-width: 640px) {
  /* Sidebar: keep visible but narrow to 48px */
  .masip-sidebar-fixed { width: 48px !important; min-width: 48px !important; }
  /* Logo area: shrink */
  .masip-sidebar-fixed .h-20 { height: 48px !important; }
  .masip-sidebar-fixed .w-12.h-14 { width: 28px !important; height: 32px !important; }
  /* Tooltip labels: hide on mobile */
  .masip-sidebar-fixed .group\\/btn .absolute { display: none !important; }
  /* Hexagon buttons: shrink */
  .masip-sidebar-fixed button { width: 32px !important; height: 32px !important; padding: 0 !important; }
  .masip-sidebar-fixed svg { width: 18px !important; height: 18px !important; }
  /* Settings at bottom: fit */
  .masip-sidebar-fixed .pb-6 { padding-bottom: 4px !important; }

  /* Main content: offset by 48px to clear sidebar */
  .masip-main { margin-left: 48px !important; overflow-x: hidden !important; }

  /* Header: compact */
  .masip-main header .px-8 { padding-left: 10px !important; padding-right: 10px !important; }
  .masip-main header .py-4 { padding-top: 8px !important; padding-bottom: 8px !important; }
  .masip-main header .flex { flex-wrap: wrap !important; gap: 6px !important; }
  .masip-main header h1 { font-size: 0.85rem !important; }
  .masip-main header p { font-size: 0.65rem !important; }
  .masip-main header .gap-4 { gap: 6px !important; }
  .masip-main header button { padding: 4px !important; }

  /* Content area: reduce padding */
  .masip-main .p-8 { padding: 12px !important; }
  .masip-main .p-6 { padding: 10px !important; }

  /* Grids: collapse */
  .masip-main .grid-cols-2 { grid-template-columns: 1fr !important; }
  .masip-main .grid-cols-3 { grid-template-columns: 1fr 1fr !important; }
  .masip-main .grid-cols-4 { grid-template-columns: 1fr 1fr !important; }
  .masip-main .grid-cols-5,
  .masip-main .grid-cols-6 { grid-template-columns: 1fr 1fr !important; }

  /* Tables */
  .masip-main table { font-size: 0.65rem !important; }
  .masip-main .overflow-x-auto { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }

  /* Footer */
  .masip-main footer .flex { flex-wrap: wrap !important; gap: 4px !important; }
  .masip-main footer * { font-size: 0.6rem !important; }

  /* Data flow: taller on mobile so nodes aren't clipped */
  .masip-main .masip-dataflow { height: 300px !important; overflow: hidden !important; }
  /* Scale down agency nodes (w-10 h-10) */
  .masip-main .masip-dataflow .w-10.h-10 { width: 1.75rem !important; height: 1.75rem !important; font-size: 0.5rem !important; }
  /* Scale down Data Lake center (w-20 h-20) */
  .masip-main .masip-dataflow .w-20.h-20 { width: 3rem !important; height: 3rem !important; }
  .masip-main .masip-dataflow .w-20.h-20 svg { width: 18px !important; height: 18px !important; }
  /* Scale down output nodes (w-16 h-8) */
  .masip-main .masip-dataflow .w-16.h-8 { width: 3rem !important; height: 1.5rem !important; font-size: 0.6rem !important; }
}
`}</style>
      {/* Hexagon Sidebar */}
      <HexagonSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Main Content */}
      <main className="ml-20 min-h-screen masip-main">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Multi-Agency Situational Intelligence Pipeline
              </h1>
              <p className="text-sm text-slate-500">Federal Data Integration Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">System Operational</span>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Search size={18} className="text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings size={18} className="text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {renderSection()}
        </div>

        {/* Footer */}

        {/* ─── PROJECT FOOTER ────────────────────────────────────── */}
        <div style={{
          borderTop: "1px solid #cccccc",
          marginTop: 40,
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
            <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (TypeScript/TSX), Python (Pandas, SQLAlchemy, Celery), Apache Kafka (event streaming, multi-topic pipeline), PostgreSQL 15 (PostGIS — geospatial agency region indexing), Redis (session caching, real-time counter pub/sub), Elasticsearch 8 (cross-agency full-text search + aggregations), Apache Airflow (DAG orchestration for agency sync pipelines), AWS GovCloud (EC2, RDS, S3, IAM role federation), Tailwind CSS, lucide-react, NIST 800-53 / FedRAMP control mapping
          </p>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong style={{ color: "#1a1a14" }}>Methods:</strong> Multi-agency data fusion architecture using Kafka topic-per-agency stream ingestion with exactly-once semantics; real-time compliance score calculation against NIST 800-53 control families (AC, AU, SI, IA) per agency connection; agency sync state machine (connected → syncing → maintenance → pending) with automated retry logic; Elasticsearch aggregation queries for cross-agency record counts and anomaly surface area; Airflow DAG scheduling for agency data extract windows (15-min, hourly, daily cadence); FedRAMP-aligned audit trail generation on every pipeline action; geospatial region assignment using PostGIS ST_Contains for agency jurisdiction mapping; classified data stream handling with simulated encryption-at-rest logging (AES-256 envelope, RSA-4096 key exchange handshake)
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#1a1a14" }}>Sources:</strong> Agency configurations and stream records simulate a federated intelligence pipeline modeled on DHS HSIN, IC ITE, and OMB CPIC data-sharing frameworks; compliance benchmarks reference NIST SP 800-53 Rev 5 control catalog and FedRAMP High baseline; pipeline architecture reflects IC data integration patterns from DNI and CISA cross-agency sharing directives; all agency data, record counts, and sync metrics are simulated for demonstration
          </p>
        </div>
        <footer className="border-t border-slate-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Portfolio Demonstration Project</span>
            <span>Last Updated: {new Date().toLocaleString("en-US", { 
              month: "short", 
              day: "numeric", 
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
