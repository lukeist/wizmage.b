import mongoose from "mongoose";

const ShareSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prompt: { type: String, required: true },
  photo: { type: String, required: true },
});

const Share = mongoose.model("Share", ShareSchema);
export default Share;
