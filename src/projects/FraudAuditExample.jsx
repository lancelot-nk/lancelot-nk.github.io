import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Shield, Terminal, Activity, Database, CheckCircle, AlertTriangle, 
  MapPin, Zap, LineChart, Bell, Lock, Search, Filter, ChevronRight, 
  FileJson, Server, Users, DollarSign, LayoutDashboard, ShieldAlert, 
  Settings, Clock, Crosshair, Globe, Cpu, BarChart3, HardDrive, 
  Layers, Navigation, Save, Trash2, ExternalLink, RefreshCcw, 
  Eye, FileText, Share2, Download, Play, Pause, Square, AlertCircle,
  TrendingUp, TrendingDown, ClipboardList, Briefcase, Globe2, ZapOff
} from 'lucide-react';

// --- ENTERPRISE CONSTANTS ---
const BUDGET_LIMIT = 7600000000;
const NYC_BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
const NIST_CATALOG = [
  { id: "AC-2", name: "Account Management", status: "Compliant", lastAudit: "2026-04-12" },
  { id: "AU-6", name: "Audit Review & Reporting", status: "Compliant", lastAudit: "2026-05-01" },
  { id: "IA-4", name: "Identifier Management", status: "Flagged", lastAudit: "2026-05-10" },
  { id: "SI-4", name: "System Monitoring", status: "Compliant", lastAudit: "2026-03-22" },
  { id: "SC-7", name: "Boundary Protection", status: "Compliant", lastAudit: "2026-05-14" },
  { id: "CP-2", name: "Contingency Planning", status: "Compliant", lastAudit: "2026-01-15" },
];

// --- ADVANCED MOCK GENERATOR ---
const GENERATE_MASSIVE_DATA = (count = 120) => {
  const rules = [
    "impossible_travel_v2", "synthetic_clustering_04", "auth_window_violation", 
    "death_master_match", "liquidity_spike", "out_of_state_cap", "trafficking_pattern", 
    "multi_ssn_household", "retailer_collusion", "velocity_threshold_exceeded"
  ];
  
  return Array.from({ length: count }).map((_, i) => ({
    id: `HRA-${100000 + i}`,
    timestamp: new Date(Date.now() - Math.random() * 50000000).toISOString(),
    rule: rules[Math.floor(Math.random() * rules.length)],
    riskScore: Math.floor(Math.random() * 100),
    severity: i % 10 === 0 ? "Critical" : i % 4 === 0 ? "High" : "Medium",
    status: i % 5 === 0 ? "Neutralized" : i % 3 === 0 ? "Flagged" : "Active",
    borough: NYC_BOROUGHS[Math.floor(Math.random() * NYC_BOROUGHS.length)],
    savingsPotential: (Math.random() * 8500).toFixed(2),
    agent: i % 2 === 0 ? "RPA-Bot-Alpha" : "Manual-Auditor-7",
    payload: {
      trace_route: `ISO8583-${Math.random().toString(36).substring(5).toUpperCase()}`,
      nist_control: NIST_CATALOG[Math.floor(Math.random() * NIST_CATALOG.length)].id,
      geo_tag: `40.7128° N, 74.0060° W`,
      linked_cases: Math.floor(Math.random() * 5),
      raw_hex: "0x48 0x52 0x41 0x5F 0x46 0x52 0x41 0x55 0x44"
    }
  }));
};

// --- KEYFRAME ANIMATIONS (CSS-IN-JSX) ---
const STYLES = `
  @keyframes scanline { 0% { bottom: 100%; } 80% { bottom: 0%; } 100% { bottom: 0%; } }
  @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes blink-red { 0%, 100% { background: rgba(239, 68, 68, 0.2); } 50% { background: rgba(239, 68, 68, 0.05); } }
  .scanline-effect { position: relative; overflow: hidden; }
  .scanline-effect::after {
    content: " "; display: block; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 0, 0.02) 50%);
    background-size: 100% 4px; z-index: 2; pointer-events: none;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #05070a; }
  ::-webkit-scrollbar-thumb { background: #1a1f26; border-radius: 5px; }
  ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
`;

export default function SovereignOS() {
  // --- STATE ---
  const [activeApp, setActiveApp] = useState('triage'); // triage, rpa, nist, geo, settings
  const [data, setData] = useState(GENERATE_MASSIVE_DATA());
  const [selectedCase, setSelectedCase] = useState(null);
  const [search, setSearch] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ budget: 7599000000, accuracy: 72.4, casesProcessed: 842100 });
  const terminalEndRef = useRef(null);

  // --- REAL-TIME ENGINE ---
  useEffect(() => {
    if (!isLive) return;
    const tick = setInterval(() => {
      setMetrics(m => ({
        budget: m.budget < BUDGET_LIMIT ? m.budget + 850 : BUDGET_LIMIT,
        accuracy: m.accuracy < 99.1 ? m.accuracy + 0.02 : 99.1,
        casesProcessed: m.casesProcessed + Math.floor(Math.random() * 5)
      }));

      if (Math.random() > 0.6) {
        const logTypes = ["success", "alert", "info", "system"];
        const messages = [
          "[RPA-BETA] Impossible Travel pattern intercepted in Brooklyn.",
          "[NIST-SC-7] Boundary protection handshake confirmed.",
          "[API] Lytx Telematics: Anomaly detected in Fleet-X.",
          "[WMS] Syncing eligibility metadata for 4,200 records.",
          "[FRAUD] Synthetic Identity Cluster neutralized via SQL-Trigger."
        ];
        const newLog = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          msg: messages[Math.floor(Math.random() * messages.length)],
          type: logTypes[Math.floor(Math.random() * logTypes.length)]
        };
        setLogs(prev => [newLog, ...prev].slice(0, 30));
      }
    }, 1500);
    return () => clearInterval(tick);
  }, [isLive]);

  // --- FILTERING ---
  const filteredData = useMemo(() => {
    return data.filter(c => 
      c.id.toLowerCase().includes(search.toLowerCase()) || 
      c.rule.toLowerCase().includes(search.toLowerCase()) ||
      c.borough.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // --- RENDERERS ---
  return (
    <div className="flex h-screen bg-[#020408] text-slate-300 font-mono overflow-hidden scanline-effect selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* --- SIDEBAR OPERATING SYSTEM NAV --- */}
      <aside className="w-80 bg-[#080a0f] border-r border-slate-800 flex flex-col shrink-0 z-20 shadow-2xl">
        <div className="p-8 flex items-center gap-4 border-b border-slate-800 bg-[#0a0d14]">
          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#05070a] p-3 rounded-lg border border-blue-500/50">
              <Shield className="text-blue-400" size={24} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Sovereign</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Kernel 5.0.0-PRO</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-10 custom-scrollbar">
          {/* Main Triage Section */}
          <div>
            <SidebarLabel label="Integrity Operations" />
            <div className="space-y-1">
              <SideBtn active={activeApp === 'dash'} onClick={() => setActiveApp('dash')} icon={<LayoutDashboard size={18} />} label="Command Center" />
              <SideBtn active={activeApp === 'triage'} onClick={() => setActiveApp('triage')} icon={<ShieldAlert size={18} />} label="Fraud Triage" badge={filteredData.length} />
              <SideBtn active={activeApp === 'geo'} onClick={() => setActiveApp('geo')} icon={<Globe size={18} />} label="GIS Heatmaps" />
            </div>
          </div>

          {/* Automation Section */}
          <div>
            <SidebarLabel label="Robotic Processing (RPA)" />
            <div className="space-y-1">
              <SideBtn active={activeApp === 'rpa'} onClick={() => setActiveApp('rpa')} icon={<Cpu size={18} />} label="Bot Registry" />
              <SideBtn active={activeApp === 'nist'} onClick={() => setActiveApp('nist')} icon={<ClipboardList size={18} />} label="NIST Compliance" />
            </div>
          </div>

          {/* External Projects Section */}
          <div>
            <SidebarLabel label="B2B & Public Sector" />
            <div className="space-y-1">
              <SideBtn icon={<TrendingUp size={18} />} label="Lytx Retention" />
              <SideBtn icon={<Zap size={18} />} label="NYC Events conversion" />
              <SideBtn icon={<Briefcase size={18} />} label="FHARPS Deliverables" />
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-6 border-t border-slate-800 bg-[#05070a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center font-bold text-white shadow-lg border border-blue-400/20">JL</div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Justin LaPuff</p>
              <p className="text-[10px] text-blue-500 font-black uppercase">Root Administrator</p>
            </div>
          </div>
          <Settings size={18} className="text-slate-600 hover:text-white transition-colors cursor-pointer" />
        </div>
      </aside>

      {/* --- MAIN INTERFACE --- */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* GLOBAL HEADER BAR */}
        <header className="h-24 border-b border-slate-800 bg-[#080a0f]/90 backdrop-blur-md flex items-center justify-between px-10 shrink-0 z-10">
          <div className="flex items-center gap-12">
            <div className="group cursor-help">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 group-hover:text-blue-400 transition-colors">Stewardship Budget</p>
              <p className="text-3xl font-black text-white tracking-tighter tabular-nums">
                ${metrics.budget.toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-px bg-slate-800 shadow-[1px_0_0_rgba(255,255,255,0.05)]" />
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">RPA Throughput</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-blue-400 tabular-nums">{metrics.casesProcessed.toLocaleString()}</p>
                <span className="text-[10px] text-slate-600">CASES</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isLive ? 'Link Stable' : 'Link Offline'}</span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono">Uptime: 422:12:04:12</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="flex items-center gap-2">
              <ActionIcon icon={<Bell size={20} />} active />
              <ActionIcon icon={<Share2 size={20} />} />
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`ml-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                  isLive ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                }`}
              >
                {isLive ? 'Kill Connection' : 'Restore Link'}
              </button>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#05070a] relative">
          
          {/* APPS ROUTER */}
          {activeApp === 'triage' && (
            <>
              {/* METRICS SUMMARY */}
              <div className="grid grid-cols-4 gap-6 shrink-0">
                <MetricCard label="Integrity Accuracy" val={`${metrics.accuracy.toFixed(2)}%`} sub="+22.4% vs Baseline" icon={<Crosshair />} color="text-green-400" />
                <MetricCard label="Fraud Recoupment" val="$14.2M" sub="FY26 Target: $20M" icon={<DollarSign />} color="text-blue-400" />
                <MetricCard label="Active Threats" val="12" sub="Critical Intensity" icon={<AlertCircle />} color="text-red-400" danger />
                <MetricCard label="Network Latency" val="14ms" sub="NY-CDC-01 Node" icon={<Activity />} color="text-purple-400" />
              </div>

              {/* TRIAGE ENGINE GRID */}
              <div className="grid grid-cols-12 gap-8 h-[750px]">
                
                {/* CASE TABLE */}
                <div className="col-span-8 bg-[#0a0d14] border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30"><ShieldAlert className="text-blue-400" size={22} /></div>
                      <div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Integrity Triage Engine</h2>
                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em]">Live ISO8583 Packet Stream</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search Registry..." 
                          className="bg-black/40 border border-slate-800 rounded-full pl-12 pr-6 py-2.5 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-80 transition-all text-white"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all"><Download size={18} /></button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-[11px] font-mono border-collapse">
                      <thead className="bg-[#05070a]/80 sticky top-0 z-10 backdrop-blur-xl border-b border-slate-800">
                        <tr className="text-slate-500 uppercase font-black tracking-widest">
                          <th className="p-5">Identifier</th>
                          <th className="p-5">Rule / Logic</th>
                          <th className="p-5">Intensity</th>
                          <th className="p-5">Zone</th>
                          <th className="p-5">Agent</th>
                          <th className="p-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {filteredData.map((c, i) => (
                          <tr 
                            key={c.id} 
                            onClick={() => setSelectedCase(c)}
                            className={`group cursor-pointer transition-all duration-200 ${selectedCase?.id === c.id ? 'bg-blue-600/10' : 'hover:bg-blue-400/[0.03]'}`}
                          >
                            <td className="p-5">
                              <p className="text-white font-black tracking-widest group-hover:text-blue-400 transition-colors">{c.id}</p>
                              <p className="text-[9px] text-slate-600 mt-1">{new Date(c.timestamp).toLocaleString()}</p>
                            </td>
                            <td className="p-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4">{c.rule}()</span>
                                <span className="text-[9px] text-slate-600">NIST: {c.payload.nist_control}</span>
                              </div>
                            </td>
                            <td className="p-5">
                              <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div className={`h-full rounded-full ${
                                  c.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                  c.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                                }`} style={{ width: `${c.riskScore}%` }} />
                              </div>
                            </td>
                            <td className="p-5 font-bold text-slate-400">{c.borough}</td>
                            <td className="p-5">
                              <div className="flex items-center gap-2">
                                <Cpu size={12} className="text-slate-600" />
                                <span className="text-slate-500">{c.agent}</span>
                              </div>
                            </td>
                            <td className="p-5 text-right">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                c.status === 'Neutralized' ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' :
                                c.status === 'Flagged' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Neutralized' ? 'bg-green-500 animate-pulse' : 'bg-current opacity-50'}`} />
                                {c.status}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SIDEBAR INSPECTOR & LOGS */}
                <div className="col-span-4 flex flex-col gap-8 overflow-hidden">
                  
                  {/* PAYLOAD INSPECTOR */}
                  <div className="flex-1 bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <FileJson size={20} className="text-purple-400" />
                        <h3 className="font-black text-white uppercase tracking-tighter italic">Packet Inspector</h3>
                      </div>
                      <div className="flex gap-2">
                         <div className="p-1.5 bg-slate-800 rounded hover:text-white transition-colors cursor-pointer"><Eye size={14} /></div>
                         <div className="p-1.5 bg-slate-800 rounded hover:text-white transition-colors cursor-pointer"><Share2 size={14} /></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-black/60 rounded-2xl p-5 border border-slate-800 overflow-y-auto font-mono text-[11px] leading-relaxed relative scrollbar-hide">
                      {selectedCase ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4 border-b border-slate-800/50 pb-4">
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Packet ID</p>
                              <p className="text-white font-black">{selectedCase.id}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Integrity Ref</p>
                              <p className="text-purple-400 font-bold">{selectedCase.payload.trace_route}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                             <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Metadata Cluster</p>
                             <div className="bg-[#05070a] border border-slate-800/50 rounded-xl p-3 text-[10px] space-y-1">
                                <p><span className="text-slate-500">Linked Household:</span> 04</p>
                                <p><span className="text-slate-500">Geo Signature:</span> {selectedCase.payload.geo_tag}</p>
                                <p><span className="text-slate-500">ISO-Auth Code:</span> {selectedCase.payload.raw_hex}</p>
                             </div>
                          </div>

                          <div>
                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-2">Rule Logic Raw (JSON)</p>
                            <pre className="text-[10px] text-green-400 bg-black rounded-lg p-4 border border-green-500/20 overflow-x-auto shadow-inner">
                              {JSON.stringify({
                                rule_triggered: selectedCase.rule,
                                intensity_scalar: selectedCase.riskScore / 100,
                                rpa_agent: selectedCase.agent,
                                nist_compliance: selectedCase.payload.nist_control,
                                status_code: selectedCase.status === 'Neutralized' ? 200 : 403,
                                timestamp_ms: new Date(selectedCase.timestamp).getTime()
                              }, null, 2)}
                            </pre>
                          </div>

                          <div className="pt-4 flex gap-2">
                            <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] shadow-[0_4px_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95 transition-all">
                              Force Neutralization
                            </button>
                            <button className="px-4 py-3 bg-red-600/10 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-600/20 transition-all active:scale-95">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 animate-pulse text-center space-y-4">
                          <div className="p-4 rounded-full bg-slate-800"><Navigation size={32} /></div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em]">Awaiting Selection Input</p>
                          <p className="text-[9px] max-w-[200px]">Select a packet from the triage stream to begin deep-layer audit review.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* REAL-TIME AUDIT LOG */}
                  <div className="h-64 bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <h3 className="font-black text-white uppercase tracking-tighter">Sovereign Kernel Logs</h3>
                      </div>
                      <span className="text-[9px] text-slate-600 font-bold">TTY1 / STREAM</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[9px] custom-scrollbar">
                      {logs.length === 0 && <p className="text-slate-700 italic">Initializing stream buffer...</p>}
                      {logs.map((log) => (
                        <div key={log.id} className="flex gap-3 group animate-[fadeIn_0.2s_ease-out]">
                          <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                          <span className={`leading-relaxed ${
                            log.type === 'alert' ? 'text-red-400 font-black' :
                            log.type === 'success' ? 'text-green-400' :
                            log.type === 'system' ? 'text-purple-400' : 'text-slate-400'
                          }`}>
                            {log.msg}
                          </span>
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* RPA BOT REGISTRY APP */}
          {activeApp === 'rpa' && (
            <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
               <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Robotic Processing Hub</h2>
                    <p className="text-xs text-slate-500 tracking-widest font-bold">Active UiPath Cluster Monitoring</p>
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-3 shadow-lg hover:bg-blue-500 transition-all">
                    <Play size={16} fill="currentColor" /> Deploy New Instance
                  </button>
               </div>

               <div className="grid grid-cols-3 gap-8">
                  <BotCard name="Bot-Alpha (SNAP)" status="Running" load={42} uptime="124h" tasks={822} />
                  <BotCard name="Bot-Beta (WMS)" status="Running" load={88} uptime="12h" tasks={4112} danger />
                  <BotCard name="Bot-Gamma (EBT)" status="Idle" load={0} uptime="42m" tasks={0} idle />
               </div>

               <div className="bg-[#0a0d14] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">RPA Task Performance History</h3>
                  <div className="h-[400px] flex items-end gap-2 border-b border-l border-slate-800 pb-2 pl-2">
                     {Array.from({length: 40}).map((_, i) => (
                       <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-blue-900/40 to-blue-500/80 rounded-t-sm hover:scale-110 transition-transform cursor-crosshair group relative" 
                        style={{ height: `${20 + Math.random() * 80}%` }}
                       >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-1.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            Vol: {(Math.random() * 1000).toFixed(0)} tasks
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-slate-600 uppercase font-black">
                     <span>May 01</span>
                     <span>May 07</span>
                     <span>May 14 (Current)</span>
                  </div>
               </div>
            </div>
          )}

          {/* NIST COMPLIANCE APP */}
          {activeApp === 'nist' && (
            <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
              <div className="bg-gradient-to-r from-blue-900/20 to-transparent p-8 rounded-3xl border border-blue-500/20 shadow-2xl">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-3">
                   <Lock size={28} className="text-blue-500" /> NIST-800-53 Control Registry
                 </h2>
                 <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                   Comprehensive federal compliance tracking for the $7.6B Stewardship engine. Real-time audit trails mapping technical integrity to regulatory frameworks.
                 </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {NIST_CATALOG.map((ctrl) => (
                  <div key={ctrl.id} className="bg-[#0a0d14] border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-8">
                       <div className="bg-slate-900 w-16 h-16 rounded-xl flex items-center justify-center font-black text-blue-400 border border-slate-800 group-hover:border-blue-400/50 transition-all">
                         {ctrl.id}
                       </div>
                       <div>
                         <h3 className="text-lg font-black text-white tracking-tight">{ctrl.name}</h3>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Last Assessed: {ctrl.lastAudit}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-12">
                       <div className="text-right">
                         <p className="text-[10px] text-slate-600 uppercase font-black mb-1">Status</p>
                         <div className={`flex items-center gap-2 font-bold text-sm ${ctrl.status === 'Compliant' ? 'text-green-400' : 'text-red-400'}`}>
                            {ctrl.status === 'Compliant' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {ctrl.status}
                         </div>
                       </div>
                       <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black text-white transition-all">
                         Request Re-Audit
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- NOTIFICATION TOAST OVERLAY --- */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
        <Toast msg="System Integrity Baseline Check: 100% Passed" type="success" />
        <Toast msg="High Risk: synthetic_identity_clustering (11201) Detected" type="danger" delay="5s" />
      </div>

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
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), Python (Pandas, scikit-learn, NetworkX), PostgreSQL, Redis, NIST 800-53 control mapping, ISO 8583 packet schema, dbt Core
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> Fraud risk scoring using ensemble classification (Random Forest + Gradient Boost); EBT transaction velocity analysis against household benefit baselines; anomaly detection with z-score thresholding; NIST 800-53 AU-2/AU-6 audit log generation; identity graph traversal for shared PII detection across benefit applications; risk cases and transaction records are simulated based on HRA/SNAP program parameters
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> HRA/SNAP administrative data model frameworks; USDA FNS fraud detection and QC methodology; NYC DSS case management architecture; NIST 800-53 Rev 5 control catalog; fraud case data simulated based on published HRA program integrity documentation
        </p>
      </div>
    </div>
  );
}

// --- REUSABLE SOVEREIGN COMPONENTS ---

const SideBtn = ({ active, onClick, icon, label, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      active ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] scale-[1.02]' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`${active ? 'text-white' : 'text-slate-600 group-hover:text-blue-400 transition-colors'}`}>
        {icon}
      </div>
      <span className="text-sm font-black tracking-tight uppercase italic">{label}</span>
    </div>
    {badge && (
      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${active ? 'bg-white/20 text-white' : 'bg-slate-900 text-blue-500 border border-blue-500/20'}`}>
        {badge}
      </span>
    )}
  </button>
);

const SidebarLabel = ({ label }) => (
  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 mt-2 ml-2 select-none">{label}</p>
);

const ActionIcon = ({ icon, active }) => (
  <div className="relative cursor-pointer p-2 rounded-lg hover:bg-slate-800 transition-colors group">
    <div className={`transition-colors ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}>
      {icon}
    </div>
    {active && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#080a0f]"></span>}
  </div>
);

const MetricCard = ({ label, val, sub, icon, color, danger }) => (
  <div className={`bg-[#0a0d14] border border-slate-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group transition-all hover:border-slate-600 ${danger ? 'animate-[blink-red_2s_infinite]' : ''}`}>
    <div className="absolute -right-4 -top-4 text-slate-100 opacity-[0.03] scale-[2.5] group-hover:scale-[2.8] group-hover:rotate-12 transition-transform duration-1000">
      {icon}
    </div>
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 group-hover:border-blue-500/50 transition-colors ${color}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className="text-[9px] font-black text-slate-600 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 shadow-inner">
        REAL-TIME
      </span>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-3">
      <h3 className={`text-3xl font-black tabular-nums tracking-tighter text-white`}>{val}</h3>
      <span className={`text-[10px] font-bold ${sub.includes('+') || sub.includes('-') ? 'text-green-400' : 'text-slate-500'}`}>
        {sub}
      </span>
    </div>
  </div>
);

const BotCard = ({ name, status, load, uptime, tasks, danger, idle }) => (
  <div className="bg-[#0a0d14] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-1 h-full ${idle ? 'bg-slate-700' : danger ? 'bg-red-500' : 'bg-green-500'}`} />
    <div className="flex justify-between items-start mb-6">
      <h4 className="text-lg font-black text-white italic">{name}</h4>
      <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
        idle ? 'bg-slate-800 text-slate-500 border-slate-700' : 
        danger ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
        'bg-green-500/10 text-green-500 border-green-500/30'
      }`}>
        {status}
      </span>
    </div>
    <div className="space-y-4">
       <div>
         <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
           <span>Memory Load</span>
           <span className={load > 80 ? 'text-red-400' : ''}>{load}%</span>
         </div>
         <div className="h-1.5 w-full bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${load > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${load}%` }} />
         </div>
       </div>
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 p-3 rounded-xl border border-slate-800">
             <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Uptime</p>
             <p className="text-xs font-bold text-white">{uptime}</p>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-slate-800">
             <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Tasks Completed</p>
             <p className="text-xs font-bold text-white">{tasks.toLocaleString()}</p>
          </div>
       </div>
    </div>
  </div>
);

const Toast = ({ msg, type, delay = '0s' }) => (
  <div 
    className={`pointer-events-auto p-4 rounded-2xl border flex items-center gap-4 shadow-2xl animate-[slideIn_0.5s_ease-out_forwards] translate-x-[150%] ${
      type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'
    }`}
    style={{ animationDelay: delay }}
  >
    {type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
    <p className="text-[11px] font-black uppercase tracking-tight">{msg}</p>
  </div>
);

// --- CSS KEYFRAMES INJECTED ---
const KEYFRAMES = `
  @keyframes slideIn { from { transform: translateX(150%); } to { transform: translateX(0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = KEYFRAMES;
  document.head.appendChild(style);
}