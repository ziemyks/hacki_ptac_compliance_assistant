import { NextResponse } from "next/server";


export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;
    return NextResponse.json({
        gemini_api_key_present: !!apiKey,
        gemini_api_key_length: apiKey?.length || 0,
        gemini_api_key_start: apiKey?.substring(0, 4) || "none",
        process_cwd: process.cwd(),
        env_keys: Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("AWS"))
    });
}
