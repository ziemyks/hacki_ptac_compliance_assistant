import { NextRequest, NextResponse } from "next/server";
import { identifyProduct } from "@/lib/rekognition";
import { analyzeCompliance } from "@/lib/compliance";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Identify product with Rekognition
        const labels = await identifyProduct(buffer);

        // 2. Analyze compliance
        const analysis = analyzeCompliance(labels);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Scan API Error:", error);
        return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
    }
}
