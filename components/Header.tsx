// src/components/Header.tsx
import React from 'react';
import { BotIcon } from './icons/BotIcon';
import { NewChatIcon } from './icons/NewChatIcon';

interface HeaderProps {
    onNewChat: () => void;
    selectedAI: string;
    onAIChange: (newAI: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNewChat, selectedAI, onAIChange }) => {
  return (
    <header className="bg-gradient-to-r from-brand-secondary to-brand-primary shadow-lg p-4 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <BotIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Asistente Virtual Multi-IA</h1>
          <p className="text-sm text-green-300">● En línea</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <select 
          value={selectedAI} 
          onChange={(e) => onAIChange(e.target.value)}
          className="bg-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="gemini">Gemini</option>
          <option value="llama">Llama 3.1</option>
          <option value="mistral">Mistral 7B</option>
        </select>
        
        <button
          onClick={onNewChat}
          className="text-white rounded-full p-2 hover:bg-white/20"
          aria-label="Iniciar nuevo chat"
        >
          <NewChatIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;