import { motion } from 'framer-motion';
import { ExternalLink, Code, Clock } from 'lucide-react';

const PINK = '#E01880';

export const PROJECTS = [
  { 
    title: 'Python & Statistics Analysis', 
    desc: 'Data analysis over a restaurant industry dataset applying statistical methods, data cleaning, and Python visualization.', 
    tech: ['Python', 'Pandas', 'NumPy', 'Seaborn', 'Statistics'], 
    link: 'https://github.com/lancelot-nk/lancelot-nk-github-io/blob/main/PythonAndStats_LancelotNK.ipynb', 
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'ML Recommendation System', 
    desc: 'Machine learning model over an Amazon item dataset applying model tuning, Scikit-Learn pipelines, and evaluation metrics.', 
    tech: ['Python', 'Scikit-Learn', 'ML', 'Model Tuning', 'Jupyter'], 
    link: 'https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKaneRecommendationSystemsFullLearnerNotebookComplete%20(1).ipynb', 
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'AI Music Recommendation', 
    desc: 'AI-driven hybrid SVD system for music recommendation over a large dataset, applying deep learning and collaborative filtering.', 
    tech: ['Python', 'AI', 'SVD', 'Deep Learning', 'NLP'], 
    link: 'https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKane_Music_Recommendation_System_Full_Code%20(2).ipynb', 
    img: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Azure SQL & Cloud Integration', 
    desc: 'Hybrid BLOB storage architecture with Azure SQL and NoSQL over a Kaggle sales dataset, applying cloud ETL and data lake design.', 
    tech: ['Azure', 'SQL', 'NoSQL', 'Blob Storage', 'ETL'], 
    link: 'https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKaneAzureSqlNotebook.ipynb', 
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=450&fit=crop&q=80' 
  },
];

const COMING_SOON = [
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
];

/**
 * @param {{ project: any, i: number, comingSoon?: boolean }} props
 */
function ProjectCard({ project, i, comingSoon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      style={{ 
        borderRadius: '0.75rem', 
        border: `1px solid ${comingSoon ? 'rgba(224,24,128,0.1)' : 'rgba(224,24,128,0.18)'}`, 
        background: comingSoon ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)', 
        backdropFilter: 'blur(10px)', 
        overflow: 'hidden', 
        opacity: comingSoon ? 0.6 : 1 
      }}
    >
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: 'rgba(255,200,230,0.15)' }}>
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
              opacity: 0.6 
            }} 
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock style={{ width: 40, height: 40, color: 'rgba(224,24,128,0.25)' }} />
          </div>
        )}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.9) 100%)' 
        }} />
        {!comingSoon && (
          <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              background: 'rgba(255,255,255,0.85)', 
              borderRadius: 6, 
              padding: '4px 9px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4, 
              textDecoration: 'none' 
            }}
          >
            <ExternalLink style={{ width: 11, height: 11, color: PINK }} />
            <span style={{ 
              fontSize: '0.58rem', 
              fontFamily: 'JetBrains Mono, monospace', 
              color: PINK, 
              letterSpacing: '0.1em' 
            }}>OPEN</span>
          </a>
        )}
        {comingSoon && (
          <div style={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            background: 'rgba(224,24,128,0.1)', 
            border: '1px solid rgba(224,24,128,0.2)', 
            borderRadius: 999, 
            padding: '3px 10px', 
            fontSize: '0.6rem', 
            fontFamily: 'JetBrains Mono, monospace', 
            color: PINK 
          }}>
            Coming Soon
          </div>
        )}
      </div>
      <div style={{ padding: '0.9rem 1.1rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <Code style={{ width: 13, height: 13, color: 'rgba(224,24,128,0.4)', flexShrink: 0 }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2D0040', margin: 0 }}>{project.title}</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(60,0,60,0.5)', lineHeight: 1.6, margin: '0 0 0.65rem' }}>{project.desc}</p>
        {project.tech.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {project.tech.map((/** @type {string} */ t) => (
              <span 
                key={t} 
                style={{ 
                  fontSize: '0.6rem', 
                  fontFamily: 'JetBrains Mono, monospace', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.07em', 
                  padding: '3px 7px', 
                  border: '1px solid rgba(224,24,128,0.2)', 
                  borderRadius: 4, 
                  color: 'rgba(180,0,100,0.7)', 
                  background: 'rgba(224,24,128,0.05)' 
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
        gap: '1.1rem', 
        marginBottom: '1.5rem' 
      }}>
        {PROJECTS.map((p, i) => <ProjectCard key={p.title} project={p} i={i} />)}
      </div>
      <div style={{ 
        height: 1, 
        background: 'linear-gradient(to right, transparent, rgba(224,24,128,0.2), transparent)', 
        margin: '0.5rem 0 1.25rem' 
      }} />
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', 
        gap: '1.1rem' 
      }}>
        {COMING_SOON.map((p, i) => (
          <ProjectCard key={i} project={p} i={PROJECTS.length + i} comingSoon />
        ))}
      </div>
    </div>
  );
}