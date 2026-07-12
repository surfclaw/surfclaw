import React from 'react';
import { Flag, Rocket, Server, ShieldCheck, TrendingUp, Cpu } from 'lucide-react';

export default function Roadmap() {
  const timeline = [
    {
      phase: 'Phase 1: The Core Kernel (Current)',
      icon: <Rocket size={20} color="var(--accent-cyan)" />,
      status: 'In Progress',
      color: 'var(--accent-cyan)',
      items: [
        'Deploy high-performance Rust-native async scheduling core.',
        'Initial release of SapParser JSON self-healing utility library.',
        'Integrate AWS Firecracker micro-virtualization sandbox for miner execution.',
        'Complete integration test suite with Bitsec Subnet 60 telemetry bridge.'
      ]
    },
    {
      phase: 'Phase 2: io_uring & Lock-Free Optimization',
      icon: <Server size={20} color="var(--accent-purple)" />,
      status: 'Planned',
      color: 'var(--accent-purple)',
      items: [
        'Integrate Linux io_uring asynchronous system call interface for zero-overhead REST API communication.',
        'Implement lock-free atomic queues (crossbeam) to eliminate Mutex lock contention.',
        'Compile JSON syntax repair regexes into CPU SIMD registers for nanosecond parsing.'
      ]
    },
    {
      phase: 'Phase 3: Multi-Network DePIN Expansion',
      icon: <ShieldCheck size={20} color="var(--accent-green)" />,
      status: 'Planned',
      color: 'var(--accent-green)',
      items: [
        'Expand kernel optimization support to Morpheus smart contract execution agents.',
        'Develop Akash Network container resource-balancing middleware for VRAM limits.',
        'Launch video diffusion scheduling optimization for Livepeer AI subnets.'
      ]
    }
  ];

  return (
    <section id="roadmap" style={{
      maxWidth: '1200px',
      margin: '80px auto 0 auto',
      padding: '0 24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span className="glow-badge" style={{ marginBottom: '12px' }}>Project Roadmap</span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
          Surfclaw Development Milestones
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          A transparent schedule showing how our resources are systematically allocated to optimize the decentralized AI agent OS ecosystem.
        </p>
      </div>

      {/* Grid of roadmap phases */}
      <div className="grid-container grid-3col" style={{ marginBottom: '40px' }}>
        {timeline.map((t, idx) => (
          <div key={idx} className="glass-panel" style={{
            padding: '30px',
            border: `1px solid rgba(255,255,255,0.04)`,
            borderTop: `3px solid ${t.color}`,
            position: 'relative'
          }}>
            {/* Outline phase index */}
            <div className="text-outline" style={{
              position: 'absolute',
              bottom: '10px',
              right: '20px',
              fontSize: '5rem',
              lineHeight: 1,
              opacity: 0.1,
              pointerEvents: 'none',
              fontFamily: 'var(--font-heading)'
            }}>
              0{idx + 1}
            </div>

            {/* Status indicator */}
            <span style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: t.status === 'In Progress' ? 'var(--accent-cyan)' : 'var(--color-text-muted)',
              border: `1px solid ${t.status === 'In Progress' ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              padding: '4px 8px',
              borderRadius: '4px',
              background: t.status === 'In Progress' ? 'rgba(0,240,255,0.03)' : 'transparent'
            }}>
              {t.status}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {t.icon}
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                {t.phase}
              </h3>
            </div>

            <ul style={{ paddingLeft: '20px', color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              {t.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ marginBottom: '10px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
