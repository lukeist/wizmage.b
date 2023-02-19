import { Configuration, OpenAIApi } from "openai";
import LanguageDetect from "languagedetect";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";

export const getDallE = async (req, res) => {
  try {
    res.send("Hi DE");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const postDallE = async (req, res) => {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const { prompt } = req.body;
    const lngDetector = new LanguageDetect();

    let aiResponse; // check if prompt is english or not to translate
    if (lngDetector.detect(prompt)[0][0] === "english") {
      aiResponse = await openai.createImage({
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });
    } else {
      // translate prompt into english using google translate api
      const projectId = process.env.TRANSLATE_PROJECT_ID;
      const key = process.env.TRANSLATE_API;
      const translate = new Translate({ projectId, key });
      const target = "en";
      const [translatedPrompt] = await translate.translate(prompt, target);

      aiResponse = await openai.createImage({
        prompt: translatedPrompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });
    }

    const image = aiResponse.data.data[0].b64_json;
    res.status(200).json({ photo: image });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
