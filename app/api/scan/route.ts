import { NextRequest, NextResponse } from "next/server";
import { identifyProduct, analyzeProductCompliance } from "@/lib/compliance";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const mode = formData.get("mode") as string || "identify";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || "image/jpeg";

        if (mode === "identify") {
            const result = await identifyProduct(buffer, mimeType);
            return NextResponse.json(result);
        } else if (mode === "analyze") {
            const contextStr = formData.get("context") as string;
            const context = JSON.parse(contextStr || "{}");

            const result = await analyzeProductCompliance(buffer, mimeType, {
                productName: context.productName || "Nezināma prece",
                productType: context.productType || "fiziska prece",
                targetAudience: context.targetAudience || "B2C"
            });
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    } catch (error) {
        console.error("Scan API Error:", error);
        return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
    }
}
