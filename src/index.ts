import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "./types.js";
// import connectDb from "./db/db.js";

// connectDb();
const wss = new WebSocketServer({ port: 5050 });

const rooms = new Map<string, Set<WebSocket>>();

interface Client {
  socket: WebSocket;
  username: string;
  currentRoom: string | null;
}

const clients = new Map<WebSocket, Client>();

const randomUsername = () => {
  return `user_${Math.random().toString(36).substring(2, 8)}`;
};

const broadcastToAll = (response: ServerMessage, excludeSocket?: WebSocket) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeSocket) {
      client.send(JSON.stringify(response));
    }
  });
};

const broadcastToRoom = (
  roomId: string,
  response: ServerMessage,
  excludeSocket?: WebSocket,
) => {
  const room = rooms.get(roomId);
  if (!room) return;
  room.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeSocket) {
      client.send(JSON.stringify(response));
    }
  });
};

wss.on("connection", (socket) => {
  const username = randomUsername();
  clients.set(socket, { socket, username, currentRoom: null });
  console.log("user connected");

  socket.on("message", (data) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "echo": {
          const response: ServerMessage = {
            type: "echo_respond",
            payload: {
              message: message.payload.message,
            },
          };
          broadcastToAll(response);
          break;
        }

        case "ping": {
          const response: ServerMessage = {
            type: "pong_response",
            payload: {
              message: "pong",
            },
          };
          broadcastToAll(response);
          break;
        }
        case "message": {
          const response: ServerMessage = {
            type: "new_message",
            payload: {
              message: message.payload.message,
            },
          };

          broadcastToAll(response, socket);
          break;
        }
        case "join_room": {
          const { roomId } = message.payload;
          const client = clients.get(socket);
          if (!client) break;

          if (client.currentRoom !== null) {
            socket.send(
              JSON.stringify({
                type: "error",
                payload: {
                  message: "leave your current room first",
                },
              }),
            );
            break;
          }
          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set([socket]));
          } else {
            rooms.get(roomId)!.add(socket);
          }
          const response: ServerMessage = {
            type: "new_message",
            payload: {
              message: `${client.username} has joined the room:${roomId}`,
            },
          };
          client.currentRoom = roomId;
          broadcastToRoom(roomId, response, socket);
          break;
        }
      }
    } catch {
      const responseMessage: ServerMessage = {
        type: "echo_error",
        payload: {
          message: "invalid message format",
        },
      };
      socket.send(JSON.stringify(responseMessage));
    }
  });

  socket.on("close", () => {
    clients.delete(socket);
    console.log("user left");
  });
});
