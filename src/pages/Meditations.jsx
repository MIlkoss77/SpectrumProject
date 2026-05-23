import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, PauseCircle, ShieldCheck, Heart } from 'lucide-react';

const TRACKS = [
  { 
    id: 1, 
    title: 'Morning NLP Affirmations', 
    duration: '12:00', 
    type: 'Programming', 
    color: '#FF00FF',
    url: 'https://assets.mixkit.co/music/preview/mixkit-forest-lullaby-1109.mp3' 
  },
  { 
    id: 2, 
    title: 'Deep Work Binaural Beats (40Hz)', 
    duration: '60:00', 
    type: 'Focus', 
    color: '#00FFFF',
    isSynthetic: true // Generated programmatically using Web Audio API
  },
  { 
    id: 3, 
    title: 'Vagus Nerve Reset (Sighing Protocol)', 
    duration: '05:00', 
    type: 'Recovery', 
    color: '#10B981',
    url: 'https://assets.mixkit.co/music/preview/mixkit-relaxation-42.mp3'
  },
  { 
    id: 4, 
    title: 'Market Volatility Stoic Reflection', 
    duration: '15:00', 
    type: 'Mindset', 
    color: '#F59E0B',
    url: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3'
  },
];

export default function Meditations() {
  const [activeTrack, setActiveTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Audio References
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);

  // Timer Interval
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset timer when track changes
  useEffect(() => {
    setElapsedTime(0);
  }, [activeTrack]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (leftOscRef.current) {
      try { leftOscRef.current.stop(); } catch(e){}
      leftOscRef.current.disconnect();
      leftOscRef.current = null;
    }
    if (rightOscRef.current) {
      try { rightOscRef.current.stop(); } catch(e){}
      rightOscRef.current.disconnect();
      rightOscRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch(e){}
      audioCtxRef.current = null;
    }
  };

  const startBinauralBeats = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Binaural Beat: Left at 200Hz, Right at 240Hz (40Hz difference processed in brain)
      const leftOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(200, ctx.currentTime);
      leftOscRef.current = leftOsc;

      const rightOsc = ctx.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(240, ctx.currentTime);
      rightOscRef.current = rightOsc;

      // Safe, comfortable volume levels
      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      leftGain.gain.setValueAtTime(0.08, ctx.currentTime);
      rightGain.gain.setValueAtTime(0.08, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);

      leftGain.connect(merger, 0, 0); // connect to left channel
      rightGain.connect(merger, 0, 1); // connect to right channel

      // Lowpass filter to produce a smooth, relaxing low-frequency hum
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, ctx.currentTime);

      merger.connect(filter);
      filter.connect(ctx.destination);

      leftOsc.start();
      rightOsc.start();
    } catch (err) {
      console.error('Failed to initialize Web Audio API for Binaural Beats:', err);
    }
  };

  const playTrack = (track) => {
    stopAllAudio();
    
    if (track.isSynthetic) {
      startBinauralBeats();
    } else if (track.url) {
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.volume = 0.4;
      audio.play().catch(err => console.log('Audio play blocked:', err));
      audioRef.current = audio;
    }
  };

  const handlePlay = (track) => {
    if (activeTrack?.id === track.id) {
      if (isPlaying) {
        // PAUSE
        if (track.isSynthetic) {
          if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
            audioCtxRef.current.suspend();
          }
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
        setIsPlaying(false);
      } else {
        // RESUME
        if (track.isSynthetic) {
          if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
          } else if (!audioCtxRef.current) {
            startBinauralBeats();
          }
        } else {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log(e));
          } else {
            const audio = new Audio(track.url);
            audio.loop = true;
            audio.volume = 0.4;
            audio.play().catch(e => console.log(e));
            audioRef.current = audio;
          }
        }
        setIsPlaying(true);
      }
    } else {
      // PLAY NEW
      setActiveTrack(track);
      setIsPlaying(true);
      playTrack(track);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dx-panels premium-dashboard">
      <div className="dx-card ta-head" style={{ background: 'linear-gradient(135deg, rgba(255,0,255,0.1), rgba(0,255,255,0.05))', border: '1px solid rgba(255,0,255,0.2)' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#FF00FF" /> Neural Meditations
          </h2>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>
            Audio protocols to reprogram your subconscious mind and regulate your nervous system.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Active Player */}
        {activeTrack && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dx-card"
            style={{ 
              background: `linear-gradient(to right, ${activeTrack.color}20, transparent)`,
              borderLeft: `4px solid ${activeTrack.color}`,
              display: 'flex', alignItems: 'center', gap: '20px', padding: '24px'
            }}
          >
            <button 
              onClick={() => handlePlay(activeTrack)}
              style={{ background: 'none', border: 'none', color: activeTrack.color, cursor: 'pointer' }}
            >
              {isPlaying ? <PauseCircle size={64} /> : <PlayCircle size={64} />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: activeTrack.color, textTransform: 'uppercase', letterSpacing: '2px' }}>
                NOW PLAYING
              </div>
              <h2 style={{ margin: '8px 0', fontSize: '24px' }}>{activeTrack.title}</h2>
              
              {/* Animated Audio Visualizer */}
              <div style={{ display: 'flex', gap: '4px', height: '30px', alignItems: 'center', marginTop: '16px' }}>
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={isPlaying ? {
                      height: [`${Math.random() * 20 + 10}px`, `${Math.random() * 30 + 10}px`, `${Math.random() * 20 + 10}px`]
                    } : { height: '4px' }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ flex: 1, backgroundColor: activeTrack.color, borderRadius: '2px', opacity: 0.7 }}
                  />
                ))}
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 300, color: 'var(--muted)', fontFamily: 'monospace' }}>
              {formatTime(elapsedTime)} <span style={{ fontSize: '14px' }}>/ {activeTrack.duration}</span>
            </div>
          </motion.div>
        )}

        {/* Track List */}
        <div className="dx-card" style={{ padding: '0' }}>
          {TRACKS.map((track, i) => {
            const isActive = activeTrack?.id === track.id;
            return (
              <div 
                key={track.id}
                onClick={() => handlePlay(track)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', cursor: 'pointer',
                  borderBottom: i < TRACKS.length - 1 ? '1px solid var(--line)' : 'none',
                  background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: `${track.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {isActive && isPlaying ? <PauseCircle size={20} color={track.color} /> : <PlayCircle size={20} color={track.color} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: isActive ? track.color : '#fff' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{track.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <Heart size={18} color="rgba(255,255,255,0.2)" />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)', width: '48px', textAlign: 'right' }}>
                    {track.duration}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
