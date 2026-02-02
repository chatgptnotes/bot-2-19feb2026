import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get Claude API key
export const getClaudeApiKey = () => {
  return import.meta.env.VITE_CLAUDE_API_KEY || '';
};

// Helper function to get Gemini API key (for direct frontend calls)
export const getGeminiApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Call our secure backend proxy for Gemini API
export const callGeminiAPI = async (prompt: string, temperature = 0.7, maxOutputTokens = 8192) => {
  const response = await fetch('/api/generate-evidence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      temperature,
      maxOutputTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate evidence');
  }

  return response.json();
};
