
import React from 'react';
import { BotIcon } from './icons/BotIcon';
import { NewChatIcon } from './icons/NewChatIcon';

interface HeaderProps {
    onNewChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewChat }) => {
  return (
    <header className="bg-gradient-to-r from-brand-secondary to-brand-primary shadow-lg p-4 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <BotIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Asistente Virtual Gemini</h1>
          <p className="text-sm text-green-300">● En línea</p>
        </div>
      </div>
      <button
        onClick={onNewChat}
        className="text-white rounded-full p-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors duration-200"
        aria-label="Iniciar nuevo chat"
      >
        <NewChatIcon className="w-6 h-6" />
      </button>
    </header>
  );
};

export default Header;
