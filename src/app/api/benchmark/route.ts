import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractFull } from "@/lib/ai/extract";
import { MODELS, calculateCost } from "@/lib/ai/providers";
import { extractText } from "unpdf";

const CreateBenchmarkSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  modelIds: z.array(z.string()).min(1),
  formIds: z.array(z.string()).min(1),
});

// GET - List benchmark runs
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: benchmarks, error } = await supabase
      .from("benchmark_runs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching benchmarks:", error);
      return NextResponse.json(
        { error: "Failed to fetch benchmarks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ benchmarks });
  } catch (error) {
    console.error("Benchmark list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create and run a benchmark
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate request
    const parseResult = CreateBenchmarkSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { name, description, modelIds, formIds } = parseResult.data;

    // Validate all models exist
    const validModels = modelIds.filter((id) => MODELS.find((m) => m.id === id));
    if (validModels.length !== modelIds.length) {
      return NextResponse.json(
        { error: "One or more invalid model IDs" },
        { status: 400 }
      );
    }

    // Calculate estimated cost
    const estimatedCost = modelIds.reduce((total, modelId) => {
      const model = MODELS.find((m) => m.id === modelId);
      if (!model) return total;
      // Estimate: 2000 input, 1000 output tokens per form
      return total + calculateCost(modelId, 2000, 1000) * formIds.length;
    }, 0);

    // Create benchmark run record
    const { data: benchmarkRun, error: createError } = await supabase
      .from("benchmark_runs")
      .insert({
        name: name || `Benchmark ${new Date().toISOString()}`,
        description,
        status: "pending",
        total_forms: formIds.length,
        total_models: modelIds.length,
        config: {
          modelIds,
          formIds,
          estimatedCost,
        },
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating benchmark:", createError);
      return NextResponse.json(
        { error: "Failed to create benchmark" },
        { status: 500 }
      );
    }

    // Start processing in background (for now, return immediately)
    // In a real app, this would be a background job
    processBenchmark(supabase, benchmarkRun.id, modelIds, formIds).catch(
      console.error
    );

    return NextResponse.json({
      success: true,
      benchmark: benchmarkRun,
      estimatedCost,
      totalExtractions: modelIds.length * formIds.length,
    });
  } catch (error) {
    console.error("Benchmark creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Background processing function
async function processBenchmark(
  supabase: Awaited<ReturnType<typeof createClient>>,
  benchmarkId: string,
  modelIds: string[],
  formIds: string[]
) {
  // Update status to running
  await supabase
    .from("benchmark_runs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", benchmarkId);

  let totalCost = 0;
  let processedCount = 0;

  try {
    // Fetch form contents
    for (const formId of formIds) {
      const { data: form } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (!form) continue;

      // Get file content from storage
      const { data: fileData } = await supabase.storage
        .from("forms")
        .download(form.storage_path);

      if (!fileData) continue;

      // Extract text from PDF using unpdf
      const arrayBuffer = await fileData.arrayBuffer();
      const { text: textPages } = await extractText(arrayBuffer);
      const content = textPages.join("\n");

      // Run extraction for each model
      for (const modelId of modelIds) {
        try {
          const result = await extractFull({
            modelId,
            pdfContent: content,
          });

          // Save result
          await supabase.from("extraction_results").insert({
            benchmark_run_id: benchmarkId,
            form_id: formId,
            model_id: modelId,
            status: result.success ? "success" : "error",
            structured_output: result.structuredOutput,
            freeform_output: result.freeformOutput,
            raw_response: result.rawResponse,
            latency_ms: result.latencyMs,
            input_tokens: result.inputTokens,
            output_tokens: result.outputTokens,
            total_tokens: result.totalTokens,
            cost: result.cost,
            error_message: result.error,
          });

          totalCost += result.cost;
        } catch (err) {
          console.error(`Extraction error for ${modelId}:`, err);
          await supabase.from("extraction_results").insert({
            benchmark_run_id: benchmarkId,
            form_id: formId,
            model_id: modelId,
            status: "error",
            error_message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      processedCount++;

      // Update progress
      await supabase
        .from("benchmark_runs")
        .update({
          processed_forms: processedCount,
          total_cost: totalCost,
        })
        .eq("id", benchmarkId);
    }

    // Mark as completed
    await supabase
      .from("benchmark_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_cost: totalCost,
      })
      .eq("id", benchmarkId);
  } catch (error) {
    console.error("Benchmark processing error:", error);
    await supabase
      .from("benchmark_runs")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", benchmarkId);
  }
}
