import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from(TABLES.USERS)
    .select('coin_balance')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ coinBalance: data?.coin_balance ?? 0 });
}
