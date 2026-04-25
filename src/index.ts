import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "./types.js";

const wss = new WebSocketServer({ port: 5050 });

wss.on("connection", (socket: WebSocket) => {
  console.log("user connected");

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
      } 
    } catch {
      const responseMessage: ServerMessage = {
        type: "echo_error",
        payload: {
          message: "invalid message format",
        },
      };
    }
  });
});
