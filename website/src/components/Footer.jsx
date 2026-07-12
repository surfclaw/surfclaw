import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      marginTop: '120px',
      padding: '48px 24px',
      background: '#04060b'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '40px'
      }}>
        {/* Left Column: Brand */}
        <div style={{ maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{
              fontWeight: 900,
              fontSize: '1.4rem',
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #ffffff 40%, #00f0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
              fontFamily: 'var(--font-heading)'
            }}>
              Surfclaw
            </span>
          </div>
          
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Surfclaw is a high-performance, Rust-native acceleration middleware for GPU DePIN mining nodes, maximizing efficiency and performance at the kernel level.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Open-Source DePIN Middleware
            </span>
          </div>
        </div>

        {/* Right Column: Links */}
        <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
          {/* Ecosystem */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Ecosystem</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <a href="https://github.com/surfclaw/surfclaw" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                GitHub <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Disclaimer */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0 auto',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
          © {new Date().getFullYear()} Surfclaw. Released under the MIT License.
          This software is provided for open-source utility and decentralized node optimization. All operations are local and user-owned.
        </p>
      </div>
    </footer>
  );
}