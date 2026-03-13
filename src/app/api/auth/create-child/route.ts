import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES } from '@/lib/constants';

const CreateChildSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  dateOfBirth: z.string().min(1),
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

    const { fullName, username, password, dateOfBirth } = parsed.data;

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

    const email = `${username}@spellasaurus.internal`;

    const { data: authData, error: createAuthError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createAuthError) {
      if (
        createAuthError.message?.toLowerCase().includes('already registered') ||
        createAuthError.message?.toLowerCase().includes('already exists') ||
        createAuthError.message?.toLowerCase().includes('duplicate')
      ) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
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

    return NextResponse.json({ childId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in create-child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
