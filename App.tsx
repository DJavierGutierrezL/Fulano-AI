// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Sender, type Message } from './types';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getInitialMessages = (): Message[] => {
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) return parsedMessages;
      }
    } catch (error) { console.error('Fallo al leer los mensajes', error); }
    return [{ id: 'init', text: '¡Hola! Soy tu asistente. Puedes chatear conmigo o usar comandos como /imagen o /faceswap.', sender: Sender.BOT }];
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now().toString(), text: inputText, sender: Sender.USER };
    setMessages((prev) => [...prev, userMessage]);

    try {
        let response: Response;
        
        if (inputText.toLowerCase().startsWith('/faceswap ')) {
            const urls = inputText.substring(10).trim().split(' ');
            if (urls.length < 2) throw new Error("El comando /faceswap requiere dos URLs separadas por un espacio.");

            const source_image_url = urls[0];
            const target_image_url = urls[1];
            
            response = await fetch(`${API_BASE}/api/face-swap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source_image_url, target_image_url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error en el servidor de face swap");
            }

            const data = await response.json();
            const imageUrl = `data:image/jpeg;base64,${data.image_base64}`;
            const botMessage: Message = { id: `bot-${Date.now()}`, imageUrl, sender: Sender.BOT };
            setMessages((prev) => [...prev, botMessage]);

        } else if (inputText.toLowerCase().startsWith('/imagen ')) {
            const prompt = inputText.substring(8).trim();
            response = await fetch(`${API_BASE}/api/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) throw new Error(`Error del servidor de imágenes: ${response.statusText}`);
            
            const data = await response.json();
            const imageUrl = `data:image/png;base64,${data.image_base64}`;
            const botMessage: Message = { id: `bot-${Date.now()}`, imageUrl, sender: Sender.BOT };
            setMessages((prev) => [...prev, botMessage]);
        } else {
            response = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputText, history: messages }),
            });

            if (!response.ok) throw new Error(`Error del servidor de chat: ${response.statusText}`);
            
            const data = await response.json();
            const botText = data[0]?.generated_text || JSON.stringify(data);
            const botMessage: Message = { id: `bot-${Date.now()}`, text: botText, sender: Sender.BOT };
            setMessages((prev) => [...prev, botMessage]);
        }
    } catch (error) {
        const errorMessage: Message = { id: `error-${Date.now()}`, text: `Oops, algo salió mal: ${error instanceof Error ? error.message : 'Error desconocido'}`, sender: Sender.BOT };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleNewChat = () => {
    setMessages([{ id: 'init', text: '¡Hola! Soy tu asistente. Puedes chatear conmigo o usar comandos como /imagen o /faceswap.', sender: Sender.BOT }]);
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