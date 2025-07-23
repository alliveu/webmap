import React from 'react';
import InventoryBar from './InventoryBar';
import Checklist from './Checklist';
import ProgressBar from './ProgressBar';

export default function UILayout() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* 좌측 상단 */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <Checklist />
        <ProgressBar />
      </div>

      {/* 하단 중앙 */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
        <InventoryBar />
      </div>
    </div>
  );
}
