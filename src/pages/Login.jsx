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
    
    const { setToken, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const payload = isLogin ? { email, password } : { email, password, displayName };
            
            const res = await axios.post(endpoint, payload);
            
            if (res.data.token) {
                setToken(res.data.token);
                navigate('/');
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
        <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 mb-4 backdrop-blur-xl">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Spectr Protocol</h1>
                    <p className="text-white/40 text-sm font-medium tracking-wide">
                        {isLogin ? 'Access your Neuro-Finance Terminal' : 'Initialize your trading profile'}
                    </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                    {/* Inner Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                                        <ArrowRight size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-white/[0.05] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                                    <Mail size={16} />
                                </div>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                                    <Lock size={16} />
                                </div>
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-400 text-xs font-bold text-center bg-red-500/10 border border-red-500/20 py-3 rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'AUTHORIZE ACCESS' : 'CREATE PROTOCOL NODE'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-transparent px-4 text-white/20">OR CONTINUE WITH</span></div>
                        </div>

                        <button 
                            type="button"
                            onClick={loginWithGoogle}
                            className="w-full bg-white/[0.05] border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]"
                        >
                            <Chrome size={20} />
                            GOOGLE AUTH
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white/40 text-xs font-bold hover:text-cyan-400 transition-colors uppercase tracking-widest"
                        >
                            {isLogin ? "Don't stop here. Create an account →" : "Already in the protocol? Login →"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-widest">
                    <Link to="/terms" className="hover:text-white/40 transition-colors">Terms of Service</Link>
                    <Link to="/privacy" className="hover:text-white/40 transition-colors">Privacy Shield</Link>
                </div>
            </motion.div>
        </div>
    );
}
