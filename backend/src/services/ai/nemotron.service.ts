import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../../config';

// ─────────────────────────────────────────────────────────────────────────────
// NEMOTRON SERVICE
// Uses NVIDIA Nemotron via Nebius Token Factory
// API is OpenAI-compatible, so we use the openai SDK with a custom base URL.
// ─────────────────────────────────────────────────────────────────────────────

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!config.nebius.isConfigured) {
    throw new Error('NEBIUS_API_KEY is not configured');
  }
  if (!client) {
    client = new OpenAI({
      apiKey: config.nebius.apiKey,
      baseURL: config.nebius.baseUrl,
    });
  }
  return client;
}

// ─── Response Schema ──────────────────────────────────────────────────────────

const RecommendationItemSchema = z.object({
  name: z.string(),
  wardrobeItemIds: z.array(z.string()),
  occasion: z.string(),
  colorPalette: z.array(z.string()),
  explanation: z.string(),
  stylingTips: z.array(z.string()),
});

const RecommendationResponseSchema = z.object({
  recommendations: z.array(RecommendationItemSchema).min(1).max(5),
});

export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

// ─── Wardrobe Context ─────────────────────────────────────────────────────────

export interface WardrobeContext {
  items: Array<{
    id: string;
    name: string;
    category: string;
    subcategory?: string | null;
    dominantColor?: string | null;
    pattern?: string | null;
    brand?: string | null;
    size?: string | null;
    fit?: string | null;
    season?: string | null;
    tags: string[];
  }>;
  userPreferences: {
    occasion: string;
    formality?: string | null;
    weatherPreference?: string | null;
    stylePreferences?: string[];
    colorPreferences?: string[];
    avoidColors?: string[];
    comfortPriority?: number | null;
  };
}

// ─── Main Recommendation Function ────────────────────────────────────────────

export async function generateOutfitRecommendations(
  context: WardrobeContext,
  validItemIds: Set<string>
): Promise<RecommendationResponse> {
  if (!config.nebius.isConfigured) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const ai = getClient();

  const systemPrompt = `You are OOTD-Nan's expert fashion stylist. Your job is to create outfit recommendations from the user's actual wardrobe items.

RULES:
1. ONLY use wardrobeItemIds from the provided wardrobe list — never invent IDs.
2. Return ONLY valid JSON matching the specified schema.
3. Each outfit must include 2-6 items covering appropriate clothing slots.
4. Recommendations must suit the occasion, preferences, and weather.
5. Explain WHY each combination works stylistically.
6. Color palette should reflect actual item colors.
7. Make recommendations practical and genuinely wearable.`;

  const userPrompt = `Generate outfit recommendations for this user.

WARDROBE ITEMS:
${JSON.stringify(context.items, null, 2)}

USER REQUEST:
${JSON.stringify(context.userPreferences, null, 2)}

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "name": "Outfit name",
      "wardrobeItemIds": ["actual-item-id-1", "actual-item-id-2"],
      "occasion": "occasion type",
      "colorPalette": ["#hexcolor1", "#hexcolor2"],
      "explanation": "Why this outfit works",
      "stylingTips": ["Tip 1", "Tip 2"]
    }
  ]
}

Generate 2-3 distinct outfit combinations. Return ONLY the JSON, no other text.`;

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.chat.completions.create({
        model: config.nebius.modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Empty response from AI model');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        throw new Error(`AI returned invalid JSON: ${rawContent.substring(0, 200)}`);
      }

      const validated = RecommendationResponseSchema.safeParse(parsed);
      if (!validated.success) {
        throw new Error(`AI response failed schema validation: ${validated.error.message}`);
      }

      // Security: validate that all returned IDs are owned by the user
      const sanitized = validated.data.recommendations.map((rec) => ({
        ...rec,
        wardrobeItemIds: rec.wardrobeItemIds.filter((id) => validItemIds.has(id)),
      })).filter((rec) => rec.wardrobeItemIds.length >= 2);

      if (sanitized.length === 0) {
        throw new Error('AI returned no valid outfit combinations with owned items');
      }

      return { recommendations: sanitized };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        // Wait before retry: 1s, 2s
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        console.warn(`[Nemotron] Attempt ${attempt + 1} failed, retrying...`);
      }
    }
  }

  throw lastError ?? new Error('AI recommendation failed after retries');
}

export function getAiStatus(): { configured: boolean; model: string; provider: string } {
  return {
    configured: config.nebius.isConfigured,
    model: config.nebius.modelId,
    provider: 'Nebius (NVIDIA Nemotron)',
  };
}
