import { fetchActiveBusinessesWithLinks } from '@/lib/supabase/businesses';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/businesses/active
 * تمام active businesses کو store links کے ساتھ واپس کریں
 *
 * Query Parameters:
 * - format: 'json' (default), 'csv', 'markdown'
 * - baseUrl: custom base URL for store links (default: NEXT_PUBLIC_APP_URL)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    const baseUrl =
      searchParams.get('baseUrl') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fetch businesses with links
    const businesses = await fetchActiveBusinessesWithLinks(baseUrl);

    if (format === 'csv') {
      // CSV format
      const csvContent = [
        'ID,Name,Slug,Owner ID,Store Link',
        ...businesses.map(
          (b) => `"${b.id}","${b.name}","${b.slug}","${b.owner_id}","${b.store_link}"`
        ),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="businesses.csv"',
        },
      });
    }

    if (format === 'markdown') {
      // Markdown table format
      const markdownContent = [
        '# Active Businesses\n',
        `Generated: ${new Date().toISOString()}\n`,
        `Total: ${businesses.length}\n\n`,
        '| # | Name | Slug | Store Link |',
        '|---|------|------|-----------|',
        ...businesses.map(
          (b, i) => `| ${i + 1} | ${b.name} | ${b.slug} | [Link](${b.store_link}) |`
        ),
      ].join('\n');

      return new NextResponse(markdownContent, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': 'attachment; filename="businesses.md"',
        },
      });
    }

    // Default JSON format
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      total_count: businesses.length,
      businesses,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching active businesses:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
