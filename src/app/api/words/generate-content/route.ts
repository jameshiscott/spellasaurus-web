import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES } from '@/lib/constants';

const GenerateContentSchema = z.object({
  wordId: z.string().min(1),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = GenerateContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { wordId } = parsed.data;

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacherId = user.id;

    const serviceClient = createServiceClient();

    const { data: currentUser, error: profileError } = await serviceClient
      .from(TABLES.USERS)
      .select('role')
      .eq('id', teacherId)
      .single();

    if (profileError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTeacher = currentUser.role === USER_ROLES.TEACHER;
    const isParent = currentUser.role === USER_ROLES.PARENT;

    if (!isTeacher && !isParent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the word with its set info (using service client to bypass RLS)
    const { data: wordRow, error: wordError } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .select(`
        id,
        word,
        set_id,
        spelling_sets!inner(
          id,
          class_id,
          type,
          created_by
        )
      `)
      .eq('id', wordId)
      .single();

    if (wordError || !wordRow) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    // eslint-disable-next-line
    const spellingSet = (wordRow as any).spelling_sets;

    // Teachers: must be set creator OR own a class linked via junction table or legacy class_id
    // Parents: must be the creator of a personal set
    if (isTeacher) {
      let hasAccess = spellingSet?.created_by === teacherId;

      if (!hasAccess && spellingSet?.class_id) {
        // Legacy: class_id directly on the set
        const { data: legacyClass } = await serviceClient
          .from(TABLES.CLASSES)
          .select('teacher_id')
          .eq('id', spellingSet.class_id)
          .single();
        hasAccess = legacyClass?.teacher_id === teacherId;
      }

      if (!hasAccess) {
        // Junction table: check if the set is linked to any class the teacher owns
        // eslint-disable-next-line
        const { data: junctionRows } = await (serviceClient as any)
          .from(TABLES.CLASS_SPELLING_SETS)
          .select('class_id')
          .eq('set_id', spellingSet.id);

        if (junctionRows && junctionRows.length > 0) {
          const classIds = junctionRows.map((r: { class_id: string }) => r.class_id);
          const { data: teacherClasses } = await serviceClient
            .from(TABLES.CLASSES)
            .select('id')
            .in('id', classIds)
            .eq('teacher_id', teacherId);
          hasAccess = (teacherClasses?.length ?? 0) > 0;
        }
      }

      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden: you do not own this word' }, { status: 403 });
      }
    } else {
      if (spellingSet?.type !== 'personal' || spellingSet?.created_by !== teacherId) {
        return NextResponse.json({ error: 'Forbidden: you do not own this word' }, { status: 403 });
      }
    }

    const word: string = wordRow.word;

    // Generate definition and example sentence via OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a children\'s spelling assistant for a UK primary school. Always use British English spelling (e.g. colour, favourite, organise, travelled). Return JSON only.',
        },
        {
          role: 'user',
          content: `For the word "${word}": 1) Write a child-friendly definition (max 20 words) using British English spelling. Do NOT use the word "${word}" in the definition. 2) Write a simple example sentence for a UK primary school child using "${word}". Use British English spelling throughout. 3) Provide the same sentence with "${word}" replaced by "___". Return JSON: { "definition": "...", "sentence": "...", "sentenceWithBlank": "..." }`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const aiContent = JSON.parse(completion.choices[0].message.content ?? '{}') as {
      definition?: string;
      sentence?: string;
      sentenceWithBlank?: string;
    };

    // Generate TTS audio for the word (retry if silent)
    // Using gpt-4o-mini-tts with a British English voice
    const TTS_MODEL = 'gpt-4o-mini-tts' as const;
    const TTS_VOICE = 'coral' as const;
    const TTS_SPEED = 1.0;
    const TTS_INSTRUCTIONS = 'Speak with a clear, friendly British English accent. Pronounce the word clearly for a child learning to spell.';
    const MAX_TTS_ATTEMPTS = 3;
    let audioBuffer: Buffer | null = null;

    for (let attempt = 0; attempt < MAX_TTS_ATTEMPTS; attempt++) {
      const mp3 = await openai.audio.speech.create({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: word,
        speed: TTS_SPEED,
        instructions: TTS_INSTRUCTIONS,
      });
      const buf = Buffer.from(await mp3.arrayBuffer());
      if (hasAudioContent(buf)) {
        audioBuffer = buf;
        break;
      }
      console.warn(`TTS attempt ${attempt + 1} likely silent for "${word}" (${buf.length} bytes)`);
    }

    if (!audioBuffer) {
      // Last resort: add context to force speech
      const mp3 = await openai.audio.speech.create({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: `The word is: ${word}.`,
        speed: TTS_SPEED,
        instructions: TTS_INSTRUCTIONS,
      });
      audioBuffer = Buffer.from(await mp3.arrayBuffer());
    }

    // Upload MP3 to Supabase Storage
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

    // Get the public URL for the uploaded audio
    const { data: publicUrlData } = serviceClient.storage
      .from('audio')
      .getPublicUrl(storagePath);

    const audioUrl = publicUrlData.publicUrl;

    // Update the word record with AI-generated content
    const { data: updatedWord, error: updateError } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .update({
        ai_description: aiContent.definition ?? null,
        ai_example_sentence: aiContent.sentence ?? null,
        ai_sentence_with_blank: aiContent.sentenceWithBlank ?? null,
        audio_url: audioUrl,
        ai_generated_at: new Date().toISOString(),
      })
      .eq('id', wordId)
      .select()
      .single();

    if (updateError) {
      console.error('Word update error:', updateError);
      return NextResponse.json({ error: 'Failed to save generated content' }, { status: 500 });
    }

    return NextResponse.json(updatedWord, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in words/generate-content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Heuristic to detect if an MP3 buffer contains actual audio vs silence.
 * Checks the variance of byte values in the audio data portion.
 * Silent MP3 frames have very low byte diversity.
 */
function hasAudioContent(buf: Buffer): boolean {
  if (buf.length < 512) return false;
  const start = Math.min(256, Math.floor(buf.length * 0.1));
  const sampleSize = Math.min(2048, buf.length - start);
  const slice = buf.subarray(start, start + sampleSize);
  const seen = new Set<number>();
  for (let i = 0; i < slice.length; i++) {
    seen.add(slice[i]);
  }
  return seen.size > 40;
}
