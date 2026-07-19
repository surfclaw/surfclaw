import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const LogoMark = () => {
  const filled = new Set([
    '0-5','1-3','1-4','1-6','1-7','2-2','2-4','2-5','2-6','2-8',
    '3-1','3-5','3-9','4-1','4-2','4-4','4-6','4-8','4-9','5-0',
    '5-2','5-3','5-5','5-7','5-8','5-10','6-1','6-2','6-4','6-6',
    '6-8','6-9','7-1','7-5','7-9','8-2','8-4','8-5','8-6','8-8',
    '9-3','9-4','9-6','9-7','10-5'
  ]);
  
  return (
    <div style={{
      width: '48px',
      height: '48px',
      display: 'grid',
      gridTemplateColumns: 'repeat(11, 1fr)',
      gridTemplateRows: 'repeat(11, 1fr)',
      gap: 0
    }}>
      {Array.from({ length: 11 }).map((_, r) =>
        Array.from({ length: 11 }).map((_, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              backgroundColor: filled.has(`${r}-${c}`) ? '#ffffff' : 'transparent'
            }}
          />
        ))
      )}
    </div>
  );
};

const GenesisPage = () => {
  const canvasRef = useRef(null);
  const tickRef = useRef(null);
  const fpsRef = useRef(null);
  const statusRef = useRef(null);
  
  useEffect(() => {
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
      body { background-color: #000000; color: #ffffff; font-family: 'Space Mono', monospace; height: 100vh; width: 100vw; overflow: hidden; display: flex; -webkit-font-smoothing: none; }
    `;
    document.head.appendChild(style);
    linkElements.push(style);
    
    return () => {
      linkElements.forEach(el => document.head.removeChild(el));
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const tickCounter = tickRef.current;
    const fpsCounter = fpsRef.current;
    const statusSpan = statusRef.current;
    
    let width, height;
    let cols, rows;
    const fontSize = 14;
    const soilChars = ['.', ',', ':', ';', '~', '-', '+', '=', '*', ' ', ' ', ' '];
    let time = 0;
    let ticks = 0;
    let lastTime = performance.now();
    let animId;
    
    const sproutConfig = {
      delay: 150,
      stemFrames: 120,
      leafFrames: 100,
      bloomFrames: 150,
      xPos: 0,
      yPos: 0,
      maxHeight: 12
    };
    
    function resize() {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.font = `${fontSize}px "Space Mono", monospace`;
      ctx.textBaseline = 'top';
      cols = Math.floor(width / (fontSize * 0.6));
      rows = Math.floor(height / fontSize);
      sproutConfig.xPos = Math.floor(cols * 0.5);
      sproutConfig.yPos = Math.floor(rows * 0.85);
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    function hash(x, y) {
      return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    }
    
    function renderSoil() {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const distToSprout = Math.abs(x - sproutConfig.xPos) + Math.abs(y - sproutConfig.yPos);
          if (distToSprout < 5 && y >= sproutConfig.yPos - sproutConfig.maxHeight) continue;
          
          const flowSpeed = time * 0.05;
          const wave = Math.sin(y * 0.1 + time * 0.02) * 2;
          const adjustedY = y - flowSpeed;
          const val = (Math.sin(x * 0.2 + wave) + Math.cos(adjustedY * 0.15)) * 0.5;
          const noise = hash(x, Math.floor(adjustedY));
          
          if (val + (noise - 0.5) * 0.2 > 0.2) {
            const charIndex = Math.floor(Math.abs(val * soilChars.length)) % soilChars.length;
            const px = x * (fontSize * 0.6);
            const py = y * fontSize;
            ctx.fillText(soilChars[charIndex], px, py);
          }
        }
      }
    }
    
    function renderSprout(tick) {
      if (tick < sproutConfig.delay) return;
      
      const pX = sproutConfig.xPos * (fontSize * 0.6);
      const pY = sproutConfig.yPos * fontSize;
      const activeTime = tick - sproutConfig.delay;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px "Space Mono", monospace`;
      
      const stemProgress = Math.min(1, activeTime / sproutConfig.stemFrames);
      const leafProgress = Math.min(1, Math.max(0, (activeTime - sproutConfig.stemFrames) / sproutConfig.leafFrames));
      const bloomProgress = Math.min(1, Math.max(0, (activeTime - sproutConfig.stemFrames - sproutConfig.leafFrames) / sproutConfig.bloomFrames));
      
      const sway = Math.sin(time * 0.03) * 3 * bloomProgress;
      let currentHeight = Math.floor(stemProgress * sproutConfig.maxHeight);
      
      for (let i = 0; i <= currentHeight; i++) {
        const yOff = pY - (i * fontSize);
        const xSway = sway * (i / sproutConfig.maxHeight);
        let char = '|';
        
        if (leafProgress > 0 && i === currentHeight - 2 && i > 2) {
          if (leafProgress < 0.5) {
            ctx.fillText('`', pX - (fontSize * 0.6) + xSway, yOff);
            ctx.fillText('´', pX + (fontSize * 0.6) + xSway, yOff);
          } else {
            ctx.fillText('\\', pX - (fontSize * 0.6) + xSway, yOff);
            ctx.fillText('/', pX + (fontSize * 0.6) + xSway, yOff);
            char = 'T';
          }
        }
        
        if (leafProgress > 0.8 && i === currentHeight - 4 && i > 4) {
          ctx.fillText('\\', pX - (fontSize * 0.6) + xSway, yOff);
          ctx.fillText('/', pX + (fontSize * 0.6) + xSway, yOff);
        }
        
        ctx.fillText(char, pX + xSway, yOff);
      }
      
      if (bloomProgress > 0 && currentHeight > 0) {
        const topY = pY - ((currentHeight + 1) * fontSize);
        const xSway = sway;
        
        if (bloomProgress < 0.3) {
          ctx.fillText('.', pX + xSway, topY);
        } else if (bloomProgress < 0.6) {
          ctx.fillText('o', pX + xSway, topY);
        } else if (bloomProgress < 0.9) {
          ctx.fillText('O', pX + xSway, topY);
        } else {
          ctx.fillText('✺', pX + xSway - 1, topY);
        }
      }
      
      ctx.font = `${fontSize}px "Space Mono", monospace`;
    }
    
    function loop(now) {
      animId = requestAnimationFrame(loop);
      
      const delta = now - lastTime;
      if (delta > 1000) lastTime = now;
      
      if (ticks % 10 === 0) {
        fpsCounter.innerText = Math.round(1000 / delta);
      }
      lastTime = now;
      
      time++;
      ticks++;
      tickCounter.innerText = ticks.toString().padStart(6, '0');
      
      if (ticks === sproutConfig.delay) {
        statusSpan.innerText = 'GERMINATING';
      } else if (ticks === sproutConfig.delay + sproutConfig.stemFrames + sproutConfig.leafFrames + sproutConfig.bloomFrames) {
        statusSpan.innerText = 'STABILIZED';
      }
      
      renderSoil();
      renderSprout(ticks);
    }
    
    animId = requestAnimationFrame(loop);
    
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#000000', color: '#ffffff', fontFamily: '"Space Mono", monospace' }}>
      <div style={{ width: '35%', height: '100%', borderRight: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem', position: 'relative', zIndex: 10, background: '#000000' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <LogoMark />
          <div style={{ fontFamily: '"Pixelify Sans", sans-serif', fontSize: '2.5rem', letterSpacing: '2px', lineHeight: 1, marginTop: '4px' }}>
            oasis
          </div>
        </header>
        
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.6, opacity: 0.7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>ENVIRONMENT</span>
            <span>SYNTHETIC_CULTURE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>PROTOCOL</span>
            <span>BIOGENESIS_V1.4</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>SIMULATION_TICK</span>
            <span ref={tickRef}>000000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255, 255, 255, 0.2)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>STATUS</span>
            <span ref={statusRef}>AWAITING_EMERGENCE</span>
          </div>
        </div>
        
        <div style={{ fontSize: '0.7rem', opacity: 0.5, whiteSpace: 'pre-wrap', lineHeight: 1.2 }}>
{`> INITIATING SOIL MATRIX... [OK]
> ALLOCATING ORGANIC MEMORY... [OK]
> SEED PLACEMENT DETECTED AT COORD [X:72, Y:88]
> MONITORING GROWTH ALGORITHMS
_`}
        </div>
      </div>
      
      <div style={{ width: '65%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000000' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', textAlign: 'right', fontSize: '0.7rem', opacity: 0.3, pointerEvents: 'none' }}>
          RENDER: CANVAS 2D<br />
          FPS: <span ref={fpsRef}>60</span><br />
          ENTROPY: ACTIVE
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<GenesisPage />} />
      </Routes>
    </Router>
  );
};

export default App;