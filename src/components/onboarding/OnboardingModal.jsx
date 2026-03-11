import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Zap, Target, Shield, GraduationCap, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEPS = [
    {
        title: 'Welcome to Spectr!',
        description: 'Your neural-powered trading companion is ready. Let\'s walk through the core features to get you started.',
        icon: Zap,
        color: '#00FFFF'
    },
    {
        title: 'Neural Confidence',
        description: 'Our AI engines analyze thousands of variables to provide a Confidence Score for every signal. Look for high-probability setups.',
        icon: Target,
        color: '#3b82f6'
    },
    {
        title: 'Capital Shield',
        description: 'Advanced risk management that protects your equity. Set your maximum drawdown and let our algorithms handle the rest.',
        icon: Shield,
        color: '#10b981'
    },
    {
        title: 'Learning Academy',
        description: 'New to crypto? Our Academy provides institutional-grade research and tutorials to sharpen your edge.',
        icon: GraduationCap,
        color: '#f59e0b'
    },
    {
        title: 'You\'re All Set!',
        description: 'Connect your exchange API keys in Settings to start live trading, or use Simulation mode to practice.',
        icon: CheckCircle,
        color: '#8b5cf6'
    }
];

export default function OnboardingModal() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
        if (!hasSeenOnboarding) {
            setIsOpen(true);
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

    const StepIcon = STEPS[currentStep].icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={handleComplete}
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                    <div className="p-8 text-center">
                        <motion.div 
                            key={currentStep}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                            style={{ background: `${STEPS[currentStep].color}15`, border: `1px solid ${STEPS[currentStep].color}30` }}
                        >
                            <StepIcon size={40} color={STEPS[currentStep].color} />
                        </motion.div>

                        <h2 className="text-2xl font-black mb-3 text-white">{STEPS[currentStep].title}</h2>
                        <p className="text-white/50 leading-relaxed mb-8">
                            {STEPS[currentStep].description}
                        </p>

                        <div className="flex items-center justify-center gap-2 mb-8">
                            {STEPS.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-cyan-400' : 'w-1.5 bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <button 
                                    onClick={handleBack}
                                    className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft size={18} /> Back
                                </button>
                            )}
                            <button 
                                onClick={handleNext}
                                className="flex-1 py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
                            >
                                {currentStep === STEPS.length - 1 ? 'Start Trading' : 'Next'} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleComplete}
                        className="absolute top-4 right-4 p-2 text-white/20 hover:text-white/60 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
