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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    overflow: 'hidden'
                }}>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)'
                        }}
                        onClick={handleComplete}
                    />

                    {/* Animated Background Orbs */}
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                        <motion.div 
                            animate={{ 
                                x: [0, 100, 0], 
                                y: [0, -50, 0],
                                scale: [1, 1.5, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                position: 'absolute', top: '25%', left: '-20%', width: '500px', height: '500px',
                                background: 'radial-gradient(circle, rgba(0,255,255,0.2) 0%, transparent 70%)',
                                borderRadius: '50%', filter: 'blur(100px)'
                            }}
                        />
                    </div>
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '500px',
                            backgroundColor: 'rgba(10,10,15,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            boxShadow: '0 32px 128px rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Progress Bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'flex', gap: '6px', padding: '24px 24px 0' }}>
                            {STEPS.map((_, i) => (
                                <div key={i} style={{ flex: 1, height: '2px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={false}
                                        animate={{ width: i < currentStep ? '100%' : i === currentStep ? '100%' : '0%' }}
                                        style={{ height: '100%', background: i <= currentStep ? 'var(--accent)' : 'transparent', boxShadow: i <= currentStep ? '0 0 10px var(--accent)' : 'none' }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '60px 40px 40px' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ x: 30, opacity: 0, filter: 'blur(10px)' }}
                                    animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ x: -30, opacity: 0, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                >
                                    <div style={{ position: 'relative', marginBottom: '40px' }}>
                                        <div 
                                            style={{
                                                position: 'relative', width: '100px', height: '100px', borderRadius: '24px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: `0 0 40px ${currentData.color}20`
                                            }}
                                        >
                                            <Icon size={40} style={{ color: currentData.color, position: 'relative', zIndex: 10 }} />
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                                            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)' }}>
                                                {currentData.subtitle}
                                            </span>
                                        </div>
                                        
                                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                                            {currentData.title}
                                        </h2>
                                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '320px', margin: '0 auto' }}>
                                            {currentData.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button 
                                    onClick={handleNext}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--accent)',
                                        color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px',
                                        fontSize: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,255,255,0.2)'
                                    }}
                                >
                                    {currentStep === STEPS.length - 1 ? 'IGNITE ENGINES' : 'NEXT PROTOCOL'}
                                </button>
                                
                                <button 
                                    onClick={handleComplete}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', marginTop: '10px' }}
                                >
                                    SKIP INTRODUCTION
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={handleComplete}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
