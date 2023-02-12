import express from "express";
import { getDallE, postDallE } from "../controllers/dalle.js";

const router = express.Router();
router.get("/", getDallE);
router.post("/", postDallE);
export default router;
