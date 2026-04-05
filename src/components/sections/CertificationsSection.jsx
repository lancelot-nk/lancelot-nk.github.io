import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

// ── Image Imports ───────────────────────────────────────────────────────────
import cert1 from '../../assets/cert1.jpg';
import cert2 from '../../assets/cert2.png';
import cert3 from '../../assets/cert3.jpeg';
import cert4 from '../../assets/cert4.png';
import cert5 from '../../assets/cert5.jpg';
import cert6 from '../../assets/cert6.jpg';

// ── Brand Colors ────────────────────────────────────────────────────────────
const PINK   = '#B8004E'; // Consistent with Projects
const DEEP   = '#0F001E';
const BORDER = 'rgba(184,0,78,0.25)'; // Thicker/Higher Alpha for readability

const CERTS = [
  { 
    title: 'Applied AI & Data Science', 
    issuer: 'MIT', 
    date: '10/2026', 
    link: 'https://professional-education-gl.mit.edu/mit-online-data-science-program', 
    desc: 'Python, TensorFlow, Keras, Transformers, Hugging Face, LangChain, NLP, Generative AI, Deep Learning, AWS Cloud.', 
    img: cert1 
  },
  { 
    title: 'Azure Data Fundamentals DP-900', 
    issuer: 'Microsoft', 
    date: '10/2025', 
    link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/', 
    desc: 'Azure SQL, Cosmos DB, Synapse Analytics, Data Factory, Power BI, Blob Storage, ETL/ELT, Data Lake Gen2.', 
    img: cert2 
  },
  { 
    title: 'Ethical Emerging Technologist', 
    issuer: 'CertNexus', 
    date: '12/2021', 
    link: 'https://certnexus.com/certified-ethical-emerging-technologist-ceet/', 
    desc: 'Professional certification in ethical AI and emerging technology governance practices.', 
    img: cert3 
  },
  { 
    title: 'Google Project Management', 
    issuer: 'Google Grow', 
    date: '12/2021', 
    link: 'https://grow.google/certificates/project-management/', 
    desc: 'Comprehensive project management methodology, Agile, Scrum, and stakeholder engagement practices.', 
    img: cert4 
  },
  { 
    title: 'Project Management Essentials', 
    issuer: 'Management & Strategy Institute', 
    date: '08/2021', 
    link: '#', 
    desc: 'Foundational project management principles, resource planning, and quality assurance frameworks.', 
    img: cert5 
  },
  { 
    title: 'NIH Research Ethics', 
    issuer: 'National Institute of Health', 
    date: '05/2018', 
    link: 'https://oir.nih.gov/sourcebook/ethical-conduct/research-ethics', 
    desc: 'Research ethics certification for conducting IRB-approved human-centered and social policy research.', 
    img: cert6 
  },
];

export default function CertificationsSection() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
      gap: '1.25rem' 
    }}>
      {CERTS.map((cert, i) => (
        <motion.a 
          key={cert.title} 
          href={cert.link} 
          target="_blank" 
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: i * 0.07, duration: 0.3 }}
          whileHover={{ y: -5, scale: 1.02 }}
          style={{ 
            display: 'block', 
            borderRadius: '0.75rem', 
            border: `2px solid ${BORDER}`, // Thicker border
            background: 'rgba(255,255,255,0.9)', 
            backdropFilter: 'blur(10px)', 
            overflow: 'hidden', 
            textDecoration: 'none', 
            transition: 'all 0.3s ease' 
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = PINK}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = BORDER}
        >
          {/* Header Image Area */}
          <div style={{ position: 'relative', paddingBottom: '50%', background: DEEP }}>
            <img 
              src={cert.img} 
              alt={cert.title} 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                opacity: 0.9 // High visibility
              }} 
            />
            
            {/* View Badge */}
            <div style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4, 
              background: PINK, // Solid brand color for badge
              borderRadius: 4, 
              padding: '4px 10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <ExternalLink style={{ width: 10, height: 10, color: '#fff' }} />
              <span style={{ 
                fontSize: '0.55rem', 
                fontFamily: 'JetBrains Mono, monospace', 
                color: '#fff', 
                fontWeight: 800,
                letterSpacing: '0.1em' 
              }}>VIEW</span>
            </div>
          </div>

          {/* Text Content */}
          <div style={{ padding: '1.2rem' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: 800, color: DEEP }}>
              {cert.title}
            </h3>
            <p style={{ 
              margin: '0 0 10px', 
              fontSize: '0.65rem', 
              fontFamily: 'JetBrains Mono, monospace', 
              color: PINK,
              fontWeight: 700 
            }}>
              {cert.issuer} · {cert.date}
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: '0.78rem', 
              color: 'rgba(15,0,30,0.7)', 
              lineHeight: 1.55 
            }}>
              {cert.desc}
            </p>
          </div>
        </motion.a>
      ))}
    </div>
  );
}