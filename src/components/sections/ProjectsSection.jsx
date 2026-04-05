import { motion } from 'framer-motion';
import { ExternalLink, Code, Clock } from 'lucide-react';

// ── Image Imports ───────────────────────────────────────────────────────────
// These must match the names of the files you drop into src/assets/
import img1 from '../assets/project1.jpg';
import img2 from '../assets/project2.jpg';
import img3 from '../assets/project3.jpg';
import img4 from '../assets/project4.jpg';

// ── Brand Colors ────────────────────────────────────────────────────────────
const PINK   = '#B8004E';
const VIOLET = '#5800B8';
const DEEP   = '#0F001E';
const MID    = '#320040';
const SOFT   = '#6A0A50';
const MUTED  = '#4A1040';
const BORDER = 'rgba(184,0,78,0.22)';

export const PROJECTS = [
  { 
    title: 'Python & Statistics Analysis', 
    desc: 'Data analysis over a restaurant industry dataset applying statistical methods, data cleaning, and Python visualization.', 
    tech: ['Python', 'Pandas', 'NumPy', 'Seaborn', 'Statistics'], 
    link: '/PythonAndStats_LancelotNK.ipynb', 
    img: img1 
  },
  { 
    title: 'ML Recommendation System', 
    desc: 'Machine learning model over an Amazon item dataset applying model tuning, Scikit-Learn pipelines, and evaluation metrics.', 
    tech: ['Python', 'Scikit-Learn', 'ML', 'Model Tuning', 'Jupyter'], 
    link: '/LancelotNaipierKaneRecommendationSystemsFullLearnerNotebookComplete%20(1).ipynb', 
    img: img2 
  },
  { 
    title: 'AI Music Recommendation', 
    desc: 'AI-driven hybrid SVD system for music recommendation over a large dataset, applying deep learning and collaborative filtering.', 
    tech: ['Python', 'AI', 'SVD', 'Deep Learning', 'NLP'], 
    link: '/LancelotNaipierKane_Music_Recommendation_System_Full_Code%20(2).ipynb', 
    img: img3 
  },
  { 
    title: 'Azure SQL & Cloud Integration', 
    desc: 'Hybrid BLOB storage architecture with Azure SQL and NoSQL over a Kaggle sales dataset, applying cloud ETL and data lake design.', 
    tech: ['Azure', 'SQL', 'NoSQL', 'Blob Storage', 'ETL'], 
    link: '/LancelotNaipierKaneAzureSqlNotebook.ipynb', 
    img: img4 
  },
];

const COMING_SOON = [
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
];

function ProjectCard({ project, i, comingSoon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!comingSoon ? { y: -8, scale: 1.015 } : {}}
      transition={{ delay: i * 0.07, duration: 0.3, ease: "easeOut" }}
      style={{ 
        borderRadius: '0.75rem', 
        border: `2px solid ${comingSoon ? 'rgba(184,0,78,0.1)' : BORDER}`, 
        background: comingSoon ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)', 
        backdropFilter: 'blur(10px)', 
        overflow: 'hidden', 
        opacity: comingSoon ? 0.6 : 1,
        boxShadow: comingSoon ? 'none' : '0 4px 20px rgba(15,0,30,0.05)'
      }}
    >
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: DEEP }}>
        {project.img ? (
          <img 
            src={project.img} 
            alt={project.title} 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              opacity: 1 
            }} 
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock style={{ width: 40, height: 40, color: 'rgba(184,0,78,0.25)' }} />
          </div>
        )}

        {!comingSoon && (
          <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              position: 'absolute', 
              top: 12, 
              right: 12, 
              background: PINK, 
              borderRadius: 6, 
              padding: '6px 12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 10
            }}
          >
            <ExternalLink style={{ width: 12, height: 12, color: '#fff' }} />
            <span style={{ 
              fontSize: '0.6rem', 
              fontFamily: 'JetBrains Mono, monospace', 
              color: '#fff', 
              fontWeight: 800,
              letterSpacing: '0.1em' 
            }}>VIEW DOC</span>
          </a>
        )}
      </div>

      <div style={{ padding: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <Code style={{ width: 14, height: 14, color: PINK, flexShrink: 0 }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: DEEP, margin: 0 }}>{project.title}</h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: MID, lineHeight: 1.6, margin: '0 0 1rem', opacity: 0.85 }}>{project.desc}</p>
        
        {project.tech.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {project.tech.map((t) => (
              <span 
                key={t} 
                style={{ 
                  fontSize: '0.62rem', 
                  fontFamily: 'JetBrains Mono, monospace', 
                  textTransform: 'uppercase', 
                  fontWeight: 700,
                  letterSpacing: '0.05em', 
                  padding: '4px 8px', 
                  border: `1px solid ${BORDER}`, 
                  borderRadius: 4, 
                  color: SOFT, 
                  background: 'rgba(106,10,80,0.06)' 
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        {PROJECTS.map((p, i) => <ProjectCard key={p.title} project={p} i={i} />)}
      </div>
      
      <div style={{ 
        height: 2, 
        background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`, 
        margin: '1rem 0 2rem' 
      }} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', 
        gap: '1.5rem' 
      }}>
        {COMING_SOON.map((p, i) => (
          <ProjectCard key={i} project={p} i={PROJECTS.length + i} comingSoon />
        ))}
      </div>
    </div>
  );
}