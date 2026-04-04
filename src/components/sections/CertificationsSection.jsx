import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const PINK = '#E01880';

const CERTS = [
  { 
    title: 'Applied AI & Data Science', 
    issuer: 'MIT', 
    date: '10/2026', 
    link: 'https://professional-education-gl.mit.edu/mit-online-data-science-program', 
    desc: 'Python, TensorFlow, Keras, Transformers, Hugging Face, LangChain, NLP, Generative AI, Deep Learning, AWS Cloud.', 
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Azure Data Fundamentals DP-900', 
    issuer: 'Microsoft', 
    date: '10/2025', 
    link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/', 
    desc: 'Azure SQL, Cosmos DB, Synapse Analytics, Data Factory, Power BI, Blob Storage, ETL/ELT, Data Lake Gen2.', 
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Ethical Emerging Technologist', 
    issuer: 'CertNexus', 
    date: '12/2021', 
    link: 'https://certnexus.com/certified-ethical-emerging-technologist-ceet/', 
    desc: 'Professional certification in ethical AI and emerging technology governance practices.', 
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Google Project Management', 
    issuer: 'Google Grow', 
    date: '12/2021', 
    link: 'https://grow.google/certificates/project-management/', 
    desc: 'Comprehensive project management methodology, Agile, Scrum, and stakeholder engagement practices.', 
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Project Management Essentials', 
    issuer: 'Management & Strategy Institute', 
    date: '08/2021', 
    link: '#', 
    desc: 'Foundational project management principles, resource planning, and quality assurance frameworks.', 
    img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'NIH Research Ethics', 
    issuer: 'National Institute of Health', 
    date: '05/2018', 
    link: 'https://oir.nih.gov/sourcebook/ethical-conduct/research-ethics', 
    desc: 'Research ethics certification for conducting IRB-approved human-centered and social policy research.', 
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop&q=80' 
  },
];

export default function CertificationsSection() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
      gap: '1rem' 
    }}>
      {CERTS.map((cert, i) => (
        <motion.a 
          key={cert.title} 
          href={cert.link} 
          target="_blank" 
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: i * 0.07 }}
          whileHover={{ scale: 1.02 }}
          style={{ 
            display: 'block', 
            borderRadius: '0.75rem', 
            border: '1px solid rgba(224,24,128,0.12)', 
            background: 'rgba(255,255,255,0.75)', 
            backdropFilter: 'blur(10px)', 
            overflow: 'hidden', 
            textDecoration: 'none', 
            transition: 'border-color 0.3s' 
          }}
          onMouseEnter={(/** @type {any} */ e) => e.currentTarget.style.borderColor = 'rgba(224,24,128,0.35)'}
          onMouseLeave={(/** @type {any} */ e) => e.currentTarget.style.borderColor = 'rgba(224,24,128,0.12)'}
        >
          <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
            <img 
              src={cert.img} 
              alt={cert.title} 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                opacity: 0.55 
              }} 
            />
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.95) 100%)' 
            }} />
            <div style={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4, 
              background: 'rgba(255,255,255,0.85)', 
              borderRadius: 6, 
              padding: '4px 8px' 
            }}>
              <ExternalLink style={{ width: 10, height: 10, color: PINK }} />
              <span style={{ 
                fontSize: '0.58rem', 
                fontFamily: 'JetBrains Mono, monospace', 
                color: PINK, 
                letterSpacing: '0.1em' 
              }}>VIEW</span>
            </div>
          </div>
          <div style={{ padding: '0.85rem 1rem 1rem' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '0.88rem', fontWeight: 600, color: '#2D0040' }}>
              {cert.title}
            </h3>
            <p style={{ 
              margin: '0 0 6px', 
              fontSize: '0.63rem', 
              fontFamily: 'JetBrains Mono, monospace', 
              color: PINK 
            }}>
              {cert.issuer} · {cert.date}
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: '0.75rem', 
              color: 'rgba(60,0,60,0.5)', 
              lineHeight: 1.6 
            }}>
              {cert.desc}
            </p>
          </div>
        </motion.a>
      ))}
    </div>
  );
}