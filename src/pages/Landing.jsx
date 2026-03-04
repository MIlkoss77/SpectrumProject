import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Activity, Zap, Shield, Globe, Play } from 'lucide-react'
import NumberTicker from '@/components/NumberTicker'

export default function Landing() {
    return (
        <div className="landing-page" style={{
            background: '#050505',
            color: '#fff',
            minHeight: '100vh',
            fontFamily: '"Inter", sans-serif',
            overflowX: 'hidden'
        }}>
            {/* Navigation */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px 32px',
                position: 'fixed',
                width: '100%',
                zIndex: 50,
                backdropFilter: 'blur(10px)',
                background: 'rgba(5,5,5,0.7)'
            }}>
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: '32px', height: '32px', flexShrink: 0, backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/logo.png" alt="Spectr" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#fff' }}>SPECTR</span>
                        <span style={{ color: '#00FFFF', marginLeft: '6px' }}>Trading</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <a href="#features" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}>Features</a>
                    <Link to="/app" style={{
                        background: '#00FFFF',
                        color: '#000',
                        padding: '10px 24px',
                        borderRadius: 100,
                        fontWeight: 600,
                        fontSize: 14,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        Launch App <ArrowRight size={16} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '0 24px'
            }}>
                {/* Abstract Video Background Placeholder */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)',
                    zIndex: 0,
                    opacity: 0.5
                }}>
                    {/* TODO: Insert Veo 3.1 Generated Video Here */}
                    <div style={{
                        width: '100%', height: '100%',
                        backgroundImage: 'repeating-linear-gradient(45deg, #0A0A0A 0, #0A0A0A 1px, transparent 0, transparent 50%)',
                        backgroundSize: '20px 20px',
                        opacity: 0.1
                    }}></div>
                </div>

                <div style={{ zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span style={{
                            color: '#00FFFF',
                            textTransform: 'uppercase',
                            fontSize: 12,
                            letterSpacing: '2px',
                            fontWeight: 600,
                            background: 'rgba(0,255,255,0.1)',
                            padding: '6px 12px',
                            borderRadius: 4,
                            border: '1px solid rgba(0,255,255,0.2)'
                        }}>
                            Mass Market Premium
                        </span>
                        <h1 style={{
                            fontSize: 'clamp(48px, 8vw, 84px)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginTop: 24,
                            marginBottom: 24,
                            background: 'linear-gradient(180deg, #fff 0%, #888 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            The Future of <br /> Retail Trading
                        </h1>
                        <p style={{ fontSize: '18px', color: '#888', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 48px' }}>
                            Institutional-grade arbitrage scanner and AI sentiment analysis.
                            Powered by n8n. Secured by design.
                        </p>

                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                            <Link to="/app" style={{
                                background: '#fff',
                                color: '#000',
                                height: 56,
                                padding: '0 32px',
                                borderRadius: 12,
                                fontWeight: 600,
                                fontSize: 16,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                boxShadow: '0 0 40px rgba(255,255,255,0.1)'
                            }}>
                                Start Trading Now
                            </Link>
                            <button style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                height: 56,
                                padding: '0 24px',
                                borderRadius: 12,
                                fontWeight: 600,
                                fontSize: 16,
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer'
                            }}>
                                <Play size={18} fill="currentColor" /> Watch Showreel
                            </button>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" style={{ padding: '120px 24px', background: '#080808' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

                        {[
                            { icon: Activity, title: 'Arbitrage Scanner', desc: 'Real-time spread detection between Binance & Bybit. zero-latency execution.' },
                            { icon: Zap, title: 'AI Sentiment', desc: 'Groq Llama 3 powered news analysis. Know market direction before the charts move.' },
                            { icon: Shield, title: 'Non-Custodial', desc: 'Your keys, your crypto. Connect via API keys stored locally.' }
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    padding: 48,
                                    borderRadius: 24
                                }}
                            >
                                <div style={{
                                    width: 48, height: 48,
                                    borderRadius: 12,
                                    background: 'rgba(0,255,255,0.1)',
                                    color: '#00FFFF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 24
                                }}>
                                    <f.icon size={24} />
                                </div>
                                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                                <p style={{ color: '#888', lineHeight: 1.5 }}>{f.desc}</p>
                            </motion.div>
                        ))}

                    </div>
                </div>
            </section>

            {/* Social Proof / Trust */}
            <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 40 }}>
                        Trusted Integration Partners
                    </p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 64,
                        opacity: 0.5,
                        filter: 'grayscale(100%)',
                        flexWrap: 'wrap'
                    }}>
                        <h3 style={{ fontSize: 24, fontWeight: 700 }}>BINANCE</h3>
                        <h3 style={{ fontSize: 24, fontWeight: 700 }}>BYBIT</h3>
                        <h3 style={{ fontSize: 24, fontWeight: 700 }}>n8n</h3>
                        <h3 style={{ fontSize: 24, fontWeight: 700 }}>GROQ</h3>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '48px 24px', textAlign: 'center', color: '#444', fontSize: 14 }}>
                <p>&copy; 2026 Spectr Trading. All rights reserved.</p>
            </footer>
        </div>
    )
}
