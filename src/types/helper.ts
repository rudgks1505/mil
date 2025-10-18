import type { Database } from "./supabase";

type Public = Database["public"];

export type Tables<T extends keyof Public["Tables"]> =
    Public["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Public["Tables"]> =
    Public["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Public["Tables"]> =
    Public["Tables"][T]["Update"];