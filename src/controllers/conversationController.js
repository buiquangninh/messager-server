import Conversation from "../models/Conversation.js";

export const conversationController = async (req, res) => {
  try {
    const { recipientId, type } = req.body;
    const senderId = req.user._id;

    if (!recipientId) {
      return res.status(404).json({ message: "Recipient is required!" });
    }

    if (type === "group") {
      return res.status(200).json({});
    }

    const conversation = await Conversation.findOne({
      participants: {
        $all: [{ userId: recipientId }, { userId: senderId }],
      },
    });

    if (conversation) {
      return res.status(200).json(conversation);
    }

    const newConversation = await Conversation.create({
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

    return res.status(200).json(newConversation);
  } catch (error) {
    console.error("Conversation error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
