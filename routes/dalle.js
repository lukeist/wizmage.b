import express from "express";
import { getDallE, postDallE } from "../controllers/dalle.js";

const router = express.Router();

// router.route("/").get((req, res) => {
//   res.send("Hi DE");`
// });

router.get("/", getDallE);
router.post("/", postDallE);
export default router;
