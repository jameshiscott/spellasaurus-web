#!/usr/bin/env node
/**
 * Give coins to a child — local development only.
 *
 * Usage:
 *   node scripts/give-coins.mjs <username-or-email> <amount>
 *   node scripts/give-coins.mjs CoolDino 500        # looks up CoolDino@spellasaurus.internal
 *   node scripts/give-coins.mjs parent@test.com 500  # full email
 *
 * If no @ is present, appends @spellasaurus.internal (child login format).
 * Connects to the local Supabase instance using the service role key.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  // Default local dev service role key (safe — only works against local Supabase)
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const [, , identifier, amountStr] = process.argv;

if (!identifier || !amountStr) {
  console.error("Usage: node scripts/give-coins.mjs <username-or-email> <amount>");
  console.error("Examples:");
  console.error("  node scripts/give-coins.mjs CoolDino 500");
  console.error("  node scripts/give-coins.mjs parent@test.com 500");
  process.exit(1);
}

// If no @ present, treat as a child username and append the internal domain
const email = identifier.includes("@")
  ? identifier
  : `${identifier}@spellasaurus.internal`;

const amount = parseInt(amountStr, 10);
if (isNaN(amount) || amount === 0) {
  console.error(`Invalid amount: "${amountStr}" — must be a non-zero integer`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Find user by email
const { data: user, error: userError } = await supabase
  .from("users")
  .select("id, email, display_name, role, coin_balance")
  .eq("email", email)
  .single();

if (userError || !user) {
  console.error(`User not found: ${email}`);
  if (userError) console.error(userError.message);
  process.exit(1);
}

const newBalance = user.coin_balance + amount;

const { error: updateError } = await supabase
  .from("users")
  .update({ coin_balance: newBalance })
  .eq("id", user.id);

if (updateError) {
  console.error("Failed to update balance:", updateError.message);
  process.exit(1);
}

const verb = amount > 0 ? "Gave" : "Removed";
console.log(`${verb} ${Math.abs(amount)} coins ${amount > 0 ? "to" : "from"} ${user.display_name ?? user.email} (${user.role})`);
console.log(`Balance: ${user.coin_balance} → ${newBalance}`);
