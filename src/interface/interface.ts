export interface User {
  id: string;
  username: string;
  socket: WebSocket;
  createdAt: Date;
}

export interface ChatMessage {
  type:
    | "chat"
    | "user_joined"
    | "user_left"
    | "user_typing"
    | "user_list"
    | "error"
    | "system";
  userId: string;
  username: string;
  message: string;
  users?: string[];
}

export interface Room {
  id: string;
  name: string;
  users: Set<string>;
  messageHistory: ChatMessage[];
  createdAt: Date;
}
