"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChildHeaderProps {
  displayName: string;
}

export function ChildHeader({ displayName }: ChildHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Network error — still redirect to login
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
        <Link href="/child" className="text-base font-black text-brand-500 hover:text-brand-600 transition-colors">
          🦕 Spellasaurus
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/child/profile"
            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {displayName}
          </Link>
          <button
            onClick={() => void handleLogout()}
            className="text-xs font-bold text-muted-foreground hover:text-danger border border-border rounded-xl px-2.5 py-1 hover:border-danger/50 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
