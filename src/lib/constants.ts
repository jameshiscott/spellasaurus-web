/** Supabase table name constants — never inline strings in queries. */
export const TABLES = {
  USERS: "users",
  SCHOOLS: "schools",
  CLASSES: "classes",
  CLASS_STUDENTS: "class_students",
  CLASS_SPELLING_SETS: "class_spelling_sets",
  PARENT_CHILDREN: "parent_children",
  SPELLING_SETS: "spelling_sets",
  SPELLING_WORDS: "spelling_words",
  CHILD_PERSONAL_SETS: "child_personal_sets",
  CHILD_PRACTICE_SETTINGS: "child_practice_settings",
  CHILD_STATS: "child_stats",
  PRACTICE_SESSIONS: "practice_sessions",
  SHOP_ITEMS: "shop_items",
  CHILD_INVENTORY: "child_inventory",
  COIN_TRANSACTIONS: "coin_transactions",
  CLASS_LEADERBOARD_STATS: "class_leaderboard_stats",
  SCHOOL_LEADERBOARD_STATS: "school_leaderboard_stats",
  GLOBAL_LEADERBOARD_STATS: "global_leaderboard_stats",
  ARCADE_GAMES: "arcade_games",
  ARCADE_UNLOCKS: "arcade_unlocks",
  ARCADE_GAME_LIVES: "arcade_game_lives",
  ARCADE_HIGH_SCORES: "arcade_high_scores",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];

export const USER_ROLES = {
  CHILD: "child",
  PARENT: "parent",
  TEACHER: "teacher",
  SCHOOL_ADMIN: "school_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const AVATAR_SLOTS = {
  HEAD: "head",
  BODY: "body",
  EYES: "eyes",
  FEET: "feet",
  HANDHELD: "handheld",
  BACKGROUND: "background",
  ACCESSORY: "accessory",
} as const;

export type AvatarSlot = (typeof AVATAR_SLOTS)[keyof typeof AVATAR_SLOTS];

export const COIN_TRANSACTION_TYPES = {
  EARN_PRACTICE: "earn_practice",
  SPEND_SHOP: "spend_shop",
  SPEND_ARCADE: "spend_arcade",
  ADMIN_GRANT: "admin_grant",
  REFUND: "refund",
} as const;

export const DINO_TYPES = [
  "trex",
  "triceratops",
  "stegosaurus",
  "brachiosaurus",
  "raptor",
  "ankylosaurus",
  "diplodocus",
  "spinosaurus",
  "pterodactyl",
  "parasaurolophus",
] as const;

export const DINO_COLORS = ["green", "blue", "purple", "orange", "pink"] as const;

/** Coins awarded per correct word in a practice session. */
export const COINS_PER_CORRECT_WORD = 1;

/** Bonus coins when answer is faster than the child's average speed. */
export const COINS_FASTER_THAN_AVG = 2;

/** Bonus coins when answer is the child's fastest ever for that word. */
export const COINS_FASTEST_EVER = 5;

/** Maximum recent practice sessions to keep per child. */
export const MAX_RECENT_SESSIONS = 10;

/** Cost in coins to buy one extra arcade life. */
export const ARCADE_LIFE_COST = 10;

/** Starting lives when first playing an arcade game. */
export const ARCADE_STARTING_LIVES = 3;
