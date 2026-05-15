import React, { useMemo, useState } from "react";
import {
  Users,
  Home,
  FileText,
  Shield,
  Search,
  Bell,
  BedDouble,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  TrendingUp,
  BarChart3,
  ClipboardCheck,
  Building2,
  ArrowRight,
  Filter,
  Activity,
  Layers,
  Database,
  ChevronRight,
  X,
  Save,
  Plus,
  MessageSquare,
  HeartHandshake,
  Menu,
  Mail,
  Globe,
  Radar,
} from "lucide-react";

export default function WAHMISBackendSystem() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [selectedOutcome, setSelectedOutcome] =
    useState("Permanent Housing");
  const [selectedFacilityFilter, setSelectedFacilityFilter] =
    useState("All");
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] =
    useState(false);
  const [notification, setNotification] = useState("");
  const [search, setSearch] = useState("");

  const clients = [
    {
      id: 1,
      name: "Sarah Martinez",
      age: 37,
      gender: "Female",
      city: "Seattle",
      program: "Rapid Rehousing",
      housing: "Emergency Shelter",
      status: "Active",
      vulnerability: 91,
      worker: "Angela Nguyen",
      phone: "(206) 555-0139",
      lastContact: "Today",
      barriers: [
        "Behavioral Health",
        "Chronic Homelessness",
      ],
      outcome: "Transitional",
      risk: "Critical",
    },
    {
      id: 2,
      name: "Michael Johnson",
      age: 49,
      gender: "Male",
      city: "Tacoma",
      program: "Veteran Stabilization",
      housing: "Bridge Housing",
      status: "Active",
      vulnerability: 72,
      worker: "Kevin Patel",
      phone: "(253) 555-0191",
      lastContact: "Yesterday",
      barriers: ["Substance Use", "Employment"],
      outcome: "Shelter",
      risk: "High",
    },
    {
      id: 3,
      name: "Jessica Brown",
      age: 28,
      gender: "Female",
      city: "Spokane",
      program: "Housing First",
      housing: "Permanent Supportive Housing",
      status: "Stabilized",
      vulnerability: 28,
      worker: "Maria Rivera",
      phone: "(509) 555-0144",
      lastContact: "Today",
      barriers: ["Income Instability"],
      outcome: "Permanent Housing",
      risk: "Low",
    },
    {
      id: 4,
      name: "Daniel Carter",
      age: 58,
      gender: "Male",
      city: "Olympia",
      program: "Medical Recovery",
      housing: "Unsheltered",
      status: "Pending Intake",
      vulnerability: 96,
      worker: "J. Collins",
      phone: "(360) 555-0188",
      lastContact: "2 hours ago",
      barriers: ["Medical", "Mobility"],
      outcome: "Shelter",
      risk: "Critical",
    },
  ];

  const facilities = [
    {
      name: "Seattle Emergency Housing",
      beds: 120,
      occupied: 111,
      waitlist: 17,
      status: "Near Capacity",
    },
    {
      name: "Tacoma Family Shelter",
      beds: 88,
      occupied: 61,
      waitlist: 3,
      status: "Available",
    },
    {
      name: "Olympia Stabilization Center",
      beds: 72,
      occupied: 72,
      waitlist: 29,
      status: "Critical",
    },
    {
      name: "Spokane Transitional Housing",
      beds: 140,
      occupied: 96,
      waitlist: 11,
      status: "Available",
    },
  ];

  const notes = [
    {
      type: "Housing Placement",
      date: "May 13",
      worker: "Angela Nguyen",
      details:
        "Rapid rehousing eligibility approved and landlord outreach initiated.",
    },
    {
      type: "Behavioral Health Referral",
      date: "May 11",
      worker: "Angela Nguyen",
      details:
        "Behavioral health intake scheduled with partner provider.",
    },
    {
      type: "Coordinated Entry Review",
      date: "May 08",
      worker: "Kevin Patel",
      details:
        "Prioritization score updated after vulnerability assessment.",
    },
  ];

  const reports = [
    {
      title: "Regional Housing Stability",
      value: "81%",
      change: "+6%",
    },
    {
      title: "Average Shelter Duration",
      value: "42 Days",
      change: "-11%",
    },
    {
      title: "Successful Placements",
      value: "318",
      change: "+14%",
    },
    {
      title: "Return-to-Homelessness",
      value: "9%",
      change: "-3%",
    },
  ];

  const selectedClient =
    clients.find((c) => c.id === selectedClientId) ||
    clients[0];

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const filteredFacilities = useMemo(() => {
    if (selectedFacilityFilter === "All")
      return facilities;

    return facilities.filter(
      (f) => f.status === selectedFacilityFilter
    );
  }, [selectedFacilityFilter]);

  const triggerNotification = (text) => {
    setNotification(text);

    setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  const saveCaseUpdate = () => {
    setShowCaseModal(false);
    setShowConfirmModal(true);

    setTimeout(() => {
      setShowConfirmModal(false);
      triggerNotification(
        "Case update successfully saved."
      );
    }, 1800);
  };

  const sidebarItems = [
    "Dashboard",
    "Clients",
    "Case Notes",
    "Housing Programs",
    "Data & Reporting",
    "Compliance",
  ];

  const renderDashboard = () => (
    <div className="space-y-5">
      {/* HERO */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0c557c] to-[#0e6d8f] p-7 text-white shadow-xl">
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Shield size={14} />
              Coordinated Entry + Housing Services
            </div>

            <h1 className="mt-4 text-4xl font-black leading-tight">
              WA Homeless Services Backend
            </h1>

            <p className="mt-4 text-[15px] leading-relaxed text-cyan-50">
              Enterprise-style HMIS simulation inspired
              by coordinated entry systems, housing
              stabilization workflows, shelter intake
              operations, and multi-agency case
              management environments used across
              Washington State support ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[320px]">
            {[
              {
                label: "Active Clients",
                value: "1,284",
              },
              {
                label: "Open Cases",
                value: "317",
              },
              {
                label: "Available Beds",
                value: "56",
              },
              {
                label: "Partner Agencies",
                value: "42",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/10 p-4 backdrop-blur"
              >
                <div className="text-xs uppercase tracking-wide text-cyan-100">
                  {card.label}
                </div>

                <div className="mt-3 text-3xl font-black">
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            title: "Critical Priority",
            value: "73",
            color: "text-red-600",
          },
          {
            title: "Housing Stability",
            value: "81%",
            color: "text-green-600",
          },
          {
            title: "Shelter Occupancy",
            value: "92%",
            color: "text-orange-600",
          },
          {
            title: "Service Engagement",
            value: "94%",
            color: "text-blue-600",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#dbe5eb] bg-white p-5 shadow-sm"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {item.title}
            </div>

            <div
              className={`mt-4 text-4xl font-black ${item.color}`}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* CLIENT + FACILITIES */}
      <div className="grid grid-cols-[1.1fr,0.9fr] gap-5">
        {/* CLIENT */}
        <div className="rounded-3xl border border-[#dbe5eb] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
                Selected Client
              </div>

              <h2 className="mt-2 text-2xl font-black text-slate-800">
                Case Overview
              </h2>
            </div>

            <button
              onClick={() => setShowCaseModal(true)}
              className="rounded-xl bg-[#0e6d8f] px-4 py-2 text-sm font-bold text-white shadow-lg"
            >
              Update Case
            </button>
          </div>

          <div className="mt-6 flex gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#0e6d8f] text-4xl font-black text-white">
              {selectedClient.name.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black text-slate-800">
                  {selectedClient.name}
                </h3>

                <div
                  className={`rounded-lg px-3 py-1 text-xs font-bold ${
                    selectedClient.risk === "Critical"
                      ? "bg-red-100 text-red-600"
                      : selectedClient.risk === "High"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {selectedClient.risk}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  {
                    icon: <Home size={15} />,
                    label: "Housing",
                    value: selectedClient.housing,
                  },
                  {
                    icon: <UserCheck size={15} />,
                    label: "Case Worker",
                    value: selectedClient.worker,
                  },
                  {
                    icon: <Phone size={15} />,
                    label: "Contact",
                    value: selectedClient.phone,
                  },
                  {
                    icon: <MapPin size={15} />,
                    label: "Region",
                    value: selectedClient.city,
                  },
                  {
                    icon: <Layers size={15} />,
                    label: "Program",
                    value: selectedClient.program,
                  },
                  {
                    icon: <Clock3 size={15} />,
                    label: "Last Contact",
                    value: selectedClient.lastContact,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#e1eaef] bg-[#f8fbfd] p-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#0e6d8f]">
                      {item.icon}
                      {item.label}
                    </div>

                    <div className="mt-3 text-sm font-semibold text-slate-700">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wide">
                  <span>Vulnerability Score</span>

                  <span>
                    {selectedClient.vulnerability}
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      selectedClient.vulnerability >= 90
                        ? "bg-red-500"
                        : selectedClient.vulnerability >= 70
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${selectedClient.vulnerability}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedClient.barriers.map(
                  (barrier, i) => (
                    <div
                      key={i}
                      className="rounded-full bg-[#e9f4f8] px-3 py-1 text-xs font-bold text-[#0e6d8f]"
                    >
                      {barrier}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SHELTERS */}
        <div className="rounded-3xl border border-[#dbe5eb] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
                Shelter Availability
              </div>

              <h2 className="mt-2 text-2xl font-black text-slate-800">
                Bed Coordination
              </h2>
            </div>

            <select
              value={selectedFacilityFilter}
              onChange={(e) =>
                setSelectedFacilityFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-[#dbe5eb] bg-white px-3 py-2 text-sm font-semibold outline-none"
            >
              <option>All</option>
              <option>Available</option>
              <option>Near Capacity</option>
              <option>Critical</option>
            </select>
          </div>

          <div className="mt-5 space-y-3">
            {filteredFacilities.map((facility, i) => {
              const percentage =
                (facility.occupied /
                  facility.beds) *
                100;

              return (
                <div
                  key={i}
                  className="rounded-2xl border border-[#e1eaef] bg-[#fbfdff] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-800">
                        {facility.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Regional shelter partner
                      </div>
                    </div>

                    <div
                      className={`rounded-lg px-2 py-1 text-xs font-bold ${
                        facility.status ===
                        "Critical"
                          ? "bg-red-100 text-red-600"
                          : facility.status ===
                            "Near Capacity"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {facility.status}
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        percentage >= 95
                          ? "bg-red-500"
                          : percentage >= 85
                          ? "bg-orange-500"
                          : "bg-[#0e6d8f]"
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[
                      {
                        label: "Beds",
                        value: facility.beds,
                      },
                      {
                        label: "Occupied",
                        value: facility.occupied,
                      },
                      {
                        label: "Available",
                        value:
                          facility.beds -
                          facility.occupied,
                      },
                      {
                        label: "Waitlist",
                        value: facility.waitlist,
                      },
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white p-2 text-center"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          {stat.label}
                        </div>

                        <div className="mt-1 text-lg font-black text-slate-800">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#dbe5eb] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
              Client Registry
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-800">
              Active Client Management
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#dbe5eb] bg-white px-3 py-2">
              <Search size={16} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search clients..."
                className="bg-transparent text-sm outline-none"
              />
            </div>

            <button
              onClick={() =>
                triggerNotification(
                  "New intake workflow initiated."
                )
              }
              className="rounded-xl bg-[#0e6d8f] px-4 py-2 text-sm font-bold text-white"
            >
              + New Intake
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#dbe5eb]">
          <table className="w-full">
            <thead className="bg-[#f4f9fb]">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">
                  Vulnerability
                </th>
                <th className="px-4 py-3">
                  Housing Status
                </th>
                <th className="px-4 py-3">
                  Assigned Worker
                </th>
                <th className="px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-[#e5edf1] hover:bg-[#f8fbfd]"
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-bold text-slate-800">
                        {client.name}
                      </div>

                      <div className="text-xs text-slate-500">
                        {client.city}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                    {client.program}
                  </td>

                  <td className="px-4 py-4">
                    <div
                      className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold ${
                        client.vulnerability >= 90
                          ? "bg-red-100 text-red-600"
                          : client.vulnerability >= 70
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {client.vulnerability}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                    {client.housing}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {client.worker}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedClientId(
                            client.id
                          )
                        }
                        className="rounded-lg bg-[#e9f4f8] px-3 py-1 text-xs font-bold text-[#0e6d8f]"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          setShowCaseModal(true)
                        }
                        className="rounded-lg bg-[#0e6d8f] px-3 py-1 text-xs font-bold text-white"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#dbe5eb] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
              Intervention History
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-800">
              Case Notes & Activity
            </h2>
          </div>

          <button
            onClick={() =>
              triggerNotification(
                "New case note created."
              )
            }
            className="rounded-xl bg-[#0e6d8f] px-4 py-2 text-sm font-bold text-white"
          >
            + Add Note
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {notes.map((note, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#dbe5eb] bg-[#fbfdff] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#e9f4f8] p-2 text-[#0e6d8f]">
                      <MessageSquare size={18} />
                    </div>

                    <div>
                      <div className="font-bold text-slate-800">
                        {note.type}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {note.date} • {note.worker}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm leading-relaxed text-slate-600">
                    {note.details}
                  </div>
                </div>

                <button className="rounded-lg bg-[#0e6d8f] px-3 py-1 text-xs font-bold text-white">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrograms = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            title: "Emergency Shelter",
            value: "1,284",
          },
          {
            title: "Transitional Housing",
            value: "648",
          },
          {
            title: "Permanent Housing",
            value: "318",
          },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() =>
              setSelectedOutcome(item.title)
            }
            className={`rounded-2xl border p-5 text-left transition-all ${
              selectedOutcome === item.title
                ? "border-[#0e6d8f] bg-[#0e6d8f] text-white shadow-xl"
                : "border-[#dbe5eb] bg-white"
            }`}
          >
            <div className="text-xs uppercase tracking-wide opacity-70">
              Outcome Category
            </div>

            <div className="mt-4 text-4xl font-black">
              {item.value}
            </div>

            <div className="mt-2 font-bold">
              {item.title}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-[#dbe5eb] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
              Outcome Analysis
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-800">
              {selectedOutcome}
            </h2>
          </div>

          <div className="rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            74% Stabilization Success
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          {[
            "6-Month Retention",
            "Housing Placements",
            "Program Engagement",
            "Cross-Agency Referrals",
          ].map((metric, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#f7fbfd] p-5"
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {metric}
              </div>

              <div className="mt-4 text-4xl font-black text-[#0e6d8f]">
                {[
                  "81%",
                  "318",
                  "92%",
                  "1,442",
                ][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReporting = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {reports.map((report, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#dbe5eb] bg-white p-5 shadow-sm"
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {report.title}
            </div>

            <div className="mt-4 text-4xl font-black text-slate-800">
              {report.value}
            </div>

            <div className="mt-2 text-sm font-bold text-green-600">
              {report.change}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#dbe5eb] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
              Analytics & Reporting
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-800">
              Regional Performance Dashboard
            </h2>
          </div>

          <button
            onClick={() =>
              triggerNotification(
                "Monthly performance report exported."
              )
            }
            className="rounded-xl bg-[#0e6d8f] px-4 py-2 text-sm font-bold text-white"
          >
            Export Report
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5">
          {[
            {
              title: "Housing Stabilization",
              percent: 81,
              color: "bg-green-500",
            },
            {
              title: "Behavioral Engagement",
              percent: 68,
              color: "bg-blue-500",
            },
            {
              title: "Emergency Placement",
              percent: 92,
              color: "bg-orange-500",
            },
            {
              title: "Service Coordination",
              percent: 88,
              color: "bg-[#0e6d8f]",
            },
          ].map((chart, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#dbe5eb] bg-[#fbfdff] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800">
                  {chart.title}
                </div>

                <div className="text-sm font-bold text-slate-600">
                  {chart.percent}%
                </div>
              </div>

              <div className="mt-5 h-5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${chart.color}`}
                  style={{
                    width: `${chart.percent}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#dbe5eb] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Shield className="text-[#0e6d8f]" />

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
              Compliance & Governance
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-800">
              Program Accountability
            </h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5">
          {[
            {
              title: "Client Consent Tracking",
              status: "Compliant",
            },
            {
              title: "Case Review Completion",
              status: "Compliant",
            },
            {
              title: "Documentation Audit",
              status: "Pending Review",
            },
            {
              title: "Housing Verification",
              status: "Compliant",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#dbe5eb] bg-[#fbfdff] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800">
                  {item.title}
                </div>

                <div
                  className={`rounded-lg px-3 py-1 text-xs font-bold ${
                    item.status === "Compliant"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {item.status}
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    item.status === "Compliant"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                  style={{
                    width:
                      item.status === "Compliant"
                        ? "92%"
                        : "74%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef4f7] text-slate-900">
      <style>{`
@media (max-width: 640px) {
  .hsd-layout { flex-direction: column !important; }
  .hsd-sidebar { width: 100% !important; min-height: unset !important; max-height: 220px; overflow-y: auto; border-right: none !important; border-bottom: 1px solid #dbe5eb; }
}
`}</style>
      {/* HEADER */}
      <div className="sticky top-0 z-50 border-b border-[#dbe5eb] bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button className="rounded-xl border border-[#dbe5eb] bg-white p-2">
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0c557c] to-[#0e6d8f] text-white shadow-lg">
                <HeartHandshake size={24} />
              </div>

              <div>
                <div className="text-2xl font-black text-slate-800">
                  WA HMIS Platform
                </div>

                <div className="text-xs font-semibold uppercase tracking-wide text-[#0e6d8f]">
                  Housing Services Backend
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-[#dbe5eb] bg-white p-2">
              <Bell size={18} />
            </button>

            <button className="rounded-xl border border-[#dbe5eb] bg-white p-2">
              <Mail size={18} />
            </button>

            <button className="rounded-xl border border-[#dbe5eb] bg-white p-2">
              <Globe size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex hsd-layout">
        {/* SIDEBAR */}
        <div className="w-[270px] border-r border-[#dbe5eb] bg-[#f7fbfd] min-h-screen hsd-sidebar">
          <div className="p-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#0c557c] to-[#0e6d8f] p-5 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <Database size={18} />

                <div className="font-bold">
                  System Status
                </div>
              </div>

              <div className="mt-5 text-3xl font-black">
                Connected
              </div>

              <div className="mt-2 text-sm text-cyan-100">
                Simulated coordinated entry data
                services operational.
              </div>
            </div>
          </div>

          <div className="px-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item}
                onClick={() =>
                  setActiveSection(item)
                }
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  activeSection === item
                    ? "bg-[#0e6d8f] text-white shadow-lg"
                    : "border border-[#dbe5eb] bg-white text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {{
                    Dashboard: (
                      <BarChart3 size={16} />
                    ),
                    Clients: <Users size={16} />,
                    "Case Notes": (
                      <FileText size={16} />
                    ),
                    "Housing Programs": (
                      <Home size={16} />
                    ),
                    "Data & Reporting": (
                      <TrendingUp size={16} />
                    ),
                    Compliance: (
                      <Shield size={16} />
                    ),
                  }[item]}

                  {item}
                </div>

                <ChevronRight size={15} />
              </button>
            ))}
          </div>

          {/* QUICK CLIENT LIST */}
          <div className="p-4 mt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
                Active Queue
              </div>

              <Filter size={14} className="text-slate-400" />
            </div>

            <div className="space-y-2">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSelectedClientId(
                      client.id
                    );

                    setActiveSection(
                      "Dashboard"
                    );
                  }}
                  className={`w-full rounded-2xl border p-3 text-left transition-all ${
                    selectedClientId === client.id
                      ? "border-[#0e6d8f] bg-[#0e6d8f] text-white"
                      : "border-[#dbe5eb] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">
                        {client.name}
                      </div>

                      <div
                        className={`mt-1 text-xs ${
                          selectedClientId ===
                          client.id
                            ? "text-cyan-100"
                            : "text-slate-500"
                        }`}
                      >
                        {client.program}
                      </div>
                    </div>

                    <div
                      className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                        client.vulnerability >= 90
                          ? "bg-red-500 text-white"
                          : client.vulnerability >= 70
                          ? "bg-orange-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {client.vulnerability}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-5">
          {activeSection === "Dashboard" &&
            renderDashboard()}

          {activeSection === "Clients" &&
            renderClients()}

          {activeSection === "Case Notes" &&
            renderNotes()}

          {activeSection ===
            "Housing Programs" &&
            renderPrograms()}

          {activeSection ===
            "Data & Reporting" &&
            renderReporting()}

          {activeSection === "Compliance" &&
            renderCompliance()}
        </div>
      </div>

      {/* CASE UPDATE MODAL */}
      {showCaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[620px] rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e6d8f]">
                  Case Update
                </div>

                <h2 className="mt-2 text-2xl font-black text-slate-800">
                  {selectedClient.name}
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowCaseModal(false)
                }
                className="rounded-xl border border-[#dbe5eb] p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Housing Status
                </label>

                <select className="mt-2 w-full rounded-xl border border-[#dbe5eb] bg-white px-3 py-3 outline-none">
                  <option>
                    Emergency Shelter
                  </option>
                  <option>
                    Transitional Housing
                  </option>
                  <option>
                    Permanent Housing
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Case Priority
                </label>

                <select className="mt-2 w-full rounded-xl border border-[#dbe5eb] bg-white px-3 py-3 outline-none">
                  <option>Critical</option>
                  <option>High</option>
                  <option>Moderate</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Intervention Notes
              </label>

              <textarea
                rows={5}
                className="mt-2 w-full rounded-2xl border border-[#dbe5eb] bg-white p-4 outline-none"
                placeholder="Document case update, referral actions, housing coordination, or stabilization progress..."
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowCaseModal(false)
                }
                className="rounded-xl border border-[#dbe5eb] px-4 py-3 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                onClick={saveCaseUpdate}
                className="flex items-center gap-2 rounded-xl bg-[#0e6d8f] px-5 py-3 text-sm font-bold text-white"
              >
                <Save size={16} />
                Save Case Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM */}
      {showConfirmModal && (
        <div className="fixed right-6 top-6 z-[120] rounded-2xl bg-green-500 px-5 py-4 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} />

            <div className="font-bold">
              Changes Successfully Saved
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[120] rounded-2xl bg-[#0e6d8f] px-5 py-4 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} />

            <div className="font-bold">
              {notification}
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
          <strong style={{ color: "#1a1a14" }}>Stack:</strong> React (JSX), Recharts, Mapbox GL JS, PostgreSQL 14 (PostGIS), Python (Pandas, GeoPandas), Salesforce NPSP (nonprofit CRM), Azure Blob Storage, HMIS-compliant REST API schema, Power BI Embedded, Node.js (Express) API layer
        </p>
        <p style={{ margin: "0 0 4px 0" }}>
          <strong style={{ color: "#1a1a14" }}>Methods:</strong> Shelter bed utilization rate modeling against DHS daily census; service outcome tracking across intake → placement → exit continuum; HMIS universal data element compliance (HUD HDX submission format); geospatial hotspot analysis of unsheltered population by subway corridor and borough; recidivism rate calculation for shelter re-entry within 90/180/365 days; program cost-per-exit benchmarking against national CoC averages; Salesforce NPSP workflow automation for case assignment and follow-up triggers; shelter census, placement outcomes, and client journeys are simulated based on published DHS aggregate statistics
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: "#1a1a14" }}>Sources:</strong> NYC DHS Daily Census aggregate shelter population reports; HUD 2023 Annual Homeless Assessment Report (AHAR); HMIS Data Standards Manual FY2022 (universal data elements); NYC 311 complaint data (unsheltered sightings model); NYC Open Data DHS shelter location registry; CoC program performance benchmarks (HUD HDX); client-level data simulated from published NYC DHS statistical reports
        </p>
      </div>
    </div>
  );
}