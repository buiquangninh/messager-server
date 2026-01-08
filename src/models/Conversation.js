import { model, Schema } from "mongoose";

const participantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  }
);

const lastMessageSchema = new Schema(
  {
    _id: { type: String },
    content: {
      type: String,
      default: null,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    participants: {
      type: [participantSchema],
      required: true,
    },
    group: {
      type: [groupSchema],
    },
    lastMessageAt: {
      type: Date,
    },
    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ "participant.userId": 1, lastMessageAt: -1 });

const Conversation = model("Conversation", conversationSchema);

export default Conversation;
