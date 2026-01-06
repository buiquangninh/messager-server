import { Schema, model } from "mongoose";

const friendRequestSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
      maxLength: 300,
    },
  },
  {
    timestamps: true,
  }
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
friendRequestSchema.index({ to: 1 });
friendRequestSchema.index({ from: 1 });

export default model("FriendRequest", friendRequestSchema);
