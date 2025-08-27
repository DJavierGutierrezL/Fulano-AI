
import React from 'react';
import { BotIcon } from './icons/BotIcon';

const TypingIndicator: React.FC = () => {
  return (
    <div className="px-6 pb-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-3 flex-row">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-600">
                <BotIcon className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-xl p-4 rounded-2xl rounded-bl-none bg-gray-700 flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
