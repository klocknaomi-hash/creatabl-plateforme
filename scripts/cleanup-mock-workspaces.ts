import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

async function cleanupMockWorkspaces() {
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Error: NEON_DATABASE_URL / DATABASE_URL is missing in environment.')
    process.exit(1)
  }

  const sql = neon(databaseUrl)
  console.log('Starting cleanup of mock workspaces and orphan test data...')

  try {
    // 0. Ensure organization_id column exists on business tables
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS organization_id TEXT;`
    await sql`ALTER TABLE social_accounts ADD COLUMN IF NOT EXISTS organization_id TEXT;`
    await sql`ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS organization_id TEXT;`
    await sql`ALTER TABLE auto_reply_rules ADD COLUMN IF NOT EXISTS organization_id TEXT;`
    console.log('Verified organization_id columns exist on business tables.')

    // 1. Delete workspace members linked to mock workspaces
    const deletedMembers = await sql`
      DELETE FROM workspace_members
      WHERE workspace_id IN (
        SELECT id FROM workspaces
        WHERE name ILIKE '%L''Oréal%' OR name ILIKE '%Loreal%' OR name ILIKE '%Client%'
      )
      RETURNING id;
    `
    console.log(`Deleted ${deletedMembers.length} workspace member(s) from mock workspaces.`)

    // 2. Delete mock "Client L'Oréal" or test entries from workspaces table
    const mockWorkspaces = await sql`
      DELETE FROM workspaces
      WHERE name ILIKE '%L''Oréal%' OR name ILIKE '%Loreal%' OR name ILIKE '%Client%'
      RETURNING id, name;
    `
    console.log(`Deleted ${mockWorkspaces.length} mock workspace(s):`, mockWorkspaces)

    // 3. Check for orphan posts with test org reference
    const orphanPosts = await sql`
      DELETE FROM posts
      WHERE organization_id IS NOT NULL AND organization_id LIKE 'test_%'
      RETURNING id;
    `
    console.log(`Deleted ${orphanPosts.length} orphan test post(s).`)

    // 4. Check for orphan social accounts with test org reference
    const orphanAccounts = await sql`
      DELETE FROM social_accounts
      WHERE organization_id IS NOT NULL AND organization_id LIKE 'test_%'
      RETURNING id;
    `
    console.log(`Deleted ${orphanAccounts.length} orphan test social account(s).`)

    console.log('Cleanup completed successfully!')
  } catch (error: any) {
    console.error('Error during cleanup:', error.message || error)
  }
}

cleanupMockWorkspaces().catch(console.error)
