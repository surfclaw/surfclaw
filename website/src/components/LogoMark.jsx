import React from 'react';

const LogoMark = () => {
  const filled = new Set([
    '1-1', '1-9',
    '2-0', '2-1', '2-2', '2-4', '2-6', '2-8', '2-9', '2-10',
    '3-0', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-10',
    '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8', '4-9',
    '5-2', '5-3', '5-4', '5-5', '5-6', '5-7', '5-8',
    '6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7', '6-8', '6-9',
    '7-0', '7-2', '7-8', '7-10'
  ]);
  
  return (
    <div style={{
      width: '42px',
      height: '42px',
      display: 'grid',
      gridTemplateColumns: 'repeat(11, 1fr)',
      gridTemplateRows: 'repeat(11, 1fr)',
      gap: '2px'
    }}>
      {Array.from({ length: 11 }).map((_, r) =>
        Array.from({ length: 11 }).map((_, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              backgroundColor: filled.has(`${r}-${c}`) ? '#00f0ff' : 'transparent',
              boxShadow: filled.has(`${r}-${c}`) ? '0 0 6px #00f0ff' : 'none',
              borderRadius: '1px'
            }}
          />
        ))
      )}
    </div>
  );
};


export default LogoMark;
