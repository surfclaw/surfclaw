import React from 'react';
import { Database, ShieldAlert, Cpu, BarChart2, Flame, RefreshCw, ShoppingBag, Download, Zap, CheckCircle } from 'lucide-react';

export default function StatsTelemetry() {
  // Real-time changing states
  const [latencySaved, setLatencySaved] = React.useState(28490300); // ms
  const [telemetryReports, setTelemetryReports] = React.useState(18490); // Subnet 60 reports
  const [activeMiners, setActiveMiners] = React.useState(148);
  const [healedErrors, setHealedErrors] = React.useState(38209); // SapParser healed

  // Real-time activity logs
  const [logs, setLogs] = React.useState([
    { id: 1, node: 'Subnet 60 Miner #24', action: 'Surfclaw AST Code Sanitized', saving: 'Secured [OK]', time: '2s ago' },
    { id: 2, node: 'Subnet 60 Miner #89', action: 'Token Compressor Activated', saving: 'Tokens -72%', time: '14s ago' },
    { id: 3, node: 'Subnet 66 Miner #12', action: 'AWS Firecracker Boot (Clean)', saving: 'Saved 410ms', time: '1m ago' },
    { id: 4, node: 'Subnet 60 Miner #103', action: 'SapParser Syntax Recovered', saving: 'Saved 295ms', time: '3m ago' }
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time latency saving accumulation
      setLatencySaved(prev => prev + Math.floor(Math.random() * 200) + 50);
      
      // Simulate telemetry report increments
      setTelemetryReports(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      
      // Flucluate active nodes slightly
      if (Math.random() > 0.9) {
        setActiveMiners(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const next = prev + change;
          return next > 120 && next < 180 ? next : prev;
        });
      }

      // Occasionally heal a syntax error and add a log
      if (Math.random() > 0.92) {
        setHealedErrors(prev => prev + 1);
        
        const nodes = ['Subnet 60 Miner #45', 'Subnet 66 Miner #88', 'Subnet 60 Miner #19', 'Subnet 60 Miner #222'];
        const actions = ['Surfclaw AST Code Sanitized', 'Token Compressor Activated', 'SapParser Syntax Recovered'];
        const savings = ['Secured [OK]', 'Tokens -68%', 'Saved 280ms', 'Tokens -74%'];
        
        const newLog = {
          id: Date.now(),
          node: nodes[Math.floor(Math.random() * nodes.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          saving: savings[Math.floor(Math.random() * savings.length)],
          time: 'Just now'
        };
        setLogs(prev => [newLog, ...prev.slice(0, 3)]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const totalSavedHours = (latencySaved / 3600000).toFixed(2);

  return (
    <section id="telemetry" style={{
      maxWidth: '1200px',
      margin: '0 auto 0 auto',
      padding: '0 24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="glow-badge" style={{ marginBottom: '12px' }}>Live Telemetry (Miner OS Statistics)</span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
          Network-Wide Acceleration & Telemetry
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem' }}>
          Real-time performance metrics of nodes running Surfclaw. Nodes bypass python execution locks, auto-heal syntax failures, and report telemetry seamlessly to security subnets.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid-container grid-4col" style={{ marginBottom: '32px' }}>
        {/* Stat 1: Total Latency Saved */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent-cyan)', opacity: 0.15 }}>
            <Zap size={48} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latency Saved</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '12px 0 6px 0', fontFamily: 'var(--font-heading)', color: '#fff' }}>
            {(latencySaved / 1000).toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>seconds</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Approx. {totalSavedHours} hours of CPU bottleneck bypassed.
          </p>
        </div>

        {/* Stat 2: Active Nodes */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent-purple)', opacity: 0.15 }}>
            <Cpu size={48} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Miners</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '12px 0 6px 0', fontFamily: 'var(--font-heading)', color: '#fff' }}>
            {activeMiners} <span style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', fontWeight: 500 }}>nodes</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Nodes running Surfclaw Kernel.
          </p>
        </div>

        {/* Stat 3: Telemetry Streamed */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent-cyan)', opacity: 0.15 }}>
            <CheckCircle size={48} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subnet 60 Telemetry</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '12px 0 6px 0', fontFamily: 'var(--font-heading)', color: '#fff' }}>
            {telemetryReports.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>payloads</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Audit metrics pushed to Bitsec network.
          </p>
        </div>

        {/* Stat 4: SapParser Healed */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent-pink)', opacity: 0.15 }}>
            <Download size={48} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JSON Failures Healed</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '12px 0 6px 0', fontFamily: 'var(--font-heading)', color: '#fff' }}>
            {healedErrors.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--accent-pink)', fontWeight: 500 }}>errors</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Formatting errors auto-corrected.
          </p>
        </div>
      </div>

      {/* Ledger & Ledger description */}
      <div className="grid-container grid-2col">
        {/* Ledger table */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <ShoppingBag size={18} color="var(--accent-cyan)" />
            Real-time Acceleration Ledger
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((l) => (
              <div
                key={l.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background 0.2s'
                }}
              >
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{l.node}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Action: {l.action}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{l.saving}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{l.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#fff' }}>Subnet Efficiency Loop</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
            <strong>Surfclaw</strong> optimizes DePIN workloads at the software execution boundary. By providing robust microservice routing and auto-healing outputs, nodes achieve maximum uptime and reward emission.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', marginTop: '8px' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                <strong>Deterministic AST Audit:</strong> Local syntax tree parsing sanitizes incoming validator query scripts inside 1µs, neutralizing RCE hack vulnerabilities.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', marginTop: '8px' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                <strong>SapParser Auto-Heal:</strong> Microsecond-level schema compliance healing resolves LLM response formatting errors automatically.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', marginTop: '8px' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                <strong>Boilerplate Token Compression:</strong> On-device Caveman-style payload compressor cuts down transmission overhead by up to 75%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
