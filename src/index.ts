import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "./types.js";
// import connectDb from "./db/db.js";

// connectDb();
const wss = new WebSocketServer({ port: 5050 });

const rooms = new Map<string, Set<WebSocket>>();

const broadcastToAll = (response: ServerMessage, excludeSocket: WebSocket) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeSocket) {
      client.send(JSON.stringify(response));
    }
  });
};

const broadcastToRoom = (
  roomId: string,
  response: ServerMessage,
  excludeSocket: WebSocket,
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
  console.log("user connected");
  // console.log(wss.clients);

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
          socket.send(JSON.stringify(response));
          break;
        }

        case "ping": {
          const response: ServerMessage = {
            type: "pong_response",
            payload: {
              message: "pong",
            },
          };
          socket.send(JSON.stringify(response));
          break;
        }
        case "message": {
          const response: ServerMessage = {
            type: "new_message",
            payload: {
              message: message.payload.message,
            },
          };
          wss.clients.forEach((clients) => {
            if (clients.readyState === WebSocket.OPEN && clients !== socket) {
              clients.send(JSON.stringify(response));
            }
          });
          break;
        }
        case "join_room": {
          const { roomId } = message.payload;
          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set([socket]));
          } else {
            rooms.get(roomId)!.add(socket);
          }
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
    console.log("user left");
  });
});
