import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Zap, Target, Shield, GraduationCap, CheckCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEPS = [
    {
        title: 'Welcome to Spectr',
        subtitle: 'The Neural Edge of Trading',
        description: 'Your neural-powered tactical terminal is ready. Experience institutional-grade intelligence at your fingertips.',
        icon: Zap,
        color: '#00FFFF',
        gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
        title: 'Neural Confidence',
        subtitle: 'Probability Redefined',
        description: 'Our proprietary AI engines analyze 40,000+ data points per second to provide a real-time Confidence Score for every setup.',
        icon: Target,
        color: '#3B82F6',
        gradient: 'from-blue-500/20 to-indigo-500/20'
    },
    {
        title: 'Capital Shield',
        subtitle: 'Intelligent Risk Control',
        description: 'Institutional risk management protocols that safeguard your equity. Set your parameters and let our algorithms protect the downside.',
        icon: Shield,
        color: '#10B981',
        gradient: 'from-emerald-500/20 to-teal-500/20'
    },
    {
        title: 'Spectr Academy',
        subtitle: 'Sharpen Your Edge',
        description: 'Access deep-dive research, market psychology masterclasses, and technical playbooks designed for the modern trader.',
        icon: GraduationCap,
        color: '#F59E0B',
        gradient: 'from-amber-500/20 to-orange-500/20'
    },
    {
        title: 'Ready for Launch',
        subtitle: 'Select Your Path',
        description: 'Inject your API keys for live neural execution, or enter Simulation Mode to refine your strategies in real-time.',
        icon: CheckCircle,
        color: '#8B5CF6',
        gradient: 'from-purple-500/20 to-pink-500/20'
    }
];

export default function OnboardingModal() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
        if (!hasSeenOnboarding) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('onboarding_complete', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const currentData = STEPS[currentStep];
    const Icon = currentData.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
                        onClick={handleComplete}
                    />

                    {/* Animated Background Orbs for Premium feel */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div 
                            animate={{ 
                                x: [0, 100, 0], 
                                y: [0, -50, 0],
                                scale: [1, 1.5, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" 
                        />
                        <motion.div 
                            animate={{ 
                                x: [0, -100, 0], 
                                y: [0, 50, 0],
                                scale: [1.5, 1, 1.5],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" 
                        />
                    </div>
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="relative w-full max-w-lg bg-black/40 border border-white/10 rounded-[40px] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,1)] backdrop-blur-2xl"
                    >
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 flex gap-1.5 px-6 pt-6">
                            {STEPS.map((_, i) => (
                                <div key={i} className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div 
                                        initial={false}
                                        animate={{ width: i < currentStep ? '100%' : i === currentStep ? '100%' : '0%' }}
                                        className={`h-full ${i <= currentStep ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : ''}`}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-10 md:p-14 pt-20">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ x: 30, opacity: 0, filter: 'blur(10px)' }}
                                    animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ x: -30, opacity: 0, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative mb-12">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                            className={`absolute -inset-8 rounded-full bg-gradient-to-tr ${currentData.gradient} blur-3xl opacity-60`}
                                        />
                                        <div 
                                            className="relative w-28 h-28 rounded-[32px] flex items-center justify-center bg-black/40 border border-white/10 shadow-2xl overflow-hidden group"
                                            style={{ boxShadow: `0 0 50px ${currentData.color}30` }}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${currentData.gradient} opacity-40`} />
                                            <Icon size={48} style={{ color: currentData.color }} className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                                            
                                            {/* Pulsing Core */}
                                            <motion.div 
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                                className="absolute inset-0 bg-white rounded-full blur-3xl" 
                                            />
                                        </div>
                                    </div>

                                    <div className="text-center mb-12">
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                                                {currentData.subtitle}
                                            </span>
                                        </motion.div>
                                        
                                        <h2 className="text-3xl md:text-4xl font-black text-white mb-5 tracking-tight leading-[1.1]">
                                            {currentData.title}
                                        </h2>
                                        <p className="text-base md:text-lg text-white/50 font-medium leading-relaxed max-w-sm mx-auto">
                                            {currentData.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
                                {currentStep > 0 && (
                                    <button 
                                        onClick={handleBack}
                                        className="flex-1 py-4.5 px-6 rounded-2xl border border-white/10 text-white/60 font-bold hover:text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                                    >
                                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                        <span>Back</span>
                                    </button>
                                )}
                                <button 
                                    onClick={handleNext}
                                    className="flex-[2] py-4.5 px-8 rounded-2xl bg-cyan-400 hover:bg-white text-black font-black uppercase tracking-[0.15em] text-xs transition-all shadow-[0_10px_40px_rgba(34,211,238,0.3)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 active:scale-95 overflow-hidden relative group"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {currentStep === STEPS.length - 1 ? (
                                            <>IGNITE ENGINES <Sparkles size={18} /></>
                                        ) : (
                                            <>NEXT PROTOCOL <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </span>
                                    
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </button>
                            </div>
                            
                            <button 
                                onClick={handleComplete}
                                className="mt-8 text-[10px] font-bold text-white/20 hover:text-cyan-400/60 uppercase tracking-[0.3em] transition-all w-full text-center hover:scale-105 active:scale-95"
                            >
                                SKIP INTRODUCTION
                            </button>
                        </div>

                        <button 
                            onClick={handleComplete}
                            className="absolute top-8 right-8 p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-full transition-all group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
