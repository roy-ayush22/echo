import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer, WebSocket } from "ws";
import type {
  ClientMessage,
  ServerMessage,
  Testing,
  TestingResponse,
} from "./types.js";
// import connectDb from "./db/db.js";

// connectDb();
const wss = new WebSocketServer({ port: 5050 });

const rooms = new Map<string, Set<WebSocket>>();

wss.on("connection", (socket) => {
  console.log("user connected");
  // console.log(wss.clients);

  socket.on("message", (data) => {
    try {
      const message: Testing | ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "echo": {
          const response: TestingResponse = {
            type: "echo_respond",
            payload: {
              message: (message as Testing).payload.message,
              time: Date.now(),
            },
          };
          socket.send(JSON.stringify(response));
          break;
        }

        case "ping": {
          const response: TestingResponse = {
            type: "pong_response",
            payload: {
              message: "pong",
              time: Date.now(),
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
      }
    } catch {
      const responseMessage: TestingResponse = {
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
