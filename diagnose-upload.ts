/**
 * Upload Diagnostic Script
 * 
 * Run this in your browser console to diagnose upload issues.
 * Copy the entire file content and paste into console.
 */

async function diagnoseUpload(businessId: string) {
  console.log('🔍 DUKAANIFY UPLOAD DIAGNOSTIC')
  console.log('================================')
  console.log('')

  const results: any = {
    environment: {},
    authentication: {},
    storage: {},
    business: {},
    policies: {},
    upload: {}
  }

  try {
    // @ts-ignore
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // 1. Environment Check
    console.log('1️⃣ ENVIRONMENT')
    console.log('   Checking environment variables...')
    
    results.environment.url = process.env.NEXT_PUBLIC_SUPABASE_URL
    results.environment.hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('   ✓ Supabase URL:', results.environment.url)
    console.log('   ✓ Has Anon Key:', results.environment.hasKey)
    console.log('')

    // 2. Authentication Check
    console.log('2️⃣ AUTHENTICATION')
    console.log('   Checking user session...')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    results.authentication.userId = user?.id
    results.authentication.email = user?.email
    results.authentication.isAuthenticated = !!user
    results.authentication.error = authError?.message
    
    if (user) {
      console.log('   ✓ User ID:', user.id)
      console.log('   ✓ Email:', user.email)
    } else {
      console.log('   ✗ NOT AUTHENTICATED')
      console.log('   Error:', authError?.message)
    }
    console.log('')

    // 3. Storage Check
    console.log('3️⃣ STORAGE')
    console.log('   Checking buckets...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    results.storage.buckets = buckets?.map(b => b.name) || []
    results.storage.hasProductImages = buckets?.some(b => b.name === 'product-images')
    results.storage.error = bucketsError?.message
    
    if (bucketsError) {
      console.log('   ✗ Error listing buckets:', bucketsError.message)
    } else {
      console.log('   ✓ Available buckets:', buckets?.map(b => b.name).join(', '))
      console.log('   ✓ Has product-images?', results.storage.hasProductImages ? 'YES' : 'NO')
    }
    
    if (results.storage.hasProductImages) {
      console.log('   Checking bucket contents...')
      const { data: files, error: listError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 5 })
      
      results.storage.canList = !listError
      results.storage.fileCount = files?.length || 0
      
      if (listError) {
        console.log('   ✗ Cannot list files:', listError.message)
      } else {
        console.log('   ✓ Can list files')
        console.log('   ✓ Files found:', files?.length || 0)
      }
    }
    console.log('')

    // 4. Business Check
    console.log('4️⃣ BUSINESS')
    console.log('   Checking business ID:', businessId)
    
    if (!businessId) {
      console.log('   ✗ No business ID provided')
      results.business.error = 'No business ID provided'
    } else {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, owner_id')
        .eq('id', businessId)
        .single()
      
      results.business.exists = !!business
      results.business.name = business?.name
      results.business.ownerId = business?.owner_id
      results.business.isOwner = business?.owner_id === user?.id
      results.business.error = businessError?.message
      
      if (businessError) {
        console.log('   ✗ Business not found:', businessError.message)
      } else {
        console.log('   ✓ Business exists:', business?.name)
        console.log('   ✓ Owner ID:', business?.owner_id)
        console.log('   ✓ You own this business?', business?.owner_id === user?.id ? 'YES' : 'NO')
      }
    }
    console.log('')

    // 5. RLS Policies Check
    console.log('5️⃣ RLS POLICIES')
    console.log('   Checking storage policies...')
    
    // Try a test upload to check policies
    const testBlob = new Blob(['test'], { type: 'text/plain' })
    const testPath = `${businessId}/test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testPath, testBlob)
    
    results.policies.canUpload = !uploadError
    results.policies.error = uploadError?.message
    
    if (uploadError) {
      console.log('   ✗ Cannot upload:', uploadError.message)
      
      if (uploadError.message.includes('row-level security')) {
        console.log('   → RLS policy is blocking the upload')
        console.log('   → Check: User authentication, business ownership')
      } else if (uploadError.message.includes('Bucket not found')) {
        console.log('   → Bucket "product-images" does not exist')
      }
    } else {
      console.log('   ✓ Can upload to storage')
      console.log('   ✓ Test file uploaded:', uploadData?.path)
      
      // Clean up test file
      await supabase.storage
        .from('product-images')
        .remove([testPath])
      console.log('   ✓ Test file cleaned up')
    }
    console.log('')

    // 6. Image Upload Test
    console.log('6️⃣ IMAGE UPLOAD')
    console.log('   Testing uploadProductImage function...')
    
    try {
      // @ts-ignore
      const { uploadProductImage } = await import('@/lib/uploadImage')
      
      const imageBlob = new Blob(['fake image'], { type: 'image/jpeg' })
      const imageFile = new File([imageBlob], 'test.jpg', { type: 'image/jpeg' })
      
      const url = await uploadProductImage(imageFile, businessId)
      results.upload.success = true
      results.upload.url = url
      
      console.log('   ✓ Upload successful!')
      console.log('   ✓ Image URL:', url)
      
      // Clean up
      // @ts-ignore
      const { deleteProductImage } = await import('@/lib/uploadImage')
      await deleteProductImage(url)
      console.log('   ✓ Test image cleaned up')
    } catch (error: any) {
      results.upload.success = false
      results.upload.error = error?.message || String(error)
      
      console.log('   ✗ Upload failed:', error?.message || String(error))
    }
    console.log('')

    // Summary
    console.log('📊 SUMMARY')
    console.log('================================')
    
    const issues: string[] = []
    
    if (!results.environment.url) issues.push('Missing NEXT_PUBLIC_SUPABASE_URL')
    if (!results.environment.hasKey) issues.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (!results.authentication.isAuthenticated) issues.push('User not authenticated')
    if (!results.storage.hasProductImages) issues.push('Bucket "product-images" not found')
    if (!results.storage.canList) issues.push('Cannot list bucket files')
    if (!results.business.exists) issues.push('Business not found')
    if (results.business.exists && !results.business.isOwner) issues.push('User does not own business')
    if (!results.policies.canUpload) issues.push('RLS policy blocking upload')
    if (!results.upload.success) issues.push('Image upload function failed')
    
    if (issues.length === 0) {
      console.log('✅ ALL CHECKS PASSED')
      console.log('Your upload setup is working correctly!')
    } else {
      console.log('❌ ISSUES FOUND:')
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`)
      })
      console.log('')
      console.log('📖 See UPLOAD_DEBUG_GUIDE.md for solutions')
    }
    console.log('')

    // Return results for further inspection
    console.log('📋 Full Results:')
    console.log(results)
    
    return results
  } catch (error: any) {
    console.error('💥 DIAGNOSTIC ERROR:', error)
    return { error: error.message }
  }
}

// Usage instructions
console.log('📌 HOW TO USE:')
console.log('   diagnoseUpload("your-business-id-here")')
console.log('')
console.log('   Example:')
console.log('   diagnoseUpload("550e8400-e29b-41d4-a716-446655440000")')
console.log('')
