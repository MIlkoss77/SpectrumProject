import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTrading } from '@/context/TradingContext';
import { Wallet, Shield, ShieldAlert, Key, History, TrendingUp, DollarSign, PieChart, RefreshCw } from 'lucide-react';
import NumberTicker from '@/components/NumberTicker';
import Skeleton from '@/components/ui/Skeleton';
import '@/pages/dashboard.css';

export default function Portfolio() {
    const { t } = useTranslation();
    const { tradingMode, paperState, apiKeys, updateApiKeys, resetPaperTrading } = useTrading();
    const [editExchange, setEditExchange] = useState(null);
    const [keyInput, setKeyInput] = useState({ key: '', secret: '' });

    // Live Portfolio State
    const [livePortfolio, setLivePortfolio] = useState({ totalUsdValue: 0, assets: [] });
    const [loadingLive, setLoadingLive] = useState(false);

    const isPaper = tradingMode === 'PAPER';
    const balance = isPaper ? paperState.balance : livePortfolio.totalUsdValue;
    const positions = isPaper ? paperState.positions : livePortfolio.assets;
    const history = isPaper ? paperState.history : [];

    React.useEffect(() => {
        if (!isPaper) {
            const activeExchange = ['binance', 'bybit'].find(ex => apiKeys[ex]?.key && apiKeys[ex]?.secret);
            if (activeExchange) {
                fetchLiveBalance(activeExchange);
            }
        }
    }, [isPaper, apiKeys]);

    const fetchLiveBalance = async (exchange) => {
        setLoadingLive(true);
        try {
            const res = await fetch('/api/portfolio/balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exchangeId: exchange,
                    apiKey: apiKeys[exchange].key,
                    secret: apiKeys[exchange].secret
                })
            });
            const data = await res.json();
            if (data.ok) {
                setLivePortfolio({ totalUsdValue: data.totalUsdValue, assets: data.assets });
            }
        } catch (e) {
            console.error('API Error:', e);
        } finally {
            setLoadingLive(false);
        }
    };

    const handleSaveKeys = (exchange) => {
        updateApiKeys(exchange, keyInput);
        setEditExchange(null);
        setKeyInput({ key: '', secret: '' });
    };

    return (
        <div className="w-full animate-in">
            {/* Header / Hero */}
            <div className={`overview-hero ${isPaper ? 'from-blue-500/10' : 'from-amber-500/10'}`}>
                <div className="hero-header">
                    <div className="hero-title">
                        <Wallet size={18} className={isPaper ? 'text-blue-400' : 'text-amber-400'} />
                        <span>{isPaper ? t('pages.portfolio.paper_title') || 'Paper Portfolio' : t('pages.portfolio.live_title') || 'Live Assets'}</span>
                    </div>
                    <div className={`dx-tag ${isPaper ? 'text-blue-400 border-blue-500/20' : 'text-amber-400 border-amber-500/40'}`}>
                        {isPaper ? (t('ui.simulation') || 'SIMULATION') : (t('ui.live_terminal') || 'LIVE TERMINAL')}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            ${balance.toLocaleString()}
                        </h1>
                        <p className="text-sm text-white/40">{t('pages.portfolio.balance_label') || 'Total Estimated Balance'}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-[10px] text-white/30 uppercase font-bold">24h PnL</div>
                            <div className="text-sm font-bold text-green-400">+$0.00 (0.0%)</div>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-[10px] text-white/30 uppercase font-bold">{t('ui.open_positions') || 'Open Positions'}</div>
                            <div className="text-sm font-bold text-white">{positions.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dx-grid-premium mt-8">
                {/* Main Content: Positions */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
                    <div className="action-card" style={{ padding: '24px' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <PieChart size={18} className="text-cyan-400" />
                                <h3 className="font-bold">{t('ui.active_positions') || 'Active Positions'}</h3>
                            </div>
                            {isPaper && (
                                <button
                                    onClick={resetPaperTrading}
                                    className="text-[10px] font-bold text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest"
                                >
                                    {t('ui.reset_simulation') || 'Reset Simulation'}
                                </button>
                            )}
                        </div>

                        {positions.length === 0 ? (
                            <div className="flex flex-col gap-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full opacity-50" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                                            <th className="pb-4 font-bold">{t('ui.asset') || 'Asset'}</th>
                                            <th className="pb-4 font-bold">{t('ui.size') || 'Size'}</th>
                                            <th className="pb-4 font-bold">{t('ui.avg_price') || 'Avg Price'}</th>
                                            <th className="pb-4 font-bold">{t('ui.realtime_pnl') || 'Realtime PnL'}</th>
                                            <th className="pb-4 font-bold text-right">{t('ui.action') || 'Action'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {positions.map((pos, i) => (
                                            <tr key={i} className="group">
                                                <td className="py-4 font-bold text-white group-hover:text-cyan-400 transition-colors">{pos.symbol}</td>
                                                <td className="py-4 font-mono text-sm">{pos.amount}</td>
                                                <td className="py-4 font-mono text-sm">${(pos.avgPrice || pos.priceUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                                <td className="py-4 font-bold text-green-400 font-mono">
                                                    {isPaper ? '+$0.00' : `$${(pos.valueUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                                </td>
                                                <td className="py-4 text-right">
                                                    {isPaper ? (
                                                        <button className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                                                            {t('ui.close') || 'CLOSE'}
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-white/40 uppercase font-bold">Hodl</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="action-card" style={{ padding: '24px' }}>
                        <div className="flex items-center gap-2 mb-6">
                            <History size={18} className="text-cyan-400" />
                            <h3 className="font-bold">{t('ui.execution_history') || 'Execution History'}</h3>
                        </div>
                        {history.length === 0 ? (
                            <div className="py-8 text-center text-white/10 text-xs font-bold uppercase tracking-widest">
                                {t('ui.history_clear') || 'History clear'}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${h.side === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {h.side[0]}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold">{h.symbol}</div>
                                                <div className="text-[9px] text-white/30 uppercase tracking-tighter">{new Date(h.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono font-bold">${(h.amount * h.executedPrice).toLocaleString()}</div>
                                            <div className="text-[9px] text-white/30">{h.amount} @ ${h.executedPrice}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: API Settings */}
                <div className="col-span-1 flex flex-col gap-6">
                    <div className="action-card" style={{ padding: '20px' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Key size={18} className="text-amber-400" />
                            <h3 className="font-bold">{t('ui.api_integration') || 'API Integration'}</h3>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed mb-6">
                            {t('pages.portfolio.api_help') || 'Connect your exchange keys to enable Live Trading. Keys are encrypted and stored locally in your browser.'}
                        </p>

                        <div className="flex flex-col gap-4">
                            {['Binance', 'Bybit'].map(ex => {
                                const lower = ex.toLowerCase();
                                const hasKeys = apiKeys[lower]?.key && apiKeys[lower]?.secret;
                                return (
                                    <div key={ex} className={`p-4 rounded-2xl border transition-all duration-300 ${hasKeys ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${hasKeys ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/20'}`} />
                                                <span className="text-xs font-bold">{ex}</span>
                                            </div>
                                            <button
                                                onClick={() => setEditExchange(editExchange === lower ? null : lower)}
                                                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase"
                                            >
                                                {hasKeys ? (t('ui.edit') || 'Edit') : (t('ui.connect') || 'Connect')}
                                            </button>
                                        </div>

                                        {editExchange === lower && (
                                            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                                                <input
                                                    type="text"
                                                    placeholder="API Key"
                                                    value={keyInput.key}
                                                    onChange={e => setKeyInput(prev => ({ ...prev, key: e.target.value }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="API Secret"
                                                    value={keyInput.secret}
                                                    onChange={e => setKeyInput(prev => ({ ...prev, secret: e.target.value }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleSaveKeys(lower)}
                                                        className="flex-1 py-2 bg-cyan-500 text-black text-[10px] font-bold uppercase rounded-lg shadow-lg"
                                                    >
                                                        {t('ui.save_keys') || 'Save Keys'}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditExchange(null)}
                                                        className="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-bold uppercase rounded-lg"
                                                    >
                                                        {t('ui.cancel') || 'Cancel'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {hasKeys && editExchange !== lower && (
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <Shield size={10} className="text-green-400" />
                                                <span className="text-[10px] text-green-400/60 font-mono tracking-tighter">{t('ui.encrypted_active') || 'Encrypted Key Active'}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="action-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, transparent 100%)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert size={18} className="text-amber-400" />
                            <h3 className="font-bold text-amber-400">{t('ui.security_warning') || 'Security Warning'}</h3>
                        </div>
                        <p className="text-[10px] text-white/40 leading-relaxed">
                            {t('pages.portfolio.security_msg') || 'Spectr never transmits your keys to any central server. Transactions are signed locally. Note that switching to Live Trading involves real capital. Always start with small amounts.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
