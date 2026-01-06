import Friend from "../models/Friend.js";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export const addFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;

    const user = await User.exists({ _id: to });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (from === to) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    let userA = from.toString();
    let userB = to.toString();

    if (userA > userB) {
      const temp = userA;
      userA = userB;
      userB = temp;
    }

    const [friendExists, friendRequestExists] = await Promise.all([
      Friend.exists({ userA, userB }),
      FriendRequest.exists({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    if (friendExists) {
      return res.status(400).json({ message: "You are already friends" });
    }

    if (friendRequestExists) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you two" });
    }

    await FriendRequest.create({ from, to, message });

    return res
      .status(201)
      .json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log("addFriend error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.to.toString() !== userId.toString()) {
      return res.status(400).json({
        message: "You are not authorized to accept this friend request",
      });
    }

    await Friend.create({
      userA: friendRequest.from,
      userB: friendRequest.to,
    });

    await FriendRequest.findByIdAndDelete(requestId);

    return res
      .status(200)
      .json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.log("acceptFriendRequest error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.to.toString() !== userId.toString()) {
      return res.status(400).json({
        message: "You are not authorized to decline this friend request",
      });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    return res
      .status(200)
      .json({ message: "Friend request declined successfully" });
  } catch (error) {
    console.log("declineFriendRequest error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    }).populate("userA userB", "-hashedPassword -createdAt -updatedAt");

    if (!friendships.length) {
      return res.status(200).json({ data: [] });
    }

    const friends = friendships.map((friendship) =>
      friendship.userA._id.toString() === userId.toString()
        ? friendship.userB
        : friendship.userA
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.log("getAllFriend error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendRequests = await FriendRequest.find({ to: userId })
      .populate("from", "-hashedPassword")
      .sort({ createdAt: -1 });

    if (!friendRequests.length) {
      return res.status(200).json({ data: [] });
    }

    return res.status(200).json({ data: friendRequests });
  } catch (error) {
    console.log("getFriendRequests error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
