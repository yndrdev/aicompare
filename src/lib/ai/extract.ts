/**
 * Form Extraction Service
 *
 * Handles PDF form extraction using any configured LLM model.
 */

import { generateText, generateObject } from "ai";
import { z } from "zod";
import { getModel, calculateCost, MODELS } from "./providers";

// Schema for structured insurance form extraction
export const InsuranceFormSchema = z.object({
  // Patient Information
  patientName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),

  // Insurance Information
  insuranceCompany: z.string().optional(),
  policyNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  subscriberName: z.string().optional(),
  subscriberDOB: z.string().optional(),
  relationship: z.string().optional(),

  // Medical Information
  primaryPhysician: z.string().optional(),
  referringPhysician: z.string().optional(),
  reasonForVisit: z.string().optional(),
  currentMedications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),

  // Additional fields (flexible)
  additionalFields: z.record(z.string(), z.string()).optional(),
});

export type InsuranceFormData = z.infer<typeof InsuranceFormSchema>;

export interface ExtractionResult {
  success: boolean;
  structuredOutput?: InsuranceFormData;
  freeformOutput?: string;
  rawResponse?: unknown;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  error?: string;
}

export interface ExtractionOptions {
  modelId: string;
  pdfContent: string; // Base64 encoded PDF or extracted text
  customPrompt?: string;
  includeStructured?: boolean;
  includeFreeform?: boolean;
}

const DEFAULT_EXTRACTION_PROMPT = `You are an expert at extracting information from insurance intake forms.

Extract all relevant information from this form and return it in the requested format.

Be thorough and extract:
- Patient personal information (name, DOB, address, contact info)
- Insurance details (policy number, group number, insurance company)
- Medical information (conditions, medications, allergies, physicians)
- Any other relevant fields you find

If a field is not present or unclear, omit it rather than guessing.`;

const FREEFORM_EXTRACTION_PROMPT = `Extract and summarize all text content from this insurance form.
Include any medical history, notes, or narrative sections verbatim.
Organize the content logically and preserve important details.`;

/**
 * Extract structured data from a PDF form using specified model
 */
export async function extractStructured(
  options: ExtractionOptions
): Promise<ExtractionResult> {
  const { modelId, pdfContent, customPrompt } = options;
  const startTime = Date.now();

  try {
    const model = getModel(modelId);
    const modelDef = MODELS.find((m) => m.id === modelId);

    // Check if model supports JSON mode
    if (!modelDef?.supportsJsonMode) {
      return {
        success: false,
        error: `Model ${modelId} does not support JSON mode`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs: Date.now() - startTime,
      };
    }

    const result = await generateObject({
      model,
      schema: InsuranceFormSchema,
      prompt: `${customPrompt || DEFAULT_EXTRACTION_PROMPT}\n\nForm content:\n${pdfContent}`,
    });

    const latencyMs = Date.now() - startTime;
    const inputTokens = result.usage?.inputTokens || 0;
    const outputTokens = result.usage?.outputTokens || 0;

    return {
      success: true,
      structuredOutput: result.object,
      rawResponse: result,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: calculateCost(modelId, inputTokens, outputTokens),
      latencyMs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Extract freeform text from a PDF form using specified model
 */
export async function extractFreeform(
  options: ExtractionOptions
): Promise<ExtractionResult> {
  const { modelId, pdfContent, customPrompt } = options;
  const startTime = Date.now();

  try {
    const model = getModel(modelId);

    const result = await generateText({
      model,
      prompt: `${customPrompt || FREEFORM_EXTRACTION_PROMPT}\n\nForm content:\n${pdfContent}`,
    });

    const latencyMs = Date.now() - startTime;
    const inputTokens = result.usage?.inputTokens || 0;
    const outputTokens = result.usage?.outputTokens || 0;

    return {
      success: true,
      freeformOutput: result.text,
      rawResponse: result,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: calculateCost(modelId, inputTokens, outputTokens),
      latencyMs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Full extraction: both structured and freeform
 */
export async function extractFull(
  options: ExtractionOptions
): Promise<ExtractionResult> {
  const { modelId, pdfContent, customPrompt } = options;
  const startTime = Date.now();

  try {
    // Run both extractions in parallel
    const [structuredResult, freeformResult] = await Promise.all([
      extractStructured({ modelId, pdfContent, customPrompt }),
      extractFreeform({ modelId, pdfContent, customPrompt }),
    ]);

    const latencyMs = Date.now() - startTime;
    const inputTokens =
      structuredResult.inputTokens + freeformResult.inputTokens;
    const outputTokens =
      structuredResult.outputTokens + freeformResult.outputTokens;

    // If either failed, report the error
    if (!structuredResult.success || !freeformResult.success) {
      return {
        success: false,
        error: structuredResult.error || freeformResult.error,
        structuredOutput: structuredResult.structuredOutput,
        freeformOutput: freeformResult.freeformOutput,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost: structuredResult.cost + freeformResult.cost,
        latencyMs,
      };
    }

    return {
      success: true,
      structuredOutput: structuredResult.structuredOutput,
      freeformOutput: freeformResult.freeformOutput,
      rawResponse: {
        structured: structuredResult.rawResponse,
        freeform: freeformResult.rawResponse,
      },
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: structuredResult.cost + freeformResult.cost,
      latencyMs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: Date.now() - startTime,
    };
  }
}
