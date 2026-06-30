/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

export function NotionBlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <>
      {blocks.map((block) => {
        const { type, id } = block;
        const value = block[type];
        const text = value?.rich_text?.map((t: any) => t.plain_text).join('') ?? '';

        switch (type) {
          case 'paragraph':
            return <p key={id} style={{ marginBottom: 20 }}>{text}</p>;
          case 'heading_1':
            return <h2 key={id} style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36,
              fontWeight: 600, margin: '40px 0 16px' }}>{text}</h2>;
          case 'heading_2':
            return <h3 key={id} style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28,
              fontWeight: 600, margin: '32px 0 12px' }}>{text}</h3>;
          case 'heading_3':
            return <h4 key={id} style={{ fontSize: 18, fontWeight: 700,
              margin: '24px 0 8px', letterSpacing: '0.05em' }}>{text}</h4>;
          case 'bulleted_list_item':
            return <li key={id} style={{ marginBottom: 8, marginLeft: 20 }}>{text}</li>;
          case 'numbered_list_item':
            return <li key={id} style={{ marginBottom: 8, marginLeft: 20 }}>{text}</li>;
          case 'quote':
            return <blockquote key={id} style={{ borderLeft: '3px solid var(--ruby)',
              paddingLeft: 20, fontStyle: 'italic', color: 'var(--text-2)',
              margin: '24px 0' }}>{text}</blockquote>;
          case 'divider':
            return <hr key={id} style={{ border: 'none', borderTop: '1px solid var(--cream-3)',
              margin: '32px 0' }} />;
          case 'image': {
            const src = value?.external?.url ?? value?.file?.url;
            return src ? <img key={id} src={src} alt=""
              style={{ width: '100%', borderRadius: 2, margin: '24px 0' }} /> : null;
          }
          default:
            return null;
        }
      })}
    </>
  );
}
