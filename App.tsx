// src/App.tsx - CÓDIGO ACTUALIZADO

import React, { useState, useEffect } from 'react';
import { Sender, type Message } from './types';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';

// Esta variable ya la tenías, se asegura de usar la URL de tu backend en Render
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getInitialMessages = (): Message[] => {
  try {
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
        return parsedMessages;
      }
    }
  } catch (error) {
    console.error('Fallo al leer los mensajes del localStorage', error);
    localStorage.removeItem('chat_messages');
  }
  return [
    {
      id: 'init',
      text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      sender: Sender.BOT,
    },
  ];
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].id !== 'init')) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: Sender.USER,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Llamada a tu propio backend
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Tu backend original esperaba un 'model_id' y un 'message'
          // Puedes ajustar el model_id si tu backend lo requiere
          model_id: "google/gemini-pro", 
          message: inputText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extraemos la respuesta del bot. Asumimos que tu backend devuelve una estructura
      // similar a la de Hugging Face, como [{ "generated_text": "..." }]
      const botText = data[0]?.generated_text || JSON.stringify(data);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botText,
        sender: Sender.BOT,
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Oops, algo salió mal al contactar al asistente. Por favor, inténtalo de nuevo.',
        sender: Sender.BOT,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewChat = () => {
    const welcomeMessage = {
      id: 'init',
      text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      sender: Sender.BOT,
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem('chat_messages');
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-900 text-gray-100">
      <Header onNewChat={handleNewChat} />
      <ChatWindow messages={messages} />
      {isLoading && <TypingIndicator />}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;