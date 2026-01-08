import express from "express";
import { conversationController } from "../controllers/conversationController.js";

const router = express.Router();

router.post("/conversations", conversationController);

export default router;
