import { NextResponse } from "next/server";
import { z } from "zod";
import { extractFull, extractStructured, extractFreeform } from "@/lib/ai/extract";
import { MODELS } from "@/lib/ai/providers";

const ExtractRequestSchema = z.object({
  modelId: z.string(),
  content: z.string(), // Base64 encoded PDF or text content
  mode: z.enum(["structured", "freeform", "full"]).default("full"),
  customPrompt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = ExtractRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { modelId, content, mode, customPrompt } = parseResult.data;

    // Validate model exists
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) {
      return NextResponse.json(
        { error: `Unknown model: ${modelId}` },
        { status: 400 }
      );
    }

    // Run extraction based on mode
    const options = {
      modelId,
      pdfContent: content,
      customPrompt,
    };

    let result;
    switch (mode) {
      case "structured":
        result = await extractStructured(options);
        break;
      case "freeform":
        result = await extractFreeform(options);
        break;
      case "full":
      default:
        result = await extractFull(options);
        break;
    }

    return NextResponse.json({
      success: result.success,
      model: {
        id: model.id,
        displayName: model.displayName,
        provider: model.provider,
      },
      extraction: {
        structuredOutput: result.structuredOutput,
        freeformOutput: result.freeformOutput,
      },
      metrics: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        cost: result.cost,
        latencyMs: result.latencyMs,
      },
      error: result.error,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
