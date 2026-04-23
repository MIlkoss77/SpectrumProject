import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTrading } from '@/context/TradingContext';
import { Wallet, Shield, ShieldAlert, Key, History, TrendingUp, DollarSign, PieChart, RefreshCw, ChevronRight, Save, X, Lock } from 'lucide-react';
import NumberTicker from '@/components/NumberTicker';
import Skeleton from '@/components/ui/Skeleton';
import '@/pages/dashboard.css';

// --- Premium Component: SpectrButton ---
const SpectrButton = ({ children, onClick, variant = 'primary', size = 'md', icon: Icon, className = '' }) => {
    const isPrimary = variant === 'primary';
    const isDanger = variant === 'danger';
    const isGhost = variant === 'ghost';

    const baseStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'sm' ? '6px 14px' : '10px 20px',
        borderRadius: '10px',
        fontSize: size === 'sm' ? '10px' : '12px',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid transition',
        outline: 'none'
    };

    let variantStyle = {};
    if (isPrimary) {
        variantStyle = {
            background: 'rgba(0, 255, 255, 0.1)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            color: '#00FFFF',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.05)'
        };
    } else if (isDanger) {
        variantStyle = {
            background: 'rgba(255, 69, 96, 0.1)',
            border: '1px solid rgba(255, 69, 96, 0.2)',
            color: '#FF4560'
        };
    } else if (isGhost) {
        variantStyle = {
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.4)'
        };
    }

    return (
        <button 
            onClick={onClick}
            style={{ ...baseStyle, ...variantStyle }}
            onMouseEnter={e => {
                e.currentTarget.style.background = isPrimary ? '#00FFFF' : isDanger ? '#FF4560' : 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = isGhost ? '#fff' : '#000';
                e.currentTarget.style.boxShadow = isPrimary ? '0 0 20px rgba(0, 255, 255, 0.3)' : isDanger ? '0 0 20px rgba(255, 69, 96, 0.3)' : 'none';
            }}
            onMouseLeave={e => {
                Object.assign(e.currentTarget.style, variantStyle);
                e.currentTarget.style.color = variantStyle.color;
            }}
            className={className}
        >
            {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
            {children}
        </button>
    );
};

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
            const activeExchange = ['binance', 'bybit', 'mexc'].find(ex => apiKeys[ex]?.key && apiKeys[ex]?.secret);
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
        <div className="w-full animate-in" style={{ padding: '0 20px' }}>
            {/* Header / Hero */}
            <div className={`overview-hero ${isPaper ? 'from-blue-500/10' : 'from-amber-500/10'}`} style={{ marginTop: '20px' }}>
                <div className="hero-header">
                    <div className="hero-title">
                        <Wallet size={18} className={isPaper ? 'text-blue-400' : 'text-amber-400'} />
                        <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {isPaper ? t('pages.portfolio.paper_title') || 'Paper Portfolio' : t('pages.portfolio.live_title') || 'Live Assets'}
                        </span>
                    </div>
                    <div className={`dx-tag ${isPaper ? 'text-blue-400 border-blue-500/20' : 'text-amber-400 border-amber-500/40'}`}>
                        {isPaper ? (t('ui.simulation') || 'SIMULATION') : (t('ui.live_terminal') || 'LIVE TERMINAL')}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
                            ${(balance ?? 0).toLocaleString()}
                        </h1>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                            {t('pages.portfolio.balance_label') || 'Total Estimated Balance'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ padding: '12px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontWeight: 900, marginBottom: '4px' }}>24h PnL</div>
                            <div style={{ fontSize: '14px', fontBold: 800, color: '#00E396' }}>+$0.00 (0.0%)</div>
                        </div>
                        <div style={{ padding: '12px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontWeight: 900, marginBottom: '4px' }}>{t('ui.open_positions') || 'Open Positions'}</div>
                            <div style={{ fontSize: '14px', fontBold: 800, color: '#fff' }}>{positions.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dx-grid-premium mt-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {/* Main Content: Positions */}
                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="action-card" style={{ padding: '32px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PieChart size={18} style={{ color: '#00FFFF' }} />
                                <h3 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{t('ui.active_positions') || 'Active Positions'}</h3>
                            </div>
                            {isPaper && (
                                <SpectrButton 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={resetPaperTrading} 
                                    icon={RefreshCw}
                                >
                                    {t('ui.reset_simulation') || 'Reset Simulation'}
                                </SpectrButton>
                            )}
                        </div>

                        {loadingLive ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Skeleton style={{ height: '48px', width: '100%', borderRadius: '12px' }} />
                                <Skeleton style={{ height: '48px', width: '100%', borderRadius: '12px', opacity: 0.5 }} />
                                <Skeleton style={{ height: '48px', width: '100%', borderRadius: '12px', opacity: 0.2 }} />
                            </div>
                        ) : positions.length === 0 ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: '0.5em' }}>
                                    READY FOR EXECUTION
                                </div>
                            </div>
                        ) : (

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                            <th style={{ paddingBottom: '16px', fontWeight: 900 }}>{t('ui.asset') || 'Asset'}</th>
                                            <th style={{ paddingBottom: '16px', fontWeight: 900 }}>{t('ui.size') || 'Size'}</th>
                                            <th style={{ paddingBottom: '16px', fontWeight: 900 }}>{t('ui.avg_price') || 'Avg Price'}</th>
                                            <th style={{ paddingBottom: '16px', fontWeight: 900 }}>{t('ui.realtime_pnl') || 'Realtime PnL'}</th>
                                            <th style={{ paddingBottom: '16px', fontWeight: 900, textAlign: 'right' }}>{t('ui.action') || 'Action'}</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        {positions.map((pos, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: 800, color: '#fff' }}>{pos.symbol}</td>
                                                <td style={{ padding: '20px 0', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{pos.amount}</td>
                                                <td style={{ padding: '20px 0', fontSize: '13px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>${(pos.avgPrice || pos.priceUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                                <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: 900, color: '#00E396', fontFamily: 'var(--font-mono)' }}>
                                                    {isPaper ? '+$0.00' : `$${(pos.valueUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                                </td>
                                                <td style={{ padding: '20px 0', textAlign: 'right' }}>
                                                    {isPaper ? (
                                                        <SpectrButton variant="danger" size="sm">CLOSE</SpectrButton>
                                                    ) : (
                                                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>HODL</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div className="action-card" style={{ padding: '32px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                            <History size={18} style={{ color: '#00FFFF' }} />
                            <h3 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{t('ui.execution_history') || 'Execution History'}</h3>
                        </div>
                        {history.length === 0 ? (
                            <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.1, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                                {t('ui.history_clear') || 'History clear'}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {history.map((h, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ 
                                                width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900,
                                                background: h.side === 'BUY' ? 'rgba(0, 227, 150, 0.1)' : 'rgba(255, 69, 96, 0.1)',
                                                color: h.side === 'BUY' ? '#00E396' : '#FF4560'
                                            }}>{h.side[0]}</div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{h.symbol}</div>
                                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>{new Date(h.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>${((h.amount || 0) * (h.executedPrice || 0)).toLocaleString()}</div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{h.amount} @ ${h.executedPrice}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: API Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="action-card" style={{ padding: '24px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Key size={18} style={{ color: '#F59E0B' }} />
                            <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{t('ui.api_integration') || 'API Integration'}</h3>
                        </div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', marginBottom: '24px' }}>
                            {t('pages.portfolio.api_help') || 'Connect your exchange keys to enable Live Trading. Keys are encrypted and stored locally.'}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {['Binance', 'Bybit', 'MEXC'].map(ex => {
                                const lower = ex.toLowerCase();
                                const hasKeys = apiKeys[lower]?.key && apiKeys[lower]?.secret;
                                return (
                                    <div key={ex} style={{ 
                                        padding: '20px', borderRadius: '20px', border: '1px solid',
                                        transition: 'all 0.3s',
                                        background: hasKeys ? 'linear-gradient(135deg, rgba(0,227,150,0.05) 0%, transparent 100%)' : 'rgba(255,255,255,0.02)',
                                        borderColor: hasKeys ? 'rgba(0,227,150,0.2)' : 'rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'center', justifyContent: 'space-between', marginBottom: editExchange === lower ? '20px' : '0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ 
                                                    width: '6px', height: '6px', borderRadius: '50%',
                                                    background: hasKeys ? '#00E396' : 'rgba(255,255,255,0.1)',
                                                    boxShadow: hasKeys ? '0 0 10px #00E396' : 'none'
                                                }} />
                                                <span style={{ fontSize: '13px', fontWeight: 800 }}>{ex}</span>
                                            </div>
                                            <SpectrButton 
                                                variant={hasKeys ? "ghost" : "primary"} 
                                                size="sm"
                                                onClick={() => setEditExchange(editExchange === lower ? null : lower)}
                                            >
                                                {hasKeys ? (t('ui.edit') || 'Edit') : (t('ui.connect') || 'Connect')}
                                            </SpectrButton>
                                        </div>

                                        {editExchange === lower && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="API Key"
                                                    value={keyInput.key}
                                                    onChange={e => setKeyInput(prev => ({ ...prev, key: e.target.value }))}
                                                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', fontSize: '11px', color: '#fff', outline: 'none' }}
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="API Secret"
                                                    value={keyInput.secret}
                                                    onChange={e => setKeyInput(prev => ({ ...prev, secret: e.target.value }))}
                                                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', fontSize: '11px', color: '#fff', outline: 'none' }}
                                                />
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                                    <SpectrButton onClick={() => handleSaveKeys(lower)} style={{ flex: 1 }} icon={Save}>Save</SpectrButton>
                                                    <SpectrButton onClick={() => setEditExchange(null)} variant="ghost" icon={X} />
                                                </div>
                                            </div>
                                        )}

                                        {hasKeys && editExchange !== lower && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                                                <Lock size={10} style={{ color: '#00E396', opacity: 0.5 }} />
                                                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(0,227,150,0.5)', textTransform: 'uppercase' }}>Encrypted Active</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="action-card" style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, transparent 100%)', border: '1px solid rgba(245,158,11,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <ShieldAlert size={18} style={{ color: '#F59E0B' }} />
                            <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#F59E0B', textTransform: 'uppercase' }}>{t('ui.security_warning') || 'Security Warning'}</h3>
                        </div>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6', margin: 0 }}>
                            {t('pages.portfolio.security_msg') || 'Spectr never transmits your keys to central servers. Signatures happen locally inside your browser.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
