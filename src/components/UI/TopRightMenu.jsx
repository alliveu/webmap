// src/components/UI/TopRightMenu.jsx
import React from 'react';
import ChatbotButton from './ChatbotButton';
import HintButton from './HintButton';
import SettingsButton from './SettingsButton';
import '../../styles/ui.css';

export default function TopRightMenu() {
  return (
    <div className="top-right-menu">
      <ChatbotButton />
      <HintButton />
      <SettingsButton />
    </div>
  );
}
