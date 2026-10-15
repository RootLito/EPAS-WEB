import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "@/types/user";

export const fetchClients = async (): Promise<UserProfile[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "client")
    .order("fullname", { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error.message);
    throw error;
  }

  return (data as UserProfile[]) || [];
};
