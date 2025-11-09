import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Text-to-Speech API
 *
 * Proxies requests to OpenAI TTS API to keep API keys secure.
 * Returns audio as a downloadable file or URL.
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
    const { text, voice = 'alloy', format = 'mp3', speed = 1.0 } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Check character limit (50,000 chars = ~$0.75)
    if (text.length > 50000) {
      return res.status(413).json({
        error: 'Text too long',
        maxChars: 50000,
        currentChars: text.length
      });
    }

    // Validate voice
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({
        error: 'Invalid voice',
        validVoices
      });
    }

    // Get OpenAI API key from environment
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',  // Use tts-1-hd for higher quality ($30/1M chars)
        input: text,
        voice: voice,
        response_format: format,
        speed: speed,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({
        error: 'TTS generation failed',
        details: error
      });
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const audioBytes = Buffer.from(audioBuffer);

    // Set appropriate headers
    res.setHeader('Content-Type', `audio/${format}`);
    res.setHeader('Content-Length', audioBytes.length);
    res.setHeader('Content-Disposition', `attachment; filename="audio.${format}"`);

    // Return audio file
    return res.status(200).send(audioBytes);

  } catch (error) {
    console.error('TTS API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
