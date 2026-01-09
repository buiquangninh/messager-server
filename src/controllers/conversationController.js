import Conversation from "../models/Conversation.js";

export const createConversationController = async (req, res) => {
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

export const getAllConversation = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .select("-lastMessageAt -createdAt -updatedAt")
      .populate("participants.userId", "displayName avatarUrl")
      .populate("lastMessage.senderId", "displayName avatarUrl")
      .populate("seenBy", "displayName avatarUrl")
      .lean();

    const formattedConversations = conversations.map((conversation) => {
      const participants = (conversation.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...conversation,
        unreadCount: conversation.unreadCount || {},
        participants,
      };
    });

    return res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Get conversation error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const currentUserId = req.user._id;

    if (!conversationId) {
      return res.status(404).json({ message: "ConversationId is required!" });
    }

    const conversation = await Conversation.findById(conversationId)
      .select("-lastMessageAt -createdAt -updatedAt")
      .populate("participants.userId", "displayName avatarUrl")
      .populate("lastMessage.senderId", "displayName avatarUrl")
      .populate("seenBy", "displayName avatarUrl")
      .lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found!" });
    }

    const isMember = conversation.participants.some(
      (p) => p.userId?._id.toString() === currentUserId.toString()
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this conversation" });
    }

    const formattedConversation = { ...conversation };

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    formattedConversation.unreadCount = conversation.unreadCount || {};
    formattedConversation.participants = participants;

    return res.status(200).json(formattedConversation);
  } catch (error) {
    console.error("Get conversationById error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
