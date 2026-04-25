export interface ClientMessage {
  type: "echo";
  payload: {
    message: string;
  };
}

export interface ServerMessage {
  type: "echo_respond" | "echo_error",
  payload: any
}