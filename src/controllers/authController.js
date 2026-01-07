import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = 30 * 60; // 30p (thuong la 15p)
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngay

export const signUp = async (req, res) => {
  try {
    const { username, lastName, firstName, email, password } = req.body;

    if (!username || !lastName || !firstName || !email || !password) {
      return res.status(400).json({
        message: "username, lastName, firstName, email, password is required!",
      });
    }

    const user = await User.exists({ username });

    if (user) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    const userEmail = await User.exists({ email });

    if (userEmail) {
      return res.status(409).json({
        message: "Email already exists.",
      });
    }

    await User.create({
      username,
      hashedPassword: password,
      displayName: `${firstName} ${lastName}`,
      email,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log("signUp error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "username & password is required!",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Username is not found!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password is not correct!",
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // backend, frontend deploy rieng
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // backend, frontend deploy rieng
      maxAge: ACCESS_TOKEN_TTL * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log("signIn error", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await Session.deleteOne({ refreshToken: token });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
    }

    return res.sendStatus(204);
  } catch (error) {
    console.log("logout error", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "No refresh token provided",
      });
    }

    const session = await Session.findOne({ refreshToken: token });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ACCESS_TOKEN_TTL * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log("refreshToken error", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
