"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  FileUp,
  X,
  FileText,
  Loader2,
  CheckCircle,
  ChevronRight,
  Zap,
  BarChart3,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCost } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "uploaded" | "error";
  dbId?: string;
  error?: string;
}

interface ExistingForm {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  created_at: string;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
}

type Step = "upload" | "select-models" | "analyze";

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [existingForms, setExistingForms] = useState<ExistingForm[]>([]);
  const [selectedExistingForms, setSelectedExistingForms] = useState<string[]>([]);

  // Fetch available models and existing forms
  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => setModels(data.models || []))
      .catch(console.error);

    fetch("/api/forms")
      .then((res) => res.json())
      .then((data) => setExistingForms(data.forms || []))
      .catch(console.error);
  }, []);

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

        const data = await response.json();

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "uploaded" as const, dbId: data.form?.id }
              : f
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

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const toggleExistingForm = (formId: string) => {
    setSelectedExistingForms((prev) =>
      prev.includes(formId)
        ? prev.filter((id) => id !== formId)
        : [...prev, formId]
    );
  };

  const runComparison = async () => {
    const uploadedForms = files.filter((f) => f.status === "uploaded" && f.dbId);
    const allFormIds = [
      ...uploadedForms.map((f) => f.dbId!),
      ...selectedExistingForms,
    ];
    if (allFormIds.length === 0 || selectedModels.length === 0) return;

    setIsRunning(true);

    try {
      const response = await fetch("/api/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Quick Compare - ${new Date().toLocaleString()}`,
          modelIds: selectedModels,
          formIds: allFormIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/benchmarks/${data.benchmark.id}`);
      }
    } catch (error) {
      console.error("Failed to start comparison:", error);
      setIsRunning(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadedCount = files.filter((f) => f.status === "uploaded").length;
  const uploadedWithIds = files.filter(
    (f) => f.status === "uploaded" && f.dbId
  );

  // Total form count (new uploads + selected existing)
  const totalFormCount = uploadedWithIds.length + selectedExistingForms.length;

  // Estimate cost
  const estimatedCost = selectedModels.reduce((total, modelId) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return total;
    // Estimate: 2000 input, 1000 output tokens per form
    return (
      total +
      (model.inputPrice * 2 + model.outputPrice * 1) * totalFormCount
    );
  }, 0);

  // Quick select presets
  const selectCheapModels = () => {
    const cheapIds = models
      .sort((a, b) => a.inputPrice + a.outputPrice - (b.inputPrice + b.outputPrice))
      .slice(0, 4)
      .map((m) => m.id);
    setSelectedModels(cheapIds);
  };

  const selectTopModels = () => {
    const topIds = ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-1.5-pro"];
    setSelectedModels(topIds.filter((id) => models.some((m) => m.id === id)));
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[
          { key: "upload", label: "1. Upload", icon: FileUp },
          { key: "select-models", label: "2. Select Models", icon: BarChart3 },
          { key: "analyze", label: "3. Analyze", icon: Zap },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => {
                if (s.key === "upload") setStep("upload");
                else if (s.key === "select-models" && totalFormCount > 0)
                  setStep("select-models");
                else if (
                  s.key === "analyze" &&
                  totalFormCount > 0 &&
                  selectedModels.length > 0
                )
                  setStep("analyze");
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                step === s.key
                  ? "bg-blue-600 text-white"
                  : totalFormCount > 0 &&
                    (s.key === "upload" ||
                      s.key === "select-models" ||
                      (s.key === "analyze" && selectedModels.length > 0))
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400"
              }`}
              disabled={
                (s.key === "select-models" && totalFormCount === 0) ||
                (s.key === "analyze" &&
                  (totalFormCount === 0 || selectedModels.length === 0))
              }
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
            {i < 2 && <ChevronRight className="mx-1 h-4 w-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Upload Forms to Compare
            </h1>
            <p className="mt-2 text-gray-600">
              Drop your PDF insurance forms here to compare AI extraction across
              multiple models.
            </p>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              relative rounded-xl border-2 border-dashed p-16 text-center transition-all cursor-pointer
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 scale-[1.02]"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }
            `}
          >
            <input {...getInputProps()} />
            <div
              className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${
                isDragActive ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <FileUp
                className={`h-8 w-8 ${
                  isDragActive ? "text-blue-500" : "text-gray-400"
                }`}
              />
            </div>
            <p className="mt-4 text-xl font-medium text-gray-900">
              {isDragActive
                ? "Drop files here..."
                : "Drag & drop PDF files here"}
            </p>
            <p className="mt-2 text-gray-600">
              or click to select files from your computer
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Supports: PDF insurance intake forms
            </p>
          </div>

          {/* Existing Forms Section */}
          {existingForms.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Previously Uploaded Forms ({existingForms.length})
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Select from your previously uploaded forms or upload new ones above.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {existingForms.map((form) => (
                  <button
                    key={form.id}
                    onClick={() => toggleExistingForm(form.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all border-2 ${
                      selectedExistingForms.includes(form.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {form.original_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(form.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedExistingForms.includes(form.id)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedExistingForms.includes(form.id) && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedExistingForms.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep("select-models")}>
                    Next: Select Models ({selectedExistingForms.length} form{selectedExistingForms.length !== 1 ? 's' : ''} selected)
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Selected Files ({files.length})
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiles([])}
                    disabled={isUploading}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <ul className="space-y-2">
                {files.map((uploadFile) => (
                  <li
                    key={uploadFile.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(uploadFile.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === "uploading" && (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      )}
                      {uploadFile.status === "uploaded" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {uploadFile.status === "error" && (
                        <span className="text-sm font-medium text-red-600">
                          {uploadFile.error}
                        </span>
                      )}
                      {uploadFile.status === "pending" && (
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                {pendingCount > 0 && (
                  <Button onClick={uploadFiles} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>Upload {pendingCount} Files</>
                    )}
                  </Button>
                )}
                {uploadedCount > 0 && (
                  <Button onClick={() => setStep("select-models")}>
                    Next: Select Models
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Step 2: Select Models */}
      {step === "select-models" && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Select Models to Compare
            </h1>
            <p className="mt-2 text-gray-600">
              Choose which AI models to benchmark against your{" "}
              {totalFormCount} selected form
              {totalFormCount > 1 ? "s" : ""}.
            </p>
          </div>

          {/* Quick Select */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={selectCheapModels}>
              Select Budget Options
            </Button>
            <Button variant="outline" size="sm" onClick={selectTopModels}>
              Select Top Models
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedModels(models.map((m) => m.id))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedModels([])}
            >
              Clear
            </Button>
          </div>

          {/* Model Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  selectedModels.includes(model.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{model.name}</p>
                    <p className="text-xs text-gray-500">{model.provider}</p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      selectedModels.includes(model.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedModels.includes(model.id) && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {formatCost(
                    (model.inputPrice + model.outputPrice) * 1000
                  )}
                  /1K tokens
                </p>
              </button>
            ))}
          </div>

          {/* Summary & Actions */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedModels.length} model
                  {selectedModels.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-sm text-gray-600">
                  Estimated cost:{" "}
                  <span className="font-medium">
                    {formatCost(estimatedCost)}
                  </span>{" "}
                  for {totalFormCount} form
                  {totalFormCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep("analyze")}
                  disabled={selectedModels.length === 0}
                >
                  Next: Run Comparison
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Analyze */}
      {step === "analyze" && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Ready to Analyze
            </h1>
            <p className="mt-2 text-gray-600">
              Review your selection and start the comparison.
            </p>
          </div>

          {/* Summary Card */}
          <div className="max-w-xl mx-auto rounded-xl bg-white p-8 shadow-lg border">
            <div className="space-y-6">
              {/* Forms */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Forms to Analyze ({totalFormCount})
                </h3>
                <div className="mt-2 space-y-2">
                  {uploadedWithIds.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 text-gray-900"
                    >
                      <FileText className="h-4 w-4 text-red-500" />
                      {f.file.name}
                      <span className="text-xs text-green-600">(new)</span>
                    </div>
                  ))}
                  {selectedExistingForms.map((formId) => {
                    const form = existingForms.find((f) => f.id === formId);
                    return form ? (
                      <div
                        key={formId}
                        className="flex items-center gap-2 text-gray-900"
                      >
                        <FileText className="h-4 w-4 text-red-500" />
                        {form.original_name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Models */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Models to Compare ({selectedModels.length})
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedModels.map((id) => {
                    const model = models.find((m) => m.id === id);
                    return (
                      <span
                        key={id}
                        className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                      >
                        {model?.name || id}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Cost */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Cost</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCost(estimatedCost)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedModels.length} models × {totalFormCount} form
                  {totalFormCount !== 1 ? "s" : ""} ={" "}
                  {selectedModels.length * totalFormCount} extractions
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("select-models")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={runComparison}
                disabled={isRunning}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Comparison
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
