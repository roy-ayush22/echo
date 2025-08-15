import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  console.log("user connected");

  setInterval(() => {
    socket.send("message from the server");
  }, 1000);

  socket.on("message", (data) => {
    console.log(data.toString());
  });

  socket.on("close", () => {
    console.log("user disconnected");
  });
});
