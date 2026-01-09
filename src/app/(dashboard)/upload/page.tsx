"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    // Update all pending files to uploading status
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" as const } : f
      )
    );

    // Upload each pending file
    for (const uploadFile of pendingFiles) {

      try {
        const formData = new FormData();
        formData.append("file", uploadFile.file);

        const response = await fetch("/api/forms/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "uploaded" as const } : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error" as const, error: "Upload failed" }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadedCount = files.filter((f) => f.status === "uploaded").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Forms</h1>
        <p className="mt-2 text-gray-600">
          Upload PDF insurance intake forms for extraction benchmarking.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <input {...getInputProps()} />
        <FileUp className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900">
          {isDragActive ? "Drop files here..." : "Drag & drop PDF files here"}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          or click to select files from your computer
        </p>
        <p className="mt-1 text-xs text-gray-500">Only PDF files are accepted</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Selected Files ({files.length})
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={isUploading || pendingCount === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Upload {pendingCount} Files</>
                )}
              </Button>
            </div>
          </div>

          {uploadedCount > 0 && (
            <p className="mt-2 text-sm text-green-600">
              {uploadedCount} file(s) uploaded successfully
            </p>
          )}

          <ul className="mt-4 divide-y divide-gray-200">
            {files.map((uploadFile) => (
              <li
                key={uploadFile.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {uploadFile.status === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  {uploadFile.status === "uploaded" && (
                    <span className="text-sm font-medium text-green-600">
                      Uploaded
                    </span>
                  )}
                  {uploadFile.status === "error" && (
                    <span className="text-sm font-medium text-red-600">
                      {uploadFile.error}
                    </span>
                  )}
                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
