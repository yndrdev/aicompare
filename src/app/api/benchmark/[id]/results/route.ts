import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch benchmark run
    const { data: benchmark, error: benchmarkError } = await supabase
      .from("benchmark_runs")
      .select("*")
      .eq("id", id)
      .single();

    if (benchmarkError) {
      console.error("Error fetching benchmark:", benchmarkError);
      return NextResponse.json(
        { error: "Benchmark not found" },
        { status: 404 }
      );
    }

    // Fetch results
    const { data: results, error: resultsError } = await supabase
      .from("extraction_results")
      .select("*")
      .eq("benchmark_run_id", id)
      .order("created_at", { ascending: true });

    if (resultsError) {
      console.error("Error fetching results:", resultsError);
      return NextResponse.json(
        { error: "Failed to fetch results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      benchmark,
      results,
    });
  } catch (error) {
    console.error("Results fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
