import User from "../models/User.js";

export const authMe = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.log("authMe error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-hashedPassword");

    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    console.log("getUsers error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
