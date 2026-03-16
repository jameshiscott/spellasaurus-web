import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES, ARCADE_STARTING_LIVES } from '@/lib/constants';
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

  const serviceClient = createServiceClient();

  // Fetch game by slug
  const { data: game } = await serviceClient
    .from(TABLES.ARCADE_GAMES)
    .select('id, slug, name')
    .eq('slug', gameSlug)
    .eq('is_active', true)
    .single();

  if (!game) redirect('/child/arcade');

  // Verify the child has unlocked this game
  const { data: unlock } = await serviceClient
    .from(TABLES.ARCADE_UNLOCKS)
    .select('id')
    .eq('child_id', user.id)
    .eq('game_id', game.id)
    .limit(1);

  if (!unlock || unlock.length === 0) {
    redirect('/child/arcade');
  }

  // Fetch lives (or create initial row)
  // eslint-disable-next-line
  const { data: livesRow } = await (serviceClient as any)
    .from(TABLES.ARCADE_GAME_LIVES)
    .select('lives_remaining')
    .eq('child_id', user.id)
    .eq('game_id', game.id)
    .maybeSingle();

  let lives: number;
  if (livesRow) {
    lives = livesRow.lives_remaining;
  } else {
    // First time — create row with starting lives
    // eslint-disable-next-line
    await (serviceClient as any).from(TABLES.ARCADE_GAME_LIVES).insert({
      child_id: user.id,
      game_id: game.id,
      lives_remaining: ARCADE_STARTING_LIVES,
    });
    lives = ARCADE_STARTING_LIVES;
  }

  return (
    <GamePlayer
      slug={game.slug}
      name={game.name}
      gameId={game.id}
      initialLives={lives}
    />
  );
}
