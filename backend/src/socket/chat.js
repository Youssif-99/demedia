export default function initChat(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("joinChat", (chatId) => {
            socket.join(chatId);
        });

        socket.on("sendMessage", (message) => {
            // message = { chatId, content, senderId, createdAt }
            io.to(message.chatId).emit("newMessage", message);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
