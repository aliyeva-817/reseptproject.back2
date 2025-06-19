const { Server } = require("socket.io");
const Message = require("./models/Message");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Yeni istifadəçi qoşuldu", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("sendMessage", async ({ chatId, sender, content }) => {
      try {
        const message = await Message.create({ chatId, sender, content });
        io.to(chatId).emit("newMessage", message);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("editMessage", async ({ messageId, newContent }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          message.content = newContent;
          message.edited = true;
          await message.save();
          io.to(message.chatId.toString()).emit("updatedMessage", message);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndDelete(messageId);
        if (message) {
          io.to(message.chatId.toString()).emit("deletedMessage", messageId);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("İstifadəçi ayrıldı", socket.id);
    });
  });

  return io;
}

module.exports = initSocket;
