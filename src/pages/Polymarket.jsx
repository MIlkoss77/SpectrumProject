import React, { useState, useEffect, useMemo, memo } from 'react';
import { Layers, Search, Zap, Wallet as WalletIcon, TrendingUp, TrendingDown, Clock, ShieldCheck, ExternalLink, Loader2, AlertCircle, Info, BarChart3, Binary } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '@/components/ui/Skeleton';
import SentimentBar from '@/components/analytics/SentimentBar';
import { agentService, polyInsights } from '@/services/ai/polymarketAgent';
import './dashboard.css';

const API_BASE = '/api';

// --- Optimized Components ---

const MarketCard = memo(({ market, insight, onPlaceBet, placing }) => {
    const probability = market.lastTradePrice ? (market.lastTradePrice * 100).toFixed(0) : 50;
    const priceChange = market.priceChange || 0;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="action-card"
            style={{ 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                borderRadius: '24px',
                background: 'rgba(10, 10, 11, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                minHeight: '420px',
                transition: 'border-color 0.3s ease'
            }}
        >
            {/* AI Intelligence Layer Overlay */}
            <AnimatePresence>
                {insight && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '4px 12px', 
                            borderRadius: '100px', 
                            background: 'rgba(0, 255, 255, 0.08)', 
                            border: '1px solid rgba(0, 255, 255, 0.15)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00FFFF', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#00FFFF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {insight.verdict}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header: Icon & Market Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ 
                    width: '48px', height: '48px', borderRadius: '14px', 
                    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' 
                }}>
                    {market.icon ? <img src={market.icon} alt="Market" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Layers size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Liquidity</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>${(market.liquidity / 1e3).toFixed(0)}K</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: priceChange >= 0 ? '#00E396' : '#FF4560' }}>
                        {priceChange >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                        {Math.abs(priceChange * 100).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Title */}
            <h3 style={{ 
                fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '16px', 
                lineHeight: '1.25', letterSpacing: '-0.01em', height: '64px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' 
            }}>
                {market.question}
            </h3>

            {/* Analytics Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {/* Probability Bar */}
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px', padding: '0 2px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Binary size={10} /> Probability
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>{probability}% YES</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <motion.div 
                            initial={{ width: '50%' }}
                            animate={{ width: `${probability}%` }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)', borderRadius: '99px', boxShadow: '0 0 10px rgba(34,211,238,0.2)' }}
                        />
                    </div>
                </div>

                {/* AI Sentiment Integration */}
                <SentimentBar value={insight?.sentiment || 0} label={insight ? "AI Edge Analysis" : "Market Sentiment"} />
                
                {insight && (
                    <div style={{ background: 'rgba(0, 255, 255, 0.03)', border: '1px solid rgba(0, 255, 255, 0.08)', borderRadius: '12px', padding: '12px' }}>
                        <p style={{ fontSize: '10px', lineHeight: '1.5', color: 'rgba(0, 255, 255, 0.6)', fontWeight: 500, fontStyle: 'italic', margin: 0 }}>
                            "{insight.reasoning}"
                        </p>
                    </div>
                )}
            </div>

            {/* Trading Section: Standardized Buttons */}
            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button 
                    disabled={placing}
                    onClick={() => onPlaceBet(market, 0)}
                    style={{ 
                        position: 'relative', height: '48px', borderRadius: '12px', cursor: 'pointer',
                        background: 'rgba(0, 227, 150, 0.08)', border: '1px solid rgba(0, 227, 150, 0.15)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', overflow: 'hidden', outline: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#00E396'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 227, 150, 0.08)'}
                >
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00E396', transition: 'color 0.2s' }}>YES</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(0,227,150,0.5)', transition: 'color 0.2s' }}>$0.{(market.lastTradePrice * 100).toFixed(0)}</span>
                </button>
                <button 
                    disabled={placing}
                    onClick={() => onPlaceBet(market, 1)}
                    style={{ 
                        position: 'relative', height: '48px', borderRadius: '12px', cursor: 'pointer',
                        background: 'rgba(255, 69, 96, 0.08)', border: '1px solid rgba(255, 69, 96, 0.15)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', overflow: 'hidden', outline: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FF4560'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 69, 96, 0.08)'}
                >
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF4560', transition: 'color 0.2s' }}>NO</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,69,96,0.5)', transition: 'color 0.2s' }}>$0.{(100 - market.lastTradePrice * 100).toFixed(0)}</span>
                </button>
            </div>

            {placing && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: '24px' }}>
                    <Loader2 className="animate-spin" style={{ color: '#00FFFF' }} size={32} />
                </div>
            )}
        </motion.div>
    );
});

// --- Main Page ---

export default function Polymarket() {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('Election');
    const [hotWallet, setHotWallet] = useState(localStorage.getItem('poly_hot_wallet') || '');
    const [isSetupOpen, setIsSetupOpen] = useState(!localStorage.getItem('poly_hot_wallet'));
    const [tempPk, setTempPk] = useState('');
    const [placing, setPlacing] = useState(false);
    const [insights, setInsights] = useState(new Map());

    useEffect(() => {
        handleSearch();
        
        agentService.setCallbacks((newInsights) => {
            setInsights(newInsights);
        });
        
        agentService.start();
        
        return () => agentService.stop();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/polymarket/markets?q=${query}`);
            setMarkets(res.data || []);
        } catch (err) {
            console.error("Fetch markets error:", err);
            setMarkets([
                { id: 'm1', question: 'Will Bitcoin reach $100k before December?', liquidity: 12000000, lastTradePrice: 0.54, priceChange: 0.12, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
                { id: 'm2', question: 'Will US Fed cut rates in Q4?', liquidity: 8500000, lastTradePrice: 0.32, priceChange: -0.05 },
                { id: 'm3', question: 'Who wins the 2024 Presidential Election?', liquidity: 50000000, lastTradePrice: 0.51, priceChange: 0.02 },
                { id: 'm4', question: 'Will Ethereum spot ETF inflows exceed $1B in Week 1?', liquidity: 1500000, lastTradePrice: 0.15, priceChange: -0.10, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWallet = () => {
        if (tempPk.length === 64 || tempPk.length === 66) {
            localStorage.setItem('poly_hot_wallet', tempPk);
            setHotWallet(tempPk);
            setIsSetupOpen(false);
            setTempPk('');
        }
    };

    return (
        <div className="dx-panels" style={{ padding: '0 20px', width: '100%' }}>
            {/* Header / Hero */}
            <div style={{ 
                marginTop: '20px', padding: '32px', borderRadius: '24px', 
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '32px' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Layers size={18} style={{ color: '#00FFFF' }} />
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#00FFFF' }}>Intelligence Wrapper</span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: '-0.02em', margin: 0 }}>
                        POLYMARKET <span style={{ opacity: 0.2 }}>PRO</span>
                    </h1>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '-0.01em', margin: '4px 0 0' }}>
                        AI-Enhanced Narrative Analytics & Zero-Latency Execution
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '18px', marginTop: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', flex: 1 }}>
                        <Search size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input 
                            type="text" 
                            value={query} 
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Search active narratives (Crypto, Politics, Macro...)"
                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#fff', width: '100%', opacity: 0.8 }}
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        style={{ 
                            background: '#00FFFF', color: '#000', fontWeight: 900, fontSize: '11px', padding: '0 24px', height: '44px',
                            borderRadius: '12px', cursor: 'pointer', border: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s'
                        }}
                    >
                        Ingest
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '24px', paddingBottom: '48px' 
            }}>
                {loading ? (
                    [...Array(8)].map((_, i) => (
                        <div key={i} style={{ height: '420px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }} />
                    ))
                ) : (
                    markets.map(m => (
                        <MarketCard 
                            key={m.id} 
                            market={m} 
                            insight={insights.get(m.id)}
                            onPlaceBet={(market, index) => console.log('Place bet', market.id, index)}
                            placing={placing}
                        />
                    ))
                )}
            </div>

            {isSetupOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#0A0A0B', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', borderRadius: '32px', maxWidth: '380px', width: '100%', textAlign: 'center' }}
                    >
                        <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Initialize Wallet</h2>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>Authorize with your Polygon Private Key to enable one-click trading.</p>
                        
                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'left' }}>
                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(0,255,255,0.5)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Private Key</label>
                            <input 
                                type="password" 
                                value={tempPk}
                                onChange={e => setTempPk(e.target.value)}
                                placeholder="0x..."
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', width: '100%', fontSize: '13px', fontFamily: 'monospace' }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleSaveWallet} style={{ flex: 1, background: '#00FFFF', color: '#000', fontWeight: 900, padding: '16px', borderRadius: '14px', border: 'none', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}>Authorize</button>
                            <button onClick={() => setIsSetupOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '16px 20px', borderRadius: '14px', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div style={{ marginTop: '80px', textAlign: 'center', paddingBottom: '64px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: '0.5em' }}>
                    Spectr Intelligence Engine v5.2 // Analyzing Mappings // Edge Calculation Online
                </span>
            </div>
        </div>
    );
}
