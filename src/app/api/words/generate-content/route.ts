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

    const { data: currentUser, error: profileError } = await supabase
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

    // Use service client to fetch the word — bypasses RLS so this works for
    // both teachers (whose students' RLS is complex) and parents (who can only
    // read words assigned to their children, not words in their own personal lists).
    // Ownership is verified manually in code immediately after.
    const serviceClient = createServiceClient();
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
          created_by,
          classes(
            id,
            teacher_id
          )
        )
      `)
      .eq('id', wordId)
      .single();

    if (wordError || !wordRow) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    const spellingSet = (wordRow as any).spelling_sets;

    // Teachers: must own the class; Parents: must own the personal set
    if (isTeacher) {
      const owningClass = spellingSet?.classes;
      if (!owningClass || owningClass.teacher_id !== teacherId) {
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
          content: 'You are a children\'s spelling assistant. Return JSON only.',
        },
        {
          role: 'user',
          content: `For the word "${word}": 1) Write a child-friendly definition (max 20 words). Do NOT use the word "${word}" in the definition. 2) Write a simple example sentence for a primary school child using "${word}". 3) Provide the same sentence with "${word}" replaced by "___". Return JSON: { "definition": "...", "sentence": "...", "sentenceWithBlank": "..." }`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const aiContent = JSON.parse(completion.choices[0].message.content ?? '{}') as {
      definition?: string;
      sentence?: string;
      sentenceWithBlank?: string;
    };

    // Generate TTS audio for the word
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: word,
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());

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
