import React, { useEffect, useState, useMemo } from 'react'
import { getNews } from '@/services/providers/news'
import { Globe, Zap, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Newspaper, Twitter, MessageCircle, Loader2 } from 'lucide-react'
import './dashboard.css'

function SentimentIcon({ sentiment }) {
  if (sentiment === 'BULLISH') return <TrendingUp size={16} color="#4caf50" />
  if (sentiment === 'BEARISH') return <TrendingDown size={16} color="#ff3b30" />
  return <Minus size={16} color="#7A7F87" />
}

function NewsCard({ item }) {
  const impactColors = { HIGH: '#ef4444', MED: '#eab308', LOW: '#9ca3af' }
  const sentimentColors = { BULLISH: '#22d3ee', BEARISH: '#ef4444', NEUTRAL: '#9ca3af' }
  const isPositive = item.sentiment === 'BULLISH'

  return (
    <div className="action-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        borderColor: isPositive ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
        background: 'rgba(20, 20, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px'
      }}>

      {/* Hover Glow */}
      <div className={`absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${isPositive ? 'bg-cyan-400' : 'bg-red-400'}`} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-bold text-white/40 flex items-center gap-1.5 uppercase tracking-widest text-nowrap">
            <Clock size={10} /> {item.time}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider text-nowrap"
            style={{
              color: impactColors[item.impact] || impactColors.MED,
              borderColor: `${impactColors[item.impact] || impactColors.MED}40`
            }}>
            {item.impact}
          </span>
        </div>

        <h3 className="text-base font-bold leading-tight mb-3 group-hover:text-cyan-400 transition-colors line-clamp-3">
          {item.title}
        </h3>
      </div>

      <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider"
          style={{ color: sentimentColors[item.sentiment] || sentimentColors.NEUTRAL }}>
          <SentimentIcon sentiment={item.sentiment} />
          {item.sentiment}
        </div>

        <a href={item.url || '#'} target="_blank" rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/60 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-500/30">
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}

function TweetCard({ tweet }) {
  return (
    <div className="action-card relative overflow-hidden transition-all duration-300 border-l-[4px] border-l-[#1da1f2]"
      style={{ background: 'rgba(29, 161, 242, 0.05)', padding: '20px' }}>
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg border border-white/10 shadow-lg">
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
        <Twitter size={18} color="#1da1f2" />
      </div>

      <p className="text-sm leading-relaxed mb-4 text-white/80 line-clamp-4">
        {tweet.text}
      </p>

      <div className="flex justify-between items-center text-[10px] text-white/30 pt-4 border-t border-white/5 font-bold uppercase tracking-widest">
        <span>{tweet.time}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><MessageCircle size={12} /> {tweet.replies}</span>
          <span className="flex items-center gap-1.5 text-cyan-400"><Zap size={12} /> {tweet.likes}</span>
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
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('ARTICLES') // ARTICLES | SOCIAL
  const [lang, setLang] = useState('ALL')
  const [impact, setImpact] = useState('ALL')

  useEffect(() => {
    getNews()
      .then(r => {
        setRows(r.items)
        setLoading(false)
      })
      .catch(e => {
        setError(e?.message || 'Failed to load news')
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (lang !== 'ALL' && r.lang && r.lang !== lang) return false
      if (impact !== 'ALL' && r.impact && r.impact !== impact) return false
      return true
    })
  }, [rows, lang, impact])

  return (
    <div className="dx-panels w-full animate-in">

      <div className="overview-hero">
        <div className="hero-header">
          <div className="hero-title">
            <Newspaper size={20} className="text-cyan-400" />
            <span className="tracking-widest font-bold text-sm uppercase">Market Pulse</span>
          </div>
          <div className="flex gap-2">
            <button className={`dx-tag transition-all ${activeTab === 'ARTICLES' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-white/5 text-white/40 border-white/5'}`} onClick={() => setActiveTab('ARTICLES')}>ARTICLE FEED</button>
            <button className={`dx-tag transition-all ${activeTab === 'SOCIAL' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-white/5 text-white/40 border-white/5'}`} onClick={() => setActiveTab('SOCIAL')}>SOCIAL RADAR</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/40 text-sm max-w-lg">
            Global news aggregation and high-impact social sentiment tracking for tactical advantage.
          </p>

          {activeTab === 'ARTICLES' && (
            <div className="flex gap-3">
              <select value={lang} onChange={e => setLang(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white/60 outline-none focus:border-cyan-500/40 transition-colors">
                <option value="ALL">All Languages</option>
                <option value="EN">English</option>
                <option value="ES">Español</option>
              </select>
              <select value={impact} onChange={e => setImpact(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white/60 outline-none focus:border-cyan-500/40 transition-colors">
                <option value="ALL">All Impact</option>
                <option value="HIGH">High Only</option>
                <option value="MED">Med/High</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-40">
          <Loader2 size={32} className="animate-spin text-cyan-400" />
          <div className="text-xs font-bold uppercase tracking-widest">Compiling Pulse...</div>
        </div>
      )}

      {error && <div className="dx-error p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-bold">{error}</div>}

      {!loading && !error && (
        <div className="dx-grid-premium">
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
        Market insights processed by Spectr Intelligence Engine v4.2
      </div>
    </div>
  )
}
