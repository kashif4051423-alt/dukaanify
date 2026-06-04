import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env.local');

dotenv.config({ path: envPath });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchActiveBusinesses() {
  try {
    console.log('🔄 Fetching active businesses from Supabase...\n');

    // Fetch all active businesses
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, slug, owner_id')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching businesses:', error.message);
      process.exit(1);
    }

    if (!businesses || businesses.length === 0) {
      console.log('⚠️  کوئی active business نہیں ملا');
      process.exit(0);
    }

    // Generate store links
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const businessLinks = businesses.map((business) => ({
      id: business.id,
      name: business.name,
      slug: business.slug,
      owner_id: business.owner_id,
      store_link: `${appUrl}/store/${business.slug}`,
    }));

    // Display results
    console.log(`✅ کل ${businesses.length} active businesses ملے:\n`);
    console.log('═'.repeat(80));

    businessLinks.forEach((business, index) => {
      console.log(`\n${index + 1}. ${business.name}`);
      console.log(`   ID: ${business.id}`);
      console.log(`   Slug: ${business.slug}`);
      console.log(`   Owner ID: ${business.owner_id}`);
      console.log(`   Store Link: ${business.store_link}`);
    });

    console.log('\n' + '═'.repeat(80));

    // Export as JSON
    const jsonOutput = {
      timestamp: new Date().toISOString(),
      total_count: businessLinks.length,
      businesses: businessLinks,
    };

    console.log('\n📋 JSON Format:\n');
    console.log(JSON.stringify(jsonOutput, null, 2));

    // Export as CSV
    console.log('\n📊 CSV Format:\n');
    console.log('ID,Name,Slug,Owner ID,Store Link');
    businessLinks.forEach((business) => {
      console.log(
        `"${business.id}","${business.name}","${business.slug}","${business.owner_id}","${business.store_link}"`
      );
    });

    // Export as Markdown table
    console.log('\n📄 Markdown Table:\n');
    console.log('| # | Name | Slug | Store Link |');
    console.log('|---|------|------|-----------|');
    businessLinks.forEach((business, index) => {
      console.log(
        `| ${index + 1} | ${business.name} | ${business.slug} | [Link](${business.store_link}) |`
      );
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
fetchActiveBusinesses();
