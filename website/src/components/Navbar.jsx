import React from 'react';
import { Mail } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '20px',
      margin: '20px auto 0 auto',
      width: '95%',
      maxWidth: '1200px',
      zIndex: 100,
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.05)'
    }}>
      {/* Logo: Clean & Large CSS Vector Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontWeight: 900,
            fontSize: '1.75rem',
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #ffffff 40%, #00f0ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
            fontFamily: 'var(--font-heading)'
          }}>
            Surfclaw
          </span>
        </a>
        <div className="glow-badge" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
          DEPIN CORE
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="nav-links">
        <a href="#sandbox" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Demo Sandbox</a>
        <a href="#telemetry" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Telemetry</a>
        <a href="#roadmap" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Roadmap</a>
        <a href="#architecture" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Specs & Architecture</a>
      </div>

      {/* Right Side: Agent Status & Docs Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.05)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <div className="pulse-indicator" />
          <span style={{ color: 'var(--accent-green)' }}>ONLINE</span>
        </div>

        {/* GitHub / Docs Link */}
        <a
          href="https://github.com/surfclaw/surfclaw"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <Mail size={16} />
          <span>View GitHub</span>
        </a>
      </div>
    </nav>
  );
}
