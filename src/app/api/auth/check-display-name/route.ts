import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES } from '@/lib/constants';

const CheckDisplayNameSchema = z.object({
  displayName: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = CheckDisplayNameSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { displayName } = parsed.data;

    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentUser, error: userError } = await supabase
      .from(TABLES.USERS)
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== USER_ROLES.CHILD) {
      return NextResponse.json({ error: 'Forbidden: child role required' }, { status: 403 });
    }

    const { data: existing, error: queryError } = await supabase
      .from(TABLES.USERS)
      .select('id')
      .ilike('display_name', displayName)
      .limit(1);

    if (queryError) {
      console.error('Display name check error:', queryError);
      return NextResponse.json({ error: 'Failed to check display name' }, { status: 500 });
    }

    const available = !existing || existing.length === 0;

    return NextResponse.json({ available }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in check-display-name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
