import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, GraduationCap, Award, Wrench, ExternalLink,
  Search, ChevronDown, ChevronUp, Star, FileText, Languages,
  Code, Zap,
} from 'lucide-react';

// ── Import live projects list from ProjectsSection ───────────────────────────
import { PROJECTS as ALL_PROJECTS } from './ProjectsSection';

// ── Brand Colors ────────────────────────────────────────────────────────────
const PINK   = '#B8004E';
const VIOLET = '#5800B8';
const DEEP   = '#0F001E';
const MID    = '#320040';
const SOFT   = '#6A0A50';
const MUTED  = '#4A1040';
const BORDER = 'rgba(184,0,78,0.22)';

const DOWNLOAD_LINKS = [
  { label: 'Main Resume',              href: '/resume1.pdf' },
  { label: 'Data Scientist + Analyst', href: '/resume2.pdf' },
  { label: 'Program Manager',          href: '/resume3.pdf' },
  { label: 'Technology',               href: '/resume4.pdf' },
];

function emitFilterSignal(payload) {
  window.dispatchEvent(new CustomEvent('resume-filter-change', { detail: payload }));
}

// ── ATS Auto-parse PDF generator ─────────────────────────────────────────────
// Generates an ATS-friendly single-page resume as a PDF download using jsPDF.
// Format mirrors the Calvin Yoon reference: 3-col header, skills, education,
// then detailed work experience with ≥5 bullets per role.
async function generateAutoParseResume(filter, visibleExp) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ format: 'letter', unit: 'pt', orientation: 'portrait' });

  // ── Page geometry ─────────────────────────────────────────────────────────
  const PW    = 612;  // letter width
  const ML    = 36;   // left margin
  const MR    = 36;   // right margin
  const MT    = 36;   // top margin
  const CW    = PW - ML - MR;
  let   y     = MT;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const LINE = 11;   // base line-height in pt
  const PAGE_BOTTOM = 756;  // leave bottom margin ~36pt

  function checkPage(needed = LINE) {
    if (y + needed > PAGE_BOTTOM) {
      doc.addPage();
      y = MT;
    }
  }

  function hRule(thick = 0.5) {
    checkPage(4);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(thick);
    doc.line(ML, y, PW - MR, y);
    y += 5;
  }

  function sectionHeader(title) {
    checkPage(20);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(title, ML, y);
    y += 2;
    hRule(0.75);
  }

  // Write mixed bold+normal text on one line, wrapping the normal part
  function writeLabeledLine(boldLabel, normalText, indent = ML) {
    checkPage(LINE);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    const bw = doc.getTextWidth(boldLabel);
    doc.text(boldLabel, indent, y);

    doc.setFont('helvetica', 'normal');
    const maxW = CW - (indent - ML) - bw;
    const lines = doc.splitTextToSize(normalText, maxW);
    doc.text(lines[0], indent + bw, y);
    y += LINE;
    for (let i = 1; i < lines.length; i++) {
      checkPage(LINE);
      doc.text(lines[i], indent + 8, y);
      y += LINE;
    }
  }

  // Bullet point with hanging indent
  function writeBullet(text, indent = ML + 12) {
    const maxW = CW - (indent - ML) - 8;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, maxW);
    checkPage(LINE * lines.length);
    doc.text('•', indent - 8, y);
    lines.forEach((ln, i) => {
      doc.text(ln, indent, y + i * LINE);
    });
    y += LINE * lines.length + 1;
  }

  function writeSmall(text, x = ML, align = 'left', color = [60, 60, 60]) {
    checkPage(LINE);
    doc.setFontSize(8);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'normal');
    doc.text(text, x, y, { align });
  }

  // ── HEADER — 3 columns ────────────────────────────────────────────────────
  const col1W = Math.round(CW * 0.40);
  const col2W = Math.round(CW * 0.30);
  const col3W = CW - col1W - col2W;
  const col2X = ML + col1W + 8;
  const col3X = col2X + col2W + 8;

  // Col 1 — Name + subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(0, 0, 0);
  doc.text('LANCELOT NAIPIER-KANE', ML, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const filterLabel = { main: 'Program and Data Management', data: 'Data Science & Analytics', program: 'Program Management', tech: 'Technology & Engineering' }[filter] || 'Program and Data Management';
  doc.text('8 Years ' + filterLabel, ML, y + 26);

  // Col 2 — Contact
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 180);
  doc.text('lancelotsmnk@gmail.com', col2X, y + 8);
  doc.setTextColor(40, 40, 40);
  doc.text('1-(707)-991-1031', col2X, y + 18);
  doc.text('New York, NY 10001', col2X, y + 28);

  // Col 3 — Links
  doc.setTextColor(0, 0, 180);
  doc.text('linkedin.com/in/lancelotnk', col3X, y + 8);
  doc.text('github.com/lancelot-nk', col3X, y + 18);
  doc.text('lancelot-nk.github.io', col3X, y + 28);

  y += 38;
  hRule(0.75);

  // ── SKILLS ────────────────────────────────────────────────────────────────
  sectionHeader('SKILLS');
  y += 2;

  // Build skill lines by filter
  const skillLinesByFilter = {
    main: [
      { label: 'Programming:', text: 'Python, R, SQL, JavaScript, HTML5/CSS3, STATA, Java, T-SQL' },
      { label: 'Data & AI:', text: 'Machine Learning, Deep Learning, NLP, Transformers, Scikit-Learn, TensorFlow, Pandas, NumPy, Seaborn' },
      { label: 'Cloud & Infrastructure:', text: 'Microsoft Azure, AWS (S3, EC2), Snowflake, Databricks, Synapse Analytics, dbt, ETL/ELT, BigQuery, Data Factory' },
      { label: 'BI & Visualization:', text: 'Tableau, Power BI, ThoughtSpot, ArcGIS, Excel (Advanced/VBA), Power Query, Matplotlib, Google Analytics' },
      { label: 'Program & Tools:', text: 'Salesforce, Jira, Asana, UiPath (RPA), Power Automate, Agile/Scrum, Grant Writing, Stakeholder Engagement, Budget Management' },
    ],
    data: [
      { label: 'Programming & AI:', text: 'Python, R, SQL, T-SQL, TensorFlow, Keras, PyTorch, Scikit-Learn, NumPy, Pandas, Seaborn, LangChain, Hugging Face, NLP, OpenCV' },
      { label: 'Data Science:', text: 'Machine Learning, Deep Learning, Computer Vision, Recommender Systems, Predictive Algorithms, Time Series Forecasting, Statistical Modeling, Regression Analysis' },
      { label: 'Cloud & Infrastructure:', text: 'Microsoft Azure, AWS (S3, EC2), Snowflake, Databricks, BigQuery, dbt, Apache Spark, ETL/ELT, Data Lake Gen2, Azure Data Factory' },
      { label: 'Visualization & BI:', text: 'Tableau, Power BI, ThoughtSpot, Qlik Sense, Excel (Advanced/VBA), ArcGIS, Google Analytics, Matplotlib, Seaborn' },
      { label: 'Databases:', text: 'SQL, NoSQL, PostgreSQL, MongoDB, MySQL, BigQuery, Snowflake, dbt, Data Modeling, Data Profiling, Data Governance' },
    ],
    program: [
      { label: 'Program Management:', text: 'Program Development, Stakeholder Engagement, Process Reengineering, Change Management, Grant Writing, Grant Procurement, Regulatory Compliance' },
      { label: 'Data & Analytics:', text: 'SQL, Python, Tableau, Power BI, Excel (Advanced/VBA), Data Analysis, Reporting, KPI Development, Dashboard Design' },
      { label: 'CRM & Platforms:', text: 'Salesforce, Jira, Asana, Monday.com, HMIS (Clarity), UiPath (RPA), Power Automate, Microsoft Project, Cvent, Zendesk' },
      { label: 'Policy & Compliance:', text: 'NIST/RMF Frameworks, NEPA, NIH Ethics, IRB Research, Agile/Scrum, Program Evaluation, Impact Assessment, Compliance Auditing' },
      { label: 'Leadership:', text: 'Team Management, Cross-functional Collaboration, Mentorship, Executive Communication, Budget Management, Vendor Management, Partnership Development' },
    ],
    tech: [
      { label: 'Languages & Frameworks:', text: 'Python, R, SQL, T-SQL, JavaScript, HTML5/CSS3, Java, TensorFlow, PyTorch, Scikit-Learn, React, Next.js, Node.js' },
      { label: 'Cloud & DevOps:', text: 'Microsoft Azure, AWS (S3, EC2), GCP, Databricks, Snowflake, dbt, Apache Spark, Serverless Architecture, API Development, Postman' },
      { label: 'Data Engineering:', text: 'ETL/ELT, Data Factory, Synapse Analytics, Data Lake Gen2, Blob Storage, Cosmos DB, BigQuery, Data Modeling, Data Warehousing' },
      { label: 'Visualization & BI:', text: 'Tableau, Power BI, ThoughtSpot, Qlik Sense, Matplotlib, Seaborn, ArcGIS, Google Analytics, Excel (Advanced/VBA)' },
      { label: 'Creative & Tools:', text: 'Adobe Creative Suite, Figma, AutoCAD, DaVinci Resolve, Premiere Pro, GitHub (Copilot/CLI), Jira, Agile/Scrum, UiPath (RPA), Power Automate' },
    ],
  };

  const skillLines = skillLinesByFilter[filter] || skillLinesByFilter.main;
  skillLines.forEach(({ label, text }) => writeLabeledLine(label + ' ', text));

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  sectionHeader('EDUCATION');
  y += 2;

  [
    { school: 'Goucher College', degree: 'BA — Economics (Public Health Minor)', period: 'Graduated 05/2019' },
    { school: 'Georgetown University', degree: 'Summer College — International Relations & Calculus', period: '2015' },
  ].forEach(({ school, degree, period }) => {
    checkPage(LINE * 2 + 4);
    const rightX = PW - MR;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text(school, ML, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(period, rightX, y, { align: 'right' });
    y += LINE - 1;
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 50, 50);
    doc.text(degree, ML, y);
    y += LINE + 2;
  });

  // ── WORK EXPERIENCE ───────────────────────────────────────────────────────
  sectionHeader('EXPERIENCE');
  y += 2;

  // Filter & deduplicate experience for PDF
  const expForPdf = (visibleExp && visibleExp.length > 0)
    ? visibleExp.filter(e => !e.role.toLowerCase().includes('certification'))
    : [];

  // Ensure at least 5 bullets per role by expanding bullets if short
  expForPdf.forEach((exp, idx) => {
    checkPage(LINE * 3);
    const rightX = PW - MR;

    // Role header line
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const roleText = `${exp.org} — ${exp.role}`;
    const roleLines = doc.splitTextToSize(roleText, CW * 0.72);
    doc.text(roleLines[0], ML, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(exp.period, rightX, y, { align: 'right' });
    y += LINE;

    if (roleLines.length > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      for (let rl = 1; rl < roleLines.length; rl++) {
        checkPage(LINE);
        doc.text(roleLines[rl], ML, y);
        y += LINE;
      }
    }

    // Location sub-line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(exp.location, ML, y);
    y += LINE;

    // Bullets — ensure at least 5
    const bullets = [...(exp.bullets || [])];
    // If the role has a tools line, split it out as a bullet
    const toolsBullet = bullets.find(b => b.startsWith('Tools:'));
    const contentBullets = bullets.filter(b => !b.startsWith('Tools:'));

    // Write content bullets
    contentBullets.forEach(b => writeBullet(b));
    // Write tools as a compact labeled line
    if (toolsBullet) {
      writeBullet(toolsBullet);
    }
    y += 4;
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const filterSuffix = { main: 'Full', data: 'Data', program: 'Program', tech: 'Tech' }[filter] || 'Full';
  doc.save(`LancelotNaipierKane_Resume_${filterSuffix}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const ALL_EXPERIENCE = [
  {
    role: 'Applied AI & Data Science Certification',
    org: 'MIT',
    location: 'Cambridge, MA',
    period: '06/2025 – 10/2025',
    tags: ['data', 'tech', 'ai'],
    bullets: [
      'Formalized skills in Machine Learning, Applied AI, and Data Science — accuracy boosts of 50%, latency reduced 30% via hyperparameter tuning and data pipeline refactoring in simulated production environments.',
      'Completed modules covering Computer Vision, NLP, Generative AI, and Transformer architectures alongside practical capstone projects.',
      'Tools: Python, R, Seaborn, NumPy, Pandas, Scikit-Learn, TensorFlow, Keras, Generative AI, Transformers, OpenCV, Hugging Face, ChatGPT, DALL-E, LangChain, NLP, Tableau, AWS Cloud.',
    ],
  },
  {
    role: 'Azure Data Fundamentals Certification',
    org: 'Microsoft',
    location: 'Redmond, WA',
    period: '06/2025 – 10/2025',
    tags: ['data', 'tech'],
    bullets: [
      'Engineered a robust automated cleaning framework that improved data quality scores from 65% to 98% by identifying 15+ dirty-data edge cases in a controlled sandbox environment.',
      'Deepened knowledge in cloud-based relational and non-relational database services and ETL/ELT pipeline architecture on Azure.',
      'Tools: Azure SQL, NoSQL, Cosmos DB, Synapse Analytics, Data Factory, Power BI, Blob Storage, Data Lake Gen2, ETL/ELT Pipelines, T-SQL, Relational/Non-Relational Modeling.',
    ],
  },
  {
    role: 'Events & Community Coordinator',
    org: 'City of New York',
    location: 'New York, NY',
    period: '10/2023 – 05/2025',
    tags: ['program', 'tech'],
    bullets: [
      'Directed full-cycle Program Development and event design using advanced Data Integration strategies to drive informed process improvements across NYC agencies.',
      'Created innovative outreach strategies alongside Data Analysis that boosted event attendance by 35% while producing 30% more events annually.',
      'Managed CRM workflows, marketing automation, and analytics pipelines for city-wide public engagement initiatives.',
      'Tools: Cvent, Salesforce CRM, Eventbrite, Partiful, Luna, Zapier, Asana, Monday.com, Mailchimp, Slido (Analytics), Tableau, Microsoft Excel, Microsoft Teams.',
    ],
  },
  {
    role: 'Program & Data Manager',
    org: 'New York City HRA',
    location: 'New York, NY',
    period: '11/2023 – 09/2024',
    tags: ['data', 'program', 'tech'],
    bullets: [
      'Directed enterprise-level Data Management and Data Integration of the New York SNAP/EBT system managing regulatory compliance on a $7.6 billion budget.',
      'Utilized ground research and testing data to inform infrastructure updates that decreased employee workload by 40% and increased system accuracy for clients by 25%.',
      'Automated reporting and compliance workflows using RPA tools, reducing manual touchpoints across benefit-issuance pipelines.',
      'Tools: Cúram (ACCESS HRA), WMS (Welfare Management System), POS (Paperless Office System), UiPath (RPA), SQL (SSIS), dbt, Power Automate, Tableau, Excel (Advanced/VBA).',
    ],
  },
  {
    role: 'Program & Data Manager',
    org: 'Comprehensive Life Resources',
    location: 'Tacoma, WA',
    period: '09/2022 – 09/2023',
    tags: ['data', 'program', 'tech'],
    bullets: [
      'Provided wraparound services to unsheltered and unstably housed populations, completing grant deliverables and procurement alongside technical system maintenance.',
      'Redesigned the State HMIS data system, significantly improving data capture and operational efficiency for thousands of clients by 60%.',
      'Managed geospatial data in ArcGIS and cross-referenced field data with state-level reporting dashboards for real-time program monitoring.',
      'Tools: ArcGIS, Google Forms, Excel (Data Methodology), HMIS (Clarity), WA SAW (SecureAccess Washington), PRISM (Online Grant Management), Julius (Peer Services Data).',
    ],
  },
  {
    role: 'Contractor: Asset, Cyber, Monetary & Domestic',
    org: 'Federal Agencies',
    location: 'Washington, DC',
    period: '10/2021 – 08/2022',
    tags: ['data', 'program', 'tech'],
    bullets: [
      'Awarded multiple independent contracts in research and management within federal agencies, applying program management methodology with information acquisition and situational analysis.',
      'Engineered a standardized Data Warehousing and situational analysis framework that enhanced multi-scale operational outcomes by 25% via structured Data Management.',
      'Applied NIST Risk Management Frameworks and cybersecurity standards across classified and sensitive operations environments.',
      'Tools: Risk Management Frameworks (RMF), NIST Standards, SQL, Advanced Excel, Microsoft Project, Data Security, Secure Communication Platforms.',
    ],
  },
  {
    role: 'Environmental Researcher — Oil Train Safety',
    org: 'Federal Railroad Administration',
    location: 'Washington, DC',
    period: '04/2021 – 07/2021',
    tags: ['program', 'data'],
    bullets: [
      'Completed research for the Hazardous Materials and Human Factors Division in accordance with regulatory principals, attributing to policy movements in urban transport at multiple levels of scale.',
      'Produced reports and policy coverage material that informed agency-wide programming, significantly reducing localized safety risks in implementation.',
      'Applied GIS spatial analysis and NEPA environmental frameworks to assess infrastructure risk corridors.',
      'Tools: ArcGIS (Spatial Analysis), NEPA Frameworks, FRA Safety Standards, Tableau, Graphic Design, Adobe Acrobat.',
    ],
  },
  {
    role: 'Technical Specialist — Fleet Management & AI Integration',
    org: 'Lytx, Inc.',
    location: 'San Diego, CA',
    period: '01/2021 – 04/2021',
    tags: ['tech', 'data'],
    bullets: [
      'Maintained client satisfaction and onboarding stability through troubleshooting, data entry, and safety checks of hardware and software compatibility.',
      'Leveraged technical experience and customer engagement to increase lead generation and customer satisfaction by 30% each.',
      'Supported integration of AI-powered fleet telematics dashboards and DriveCam API systems for enterprise B2B clients.',
      'Tools: Salesforce CRM, Gainsight (CSM), Zendesk (Ticketing), HubSpot, Jira (Bug Tracking), Lytx DriveCam API, Oracle NetSuite (ERP).',
    ],
  },
  // ── Earlier / formative roles — more casual tone ────────────────────────
  {
    role: 'Assistant Director',
    org: 'Solar Household Energy, Inc.',
    location: 'Washington, DC',
    period: '12/2019 – 07/2020',
    tags: ['program', 'data'],
    bullets: [
      'Worked as assistant director for a solar NGO focused on clean cooking technology — helped write grants, put together donor outreach materials, and ran economic analyses to figure out whether programs were actually feasible.',
      'Got involved in R&D partnerships and multi-stakeholder projects that pushed the organization forward, which was a good introduction to how impact-driven orgs actually operate.',
      'Tools: Adobe Creative Suite (Illustrator/Photoshop), Salesforce (Donor Management), Mailchimp, Google Analytics, Google Ads, HTML/CSS.',
    ],
  },
  {
    role: 'Volunteer Program & Grant Consultant',
    org: 'Living Classrooms Foundation DC',
    location: 'Washington, DC',
    period: '09/2019 – 12/2019',
    tags: ['program'],
    bullets: [
      'Volunteered as a grant consultant and helped write DOEE applications for green workforce programs on Kingman Island — got a real window into how grant cycles work at the city government level.',
      'Helped design a meta-analysis framework for a set of wraparound programs, which was one of my first serious dives into how you actually structure and evaluate social programs.',
      'Tools: Salesforce (NPSP), VolunteerHub, Excel (VBA/Budgetary Modeling), E-Grants (DOEE Portal), SMART (Participant Tracking), SurveyMonkey.',
    ],
  },
  {
    role: 'IRB Social Policy Researcher',
    org: 'Where There Be Dragons',
    location: 'Varanasi, India',
    period: '08/2018 – 01/2019',
    tags: ['program', 'data'],
    bullets: [
      'Lived in Varanasi and conducted an IRB-approved research study on the intersection of natural gas cremation technology and local spiritual tradition along the Ganges — a genuinely fascinating thing to be doing at 22.',
      'The study went through NIH ethics review and ended up contributing to broader support for the Sankat Mochan Water Foundation, which was meaningful.',
      'Tools: NVivo (Qualitative Analysis), Qualtrics, NIH Ethics Framework, Structured Interviews, SPSS, Zotero (Academic Publication Management).',
    ],
  },
  {
    role: 'Line Chef & Operations Lead',
    org: 'Food and Beverage Service Industry',
    location: 'United States',
    period: '05/2015 – 08/2018',
    tags: ['program', 'operations'],
    bullets: [
      'Cooked professionally all through high school and college — it was my main job and a genuinely good education in how teams work under pressure, how a shift runs, and how operations actually feel from the inside.',
      'Picked up the basics of inventory management, supply chain logistics, and keeping things moving in a high-volume environment, which turned out to be surprisingly transferable to later program management work.',
      'Tools: Qualitative Feedback Analysis, Quantitative Analytics, Inventory Management Systems, Point of Sale (POS) Operations.',
    ],
  },
  {
    role: 'Goucher Green Fund Chair',
    org: 'Goucher College',
    location: 'Baltimore, MD',
    period: '05/2017 – 05/2018',
    tags: ['program', 'data'],
    bullets: [
      'Chaired the campus sustainability grant fund — basically rebuilt the whole grant mechanism from scratch, modeled it after federal systems, and ran multi-stakeholder review panels to fund 10+ ecological projects.',
      'Good early experience managing a real budget and navigating competing priorities across a group of people with very different ideas about what mattered.',
      'Tools: Strategic Planning, Qualitative Analysis, Grant Writing Frameworks, Project Lifecycle Management.',
    ],
  },
  {
    role: 'Student Body President',
    org: 'Goucher College Student Government',
    location: 'Baltimore, MD',
    period: '04/2017 – 04/2018',
    tags: ['program', 'data'],
    bullets: [
      'Served as student body president — which in practice meant a lot of institutional negotiation, budget work, and trying to actually fix things people cared about on campus.',
      'Pushed through a food security initiative that increased campus meal access by 167%, set up revolving loan funds for sustainability projects, and established committees to audit Title IX and facilities compliance.',
      'Tools: Quantitative Analytics, Policy Analysis, Institutional Budgeting, Energy Metering Software, Stakeholder Management.',
    ],
  },
  {
    role: 'Student Senator',
    org: 'Goucher College Student Government',
    location: 'Baltimore, MD',
    period: '01/2016 – 04/2017',
    tags: ['program'],
    bullets: [
      'Sat on the Facilities and Environment Committee and worked on campus infrastructure and sustainability — a lot of coordination across departments, some tedious, some actually effective.',
      'Good introduction to how institutional change works and how to move things forward when you have limited formal authority.',
      'Tools: Qualitative Analysis, Quantitative Analytics, Inter-Agency Coordination, Legislative Drafting.',
    ],
  },
  {
    role: 'Treasurer | College Chapter',
    org: 'Roosevelt Institute',
    location: 'Baltimore, MD',
    period: '01/2017 – 01/2018',
    tags: ['data', 'operations'],
    bullets: [
      'Served as treasurer for the Roosevelt Institute chapter — managed the chapter budget, coordinated funding for events, and dove into economic policy research including an analysis of institutional interest-rate-swaps post-2008.',
      'Good early exposure to financial modeling and thinking about economic risk at an institutional level.',
      'Tools: Financial Modeling, Quantitative Analytics, Risk Assessment, Event Planning, Budgetary Oversight.',
    ],
  },
  {
    role: 'Event Coordinator | College Chapter',
    org: 'Roosevelt Institute',
    location: 'Baltimore, MD',
    period: '09/2016 – 01/2017',
    tags: ['operations'],
    bullets: [
      'Coordinated events for the Roosevelt Institute chapter — handled logistics, managed funding requests, and figured out how to run large informational events on a shoestring budget.',
      'Learned a lot about the unglamorous side of making things happen and keeping attendance up.',
      'Tools: Strategic Planning, Logistic Management, Qualitative Analysis, Resource Allocation.',
    ],
  },
  {
    role: 'Grassroots Organizer',
    org: 'KOFA Public Affairs',
    location: 'Washington DC-Baltimore Area',
    period: '09/2016 – 01/2017',
    tags: ['data', 'program'],
    bullets: [
      'Did grassroots organizing work — canvassing, phone banking, building community support for campaigns. Hit some of the highest engagement numbers on the team during multiple intervals.',
      'Ground-level experience in how direct community feedback shapes strategy, and how you iterate on a campaign when the data tells you something isn\'t working.',
      'Tools: NGP VAN, MiniVAN, PhoneBurner, Salesforce CRM, TargetSmart, Google Workspace.',
    ],
  },
  {
    role: 'Environmental Network Intern',
    org: 'Global Green USA',
    location: 'Washington DC-Baltimore Area',
    period: '12/2015 – 02/2016',
    tags: ['program'],
    bullets: [
      'Interned at Global Green USA working on environmental advocacy — wrote newsletters, did outreach to nonprofits and DC Council members, and documented agency functions for executive briefings.',
      'Early experience in how a DC-area nonprofit actually operates day-to-day and how advocacy networks get built.',
      'Tools: Action Network, Mailchimp, GovTrack, WordPress (CMS), Excel, Google Workspace.',
    ],
  },
  {
    role: 'AFS Recipient | Ghana',
    org: 'AFS Intercultural Programs USA',
    location: 'Ghana',
    period: '01/2014 – 08/2014',
    tags: ['data', 'program'],
    bullets: [
      'Spent seven months in Ghana on an AFS intercultural scholarship — did community outreach, some basic qualitative research, and supported local development programming.',
      'Formative experience in working across cultural contexts and understanding how community engagement functions when you\'re an outsider trying to be useful.',
      'Tools: Qualitative Research, Quantitative Analytics, Intercultural Communication, Content Strategy.',
    ],
  },
];

const EDUCATION = [
  {
    school: 'Goucher College',
    degree: 'BA — Economics (Public Health Minor)',
    period: '05/2019',
    note: 'Applied quantitative skills (STATA, R, SPSS) to social impact research. Student Body President, Roosevelt Institute Treasurer, Green Fund Chair, Intercollegiate Swimmer. Focus on econometrics and public health data analysis.',
    tags: ['data', 'program'],
    expandable: true,
    secondary: false,
    expandDetails: [
      'Coursework in econometrics, microeconomics, macroeconomics, public health policy, and statistical methods.',
      'Applied STATA, R, and SPSS to original research on social determinants of health and economic equity.',
      'Student Body President (2017–2018): represented entire student body in institutional governance, budget oversight, and policy advocacy.',
      'Green Fund Chair (2017–2019): chaired campus sustainability grant fund, evaluated proposals, allocated funding for 10+ ecological programs.',
      'Roosevelt Institute Treasurer (2015–2019): managed chapter budget, led economic policy research publications.',
      'Intercollegiate Swimmer (2015–2019): competed on varsity team throughout undergraduate career.',
      'ACT Score: 35 — 99th percentile nationally (Feb 2015).',
    ],
  },
  {
    school: 'Georgetown University',
    degree: 'Summer College — International Relations & Calculus',
    period: '2015',
    note: 'Advanced pre-college program with college-level coursework in international relations theory and applied mathematics.',
    tags: ['program'],
    expandable: false,
    secondary: true,
  },
  {
    school: 'Brunswick High School',
    degree: 'Standard Diploma',
    period: '2011–2015',
    note: 'Brunswick, ME. ACT Score: 35 (Feb 2015) — 99th percentile nationally. Member of swim team.',
    tags: [],
    expandable: false,
    secondary: true,
  },
];

const CERTS = [
  {
    title: 'Applied AI & Data Science Certification',
    issuer: 'MIT',
    date: '10/2026',
    link: 'https://professional-education-gl.mit.edu/mit-online-data-science-program',
    tags: ['data', 'tech', 'ai'],
  },
  {
    title: 'Microsoft Certified: Azure Data Fundamentals (DP-900)',
    issuer: 'Microsoft',
    date: '10/2025',
    link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/',
    tags: ['data', 'tech'],
  },
  {
    title: 'Ethical Emerging Technologist Professional Certificate (CEET)',
    issuer: 'CertNexus',
    date: '12/2021',
    link: 'https://certnexus.com/certified-ethical-emerging-technologist-ceet/',
    tags: ['tech', 'data'],
  },
  {
    title: 'Google Grow Project Management Certificate',
    issuer: 'Google',
    date: '12/2021',
    link: 'https://grow.google/certificates/project-management/',
    tags: ['program', 'tech'],
  },
  {
    title: 'Project Management Essentials Certified (PMEC)',
    issuer: 'Management & Strategy Institute',
    date: '08/2021',
    link: 'https://www.msicertified.com/project-management/project-management-essentials-certified/',
    tags: ['program'],
  },
  {
    title: 'NIH Research Ethics — Human Subjects',
    issuer: 'National Institutes of Health',
    date: '05/2018',
    link: 'https://oir.nih.gov/sourcebook/ethical-conduct/research-ethics',
    tags: ['program', 'data'],
  },
];

const AWARDS_VOLUNTEER = [
  {
    title: 'Student Body President',
    org: 'Goucher College',
    period: '2017–2018',
    desc: 'Elected student government president — represented the entire student body in institutional governance, policy advocacy, and budget oversight. Led cross-departmental initiatives and stakeholder engagement across the college.',
    tags: ['program'],
  },
  {
    title: 'Roosevelt Institute Chapter — Treasurer',
    org: 'Goucher College',
    period: '2015–2019',
    desc: 'Managed chapter budgets and led economic policy discussions and student research publications as chapter treasurer. Coordinated funding and fiscal operations for all chapter activities.',
    tags: ['program', 'data'],
  },
  {
    title: 'Green Fund Chair',
    org: 'Goucher College',
    period: '2017–2019',
    desc: 'Chaired the campus green fund, evaluating proposals and allocating funding for campus sustainability and energy projects, including Green Gardens and urban agriculture initiatives.',
    tags: ['program'],
  },
  {
    title: 'Intercollegiate Swimmer',
    org: 'Goucher College',
    period: '2015–2019',
    desc: 'Competed as a member of the intercollegiate swim team throughout undergraduate years.',
    tags: [],
  },
  {
    title: '1st Place Wins — Maine Speech (Original Works)',
    org: 'National Speech and Debate Association',
    period: 'Apr 2015',
    desc: 'Earned multiple 1st place wins in competitive speech primarily in Original Works at the state level. Demonstrated strong communication, critical thinking, and presentation skills.',
    tags: [],
  },
  {
    title: 'Speech and Debate National Qualifier',
    org: 'National Speech and Debate Association',
    period: 'Apr 2015',
    desc: 'Qualified for Nationals in 2015 in Speech — a communication and persuasive presentation milestone at the national competitive level.',
    tags: [],
  },
  {
    title: 'Top 10 Maine Youth Visionary Award',
    org: 'Meridian Stories',
    period: 'Apr 2015',
    desc: 'Developed a video confronting problems in Maine for the Meridian Stories competition and received recognition among the top 10 youth visionaries in the state.',
    tags: [],
  },
  {
    title: "World School's Debate Team — State of Maine",
    org: 'National Speech and Debate Association',
    period: 'Apr 2015',
    desc: "One of four selected statewide to represent Maine on the World School's Debate Team at the national level — a leadership and communication achievement.",
    tags: [],
  },
  {
    title: 'Junior Maine Guide Program',
    org: 'State of Maine',
    period: 'Aug 2014',
    desc: 'Completed the Junior Maine Guide wilderness certification program issued by the State of Maine, demonstrating outdoor leadership, adaptability, and self-reliance.',
    tags: [],
  },
  {
    title: 'Michael C. Ferguson Achievement Award',
    org: 'State of Delaware',
    period: '',
    desc: 'Achievement award issued by the State of Delaware.',
    tags: [],
  },
  {
    title: 'Kingman Island Volunteer Steward',
    org: 'Living Classrooms Foundation DC',
    period: '2019',
    desc: 'Volunteer environmental stewardship on Kingman Island — Anacostia River ecosystem restoration, green workforce programming, and community land conservation.',
    tags: ['program'],
    isVolunteer: true,
  },
  {
    title: 'Federal Contractor — Independent Award (Multiple Agencies)',
    org: 'Federal Agencies',
    period: '2021–2022',
    desc: 'Awarded multiple independent federal contracts across asset management, cybersecurity, monetary, and domestic research and management domains.',
    tags: ['data', 'program', 'tech'],
  },
  {
    title: 'ACT Score: 35 — 99th Percentile',
    org: 'ACT / CollegeBoard',
    period: 'Feb 2015',
    desc: 'Scored 35/36 on the ACT college admissions examination, placing in the 99th percentile nationally.',
    tags: [],
  },
  {
    title: 'Cooking & Food Pantry Assistant',
    org: 'Mid Coast Hunger Prevention Program Inc.',
    period: 'May 2019 – Aug 2019',
    desc: 'Volunteered in direct food service and pantry operations supporting poverty alleviation and food security initiatives in mid-coast Maine.',
    tags: ['program'],
    isVolunteer: true,
  },
  {
    title: 'Fair Food Program Organizer',
    org: 'Coalition of Immokalee Workers',
    period: 'Jan 2019 – May 2019',
    desc: 'Organized fair food program outreach and community engagement campaigns supporting farmworker rights and food system equity.',
    tags: ['program'],
    isVolunteer: true,
  },
  {
    title: 'Animal Caretaker',
    org: 'Coastal Humane Society Inc.',
    period: 'Jun 2017 – Aug 2017',
    desc: 'Volunteered in animal welfare and caretaking operations at Coastal Humane Society.',
    tags: [],
    isVolunteer: true,
  },
  {
    title: 'English Teaching Assistant',
    org: 'AFS Intercultural Programs USA',
    period: 'May 2014 – Jul 2014',
    desc: 'Served as an English teaching assistant supporting children in an intercultural education program through AFS — cultural competency and cross-cultural communication in practice.',
    tags: ['program'],
    isVolunteer: true,
  },
];

const LANGUAGES = [
  { lang: 'English',   level: 'Native or Bilingual Proficiency' },
  { lang: 'Hindi',     level: 'Limited Working Proficiency' },
  { lang: 'French',    level: 'Limited Working Proficiency' },
  { lang: 'Akan-Twi', level: 'Elementary Proficiency' },
  { lang: 'Ladakhi',  level: 'Elementary Proficiency' },
];

const PUBLICATIONS = [
  {
    title: 'IRB-Approved Study: Natural Gas Cremation & Spiritual Tradition — Sankat Mochan Water Foundation',
    venue: 'Where There Be Dragons / NIH Ethics Framework',
    period: '01/2019',
    desc: 'Created and conducted an IRB-approved qualitative study in Varanasi, India examining environmental impacts of natural gas cremation technology in confluence with local spiritual tradition. Results contributed to broader regional support for the Sankat Mochan Water Foundation.',
    tags: ['data', 'program'],
    type: 'research',
  },
  {
    title: 'Oil Train Safety & Urban Transport Policy Coverage — FRA Hazardous Materials Division',
    venue: 'Federal Railroad Administration',
    period: '07/2021',
    desc: 'Produced research reports and policy coverage material for the FRA Hazardous Materials and Human Factors Division, informing agency-wide programming and reducing localized safety risks.',
    tags: ['data', 'program'],
    type: 'policy',
  },
  {
    title: 'DOEE Green Workforce Grant Application — Kingman Island Greenspace',
    venue: 'Living Classrooms Foundation DC / DOEE',
    period: '12/2019',
    desc: 'Authored grant application materials and meta-analysis framework for DOEE green workforce development funding covering Kingman Island ecosystem transformation, rainwater retention gardens, and eco job development.',
    tags: ['program'],
    type: 'grant',
  },
  {
    title: 'SNAP/EBT System Infrastructure Research — NYC HRA',
    venue: 'New York City Human Resources Administration',
    period: '09/2024',
    desc: 'Authored ground-research and testing data reports informing enterprise infrastructure updates to the $7.6B NYC SNAP/EBT system, reducing workload by 40% and increasing accuracy by 25%.',
    tags: ['data', 'program'],
    type: 'research',
  },
  {
    title: 'Private Grant Proposal — Solar Cooking Wraparound Services (FXB)',
    venue: 'Solar Household Energy, Inc.',
    period: '07/2020',
    desc: 'Comprehensive private grant proposal covering R&D and multi-actor implementation projects for improved indoor air quality and sustainable energy access.',
    tags: ['program'],
    type: 'grant',
  },
  {
    title: 'Lead & Public Health Literature Review',
    venue: 'Goucher College / IRB',
    period: '2018',
    desc: 'Comprehensive literature review on lead exposure and public health implications, conducted in accordance with NIH principles and contributing to undergraduate policy research publications.',
    tags: ['data', 'program'],
    type: 'research',
  },
];

const SKILL_GROUPS = [
  {
    label: 'Languages & AI Frameworks',
    tags: ['data', 'ai', 'tech'],
    items: [
      'Python', 'R', 'SQL', 'T-SQL', 'Java', 'JavaScript', 'HTML5/CSS3', 'STATA', 'MATLAB', 'SPSS',
      'TensorFlow', 'Keras', 'PyTorch', 'Scikit-Learn', 'NumPy', 'Pandas', 'Seaborn',
      'LangChain', 'Hugging Face', 'NLP', 'Transformers', 'LoRA/QLoRA', 'OpenCV',
    ],
  },
  {
    label: 'Cloud & Data Infrastructure',
    tags: ['data', 'tech'],
    items: [
      'Microsoft Azure', 'AWS (S3, EC2)', 'Databricks', 'Synapse Analytics', 'Cosmos DB',
      'Snowflake', 'BigQuery', 'dbt', 'Apache Spark', 'Apache Airflow', 'ETL/ELT',
      'Data Lake Gen2', 'Blob Storage', 'Azure Data Factory', 'Postman', 'API Development',
      'Serverless Architecture', 'IoT Specialization',
    ],
  },
  {
    label: 'Visualization & BI',
    tags: ['data'],
    items: [
      'Tableau', 'Power BI', 'ThoughtSpot', 'Qlik Sense', 'Excel (Advanced/VBA)',
      'Power Query', 'ArcGIS', 'Google Analytics', 'Seaborn', 'Matplotlib',
    ],
  },
  {
    label: 'CRM & Project Platforms',
    tags: ['program', 'tech'],
    items: [
      'Salesforce', 'HubSpot', 'Gainsight', 'Jira', 'Asana', 'Monday.com', 'Zendesk',
      'Oracle NetSuite', 'Cvent', 'Eventbrite', 'UiPath (RPA)', 'Power Automate',
      'Zapier', 'GitHub (Copilot, CLI)', 'Microsoft Project', 'HMIS (Clarity)',
      'WA SAW', 'PRISM', 'E-Grants',
    ],
  },
  {
    label: 'Creative, Web & Media',
    tags: ['tech'],
    items: [
      'Adobe Creative Suite', 'Figma', 'Canva', 'AutoCAD', 'DaVinci Resolve',
      'Premiere Pro', 'After Effects', 'Motion Graphics', 'ElevenLabs', 'Audacity',
      'React', 'Vite', 'Next.js', 'WordPress',
    ],
  },
  {
    label: 'Data Science & Advanced Analytics',
    tags: ['data', 'ai'],
    items: [
      'Machine Learning', 'Deep Learning', 'Neural Networks', 'Computer Vision',
      'Recommender Systems', 'Predictive Algorithms', 'Hyperparameter Tuning',
      'Time Series Forecasting', 'Anomaly Detection', 'Dimensionality Reduction',
      'Data Warehousing', 'Data Governance', 'Data Storytelling', 'Quantitative Analytics',
      'Statistical Modeling', 'Regression Analysis', 'Sentiment Analysis',
      'Classification Algorithms', 'Federated Learning', 'Reinforcement Learning',
      'Feature Store Management', 'Data Lineage Tracking', 'Synthetic Data Generation',
      'Market Basket Analysis', 'Customer Churn Analysis',
    ],
  },
  {
    label: 'Program, Policy & Ethics',
    tags: ['program'],
    items: [
      'Grant Writing', 'Grant Procurement', 'Program Management', 'Stakeholder Engagement',
      'Regulatory Compliance', 'NIST/RMF Frameworks', 'NEPA', 'NIH Ethics', 'IRB Research',
      'Process Reengineering', 'Change Management', 'Agile/Scrum', 'Technical Writing',
      'Public Outreach', 'Community Engagement', 'Competitive Intelligence',
      'Impact Assessment', 'Program Evaluation', 'Compliance Auditing',
    ],
  },
  {
    label: 'Database & Data Engineering',
    tags: ['data', 'tech'],
    items: [
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'BigQuery', 'Snowflake',
      'dbt', 'JSON', 'Data Modeling', 'Data Profiling', 'Data Labeling',
      'Data Anonymization', 'Root Cause Analysis', 'Indexing', 'Load Balancing',
    ],
  },
  {
    label: 'Soft, Business & Interpersonal Skills',
    tags: ['program', 'data', 'tech'],
    items: [
      'Leadership', 'Team Management', 'Cross-functional Collaboration', 'Mentorship',
      'Communication', 'Presentation Skills', 'Negotiation', 'Conflict Resolution',
      'Critical Thinking', 'Problem Solving', 'Decision Making', 'Strategic Planning',
      'Customer Service', 'Client Relations', 'Account Management', 'Executive Communication',
      'Diversity & Inclusion', 'Equity & Access', 'Cultural Competency', 'Emotional Intelligence',
      'Adaptability', 'Resilience', 'Time Management', 'Prioritization',
      'Organizational Development', 'Workforce Development', 'Capacity Building',
      'Budget Management', 'Financial Oversight', 'Vendor Management', 'Partnership Development',
      'Relationship Building', 'Networking', 'Fundraising', 'Donor Relations',
    ],
  },
];

// ── SKILL_RELATIONS — semantic association graph ────────────────────────────
//
// Philosophy: one degree of conceptual association. Each key maps to things
// a recruiter would naturally expect to see alongside it. Cross-domain
// connections exist where real professional overlap exists (e.g. "data
// analysis" connects to both technical tools AND the analytical judgment
// used in program roles). The goal is generous but sensible — show the
// best connected picture of skills, not random noise.
//
// Synonyms and near-synonyms are grouped under the same key so that
// searching "coding" finds "programming", "leadership" finds "governance",
// "reporting" finds "tableau", etc.
const SKILL_RELATIONS = {

  // ── Python / technical computing ─────────────────────────────────────────
  // Python = computation, data manipulation, ML libraries, scripting
  python:             ['pandas', 'numpy', 'seaborn', 'matplotlib', 'scikit-learn',
                       'tensorflow', 'keras', 'pytorch', 'spss', 'stata', 'r',
                       'machine learning', 'data science', 'statistical modeling',
                       'quantitative analytics', 'jupyter', 'api development'],
  coding:             ['python', 'r', 'java', 'javascript', 'sql', 't-sql',
                       'html5/css3', 'stata', 'matlab', 'spss'],
  programming:        ['python', 'r', 'java', 'javascript', 'html5/css3', 'sql',
                       't-sql', 'stata', 'matlab', 'spss', 'api development'],
  scripting:          ['python', 'javascript', 'sql', 't-sql', 'power automate',
                       'zapier', 'uipath (rpa)', 'apache airflow'],

  // ── Data / analytics broad cluster ───────────────────────────────────────
  // "data" and synonyms → tools + analytical skills + reporting
  data:               ['python', 'r', 'sql', 'pandas', 'numpy', 'tableau', 'power bi',
                       'excel (advanced/vba)', 'dbt', 'snowflake', 'bigquery',
                       'quantitative analytics', 'statistical modeling', 'data storytelling',
                       'data modeling', 'data governance', 'data warehousing'],
  'data analysis':    ['python', 'r', 'sql', 'pandas', 'numpy', 'seaborn', 'matplotlib',
                       'tableau', 'power bi', 'excel (advanced/vba)', 'spss', 'stata',
                       'quantitative analytics', 'statistical modeling', 'regression analysis'],
  'data science':     ['python', 'r', 'machine learning', 'deep learning',
                       'statistical modeling', 'regression analysis', 'pandas', 'numpy',
                       'seaborn', 'scikit-learn', 'tensorflow', 'keras',
                       'data storytelling', 'quantitative analytics',
                       'anomaly detection', 'time series forecasting'],
  analytics:          ['tableau', 'power bi', 'thoughtspot', 'qlik sense',
                       'excel (advanced/vba)', 'power query', 'google analytics',
                       'seaborn', 'matplotlib', 'arcgis', 'data storytelling',
                       'quantitative analytics', 'statistical modeling',
                       'python', 'r', 'sql'],
  reporting:          ['tableau', 'power bi', 'excel (advanced/vba)', 'google analytics',
                       'data storytelling', 'quantitative analytics', 'qlik sense',
                       'thoughtspot', 'power query', 'technical writing'],
  visualization:      ['tableau', 'power bi', 'seaborn', 'matplotlib', 'thoughtspot',
                       'qlik sense', 'arcgis', 'google analytics', 'data storytelling',
                       'power query'],
  statistics:         ['python', 'r', 'spss', 'stata', 'matlab', 'statistical modeling',
                       'regression analysis', 'quantitative analytics', 'seaborn',
                       'pandas', 'numpy', 'scikit-learn'],
  quantitative:       ['python', 'r', 'sql', 'spss', 'stata', 'statistical modeling',
                       'quantitative analytics', 'regression analysis', 'excel (advanced/vba)',
                       'pandas', 'numpy'],

  // ── ML / AI cluster ───────────────────────────────────────────────────────
  ml:                 ['scikit-learn', 'tensorflow', 'keras', 'pytorch', 'machine learning',
                       'deep learning', 'neural networks', 'hyperparameter tuning',
                       'classification algorithms', 'regression analysis', 'python',
                       'recommender systems', 'reinforcement learning', 'anomaly detection',
                       'time series forecasting', 'dimensionality reduction'],
  ai:                 ['tensorflow', 'keras', 'pytorch', 'langchain', 'hugging face',
                       'transformers', 'nlp', 'computer vision', 'machine learning',
                       'deep learning', 'neural networks', 'lora/qlora', 'opencv',
                       'sentiment analysis', 'python', 'scikit-learn'],
  'machine learning': ['scikit-learn', 'tensorflow', 'keras', 'pytorch', 'deep learning',
                       'neural networks', 'hyperparameter tuning', 'classification algorithms',
                       'regression analysis', 'anomaly detection', 'recommender systems',
                       'time series forecasting', 'dimensionality reduction', 'python'],
  'deep learning':    ['tensorflow', 'keras', 'pytorch', 'neural networks', 'opencv',
                       'computer vision', 'nlp', 'transformers', 'lora/qlora', 'python'],
  nlp:                ['nlp', 'transformers', 'langchain', 'hugging face', 'lora/qlora',
                       'sentiment analysis', 'computer vision', 'python', 'tensorflow'],
  'computer vision':  ['opencv', 'tensorflow', 'keras', 'pytorch', 'deep learning',
                       'neural networks', 'python'],
  generative:         ['langchain', 'hugging face', 'transformers', 'lora/qlora',
                       'tensorflow', 'keras', 'pytorch', 'nlp', 'python'],

  // ── Cloud / infrastructure cluster ───────────────────────────────────────
  cloud:              ['microsoft azure', 'aws (s3, ec2)', 'databricks', 'synapse analytics',
                       'cosmos db', 'snowflake', 'bigquery', 'dbt', 'apache spark',
                       'apache airflow', 'data lake gen2', 'blob storage',
                       'azure data factory', 'serverless architecture', 'etl/elt'],
  azure:              ['microsoft azure', 'synapse analytics', 'cosmos db',
                       'azure data factory', 'blob storage', 'data lake gen2',
                       'etl/elt', 't-sql', 'databricks', 'power bi'],
  aws:                ['aws (s3, ec2)', 'serverless architecture', 'iot specialization',
                       'apache spark', 'databricks'],
  infrastructure:     ['microsoft azure', 'aws (s3, ec2)', 'databricks', 'apache spark',
                       'apache airflow', 'snowflake', 'bigquery', 'data lake gen2',
                       'blob storage', 'serverless architecture', 'sql', 'nosql'],
  etl:                ['etl/elt', 'apache airflow', 'apache spark', 'dbt',
                       'azure data factory', 'uipath (rpa)', 'power automate',
                       'snowflake', 'bigquery', 'databricks'],
  pipeline:           ['etl/elt', 'apache airflow', 'apache spark', 'dbt',
                       'azure data factory', 'databricks', 'sql', 'python'],

  // ── Database cluster ─────────────────────────────────────────────────────
  sql:                ['t-sql', 'nosql', 'dbt', 'bigquery', 'snowflake', 'postgresql',
                       'mysql', 'mongodb', 'cosmos db', 'data modeling',
                       'data profiling', 'python'],
  database:           ['sql', 'nosql', 'cosmos db', 'bigquery', 'snowflake', 'dbt',
                       'mongodb', 'postgresql', 'mysql', 'data modeling',
                       'data profiling', 'indexing', 'load balancing'],
  'data engineering': ['sql', 'nosql', 'dbt', 'apache spark', 'apache airflow', 'etl/elt',
                       'snowflake', 'bigquery', 'data modeling', 'data profiling',
                       'data lineage tracking', 'azure data factory', 'databricks', 'python'],
  'data governance':  ['data governance', 'data lineage tracking', 'data anonymization',
                       'data profiling', 'compliance auditing', 'regulatory compliance',
                       'nist/rmf frameworks', 'data modeling'],

  // ── Automation / workflow cluster ─────────────────────────────────────────
  automation:         ['uipath (rpa)', 'power automate', 'zapier', 'apache airflow',
                       'etl/elt', 'process reengineering', 'microsoft project',
                       'github (copilot, cli)'],
  rpa:                ['uipath (rpa)', 'power automate', 'zapier', 'process reengineering',
                       'apache airflow', 'etl/elt'],
  workflow:           ['uipath (rpa)', 'power automate', 'zapier', 'asana', 'monday.com',
                       'jira', 'microsoft project', 'process reengineering',
                       'change management', 'agile/scrum'],

  // ── CRM / platforms cluster ───────────────────────────────────────────────
  crm:                ['salesforce', 'hubspot', 'gainsight', 'zendesk', 'oracle netsuite',
                       'mailchimp', 'cvent', 'eventbrite'],
  salesforce:         ['salesforce', 'hubspot', 'gainsight', 'zendesk', 'oracle netsuite',
                       'mailchimp', 'salesforce npsp', 'crm', 'client relations'],
  'project management tools': ['jira', 'asana', 'monday.com', 'microsoft project',
                                'zapier', 'github (copilot, cli)', 'power automate'],

  // ── API / web / dev tools cluster ────────────────────────────────────────
  api:                ['api development', 'postman', 'javascript', 'python', 'react',
                       'serverless architecture', 'iot specialization', 'github (copilot, cli)'],
  web:                ['react', 'vite', 'next.js', 'wordpress', 'html5/css3',
                       'javascript', 'api development', 'figma'],
  development:        ['python', 'javascript', 'react', 'vite', 'next.js', 'sql',
                       'api development', 'github (copilot, cli)', 'html5/css3'],

  // ── Design / media cluster ────────────────────────────────────────────────
  design:             ['adobe creative suite', 'figma', 'canva', 'autocad',
                       'davinci resolve', 'premiere pro', 'after effects', 'motion graphics'],
  media:              ['davinci resolve', 'premiere pro', 'after effects', 'motion graphics',
                       'adobe creative suite', 'audacity', 'elevenlabs', 'canva'],
  creative:           ['adobe creative suite', 'figma', 'canva', 'davinci resolve',
                       'premiere pro', 'after effects', 'motion graphics', 'wordpress'],

  // ── GIS / spatial cluster ─────────────────────────────────────────────────
  gis:                ['arcgis', 'geospatial', 'spatial analysis', 'nepa',
                       'tableau', 'data storytelling'],
  spatial:            ['arcgis', 'geospatial', 'nepa', 'gis'],
  mapping:            ['arcgis', 'geospatial', 'spatial analysis', 'tableau'],

  // ── Grant / funding cluster ───────────────────────────────────────────────
  grant:              ['grant writing', 'grant procurement', 'e-grants', 'prism',
                       'doee', 'fundraising', 'donor relations', 'salesforce npsp',
                       'impact assessment', 'program evaluation', 'technical writing',
                       'budget management', 'rfp'],
  'grant writing':    ['grant procurement', 'rfp', 'e-grants', 'prism', 'doee',
                       'fundraising', 'technical writing', 'impact assessment',
                       'community engagement', 'budget management'],
  funding:            ['grant writing', 'grant procurement', 'fundraising', 'donor relations',
                       'budget management', 'financial oversight', 'salesforce npsp'],
  fundraising:        ['fundraising', 'donor relations', 'grant writing', 'grant procurement',
                       'salesforce npsp', 'partnership development', 'community engagement',
                       'mailchimp', 'public outreach'],

  // ── Policy / compliance / regulatory cluster ──────────────────────────────
  policy:             ['nepa', 'nist/rmf frameworks', 'nih ethics', 'irb research',
                       'regulatory compliance', 'compliance auditing',
                       'program evaluation', 'impact assessment', 'technical writing',
                       'stakeholder engagement'],
  compliance:         ['regulatory compliance', 'nist/rmf frameworks', 'nih ethics',
                       'irb research', 'nepa', 'compliance auditing', 'data governance',
                       'title ix', 'program evaluation'],
  regulatory:         ['regulatory compliance', 'nist/rmf frameworks', 'nepa',
                       'compliance auditing', 'nih ethics', 'irb research'],
  federal:            ['nist/rmf frameworks', 'nepa', 'regulatory compliance',
                       'compliance auditing', 'program management',
                       'stakeholder engagement', 'technical writing'],
  government:         ['regulatory compliance', 'nist/rmf frameworks', 'nepa',
                       'program management', 'stakeholder engagement',
                       'compliance auditing', 'grant writing', 'grant procurement',
                       'impact assessment', 'leadership'],
  security:           ['nist/rmf frameworks', 'data governance', 'data anonymization',
                       'regulatory compliance', 'compliance auditing'],

  // ── Program / project management cluster ─────────────────────────────────
  // "program management" connects to tools, governance, AND leadership behaviors
  'program management': ['stakeholder engagement', 'change management', 'agile/scrum',
                          'jira', 'asana', 'monday.com', 'process reengineering',
                          'impact assessment', 'program evaluation', 'compliance auditing',
                          'budget management', 'cross-functional collaboration',
                          'organizational development', 'grant writing'],
  'project management': ['jira', 'asana', 'monday.com', 'microsoft project', 'agile/scrum',
                          'change management', 'stakeholder engagement', 'process reengineering',
                          'budget management', 'cross-functional collaboration'],
  agile:              ['agile/scrum', 'jira', 'asana', 'monday.com', 'process reengineering',
                       'change management', 'cross-functional collaboration'],
  scrum:              ['agile/scrum', 'jira', 'asana', 'monday.com'],
  planning:           ['strategic planning', 'program management', 'stakeholder engagement',
                       'budget management', 'organizational development', 'impact assessment',
                       'microsoft project', 'asana', 'monday.com'],

  // ── Research / qualitative cluster ────────────────────────────────────────
  research:           ['irb research', 'nih ethics', 'qualtrics', 'nvivo', 'spss',
                       'zotero', 'statistical modeling', 'literature review',
                       'impact assessment', 'program evaluation', 'qualitative research',
                       'python', 'r', 'stata'],
  qualitative:        ['nvivo', 'qualtrics', 'irb research', 'nih ethics', 'zotero',
                       'spss', 'impact assessment', 'program evaluation', 'community engagement'],
  'public health':    ['nih ethics', 'irb research', 'spss', 'stata', 'r',
                       'impact assessment', 'program evaluation', 'community engagement',
                       'regulatory compliance', 'statistical modeling'],

  // ── Social services / HMIS / welfare cluster ─────────────────────────────
  snap:               ['hmis (clarity)', 'wa saw', 'prism', 'regulatory compliance',
                       'program management', 'impact assessment', 'community engagement'],
  hmis:               ['hmis (clarity)', 'wa saw', 'prism', 'program management',
                       'regulatory compliance', 'data governance', 'community engagement'],
  'social services':  ['hmis (clarity)', 'wa saw', 'prism', 'community engagement',
                       'program management', 'grant writing', 'impact assessment',
                       'equity & access', 'workforce development'],

  // ── Nonprofit / community cluster ─────────────────────────────────────────
  nonprofit:          ['salesforce npsp', 'volunteerhub', 'mailchimp', 'donor relations',
                       'fundraising', 'grant writing', 'grant procurement',
                       'community engagement', 'public outreach', 'impact assessment',
                       'program evaluation'],
  community:          ['community engagement', 'public outreach', 'partnership development',
                       'stakeholder engagement', 'equity & access', 'workforce development',
                       'capacity building', 'nonprofit', 'grant writing'],
  outreach:           ['public outreach', 'community engagement', 'mailchimp', 'cvent',
                       'eventbrite', 'salesforce', 'marketing automation',
                       'communication', 'partnership development'],

  // ── Leadership / management / governance cluster ──────────────────────────
  // "leadership" intentionally touches government/institutional contexts
  leadership:         ['leadership', 'team management', 'mentorship', 'stakeholder engagement',
                       'organizational development', 'capacity building', 'workforce development',
                       'change management', 'executive communication', 'strategic planning',
                       'cross-functional collaboration', 'partnership development',
                       'program management', 'budget management', 'governance',
                       'decision making', 'community engagement'],
  governance:         ['leadership', 'organizational development', 'stakeholder engagement',
                       'strategic planning', 'regulatory compliance', 'compliance auditing',
                       'program management', 'nist/rmf frameworks', 'data governance',
                       'budget management'],
  management:         ['team management', 'program management', 'budget management',
                       'financial oversight', 'vendor management', 'change management',
                       'stakeholder engagement', 'organizational development',
                       'cross-functional collaboration', 'process reengineering'],
  executive:          ['executive communication', 'strategic planning', 'leadership',
                       'stakeholder engagement', 'organizational development',
                       'budget management', 'decision making', 'presentation skills'],
  director:           ['leadership', 'executive communication', 'strategic planning',
                       'program management', 'budget management', 'stakeholder engagement',
                       'organizational development', 'team management'],
  president:          ['leadership', 'stakeholder engagement', 'organizational development',
                       'strategic planning', 'budget management', 'governance',
                       'community engagement', 'public outreach'],

  // ── Communication / presentation cluster ──────────────────────────────────
  communication:      ['communication', 'presentation skills', 'technical writing',
                       'public outreach', 'executive communication', 'negotiation',
                       'relationship building', 'networking', 'grant writing',
                       'data storytelling'],
  presentation:       ['presentation skills', 'executive communication', 'data storytelling',
                       'technical writing', 'communication', 'canva', 'figma',
                       'adobe creative suite'],
  writing:            ['technical writing', 'grant writing', 'public outreach',
                       'data storytelling', 'communication', 'mailchimp', 'wordpress'],
  storytelling:       ['data storytelling', 'presentation skills', 'technical writing',
                       'tableau', 'power bi', 'canva', 'communication'],

  // ── Stakeholder / client / relationship cluster ───────────────────────────
  stakeholder:        ['stakeholder engagement', 'partnership development',
                       'relationship building', 'executive communication',
                       'client relations', 'community engagement', 'negotiation',
                       'cross-functional collaboration'],
  'client relations': ['client relations', 'account management', 'customer service',
                       'gainsight', 'zendesk', 'salesforce', 'hubspot',
                       'relationship building', 'conflict resolution'],
  'customer service': ['customer service', 'client relations', 'account management',
                       'gainsight', 'zendesk', 'hubspot', 'conflict resolution',
                       'emotional intelligence', 'onboarding', 'relationship building'],
  partnership:        ['partnership development', 'stakeholder engagement',
                       'relationship building', 'community engagement',
                       'cross-functional collaboration', 'negotiation', 'networking'],

  // ── Soft skills / interpersonal cluster ───────────────────────────────────
  'critical thinking': ['critical thinking', 'problem solving', 'decision making',
                         'root cause analysis', 'impact assessment', 'program evaluation',
                         'competitive intelligence', 'statistical modeling'],
  'problem solving':  ['problem solving', 'critical thinking', 'root cause analysis',
                       'decision making', 'process reengineering', 'anomaly detection',
                       'change management'],
  'strategic planning': ['strategic planning', 'program management', 'organizational development',
                          'capacity building', 'competitive intelligence', 'impact assessment',
                          'decision making', 'leadership'],
  collaboration:      ['cross-functional collaboration', 'partnership development',
                       'community engagement', 'stakeholder engagement', 'team management',
                       'mentorship', 'conflict resolution'],
  diversity:          ['diversity & inclusion', 'equity & access', 'cultural competency',
                       'emotional intelligence', 'community engagement', 'public outreach'],
  inclusion:          ['diversity & inclusion', 'equity & access', 'cultural competency',
                       'community engagement', 'workforce development'],
  dei:                ['diversity & inclusion', 'equity & access', 'cultural competency',
                       'emotional intelligence', 'community engagement'],
  equity:             ['equity & access', 'diversity & inclusion', 'community engagement',
                       'public outreach', 'nih ethics', 'irb research',
                       'workforce development', 'capacity building'],
  intercultural:      ['cultural competency', 'diversity & inclusion', 'equity & access',
                       'community engagement', 'emotional intelligence'],
  mentorship:         ['mentorship', 'leadership', 'workforce development',
                       'capacity building', 'community engagement', 'team management'],
  'workforce development': ['workforce development', 'capacity building',
                             'organizational development', 'community engagement',
                             'change management', 'mentorship', 'program management'],
  adaptability:       ['adaptability', 'resilience', 'change management', 'agile/scrum',
                       'cross-functional collaboration'],
  resilience:         ['resilience', 'adaptability', 'change management', 'critical thinking'],
  'emotional intelligence': ['emotional intelligence', 'conflict resolution',
                              'cultural competency', 'communication', 'adaptability'],
  interpersonal:      ['communication', 'emotional intelligence', 'conflict resolution',
                       'cultural competency', 'relationship building', 'mentorship'],
  negotiation:        ['negotiation', 'conflict resolution', 'stakeholder engagement',
                       'vendor management', 'partnership development', 'executive communication'],
  networking:         ['networking', 'relationship building', 'partnership development',
                       'community engagement', 'fundraising', 'public outreach'],

  // ── Budget / finance / operations cluster ─────────────────────────────────
  budget:             ['budget management', 'financial oversight', 'grant procurement',
                       'program management', 'financial modeling', 'vendor management',
                       'excel (advanced/vba)', 'quantitative analytics'],
  finance:            ['budget management', 'financial oversight', 'financial modeling',
                       'quantitative analytics', 'excel (advanced/vba)', 'grant procurement'],
  operations:         ['process reengineering', 'change management', 'program management',
                       'vendor management', 'etl/elt', 'automation', 'uipath (rpa)',
                       'inventory management', 'supply chain', 'agile/scrum'],
  'supply chain':     ['inventory management', 'operations', 'vendor management',
                       'logistics', 'process reengineering'],
  inventory:          ['inventory management', 'supply chain', 'operations', 'logistics'],
  logistics:          ['supply chain', 'inventory management', 'operations',
                       'vendor management', 'process reengineering'],

  // ── Events / engagement cluster ───────────────────────────────────────────
  events:             ['cvent', 'eventbrite', 'partiful', 'mailchimp', 'salesforce',
                       'community engagement', 'public outreach', 'partnership development',
                       'asana', 'monday.com'],
  marketing:          ['mailchimp', 'google analytics', 'salesforce', 'hubspot',
                       'canva', 'adobe creative suite', 'public outreach',
                       'community engagement'],

  // ── Time management / prioritization cluster ──────────────────────────────
  'time management':  ['time management', 'prioritization', 'agile/scrum',
                       'process reengineering', 'microsoft project', 'asana'],

  // ── Language / multilingual cluster ───────────────────────────────────────
  language:           ['english', 'french', 'hindi', 'akan-twi', 'ladakhi',
                       'cultural competency'],
  multilingual:       ['english', 'french', 'hindi', 'akan-twi', 'ladakhi',
                       'cultural competency', 'diversity & inclusion',
                       'community engagement'],
};

const FILTER_OPTIONS = [
  { value: 'main',    label: 'Main — Full Resume',        color: PINK },
  { value: 'data',    label: 'Data Scientist + Analyst',  color: '#004FA8' },
  { value: 'program', label: 'Program Manager',           color: '#076607' },
  { value: 'tech',    label: 'Technology',                color: VIOLET },
];

// Maps project tech strings → resume filter tags for project filtering
const PROJECT_TECH_TAG_MAP = {
  python: ['data', 'tech'], pandas: ['data'], numpy: ['data'], seaborn: ['data'],
  statistics: ['data'], 'scikit-learn': ['data', 'tech', 'ai'],
  ml: ['data', 'tech', 'ai'], 'model tuning': ['data', 'tech'],
  jupyter: ['data', 'tech'], ai: ['data', 'tech', 'ai'], svd: ['data', 'ai'],
  'deep learning': ['data', 'ai', 'tech'], nlp: ['data', 'ai', 'tech'],
  azure: ['data', 'tech'], sql: ['data', 'tech'], nosql: ['data', 'tech'],
  'blob storage': ['tech', 'data'], etl: ['data', 'tech'],
  react: ['tech'], vite: ['tech'], javascript: ['tech'],
};

function getProjectTags(project) {
  const tags = new Set(['tech']);
  project.tech.forEach(t => {
    const mapped = PROJECT_TECH_TAG_MAP[t.toLowerCase()];
    if (mapped) mapped.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

// Semantic graph search — one degree of association.
//
// Algorithm:
//  1. Skill item match: any item whose label contains the query (or vice-versa
//     for longer queries) gets added directly.
//  2. Key match: if the query matches or closely contains any relation key,
//     expand that entire cluster. Uses substring matching so "lead" hits
//     "leadership", "manage" hits "management", etc.
//  3. Value match: if the query appears as a value in any cluster, pull the
//     whole cluster so the query's synonyms/neighbors surface.
//  4. The raw query string is always included so prose text still highlights.
//
// The "no absurd bleed" guard: we only do value-match expansion for values
// with length ≥ 5, preventing single-letter or trivially short tokens from
// opening huge unrelated clusters.
function relationalSearch(query) {
  if (!query.trim()) return null;
  const q = query.toLowerCase().trim();
  const matched = new Set();

  // 1. Direct skill item match (item label contains query substring, or query
  //    is long enough to fully contain a short item label)
  SKILL_GROUPS.forEach(g =>
    g.items.forEach(item => {
      const it = item.toLowerCase();
      if (it.includes(q) || (q.length >= 5 && q.includes(it))) matched.add(it);
    })
  );

  // 2. Key match — substring so "lead" expands "leadership", "data" expands
  //    "data science", "data analysis", "data engineering" etc.
  Object.entries(SKILL_RELATIONS).forEach(([key, vals]) => {
    if (key.includes(q) || q.includes(key)) {
      vals.forEach(v => matched.add(v));
      matched.add(key);
    }
  });

  // 3. Value match — if the query matches a value, pull that cluster.
  //    Guard: value must be ≥ 5 chars to avoid 'sql' accidentally opening
  //    completely unrelated clusters via a 3-letter coincidence.
  Object.entries(SKILL_RELATIONS).forEach(([key, vals]) => {
    vals.forEach(v => {
      if (v.length >= 5 && (v.includes(q) || (q.length >= 5 && q.includes(v)))) {
        vals.forEach(vv => matched.add(vv));
        matched.add(key);
        matched.add(v);
      }
    });
  });

  // 4. Always include the raw query for prose text highlighting
  matched.add(q);
  return matched;
}

// Phrase-context highlight: highlights the matched term AND the words around it
function highlightText(text, matchSet) {
  if (!matchSet || matchSet.size === 0) return text;
  const terms = Array.from(matchSet).filter(t => t.length > 1);
  if (!terms.length) return text;

  const escapedTerms = terms
    .sort((a, b) => b.length - a.length)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const termPattern = escapedTerms.join('|');

  // Match up to 4 surrounding words + the term itself as a phrase
  const phraseRegex = new RegExp(
    `((?:\\S+\\s+){0,3}(?:${termPattern})(?:\\s+\\S+){0,3})`,
    'gi'
  );
  const innerTermRegex = new RegExp(`(${termPattern})`, 'gi');

  const parts = text.split(phraseRegex);
  let keyIdx = 0;
  return parts.map(part => {
    if (!part) return null;
    if (innerTermRegex.test(part)) {
      innerTermRegex.lastIndex = 0;
      const inner = part.split(new RegExp(`(${termPattern})`, 'gi'));
      return (
        <mark
          key={keyIdx++}
          style={{
            background: `${PINK}14`,
            color: 'inherit',
            borderRadius: 4,
            padding: '1px 3px',
            borderBottom: `2px solid ${PINK}44`,
            fontWeight: 'inherit',
          }}
        >
          {inner.map((sub, si) =>
            new RegExp(`^(${termPattern})$`, 'i').test(sub)
              ? <span key={si} style={{ color: PINK, fontWeight: 700 }}>{sub}</span>
              : sub
          )}
        </mark>
      );
    }
    return part;
  }).filter(Boolean);
}

function textMatchesSet(text, matchSet) {
  if (!matchSet) return true;
  const blob = text.toLowerCase();
  return Array.from(matchSet).some(t => t.length > 1 && blob.includes(t));
}

function expMatchesSearch(exp, matchSet) {
  return textMatchesSet([exp.role, exp.org, exp.location, ...exp.bullets].join(' '), matchSet);
}
function certMatchesSearch(c, matchSet) {
  return textMatchesSet([c.title, c.issuer, c.date].join(' '), matchSet);
}
function eduMatchesSearch(e, matchSet) {
  const expandText = e.expandDetails ? e.expandDetails.join(' ') : '';
  return textMatchesSet([e.school, e.degree, e.note, expandText].join(' '), matchSet);
}
function awardMatchesSearch(a, matchSet) {
  return textMatchesSet([a.title, a.org, a.desc || '', a.isVolunteer ? 'volunteer' : ''].join(' '), matchSet);
}
function pubMatchesSearch(p, matchSet) {
  return textMatchesSet([p.title, p.venue, p.desc, p.type].join(' '), matchSet);
}
function projectMatchesSearch(p, matchSet) {
  return textMatchesSet([p.title, p.desc, ...p.tech].join(' '), matchSet);
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════════════

const cardBase = {
  borderRadius: '1rem',
  border: `2px solid ${BORDER}`,
  background: 'rgba(255,255,255,0.93)',
  backdropFilter: 'blur(16px)',
  padding: 'clamp(0.9rem, 3vw, 1.45rem)',
  boxShadow: '0 4px 24px rgba(184,0,78,0.07), 0 1px 4px rgba(0,0,0,0.04)',
  transition: 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease',
};
const sHead  = { display: 'flex', alignItems: 'center', gap: 9, marginBottom: '1.1rem' };
const sTitle = {
  fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase', letterSpacing: '0.28em',
  color: PINK, margin: 0, fontWeight: 800,
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SectionCard({ children, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...cardBase, ...style,
        ...(hov ? {
          boxShadow: '0 14px 52px rgba(184,0,78,0.16), 0 3px 10px rgba(0,0,0,0.07)',
          borderColor: 'rgba(184,0,78,0.42)',
          transform: 'translateY(-2px)',
        } : {}),
      }}
    >
      {children}
    </div>
  );
}

// #1 — toggle: clicking active pill clears search
function SkillPill({ item, active, onClick, onClear }) {
  const [hov, setHov] = useState(false);
  const on = active || hov;
  return (
    <span
      onClick={() => active ? onClear() : onClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={active ? `Clear "${item}"` : `Search "${item}"`}
      style={{
        fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace',
        padding: '4px 10px', borderRadius: 5,
        border: on ? `1.5px solid ${PINK}` : `1.5px solid rgba(184,0,78,0.22)`,
        color: on ? '#fff' : MUTED,
        background: on ? PINK : hov ? 'rgba(184,0,78,0.09)' : 'rgba(184,0,78,0.04)',
        transition: 'all 0.15s', fontWeight: on ? 700 : 500,
        cursor: 'pointer', userSelect: 'none',
        transform: hov ? 'scale(1.07)' : 'scale(1)', display: 'inline-block',
      }}
    >
      {item}{active ? ' ×' : ''}
    </span>
  );
}

function ExpCard({ exp, isHighlighted, matchSet }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '0.7rem 0.8rem 0.7rem 1.05rem',
        borderLeft: `3px solid ${isHighlighted || hov ? PINK : 'rgba(184,0,78,0.2)'}`,
        borderRadius: '0 10px 10px 0',
        background: hov ? 'rgba(184,0,78,0.055)' : 'transparent',
        transform: hov ? 'scale(1.013) translateX(3px)' : 'scale(1)',
        transition: 'all 0.2s ease', cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 5 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 'clamp(0.82rem, 2.5vw, 0.97rem)', fontWeight: 800, color: isHighlighted ? DEEP : MID, lineHeight: 1.3 }}>
            {highlightText(exp.role, matchSet)}
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', color: isHighlighted ? PINK : SOFT, fontWeight: 700 }}>
            {highlightText(exp.org, matchSet)} · {exp.location}
          </p>
        </div>
        <span style={{
          fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace',
          color: MID, fontWeight: 800, whiteSpace: 'nowrap', alignSelf: 'flex-start',
          background: 'rgba(184,0,78,0.08)', padding: '3px 9px', borderRadius: 5,
        }}>
          {exp.period}
        </span>
      </div>
      <ul style={{ margin: '6px 0 0', paddingLeft: '1.15rem' }}>
        {exp.bullets.map((b, j) => (
          <li key={j} style={{ fontSize: 'clamp(0.74rem, 2vw, 0.84rem)', color: hov ? MID : MUTED, lineHeight: 1.78, marginBottom: 3 }}>
            {highlightText(b, matchSet)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertCard({ cert, matchSet }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '0.85rem 1.05rem', borderRadius: 10,
        border: `2px solid ${hov ? PINK : BORDER}`,
        background: hov ? 'rgba(184,0,78,0.06)' : 'rgba(255,255,255,0.82)',
        transform: hov ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.2s',
        boxShadow: hov ? '0 6px 24px rgba(184,0,78,0.14)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, color: DEEP, lineHeight: 1.4, flex: 1 }}>
          {highlightText(cert.title, matchSet)}
        </p>
        {cert.link && cert.link !== '#' && (
          <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
            <ExternalLink style={{ width: 13, height: 13, color: PINK, opacity: 0.8 }} />
          </a>
        )}
      </div>
      <p style={{ margin: '5px 0 0', fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 700 }}>
        {cert.issuer} · <span style={{ color: PINK, fontWeight: 800 }}>{cert.date}</span>
      </p>
    </div>
  );
}

// Individual edu entry — Goucher has expand details, secondary schools are plain
function EduCard({ edu, matchSet }) {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        paddingLeft: '1.05rem', paddingTop: '0.55rem', paddingBottom: '0.55rem',
        borderLeft: `3px solid ${hov ? PINK : BORDER}`,
        borderRadius: '0 10px 10px 0',
        background: hov ? 'rgba(184,0,78,0.05)' : 'transparent',
        transform: hov ? 'scale(1.01) translateX(3px)' : 'scale(1)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: DEEP }}>
            {highlightText(edu.degree, matchSet)}
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', color: PINK, fontWeight: 700 }}>
            {highlightText(edu.school, matchSet)}
          </p>
        </div>
        <span style={{
          fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace',
          color: MID, fontWeight: 800,
          background: 'rgba(184,0,78,0.08)', padding: '3px 9px', borderRadius: 5,
        }}>
          {edu.period}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.82rem', color: MUTED, lineHeight: 1.72 }}>
        {highlightText(edu.note, matchSet)}
      </p>
      {edu.expandable && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              marginTop: '0.6rem', padding: '4px 11px', borderRadius: 999,
              fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${PINK}55`,
              background: expanded ? `${PINK}12` : 'transparent',
              color: PINK, transition: 'all 0.18s',
            }}
          >
            {expanded
              ? <><ChevronUp style={{ width: 12, height: 12 }} /> Show less</>
              : <><ChevronDown style={{ width: 12, height: 12 }} /> Show more details</>}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}
              >
                <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem' }}>
                  {edu.expandDetails.map((d, i) => (
                    <li key={i} style={{ fontSize: '0.82rem', color: MUTED, lineHeight: 1.75, marginBottom: 3 }}>
                      {highlightText(d, matchSet)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// #3 — Education section: primary schools visible, secondary hidden behind toggle
function EducationSection({ visibleEdu, matched }) {
  const [showSecondary, setShowSecondary] = useState(false);
  const primary   = visibleEdu.filter(e => !e.secondary);
  const secondary = visibleEdu.filter(e => e.secondary);
  if (primary.length === 0) return null;
  return (
    <SectionCard>
      <div style={sHead}>
        <GraduationCap style={{ width: 15, height: 15, color: PINK }} />
        <h3 style={sTitle}>Education</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {primary.map((edu, i) => <EduCard key={i} edu={edu} matchSet={matched} />)}
        {secondary.length > 0 && (
          <>
            <button
              onClick={() => setShowSecondary(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                padding: '5px 13px', borderRadius: 999,
                fontSize: '0.71rem', fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700, cursor: 'pointer',
                border: `1.5px solid rgba(184,0,78,0.3)`,
                background: showSecondary ? 'rgba(184,0,78,0.07)' : 'transparent',
                color: SOFT, transition: 'all 0.18s',
              }}
            >
              {showSecondary
                ? <><ChevronUp style={{ width: 11, height: 11 }} /> Hide earlier education</>
                : <><ChevronDown style={{ width: 11, height: 11 }} /> Earlier education ({secondary.length})</>}
            </button>
            <AnimatePresence>
              {showSecondary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
                >
                  {secondary.map((edu, i) => <EduCard key={i} edu={edu} matchSet={matched} />)}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </SectionCard>
  );
}

function AwardCard({ a, matchSet }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '0.85rem 1.05rem', borderRadius: 10,
        border: `2px solid ${hov ? PINK : BORDER}`,
        background: hov ? 'rgba(184,0,78,0.06)' : 'rgba(255,255,255,0.82)',
        transform: hov ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.2s',
        boxShadow: hov ? '0 6px 24px rgba(184,0,78,0.14)' : 'none',
        position: 'relative',
      }}
    >
      {a.isVolunteer && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          padding: '2px 7px', borderRadius: 4,
          border: `1.5px solid ${VIOLET}55`, color: VIOLET, background: `${VIOLET}0D`, fontWeight: 700,
        }}>
          Volunteer
        </span>
      )}
      <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: DEEP, paddingRight: a.isVolunteer ? '4.5rem' : 0 }}>
        {highlightText(a.title, matchSet)}
      </p>
      <p style={{ margin: '4px 0 6px', fontSize: '0.73rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
        <span style={{ color: PINK }}>{a.org}</span>
        {a.period && <span style={{ color: MID, fontWeight: 800 }}> · {a.period}</span>}
      </p>
      <p style={{ margin: 0, fontSize: '0.81rem', color: MUTED, lineHeight: 1.68 }}>
        {highlightText(a.desc, matchSet)}
      </p>
    </div>
  );
}

function PubCard({ pub, matchSet }) {
  const [hov, setHov] = useState(false);
  const typeColor = pub.type === 'grant' ? '#076607' : pub.type === 'policy' ? VIOLET : PINK;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        paddingLeft: '1.05rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', paddingRight: '0.6rem',
        borderLeft: `3px solid ${hov ? typeColor : BORDER}`,
        borderRadius: '0 10px 10px 0',
        background: hov ? `${typeColor}0D` : 'transparent',
        transform: hov ? 'scale(1.01) translateX(3px)' : 'scale(1)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: DEEP, lineHeight: 1.4 }}>
            {highlightText(pub.title, matchSet)}
          </h4>
          <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 600 }}>
            {pub.venue}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <span style={{
            fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: MID, fontWeight: 800,
            background: 'rgba(184,0,78,0.08)', padding: '3px 9px', borderRadius: 5,
          }}>
            {pub.period}
          </span>
          <span style={{
            fontSize: '0.61rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
            letterSpacing: '0.15em', padding: '2px 8px', borderRadius: 4,
            border: `1.5px solid ${typeColor}77`, color: typeColor, background: `${typeColor}12`, fontWeight: 700,
          }}>
            {pub.type}
          </span>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '0.82rem', color: MUTED, lineHeight: 1.72 }}>
        {highlightText(pub.desc, matchSet)}
      </p>
    </div>
  );
}

// #9 — Compact project card for the resume tab
function ProjectCard({ project, matchSet }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '0.85rem 1.05rem', borderRadius: 10,
        border: `2px solid ${hov ? PINK : BORDER}`,
        background: hov ? 'rgba(184,0,78,0.05)' : 'rgba(255,255,255,0.82)',
        transform: hov ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s',
        boxShadow: hov ? '0 6px 24px rgba(184,0,78,0.12)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Code style={{ width: 13, height: 13, color: PINK, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: DEEP, lineHeight: 1.3 }}>
            {highlightText(project.title, matchSet)}
          </p>
        </div>
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
            <ExternalLink style={{ width: 13, height: 13, color: PINK, opacity: 0.7 }} />
          </a>
        )}
      </div>
      <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: MUTED, lineHeight: 1.68 }}>
        {highlightText(project.desc, matchSet)}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {project.tech.map(t => (
          <span key={t} style={{
            fontSize: '0.63rem', fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            padding: '3px 8px', borderRadius: 4,
            border: `1.5px solid rgba(184,0,78,0.22)`,
            color: SOFT, background: 'rgba(184,0,78,0.05)', fontWeight: 600,
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TECH STACK GROUPS — show first 3 groups, collapse rest behind "Show more"
// Auto-expands when: a filter is active, or a search is active
// ═══════════════════════════════════════════════════════════════════════════

// How many groups are visible by default (uncollapsed)
const SKILL_GROUPS_DEFAULT_VISIBLE = 3;

function TechStackGroups({ matched, filter, activeSkillItems, activeSearchTerm, handleSkillClick, handleSkillClear }) {
  // Auto-expand when filter or search is active so relevant skills are always shown
  const shouldAutoExpand = filter !== 'main' || (matched !== null);
  const [expanded, setExpanded] = useState(false);
  const showAll = expanded || shouldAutoExpand;

  // Build renderable groups: filter items when searching
  const renderGroups = SKILL_GROUPS.map(group => {
    const groupHighlighted = filter !== 'main' && group.tags.includes(filter);
    const items = matched
      ? group.items.filter(item => matched.has(item.toLowerCase()))
      : group.items;
    return { group, groupHighlighted, items };
  }).filter(({ items }) => !(matched && items.length === 0));

  const visibleGroups = showAll ? renderGroups : renderGroups.slice(0, SKILL_GROUPS_DEFAULT_VISIBLE);
  const hiddenCount = renderGroups.length - SKILL_GROUPS_DEFAULT_VISIBLE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {visibleGroups.map(({ group, groupHighlighted, items }) => (
        <div key={group.label}>
          <p style={{
            margin: '0 0 7px', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.13em',
            color: groupHighlighted ? VIOLET : 'rgba(74,16,64,0.55)',
            fontWeight: groupHighlighted ? 800 : 600,
          }}>
            {group.label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {items.map(item => {
              const isActive =
                activeSkillItems.has(item.toLowerCase()) ||
                item.toLowerCase() === activeSearchTerm ||
                (groupHighlighted && filter !== 'main');
              return (
                <SkillPill
                  key={item} item={item} active={isActive}
                  onClick={handleSkillClick} onClear={handleSkillClear}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Show more / less button — only rendered in default (non-filtered, non-searched) state */}
      {!shouldAutoExpand && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: '0.3rem', padding: '6px 14px', borderRadius: 999, width: '100%',
            fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase',
            border: `1px dashed rgba(184,0,78,0.3)`,
            background: expanded ? 'rgba(184,0,78,0.05)' : 'transparent',
            color: SOFT, transition: 'all 0.18s',
          }}
        >
          {expanded
            ? <><ChevronUp style={{ width: 12, height: 12 }} /> Show less</>
            : <><ChevronDown style={{ width: 12, height: 12 }} /> Show {hiddenCount} more skill groups</>
          }
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ResumeSection() {
  const [filter, setFilter] = useState('main');
  const [search, setSearch] = useState('');
  const [dlOpen, setDlOpen] = useState(false);
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [autoParseLoading, setAutoParseLoading] = useState(false);

  const filterDef = FILTER_OPTIONS.find(f => f.value === filter);
  const matched   = useMemo(() => relationalSearch(search), [search]);

  const handleFilterChange = useCallback((val) => {
    setFilter(val);
    emitFilterSignal({ filter: val, search });
  }, [search]);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    emitFilterSignal({ filter, search: val });
  }, [filter]);

  const handleSkillClick  = useCallback((item) => { setSearch(item); emitFilterSignal({ filter, search: item }); }, [filter]);
  const handleSkillClear  = useCallback(()      => { setSearch('');   emitFilterSignal({ filter, search: '' });  }, [filter]);

  useEffect(() => {
    if (!dlOpen) return;
    const close = () => setDlOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dlOpen]);

  // ── Filtered lists — #8: every section respects both filter tag AND search ──

  const visibleExp = useMemo(() => {
    let list = filter === 'main' ? ALL_EXPERIENCE : ALL_EXPERIENCE.filter(e => e.tags.includes(filter));
    if (matched) list = list.filter(e => expMatchesSearch(e, matched));
    return list;
  }, [filter, matched]);

  const visibleCerts = useMemo(() => {
    let list = filter === 'main' ? CERTS : CERTS.filter(c => c.tags.includes(filter));
    if (matched) list = list.filter(c => certMatchesSearch(c, matched));
    return list;
  }, [filter, matched]);

  const visibleEdu = useMemo(() => {
    let list = filter === 'main'
      ? EDUCATION
      : EDUCATION.filter(e => e.secondary || e.tags.includes(filter) || e.tags.length === 0);
    if (matched) list = list.filter(e => eduMatchesSearch(e, matched));
    return list;
  }, [filter, matched]);

  const visibleAwards = useMemo(() => {
    let list = filter === 'main'
      ? AWARDS_VOLUNTEER
      : AWARDS_VOLUNTEER.filter(a => a.tags.includes(filter) || a.tags.length === 0);
    if (matched) list = list.filter(a => awardMatchesSearch(a, matched));
    return list;
  }, [filter, matched]);

  const visiblePubs = useMemo(() => {
    let list = filter === 'main' ? PUBLICATIONS : PUBLICATIONS.filter(p => p.tags.includes(filter));
    if (matched) list = list.filter(p => pubMatchesSearch(p, matched));
    return list;
  }, [filter, matched]);

  const visibleLangs = useMemo(() => {
    if (!matched) return LANGUAGES;
    return LANGUAGES.filter(l => textMatchesSet([l.lang, l.level].join(' '), matched));
  }, [matched]);

  // #9 — projects: only real entries (coming-soon titles excluded at source since
  // PROJECTS in ProjectsSection only holds real items; COMING_SOON is separate).
  const visibleProjects = useMemo(() => {
    let list = (ALL_PROJECTS || []);
    if (filter !== 'main') list = list.filter(p => getProjectTags(p).includes(filter));
    if (matched) list = list.filter(p => projectMatchesSearch(p, matched));
    return list;
  }, [filter, matched]);

  const activeSkillItems = useMemo(() => {
    if (!matched) return new Set();
    const s = new Set();
    SKILL_GROUPS.forEach(g => g.items.forEach(item => {
      if (matched.has(item.toLowerCase())) s.add(item.toLowerCase());
    }));
    return s;
  }, [matched]);

  const activeSearchTerm = search.trim().toLowerCase();

  const hasResults =
    visibleExp.length + visibleCerts.length +
    visibleEdu.filter(e => !e.secondary).length +
    visibleAwards.length + visiblePubs.length + visibleProjects.length > 0;

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .rs-outer {
            /* 1040px * 1.30 ≈ 1352px — centred, 30% wider */
            max-width: min(1352px, calc(100vw - 2rem));
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
      <div className="rs-outer" style={{ display: 'flex', flexDirection: 'column', gap: '1.45rem' }}>

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              style={{
                padding: '7px 16px', borderRadius: 999, fontSize: '0.77rem', fontWeight: 800,
                cursor: 'pointer', border: `2px solid ${opt.color}`,
                background: filter === opt.value ? opt.color : 'rgba(255,255,255,0.88)',
                color: filter === opt.value ? '#fff' : opt.color,
                transition: 'all 0.18s', letterSpacing: '0.02em',
                boxShadow: filter === opt.value ? `0 3px 14px ${opt.color}55` : 'none',
              }}
            >
              {opt.label.split(' — ')[0]}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setDlOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px',
              borderRadius: 999, fontSize: '0.77rem', fontWeight: 800, cursor: 'pointer',
              border: `2px solid ${BORDER}`, background: 'rgba(255,255,255,0.92)',
              color: PINK, transition: 'all 0.18s',
            }}
          >
            Download Resume <ChevronDown style={{ width: 13, height: 13 }} />
          </button>
          <AnimatePresence>
            {dlOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: '#fff', border: `2px solid ${BORDER}`,
                  borderRadius: 12, padding: '6px', zIndex: 9999,
                  boxShadow: '0 12px 48px rgba(184,0,78,0.2)', minWidth: 215,
                }}
              >
                {DOWNLOAD_LINKS.map(d => (
                  <a
                    key={d.label} href={d.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', padding: '9px 14px', borderRadius: 8, fontSize: '0.82rem', color: DEEP, textDecoration: 'none', fontWeight: 600, transition: 'background 0.14s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,0,78,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {d.label}
                  </a>
                ))}
                {/* Divider */}
                <div style={{ height: 1, background: BORDER, margin: '4px 6px' }} />
                {/* Auto-parse: generates ATS PDF from current filter view */}
                <button
                  onClick={async () => {
                    if (autoParseLoading) return;
                    setAutoParseLoading(true);
                    setDlOpen(false);
                    try {
                      await generateAutoParseResume(filter, visibleExp);
                    } finally {
                      setAutoParseLoading(false);
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '9px 14px', borderRadius: 8, fontSize: '0.82rem',
                    color: autoParseLoading ? MUTED : PINK,
                    background: 'rgba(184,0,78,0.04)', border: 'none',
                    fontWeight: 800, cursor: autoParseLoading ? 'wait' : 'pointer',
                    transition: 'background 0.14s', fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!autoParseLoading) e.currentTarget.style.background = 'rgba(184,0,78,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,0,78,0.04)'; }}
                >
                  <Zap style={{ width: 13, height: 13 }} />
                  {autoParseLoading ? 'Generating…' : 'Auto-parse (current view)'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(184,0,78,0.55)' }} />
        <input
          type="text"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Search skills, tools, roles — e.g. 'leadership', 'DEI', 'SQL', 'grant'…"
          style={{
            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 999,
            border: `2px solid rgba(184,0,78,0.3)`, background: 'rgba(255,255,255,0.94)',
            fontSize: '0.9rem', color: DEEP, outline: 'none',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', fontWeight: 500,
          }}
        />
        {search && (
          <button
            onClick={() => handleSearchChange('')}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(184,0,78,0.5)', fontSize: '1.25rem', lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>

      {matched && (
        <p style={{ margin: '-0.65rem 0 0', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 700 }}>
          {hasResults
            ? `↳ ${visibleExp.length} roles · ${visibleCerts.length} certs · ${visiblePubs.length} pubs · ${visibleAwards.length} awards · ${visibleProjects.length} projects`
            : `No matches for "${search}" — try a broader term.`}
        </p>
      )}

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <SectionCard style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.25rem, 5vw, 2.2rem)', fontWeight: 900, color: DEEP, margin: '0 0 5px', letterSpacing: '-0.02em' }}>
          Lancelot Naipier-Kane
        </h2>
        <p style={{ margin: '0 0 6px', fontSize: 'clamp(0.7rem, 2.5vw, 0.83rem)', fontFamily: 'JetBrains Mono, monospace', color: PINK, fontWeight: 800 }}>
          Program & Data Manager · {filterDef?.label}
        </p>
        {/* Mobile-safe contact line: flex-wrap so each element breaks cleanly */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
          gap: '4px 8px', margin: '0 0 13px', fontSize: 'clamp(0.68rem, 2vw, 0.8rem)',
          color: SOFT, fontWeight: 600, lineHeight: 2,
        }}>
          <span>New York, NY</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>1-(707)-991-1031</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>lancelotsmnk@gmail.com</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <a href="https://linkedin.com/in/lancelotnk" target="_blank" rel="noopener noreferrer"
            style={{ color: PINK, textDecoration: 'none', fontWeight: 800 }}>
            linkedin.com/in/lancelotnk
          </a>
          <span style={{ opacity: 0.35 }}>·</span>
          <a href="https://lancelot-nk.github.io/" target="_blank" rel="noopener noreferrer"
            style={{ color: PINK, textDecoration: 'none', fontWeight: 800 }}>
            lancelot-nk.github.io
          </a>
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)', color: MUTED, lineHeight: 1.82, maxWidth: 730, marginLeft: 'auto', marginRight: 'auto', fontWeight: 500 }}>
          Data science and analytics professional with a strong foundation in AI, machine learning, and algorithm-driven problem solving, supporting analysis and decision-making on budgets up to $7.6B. Experienced using Python, R, and data structuring techniques to develop technical solutions and translate analysis into practical business outcomes. MIT and Microsoft certified with a focus on delivering data-backed results and scalable insights across public sector, tech, and nonprofit domains.
        </p>
      </SectionCard>

      {/* ── Technical Stack ──────────────────────────────────────────────── */}
      <SectionCard>
        <div style={sHead}>
          <Wrench style={{ width: 15, height: 15, color: PINK }} />
          <h3 style={sTitle}>Technical Stack</h3>
        </div>
        <p style={{ margin: '0 0 11px', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 600 }}>
          Click any skill to search · Click again to clear
        </p>
        <TechStackGroups
          matched={matched}
          filter={filter}
          activeSkillItems={activeSkillItems}
          activeSearchTerm={activeSearchTerm}
          handleSkillClick={handleSkillClick}
          handleSkillClear={handleSkillClear}
        />
      </SectionCard>

      {/* ── Technical Projects (moved above Education & Experience) ──────── */}
      {visibleProjects.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Code style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Technical Projects</h3>
          </div>
          <p style={{ margin: '-0.45rem 0 0.85rem', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 600 }}>
            Live projects — see Projects tab for full notebook previews
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.8rem' }}>
            {visibleProjects.map((p, i) => <ProjectCard key={i} project={p} matchSet={matched} />)}
          </div>
        </SectionCard>
      )}

      {/* ── Education ────────────────────────────────────────────────────── */}
      <EducationSection visibleEdu={visibleEdu} matched={matched} />

      {/* ── Certifications ───────────────────────────────────────────────── */}
      {visibleCerts.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Award style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Certifications</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.8rem' }}>
            {visibleCerts.map((cert, i) => <CertCard key={i} cert={cert} matchSet={matched} />)}
          </div>
        </SectionCard>
      )}

      {/* ── Work Experience ───────────────────────────────────────────────── */}
      {visibleExp.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Briefcase style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Work Experience</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {visibleExp.map((exp, i) => {
              const isHidden = filter === 'main' && !showAllExperience && i > 11 && !search;
              if (isHidden) return null;
              return (
                <ExpCard
                  key={i}
                  exp={exp}
                  isHighlighted={filter !== 'main' && exp.tags.includes(filter)}
                  matchSet={matched}
                />
              );
            })}
          </div>

          {filter === 'main' && visibleExp.length > 12 && !search && (
            <button
              onClick={() => setShowAllExperience(!showAllExperience)}
              style={{
                marginTop: '1.5rem', width: '100%', padding: '0.7rem',
                background: 'rgba(184,0,78,0.03)', border: `1px dashed ${BORDER}`,
                borderRadius: '8px', color: PINK, cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
                fontWeight: 800, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
              }}
            >
              {showAllExperience ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showAllExperience ? 'SHOW RECENT ONLY' : `SHOW ${visibleExp.length - 12} EARLIER ROLES`}
            </button>
          )}
        </SectionCard>
      )}

      {/* ── Publications, Research & Grants ──────────────────────────────── */}
      {visiblePubs.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <FileText style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Publications, Research & Grants</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {visiblePubs.map((pub, i) => <PubCard key={i} pub={pub} matchSet={matched} />)}
          </div>
        </SectionCard>
      )}

      {/* ── Awards, Leadership & Volunteer ───────────────────────────────── */}
      {visibleAwards.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Star style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Awards, Leadership & Volunteer</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '0.8rem' }}>
            {visibleAwards.map((a, i) => <AwardCard key={i} a={a} matchSet={matched} />)}
          </div>
        </SectionCard>
      )}

      {/* ── Languages ────────────────────────────────────────────────────── */}
      {visibleLangs.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Languages style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Languages</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {visibleLangs.map(l => (
              <div key={l.lang} style={{
                padding: '0.65rem 1.1rem', borderRadius: 10,
                border: `2px solid ${BORDER}`, background: 'rgba(255,255,255,0.75)',
              }}>
                <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: DEEP }}>{l.lang}</p>
                <p style={{ margin: 0, fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 600 }}>{l.level}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {matched && !hasResults && (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: SOFT, fontSize: '0.88rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
          No results for &quot;{search}&quot; — try a broader term or clear the search.
        </div>
      )}

    </div>
    </>
  );
}
