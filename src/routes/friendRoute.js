import express from "express";
import {
  acceptFriendRequest,
  addFriendRequest,
  declineFriendRequest,
  getAllFriend,
  getFriendRequests,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/requests", addFriendRequest);
router.post("/requests/:requestId/accept", acceptFriendRequest);
router.post("/requests/:requestId/decline", declineFriendRequest);
router.get("/", getAllFriend);
router.get("/requests", getFriendRequests);

export default router;
