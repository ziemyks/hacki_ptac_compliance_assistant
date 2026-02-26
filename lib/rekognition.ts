import { RekognitionClient, DetectLabelsCommand, DetectTextCommand } from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function identifyProduct(imageBuffer: Buffer) {
  const imageParams = {
    Image: {
      Bytes: imageBuffer,
    },
  };

  try {
    // Detect Labels
    const labelsCommand = new DetectLabelsCommand({
      ...imageParams,
      MaxLabels: 10,
      MinConfidence: 75,
    });

    // Detect Text (OCR)
    const textCommand = new DetectTextCommand(imageParams);

    const [labelsResponse, textResponse] = await Promise.all([
      rekognitionClient.send(labelsCommand),
      rekognitionClient.send(textCommand),
    ]);

    return {
      labels: labelsResponse.Labels || [],
      textDetections: textResponse.TextDetections || [],
    };
  } catch (error) {
    console.error("Error identifying product with AWS Rekognition:", error);
    throw error;
  }
}
