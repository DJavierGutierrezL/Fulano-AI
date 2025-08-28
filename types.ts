// src/types.ts
export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  text?: string;      // El texto ahora es opcional
  imageUrl?: string;  // Nuevo campo para la URL de la imagen
  sender: Sender;
}