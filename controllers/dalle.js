import { Configuration, OpenAIApi } from "openai";

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
    const aiResponse = await openai.createImage({
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const image = aiResponse.data.data[0].b64_json;
    res.status(200).json({ photo: image });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
