import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: forms, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forms:", error);
      return NextResponse.json(
        { error: "Failed to fetch forms" },
        { status: 500 }
      );
    }

    return NextResponse.json({ forms });
  } catch (error) {
    console.error("Forms list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
