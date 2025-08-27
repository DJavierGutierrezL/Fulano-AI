
import React, { useState, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const {
    isRecording,
    transcript,
    toggleRecording,
    hasSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() && !isRecording) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="bg-gray-800 p-4 border-t border-gray-700 shrink-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center space-x-3">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={isRecording ? 'Escuchando...' : 'Escribe tu mensaje aquí...'}
          disabled={isLoading}
          className="flex-grow bg-gray-700 text-gray-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50"
        />
        {hasSpeechRecognition && (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isLoading}
              className={`text-white rounded-full p-3 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700'}`}
              aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim() || isRecording}
          className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-transform duration-200 active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
          aria-label="Enviar mensaje"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
