import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Business {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

export interface BusinessWithLink extends Business {
  store_link: string;
}

/**
 * تمام active businesses کو Supabase سے fetch کریں
 */
export async function fetchActiveBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, owner_id')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch businesses: ${error.message}`);
  }

  return data || [];
}

/**
 * تمام active businesses کو store links کے ساتھ fetch کریں
 */
export async function fetchActiveBusinessesWithLinks(
  baseUrl: string = 'http://localhost:3000'
): Promise<BusinessWithLink[]> {
  const businesses = await fetchActiveBusinesses();

  return businesses.map((business) => ({
    ...business,
    store_link: `${baseUrl}/store/${business.slug}`,
  }));
}

/**
 * ایک specific business کو slug سے fetch کریں
 */
export async function fetchBusinessBySlug(slug: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, owner_id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch business: ${error.message}`);
  }

  return data;
}

/**
 * ایک specific business کو slug سے store link کے ساتھ fetch کریں
 */
export async function fetchBusinessBySlugWithLink(
  slug: string,
  baseUrl: string = 'http://localhost:3000'
): Promise<BusinessWithLink | null> {
  const business = await fetchBusinessBySlug(slug);

  if (!business) {
    return null;
  }

  return {
    ...business,
    store_link: `${baseUrl}/store/${business.slug}`,
  };
}

/**
 * ایک specific owner کی تمام active businesses fetch کریں
 */
export async function fetchBusinessesByOwner(
  ownerId: string,
  baseUrl: string = 'http://localhost:3000'
): Promise<BusinessWithLink[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, owner_id')
    .eq('owner_id', ownerId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch businesses: ${error.message}`);
  }

  return (data || []).map((business) => ({
    ...business,
    store_link: `${baseUrl}/store/${business.slug}`,
  }));
}
