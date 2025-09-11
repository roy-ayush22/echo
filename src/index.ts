import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { User, ChatMessage, Room } from "./interface/interface";

const wss = new WebSocketServer({ port: 8080 });
const users = new Map<string, User>();
const rooms = new Map<string, Room>();
const socketToUserId = new Map<WebSocket, Room>();
const userTyping = new Map<string, NodeJS.Timeout>();

// creating a default room object
const defaultRoom: Room = {
  id: "general",
  name: "General",
  users: new Set(),
  messageHistory: [],
  createdAt: new Date(),
};
rooms.set("general", defaultRoom);

const broadcastToAll = (
  roomId: string,
  message: ChatMessage,
  excludeUserId?: string
) => {
  const room = rooms.get(roomId);
  if (!room) return;

  room.users.forEach((userId) => {
    if (userId !== excludeUserId) {
      const user = users.get(userId);
      if (user && user.socket.readyState === WebSocket.OPEN) {
        user.socket.send(JSON.stringify(message));
      }
    }
  });
};

const addMessageHistory = (roomId: string, message: ChatMessage) => {
  const room = rooms.get(roomId);
  if (!room) return;

  room.messageHistory.push(message);
  if (room?.messageHistory.length > 100) {
    room.messageHistory = room?.messageHistory.slice(-100);
  }
};

const getUserList = (roomId: string): string[] => {
  const room = rooms.get(roomId);
  if (!room) return [];

  return Array.from(room.users).map((userId) => {
    const user = users.get(userId);
    return user ? user.username : "unknown";
  });
};

const sendUserList = (roomId: string) => {
  const userList = getUserList(roomId);
  const message: ChatMessage = {
    type: "user_list",
    users: userList,
    timestamp: new Date().toISOString(),
  };
  broadcastToAll(roomId, message);
};
