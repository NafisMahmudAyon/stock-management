import { supabase } from "@/components/createClient";

export async function verifyApiKey(apiKey) {
  console.log("first")
  console.log(apiKey)
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('api', apiKey)
        .single();

    return data && !error;
}
