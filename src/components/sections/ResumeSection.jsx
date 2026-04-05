import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, GraduationCap, Award, Wrench, ExternalLink,
  Search, ChevronDown, BookOpen, Star, Users, FlaskConical,
  FileText, Globe
} from 'lucide-react';

// ── Brand Colors (darkened for legibility) ─────────────────────────────────
const PINK   = '#C0005E';   // was #E01880
const VIOLET = '#6A00C8';   // was #8B00E8
const DEEP   = '#1A0030';   // deep text
const MID    = '#4A0050';   // mid text
const SOFT   = '#7A1060';   // soft accent text
const BORDER = 'rgba(192,0,94,0.18)';

// ── Download placeholders (update hrefs to real files when ready) ──────────
const DOWNLOAD_LINKS = [
  { label: 'Main Resume',              href: '/src/assets/resume1.pdf' },
  { label: 'Data Scientist + Analyst', href: '/src/assets/resume2.pdf' },
  { label: 'Program Manager',          href: '/src/assets/resume3.pdf' },
  { label: 'Technology',               href: '/src/assets/resume4.pdf' },
];

// ── Cross-section signal tokens (for requirement #7) ──────────────────────
// These are emitted when filter/search fires, so sibling sections can react.
// Sibling sections should listen for window event 'resume-filter-change'.
function emitFilterSignal(payload) {
  window.dispatchEvent(new CustomEvent('resume-filter-change', { detail: payload }));
}

// ── Data ──────────────────────────────────────────────────────────────────

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
    role: 'Environmental Researcher, Oil Train Safety',
    org: 'Federal Railroad Administration',
    location: 'Washington, DC',
    period: '04/2021 – 07/2021',
    tags: ['program', 'data'],
    bullets: [
      'Completed research for the Hazardous Materials and Human Factors Division in accordance with regulatory principals and localized nuance, contributing to policy movements in urban transport.',
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
      'Leveraged technical experience and customer engagement techniques to increase lead generation and customer satisfaction by 30% each.',
      'Supported integration of AI-powered fleet telematics dashboards and DriveCam API systems for enterprise B2B clients.',
      'Tools: Salesforce CRM, Gainsight (CSM), Zendesk (Ticketing), HubSpot, Jira (Bug Tracking), Lytx DriveCam API, Oracle NetSuite (ERP).',
    ],
  },
  {
    role: 'Assistant Director',
    org: 'Solar Household Energy, Inc.',
    location: 'Washington, DC',
    period: '12/2019 – 07/2020',
    tags: ['program', 'data'],
    bullets: [
      'Visualized publications, donor outreach graphics, and grant-writing materials while utilizing social feedback cycles and economic analysis to assess program feasibility.',
      'Bolstered industry strength through R&D and multi-actor projects, resulting in clear upticks in donor engagement, decreased energy expenditure, and improved indoor air quality.',
      'Designed data-driven impact reports and communications for international NGO stakeholders using Salesforce donor management pipelines.',
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
      'Derived textual and budgetary analysis for DOEE grant applications to promote green workforce development and transformation of Kingman Island greenspace.',
      'Orchestrated a suite of wraparound programs and successfully designed a grant-funded meta-analysis for their integration and cross-participation, enhancing educational and workforce opportunities.',
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
      'Conceptualized the environmental impact of natural gas cremation technology and its confluence with local spiritual tradition through multi-system energy dynamics.',
      'Created and conducted an IRB-approved study and publication in accordance with NIH principles, resulting in broader regional support for Sankat Mochan Water Foundation.',
      'Tools: NVivo (Qualitative Analysis), Qualtrics, NIH Ethics Framework, Structured Interviews, SPSS, Zotero (Academic Publication Management).',
    ],
  },
  {
    role: 'Green Policy Intern & Green Fund Chair',
    org: 'Goucher College',
    location: 'Baltimore, MD',
    period: '2015 – 2019',
    tags: ['program'],
    bullets: [
      'Led campus sustainability initiatives as Green Fund Chair, allocating budget for campus environmental projects including renewable energy installations and waste-reduction programs.',
      'Served as Student Body President, Roosevelt Institute Treasurer, and intercollegiate swimmer.',
      'Coordinated policy research for green infrastructure proposals submitted to college administration.',
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
  },
  {
    school: 'Georgetown University',
    degree: 'Summer College — International Relations & Calculus',
    period: '2015',
    note: 'Advanced pre-college program with college-level coursework in international relations theory and applied mathematics.',
    tags: ['program'],
  },
  {
    school: 'Brunswick High School',
    degree: 'Standard Diploma',
    period: '2011–2015',
    note: 'Brunswick, ME. Member of swim team.',
    tags: [],
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
    title: 'NIH Research Ethics (Human Subjects)',
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
    desc: 'Elected student government president, representing the entire student body in institutional governance, policy advocacy, and budget oversight.',
    tags: ['program'],
  },
  {
    title: 'Roosevelt Institute Chapter — Treasurer',
    org: 'Goucher College',
    period: '2015–2019',
    desc: 'Managed chapter budgets and led economic policy discussions and student research publications as chapter treasurer.',
    tags: ['program', 'data'],
  },
  {
    title: 'Green Fund Chair',
    org: 'Goucher College',
    period: '2017–2019',
    desc: 'Chaired the campus green fund, evaluating proposals and allocating funding for campus sustainability and energy projects.',
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
    title: 'Kingman Island Volunteer Steward',
    org: 'Living Classrooms Foundation DC',
    period: '2019',
    desc: 'Volunteer environmental stewardship on Kingman Island, Anacostia River ecosystem restoration and community programming.',
    tags: ['program'],
  },
  {
    title: 'Federal Contractor — Independent Award',
    org: 'Federal Agencies (Multiple)',
    period: '2021–2022',
    desc: 'Awarded multiple independent federal contracts across asset, cyber, monetary, and domestic research and management domains.',
    tags: ['data', 'program', 'tech'],
  },
];

// Publications / Research / Grants
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
];

const SKILL_RELATIONS = {
  crm: ['salesforce', 'hubspot', 'gainsight', 'zendesk', 'dynamics', 'netsuite'],
  database: ['sql', 'nosql', 'cosmos db', 'bigquery', 'snowflake', 'dbt', 'mongodb', 'postgresql', 'mysql'],
  cloud: ['azure', 'aws', 'databricks', 'blob storage', 'data lake', 'gcp', 'synapse', 'data factory'],
  analytics: ['tableau', 'power bi', 'excel', 'seaborn', 'matplotlib', 'qlik', 'thoughtspot', 'google analytics'],
  ml: ['scikit-learn', 'tensorflow', 'keras', 'pytorch', 'machine learning', 'deep learning', 'neural networks'],
  'project management': ['jira', 'asana', 'monday.com', 'agile', 'scrum', 'microsoft project', 'zapier'],
  data: ['python', 'sql', 'pandas', 'numpy', 'tableau', 'power bi', 'dbt', 'spark', 'snowflake', 'bigquery'],
  ai: ['tensorflow', 'keras', 'pytorch', 'langchain', 'hugging face', 'openai', 'gpt', 'transformers', 'nlp', 'computer vision'],
  programming: ['python', 'r', 'java', 'javascript', 'html', 'css', 'sql', 't-sql', 'stata', 'matlab'],
  visualization: ['tableau', 'power bi', 'seaborn', 'matplotlib', 'qlik', 'thoughtspot', 'arcgis'],
  gis: ['arcgis', 'spatial analysis', 'nepa', 'geospatial'],
  automation: ['uipath', 'rpa', 'power automate', 'zapier', 'airflow', 'etl', 'elt'],
  grant: ['grant writing', 'grant procurement', 'doee', 'prism', 'e-grants', 'npsp'],
  policy: ['nepa', 'nist', 'rmf', 'nih', 'irb', 'regulatory', 'compliance'],
  federal: ['nist', 'rmf', 'fra', 'hra', 'nepa', 'federal', 'government'],
  nlp: ['nlp', 'natural language processing', 'transformers', 'langchain', 'hugging face', 'sentiment analysis'],
  security: ['nist', 'rmf', 'cybersecurity', 'data security', 'data privacy', 'certnexus'],
  snap: ['snap', 'ebt', 'hra', 'curam', 'wms', 'pos', 'welfare'],
  nonprofit: ['salesforce npsp', 'volunteerhub', 'mailchimp', 'donor management', 'grant'],
  etl: ['etl', 'elt', 'airflow', 'spark', 'dbt', 'data factory', 'ssis', 'pipeline'],
};

const FILTER_OPTIONS = [
  { value: 'main',    label: 'Main — Full Resume',        color: PINK },
  { value: 'data',    label: 'Data Scientist + Analyst',  color: '#005FAD' },
  { value: 'program', label: 'Program Manager',           color: '#0A6B0A' },
  { value: 'tech',    label: 'Technology',                color: VIOLET },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds a set of lowercase matched terms from a search query,
 * checking skills, relations, and free-text in bullets/titles.
 */
function relationalSearch(query) {
  if (!query.trim()) return null;
  const q = query.toLowerCase().trim();
  const matched = new Set();

  // Direct skill match
  SKILL_GROUPS.forEach(g =>
    g.items.forEach(item => {
      if (item.toLowerCase().includes(q) || q.includes(item.toLowerCase()))
        matched.add(item.toLowerCase());
    })
  );

  // Relational skill expansion
  Object.entries(SKILL_RELATIONS).forEach(([key, vals]) => {
    if (key.includes(q) || q.includes(key)) vals.forEach(v => matched.add(v));
    if (vals.some(v => v.includes(q) || q.includes(v))) {
      matched.add(q);
      vals.forEach(v => matched.add(v));
    }
  });

  // Always include the raw query so text matching works
  matched.add(q);
  return matched;
}

/**
 * Highlights occurrences of any term in `matchSet` within `text`.
 * Returns an array of React nodes.
 */
function highlightText(text, matchSet, baseColor = MID) {
  if (!matchSet || matchSet.size === 0) return text;
  const terms = Array.from(matchSet).filter(t => t.length > 1);
  if (terms.length === 0) return text;

  // Build regex alternation sorted longest-first for greediness
  const pattern = terms
    .sort((a, b) => b.length - a.length)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part)
      ? (
        <mark
          key={i}
          style={{
            background: `${PINK}28`,
            color: PINK,
            fontWeight: 700,
            borderRadius: 3,
            padding: '0 2px',
          }}
        >
          {part}
        </mark>
      )
      : part
  );
}

/**
 * Returns true if an experience entry matches the search query
 * (loosely — any term from matchSet found anywhere in text).
 */
function expMatchesSearch(exp, matchSet) {
  if (!matchSet) return true;
  const blob = [
    exp.role, exp.org, exp.location, exp.period,
    ...exp.bullets,
  ].join(' ').toLowerCase();
  return Array.from(matchSet).some(t => t.length > 1 && blob.includes(t));
}

function certMatchesSearch(cert, matchSet) {
  if (!matchSet) return true;
  const blob = [cert.title, cert.issuer, cert.date].join(' ').toLowerCase();
  return Array.from(matchSet).some(t => t.length > 1 && blob.includes(t));
}

function eduMatchesSearch(edu, matchSet) {
  if (!matchSet) return true;
  const blob = [edu.school, edu.degree, edu.note].join(' ').toLowerCase();
  return Array.from(matchSet).some(t => t.length > 1 && blob.includes(t));
}

function awardMatchesSearch(a, matchSet) {
  if (!matchSet) return true;
  const blob = [a.title, a.org, a.desc].join(' ').toLowerCase();
  return Array.from(matchSet).some(t => t.length > 1 && blob.includes(t));
}

function pubMatchesSearch(p, matchSet) {
  if (!matchSet) return true;
  const blob = [p.title, p.venue, p.desc, p.type].join(' ').toLowerCase();
  return Array.from(matchSet).some(t => t.length > 1 && blob.includes(t));
}

// ── Shared styles ─────────────────────────────────────────────────────────
const cardStyle = {
  borderRadius: '0.85rem',
  border: `1px solid ${BORDER}`,
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(12px)',
  padding: '1.2rem',
};

const sHead = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.9rem' };
const sTitle = {
  fontSize: '0.62rem',
  fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.3em',
  color: PINK,
  margin: 0,
  fontWeight: 700,
};

// ── Sub-components ─────────────────────────────────────────────────────────

function SkillPill({ item, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isOn = active || hovered;
  return (
    <span
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Search "${item}"`}
      style={{
        fontSize: '0.64rem',
        fontFamily: 'JetBrains Mono, monospace',
        padding: '3px 9px',
        borderRadius: 4,
        border: isOn ? `1px solid ${PINK}` : `1px solid rgba(192,0,94,0.2)`,
        color: isOn ? '#fff' : SOFT,
        background: isOn ? PINK : hovered ? 'rgba(192,0,94,0.1)' : 'rgba(192,0,94,0.04)',
        transition: 'all 0.18s',
        fontWeight: isOn ? 700 : 400,
        cursor: 'pointer',
        userSelect: 'none',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        display: 'inline-block',
      }}
    >
      {item}
    </span>
  );
}

function ExpCard({ exp, isHighlighted, matchSet }) {
  const [hovered, setHovered] = useState(false);
  const inverted = hovered;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        paddingLeft: '0.9rem',
        paddingRight: '0.6rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        borderLeft: `3px solid ${isHighlighted || hovered ? PINK : 'rgba(192,0,94,0.18)'}`,
        borderRadius: '0 8px 8px 0',
        background: inverted ? `${PINK}12` : 'transparent',
        transform: hovered ? 'scale(1.012)' : 'scale(1)',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.87rem', fontWeight: 700, color: isHighlighted ? DEEP : MID }}>
            {highlightText(exp.role, matchSet, MID)}
          </h4>
          <p style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: isHighlighted ? PINK : SOFT }}>
            {highlightText(exp.org, matchSet)} · {exp.location}
          </p>
        </div>
        <span style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(80,0,50,0.45)', whiteSpace: 'nowrap' }}>
          {exp.period}
        </span>
      </div>
      <ul style={{ margin: '5px 0 0', paddingLeft: '1rem' }}>
        {exp.bullets.map((b, j) => (
          <li key={j} style={{ fontSize: '0.76rem', color: inverted ? MID : 'rgba(50,0,40,0.6)', lineHeight: 1.7, marginBottom: 3 }}>
            {highlightText(b, matchSet)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ResumeSection() {
  const [filter, setFilter] = useState('main');
  const [search, setSearch]   = useState('');
  const [dlOpen, setDlOpen]   = useState(false);

  const filterDef = FILTER_OPTIONS.find(f => f.value === filter);
  const matched   = useMemo(() => relationalSearch(search), [search]);

  // Emit cross-section signal whenever filter or search changes
  const handleFilterChange = useCallback((val) => {
    setFilter(val);
    emitFilterSignal({ filter: val, search });
  }, [search]);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    emitFilterSignal({ filter, search: val });
  }, [filter]);

  const handleSkillClick = useCallback((item) => {
    setSearch(item);
    emitFilterSignal({ filter, search: item });
  }, [filter]);

  // Filtering logic
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
    let list = filter === 'main' ? EDUCATION : EDUCATION.filter(e => e.tags.includes(filter) || e.tags.length === 0);
    if (matched) list = list.filter(e => eduMatchesSearch(e, matched));
    return list;
  }, [filter, matched]);

  const visibleAwards = useMemo(() => {
    let list = filter === 'main' ? AWARDS_VOLUNTEER : AWARDS_VOLUNTEER.filter(a => a.tags.includes(filter) || a.tags.length === 0);
    if (matched) list = list.filter(a => awardMatchesSearch(a, matched));
    return list;
  }, [filter, matched]);

  const visiblePubs = useMemo(() => {
    let list = filter === 'main' ? PUBLICATIONS : PUBLICATIONS.filter(p => p.tags.includes(filter));
    if (matched) list = list.filter(p => pubMatchesSearch(p, matched));
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

  const hasResults = visibleExp.length + visibleCerts.length + visibleEdu.length + visibleAwards.length + visiblePubs.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>

      {/* ── Controls bar ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                cursor: 'pointer', border: `1.5px solid ${opt.color}`,
                background: filter === opt.value ? opt.color : 'rgba(255,255,255,0.7)',
                color: filter === opt.value ? '#fff' : opt.color,
                transition: 'all 0.2s', letterSpacing: '0.03em',
              }}
            >
              {opt.label.split(' — ')[0]}
            </button>
          ))}
        </div>

        {/* Download dropdown */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button
            onClick={() => setDlOpen(!dlOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${BORDER}`, background: 'rgba(255,255,255,0.8)',
              color: PINK, transition: 'all 0.2s',
            }}
          >
            Download Resume <ChevronDown style={{ width: 12, height: 12 }} />
          </button>
          <AnimatePresence>
            {dlOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'rgba(255,255,255,0.98)', border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: '6px', zIndex: 50,
                  boxShadow: '0 8px 28px rgba(192,0,94,0.14)', minWidth: 200,
                }}
              >
                {DOWNLOAD_LINKS.map(d => (
                  <a
                    key={d.label} href={d.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: '0.75rem', color: DEEP, textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,0,94,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {d.label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(192,0,94,0.5)' }} />
        <input
          type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
          placeholder="Search skills, tools, domains, or roles (e.g. 'CRM', 'data', 'AI', 'grant')…"
          style={{
            width: '100%', padding: '10px 12px 10px 34px', borderRadius: 999,
            border: `1.5px solid rgba(192,0,94,0.25)`, background: 'rgba(255,255,255,0.88)',
            fontSize: '0.82rem', color: DEEP, outline: 'none',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', backdropFilter: 'blur(8px)',
          }}
        />
        {search && (
          <button
            onClick={() => handleSearchChange('')}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(192,0,94,0.45)', fontSize: '1.1rem' }}
          >
            ×
          </button>
        )}
      </div>

      {/* Search result summary */}
      {matched && (
        <p style={{ margin: '-0.5rem 0 0', fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT }}>
          {hasResults
            ? `↳ Showing ${visibleExp.length} roles · ${visibleCerts.length} certs · ${visibleEdu.length} education · ${visibleAwards.length} awards · ${visiblePubs.length} publications matching "${search}"`
            : `No matches for "${search}" — try a broader term.`
          }
        </p>
      )}

      {/* ── Header card ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...cardStyle, textAlign: 'center', borderColor: BORDER }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 900, color: DEEP, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Lancelot Naipier-Kane
        </h2>
        <p style={{ margin: '0 0 5px', fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: PINK, fontWeight: 700 }}>
          Program & Data Manager · {filterDef?.label}
        </p>
        <p style={{ margin: '0 0 10px', fontSize: '0.73rem', color: SOFT }}>
          New York, NY &nbsp;·&nbsp; 1-(707)-991-1031 &nbsp;·&nbsp; lancelotsmnk@gmail.com &nbsp;·&nbsp;
          <a href="https://linkedin.com/in/lancelotnk" target="_blank" rel="noopener noreferrer" style={{ color: PINK, textDecoration: 'none' }}>linkedin.com/in/lancelotnk</a>
          &nbsp;·&nbsp;
          <a href="https://lancelot-nk.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: PINK, textDecoration: 'none' }}>lancelot-nk.github.io</a>
        </p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(30,0,40,0.65)', lineHeight: 1.75, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
          Data science and analytics professional with a strong foundation in AI, machine learning, and algorithm-driven problem solving, supporting analysis and decision-making on budgets up to $7.6B. Experienced using Python, R, and data structuring techniques to develop technical solutions and translate analysis into practical business outcomes. MIT and Microsoft certified with a focus on delivering data-backed results and scalable insights across public sector, tech, and nonprofit domains.
        </p>
      </motion.div>

      {/* ── Technical Stack ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} style={cardStyle}>
        <div style={sHead}>
          <Wrench style={{ width: 13, height: 13, color: PINK }} />
          <h3 style={sTitle}>Technical Stack</h3>
        </div>
        <p style={{ margin: '0 0 8px', fontSize: '0.64rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(120,0,60,0.5)' }}>
          Click any skill to search it · Hover to preview
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {SKILL_GROUPS.map(group => {
            const groupHighlighted = filter !== 'main' && group.tags.includes(filter);
            const items = matched
              ? group.items.filter(item => matched.has(item.toLowerCase()))
              : group.items;
            if (matched && items.length === 0) return null;

            return (
              <div key={group.label}>
                <p style={{
                  margin: '0 0 5px', fontSize: '0.59rem', fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: groupHighlighted ? VIOLET : 'rgba(100,0,50,0.45)',
                  fontWeight: groupHighlighted ? 700 : 400,
                }}>
                  {group.label}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {items.map(item => (
                    <SkillPill
                      key={item}
                      item={item}
                      active={activeSkillItems.has(item.toLowerCase()) || (groupHighlighted && filter !== 'main')}
                      onClick={handleSkillClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Work Experience ──────────────────────────────────────────────── */}
      {visibleExp.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
          <div style={sHead}>
            <Briefcase style={{ width: 13, height: 13, color: PINK }} />
            <h3 style={sTitle}>Work Experience</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {visibleExp.map((exp, i) => (
              <ExpCard
                key={i}
                exp={exp}
                isHighlighted={filter !== 'main' && exp.tags.includes(filter)}
                matchSet={matched}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Education ───────────────────────────────────────────────────── */}
      {visibleEdu.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} style={cardStyle}>
          <div style={sHead}>
            <GraduationCap style={{ width: 13, height: 13, color: PINK }} />
            <h3 style={sTitle}>Education</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {visibleEdu.map((edu, i) => {
              const [hov, setHov] = useState(false);
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={() => setHov(false)}
                  style={{
                    paddingLeft: '0.9rem', paddingTop: '0.4rem', paddingBottom: '0.4rem',
                    borderLeft: `3px solid ${hov ? PINK : BORDER}`,
                    borderRadius: '0 8px 8px 0',
                    background: hov ? `${PINK}0E` : 'transparent',
                    transform: hov ? 'scale(1.01)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 3 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, color: DEEP }}>
                        {highlightText(edu.degree, matched)}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: PINK }}>
                        {highlightText(edu.school, matched)}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(80,0,50,0.45)' }}>
                      {edu.period}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'rgba(40,0,35,0.58)', lineHeight: 1.65 }}>
                    {highlightText(edu.note, matched)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Certifications ───────────────────────────────────────────────── */}
      {visibleCerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={cardStyle}>
          <div style={sHead}>
            <Award style={{ width: 13, height: 13, color: PINK }} />
            <h3 style={sTitle}>Certifications</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.65rem' }}>
            {visibleCerts.map((cert, i) => {
              const [hov, setHov] = useState(false);
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={() => setHov(false)}
                  style={{
                    padding: '0.7rem 0.85rem', borderRadius: 10,
                    border: `1px solid ${hov ? PINK : BORDER}`,
                    background: hov ? `${PINK}0D` : 'rgba(255,255,255,0.7)',
                    transform: hov ? 'scale(1.025)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <p style={{ margin: 0, fontSize: '0.76rem', fontWeight: 700, color: DEEP, lineHeight: 1.4, flex: 1 }}>
                      {highlightText(cert.title, matched)}
                    </p>
                    <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                      <ExternalLink style={{ width: 11, height: 11, color: PINK, opacity: 0.7 }} />
                    </a>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT }}>
                    {cert.issuer} · {cert.date}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Publications, Research & Grants ─────────────────────────────── */}
      {visiblePubs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }} style={cardStyle}>
          <div style={sHead}>
            <FileText style={{ width: 13, height: 13, color: PINK }} />
            <h3 style={sTitle}>Publications, Research & Grants</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {visiblePubs.map((pub, i) => {
              const [hov, setHov] = useState(false);
              const typeColor = pub.type === 'grant' ? '#0A6B0A' : pub.type === 'policy' ? VIOLET : PINK;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={() => setHov(false)}
                  style={{
                    paddingLeft: '0.9rem', paddingTop: '0.4rem', paddingBottom: '0.4rem',
                    borderLeft: `3px solid ${hov ? typeColor : BORDER}`,
                    borderRadius: '0 8px 8px 0',
                    background: hov ? `${typeColor}10` : 'transparent',
                    transform: hov ? 'scale(1.01)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 3 }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: DEEP, lineHeight: 1.4 }}>
                        {highlightText(pub.title, matched)}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.67rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT }}>
                        {pub.venue}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <span style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(80,0,50,0.45)' }}>
                        {pub.period}
                      </span>
                      <span style={{
                        fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
                        letterSpacing: '0.15em', padding: '2px 6px', borderRadius: 4,
                        border: `1px solid ${typeColor}55`, color: typeColor, background: `${typeColor}12`,
                      }}>
                        {pub.type}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: 'rgba(40,0,35,0.58)', lineHeight: 1.65 }}>
                    {highlightText(pub.desc, matched)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Awards & Volunteer ───────────────────────────────────────────── */}
      {visibleAwards.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} style={cardStyle}>
          <div style={sHead}>
            <Star style={{ width: 13, height: 13, color: PINK }} />
            <h3 style={sTitle}>Awards, Leadership & Volunteer</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.65rem' }}>
            {visibleAwards.map((a, i) => {
              const [hov, setHov] = useState(false);
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={() => setHov(false)}
                  style={{
                    padding: '0.7rem 0.85rem', borderRadius: 10,
                    border: `1px solid ${hov ? PINK : BORDER}`,
                    background: hov ? `${PINK}0D` : 'rgba(255,255,255,0.7)',
                    transform: hov ? 'scale(1.025)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: DEEP }}>
                    {highlightText(a.title, matched)}
                  </p>
                  <p style={{ margin: '2px 0 4px', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: PINK }}>
                    {a.org} · {a.period}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: 'rgba(40,0,35,0.55)', lineHeight: 1.6 }}>
                    {highlightText(a.desc, matched)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── No results state ─────────────────────────────────────────────── */}
      {matched && !hasResults && (
        <div style={{ textAlign: 'center', padding: '2rem', color: SOFT, fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
          No results for &quot;{search}&quot;. Try a broader term or clear the search.
        </div>
      )}

    </div>
  );
}