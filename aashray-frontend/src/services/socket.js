// src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5652";

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    withCredentials: true,
    transports: ["websocket", "polling"],
});