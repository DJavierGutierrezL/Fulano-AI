
import React, { useRef, useEffect } from 'react';
import type { Message as MessageType } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: MessageType[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-grow p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
