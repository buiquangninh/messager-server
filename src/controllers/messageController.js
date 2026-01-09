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

    if (!conversationId) {
      return res.status(404).json({ message: "ConversationId not found!" });
    }

    const conversation = await Conversation.findById(conversationId);

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

export const getMessage = async (req, res) => {
  try {
  } catch (error) {}
};
