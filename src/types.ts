// all incoming messages from the client in one union type
export type ClientMessage =
  | { type: "message"; payload: { message: string } }
  | { type: "join_room"; payload: { roomId: string } }
  | { type: "leave_room"; payload: { roomId: string } }
  | { type: "room_message"; payload: { message: string } }
  | { type: "echo"; payload: { message: string } }
  | { type: "ping"; payload: { message: string } };

// all outgoing messages from the server in one union type
export type ServerMessage =
  | { type: "new_message"; payload: { message: string } }
  | { type: "room_message_response"; payload: { from: string; message: string; roomId?: string } }
  | { type: "echo_respond"; payload: { message: string } }
  | { type: "echo_error"; payload: { message: string } }
  | { type: "pong_response"; payload: { message: string } }
  | { type: "joined_room"; payload: { roomId: string; message: string } }
  | { type: "error"; payload: { message: string } };