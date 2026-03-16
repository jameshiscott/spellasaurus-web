import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';

const Schema = z.object({
  wordId: z.string().min(1),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Voices to cycle through on retry — sometimes a different voice avoids the silent bug
const VOICES: Array<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = [
  'alloy',
  'echo',
  'nova',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { wordId } = parsed.data;

    // Auth check — any logged-in user can request regeneration
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Fetch the word
    const { data: wordRow, error: wordError } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .select('id, word')
      .eq('id', wordId)
      .single();

    if (wordError || !wordRow) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    const word: string = wordRow.word;

    // Try up to 3 voices — different voices sometimes avoid the silent audio bug
    const MAX_ATTEMPTS = 3;
    let audioBuffer: Buffer | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const voice = VOICES[attempt % VOICES.length];
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice,
        input: `${word}`,
      });

      const buf = Buffer.from(await mp3.arrayBuffer());

      // Quick silence heuristic: check if audio data bytes have variance
      // Silent MP3 frames tend to have very low entropy in the audio portion
      if (hasAudioContent(buf)) {
        audioBuffer = buf;
        break;
      }

      console.warn(
        `TTS regenerate attempt ${attempt + 1} (voice=${voice}) likely silent for "${word}" (${buf.length} bytes)`
      );
    }

    if (!audioBuffer) {
      // Last resort: try with more context to force speech output
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: `The word is: ${word}.`,
      });
      audioBuffer = Buffer.from(await mp3.arrayBuffer());
    }

    // Upload new audio
    const storagePath = `words/${wordId}.mp3`;
    const { error: uploadError } = await serviceClient.storage
      .from('audio')
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
    }

    // Get fresh public URL (with cache-busting timestamp)
    const { data: publicUrlData } = serviceClient.storage
      .from('audio')
      .getPublicUrl(storagePath);

    const audioUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    // Update word record
    await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .update({ audio_url: audioUrl })
      .eq('id', wordId);

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Regenerate audio error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Heuristic to detect if an MP3 buffer contains actual audio vs silence.
 * Checks the variance of byte values in the audio data portion (skip first 256
 * bytes which are headers/metadata). Silent MP3 frames have very low variance.
 */
function hasAudioContent(buf: Buffer): boolean {
  if (buf.length < 512) return false;

  // Sample bytes from the audio data portion
  const start = Math.min(256, Math.floor(buf.length * 0.1));
  const sampleSize = Math.min(2048, buf.length - start);
  const slice = buf.subarray(start, start + sampleSize);

  // Count distinct byte values — real audio has high variety, silence doesn't
  const seen = new Set<number>();
  for (let i = 0; i < slice.length; i++) {
    seen.add(slice[i]);
  }

  // Silent MP3s typically have fewer than 30 distinct byte values in audio frames
  // Real speech audio typically has 100+ distinct values
  return seen.size > 40;
}
