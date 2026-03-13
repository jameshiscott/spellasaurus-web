import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import GamePlayer from '@/components/child/GamePlayer';

export const dynamic = 'force-dynamic';

interface GamePageProps {
  params: Promise<{ gameSlug: string }>;
}

export default async function ArcadeGamePage({ params }: GamePageProps) {
  const { gameSlug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch game by slug
  const { data: game } = await supabase
    .from(TABLES.ARCADE_GAMES)
    .select('id, slug, name')
    .eq('slug', gameSlug)
    .eq('is_active', true)
    .single();

  if (!game) redirect('/child/arcade');

  // Verify the child has unlocked this game
  const { data: unlock } = await supabase
    .from(TABLES.ARCADE_UNLOCKS)
    .select('id')
    .eq('child_id', user.id)
    .eq('game_id', game.id)
    .limit(1);

  if (!unlock || unlock.length === 0) {
    redirect('/child/arcade');
  }

  return <GamePlayer slug={game.slug} name={game.name} />;
}
