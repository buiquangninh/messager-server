import Conversation from "../models/Conversation";

const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user._id.toString();
    const recipientId = req.body?.recipientId ?? null;

    if (!recipientId) {
      return res.status(400).json({ message: "RecipientId is required!" });
    }

    const conversation = await Conversation.findById({})
  } catch (error) {}
};
