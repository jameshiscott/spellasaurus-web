-- =============================================================================
-- Seed shop_items for production
-- Uses ON CONFLICT to be idempotent (safe to re-run)
-- =============================================================================

INSERT INTO shop_items (id, name, description, category, slot, price_coins, rarity, asset_url, is_active, sort_order)
VALUES
  -- Hats (head slot)
  ('a1b2c3d4-0001-0000-0000-000000000001', 'Party Hat', 'A bright, pointy party hat with polka dots. Perfect for celebrations!', 'hats', 'head', 50, 'common', '/shop/hats/party-hat.png', TRUE, 10),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'Wizard Hat', 'A tall, star-covered wizard hat that makes you look super smart.', 'hats', 'head', 150, 'rare', '/shop/hats/wizard-hat.png', TRUE, 20),
  ('a1b2c3d4-0009-0000-0000-000000000009', 'Crown', 'A golden crown fit for a spelling king or queen!', 'hats', 'head', 175, 'rare', '/shop/hats/crown.png', TRUE, 90),
  ('a1b2c3d4-0010-0000-0000-000000000010', 'Pirate Hat', 'Ahoy! A fearsome pirate hat with a skull and crossbones.', 'hats', 'head', 100, 'rare', '/shop/hats/pirate-hat.png', TRUE, 100),
  ('a1b2c3d4-0011-0000-0000-000000000011', 'Viking Helmet', 'A mighty horned helmet for brave spelling warriors.', 'hats', 'head', 200, 'rare', '/shop/hats/viking-helmet.png', TRUE, 110),
  ('a1b2c3d4-0012-0000-0000-000000000012', 'Flower Crown', 'A pretty crown made of colourful flowers. Smells lovely!', 'hats', 'head', 50, 'common', '/shop/hats/flower-crown.png', TRUE, 120),
  ('a1b2c3d4-0013-0000-0000-000000000013', 'Top Hat', 'A tall, fancy top hat that makes you look very distinguished.', 'hats', 'head', 120, 'rare', '/shop/hats/top-hat.png', TRUE, 130),
  ('a1b2c3d4-0014-0000-0000-000000000014', 'Baseball Cap', 'A cool baseball cap with a letter S for Spellasaurus!', 'hats', 'head', 35, 'common', '/shop/hats/baseball-cap.png', TRUE, 140),
  ('a1b2c3d4-0015-0000-0000-000000000015', 'Chef Hat', 'A tall white chef hat. Time to cook up some perfect spellings!', 'hats', 'head', 60, 'common', '/shop/hats/chef-hat.png', TRUE, 150),
  ('a1b2c3d4-0016-0000-0000-000000000016', 'Santa Hat', 'Ho ho ho! A jolly red and white hat for the festive season.', 'hats', 'head', 75, 'common', '/shop/hats/santa-hat.png', TRUE, 160),
  ('a1b2c3d4-0017-0000-0000-000000000017', 'Tiara', 'A sparkling silver tiara with pink and blue gems.', 'hats', 'head', 250, 'epic', '/shop/hats/tiara.png', TRUE, 170),
  ('a1b2c3d4-0018-0000-0000-000000000018', 'Unicorn Horn', 'A magical rainbow unicorn horn. So majestic!', 'hats', 'head', 300, 'epic', '/shop/hats/unicorn-horn.png', TRUE, 180),

  -- Body items
  ('a1b2c3d4-0003-0000-0000-000000000003', 'Rainbow Cape', 'A flowing cape with all the colours of the rainbow.', 'outfits', 'body', 100, 'common', '/shop/body/rainbow-cape.png', TRUE, 30),
  ('a1b2c3d4-0004-0000-0000-000000000004', 'Space Suit', 'A shiny silver space suit ready for intergalactic spelling adventures.', 'outfits', 'body', 250, 'epic', '/shop/body/space-suit.png', TRUE, 40),
  ('a1b2c3d4-0019-0000-0000-000000000019', 'Knight Armour', 'Shiny silver armour to protect you on your spelling quest.', 'outfits', 'body', 200, 'rare', '/shop/body/knight-armour.png', TRUE, 190),
  ('a1b2c3d4-0020-0000-0000-000000000020', 'Superhero Cape', 'A bright red cape with a lightning bolt. Spelling superhero!', 'outfits', 'body', 150, 'rare', '/shop/body/superhero-cape.png', TRUE, 200),
  ('a1b2c3d4-0021-0000-0000-000000000021', 'Hawaiian Shirt', 'A colourful tropical shirt covered in flowers. Aloha!', 'outfits', 'body', 50, 'common', '/shop/body/hawaiian-shirt.png', TRUE, 210),
  ('a1b2c3d4-0022-0000-0000-000000000022', 'Lab Coat', 'A white lab coat for science-loving spellers.', 'outfits', 'body', 75, 'common', '/shop/body/lab-coat.png', TRUE, 220),
  ('a1b2c3d4-0023-0000-0000-000000000023', 'Princess Dress', 'A beautiful pink princess dress with sparkly details.', 'outfits', 'body', 300, 'epic', '/shop/body/princess-dress.png', TRUE, 230),
  ('a1b2c3d4-0024-0000-0000-000000000024', 'Ninja Outfit', 'A stealthy dark ninja outfit. Silent but deadly at spelling!', 'outfits', 'body', 175, 'rare', '/shop/body/ninja-outfit.png', TRUE, 240),
  ('a1b2c3d4-0025-0000-0000-000000000025', 'Football Kit', 'A sporty blue football kit with number 10. Goal!', 'outfits', 'body', 60, 'common', '/shop/body/football-kit.png', TRUE, 250),
  ('a1b2c3d4-0026-0000-0000-000000000026', 'Scuba Suit', 'A deep-sea diving suit for underwater spelling adventures.', 'outfits', 'body', 225, 'epic', '/shop/body/scuba-suit.png', TRUE, 260),

  -- Eyes items
  ('a1b2c3d4-0005-0000-0000-000000000005', 'Star Glasses', 'Sparkly star-shaped glasses that make reading words extra fun.', 'accessories', 'eyes', 75, 'common', '/shop/eyes/star-glasses.png', TRUE, 50),
  ('a1b2c3d4-0027-0000-0000-000000000027', 'Heart Glasses', 'Adorable heart-shaped glasses. You will love spelling!', 'accessories', 'eyes', 50, 'common', '/shop/eyes/heart-glasses.png', TRUE, 270),
  ('a1b2c3d4-0028-0000-0000-000000000028', 'Monocle', 'A fancy golden monocle. Very posh indeed!', 'accessories', 'eyes', 120, 'rare', '/shop/eyes/monocle.png', TRUE, 280),
  ('a1b2c3d4-0029-0000-0000-000000000029', '3D Glasses', 'Red and blue 3D glasses. Words pop right out!', 'accessories', 'eyes', 40, 'common', '/shop/eyes/3d-glasses.png', TRUE, 290),
  ('a1b2c3d4-0030-0000-0000-000000000030', 'Aviator Goggles', 'Leather aviator goggles for high-flying spelling adventures.', 'accessories', 'eyes', 150, 'rare', '/shop/eyes/aviator-goggles.png', TRUE, 300),
  ('a1b2c3d4-0031-0000-0000-000000000031', 'Pixel Sunglasses', 'Cool pixel-art sunglasses. Deal with it!', 'accessories', 'eyes', 100, 'rare', '/shop/eyes/pixel-sunglasses.png', TRUE, 310),
  ('a1b2c3d4-0032-0000-0000-000000000032', 'Round Specs', 'Classic round spectacles for a brainy look.', 'accessories', 'eyes', 35, 'common', '/shop/eyes/round-specs.png', TRUE, 320),
  ('a1b2c3d4-0033-0000-0000-000000000033', 'Cat Eye Glasses', 'Stylish cat-eye glasses in hot pink.', 'accessories', 'eyes', 110, 'rare', '/shop/eyes/cat-eye-glasses.png', TRUE, 330),
  ('a1b2c3d4-0034-0000-0000-000000000034', 'Eye Patch', 'Arrrr! A pirate eye patch with a golden detail.', 'accessories', 'eyes', 65, 'common', '/shop/eyes/eye-patch.png', TRUE, 340),

  -- Feet items
  ('a1b2c3d4-0035-0000-0000-000000000035', 'Roller Skates', 'Speedy red roller skates with golden wheels. Zoom!', 'shoes', 'feet', 150, 'rare', '/shop/feet/roller-skates.png', TRUE, 350),
  ('a1b2c3d4-0036-0000-0000-000000000036', 'Flippers', 'Green swimming flippers for splashy fun.', 'shoes', 'feet', 50, 'common', '/shop/feet/flippers.png', TRUE, 360),
  ('a1b2c3d4-0037-0000-0000-000000000037', 'Cowboy Boots', 'Yeehaw! Brown leather cowboy boots for rootin-tootin spelling.', 'shoes', 'feet', 100, 'rare', '/shop/feet/cowboy-boots.png', TRUE, 370),
  ('a1b2c3d4-0038-0000-0000-000000000038', 'Bunny Slippers', 'Cute pink bunny slippers with little faces. So cosy!', 'shoes', 'feet', 75, 'common', '/shop/feet/bunny-slippers.png', TRUE, 380),
  ('a1b2c3d4-0039-0000-0000-000000000039', 'Trainers', 'Classic white trainers with a red swoosh. Ready to run!', 'shoes', 'feet', 40, 'common', '/shop/feet/trainers.png', TRUE, 390),
  ('a1b2c3d4-0040-0000-0000-000000000040', 'Moon Boots', 'Big silver moon boots for walking on the moon.', 'shoes', 'feet', 200, 'epic', '/shop/feet/moon-boots.png', TRUE, 400),

  -- Handheld items
  ('a1b2c3d4-0007-0000-0000-000000000007', 'Golden Wand', 'A glittering golden wand to wave when you spell a word correctly.', 'accessories', 'handheld', 120, 'rare', '/shop/handheld/golden-wand.png', TRUE, 70),
  ('a1b2c3d4-0041-0000-0000-000000000041', 'Magic Sword', 'A glowing blue sword of spelling power!', 'accessories', 'handheld', 250, 'epic', '/shop/handheld/magic-sword.png', TRUE, 410),
  ('a1b2c3d4-0042-0000-0000-000000000042', 'Bouquet', 'A beautiful bunch of colourful flowers.', 'accessories', 'handheld', 60, 'common', '/shop/handheld/bouquet.png', TRUE, 420),
  ('a1b2c3d4-0043-0000-0000-000000000043', 'Lollipop', 'A giant swirly lollipop. Yummy!', 'accessories', 'handheld', 35, 'common', '/shop/handheld/lollipop.png', TRUE, 430),
  ('a1b2c3d4-0044-0000-0000-000000000044', 'Paintbrush', 'A colourful paintbrush for creative spellers.', 'accessories', 'handheld', 75, 'common', '/shop/handheld/paintbrush.png', TRUE, 440),
  ('a1b2c3d4-0045-0000-0000-000000000045', 'Telescope', 'A brass telescope to see faraway words!', 'accessories', 'handheld', 150, 'rare', '/shop/handheld/telescope.png', TRUE, 450),
  ('a1b2c3d4-0046-0000-0000-000000000046', 'Shield', 'A sturdy blue shield with a golden star.', 'accessories', 'handheld', 175, 'rare', '/shop/handheld/shield.png', TRUE, 460),

  -- Background items
  ('a1b2c3d4-0006-0000-0000-000000000006', 'Enchanted Forest', 'A magical forest background with glowing mushrooms and fireflies.', 'backgrounds', 'background', 200, 'rare', '/shop/backgrounds/enchanted-forest.png', TRUE, 60),
  ('a1b2c3d4-0047-0000-0000-000000000047', 'Space Galaxy', 'A deep space background with twinkling stars and nebulas.', 'backgrounds', 'background', 250, 'epic', '/shop/backgrounds/space-galaxy.png', TRUE, 470),
  ('a1b2c3d4-0048-0000-0000-000000000048', 'Underwater Ocean', 'A calm underwater scene with bubbles and seaweed.', 'backgrounds', 'background', 175, 'rare', '/shop/backgrounds/underwater-ocean.png', TRUE, 480),
  ('a1b2c3d4-0049-0000-0000-000000000049', 'Candy Land', 'A sweet land of candy canes and gumdrops!', 'backgrounds', 'background', 200, 'rare', '/shop/backgrounds/candy-land.png', TRUE, 490),
  ('a1b2c3d4-0050-0000-0000-000000000050', 'Snowy Mountain', 'A peaceful snowy mountain scene with falling snowflakes.', 'backgrounds', 'background', 150, 'rare', '/shop/backgrounds/snowy-mountain.png', TRUE, 500),
  ('a1b2c3d4-0051-0000-0000-000000000051', 'Rainbow Sky', 'A bright sky with a beautiful rainbow arching across it.', 'backgrounds', 'background', 100, 'common', '/shop/backgrounds/rainbow-sky.png', TRUE, 510),
  ('a1b2c3d4-0052-0000-0000-000000000052', 'Volcano Island', 'A tropical island with a rumbling volcano. Exciting!', 'backgrounds', 'background', 350, 'epic', '/shop/backgrounds/volcano-island.png', TRUE, 520),

  -- Accessory items
  ('a1b2c3d4-0008-0000-0000-000000000008', 'Champion Medal', 'A legendary gold medal awarded only to the greatest spellers.', 'accessories', 'accessory', 300, 'legendary', '/shop/accessory/champion-medal.png', TRUE, 80),
  ('a1b2c3d4-0053-0000-0000-000000000053', 'Bow Tie', 'A smart red bow tie. Very dapper!', 'accessories', 'accessory', 40, 'common', '/shop/accessory/bow-tie.png', TRUE, 530),
  ('a1b2c3d4-0054-0000-0000-000000000054', 'Scarf', 'A warm blue scarf with tassels for chilly days.', 'accessories', 'accessory', 50, 'common', '/shop/accessory/scarf.png', TRUE, 540),
  ('a1b2c3d4-0055-0000-0000-000000000055', 'Backpack', 'A red backpack to carry all your spelling books.', 'accessories', 'accessory', 100, 'rare', '/shop/accessory/backpack.png', TRUE, 550),
  ('a1b2c3d4-0056-0000-0000-000000000056', 'Wings', 'Beautiful white angel wings. Time to fly!', 'accessories', 'accessory', 400, 'legendary', '/shop/accessory/wings.png', TRUE, 560),
  ('a1b2c3d4-0057-0000-0000-000000000057', 'Necklace', 'A golden necklace with a shiny red gem.', 'accessories', 'accessory', 150, 'rare', '/shop/accessory/necklace.png', TRUE, 570),
  ('a1b2c3d4-0058-0000-0000-000000000058', 'Tail Bow', 'A cute pink bow to decorate your dino tail.', 'accessories', 'accessory', 25, 'common', '/shop/accessory/tail-bow.png', TRUE, 580)
ON CONFLICT (id) DO NOTHING;
