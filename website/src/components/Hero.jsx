import React from 'react';
import { ArrowRight, Bot, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function Hero() {
  return (
    <section style={{
      maxWidth: '1200px',
      margin: '60px auto 0 auto',
      padding: '0 24px',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Background Radial Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 60%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      {/* Narrative Badge */}
      <div style={{ display: 'inline-flex', marginBottom: '24px' }}>
        <span className="glow-badge glow-badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={12} />
          <span>Bittensor Subnet + GPU DePIN Acceleration</span>
        </span>
      </div>

      {/* Surfing Lobster Animated Hero Asset */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'center',
        filter: 'drop-shadow(0 0 35px rgba(0, 240, 255, 0.35))'
      }}>
        <img 
          src="/surfclaw_tech_cyber_lobster.png" 
          alt="Surfclaw Cybernetic Blueprint" 
          style={{
            width: '320px',
            height: '320px',
            objectFit: 'contain',
            borderRadius: '16px',
            border: '1px dashed rgba(0, 240, 255, 0.4)',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
            background: '#000'
          }}
        />
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        fontWeight: 900,
        lineHeight: 1.1,
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #ffffff 40%, #a855f7 70%, #00f0ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        maxWidth: '900px',
        margin: '0 auto 24px auto'
      }}>
        DePIN Miner Bottlenecks, <br />
        <span style={{ color: 'var(--accent-cyan)' }}>Cracked at the Kernel.</span>
      </h1>

      {/* Subtitle / Description */}
      <p style={{
        color: 'var(--color-text-secondary)',
        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
        lineHeight: 1.6,
        maxWidth: '800px',
        margin: '0 auto 40px auto'
      }}>
        <strong>Surfclaw</strong> is a high-performance, Rust-native acceleration middleware for GPU DePIN mining nodes. By routing concurrent requests through a non-blocking asynchronous scheduler and isolating execution inside lightweight Firecracker MicroVMs, it eliminates Python GIL limits and slash timeouts, accelerating reward emission.
      </p>

      {/* Call to Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '60px'
      }}>
        <a href="#telemetry" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '14px 32px' }}>
          <span>Explore Telemetry</span>
          <ArrowRight size={18} />
        </a>
        <a href="#sandbox" className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '14px 32px' }}>
          <span>Run Acceleration Demo</span>
        </a>
      </div>

      {/* Core Pillars Feature Grid */}
      <div className="grid-container grid-3col" style={{ marginTop: '40px' }}>
        {/* Pillar 1: Async Scheduler */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(0, 240, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent-cyan)'
          }}>
            <Zap size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>3.5x Async Scheduler</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Bypasses Python's single-threaded GIL restriction via a Rust-native async scheduling loop. Re-routes multiplexed validation requests dynamically to maximize concurrency.
          </p>
        </div>

        {/* Pillar 2: SapParser Auto-Healer */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent-green)'
          }}>
            <Bot size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>SapParser JSON Auto-Healer</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Microsecond-level syntax auto-repair. Auto-heals missing braces, stray commas, and formatting errors in LLM outputs before they reach the validator to prevent zero-score penalties.
          </p>
        </div>

        {/* Pillar 3: MicroVM Isolation */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent-purple)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>AWS Firecracker Sandbox</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Isolates untrusted execution threads inside lightweight micro-virtual machines. Prevents arbitrary remote code execution (RCE) attempts and secures local validator hotkeys.
          </p>
        </div>
      </div>
    </section>
  );
}
