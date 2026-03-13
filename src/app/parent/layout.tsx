import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";
import Link from "next/link";
import WelcomeModal from "@/components/WelcomeModal";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("role, full_name, last_seen_version")
    .eq("id", user.id)
    .single();

  if (profile?.role !== USER_ROLES.PARENT) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeModal lastSeenVersion={profile.last_seen_version ?? null} />
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/parent" className="text-xl font-black text-brand-500">
            🦕 Spellasaurus
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/parent/lists"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Word Lists
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-border bg-white py-6 text-center">
        <p className="text-sm text-muted-foreground font-semibold max-w-md mx-auto px-4">
          Spellasaurus is built by a busy parent, just for fun and learning. If
          you&apos;d like to help support its development, feel free to{" "}
          <a
            href="https://buymeacoffee.com/studiohiscott"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 font-bold hover:underline"
          >
            buy me a coffee ☕
          </a>
        </p>
      </footer>
    </div>
  );
}
