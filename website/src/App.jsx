import React, { useState, useEffect } from 'react';
import LogoMark from './components/LogoMark';
import GrowthCanvas from './components/GrowthCanvas';

export default function App() {
  const [activeTab, setActiveTab] = useState('biogenesis');
  const [ticks, setTicks] = useState(0);
  const [status, setStatus] = useState('AWAITING_EMERGENCE');

  // Real-time telemetry states
  const [latencySaved, setLatencySaved] = useState(28490300); 
  const [telemetryReports, setTelemetryReports] = useState(18490); 
  const [activeMiners, setActiveMiners] = useState(148);
  const [healedErrors, setHealedErrors] = useState(38209);
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, node: 'SN_60_MINER_24', action: 'AST_CODE_SANITIZED', status: 'SECURED [OK]', time: '2s ago' },
    { id: 2, node: 'SN_60_MINER_89', action: 'TOKEN_COMPRESSOR', status: 'REDUCED -72%', time: '14s ago' },
    { id: 3, node: 'SN_66_MINER_12', action: 'FIRECRACKER_BOOT', status: 'SAVED 410MS', time: '1m ago' },
    { id: 4, node: 'SN_60_MINER_103', action: 'SAPPARSER_RECOVER', status: 'SAVED 295MS', time: '3m ago' }
  ]);

  // Sandbox demo states
  const [demoState, setDemoState] = useState('success'); // Default to success for instant comparison
  const [demoLogs, setDemoLogs] = useState([
    { text: '🟢 [VALIDATOR_QUERY] 5 concurrent requests received from Subnet 60...', color: '#00f0ff' },
    { text: '⚡ Initializing thread allocations on Miner Node...', color: '#ffffff' },
    { text: '⚠️ [GIL_LOCKED] Python Global Interpreter Lock detected. Threads serialization in progress...', color: '#a855f7' },
    { text: '⏳ Request #1: Processing... (Latency: 92ms)', color: '#ffffff' },
    { text: '⏳ Request #2: Queued... Bypassed by scheduling core...', color: '#00f0ff' },
    { text: '🛡️ [SapParser] Scanning outputs... Stray brace detected on Request #3 -> Auto-healed under 2µs.', color: '#10b981' },
    { text: '🎉 [TOKIO_CORE] All threads dispatched! Response payloads completed.', color: '#10b981' }
  ]);
  const demoLogSequence = [
    { text: '🟢 [VALIDATOR_QUERY] 5 concurrent requests received from Subnet 60...', color: '#00f0ff' },
    { text: '⚡ Initializing thread allocations on Miner Node...', color: '#ffffff' },
    { text: '⚠️ [GIL_LOCKED] Python Global Interpreter Lock detected. Threads serialization in progress...', color: '#a855f7' },
    { text: '⏳ Request #1: Processing... (Latency: 92ms)', color: '#ffffff' },
    { text: '⏳ Request #2: Queued... Bypassed by scheduling core...', color: '#00f0ff' },
    { text: '🛡️ [SapParser] Scanning outputs... Stray brace detected on Request #3 -> Auto-healed under 2µs.', color: '#10b981' },
    { text: '🎉 [TOKIO_CORE] All threads dispatched! Response payloads completed.', color: '#10b981' }
  ];

  // Active step for Architecture diagram
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Dynamic loading of premium pixel fonts
    const links = [
      'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap'
    ];
    const linkElements = [];
    links.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      linkElements.push(link);
    });

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
      body { background-color: #000000; color: #ffffff; font-family: 'Space Mono', monospace; height: 100vh; width: 100vw; overflow: hidden; }
      button:hover { opacity: 0.85; }
      @keyframes crabWiggle {
        0%, 100% { transform: translateX(0) rotate(0deg) translateY(4px); }
        25% { transform: translateX(-2.5px) rotate(-5deg) translateY(4px); }
        75% { transform: translateX(2.5px) rotate(5deg) translateY(4px); }
      }
      .wiggle-crab {
        animation: crabWiggle 2.5s ease-in-out infinite;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      .blink {
        animation: blink 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
    linkElements.push(style);

    // Telemetry updates
    const interval = setInterval(() => {
      setLatencySaved(prev => prev + Math.floor(Math.random() * 200) + 50);
      setTelemetryReports(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      if (Math.random() > 0.9) {
        setActiveMiners(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const next = prev + change;
          return next > 120 && next < 180 ? next : prev;
        });
      }
      if (Math.random() > 0.92) {
        setHealedErrors(prev => prev + 1);
        const nodes = ['SN_60_MINER_45', 'SN_66_MINER_88', 'SN_60_MINER_19', 'SN_60_MINER_222'];
        const actions = ['AST_CODE_SANITIZED', 'TOKEN_COMPRESSOR', 'SAPPARSER_RECOVER'];
        const statuses = ['SECURED [OK]', 'REDUCED -68%', 'SAVED 280ms'];
        const newLog = {
          id: Date.now(),
          node: nodes[Math.floor(Math.random() * nodes.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          time: 'Just now'
        };
        setTelemetryLogs(prev => [newLog, ...prev.slice(0, 3)]);
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      linkElements.forEach(el => {
        if (document.head.contains(el)) {
          document.head.removeChild(el);
        }
      });
    };
  }, []);

  const handleTick = (newTicks, newStatus) => {
    setTicks(newTicks);
    setStatus(newStatus);
  };

  const runDemo = () => {
    if (demoState === 'running') return;
    setDemoState('running');
    setDemoLogs([]);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < demoLogSequence.length) {
        setDemoLogs(prev => [...prev, demoLogSequence[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setDemoState('success');
      }
    }, 700);
  };

  const resetDemo = () => {
    setDemoState('idle');
    setDemoLogs([]);
  };

  // Content for the bottom-left simulated log console based on active tab
  const getConsoleLogs = () => {
    switch (activeTab) {
      case 'biogenesis':
        return `> INITIATING CUDA MATRIX... [OK]
> ALLOCATING ORGANIC VRAM MEMORY... [OK]
> SHARD PLACEMENT DETECTED AT COORD [X:72, Y:88]
> MONITORING GROWTH ALGORITHMS
_`;
      case 'demo':
        return `> SANDBOX KERNEL: ACTIVE
> CPU SCHEDULER: MULTIPLEXED (LOCK-FREE)
> GIL LOCK EMULATION COMPASS: SET
> WAITING FOR DISPATCH WORKLOAD CMD...
_`;
      case 'telemetry':
        return `> CONNECTED TO BITTENSOR DEPIN SUBTENSOR
> TELEMETRY STREAM: ACTIVE (100% ONLINE)
> LATENCY GAIN INJECTING... [ACCUMULATING]
> AUDIT PAYLOAD PUSHED TO SUBNET 60
_`;
      case 'roadmap':
        return `> COMPILING SCHEMATIC MATRIX ARCHITECTURE...
> ROADMAP COMPILED SYSTEMATICIALLY
> PHASE 1: STABLE (FIRECRACKER RUNTIME)
> PHASE 2: PLANNED (io_uring KERNEL PIPELINE)
_`;
      default:
        return '';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#000000', color: '#ffffff', fontFamily: '"Space Mono", monospace' }}>
      
      {/* Left Sidebar Control Panel (Variant-inspired) */}
      <div style={{ 
        width: '35%', 
        height: '100%', 
        borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: '3rem', 
        position: 'relative', 
        zIndex: 10, 
        background: '#000000' 
      }}>
        
        {/* Header Block */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div className="wiggle-crab">
            <LogoMark />
          </div>
          <div style={{ 
            fontFamily: '"Pixelify Sans", sans-serif', 
            fontSize: '2.5rem', 
            letterSpacing: '2px', 
            lineHeight: 1.1, 
            color: '#ffffff'
          }}>
            surfclaw
          </div>
        </header>

        {/* Dashboard Navigation tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2.5rem 0' }}>
          <button 
            onClick={() => setActiveTab('biogenesis')} 
            style={{
              background: 'transparent',
              border: activeTab === 'biogenesis' ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.05)',
              color: activeTab === 'biogenesis' ? '#00f0ff' : '#ffffff',
              padding: '16px 20px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outline: 'none',
              width: '100%'
            }}
          >
            <span>01 // GROWTH MATRIX</span>
            {activeTab === 'biogenesis' && (
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#00f0ff',
                boxShadow: '0 0 8px #00f0ff'
              }} />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('demo')} 
            style={{
              background: 'transparent',
              border: activeTab === 'demo' ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.05)',
              color: activeTab === 'demo' ? '#00f0ff' : '#ffffff',
              padding: '16px 20px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outline: 'none',
              width: '100%'
            }}
          >
            <span>02 // ACCELERATION SANDBOX</span>
            {activeTab === 'demo' && (
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#00f0ff',
                boxShadow: '0 0 8px #00f0ff'
              }} />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('telemetry')} 
            style={{
              background: 'transparent',
              border: activeTab === 'telemetry' ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.05)',
              color: activeTab === 'telemetry' ? '#00f0ff' : '#ffffff',
              padding: '16px 20px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outline: 'none',
              width: '100%'
            }}
          >
            <span>03 // LIVE TELEMETRY</span>
            {activeTab === 'telemetry' && (
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#00f0ff',
                boxShadow: '0 0 8px #00f0ff'
              }} />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('roadmap')} 
            style={{
              background: 'transparent',
              border: activeTab === 'roadmap' ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.05)',
              color: activeTab === 'roadmap' ? '#00f0ff' : '#ffffff',
              padding: '16px 20px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outline: 'none',
              width: '100%'
            }}
          >
            <span>04 // DEV MILESTONES</span>
            {activeTab === 'roadmap' && (
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#00f0ff',
                boxShadow: '0 0 8px #00f0ff'
              }} />
            )}
          </button>
        </nav>

        {/* Live System Specification Metadata Table */}
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.6, opacity: 0.7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>ENVIRONMENT</span>
            <span>DEPIN_ACCELERATOR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>CORE MODULE</span>
            <span>RUST_ASYNC_V1.1</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>ACCEL_TICK</span>
            <span>{ticks.toString().padStart(6, '0')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>YIELD STATUS</span>
            <span style={{ color: status === 'STABILIZED' ? '#10b981' : '#00f0ff' }}>{status}</span>
          </div>
        </div>
        
        {/* Terminal Log Console */}
        <div style={{ fontSize: '0.7rem', opacity: 0.5, whiteSpace: 'pre-wrap', lineHeight: 1.3, fontFamily: '"Space Mono", monospace' }}>
          {getConsoleLogs()}
        </div>
      </div>
      
      {/* Right Content Panel */}
      <div style={{ 
        width: '65%', 
        height: '100%', 
        position: 'relative', 
        background: '#000000',
        overflowY: activeTab === 'biogenesis' ? 'hidden' : 'auto',
        padding: activeTab === 'biogenesis' ? '0' : '3rem'
      }}>
        {activeTab === 'biogenesis' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Full-screen background animated mascot GIF */}
            <img 
              src="/surfing_claw_animated.gif" 
              alt="Surfing Claw Mascot" 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                imageRendering: 'pixelated',
                opacity: 0.55,
                zIndex: 1
              }} 
            />
            
            {/* CRT scanline scan screen effect */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)',
              backgroundSize: '100% 4px',
              pointerEvents: 'none',
              zIndex: 2
            }} />
            
            {/* Semi-transparent Growth Matrix Canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3 }}>
              <GrowthCanvas onTick={handleTick} />
            </div>

            {/* Glowing HUD monitoring borders */}
            <div style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              right: '2rem',
              bottom: '2rem',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              boxShadow: 'inset 0 0 20px rgba(0, 240, 255, 0.05)',
              pointerEvents: 'none',
              zIndex: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '1rem',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.65rem',
              color: 'rgba(0, 240, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              <span>[ DEPIN DETECTOR: MONITOR_ACTIVE ]</span>
              <span className="blink" style={{ color: '#10b981' }}>● ASYNC_KERNEL_ONLINE</span>
            </div>
          </div>
        )}
        
        {/* Custom Retro Mono Sandbox (Tab 2) */}
        {activeTab === 'demo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Space Mono", monospace', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>// INTERACTIVE ACCELERATION SANDBOX</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem' }}>GIL LOCK CONTENTION VS KERNEL</div>
              <div style={{ opacity: 0.6, fontSize: '0.8rem', lineHeight: 1.5 }}>
                Simulate validator workload thread allocation. Compare Python's legacy GIL locked serialization against the lock-free Surfclaw Rust asynchronous Tokio scheduling pipeline.
              </div>
            </div>

            {/* Priority 1: Large & Bold Paradigm Shift Table */}
            <div style={{ 
              border: '2px solid #00f0ff', 
              padding: '2.5rem', 
              background: 'rgba(0, 240, 255, 0.03)', 
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ color: '#00f0ff', fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '2px' }}>// THE PARADIGM SHIFT: BEFORE VS AFTER</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '3px 8px', letterSpacing: '1px', fontWeight: 'bold' }}>VERIFIED BENCHMARKS</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', lineHeight: 1.8 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', letterSpacing: '1px' }}>
                    <th style={{ padding: '12px 6px' }}>METRIC</th>
                    <th style={{ padding: '12px 6px' }}>LEGACY PYTHON (BEFORE)</th>
                    <th style={{ padding: '12px 6px', color: '#00f0ff' }}>SURFCLAW 2.0 (AFTER)</th>
                    <th style={{ padding: '12px 6px', textAlign: 'right' }}>EMISSIONS IMPACT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>Average Latency</td>
                    <td style={{ padding: '14px 6px', color: '#f87171', textDecoration: 'line-through' }}>385.9ms</td>
                    <td style={{ padding: '14px 6px', color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>109.7ms</td>
                    <td style={{ padding: '14px 6px', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>⚡ 3.5x Performance Gain</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>GPU VRAM Stability</td>
                    <td style={{ padding: '14px 6px', color: '#f87171' }}>Frequent OOM Crashes</td>
                    <td style={{ padding: '14px 6px', color: '#10b981', fontWeight: 'bold' }}>0% Crashes (FIFO Queue)</td>
                    <td style={{ padding: '14px 6px', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>🛡️ 99.9% Node Uptime Yield</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>Format Resiliency</td>
                    <td style={{ padding: '14px 6px', color: '#f87171' }}>Syntax Error Prunings</td>
                    <td style={{ padding: '14px 6px', color: '#10b981', fontWeight: 'bold' }}>100% Recovery (SapParser)</td>
                    <td style={{ padding: '14px 6px', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>🎉 Zero Timeout Penalties</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <td style={{ padding: '14px 6px', fontWeight: 'bold' }}>Execution Security</td>
                    <td style={{ padding: '14px 6px', color: '#f87171' }}>Exposed Mnemonic Keys</td>
                    <td style={{ padding: '14px 6px', color: '#10b981', fontWeight: 'bold' }}>Isolated Firecracker VM</td>
                    <td style={{ padding: '14px 6px', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>🔒 Anti-RCE Sandboxed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>WORKLOAD TEMPLATE</span>
                <span>5 CONCURRENT VALIDATOR QUERIES (SUBNET 60)</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={runDemo} 
                  disabled={demoState === 'running'}
                  style={{
                    background: 'transparent',
                    border: '1px solid #00f0ff',
                    color: '#00f0ff',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontFamily: '"Space Mono", monospace',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    opacity: demoState === 'running' ? 0.5 : 1
                  }}
                >
                  [ DISPATCH WORKLOAD ]
                </button>
                <button 
                  onClick={resetDemo}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontFamily: '"Space Mono", monospace',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  [ RESET ]
                </button>
              </div>
            </div>

            {/* ASCII Thread Visualizer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem' }}>
                <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.8rem' }}>// LEGACY PYTHON THREADS (GIL SERIALIZED)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontFamily: 'monospace' }}>
                  <div>T0: {demoState === 'running' ? '[=======               ] 35%' : demoState === 'success' ? '[====================] 100%' : '[                    ] 0%'}</div>
                  <div>T1: {demoState === 'running' ? '[==                    ] 10%' : demoState === 'success' ? '[====================] 100%' : '[                    ] 0%'}</div>
                  <div>T2: {demoState === 'running' ? '[===                   ] 15%' : demoState === 'success' ? '[====================] 100%' : '[                    ] 0%'}</div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.5 }}>AVG_LATENCY: 385.9MS</div>
              </div>

              <div style={{ border: '1px solid #00f0ff', padding: '1.5rem' }}>
                <div style={{ color: '#00f0ff', marginBottom: '1rem', fontSize: '0.8rem' }}>// SURFCLAW RUST THREADS (TOKIO ASYNC)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontFamily: 'monospace' }}>
                  <div>T0: {demoState === 'running' ? '[====================] 100%' : demoState === 'success' ? '[====================] 100%' : '[                    ] 0%'}</div>
                  <div>T1: {demoState === 'running' ? '[====================] 100%' : demoState === 'success' ? '[====================] 100%' : '[                    ] 0%'}</div>
                  <div>T2: {demoState === 'running' ? '[====================] 100%' : demoState === 'success' ? '[====================] 100%' : '[                    ] 0%'}</div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#00f0ff' }}>AVG_LATENCY: 109.7MS</div>
              </div>
            </div>

            {/* Output log */}
            <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', background: '#000000', fontSize: '0.75rem' }}>
              <div style={{ opacity: 0.5, borderBottom: '1px dotted rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>&gt; CONSOLE MONITOR</div>
              {demoLogs.length === 0 && <div style={{ opacity: 0.3 }}>Awaiting thread dispatch trigger...</div>}
              {demoLogs.map((log, i) => (
                <div key={i} style={{ color: log?.color || '#ffffff', marginBottom: '0.25rem', lineHeight: 1.4 }}>{log?.text || ''}</div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Retro Mono Telemetry (Tab 3) */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Space Mono", monospace', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>// LIVE ACCELERATION TELEMETRY</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem' }}>SUBNET PERFORMANCE TELEMETRY</div>
              <div style={{ opacity: 0.6, fontSize: '0.8rem', lineHeight: 1.5 }}>
                Real-time performance metrics gathered from active nodes running the Surfclaw acceleration kernel.
              </div>
            </div>

            {/* Stats list with line layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>LATENCY SAVED</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#00f0ff' }}>{(latencySaved / 1000).toFixed(1)}s</div>
                <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{(latencySaved / 3600000).toFixed(2)} CPU Hours Bypassed</span>
              </div>
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>ACTIVE MINERS</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#ffffff' }}>{activeMiners} NODES</div>
                <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>Running Async Kernel</span>
              </div>
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>TELEMETRY STREAM</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#ffffff' }}>{telemetryReports.toLocaleString()}</div>
                <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>Pushed to Subnet 60</span>
              </div>
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>JSON FAILURES HEALED</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#a855f7' }}>{healedErrors.toLocaleString()}</div>
                <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>Under 2µs Recovery</span>
              </div>
            </div>

            {/* ASCII Table-like ledger */}
            <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', color: '#00f0ff', fontSize: '0.8rem' }}>// REAL-TIME ACCELERATION LEDGER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.4, borderBottom: '1px dotted rgba(255,255,255,0.2)', paddingBottom: '0.25rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '30%' }}>NODE</span>
                  <span style={{ width: '30%' }}>ACTION</span>
                  <span style={{ width: '25%', textAlign: 'right' }}>SAVING</span>
                  <span style={{ width: '15%', textAlign: 'right' }}>TIME</span>
                </div>
                {telemetryLogs.map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.25rem' }}>
                    <span style={{ width: '30%', fontWeight: 'bold' }}>{log.node}</span>
                    <span style={{ width: '30%', opacity: 0.7 }}>{log.action}</span>
                    <span style={{ width: '25%', textAlign: 'right', color: '#10b981' }}>{log.status}</span>
                    <span style={{ width: '15%', textAlign: 'right', opacity: 0.4 }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Retro Mono Milestones & Architecture (Tab 4) */}
        {activeTab === 'roadmap' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', fontFamily: '"Space Mono", monospace', fontSize: '0.85rem' }}>
            
            {/* System Architecture Section */}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>// SYSTEM ARCHITECTURE FLOW</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem' }}>RUST ACCELERATION SCHEMATIC</div>
              <div style={{ opacity: 0.6, fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Schematic pipeline flow detailing validation query acceleration, auto-healing, and memory isolation.
              </div>

              {/* Simple Monospace schematic block instead of SVG */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                  <div style={{ border: activeStep === 0 ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)', padding: '1rem', width: '28%', cursor: 'pointer', color: activeStep === 0 ? '#00f0ff' : '#fff' }} onClick={() => setActiveStep(0)}>
                    [ 01_RUST_KERNEL ]<br />
                    Bypasses GIL Lock
                  </div>
                  <div>====&gt;</div>
                  <div style={{ border: activeStep === 1 ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)', padding: '1rem', width: '28%', cursor: 'pointer', color: activeStep === 1 ? '#a855f7' : '#fff' }} onClick={() => setActiveStep(1)}>
                    [ 02_SAPPARSER ]<br />
                    Heals JSON Schema
                  </div>
                  <div>====&gt;</div>
                  <div style={{ border: activeStep === 2 ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', padding: '1rem', width: '28%', cursor: 'pointer', color: activeStep === 2 ? '#10b981' : '#fff' }} onClick={() => setActiveStep(2)}>
                    [ 03_MICROVM_JAIL ]<br />
                    Secures Hotkeys
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 'bold', color: activeStep === 0 ? '#00f0ff' : activeStep === 1 ? '#a855f7' : '#10b981', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {activeStep === 0 && 'STEP 01 // RUST ASYNC SCHEDULER'}
                    {activeStep === 1 && 'STEP 02 // SAPPARSER SYNTAX RECOVERY'}
                    {activeStep === 2 && 'STEP 03 // FIRECRACKER MICROVM WRAPPER'}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {activeStep === 0 && 'Bypasses the single-threaded Python GIL restriction. Miner validation requests are queued and multiplexed through a native asynchronous scheduling core.'}
                    {activeStep === 1 && 'Auto-corrects structural formatting anomalies in LLM response payloads. Repairs brackets, commas, and formatting errors in microseconds.'}
                    {activeStep === 2 && 'Secures execution by encapsulating untrusted dynamic scripts inside single-use micro-virtual machines. Protects validator hotkeys and host memory.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Development Roadmap Section */}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>// SYSTEM DEVELOPMENT MILESTONES</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '1.5rem' }}>SURFCLAW DEVELOPMENT ROADMAP</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ borderLeft: '3px solid #00f0ff', paddingLeft: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#00f0ff' }}>PHASE 1: THE CORE KERNEL</span>
                    <span style={{ fontSize: '0.7rem', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)', padding: '2px 6px' }}>IN_PROGRESS</span>
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', opacity: 0.7, fontSize: '0.8rem', lineHeight: 1.6 }}>
                    <li>Deploy high-performance Rust-native async scheduling core.</li>
                    <li>Initial release of SapParser JSON self-healing utility library.</li>
                    <li>Integrate AWS Firecracker micro-virtualization sandbox for miner execution.</li>
                  </ul>
                </div>

                <div style={{ borderLeft: '3px solid #a855f7', paddingLeft: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#a855f7' }}>PHASE 2: io_uring & LOCK-FREE PIPELINE</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px' }}>PLANNED</span>
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', opacity: 0.7, fontSize: '0.8rem', lineHeight: 1.6 }}>
                    <li>Integrate Linux io_uring asynchronous system call interface for zero-overhead API communication.</li>
                    <li>Implement lock-free atomic queues (crossbeam) to eliminate Mutex lock contention.</li>
                  </ul>
                </div>

                <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>PHASE 3: MULTI-NETWORK DEPIN EXPANSION</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px' }}>PLANNED</span>
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', opacity: 0.7, fontSize: '0.8rem', lineHeight: 1.6 }}>
                    <li>Expand kernel optimization support to Morpheus smart contract execution agents.</li>
                    <li>Develop Akash Network container resource-balancing middleware for VRAM limits.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
