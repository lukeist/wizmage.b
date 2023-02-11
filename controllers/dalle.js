export const getDallE = async (req, res) => {
  try {
    res.send("Hi DE");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const postDallE = async (res, req) => {
  try {
    const { prompt } = req.body;
    const aiResponse = await OpenAIApi.createImage({
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
