// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Sender, type Message } from './types';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';

// API_BASE apunta al backend; usa variable de entorno en producción
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(
    () => localStorage.getItem('conversationId')
  );

  const startNewConversation = () => {
    localStorage.removeItem('conversationId');
    setConversationId(null);
    setMessages([
      {
        id: 'init',
        text: '¡Hola! Soy Fulano, tu asistente con memoria. ¿En qué te ayudo hoy?',
        sender: Sender.BOT,
      },
    ]);
  };

  useEffect(() => {
    const loadHistory = async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/history/${id}`);
        if (response.ok) {
          const historyData = await response.json();
          if (historyData.history && historyData.history.length > 0) {
            const formattedMessages: Message[] = historyData.history.map(
              (msg: any, index: number) => ({
                id: index.toString(),
                text: msg.content,
                sender: msg.sender === 'user' ? Sender.USER : Sender.BOT,
              })
            );
            setMessages(formattedMessages);
          } else {
            startNewConversation();
          }
        } else {
          startNewConversation();
        }
      } catch (error) {
        console.error('Error al cargar el historial:', error);
        startNewConversation();
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      loadHistory(conversationId);
    } else {
      startNewConversation();
    }
  }, [conversationId]);

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: Sender.USER,
    };
    setMessages((prev) => [...prev, userMessage]);

    let botMessage: Message = {
      id: `error-${Date.now()}`,
      text: 'Oops, algo salió mal.',
      sender: Sender.BOT,
    };

    try {
      let response: Response;

      if (inputText.toLowerCase().startsWith('/imagen ')) {
        const prompt = inputText.substring(8).trim();
        response = await fetch(`${API_BASE}/api/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        if (!response.ok) throw new Error('Error del servidor de imágenes');
        const data = await response.json();
        botMessage = {
          id: `bot-${Date.now()}`,
          imageUrl: `data:image/png;base64,${data.image_base64}`,
          sender: Sender.BOT,
        };
      } else if (inputText.toLowerCase().startsWith('/faceswap ')) {
        const urls = inputText.substring(10).trim().split(' ');
        if (urls.length < 2) throw new Error('El comando /faceswap requiere dos URLs.');
        const [source_image_url, target_image_url] = urls;
        response = await fetch(`${API_BASE}/api/face-swap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source_image_url, target_image_url }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error en el servidor de face swap');
        }
        const data = await response.json();
        botMessage = {
          id: `bot-${Date.now()}`,
          imageUrl: `data:image/jpeg;base64,${data.image_base64}`,
          sender: Sender.BOT,
        };
      } else {
        // Chat normal
        response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputText, conversation_id: conversationId }),
        });
        if (!response.ok) throw new Error('Error del servidor de chat');
        const data = await response.json();

        if (data.conversation_id && !conversationId) {
          localStorage.setItem('conversationId', data.conversation_id);
          setConversationId(data.conversation_id);
        }

        botMessage = {
          id: `bot-${Date.now()}`,
          text: data.generated_text,
          sender: Sender.BOT,
        };
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      botMessage = {
        id: `error-${Date.now()}`,
        text: `Oops, algo salió mal: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        sender: Sender.BOT,
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-900 text-gray-100">
      <Header onNewChat={startNewConversation} />
      <ChatWindow messages={messages} />
      {isLoading && <TypingIndicator />}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
