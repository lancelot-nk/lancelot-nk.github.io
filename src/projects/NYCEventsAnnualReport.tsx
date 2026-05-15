"use client"

import { useState, useEffect, useRef } from "react"

// ═══════════════════════════════════════════════════════════════════════════════
// CITY OF NEW YORK — EVENTS & COMMUNITY DATA
// INTERACTIVE ANNUAL REPORT FY2024
// PUBLIC-FACING SYSTEM DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

const DATA = {
  fiscalYear: "FY2024",
  dateRange: "October 2023 — May 2025",
  totalEvents: 847,
  totalAttendees: 284650,
  boroughs: [
    { name: "Manhattan", events: 312, attendees: 98400, growth: 42 },
    { name: "Brooklyn", events: 218, attendees: 76200, growth: 38 },
    { name: "Queens", events: 156, attendees: 52100, growth: 31 },
    { name: "Bronx", events: 98, attendees: 34800, growth: 28 },
    { name: "Staten Island", events: 63, attendees: 23150, growth: 24 },
  ],
  monthlyData: [
    { month: "Oct 2023", events: 42, attendees: 14200, conversion: 68 },
    { month: "Nov 2023", events: 38, attendees: 12800, conversion: 71 },
    { month: "Dec 2023", events: 31, attendees: 18500, conversion: 74 },
    { month: "Jan 2024", events: 45, attendees: 15600, conversion: 72 },
    { month: "Feb 2024", events: 52, attendees: 17200, conversion: 75 },
    { month: "Mar 2024", events: 68, attendees: 22400, conversion: 78 },
    { month: "Apr 2024", events: 74, attendees: 26800, conversion: 81 },
    { month: "May 2024", events: 82, attendees: 28900, conversion: 83 },
    { month: "Jun 2024", events: 89, attendees: 31200, conversion: 82 },
    { month: "Jul 2024", events: 78, attendees: 27400, conversion: 79 },
    { month: "Aug 2024", events: 71, attendees: 24100, conversion: 77 },
    { month: "Sep 2024", events: 65, attendees: 21800, conversion: 76 },
    { month: "Oct 2024", events: 58, attendees: 19200, conversion: 78 },
    { month: "Nov 2024", events: 54, attendees: 18650, conversion: 80 },
  ],
  eventCategories: [
    { name: "Cultural & Arts", count: 187, color: "#C45B28" },
    { name: "Community Forums", count: 156, color: "#1E3A5F" },
    { name: "Youth Programs", count: 142, color: "#4A7C59" },
    { name: "Health & Wellness", count: 118, color: "#8B4B6E" },
    { name: "Economic Development", count: 96, color: "#6B5B3D" },
    { name: "Senior Services", count: 78, color: "#3D6B8B" },
    { name: "Environmental", count: 70, color: "#2D5A4A" },
  ],
  platforms: [
    { name: "Cvent", usage: 34, type: "Event Management" },
    { name: "Eventbrite", usage: 28, type: "Ticketing" },
    { name: "Salesforce CRM", usage: 100, type: "Data Integration" },
    { name: "Mailchimp", usage: 92, type: "Outreach" },
    { name: "Tableau", usage: 100, type: "Analytics" },
    { name: "Partiful", usage: 18, type: "Community Events" },
    { name: "Zapier", usage: 86, type: "Automation" },
    { name: "Asana", usage: 78, type: "Project Management" },
    { name: "Monday.com", usage: 72, type: "Workflow" },
    { name: "Slido", usage: 45, type: "Engagement" },
    { name: "Microsoft Teams", usage: 100, type: "Communication" },
    { name: "Microsoft Excel", usage: 100, type: "Reporting" },
  ],
  keyMetrics: {
    attendanceGrowth: 35,
    eventGrowth: 30,
    platformConversion: 78,
    communityReach: 1.2,
    satisfactionRate: 94,
    returnAttendeeRate: 67,
    avgEventCapacity: 82,
    responseTime: 2.4,
  },
  funding: {
    total: 4850000,
    allocated: [
      { category: "Venue & Logistics", amount: 1650000, percent: 34 },
      { category: "Community Outreach", amount: 970000, percent: 20 },
      { category: "Technology & Platforms", amount: 727500, percent: 15 },
      { category: "Staff & Operations", amount: 679000, percent: 14 },
      { category: "Marketing & Communications", amount: 485000, percent: 10 },
      { category: "Accessibility & Inclusion", amount: 338500, percent: 7 },
    ],
  },
  timeline: [
    { date: "Oct 2023", event: "Program Launch", type: "milestone" },
    { date: "Dec 2023", event: "Salesforce CRM Integration Complete", type: "tech" },
    { date: "Feb 2024", event: "100th Event Milestone", type: "milestone" },
    { date: "Mar 2024", event: "Zapier Automation Deployed", type: "tech" },
    { date: "Apr 2024", event: "Borough Equity Initiative Launched", type: "policy" },
    { date: "Jun 2024", event: "500th Event Celebrated", type: "milestone" },
    { date: "Aug 2024", event: "Real-Time Analytics Dashboard", type: "tech" },
    { date: "Oct 2024", event: "1M+ Community Touchpoints", type: "milestone" },
    { date: "Jan 2025", event: "FY2025 Planning Initiated", type: "policy" },
    { date: "May 2025", event: "Program Cycle Completion", type: "milestone" },
  ],
  neighborhoods: [
    { name: "Harlem", events: 42, equity: "High Priority" },
    { name: "South Bronx", events: 38, equity: "High Priority" },
    { name: "East New York", events: 35, equity: "High Priority" },
    { name: "Jamaica, Queens", events: 31, equity: "Priority" },
    { name: "North Shore SI", events: 28, equity: "Priority" },
    { name: "Bushwick", events: 34, equity: "Priority" },
    { name: "Washington Heights", events: 29, equity: "High Priority" },
    { name: "Coney Island", events: 26, equity: "Priority" },
  ],
}

const SECTIONS = [
  { id: "cover", label: "Cover" },
  { id: "executive", label: "Executive Summary" },
  { id: "metrics", label: "Key Metrics" },
  { id: "timeline", label: "Timeline" },
  { id: "boroughs", label: "Borough Analysis" },
  { id: "categories", label: "Event Categories" },
  { id: "platforms", label: "Technology Stack" },
  { id: "funding", label: "Funding Allocation" },
  { id: "equity", label: "Equity Distribution" },
  { id: "appendix", label: "Appendix" },
]

export default function AnnualReport() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState("cover")
  const [syncTime, setSyncTime] = useState(new Date())
  const [isSyncing, setIsSyncing] = useState(false)
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null)
  const [animatedMetrics, setAnimatedMetrics] = useState({
    events: 0,
    attendees: 0,
    growth: 0,
  })
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollProgress(progress)

      const sectionElements = SECTIONS.map((s) => ({
        id: s.id,
        el: document.getElementById(s.id),
      }))

      for (const section of sectionElements.reverse()) {
        if (section.el) {
          const rect = section.el.getBoundingClientRect()
          if (rect.top <= 200) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    const container = containerRef.current
    container?.addEventListener("scroll", handleScroll)
    return () => container?.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)

      setAnimatedMetrics({
        events: Math.round(DATA.totalEvents * eased),
        attendees: Math.round(DATA.totalAttendees * eased),
        growth: Math.round(DATA.keyMetrics.attendanceGrowth * eased),
      })

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setSyncTime(new Date())
      setIsSyncing(false)
    }, 2500)
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  const formatNumber = (n: number) => n.toLocaleString()
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n)

  return (
    <div className="nyc-annual-root relative min-h-screen bg-[#FDFBF7] text-[#1A1A1A]" style={{ fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @media (max-width: 640px) {
          .nyc-annual-root { overflow: visible !important; }
          .nyc-scroll-area { height: auto !important; overflow-y: visible !important; }
        }
      `}</style>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#E8E4DC] z-50">
        <div
          className="h-full bg-[#1E3A5F] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Hexagonal Navigation */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1">
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative"
            title={section.label}
          >
            <svg
              width="32"
              height="36"
              viewBox="0 0 32 36"
              className={`transition-all duration-300 ${
                activeSection === section.id
                  ? "scale-110"
                  : "scale-100 opacity-60 hover:opacity-100"
              }`}
            >
              <path
                d="M16 0L32 9V27L16 36L0 27V9L16 0Z"
                fill={activeSection === section.id ? "#1E3A5F" : "#E8E4DC"}
                className="transition-colors duration-300"
              />
              <text
                x="16"
                y="21"
                textAnchor="middle"
                fill={activeSection === section.id ? "#FDFBF7" : "#1E3A5F"}
                fontSize="11"
                fontWeight="600"
              >
                {i + 1}
              </text>
            </svg>
            <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-[#1E3A5F] text-[#FDFBF7] px-3 py-1 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {section.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Data Sync Indicator */}
      <div className="fixed top-4 right-6 z-40 flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-[#E8E4DC] rounded-lg px-4 py-2 shadow-sm">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-[#6B7280]">
            Last Sync
          </span>
          <span className="text-xs font-mono text-[#1E3A5F]">
            {syncTime.toLocaleTimeString()}
          </span>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`w-8 h-8 rounded-full border-2 border-[#1E3A5F] flex items-center justify-center transition-all ${
            isSyncing ? "animate-spin" : "hover:bg-[#1E3A5F] hover:text-white"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 11-6.22-8.56" />
            <path d="M21 4v4h-4" />
          </svg>
        </button>
      </div>

      {/* Main Content Container */}
      <div
        ref={containerRef}
        className="nyc-scroll-area h-screen overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* COVER SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="cover"
          className="min-h-screen flex flex-col justify-center items-center px-8 py-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="#1E3A5F"
                  strokeWidth="1"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-[#FDFBF7] rounded-full text-sm font-medium tracking-wide">
                <span className="w-2 h-2 bg-[#C45B28] rounded-full animate-pulse" />
                OFFICIAL MUNICIPAL REPORT
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-light text-[#1E3A5F] leading-tight mb-6 tracking-tight">
              City of New York
              <span className="block font-semibold mt-2">
                Events & Community Data
              </span>
            </h1>

            <div className="w-24 h-1 bg-[#C45B28] mx-auto my-8" />

            <p className="text-xl md:text-2xl text-[#4A5568] font-light mb-4">
              Interactive Annual Report
            </p>
            <p className="text-lg text-[#6B7280] font-mono">
              {DATA.dateRange}
            </p>

            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold text-[#1E3A5F]">
                  {formatNumber(animatedMetrics.events)}
                </div>
                <div className="text-sm text-[#6B7280] mt-2 uppercase tracking-wider">
                  Total Events
                </div>
              </div>
              <div className="text-center border-x border-[#E8E4DC]">
                <div className="text-4xl md:text-5xl font-semibold text-[#1E3A5F]">
                  {formatNumber(animatedMetrics.attendees)}
                </div>
                <div className="text-sm text-[#6B7280] mt-2 uppercase tracking-wider">
                  Attendees
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold text-[#C45B28]">
                  +{animatedMetrics.growth}%
                </div>
                <div className="text-sm text-[#6B7280] mt-2 uppercase tracking-wider">
                  YoY Growth
                </div>
              </div>
            </div>

            <div className="mt-20 animate-bounce">
              <svg
                className="w-6 h-6 mx-auto text-[#1E3A5F] opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* EXECUTIVE SUMMARY */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="executive" className="py-24 px-8 bg-[#1E3A5F] text-[#FDFBF7]">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 01
            </div>
            <h2 className="text-4xl md:text-5xl font-light mb-12">
              Executive Summary
            </h2>

            <div className="space-y-8">
              <p className="text-xl leading-relaxed text-[#E8E4DC]">
                This report presents a comprehensive analysis of the City of New
                York&apos;s Events & Community Data program spanning fiscal year 2024.
                Through strategic implementation of data integration methodologies
                and innovative outreach strategies, the program achieved
                unprecedented growth in civic engagement.
              </p>

              <div className="grid md:grid-cols-2 gap-8 my-12">
                <div className="bg-[#2D4A6F] rounded-lg p-6">
                  <h3 className="text-[#C45B28] font-semibold mb-3 text-lg">
                    Primary Objective
                  </h3>
                  <p className="text-[#E8E4DC] text-sm leading-relaxed">
                    Direct full-cycle Program Development and event design for NYC
                    using advanced Data Integration strategies to drive informed
                    process improvements across all five boroughs.
                  </p>
                </div>
                <div className="bg-[#2D4A6F] rounded-lg p-6">
                  <h3 className="text-[#C45B28] font-semibold mb-3 text-lg">
                    Key Achievement
                  </h3>
                  <p className="text-[#E8E4DC] text-sm leading-relaxed">
                    Created innovative outreach strategies alongside Data Analysis
                    that increased overall platform conversion and boosted event
                    attendance by 35% with 30% more events citywide.
                  </p>
                </div>
              </div>

              <blockquote className="border-l-4 border-[#C45B28] pl-6 py-4 my-12 bg-[#2D4A6F]/50 rounded-r-lg">
                <p className="text-2xl font-light italic text-[#FDFBF7]">
                  &ldquo;Data-driven civic engagement is not just about numbers—it&apos;s
                  about understanding the pulse of our communities and responding
                  with meaningful, accessible programming.&rdquo;
                </p>
                <cite className="text-sm text-[#C45B28] mt-4 block not-italic">
                  — Program Development Lead
                </cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* KEY METRICS DASHBOARD */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="metrics" className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 02
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E3A5F] mb-4">
              Key Performance Metrics
            </h2>
            <p className="text-lg text-[#6B7280] mb-16 max-w-2xl">
              Real-time performance indicators tracking program effectiveness,
              community reach, and operational efficiency across integrated
              platforms.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                {
                  label: "Attendance Growth",
                  value: `+${DATA.keyMetrics.attendanceGrowth}%`,
                  sub: "Year over Year",
                  color: "#C45B28",
                },
                {
                  label: "Event Growth",
                  value: `+${DATA.keyMetrics.eventGrowth}%`,
                  sub: "Total Programs",
                  color: "#1E3A5F",
                },
                {
                  label: "Platform Conversion",
                  value: `${DATA.keyMetrics.platformConversion}%`,
                  sub: "Registration to Attendance",
                  color: "#4A7C59",
                },
                {
                  label: "Community Reach",
                  value: `${DATA.keyMetrics.communityReach}M+`,
                  sub: "Touchpoints",
                  color: "#8B4B6E",
                },
                {
                  label: "Satisfaction Rate",
                  value: `${DATA.keyMetrics.satisfactionRate}%`,
                  sub: "Post-Event Surveys",
                  color: "#1E3A5F",
                },
                {
                  label: "Return Attendees",
                  value: `${DATA.keyMetrics.returnAttendeeRate}%`,
                  sub: "Repeat Participation",
                  color: "#C45B28",
                },
                {
                  label: "Avg. Capacity",
                  value: `${DATA.keyMetrics.avgEventCapacity}%`,
                  sub: "Venue Utilization",
                  color: "#4A7C59",
                },
                {
                  label: "Response Time",
                  value: `${DATA.keyMetrics.responseTime}h`,
                  sub: "Inquiry Resolution",
                  color: "#6B5B3D",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white border border-[#E8E4DC] rounded-lg p-6 hover:shadow-lg transition-shadow group"
                >
                  <div
                    className="text-3xl md:text-4xl font-semibold mb-2 transition-transform group-hover:scale-105"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-[#1A1A1A] mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-[#6B7280]">{metric.sub}</div>
                </div>
              ))}
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white border border-[#E8E4DC] rounded-lg p-8">
              <h3 className="text-xl font-semibold text-[#1E3A5F] mb-6">
                Monthly Event Performance Trend
              </h3>
              <div className="h-64 flex items-end gap-2">
                {DATA.monthlyData.map((month) => {
                  const maxEvents = Math.max(...DATA.monthlyData.map((m) => m.events))
                  const height = (month.events / maxEvents) * 100
                  return (
                    <div
                      key={month.month}
                      className="flex-1 flex flex-col items-center group"
                    >
                      <div className="relative w-full">
                        <div
                          className="w-full bg-[#1E3A5F] rounded-t transition-all duration-300 group-hover:bg-[#C45B28]"
                          style={{ height: `${height * 2}px` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {month.events} events
                        </div>
                      </div>
                      <div className="text-[10px] text-[#6B7280] mt-2 -rotate-45 origin-top-left">
                        {month.month.slice(0, 3)}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-[#E8E4DC]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#1E3A5F] rounded" />
                  <span className="text-xs text-[#6B7280]">Monthly Events</span>
                </div>
                <div className="text-xs text-[#6B7280]">
                  Hover for details
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TIMELINE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="timeline" className="py-24 px-8 bg-[#F5F3EE]">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 03
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E3A5F] mb-4">
              Program Timeline
            </h2>
            <p className="text-lg text-[#6B7280] mb-16">
              Key milestones, technology deployments, and policy implementations
              throughout the fiscal year.
            </p>

            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-[#E8E4DC]" />

              {DATA.timeline.map((item, i) => (
                <div key={i} className="relative pl-12 pb-12 last:pb-0 group">
                  <div
                    className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#F5F3EE] transition-transform group-hover:scale-110 ${
                      item.type === "milestone"
                        ? "bg-[#C45B28]"
                        : item.type === "tech"
                        ? "bg-[#1E3A5F]"
                        : "bg-[#4A7C59]"
                    }`}
                  >
                    {item.type === "milestone" && (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {item.type === "tech" && (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    )}
                    {item.type === "policy" && (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="bg-white border border-[#E8E4DC] rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="text-sm font-mono text-[#C45B28] mb-2">
                      {item.date}
                    </div>
                    <div className="text-lg font-medium text-[#1E3A5F]">
                      {item.event}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full ${
                          item.type === "milestone"
                            ? "bg-[#C45B28]/10 text-[#C45B28]"
                            : item.type === "tech"
                            ? "bg-[#1E3A5F]/10 text-[#1E3A5F]"
                            : "bg-[#4A7C59]/10 text-[#4A7C59]"
                        }`}
                      >
                        {item.type === "milestone"
                          ? "Milestone"
                          : item.type === "tech"
                          ? "Technology"
                          : "Policy"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* BOROUGH ANALYSIS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="boroughs" className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 04
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E3A5F] mb-4">
              Borough Distribution Analysis
            </h2>
            <p className="text-lg text-[#6B7280] mb-16 max-w-2xl">
              Geographic breakdown of event programming and community engagement
              across New York City&apos;s five boroughs.
            </p>

            <div className="grid md:grid-cols-5 gap-4 mb-12">
              {DATA.boroughs.map((borough) => (
                <div
                  key={borough.name}
                  className={`relative bg-white border rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                    hoveredBorough === borough.name
                      ? "border-[#C45B28] shadow-lg scale-105 z-10"
                      : "border-[#E8E4DC] hover:border-[#1E3A5F]"
                  }`}
                  onMouseEnter={() => setHoveredBorough(borough.name)}
                  onMouseLeave={() => setHoveredBorough(null)}
                >
                  <h3 className="text-lg font-semibold text-[#1E3A5F] mb-4">
                    {borough.name}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-semibold text-[#C45B28]">
                        {borough.events}
                      </div>
                      <div className="text-xs text-[#6B7280]">Events</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-[#1E3A5F]">
                        {formatNumber(borough.attendees)}
                      </div>
                      <div className="text-xs text-[#6B7280]">Attendees</div>
                    </div>
                    <div className="pt-2 border-t border-[#E8E4DC]">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-[#4A7C59]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-[#4A7C59]">
                          +{borough.growth}%
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280]">Growth</div>
                    </div>
                  </div>

                  {/* Progress bar for relative events */}
                  <div className="mt-4">
                    <div className="h-2 bg-[#E8E4DC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E3A5F] rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (borough.events /
                              Math.max(...DATA.boroughs.map((b) => b.events))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded Borough Detail */}
            {hoveredBorough && (
              <div className="bg-[#1E3A5F] rounded-lg p-8 text-[#FDFBF7] transition-all">
                <h3 className="text-2xl font-light mb-4">
                  {hoveredBorough} Detailed Metrics
                </h3>
                <div className="grid md:grid-cols-4 gap-6">
                  {(() => {
                    const b = DATA.boroughs.find(
                      (b) => b.name === hoveredBorough
                    )!
                    return (
                      <>
                        <div>
                          <div className="text-3xl font-semibold text-[#C45B28]">
                            {((b.events / DATA.totalEvents) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-[#E8E4DC]">
                            Share of Total Events
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-semibold">
                            {Math.round(b.attendees / b.events)}
                          </div>
                          <div className="text-sm text-[#E8E4DC]">
                            Avg. Attendees/Event
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-semibold">
                            {Math.round(b.events / 14)}
                          </div>
                          <div className="text-sm text-[#E8E4DC]">
                            Events/Month
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-semibold text-[#4A7C59]">
                            +{b.growth}%
                          </div>
                          <div className="text-sm text-[#E8E4DC]">
                            YoY Attendance Growth
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* EVENT CATEGORIES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="categories" className="py-24 px-8 bg-[#F5F3EE]">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 05
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E3A5F] mb-4">
              Event Categories
            </h2>
            <p className="text-lg text-[#6B7280] mb-16 max-w-2xl">
              Breakdown of programming by category, reflecting the diverse needs
              and interests of New York City communities.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Donut Chart Visualization */}
              <div className="bg-white border border-[#E8E4DC] rounded-lg p-8">
                <div className="relative w-64 h-64 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      const total = DATA.eventCategories.reduce(
                        (sum, cat) => sum + cat.count,
                        0
                      )
                      let cumulative = 0
                      return DATA.eventCategories.map((cat) => {
                        const percent = cat.count / total
                        const strokeDasharray = `${percent * 251.2} 251.2`
                        const strokeDashoffset = -cumulative * 251.2
                        cumulative += percent
                        return (
                          <circle
                            key={cat.name}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={cat.color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className={`transition-opacity cursor-pointer ${
                              selectedCategory && selectedCategory !== cat.name
                                ? "opacity-30"
                                : "opacity-100"
                            }`}
                            onClick={() =>
                              setSelectedCategory(
                                selectedCategory === cat.name ? null : cat.name
                              )
                            }
                          />
                        )
                      })
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-semibold text-[#1E3A5F]">
                      {DATA.totalEvents}
                    </div>
                    <div className="text-sm text-[#6B7280]">Total Events</div>
                  </div>
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-3">
                {DATA.eventCategories.map((cat) => (
                  <div
                    key={cat.name}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                      selectedCategory === cat.name
                        ? "bg-white shadow-md border-l-4"
                        : "bg-white/50 hover:bg-white"
                    }`}
                    style={{
                      borderLeftColor:
                        selectedCategory === cat.name ? cat.color : "transparent",
                    }}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat.name ? null : cat.name
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-[#1E3A5F]">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-[#1A1A1A]">
                        {cat.count}
                      </span>
                      <span className="text-sm text-[#6B7280]">
                        {((cat.count / DATA.totalEvents) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TECHNOLOGY STACK */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="platforms" className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 06
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E3A5F] mb-4">
              Integrated Technology Stack
            </h2>
            <p className="text-lg text-[#6B7280] mb-16 max-w-2xl">
              The data integration ecosystem powering NYC Events & Community Data,
              enabling seamless coordination across registration, outreach,
              analytics, and reporting functions.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {DATA.platforms.map((platform) => (
                <div
                  key={platform.name}
                  className={`bg-white border rounded-lg overflow-hidden transition-all cursor-pointer ${
                    expandedPlatform === platform.name
                      ? "border-[#C45B28] shadow-lg"
                      : "border-[#E8E4DC] hover:border-[#1E3A5F]"
                  }`}
                  onClick={() =>
                    setExpandedPlatform(
                      expandedPlatform === platform.name ? null : platform.name
                    )
                  }
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#1E3A5F]">
                        {platform.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-[#F5F3EE] text-[#6B7280] rounded">
                        {platform.type}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#6B7280]">Integration Level</span>
                        <span className="font-medium text-[#1E3A5F]">
                          {platform.usage}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#E8E4DC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1E3A5F] to-[#C45B28] rounded-full transition-all duration-500"
                          style={{ width: `${platform.usage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {expandedPlatform === platform.name && (
                    <div className="px-6 pb-6 pt-2 border-t border-[#E8E4DC] bg-[#F5F3EE]">
                      <p className="text-sm text-[#6B7280]">
                        {platform.name === "Cvent" &&
                          "Enterprise event management platform handling large-scale municipal events, registration flows, and venue coordination."}
                        {platform.name === "Eventbrite" &&
                          "Public ticketing and discovery platform enabling community access to city events with integrated payment processing."}
                        {platform.name === "Salesforce CRM" &&
                          "Central data hub maintaining constituent records, engagement history, and cross-platform data synchronization."}
                        {platform.name === "Mailchimp" &&
                          "Email marketing automation delivering event announcements, newsletters, and targeted outreach campaigns."}
                        {platform.name === "Tableau" &&
                          "Business intelligence platform generating real-time dashboards, performance reports, and predictive analytics."}
                        {platform.name === "Partiful" &&
                          "Community-focused event platform for informal gatherings and neighborhood-level programming."}
                        {platform.name === "Zapier" &&
                          "Workflow automation connecting all platforms, enabling real-time data sync and triggered actions."}
                        {platform.name === "Asana" &&
                          "Project management system coordinating event planning timelines, team assignments, and deliverables."}
                        {platform.name === "Monday.com" &&
                          "Visual workflow management tracking event lifecycles from conception through post-event analysis."}
                        {platform.name === "Slido" &&
                          "Audience engagement platform enabling live polling, Q&A, and real-time feedback during events."}
                        {platform.name === "Microsoft Teams" &&
                          "Internal communication hub for cross-departmental coordination and stakeholder collaboration."}
                        {platform.name === "Microsoft Excel" &&
                          "Data processing and reporting backbone for financial tracking, capacity planning, and ad-hoc analysis."}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Data Flow Diagram */}
            <div className="mt-16 bg-[#1E3A5F] rounded-lg p-8 text-[#FDFBF7]">
              <h3 className="text-xl font-semibold mb-6">Data Integration Flow</h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {["Registration", "CRM Sync", "Analytics", "Reporting", "Outreach"].map(
                  (step, i) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className="bg-[#2D4A6F] px-6 py-3 rounded-lg text-center">
                        <div className="text-sm font-medium">{step}</div>
                      </div>
                      {i < 4 && (
                        <svg
                          className="w-6 h-6 text-[#C45B28]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FUNDING ALLOCATION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="funding" className="py-24 px-8 bg-[#F5F3EE]">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 07
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E3A5F] mb-4">
              Funding Allocation
            </h2>
            <p className="text-lg text-[#6B7280] mb-8 max-w-2xl">
              Transparent breakdown of fiscal year budget distribution across
              program areas, ensuring accountability and optimal resource
              utilization.
            </p>

            <div className="bg-white border border-[#E8E4DC] rounded-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-[#6B7280] uppercase tracking-wider">
                    Total Program Budget
                  </div>
                  <div className="text-4xl font-semibold text-[#1E3A5F]">
                    {formatCurrency(DATA.funding.total)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#6B7280]">Fiscal Year</div>
                  <div className="text-lg font-medium text-[#1E3A5F]">
                    {DATA.fiscalYear}
                  </div>
                </div>
              </div>

              {/* Horizontal Stacked Bar */}
              <div className="h-12 rounded-lg overflow-hidden flex mb-8">
                {DATA.funding.allocated.map((item, i) => (
                  <div
                    key={item.category}
                    className="h-full transition-all hover:opacity-80 relative group"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: [
                        "#1E3A5F",
                        "#C45B28",
                        "#4A7C59",
                        "#8B4B6E",
                        "#6B5B3D",
                        "#3D6B8B",
                      ][i],
                    }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.category}: {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DATA.funding.allocated.map((item, i) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: [
                          "#1E3A5F",
                          "#C45B28",
                          "#4A7C59",
                          "#8B4B6E",
                          "#6B5B3D",
                          "#3D6B8B",
                        ][i],
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-[#1A1A1A]">
                        {item.category}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {formatCurrency(item.amount)} ({item.percent}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Per Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E8E4DC] rounded-lg p-6 text-center">
                <div className="text-3xl font-semibold text-[#C45B28]">
                  {formatCurrency(
                    Math.round(DATA.funding.total / DATA.totalEvents)
                  )}
                </div>
                <div className="text-sm text-[#6B7280] mt-2">
                  Average Cost per Event
                </div>
              </div>
              <div className="bg-white border border-[#E8E4DC] rounded-lg p-6 text-center">
                <div className="text-3xl font-semibold text-[#1E3A5F]">
                  {formatCurrency(
                    Math.round(DATA.funding.total / DATA.totalAttendees)
                  )}
                </div>
                <div className="text-sm text-[#6B7280] mt-2">
                  Cost per Attendee
                </div>
              </div>
              <div className="bg-white border border-[#E8E4DC] rounded-lg p-6 text-center">
                <div className="text-3xl font-semibold text-[#4A7C59]">
                  {formatCurrency(Math.round(DATA.funding.total / 5))}
                </div>
                <div className="text-sm text-[#6B7280] mt-2">
                  Average per Borough
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* EQUITY DISTRIBUTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="equity" className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 08
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-[#1E3A5F] mb-4">
              Equity Distribution Initiative
            </h2>
            <p className="text-lg text-[#6B7280] mb-16 max-w-2xl">
              Targeted programming ensuring equitable access to city events across
              historically underserved neighborhoods, aligned with NYC equity
              framework priorities.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {DATA.neighborhoods.map((hood) => (
                  <div
                    key={hood.name}
                    className="bg-white border border-[#E8E4DC] rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          hood.equity === "High Priority"
                            ? "bg-[#C45B28]"
                            : "bg-[#1E3A5F]"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-[#1E3A5F]">
                          {hood.name}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          {hood.equity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-[#1E3A5F]">
                        {hood.events}
                      </div>
                      <div className="text-xs text-[#6B7280]">Events</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#1E3A5F] rounded-lg p-8 text-[#FDFBF7]">
                <h3 className="text-xl font-semibold mb-6">
                  Equity Framework Compliance
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>High Priority Neighborhoods Served</span>
                      <span className="font-semibold">100%</span>
                    </div>
                    <div className="h-2 bg-[#2D4A6F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C45B28] rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Accessibility Compliance</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="h-2 bg-[#2D4A6F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4A7C59] rounded-full"
                        style={{ width: "98%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Multilingual Programming</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <div className="h-2 bg-[#2D4A6F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FDFBF7] rounded-full"
                        style={{ width: "87%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Transit-Accessible Venues</span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="h-2 bg-[#2D4A6F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C45B28] rounded-full"
                        style={{ width: "94%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#2D4A6F]">
                  <div className="text-sm text-[#E8E4DC] mb-2">
                    Total Events in Priority Areas
                  </div>
                  <div className="text-4xl font-semibold text-[#C45B28]">
                    {DATA.neighborhoods.reduce((sum, n) => sum + n.events, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* APPENDIX */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="appendix" className="py-24 px-8 bg-[#1E3A5F] text-[#FDFBF7]">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm uppercase tracking-widest text-[#C45B28] mb-4">
              Section 09
            </div>
            <h2 className="text-4xl md:text-5xl font-light mb-12">
              Appendix & Methodology
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-[#C45B28] font-semibold text-xl mb-4">
                  Data Sources & Integration
                </h3>
                <p className="text-[#E8E4DC] leading-relaxed">
                  This report aggregates data from 12 integrated platforms via
                  automated Zapier workflows synchronized with Salesforce CRM as the
                  central data warehouse. All metrics reflect live data as of the
                  last sync timestamp indicated in the header.
                </p>
              </div>

              <div>
                <h3 className="text-[#C45B28] font-semibold text-xl mb-4">
                  Calculation Methodologies
                </h3>
                <ul className="text-[#E8E4DC] space-y-2 list-disc list-inside">
                  <li>
                    <strong>Attendance Growth:</strong> Year-over-year comparison of
                    total attendees (Oct-May periods)
                  </li>
                  <li>
                    <strong>Platform Conversion:</strong> Registration to attendance
                    ratio across all ticketed events
                  </li>
                  <li>
                    <strong>Community Reach:</strong> Aggregate of email opens, social
                    impressions, and direct interactions
                  </li>
                  <li>
                    <strong>Satisfaction Rate:</strong> Weighted average of post-event
                    survey responses (n=48,200)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#C45B28] font-semibold text-xl mb-4">
                  Report Generation
                </h3>
                <p className="text-[#E8E4DC] leading-relaxed">
                  Generated via Tableau reporting pipeline with custom visualization
                  layer. Data validated through cross-platform reconciliation
                  protocols. Report complies with NYC Open Data standards and FOIL
                  transparency requirements.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-[#2D4A6F]">
                <div>
                  <h4 className="font-semibold mb-2">Report Version</h4>
                  <p className="text-[#E8E4DC] text-sm">
                    v2.4.1 — Interactive Digital Release
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Publication Date</h4>
                  <p className="text-[#E8E4DC] text-sm">May 2025</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Classification</h4>
                  <p className="text-[#E8E4DC] text-sm">
                    Public — Unrestricted Distribution
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <p className="text-[#E8E4DC] text-sm">
                    events@nyc.gov
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <footer className="py-12 px-8 bg-[#0F1F2E] text-[#FDFBF7]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <div className="text-xl font-semibold mb-2">
                  City of New York
                </div>
                <div className="text-sm text-[#6B7280]">
                  Events & Community Data Program
                </div>
              </div>
              <div className="text-center md:text-right text-sm text-[#6B7280]">
                <p>
                  This interactive report is a public document pursuant to NYC
                  Open Data Law.
                </p>
                <p className="mt-1">
                  For accessibility accommodations, contact:{" "}
                  <span className="text-[#C45B28]">accessibility@nyc.gov</span>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#1E3A5F] text-center text-xs text-[#6B7280]">
              <p>
                Document ID: NYC-ECD-AR-{DATA.fiscalYear}-001 | Generated:{" "}
                {new Date().toLocaleDateString()} | Classification: Public
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
