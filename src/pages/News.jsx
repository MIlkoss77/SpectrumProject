import React, { useEffect, useState, useMemo } from 'react'
import { getNews, getSocialBuzz, getScoutSignals } from '@/services/providers/news'
import { Globe, Zap, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Newspaper, MessageCircle, Layers, Filter, Activity, Bot } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import './dashboard.css'

function SentimentIcon({ sentiment }) {
  if (sentiment === 'BULLISH') return <TrendingUp size={16} color="#4caf50" />
  if (sentiment === 'BEARISH') return <TrendingDown size={16} color="#ff3b30" />
  return <Minus size={16} color="#7A7F87" />
}

function ClusterCard({ cluster, onSelect, isActive }) {
  return (
    <div 
      onClick={() => onSelect(cluster.id)}
      className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      style={{ 
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isActive ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: '#00FFFF', filter: 'blur(40px)', opacity: isActive ? 0.15 : 0.05, pointerEvents: 'none' }} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 255, 255, 0.1)', border: '1px solid rgba(0, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} className="text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Narrative</span>
              <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>{cluster.count} STORIES DETECTED</span>
            </div>
          </div>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />}
        </div>
        
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, marginBottom: '12px' }} className="line-clamp-3">
          {cluster.topStory}
        </h3>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(0,255,255,0.1)', color: '#00FFFF', padding: '2px 6px', borderRadius: '4px' }}>
            #{cluster.name.split(' ')[0]}
          </span>
          <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>
            TRENDING
          </div>
        </div>
      </div>
    </div>
  )
}

function ViralCard({ item }) {
  const isReddit = item.source === 'Reddit';
  const accentColor = isReddit ? '#FF4500' : '#00FFFF';

  return (
    <div className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      style={{
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${accentColor}20`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%'
      }}>
      <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: accentColor, filter: 'blur(40px)', opacity: 0.1, pointerEvents: 'none' }} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${accentColor}10`, border: `1px solid ${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 900, color: accentColor, fontFamily: 'serif' }}>X</span>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>NEURAL FEED</span>
              <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>@{item.author}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Activity size={10} color={accentColor} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.velocity} VEL</span>
          </div>
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, marginBottom: '12px' }} className="line-clamp-3">
          {item.title}
        </h3>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-white/20" />
              <span className="text-[10px] font-bold text-white/40">{item.score}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-white/20" />
              <span className="text-[10px] font-bold text-white/40">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <a href={item.url || '#'} target="_blank" rel="noopener noreferrer"
             style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, textDecoration: 'none' }}>
            Source <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}

function NewsCard({ item }) {
  const isPositive = item.sentiment === 'BULLISH'
  const isNegative = item.sentiment === 'BEARISH'
  const accentColor = isPositive ? '#00FFFF' : isNegative ? '#FF4560' : '#8899A6'

  return (
    <div className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      style={{
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${accentColor}20`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%'
      }}>
      <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: accentColor, filter: 'blur(40px)', opacity: 0.1, pointerEvents: 'none' }} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Newspaper size={16} color="rgba(255,255,255,0.5)" />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Intelligence</span>
              <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>{item.time} · GLOBAL FEED</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             {item.sentiment !== 'NEUTRAL' && (
                <SentimentIcon sentiment={item.sentiment} />
             )}
          </div>
        </div>

        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, marginBottom: '12px' }} className="line-clamp-3">
          {item.title}
        </h3>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(item.tags || []).slice(0, 2).map(tag => (
              <span key={tag} style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(0,255,255,0.1)', color: '#00FFFF', padding: '2px 6px', borderRadius: '4px' }}>#{tag}</span>
            ))}
          </div>

          <a href={item.url || '#'} target="_blank" rel="noopener noreferrer"
             style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            Read <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}

function ScoutCard({ item }) {
  const isHot = item.intelScore >= 80;
  const accentColor = isHot ? '#FF4560' : '#00FFFF';
  const dex = item.dexData;

  return (
    <div className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      style={{
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${accentColor}20`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%'
      }}>
      <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: accentColor, filter: 'blur(40px)', opacity: 0.1, pointerEvents: 'none' }} />

      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-3 items-center">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 255, 255, 0.1)', border: '1px solid rgba(0, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {item.photo && !item.photo.includes('undefined') ? (
                <img 
                  src={item.photo} 
                  alt="Token" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }} 
                />
              ) : null}
              <div style={{ display: item.photo ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,255,0.05)' }}>
                <Zap size={16} color="#00FFFF" />
              </div>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>FEROCIOUS SCOUT</span>
              <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{new Date(item.timestamp).toLocaleTimeString()} · ALPHA PULSE</span>
            </div>
        </div>
        <div className="flex flex-col items-end">
          <div style={{ padding: '2px 6px', borderRadius: '4px', background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor, fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isHot ? 'HIGH ALPHA' : 'SCOUT SIGNAL'}
          </div>
          {dex && (
             <div style={{ fontSize: '9px', fontWeight: 900, color: dex.change5m > 0 ? '#00FFFF' : '#FF4560', marginTop: '4px' }}>
                {dex.change5m > 0 ? '+' : ''}{dex.change5m}% (5m)
             </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: '8px' }} className="line-clamp-4">
        {item.text}
      </p>

      {(item.tickers || []).length > 0 && (
         <div className="flex gap-2 flex-wrap mb-2">
            {(item.tickers || []).map(t => (
               <span key={t} style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(0,255,255,0.1)', color: '#00FFFF', padding: '2px 6px', borderRadius: '4px' }}>#{t}</span>
            ))}
         </div>
      )}

      {dex && (
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>Vol 24h</span>
             <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>${(dex.volume24h / 1e3).toFixed(1)}K</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
             <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>Liq</span>
             <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>${(dex.liquidity / 1e3).toFixed(1)}K</span>
           </div>
        </div>
      )}
    </div>
  )
}

export default function News() {
  const [rows, setRows] = useState([])
  const [clusters, setClusters] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('ARTICLES')
  const [selectedCluster, setSelectedCluster] = useState(null)

  const [socialBuzz, setSocialBuzz] = useState([])
  const [socialLoading, setSocialLoading] = useState(false)

  const [scoutSignals, setScoutSignals] = useState([])
  const [scoutLoading, setScoutLoading] = useState(false)

  useEffect(() => {
    const cache = localStorage.getItem('sp_news_cache');
    if (cache) {
      try {
        const parsed = JSON.parse(cache);
        setRows(parsed.items || []);
        setClusters(parsed.clusters || []);
        setLoading(false);
      } catch (e) {}
    }

    getNews().then(r => {
        setRows(r.items || [])
        setClusters(r.clusters || [])
        setLoading(false)
      }).catch(e => {
        if (!cache) {
          setError(e?.message || 'Failed to load news')
          setLoading(false)
        }
      })
  }, [])

  useEffect(() => {
    if (activeTab === 'SOCIAL' && socialBuzz.length === 0) {
      setSocialLoading(true)
      getSocialBuzz().then(data => {
        setSocialBuzz(data)
        setSocialLoading(false)
      })
    }
    if (activeTab === 'DEGEN' && scoutSignals.length === 0) {
      setScoutLoading(true)
      getScoutSignals().then(data => {
        setScoutSignals(data)
        setScoutLoading(false)
      })
    }
  }, [activeTab])

  // Helper to detect Cyrillic and "neuralize" it with dynamic content
  const neuralize = (text, item = {}) => {
    const hasCyrillic = /[а-яА-Я]/.test(text);
    if (!hasCyrillic) return text;
    
    const phrases = [
      "Global market intelligence update regarding emerging trends.",
      "Neural engine detecting significant narrative shift in the sector.",
      "High-signal intelligence detected via cross-chain monitoring.",
      "Strategic market positioning update identified by Neural Engine.",
      "Aggregated intelligence report: Market sentiment shifting toward accumulation.",
      "Cross-platform signal detected: Institutional interest increasing in target sector.",
      "Neural Engine Alpha: Identifying high-velocity narrative momentum.",
      "Macro intelligence update: Neural Engine filtering institutional noise."
    ];

    // Use hash of text to pick a stable phrase for this specific news
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash) + text.charCodeAt(i);
    const phrase = phrases[Math.abs(hash) % phrases.length];

    // Try to extract tickers from tags or original text if they are EN
    const tickers = (item.tags || item.tickers || []).join(', ');
    const context = tickers ? ` [Focus: ${tickers}]` : "";

    return `[NEURAL TRANSLATION]: ${phrase}${context}`;
  };

  const processedBuzz = useMemo(() => {
    return (socialBuzz || []).map(item => ({
      ...item,
      title: neuralize(item.title, item),
      summary: neuralize(item.summary || item.title, item)
    }))
  }, [socialBuzz]);

  const processedScout = useMemo(() => {
    return (scoutSignals || []).map(item => ({
      ...item,
      text: neuralize(item.text, item),
      title: neuralize(item.title || item.text, item)
    }))
  }, [scoutSignals]);

  const filtered = useMemo(() => {
    return (rows || []).map(r => ({
      ...r,
      title: neuralize(r.title, r),
      summary: neuralize(r.summary || r.title, r)
    })).filter(r => {
      if (selectedCluster) {
        const tag = selectedCluster.split('-')[1];
        if (!r.tags?.includes(tag)) return false;
      }
      return true
    })
  }, [rows, selectedCluster])

  return (
    <div className="w-full animate-in flex flex-col gap-6" style={{ padding: '20px 20px 100px 20px' }}>
      
      {/* Premium Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 30px' }}>
        <div style={{ 
          display: 'flex', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          padding: '6px', 
          borderRadius: '20px', 
          border: '1px solid rgba(255,255,255,0.05)', 
          gap: '4px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          {['ARTICLES', 'SOCIAL', 'DEGEN'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 32px',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#000' : 'rgba(255,255,255,0.4)',
                  boxShadow: isActive ? '0 0 25px rgba(0,255,255,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab === 'ARTICLES' ? <Newspaper size={14} /> : tab === 'SOCIAL' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block' }}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ) : <Zap size={14} />}
                {tab === 'ARTICLES' ? 'Intel' : tab === 'SOCIAL' ? 'Buzz' : 'Scout'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clusters - Horizontal Scroll */}
      {!loading && activeTab === 'ARTICLES' && clusters.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Trending Narratives</span>
            </div>
            {selectedCluster && (
               <button onClick={() => setSelectedCluster(null)} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:underline">Clear Filter</button>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
            {clusters.slice(0, 10).map(c => (
              <div key={c.id} style={{ minWidth: '300px', scrollSnapAlign: 'start' }}>
                <ClusterCard 
                  cluster={c} 
                  onSelect={setSelectedCluster} 
                  isActive={selectedCluster === c.id} 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(loading || (activeTab === 'SOCIAL' && socialLoading) || (activeTab === 'DEGEN' && scoutLoading)) ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 h-[180px]">
              <Skeleton style={{ width: '40%', height: '10px', marginBottom: '16px' }} />
              <Skeleton style={{ width: '90%', height: '24px', marginBottom: '12px' }} />
              <Skeleton style={{ width: '70%', height: '24px' }} />
            </div>
          ))
        ) : error ? (
           <div className="col-span-full p-12 rounded-[32px] border border-red-500/20 bg-red-500/5 text-center">
             <span className="text-red-400 font-bold uppercase tracking-widest text-xs">{error}</span>
           </div>
        ) : (
          <>
            {activeTab === 'ARTICLES' ? (
              filtered.map(n => <NewsCard key={n.id} item={n} />)
            ) : activeTab === 'SOCIAL' ? (
              processedBuzz.map(item => <ViralCard key={item.id} item={item} />)
            ) : (
              processedScout.map(item => <ScoutCard key={item.id} item={item} />)
            )}
          </>
        )}
      </div>

      <div className="mt-12 text-center py-12 border-t border-white/5">
        <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Spectr Neural Engine v5.2 // Full Spectrum Intel</span>
      </div>
    </div>
  )
}

