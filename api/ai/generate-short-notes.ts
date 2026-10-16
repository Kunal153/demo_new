import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGenerateShortNotes } from '../_lib/aiHandler.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleGenerateShortNotes(body);
    return res.status(result.status).json(result.data);
  } catch (err: any) {
    console.error('Error in /api/ai/generate-short-notes:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
