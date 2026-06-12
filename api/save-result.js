// Vercel Serverless Function
// 環境変数: NOTION_TOKEN, NOTION_DATABASE_ID

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, typeName, clusterV, clusterS, clusterD, clusterC, penetration } = req.body;

  if (!email || !typeName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = process.env.NOTION_TOKEN;
  const dbId  = process.env.NOTION_DATABASE_ID;

  if (!token || !dbId) {
    console.error('Notion env vars not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const notionPayload = {
    parent: { database_id: dbId },
    properties: {
      'メールアドレス': {
        title: [{ text: { content: email } }],
      },
      '診断日時': {
        date: { start: new Date().toISOString() },
      },
      '判定タイプ': {
        rich_text: [{ text: { content: typeName } }],
      },
      'V（Vision）%': {
        number: clusterV,
      },
      'S（Structure）%': {
        number: clusterS,
      },
      'D（Drive）%': {
        number: clusterD,
      },
      'C（Care）%': {
        number: clusterC,
      },
      '浸透度サイン': {
        select: { name: penetration },
      },
    },
  };

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(notionPayload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Notion API error:', err);
      return res.status(502).json({ error: 'Notion API error' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Fetch error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
