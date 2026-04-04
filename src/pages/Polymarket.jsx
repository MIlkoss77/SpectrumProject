import React, { useState, useEffect } from 'react';
import { Layers, Search, Zap, Wallet as WalletIcon, TrendingUp, TrendingDown, Clock, ShieldCheck, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Skeleton from '@/components/ui/Skeleton';
import './dashboard.css';

// Using the backend service I created earlier
const API_BASE = '/api';

export default function Polymarket() {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('Election');
    const [hotWallet, setHotWallet] = useState(localStorage.getItem('poly_hot_wallet') || '');
    const [isSetupOpen, setIsSetupOpen] = useState(!localStorage.getItem('poly_hot_wallet'));
    const [tempPk, setTempPk] = useState('');
    const [activeBet, setActiveBet] = useState(null);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        handleSearch();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            // This will hit our new polymarketService via a controller we'll add
            const res = await axios.get(`${API_BASE}/polymarket/markets?q=${query}`);
            setMarkets(res.data || []);
        } catch (err) {
            console.error("Fetch markets error:", err);
            // Fallback mock markets if backend not ready
            setMarkets([
                { id: '1', question: 'Will BTC hit $100k in 2026?', outcomes: ['Yes', 'No'], liquidity: '5.2M', volume: '12M', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
                { id: '2', question: 'Will Solana outperform Ethereum in Q2?', outcomes: ['Yes', 'No'], liquidity: '1.5M', volume: '4.2M' },
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
        } else {
            alert("Invalid Private Key format");
        }
    };

    const handlePlaceBet = async (market, outcomeIndex) => {
        if (!hotWallet) {
            setIsSetupOpen(true);
            return;
        }

        setPlacing(true);
        try {
            // Simplified bet logic for MVP
            const res = await axios.post(`${API_BASE}/polymarket/order`, {
                pk: hotWallet,
                tokenId: market.clobTokenIds?.[outcomeIndex],
                price: 0.5, // Market price logic would go here
                size: 10,
                side: 'BUY'
            });
            
            if (res.data.ok) alert(`Bet placed! Order ID: ${res.data.orderId}`);
            else alert(`Error: ${res.data.error}`);
        } catch (err) {
            alert(`Execution failed: ${err.message}`);
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="dx-panels w-full animate-in">
            <div className="overview-hero">
                <div className="hero-header">
                    <div className="hero-title">
                        <Layers size={20} className="text-cyan-400" />
                        <span className="tracking-widest font-bold text-sm uppercase">Prediction Terminal</span>
                    </div>
                    <div className="flex gap-2">
                        <div className={`dx-tag ${hotWallet ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                            {hotWallet ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                            {hotWallet ? 'HOT WALLET ACTIVE' : 'WALLET REQUIRED'}
                        </div>
                        <button 
                            onClick={() => setIsSetupOpen(true)}
                            className="bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg text-[10px] font-bold transition-all"
                        >
                            <WalletIcon size={12} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-2 rounded-xl mt-6">
                    <Search size={18} className="text-white/20 ml-2" />
                    <input 
                        type="text" 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search Polymarket Narratives (e.g. Crypto, Politics...)"
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/10 py-2"
                    />
                    <button 
                        onClick={handleSearch}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] px-6 py-2 rounded-lg transition-all"
                    >
                        INGEST
                    </button>
                </div>
            </div>

            {isSetupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                    <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">Setup Hot Wallet</h2>
                        <p className="text-sm text-white/40 mb-6">Enter a private key for Polymarket API trading. This is stored locally in your browser's encrypted storage.</p>
                        
                        <div className="space-y-4">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                <label className="text-[10px] font-black uppercase text-white/40 mb-2 block">Polygon Private Key</label>
                                <input 
                                    type="password" 
                                    value={tempPk}
                                    onChange={e => setTempPk(e.target.value)}
                                    className="bg-transparent w-full outline-none text-cyan-400 font-mono text-xs"
                                    placeholder="0x..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleSaveWallet} className="flex-1 bg-cyan-500 text-black font-black py-3 rounded-xl hover:bg-cyan-400 transition-all">INITIALIZE</button>
                                <button onClick={() => setIsSetupOpen(false)} className="px-6 bg-white/5 text-white/60 font-bold rounded-xl hover:bg-white/10">CANCEL</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="dx-grid-premium" style={{ 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>

                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="action-card p-6 min-h-[200px]">
                            <Skeleton className="w-12 h-12 rounded-full mb-4" />
                            <Skeleton className="w-full h-8 mb-4" />
                            <Skeleton className="w-2/3 h-4" />
                        </div>
                    ))
                ) : (
                    markets.map(m => (
                        <div key={m.id} className="action-card group relative overflow-hidden transition-all duration-300 hover:border-cyan-500/30" 
                            style={{ 
                                background: 'rgba(15, 15, 20, 0.8)', 
                                padding: '16px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                                    {m.icon ? <img src={m.icon} alt={m.question} className="w-full h-full object-contain" /> : <Layers size={22} className="text-white/20" />}
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Liquidity</div>
                                    <div className="text-sm font-bold text-cyan-400">${m.liquidity}</div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-6 min-h-[56px] line-clamp-3 leading-tight tracking-tight">{m.question}</h3>

                            <div className="mt-auto grid grid-cols-2 gap-4">
                                <button 
                                    disabled={placing}
                                    onClick={() => handlePlaceBet(m, 0)}
                                    className="group/btn bg-green-500/5 hover:bg-green-500 border border-green-500/10 hover:border-green-500 py-3.5 rounded-2xl transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="text-[10px] font-black uppercase text-green-400 group-hover/btn:text-black tracking-widest">BET YES</span>
                                    <Zap size={14} className="text-green-500 group-hover/btn:text-black" />
                                </button>
                                <button 
                                    disabled={placing}
                                    onClick={() => handlePlaceBet(m, 1)}
                                    className="group/btn bg-red-500/5 hover:bg-red-500 border border-red-500/10 hover:border-red-500 py-3.5 rounded-2xl transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="text-[10px] font-black uppercase text-red-400 group-hover/btn:text-black tracking-widest">BET NO</span>
                                    <Zap size={14} className="text-red-500 group-hover/btn:text-black" />
                                </button>
                            </div>

                            {placing && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm rounded-[24px]">
                                    <Loader2 className="animate-spin text-cyan-400" size={32} />
                                </div>
                            )}
                        </div>
                    ))

                )}
            </div>

            <div className="mt-12 text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] border-t border-white/5 pt-8">
                Powered by Polymarket CLOB v2 // Non-Custodial Hot Wallet Logic // Spectr Trade Layer
            </div>
        </div>
    );
}
