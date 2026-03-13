"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DinoType, DinoColor } from "@/components/dino/dino-types";
import DinoAvatar from "@/components/dino/DinoAvatar";
import DinoTypePicker from "@/components/dino/DinoTypePicker";
import DinoColorPicker from "@/components/dino/DinoColorPicker";

interface OnboardingFlowProps {
  childId: string;
  childName: string;
}

type NameStatus = "idle" | "checking" | "available" | "taken";

interface NameCategory {
  label: string;
  emoji: string;
  adjectives: string[];
  nouns: string[];
}

const NAME_CATEGORIES: NameCategory[] = [
  {
    label: "Animal Chaos",
    emoji: "🐵",
    adjectives: [
      "Turbo", "Mega", "Sneaky", "Wobbly", "Captain", "Fluffy",
      "Hyper", "Zippy", "Grumpy", "Dizzy", "Bouncy", "Sparkly",
      "Mighty", "Silly", "Fancy", "Cosmic", "Jazzy", "Ninja",
      "Cheeky", "Squishy", "Rowdy", "Snappy", "Chunky", "Twirly",
      "Peppy", "Clumsy", "Bubbly", "Pudgy", "Slippery", "Speedy",
      "Jumpy", "Frantic", "Dopey", "Shabby", "Scruffy", "Sleepy",
      "Muddy", "Fuzzy", "Crazy", "Electric", "Floppy", "Giggly",
      "Wiggly", "Wacky", "Howling", "Prancing", "Shuffling", "Galloping",
      "Rumbling", "Stomping",
    ],
    nouns: [
      "Penguin", "Llama", "Platypus", "Wombat", "Narwhal", "Sloth",
      "Panda", "Otter", "Capybara", "Flamingo", "Gecko", "Hamster",
      "Hedgehog", "Toucan", "Axolotl", "Quokka", "Lemur", "Ferret",
      "Alpaca", "Chinchilla", "Armadillo", "Chameleon", "Peacock", "Pelican",
      "Koala", "Raccoon", "Walrus", "Badger", "Meerkat", "Porcupine",
      "Seahorse", "Manatee", "Jellyfish", "Iguana", "Parrot", "Moose",
      "Chipmunk", "Stingray", "Starfish", "Lobster", "Beetle", "Bison",
      "Ostrich", "Vulture", "Coyote", "Goose", "Donkey", "Gopher",
      "Kiwi", "Dugong",
    ],
  },
  {
    label: "Food Names",
    emoji: "🍕",
    adjectives: [
      "Spicy", "Crunchy", "Bubbly", "Toasty", "Sizzling", "Frozen",
      "Cheesy", "Crispy", "Zesty", "Gooey", "Fizzy", "Tangy",
      "Saucy", "Supreme", "Golden", "Double", "Extra", "Mega",
      "Sticky", "Fluffy", "Smoky", "Loaded", "Stuffed", "Flaming",
      "Sugary", "Buttery", "Whipped", "Melted", "Glazed", "Dipped",
      "Caramel", "Pickled", "Battered", "Drizzled", "Smothered", "Sprinkled",
      "Popping", "Steamy", "Chunky", "Twisted", "Swirly", "Jumbo",
      "Triple", "Turbo", "Atomic", "Exploding", "Legendary", "Ultimate",
      "Cosmic", "Volcanic",
    ],
    nouns: [
      "Taco", "Waffle", "Noodle", "Muffin", "Pretzel", "Burrito",
      "Donut", "Pancake", "Nugget", "Pickle", "Cookie", "Cupcake",
      "Popcorn", "Dumpling", "Churro", "Nacho", "Pizza", "Biscuit",
      "Croissant", "Sushi", "Brownie", "Falafel", "Wonton", "Crumpet",
      "Scone", "Macaron", "Strudel", "Bagel", "Calzone", "Empanada",
      "Samosa", "Crepe", "Kebab", "Corndog", "Turnover", "Eclair",
      "Fritter", "Pierogi", "Tamale", "Brioche", "Gyoza", "Cannoli",
      "Cheddar", "Pudding", "Crouton", "Tofu", "Jalapeno", "Lasagne",
      "Ravioli", "Mochi",
    ],
  },
  {
    label: "Gamer Style",
    emoji: "🎮",
    adjectives: [
      "Shadow", "Pixel", "Turbo", "Glitch", "Neon", "Stealth",
      "Ultra", "Hyper", "Blaze", "Storm", "Frost", "Thunder",
      "Cyber", "Laser", "Rocket", "Vortex", "Nitro", "Atomic",
      "Phantom", "Quantum", "Nova", "Inferno", "Spectral", "Omega",
      "Titanium", "Chaos", "Alpha", "Primal", "Savage", "Elite",
      "Warp", "Galactic", "Plasma", "Fusion", "Infinite", "Zero",
      "Binary", "Hex", "Vector", "Rapid", "Apex", "Supreme",
      "Iron", "Steel", "Chrome", "Dark", "Blazing", "Fatal",
      "Silent", "Overclocked",
    ],
    nouns: [
      "Wolf", "Phoenix", "Dragon", "Ninja", "Knight", "Titan",
      "Falcon", "Cobra", "Panther", "Hawk", "Raven", "Viper",
      "Lynx", "Fox", "Raptor", "Striker", "Blaster", "Racer",
      "Warden", "Crusher", "Hunter", "Sniper", "Guardian", "Slayer",
      "Ranger", "Sentinel", "Sphinx", "Griffin", "Kraken", "Golem",
      "Wraith", "Samurai", "Spartan", "Viking", "Gladiator", "Trooper",
      "Maverick", "Nomad", "Outlaw", "Bandit", "Ace", "Legend",
      "Reaper", "Drifter", "Runner", "Bomber", "Scorpion", "Shark",
      "Mantis", "Jaguar",
    ],
  },
  {
    label: "Hero Style",
    emoji: "🦸",
    adjectives: [
      "Captain", "Doctor", "Professor", "Super", "Legendary", "Ultra",
      "Turbo", "Mega", "Invincible", "Unstoppable", "Fearless", "Colossal",
      "Atomic", "Sergeant", "Commander", "Admiral", "Supreme", "Dynamic",
      "Major", "Inspector", "General", "Heroic", "All-Powerful", "Majestic",
      "Triumphant", "Astonishing", "Radical", "Outrageous", "Phenomenal",
      "Stupendous", "Formidable", "Extraordinary",
    ],
    nouns: [
      "Sock", "Spoon", "Elbow", "Banana", "Teapot", "Pillow",
      "Slipper", "Moustache", "Pancake", "Bubble", "Wobble", "Sneeze",
      "Pudding", "Doughnut", "Sandwich", "Blanket", "Crayon", "Spatula",
      "Marshmallow", "Broccoli", "Toilet Roll", "Bumblebee", "Custard Pie",
      "Armpit", "Belly Button", "Mushroom", "Cabbage", "Spring Roll",
      "Yoghurt", "Toast", "Turnip", "Jellybean", "Cauliflower", "Dishcloth",
      "Plunger", "Teabag", "Breadstick", "Sprout", "Crouton",
      "Napkin", "Doorbell", "Stapler", "Curtain",
    ],
  },
  {
    label: "Silly Historical",
    emoji: "🏛️",
    adjectives: [
      "Sir", "Lord", "Duchess", "Baron", "Count", "King",
      "Queen", "Emperor", "Grand Duke", "Sultan", "Pharaoh",
      "Archduke", "Czar", "Shogun", "Chief", "Admiral",
      "General", "Viking", "Dame", "Marquis", "Viscount",
      "Prince", "Princess", "Cardinal", "Chancellor", "Viceroy",
      "Governor", "Regent", "Earl", "Warlord", "Chieftain",
      "Conqueror", "High Priest", "Oracle", "Gladiator", "Tribune",
      "Senator", "Centurion", "Magistrate", "Squire", "Knight",
      "Commodore", "Marshal", "Overlord", "Monarch", "Sovereign",
      "Empress", "Tsar", "Grand Vizier", "Paladin", "Noble",
    ],
    nouns: [
      "Wobblebottom", "Noodlesworth", "McFluffington",
      "Von Snickerdoodle", "Bumblebee III", "Wiggleton",
      "Fluffernutter", "Gigglepants", "Wobblesnack",
      "Ticklebottom", "Snorkelface", "Puddinghat",
      "Wafflebeard", "Noodlehead", "Biscuitsworth",
      "Crumblewick", "Bumblefoot", "Doodlebug",
      "Picklesworth", "Bogglesworth", "Squishington",
      "Wobblekins", "Fiddlesticks", "Crumpleton",
      "Muffinsworth", "Snickerbottom", "Waddlesworth",
      "Fumblewick", "Gobbleston", "Tumblebum",
      "Puddleworth", "Bumblesnort", "Noodlebrain",
      "Wigglesworth", "Dribbleface", "Sconeington",
      "Trouserbottom", "Kerfuffle", "Crumblesnatch",
      "McWobbleface", "Butterfingers", "Twiddlesworth",
      "Fumblethump", "Jigglebottom", "Snorkleberry",
      "Wibbleford", "Crumplezone", "Bumblethwaite",
      "Flapdoodle", "Dandypants",
    ],
  },
  {
    label: "Random Goofiness",
    emoji: "🤪",
    adjectives: [
      "Wiggly", "Bonkers", "Wacky", "Loopy", "Bizarre", "Goofy",
      "Nutty", "Kooky", "Wonky", "Zany", "Funky", "Quirky",
      "Barmy", "Daft", "Potty", "Crackers", "Batty",
      "Flappy", "Jiggly", "Squiggly", "Noodly", "Boingy", "Springy",
      "Twisty", "Floopy", "Zappy", "Blurpy", "Splotchy", "Wobbulous",
      "Googly", "Zonky", "Frazzled", "Befuddled", "Discombobulated", "Bamboozled",
      "Flummoxed", "Gobsmacked", "Boggled", "Squonky", "Fizzly", "Bumbly",
      "Rumbly", "Tumbly", "Fumbling", "Bumbling", "Stumbling",
    ],
    nouns: [
      "Banana", "Trampoline", "Doorknob", "Spatula", "Jellyfish",
      "Tornado", "Blobfish", "Unicycle", "Catapult", "Yodeller",
      "Wiggler", "Boomerang", "Spaghetti", "Kazoo", "Pinwheel",
      "Moonbeam", "Sprocket", "Custard", "Zamboni", "Accordion",
      "Trombone", "Windmill", "Flamingo", "Kaleidoscope",
      "Cannonball", "Whirlpool", "Marshmallow", "Rocketship",
      "Pogo Stick", "Whoopee Cushion", "Confetti",
      "Firework", "Snowglobe", "Bubblewrap", "Lollipop", "Gumball",
      "Corkscrew", "Hedgehog", "Frisbee", "Cartwheel",
      "Noodle", "Tickle Monster", "Jelly Tot", "Bamboo",
    ],
  },
  {
    label: "Why Does This Exist",
    emoji: "🤨",
    adjectives: [
      "Slightly Damp", "Confused", "Invisible", "Expired",
      "Haunted", "Suspicious", "Reluctant", "Accidental",
      "Mysterious", "Forgotten", "Unnecessary", "Unimpressed",
      "Bewildered", "Startled", "Overcooked", "Lost",
      "Misplaced", "Lukewarm", "Deflated", "Overdue",
      "Secondhand", "Off-Brand", "Semi-Transparent", "Unfinished",
      "Questionable", "Mildly Concerning", "Unplugged",
      "Discontinued", "Refurbished", "Upside Down", "Inside Out", "Half-Eaten",
      "Undercooked", "Stale", "Rusty", "Dusty", "Wrinkled",
      "Soggy", "Crooked", "Backwards", "Tangled", "Crumpled",
      "Wonky", "Spare", "Leftover", "Unclaimed",
      "Ambiguous", "Inexplicable",
    ],
    nouns: [
      "Sandwich", "Receipt", "Sock Drawer", "Tuesday",
      "Paperclip", "Traffic Cone", "Deckchair", "Umbrella",
      "Doorstop", "Lampshade", "Shoelace", "Button",
      "Mannequin", "Tax Return", "Speed Bump", "Coat Hanger",
      "Puddle", "Toast Rack", "Warranty Card", "Instruction Manual",
      "Rubber Duck", "Parking Meter", "Fax Machine", "Dial Tone",
      "Screen Saver", "Clipboard", "Bookmark", "Keyring",
      "Bread Tie", "Fridge Magnet", "Mouse Pad", "Dust Bunny",
      "Lint Roller", "Bath Plug", "Pencil Sharpener", "Cable Tie",
      "Post-It Note", "Coaster", "Thimble", "Bottle Cap",
      "Safety Pin", "Clothes Peg", "Door Wedge", "Sellotape",
      "Plug Socket", "Price Tag", "Bin Lid", "Egg Cup",
      "Tea Towel", "Flyswatter",
    ],
  },
];

const SUGGESTION_COUNT = 4;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSuggestions(category: NameCategory): string[] {
  const results: string[] = [];
  const seen = new Set<string>();
  const maxAttempts = SUGGESTION_COUNT * 20;
  let attempts = 0;

  while (results.length < SUGGESTION_COUNT && attempts < maxAttempts) {
    attempts++;
    const name = `${pickRandom(category.adjectives)} ${pickRandom(category.nouns)}`;
    if (!seen.has(name)) {
      seen.add(name);
      results.push(name);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Step 1 — Pick Your Name
// ---------------------------------------------------------------------------

interface Step1Props {
  childName: string;
  displayName: string;
  setDisplayName: (name: string) => void;
  onNext: () => void;
}

function Step1({ childName, displayName, setDisplayName, onNext }: Step1Props) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    generateSuggestions(NAME_CATEGORIES[0])
  );
  const [nameStatus, setNameStatus] = useState<NameStatus>("idle");
  const [checking, setChecking] = useState(false);

  const checkName = useCallback(async (name: string) => {
    setChecking(true);
    setNameStatus("idle");
    try {
      const res = await fetch("/api/auth/check-display-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      if (res.ok) {
        const data = (await res.json()) as { available: boolean };
        setNameStatus(data.available ? "available" : "taken");
      }
    } catch {
      // Silently ignore
    } finally {
      setChecking(false);
    }
  }, []);

  const handleCategoryChange = (index: number) => {
    setCategoryIndex(index);
    setSuggestions(generateSuggestions(NAME_CATEGORIES[index]));
    setDisplayName("");
    setNameStatus("idle");
  };

  const handleShuffle = () => {
    setSuggestions(generateSuggestions(NAME_CATEGORIES[categoryIndex]));
    setDisplayName("");
    setNameStatus("idle");
  };

  const handlePick = (name: string) => {
    setDisplayName(name);
    void checkName(name);
  };

  const canContinue = displayName.trim().length >= 2 && nameStatus === "available";
  const category = NAME_CATEGORIES[categoryIndex];

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Hi {childName}! 👋
        </h1>
        <p className="text-lg font-bold text-brand-500">
          Choose your explorer name!
        </p>
        <p className="text-sm text-gray-500">
          This is the name other explorers will see
        </p>
      </div>

      {/* Category tabs — wrapping grid, no scroll */}
      <div className="flex flex-wrap gap-2">
        {NAME_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => handleCategoryChange(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold border-2 transition-colors",
              i === categoryIndex
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Suggestions grid */}
      <div>
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
          Pick a name
        </p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((name) => {
            const isSelected = displayName === name;
            return (
              <button
                key={name}
                onClick={() => handlePick(name)}
                className={cn(
                  "rounded-2xl px-3 py-2.5 text-sm font-bold text-left border-2 transition-all",
                  isSelected
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-brand-50 text-brand-700 border-brand-100 hover:border-brand-400 hover:bg-brand-100"
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status indicator */}
      <div className="min-h-[2rem] flex items-center gap-2">
        {displayName && checking && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span className="text-sm text-gray-400 font-semibold">Checking…</span>
          </>
        )}
        {displayName && !checking && nameStatus === "available" && (
          <>
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-success">
              <span className="font-black">{displayName}</span> is available!
            </span>
          </>
        )}
        {displayName && !checking && nameStatus === "taken" && (
          <>
            <XCircle className="w-4 h-4 text-danger" />
            <span className="text-sm font-semibold text-danger">
              That name is taken — try another!
            </span>
          </>
        )}
      </div>

      {/* Generate more */}
      <button
        onClick={handleShuffle}
        className="w-full rounded-2xl border-2 border-brand-200 bg-brand-50 text-brand-600 font-bold py-3 text-base hover:bg-brand-100 hover:border-brand-400 transition-colors flex items-center justify-center gap-2"
      >
        <Shuffle className="w-4 h-4" />
        Generate more…
      </button>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className={cn(
          "w-full rounded-2xl px-8 py-4 text-xl font-extrabold transition-all",
          canContinue
            ? "bg-brand-500 text-white hover:bg-brand-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        Continue →
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Pick Your Dinosaur
// ---------------------------------------------------------------------------

interface Step2Props {
  displayName: string;
  dinoType: DinoType;
  dinoColor: DinoColor;
  setDinoType: (t: DinoType) => void;
  setDinoColor: (c: DinoColor) => void;
  isSubmitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

function Step2({
  displayName,
  dinoType,
  dinoColor,
  setDinoType,
  setDinoColor,
  isSubmitting,
  error,
  onBack,
  onSubmit,
}: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Pick your dinosaur!
        </h1>
        <p className="text-lg font-bold text-brand-500">
          Hello, {displayName}! 🦕
        </p>
      </div>

      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={dinoType + dinoColor}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            <DinoAvatar
              dinoType={dinoType}
              dinoColor={dinoColor}
              size="xl"
              animate
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <DinoTypePicker value={dinoType} color={dinoColor} onChange={setDinoType} />
      <DinoColorPicker value={dinoColor} onChange={setDinoColor} />

      {error && (
        <p className="text-sm font-semibold text-danger text-center">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-2xl px-8 py-4 text-xl font-extrabold transition-all",
            isSubmitting
              ? "bg-brand-300 text-white cursor-not-allowed"
              : "bg-brand-500 text-white hover:bg-brand-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up your adventure…
            </span>
          ) : (
            "Let's Go! 🚀"
          )}
        </button>

        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm font-semibold text-brand-500 hover:text-brand-700 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main OnboardingFlow
// ---------------------------------------------------------------------------

export default function OnboardingFlow({
  childId: _childId,
  childName,
}: OnboardingFlowProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState("");
  const [dinoType, setDinoType] = useState<DinoType>("trex");
  const [dinoColor, setDinoColor] = useState<DinoColor>("green");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/child/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, dinoType, dinoColor }),
      });

      if (res.ok) {
        router.push("/child");
      } else {
        const data = (await res.json()) as { error?: string };
        if (res.status === 409) {
          setError(
            "That name was just taken — go back and pick a different one!"
          );
        } else {
          setError(data.error ?? "Something went wrong — please try again");
        }
      }
    } catch {
      setError("Something went wrong — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-center gap-2 mb-8">
          {([1, 2] as const).map((s) => (
            <div
              key={s}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-brand-500" : "w-2.5 bg-gray-200"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 2 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 2 ? -60 : 60 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 ? (
              <Step1
                childName={childName}
                displayName={displayName}
                setDisplayName={setDisplayName}
                onNext={() => setStep(2)}
              />
            ) : (
              <Step2
                displayName={displayName}
                dinoType={dinoType}
                dinoColor={dinoColor}
                setDinoType={setDinoType}
                setDinoColor={setDinoColor}
                isSubmitting={isSubmitting}
                error={error}
                onBack={() => {
                  setError(null);
                  setStep(1);
                }}
                onSubmit={() => void handleSubmit()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
