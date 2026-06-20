import { NextRequest, NextResponse } from "next/server";
import { exportTranscriptToWordBuffer } from "@/utils/word/transcript-word-exporter";

export async function POST(req: NextRequest) {
  try {
    const { data, extra, filename } = await req.json();
    const buffer = await exportTranscriptToWordBuffer(data, extra ?? {});
    const fname = filename ?? `${data.studentCode ?? "transcript"}_transcript.docx`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fname}"`,
      },
    });
  } catch (err) {
    console.error("Word export error:", err);
    return NextResponse.json({ error: "Failed to generate Word document" }, { status: 500 });
  }
}
