import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase-front/types/database.types';

/**
 * Database helper functions for E2E tests
 */

// Create Supabase client with service role for tests
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create Supabase client with anon key (regular user)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Clean up test data (use with caution!)
 */
export async function cleanupTestData(email: string): Promise<void> {
  // Delete user's extractions
  await supabaseAdmin
    .from('extractions')
    .delete()
    .like('user_id', '%'); // Add proper filter based on email

  // Note: In production, you'd want to delete by specific test user IDs
}

/**
 * Create test user profile
 */
export async function createTestProfile(userId: string, email: string, fullName: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user subscription
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create test project
 */
export async function createTestProject(userId: string, name: string) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      user_id: userId,
      name,
      description: 'Test project created by E2E tests',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create test extraction
 */
export async function createTestExtraction(
  userId: string,
  projectId?: string
) {
  const { data, error } = await supabaseAdmin
    .from('extractions')
    .insert({
      user_id: userId,
      project_id: projectId || null,
      name: 'Test Extraction',
      query: 'test query',
      keywords: ['test'],
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Verify table exists and has expected structure
 */
export async function verifyTable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(0);

    return error === null;
  } catch {
    return false;
  }
}

/**
 * Count records in a table
 */
export async function countRecords(
  tableName: keyof Database['public']['Tables']
): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}
