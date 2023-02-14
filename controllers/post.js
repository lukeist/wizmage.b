import Post from "../models/Post.js";
import { v2 as cloudinary } from "cloudinary";

export const getPost = async (req, res) => {
  try {
    const Posts = await Post.find({});
    res.status(200).json({ success: true, data: Posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postPost = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const { name, prompt, photo } = req.body;
    const photoUrl = await cloudinary.uploader.upload(photo);

    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl.url,
      liked: 0,
      disliked: 0,
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePostLiked = async (req, res) => {
  try {
    const { id } = req.body;
    const updatePost = await Post.findByIdAndUpdate(
      id,
      { $inc: { liked: 1 } },
      { new: true }
    );
    res.status(201).json({ success: true, data: updatePost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePostDisliked = async (req, res) => {
  try {
    const { id } = req.body;
    const updatePost = await Post.findByIdAndUpdate(
      id,
      { $inc: { disliked: 1 } },
      { new: true }
    );
    res.status(201).json({ success: true, data: updatePost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
