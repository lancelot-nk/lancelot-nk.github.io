import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, GraduationCap, Award, Wrench, ExternalLink,
  Search, ChevronDown, ChevronUp, Star, FileText, Languages,
  Code,
} from 'lucide-react';

// ── Import live projects list from ProjectsSection ───────────────────────────
// ProjectsSection must export PROJECTS as a named export (see note at bottom).
// When you add real projects there, they auto-appear in this section.
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

const SKILL_RELATIONS = {
  crm:                      ['salesforce', 'hubspot', 'gainsight', 'zendesk', 'dynamics', 'netsuite'],
  database:                 ['sql', 'nosql', 'cosmos db', 'bigquery', 'snowflake', 'dbt', 'mongodb', 'postgresql', 'mysql'],
  cloud:                    ['azure', 'aws', 'databricks', 'blob storage', 'data lake', 'gcp', 'synapse', 'data factory'],
  analytics:                ['tableau', 'power bi', 'excel', 'seaborn', 'matplotlib', 'qlik', 'thoughtspot', 'google analytics'],
  ml:                       ['scikit-learn', 'tensorflow', 'keras', 'pytorch', 'machine learning', 'deep learning', 'neural networks'],
  'project management':     ['jira', 'asana', 'monday.com', 'agile', 'scrum', 'microsoft project', 'zapier', 'program management'],
  data:                     ['python', 'sql', 'pandas', 'numpy', 'tableau', 'power bi', 'dbt', 'spark', 'snowflake', 'bigquery', 'quantitative analytics'],
  ai:                       ['tensorflow', 'keras', 'pytorch', 'langchain', 'hugging face', 'openai', 'gpt', 'transformers', 'nlp', 'computer vision', 'machine learning', 'deep learning'],
  programming:              ['python', 'r', 'java', 'javascript', 'html', 'css', 'sql', 't-sql', 'stata', 'matlab'],
  visualization:            ['tableau', 'power bi', 'seaborn', 'matplotlib', 'qlik', 'thoughtspot', 'arcgis', 'data storytelling'],
  gis:                      ['arcgis', 'spatial analysis', 'nepa', 'geospatial'],
  automation:               ['uipath', 'rpa', 'power automate', 'zapier', 'airflow', 'etl', 'elt'],
  grant:                    ['grant writing', 'grant procurement', 'doee', 'prism', 'e-grants', 'npsp', 'rfp', 'fundraising'],
  policy:                   ['nepa', 'nist', 'rmf', 'nih', 'irb', 'regulatory', 'compliance', 'regulatory compliance'],
  federal:                  ['nist', 'rmf', 'fra', 'hra', 'nepa', 'federal', 'government'],
  nlp:                      ['nlp', 'natural language processing', 'transformers', 'langchain', 'hugging face', 'sentiment analysis'],
  security:                 ['nist', 'rmf', 'cybersecurity', 'data security', 'data privacy', 'certnexus'],
  snap:                     ['snap', 'ebt', 'hra', 'curam', 'wms', 'pos', 'welfare'],
  nonprofit:                ['salesforce npsp', 'volunteerhub', 'mailchimp', 'donor management', 'grant', 'fundraising', 'donor relations'],
  etl:                      ['etl', 'elt', 'airflow', 'spark', 'dbt', 'data factory', 'ssis', 'pipeline'],
  research:                 ['irb', 'nih', 'qualtrics', 'nvivo', 'spss', 'zotero', 'qualitative', 'literature review', 'critical thinking'],
  design:                   ['adobe', 'figma', 'canva', 'autocad', 'davinci', 'premiere', 'after effects', 'motion graphics'],
  language:                 ['english', 'spanish', 'french', 'hindi', 'akan', 'twi', 'ladakhi'],
  leadership:               ['leadership', 'team management', 'student body president', 'stakeholder engagement', 'mentorship', 'organizational development', 'capacity building', 'workforce development', 'change management', 'program management', 'community engagement', 'volunteer', 'president', 'chair', 'director', 'elected', 'govern'],
  management:               ['team management', 'program management', 'budget management', 'financial oversight', 'vendor management', 'change management', 'stakeholder engagement', 'organizational development', 'project management', 'director', 'manager', 'coordinator'],
  communication:            ['communication', 'presentation skills', 'technical writing', 'public outreach', 'executive communication', 'negotiation', 'relationship building', 'networking', 'grant writing', 'speech', 'debate', 'newsletter', 'outreach'],
  'customer service':       ['customer service', 'client relations', 'account management', 'gainsight', 'zendesk', 'hubspot', 'salesforce', 'conflict resolution', 'emotional intelligence', 'satisfaction', 'onboarding'],
  'client relations':       ['client relations', 'account management', 'customer service', 'gainsight', 'zendesk', 'salesforce', 'hubspot'],
  collaboration:            ['cross-functional collaboration', 'partnership development', 'community engagement', 'stakeholder engagement', 'inter-agency coordination', 'team management', 'mentorship'],
  'critical thinking':      ['critical thinking', 'problem solving', 'decision making', 'root cause analysis', 'impact assessment', 'competitive intelligence', 'program evaluation', 'statistical modeling', 'research', 'analysis'],
  'problem solving':        ['problem solving', 'critical thinking', 'root cause analysis', 'decision making', 'process reengineering', 'change management', 'anomaly detection'],
  'strategic planning':     ['strategic planning', 'program management', 'stakeholder engagement', 'organizational development', 'capacity building', 'competitive intelligence', 'impact assessment'],
  diversity:                ['diversity & inclusion', 'equity & access', 'cultural competency', 'emotional intelligence', 'community engagement', 'public outreach', 'intercultural', 'cross-cultural'],
  inclusion:                ['diversity & inclusion', 'equity & access', 'cultural competency', 'community engagement'],
  dei:                      ['diversity & inclusion', 'equity & access', 'cultural competency', 'emotional intelligence', 'intercultural'],
  equity:                   ['equity & access', 'diversity & inclusion', 'community engagement', 'public outreach', 'irb', 'nih', 'food security', 'poverty'],
  adaptability:             ['adaptability', 'resilience', 'change management', 'agile/scrum', 'cross-functional collaboration'],
  'time management':        ['time management', 'prioritization', 'agile/scrum', 'project management', 'process reengineering'],
  fundraising:              ['fundraising', 'donor relations', 'grant writing', 'grant procurement', 'nonprofit', 'salesforce npsp'],
  volunteer:                ['community engagement', 'public outreach', 'leadership', 'workforce development', 'capacity building', 'nonprofit', 'food pantry', 'steward', 'teaching', 'volunteer'],
  'workforce development':  ['workforce development', 'capacity building', 'organizational development', 'community engagement', 'change management', 'mentorship', 'teaching'],
  budget:                   ['budget management', 'financial oversight', 'grant procurement', 'program management', 'quantitative analytics', 'budgetary', 'fiscal'],
  operations:               ['process reengineering', 'change management', 'program management', 'vendor management', 'etl', 'automation', 'rpa', 'inventory', 'supply chain', 'logistics'],
  compliance:               ['regulatory compliance', 'nist', 'rmf', 'nih', 'irb', 'nepa', 'compliance auditing', 'data governance', 'title ix', 'regulatory'],
  stakeholder:              ['stakeholder engagement', 'partnership development', 'relationship building', 'executive communication', 'client relations', 'multi-stakeholder'],
  agile:                    ['agile/scrum', 'jira', 'asana', 'monday.com', 'zapier', 'iterative', 'process reengineering'],
  scrum:                    ['agile/scrum', 'jira', 'asana', 'monday.com'],
  interpersonal:            ['communication', 'emotional intelligence', 'conflict resolution', 'cultural competency', 'relationship building', 'mentorship'],
  presentation:             ['presentation skills', 'communication', 'executive communication', 'data storytelling', 'technical writing', 'speech', 'debate'],
  writing:                  ['technical writing', 'grant writing', 'communication', 'public outreach', 'data storytelling', 'grant', 'publications', 'newsletter'],
  negotiation:              ['negotiation', 'conflict resolution', 'stakeholder engagement', 'vendor management', 'partnership development'],
  mentorship:               ['mentorship', 'leadership', 'workforce development', 'capacity building', 'community engagement', 'teaching'],
  'emotional intelligence': ['emotional intelligence', 'conflict resolution', 'cultural competency', 'communication', 'adaptability'],
  resilience:               ['resilience', 'adaptability', 'change management', 'critical thinking'],
  networking:               ['networking', 'relationship building', 'partnership development', 'community engagement', 'fundraising'],
  'food security':          ['food security', 'poverty', 'hunger', 'equity & access', 'community engagement', 'volunteer'],
  'supply chain':           ['supply chain', 'inventory', 'operations', 'procurement', 'vendor management', 'logistics'],
  inventory:                ['inventory', 'supply chain', 'operations', 'logistics', 'procurement'],
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
  const tags = new Set(['tech']); // all projects are at minimum tech-tagged
  project.tech.forEach(t => {
    const mapped = PROJECT_TECH_TAG_MAP[t.toLowerCase()];
    if (mapped) mapped.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function relationalSearch(query) {
  if (!query.trim()) return null;
  const q = query.toLowerCase().trim();
  const matched = new Set();

  SKILL_GROUPS.forEach(g =>
    g.items.forEach(item => {
      if (item.toLowerCase().includes(q) || q.includes(item.toLowerCase()))
        matched.add(item.toLowerCase());
    })
  );

  Object.entries(SKILL_RELATIONS).forEach(([key, vals]) => {
    if (key.includes(q) || q.includes(key)) vals.forEach(v => matched.add(v));
    if (vals.some(v => v.includes(q) || q.includes(v))) {
      matched.add(q);
      vals.forEach(v => matched.add(v));
    }
  });

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
  padding: '1.45rem',
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
          <h4 style={{ margin: 0, fontSize: '0.97rem', fontWeight: 800, color: isHighlighted ? DEEP : MID, lineHeight: 1.3 }}>
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
          <li key={j} style={{ fontSize: '0.84rem', color: hov ? MID : MUTED, lineHeight: 1.78, marginBottom: 3 }}>
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ResumeSection() {
  const [filter, setFilter] = useState('main');
  const [search, setSearch] = useState('');
  const [dlOpen, setDlOpen] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.45rem' }}>

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
        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: DEEP, margin: '0 0 5px', letterSpacing: '-0.02em' }}>
          Lancelot Naipier-Kane
        </h2>
        <p style={{ margin: '0 0 6px', fontSize: '0.83rem', fontFamily: 'JetBrains Mono, monospace', color: PINK, fontWeight: 800 }}>
          Program & Data Manager · {filterDef?.label}
        </p>
        {/* #2 — Mobile-safe contact line: flex-wrap so each element breaks to its own line on small screens */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
          gap: '4px 10px', margin: '0 0 13px', fontSize: '0.8rem', color: SOFT, fontWeight: 600,
          lineHeight: 2,
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
        <p style={{ margin: 0, fontSize: '0.88rem', color: MUTED, lineHeight: 1.82, maxWidth: 730, marginLeft: 'auto', marginRight: 'auto', fontWeight: 500 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {SKILL_GROUPS.map(group => {
            const groupHighlighted = filter !== 'main' && group.tags.includes(filter);
            const items = matched
              ? group.items.filter(item => matched.has(item.toLowerCase()))
              : group.items;
            if (matched && items.length === 0) return null;
            return (
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
            );
          })}
        </div>
      </SectionCard>

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
            {visibleExp.map((exp, i) => (
              <ExpCard
                key={i} exp={exp}
                isHighlighted={filter !== 'main' && exp.tags.includes(filter)}
                matchSet={matched}
              />
            ))}
          </div>
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

      {/* ── Technical Projects (#9) ───────────────────────────────────────── */}
      {visibleProjects.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Code style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Technical Projects</h3>
          </div>
          <p style={{ margin: '-0.45rem 0 0.85rem', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 600 }}>
            Live projects — see Projects tab for full details &amp; notebooks
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.8rem' }}>
            {visibleProjects.map((p, i) => <ProjectCard key={i} project={p} matchSet={matched} />)}
          </div>
        </SectionCard>
      )}

      {matched && !hasResults && (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: SOFT, fontSize: '0.88rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
          No results for &quot;{search}&quot; — try a broader term or clear the search.
        </div>
      )}

    </div>
  );
}
