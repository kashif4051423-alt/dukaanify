/**
 * Bucket Diagnostic Script
 * 
 * Add this to your upload function temporarily to debug the issue.
 * Or run in browser console to check connection.
 */

import { createClient } from './supabase/client'

export async function diagnoseBucket() {
  console.log('🔍 BUCKET DIAGNOSTIC')
  console.log('===================')
  console.log('')

  try {
    // 1. Check environment variables
    console.log('1️⃣ ENVIRONMENT VARIABLES:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('   Has NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('   ❌ NEXT_PUBLIC_SUPABASE_URL is missing!')
      return
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
      return
    }
    console.log('   ✓ Environment variables are set')
    console.log('')

    // 2. Create client
    console.log('2️⃣ SUPABASE CLIENT:')
    const supabase = createClient()
    console.log('   ✓ Client created')
    console.log('')

    // 3. Check authentication
    console.log('3️⃣ AUTHENTICATION:')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('   ❌ Auth error:', authError.message)
    } else if (!user) {
      console.warn('   ⚠️  No user authenticated')
    } else {
      console.log('   ✓ User authenticated:', user.email)
    }
    console.log('')

    // 4. List all buckets
    console.log('4️⃣ AVAILABLE BUCKETS:')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('   ❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    if (!buckets || buckets.length === 0) {
      console.warn('   ⚠️  No buckets found!')
      console.log('   → Go to Supabase Dashboard → Storage → Create bucket')
    } else {
      console.log('   ✓ Found', buckets.length, 'bucket(s):')
      buckets.forEach(bucket => {
        console.log(`     - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`)
      })
    }
    console.log('')

    // 5. Check if product-images bucket exists
    console.log('5️⃣ PRODUCT-IMAGES BUCKET:')
    const productImagesBucket = buckets?.find(b => b.name === 'product-images')
    
    if (!productImagesBucket) {
      console.error('   ❌ Bucket "product-images" NOT FOUND!')
      console.log('   → Create it in Supabase Dashboard:')
      console.log('     1. Go to Storage')
      console.log('     2. Click "New Bucket"')
      console.log('     3. Name: product-images')
      console.log('     4. Make it Public')
      console.log('     5. Click Create')
    } else {
      console.log('   ✓ Bucket "product-images" exists')
      console.log('   ✓ Public:', productImagesBucket.public)
      
      if (!productImagesBucket.public) {
        console.warn('   ⚠️  Bucket is PRIVATE! Make it PUBLIC for images to display.')
      }
    }
    console.log('')

    // 6. Test bucket access
    if (productImagesBucket) {
      console.log('6️⃣ BUCKET ACCESS TEST:')
      
      // Try to list files
      const { data: files, error: listError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 1 })
      
      if (listError) {
        console.error('   ❌ Cannot access bucket:', listError.message)
        console.log('   → Check RLS policies in Supabase')
      } else {
        console.log('   ✓ Can access bucket')
        console.log('   ✓ Files in root:', files?.length || 0)
      }
    }
    console.log('')

    // 7. Summary
    console.log('📊 SUMMARY:')
    console.log('===================')
    
    const issues: string[] = []
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) issues.push('Missing SUPABASE_URL')
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) issues.push('Missing ANON_KEY')
    if (!productImagesBucket) issues.push('Bucket "product-images" not found')
    if (productImagesBucket && !productImagesBucket.public) issues.push('Bucket is not public')
    
    if (issues.length === 0) {
      console.log('✅ Everything looks good!')
    } else {
      console.log('❌ Issues found:')
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`)
      })
    }
    console.log('')

  } catch (error) {
    console.error('💥 DIAGNOSTIC ERROR:', error)
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('To run diagnostic, call: diagnoseBucket()')
}
