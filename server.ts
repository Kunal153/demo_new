import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  handleSolveDoubt,
  handleSuggestQuestions,
  handleGenerateQuiz,
  handleGenerateShortNotes
} from './api/_lib/aiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const portFromArgs = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
  const PORT = portFromArgs || Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Solve Doubt API endpoint
  app.post('/api/ai/solve-doubt', async (req, res) => {
    try {
      const result = await handleSolveDoubt(req.body);
      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error('API /api/ai/solve-doubt error:', err);
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  });

  // Suggest Questions API endpoint
  app.post('/api/ai/suggest-questions', async (req, res) => {
    try {
      const result = await handleSuggestQuestions(req.body);
      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error('API /api/ai/suggest-questions error:', err);
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  });

  // Generate Quiz MCQs API endpoint
  app.post('/api/ai/generate-quiz', async (req, res) => {
    try {
      const result = await handleGenerateQuiz(req.body);
      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error('API /api/ai/generate-quiz error:', err);
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  });

  // Generate Short Notes API endpoint
  app.post('/api/ai/generate-short-notes', async (req, res) => {
    try {
      const result = await handleGenerateShortNotes(req.body);
      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error('API /api/ai/generate-short-notes error:', err);
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EngiNotes server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
