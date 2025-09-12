import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { User, ChatMessage, Room } from "./interface/interface";

const wss = new WebSocketServer({ port: 8080 });
const users = new Map<string, User>();
const rooms = new Map<string, Room>();
const socketToUserId = new Map<WebSocket, string>();
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

const broadcastToRoom = (
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
  broadcastToRoom(roomId, message);
};

const handleTyping = (userId: string, roomId: string, isTyping: boolean) => {
  const user = users.get(userId);
  if (!user) return;

  if (isTyping) {
    const existingTimeout = userTyping.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    const message: ChatMessage = {
      type: "typing",
      userId,
      username: user.username,
      timestamp: new Date().toISOString(),
    };
    broadcastToRoom(roomId, message, userId);

    const timeout = setTimeout(() => {
      const stopMessage: ChatMessage = {
        type: "stop_typing",
        userId,
        username: user.username,
        timestamp: new Date().toISOString(),
      };
      broadcastToRoom(roomId, stopMessage, userId);
      userTyping.delete(userId);
    }, 3000);
    userTyping.set(userId, timeout);
  } else {
    // Clear timeout and broadcast stop typing
    const existingTimeout = userTyping.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      userTyping.delete(userId);
    }

    const message: ChatMessage = {
      type: "stop_typing",
      userId,
      username: user.username,
      timestamp: new Date().toISOString(),
    };
    broadcastToRoom(roomId, message, userId);
  }
};

wss.on("connection", (socket) => {
  console.log("new client connected..");

  let user: User | null = null;
  let currentRoom = "general";

  socket.on("message", (data) => {
    const parsedMessage = JSON.parse(data.toString());

    if (parsedMessage.type == "join" && !user) {
      const username = parsedMessage.user || `User${Date.now()}`;
      const userId = uuidv4();

      user = {
        id: userId,
        username,
        socket,
        joinedAt: new Date(),
      };

      users.set(userId, user);
      socketToUserId.set(socket, userId);

      const room = rooms.get(currentRoom);
      if (room) {
        room.users.add(userId);
      }

      console.log(`${username} (${userId}) joined the room ${currentRoom}`);
    }
  });
});
