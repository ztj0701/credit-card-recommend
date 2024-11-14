import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Simplified CORS configuration since we're serving from same origin
const allowedOrigins = ['https://taupe-speculoos-17b460.netlify.app'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // 如果你需要在请求中使用凭证（如cookies）
};

app.use(cors(corsOptions));
app.use(express.json());



// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: message }],
        model: 'gpt-4',
      });

      if (!completion.choices || completion.choices.length === 0) {
        return res.status(500).json({ error: 'OpenAI 没有回复' });
      }

      res.json({ reply: completion.choices[0].message.content });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      return res.status(500).json({ error: 'OpenAI 没有回复' });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// ... existing code ...

const PORT = process.env.PORT || 8080; // 修改端口配置
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
