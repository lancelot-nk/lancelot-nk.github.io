import { useState, useEffect } from "react";


const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #141420;
    --surface-2: #1a1a2e;
    --surface-3: #252538;
    --yellow: #f7df1e;
    --yellow-dim: rgba(247,223,30,0.15);
    --green: #10b981;
    --green-dim: rgba(16,185,129,0.15);
    --red: #ef4444;
    --red-dim: rgba(239,68,68,0.15);
    --blue: #3b82f6;
    --text: #e5e7eb;
    --text-muted: #9ca3af;
    --text-dim: #6b7280;
    --border: #1f2937;
    --border-bright: #374151;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Inter', sans-serif;
  }

  .nyc-root {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    width: 100%;
  }

  /* Header */
  .nyc-header {
    background: var(--surface);
    border-bottom: 2px solid var(--yellow);
    padding: 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nyc-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nyc-logo-icon {
    width: 36px;
    height: 36px;
    background: var(--yellow);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--bg);
    font-size: 18px;
  }

  .nyc-logo-text {
    display: flex;
    flex-direction: column;
  }

  .nyc-logo-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--text);
  }

  .nyc-logo-sub {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--mono);
    letter-spacing: 1px;
  }

  .nyc-sync-status {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nyc-sync-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--green-dim);
    border: 1px solid var(--green);
    border-radius: 6px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--green);
  }

  .nyc-sync-dot {
    width: 8px;
    height: 8px;
    background: var(--green);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .nyc-refresh-btn {
    padding: 8px 16px;
    background: var(--surface-3);
    border: 1px solid var(--border-bright);
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 11px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .nyc-refresh-btn:hover {
    background: var(--surface-2);
    border-color: var(--yellow);
    color: var(--yellow);
  }

  .nyc-refresh-btn.loading {
    pointer-events: none;
    opacity: 0.6;
  }

  .nyc-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--border-bright);
    border-top-color: var(--yellow);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Tabs */
  .nyc-tabs {
    display: flex;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    gap: 4px;
  }

  .nyc-tab {
    padding: 14px 24px;
    font-family: var(--mono);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    position: relative;
    bottom: -1px;
  }

  .nyc-tab:hover { color: var(--text-muted); }

  .nyc-tab.active {
    color: var(--yellow);
    border-bottom-color: var(--yellow);
  }

  /* Content */
  .nyc-content {
    padding: 32px;
    max-width: 1600px;
    margin: 0 auto;
  }

  /* Cards */
  .nyc-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .nyc-card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nyc-card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nyc-card-badge {
    padding: 4px 10px;
    font-family: var(--mono);
    font-size: 10px;
    border-radius: 4px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .nyc-card-badge.verified {
    background: var(--green-dim);
    color: var(--green);
    border: 1px solid var(--green);
  }

  .nyc-card-badge.pending {
    background: var(--yellow-dim);
    color: var(--yellow);
    border: 1px solid var(--yellow);
  }

  .nyc-card-body {
    padding: 20px;
  }

  /* Grid Layouts */
  .nyc-grid {
    display: grid;
    gap: 20px;
  }

  .nyc-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .nyc-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .nyc-grid-4 { grid-template-columns: repeat(4, 1fr); }

  /* Stat Cards */
  .nyc-stat-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nyc-stat-label {
    font-size: 11px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: var(--mono);
  }

  .nyc-stat-value {
    font-size: 36px;
    font-weight: 700;
    color: var(--yellow);
    font-family: var(--mono);
  }

  .nyc-stat-change {
    font-size: 12px;
    font-family: var(--mono);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nyc-stat-change.positive { color: var(--green); }
  .nyc-stat-change.negative { color: var(--red); }

  /* Filters */
  .nyc-filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

  .nyc-filter {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nyc-filter-label {
    font-size: 11px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: var(--mono);
  }

  .nyc-filter-select {
    padding: 8px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border-bright);
    color: var(--text);
    font-size: 13px;
    font-family: var(--sans);
    border-radius: 6px;
    cursor: pointer;
    min-width: 150px;
  }

  .nyc-filter-select:focus {
    outline: none;
    border-color: var(--yellow);
  }

  /* Event Cards */
  .nyc-events-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .nyc-event-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s;
    cursor: pointer;
  }

  .nyc-event-card:hover {
    border-color: var(--yellow);
    transform: translateY(-2px);
  }

  .nyc-event-header {
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }

  .nyc-event-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }

  .nyc-event-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--text-muted);
    font-family: var(--mono);
  }

  .nyc-event-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .nyc-event-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .nyc-event-row-label {
    color: var(--text-dim);
  }

  .nyc-event-row-value {
    color: var(--text);
    font-family: var(--mono);
    font-weight: 500;
  }

  .nyc-event-footer {
    padding: 12px 16px;
    background: var(--surface-2);
    display: flex;
    gap: 8px;
  }

  .nyc-tag {
    padding: 4px 10px;
    font-size: 10px;
    font-family: var(--mono);
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nyc-tag.platform {
    background: var(--blue);
    color: white;
  }

  .nyc-tag.borough {
    background: var(--green-dim);
    color: var(--green);
    border: 1px solid var(--green);
  }

  .nyc-tag.category {
    background: var(--yellow-dim);
    color: var(--yellow);
    border: 1px solid var(--yellow);
  }

  /* Progress Bar */
  .nyc-progress {
    width: 100%;
    height: 8px;
    background: var(--surface-3);
    border-radius: 4px;
    overflow: hidden;
  }

  .nyc-progress-fill {
    height: 100%;
    background: var(--green);
    transition: width 0.3s;
  }

  /* Gauge */
  .nyc-gauge {
    width: 120px;
    height: 60px;
    position: relative;
  }

  .nyc-gauge-bg {
    width: 100%;
    height: 100%;
    border-radius: 120px 120px 0 0;
    background: var(--surface-3);
    overflow: hidden;
    position: relative;
  }

  .nyc-gauge-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(to right, var(--red), var(--yellow), var(--green));
    transform-origin: bottom center;
    transition: transform 0.5s;
  }

  .nyc-gauge-value {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }

  /* Map */
  .nyc-map-container {
    width: 100%;
    height: 500px;
    background: var(--surface-2);
    border-radius: 8px;
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }

  .nyc-map-svg {
    width: 100%;
    height: 100%;
  }

  .nyc-borough {
    fill: var(--surface-3);
    stroke: var(--border-bright);
    stroke-width: 1;
    transition: all 0.2s;
    cursor: pointer;
  }

  .nyc-borough:hover {
    fill: var(--surface);
    stroke: var(--yellow);
  }

  .nyc-map-legend {
    position: absolute;
    top: 20px;
    right: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
  }

  .nyc-legend-title {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nyc-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
  }

  .nyc-legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }

  /* Insight Cards */
  .nyc-insight-card {
    background: var(--surface-2);
    border-left: 4px solid var(--yellow);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .nyc-insight-icon {
    width: 32px;
    height: 32px;
    background: var(--yellow-dim);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--yellow);
    font-size: 18px;
    margin-bottom: 12px;
  }

  .nyc-insight-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }

  .nyc-insight-text {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .nyc-insight-stat {
    display: inline-block;
    background: var(--yellow-dim);
    color: var(--yellow);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: var(--mono);
    font-weight: 600;
  }

  /* SQL Viewer */
  .nyc-sql-viewer {
    background: #1a1a2e;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    font-family: var(--mono);
    font-size: 13px;
    color: var(--text);
    overflow-x: auto;
    margin-top: 16px;
  }

  .nyc-sql-keyword { color: #ff79c6; }
  .nyc-sql-table { color: #8be9fd; }
  .nyc-sql-field { color: #50fa7b; }
  .nyc-sql-string { color: #f1fa8c; }
  .nyc-sql-comment { color: var(--text-dim); font-style: italic; }

  /* Footer */
  .nyc-footer {
    margin-top: 48px;
    padding: 24px 32px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nyc-footer-sources {
    font-size: 12px;
    color: var(--text-dim);
    font-family: var(--mono);
  }

  .nyc-footer-credit {
    font-size: 12px;
    color: var(--text-dim);
    text-align: right;
  }

  .nyc-data-badge {
    display: inline-block;
    padding: 3px 8px;
    font-size: 10px;
    font-family: var(--mono);
    border-radius: 4px;
    margin-right: 8px;
    background: var(--yellow-dim);
    color: var(--yellow);
    border: 1px solid var(--yellow);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .nyc-grid-4 { grid-template-columns: repeat(2, 1fr); }
    .nyc-grid-3 { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .nyc-header { padding: 16px 20px; }
    .nyc-content { padding: 20px; }
    .nyc-grid-2, .nyc-grid-3, .nyc-grid-4 { grid-template-columns: 1fr; }
    .nyc-events-list { grid-template-columns: 1fr; }
    .nyc-tabs { padding: 0 20px; }
    .nyc-tab { padding: 12px 16px; font-size: 11px; }
    .nyc-footer { flex-direction: column; gap: 16px; text-align: center; }
  }
`;

// Sample Data Generation
const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
const CATEGORIES = ["Cultural", "Sports", "Community", "Educational", "Festival", "Health & Wellness"];
const PLATFORMS = ["Cvent", "Eventbrite", "Partiful", "Manual Entry"];
const ORGANIZERS = [
  "NYC Parks Department",
  "Brooklyn Cultural Society",
  "Queens Community Board",
  "Manhattan Arts Council",
  "Bronx Youth Initiative",
  "Staten Island Heritage",
  "NYC Department of Education",
  "Public Library System"
];

const generateEvents = () => {
  const events = [];
  const startDate = new Date(2024, 0, 1);
  
  for (let i = 0; i < 48; i++) {
    const eventDate = new Date(startDate);
    eventDate.setDate(startDate.getDate() + Math.floor(Math.random() * 365));
    
    const capacity = Math.floor(Math.random() * 800) + 100;
    const registration = Math.floor(capacity * (0.6 + Math.random() * 0.4));
    const attendance = Math.floor(registration * (0.7 + Math.random() * 0.3));
    
    events.push({
      id: `NYC-${8000 + i}`,
      name: [
        "Summer Jazz Festival",
        "Community Block Party",
        "Youth Basketball Tournament",
        "Art Gallery Opening",
        "Food & Wine Expo",
        "Tech Workshop Series",
        "Environmental Summit",
        "Cultural Heritage Day",
        "Family Fun Fair",
        "Health & Wellness Expo",
        "Literary Reading Event",
        "Music in the Park",
        "Farmers Market Launch",
        "STEM Education Fair",
        "Holiday Celebration"
      ][Math.floor(Math.random() * 15)] + ` ${i + 1}`,
      date: eventDate.toISOString().split('T')[0],
      time: ["10:00 AM", "2:00 PM", "6:00 PM", "12:00 PM", "4:00 PM"][Math.floor(Math.random() * 5)],
      borough: BOROUGHS[Math.floor(Math.random() * BOROUGHS.length)],
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
      organizer: ORGANIZERS[Math.floor(Math.random() * ORGANIZERS.length)],
      capacity,
      registration,
      attendance,
      status: eventDate < new Date() ? "Completed" : "Upcoming",
      verified: Math.random() > 0.2
    });
  }
  
  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const SAMPLE_EVENTS = generateEvents();

// Analytics Data
const getMonthlyTrends = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, idx) => {
    const monthEvents = SAMPLE_EVENTS.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === idx && e.status === "Completed";
    });
    
    return {
      month,
      events: monthEvents.length,
      attendance: monthEvents.reduce((sum, e) => sum + e.attendance, 0),
      registrations: monthEvents.reduce((sum, e) => sum + e.registration, 0)
    };
  });
};

const getPlatformStats = () => {
  return PLATFORMS.map(platform => {
    const platformEvents = SAMPLE_EVENTS.filter(e => e.platform === platform && e.status === "Completed");
    const totalReg = platformEvents.reduce((sum, e) => sum + e.registration, 0);
    const totalAtt = platformEvents.reduce((sum, e) => sum + e.attendance, 0);
    
    return {
      name: platform,
      events: platformEvents.length,
      conversionRate: totalReg > 0 ? Math.round((totalAtt / totalReg) * 100) : 0,
      avgAttendance: platformEvents.length > 0 ? Math.round(totalAtt / platformEvents.length) : 0
    };
  });
};

const getBoroughStats = () => {
  return BOROUGHS.map(borough => {
    const boroughEvents = SAMPLE_EVENTS.filter(e => e.borough === borough && e.status === "Completed");
    return {
      name: borough,
      events: boroughEvents.length,
      attendance: boroughEvents.reduce((sum, e) => sum + e.attendance, 0),
      avgAttendance: boroughEvents.length > 0 
        ? Math.round(boroughEvents.reduce((sum, e) => sum + e.attendance, 0) / boroughEvents.length) 
        : 0
    };
  });
};

const getCategoryDistribution = () => {
  return CATEGORIES.map(category => {
    const count = SAMPLE_EVENTS.filter(e => e.category === category).length;
    return {
      name: category,
      value: count
    };
  });
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function NYCEventsTracker() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleString());
  
  // Filters
  const [filterBorough, setFilterBorough] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Map state
  const [hoveredBorough, setHoveredBorough] = useState(null);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastSync(new Date().toLocaleString());
    }, 2000);
  };

  // Filtered events
  const filteredEvents = SAMPLE_EVENTS.filter(event => {
    if (filterBorough !== "All" && event.borough !== filterBorough) return false;
    if (filterCategory !== "All" && event.category !== filterCategory) return false;
    if (filterPlatform !== "All" && event.platform !== filterPlatform) return false;
    if (filterStatus !== "All" && event.status !== filterStatus) return false;
    return true;
  });

  // Statistics
  const totalEvents = SAMPLE_EVENTS.length;
  const completedEvents = SAMPLE_EVENTS.filter(e => e.status === "Completed").length;
  const totalAttendance = SAMPLE_EVENTS.filter(e => e.status === "Completed")
    .reduce((sum, e) => sum + e.attendance, 0);
  const avgAttendance = completedEvents > 0 ? Math.round(totalAttendance / completedEvents) : 0;
  const verifiedPercent = Math.round((SAMPLE_EVENTS.filter(e => e.verified).length / totalEvents) * 100);

  const monthlyData = getMonthlyTrends();
  const platformData = getPlatformStats();
  const boroughData = getBoroughStats();
  const categoryData = getCategoryDistribution();

  return (
    <div className="nyc-root">
      <style>{STYLES}</style>

      {/* Header */}
      <div className="nyc-header">
        <div className="nyc-logo">
          <div className="nyc-logo-icon">NYC</div>
          <div className="nyc-logo-text">
            <div className="nyc-logo-title">NYC EVENTS MANAGEMENT SYSTEM</div>
            <div className="nyc-logo-sub">CITYWIDE EVENT TRACKING & ANALYTICS</div>
          </div>
        </div>
        <div className="nyc-sync-status">
          <div className="nyc-sync-indicator">
            <div className="nyc-sync-dot" />
            <span>DATABASE SYNCED</span>
            <span style={{ color: 'var(--text-dim)' }}>• {lastSync}</span>
          </div>
          <button 
            className={`nyc-refresh-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
          >
            {loading ? <div className="nyc-spinner" /> : '⟳'}
            {loading ? 'SYNCING...' : 'REFRESH DATA'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="nyc-tabs">
        <button className={`nyc-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
          Events Calendar
        </button>
        <button className={`nyc-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
          Analytics Dashboard
        </button>
        <button className={`nyc-tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
          Insights & Outcomes
        </button>
        <button className={`nyc-tab ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
          Map View
        </button>
        <button className={`nyc-tab ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}>
          Data Architecture
        </button>
      </div>

      {/* Content */}
      <div className="nyc-content">

        {/* TAB 0: Events Calendar */}
        {activeTab === 0 && (
          <>
            {/* Summary Stats */}
            <div className="nyc-grid nyc-grid-4" style={{ marginBottom: 32 }}>
              <div className="nyc-stat-card">
                <div className="nyc-stat-label">Total Events</div>
                <div className="nyc-stat-value">{totalEvents}</div>
                <div className="nyc-stat-change positive">↑ 24% vs. last year</div>
              </div>
              <div className="nyc-stat-card">
                <div className="nyc-stat-label">Completed</div>
                <div className="nyc-stat-value">{completedEvents}</div>
                <div className="nyc-stat-change positive">↑ 18% completion rate</div>
              </div>
              <div className="nyc-stat-card">
                <div className="nyc-stat-label">Total Attendance</div>
                <div className="nyc-stat-value">{totalAttendance.toLocaleString()}</div>
                <div className="nyc-stat-change positive">↑ 31% engagement</div>
              </div>
              <div className="nyc-stat-card">
                <div className="nyc-stat-label">Data Quality</div>
                <div className="nyc-stat-value">{verifiedPercent}%</div>
                <div className="nyc-stat-change positive">↑ Verified entries</div>
              </div>
            </div>

            {/* Filters */}
            <div className="nyc-filters">
              <div className="nyc-filter">
                <div className="nyc-filter-label">Borough</div>
                <select className="nyc-filter-select" value={filterBorough} onChange={e => setFilterBorough(e.target.value)}>
                  <option>All</option>
                  {BOROUGHS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="nyc-filter">
                <div className="nyc-filter-label">Category</div>
                <select className="nyc-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option>All</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="nyc-filter">
                <div className="nyc-filter-label">Platform</div>
                <select className="nyc-filter-select" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
                  <option>All</option>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="nyc-filter">
                <div className="nyc-filter-label">Status</div>
                <select className="nyc-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option>All</option>
                  <option>Completed</option>
                  <option>Upcoming</option>
                </select>
              </div>
            </div>

            {/* Events List */}
            <div className="nyc-events-list">
              {filteredEvents.slice(0, 12).map(event => (
                <div key={event.id} className="nyc-event-card">
                  <div className="nyc-event-header">
                    <div className="nyc-event-name">{event.name}</div>
                    <div className="nyc-event-meta">
                      <span>📅 {event.date}</span>
                      <span>🕐 {event.time}</span>
                    </div>
                  </div>
                  <div className="nyc-event-body">
                    <div className="nyc-event-row">
                      <span className="nyc-event-row-label">Organizer</span>
                      <span className="nyc-event-row-value">{event.organizer}</span>
                    </div>
                    <div className="nyc-event-row">
                      <span className="nyc-event-row-label">Capacity</span>
                      <span className="nyc-event-row-value">{event.capacity}</span>
                    </div>
                    <div className="nyc-event-row">
                      <span className="nyc-event-row-label">Registration</span>
                      <span className="nyc-event-row-value">{event.registration}</span>
                    </div>
                    {event.status === "Completed" && (
                      <div className="nyc-event-row">
                        <span className="nyc-event-row-label">Attendance</span>
                        <span className="nyc-event-row-value" style={{ color: 'var(--green)' }}>
                          {event.attendance}
                        </span>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <div className="nyc-progress">
                        <div 
                          className="nyc-progress-fill" 
                          style={{ 
                            width: `${event.status === "Completed" ? (event.attendance / event.capacity) * 100 : (event.registration / event.capacity) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="nyc-event-footer">
                    <span className="nyc-tag platform">{event.platform}</span>
                    <span className="nyc-tag borough">{event.borough}</span>
                    <span className="nyc-tag category">{event.category}</span>
                    {event.verified && <span className="nyc-card-badge verified">VERIFIED</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB 1: Analytics Dashboard */}
        {activeTab === 1 && (
          <>
            <div className="nyc-grid nyc-grid-2" style={{ marginBottom: 24 }}>
              {/* Monthly Trends */}
              <div className="nyc-card">
                <div className="nyc-card-header">
                  <div className="nyc-card-title">Monthly Event Trends</div>
                </div>
                <div className="nyc-card-body">
                  {(() => {
                    const W = 600, H = 280;
                    const pad = { top: 20, right: 20, bottom: 40, left: 45 };
                    const cW = W - pad.left - pad.right;
                    const cH = H - pad.top - pad.bottom;
                    const vals = monthlyData.map(d => d.events);
                    const minV = 0;
                    const maxV = Math.max(...vals, 1);
                    const xStep = cW / (monthlyData.length - 1);
                    const toX = i => pad.left + i * xStep;
                    const toY = v => pad.top + cH - ((v - minV) / (maxV - minV)) * cH;
                    const linePoints = monthlyData.map((d, i) => `${toX(i)},${toY(d.events)}`).join(' ');
                    const areaPath = `M ${toX(0)},${toY(monthlyData[0].events)} ` +
                      monthlyData.slice(1).map((d, i) => `L ${toX(i + 1)},${toY(d.events)}`).join(' ') +
                      ` L ${toX(monthlyData.length - 1)},${pad.top + cH} L ${toX(0)},${pad.top + cH} Z`;
                    const gridLines = 4;
                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f7df1e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f7df1e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        {Array.from({ length: gridLines + 1 }, (_, i) => {
                          const y = pad.top + (cH / gridLines) * i;
                          const v = Math.round(maxV - (maxV / gridLines) * i);
                          return (
                            <g key={i}>
                              <line x1={pad.left} y1={y} x2={pad.left + cW} y2={y} stroke="#1f2937" strokeDasharray="3 3"/>
                              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#6b7280">{v}</text>
                            </g>
                          );
                        })}
                        <path d={areaPath} fill="url(#areaGrad)"/>
                        <polyline points={linePoints} fill="none" stroke="#f7df1e" strokeWidth={2}/>
                        {monthlyData.map((d, i) => (
                          <g key={i}>
                            <circle cx={toX(i)} cy={toY(d.events)} r={3} fill="#f7df1e"/>
                            <text x={toX(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#6b7280">{d.month}</text>
                            <title>{d.month}: {d.events} events</title>
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* Platform Performance */}
              <div className="nyc-card">
                <div className="nyc-card-header">
                  <div className="nyc-card-title">Platform Conversion Rates</div>
                </div>
                <div className="nyc-card-body">
                  {(() => {
                    const W = 600, H = 280;
                    const pad = { top: 20, right: 20, bottom: 50, left: 45 };
                    const cW = W - pad.left - pad.right;
                    const cH = H - pad.top - pad.bottom;
                    const maxV = 100;
                    const gap = cW / platformData.length;
                    const barW = gap * 0.55;
                    const gridLines = 4;
                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
                        {Array.from({ length: gridLines + 1 }, (_, i) => {
                          const y = pad.top + (cH / gridLines) * i;
                          const v = Math.round(maxV - (maxV / gridLines) * i);
                          return (
                            <g key={i}>
                              <line x1={pad.left} y1={y} x2={pad.left + cW} y2={y} stroke="#1f2937" strokeDasharray="3 3"/>
                              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#6b7280">{v}%</text>
                            </g>
                          );
                        })}
                        {platformData.map((d, i) => {
                          const barH = (d.conversionRate / maxV) * cH;
                          const x = pad.left + i * gap + (gap - barW) / 2;
                          const y = pad.top + cH - barH;
                          return (
                            <g key={i}>
                              <rect x={x} y={y} width={barW} height={barH} fill="#10b981" rx={3}/>
                              <text x={x + barW / 2} y={H - 28} textAnchor="middle" fontSize={9} fill="#6b7280">{d.name}</text>
                              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#10b981">{d.conversionRate}%</text>
                              <title>{d.name}: {d.conversionRate}% conversion</title>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="nyc-grid nyc-grid-2">
              {/* Borough Performance */}
              <div className="nyc-card">
                <div className="nyc-card-header">
                  <div className="nyc-card-title">Borough Event Distribution</div>
                </div>
                <div className="nyc-card-body">
                  {(() => {
                    const W = 600, H = 280;
                    const pad = { top: 20, right: 20, bottom: 20, left: 110 };
                    const cW = W - pad.left - pad.right;
                    const cH = H - pad.top - pad.bottom;
                    const maxV = Math.max(...boroughData.map(d => d.events), 1);
                    const gap = cH / boroughData.length;
                    const barH = gap * 0.55;
                    const gridLines = 4;
                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
                        {Array.from({ length: gridLines + 1 }, (_, i) => {
                          const x = pad.left + (cW / gridLines) * i;
                          const v = Math.round((maxV / gridLines) * i);
                          return (
                            <g key={i}>
                              <line x1={x} y1={pad.top} x2={x} y2={pad.top + cH} stroke="#1f2937" strokeDasharray="3 3"/>
                              <text x={x} y={pad.top + cH + 14} textAnchor="middle" fontSize={10} fill="#6b7280">{v}</text>
                            </g>
                          );
                        })}
                        {boroughData.map((d, i) => {
                          const barW = (d.events / maxV) * cW;
                          const y = pad.top + i * gap + (gap - barH) / 2;
                          return (
                            <g key={i}>
                              <rect x={pad.left} y={y} width={barW} height={barH} fill="#f7df1e" rx={3}/>
                              <text x={pad.left - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#6b7280">{d.name}</text>
                              <text x={pad.left + barW + 5} y={y + barH / 2 + 4} textAnchor="start" fontSize={9} fill="#f7df1e">{d.events}</text>
                              <title>{d.name}: {d.events} events</title>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="nyc-card">
                <div className="nyc-card-header">
                  <div className="nyc-card-title">Event Categories</div>
                </div>
                <div className="nyc-card-body">
                  {(() => {
                    const total = categoryData.reduce((s, d) => s + d.value, 0);
                    const cx = 130, cy = 130, r = 95, ir = 52;
                    let startAngle = -Math.PI / 2;
                    const slices = categoryData.map((d, i) => {
                      const angle = (d.value / total) * 2 * Math.PI;
                      const endAngle = startAngle + angle;
                      const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
                      const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
                      const ix1 = cx + ir * Math.cos(startAngle), iy1 = cy + ir * Math.sin(startAngle);
                      const ix2 = cx + ir * Math.cos(endAngle), iy2 = cy + ir * Math.sin(endAngle);
                      const large = angle > Math.PI ? 1 : 0;
                      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
                      const pct = Math.round(d.value / total * 100);
                      startAngle = endAngle;
                      return { path, color: COLORS[i % COLORS.length], name: d.name, pct };
                    });
                    return (
                      <svg viewBox="0 0 420 280" width="100%">
                        {slices.map((s, i) => (
                          <path key={i} d={s.path} fill={s.color} stroke="#0a0a0f" strokeWidth={1.5}>
                            <title>{s.name}: {s.pct}%</title>
                          </path>
                        ))}
                        {slices.map((s, i) => (
                          <g key={i} transform={`translate(280,${18 + i * 40})`}>
                            <rect width={12} height={12} fill={s.color} rx={2}/>
                            <text x={18} y={10} fontSize={11} fill="#9ca3af">{s.name}</text>
                            <text x={18} y={24} fontSize={10} fill={s.color}>{s.pct}%</text>
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Platform Details */}
            <div className="nyc-card" style={{ marginTop: 24 }}>
              <div className="nyc-card-header">
                <div className="nyc-card-title">Platform Performance Details</div>
              </div>
              <div className="nyc-card-body">
                <div className="nyc-grid nyc-grid-4">
                  {platformData.map((platform, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '32px', 
                        fontWeight: '700', 
                        color: COLORS[idx],
                        fontFamily: 'var(--mono)',
                        marginBottom: '8px'
                      }}>
                        {platform.conversionRate}%
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        {platform.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--mono)'
                      }}>
                        {platform.events} events • Avg: {platform.avgAttendance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Insights & Outcomes */}
        {activeTab === 2 && (
          <>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              marginBottom: '24px',
              color: 'var(--text)'
            }}>
              Key Insights & Strategic Recommendations
            </h2>

            <div className="nyc-insight-card">
              <div className="nyc-insight-icon">💡</div>
              <div className="nyc-insight-title">Brooklyn Events Show Highest Repeat Attendance</div>
              <div className="nyc-insight-text">
                Events hosted in Brooklyn demonstrate a <span className="nyc-insight-stat">42% higher</span> repeat attendance rate compared to the citywide average. Analysis of registration patterns shows that Brooklyn's community-focused programming and consistent cultural events create stronger audience loyalty. <strong>Recommendation:</strong> Replicate Brooklyn's community engagement model in other boroughs, particularly Staten Island where repeat attendance is lowest.
              </div>
            </div>

            <div className="nyc-insight-card" style={{ borderLeftColor: 'var(--green)' }}>
              <div className="nyc-insight-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>📈</div>
              <div className="nyc-insight-title">Platform Performance: Eventbrite Leads Conversion</div>
              <div className="nyc-insight-text">
                Eventbrite shows the highest registration-to-attendance conversion rate at <span className="nyc-insight-stat">{platformData.find(p => p.name === "Eventbrite")?.conversionRate || 85}%</span>, significantly outperforming manual entry systems (68%). The platform's automated reminder system and mobile ticketing reduce no-shows. <strong>Recommendation:</strong> Migrate more manual entry events to Eventbrite or implement similar automated communication features in other platforms.
              </div>
            </div>

            <div className="nyc-insight-card" style={{ borderLeftColor: '#3b82f6' }}>
              <div className="nyc-insight-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>📊</div>
              <div className="nyc-insight-title">Cultural Events Drive Higher Engagement</div>
              <div className="nyc-insight-text">
                Cultural category events maintain <span className="nyc-insight-stat">89% capacity utilization</span>, the highest across all categories. These events also generate the most social media engagement and word-of-mouth referrals. <strong>Recommendation:</strong> Increase investment in cultural programming, particularly in underserved boroughs (Bronx, Staten Island) where capacity utilization for cultural events is below 60%.
              </div>
            </div>

            <div className="nyc-insight-card" style={{ borderLeftColor: 'var(--red)' }}>
              <div className="nyc-insight-icon" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>⚠️</div>
              <div className="nyc-insight-title">Weather Impact on Outdoor Events</div>
              <div className="nyc-insight-text">
                Analysis reveals that outdoor events scheduled between June-August experience a <span className="nyc-insight-stat">23% higher cancellation risk</span> and 15% lower attendance compared to spring/fall events. Heat advisories and summer vacations contribute to this trend. <strong>Recommendation:</strong> Schedule major outdoor events in May, September, and October. Develop contingency plans with indoor backup venues for summer events.
              </div>
            </div>

            <div className="nyc-insight-card" style={{ borderLeftColor: '#8b5cf6' }}>
              <div className="nyc-insight-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>🎯</div>
              <div className="nyc-insight-title">Weekend Events See 3x Higher Registration</div>
              <div className="nyc-insight-text">
                Saturday and Sunday events achieve <span className="nyc-insight-stat">3.2x higher registration rates</span> than weekday events, with Saturday afternoon (2-6 PM) being the optimal time slot. However, weekday evening events (6-8 PM) in Manhattan show strong professional/networking event attendance. <strong>Recommendation:</strong> Prioritize weekend slots for family and community events; reserve weekday evenings for professional development and networking events in Manhattan.
              </div>
            </div>

            <div className="nyc-card" style={{ marginTop: 32 }}>
              <div className="nyc-card-header">
                <div className="nyc-card-title">Year-Over-Year Performance Summary</div>
              </div>
              <div className="nyc-card-body">
                <div className="nyc-grid nyc-grid-3">
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Event Volume
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                      +24%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Year-over-year growth in total events
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Total Engagement
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                      +31%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Increase in cumulative attendance
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Data Quality
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                      +15%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Improvement in verified event data
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: Map View */}
        {activeTab === 3 && (
          <>
            <div className="nyc-grid nyc-grid-2" style={{ marginBottom: 24 }}>
              <div className="nyc-card">
                <div className="nyc-card-header">
                  <div className="nyc-card-title">Borough Heatmap</div>
                </div>
                <div className="nyc-card-body">
                  <div className="nyc-map-container">
                    <svg className="nyc-map-svg" viewBox="0 0 600 500">
                      {/* Simplified NYC Borough Map */}
                      {/* Manhattan */}
                      <path 
                        className="nyc-borough"
                        d="M 250 150 L 270 140 L 275 200 L 290 250 L 285 320 L 270 350 L 260 340 L 255 280 L 245 220 Z"
                        fill={hoveredBorough === 'Manhattan' ? 'var(--yellow)' : 'var(--surface-3)'}
                        opacity={boroughData.find(b => b.name === 'Manhattan')?.events ? 
                          (boroughData.find(b => b.name === 'Manhattan').events / Math.max(...boroughData.map(b => b.events))) * 0.8 + 0.2 : 0.3}
                        onMouseEnter={() => setHoveredBorough('Manhattan')}
                        onMouseLeave={() => setHoveredBorough(null)}
                      >
                        <title>Manhattan: {boroughData.find(b => b.name === 'Manhattan')?.events || 0} events</title>
                      </path>
                      
                      {/* Brooklyn */}
                      <path 
                        className="nyc-borough"
                        d="M 290 250 L 310 260 L 350 290 L 370 330 L 360 370 L 320 380 L 285 360 L 270 350 Z"
                        fill={hoveredBorough === 'Brooklyn' ? 'var(--yellow)' : 'var(--surface-3)'}
                        opacity={boroughData.find(b => b.name === 'Brooklyn')?.events ? 
                          (boroughData.find(b => b.name === 'Brooklyn').events / Math.max(...boroughData.map(b => b.events))) * 0.8 + 0.2 : 0.3}
                        onMouseEnter={() => setHoveredBorough('Brooklyn')}
                        onMouseLeave={() => setHoveredBorough(null)}
                      >
                        <title>Brooklyn: {boroughData.find(b => b.name === 'Brooklyn')?.events || 0} events</title>
                      </path>
                      
                      {/* Queens */}
                      <path 
                        className="nyc-borough"
                        d="M 310 180 L 370 200 L 410 240 L 420 280 L 390 300 L 350 290 L 310 260 L 290 250 L 275 200 Z"
                        fill={hoveredBorough === 'Queens' ? 'var(--yellow)' : 'var(--surface-3)'}
                        opacity={boroughData.find(b => b.name === 'Queens')?.events ? 
                          (boroughData.find(b => b.name === 'Queens').events / Math.max(...boroughData.map(b => b.events))) * 0.8 + 0.2 : 0.3}
                        onMouseEnter={() => setHoveredBorough('Queens')}
                        onMouseLeave={() => setHoveredBorough(null)}
                      >
                        <title>Queens: {boroughData.find(b => b.name === 'Queens')?.events || 0} events</title>
                      </path>
                      
                      {/* Bronx */}
                      <path 
                        className="nyc-borough"
                        d="M 250 100 L 300 90 L 340 110 L 350 150 L 310 180 L 270 140 Z"
                        fill={hoveredBorough === 'Bronx' ? 'var(--yellow)' : 'var(--surface-3)'}
                        opacity={boroughData.find(b => b.name === 'Bronx')?.events ? 
                          (boroughData.find(b => b.name === 'Bronx').events / Math.max(...boroughData.map(b => b.events))) * 0.8 + 0.2 : 0.3}
                        onMouseEnter={() => setHoveredBorough('Bronx')}
                        onMouseLeave={() => setHoveredBorough(null)}
                      >
                        <title>Bronx: {boroughData.find(b => b.name === 'Bronx')?.events || 0} events</title>
                      </path>
                      
                      {/* Staten Island */}
                      <path 
                        className="nyc-borough"
                        d="M 150 370 L 200 360 L 220 390 L 210 430 L 170 440 L 140 420 Z"
                        fill={hoveredBorough === 'Staten Island' ? 'var(--yellow)' : 'var(--surface-3)'}
                        opacity={boroughData.find(b => b.name === 'Staten Island')?.events ? 
                          (boroughData.find(b => b.name === 'Staten Island').events / Math.max(...boroughData.map(b => b.events))) * 0.8 + 0.2 : 0.3}
                        onMouseEnter={() => setHoveredBorough('Staten Island')}
                        onMouseLeave={() => setHoveredBorough(null)}
                      >
                        <title>Staten Island: {boroughData.find(b => b.name === 'Staten Island')?.events || 0} events</title>
                      </path>
                      
                      {/* Labels */}
                      <text x="265" y="250" fontSize="12" fill="var(--text)" textAnchor="middle" pointerEvents="none">Manhattan</text>
                      <text x="330" y="330" fontSize="12" fill="var(--text)" textAnchor="middle" pointerEvents="none">Brooklyn</text>
                      <text x="360" y="230" fontSize="12" fill="var(--text)" textAnchor="middle" pointerEvents="none">Queens</text>
                      <text x="295" y="130" fontSize="12" fill="var(--text)" textAnchor="middle" pointerEvents="none">Bronx</text>
                      <text x="180" y="400" fontSize="12" fill="var(--text)" textAnchor="middle" pointerEvents="none">Staten Is.</text>
                    </svg>
                    
                    <div className="nyc-map-legend">
                      <div className="nyc-legend-title">Event Density</div>
                      {boroughData.sort((a, b) => b.events - a.events).map((borough, idx) => (
                        <div key={idx} className="nyc-legend-item">
                          <div className="nyc-legend-color" style={{ 
                            background: COLORS[idx % COLORS.length],
                            opacity: borough.events / Math.max(...boroughData.map(b => b.events))
                          }} />
                          <span>{borough.name}: {borough.events}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="nyc-card">
                <div className="nyc-card-header">
                  <div className="nyc-card-title">Borough Performance Metrics</div>
                </div>
                <div className="nyc-card-body">
                  {boroughData.sort((a, b) => b.attendance - a.attendance).map((borough, idx) => (
                    <div key={idx} style={{ marginBottom: '24px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{borough.name}</span>
                        <span style={{ 
                          fontSize: '18px', 
                          fontWeight: '700',
                          fontFamily: 'var(--mono)',
                          color: COLORS[idx % COLORS.length]
                        }}>
                          {borough.attendance.toLocaleString()}
                        </span>
                      </div>
                      <div className="nyc-progress">
                        <div 
                          className="nyc-progress-fill"
                          style={{ 
                            width: `${(borough.attendance / Math.max(...boroughData.map(b => b.attendance))) * 100}%`,
                            background: COLORS[idx % COLORS.length]
                          }}
                        />
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--text-dim)',
                        marginTop: '4px',
                        fontFamily: 'var(--mono)'
                      }}>
                        {borough.events} events • Avg: {borough.avgAttendance} attendees
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 4: Data Architecture */}
        {activeTab === 4 && (
          <>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              marginBottom: '24px',
              color: 'var(--text)'
            }}>
              SQL-Based Event Management System
            </h2>

            <div className="nyc-card" style={{ marginBottom: 24 }}>
              <div className="nyc-card-header">
                <div className="nyc-card-title">Why SQL for Event Tracking?</div>
              </div>
              <div className="nyc-card-body">
                <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                  <p style={{ marginBottom: '16px' }}>
                    This NYC Events Management System is built on a <strong style={{ color: 'var(--text)' }}>relational SQL database architecture</strong>, specifically designed for event tracking and analytics workloads. Here's why SQL is the optimal choice for this use case:
                  </p>
                  
                  <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--yellow)', marginBottom: '12px' }}>
                      1. Structured Event Data with Complex Relationships
                    </h3>
                    <p style={{ marginBottom: '12px' }}>
                      Event data is inherently relational: Events link to Organizers, Venues, Platforms, Attendees, and Categories. SQL's foreign key constraints ensure data integrity and prevent orphaned records. NoSQL solutions would require application-level relationship management, increasing complexity and error potential.
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--yellow)', marginBottom: '12px' }}>
                      2. Transaction-Critical Operations
                    </h3>
                    <p style={{ marginBottom: '12px' }}>
                      Event registration, capacity management, and attendance tracking require ACID compliance. When a user registers for an event, we must atomically: (1) decrement available capacity, (2) create registration record, (3) send confirmation email. SQL transactions guarantee either all operations succeed or all fail, preventing data inconsistencies.
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--yellow)', marginBottom: '12px' }}>
                      3. Complex Analytical Queries
                    </h3>
                    <p style={{ marginBottom: '12px' }}>
                      The Analytics Dashboard requires aggregations, joins, and window functions: "Show month-over-month attendance trends by borough and category, with conversion rates per platform." SQL's declarative query language excels at these multi-dimensional analytics. NoSQL would require complex application-layer aggregation pipelines.
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--yellow)', marginBottom: '12px' }}>
                      4. Data Validation and Constraints
                    </h3>
                    <p style={{ marginBottom: '12px' }}>
                      SQL enforces data quality at the database level: CHECK constraints ensure attendance ≤ capacity, NOT NULL prevents missing critical fields, UNIQUE constraints prevent duplicate registrations. This validation happens before data enters the system, reducing application-layer error handling.
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--yellow)', marginBottom: '12px' }}>
                      5. Mature Tooling Ecosystem
                    </h3>
                    <p style={{ marginBottom: '0' }}>
                      SQL databases integrate seamlessly with: (1) BI tools (Tableau, Power BI) for advanced analytics, (2) ETL pipelines for data warehousing, (3) Backup/recovery systems for compliance, (4) ORM frameworks for application development. This mature ecosystem reduces development time and operational overhead.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="nyc-card">
              <div className="nyc-card-header">
                <div className="nyc-card-title">Database Schema (PostgreSQL)</div>
                <div className="nyc-card-badge verified">OPTIMIZED FOR ANALYTICS</div>
              </div>
              <div className="nyc-card-body">
                <div className="nyc-sql-viewer">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`-- Events table: Core event data
CREATE TABLE events (
    event_id VARCHAR(20) PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    borough VARCHAR(50) NOT NULL CHECK (borough IN ('Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island')),
    category VARCHAR(50) NOT NULL,
    organizer_id INT REFERENCES organizers(organizer_id),
    platform VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Cancelled')),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table: Tracks all event registrations
CREATE TABLE registrations (
    registration_id SERIAL PRIMARY KEY,
    event_id VARCHAR(20) REFERENCES events(event_id) ON DELETE CASCADE,
    attendee_email VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP,
    UNIQUE(event_id, attendee_email) -- Prevent duplicate registrations
);

-- Organizers table: Event organizing entities
CREATE TABLE organizers (
    organizer_id SERIAL PRIMARY KEY,
    organizer_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    department VARCHAR(100),
    active BOOLEAN DEFAULT TRUE
);

-- Indexes for query performance
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_events_borough ON events(borough);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_registrations_event ON registrations(event_id);

-- View: Event attendance summary (materialized for performance)
CREATE MATERIALIZED VIEW event_attendance_summary AS
SELECT 
    e.event_id,
    e.event_name,
    e.borough,
    e.category,
    e.capacity,
    COUNT(r.registration_id) AS total_registrations,
    COUNT(CASE WHEN r.attended THEN 1 END) AS total_attendance,
    ROUND(100.0 * COUNT(CASE WHEN r.attended THEN 1 END) / 
          NULLIF(COUNT(r.registration_id), 0), 2) AS conversion_rate
FROM events e
LEFT JOIN registrations r ON e.event_id = r.event_id
GROUP BY e.event_id, e.event_name, e.borough, e.category, e.capacity;

-- Refresh command for materialized view (run after data updates)
-- REFRESH MATERIALIZED VIEW event_attendance_summary;`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="nyc-card" style={{ marginTop: 24 }}>
              <div className="nyc-card-header">
                <div className="nyc-card-title">Sample Analytics Query</div>
              </div>
              <div className="nyc-card-body">
                <div className="nyc-sql-viewer">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`-- Monthly attendance trends by borough with conversion rates
SELECT 
    DATE_TRUNC('month', e.event_date) AS month,
    e.borough,
    COUNT(DISTINCT e.event_id) AS total_events,
    COUNT(r.registration_id) AS total_registrations,
    COUNT(CASE WHEN r.attended THEN 1 END) AS total_attendance,
    ROUND(100.0 * COUNT(CASE WHEN r.attended THEN 1 END) / 
          NULLIF(COUNT(r.registration_id), 0), 2) AS conversion_rate
FROM events e
LEFT JOIN registrations r ON e.event_id = r.event_id
WHERE e.status = 'Completed'
    AND e.event_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', e.event_date), e.borough
ORDER BY month DESC, borough;`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="nyc-grid nyc-grid-3" style={{ marginTop: 24 }}>
              <div className="nyc-card">
                <div className="nyc-card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                    Query Performance
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Indexed queries execute in <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)' }}>&lt;50ms</span> for 1M+ records
                  </div>
                </div>
              </div>
              <div className="nyc-card">
                <div className="nyc-card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔒</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                    Data Integrity
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    ACID transactions prevent inconsistent states during high-traffic registration periods
                  </div>
                </div>
              </div>
              <div className="nyc-card">
                <div className="nyc-card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📊</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                    Analytics Ready
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Native aggregation functions power real-time dashboard without ETL overhead
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="nyc-footer">
        <div className="nyc-footer-sources">
          <span className="nyc-data-badge">SAMPLE DATA</span>
          Event data simulated based on NYC Open Data event structures and Cvent/Eventbrite reporting patterns. 
          All attendee records, registration flows, and platform conversion metrics are synthetic representations 
          for portfolio demonstration purposes. Database schema represents production-grade event management system architecture.
        </div>
        <div className="nyc-footer-credit">
          <strong>Analysis & Design</strong><br />
          Lancelot Naipier-Kane<br />
          Data Analyst & Systems Architect<br />
          lancelot-nk.github.io
        </div>
      </div>
    </div>
  );
}