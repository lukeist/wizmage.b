import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    photo: { type: String, required: true },
    disliked: { type: Number },
    liked: { type: Number },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;
