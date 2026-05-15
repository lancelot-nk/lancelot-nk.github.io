import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Users, Building2, DollarSign, Activity, Calendar, Target, ArrowUpRight, ArrowDownRight, Clock, Phone, Mail, Video, AlertCircle, Zap, Shield, RefreshCw, LineChart, Database, Truck, Camera, Signal, MapPin, Gauge, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
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
];
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
];
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
];
const REP_NAMES = [
    "Marcus Chen", "Sarah Mitchell", "David Rodriguez", "Emily Thompson",
    "James Wilson", "Amanda Foster", "Michael Brown", "Jessica Martinez",
    "Robert Taylor", "Nicole Anderson", "Christopher Lee", "Stephanie Garcia",
];
function generateSalesReps() {
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
        trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)],
        avatarSeed: Math.floor(Math.random() * 1000),
    }));
}
function generateAccounts(reps) {
    return COMPANY_NAMES.map((name, idx) => {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 24) - 6);
        const renewalDate = new Date(startDate);
        renewalDate.setMonth(renewalDate.getMonth() + 12);
        const lastContact = new Date();
        lastContact.setDate(lastContact.getDate() - Math.floor(Math.random() * 30));
        const tier = ["starter", "professional", "enterprise", "fleet-enterprise"][Math.floor(Math.random() * 4)];
        const baseValue = tier === "fleet-enterprise" ? 250000 :
            tier === "enterprise" ? 120000 :
                tier === "professional" ? 45000 : 18000;
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
        };
    });
}
function generateDeals(accounts, reps) {
    const stages = ["prospecting", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
    return accounts.slice(0, 20).map((account, idx) => {
        const stage = stages[Math.floor(Math.random() * 4)];
        const expectedClose = new Date();
        expectedClose.setDate(expectedClose.getDate() + Math.floor(Math.random() * 90) + 15);
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
        };
    });
}
function generateChurnPredictions(accounts) {
    return accounts
        .filter(a => a.churnRiskBaseline > 0.25 || a.healthScore < 0.6)
        .map(account => {
        const daysToRenewal = Math.ceil((account.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const usageDecay = (1 - account.usageIntensity) * 0.6;
        const engagementDrop = (1 - account.featureAdoption) * 0.4;
        const probability = Math.min(0.95, account.churnRiskBaseline + usageDecay * 0.3 + engagementDrop * 0.2 +
            (account.supportTicketVolume > 10 ? 0.15 : 0));
        const drivers = [];
        if (account.usageIntensity < 0.5)
            drivers.push("Low telematics utilization");
        if (account.featureAdoption < 0.4)
            drivers.push("Limited feature adoption");
        if (account.supportTicketVolume > 10)
            drivers.push("High support ticket volume");
        if (account.executiveSponsorEngagement < 0.3)
            drivers.push("Weak executive sponsorship");
        if (account.telematicsUtilization < 0.6)
            drivers.push("Underutilized DriveCam devices");
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
        };
    })
        .sort((a, b) => b.probability - a.probability);
}
function generateSeasonalTrends() {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
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
    }));
}
function generateTerritoryMetrics(accounts, reps) {
    return TERRITORIES.map(territory => {
        const territoryAccounts = accounts.filter(a => reps.find(r => r.id === a.assignedRep)?.territory === territory);
        const territoryReps = reps.filter(r => r.territory === territory);
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
        };
    });
}
function generateInterventions(predictions, accounts, reps) {
    return predictions.slice(0, 8).map(pred => {
        const account = accounts.find(a => a.id === pred.accountId);
        const currentRep = reps.find(r => r.id === account.assignedRep);
        const betterRep = reps.find(r => r.renewalSuccessRate > (currentRep?.renewalSuccessRate || 0) + 0.1 &&
            r.territory === currentRep?.territory);
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
        };
    });
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function formatCurrency(value) {
    if (value >= 1000000)
        return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000)
        return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
}
function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
}
function getHealthColor(score) {
    if (score >= 0.8)
        return "text-emerald-400";
    if (score >= 0.6)
        return "text-amber-400";
    return "text-red-400";
}
function getRiskColor(risk) {
    if (risk >= 0.7)
        return "text-red-400";
    if (risk >= 0.4)
        return "text-amber-400";
    return "text-emerald-400";
}
function getUrgencyColor(urgency) {
    switch (urgency) {
        case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
        case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
        case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        default: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
}
// ============================================================================
// MAIN COMPONENT - B2B CHURN PREDICTOR SIMULATION
// ============================================================================
export default function B2BChurnPredictorSimulation() {
    // State Management
    const [systemTime, setSystemTime] = useState(new Date());
    const [simulationCycle, setSimulationCycle] = useState(0);
    const [activeSection, setActiveSection] = useState(0);
    // Core Data State
    const [salesReps, setSalesReps] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [deals, setDeals] = useState([]);
    const [churnPredictions, setChurnPredictions] = useState([]);
    const [seasonalTrends, setSeasonalTrends] = useState([]);
    const [territoryMetrics, setTerritoryMetrics] = useState([]);
    const [interventions, setInterventions] = useState([]);
    // Derived Metrics
    const totalARR = useMemo(() => accounts.reduce((sum, a) => sum + a.contractValue, 0), [accounts]);
    const avgChurnRisk = useMemo(() => accounts.length > 0
        ? accounts.reduce((sum, a) => sum + a.churnRiskBaseline, 0) / accounts.length
        : 0, [accounts]);
    const pipelineValue = useMemo(() => deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage))
        .reduce((sum, d) => sum + d.value * d.closeProbability, 0), [deals]);
    const avgHealthScore = useMemo(() => accounts.length > 0
        ? accounts.reduce((sum, a) => sum + a.healthScore, 0) / accounts.length
        : 0, [accounts]);
    const totalFleetVehicles = useMemo(() => accounts.reduce((sum, a) => sum + a.fleetSize, 0), [accounts]);
    // Initialize simulation data
    useEffect(() => {
        const reps = generateSalesReps();
        const accts = generateAccounts(reps);
        const dls = generateDeals(accts, reps);
        const predictions = generateChurnPredictions(accts);
        const trends = generateSeasonalTrends();
        const territories = generateTerritoryMetrics(accts, reps);
        const actions = generateInterventions(predictions, accts, reps);
        setSalesReps(reps);
        setAccounts(accts);
        setDeals(dls);
        setChurnPredictions(predictions);
        setSeasonalTrends(trends);
        setTerritoryMetrics(territories);
        setInterventions(actions);
    }, []);
    // Real-time simulation loop
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemTime(new Date());
            setSimulationCycle(prev => prev + 1);
            // Simulate data fluctuations
            setSalesReps(prev => prev.map(rep => ({
                ...rep,
                activityIndex: Math.max(0.3, Math.min(0.95, rep.activityIndex + (Math.random() - 0.5) * 0.05)),
                quotaAttainment: Math.max(0.3, Math.min(1.2, rep.quotaAttainment + (Math.random() - 0.5) * 0.02)),
            })));
            setAccounts(prev => prev.map(account => ({
                ...account,
                healthScore: Math.max(0.2, Math.min(0.95, account.healthScore + (Math.random() - 0.5) * 0.02)),
                usageIntensity: Math.max(0.2, Math.min(0.95, account.usageIntensity + (Math.random() - 0.5) * 0.03)),
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    // Recalculate predictions on account changes
    useEffect(() => {
        if (accounts.length > 0) {
            const newPredictions = generateChurnPredictions(accounts);
            setChurnPredictions(newPredictions);
            setInterventions(generateInterventions(newPredictions, accounts, salesReps));
        }
    }, [accounts, salesReps]);
    // Track scroll position for section highlighting
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("[data-section]");
            let currentSection = 0;
            sections.forEach((section, idx) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 200)
                    currentSection = idx;
            });
            setActiveSection(currentSection);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(TooltipProvider, { children: _jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-800", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-slate-700", children: _jsx(Truck, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-sm font-semibold text-slate-900", children: "Lytx Fleet Intelligence" }), _jsx("p", { className: "text-[10px] text-slate-500", children: "B2B Target Tracker & Churn Predictor" })] })] }), _jsx(Separator, { orientation: "vertical", className: "h-8 bg-slate-300" }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500", children: [_jsx(Signal, { className: "h-3.5 w-3.5 text-emerald-400 animate-pulse" }), _jsx("span", { children: "Live Simulation" }), _jsx("span", { className: "text-slate-600", children: "\u2022" }), _jsx("span", { className: "font-mono", children: systemTime.toLocaleTimeString() })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { variant: "outline", className: "border-blue-200 bg-blue-50 text-blue-600 text-[10px]", children: [_jsx(Database, { className: "mr-1 h-3 w-3" }), "Salesforce Sync"] }), _jsxs(Badge, { variant: "outline", className: "border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px]", children: [_jsx(Camera, { className: "mr-1 h-3 w-3" }), "DriveCam API"] }), _jsxs(Badge, { variant: "outline", className: "border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]", children: [_jsx(Gauge, { className: "mr-1 h-3 w-3" }), "Telematics Live"] })] })] }) }) }), _jsxs("main", { className: "mx-auto max-w-7xl px-4 py-6", children: [_jsx("section", { "data-section": true, className: "mb-12", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, children: [_jsx("div", { className: "mb-8 rounded-xl border border-slate-200 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "max-w-3xl", children: [_jsx("h2", { className: "mb-3 text-xl font-semibold text-white", children: "Revenue Operations Intelligence \u2014 Enterprise Fleet Management" }), _jsxs("p", { className: "text-sm leading-relaxed text-slate-300", children: ["This simulation models the complete B2B sales operations environment for a fleet management SaaS platform, tracking ", _jsxs("span", { className: "text-blue-300 font-medium", children: [accounts.length, " enterprise accounts"] }), " across", " ", _jsxs("span", { className: "text-blue-300 font-medium", children: [TERRITORIES.length, " territories"] }), " with", " ", _jsxs("span", { className: "text-blue-300 font-medium", children: [salesReps.length, " sales representatives"] }), ". Current tracking coverage includes ", _jsxs("span", { className: "text-emerald-400 font-medium", children: [totalFleetVehicles.toLocaleString(), " fleet vehicles"] }), " with integrated telematics and DriveCam safety monitoring. The system continuously evaluates churn risk, renewal timing, and expansion opportunities using predictive analytics derived from engagement decay patterns, support escalation frequency, and seasonal behavioral modeling."] })] }), _jsx("div", { className: "flex flex-col items-end gap-2", children: _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-400", children: [_jsx(RefreshCw, { className: "h-3 w-3 animate-spin" }), _jsxs("span", { children: ["Cycle #", simulationCycle] })] }) })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6", children: [_jsx(KPICard, { title: "Total ARR", value: formatCurrency(totalARR), subtitle: "Annual Recurring Revenue", icon: _jsx(DollarSign, { className: "h-4 w-4" }), trend: 2.4, color: "cyan" }), _jsx(KPICard, { title: "Active Accounts", value: accounts.length.toString(), subtitle: "Enterprise Fleet Clients", icon: _jsx(Building2, { className: "h-4 w-4" }), trend: 1.2, color: "blue" }), _jsx(KPICard, { title: "Pipeline Value", value: formatCurrency(pipelineValue), subtitle: "Weighted Opportunities", icon: _jsx(Target, { className: "h-4 w-4" }), trend: -0.8, color: "purple" }), _jsx(KPICard, { title: "Avg Health Score", value: formatPercent(avgHealthScore), subtitle: "Customer Success Index", icon: _jsx(Activity, { className: "h-4 w-4" }), trend: 0.5, color: "emerald" }), _jsx(KPICard, { title: "Churn Risk", value: formatPercent(avgChurnRisk), subtitle: "Portfolio Average", icon: _jsx(AlertTriangle, { className: "h-4 w-4" }), trend: -1.2, color: "amber", inverted: true }), _jsx(KPICard, { title: "Fleet Vehicles", value: totalFleetVehicles.toLocaleString(), subtitle: "Under Management", icon: _jsx(Truck, { className: "h-4 w-4" }), trend: 3.1, color: "cyan" })] })] }) }), _jsx("section", { "data-section": true, className: "mb-12", children: _jsxs(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 }, children: [_jsx(SectionHeader, { title: "Sales Representative Performance Matrix", subtitle: "Real-time activity tracking, quota attainment, and pipeline velocity metrics across the entire sales organization", icon: _jsx(Users, { className: "h-5 w-5" }) }), _jsx("div", { className: "space-y-3", children: salesReps.map((rep, idx) => (_jsx(RepPerformanceCard, { rep: rep, rank: idx + 1, accounts: accounts }, rep.id))) }), _jsx("div", { className: "mt-6 rounded-lg border border-slate-200 bg-white p-4", children: _jsxs("p", { className: "text-sm text-slate-500", children: [_jsx("span", { className: "text-slate-900 font-medium", children: "Performance Analysis:" }), " ", "The top quartile of representatives maintains an average quota attainment of", " ", _jsx("span", { className: "text-emerald-400 font-medium", children: formatPercent(salesReps.slice(0, 3).reduce((sum, r) => sum + r.quotaAttainment, 0) / 3) }), " ", "with a combined pipeline velocity score of", " ", _jsx("span", { className: "text-blue-600 font-medium", children: (salesReps.slice(0, 3).reduce((sum, r) => sum + r.pipelineVelocity, 0) / 3 * 100).toFixed(0) }), ". The organization shows a renewal success rate variance of \u00B112% across territories, indicating potential for territory rebalancing to optimize coverage efficiency."] }) })] }) }), _jsx("section", { "data-section": true, className: "mb-12", children: _jsxs(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 }, children: [_jsx(SectionHeader, { title: "Account Health Intelligence Dashboard", subtitle: "Customer lifecycle tracking with engagement scoring, feature adoption rates, and telematics utilization metrics", icon: _jsx(Activity, { className: "h-5 w-5" }) }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: accounts.slice(0, 12).map(account => (_jsx(AccountHealthCard, { account: account, rep: salesReps.find(r => r.id === account.assignedRep) }, account.id))) }), _jsxs("div", { className: "mt-6 grid grid-cols-5 gap-3", children: [_jsx(SegmentCard, { label: "High Value Stable", count: accounts.filter(a => a.healthScore > 0.7 && a.contractValue > 100000).length, color: "emerald" }), _jsx(SegmentCard, { label: "High Value at Risk", count: accounts.filter(a => a.healthScore < 0.5 && a.contractValue > 100000).length, color: "red" }), _jsx(SegmentCard, { label: "Growth Potential", count: accounts.filter(a => a.expansionPotential > 0.6).length, color: "cyan" }), _jsx(SegmentCard, { label: "Dormant Risk", count: accounts.filter(a => a.usageIntensity < 0.4).length, color: "amber" }), _jsx(SegmentCard, { label: "Expansion Ready", count: accounts.filter(a => a.featureAdoption > 0.7 && a.expansionPotential > 0.5).length, color: "purple" })] })] }) }), _jsx("section", { "data-section": true, className: "mb-12", children: _jsxs(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 }, children: [_jsx(SectionHeader, { title: "Renewal Timeline Intelligence", subtitle: "Contract lifecycle monitoring with risk-adjusted intervention windows and pricing sensitivity analysis", icon: _jsx(Calendar, { className: "h-5 w-5" }) }), _jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium text-slate-900", children: "Upcoming Renewals \u2014 90 Day Window" }), _jsxs("div", { className: "flex items-center gap-4 text-xs", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-emerald-500" }), _jsx("span", { className: "text-slate-500", children: "Low Risk" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-amber-500" }), _jsx("span", { className: "text-slate-500", children: "Medium Risk" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-red-500" }), _jsx("span", { className: "text-slate-500", children: "High Risk" })] })] })] }), _jsx("div", { className: "space-y-2", children: accounts
                                                            .filter(a => {
                                                            const daysToRenewal = Math.ceil((a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                            return daysToRenewal > 0 && daysToRenewal <= 90;
                                                        })
                                                            .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())
                                                            .slice(0, 8)
                                                            .map(account => (_jsx(RenewalTimelineRow, { account: account }, account.id))) })] }), _jsxs("div", { className: "mt-4 grid grid-cols-4 gap-4", children: [_jsx(RenewalMetricCard, { label: "Renewals This Month", value: accounts.filter(a => {
                                                            const daysToRenewal = Math.ceil((a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                            return daysToRenewal > 0 && daysToRenewal <= 30;
                                                        }).length.toString(), icon: _jsx(Calendar, { className: "h-4 w-4" }) }), _jsx(RenewalMetricCard, { label: "ARR at Renewal", value: formatCurrency(accounts
                                                            .filter(a => {
                                                            const daysToRenewal = Math.ceil((a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                            return daysToRenewal > 0 && daysToRenewal <= 90;
                                                        })
                                                            .reduce((sum, a) => sum + a.contractValue, 0)), icon: _jsx(DollarSign, { className: "h-4 w-4" }) }), _jsx(RenewalMetricCard, { label: "Avg Risk Score", value: formatPercent(accounts
                                                            .filter(a => {
                                                            const daysToRenewal = Math.ceil((a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                            return daysToRenewal > 0 && daysToRenewal <= 90;
                                                        })
                                                            .reduce((sum, a) => sum + a.churnRiskBaseline, 0) /
                                                            Math.max(1, accounts.filter(a => {
                                                                const daysToRenewal = Math.ceil((a.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                                return daysToRenewal > 0 && daysToRenewal <= 90;
                                                            }).length)), icon: _jsx(AlertTriangle, { className: "h-4 w-4" }) }), _jsx(RenewalMetricCard, { label: "Expansion Pipeline", value: formatCurrency(accounts
                                                            .filter(a => a.expansionPotential > 0.6)
                                                            .reduce((sum, a) => sum + a.contractValue * a.expansionPotential * 0.3, 0)), icon: _jsx(TrendingUp, { className: "h-4 w-4" }) })] })] }) }), _jsx("section", { "data-section": true, className: "mb-12", children: _jsxs(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 }, children: [_jsx(SectionHeader, { title: "Predictive Churn Intelligence Engine", subtitle: "ML-driven churn probability modeling with driver analysis, engagement decay patterns, and intervention recommendations", icon: _jsx(AlertTriangle, { className: "h-5 w-5" }) }), _jsx("div", { className: "space-y-4", children: churnPredictions.slice(0, 6).map(prediction => (_jsx(ChurnPredictionCard, { prediction: prediction, account: accounts.find(a => a.id === prediction.accountId) }, prediction.accountId))) }), _jsxs("div", { className: "mt-6 rounded-xl border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "mb-4 text-sm font-medium text-slate-900", children: "Portfolio Churn Risk Distribution" }), _jsx("div", { className: "flex items-end justify-between gap-2", children: [
                                                            { range: "0-20%", label: "Low", color: "bg-emerald-500" },
                                                            { range: "20-40%", label: "Moderate", color: "bg-cyan-500" },
                                                            { range: "40-60%", label: "Elevated", color: "bg-amber-500" },
                                                            { range: "60-80%", label: "High", color: "bg-orange-500" },
                                                            { range: "80-100%", label: "Critical", color: "bg-red-500" },
                                                        ].map((bucket, idx) => {
                                                            const count = accounts.filter(a => {
                                                                const risk = a.churnRiskBaseline;
                                                                const min = idx * 0.2;
                                                                const max = (idx + 1) * 0.2;
                                                                return risk >= min && risk < max;
                                                            }).length;
                                                            const height = Math.max(20, (count / accounts.length) * 200);
                                                            return (_jsxs("div", { className: "flex flex-1 flex-col items-center gap-2", children: [_jsx("div", { className: `w-full rounded-t ${bucket.color} transition-all duration-500`, style: { height: `${height}px` } }), _jsx("span", { className: "text-xs text-slate-500", children: bucket.range }), _jsx("span", { className: "text-xs font-medium text-slate-700", children: count })] }, bucket.range));
                                                        }) })] })] }) }), _jsx("section", { "data-section": true, className: "mb-12", children: _jsxs(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 }, children: [_jsx(SectionHeader, { title: "Seasonal Churn & Renewal Patterns", subtitle: "Macro-level analysis of quarterly budget impacts, fiscal year alignment effects, and industry-specific seasonal variations", icon: _jsx(LineChart, { className: "h-5 w-5" }) }), _jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium text-slate-900", children: "Monthly Churn & Renewal Rate Trends" }), _jsxs("div", { className: "flex items-center gap-4 text-xs", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-4 rounded bg-red-500/70" }), _jsx("span", { className: "text-slate-500", children: "Churn Rate" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-4 rounded bg-emerald-500/70" }), _jsx("span", { className: "text-slate-500", children: "Renewal Rate" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-4 rounded bg-blue-500/70" }), _jsx("span", { className: "text-slate-500", children: "Expansion" })] })] })] }), _jsx("div", { className: "grid grid-cols-12 gap-2", children: seasonalTrends.map((trend, idx) => (_jsx(SeasonalTrendBar, { trend: trend, isCurrentMonth: idx === new Date().getMonth() }, trend.month))) }), _jsx("div", { className: "mt-2 grid grid-cols-4 gap-2", children: ["Q1", "Q2", "Q3", "Q4"].map(quarter => (_jsx("div", { className: "text-center text-xs text-slate-500", children: quarter }, quarter))) })] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "rounded-lg border border-amber-500/20 bg-amber-500/5 p-4", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-amber-400" }), _jsx("span", { className: "text-sm font-medium text-amber-400", children: "Q4 Budget Tightening Alert" })] }), _jsxs("p", { className: "text-xs text-slate-500", children: ["Historical patterns indicate a ", _jsx("span", { className: "text-amber-400", children: "34% increase" }), " in churn risk during October-December due to annual budget reconciliation cycles. Fleet management contracts are particularly susceptible as companies evaluate operational cost centers. Proactive renewal discussions should begin 90+ days before year-end."] })] }), _jsxs("div", { className: "rounded-lg border border-blue-200 bg-cyan-500/5 p-4", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-blue-600", children: "Q2 Expansion Opportunity Window" })] }), _jsxs("p", { className: "text-xs text-slate-500", children: ["April-June presents a ", _jsx("span", { className: "text-blue-600", children: "22% higher expansion rate" }), " as companies deploy new fiscal year budgets. Fleet expansion decisions typically coincide with Q2 operational planning. Target high-adoption accounts for upsell campaigns during this period for maximum conversion efficiency."] })] })] })] }) }), _jsx("section", { "data-section": true, className: "mb-12", children: _jsxs(motion.div, { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 }, children: [_jsx(SectionHeader, { title: "Executive Action Intelligence", subtitle: "AI-synthesized intervention recommendations with prioritized action items, rep reassignment suggestions, and expected impact analysis", icon: _jsx(Zap, { className: "h-5 w-5" }) }), _jsxs("div", { className: "mb-6 rounded-xl border border-slate-200 bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium text-slate-100", children: "Priority Intervention Queue" }), _jsxs(Badge, { variant: "outline", className: "border-red-500/30 bg-red-500/10 text-red-400 text-[10px]", children: [interventions.filter(i => i.priority === "immediate").length, " Immediate Actions"] })] }), _jsx("div", { className: "space-y-3", children: interventions.map((intervention, idx) => (_jsx(InterventionCard, { intervention: intervention, index: idx + 1 }, intervention.accountId))) })] }), _jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-6", children: [_jsx("h3", { className: "mb-4 text-sm font-medium text-slate-900", children: "Territory Performance & Coverage Analysis" }), _jsx("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-4", children: territoryMetrics.map(territory => (_jsx(TerritoryCard, { territory: territory }, territory.territory))) })] }), _jsxs("div", { className: "mt-6 rounded-xl border border-blue-200 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 p-6", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-600" }), _jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "Executive Summary \u2014 Recommended Actions" })] }), _jsxs("div", { className: "space-y-2 text-sm text-slate-500", children: [_jsxs("p", { children: [_jsx("span", { className: "text-slate-900 font-medium", children: "1. Immediate Retention Focus:" }), " ", churnPredictions.filter(p => p.probability > 0.6).length, " accounts require immediate intervention, representing ", _jsx("span", { className: "text-red-400 font-medium", children: formatCurrency(accounts.filter(a => churnPredictions.find(p => p.accountId === a.id && p.probability > 0.6)).reduce((sum, a) => sum + a.contractValue, 0)) }), " in at-risk ARR."] }), _jsxs("p", { children: [_jsx("span", { className: "text-slate-900 font-medium", children: "2. Territory Optimization:" }), " ", territoryMetrics.filter(t => t.coverageGap > 0.2).length, " territories show coverage gaps exceeding 20%. Consider rep reallocation to balance workload distribution."] }), _jsxs("p", { children: [_jsx("span", { className: "text-slate-900 font-medium", children: "3. Expansion Opportunity:" }), " ", _jsx("span", { className: "text-emerald-400 font-medium", children: formatCurrency(accounts.filter(a => a.expansionPotential > 0.6)
                                                                            .reduce((sum, a) => sum + a.contractValue * a.expansionPotential * 0.3, 0)) }), " ", "in identified upsell pipeline across ", accounts.filter(a => a.expansionPotential > 0.6).length, " expansion-ready accounts."] }), _jsxs("p", { children: [_jsx("span", { className: "text-slate-900 font-medium", children: "4. Seasonal Preparation:" }), " ", "Q4 budget compression begins in 6 weeks. Accelerate renewal conversations for all accounts with December-February renewal dates."] })] })] })] }) }), _jsxs("footer", { className: "mt-16 border-t border-slate-200 pt-6 pb-8", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "font-mono", children: "SIMULATION ACTIVE" }), _jsx(Separator, { orientation: "vertical", className: "h-3 bg-gray-700" }), _jsx("span", { children: "Portfolio Showcase \u2014 B2B Sales Operations Intelligence" })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("span", { children: "Simulated Data Sources: Salesforce, Gainsight, Zendesk, HubSpot, Lytx DriveCam API" }) })] }), _jsx("div", { className: "mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3", children: _jsxs("p", { className: "text-[10px] text-slate-600 leading-relaxed", children: [_jsx("span", { className: "text-slate-500 font-medium", children: "SIMULATION DISCLAIMER:" }), " ", "This interface is a portfolio-grade systems design demonstration, not a production deployment. All datasets, metrics, behavioral signals, and operational workflows are artificially generated within the front-end layer. No real customer data, CRM integrations, or backend systems are connected. This simulation demonstrates advanced systems thinking across B2B SaaS analytics, sales operations, retention modeling, and predictive forecasting systems design."] }) })] })] })] }) }), _jsxs("div", { style: { background: "#0f172a", color: "#94a3b8", fontSize: "11px", padding: "18px 32px", borderTop: "2px solid #1e293b", fontFamily: "monospace", lineHeight: 1.7 }, children: [_jsx("div", { style: { marginBottom: 6, color: "#e2e8f0", fontWeight: 700, fontSize: 13, letterSpacing: 1 }, children: "PROJECT FOOTNOTE" }), _jsxs("div", { children: [_jsx("strong", { style: { color: "#f1f5f9" }, children: "Stack:" }), " React \u00B7 TypeScript \u00B7 Tailwind CSS \u00B7 Framer Motion \u00B7 Radix UI \u2014 standalone simulation, no backend"] }), _jsxs("div", { children: [_jsx("strong", { style: { color: "#f1f5f9" }, children: "Methods:" }), " B2B SaaS churn prediction modeling \u00B7 Account health scoring \u00B7 Sales rep performance KPIs \u00B7 Seasonal renewal trend analysis \u00B7 Territory coverage gap detection \u00B7 Intervention priority ranking"] }), _jsxs("div", { children: [_jsx("strong", { style: { color: "#f1f5f9" }, children: "Sources:" }), " Sales operations metrics modeled from Gainsight/Salesforce CSM frameworks; churn indicators based on published SaaS retention research; all data procedurally generated \u2014 no real CRM data"] })] })] }));
}
// ============================================================================
// SUBCOMPONENTS
// ============================================================================
function SectionHeader({ title, subtitle, icon, }) {
    return (_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600", children: icon }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: title })] }), _jsx("p", { className: "text-sm text-slate-500 pl-11", children: subtitle })] }));
}
function KPICard({ title, value, subtitle, icon, trend, color, inverted = false, }) {
    const isPositive = inverted ? trend < 0 : trend > 0;
    const colorMap = {
        cyan: "from-blue-500/20 to-blue-500/5 border-blue-200",
        blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
        purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
        emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
        amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
    };
    const iconColorMap = {
        cyan: "text-blue-600",
        blue: "text-blue-400",
        purple: "text-purple-400",
        emerald: "text-emerald-400",
        amber: "text-amber-400",
    };
    return (_jsxs("div", { className: `rounded-xl border bg-gradient-to-br p-4 ${colorMap[color]}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: `${iconColorMap[color]}`, children: icon }), _jsxs("div", { className: `flex items-center gap-0.5 text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`, children: [isPositive ? _jsx(ArrowUpRight, { className: "h-3 w-3" }) : _jsx(ArrowDownRight, { className: "h-3 w-3" }), Math.abs(trend).toFixed(1), "%"] })] }), _jsx("div", { className: "text-2xl font-bold text-slate-900 mb-0.5", children: value }), _jsx("div", { className: "text-[10px] text-slate-500 uppercase tracking-wide", children: subtitle })] }));
}
function RepPerformanceCard({ rep, rank, accounts, }) {
    const repAccounts = accounts.filter(a => a.assignedRep === rep.id);
    const repARR = repAccounts.reduce((sum, a) => sum + a.contractValue, 0);
    return (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: rank * 0.05 }, className: "rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: `flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm
          ${rank <= 3 ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white" : "bg-slate-200 text-slate-500"}`, children: ["#", rank] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-slate-900 truncate", children: rep.name }), rep.trend === "up" && _jsx(TrendingUp, { className: "h-3.5 w-3.5 text-emerald-400" }), rep.trend === "down" && _jsx(TrendingDown, { className: "h-3.5 w-3.5 text-red-400" })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500", children: [_jsx(MapPin, { className: "h-3 w-3" }), _jsx("span", { children: rep.territory })] })] }), _jsxs("div", { className: "hidden md:flex items-center gap-6 text-sm", children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-slate-900 font-medium", children: formatPercent(rep.quotaAttainment) }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Quota" })] }) }), _jsx(TooltipContent, { children: "Quota Attainment" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-slate-900 font-medium", children: formatPercent(rep.renewalSuccessRate) }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Renewal" })] }) }), _jsx(TooltipContent, { children: "Renewal Success Rate" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-slate-900 font-medium", children: repAccounts.length }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Accounts" })] }) }), _jsx(TooltipContent, { children: "Active Account Portfolio" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-blue-600 font-medium", children: formatCurrency(repARR) }), _jsx("div", { className: "text-[10px] text-slate-500", children: "ARR" })] }) }), _jsx(TooltipContent, { children: "Total ARR Under Management" })] })] }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-500", children: [_jsxs(Tooltip, { children: [_jsxs(TooltipTrigger, { className: "flex items-center gap-1", children: [_jsx(Phone, { className: "h-3 w-3" }), _jsx("span", { children: rep.calls })] }), _jsx(TooltipContent, { children: "Calls This Week" })] }), _jsxs(Tooltip, { children: [_jsxs(TooltipTrigger, { className: "flex items-center gap-1", children: [_jsx(Mail, { className: "h-3 w-3" }), _jsx("span", { children: rep.emails })] }), _jsx(TooltipContent, { children: "Emails This Week" })] }), _jsxs(Tooltip, { children: [_jsxs(TooltipTrigger, { className: "flex items-center gap-1", children: [_jsx(Video, { className: "h-3 w-3" }), _jsx("span", { children: rep.meetings })] }), _jsx(TooltipContent, { children: "Meetings This Week" })] })] }), _jsxs("div", { className: "w-24", children: [_jsxs("div", { className: "flex items-center justify-between text-[10px] mb-1", children: [_jsx("span", { className: "text-slate-500", children: "Activity" }), _jsx("span", { className: "text-slate-500", children: formatPercent(rep.activityIndex) })] }), _jsx(Progress, { value: rep.activityIndex * 100, className: "h-1.5" })] })] }) }));
}
function AccountHealthCard({ account, rep, }) {
    const daysToRenewal = Math.ceil((account.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const daysSinceContact = Math.ceil((Date.now() - account.lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
    const tierColors = {
        "fleet-enterprise": "bg-purple-500/20 text-purple-400 border-purple-500/30",
        enterprise: "bg-blue-100 text-blue-600 border-blue-200",
        professional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        starter: "bg-gray-500/20 text-slate-500 border-gray-500/30",
    };
    return (_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-all", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h4", { className: "font-medium text-slate-900 truncate", children: account.name }), _jsx("p", { className: "text-xs text-slate-500", children: account.industry })] }), _jsx(Badge, { variant: "outline", className: `text-[10px] ${tierColors[account.productTier]}`, children: account.productTier.replace("-", " ") })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [_jsx("span", { className: "text-slate-500", children: "Health Score" }), _jsx("span", { className: getHealthColor(account.healthScore), children: formatPercent(account.healthScore) })] }), _jsx(Progress, { value: account.healthScore * 100, className: "h-2" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mb-3 text-center", children: [_jsxs("div", { className: "rounded-lg bg-slate-100 p-2", children: [_jsx("div", { className: "text-xs font-medium text-slate-700", children: account.fleetSize }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Vehicles" })] }), _jsxs("div", { className: "rounded-lg bg-slate-100 p-2", children: [_jsx("div", { className: "text-xs font-medium text-slate-700", children: formatPercent(account.telematicsUtilization) }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Telematics" })] }), _jsxs("div", { className: "rounded-lg bg-slate-100 p-2", children: [_jsx("div", { className: `text-xs font-medium ${account.safetyScore > 85 ? "text-emerald-400" : account.safetyScore > 70 ? "text-amber-400" : "text-red-400"}`, children: account.safetyScore.toFixed(0) }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Safety" })] })] }), _jsxs("div", { className: "flex items-center justify-between text-xs border-t border-slate-200 pt-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-500", children: "ARR: " }), _jsx("span", { className: "text-blue-600 font-medium", children: formatCurrency(account.contractValue) })] }), _jsxs("div", { className: `flex items-center gap-1 ${daysToRenewal < 30 ? "text-red-400" : daysToRenewal < 60 ? "text-amber-400" : "text-slate-500"}`, children: [_jsx(Clock, { className: "h-3 w-3" }), _jsxs("span", { children: [daysToRenewal, "d to renewal"] })] })] }), rep && (_jsxs("div", { className: "flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500", children: [_jsx(Users, { className: "h-3 w-3" }), _jsx("span", { children: rep.name }), daysSinceContact > 14 && (_jsxs(Badge, { variant: "outline", className: "ml-auto text-[9px] border-amber-500/30 bg-amber-500/10 text-amber-400", children: [daysSinceContact, "d since contact"] }))] }))] }));
}
function SegmentCard({ label, count, color, }) {
    const colorMap = {
        emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        red: "border-red-500/30 bg-red-500/10 text-red-400",
        cyan: "border-blue-200 bg-blue-50 text-blue-600",
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    };
    return (_jsxs("div", { className: `rounded-lg border p-3 text-center ${colorMap[color]}`, children: [_jsx("div", { className: "text-2xl font-bold", children: count }), _jsx("div", { className: "text-[10px] uppercase tracking-wide opacity-80", children: label })] }));
}
function RenewalTimelineRow({ account }) {
    const daysToRenewal = Math.ceil((account.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const progress = Math.max(0, Math.min(100, ((90 - daysToRenewal) / 90) * 100));
    const riskColor = account.churnRiskBaseline > 0.5 ? "bg-red-500" :
        account.churnRiskBaseline > 0.3 ? "bg-amber-500" : "bg-emerald-500";
    return (_jsxs("div", { className: "flex items-center gap-4 rounded-lg bg-slate-50 p-3", children: [_jsx("div", { className: `h-2 w-2 rounded-full ${riskColor}` }), _jsx("div", { className: "w-48 truncate text-sm text-slate-900", children: account.name }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative h-2 rounded-full bg-slate-200", children: [_jsx("div", { className: `absolute left-0 top-0 h-full rounded-full transition-all ${riskColor}`, style: { width: `${progress}%` } }), _jsx("div", { className: "absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border-2 border-gray-900", style: { left: `${progress}%` } })] }) }), _jsx("div", { className: "w-24 text-right", children: _jsxs("span", { className: `text-sm font-medium ${daysToRenewal < 30 ? "text-red-400" : daysToRenewal < 60 ? "text-amber-400" : "text-slate-600"}`, children: [daysToRenewal, " days"] }) }), _jsx("div", { className: "w-24 text-right text-sm text-blue-600", children: formatCurrency(account.contractValue) }), _jsxs(Badge, { variant: "outline", className: `text-[10px] ${getRiskColor(account.churnRiskBaseline)} border-current/30 bg-current/10`, children: [formatPercent(account.churnRiskBaseline), " risk"] })] }));
}
function RenewalMetricCard({ label, value, icon, }) {
    return (_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-slate-500 mb-2", children: [icon, _jsx("span", { className: "text-xs", children: label })] }), _jsx("div", { className: "text-xl font-bold text-slate-900", children: value })] }));
}
function ChurnPredictionCard({ prediction, account, }) {
    if (!account)
        return null;
    return (_jsxs("div", { className: `rounded-xl border p-5 ${prediction.urgency === "critical"
            ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-500/5"
            : prediction.urgency === "high"
                ? "border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-orange-500/5"
                : "border-slate-200 bg-white"}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx("h4", { className: "font-semibold text-slate-900", children: prediction.accountName }), _jsx(Badge, { variant: "outline", className: getUrgencyColor(prediction.urgency), children: prediction.urgency.toUpperCase() })] }), _jsxs("p", { className: "text-xs text-slate-500", children: [account.industry, " \u2022 ", account.fleetSize, " vehicles"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-2xl font-bold ${getRiskColor(prediction.probability)}`, children: formatPercent(prediction.probability) }), _jsx("div", { className: "text-xs text-slate-500", children: "Churn Probability" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs text-slate-500 mb-2", children: "Risk Drivers Identified:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: prediction.drivers.map((driver, idx) => (_jsx(Badge, { variant: "outline", className: "border-slate-300 bg-slate-200 text-slate-600 text-[10px]", children: driver }, idx))) })] }), _jsxs("div", { className: "grid grid-cols-4 gap-3 mb-4", children: [_jsxs("div", { className: "rounded-lg bg-slate-100 p-2 text-center", children: [_jsxs("div", { className: "text-sm font-medium text-slate-900", children: [prediction.timeToRenewal, "d"] }), _jsx("div", { className: "text-[10px] text-slate-500", children: "To Renewal" })] }), _jsxs("div", { className: "rounded-lg bg-slate-100 p-2 text-center", children: [_jsx("div", { className: `text-sm font-medium ${prediction.usageDecayRate > 0.3 ? "text-red-400" : "text-slate-600"}`, children: formatPercent(prediction.usageDecayRate) }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Usage Decay" })] }), _jsxs("div", { className: "rounded-lg bg-slate-100 p-2 text-center", children: [_jsx("div", { className: `text-sm font-medium ${prediction.engagementDropRate > 0.3 ? "text-red-400" : "text-slate-600"}`, children: formatPercent(prediction.engagementDropRate) }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Engagement Drop" })] }), _jsxs("div", { className: "rounded-lg bg-slate-100 p-2 text-center", children: [_jsx("div", { className: `text-sm font-medium ${prediction.supportEscalationCount > 10 ? "text-amber-400" : "text-slate-600"}`, children: prediction.supportEscalationCount }), _jsx("div", { className: "text-[10px] text-slate-500", children: "Support Tickets" })] })] }), _jsxs("div", { className: "flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 p-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-sm text-blue-600", children: prediction.recommendedAction })] }), _jsxs("div", { className: "text-sm text-slate-500", children: ["ARR at Risk: ", _jsx("span", { className: "text-red-400 font-medium", children: formatCurrency(account.contractValue) })] })] })] }));
}
function SeasonalTrendBar({ trend, isCurrentMonth, }) {
    return (_jsxs("div", { className: `flex flex-col items-center ${isCurrentMonth ? "bg-blue-50 rounded-lg p-1 -m-1" : ""}`, children: [_jsxs("div", { className: "flex flex-col items-center gap-1 h-32 justify-end w-full", children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { className: "w-full", children: _jsx("div", { className: "w-full rounded-t bg-red-500/70 transition-all hover:bg-red-500", style: { height: `${Math.min(trend.churnRate * 200, 45)}px` } }) }), _jsx(TooltipContent, { children: _jsxs("div", { className: "text-xs", children: [_jsx("div", { className: "font-medium", children: trend.month }), _jsxs("div", { children: ["Churn: ", formatPercent(trend.churnRate)] })] }) })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { className: "w-full", children: _jsx("div", { className: "w-full rounded-t bg-emerald-500/70 transition-all hover:bg-emerald-500", style: { height: `${Math.min(trend.renewalRate * 50, 43)}px` } }) }), _jsx(TooltipContent, { children: _jsxs("div", { className: "text-xs", children: [_jsx("div", { className: "font-medium", children: trend.month }), _jsxs("div", { children: ["Renewal: ", formatPercent(trend.renewalRate)] })] }) })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { className: "w-full", children: _jsx("div", { className: "w-full rounded-t bg-blue-500/70 transition-all hover:bg-blue-500", style: { height: `${Math.min(trend.expansionRate * 100, 25)}px` } }) }), _jsx(TooltipContent, { children: _jsxs("div", { className: "text-xs", children: [_jsx("div", { className: "font-medium", children: trend.month }), _jsxs("div", { children: ["Expansion: ", formatPercent(trend.expansionRate)] })] }) })] })] }), _jsx("div", { className: `text-[10px] mt-2 ${isCurrentMonth ? "text-blue-600 font-medium" : "text-slate-500"}`, children: trend.month.slice(0, 3) })] }));
}
function InterventionCard({ intervention, index, }) {
    const priorityColors = {
        immediate: "border-l-red-500 bg-red-500/5",
        soon: "border-l-amber-500 bg-amber-500/5",
        monitor: "border-l-emerald-500 bg-emerald-500/5",
    };
    return (_jsxs("div", { className: `rounded-r-lg border-l-4 border border-slate-200 p-4 ${priorityColors[intervention.priority]}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white", children: index }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-slate-900", children: intervention.accountName }), _jsx("p", { className: "text-xs text-slate-500", children: intervention.action })] })] }), _jsx(Badge, { variant: "outline", className: getUrgencyColor(intervention.priority === "immediate" ? "critical" : intervention.priority === "soon" ? "high" : "medium"), children: intervention.priority })] }), _jsx("p", { className: "text-xs text-slate-500 mb-2", children: intervention.reasoning }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-slate-500", children: ["Expected Impact: ", _jsx("span", { className: "text-emerald-400 font-medium", children: formatCurrency(intervention.expectedImpact) })] }), intervention.repReassignment && (_jsxs("span", { className: "text-amber-400", children: ["Suggested Reassignment: ", intervention.repReassignment] }))] })] }));
}
function TerritoryCard({ territory }) {
    return (_jsxs("div", { className: "rounded-lg border border-slate-200 bg-slate-50 p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "text-sm font-medium text-slate-900 truncate", children: territory.territory }), _jsxs(Badge, { variant: "outline", className: "text-[10px] border-slate-300 text-slate-500", children: [territory.repCount, " reps"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Accounts" }), _jsx("span", { className: "text-slate-900", children: territory.accountCount })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Total ARR" }), _jsx("span", { className: "text-blue-600", children: formatCurrency(territory.totalARR) })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Avg Health" }), _jsx("span", { className: getHealthColor(territory.avgHealthScore), children: formatPercent(territory.avgHealthScore) })] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-500", children: "Coverage Gap" }), _jsx("span", { className: territory.coverageGap > 0.2 ? "text-red-400" : "text-emerald-400", children: formatPercent(territory.coverageGap) })] })] })] }));
}
