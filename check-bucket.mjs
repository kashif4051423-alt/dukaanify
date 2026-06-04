#!/usr/bin/env node

/**
 * Quick script to check if Supabase bucket exists
 * Run with: node check-bucket.mjs
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '.env.local')

try {
  const envContent = readFileSync(envPath, 'utf-8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Checking Supabase Storage...\n')

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing environment variables!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_KEY ? '✓' : '✗')
    process.exit(1)
  }

  console.log('✅ Environment variables loaded')
  console.log('   URL:', SUPABASE_URL)
  console.log('   Key:', SUPABASE_KEY.substring(0, 20) + '...\n')

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  console.log('🔌 Connecting to Supabase...\n')

  // List all buckets
  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ Error listing buckets:', error.message)
    process.exit(1)
  }

  if (!buckets || buckets.length === 0) {
    console.log('⚠️  No storage buckets found!')
    console.log('\n📝 Action Required:')
    console.log('   1. Go to Supabase Dashboard')
    console.log('   2. Navigate to Storage > Buckets')
    console.log('   3. Create a new bucket named "product-images"')
    console.log('   4. Make it PUBLIC\n')
    console.log('   Dashboard URL:', SUPABASE_URL.replace('//', '//app.') + '/project/_/storage/buckets')
    process.exit(1)
  }

  console.log(`✅ Found ${buckets.length} bucket(s):\n`)

  buckets.forEach(bucket => {
    const isTarget = bucket.name === 'product-images'
    const icon = isTarget ? '🎯' : '📦'
    console.log(`${icon} ${bucket.name}`)
    console.log(`   ID: ${bucket.id}`)
    console.log(`   Public: ${bucket.public ? '✅ Yes' : '⚠️  No'}`)
    console.log(`   Created: ${bucket.created_at}`)
    console.log('')
  })

  // Check if product-images exists
  const productImagesBucket = buckets.find(b => b.name === 'product-images')

  if (!productImagesBucket) {
    console.log('❌ Bucket "product-images" NOT found!\n')
    console.log('📝 Action Required:')
    console.log('   Create a bucket named "product-images" in Supabase Dashboard')
    console.log('   Make sure it is PUBLIC\n')
    console.log('   Dashboard URL:', SUPABASE_URL.replace('//', '//app.') + '/project/_/storage/buckets')
    process.exit(1)
  }

  console.log('✅ Bucket "product-images" exists!')
  
  if (!productImagesBucket.public) {
    console.log('⚠️  WARNING: Bucket is NOT public!')
    console.log('   Public URLs will not work. Make the bucket public in Supabase Dashboard.')
  }

  console.log('\n✨ Everything looks good! Try uploading an image now.')
  console.log('   Test page: http://localhost:3000/test-storage\n')

} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
