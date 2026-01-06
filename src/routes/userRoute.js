import express from "express";
import { authMe, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/auth/me", authMe);
router.get("/users", getUsers);

export default router;
