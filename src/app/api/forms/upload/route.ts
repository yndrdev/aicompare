import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const storagePath = `forms/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("forms")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get the current user (for now, use a placeholder)
    // TODO: Implement proper auth
    const userId = null; // Will be set when auth is implemented

    // Save form record to database
    const { data: formRecord, error: dbError } = await supabase
      .from("forms")
      .insert({
        user_id: userId,
        filename: filename,
        original_name: file.name,
        file_size: file.size,
        storage_path: storagePath,
        mime_type: file.type,
        status: "uploaded",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Try to clean up the uploaded file
      await supabase.storage.from("forms").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save form record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      form: formRecord,
      storage: uploadData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
