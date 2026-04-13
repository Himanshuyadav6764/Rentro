import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  title: z.string().trim().min(2).max(120),
  count: z.number().int().min(1).max(50).optional(),
});

const TITLE_STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'for',
  'and',
  'of',
  'with',
  'to',
  'in',
  'on',
  'at',
  'by',
  'or',
]);

function trimToWordLimit(text: string, limit: number) {
  const words = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  return words.slice(0, limit).join(' ');
}

function getTitleKeywords(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !TITLE_STOP_WORDS.has(word));
}

function isRelevantToTitle(description: string, title: string) {
  const keywords = getTitleKeywords(title);
  if (!keywords.length) return true;

  const normalizedDescription = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return keywords.some((keyword) => normalizedDescription.includes(keyword));
}

function buildFallbackDescription(title: string) {
  const normalized = title.toLowerCase();

  if (/(mobile|phone|smartphone|iphone)/.test(normalized)) {
    return `${title} is in good condition and works smoothly. I am not using it much now, so renting it out.`;
  }

  if (/(laptop|notebook|macbook|computer)/.test(normalized)) {
    return `${title} runs well and is in good condition. I use it less now, so offering it on rent.`;
  }

  if (/(book|notes|calculator|academic)/.test(normalized)) {
    return `${title} is clean and useful for students. I do not need it currently, so giving it on rent.`;
  }

  return `${title} is in good condition and works properly. I am not using it regularly, so renting it out.`;
}

function buildDescriptionVariants(title: string, count: number) {
  const intros = [
    `${title} good condition me hai`,
    `${title} bilkul sahi chal raha hai`,
    `${title} maintained condition me available hai`,
    `${title} clean and working state me hai`,
    `${title} ready to use condition me hai`,
  ];

  const reasons = [
    'main isse ab regular use nahi kar pa raha',
    'ab mera is par daily use nahi bacha',
    'filhal yeh item unused pada hai',
    'abhi mujhe iski frequent zarurat nahi hai',
    'extra item hone ki wajah se use kam ho raha hai',
  ];

  const audiences = [
    'students ke liye kaafi useful rahega',
    'college projects aur classes ke liye perfect hai',
    'daily study/work needs ke liye fit hai',
    'hostel aur campus use ke liye best hai',
  ];

  const endings = [
    'isliye rent par de raha hoon.',
    'isliye rental ke liye list kiya hai.',
    'toh better use ke liye rent pe de raha hoon.',
    'isliye short-term rent ke liye available hai.',
  ];

  const suggestions: string[] = [];

  for (const intro of intros) {
    for (const reason of reasons) {
      for (const audience of audiences) {
        for (const ending of endings) {
          const candidate = trimToWordLimit(`${intro}, ${reason}, ${audience}, ${ending}`, 20);
          if (!suggestions.includes(candidate)) {
            suggestions.push(candidate);
          }
          if (suggestions.length >= count) {
            return suggestions;
          }
        }
      }
    }
  }

  while (suggestions.length < count) {
    const fallback = trimToWordLimit(buildFallbackDescription(title), 20);
    suggestions.push(fallback);
  }

  return suggestions;
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const requestedCount = payload.count ?? 1;

    if (requestedCount > 1) {
      const suggestions = buildDescriptionVariants(payload.title, requestedCount);
      return NextResponse.json({
        success: true,
        description: suggestions[0],
        suggestions,
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const completionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 80,
        messages: [
          {
            role: 'system',
            content:
              'You write rental listing descriptions in first-person owner voice. Keep it about the exact title item only. Mention good condition and that owner is renting because item is underused. Output one plain sentence, no quotes, maximum 20 words.',
          },
          {
            role: 'user',
            content: `Title: ${payload.title}\nRules: Make it feel like owner is posting this item for rent. Include underuse reason naturally. No unrelated context.`,
          },
        ],
      }),
    });

    const completionData = (await completionResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!completionResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: completionData.error?.message || 'Failed to generate description',
        },
        { status: 500 }
      );
    }

    const rawText = completionData.choices?.[0]?.message?.content?.trim() || '';
    if (!rawText) {
      return NextResponse.json(
        { success: false, error: 'AI returned empty description' },
        { status: 500 }
      );
    }

    const cleaned = rawText.replace(/^['"`]+|['"`]+$/g, '').trim();
    const description = trimToWordLimit(cleaned, 20);
    const finalDescription = isRelevantToTitle(description, payload.title)
      ? description
      : trimToWordLimit(buildFallbackDescription(payload.title), 20);

    return NextResponse.json({ success: true, description: finalDescription });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Description generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
