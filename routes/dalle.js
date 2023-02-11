import express from "express";
import { Configuration, OpenAIApi } from "openai";
import { getDallE } from "../controllers/dalle.js";

const router = express.Router();
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

// router.route("/").get((req, res) => {
//   res.send("Hi DE");`
// });

router.get("/", getDallE);
export default router;
