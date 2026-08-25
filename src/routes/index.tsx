import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { LibraryHeader } from "@/components/library/Header";
import { BookSpine } from "@/components/library/BookSpine";
import { useLibrary } from "@/hooks/use-library";
import { useOwner } from "@/hooks/use-owner";

const SHELVES = [
  { key: "all", label: "All Books" },
  { key: "reading", label: "Currently Reading" },
  { key: "fav", label: "My Fav" },
  { key: "finished", label: "Finished" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to my library — A personal archive of books" },
      { name: "description", content: "A quiet personal book archive" },
    ],
  }),
  component: Library,
});

function Library() {
  const { books, loading, busy, addFiles } = useLibrary();
  const { owner } = useOwner();
  const [shelf, setShelf] = useState<(typeof SHELVES)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [uploadGenre, setUploadGenre] = useState("FICTION");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      books.filter((book) => {
        if (shelf === "fav" &&!book.favorite) return false;
        if (shelf === "finished" &&!book.finished) return false;
        if (shelf === "reading" && (!book.reading || book.finished)) return false;
        return book.title.toLowerCase().includes(query.trim().toLowerCase());
      }),
    [books, shelf, query],
  );

  const subtitle = `A personal archive • ${books.length} books`;

  return (
    <main className="min-h-screen pb-24">
      <LibraryHeader subtitle={subtitle} query={query} onQuery={setQuery} />
      <div className="mx-auto mt-8 max-w-6xl px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="shelf-scroll flex gap-6 overflow-x-auto">
            {SHELVES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setShelf(item.key)}
                className={`shrink-0 border-b pb-1 font-display text-2xl transition-colors ${
                  shelf === item.key? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {owner? (
            <div className="flex items-center gap-2">
              <input
                value={uploadGenre}
                onChange={(e) => setUploadGenre(e.target.value.toUpperCase())}
                placeholder="GENRE e.g. SCI-FI"
                className="w-32 rounded-full border border-border bg-card px-4 py-2 text-[0.7rem] uppercase tracking-[0.14em] outline-none sm:w-40"
              />
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) void addFiles(event.target.files, uploadGenre || "FICTION");
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
              >
                {busy? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {busy? "Shelving" : "Upload PDF"}
              </button>
            </div>
          ) : (
            <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">Showcase only · reading disabled</p>
          )}
        </div>
        <section className="mt-8">
          {loading? (
            <p className="text-sm text-muted-foreground">Opening the shelf…</p>
          ) : filtered.length === 0? (
            <div className="card-soft px-8 py-14 text-center">
              <h2 className="font-display text-3xl">The shelf is empty</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Upload a PDF and its first page becomes the cover.</p>
            </div>
          ) : (
            <div className="shelf-scroll -mx-5 flex gap-5 overflow-x-auto px-5 pb-8">
              {filtered.map((book) => (
                <BookSpine key={book.id} book={book} />
              ))}
            </div>
          )}
          {filtered.length > 0 && <div className="h-2 rounded-full bg-spine shadow-soft" />}
        </section>
      </div>
    </main>
  );
      }
