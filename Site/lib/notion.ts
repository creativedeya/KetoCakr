import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY!,
});

const DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID!;

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  cover: string | null;
  published: boolean;
  category: string | null;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.results.map((page: any) => ({
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
      published: page.properties.Published?.checkbox ?? false,
      category: page.properties.Category?.multi_select?.[0]?.name ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPageBlocks(pageId: string) {
  const response = await notion.blocks.children.list({ block_id: pageId });
  return response.results;
}
