import express from "express";
import { getShare, postShare } from "../controllers/share.js";
const router = express.Router();

router.get("/", getShare);
router.post("/", postShare);
export default router;
