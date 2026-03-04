import React from 'react';
import { Zap } from 'lucide-react';

const INITIAL_SENTIMENT_DATA = [
    { name: 'BTC', val: 74, status: 'Greed', color: '#00E396' },
    { name: 'ETH', val: 62, status: 'Optimistic', color: '#00E396' },
    { name: 'SOL', val: 89, status: 'Extreme Greed', color: '#00ff88' },
    { name: 'L1s', val: 45, status: 'Neutral', color: '#8899A6' },
    { name: 'AI', val: 92, status: 'Hype', color: '#00ff88' },
    { name: 'Memes', val: 12, status: 'Panic', color: '#FF4560' },
    { name: 'Layer-2', val: 56, status: 'Bullish', color: '#00E396' },
    { name: 'DeFi', val: 38, status: 'Fear', color: '#FEB019' },
    { name: 'Gaming', val: 41, status: 'Cooling', color: '#8899A6' },
];

export default function SentimentHeatmap() {
    const [data, setData] = React.useState(INITIAL_SENTIMENT_DATA);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => prev.map(item => {
                // Randomly fluctuate score by -2 to +2
                const delta = Math.floor(Math.random() * 5) - 2;
                let newVal = Math.max(0, Math.min(100, item.val + delta));

                // Update status dynamically if it crosses bounds
                let newStatus = item.status;
                let newColor = item.color;
                if (newVal >= 80) { newStatus = 'Extreme Greed'; newColor = '#00ff88'; }
                else if (newVal >= 60) { newStatus = 'Greed'; newColor = '#00E396'; }
                else if (newVal >= 40) { newStatus = 'Neutral'; newColor = '#8899A6'; }
                else if (newVal >= 20) { newStatus = 'Fear'; newColor = '#FEB019'; }
                else { newStatus = 'Panic'; newColor = '#FF4560'; }

                return { ...item, val: newVal, status: newStatus, color: newColor };
            }));
        }, 5000); // 5 seconds interval

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="action-card" style={{ minHeight: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="#FEB019" />
                    <h3 style={{ fontWeight: 700, fontSize: '14px', margin: 0, fontFamily: "'Inter', sans-serif" }}>Market Sentiment Heatmap</h3>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(254,176,25,0.1)', color: '#FEB019', border: '1px solid rgba(254,176,25,0.2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LIVE</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                flex: 1
            }}>
                {data.map(item => (
                    <div
                        key={item.name}
                        style={{
                            position: 'relative',
                            padding: '14px 12px',
                            borderRadius: '14px',
                            background: `linear-gradient(145deg, ${item.color}08 0%, ${item.color}03 100%)`,
                            border: `1px solid ${item.color}18`,
                            transition: 'all 0.3s ease',
                            cursor: 'default',
                            minHeight: '72px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = item.color + '40';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 8px 25px ${item.color}15`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = item.color + '18';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: 'rgba(255,255,255,0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            fontFamily: "'Inter', sans-serif"
                        }}>{item.name}</span>
                        <div>
                            <div className="font-mono" style={{
                                fontSize: '22px',
                                fontWeight: 700,
                                color: item.color,
                                lineHeight: 1.1
                            }}>{item.val}</div>
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                                color: 'rgba(255,255,255,0.35)',
                                marginTop: '2px'
                            }}>{item.status}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fear/Greed Scale */}
            <div style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
            }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Fear</span>
                <div style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: 'linear-gradient(90deg, #FF4560, #FEB019, #8899A6, #00E396, #00ff88)'
                }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Greed</span>
            </div>
        </div>
    );
}
