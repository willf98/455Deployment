import { createClient as supabaseCreateClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const createClient = () => supabaseCreateClient(supabaseUrl, supabaseKey);
