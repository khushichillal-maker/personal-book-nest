import { Link } from "@tanstack/react-router";
import { Moon, Sun, Search, Lock, LockOpen } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useOwner } from "@/hooks/use-owner";

export function LibraryHeader({
  subtitle,
  query,
  onQuery,
}: {
  subtitle: string;
  query?: string;
  onQuery?: (value: string) => void;
}) {
  const { dark, toggle } = useTheme();
  const { owner, unlock, lock } = useOwner();

  const onLockClick = async () => {
    if (owner) {
      lock();
      return;
    }
    const passcode = window.prompt("Owner passcode");
    if (!passcode) return;
    const ok = await unlock(passcode);
    if (!ok) window.alert("Incorrect passcode");
  };

  return (
    <header className="mx-auto w-full max-w-6xl px-5 pt-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          Shelf
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <button
            type="button"
            onClick={onLockClick}
            aria-label={owner ? "Lock owner mode" : "Unlock owner mode"}
            className="rounded-full border border-border p-2 transition-colors hover:bg-secondary"
          >
            {owner ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-full border border-border p-2 transition-colors hover:bg-secondary"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-10 text-center">
        <h1 className="font-display text-[2.75rem] leading-[1.05] tracking-tight sm:text-6xl">
          Welcome to my library
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">{subtitle}</p>
      </div>

      {onQuery && (
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-soft">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="vampire or faerie fantasy romance"
            aria-label="Search books by title"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}
    </header>
  );
}
