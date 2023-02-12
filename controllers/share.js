import Share from "../models/Share.js";
import { v2 as cloudinary } from "cloudinary";

export const getShare = async (req, res) => {
  try {
    const shares = await Share.find({});
    res.status(200).json({ success: true, data: shares });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postShare = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const { name, prompt, photo } = req.body;
    const photoUrl = await cloudinary.uploader.upload(photo);

    const newShare = await Share.create({
      name,
      prompt,
      photo: photoUrl.url,
    });

    res.status(201).json({ success: true, data: newShare });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
