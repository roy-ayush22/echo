export interface ClientMessage {
  type: "message";
  payload: {
    message: string;
  };
}

export interface ServerMessage {
  type: "new_message";
  payload: any;
}

export interface JoinRoom {
  type: "join_room";
  payload: {
    roomId: string;
  };
}

export interface RoomMessage {
  type: "message";
  payload: {
    roomId: string;
    message: string;
  };
}

export interface Testing {
  type: "echo" | "ping";
  payload: any;
}

export interface TestingResponse {
  type: "echo_respond" | "echo_error" | "pong_response";
  payload: any;
}
