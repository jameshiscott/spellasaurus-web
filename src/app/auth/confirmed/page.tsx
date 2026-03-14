import Link from "next/link";

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <h1 className="text-4xl font-black text-brand-500">🦕 Spellasaurus</h1>
          <div className="mt-6 space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-foreground">Email Confirmed!</h2>
            <p className="text-muted-foreground">
              Your account is now active. You can sign in and start using Spellasaurus.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-lg hover:bg-brand-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
