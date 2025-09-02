import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const wss = new WebSocketServer({ port: 8080 });
const client = new Map();
const socketToUserId = new Map();
let userIdCounter = 1;

const broadcastToAll = (message: string) => {
  client.forEach((socket) => {
    socket.send(`server: ${message}`);
  });
};

wss.on("connection", (socket) => {
  const userId = `user ${userIdCounter++}`;

  client.set(userId, socket);
  socketToUserId.set(socket, userId);

  console.log(`${userId} connected, total client: ${client.size}`);

  socket.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());

      client.forEach((clientSocket, clientUserId) => {
        if (clientSocket !== socket) {
          clientSocket.send(
            JSON.stringify({
              type: "chat",
              userId: userId,
              message: message.content,
              timestamp: new Date().toISOString(),
            })
          );
        }
      });
    } catch (error) {
      client.forEach((clientSocket, clientUserId) => {
        if (clientSocket !== socket) {
          clientSocket.send(`${userId}: ${data.toString()}`);
        }
      });
    }
  });

  socket.send(`welcome ${userId}.`);

  socket.on("close", () => {
    const disconnectUserId = socketToUserId.get(socket);

    client.delete(disconnectUserId);
    socketToUserId.delete(socket);
    console.log(`${disconnectUserId} disconnected!`);

    broadcastToAll(`${disconnectUserId} left the chat`);
  });
});
