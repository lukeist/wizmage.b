import { Generation } from "./generation/generation_pb";
import { GenerationServiceClient } from "./generation/generation_pb_service";
import { grpc } from "@improbable-eng/grpc-web";
import fs from "fs";

export const GenerationTextPrompt = {
  text: "",
  weight: 0,
};

export const CommonGenerationParams = {
  prompts: [],
  height: 0,
  width: 0,
  samples: 0,
  steps: 0,
  cfgScale: 0,
  sampler: null,
  clipGuidancePreset: null,
  seed: 0,
};

export const GenerationRequestParams = {
  type: "text-to-image",
  initImage: Buffer.from([]),
  stepScheduleStart: 0,
  stepScheduleEnd: undefined,
  maskImage: Buffer.from([]),
};

export const GenerationRequest = {};

export const GenerationResponse = {};

export const GenerationArtifacts = {
  imageArtifacts: [],
  filteredArtifacts: [],
};

function buildGenerationRequest(engineID, params) {
  const imageParams = new Generation.ImageParameters();
  if (params.width) {
    imageParams.setWidth(params.width);
  }
  if (params.height) {
    imageParams.setHeight(params.height);
  }
  if (params.samples) {
    imageParams.setSamples(params.samples);
  }
  if (params.steps) {
    imageParams.setSteps(params.steps);
  }
  if (params.seed) {
    imageParams.addSeed(params.seed);
  }
  if (params.sampler) {
    const transformType = new Generation.TransformType();
    transformType.setDiffusion(params.sampler);
    imageParams.setTransform(transformType);
  }

  const request = new Generation.Request();
  request.setEngineId(engineID);
  request.setRequestedType(Generation.ArtifactType.ARTIFACT_IMAGE);
  request.setClassifier(new Generation.ClassifierParameters());

  const samplerParams = new Generation.SamplerParameters();
  if (params.cfgScale) {
    samplerParams.setCfgScale(params.cfgScale);
  }

  const stepParams = new Generation.StepParameter();
  stepParams.setScaledStep(0);
  stepParams.setSampler(samplerParams);

  const scheduleParams = new Generation.ScheduleParameters();
  if (params.type === "image-to-image") {
    scheduleParams.setStart(params.stepScheduleStart);
    if (params.stepScheduleEnd) {
      scheduleParams.setEnd(params.stepScheduleEnd);
    }
  } else if (params.type === "image-to-image-masking") {
    scheduleParams.setStart(1);
  }

  stepParams.setSchedule(scheduleParams);

  if (params.clipGuidancePreset) {
    const guidanceParameters = new Generation.GuidanceParameters();
    guidanceParameters.setGuidancePreset(
      Generation.GuidancePreset.GUIDANCE_PRESET_FAST_BLUE
    );
    stepParams.setGuidance(guidanceParameters);
  }

  imageParams.addParameters(stepParams);
  request.setImage(imageParams);

  params.prompts.forEach((textPrompt) => {
    const prompt = new Generation.Prompt();
    prompt.setText(textPrompt.text);

    if (textPrompt.weight) {
      const promptParameters = new Generation.PromptParameters();
      promptParameters.setWeight(textPrompt.weight);
      prompt.setParameters(promptParameters);
    }

    request.addPrompt(prompt);
  });

  if (params.type === "image-to-image") {
    request.addPrompt(createInitImagePrompt(params.initImage));
  } else if (params.type === "image-to-image-masking") {
    request.addPrompt(createInitImagePrompt(params.initImage));
    request.addPrompt(createMaskImagePrompt(params.maskImage));
  }

  return request;
}

function createInitImagePrompt(imageBinary) {
  const initImageArtifact = new Generation.Artifact();
  initImageArtifact.setBinary(imageBinary);
  initImageArtifact.setType(Generation.ArtifactType.ARTIFACT_IMAGE);

  const initImageParameters = new Generation.PromptParameters();
  initImageParameters.setInit(true);

  const initImagePrompt = new Generation.Prompt();
  initImagePrompt.setParameters(initImageParameters);
  initImagePrompt.setArtifact(initImageArtifact);

  return initImagePrompt;
}

const IMAGE_ARTIFACT_TYPE = 1;

function extractArtifacts(answers) {
  const filteredArtifacts = [];
  const imageArtifacts = [];

  for (const answer of answers) {
    for (const artifact of answer.getArtifactsList()) {
      if (artifact.getType() === IMAGE_ARTIFACT_TYPE) {
        if (artifact.getFinishReason() === Generation.FinishReason.FILTER) {
          filteredArtifacts.push(artifact);
        } else {
          imageArtifacts.push(artifact);
        }
      }
    }
  }

  return { filteredArtifacts, imageArtifacts };
}

function onGenerationComplete(response) {
  if (response instanceof Error) {
    console.error("Generation failed", response);
    return;
  }

  console.log(
    `${
      response.imageArtifacts.length + response.filteredArtifacts.length
    } artifacts were generated.`
  );

  if (response.filteredArtifacts.length > 0) {
    console.log(
      `${response.filteredArtifacts.length} artifact` +
        `${response.filteredArtifacts.length === 1 ? "s" : ""}` +
        ` were filtered by the NSFW classifier`
    );
  }

  response.imageArtifacts.forEach((artifact) => {
    try {
      fs.writeFileSync(
        `image-${artifact.getSeed()}.png`,
        Buffer.from(artifact.getBinary_asU8())
      );
    } catch (error) {
      console.error("Failed to write resulting image to disk", error);
    }
  });
}

async function executeGenerationRequest(generationClient, request, metadata) {
  try {
    const stream = generationClient.generate(request, metadata);
    const answers = await new Promise((resolve, reject) => {
      const answers = [];

      stream.on("data", (data) => answers.push(data));
      stream.on("end", () => resolve(answers));
      stream.on("status", (status) => {
        if (status.code === 0) return;
        reject(status.details);
      });
    });

    return extractArtifacts(answers);
  } catch (err) {
    return err instanceof Error ? err : new Error(JSON.stringify(err));
  }
}
