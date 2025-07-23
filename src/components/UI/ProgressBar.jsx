import React from 'react';

export default function ProgressBar({ progress = 0.6 }) {
  return (
    <div style={{
      width: 200,
      height: 16,
      background: '#ccc',
      borderRadius: 8,
      overflow: 'hidden',
      pointerEvents: 'auto'
    }}>
      <div style={{
        width: `${progress * 100}%`,
        height: '100%',
        background: '#4caf50',
        transition: 'width 0.3s'
      }} />
    </div>
  );
}
