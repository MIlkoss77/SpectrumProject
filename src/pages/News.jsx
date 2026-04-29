import React, { useEffect, useState, useMemo } from 'react'
import { getNews, getSocialBuzz, getScoutSignals } from '@/services/providers/news'
import { Globe, Zap, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Newspaper, Twitter, MessageCircle, Layers, Filter, Activity, Bot } from 'lucide-react'
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
      className={`action-card group cursor-pointer transition-all duration-300 ${
        isActive ? 'ring-2 ring-cyan-500/50 bg-cyan-500/5' : ''
      }`}
      style={{ 
        width: '100%', 
        padding: '20px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        border: isActive ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
        background: isActive ? 'rgba(0, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="flex justify-between items-start mb-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Layers size={18} className="text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{cluster.name}</span>
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{cluster.count} STORIES</span>
          </div>
        </div>
        {isActive && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />}
      </div>
      
      <h4 className="text-lg font-bold text-white mb-6 line-clamp-3 leading-tight tracking-tight">
        {cluster.topStory}
      </h4>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="w-8 h-8 rounded-full bg-[#111] border-2 border-black flex items-center justify-center text-xs shadow-xl">
               {['🔥', '📈', '⚡'][i]}
             </div>
          ))}
        </div>
        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Analyze Narrative →</div>
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
              {isReddit ? <MessageCircle size={16} color={accentColor} /> : <Twitter size={16} color={accentColor} />}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{item.sub || item.source}</span>
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
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{item.domain}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{item.time}</span>
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
            {item.tags.slice(0, 2).map(tag => (
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
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${accentColor}10`, border: `1px solid ${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {item.photo ? <img src={item.photo} alt="Token" className="w-full h-full object-cover" /> : <Bot size={16} color={accentColor} />}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{item.channel}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{new Date(item.timestamp).toLocaleTimeString()}</span>
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

      {item.tickers.length > 0 && (
         <div className="flex gap-2 flex-wrap mb-2">
            {item.tickers.map(t => (
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
        setRows(r.items)
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

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (selectedCluster) {
        const tag = selectedCluster.split('-')[1];
        if (!r.tags?.includes(tag)) return false;
      }
      return true
    })
  }, [rows, selectedCluster])

  return (
    <div className="w-full animate-in flex flex-col gap-6" style={{ padding: '0 20px 100px 20px' }}>
      
      {/* Top Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[24px] bg-white/[0.02] border border-white/5 backdrop-blur-xl mt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <Newspaper size={20} className="text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white uppercase">Intelligence Hub</h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
               <span className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest">Aggregating 10+ Sources</span>
            </div>
          </div>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 gap-1">
          {['ARTICLES', 'SOCIAL', 'DEGEN'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'ARTICLES' ? 'News' : tab === 'SOCIAL' ? 'Buzz' : 'Alpha'}
            </button>
          ))}
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
              socialBuzz.map(item => <ViralCard key={item.id} item={item} />)
            ) : (
              scoutSignals.map(item => <ScoutCard key={item.id} item={item} />)
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

