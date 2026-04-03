import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Client {
  id: string;
  socket: WebSocket;
}

const clients: Map<string, Client> = new Map();

const generateId = () => {
  return Math.random().toString(36).substring(2, 7);
};

const broadcast = (message: string, excludeId?: string) => {
  for (const [id, client] of clients) {
    if (id == excludeId) continue;
    if (client.socket.readyState == WebSocket.OPEN) {
      client.socket.send(message);
    }
  }
};

wss.on("connection", (socket: WebSocket) => {
  const id = generateId();
  const client: Client = { id, socket };
  clients.set(id, client);
  console.log(`${id} connected!`);

  socket.send(
    JSON.stringify({
      type: "welcome",
      id: id,
      message: `hello, your id: ${id}`,
    }),
  );

  broadcast(
    JSON.stringify({
      type: "user_joined",
      id: id,
      message: `${id} has joined the chat`,
    }),
    id,
  );

  socket.on("message", (data) => {
    const parsedData = data.toString();
    console.log(`${id}: ${parsedData}`);

    broadcast(
      JSON.stringify({
        type: "message",
        id: id,
        message: parsedData,
      }),
    );
  });

  socket.on("close", () => {
    clients.delete(id);
    console.log(`${id} disconnected!`);

    broadcast(
      JSON.stringify({
        type: "user_left",
        id: id,
        message: `${id} has left the chat!`,
      }),
    );
  });
});

console.log(`server running on port 8080`);
