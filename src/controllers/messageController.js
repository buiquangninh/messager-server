import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const sendDirectMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, content, imgUrl } = req.body;
    const senderId = req.user._id;

    if (!content) {
      return res.status(404).json({ message: "Message not found!" });
    }

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          {
            userId: senderId,
            joinedAt: new Date(),
          },
          {
            userId: recipientId,
            joinedAt: new Date(),
          },
        ],
        lastMessageAt: new Date(),
        unreadCount: new Map(),
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
      imgUrl,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.log("Send direct message error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
  } catch (error) {}
};
