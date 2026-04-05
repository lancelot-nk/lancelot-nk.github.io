import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, GraduationCap, Award, Wrench, ExternalLink,
  Search, ChevronDown, Star, FileText, Languages,
} from 'lucide-react';

// ── Brand Colors ────────────────────────────────────────────────────────────
const PINK   = '#B8004E';
const VIOLET = '#5800B8';
const DEEP   = '#0F001E';
const MID    = '#320040';
const SOFT   = '#6A0A50';
const MUTED  = '#4A1040';
const BORDER = 'rgba(184,0,78,0.22)';

// ── Download placeholders ────────────────────────────────────────────────────
const DOWNLOAD_LINKS = [
  { label: 'Main Resume',              href: '/src/assets/resume1.pdf' },
  { label: 'Data Scientist + Analyst', href: '/src/assets/resume2.pdf' },
  { label: 'Program Manager',          href: '/src/assets/resume3.pdf' },
  { label: 'Technology',               href: '/src/assets/resume4.pdf' },
];

// ── Cross-section event emitter ──────────────────────────────────────────────
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
      'Orchestrated a suite of wraparound programs and successfully designed a grant-funded meta-analysis for their integration and cross-participation.',
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
    role: 'Line Chef & Operations Lead',
    org: 'Food and Beverage Service Industry',
    location: 'United States',
    period: '05/2015 – 08/2018',
    tags: ['program', 'operations'],
    bullets: [
      'Optimized order quality and consumer experience through iterative feedback loops, improving overall service efficiency by 25%.',
      'Managed inventory procurement and supply chain logistics with a focus on precision, ensuring operational continuity for high-volume business cycles.',
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
      'Reformed and reinstituted a strategic grant mechanism to fund student-led sustainability initiatives, modeling the framework after federal government grant systems.',
      'Facilitated multi-level stakeholder reviews to designate funding for 10+ ecological programs, including Green Gardens and urban agriculture projects.',
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
      'Increased campus food security by 167% through the implementation of a weekly meal-plan system leveraging non-full-use pricing models.',
      'Architected revolving loan funds and software-based energy metering for college facilities to drive institutional sustainability and infrastructure improvements.',
      'Established analytical committees to audit Title IX compliance, student event coordination, and facilities management.',
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
      'Collaborated within the Facilities and Environment Committee to identify and resolve campus-wide infrastructure issues, improving sustainability policies by 20%.',
      'Engaged multiple on-campus agencies to coordinate cross-departmental efforts in environmental policy reform.',
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
      'Conducted a Financialization analysis of institutional interest-rate-swaps post-2008 crash to assess college economic stability.',
      'Coordinated the funding and fiscal operations for chapter activities, resulting in a 30% boost in organizational outreach.',
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
      'Tailored atmospheric logistics and activities for large-scale informational events, increasing organizational attendance by 25%.',
      'Managed funding requests and cleared complex logistics with the club council to ensure event scalability.',
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
      'Generated broad-based support for community-centered movements, achieving the highest engagement yield during multiple campaign intervals.',
      'Iterated on campaign goals based on direct community feedback and data gathered through canvassing efforts.',
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
      'Strategized direct correspondence with nonprofits and DC Council members to strengthen regional environmental advocacy and network cohesion.',
      'Authored engagement-driven publications and newsletters while documenting multi-agency functions for executive briefing.',
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
      'Executed community outreach and qualitative research within intercultural programs, increasing engagement by 15% for local initiatives.',
      'Produced content to support fundraising efforts and academic publications regarding regional development.',
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
    note: 'Brunswick, ME. ACT Score: 35 (Feb 2015) — 99th percentile nationally. Member of swim team.',
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
    desc: 'Volunteer environmental stewardship on Kingman Island, Anacostia River ecosystem restoration and green workforce programming.',
    tags: ['program'],
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
];

const LANGUAGES = [
  { lang: 'English', level: 'Native or Bilingual Proficiency', tags: [] },
  { lang: 'Hindi', level: 'Limited Working Proficiency', tags: [] },
  { lang: 'French',  level: 'Limited Working Proficiency', tags: [] },
  { lang: 'Akan-Twi',  level: 'Elementary Proficiency', tags: [] },
  { lang: 'Ladakhi',  level: 'Elementary Proficiency', tags: [] },
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
];

const SKILL_RELATIONS = {
  crm:                  ['salesforce', 'hubspot', 'gainsight', 'zendesk', 'dynamics', 'netsuite'],
  database:             ['sql', 'nosql', 'cosmos db', 'bigquery', 'snowflake', 'dbt', 'mongodb', 'postgresql', 'mysql'],
  cloud:                ['azure', 'aws', 'databricks', 'blob storage', 'data lake', 'gcp', 'synapse', 'data factory'],
  analytics:            ['tableau', 'power bi', 'excel', 'seaborn', 'matplotlib', 'qlik', 'thoughtspot', 'google analytics'],
  ml:                   ['scikit-learn', 'tensorflow', 'keras', 'pytorch', 'machine learning', 'deep learning', 'neural networks'],
  'project management': ['jira', 'asana', 'monday.com', 'agile', 'scrum', 'microsoft project', 'zapier'],
  data:                 ['python', 'sql', 'pandas', 'numpy', 'tableau', 'power bi', 'dbt', 'spark', 'snowflake', 'bigquery'],
  ai:                   ['tensorflow', 'keras', 'pytorch', 'langchain', 'hugging face', 'openai', 'gpt', 'transformers', 'nlp', 'computer vision'],
  programming:          ['python', 'r', 'java', 'javascript', 'html', 'css', 'sql', 't-sql', 'stata', 'matlab'],
  visualization:        ['tableau', 'power bi', 'seaborn', 'matplotlib', 'qlik', 'thoughtspot', 'arcgis'],
  gis:                  ['arcgis', 'spatial analysis', 'nepa', 'geospatial'],
  automation:           ['uipath', 'rpa', 'power automate', 'zapier', 'airflow', 'etl', 'elt'],
  grant:                ['grant writing', 'grant procurement', 'doee', 'prism', 'e-grants', 'npsp', 'rfp'],
  policy:               ['nepa', 'nist', 'rmf', 'nih', 'irb', 'regulatory', 'compliance'],
  federal:              ['nist', 'rmf', 'fra', 'hra', 'nepa', 'federal', 'government'],
  nlp:                  ['nlp', 'natural language processing', 'transformers', 'langchain', 'hugging face', 'sentiment analysis'],
  security:             ['nist', 'rmf', 'cybersecurity', 'data security', 'data privacy', 'certnexus'],
  snap:                 ['snap', 'ebt', 'hra', 'curam', 'wms', 'pos', 'welfare'],
  nonprofit:            ['salesforce npsp', 'volunteerhub', 'mailchimp', 'donor management', 'grant'],
  etl:                  ['etl', 'elt', 'airflow', 'spark', 'dbt', 'data factory', 'ssis', 'pipeline'],
  research:             ['irb', 'nih', 'qualtrics', 'nvivo', 'spss', 'zotero', 'qualitative', 'literature review'],
  design:               ['adobe', 'figma', 'canva', 'autocad', 'davinci', 'premiere', 'after effects', 'motion graphics'],
  language:             ['english', 'spanish', 'french'],
};

const FILTER_OPTIONS = [
  { value: 'main',    label: 'Main — Full Resume',        color: PINK },
  { value: 'data',    label: 'Data Scientist + Analyst',  color: '#004FA8' },
  { value: 'program', label: 'Program Manager',           color: '#076607' },
  { value: 'tech',    label: 'Technology',                color: VIOLET },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
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

function highlightText(text, matchSet) {
  if (!matchSet || matchSet.size === 0) return text;
  const terms = Array.from(matchSet).filter(t => t.length > 1);
  if (!terms.length) return text;
  const pattern = terms
    .sort((a, b) => b.length - a.length)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);
  let keyIdx = 0;
  return parts.map(part =>
    regex.test(part)
      ? <mark key={keyIdx++} style={{ background: `${PINK}2A`, color: PINK, fontWeight: 700, borderRadius: 3, padding: '0 2px' }}>{part}</mark>
      : part
  );
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
  return textMatchesSet([e.school, e.degree, e.note].join(' '), matchSet);
}
function awardMatchesSearch(a, matchSet) {
  return textMatchesSet([a.title, a.org, a.desc].join(' '), matchSet);
}
function pubMatchesSearch(p, matchSet) {
  return textMatchesSet([p.title, p.venue, p.desc, p.type].join(' '), matchSet);
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

const sHead = { display: 'flex', alignItems: 'center', gap: 9, marginBottom: '1.1rem' };
const sTitle = {
  fontSize: '0.68rem',
  fontFamily: 'JetBrains Mono, monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: PINK,
  margin: 0,
  fontWeight: 800,
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS — hooks always at top level, NEVER inside .map()
// ═══════════════════════════════════════════════════════════════════════════

/** Outer card wrapper with hover lift effect */
function SectionCard({ children, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...cardBase,
        ...style,
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

function SkillPill({ item, active, onClick }) {
  const [hov, setHov] = useState(false);
  const on = active || hov;
  return (
    <span
      onClick={() => onClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`Search "${item}"`}
      style={{
        fontSize: '0.74rem',
        fontFamily: 'JetBrains Mono, monospace',
        padding: '4px 10px',
        borderRadius: 5,
        border: on ? `1.5px solid ${PINK}` : `1.5px solid rgba(184,0,78,0.22)`,
        color: on ? '#fff' : MUTED,
        background: on ? PINK : hov ? 'rgba(184,0,78,0.09)' : 'rgba(184,0,78,0.04)',
        transition: 'all 0.15s',
        fontWeight: on ? 700 : 500,
        cursor: 'pointer',
        userSelect: 'none',
        transform: hov ? 'scale(1.07)' : 'scale(1)',
        display: 'inline-block',
      }}
    >
      {item}
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
        transition: 'all 0.2s ease',
        cursor: 'default',
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
        <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
          <ExternalLink style={{ width: 13, height: 13, color: PINK, opacity: 0.8 }} />
        </a>
      </div>
      <p style={{ margin: '5px 0 0', fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 700 }}>
        {cert.issuer} · <span style={{ color: PINK, fontWeight: 800 }}>{cert.date}</span>
      </p>
    </div>
  );
}

function EduCard({ edu, matchSet }) {
  const [hov, setHov] = useState(false);
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
    </div>
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
      }}
    >
      <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: DEEP }}>
        {highlightText(a.title, matchSet)}
      </p>
      <p style={{ margin: '4px 0 6px', fontSize: '0.73rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
        <span style={{ color: PINK }}>{a.org}</span>
        <span style={{ color: MID, fontWeight: 800 }}> · {a.period}</span>
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
            fontSize: '0.74rem', fontFamily: 'JetBrains Mono, monospace',
            color: MID, fontWeight: 800,
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ResumeSection() {
  const [filter, setFilter]       = useState('main');
  const [search, setSearch]       = useState('');
  const [dlOpen, setDlOpen]       = useState(false);

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

  const handleSkillClick = useCallback((item) => {
    setSearch(item);
    emitFilterSignal({ filter, search: item });
  }, [filter]);

  // Close download dropdown on outside click
  useEffect(() => {
    if (!dlOpen) return;
    const close = () => setDlOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dlOpen]);

  // ── Filtered lists ──────────────────────────────────────────────────────
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

  const visibleLangs = useMemo(() => {
    if (!matched) return LANGUAGES;
    return LANGUAGES.filter(l =>
      textMatchesSet([l.lang, l.level].join(' '), matched)
    );
  }, [matched]);

  const activeSkillItems = useMemo(() => {
    if (!matched) return new Set();
    const s = new Set();
    SKILL_GROUPS.forEach(g => g.items.forEach(item => {
      if (matched.has(item.toLowerCase())) s.add(item.toLowerCase());
    }));
    return s;
  }, [matched]);

  const hasResults =
    visibleExp.length + visibleCerts.length + visibleEdu.length +
    visibleAwards.length + visiblePubs.length > 0;

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

        {/* Download dropdown */}
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
          placeholder="Search skills, tools, domains, or roles — e.g. 'CRM', 'AI', 'grant', 'SQL'…"
          style={{
            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 999,
            border: `2px solid rgba(184,0,78,0.3)`, background: 'rgba(255,255,255,0.94)',
            fontSize: '0.9rem', color: DEEP, outline: 'none',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
            fontWeight: 500,
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

      {/* Search summary */}
      {matched && (
        <p style={{ margin: '-0.65rem 0 0', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT, fontWeight: 700 }}>
          {hasResults
            ? `↳ ${visibleExp.length} roles · ${visibleCerts.length} certs · ${visibleEdu.length} edu · ${visibleAwards.length} awards · ${visiblePubs.length} publications`
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
        <p style={{ margin: '0 0 13px', fontSize: '0.8rem', color: SOFT, fontWeight: 600 }}>
          New York, NY &nbsp;·&nbsp; 1-(707)-991-1031 &nbsp;·&nbsp; lancelotsmnk@gmail.com &nbsp;·&nbsp;
          <a href="https://linkedin.com/in/lancelotnk" target="_blank" rel="noopener noreferrer" style={{ color: PINK, textDecoration: 'none', fontWeight: 800 }}>
            linkedin.com/in/lancelotnk
          </a>
          &nbsp;·&nbsp;
          <a href="https://lancelot-nk.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: PINK, textDecoration: 'none', fontWeight: 800 }}>
            lancelot-nk.github.io
          </a>
        </p>
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
          Click any skill to search · Hover to preview
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
      </SectionCard>

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
                key={i}
                exp={exp}
                isHighlighted={filter !== 'main' && exp.tags.includes(filter)}
                matchSet={matched}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Education ────────────────────────────────────────────────────── */}
      {visibleEdu.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <GraduationCap style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Education</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {visibleEdu.map((edu, i) => (
              <EduCard key={i} edu={edu} matchSet={matched} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Certifications ───────────────────────────────────────────────── */}
      {visibleCerts.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Award style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Certifications</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.8rem' }}>
            {visibleCerts.map((cert, i) => (
              <CertCard key={i} cert={cert} matchSet={matched} />
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
            {visiblePubs.map((pub, i) => (
              <PubCard key={i} pub={pub} matchSet={matched} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Awards & Volunteer ───────────────────────────────────────────── */}
      {visibleAwards.length > 0 && (
        <SectionCard>
          <div style={sHead}>
            <Star style={{ width: 15, height: 15, color: PINK }} />
            <h3 style={sTitle}>Awards, Leadership & Volunteer</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '0.8rem' }}>
            {visibleAwards.map((a, i) => (
              <AwardCard key={i} a={a} matchSet={matched} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── No results ───────────────────────────────────────────────────── */}
      {matched && !hasResults && (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: SOFT, fontSize: '0.88rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
          No results for &quot;{search}&quot; — try a broader term or clear the search.
        </div>
      )}

    </div>
  );
}