import React, { useEffect, useState, useMemo } from 'react'
import { getNews } from '@/services/providers/news'
import { Globe, Zap, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Newspaper, Twitter, MessageCircle, Layers, Filter } from 'lucide-react'
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

function TweetCard({ tweet }) {
  return (
    <div className="action-card relative overflow-hidden transition-all duration-300 border-l-[4px] border-l-[#1da1f2]"
      style={{ 
        padding: '20px',
        borderRadius: '24px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
      <div className="flex justify-between mb-6">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl border border-white/10 shadow-lg">
            {tweet.avatar}
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-1 text-white">
              {tweet.author}
              {tweet.verified && <div className="w-3.5 h-3.5 bg-[#1da1f2] rounded-full flex items-center justify-center text-[8px] text-white font-black">✓</div>}
            </div>
            <div className="text-[10px] text-white/40 font-mono lower">@{tweet.handle}</div>
          </div>
        </div>
        <Twitter size={20} color="#1da1f2" />
      </div>

      <p className="text-base font-medium leading-relaxed mb-4 text-white/90 line-clamp-4 tracking-tight">
        {tweet.text}
      </p>

      <div className="mt-auto flex justify-between items-center text-[10px] text-white/30 pt-6 border-t border-white/5 font-bold uppercase tracking-widest">
        <span>{tweet.time}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><MessageCircle size={14} /> {tweet.replies}</span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-black"><Zap size={14} /> {tweet.likes}</span>
        </div>
      </div>
    </div>
  )
}


const MOCK_TWEETS = [
  { id: 1, author: 'Vitalik.eth', handle: 'VitalikButerin', avatar: '🧙‍♂️', verified: true, text: 'Rollups are the future of Ethereum scaling. The latest benchmarks show exciting progress.', time: '2m ago', likes: '12.5K', replies: 842 },
  { id: 2, author: 'CZ 🔶', handle: 'cz_binance', avatar: '🔶', verified: true, text: 'Funds are SAFU. 🛡️', time: '15m ago', likes: '45K', replies: 2100 },
  { id: 3, author: 'Whale Alert', handle: 'whale_alert', avatar: '🐳', verified: true, text: '🚨 10,000 #ETH (35,420,000 USD) transferred from #Binance to Unknown wallet.', time: '42m ago', likes: '2.1K', replies: 154 },
  { id: 4, author: 'Miles Deutscher', handle: 'milesdeutscher', avatar: '🧢', verified: true, text: 'The altcoin market structure looks incredibly bullish here. $SOL breaking out.', time: '1h ago', likes: '3.4K', replies: 320 },
]

export default function News() {
  const [rows, setRows] = useState([])
  const [clusters, setClusters] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('ARTICLES') // ARTICLES | SOCIAL
  const [lang, setLang] = useState('ALL')
  const [impact, setImpact] = useState('ALL')
  const [selectedCluster, setSelectedCluster] = useState(null)

  useEffect(() => {
    getNews()
      .then(r => {
        setRows(r.items)
        setClusters(r.clusters || [])
        setLoading(false)
      })
      .catch(e => {
        setError(e?.message || 'Failed to load news')
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (selectedCluster) {
        // Simple cluster filter by primary tag
        const tag = selectedCluster.split('-')[1];
        if (!r.tags.includes(tag)) return false;
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
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/40 text-sm max-w-3xl">
            High-volume real-time ingestion from 10+ global sources. Multi-narrative clustering analysis.
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-cyan-400">
               <Zap size={10} /> LIVE
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

      {loading && (
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

      {!loading && !error && (
        <div className="dx-grid-premium" style={{ 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>

          {activeTab === 'ARTICLES' ? (
            <>
              {filtered.length === 0 && <div className="col-span-full py-20 text-center text-white/20 font-bold italic">No data matched your filters</div>}
              {filtered.map(n => <NewsCard key={n.id} item={n} />)}
            </>
          ) : (
            MOCK_TWEETS.map(t => <TweetCard key={t.id} tweet={t} />)
          )}
        </div>
      )}

      <div className="mt-12 text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] border-t border-white/5 pt-8">
        Spectr Intelligence Engine v4.5 // Aggregating 10+ Sources // Hot Load Multi-Cluster
      </div>
    </div>
  )
}

