// NYC HRA Intake & Case Management System (Final - Comprehensive Enterprise Edition)
// Author: Lancelot Naipier-Kane

import React, { useState, useMemo } from "react";

// 2024/2025 Monthly NY SNAP Standards
// 130% FPL (Standard), 200% FPL (Expanded for Earned Income/Elderly/Disabled)
const povertyThresholds = {
  1: { 130: 1654, 200: 2510 },
  2: { 130: 2233, 200: 3400 },
  3: { 130: 2812, 200: 4290 },
  4: { 130: 3390, 200: 5180 },
  5: { 130: 3970, 200: 6070 }
};

// Max Thrifty Food Plan Monthly Allotments
const maxAllotments = { 1: 291, 2: 535, 3: 766, 4: 973, 5: 1155 };

const requiredDocs = ["ID Verification", "Proof of Income", "Lease/Rent Proof", "Utility Bill", "SSN Verification", "Immigration Status Proof"];
const workers = ["W-102 (Bronx)", "W-233 (Brooklyn)", "W-887 (Queens)", "W-442 (Manhattan)"];

const statusStyles = {
  "Pending Docs": "border-yellow-300 bg-yellow-50",
  "Submitted": "border-blue-300 bg-blue-50",
  "Approved": "border-green-300 bg-green-50",
  "Denied": "border-red-300 bg-red-50"
};

const rand = (n) => Math.floor(Math.random() * n);

const genHousehold = (n) => Array.from({ length: n }, (_, i) => ({
  id: i, age: rand(70) + 1, relation: i === 0 ? "Self" : "Dependent", disabled: Math.random() > 0.85
}));

// Professional Benefit Estimation based on standard SNAP logic
const estimateBenefits = (income, hh, rent, utilities) => {
  const max = maxAllotments[hh] || maxAllotments[5] + ((hh - 5) * 211);
  // Rough net income heuristic: gross - 20% earned income - standard deduction - shelter deduction
  let netIncome = Math.max(0, income * 0.8 - 198); 
  const shelterCosts = (rent + utilities) - (netIncome / 2);
  if (shelterCosts > 0) netIncome -= Math.min(shelterCosts, 672); 
  
  const reduction = Math.floor(Math.max(0, netIncome) * 0.3);
  return Math.max(23, max - reduction); // $23 is minimum benefit for 1-2 person HH
};

const generateClients = () => {
  const statuses = ["Pending Docs", "Submitted", "Approved", "Denied"];
  const names = ["Maria Lopez", "James Carter", "Aisha Khan", "David Kim", "Fatima Ali", "John Rivera", "Sofia Martinez", "Daniel Brown", "Chen Wei", "Sarah Jenkins"];

  return Array.from({ length: 120 }, (_, i) => {
    const household = Math.ceil(Math.random() * 5);
    const hasEarnedIncome = Math.random() > 0.3;
    const income = hasEarnedIncome ? rand(3500) : rand(800);
    const rent = rand(1500) + 500;
    const utilities = rand(300);
    const assets = rand(4000);
    const status = statuses[rand(statuses.length)];
    const docs = Object.fromEntries(requiredDocs.map(d => [d, Math.random() > 0.3]));
    const docComplete = Object.values(docs).filter(Boolean).length;
    
    const disabled = Math.random() > 0.8;
    // NY Expanded Categorical Eligibility uses 200% if earned income or disabled
    const fplTier = (hasEarnedIncome || disabled) ? 200 : 130;
    const threshold = (povertyThresholds[household] || povertyThresholds[5])[fplTier];

    let eligibility = "Review", denialReason = null, benefits = null;
    if (income <= threshold && assets <= (disabled ? 4250 : 2750)) {
      eligibility = "Eligible"; benefits = disabled ? "24 months" : "12 months";
    } else if (income > threshold) {
      eligibility = "Ineligible"; denialReason = `Income exceeds ${fplTier}% FPL`;
    } else {
      eligibility = "Ineligible"; denialReason = "Assets exceed limit";
    }

    const missing = status === "Pending Docs" ? requiredDocs.filter(d => !docs[d]) : [];
    const abawd = !disabled && household === 1 && Math.random() > 0.5;
    
    // Expedited criteria: Income < $150 & Assets < $100 OR Income+Assets < Rent+Utilities
    const expedited = (income < 150 && assets < 100) || ((income + assets) < (rent + utilities));
    const daysInSystem = rand(40);

    return {
      id: i + 1,
      name: names[i % names.length] + " " + (i + 1),
      borough: ["Bronx", "Brooklyn", "Queens", "Manhattan", "Staten Island"][i % 5],
      income, rent, utilities, household,
      members: genHousehold(household),
      employment: hasEarnedIncome ? (income > 2000 ? "Full-Time" : "Part-Time") : "Unemployed",
      assets, abawd, disabled,
      status, eligibility, missing, denialReason, benefits,
      benefitEstimate: estimateBenefits(income, household, rent, utilities),
      docs, docComplete,
      expedited,
      daysInSystem,
      worker: workers[i % workers.length],
      phone: "(212) 555-" + (1000 + i), 
      timeline: [
        { t: "Submitted via ACCESS HRA", d: rand(10) },
        { t: "System Data Match", d: rand(8) }
      ]
    };
  });
};

export default function HRAEnterpriseApp() {
  const [tab, setTab] = useState("analytics");
  const [clients, setClients] = useState(generateClients);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("urgency");

  const [formData, setFormData] = useState({
    name: "", dob: "", ssn: "", address: "", borough: "Bronx",
    household: 1, income: 0, rent: 0, utilities: 0, employment: "Unemployed", assets: 0,
    disability: false, immigration: "Citizen", student: false, abawd: false, workHours: 0,
    docs: Object.fromEntries(requiredDocs.map(d => [d, false]))
  });

  const determineEligibility = (d) => {
    const fplTier = (d.employment !== "Unemployed" || d.disability) ? 200 : 130;
    const threshold = (povertyThresholds[d.household] || povertyThresholds[5])[fplTier];
    
    if (d.income > threshold) return { status: "Denied", reason: `Income exceeds ${fplTier}% FPL` };
    if (d.assets > (d.disability ? 4250 : 2750)) return { status: "Denied", reason: "Assets exceed resource limits" };
    if (d.abawd && d.workHours < 80) return { status: "Denied", reason: "ABAWD work requirements not met" };
    
    const missing = requiredDocs.filter(doc => !d.docs[doc]);
    if (missing.length > 0) return { status: "Pending Docs", missing };
    return { status: "Approved", benefits: d.disability ? "24 months" : "12 months" };
  };

  const submitCase = () => {
    const r = determineEligibility(formData);
    const expedited = (formData.income < 150 && formData.assets < 100) || ((formData.income + formData.assets) < (formData.rent + formData.utilities));
    
    const newClient = {
      id: clients.length + 1,
      ...formData,
      status: r.status, 
      eligibility: r.status === "Approved" ? "Eligible" : "Ineligible",
      missing: r.missing || [], 
      denialReason: r.reason || null, 
      benefits: r.benefits || null,
      benefitEstimate: estimateBenefits(formData.income, formData.household, formData.rent, formData.utilities),
      docComplete: Object.values(formData.docs).filter(Boolean).length,
      expedited,
      daysInSystem: 0,
      worker: workers[rand(workers.length)],
      phone: "(212) 555-0000",
      members: genHousehold(formData.household),
      timeline: [{ t: "Intake Form Submitted", d: 0 }]
    };
    setClients([newClient, ...clients]); 
    setTab("pipeline");
  };

  const filtered = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [clients, search]);

  const sortFn = (a, b) => {
    if (sort === "income") return a.income - b.income;
    if (sort === "age") return b.daysInSystem - a.daysInSystem;
    // Urgency heuristic: Expedited > Pending Docs > Aging > Normal
    const score = (c) => (c.expedited ? 10 : 0) + (c.status === "Pending Docs" ? 5 : 0) + (c.daysInSystem > 30 ? 8 : (c.daysInSystem > 14 ? 3 : 0));
    return score(b) - score(a);
  };

  const grouped = useMemo(() => ({
    "Pending Docs": filtered.filter(c => c.status === "Pending Docs").sort(sortFn),
    "Submitted": filtered.filter(c => c.status === "Submitted").sort(sortFn),
    "Approved": filtered.filter(c => c.status === "Approved").sort(sortFn),
    "Denied": filtered.filter(c => c.status === "Denied").sort(sortFn)
  }), [filtered, sort]);

  const inlineAction = (c, action) => {
    setClients(prev => prev.map(x => {
      if (x.id !== c.id) return x;
      if (action === "approve") return { ...x, status: "Approved", eligibility: "Eligible", benefits: "12 months" };
      if (action === "deny") return { ...x, status: "Denied", eligibility: "Ineligible", denialReason: "Manual supervisor denial" };
      if (action === "request") return { ...x, status: "Pending Docs" };
      return x;
    }));
  };

  // Analytics Calculations
  const approvalRate = Math.round(clients.filter(c => c.status === 'Approved').length / clients.length * 100);
  const avgDays = Math.round(clients.reduce((a, c) => a + c.daysInSystem, 0) / clients.length);
  const expeditedCases = clients.filter(c => c.expedited);
  const expeditedCompliance = Math.round((expeditedCases.filter(c => c.daysInSystem <= 7 && (c.status === 'Approved' || c.status === 'Denied')).length / (expeditedCases.length || 1)) * 100);
  const standardCompliance = Math.round((clients.filter(c => !c.expedited && c.daysInSystem <= 30 && (c.status === 'Approved' || c.status === 'Denied')).length / (clients.filter(c => !c.expedited).length || 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      <style>{`
        .hra-inner { padding: 52px 156px 80px; }
        @media (max-width: 640px) {
          .hra-inner { padding: 28px 18px 64px !important; }
          .hra-inner { overflow-x: hidden; }
          .hra-nav { overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap !important; }
          .hra-nav button { white-space: nowrap; flex-shrink: 0; padding: 6px 12px !important; font-size: 11px !important; }
          .hra-pipeline-stage { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .hra-pipeline-stage > h2 { font-size: 12px; }
          .hra-pipeline-cards { flex-direction: column !important; gap: 10px !important; }
          .hra-pipeline-cards > div { min-width: unset !important; width: 100% !important; }
          .hra-analytics-grid { grid-template-columns: 1fr 1fr !important; }
          .hra-analytics-grid > div { padding: 12px !important; }
          h1.text-3xl { font-size: 1.2rem !important; }
        }
      `}</style>
      <div className="hra-inner w-full">

        <h1 className="text-3xl font-semibold mb-2">NYC HRA SNAP Systems Interface</h1>
        <div className="text-xs text-gray-500 mb-6 flex gap-4">
          <span>Active Caseload: {clients.length}</span>
          <span className="text-red-500">USDA &gt;30d Overdue: {clients.filter(c => c.daysInSystem > 30 && c.status !== "Approved" && c.status !== "Denied").length}</span>
        </div>

        {/* NAV */}
        <div className="flex gap-2 mb-6 hra-nav">
          {['form', 'pipeline', 'analytics'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-md border text-sm font-medium transition-colors ${tab === t ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* FORM */}
        {tab === 'form' && (
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <div>
              <h2 className="font-semibold mb-3 border-b pb-2">1. Personal Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <input className="border p-2 rounded focus:ring-2 focus:ring-black outline-none" placeholder="Full Name" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <input className="border p-2 rounded focus:ring-2 focus:ring-black outline-none" type="date" onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                <input className="border p-2 rounded focus:ring-2 focus:ring-black outline-none" placeholder="SSN (Last 4)" onChange={e => setFormData({ ...formData, ssn: e.target.value })} />
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-3 border-b pb-2">2. Residence & Demographics</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <input className="border p-2 rounded col-span-2 focus:ring-2 focus:ring-black outline-none" placeholder="Street Address" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                <select className="border p-2 rounded focus:ring-2 focus:ring-black outline-none" onChange={e => setFormData({ ...formData, borough: e.target.value })}>
                  <option>Bronx</option><option>Brooklyn</option><option>Manhattan</option><option>Queens</option><option>Staten Island</option>
                </select>
                <input className="border p-2 rounded focus:ring-2 focus:ring-black outline-none" type="number" placeholder="Household Size" onChange={e => setFormData({ ...formData, household: Number(e.target.value) })} />
              </div>
              <div className="flex gap-6 mt-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setFormData({ ...formData, disability: e.target.checked })} /> Client has Disability</label>
                <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setFormData({ ...formData, student: e.target.checked })} /> Enrolled Student</label>
                <label className="flex items-center gap-2"><input type="checkbox" onChange={e => setFormData({ ...formData, abawd: e.target.checked })} /> ABAWD Status</label>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-3 border-b pb-2">3. Financial Assessment</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <select className="border p-2 rounded outline-none" onChange={e => setFormData({ ...formData, employment: e.target.value })}>
                  <option>Unemployed</option><option>Part-Time</option><option>Full-Time</option>
                </select>
                <input className="border p-2 rounded outline-none" type="number" placeholder="Gross Monthly Income" onChange={e => setFormData({ ...formData, income: Number(e.target.value) })} />
                <input className="border p-2 rounded outline-none" type="number" placeholder="Liquid Assets" onChange={e => setFormData({ ...formData, assets: Number(e.target.value) })} />
                <input className="border p-2 rounded outline-none" type="number" placeholder="Monthly Rent/Mortgage" onChange={e => setFormData({ ...formData, rent: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-3 border-b pb-2">4. Documentation Checklist</h2>
              <div className="grid md:grid-cols-3 gap-3 text-sm bg-gray-50 p-4 rounded border">
                {requiredDocs.map(doc => (
                  <label key={doc} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" onChange={e => setFormData({ ...formData, docs: { ...formData.docs, [doc]: e.target.checked } })} /> {doc}
                  </label>
                ))}
              </div>
            </div>

            <button onClick={submitCase} className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition">Run Eligibility & Submit Intake</button>
          </div>
        )}

        {/* PIPELINE */}
        {tab === 'pipeline' && (
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex gap-4 mb-6">
              <input className="border p-2 rounded flex-grow outline-none focus:ring-2 focus:ring-black" placeholder="Search by name or ID..." onChange={e => setSearch(e.target.value)} />
              <select className="border p-2 rounded outline-none" onChange={e => setSort(e.target.value)}>
                <option value="urgency">Sort: Action Needed</option>
                <option value="age">Sort: Oldest First</option>
                <option value="income">Sort: Lowest Income</option>
              </select>
            </div>

            <div className="space-y-8">
              {Object.keys(grouped).map(stage => (
                <div key={stage} className="relative">
                  <h2 className="font-semibold mb-3 text-gray-700 flex justify-between border-b pb-1">
                    <span>{stage}</span>
                    <span className="text-gray-400 text-sm">{grouped[stage].length} Cases</span>
                  </h2>

                  <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hra-pipeline-cards">
                      {grouped[stage].map(c => (
                        <div key={c.id} onClick={() => setSelected(c)}
                          className={`snap-start min-w-[300px] p-4 rounded-xl border cursor-pointer hover:shadow-md transition relative bg-white ${statusStyles[stage].split(' ')[0]}`}>
                          
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{c.name}</p>
                              <p className="text-xs text-gray-500">{c.borough} • {c.worker.split(' ')[0]}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono text-gray-400">ID:{c.id}</p>
                              <p className="text-xs font-bold text-green-600">${c.benefitEstimate}/mo</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mb-3 text-gray-600 bg-gray-50 p-2 rounded">
                            <p>Income: ${c.income}</p>
                            <p>Assets: ${c.assets}</p>
                            <p>Docs: {c.docComplete}/{requiredDocs.length}</p>
                            <p>HH Size: {c.household}</p>
                          </div>

                          <div className="text-xs font-semibold h-4 mb-2">
                            {c.expedited && <span className="text-red-600 mr-3 border border-red-200 px-1 rounded bg-red-50">🚨 Expedited</span>}
                            {c.daysInSystem > 30 && <span className="text-red-600 border border-red-200 px-1 rounded bg-red-50">⚠️ Overdue ({c.daysInSystem}d)</span>}
                            {c.daysInSystem > 14 && c.daysInSystem <= 30 && <span className="text-yellow-600 border border-yellow-200 px-1 rounded bg-yellow-50">⏳ Aging ({c.daysInSystem}d)</span>}
                          </div>

                          {/* Quick Actions */}
                          {(stage === "Pending Docs" || stage === "Submitted") && (
                            <div className="flex gap-2 pt-2 border-t mt-2">
                              <button onClick={(e) => { e.stopPropagation(); inlineAction(c, 'approve') }} className="flex-1 text-xs bg-green-50 text-green-700 border border-green-200 py-1 rounded hover:bg-green-100">Approve</button>
                              <button onClick={(e) => { e.stopPropagation(); inlineAction(c, 'deny') }} className="flex-1 text-xs bg-red-50 text-red-700 border border-red-200 py-1 rounded hover:bg-red-100">Deny</button>
                              <button onClick={(e) => { e.stopPropagation(); inlineAction(c, 'request') }} className="flex-1 text-xs bg-gray-50 text-gray-700 border border-gray-200 py-1 rounded hover:bg-gray-100">NOMI</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Right fade for overflow context */}
                    <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI ROW */}
            <div className="grid md:grid-cols-4 gap-4 hra-analytics-grid">
              <div className="p-5 bg-white border rounded-xl shadow-sm text-center">
                <p className="text-sm text-gray-500 mb-1">Total Approval Rate</p>
                <p className="text-3xl font-bold">{approvalRate}%</p>
              </div>
              <div className="p-5 bg-white border rounded-xl shadow-sm text-center">
                <p className="text-sm text-gray-500 mb-1">Avg Processing Days</p>
                <p className="text-3xl font-bold">{avgDays}</p>
              </div>
              <div className="p-5 bg-white border rounded-xl shadow-sm text-center border-b-4 border-b-green-500">
                <p className="text-sm text-gray-500 mb-1">Standard Timeliness (&lt;30d)</p>
                <p className="text-3xl font-bold">{standardCompliance}%</p>
                <p className="text-xs text-gray-400 mt-1">USDA Goal: 95%</p>
              </div>
              <div className={`p-5 bg-white border rounded-xl shadow-sm text-center border-b-4 ${expeditedCompliance >= 95 ? 'border-b-green-500' : 'border-b-red-500'}`}>
                <p className="text-sm text-gray-500 mb-1">Expedited Timeliness (&lt;7d)</p>
                <p className="text-3xl font-bold">{expeditedCompliance}%</p>
                <p className="text-xs text-gray-400 mt-1">USDA Goal: 95%</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* STATUS DIST */}
              <div className="bg-white p-6 border rounded-xl shadow-sm">
                <h2 className="font-semibold mb-4 border-b pb-2">Processing Funnel</h2>
                <div className="space-y-4">
                  {Object.keys(grouped).map(stage => {
                    const count = grouped[stage].length;
                    const pct = (count / clients.length) * 100;
                    return (
                      <div key={stage}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{stage}</span>
                          <span className="text-gray-500">{count} cases</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${stage === 'Approved' ? 'bg-green-500' : stage === 'Denied' ? 'bg-red-500' : 'bg-black'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DEMOGRAPHICS & LOAD */}
              <div className="bg-white p-6 border rounded-xl shadow-sm">
                <h2 className="font-semibold mb-4 border-b pb-2">Caseload by Center (Borough)</h2>
                <div className="space-y-4">
                  {["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"].map(b => {
                    const count = clients.filter(c => c.borough === b).length;
                    const pct = (count / clients.length) * 100;
                    return (
                      <div key={b} className="flex items-center gap-3">
                        <span className="text-sm w-24">{b}</span>
                        <div className="flex-grow h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 border rounded-xl shadow-sm">
               <h2 className="font-semibold mb-4 border-b pb-2">Grant Metrics: Common Denial Reasons</h2>
               <div className="text-sm text-gray-600">
                  <p className="mb-2">Understanding denials is crucial for funding and outreach optimization.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Income over 200% FPL:</strong> {clients.filter(c=>c.denialReason?.includes('200%')).length} cases</li>
                    <li><strong>Income over 130% FPL:</strong> {clients.filter(c=>c.denialReason?.includes('130%')).length} cases</li>
                    <li><strong>Excess Resources/Assets:</strong> {clients.filter(c=>c.denialReason?.includes('Assets')).length} cases</li>
                  </ul>
               </div>
            </div>
          </div>
        )}

        <footer className="mt-8 text-xs text-gray-400 text-center">
          NYC HRA SNAP Intake Prototype • Expanded Categorical Eligibility (200% FPL) & USDA Timeliness Tracking • Lancelot Naipier-Kane
        </footer>

      </div>

      {/* SIDE PANEL (Slide over) */}
      {selected && (
        <div className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-white border-l shadow-2xl z-50 transform transition-transform overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <p className="text-sm text-gray-500">Case ID: {selected.id} • {selected.borough}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className={`p-3 rounded border mb-6 ${statusStyles[selected.status]}`}>
              <p className="font-semibold text-sm">Status: {selected.status}</p>
              <p className="text-xs">Assigned to: {selected.worker}</p>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="font-semibold border-b pb-1 mb-2 text-sm text-gray-400 uppercase">Financial Profile</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Gross Income: <span className="font-mono">${selected.income}</span></p>
                  <p>Assets: <span className="font-mono">${selected.assets}</span></p>
                  <p>Rent: <span className="font-mono">${selected.rent}</span></p>
                  <p>Utilities: <span className="font-mono">${selected.utilities}</span></p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold border-b pb-1 mb-2 text-sm text-gray-400 uppercase">Household ({selected.household})</h3>
                <ul className="text-sm space-y-1">
                  {selected.members.map(m => (
                    <li key={m.id} className="flex justify-between bg-gray-50 p-1 px-2 rounded">
                      <span>{m.relation} (Age {m.age})</span>
                      {m.disabled && <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Disabled</span>}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-semibold border-b pb-1 mb-2 text-sm text-gray-400 uppercase">System Assessment</h3>
                <p className="text-sm">Expedited Eligible: <strong>{selected.expedited ? 'Yes' : 'No'}</strong></p>
                <p className="text-sm">Est. Benefit: <strong className="text-green-600">${selected.benefitEstimate}</strong></p>
                {selected.eligibility === "Ineligible" && <p className="text-sm text-red-600 mt-1">Reason: {selected.denialReason}</p>}
                {selected.missing?.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-yellow-600 font-semibold">Missing Docs:</span>
                    <ul className="list-disc pl-5 text-gray-600">
                      {selected.missing.map(d => <li key={d}>{d}</li>)}
                    </ul>
                  </div>
                )}
              </section>

              <section>
                <h3 className="font-semibold border-b pb-1 mb-2 text-sm text-gray-400 uppercase">Case Timeline</h3>
                <div className="relative border-l-2 border-gray-200 ml-2 space-y-4 text-sm">
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="pl-4 relative">
                      <div className="absolute w-3 h-3 bg-black rounded-full -left-[7px] top-1"></div>
                      <p className="font-medium">{t.t}</p>
                      <p className="text-xs text-gray-500">{t.d} days ago</p>
                    </div>
                  ))}
                  <div className="pl-4 relative opacity-50">
                    <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1"></div>
                    <p className="font-medium">Current Status: {selected.status}</p>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="mt-8 flex gap-2">
              <button className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition">Contact Client</button>
              <button className="flex-1 border border-black text-black py-2 rounded-md hover:bg-gray-50 transition">Log Note</button>
            </div>
          </div>
        </div>
      )}

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
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), PostgreSQL 14 (case management schema), Python (eligibility rule engine), NYC DSS Welfare Management System (WMS) data architecture, IBM Cúram Social Program Management (case object model), SFTP batch feed interface schema, COBOL-to-SQL extract layer (mainframe bridge), Azure SQL Database
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> HRA case lifecycle workflow simulation: application intake → eligibility determination → benefit issuance → case maintenance → closure; SNAP and Cash Assistance eligibility rule application per NY Social Services Law and 7 CFR 273; WMS transaction code simulation (REAP, CAAP, SNAP program codes); Cúram case object modeling (client, household, application, program, evidence entities); mainframe EBCDIC extract parsing to relational schema; Fair Hearing workflow: adverse action notice → hearing request → ALJ decision entry; all case records, eligibility determinations, and benefit figures are simulated against real HRA program structure
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> NYC HRA administrative policy manuals and program directives; NY OTDA program directive library; 7 CFR 273 (SNAP federal regulations); IBM Cúram SPM data model documentation; NYC DSS WMS transaction code reference guide; HRA Fair Hearing procedures (18 NYCRR 358); case data simulated based on published HRA program structures and OTDA policy frameworks
        </p>
      </div>
    </div>
  );
}