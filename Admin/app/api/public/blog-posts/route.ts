import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: cors });
}

export async function GET() {
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_BLOG_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: { property: 'Published', checkbox: { equals: true } },
          sorts: [{ property: 'Date', direction: 'descending' }],
          page_size: 5,
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { headers: cors });
    }

    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts = (data.results as any[]).map((page) => ({
      id: page.id,
      slug: (page.properties.Slug?.rich_text?.[0]?.plain_text ?? page.id).trim(),
      title: page.properties.Title?.title?.[0]?.plain_text ?? 'Untitled',
      summary: page.properties.Summary?.rich_text?.[0]?.plain_text ?? '',
      date: page.properties.Date?.date?.start ?? '',
      cover:
        page.properties.Cover?.files?.[0]?.file?.url ??
        page.properties.Cover?.files?.[0]?.external?.url ??
        page.cover?.external?.url ??
        page.cover?.file?.url ??
        null,
      category: page.properties.Category?.multi_select?.[0]?.name ?? null,
    }));

    return NextResponse.json({ results: posts }, { headers: cors });
  } catch {
    return NextResponse.json({ results: [] }, { headers: cors });
  }
}
