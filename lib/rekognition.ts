import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function identifyProduct(imageBuffer: Buffer) {
  const params = {
    Image: {
      Bytes: imageBuffer,
    },
    MaxLabels: 10,
    MinConfidence: 75,
  };

  try {
    const command = new DetectLabelsCommand(params);
    const response = await rekognitionClient.send(command);
    return response.Labels || [];
  } catch (error) {
    console.error("Error identifying product with AWS Rekognition:", error);
    throw error;
  }
}
