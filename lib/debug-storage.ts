/**
 * Debug utility to diagnose Supabase Storage "Bucket not found" errors
 * 
 * Run this in your browser console or component to identify the issue
 */

import { createClient } from './supabase/client'

export interface DiagnosticResult {
  step: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

/**
 * Comprehensive diagnostic check for Supabase Storage
 */
export async function diagnoseStorageIssue(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = []

  // Step 1: Check environment variables
  console.log('🔍 Step 1: Checking environment variables...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    results.push({
      step: 'Environment Variables',
      status: 'error',
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
      details: {
        url: supabaseUrl ? '✓ Set' : '✗ Missing',
        key: supabaseKey ? '✓ Set' : '✗ Missing'
      }
    })
    return results
  }

  results.push({
    step: 'Environment Variables',
    status: 'success',
    message: 'Environment variables are set',
    details: {
      url: supabaseUrl,
      keyLength: supabaseKey.length,
      keyPrefix: supabaseKey.substring(0, 20) + '...'
    }
  })

  // Step 2: Check Supabase client initialization
  console.log('🔍 Step 2: Initializing Supabase client...')
  try {
    const supabase = createClient()
    results.push({
      step: 'Client Initialization',
      status: 'success',
      message: 'Supabase client created successfully'
    })

    // Step 3: Check authentication status
    console.log('🔍 Step 3: Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      results.push({
        step: 'Authentication',
        status: 'warning',
        message: 'Not authenticated',
        details: { error: authError.message }
      })
    } else if (!user) {
      results.push({
        step: 'Authentication',
        status: 'warning',
        message: 'No user logged in',
        details: { note: 'RLS policies may block uploads for unauthenticated users' }
      })
    } else {
      results.push({
        step: 'Authentication',
        status: 'success',
        message: 'User authenticated',
        details: {
          userId: user.id,
          email: user.email
        }
      })
    }

    // Step 4: List all available buckets
    console.log('🔍 Step 4: Listing all storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      results.push({
        step: 'List Buckets',
        status: 'error',
        message: 'Failed to list buckets',
        details: { error: bucketsError.message }
      })
    } else if (!buckets || buckets.length === 0) {
      results.push({
        step: 'List Buckets',
        status: 'error',
        message: 'No storage buckets found',
        details: { 
          note: 'You need to create the "product-images" bucket in Supabase Dashboard',
          url: `${supabaseUrl.replace('//', '//app.')}/project/_/storage/buckets`
        }
      })
    } else {
      const productImagesBucket = buckets.find(b => b.name === 'product-images')
      
      if (!productImagesBucket) {
        results.push({
          step: 'List Buckets',
          status: 'error',
          message: 'Bucket "product-images" NOT found',
          details: {
            availableBuckets: buckets.map(b => b.name),
            action: 'Create bucket named "product-images" in Supabase Dashboard',
            url: `${supabaseUrl.replace('//', '//app.')}/project/_/storage/buckets`
          }
        })
      } else {
        results.push({
          step: 'List Buckets',
          status: 'success',
          message: 'Bucket "product-images" found',
          details: {
            id: productImagesBucket.id,
            public: productImagesBucket.public,
            createdAt: productImagesBucket.created_at
          }
        })
      }
    }

    // Step 5: Try to upload a test file (only if authenticated and bucket exists)
    const productImagesBucket = buckets?.find(b => b.name === 'product-images')
    if (user && productImagesBucket) {
      console.log('🔍 Step 5: Testing file upload...')
      
      // Create a tiny test file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const testPath = `test-${Date.now()}.txt`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(testPath, testFile, { upsert: false })

      if (uploadError) {
        results.push({
          step: 'Test Upload',
          status: 'error',
          message: 'Test upload failed',
          details: {
            error: uploadError.message,
            possibleCauses: [
              'RLS policies blocking upload',
              'Bucket is not public',
              'User lacks permission'
            ]
          }
        })
      } else {
        results.push({
          step: 'Test Upload',
          status: 'success',
          message: 'Test upload successful',
          details: { path: uploadData.path }
        })

        // Clean up test file
        await supabase.storage.from('product-images').remove([testPath])
      }
    }

  } catch (error) {
    results.push({
      step: 'General Error',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }

  return results
}

/**
 * Print diagnostic results to console in a readable format
 */
export function printDiagnostics(results: DiagnosticResult[]) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUPABASE STORAGE DIAGNOSTICS')
  console.log('='.repeat(60) + '\n')

  results.forEach((result, index) => {
    const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️'
    console.log(`${icon} Step ${index + 1}: ${result.step}`)
    console.log(`   ${result.message}`)
    
    if (result.details) {
      console.log('   Details:', result.details)
    }
    console.log('')
  })

  console.log('='.repeat(60) + '\n')

  // Summary
  const errors = results.filter(r => r.status === 'error').length
  const warnings = results.filter(r => r.status === 'warning').length
  const successes = results.filter(r => r.status === 'success').length

  console.log('📈 Summary:')
  console.log(`   ✅ Success: ${successes}`)
  console.log(`   ⚠️  Warnings: ${warnings}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log('')

  if (errors > 0) {
    console.log('🔧 ACTION REQUIRED: Check the errors above and fix them.')
  } else if (warnings > 0) {
    console.log('⚠️  Some warnings detected, but should work.')
  } else {
    console.log('✨ Everything looks good!')
  }
}

/**
 * Run complete diagnostics and print results
 */
export async function runDiagnostics() {
  console.log('🚀 Starting Supabase Storage diagnostics...\n')
  const results = await diagnoseStorageIssue()
  printDiagnostics(results)
  return results
}

// Export for use in components or pages
export default runDiagnostics
