import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES } from '@/lib/constants';

const CreateChildSchema = z.object({
  fullName: z.string().min(1),
  password: z.string().min(1),
  dateOfBirth: z.string().min(1),
  classId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = CreateChildSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fullName, password, dateOfBirth, classId } = parsed.data;

    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: parentUser, error: parentError } = await supabase
      .from(TABLES.USERS)
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (parentError || !parentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (parentUser.role !== USER_ROLES.PARENT) {
      return NextResponse.json({ error: 'Forbidden: parent role required' }, { status: 403 });
    }

    const serviceClient = await createServiceClient();

    // Auto-generate username from full name (e.g. "Alex Hiscott" → "alexhiscott")
    const baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername || 'child';
    let email = `${username}@spellasaurus.internal`;
    let suffix = 0;

    // Try to create the auth user, appending _N on conflict
    // eslint-disable-next-line
    let authData: any = null;
    // eslint-disable-next-line
    let createAuthError: any = null;

    for (let attempt = 0; attempt < 20; attempt++) {
      const result = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (!result.error) {
        authData = result.data;
        createAuthError = null;
        break;
      }

      const msg = result.error.message?.toLowerCase() ?? '';
      if (
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('duplicate')
      ) {
        suffix++;
        username = `${baseUsername}_${suffix}`;
        email = `${username}@spellasaurus.internal`;
        continue;
      }

      createAuthError = result.error;
      break;
    }

    if (createAuthError) {
      console.error('Auth user creation error:', createAuthError);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    const newUser = authData.user;
    if (!newUser) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    const { error: insertUserError } = await serviceClient
      .from(TABLES.USERS)
      .insert({
        id: newUser.id,
        role: USER_ROLES.CHILD,
        full_name: fullName,
        email,
        date_of_birth: dateOfBirth,
        onboarding_complete: false,
      });

    if (insertUserError) {
      // Attempt cleanup of the auth user we just created
      await serviceClient.auth.admin.deleteUser(newUser.id);
      console.error('Insert user error:', insertUserError);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    const { error: insertRelationError } = await serviceClient
      .from(TABLES.PARENT_CHILDREN)
      .insert({
        parent_id: session.user.id,
        child_id: newUser.id,
      });

    if (insertRelationError) {
      console.error('Insert parent_children error:', insertRelationError);
      return NextResponse.json({ error: 'Failed to link child to parent' }, { status: 500 });
    }

    // Optionally enrol the child in a class
    if (classId) {
      const { data: classData } = await serviceClient
        .from(TABLES.CLASSES)
        .select('school_id')
        .eq('id', classId)
        .single();

      if (classData) {
        await serviceClient
          .from(TABLES.CLASS_STUDENTS)
          .insert({
            class_id: classId,
            child_id: newUser.id,
            school_id: classData.school_id,
          });
      }
    }

    return NextResponse.json({ childId: newUser.id, username }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in create-child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
