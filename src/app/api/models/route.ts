import { NextResponse } from "next/server";
import { MODELS, getProviders, getVisionModels, getJsonModels } from "@/lib/ai/providers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const feature = searchParams.get("feature");

  let models = [...MODELS];

  // Filter by provider
  if (provider) {
    models = models.filter((m) => m.provider === provider);
  }

  // Filter by feature
  if (feature === "vision") {
    models = getVisionModels();
  } else if (feature === "json") {
    models = getJsonModels();
  }

  return NextResponse.json({
    models,
    providers: getProviders(),
    total: models.length,
  });
}
