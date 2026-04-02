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
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        onClick={handleComplete}
                    />

                    {/* Animated Background Orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div 
                            animate={{ 
                                x: [0, 50, 0], 
                                y: [0, -30, 0],
                                scale: [1, 1.2, 1] 
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" 
                        />
                        <motion.div 
                            animate={{ 
                                x: [0, -50, 0], 
                                y: [0, 30, 0],
                                scale: [1.2, 1, 1.2] 
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" 
                        />
                    </div>
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-xl bg-black/40 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                    >
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-1 pt-1">
                            {STEPS.map((_, i) => (
                                <div key={i} className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div 
                                        initial={false}
                                        animate={{ width: i < currentStep ? '100%' : i === currentStep ? '100%' : '0%' }}
                                        className={`h-full ${i <= currentStep ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : ''}`}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-8 md:p-12 pt-16">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative mb-10">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className={`absolute -inset-4 rounded-full bg-gradient-to-tr ${currentData.gradient} blur-xl`}
                                        />
                                        <div 
                                            className="relative w-24 h-24 rounded-3xl flex items-center justify-center bg-black/40 border border-white/10 shadow-2xl overflow-hidden group"
                                            style={{ boxShadow: `0 0 40px ${currentData.color}20` }}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${currentData.gradient} opacity-50`} />
                                            <Icon size={44} style={{ color: currentData.color }} className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                                            
                                            {/* Decorative Elements */}
                                            <motion.div 
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 bg-white rounded-full blur-2xl" 
                                            />
                                        </div>
                                    </div>

                                    <div className="text-center mb-10 px-4">
                                        <motion.span 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2"
                                        >
                                            {currentData.subtitle}
                                        </motion.span>
                                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                            {currentData.title}
                                        </h2>
                                        <p className="text-base md:text-lg text-white/50 font-medium leading-relaxed max-w-sm mx-auto">
                                            {currentData.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
                                {currentStep > 0 && (
                                    <button 
                                        onClick={handleBack}
                                        className="flex-1 py-4 px-6 rounded-2xl border border-white/10 text-white/60 font-bold hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                        Back
                                    </button>
                                )}
                                <button 
                                    onClick={handleNext}
                                    className="flex-[2] py-4 px-8 rounded-2xl bg-cyan-400 hover:bg-white text-black font-black uppercase tracking-[0.1em] text-xs transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 active:scale-95 overflow-hidden relative group"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {currentStep === STEPS.length - 1 ? (
                                            <>Ignite Engines <Sparkles size={16} /></>
                                        ) : (
                                            <>Next Protocol <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </span>
                                </button>
                            </div>
                            
                            <button 
                                onClick={handleComplete}
                                className="mt-8 text-[10px] font-bold text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors w-full text-center"
                            >
                                Skip Introduction
                            </button>
                        </div>

                        <button 
                            onClick={handleComplete}
                            className="absolute top-6 right-6 p-2.5 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
