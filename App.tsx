// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Sender, type Message } from './types';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ... (La función getInitialMessages sigue igual) ...
const getInitialMessages = (): Message[] => {
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) return parsedMessages;
      }
    } catch (error) { console.error('Fallo al leer los mensajes', error); }
    return [{ id: 'init', text: '¡Hola! Soy tu asistente Multi-IA. Elige un modelo y empecemos a conversar.', sender: Sender.BOT }];
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedAI, setSelectedAI] = useState('gemini'); // gemini, llama, o mistral

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now().toString(), text: inputText, sender: Sender.USER };
    setMessages((prev) => [...prev, userMessage]);

    try {
        let endpoint = '';
        let body: any = { message: inputText, history: messages };

        if (selectedAI === 'gemini') {
            endpoint = `${API_BASE}/api/chat/gemini`;
        } else {
            endpoint = `${API_BASE}/api/chat/huggingface`;
            body.model_id = selectedAI === 'llama' 
                ? 'meta-llama/Llama-3.1-8B-Instruct' 
                : 'mistralai/Mistral-7B-Instruct-v0.2';
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en la respuesta del servidor');
        }

        const data = await response.json();
        const botText = data[0]?.generated_text || JSON.stringify(data);
        const botMessage: Message = { id: `bot-${Date.now()}`, text: botText, sender: Sender.BOT };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
        const errorMessage: Message = { id: `error-${Date.now()}`, text: `Oops, algo salió mal: ${error instanceof Error ? error.message : 'Error desconocido'}`, sender: Sender.BOT };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleNewChat = () => {
    setMessages([{ id: 'init', text: '¡Hola! Soy tu asistente Multi-IA. Elige un modelo y empecemos a conversar.', sender: Sender.BOT }]);
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-900 text-gray-100">
      <Header onNewChat={handleNewChat} selectedAI={selectedAI} onAIChange={setSelectedAI} />
      <ChatWindow messages={messages} />
      {isLoading && <TypingIndicator />}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;