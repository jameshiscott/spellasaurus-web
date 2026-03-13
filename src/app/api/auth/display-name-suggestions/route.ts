import { NextRequest, NextResponse } from 'next/server';

const ADJECTIVES = [
  'Brave', 'Speedy', 'Mighty', 'Cosmic', 'Tiny', 'Golden', 'Silver', 'Crystal',
  'Dazzling', 'Epic', 'Fierce', 'Gentle', 'Happy', 'Jolly', 'Kind', 'Legendary',
  'Magic', 'Noble', 'Quirky', 'Royal',
];

const NOUNS = [
  'Raptor', 'Rex', 'Dino', 'Stomper', 'Chomper', 'Roarer', 'Sprinter', 'Explorer',
  'Champion', 'Hero', 'Wizard', 'Knight', 'Dragon', 'Phoenix', 'Comet', 'Star',
  'Flash', 'Bolt', 'Storm', 'Blaze',
];

const SUGGESTION_COUNT = 6;

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSuggestions(count: number): string[] {
  const suggestions: string[] = [];
  const seen = new Set<string>();

  // Limit iterations to avoid an infinite loop if word lists are small
  const maxAttempts = count * 10;
  let attempts = 0;

  while (suggestions.length < count && attempts < maxAttempts) {
    attempts++;
    const name = `${getRandomElement(ADJECTIVES)}${getRandomElement(NOUNS)}`;
    if (!seen.has(name)) {
      seen.add(name);
      suggestions.push(name);
    }
  }

  return suggestions;
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const suggestions = generateSuggestions(SUGGESTION_COUNT);
    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in display-name-suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
