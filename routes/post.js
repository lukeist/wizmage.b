import express from "express";
import {
  getPost,
  postPost,
  updatePostLiked,
  updatePostDisliked,
} from "../controllers/Post.js";

const router = express.Router();

router.get("/", getPost);
router.post("/", postPost);
router.patch("/:id/liked", updatePostLiked); // use PATCH instead of PUT because we modify part of a resource
router.patch("/:id/disliked", updatePostDisliked); // not like PUT is used to replace an entire resource
export default router;
