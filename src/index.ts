import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Client {
  id: string;
  socket: WebSocket;
  roomId: string | null;
}

const rooms: Map<string, Set<string>> = new Map();
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
  const client: Client = { id, socket, roomId: null };
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
    let parsedData: {
      type: string;
      roomName?: string;
      message?: string;
    };

    try {
      parsedData = JSON.parse(data.toString());
    } catch {
      socket.send(
        JSON.stringify({
          type: "error",
          message: "invalid json",
        }),
      );
      return;
    }

    const client = clients.get(id);

    switch (parsedData.type) {
      case "join": {
        if (!parsedData.roomName) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "roomname is required",
            }),
          );
          break;
        }
        const roomName = parsedData.roomName;

        if (!rooms.has(roomName)) {
          rooms.set(roomName, new Set<string>());
        }

        rooms.get(roomName)!.add(id);
        // const client = clients.get(id);
        client.roomId = roomName;

        socket.send(
          JSON.stringify({
            type: "joined",
            roomName,
            message: `welcome to ${roomName}!`,
          }),
        );

        for (const clientId of rooms.get(roomName)!) {
          if (clientId === id) continue;
          const member = clients.get(clientId);
          if (member && member.socket.readyState === WebSocket.OPEN) {
            member.socket.send(
              JSON.stringify({
                type: "user_joined",
                from: id,
                message: `${id} has joined the ${roomName} room`,
              }),
            );
          }
        }
      }
    }
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
