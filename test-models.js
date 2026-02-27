const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // There isn't a direct listModels in the main SDK class usually, 
        // but we can try to find where it is or just try common names.
        // Actually, the error message suggested calling ListModels.
        // In the Node SDK, it might be via the generativeLanguage client or similar.
        // But let's just try to brute force a few common ones or check the SDK version.

        console.log("Starting model check...");
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-2.0-flash"];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                // Try a very simple prompt to see if it responds or 404s
                await model.generateContent("test");
                console.log(`✅ Model ${m} is available.`);
            } catch (e) {
                console.log(`❌ Model ${m} failed: ${e.message}`);
            }
        }
    } catch (err) {
        console.error("Initialization error:", err);
    }
}

run();
