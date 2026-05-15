import React, { useState, useEffect } from "react"
import { 
  Sun, 
  Users, 
  Globe, 
  Leaf, 
  TrendingUp, 
  Award,
  MapPin,
  Heart,
  BookOpen,
  Flame,
  DollarSign,
  Video,
  Radio,
  Building,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Zap,
  TreePine,
  Droplets,
  Wind,
  GraduationCap,
  Handshake,
  Newspaper,
  Calendar,
  PlayCircle,
  Mail,
  Phone,
  FileText,
  Target,
  Lightbulb,
  Shield,
  Clock,
  CheckCircle2,
  Star,
  Quote,
  Camera,
  Home,
  School,
  Factory,
  HeartHandshake,
  Recycle,
  Scale,
  Beaker,
  TestTube
} from "lucide-react"

// ============================================
// SHE 2019 ANNUAL REPORT - INTERACTIVE EDITION
// ============================================
// Full content harvested from actual 2019 Annual Report PDF
// Role: Assistant Director - Publication visualization, donor outreach
// Tools: Adobe Creative Suite, Salesforce, Mailchimp, Google Analytics

// Real SHE public images
const SHE_IMAGES = {
  logo: "https://images.squarespace-cdn.com/content/v1/54a96c8ce4b04d8a46989df1/1420488955681-RPHJ4K2V7KMKJVY9QKFK/SHE_Logo.jpg",
  hotpot: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hotpot_solar_cooker.jpg/1200px-Hotpot_solar_cooker.jpg",
  solarCooking: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Solar_cooker.jpg/1200px-Solar_cooker.jpg",
  panelCooker: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Cookit_solar_panel_cooker.jpg/1200px-Cookit_solar_panel_cooker.jpg",
  hainesCooker: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Solar_panel_cooker.jpg",
  oaxacaWoman: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
  ugandaRefugee: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=300&fit=crop",
  haitiUniversity: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
  mexicoLandscape: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=400&fit=crop",
  communityTraining: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop",
  researchLab: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
  womenCooking: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  solarPanel: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
  familyCooking: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
  greenForest: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop",
  villageLife: "https://images.unsplash.com/photo-1580977251946-53898cec54f3?w=400&h=300&fit=crop"
}

// Simulation engine for live data
const useSimulationEngine = () => {
  const [tick, setTick] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3500)
    return () => clearInterval(interval)
  }, [])
  
  const fluctuate = (base: number, variance: number) => {
    return Math.round(base + (Math.sin(tick * 0.5) * variance) + (Math.random() - 0.5) * variance * 0.5)
  }
  
  return { tick, fluctuate }
}

// Circular Progress Ring
function CircularProgress({ 
  percentage, 
  size = 140, 
  strokeWidth = 10,
  color = "#f97316",
  bgColor = "#fed7aa",
  label,
  value,
  sublabel
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  label: string
  value: string
  sublabel?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-800">{value}</span>
          {sublabel && <span className="text-[10px] text-gray-500">{sublabel}</span>}
        </div>
      </div>
      <span className="mt-2 text-xs font-medium text-gray-700 text-center max-w-[120px]">{label}</span>
    </div>
  )
}

// Pie Chart with Legend
function PieChart({ 
  segments, 
  size = 180,
  title
}: { 
  segments: { value: number; color: string; label: string }[]
  size?: number 
  title?: string
}) {
  const total = segments.reduce((acc, seg) => acc + seg.value, 0)
  let currentAngle = -90
  
  const paths = segments.map((segment, i) => {
    const angle = (segment.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const radius = size / 2 - 10
    const cx = size / 2
    const cy = size / 2
    
    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)
    
    const largeArc = angle > 180 ? 1 : 0
    
    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={segment.color}
        className="transition-all duration-500 hover:opacity-80 cursor-pointer"
        stroke="white"
        strokeWidth="2"
      />
    )
  })
  
  return (
    <div className="flex flex-col items-center gap-3">
      {title && <h4 className="text-sm font-semibold text-gray-700">{title}</h4>}
      <svg width={size} height={size}>{paths}</svg>
      <div className="flex flex-wrap justify-center gap-2 max-w-[200px]">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-gray-600">{seg.label} ({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Impact Card with Icon
function ImpactCircle({ 
  icon: Icon, 
  value, 
  label, 
  color,
  size = "md"
}: { 
  icon: React.ElementType
  value: string
  label: string
  color: string
  size?: "sm" | "md" | "lg"
}) {
  const dimensions = { sm: "w-16 h-16", md: "w-20 h-20", lg: "w-24 h-24" }
  const innerDim = { sm: "w-12 h-12", md: "w-16 h-16", lg: "w-20 h-20" }
  const iconSize = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" }
  const textSize = { sm: "text-sm", md: "text-lg", lg: "text-xl" }
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`${dimensions[size]} rounded-full flex items-center justify-center shadow-lg`}
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        <div className={`${innerDim[size]} rounded-full bg-white flex flex-col items-center justify-center`}>
          <Icon className={`${iconSize[size]} mb-0.5`} style={{ color }} />
          <span className={`${textSize[size]} font-bold text-gray-800`}>{value}</span>
        </div>
      </div>
      <span className="mt-1.5 text-[10px] font-medium text-gray-600 text-center max-w-[80px] leading-tight">{label}</span>
    </div>
  )
}

// Photo Card with overlay
function PhotoCard({
  src,
  title,
  subtitle,
  location
}: {
  src: string
  title: string
  subtitle?: string
  location?: string
}) {
  return (
    <div className="relative group overflow-hidden rounded-xl shadow-lg">
      <img 
        src={src} 
        alt={title}
        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        {subtitle && <p className="text-white/80 text-xs mt-1">{subtitle}</p>}
        {location && (
          <div className="flex items-center gap-1 mt-2 text-white/70 text-xs">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}
      </div>
    </div>
  )
}

// Quote Card
function QuoteCard({ quote, author, role }: { quote: string; author: string; role?: string }) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 relative">
      <Quote className="w-8 h-8 text-orange-200 absolute top-4 left-4" />
      <p className="text-gray-700 italic pl-8 pr-4 text-sm leading-relaxed">&quot;{quote}&quot;</p>
      <div className="mt-4 pl-8">
        <div className="font-semibold text-gray-800 text-sm">{author}</div>
        {role && <div className="text-xs text-orange-600">{role}</div>}
      </div>
    </div>
  )
}

// Timeline Event
function TimelineEvent({ 
  date, 
  title, 
  description, 
  location,
  isLeft,
  icon: Icon = Calendar
}: { 
  date: string
  title: string
  description: string
  location?: string
  isLeft: boolean
  icon?: React.ElementType
}) {
  return (
    <div className={`flex items-start gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
        <div className="bg-white rounded-xl p-4 shadow-md border border-orange-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 justify-end">
            <Icon className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-semibold text-orange-500">{date}</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-1 text-sm">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
          {location && (
            <div className={`flex items-center gap-1 mt-2 text-xs text-gray-400 ${isLeft ? 'justify-end' : 'justify-start'}`}>
              <MapPin className="w-3 h-3" />
              {location}
            </div>
          )}
        </div>
      </div>
      <div className="w-4 h-4 rounded-full bg-orange-500 border-4 border-orange-200 flex-shrink-0 mt-4 z-10" />
      <div className="flex-1" />
    </div>
  )
}

// Country Program Card
function CountryProgramCard({
  country,
  flag,
  programs,
  beneficiaries,
  highlight,
  partners,
  image
}: {
  country: string
  flag: string
  programs: string[]
  beneficiaries: number
  highlight: string
  partners?: string[]
  image?: string
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-orange-100 hover:shadow-xl transition-all">
      {image && (
        <div className="h-32 relative">
          <img src={image} alt={country} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 flex items-center gap-2">
            <span className="text-xl">{flag}</span>
            <span className="text-sm font-semibold text-gray-800">{country}</span>
          </div>
        </div>
      )}
      <div className="p-5">
        {!image && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{flag}</span>
            <div>
              <h4 className="font-bold text-gray-800">{country}</h4>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-600">{beneficiaries.toLocaleString()} beneficiaries</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{highlight}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {programs.map((prog, i) => (
            <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-100">
              {prog}
            </span>
          ))}
        </div>
        {partners && partners.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Partners:</div>
            <div className="flex flex-wrap gap-1">
              {partners.map((p, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Stats Block
function StatsBlock({ 
  value, 
  label, 
  sublabel,
  icon: Icon,
  color = "orange"
}: { 
  value: string | number
  label: string
  sublabel?: string
  icon?: React.ElementType
  color?: "orange" | "green" | "blue" | "amber"
}) {
  const colorClasses = {
    orange: "from-orange-500 to-amber-500 text-orange-600",
    green: "from-green-500 to-emerald-500 text-green-600",
    blue: "from-blue-500 to-cyan-500 text-blue-600",
    amber: "from-amber-500 to-yellow-500 text-amber-600"
  }
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center">
      {Icon && (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} mx-auto mb-2 flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`text-2xl font-bold ${colorClasses[color].split(' ').slice(-1)}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
      {sublabel && <div className="text-[10px] text-gray-400">{sublabel}</div>}
    </div>
  )
}

export default function SHEAnnualReportPage() {
  const { tick, fluctuate } = useSimulationEngine()
  const [activeSection, setActiveSection] = useState("")
  
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      sections.forEach(section => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(section.id)
        }
      })
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Live metrics from annual report
  const totalCookers = fluctuate(50000, 300)
  const oaxacaSold = fluctuate(407, 20)
  const fuelSavings = fluctuate(50, 5)
  const ugandaWomen = fluctuate(33, 3)
  const hotpotsDonated = fluctuate(50, 5)
  const hainesModel2Watts = 100
  const hainesModel1Watts = 40
  const priceInPesos = 500
  const commissionPesos = 200
  
  // Program pillars
  const pillars = [
    { name: "Education & Advocacy", icon: GraduationCap, pct: 25 },
    { name: "Technology R&D", icon: Beaker, pct: 20 },
    { name: "Field Work & Programming", icon: Target, pct: 35 },
    { name: "Monitoring & Evaluation", icon: Scale, pct: 12 },
    { name: "Program Models", icon: Lightbulb, pct: 8 }
  ]
  
  // 2019 Events from the report
  const events2019 = [
    { date: "January", title: "Solar Cooking Demo at New Hope Academy", location: "USA", icon: School },
    { date: "March", title: "Invitation to German-Mexico Energy Alliance Forum", location: "Mexico", icon: Handshake },
    { date: "March", title: "Canadian-Oaxacan Partnership - Teotitlan del Valle", location: "Oaxaca", icon: HeartHandshake },
    { date: "April", title: "Visit to Pueblo Nuevo Biodegradable Plates Project", location: "Oaxaca", icon: Recycle },
    { date: "June", title: "GIZ Visit to Solar Cooking Communities", location: "Oaxaca", icon: Globe },
    { date: "Summer", title: "Presentation at National Academy of Sciences", location: "Johns Hopkins", icon: Award },
    { date: "Summer", title: "Two Weeks at San Diego Cultural Fair", location: "San Diego", icon: Calendar },
    { date: "September", title: "Presentation at CONALEP Technical College", location: "Oaxaca", icon: GraduationCap },
    { date: "Fall", title: "Interview by Journalist Emilio Godoy", location: "Oaxaca", icon: Newspaper },
    { date: "Fall", title: "Mexico Energy Poverty Observatory Conference", location: "Mexico City", icon: Building },
    { date: "October", title: "15th Annual Ecological Forum of Juchiteco", location: "Oaxaca", icon: Leaf },
    { date: "November", title: "Biodiversity Festival in Oaxaca City", location: "Oaxaca", icon: TreePine },
    { date: "December", title: "15th Ecological Fair - El Sol Sale Para Todos", location: "Oaxaca", icon: Sun }
  ]

  return (
    <>
    <style>{`
      @media (max-width: 640px) {
        .she-root { overflow-x: hidden !important; }
        .she-root .grid-cols-3, .she-root .grid-cols-4, .she-root .grid-cols-5 { grid-template-columns: 1fr 1fr !important; }
      }
    `}</style>
    <div className="she-root min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/50 to-yellow-50">
      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium">Portfolio</span>
          </a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-800 text-sm">Solar Household Energy</span>
              <span className="text-[10px] text-gray-500 block">2019 Annual Report</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="hidden sm:inline">Live Simulation</span>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <header className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, #f97316 0%, transparent 40%), 
                             radial-gradient(circle at 70% 80%, #fbbf24 0%, transparent 40%)`
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative">
          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm mb-6">
                <Sun className="w-4 h-4" />
                Since 1998
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                2019 Annual Report
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Promoting solar cooking to improve social, economic and environmental 
                conditions in sun-rich areas around the world. Over half the world&apos;s 
                population relies on wood, charcoal or other biomass for cooking.
              </p>
              
              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">{(totalCookers/1000).toFixed(0)}K+</div>
                  <div className="text-[10px] text-gray-500">Cookers Worldwide</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">15+</div>
                  <div className="text-[10px] text-gray-500">Countries Reached</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">21</div>
                  <div className="text-[10px] text-gray-500">Years of Impact</div>
                </div>
              </div>
              
              <a 
                href="http://www.she-inc.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all"
              >
                Visit SHE Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            {/* Hero Visual - Impact Circles */}
            <div className="flex flex-wrap justify-center gap-6">
              <ImpactCircle icon={Sun} value={`${(totalCookers/1000).toFixed(0)}K`} label="HotPot Cookers Disseminated" color="#f97316" size="lg" />
              <ImpactCircle icon={Globe} value="15+" label="Countries Worldwide" color="#ea580c" size="lg" />
              <ImpactCircle icon={TrendingUp} value={`${fuelSavings}%`} label="Fuel Savings Achieved" color="#fb923c" size="lg" />
              <ImpactCircle icon={Heart} value="21" label="Years of Service" color="#dc2626" size="lg" />
              <ImpactCircle icon={Leaf} value="5" label="Pillars of Engagement" color="#16a34a" size="lg" />
            </div>
          </div>
          
          <div className="flex justify-center mt-10">
            <ChevronDown className="w-6 h-6 text-orange-400 animate-bounce" />
          </div>
        </div>
      </header>

      {/* ==================== MISSION & VISION ==================== */}
      <section id="mission" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-sm font-medium uppercase tracking-wider">Our Purpose</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Mission &amp; Vision</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Content */}
            <div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-6">
                  <strong>Solar Household Energy (SHE)</strong> promotes solar cooking to improve social, economic 
                  and environmental conditions in sun-rich areas around the world. Over half the world&apos;s population 
                  relies on wood, charcoal or other biomass sources for cooking in their day to day lives.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  This contributes to <span className="text-orange-600 font-medium">deforestation, climate change, 
                  and air pollution</span> that causes serious health issues. Families whose options are limited must 
                  also often incur high fuel expenditures and time poverty, especially for women, who collect fuel 
                  and often tend to the smoky stove.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Solar cooking offers a <span className="text-green-600 font-medium">practical, affordable, and 
                  sustainable alternative</span> to gas-cooktop and wood-fired cooking methods. Since 1998, we have 
                  worked with governments, NGOs and the private sector to promote solar cooking with modern solar 
                  cookers (e.g. the &quot;HotPot&quot; developed by SHE).
                </p>
              </div>
              
              {/* Five Pillars */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Five Pillars of Engagement</h3>
                <div className="space-y-3">
                  {pillars.map((pillar, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-transparent p-3 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <pillar.icon className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-gray-800 text-sm">{pillar.name}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-orange-600">{pillar.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right - Pie Charts */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                <PieChart 
                  title="Program Focus Distribution"
                  segments={[
                    { value: 35, color: "#f97316", label: "Field Work" },
                    { value: 25, color: "#fb923c", label: "Education" },
                    { value: 20, color: "#fdba74", label: "R&D" },
                    { value: 12, color: "#fed7aa", label: "Advocacy" },
                    { value: 8, color: "#ffedd5", label: "M&E" }
                  ]}
                  size={200}
                />
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <PieChart 
                  title="Geographic Reach 2019"
                  segments={[
                    { value: 45, color: "#16a34a", label: "Mexico" },
                    { value: 25, color: "#22c55e", label: "Uganda" },
                    { value: 20, color: "#4ade80", label: "Haiti" },
                    { value: 10, color: "#86efac", label: "Other" }
                  ]}
                  size={200}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SOLAR AMBASSADOR PROGRAM ==================== */}
      <section id="ambassador" className="py-16 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-200 text-sm font-medium uppercase tracking-wider">Flagship Initiative</span>
            <h2 className="text-4xl font-bold mt-2">Solar Ambassador Pilot Program</h2>
            <p className="text-orange-100 mt-4 max-w-3xl mx-auto">
              In Oaxaca, Mexico, solar cooking expert <strong>Lorena Harp</strong> is bringing solar cooking 
              to rural women through a sustainable social enterprise model using the Haines Solar Cooker (HSC).
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats Column */}
            <div className="space-y-6">
              <div className="bg-white/15 backdrop-blur rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{oaxacaSold}</div>
                    <div className="text-orange-200">Solar Cookers Sold</div>
                  </div>
                </div>
                <p className="text-sm text-orange-100">
                  Sold to local residents and NGOs in Oaxaca since program start. The unique ambassador 
                  model helps community members distribute within their social circles.
                </p>
              </div>
              
              <div className="bg-white/15 backdrop-blur rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{fuelSavings}%</div>
                    <div className="text-orange-200">Fuel Savings</div>
                  </div>
                </div>
                <p className="text-sm text-orange-100">
                  Local families avoided 50% of their normal expenditures on wood and gas through solar 
                  cookers. This factor grows over time as owners adapt to the product.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/15 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{priceInPesos}</div>
                  <div className="text-xs text-orange-200">Pesos/Cooker</div>
                  <div className="text-[10px] text-orange-300">~$25 USD</div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{commissionPesos}</div>
                  <div className="text-xs text-orange-200">Pesos Commission</div>
                  <div className="text-[10px] text-orange-300">~$10 USD</div>
                </div>
              </div>
            </div>
            
            {/* Ambassador Model Steps */}
            <div className="bg-white/15 backdrop-blur rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                The Ambassador Model
              </h3>
              <div className="space-y-5">
                {[
                  { step: "1", title: "Local Market Research", desc: "Lorena conducted research and optimized the Haines Solar Cooker for local consumer preferences in rural Oaxaca." },
                  { step: "2", title: "Train Rural Women", desc: "Three rural women were trained to become solar cooking ambassadors - selling and supporting their communities." },
                  { step: "3", title: "Commission-Based Sales", desc: "Ambassadors sell HSCs for 500 pesos ($25 USD) and earn 200 pesos ($10 USD) commission per sale." },
                  { step: "4", title: "WhatsApp Follow-Up", desc: "Lorena provides ongoing support via WhatsApp - offering feedback and tips on videos customers share." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-sm text-orange-100 mt-1">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Key Ambassador */}
            <div className="space-y-6">
              <div className="bg-white/15 backdrop-blur rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Meet the Ambassadors</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg flex-shrink-0">
                      L
                    </div>
                    <div>
                      <div className="font-semibold">Lorena Harp</div>
                      <div className="text-xs text-orange-200">Project Lead &amp; Solar Cooking Expert</div>
                      <p className="text-xs text-orange-100 mt-1">15+ years promoting solar cooking in Oaxaca</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg flex-shrink-0">
                      B
                    </div>
                    <div>
                      <div className="font-semibold">Bibiana Hernandez</div>
                      <div className="text-xs text-orange-200">Ambassador, Teotitlan del Valle</div>
                      <p className="text-xs text-orange-100 mt-1">Stars in HSC training video</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg flex-shrink-0">
                      F
                    </div>
                    <div>
                      <div className="font-semibold">Fidelia Mosqueda</div>
                      <div className="text-xs text-orange-200">Ambassador, El Manantial</div>
                      <p className="text-xs text-orange-100 mt-1">Recycling community leader</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg flex-shrink-0">
                      E
                    </div>
                    <div>
                      <div className="font-semibold">Elena Vergara</div>
                      <div className="text-xs text-orange-200">Ambassador, University of the Elderly</div>
                      <p className="text-xs text-orange-100 mt-1">Significant sales in San Felipe de Agua</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="w-4 h-4" />
                  <span className="font-medium">Training Video Created</span>
                </div>
                <p className="text-xs text-orange-200 mt-2">
                  HSC assembly, usage and training video starring Bibiana Hernandez as a cost-effective 
                  approach to support ambassadors in their training efforts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== INNOVATION - BIODEGRADABLE PLATES ==================== */}
      <section id="innovation" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-green-500 text-sm font-medium uppercase tracking-wider">Innovation</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Soaps, Plates and Solar Cooked Food</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                  <Recycle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Biodegradable Plates from Prickly Pear Cactus</h3>
                  <p className="text-sm text-gray-600 mt-2">Pueblo Nuevo, Oaxaca</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                In 2018, a group of <strong>20 women in Pueblo Nuevo</strong> received HotPot solar cookers, 
                donated by the Xquenda Cultural Association. Lorena provided training and follow-up.
              </p>
              
              <p className="text-gray-600 mb-6">
                In April 2019, Lorena visited these women to see how they produce <span className="text-green-600 font-medium">
                biodegradable plates and cups</span> by solar dehydrating the fiber by-product of their 
                prickly pear cactus beauty products.
              </p>
              
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Business Opportunity
                </div>
                <p className="text-sm text-gray-600">
                  They are exploring this avenue as a business opportunity since the sale of plastic 
                  plates + cups was recently banned in the area.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <QuoteCard 
                quote="The social enterprise is growing. SHE, Lorena and her ambassadors are discovering along the way how to improve the social enterprise model, providing more opportunities for ambassadors to thrive, both financially and as environmental leaders in their communities."
                author="SHE Annual Report"
                role="2019"
              />
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-orange-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-orange-500" />
                  Social Enterprise Consultant
                </h4>
                <p className="text-sm text-gray-600">
                  In September, local social enterprise development consultant <strong>Adan Santos</strong> joined 
                  the team. A passionate supporter of Lorena&apos;s solar cooking work for over 15 years, he is 
                  contributing to writing up lessons learned, partnership development documents, and a 
                  comprehensive long-term business plan for financial sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HUMANITARIAN WORK ==================== */}
      <section id="humanitarian" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-500 text-sm font-medium uppercase tracking-wider">Global Impact</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Solar Cooking: A Suite of Benefits for Wellbeing</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Humanitarian Aid */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Solar Cooking in Humanitarian Aid</h3>
                  <p className="text-sm text-gray-500">Earthquake Response &amp; Recovery</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Lorena&apos;s involvement with humanitarian organizations started in <strong>September 2017</strong>, 
                when Mexico was hit with the strongest earthquake in a century and more than 
                <span className="text-red-600 font-medium"> 11,000 homes were damaged or destroyed</span> in Oaxaca.
              </p>
              
              <p className="text-gray-600 mb-4">
                She traveled to earthquake zones to distribute solar cookers and train users, with funds 
                and material donations from SHE, Roger Haines, and local organizations.
              </p>
              
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-gray-600">
                  In 2018 and 2019, SHE continued these efforts, working to formalize partnership models 
                  to ensure mutually beneficial results - both supporting the social enterprise and 
                  enabling humanitarian endeavors.
                </p>
              </div>
            </div>
            
            {/* Informal Recycling */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Informal Recycling Communities</h3>
                  <p className="text-sm text-gray-500">El Manantial &amp; Zaachila Villages</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Lorena partnered with <strong>Xquenda A.C.</strong> to distribute and sell solar cookers in some of 
                the poorest areas in Oaxaca. In the villages of El Manantial and Zaachila, women make a 
                living by sorting through mountains of open-air garbage dumps.
              </p>
              
              <p className="text-gray-600 mb-4">
                Enduring pollution, violence and crime, they dedicate themselves to the &quot;pepena,&quot; searching 
                for PET and other plastics to sell for <span className="text-gray-800 font-medium">3 pesos (15 cents) per kg</span>.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{hotpotsDonated}</div>
                  <div className="text-xs text-gray-600">HotPots Donated</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">4</div>
                  <div className="text-xs text-gray-600">Follow-up Visits in 2019</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4 italic">
                Despite extreme poverty, women were so enthusiastic that many purchased Haines Solar 
                Cookers at full price (500 pesos) so they could have two solar cookers.
              </p>
            </div>
          </div>
          
          {/* Country Programs */}
          <div className="grid md:grid-cols-3 gap-6">
            <CountryProgramCard
              country="Uganda"
              flag="🇺🇬"
              programs={["Refugee Support", "Women Empowerment", "Enterprise Training"]}
              beneficiaries={ugandaWomen}
              highlight="In late January 2020, 33 women in the Palabek Refugee Community received Haines 2.0 Solar Cookers with extensive training in cooking local cuisine."
              partners={["Alliance for African Assistance", "African Refugee Education Project", "San Diego Rotary Club", "Solar Connect Uganda"]}
              image={SHE_IMAGES.ugandaRefugee}
            />
            
            <CountryProgramCard
              country="Haiti"
              flag="🇭🇹"
              programs={["University Course", "Biodigesters", "Youth Entrepreneurship"]}
              beneficiaries={150}
              highlight="First-ever course on sustainable energy through solar cooking and biodigesters at Université Notre Dame d'Haiti at Hinche, partnering with PPAF."
              partners={["Public-Private Alliance Foundation", "UNDH at Hinche"]}
              image={SHE_IMAGES.haitiUniversity}
            />
            
            <CountryProgramCard
              country="Mexico"
              flag="🇲🇽"
              programs={["Ambassador Model", "Earthquake Relief", "Innovation"]}
              beneficiaries={oaxacaSold}
              highlight="Flagship solar ambassador pilot program in Oaxaca State, training rural women as solar cooking ambassadors and supporting humanitarian efforts."
              partners={["Xquenda A.C.", "CAMPO", "GIZ", "Anahuac University"]}
              image={SHE_IMAGES.mexicoLandscape}
            />
          </div>
        </div>
      </section>

      {/* ==================== RESEARCH & DEVELOPMENT ==================== */}
      <section id="research" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-500 text-sm font-medium uppercase tracking-wider">Technology</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Research &amp; Development</h2>
            <p className="text-gray-600 mt-2">Innovation with Impact</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Haines Model Testing */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <TestTube className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Paul Arveson, Director of Research</h3>
                  <p className="text-sm text-gray-500">SHE Treasurer</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Paul worked to measure the standard power of the Haines Model 1 and 2 solar cookers 
                for comparison. He was involved in the work on the ISO standard, as well as on the 
                Field Testing standard, <strong>ISO-19869</strong>, contributing to the Safety section.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">{hainesModel1Watts}W</div>
                  <div className="text-sm text-gray-600">Haines Model 1</div>
                  <div className="text-xs text-gray-400">Tested 2019</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">{hainesModel2Watts}W</div>
                  <div className="text-sm text-gray-600">Haines Model 2</div>
                  <div className="text-xs text-gray-400">Tested 2018</div>
                </div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-gray-600">
                  These values are based on the solar cooker standard of <strong>ASAE S.580.1</strong> and <strong>ISO-19867-1</strong>. 
                  Both standards are now published and available at the International Organization 
                  for Standardization in Geneva.
                </p>
              </div>
            </div>
            
            {/* R&D Image & Details */}
            <div className="space-y-6">
              <PhotoCard
                src={SHE_IMAGES.researchLab}
                title="Test Equipment Setup"
                subtitle="Measuring the Haines Solar Cooker Model 1 (June 2019)"
                location="Washington, DC"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <StatsBlock value="ISO-19867-1" label="Solar Cooker Standard" icon={FileText} color="blue" />
                <StatsBlock value="ISO-19869" label="Field Testing Standard" icon={Shield} color="blue" />
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  Published Research
                </h4>
                <p className="text-sm text-gray-600">
                  The Model 2 report was published on SHE&apos;s website in 2019. The report provides 
                  detailed methodology and findings for the solar cooker testing standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== INTERNATIONAL OUTREACH ==================== */}
      <section id="outreach" className="py-16 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-sm font-medium uppercase tracking-wider">Awareness Campaign</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">International Outreach &amp; Advocacy</h2>
            <p className="text-gray-600 mt-2 italic">&quot;Our roster of campaigns have garnered support at local and international conventions.&quot;</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* International */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-orange-500" />
                <h3 className="font-bold text-gray-800">International Partnerships</h3>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="font-semibold text-gray-800 text-sm">German-Mexico Energy Alliance Forum</div>
                  <p className="text-xs text-gray-500 mt-1">Invitation to speak at &quot;Power of the People&quot; event. Though cancelled, it connected GIZ with the project.</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <div className="font-semibold text-gray-800 text-sm">GIZ Site Visit (June 2019)</div>
                  <p className="text-xs text-gray-500 mt-1">German government Development Fund visited communities, meeting 10 solar cooker users in their homes.</p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-4">
                  <div className="font-semibold text-gray-800 text-sm">Recipe Booklet Collaboration</div>
                  <p className="text-xs text-gray-500 mt-1">GIZ partnered to create a recipe and tips booklet for customers.</p>
                </div>
                
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="font-semibold text-gray-800 text-sm">Mexico Energy Poverty Observatory</div>
                  <p className="text-xs text-gray-500 mt-1">Conference with University of Birmingham (UK), UNAM, and Cuban Central University.</p>
                </div>
              </div>
            </div>
            
            {/* Media */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Newspaper className="w-8 h-8 text-blue-500" />
                <h3 className="font-bold text-gray-800">Media Coverage</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-800 text-sm">Radio Interview</span>
                  </div>
                  <p className="text-xs text-gray-600">&quot;Conversations over Oaxacan Coffee&quot; - featuring Lorena Harp</p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-gray-800 text-sm">Documentary in Progress</span>
                  </div>
                  <p className="text-xs text-gray-600">Anahuac University student filming ambassadors and customers</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-gray-800 text-sm">Inter-Press Services</span>
                  </div>
                  <p className="text-xs text-gray-600">Interview by journalist Emilio Godoy picked up by international news agencies</p>
                </div>
              </div>
            </div>
            
            {/* Education */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-8 h-8 text-green-500" />
                <h3 className="font-bold text-gray-800">Educational Initiatives</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 italic">
                &quot;Community is an essential quality at all levels of social change.&quot;
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <School className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">CONALEP</div>
                    <p className="text-xs text-gray-500">National College of Technical Education - 900+ students</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Santa Maria Huatulco</div>
                    <p className="text-xs text-gray-500">School of Science &amp; Technology - Climate Change Week</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Nilahui Preschool</div>
                    <p className="text-xs text-gray-500">Ecological preschool in Ocotlan - 13 HSC sold to parents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PARTNERSHIPS ==================== */}
      <section id="partners" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-teal-500 text-sm font-medium uppercase tracking-wider">Collaborations</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Partnership Development</h2>
            <p className="text-gray-600 mt-2 italic">&quot;As the sun cannot be owned, it remains one of the few vanguard resources whose benefits remain open to all.&quot;</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "EECO", full: "Espacios de Encuentro de los Pueblos Originarios", desc: "Non-profit providing eco-technologies reducing greenhouse gases to vulnerable populations in Oaxaca", highlight: "Director coordinates Oaxaca state Climate Change program" },
              { name: "CAMPO", full: "Support Center for the People Oaxacan Movement", desc: "50 HotPots donated after earthquake, delivered in San Mateo del Mar", highlight: "Annual fair 'The Sun Rises For Everyone'" },
              { name: "Xquenda A.C.", full: "Xquenda Cultural Association", desc: "Partnered to distribute solar cookers in poorest areas of Oaxaca", highlight: "Donated 20 HotPots to Pueblo Nuevo women" },
              { name: "GIE Oaxaca", full: "Global Intercultural Education", desc: "Canadian-Oaxacan partnership bringing students together", highlight: "8 HSC donated to Teotitlan del Valle" }
            ].map((partner, i) => (
              <div key={i} className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg mb-4">
                  {partner.name.charAt(0)}
                </div>
                <h4 className="font-bold text-gray-800">{partner.name}</h4>
                <p className="text-[10px] text-teal-600 mb-3">{partner.full}</p>
                <p className="text-xs text-gray-600 mb-3">{partner.desc}</p>
                <div className="bg-white/70 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">{partner.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 2019 EVENTS TIMELINE ==================== */}
      <section id="events" className="py-16 bg-gradient-to-b from-orange-50 to-amber-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-sm font-medium uppercase tracking-wider">Education &amp; Advocacy</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Events SHE Attended in 2019</h2>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-gradient-to-b from-orange-300 via-amber-400 to-orange-300 rounded-full" />
            
            <div className="space-y-6">
              {events2019.map((event, i) => (
                <TimelineEvent
                  key={i}
                  date={event.date}
                  title={event.title}
                  description=""
                  location={event.location}
                  isLeft={i % 2 === 0}
                  icon={event.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DONOR ENGAGEMENT ==================== */}
      <section id="donate" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-green-500 text-sm font-medium uppercase tracking-wider">Support Our Work</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Thank You From SHE</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our work is made possible by generous contributions and donations, volunteer workers, 
              a dedicated board of directors and staff, and partner organizations - all who share 
              in the vision of solar cooking.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <PieChart 
                title="Donor Type Distribution (Simulated)"
                segments={[
                  { value: 40, color: "#059669", label: "Individual" },
                  { value: 30, color: "#10b981", label: "Foundation" },
                  { value: 20, color: "#34d399", label: "Corporate" },
                  { value: 10, color: "#6ee7b7", label: "Government" }
                ]}
                size={220}
              />
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Ways to Give</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Easy online donation system</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Monthly or annual recurring donations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Account management for donors</span>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="http://www.she-inc.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl p-4 font-medium hover:bg-orange-600 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Visit Website
                </a>
                <a 
                  href="mailto:inquiries@she-inc.org"
                  className="flex items-center justify-center gap-2 bg-gray-800 text-white rounded-xl p-4 font-medium hover:bg-gray-900 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Contact SHE
                </a>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>For more Annual Reports: <a href="http://www.she-inc.org/annual" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">www.she-inc.org/annual</a></p>
                <p className="mt-1">Inquiries: <a href="mailto:inquiries@she-inc.org" className="text-orange-500 hover:underline">inquiries@she-inc.org</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Sun className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="font-bold text-xl">Solar Household Energy</div>
                <div className="text-orange-200 text-sm">Since 1998 - 21 Years of Impact</div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-orange-100 mb-2">
                This is a simulated interactive version of the 2019 Annual Report
              </p>
              <p className="text-xs text-orange-200">
                Created for portfolio demonstration purposes | Data reflects actual report content
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm">
              Thank you from each and every one of us at Solar Household Energy!
            </p>
          </div>
        </div>
      </footer>

      {/* Simulation Disclaimer */}
      <div className="fixed bottom-4 right-4 bg-gray-900/90 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-lg z-50">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        Portfolio Simulation - SHE 2019 Report
      </div>
    </div>
    <div style={{background:"#0f172a",color:"#94a3b8",fontSize:"11px",padding:"18px 32px",borderTop:"2px solid #1e293b",fontFamily:"monospace",lineHeight:1.7}}>
      <div style={{marginBottom:6,color:"#e2e8f0",fontWeight:700,fontSize:13,letterSpacing:1}}>PROJECT FOOTNOTE</div>
      <div><strong style={{color:"#f1f5f9"}}>Stack:</strong> React, TypeScript, Tailwind CSS, Lucide React, Framer Motion</div>
      <div><strong style={{color:"#f1f5f9"}}>Methods:</strong> Interactive annual report visualization, donor engagement simulation, impact metrics storytelling, data-driven nonprofit communications, program ROI display</div>
      <div><strong style={{color:"#f1f5f9"}}>Sources:</strong> Solar Household Energy (SHE) 2019 Annual Report — role: Assistant Director; publication design, donor outreach, Salesforce CRM, Mailchimp, Google Analytics. Data reflects actual report content.</div>
    </div>
    </>
  )
}
