const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iprvwdsniwmspdmewzbs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcnZ3ZHNuaXdtc3BkbWV3emJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3Mjc4NywiZXhwIjoyMDkzMDQ4Nzg3fQ.FyrEbbUizcqsJA08gEB5eM3EfX7iDolBzW7S0-sUcyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getStores() {
  try {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, slug, owner_id, is_active')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (!businesses || businesses.length === 0) {
      console.log('⚠️  کوئی active business نہیں ملا');
      return;
    }

    console.log(`\n✅ کل ${businesses.length} active businesses ملے:\n`);
    console.log('═'.repeat(100));

    businesses.forEach((business, index) => {
      const storeLink = `http://localhost:3000/store/${business.slug}`;
      console.log(`\n${index + 1}. ${business.name}`);
      console.log(`   📍 Slug: ${business.slug}`);
      console.log(`   🔗 Store Link: ${storeLink}`);
      console.log(`   👤 Owner ID: ${business.owner_id}`);
    });

    console.log('\n' + '═'.repeat(100));
    console.log('\n📋 CSV Format:\n');
    console.log('Name,Slug,Store Link');
    businesses.forEach((business) => {
      const storeLink = `http://localhost:3000/store/${business.slug}`;
      console.log(`"${business.name}","${business.slug}","${storeLink}"`);
    });

    console.log('\n' + '═'.repeat(100));
    console.log('\n📄 Markdown Table:\n');
    console.log('| # | Store Name | Store Link |');
    console.log('|---|-----------|-----------|');
    businesses.forEach((business, index) => {
      const storeLink = `http://localhost:3000/store/${business.slug}`;
      console.log(`| ${index + 1} | ${business.name} | [Click Here](${storeLink}) |`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getStores();
