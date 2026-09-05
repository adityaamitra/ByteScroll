import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { normalizeProgress, type LearnerProgress } from "@/lib/progress";

let browserClient: SupabaseClient | null = null;

export function cloudSyncConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getCloudClient(): SupabaseClient | null {
  if (!cloudSyncConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    );
  }
  return browserClient;
}

export async function loadCloudProgress(user: User): Promise<LearnerProgress | null> {
  const client = getCloudClient();
  if (!client) return null;

  const { data, error } = await client
    .from("learner_progress")
    .select("progress")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data?.progress ? normalizeProgress(data.progress as Partial<LearnerProgress>) : null;
}

export async function saveCloudProgress(user: User, progress: LearnerProgress): Promise<void> {
  const client = getCloudClient();
  if (!client) return;

  const { error } = await client.from("learner_progress").upsert({
    user_id: user.id,
    progress,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export type { User };
