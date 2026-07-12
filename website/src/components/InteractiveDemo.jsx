import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Terminal, Zap, Cpu } from 'lucide-react';

export default function InteractiveDemo() {
  const [pipelineState, setPipelineState] = useState('idle'); // 'idle' | 'running' | 'success'
  const [logs, setLogs] = useState([]);
  const [selectedTask, setSelectedTask] = useState('5_concurrent_requests');

  const logSequence = [
    { text: '🟢 [VALIDATOR_QUERY] 5 concurrent requests received from Subnet 60...', color: 'var(--accent-cyan)' },
    { text: '⚡ Initializing thread allocations on Miner Node...', color: '#94a3b8' },
    { text: '⚠️ [GIL_LOCKED] Python Global Interpreter Lock detected. Threads serialization in progress...', color: 'var(--accent-purple)' },
    { text: '⏳ Request #1: Processing... (Latency: 92ms)', color: '#94a3b8' },
    { text: '⏳ Request #2: Queued... Bypassed by scheduling core...', color: 'var(--accent-cyan)' },
    { text: '🛡️ [SapParser] Scanning outputs... Stray brace detected on Request #3 -> Auto-healed under 2µs.', color: 'var(--accent-green)' },
    { text: '🎉 [TOKIO_CORE] All threads dispatched! Response payloads completed.', color: 'var(--accent-green)' }
  ];

  const runDemo = () => {
    if (pipelineState === 'running') return;
    setPipelineState('running');
    setLogs([]);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < logSequence.length) {
        setLogs(prev => [...prev, logSequence[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setPipelineState('success');
      }
    }, 700);
  };

  const resetDemo = () => {
    setPipelineState('idle');
    setLogs([]);
  };

  return (
    <section id="sandbox" style={{
      maxWidth: '1200px',
      margin: '80px auto 0 auto',
      padding: '0 24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="glow-badge" style={{ marginBottom: '12px' }}>Interactive Acceleration Sandbox</span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
          GIL Lock Contention vs Surfclaw Kernel
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem' }}>
          Simulate validator request workloads. Compare the latency of legacy serialized Python runtimes against the Rust asynchronous Tokio scheduler.
        </p>
      </div>

      <div className="glass-panel" style={{
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px'
      }}>
        {/* Left Side: Controller Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Workload Control Unit
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Workload Template
            </span>
            <div style={{
              background: '#04060a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px 16px',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.9rem',
              cursor: 'not-allowed'
            }}>
              5 Concurrent Validator Queries (Subnet 60)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              onClick={runDemo}
              disabled={pipelineState === 'running'}
              className="btn btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: pipelineState === 'running' ? 0.6 : 1
              }}
            >
              <Play size={16} />
              <span>Dispatch Workload</span>
            </button>
            
            <button
              onClick={resetDemo}
              className="btn btn-secondary"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>

          {/* Console Terminal View */}
          <div style={{
            background: '#020306',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            minHeight: '220px',
            boxShadow: 'inset 0 0 20px rgba(0, 240, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <Terminal size={14} />
              <span>SURFCLAW_KERNEL_TERMINAL_LOG</span>
            </div>
            {logs.length === 0 && (
              <div style={{ color: '#4b5563' }}>Console idle. Click "Dispatch Workload" to start simulation...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} style={{ color: log.color, lineHeight: 1.4 }}>
                {log.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Virtual Threads Speed Comparer Visualizer */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Real-time Thread Allocation View
          </h3>

          {/* Legacy Python Block */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} />
                Legacy Python (GIL Locked)
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Avg Latency: 385.9ms</span>
            </div>
            
            {/* Thread Tracks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3].map(t => (
                <div key={t} style={{ height: '8px', background: '#11131c', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    background: '#ef4444',
                    width: pipelineState === 'running' ? '40%' : pipelineState === 'success' ? '100%' : '0%',
                    transition: pipelineState === 'running' ? 'width 4s ease-in-out' : 'width 0.2s',
                    boxShadow: '0 0 10px #ef4444'
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Surfclaw Rust Block */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(0, 240, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} />
                Surfclaw (Rust Async Scheduler)
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Avg Latency: 109.7ms</span>
            </div>
            
            {/* Thread Tracks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3].map(t => (
                <div key={t} style={{ height: '8px', background: '#11131c', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--accent-cyan)',
                    width: pipelineState === 'running' ? '100%' : pipelineState === 'success' ? '100%' : '0%',
                    transition: pipelineState === 'running' ? 'width 1s cubic-bezier(0.1, 0.8, 0.2, 1)' : 'width 0.2s',
                    boxShadow: '0 0 10px var(--accent-cyan)'
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.03)'
          }}>
            <ShieldCheck size={16} color="var(--accent-green)" />
            <span>AWS Firecracker virtualization wrapper executes all queries inside secure, isolated sandboxes.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
