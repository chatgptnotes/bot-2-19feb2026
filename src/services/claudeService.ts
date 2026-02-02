import Anthropic from '@anthropic-ai/sdk';
import { getClaudeApiKey } from '../lib/supabase';
import type { InfographicConfig } from './infographicGenerator';

export const generateClaudeInfographic = async (config: InfographicConfig): Promise<string> => {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    throw new Error('Claude API key is missing. Please configure VITE_CLAUDE_API_KEY.');
  }

  // Anthropic SDK usually requires server-side usage, but we can try client-side if "dangerouslyAllowBrowser" is true
  // or we can use a direct fetch if the SDK complains.
  // For safety in this demo, we'll try direct fetch to the API if SDK fails or just standard fetch to avoid large SDK bundle issues if not needed.
  // Actually, the project has @anthropic-ai/sdk, let's use it but with the browser flag.

  const anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true 
  });

  const prompt = `
    You are an expert graphic designer and SVG artist.
    Create a modern, stylish, professional SVG infographic for a hospital accreditation objective.
    
    Data:
    - Title: ${config.title}
    - Objective Code: ${config.code}
    - Description: ${config.description}
    - Hospital Name: ${config.hospitalName || 'Hospital'}
    - Key Points: ${config.keyPoints?.join(', ') || 'N/A'}

    CRITICAL REQUIREMENTS:
    1. **BILINGUAL (English + Hindi)**: You MUST translate the Title, Description, and all Key Points into Hindi. Display English text prominently, with Hindi translation immediately below or beside it for every section.
    2. **VISUAL FLOW**: Break down the Description/Key Points into a clear Step-by-Step flow or Process Diagram. Use arrows or dotted lines to connect steps.
    3. **ICONS**: You MUST include embedded SVG path icons for every step (e.g., documents, safety shield, doctor, patient, hygiene, checklist). Do not use external images; draw the icons with <path> tags.

    Design Specifications:
    - Output ONLY valid SVG code.
    - Dimensions: ${config.width || 800}x${config.height || 1200} (Portrait).
    - Style: Modern, clean, flat design with gradients and soft shadows (using SVG defs/filters).
    - Color Palette: Professional Healthcare (Teals, Blues, Clean Greens). Use 'Red' only for "Core" compliance alerts.
    - Typography: Use standard sans-serif fonts (Arial, Roboto, Segoe UI). Ensure text is readable.
    
    Structure:
    - **Header**: Hospital Name (Bilingual), Objective Code (Badge style).
    - **Main Title**: Bilingual Title.
    - **Visual Body**: 3-5 distinct steps/cards showing the process or requirements. Each card must have an Icon + English Text + Hindi Text.
    - **Footer**: Compliance tagline in English & Hindi.
  `;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (msg.content[0] as any).text;
    
    // Extract SVG
    const svgStart = text.indexOf('<svg');
    const svgEnd = text.lastIndexOf('</svg>');
    
    if (svgStart !== -1 && svgEnd !== -1) {
      return text.substring(svgStart, svgEnd + 6);
    } else {
      throw new Error('Claude did not return valid SVG code.');
    }

  } catch (error) {
    console.error('Error generating Claude infographic:', error);
    throw error;
  }
};
