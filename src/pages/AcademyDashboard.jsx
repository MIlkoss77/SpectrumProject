import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Brain, Target, Shield, Zap, Sparkles } from 'lucide-react';

const DAILY_TASKS = [
  { id: 'hydration', title: 'Morning Hydration (Electrolytes)', category: 'Foundation', time: '08:00 AM' },
  { id: 'nlp_vis', title: 'NLP Market Visualization', category: 'Programming', time: '08:30 AM' },
  { id: 'semax', title: 'Nootropic Protocol (Semax / Caffeine)', category: 'Supplement', time: '09:00 AM' },
  { id: 'focus_block', title: 'Deep Work Block (No Social Media)', category: 'Habit', time: '10:00 AM' },
  { id: 'evening_reflection', title: 'Evening Neural Reflection', category: 'Programming', time: '08:00 PM' },
];

export default function AcademyDashboard() {
  const [completedTasks, setCompletedTasks] = useState([]);

  const toggleTask = (id) => {
    setCompletedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completedTasks.length / DAILY_TASKS.length) * 100);

  return (
    <div className="dx-panels premium-dashboard">
      <div className="dx-card ta-head" style={{ background: 'linear-gradient(135deg, rgba(255,0,255,0.1), rgba(0,255,255,0.05))', border: '1px solid rgba(255,0,255,0.2)' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={24} color="#FF00FF" /> Spectr Neuro-Tracker
          </h2>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>
            Upgrade your hardware before you upgrade your portfolio. Complete your daily protocols.
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#FF00FF' }}>{progress}%</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Optimization</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:300px', gap: '20px' }}>
        
        {/* Daily Protocol Checklist */}
        <div className="dx-card">
          <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--accent)" /> Daily Protocol Sequence
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DAILY_TASKS.map((task, i) => {
              const isCompleted = completedTasks.includes(task.id);
              return (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', borderRadius: '12px', cursor: 'pointer',
                    background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'var(--surface-2)',
                    border: \`1px solid \${isCompleted ? '#4caf50' : 'var(--line)'}\`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isCompleted ? <CheckCircle size={24} color="#4caf50" /> : <Circle size={24} color="var(--muted)" />}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: isCompleted ? '#4caf50' : '#fff', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{task.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>{task.time}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="dx-card" style={{ background: 'rgba(255,0,255,0.02)', border: '1px solid rgba(255,0,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <Target size={16} color="#FF00FF" /> Current Focus
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
              "Discipline equals freedom. By removing the noise of the external world, your internal neural pathways optimize for pattern recognition."
            </p>
          </div>

          <div className="dx-card">
            <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <Sparkles size={16} color="#00FFFF" /> Active Supplements
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ color: '#fff' }}>Semax 0.1%</span>
                <span style={{ color: '#00FFFF', fontWeight: 600 }}>Active</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ color: '#fff' }}>Magnesium L-Threonate</span>
                <span style={{ color: '#00FFFF', fontWeight: 600 }}>Nightly</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ color: '#fff' }}>Omega-3 (High EPA)</span>
                <span style={{ color: '#00FFFF', fontWeight: 600 }}>Active</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
