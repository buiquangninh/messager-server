import express from "express";
import {
  createConversationController,
  getAllConversation,
  getConversationById,
} from "../controllers/conversationController.js";

const router = express.Router();

router.post("/conversation", createConversationController);
router.get("/conversations", getAllConversation);
router.get("/conversations/:conversationId", getConversationById);

export default router;
