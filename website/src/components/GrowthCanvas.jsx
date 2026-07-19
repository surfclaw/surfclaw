import React, { useEffect, useRef } from 'react';

export default function GrowthCanvas({ onTick }) {
  const canvasRef = useRef(null);
  const fpsRef = useRef(null);
  const statusRef = useRef('AWAITING_EMERGENCE');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fpsCounter = fpsRef.current;

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

    const CRAB_ART = [
      "        ■           ■        ",
      "      ■■■■■       ■■■■■      ",
      "     ■■   ■■ ▀ ▀ ■■   ■■     ",
      "     ■■ ▀ ■■■■■■■■■ ▀ ■■     ",
      "      ■■■■▀ ■■■■■■■ ▀■■■      ",
      "       ▀   ■■■■■■■■■   ▀       ",
      "          ■■■■■■■■■■■          ",
      "          ■■■■■■■■■■■          ",
      "         ■■■■■■■■■■■■■         ",
      "        ■■ ▀■■■■■■■▀ ■■        ",
      "       ■▀    ▀▀▀▀▀    ▀■       "
    ];

    function renderSoil() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
      ctx.fillRect(0, 0, width, height);

      const startX = Math.floor(cols / 2) - 14;
      const startY = Math.floor(rows / 2) - 8;
      const labelY = startY + CRAB_ART.length + 2;
      const labelText = "⚡  S U R F C L A W  ⚡";
      const labelStartX = Math.floor(cols / 2) - Math.floor(labelText.length / 2);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const distToSprout = Math.abs(x - sproutConfig.xPos) + Math.abs(y - sproutConfig.yPos);
          if (distToSprout < 5 && y >= sproutConfig.yPos - sproutConfig.maxHeight) continue;

          // Check if coordinate falls inside the crab logo
          let isCrab = false;
          let crabChar = ' ';
          if (y >= startY && y < startY + CRAB_ART.length) {
            const rowStr = CRAB_ART[y - startY];
            const colIdx = x - startX;
            if (colIdx >= 0 && colIdx < rowStr.length) {
              crabChar = rowStr.charAt(colIdx);
              if (crabChar !== ' ') {
                isCrab = true;
              }
            }
          }

          // Check if coordinate falls inside the text label
          let isLabel = false;
          let labelChar = ' ';
          if (y === labelY && x >= labelStartX && x < labelStartX + labelText.length) {
            labelChar = labelText.charAt(x - labelStartX);
            if (labelChar !== ' ') {
              isLabel = true;
            }
          }

          if (isCrab) {
            const pulse = 0.35 + Math.sin(time * 0.04) * 0.15;
            ctx.fillStyle = `rgba(0, 240, 255, ${pulse})`;
            ctx.font = `bold ${fontSize}px "Space Mono", monospace`;
            const px = x * (fontSize * 0.6);
            const py = y * fontSize;
            ctx.fillText(crabChar, px, py);
            ctx.font = `${fontSize}px "Space Mono", monospace`;
          } else if (isLabel) {
            ctx.fillStyle = '#a855f7';
            ctx.font = `bold ${fontSize}px "Space Mono", monospace`;
            const px = x * (fontSize * 0.6);
            const py = y * fontSize;
            ctx.fillText(labelChar, px, py);
            ctx.font = `${fontSize}px "Space Mono", monospace`;
          } else {
            // Background noise flow
            const flowSpeed = time * 0.05;
            const wave = Math.sin(y * 0.1 + time * 0.02) * 2;
            const adjustedY = y - flowSpeed;
            const val = (Math.sin(x * 0.2 + wave) + Math.cos(adjustedY * 0.15)) * 0.5;
            const noise = hash(x, Math.floor(adjustedY));

            if (val + (noise - 0.5) * 0.2 > 0.2) {
              const charIndex = Math.floor(Math.abs(val * soilChars.length)) % soilChars.length;
              const px = x * (fontSize * 0.6);
              const py = y * fontSize;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
              ctx.fillText(soilChars[charIndex], px, py);
            }
          }
        }
      }
    }

    function renderSprout(tick) {
      if (tick < sproutConfig.delay) return;

      const pX = sproutConfig.xPos * (fontSize * 0.6);
      const pY = sproutConfig.yPos * fontSize;
      const activeTime = tick - sproutConfig.delay;

      ctx.fillStyle = '#00f0ff'; // themed cyan sprout
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

        ctx.fillStyle = '#a855f7'; // purple bloom

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

      if (ticks % 10 === 0 && fpsCounter) {
        fpsCounter.innerText = Math.round(1000 / delta);
      }
      lastTime = now;

      time++;
      ticks++;

      if (ticks === sproutConfig.delay) {
        statusRef.current = 'GERMINATING';
      } else if (ticks === sproutConfig.delay + sproutConfig.stemFrames + sproutConfig.leafFrames + sproutConfig.bloomFrames) {
        statusRef.current = 'STABILIZED';
      }

      if (ticks % 10 === 0) {
        onTick(ticks, statusRef.current);
      }

      renderSoil();
      renderSprout(ticks);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [onTick]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', textAlign: 'right', fontSize: '0.7rem', opacity: 0.3, pointerEvents: 'none', fontFamily: '"Space Mono", monospace' }}>
        RENDER: CUDA CORE MATRIX<br />
        FPS: <span ref={fpsRef}>60</span><br />
        YIELD EXPANSION: ACTIVE
      </div>
    </>
  );
}
