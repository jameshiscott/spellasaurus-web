import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import Link from 'next/link';
import ArcadeLobby from '@/components/child/ArcadeLobby';

export const dynamic = 'force-dynamic';

export default async function ArcadePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch game catalogue
  const { data: games } = await supabase
    .from(TABLES.ARCADE_GAMES)
    .select('id, slug, name, description, thumbnail_url, price_coins')
    .eq('is_active', true)
    .order('sort_order');

  // Fetch this child's unlocks
  const { data: unlocks } = await supabase
    .from(TABLES.ARCADE_UNLOCKS)
    .select('game_id')
    .eq('child_id', user!.id);

  // Fetch coin balance
  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select('coin_balance')
    .eq('id', user!.id)
    .single();

  const unlockedGameIds = new Set(unlocks?.map((u) => u.game_id) ?? []);
  const coinBalance = (profile?.coin_balance as number) ?? 0;

  const gamesWithStatus = (games ?? []).map((game) => ({
    ...game,
    unlocked: unlockedGameIds.has(game.id),
  }));

  return (
    <div className="pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Arcade</h1>
        <Link href="/child" className="text-sm font-bold text-brand-500 hover:underline">
          ← Back
        </Link>
      </div>

      {/* Coin balance */}
      <div className="bg-warning/20 rounded-2xl px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">🪙</span>
        <div>
          <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Your Coins</p>
          <p className="text-xl font-black text-yellow-800">{coinBalance}</p>
        </div>
      </div>

      <ArcadeLobby games={gamesWithStatus} coinBalance={coinBalance} />
    </div>
  );
}
