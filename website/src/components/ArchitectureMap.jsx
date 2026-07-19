import React, { useState } from 'react';
import { Layers, Bot, Zap, Shield, Repeat, Cpu } from 'lucide-react';

export default function ArchitectureMap() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: '1. Rust Kernel Initialization',
      icon: <Layers size={18} color="var(--accent-cyan)" />,
      desc: 'Bypasses the single-threaded Python GIL lock. Miner validation requests are queued and multiplexed through a native asynchronous scheduling core.',
      color: 'var(--accent-cyan)'
    },
    {
      title: '2. SapParser Syntax Analysis',
      icon: <Zap size={18} color="var(--accent-purple)" />,
      desc: 'Auto-corrects structural formatting anomalies in LLM response payloads. Repairs brackets, commas, and formatting errors in microseconds.',
      color: 'var(--accent-purple)'
    },
    {
      title: '3. AWS Firecracker Isolation',
      icon: <Shield size={18} color="var(--accent-green)" />,
      desc: 'Secures execution by encapsulating untrusted dynamic scripts inside single-use micro-virtual machines. Protects validator hotkeys and host memory.',
      color: 'var(--accent-green)'
    },
    {
      title: '4. Bitsec Telemetry Stream',
      icon: <Repeat size={18} color="var(--accent-pink)" />,
      desc: 'Safely logs non-sensitive audit telemetry (size of code inspected, detected vulnerability levels) and pushes payloads directly to Subnet 60.',
      color: 'var(--accent-pink)'
    }
  ];

  return (
    <section id="architecture" style={{
      maxWidth: '1200px',
      margin: '0 auto 0 auto',
      padding: '0 24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span className="glow-badge glow-badge-purple" style={{ marginBottom: '12px' }}>System Architecture</span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
          Surfclaw Protocol Flow
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Interactive schematic detailing how validation requests are accelerated, auto-healed, secured, and reported to the Bitsec security network.
        </p>
      </div>

      <div className="glass-panel" style={{
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px'
      }}>
        {/* Dynamic Schematic Map */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 800 200" style={{ width: '100%', maxWidth: '750px', height: 'auto' }}>
            <defs>
              <linearGradient id="cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-cyan)" />
                <stop offset="100%" stopColor="var(--accent-purple)" />
              </linearGradient>
              <linearGradient id="purple-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-purple)" />
                <stop offset="100%" stopColor="var(--accent-green)" />
              </linearGradient>
              <linearGradient id="green-pink" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-green)" />
                <stop offset="100%" stopColor="var(--accent-pink)" />
              </linearGradient>
            </defs>

            {/* Connecting Pipes with Dash Animations */}
            <path d="M 150 100 L 310 100" fill="none" stroke={activeStep >= 1 ? 'url(#cyan-purple)' : 'rgba(255,255,255,0.08)'} strokeWidth="3" strokeDasharray={activeStep >= 1 ? '6,6' : '0'} className="animated-flow" />
            <path d="M 390 100 L 550 100" fill="none" stroke={activeStep >= 2 ? 'url(#purple-green)' : 'rgba(255,255,255,0.08)'} strokeWidth="3" strokeDasharray={activeStep >= 2 ? '6,6' : '0'} className="animated-flow" />
            <path d="M 610 100 L 730 100" fill="none" stroke={activeStep >= 3 ? 'url(#green-pink)' : 'rgba(255,255,255,0.08)'} strokeWidth="3" strokeDasharray={activeStep >= 3 ? '6,6' : '0'} className="animated-flow" />

            {/* Node 1: Kernel Initialization */}
            <g transform="translate(100, 100)" onClick={() => setActiveStep(0)} style={{ cursor: 'pointer' }}>
              <circle r="42" fill="#04060a" stroke={activeStep === 0 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'} strokeWidth="2" style={{ transition: 'stroke 0.3s' }} />
              <circle r="48" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="3 3" opacity={activeStep === 0 ? 0.6 : 0} style={{ transition: 'opacity 0.3s' }} />
              <text y="-55" fill={activeStep === 0 ? '#fff' : 'var(--color-text-secondary)'} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-heading)">1. Rust Kernel</text>
              <rect x="-18" y="-18" width="36" height="36" rx="6" fill="rgba(0, 240, 255, 0.1)" stroke="var(--accent-cyan)" strokeWidth="1" />
              <path d="M -10 -5 L 0 -10 L 10 -5 L 0 0 Z" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
              <path d="M -10 0 L 0 5 L 10 0" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
              <path d="M -10 5 L 0 10 L 10 5" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5"/>
            </g>

            {/* Node 2: SapParser */}
            <g transform="translate(350, 100)" onClick={() => setActiveStep(1)} style={{ cursor: 'pointer' }}>
              <circle r="42" fill="#04060a" stroke={activeStep === 1 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)'} strokeWidth="2" style={{ transition: 'stroke 0.3s' }} />
              <circle r="48" fill="none" stroke="var(--accent-purple)" strokeWidth="1" strokeDasharray="3 3" opacity={activeStep === 1 ? 0.6 : 0} style={{ transition: 'opacity 0.3s' }} />
              <text y="-55" fill={activeStep === 1 ? '#fff' : 'var(--color-text-secondary)'} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-heading)">2. SapParser</text>
              <rect x="-18" y="-18" width="36" height="36" rx="6" fill="rgba(168, 85, 247, 0.1)" stroke="var(--accent-purple)" strokeWidth="1" />
              <path d="M 2 -10 L -10 0 L 0 0 L -2 10 L 10 -2 L 0 -2 Z" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5"/>
            </g>

            {/* Node 3: Firecracker Sandbox */}
            <g transform="translate(600, 100)" onClick={() => setActiveStep(2)} style={{ cursor: 'pointer' }}>
              <circle r="42" fill="#04060a" stroke={activeStep === 2 ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'} strokeWidth="2" style={{ transition: 'stroke 0.3s' }} />
              <circle r="48" fill="none" stroke="var(--accent-green)" strokeWidth="1" strokeDasharray="3 3" opacity={activeStep === 2 ? 0.6 : 0} style={{ transition: 'opacity 0.3s' }} />
              <text y="-55" fill={activeStep === 2 ? '#fff' : 'var(--color-text-secondary)'} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-heading)">3. MicroVM Isolation</text>
              <rect x="-18" y="-18" width="36" height="36" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="var(--accent-green)" strokeWidth="1" />
              <path d="M -10 -4 L 0 -12 L 10 -4 L 10 6 C 10 10, -10 10, -10 6 Z" fill="none" stroke="var(--accent-green)" strokeWidth="1.5"/>
            </g>
          </svg>
        </div>

        {/* Dynamic Steps Explanator */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.01)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.03)',
          transition: 'all 0.3s'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {steps[activeStep].icon}
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {steps[activeStep].title}
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {steps[activeStep].desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
