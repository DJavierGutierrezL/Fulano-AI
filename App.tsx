
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { Sender, type Message } from './types';
import { startChatSession } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';

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
    console.error('Failed to parse messages from localStorage', error);
    localStorage.removeItem('chat_messages');
  }
  return [
    {
      id: 'init',
      text: '¡Hola! Soy tu asistente virtual Gemini. ¿En qué puedo ayudarte hoy?',
      sender: Sender.BOT,
    },
  ];
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const chat = await startChatSession();
        chatRef.current = chat;
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: 'error-init',
            text: 'Lo siento, no pude conectarme con el asistente. Por favor, verifica tu configuración e inténtalo de nuevo.',
            sender: Sender.BOT,
          },
        ]);
      }
    };
    initializeChat();
  }, []);

  useEffect(() => {
    // Save messages to localStorage, but not the initial placeholder message
    if (messages.length > 1 || (messages.length === 1 && messages[0].id !== 'init')) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading || !chatRef.current) return;

    const chat = chatRef.current;
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: Sender.USER,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const stream = await chat.sendMessageStream({ message: inputText });

      const botMessageId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, text: '', sender: Sender.BOT },
      ]);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: 'Oops, algo salió mal. Por favor, inténtalo de nuevo.',
          sender: Sender.BOT,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewChat = async () => {
    setIsLoading(true);
    try {
        const chat = await startChatSession();
        chatRef.current = chat;
        const welcomeMessage = {
            id: 'init',
            text: '¡Hola! Soy tu asistente virtual Gemini. ¿En qué puedo ayudarte hoy?',
            sender: Sender.BOT,
        };
        setMessages([welcomeMessage]);
        localStorage.removeItem('chat_messages');
    } catch (error) {
        console.error('Failed to start a new chat session:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: 'error-new-chat',
            text: 'No se pudo iniciar un nuevo chat. Por favor, inténtalo de nuevo.',
            sender: Sender.BOT,
          },
        ]);
    } finally {
        setIsLoading(false);
    }
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
