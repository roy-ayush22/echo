import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const wss = new WebSocketServer({ port: 8080 });
const client = new Map();
const socketToUserId = new Map();

wss.on("connection", (socket) => {
  const id = uuidv4();
  const userId = Buffer.from(id).toString("base64").slice(0, 12);

  client.set(userId, socket);
  socketToUserId.set(socket, userId);

  console.log(`${userId} connected, total client: ${client.size}`);

  socket.on("message", (data) => {
    console.log(`message from ${userId}: ${data.toString()}`);
  });

  socket.send(`welcome ${userId}.`);

  socket.on("close", () => {
    const disconnectUserId = socketToUserId.get(socket);

    client.delete(disconnectUserId);
    socketToUserId.delete(socket);
    console.log(`${disconnectUserId} disconnected!`);

    const broadcastToAll = (message: string) => {
      client.forEach((socket) => {
        socket.send(`server: ${message}`);
      });
    };

    broadcastToAll(`${disconnectUserId} left the chat`);
  });
});
