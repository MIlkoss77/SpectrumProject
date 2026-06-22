import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dna, Flame, Brain, CheckCircle2, Circle, Shield, ShieldCheck, Target, Info, Plus, Trash2, Bell, BellOff, X, ChevronDown, Pause, Play
} from 'lucide-react';

const TABS = [
  { id: 'peptides', label: 'Peptides', icon: Dna, color: '#00FFFF' },
  { id: 'detox', label: 'Detox', icon: Flame, color: '#FF0055' }
];

const METHODS = ['Oral', 'Sublingual', 'Intranasal', 'Subcutaneous', 'Intramuscular', 'Topical'];

export default function AcademyDashboard() {
  const [activeTab, setActiveTab] = useState('peptides');
  const [activePeptideDetails, setActivePeptideDetails] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPeptide, setNewPeptide] = useState({ name: '', dosage: '', method: 'Oral', cycleDays: 28, restDays: 14 });

  /* ================== PEPTIDE CYCLES STATE ================== */
  const [peptideCycles, setPeptideCycles] = useState(() => {
    const saved = localStorage.getItem('spectr_peptide_cycles');
    return saved ? JSON.parse(saved) : [
      { id: 'semax', name: 'Semax 0.1%', status: 'active', cycleDays: 28, restDays: 14, currentDay: 12, dosage: '2-3 drops AM', method: 'Intranasal', notifications: false },
      { id: 'bpc157', name: 'BPC-157', status: 'active', cycleDays: 56, restDays: 28, currentDay: 42, dosage: '250mcg BID', method: 'Subcutaneous', notifications: false },
      { id: 'selank', name: 'Selank 0.15%', status: 'active', cycleDays: 21, restDays: 7, currentDay: 5, dosage: '2-3 drops PM', method: 'Intranasal', notifications: false },
      { id: 'p21', name: 'P21', status: 'inactive', cycleDays: 42, restDays: 14, currentDay: 0, dosage: '500mcg AM', method: 'Subcutaneous', notifications: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('spectr_peptide_cycles', JSON.stringify(peptideCycles));
  }, [peptideCycles]);

  const togglePeptideStatus = (id) => {
    setPeptideCycles(prev => prev.map(p => {
      if (p.id === id) {
        const isActivating = p.status === 'inactive';
        return { ...p, status: isActivating ? 'active' : 'inactive', currentDay: isActivating ? 1 : 0 };
      }
      return p;
    }));
  };

  const deletePeptide = (id) => {
    setPeptideCycles(prev => prev.filter(p => p.id !== id));
  };

  const addPeptide = () => {
    if (!newPeptide.name.trim()) return;
    const entry = {
      id: `custom_${Date.now()}`,
      name: newPeptide.name.trim(),
      status: 'active',
      cycleDays: Math.max(1, parseInt(newPeptide.cycleDays) || 28),
      restDays: Math.max(0, parseInt(newPeptide.restDays) || 14),
      currentDay: 1,
      dosage: newPeptide.dosage.trim() || 'As directed',
      method: newPeptide.method,
      notifications: false
    };
    setPeptideCycles(prev => [...prev, entry]);
    setNewPeptide({ name: '', dosage: '', method: 'Oral', cycleDays: 28, restDays: 14 });
    setShowAddForm(false);
  };

  const toggleNotification = async (id) => {
    const p = peptideCycles.find(x => x.id === id);
    if (!p) return;

    if (!p.notifications) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Time to take ${p.name}`, { body: `${p.dosage} · ${p.method}`, icon: '/logo.png' });
      }
    }
    setPeptideCycles(prev => prev.map(x => x.id === id ? { ...x, notifications: !x.notifications } : x));
  };

  /* ================== DOPAMINE DETOX STATE ================== */
  const [detoxDays, setDetoxDays] = useState(() => {
    const saved = localStorage.getItem('spectr_detox_days');
    return saved ? JSON.parse(saved) : { day1: false, day2: false, day3: false, day4: false, day5: false, day6: false, day7: false };
  });
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('spectr_detox_days', JSON.stringify(detoxDays));
    const allDone = Object.values(detoxDays).every(v => v === true);
    const wasAlreadyDone = localStorage.getItem('dopamine_detox_completed') === 'true';
    if (allDone && !wasAlreadyDone) {
      localStorage.setItem('dopamine_detox_completed', 'true');
      setShowUnlockModal(true);
      window.dispatchEvent(new Event('proStatusChanged'));
    } else if (!allDone) {
      localStorage.removeItem('dopamine_detox_completed');
      window.dispatchEvent(new Event('proStatusChanged'));
    }
  }, [detoxDays]);

  const toggleDetoxDay = (dayKey) => {
    setDetoxDays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const getDetoxStage = (dayNum) => {
    if (dayNum <= 2) return { name: 'The Crash', desc: 'Severe cravings, low energy. Maintain cold showers and physiological sighs.', color: '#EF4444' };
    if (dayNum <= 4) return { name: 'The Clarity', desc: 'First signs of focus recovery. Engage in 90-minute deep work cycles.', color: '#3B82F6' };
    if (dayNum <= 6) return { name: 'The Flow', desc: 'Flow state achieved without external triggers. Creative work reintegration.', color: '#A855F7' };
    return { name: 'The Reintegration', desc: 'Establish strict device rules, build weekly micro-detoxes.', color: '#10B981' };
  };

  return (
    <div className="dx-panels premium-dashboard font-body text-mist bg-obsidian min-h-screen">
      
      {/* 1. Dashboard Cyber Header */}
      <div className="relative overflow-hidden mb-4 md:mb-6 p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-2xl" style={{ background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(0,255,255,0.1)' }}>
        {/* Glow behind the header */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(0,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 relative z-10">
          <div className="min-w-0">
            <h2 className="margin-0 text-xl md:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2 md:gap-3">
              <Brain className="w-6 h-6 md:w-8 md:h-8 text-cyan-glow drop-shadow-[0_0_10px_#00FFFF]" />
              <span className="truncate">SPECTR ACADEMY</span>
            </h2>
            <p className="margin-0 mt-1.5 md:mt-2 text-white/50 text-xs md:text-sm max-w-xl leading-relaxed hidden sm:block">
              Ваш личный кабинет нейропрограммирования и биооптимизации. Доступ к курсу ($38 единоразово) и регулярным обновлениям ($28/мес) активен. Используйте трекер для закрепления результатов.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-3 md:gap-6 bg-black/40 border border-white/5 rounded-[16px] md:rounded-[20px] p-3 md:p-5 shadow-inner">
            <div className="text-center pr-3 md:pr-5 border-r border-white/5">
              <div className="text-[8px] md:text-[10px] font-bold text-cyan-glow uppercase tracking-widest">Detox</div>
              <div className="font-mono text-xl md:text-3xl font-black mt-0.5 md:mt-1 text-white flex items-baseline gap-1 justify-center">
                {Object.values(detoxDays).filter(v => v === true).length}<span className="text-xs md:text-sm text-white/30">/7</span>
              </div>
            </div>
            <div className="text-center pr-3 md:pr-5 border-r border-white/5">
              <div className="text-[8px] md:text-[10px] font-bold text-magenta-glow uppercase tracking-widest">Streak</div>
              <div className="font-mono text-xl md:text-3xl font-black mt-0.5 md:mt-1 text-white flex items-baseline gap-1 justify-center text-fuchsia-400">
                12<span className="text-[10px] md:text-xs text-white/30">days</span>
              </div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Terminal Bonus</div>
              <div className="font-mono text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00FFFF]" />
                Unlocked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cyber Tabs Selector */}
      {/* Horizontal Pills Navigation */}
      <div style={{ 
        display: 'flex', gap: '8px', marginBottom: '20px', 
        overflowX: 'auto', paddingBottom: '4px',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', borderRadius: '12px',
                fontWeight: 800, fontSize: '11px', letterSpacing: '0.04em',
                transition: 'all 0.25s', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                boxSizing: 'border-box',
                background: isActive ? `${tab.color}18` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${isActive ? `${tab.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? tab.color : 'rgba(255,255,255,0.4)',
                boxShadow: isActive ? `0 0 20px ${tab.color}12` : 'none',
                fontFamily: 'inherit'
              }}
            >
              <Icon size={18} style={{ color: isActive ? tab.color : 'rgba(255,255,255,0.3)' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* ================== PEPTIDES TAB ================== */}
          {activeTab === 'peptides' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
              <div className="relative overflow-hidden rounded-[20px] md:rounded-[24px]" style={{ background: 'rgba(10, 10, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
                    <Dna className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" /> Peptide Cycles
                  </h3>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '10px',
                      background: showAddForm ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${showAddForm ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      color: showAddForm ? '#00FFFF' : 'rgba(255,255,255,0.5)',
                      fontSize: '10px', fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.2s', fontFamily: 'inherit', minHeight: '36px'
                    }}
                  >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    {showAddForm ? 'Cancel' : 'Add Peptide'}
                  </button>
                </div>

                {/* Add Peptide Form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="relative overflow-hidden rounded-xl mb-4 p-4" style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(0,255,255,0.15)' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(180deg, #00FFFF, transparent)' }} />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">Name *</label>
                            <input type="text" value={newPeptide.name} onChange={e => setNewPeptide({ ...newPeptide, name: e.target.value })}
                              placeholder="e.g. Magnesium Glycinate"
                              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 11px', fontSize: '11px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">Dosage</label>
                            <input type="text" value={newPeptide.dosage} onChange={e => setNewPeptide({ ...newPeptide, dosage: e.target.value })}
                              placeholder="e.g. 400mg"
                              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 11px', fontSize: '11px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">Method</label>
                            <select value={newPeptide.method} onChange={e => setNewPeptide({ ...newPeptide, method: e.target.value })}
                              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 11px', fontSize: '11px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">Cycle</label>
                              <input type="number" value={newPeptide.cycleDays} onChange={e => setNewPeptide({ ...newPeptide, cycleDays: e.target.value })} min={1}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 11px', fontSize: '11px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-1">Rest</label>
                              <input type="number" value={newPeptide.restDays} onChange={e => setNewPeptide({ ...newPeptide, restDays: e.target.value })} min={0}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 11px', fontSize: '11px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                        </div>
                        <button onClick={addPeptide} disabled={!newPeptide.name.trim()}
                          style={{
                            width: '100%', marginTop: '12px', padding: '10px', borderRadius: '10px',
                            background: newPeptide.name.trim() ? 'linear-gradient(135deg, #00FFFF, #0891b2)' : 'rgba(255,255,255,0.04)',
                            color: newPeptide.name.trim() ? '#000' : 'rgba(255,255,255,0.3)',
                            fontWeight: 900, border: 'none', cursor: newPeptide.name.trim() ? 'pointer' : 'default',
                            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'inherit', minHeight: '38px'
                          }}>
                          Save Peptide
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-3">
                  {peptideCycles.map(p => {
                    const isExpanded = activePeptideDetails === p.id;
                    const pct = p.status === 'active' ? Math.round((p.currentDay / p.cycleDays) * 100) : 0;

                    return (
                      <div key={p.id} 
                          onClick={() => setActivePeptideDetails(isExpanded ? null : p.id)}
                          className="active:scale-[0.99] transition-all duration-300 cursor-pointer"
                          style={{
                            background: p.status === 'active' ? 'rgba(0,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${p.status === 'active' ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '16px',
                            display: 'flex', flexDirection: 'row'
                          }}>
                          {/* Left Accent Bar */}
                          <div style={{
                            width: '3px', minHeight: '100%', borderRadius: '16px 0 0 16px', flexShrink: 0,
                            background: p.status === 'active' ? 'linear-gradient(180deg, #00FFFF, #0891b2)' : 'rgba(255,255,255,0.08)',
                            boxShadow: p.status === 'active' ? '0 0 10px rgba(0,255,255,0.3)' : 'none'
                          }} />

                          {/* Card Content */}
                          <div className="flex-1 p-5 min-w-0 overflow-hidden">
                            {/* Row 1: Name + Bell + Action Button */}
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <span className="font-display text-[17px] font-black tracking-tight block truncate" style={{ color: p.status === 'active' ? '#fff' : 'rgba(255,255,255,0.6)' }}>{p.name}</span>
                              </div>

                              {/* Bell */}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleNotification(p.id); }}
                                style={{
                                  background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                                  color: p.notifications ? '#FEB019' : 'rgba(255,255,255,0.2)',
                                  transition: 'all 0.2s', display: 'flex', flexShrink: 0
                                }}>
                                {p.notifications ? <Bell size={16} /> : <BellOff size={16} />}
                              </button>

                              {/* Action Button (Pause/Start) */}
                              <button
                                onClick={(e) => { e.stopPropagation(); togglePeptideStatus(p.id); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '5px',
                                  padding: '7px 12px', borderRadius: '10px', flexShrink: 0,
                                  background: p.status === 'active' ? 'rgba(255,69,96,0.1)' : 'rgba(0,255,255,0.1)',
                                  border: `1px solid ${p.status === 'active' ? 'rgba(255,69,96,0.25)' : 'rgba(0,255,255,0.25)'}`,
                                  color: p.status === 'active' ? '#FF6B8A' : '#00FFFF',
                                  fontSize: '10px', fontWeight: 800, cursor: 'pointer',
                                  transition: 'all 0.25s', fontFamily: 'inherit', minHeight: '32px'
                                }}>
                                {p.status === 'active' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Start</>}
                              </button>
                            </div>

                            {/* Row 2: Dosage */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[12px] font-medium" style={{ color: p.status === 'active' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)' }}>{p.dosage} · {p.method}</span>
                              {p.status === 'active' && (
                                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">ACTIVE</span>
                              )}
                            </div>

                            {/* Progress */}
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-mono" style={{ color: p.status === 'active' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>
                                  {p.status === 'active' ? `Day ${p.currentDay} / ${p.cycleDays}` : 'Paused'}
                                </span>
                                {p.status === 'active' && (
                                  <span className="text-[12px] font-black font-mono" style={{ color: pct > 70 ? '#00E396' : pct > 30 ? '#00FFFF' : 'rgba(255,255,255,0.5)' }}>
                                    {pct}%
                                  </span>
                                )}
                              </div>
                              {/* Progress Bar with tick marks */}
                              <div className="relative">
                                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: p.status === 'active' ? 'rgba(0,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}>
                                  <div 
                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                                    style={{ 
                                      width: p.status === 'active' ? `${pct}%` : '0%',
                                      background: pct > 70 ? 'linear-gradient(90deg, #00FFFF, #00E396)' : 'linear-gradient(90deg, #0891b2, #00FFFF)',
                                      boxShadow: p.status === 'active' ? '0 0 12px rgba(0,255,255,0.4)' : 'none'
                                    }}
                                  />
                                </div>
                                {/* Tick marks */}
                                <div className="flex justify-between mt-1 px-0.5">
                                  {[25, 50, 75, 100].map(tick => (
                                    <span key={tick} className="text-[7px] font-mono" style={{ color: pct >= tick ? 'rgba(0,255,255,0.5)' : 'rgba(255,255,255,0.15)' }}>{tick}%</span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Expandable Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  style={{ overflow: 'hidden' }}
                                  className="pt-3 border-t border-white/5"
                                >
                                  <div className="flex flex-wrap gap-2">
                                    <button onClick={e => { e.stopPropagation(); deletePeptide(p.id); }}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        padding: '7px 11px', borderRadius: '8px',
                                        background: 'rgba(255,69,96,0.08)', border: '1px solid rgba(255,69,96,0.2)',
                                        color: '#FF4560', fontSize: '9px', fontWeight: 800,
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                        cursor: 'pointer', transition: 'all 0.2s', minHeight: '32px', fontFamily: 'inherit'
                                      }}>
                                      <Trash2 size={11} /> Delete
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[16px] md:rounded-[20px]" style={{ background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,255,255,0.15)', padding: '16px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(180deg, #00FFFF, transparent)', boxShadow: '0 0 10px rgba(0,255,255,0.3)' }} />
                  <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info size={12} /> HPLC Guide
                  </h4>
                  <p className="text-[10px] text-white/50 leading-relaxed mb-3">Peptide quality is critical. High-quality peptides must test at <strong className="text-white/70">98%+ purity</strong>.</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2 border border-white/[0.03]">
                      <span className="text-[10px] text-white/40">Storage</span>
                      <span className="text-[10px] text-white font-mono font-bold">2–8 °C</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2 border border-white/[0.03]">
                      <span className="text-[10px] text-white/40">HPLC Purity</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">99.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== TAB 2: DETOX ================== */}
          {activeTab === 'detox' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
              <div className="relative overflow-hidden rounded-[20px] md:rounded-[24px]" style={{ background: 'rgba(10, 10, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-4 md:mb-5 flex items-center gap-2 md:gap-3">
                  <Flame className="w-4 h-4 md:w-5 md:h-5 text-rose-500 drop-shadow-[0_0_5px_#EF4444]" /> Dopamine Reset 2.0
                </h3>

                {/* Dopamine Level Simulator */}
                {(() => {
                  const completedDays = Object.values(detoxDays).filter(v => v === true).length;
                  const baselinePct = completedDays === 0 ? 30 : completedDays <= 2 ? 15 : completedDays <= 4 ? 45 : completedDays <= 6 ? 75 : 100;
                  const statusLabel = completedDays === 0 ? 'Excess baseline noise' : completedDays <= 2 ? 'The Crash phase' : completedDays <= 4 ? 'Clarity returning' : completedDays <= 6 ? 'Flow mode unlocked' : 'Hardware cleared';
                  const stageColor = completedDays <= 2 ? '#EF4444' : completedDays <= 6 ? '#3B82F6' : '#10B981';
                  return (
                    <div className="relative overflow-hidden rounded-2xl mb-4 md:mb-5" style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: `linear-gradient(180deg, ${stageColor}, transparent)`, boxShadow: `0 0 10px ${stageColor}40` }} />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Receptor Sensitivity</span>
                          <span className="font-mono text-xs font-black" style={{ color: stageColor }}>{baselinePct}%</span>
                        </div>
                        <div className="relative w-full h-2 bg-white/[0.04] rounded-full overflow-hidden mb-2">
                          {[25, 50, 75].map(tick => (
                            <div key={tick} style={{ position: 'absolute', left: `${tick}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                          ))}
                          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${baselinePct}%`, background: `linear-gradient(90deg, #EF4444, ${stageColor})`, boxShadow: `0 0 10px ${stageColor}40` }} />
                        </div>
                        <p className="text-[10px] text-white/50"><span className="text-white/70 font-bold">{statusLabel}</span> — {completedDays}/7 days</p>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="space-y-2 md:space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => {
                    const key = `day${day}`;
                    const isDone = detoxDays[key];
                    const stage = getDetoxStage(day);
                    return (
                      <div 
                        key={day}
                        onClick={() => toggleDetoxDay(key)}
                        className="group relative overflow-hidden active:scale-[0.99] transition-transform duration-200 cursor-pointer"
                        style={{
                          background: 'rgba(18, 18, 26, 0.8)',
                          border: `1px solid ${isDone ? `${stage.color}25` : 'rgba(255,255,255,0.05)'}`,
                          borderRadius: '14px',
                          display: 'flex',
                          flexDirection: 'row'
                        }}
                      >
                        {/* Left Accent Bar */}
                        <div style={{
                          width: '3px', minHeight: '100%', borderRadius: '14px 0 0 14px', flexShrink: 0,
                          background: isDone ? `linear-gradient(180deg, ${stage.color}, ${stage.color}60)` : 'rgba(255,255,255,0.06)',
                          boxShadow: isDone ? `0 0 10px ${stage.color}30` : 'none'
                        }} />

                        <div className="flex-1 p-3 md:p-4 flex items-center justify-between gap-3 overflow-hidden">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                              border: `1.5px solid ${isDone ? stage.color : 'rgba(255,255,255,0.15)'}`,
                              background: isDone ? `${stage.color}15` : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: isDone ? `0 0 10px ${stage.color}30` : 'none',
                              transition: 'all 0.3s'
                            }}>
                              {isDone && <CheckCircle2 size={14} style={{ color: stage.color }} />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-[14px] md:text-[15px] text-white font-black tracking-tight">DAY 0{day}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: `${stage.color}12`, border: `1px solid ${stage.color}25`, color: stage.color }}>
                                  {stage.name.split('(')[0].trim()}
                                </span>
                              </div>
                              <p className="text-[10px] md:text-[11px] text-white/40 leading-relaxed mt-0.5 truncate">{stage.desc}</p>
                            </div>
                          </div>

                          <span className="text-[9px] font-mono font-bold shrink-0" style={{ color: isDone ? stage.color : 'rgba(255,255,255,0.2)' }}>
                            {isDone ? 'DONE' : 'TODO'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar: Detox Blacklist */}
              <div className="space-y-4 md:space-y-6">
                <div className="relative overflow-hidden rounded-[16px] md:rounded-[20px]" style={{ background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(239,68,68,0.15)', padding: '16px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(180deg, #EF4444, transparent)', boxShadow: '0 0 10px rgba(239,68,68,0.3)' }} />
                  <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Detox Blacklist
                  </h4>
                  <div className="space-y-2">
                    {['No scrolling algorithms (TikTok, Reels, Twitter)', 'No highly processed food / artificial sugars', 'No screen time inside the bedroom', 'No dopamine triggers before deep work blocks'].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-black/30 rounded-lg p-2.5 border border-white/[0.03]">
                        <div className="mt-0.5 px-1.5 py-0.5 bg-rose-500/15 text-rose-400 rounded text-[8px] font-black shrink-0">X</div>
                        <span className="text-[10px] md:text-[11px] text-white/60 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUnlockModal(false)}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{ position: 'relative', width: '100%', maxWidth: '420px', backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(0,255,255,0.4)', borderRadius: '24px', padding: '40px 28px', boxShadow: '0 0 100px rgba(0,255,255,0.15)', textAlign: 'center', zIndex: 10 }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#00FFFF', boxShadow: '0 0 40px rgba(0,255,255,0.3)' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>NEURAL CORE UPGRADED</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '24px' }}>
                Dopamine detox complete. Your cold-state logic is restored.
              </p>
              <button onClick={() => { setShowUnlockModal(false); window.dispatchEvent(new Event('proStatusChanged')); }}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg, #00FFFF, #0080FF)', color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,255,255,0.3)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1.5px', fontFamily: 'inherit' }}>
                Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
