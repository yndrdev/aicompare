/**
 * Database Types
 *
 * These types should be regenerated after schema changes:
 * npx supabase gen types typescript --local > src/types/database.ts
 *
 * For now, this is a manual definition matching our SCHEMA.md
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      forms: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          original_name: string;
          file_size: number;
          storage_path: string;
          mime_type: string;
          page_count: number | null;
          metadata: Json;
          status: "uploaded" | "processing" | "completed" | "error";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          filename: string;
          original_name: string;
          file_size: number;
          storage_path: string;
          mime_type?: string;
          page_count?: number | null;
          metadata?: Json;
          status?: "uploaded" | "processing" | "completed" | "error";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          original_name?: string;
          file_size?: number;
          storage_path?: string;
          mime_type?: string;
          page_count?: number | null;
          metadata?: Json;
          status?: "uploaded" | "processing" | "completed" | "error";
          created_at?: string;
          updated_at?: string;
        };
      };
      models: {
        Row: {
          id: string;
          provider: string;
          model_id: string;
          display_name: string;
          input_cost_per_1k: number;
          output_cost_per_1k: number;
          context_window: number | null;
          supports_vision: boolean;
          supports_json_mode: boolean;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          model_id: string;
          display_name: string;
          input_cost_per_1k: number;
          output_cost_per_1k: number;
          context_window?: number | null;
          supports_vision?: boolean;
          supports_json_mode?: boolean;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          model_id?: string;
          display_name?: string;
          input_cost_per_1k?: number;
          output_cost_per_1k?: number;
          context_window?: number | null;
          supports_vision?: boolean;
          supports_json_mode?: boolean;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      benchmark_runs: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          description: string | null;
          status:
            | "pending"
            | "running"
            | "completed"
            | "failed"
            | "cancelled";
          total_forms: number;
          processed_forms: number;
          total_models: number;
          total_cost: number;
          started_at: string | null;
          completed_at: string | null;
          error_message: string | null;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name?: string | null;
          description?: string | null;
          status?:
            | "pending"
            | "running"
            | "completed"
            | "failed"
            | "cancelled";
          total_forms?: number;
          processed_forms?: number;
          total_models?: number;
          total_cost?: number;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          description?: string | null;
          status?:
            | "pending"
            | "running"
            | "completed"
            | "failed"
            | "cancelled";
          total_forms?: number;
          processed_forms?: number;
          total_models?: number;
          total_cost?: number;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      extraction_results: {
        Row: {
          id: string;
          benchmark_run_id: string;
          form_id: string;
          model_id: string;
          status: "pending" | "processing" | "success" | "error";
          structured_output: Json | null;
          freeform_output: string | null;
          raw_response: Json | null;
          latency_ms: number | null;
          input_tokens: number | null;
          output_tokens: number | null;
          total_tokens: number | null;
          cost: number | null;
          accuracy_score: number | null;
          field_matches: number | null;
          field_mismatches: number | null;
          missing_fields: number | null;
          extra_fields: number | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          benchmark_run_id: string;
          form_id: string;
          model_id: string;
          status?: "pending" | "processing" | "success" | "error";
          structured_output?: Json | null;
          freeform_output?: string | null;
          raw_response?: Json | null;
          latency_ms?: number | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          cost?: number | null;
          accuracy_score?: number | null;
          field_matches?: number | null;
          field_mismatches?: number | null;
          missing_fields?: number | null;
          extra_fields?: number | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          benchmark_run_id?: string;
          form_id?: string;
          model_id?: string;
          status?: "pending" | "processing" | "success" | "error";
          structured_output?: Json | null;
          freeform_output?: string | null;
          raw_response?: Json | null;
          latency_ms?: number | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          cost?: number | null;
          accuracy_score?: number | null;
          field_matches?: number | null;
          field_mismatches?: number | null;
          missing_fields?: number | null;
          extra_fields?: number | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cost_logs: {
        Row: {
          id: string;
          user_id: string;
          extraction_result_id: string;
          model_id: string;
          provider: string;
          input_tokens: number;
          output_tokens: number;
          input_cost: number;
          output_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          extraction_result_id: string;
          model_id: string;
          provider: string;
          input_tokens: number;
          output_tokens: number;
          input_cost: number;
          output_cost: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          extraction_result_id?: string;
          model_id?: string;
          provider?: string;
          input_tokens?: number;
          output_tokens?: number;
          input_cost?: number;
          output_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience type aliases
export type User = Tables<"users">;
export type Form = Tables<"forms">;
export type Model = Tables<"models">;
export type BenchmarkRun = Tables<"benchmark_runs">;
export type ExtractionResult = Tables<"extraction_results">;
export type CostLog = Tables<"cost_logs">;
