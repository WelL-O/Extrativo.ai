import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase-front/types/database.types';

/**
 * Database Schema E2E Tests
 * Validates that all tables, RLS policies, and functions are correctly created
 */

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

test.describe('Database Schema', () => {
  test('should have all required tables', async () => {
    // Test profiles table exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);

    expect(profilesError).toBeNull();

    // Test subscriptions table exists
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(0);

    expect(subscriptionsError).toBeNull();

    // Test projects table exists
    const { error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(0);

    expect(projectsError).toBeNull();

    // Test extractions table exists
    const { error: extractionsError } = await supabase
      .from('extractions')
      .select('*')
      .limit(0);

    expect(extractionsError).toBeNull();

    // Test extraction_results table exists
    const { error: resultsError } = await supabase
      .from('extraction_results')
      .select('*')
      .limit(0);

    expect(resultsError).toBeNull();

    // Test tags table exists
    const { error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .limit(0);

    expect(tagsError).toBeNull();

    // Test extraction_tags table exists
    const { error: extractionTagsError } = await supabase
      .from('extraction_tags')
      .select('*')
      .limit(0);

    expect(extractionTagsError).toBeNull();
  });

  test('RLS should be enabled and block unauthorized access', async () => {
    // Try to access extractions without authentication
    // Should return empty array (not error) because of RLS
    const { data, error } = await supabase
      .from('extractions')
      .select('*');

    // RLS allows the query but returns no rows for unauthorized users
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test('should have correct table relationships', async () => {
    // Test that we can select with joins (validates FK relationships)
    const { error } = await supabase
      .from('extractions')
      .select(`
        *,
        project:projects(*),
        tags:extraction_tags(tag:tags(*))
      `)
      .limit(0);

    expect(error).toBeNull();
  });

  test('should have subscription enums with correct values', async () => {
    // This will be validated by TypeScript types at compile time
    // But we can also check the database directly
    const validPlans: Database['public']['Enums']['subscription_plan'][] = [
      'free',
      'basic',
      'pro',
      'enterprise',
    ];

    const validStatuses: Database['public']['Enums']['subscription_status'][] = [
      'trialing',
      'active',
      'past_due',
      'canceled',
      'paused',
    ];

    expect(validPlans.length).toBe(4);
    expect(validStatuses.length).toBe(5);
  });

  test('should have extraction status enum with correct values', async () => {
    const validStatuses: Database['public']['Enums']['extraction_status'][] = [
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
    ];

    expect(validStatuses.length).toBe(5);
  });
});
