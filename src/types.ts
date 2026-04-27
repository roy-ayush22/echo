export interface ClientMessage {
  type: "echo" | "ping";
  payload: {
    message: string;
  };
}

export interface ServerMessage {
  type: "echo_respond" | "echo_error" | "pong_response";
  payload: any;
}
  