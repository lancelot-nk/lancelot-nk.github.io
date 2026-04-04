import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Award, Wrench, ExternalLink, Search, ChevronDown } from 'lucide-react';

const PINK = '#E01880';
const VIOLET = '#8B00E8';

// ── Data ──────────────────────────────────────────────────────────────────────

const ALL_EXPERIENCE = [
  { role: 'Applied AI & Data Science Certification', org: 'MIT', location: 'Cambridge, MA', period: '06/2025 – 10/2025', tags: ['data','tech','ai'], bullets: ['Formalized skills in Machine Learning, Applied AI, and Data Science — accuracy boosts of 50%, latency reduced 30% via hyperparameter tuning and data pipeline refactoring.', 'Tools: Python, R, Seaborn, NumPy, Pandas, Scikit-Learn, TensorFlow, Keras, Generative AI, Transformers, OpenCV, Hugging Face, ChatGPT, DALL-E, LangChain, NLP, Tableau, AWS Cloud.'] },
  { role: 'Azure Data Fundamentals Certification', org: 'Microsoft', location: 'Redmond, WA', period: '06/2025 – 10/2025', tags: ['data','tech'], bullets: ['Engineered automated cleaning framework improving data quality from 65% to 98%, identifying 15+ dirty-data edge cases in controlled sandbox environments.', 'Tools: Azure SQL, NoSQL, Cosmos DB, Synapse Analytics, Data Factory, Power BI, Blob Storage, Data Lake Gen2, ETL/ELT Pipelines, T-SQL, Relational/Non-Relational Modeling.'] },
  { role: 'Events & Community Coordinator', org: 'City of New York', location: 'New York, NY', period: '10/2023 – 05/2025', tags: ['program','tech'], bullets: ['Directed full-cycle Program Development and event design using Data Integration strategies to drive informed process improvements.', 'Created innovative outreach strategies alongside Data Analysis that boosted event attendance by 35% with 30% more events.', 'Tools: Cvent, Salesforce CRM, Eventbrite, Partiful, Luna, Zapier, Asana, Monday.com, Mailchimp, Slido (Analytics), Tableau, Microsoft Excel, Microsoft Teams.'] },
  { role: 'Program & Data Manager', org: 'New York City HRA', location: 'New York, NY', period: '11/2023 – 09/2024', tags: ['data','program','tech'], bullets: ['Directed enterprise-level Data Management and Integration of the New York SNAP/EBT system directing a $7.6 billion budget in regulatory compliance.', 'Utilized ground research and testing data to decrease employee workload by 40% and increase system accuracy by 25%.', 'Tools: Cúram (ACCESS HRA), WMS, POS, UiPath (RPA), SQL (SSIS), dbt, Power Automate, Tableau, Excel (Advanced/VBA).'] },
  { role: 'Program & Data Manager', org: 'Comprehensive Life Resources', location: 'Tacoma, WA', period: '09/2022 – 09/2023', tags: ['data','program','tech'], bullets: ['Provided wraparound services to unsheltered populations, completing grant deliverables alongside technical solutions.', 'Redesigned State data system improving data capture and operational efficiency for 1,000s of clients by 60%.', 'Tools: ArcGIS, Google Forms, Excel (Data Methodology), HMIS (Clarity), WA SAW, PRISM, Julius (Peer Services Data).'] },
  { role: 'Contractor: Asset, Cyber, Monetary & Domestic', org: 'Federal Agencies', location: 'Washington, DC', period: '10/2021 – 08/2022', tags: ['data','program','tech'], bullets: ['Awarded multiple independent contracts in research and management, applying program management methodology with information acquisition and situational analysis.', 'Engineered a standardized Data Warehousing framework enhancing multi-scale operational outcomes by 25%.', 'Tools: Risk Management Frameworks (RMF), NIST Standards, SQL, Advanced Excel, Microsoft Project, Secure Communication Platforms.'] },
  { role: 'Environmental Researcher, Oil Train Safety', org: 'Federal Railroad Administration', location: 'Washington, DC', period: '04/2021 – 07/2021', tags: ['program','data'], bullets: ['Completed research for Hazardous Materials and Human Factors Division, attributing to policy movements in urban transport at multiple scales.', 'Produced reports and policy coverage material that informed agency-wide programming, significantly reducing localized safety risks.', 'Tools: ArcGIS (Spatial Analysis), NEPA Frameworks, FRA Safety Standards, Tableau, Graphic Design, Adobe Acrobat.'] },
  { role: 'Technical Specialist — Fleet Management & AI Integration', org: 'Lytx, Inc.', location: 'San Diego, CA', period: '01/2021 – 04/2021', tags: ['tech','data'], bullets: ['Maintained client satisfaction through troubleshooting, data entry, and safety checks, increasing lead generation and satisfaction by 30% each.', 'Tools: Salesforce CRM, Gainsight (CSM), Zendesk, HubSpot, Jira, Lytx DriveCam API, Oracle NetSuite (ERP).'] },
  { role: 'Assistant Director', org: 'Solar Household Energy, Inc.', location: 'Washington, DC', period: '12/2019 – 07/2020', tags: ['program','data'], bullets: ['Visualized publications, donor outreach graphics and grant-writing materials with clear upticks in donor engagement.', 'Bolstered industry strength through R&D and multi-actor projects, resulting in decreased energy expenditure and improved indoor air quality.', 'Tools: Adobe Creative Suite, Salesforce (Donor Management), Mailchimp, Google Analytics, Google Ads, HTML/CSS.'] },
  { role: 'Volunteer Program & Grant Consultant', org: 'Living Classrooms Foundation DC', location: 'Washington, DC', period: '09/2019 – 12/2019', tags: ['program'], bullets: ['Derived textual and budgetary analysis for DOEE grant applications to promote green workforce development and the transformation of Kingman Island greenspace.', 'Orchestrated a suite of wraparound programs and successfully designed a grant funded meta-analysis for their integration and cross-participation.', 'Tools: Salesforce (NPSP), VolunteerHub, Excel (VBA/Budgetary Modeling), E-Grants (DOEE), SMART, SurveyMonkey.'] },
  { role: 'IRB Social Policy Researcher', org: 'Where There Be Dragons', location: 'Varanasi, India', period: '08/2018 – 01/2019', tags: ['program','data'], bullets: ['Created and conducted an IRB-approved study in accordance with NIH principles, resulting in broader regional support for Sankat Mochan Water Foundation.', 'Tools: NVivo (Qualitative Analysis), Qualtrics, NIH Ethics Framework, Structured Interviews, SPSS, Zotero.'] },
  { role: 'Green Policy Intern & Green Fund Chair', org: 'Goucher College', location: 'Baltimore, MD', period: '2015 – 2019', tags: ['program'], bullets: ['Led campus sustainability initiatives as Green Fund Chair, allocating budget for campus environmental projects.', 'Served as Student Body President, Roosevelt Institute Treasurer, and college swimmer.'] },
];

const EDUCATION = [
  { school: 'Goucher College', degree: 'BA – Economics (Public Health)', period: '05/2019', note: 'Applied quantitative skills (STATA, R) to social impact research. Student Body President, Roosevelt Institute Treasurer, Green Fund Chair, Swimmer.' },
  { school: 'Georgetown University', degree: 'Summer College, International Relations & Calculus', period: '2015', note: 'Advanced pre-college classes with college-level students.' },
  { school: 'Brunswick High School', degree: 'Standard Diploma', period: '2011–2015', note: 'Brunswick, ME' },
];

const CERTS = [
  { title: 'Applied AI & Data Science Certification', issuer: 'MIT', date: '10/2026', link: 'https://professional-education-gl.mit.edu/mit-online-data-science-program' },
  { title: 'Microsoft Certified: Azure Data Fundamentals DP-900', issuer: 'Microsoft', date: '10/2025', link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/' },
  { title: 'Ethical Emerging Technologist Professional Certificate', issuer: 'CertNexus', date: '12/2021', link: 'https://certnexus.com/certified-ethical-emerging-technologist-ceet/' },
  { title: 'Google Grow Project Management Certificate', issuer: 'Google', date: '12/2021', link: 'https://grow.google/certificates/project-management/' },
  { title: 'Project Management Essentials Certified', issuer: 'Management & Strategy Institute', date: '08/2021', link: '#' },
  { title: 'NIH Research Ethics', issuer: 'National Institute of Health', date: '05/2018', link: 'https://oir.nih.gov/sourcebook/ethical-conduct/research-ethics' },
];

const AWARDS_VOLUNTEER = [
  { title: 'Roosevelt Institute — Treasurer', org: 'Goucher College', period: '2015–2019', desc: 'Managed budgets and led economic policy discussions as chapter treasurer.' },
  { title: 'Student Body President', org: 'Goucher College', period: '2017–2018', desc: 'Elected student government president, representing the entire student body in institutional governance.' },
  { title: 'Green Fund Chair', org: 'Goucher College', period: '2017–2019', desc: 'Chaired the campus green fund, evaluating and funding sustainability projects.' },
  { title: 'Kingman Island Volunteer Steward', org: 'Living Classrooms Foundation DC', period: '2019', desc: 'Volunteer environmental stewardship on Kingman Island, Anacostia River ecosystem restoration.' },
];

const SKILL_GROUPS = [
  { label: 'Languages & AI', tags: ['data','ai','tech'], items: ['Python', 'R', 'SQL', 'Java', 'JavaScript', 'HTML5/CSS3', 'TensorFlow', 'Keras', 'PyTorch', 'Scikit-Learn', 'NumPy', 'Pandas', 'Seaborn', 'LangChain', 'Hugging Face', 'NLP', 'Transformers', 'LoRA/QLoRA'] },
  { label: 'Cloud & Data Infrastructure', tags: ['data','tech'], items: ['Microsoft Azure', 'AWS (S3, EC2)', 'Databricks', 'Synapse Analytics', 'Cosmos DB', 'Snowflake', 'BigQuery', 'dbt', 'Apache Spark', 'Apache Airflow', 'ETL/ELT', 'Data Lake Gen2', 'Blob Storage', 'Postman', 'API Development'] },
  { label: 'Visualization & BI', tags: ['data'], items: ['Tableau', 'Power BI', 'ThoughtSpot', 'Qlik Sense', 'Excel (Advanced/VBA)', 'Power Query', 'ArcGIS', 'Google Analytics', 'Seaborn', 'Matplotlib'] },
  { label: 'CRM & Project Platforms', tags: ['program','tech'], items: ['Salesforce', 'HubSpot', 'Gainsight', 'Jira', 'Asana', 'Monday.com', 'Zendesk', 'Oracle NetSuite', 'Cvent', 'UiPath (RPA)', 'Power Automate', 'Zapier', 'GitHub (Copilot, CLI)', 'Microsoft Project'] },
  { label: 'Creative & Web', tags: ['tech'], items: ['Adobe Creative Suite', 'Figma', 'Canva', 'AutoCAD', 'DaVinci Resolve', 'Premiere Pro', 'After Effects', 'Motion Graphics', 'ElevenLabs', 'Audacity', 'React', 'Vite', 'Next.js', 'WordPress'] },
  { label: 'Data Science & Analytics', tags: ['data','ai'], items: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Computer Vision', 'Recommender Systems', 'Predictive Algorithms', 'Hyperparameter Tuning', 'Time Series Forecasting', 'Anomaly Detection', 'Dimensionality Reduction', 'Data Warehousing', 'Data Governance', 'Data Storytelling', 'Quantitative Analytics', 'Statistical Modeling'] },
  { label: 'Program & Policy', tags: ['program'], items: ['Grant Writing', 'Grant Procurement', 'Program Management', 'Stakeholder Engagement', 'Regulatory Compliance', 'NIST/RMF Frameworks', 'NEPA', 'NIH Ethics', 'Process Reengineering', 'Change Management', 'Agile/Scrum', 'IRB Research', 'Technical Writing', 'Public Outreach'] },
];

const SKILL_RELATIONS = {
  'crm': ['salesforce','hubspot','gainsight','zendesk','dynamics'],
  'database': ['sql','nosql','cosmos db','bigquery','snowflake','dbt','mongodb'],
  'cloud': ['azure','aws','databricks','blob storage','data lake','gcp'],
  'analytics': ['tableau','power bi','excel','seaborn','matplotlib','qlik','thoughtspot'],
  'ml': ['scikit-learn','tensorflow','keras','pytorch','machine learning','deep learning'],
  'project management': ['jira','asana','monday.com','agile','scrum','microsoft project'],
  'data': ['python','sql','pandas','numpy','tableau','power bi','dbt','spark','snowflake'],
  'ai': ['tensorflow','keras','pytorch','langchain','hugging face','openai','gpt','transformers','nlp'],
  'programming': ['python','r','java','javascript','html','css','sql'],
  'visualization': ['tableau','power bi','seaborn','matplotlib','qlik','thoughtspot'],
};

/**
 * @param {string} query 
 */
function relationalSearch(query) {
  if (!query.trim()) return null;
  const q = query.toLowerCase().trim();
  const matched = new Set();
  
  SKILL_GROUPS.forEach(g => g.items.forEach(item => { 
    if (item.toLowerCase().includes(q)) matched.add(item.toLowerCase()); 
  }));

  Object.entries(SKILL_RELATIONS).forEach(([key, vals]) => {
    if (key.includes(q) || q.includes(key)) vals.forEach(v => matched.add(v));
    if (vals.some(v => v.includes(q))) { 
      matched.add(q); 
      vals.forEach(v => matched.add(v)); 
    }
  });
  return matched;
}

const FILTER_OPTIONS = [
  { value: 'main',    label: 'Main — Full Resume',     color: PINK },
  { value: 'data',    label: 'Data Scientist + Analyst', color: '#0078D4' },
  { value: 'program', label: 'Program Manager',         color: '#107C10' },
  { value: 'tech',    label: 'Technology',              color: VIOLET },
];

const DOWNLOAD_LINKS = [
  { label: 'Main Resume',           href: 'https://lancelot-nk.github.io/23f308d6d_LancelotNaipierKaneDataResumeV48.pdf' },
  { label: 'Data Scientist + Analyst',  href: 'https://lancelot-nk.github.io/23f308d6d_LancelotNaipierKaneDataResumeV48.pdf' },
  { label: 'Program Manager',           href: 'https://lancelot-nk.github.io/23f308d6d_LancelotNaipierKaneDataResumeV48.pdf' },
  { label: 'Technology',                href: 'https://lancelot-nk.github.io/23f308d6d_LancelotNaipierKaneDataResumeV48.pdf' },
];

const cardStyle = { borderRadius: '0.75rem', border: '1px solid rgba(224,24,128,0.12)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '1.1rem' };
const sHead = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.8rem' };
const sTitle = { fontSize: '0.63rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.3em', color: PINK, margin: 0 };

export default function ResumeSection() {
  const [filter, setFilter] = useState('main');
  const [search, setSearch] = useState('');
  const [dlOpen, setDlOpen] = useState(false);

  const filterDef = FILTER_OPTIONS.find(f => f.value === filter);
  const matched = useMemo(() => relationalSearch(search), [search]);

  const visibleExp = filter === 'main'
    ? ALL_EXPERIENCE
    : ALL_EXPERIENCE.filter(e => e.tags.includes(filter));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FILTER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${opt.color}`,
              background: filter === opt.value ? opt.color : 'rgba(255,255,255,0.6)',
              color: filter === opt.value ? '#fff' : opt.color,
              transition: 'all 0.2s',
            }}>{opt.label.split(' — ')[0]}</button>
          ))}
        </div>

        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <button
            onClick={() => setDlOpen(!dlOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid rgba(224,24,128,0.35)`, background: 'rgba(255,255,255,0.7)', color: PINK, transition: 'all 0.2s' }}
          >
            Download Resume <ChevronDown style={{ width: 12, height: 12 }} />
          </button>
          {dlOpen && (
            <div style={{ position: 'absolute', right: 0, top: '110%', background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(224,24,128,0.2)', borderRadius: 12, padding: '6px', zIndex: 50, boxShadow: '0 8px 24px rgba(224,24,128,0.12)', minWidth: 190 }}>
              {DOWNLOAD_LINKS.map(d => (
                <a key={d.label} href={d.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: '0.75rem', color: '#2D0040', textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={(/** @type {any} */ e) => e.currentTarget.style.background = 'rgba(224,24,128,0.08)'}
                  onMouseLeave={(/** @type {any} */ e) => e.currentTarget.style.background = 'transparent'}
                >{d.label}</a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(224,24,128,0.5)' }} />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search skills, tools, or domains (e.g. 'CRM', 'data', 'AI')…"
          style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 999, border: '1.5px solid rgba(224,24,128,0.2)', background: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', color: '#2D0040', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', backdropFilter: 'blur(8px)' }}
        />
        {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(224,24,128,0.4)', fontSize: '1rem' }}>×</button>}
      </div>

      {/* Header card */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...cardStyle, textAlign: 'center', borderColor: 'rgba(224,24,128,0.2)' }}>
        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#2D0040', margin: '0 0 4px' }}>Lancelot Naipier-Kane</h2>
        <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: PINK }}>Program and Data Manager · {filterDef?.label}</p>
        <p style={{ margin: '0 0 12px', fontSize: '0.75rem', color: 'rgba(60,0,60,0.5)' }}>New York, NY · 1-(707)-991-1031 · lancelotsmnk@gmail.com</p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(60,0,60,0.6)', lineHeight: 1.7, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>
          Data science and analytics professional with a strong foundation in AI, machine learning, and algorithm-driven problem solving. MIT and Microsoft certified with a focus on delivering data-backed results and scalable insights across public sector, tech, and nonprofit domains.
        </p>
      </motion.div>

      {/* Skills Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={cardStyle}>
        <div style={sHead}><Wrench style={{ width: 13, height: 13, color: PINK }} /><h3 style={sTitle}>Technical Stack</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {SKILL_GROUPS.map(group => {
            const groupHighlighted = filter !== 'main' && group.tags.includes(filter);
            const items = matched 
              ? group.items.filter(item => matched.has(item.toLowerCase())) 
              : group.items;

            if (matched && items.length === 0) return null;

            return (
              <div key={group.label}>
                <p style={{ margin: '0 0 5px', fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: groupHighlighted ? VIOLET : 'rgba(139,0,80,0.5)' }}>{group.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {items.map(item => {
                    const isSearchHit = matched?.has(item.toLowerCase());
                    const isFilterHit = groupHighlighted && filter !== 'main';
                    const active = isSearchHit || isFilterHit;
                    return (
                      <span key={item} style={{
                        fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                        padding: '3px 8px', borderRadius: 4,
                        border: active ? `1px solid ${PINK}` : '1px solid rgba(224,24,128,0.15)',
                        color: active ? '#fff' : 'rgba(60,0,60,0.6)',
                        background: active ? PINK : 'rgba(224,24,128,0.04)',
                        transition: 'all 0.2s',
                        fontWeight: active ? 600 : 400,
                      }}>{item}</span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Experience */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={cardStyle}>
        <div style={sHead}><Briefcase style={{ width: 13, height: 13, color: PINK }} /><h3 style={sTitle}>Work Experience</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {visibleExp.map((exp, i) => {
            const isHighlighted = filter !== 'main' && exp.tags.includes(filter);
            return (
              <div key={i} style={{ paddingLeft: '0.9rem', borderLeft: `2px solid ${isHighlighted ? PINK : 'rgba(224,24,128,0.12)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: isHighlighted ? '#2D0040' : '#3D0060' }}>{exp.role}</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: isHighlighted ? PINK : 'rgba(180,0,100,0.6)' }}>{exp.org} · {exp.location}</p>
                  </div>
                  <span style={{ fontSize: '0.63rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(100,0,60,0.4)' }}>{exp.period}</span>
                </div>
                <ul style={{ margin: '5px 0 0', paddingLeft: '1rem' }}>
                  {exp.bullets.map((b, j) => <li key={j} style={{ fontSize: '0.75rem', color: 'rgba(60,0,60,0.55)', lineHeight: 1.65, marginBottom: 3 }}>{b}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}