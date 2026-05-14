import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Target, Shield, GraduationCap, CheckCircle, Sparkles, Brain, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppMode } from '@/context/AppModeContext.jsx';
import { useNavigate } from 'react-router-dom';

const STEPS = [
    {
        title: 'Welcome to Spectr',
        subtitle: 'The Neuro-Performance Ecosystem',
        description: 'Upgrade your biology, sharpen your mind, and apply your new edge to the global markets. Your transformation begins here.',
        icon: Sparkles,
        color: '#00FFFF',
        gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
        title: 'Reprogram Your Mind',
        subtitle: 'Spectr Academy & Tracker',
        description: 'Access deep-dive knowledge on supplements, neuro-biology, and NLP. Use our daily tracker to build elite cognitive habits.',
        icon: Brain,
        color: '#FF00FF',
        gradient: 'from-fuchsia-500/20 to-purple-500/20'
    },
    {
        title: 'Monetize Your Clarity',
        subtitle: 'Elite Terminal Bonus',
        description: 'As a bonus, get access to the institutional-grade trading terminal. Apply your clear, upgraded mind to dominate the markets.',
        icon: TrendingUp,
        color: '#10B981',
        gradient: 'from-emerald-500/20 to-teal-500/20'
    },
    {
        title: 'Select Your Focus',
        subtitle: 'Choose Your Primary Path',
        description: 'What brings you to Spectr today? Choose your primary dashboard (you can switch modes anytime).',
        icon: Target,
        color: '#F59E0B',
        gradient: 'from-amber-500/20 to-orange-500/20'
    }
];

export default function OnboardingModal() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const { setMode } = useAppMode();
    const navigate = useNavigate();

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
        }
    };

    const handleComplete = (selectedMode = 'academy') => {
        setMode(selectedMode);
        localStorage.setItem('onboarding_complete', 'true');
        setIsOpen(false);
        if (selectedMode === 'academy') {
            navigate('/tracker');
        } else {
            navigate('/');
        }
    };

    if (!isOpen) return null;

    const currentData = STEPS[currentStep];
    const Icon = currentData.icon;
    const isFinalStep = currentStep === STEPS.length - 1;

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
                                background: \`radial-gradient(circle, \${currentData.color}40 0%, transparent 70%)\`,
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
                                        style={{ height: '100%', background: i <= currentStep ? currentData.color : 'transparent', boxShadow: i <= currentStep ? \`0 0 10px \${currentData.color}\` : 'none' }}
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
                                                boxShadow: \`0 0 40px \${currentData.color}20\`
                                            }}
                                        >
                                            <Icon size={40} style={{ color: currentData.color, position: 'relative', zIndex: 10 }} />
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentData.color, boxShadow: \`0 0 8px \${currentData.color}\` }} />
                                            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: currentData.color }}>
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
                                {!isFinalStep ? (
                                    <>
                                        <button 
                                            onClick={handleNext}
                                            style={{
                                                width: '100%', padding: '16px', borderRadius: '16px', background: currentData.color,
                                                color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px',
                                                fontSize: '12px', border: 'none', cursor: 'pointer', boxShadow: \`0 10px 30px \${currentData.color}40\`
                                            }}
                                        >
                                            NEXT PROTOCOL
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleComplete('academy')}
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', marginTop: '10px' }}
                                        >
                                            SKIP INTRODUCTION
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <button 
                                            onClick={() => handleComplete('academy')}
                                            style={{
                                                padding: '20px 16px', borderRadius: '16px', background: 'rgba(255,0,255,0.1)', border: '1px solid rgba(255,0,255,0.3)',
                                                color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <Brain size={24} color="#FF00FF" />
                                            <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Personal<br/>Growth</span>
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleComplete('terminal')}
                                            style={{
                                                padding: '20px 16px', borderRadius: '16px', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)',
                                                color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <TrendingUp size={24} color="#00FFFF" />
                                            <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Trading<br/>Terminal</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
