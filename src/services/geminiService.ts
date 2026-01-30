import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '../lib/supabase';
import type { InfographicConfig } from './infographicGenerator';

export const generateGeminiInfographic = async (config: InfographicConfig): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please configure VITE_GEMINI_API_KEY.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using the latest capable model. 
  // Note: "Gemini 3" isn't a standard public API model tag yet, 
  // so we use the most advanced 1.5 Pro or 2.0 Flash model available.
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `
    You are an expert graphic designer and SVG artist.
    Create a modern, stylish, professional SVG infographic for a hospital accreditation objective.
    
    Data:
    - Title: ${config.title}
    - Hindi Title: ${config.titleHindi || 'N/A'}
    - Objective Code: ${config.code}
    - Description: ${config.description}
    - Hindi Description: ${config.descriptionHindi || 'N/A'}
    - Hospital Name: ${config.hospitalName || 'Hospital'}
    - Key Points: ${config.keyPoints?.join(', ') || 'N/A'}

    Design Requirements:
    1. Output ONLY valid SVG code. No markdown code blocks, no text before or after.
    2. Dimensions: ${config.width || 800}x${config.height || 1100} (Portrait).
    3. Style: Modern, clean, professional healthcare aesthetic. Use gradients, soft shadows (using SVG filters), and rounded corners.
    4. Typography: Use sans-serif fonts (Segoe UI, Roboto, Open Sans). Ensure text is legible.
    5. Bilingual: Display English and Hindi text prominently and harmoniously.
    6. Icons: Include relevant medical/healthcare SVG icons inline where appropriate to make it visual.
    7. Color Scheme: Use a professional palette (Blues, Teals, Greens) unless "Core" (Red) or specific urgency is implied.
    8. Background: Subtle abstract pattern or soft gradient background.
    
    The SVG must be self-contained (no external image references). 
    Ensure all text is properly wrapped and does not overflow.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Cleanup markdown if present
    text = text.replace(/```svg/g, '').replace(/```/g, '').trim();
    
    // basic validation
    if (!text.startsWith('<svg')) {
       // If Gemini chatted a bit, try to find the SVG
       const svgStart = text.indexOf('<svg');
       const svgEnd = text.lastIndexOf('</svg>');
       if (svgStart !== -1 && svgEnd !== -1) {
         text = text.substring(svgStart, svgEnd + 6);
       } else {
         throw new Error('Gemini did not return valid SVG code.');
       }
    }

    return text;
  } catch (error) {
    console.error('Error generating Gemini infographic:', error);
    throw error;
  }
};
