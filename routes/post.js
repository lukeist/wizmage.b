import express from "express";
import {
  getPost,
  postPost,
  updatePostLiked,
  updatePostDisliked,
  getAllPosts,
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getPost); // get 10 posts each request with lazy load
router.get("/all", getAllPosts); // get all posts in the gallery
router.post("/", postPost);
router.patch("/:id/liked", updatePostLiked); // use PATCH instead of PUT because we modify part of a resource
router.patch("/:id/disliked", updatePostDisliked); // not like PUT is used to replace an entire resource
export default router;
