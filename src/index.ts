import { WebSocketServer } from "ws";
// import { ChatMessage, ClientMessage } from "../interface/interface";

const wss = new WebSocketServer({ port: 8080 });
const client = new Set<any>();

wss.on("connection", (socket) => {
  client.add(socket);
  console.log(`client connected, total clients: ${client.size}`);

  socket.on("message", (data) => {
    console.log(data.toString());
  });

  socket.send("message from server");

  socket.on("close", () => {
    client.delete(socket);
    console.log(`client disconnected!`);
  });
});
