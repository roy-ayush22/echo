import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "./types.js";

const wss = new WebSocketServer({ port: 5050 });

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

setInterval(() => {
  wss.clients.forEach((ws) => {
    const socket = ws as ExtendedWebSocket;
    if (!socket.isAlive) {
      console.log("terminating dead connection");
      socket.terminate();
      return;
    }
    socket.isAlive = false;
  });
}, 5000);

wss.on("connection", (socket: ExtendedWebSocket) => {
  console.log("user connected");
  // console.log(wss.clients);
  socket.isAlive = true;

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
        socket.isAlive = true;

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
