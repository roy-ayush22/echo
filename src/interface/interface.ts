import { WebSocket } from "ws"

export interface User {
  id: string;
  username: string;
  socket: WebSocket ;
  joinedAt: Date;
}

export interface ChatMessage {
  type: 'chat' | 'user_joined' | 'user_left' | 'users' | 'typing' | 'user_list' | 'stop_typing' | 'system';
  userId?: string;
  username?: string;
  message?: string;
  timestamp: string;
  users?: string | string[];
}

export interface Room {
  id: string;
  name: string;
  users: Set<string>; // stores unique values only,
  messageHistory: ChatMessage[];
  createdAt: Date;
}
