import React, { useEffect, useState, useMemo } from 'react'
import { getNews, getSocialBuzz, getScoutSignals } from '@/services/providers/news'
import { Globe, Zap, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Newspaper, Twitter, MessageCircle, Layers, Filter, Activity } from 'lucide-react'
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

  return (
    <div className="action-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        width: '100%',
        padding: '20px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(15, 15, 20, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)'
      }}>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            {isReddit ? <MessageCircle size={18} className="text-[#FF4500]" /> : <Twitter size={18} className="text-cyan-400" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 leading-none mb-1 uppercase tracking-widest">{item.sub || item.source}</span>
            <span className="text-[8px] font-mono text-white/20">@{item.author}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
            <Activity size={10} className="text-cyan-400" />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{item.velocity} VEL</span>
          </div>
        </div>

        <h3 className="text-sm font-bold leading-tight mb-4 group-hover:text-cyan-400 transition-colors line-clamp-4 tracking-tight">
          {item.title}
        </h3>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
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
            className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-all border border-white/5 shadow-xl">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

function NewsCard({ item }) {
  const impactColors = { HIGH: '#ef4444', MED: '#eab308', LOW: '#9ca3af' }
  const sentimentColors = { BULLISH: '#22d3ee', BEARISH: '#ef4444', NEUTRAL: '#9ca3af' }
  const isPositive = item.sentiment === 'BULLISH'

  return (
    <div className="action-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        width: '100%',
        padding: '20px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        borderColor: isPositive ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
        background: 'rgba(15, 15, 20, 0.8)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)'
      }}>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Newspaper size={18} className="text-white/40" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 leading-none mb-1 uppercase tracking-widest">{item.time}</span>
            <span className="text-[8px] font-mono text-white/20">{item.domain}</span>
          </div>
          <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest"
            style={{
              color: impactColors[item.impact] || impactColors.MED,
              borderColor: `${impactColors[item.impact] || impactColors.MED}20`,
              background: `${impactColors[item.impact] || impactColors.MED}05`
            }}>
            {item.impact}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-tight mb-4 group-hover:text-cyan-400 transition-colors line-clamp-4 tracking-tight">
          {item.title}
        </h3>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] font-black text-cyan-400/50 uppercase tracking-widest">#{tag}</span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {item.sentiment !== 'NEUTRAL' && (
              <div className="flex items-center justify-center p-1.5 rounded-lg bg-white/5" style={{ color: sentimentColors[item.sentiment] }}>
                <SentimentIcon sentiment={item.sentiment} />
              </div>
            )}
            <a href={item.url || '#'} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-all border border-white/5 shadow-xl">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoutCard({ item }) {
  const isHot = item.intelScore >= 80;
  const dex = item.dexData;

  return (
    <div className="action-card group relative overflow-hidden transition-all duration-300"
      style={{ 
        padding: '20px',
        borderRadius: '24px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: isHot ? '1px solid rgba(255, 69, 96, 0.3)' : '1px solid rgba(255,255,255,0.05)',
        background: isHot ? 'rgba(255, 69, 96, 0.05)' : 'rgba(15, 15, 20, 0.8)'
      }}>
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-cyan-400 overflow-hidden">
              {item.photo ? <img src={item.photo} alt="Token" className="w-full h-full object-cover" /> : 'Intel'}
            </div>
            <div>
              <div className="font-bold text-sm text-white uppercase">{item.channel}</div>
              <div className="text-[10px] text-white/40 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</div>
            </div>
        </div>
        <div className="flex flex-col items-end">
          <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isHot ? 'bg-red-500 text-white shadow-[0_0_10px_#FF4560]' : 'bg-white/5 text-white/40'}`}>
            {isHot ? 'HIGH ALPHA' : 'SCOUT SIGNAL'}
          </div>
          {dex && (
             <div className="text-[9px] font-black text-green-400 mt-1">
                {dex.change5m > 0 ? '+' : ''}{dex.change5m}% (5m)
             </div>
          )}
        </div>
      </div>

      <p className="text-sm font-medium leading-relaxed mb-4 text-white/90 line-clamp-4 tracking-tight">
        {item.text}
      </p>

      {item.tickers.length > 0 && (
         <div className="flex gap-2 mb-4">
            {item.tickers.map(t => (
               <span key={t} className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">#{t}</span>
            ))}
         </div>
      )}

      {dex && (
        <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest">
           <div>
             <span className="text-white/20">Vol 24h:</span>
             <span className="text-white ml-1">${(dex.volume24h / 1e3).toFixed(1)}K</span>
           </div>
           <div className="text-right">
             <span className="text-white/20">Liq:</span>
             <span className="text-white ml-1">${(dex.liquidity / 1e3).toFixed(1)}K</span>
           </div>
        </div>
      )}
      
      {item.contractAddress && (
         <div className="mt-2 text-[8px] font-mono text-white/20 break-all bg-black/40 p-1.5 rounded-lg border border-white/5">
            {item.contractAddress.address}
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

  const [activeTab, setActiveTab] = useState('ARTICLES') // ARTICLES | SOCIAL | DEGEN
  const [lang, setLang] = useState('ALL')
  const [impact, setImpact] = useState('ALL')
  const [selectedCluster, setSelectedCluster] = useState(null)

  const [socialBuzz, setSocialBuzz] = useState([])
  const [socialLoading, setSocialLoading] = useState(false)

  const [scoutSignals, setScoutSignals] = useState([])
  const [scoutLoading, setScoutLoading] = useState(false)

  useEffect(() => {
    // 1. Instant load from cache
    const cache = localStorage.getItem('sp_news_cache');
    if (cache) {
      try {
        const parsed = JSON.parse(cache);
        setRows(parsed.items || []);
        setClusters(parsed.clusters || []);
        setLoading(false); // Hide skeletons immediately if cache exists
      } catch (e) {}
    }

    // 2. Background fresh fetch
    getNews()
      .then(r => {
        setRows(r.items)
        setClusters(r.clusters || [])
        setLoading(false)
      })
      .catch(e => {
        if (!cache) { // Only show error if we have no cached data at all
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
        // Simple cluster filter by primary tag
        const tag = selectedCluster.split('-')[1];
        if (!r.tags?.includes(tag)) return false;
      }
      if (lang !== 'ALL' && r.lang && r.lang !== lang) return false
      if (impact !== 'ALL' && r.impact && r.impact !== impact) return false
      return true
    })
  }, [rows, lang, impact, selectedCluster])

  return (
    <div className="dx-panels w-full animate-in">

      <div className="overview-hero">
        <div className="hero-header">
          <div className="hero-title">
            <Newspaper size={20} className="text-cyan-400" />
            <span className="tracking-widest font-bold text-sm uppercase">Spectr Terminal [NEWS]</span>
          </div>
          <div className="flex gap-2">
            <button className={`dx-tag transition-all ${activeTab === 'ARTICLES' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-white/5 text-white/40 border-white/5'}`} onClick={() => setActiveTab('ARTICLES')}>FIREHOSE</button>
            <button className={`dx-tag transition-all ${activeTab === 'SOCIAL' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-white/5 text-white/40 border-white/5'}`} onClick={() => setActiveTab('SOCIAL')}>SOCIAL RADAR</button>
            <button className={`dx-tag transition-all ${activeTab === 'DEGEN' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-white/5 text-white/40 border-white/5'}`} onClick={() => setActiveTab('DEGEN')}>DEGEN INTEL</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/40 text-sm max-w-3xl">
            {activeTab === 'DEGEN' ? 'Real-time Telegram scraping for high-alpha meme coin listings and whale alerts.' : 'High-volume real-time ingestion from 10+ global sources. Multi-narrative clustering analysis.'}
          </p>

          <div className="flex gap-3">
             {selectedCluster && (
               <button 
                 onClick={() => setSelectedCluster(null)}
                 className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase"
               >
                 Clear Cluster: {selectedCluster.split('-')[1]}
               </button>
             )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold ${activeTab === 'DEGEN' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-white/10 text-cyan-400'}`}>
               <Zap size={10} /> {activeTab === 'DEGEN' ? 'ALIVE' : 'LIVE'}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Clusters */}
      {!loading && activeTab === 'ARTICLES' && clusters.length > 0 && (
        <div className="mb-8">

          <div className="flex items-center gap-3 mb-4">
            <Layers size={16} className="text-cyan-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Trending Narratives</h3>
          </div>
          <div className="dx-grid-premium">

            {clusters.slice(0, 8).map(c => (
              <ClusterCard 
                key={c.id} 
                cluster={c} 
                onSelect={setSelectedCluster} 
                isActive={selectedCluster === c.id} 
              />
            ))}
          </div>
        </div>
      )}

      {(loading || (activeTab === 'SOCIAL' && socialLoading) || (activeTab === 'DEGEN' && scoutLoading)) && (
        <div className="dx-grid-premium">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="action-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', minHeight: '160px' }}>
              <Skeleton style={{ width: '40%', height: '10px', marginBottom: '12px' }} />
              <Skeleton style={{ width: '100%', height: '20px', marginBottom: '8px' }} />
              <Skeleton style={{ width: '80%', height: '20px' }} />
            </div>
          ))}
        </div>
      )}

      {error && <div className="dx-error p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-bold">{error}</div>}

      {!(loading || (activeTab === 'SOCIAL' && socialLoading) || (activeTab === 'DEGEN' && scoutLoading)) && !error && (
        <div className="dx-grid-premium" style={{ 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>

          {activeTab === 'ARTICLES' ? (
            <>
              {filtered.length === 0 && <div className="col-span-full py-20 text-center text-white/20 font-bold italic">No data matched your filters</div>}
              {filtered.map(n => <NewsCard key={n.id} item={n} />)}
            </>
          ) : activeTab === 'SOCIAL' ? (
            <>
              {socialBuzz.length === 0 && <div className="col-span-full py-20 text-center text-white/20 font-bold italic">Gathering social velocity...</div>}
              {socialBuzz.map(item => <ViralCard key={item.id} item={item} />)}
            </>
          ) : (
            <>
              {scoutSignals.length === 0 && <div className="col-span-full py-20 text-center text-white/20 font-bold italic">Searching for high-alpha plays...</div>}
              {scoutSignals.map(item => <ScoutCard key={item.id} item={item} />)}
            </>
          )}
        </div>
      )}

      <div className="mt-12 text-center text-[10px] font-black text-white/10 uppercase tracking-[0.2em] border-t border-white/5 pt-8">
        Spectr Intelligence Engine v4.5 // Aggregating 10+ Sources // Hot Load Multi-Cluster
      </div>
    </div>
  )
}

