const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const controller = require("../controllers/messageController");

router.post("/", verifyToken, controller.sendMessage);
router.get("/conversation/:userId/:recipientId", verifyToken, controller.getConversation);
router.delete("/:messageId", verifyToken, controller.deleteMessage);
router.put("/:messageId", verifyToken, controller.editMessage);
router.delete("/clear/:userId", verifyToken, controller.clearConversation);

module.exports = router;
