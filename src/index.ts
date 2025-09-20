import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import type { Room, User } from "./interface/interface";

const wss = new WebSocketServer({ port: 8080 });
const users = new Map<string, User>();
const rooms = new Map<string, Room>();
const socketToUserId = new Map<WebSocket, string>();
const userTyping = new Map<string, NodeJS.Timeout>();

const defaultRoom: Room = {
  id: "default",
  name: "general chat",
  users: new Set(),
  messageHistory: [],
  createdAt: new Date(),
};
