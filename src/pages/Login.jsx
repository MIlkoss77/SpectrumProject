import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, ArrowRight, Chrome } from 'lucide-react';
import axios from 'axios';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        // Use absolute path to force browser to leave the SPA and hit Nginx
        window.location.href = 'https://app.spectrtrading.com/api/auth/google';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const payload = isLogin ? { email, password } : { email, password, displayName };
            
            const res = await axios.post(endpoint, payload);
            
            if (res.data.token) {
                localStorage.setItem('spectr_auth_token', res.data.token);
                window.location.href = '/';
            } else {
                setError('Authentication failed. Please check your credentials.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#050505', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px',
            fontFamily: "'Inter', sans-serif",
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(0, 255, 255, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(139, 92, 246, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }} />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '72px', 
                        height: '72px', 
                        borderRadius: '20px', 
                        background: 'rgba(0, 255, 255, 0.1)', 
                        border: '1px solid rgba(0, 255, 255, 0.2)',
                        marginBottom: '20px',
                        boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)'
                    }}>
                        <ShieldCheck size={32} color="#00FFFF" />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                        SPECTR <span style={{ color: '#00FFFF' }}>PROTOCOL</span>
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', fontWeight: 500 }}>
                        {isLogin ? 'Neural Tactical Terminal v5.2.1' : 'Initialize your trading profile'}
                    </p>
                </div>

                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    backdropFilter: 'blur(40px)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                    borderRadius: '32px', 
                    padding: '40px',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {!isLogin && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px' }}>Display Name</label>
                                <input 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter your name"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px' }}>Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px' }}>Access Key</label>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        {error && (
                            <div style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 700, textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                background: '#00FFFF', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '16px', 
                                padding: '18px', 
                                fontWeight: 900, 
                                fontSize: '12px', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? 'CALIBRATING...' : (isLogin ? 'AUTHORIZE ACCESS' : 'INITIALIZE NODE')}
                        </button>

                        <div style={{ position: 'relative', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}>
                            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#050505', padding: '0 10px', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' }}>OR</span>
                        </div>

                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            style={{ 
                                width: '100%', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: '#fff', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '16px', 
                                padding: '16px', 
                                fontWeight: 700, 
                                fontSize: '12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Chrome size={18} />
                            CONTINUE WITH GOOGLE
                        </button>
                    </form>

                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700, marginTop: '30px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
                    >
                        {isLogin ? "Need a new node? Create account →" : "Already registered? Sign in →"}
                    </button>
                </div>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    <span>TERMS OF SERVICE</span>
                    <span>PRIVACY SHIELD</span>
                </div>
            </motion.div>
        </div>
    );
}
