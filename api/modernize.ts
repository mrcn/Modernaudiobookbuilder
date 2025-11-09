import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Text Modernization API
 *
 * Proxies requests to Groq API (or OpenAI) to modernize text.
 * Keeps API keys secure on the server side.
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, style = 'conversational', returnDiff = false } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Check character limit
    if (text.length > 100000) {
      return res.status(413).json({
        error: 'Text too long',
        maxChars: 100000,
        currentChars: text.length
      });
    }

    // Get API key from environment
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      console.error('GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create modernization prompt
    const systemPrompt = `You are a text modernization assistant. Your job is to take archaic or old-fashioned text and rewrite it in modern, conversational English while preserving the original meaning and tone.

Rules:
- Replace archaic words (whilst → while, thou → you, hath → has, etc.)
- Simplify complex sentence structures
- Make the text more accessible to contemporary readers
- Maintain the author's voice and narrative style
- Keep the same length (don't summarize or expand)
- Return ONLY the modernized text, no explanations`;

    const userPrompt = `Modernize the following text in a ${style} style:\n\n${text}`;

    // Call Groq API (Llama 3.1 70B)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',  // Fast and cheap
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: Math.ceil(text.length * 1.5),  // Allow some expansion
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Groq API error:', error);
      return res.status(response.status).json({
        error: 'Text modernization failed',
        details: error
      });
    }

    const data = await response.json();
    const modernizedText = data.choices[0]?.message?.content || '';

    if (!modernizedText) {
      return res.status(500).json({ error: 'No text returned from API' });
    }

    // Optionally calculate diff (for UI highlighting)
    const result: {
      original: string;
      modernized: string;
      diff?: Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }>;
      stats: {
        originalLength: number;
        modernizedLength: number;
        changePercent: number;
      };
    } = {
      original: text,
      modernized: modernizedText,
      stats: {
        originalLength: text.length,
        modernizedLength: modernizedText.length,
        changePercent: Math.round(
          ((modernizedText.length - text.length) / text.length) * 100
        ),
      },
    };

    // Simple diff (optional - can be improved with a proper diff library)
    if (returnDiff) {
      result.diff = simpleDiff(text, modernizedText);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Modernization API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Simple word-level diff (can be replaced with a proper diff library like diff-match-patch)
 */
function simpleDiff(
  original: string,
  modernized: string
): Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> {
  const originalWords = original.split(/(\s+)/);
  const modernizedWords = modernized.split(/(\s+)/);
  const diff: Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> = [];

  const maxLength = Math.max(originalWords.length, modernizedWords.length);

  for (let i = 0; i < maxLength; i++) {
    const origWord = originalWords[i];
    const modWord = modernizedWords[i];

    if (origWord === modWord) {
      diff.push({ type: 'unchanged', text: origWord });
    } else if (!modWord) {
      diff.push({ type: 'removed', text: origWord });
    } else if (!origWord) {
      diff.push({ type: 'added', text: modWord });
    } else {
      diff.push({ type: 'removed', text: origWord });
      diff.push({ type: 'added', text: modWord });
    }
  }

  return diff;
}
