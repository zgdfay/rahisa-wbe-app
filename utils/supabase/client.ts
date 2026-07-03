import { createClient as createBrowserClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase client keys are not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)");
}

export const supabaseClient: SupabaseClient = createBrowserClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export async function getOrInsertProductId(supabase: SupabaseClient, productName: string): Promise<string | null> {
  if (!productName) return null;
  const nameTrimmed = productName.trim();

  // Try lookup
  const { data: existing } = await supabase
    .from("produk")
    .select("id_produk")
    .ilike("nama_produk", nameTrimmed)
    .limit(1)
    .maybeSingle();

  if (existing?.id_produk) {
    return existing.id_produk;
  }

  // Insert if not found
  const { data: inserted, error } = await supabase
    .from("produk")
    .insert({ nama_produk: nameTrimmed, kategori: "Bakery" })
    .select("id_produk")
    .maybeSingle();

  if (error) {
    console.error("Error inserting product:", error);
    return null;
  }
  return inserted?.id_produk || null;
}

export default supabaseClient;
 