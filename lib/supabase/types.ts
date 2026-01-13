/**
 * Database type definitions generated from Supabase schema.
 * 
 * This file should be regenerated when the database schema changes.
 * For now, it provides a minimal type-safe interface.
 * 
 * To generate types:
 *   npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
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
      // Schema will be defined when database is set up
      // This is a placeholder to maintain type safety
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
