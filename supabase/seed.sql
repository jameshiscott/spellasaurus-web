-- =============================================================================
-- Seed Data – Local Development Only
-- Spellasaurus – spelling practice app
--
-- Populates the shop catalogue with sample items covering all equipment slots.
-- =============================================================================

INSERT INTO shop_items (id, name, description, category, slot, price_coins, rarity, asset_url, is_active, sort_order)
VALUES
  -- Hats (head slot)
  (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Party Hat',
    'A bright, pointy party hat with polka dots. Perfect for celebrations!',
    'hats',
    'head',
    50,
    'common',
    '/shop/hats/party-hat.png',
    TRUE,
    10
  ),
  (
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Wizard Hat',
    'A tall, star-covered wizard hat that makes you look super smart.',
    'hats',
    'head',
    150,
    'rare',
    '/shop/hats/wizard-hat.png',
    TRUE,
    20
  ),

  -- Body items (body slot)
  (
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Rainbow Cape',
    'A flowing cape with all the colours of the rainbow.',
    'outfits',
    'body',
    100,
    'common',
    '/shop/body/rainbow-cape.png',
    TRUE,
    30
  ),
  (
    'a1b2c3d4-0004-0000-0000-000000000004',
    'Space Suit',
    'A shiny silver space suit ready for intergalactic spelling adventures.',
    'outfits',
    'body',
    250,
    'epic',
    '/shop/body/space-suit.png',
    TRUE,
    40
  ),

  -- Glasses (eyes slot)
  (
    'a1b2c3d4-0005-0000-0000-000000000005',
    'Star Glasses',
    'Sparkly star-shaped glasses that make reading words extra fun.',
    'accessories',
    'eyes',
    75,
    'common',
    '/shop/eyes/star-glasses.png',
    TRUE,
    50
  ),

  -- Background
  (
    'a1b2c3d4-0006-0000-0000-000000000006',
    'Enchanted Forest',
    'A magical forest background with glowing mushrooms and fireflies.',
    'backgrounds',
    'background',
    200,
    'rare',
    '/shop/backgrounds/enchanted-forest.png',
    TRUE,
    60
  ),

  -- Accessories
  (
    'a1b2c3d4-0007-0000-0000-000000000007',
    'Golden Wand',
    'A glittering golden wand to wave when you spell a word correctly.',
    'accessories',
    'handheld',
    120,
    'rare',
    '/shop/handheld/golden-wand.png',
    TRUE,
    70
  ),
  (
    'a1b2c3d4-0008-0000-0000-000000000008',
    'Champion Medal',
    'A legendary gold medal awarded only to the greatest spellers.',
    'accessories',
    'accessory',
    300,
    'legendary',
    '/shop/accessory/champion-medal.png',
    TRUE,
    80
  );
