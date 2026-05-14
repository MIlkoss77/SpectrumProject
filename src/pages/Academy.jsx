import React, { useState } from 'react'
import { BookOpen, CheckCircle, Award, Lock, PlayCircle, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import './dashboard.css'

const MODULES = [
  {
    id: 1,
    title: 'Neuro-Foundation',
    desc: 'The "Hardware" upgrade. Optimize your biology for high-stakes decision making.',
    progress: 0,
    reward: 'Neural Base Badge',
    gradient: 'linear-gradient(135deg, #00FFFF, #0080FF)',
    lessons: [
      {
        title: 'Biohacking for Clarity',
        duration: '10 min read',
        completed: false,
        content: `Your brain is the hardware of your trading system. If the hardware is laggy, no strategy will save you.\n\nKey Pillars of Neuro-Foundation:\n• Dopamine Reset: Why social media and junk food are destroying your trading patience.\n• Sleep Optimization: The link between REM sleep and pattern recognition.\n• Cold Exposure: Training the nervous system to remain calm under financial pressure.\n• Nutrition: Why blood sugar spikes lead to impulsive entries.\n\nAction Item: Tomorrow morning, delay your first dose of caffeine by 90 minutes to allow natural adenosine clearance.`,
        quiz: { q: 'Why is dopamine management important for traders?', options: ['It makes you trade faster', 'It preserves patience and prevents impulsive decisions', 'It helps with chart colors'], answer: 1 }
      },
      {
        title: 'The Peptide Protocol',
        duration: '8 min read',
        completed: false,
        content: `Advanced biohacking for the 1%. Exploring substances that enhance cognitive function.\n\nNeuro-Peptides Overview:\n• Cerebrolysin: Enhancing neuroplasticity and recovery.\n• Semax: Improving focus and memory during high-volatility events.\n• Selank: Reducing anxiety without sedation — keeping you in the "Cold Zone".\n\n⚠️ Disclaimer: Always consult a professional. We focus on the science of optimization, not medical advice.`,
        quiz: { q: 'Which peptide is primarily known for reducing anxiety without sedation?', options: ['Semax', 'Selank', 'Cerebrolysin'], answer: 1 }
      }
    ]
  },
  {
    id: 2,
    title: 'Mindset Programming',
    desc: 'The "Software" upgrade. Re-write the scripts in your prefrontal cortex.',
    progress: 0,
    reward: 'Focus Master Badge',
    gradient: 'linear-gradient(135deg, #FF00FF, #8000FF)',
    lessons: [
      {
        title: 'The Prefrontal Cortex (PFC)',
        duration: '12 min read',
        completed: false,
        content: `The PFC is your "CEO". When fear kicks in, the Amygdala hijacks the PFC, and you make "crypto-perm" mistakes.\n\nPFC Activation Techniques:\n• Physiological Sigh: Two inhales, one long exhale to instantly lower heart rate.\n• Visualization: Simulating loss before it happens to desensitize the fear response.\n• Affirmations: Hard-coding the belief that "I am a disciplined observer of the market."`,
        quiz: { q: 'Which part of the brain is responsible for logical decision making?', options: ['Amygdala', 'Prefrontal Cortex', 'Hippocampus'], answer: 1 }
      },
      {
        title: 'Entering the Flow State',
        duration: '15 min read',
        completed: false,
        content: `Flow is when the self disappears and you become one with the data. It is the highest state of performance.\n\nFlow Triggers:\n• High Stakes: The market provides this naturally.\n• Clear Goals: Know your exit before you enter.\n• Immediate Feedback: The PnL provides this.\n• Challenge/Skill Balance: Don't trade size that makes you vomit.`,
        quiz: { q: 'What is a key requirement for entering the Flow State?', options: ['High anxiety', 'A balance between challenge and skill', 'Listening to loud music'], answer: 1 }
      }
    ]
  },
  {
    id: 3,
    title: 'Market as a Mirror',
    desc: 'Understanding global sentiment as a biological mass-phenomenon.',
    progress: 0,
    reward: 'Sentiment Expert',
    gradient: 'linear-gradient(135deg, #00FF00, #008000)',
    lessons: [
      {
        title: 'The Biology of Crowds',
        duration: '10 min read',
        completed: false,
        content: `Charts are just heartbeats of the collective human nervous system. Fear and Greed are contagious.\n\nSentiment Signals:\n• Extreme Greed: The mass Amygdala is over-stimulated. Time to exit.\n• Extreme Fear: The mass nervous system is in "freeze" mode. Time to look for entries.\n\nSpectr Sentiment Heatmap shows you these biological states in real-time.`,
        quiz: { q: 'What does a chart represent in this philosophy?', options: ['Random numbers', 'The collective nervous system of the market', 'Historical data'], answer: 1 }
      }
    ]
  },
  {
    id: 4,
    title: 'System Integration',
    desc: 'Using Spectr Trading tools with your upgraded brain.',
    progress: 0,
    reward: 'Improved Self Badge',
    gradient: 'linear-gradient(135deg, #FFFF00, #808000)',
    lessons: [
      {
        title: 'The Neural Workflow',
        duration: '15 min read',
        completed: false,
        content: `Now that your brain is upgraded, we use Spectr to filter the remaining noise.\n\nWorkflow:\n1. Check News (Global Awareness).\n2. Check Whale Radar (Tracking the Apex Predators).\n3. Check AI Forecasts (Neural confirmation).\n4. Execute on Polymarket (Monetizing your prediction).\n\nYou are now an improved version of yourself. The system is ready.`,
        quiz: { q: 'What is the final step in the Neural Workflow?', options: ['Checking Twitter', 'Executing on Polymarket', 'Asking a friend'], answer: 1 }
      }
    ]
  }
]

/* ── Course Viewer with Real Content ── */
function CourseViewer({ module, onClose, onComplete }) {
  const [currentLesson, setCurrentLesson] = useState(
    module.lessons.findIndex(l => !l.completed) >= 0
      ? module.lessons.findIndex(l => !l.completed)
      : 0
  )
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Block body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  if (!module) return null

  const lesson = module.lessons[currentLesson]
  const isCorrect = quizAnswer === lesson.quiz.answer

  const handleAnswer = (idx) => {
    setQuizAnswer(idx)
    setShowResult(true)
    if (idx === lesson.quiz.answer) {
      onComplete(module.id, currentLesson)
    }
  }

  const goNext = () => {
    if (currentLesson < module.lessons.length - 1) {
      setCurrentLesson(prev => prev + 1)
      setQuizAnswer(null)
      setShowResult(false)
    }
  }

  const goPrev = () => {
    if (currentLesson > 0) {
      setCurrentLesson(prev => prev - 1)
      setQuizAnswer(null)
      setShowResult(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-2 md:p-6"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(15px)',
        zIndex: 9999, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        display: 'block', padding: 'env(safe-area-inset-top) 0 env(safe-area-inset-bottom)'
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="dx-card flex flex-col md:flex-row"
        style={{
          width: '100%', maxWidth: 1000,
          minHeight: '100dvh', // Use minHeight instead of height
          margin: '0 auto',
          padding: 0, overflow: 'visible', position: 'relative',
          borderRadius: 0, border: 'none'
        }}
      >
        {/* Sidebar */}
        <div className="w-full md:w-[280px] h-[35%] md:h-full border-b md:border-r border-white/10 shrink-0" style={{ background: 'var(--surface-1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{module.title}</h3>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {module.lessons.filter(l => l.completed).length}/{module.lessons.length} Lessons
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {module.lessons.map((l, i) => (
              <button
                key={i}
                onClick={() => { setCurrentLesson(i); setQuizAnswer(null); setShowResult(false) }}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 20px',
                  background: currentLesson === i ? 'rgba(0, 255, 255, 0.05)' : 'transparent',
                  border: 'none', borderBottom: '1px solid var(--line)',
                  color: currentLesson === i ? '#fff' : 'var(--muted)',
                  cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center'
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: l.completed ? '#4caf50' : currentLesson === i ? 'var(--accent)' : 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000',
                  flexShrink: 0
                }}>
                  {l.completed ? <CheckCircle size={14} color="#fff" /> : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: currentLesson === i ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{l.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {/* Header */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>{lesson.title}</h2>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Lesson {currentLesson + 1} of {module.lessons.length} • {lesson.duration}</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff',
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 28px 20px',
            minHeight: 0 // Crucial for nested flex scrolling
          }}>
            {/* Lesson text */}
            <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line', marginBottom: 32 }}>
              {lesson.content}
            </div>

            {/* Quiz */}
            <div style={{
              background: 'rgba(0, 255, 255, 0.04)',
              border: '1px solid rgba(0, 255, 255, 0.1)',
              borderRadius: 16, padding: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                <Sparkles size={16} /> KNOWLEDGE CHECK
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>{lesson.quiz.q}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lesson.quiz.options.map((opt, idx) => {
                  let bg = 'rgba(255,255,255,0.04)'
                  let borderC = 'rgba(255,255,255,0.08)'
                  if (showResult && idx === lesson.quiz.answer) { bg = 'rgba(76, 175, 80, 0.15)'; borderC = '#4caf50' }
                  else if (showResult && idx === quizAnswer && !isCorrect) { bg = 'rgba(255, 59, 48, 0.15)'; borderC = '#ff3b30' }

                  return (
                    <button
                      key={idx}
                      onClick={() => !showResult && handleAnswer(idx)}
                      disabled={showResult}
                      style={{
                        textAlign: 'left', padding: '12px 16px', borderRadius: 10,
                        background: bg, border: `1px solid ${borderC}`,
                        color: '#fff', cursor: showResult ? 'default' : 'pointer',
                        fontSize: 14, transition: 'all 0.2s',
                        opacity: showResult && idx !== quizAnswer && idx !== lesson.quiz.answer ? 0.4 : 1,
                        fontFamily: 'inherit'
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 16, padding: '10px 14px', borderRadius: 8,
                    background: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                    fontSize: 13, color: isCorrect ? '#4caf50' : '#ff3b30', fontWeight: 600
                  }}
                >
                  {isCorrect ? '✅ Correct! Lesson marked as complete.' : '❌ Not quite. Try the next lesson and come back!'}
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom nav */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="dx-btn secondary" onClick={goPrev} disabled={currentLesson === 0} style={{ gap: 6 }}>
              <ChevronLeft size={16} /> Previous
            </button>
            <button className="dx-btn primary" onClick={goNext} disabled={currentLesson === module.lessons.length - 1} style={{ gap: 6 }}>
              Next Lesson <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div >
  )
}

export default function Academy() {
  const { t } = useTranslation()
  const [modules, setModules] = useState(MODULES)
  const [activeModule, setActiveModule] = useState(null)

  const handleComplete = (moduleId, lessonIdx) => {
    setModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m
      const updated = { ...m, lessons: m.lessons.map((l, i) => i === lessonIdx ? { ...l, completed: true } : l) }
      updated.progress = Math.round(updated.lessons.filter(l => l.completed).length / updated.lessons.length * 100)
      return updated
    }))
    // Also update active module if open
    setActiveModule(prev => {
      if (!prev || prev.id !== moduleId) return prev
      const updated = { ...prev, lessons: prev.lessons.map((l, i) => i === lessonIdx ? { ...l, completed: true } : l) }
      updated.progress = Math.round(updated.lessons.filter(l => l.completed).length / updated.lessons.length * 100)
      return updated
    })
  }

  const handleStart = (m) => {
    const i = modules.findIndex(mod => mod.id === m.id)
    if (i > 0 && modules[i - 1].progress < 100) {
      console.warn("Prev module locked");
      return
    }
    setActiveModule(m)
  }

  return (
    <div className="dx-panels premium-dashboard">
      <AnimatePresence>
        {activeModule && <CourseViewer module={activeModule} onClose={() => setActiveModule(null)} onComplete={handleComplete} />}
      </AnimatePresence>

      <div className="dx-card ta-head">
        <div>
          <h2 style={{ margin: 0 }}>{t('pages.academy.title') || 'Spectr Neuro-Library'}</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            {t('pages.academy.subtitle') || 'Master your mind, biohack your body, and unlock neural trading features.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ padding: '8px 12px', background: 'rgba(255, 152, 0, 0.1)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#ff9800' }}>{t('pages.academy.xp_level') || 'XP LEVEL'}</div>
            <div style={{ fontWeight: 700 }}>LVL {1 + modules.filter(m => m.progress === 100).length}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'rgba(26, 242, 255, 0.1)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--accent)' }}>{t('ui.completed') || 'COMPLETED'}</div>
            <div style={{ fontWeight: 700 }}>
              {modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0)}/{modules.reduce((acc, m) => acc + m.lessons.length, 0)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {modules.map((m, i) => {
          const isLocked = i > 0 && modules[i - 1].progress < 100

          return (
            <motion.div
              key={m.id}
              className="dx-card"
              style={{ opacity: isLocked ? 0.6 : 1, position: 'relative', overflow: 'hidden' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLocked ? 0.6 : 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Gradient accent top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: m.gradient }} />

              {m.progress === 100 && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#4caf50', color: '#000',
                  fontSize: 10, fontWeight: 700, padding: '4px 8px',
                  borderBottomLeftRadius: 8
                }}>
                  COMPLETED
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>
                  <BookOpen size={16} /> {t('pages.academy.module') || 'MODULE'} 0{m.id}
                </div>
                {isLocked && <Lock size={18} color="var(--muted)" />}
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>{m.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: '1.5em', minHeight: 42 }}>
                {m.desc}
              </p>

              <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  <Award size={16} color="#ff9800" /> Reward: <span style={{ color: '#ff9800' }}>{m.reward}</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', background: m.progress === 100 ? '#4caf50' : 'var(--accent)', borderRadius: 3 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                  <span>{m.progress}% Complete</span>
                  <span>{m.lessons.length} Lessons</span>
                </div>
              </div>

              <button
                className={`dx-btn ${m.progress === 100 ? 'secondary' : 'primary'}`}
                style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                disabled={isLocked}
                onClick={() => handleStart(m)}
              >
                {m.progress === 100 ? 'Review Course' : isLocked ? 'Locked' : m.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                {!isLocked && <PlayCircle size={16} />}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
