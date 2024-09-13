import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        console.error("DEEPGRAM_API_KEY 環境變量未設置");
        return NextResponse.json({ error: "Deepgram API 密鑰未配置" }, { status: 500 });
    }
    return NextResponse.json({ key: apiKey });
}
