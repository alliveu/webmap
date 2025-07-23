import React from 'react';

const tasks = [
  '🔑 열쇠 찾기',
  '🧩 퍼즐 조립',
  '📦 상자 열기',
  '💡 단서 찾기',
  '🚪 탈출 시도'
];

export default function Checklist() {
  return (
    <ul style={{
      listStyle: 'none',
      padding: 10,
      marginBottom: 8,
      background: 'rgba(0, 0, 0, 0.4)',
      color: 'white',
      borderRadius: 10,
      pointerEvents: 'auto'
    }}>
      {tasks.map((t, i) => (
        <li key={i} style={{ marginBottom: 4 }}>{t}</li>
      ))}
    </ul>
  );
}
