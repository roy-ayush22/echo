import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "./types.js";
import connectDb from "./db/db.js";

connectDb();
const wss = new WebSocketServer({ port: 5050 });

wss.on("connection", (socket) => {
  console.log("user connected");
  // console.log(wss.clients);

  socket.on("message", (data) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      if (message.type === "echo") {
        const response: ServerMessage = {
          type: "echo_respond",
          payload: {
            message: message.payload.message,
            time: Date.now(),
          },
        };
        socket.send(JSON.stringify(response));
      } else if (message.type === "ping") {
        const response: ServerMessage = {
          type: "pong_response",
          payload: {
            message: "pong",
            time: Date.now(),
          },
        };
        socket.send(JSON.stringify(response));
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
