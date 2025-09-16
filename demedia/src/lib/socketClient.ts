import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = (): Socket => {
    if (!socket) {
        socket = io("http://localhost:5000");
    }
    return socket;
};
