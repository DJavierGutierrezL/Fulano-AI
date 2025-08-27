
import React from 'react';
import { Sender, type Message as MessageType } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  const wrapperClasses = `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`;
  const messageClasses = `max-w-xl p-4 rounded-2xl shadow-md ${
    isUser
      ? 'bg-blue-600 text-white rounded-br-none'
      : 'bg-gray-700 text-gray-200 rounded-bl-none'
  }`;

  const iconClasses = "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center";

  return (
    <div className={wrapperClasses}>
      <div className={`${iconClasses} ${isUser ? 'bg-blue-500' : 'bg-gray-600'}`}>
        {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <BotIcon className="w-5 h-5 text-white" />}
      </div>
      <div className={messageClasses}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default Message;
