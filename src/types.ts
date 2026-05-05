export interface ClientMessage {
  type: "echo" | "ping" | "message";
  payload: {
    message: string;
  };
}

export interface ServerMessage {
  type: "echo_respond" | "echo_error" | "pong_response" | "message_response";
  payload: any;
}
  