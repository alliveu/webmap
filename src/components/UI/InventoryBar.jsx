import React from 'react';

export default function InventoryBar() {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      background: 'rgba(0, 0, 0, 0.4)',
      padding: 8,
      borderRadius: 10,
      pointerEvents: 'auto'
    }}>
      {[...Array(9)].map((_, i) => (
        <div key={i} style={{
          width: 40,
          height: 40,
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid #ccc',
          borderRadius: 6
        }} />
      ))}
    </div>
  );
}
