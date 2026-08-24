import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { LibraryHeader } from "@/components/library/Header";
import { BookSpine } from "@/components/library/BookSpine";
import { useLibrary } from "@/hooks/use-library";

const GENRES = ["ALL", "NONFICTION", "FICTION", "MYSTERY & THRILLER", "FANTASY", "ROMANCE"];
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
      {
        name: "description",
        content:
          "A quiet personal book archive: upload PDFs, auto-generated covers, and shelves for favourites, currently reading and finished reads.",
      },
      { property: "og:title", content: "Welcome to my library" },
      {
        property: "og:description",
        content: "A personal archive of books, kept on a beige shelf.",
      },
    ],
  }),
  component: Library,
});

function Library() {
  const { books, loading, busy, addFiles } = useLibrary();
  const [genre, setGenre] = useState("ALL");
  const [shelf, setShelf] = useState<(typeof SHELVES)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [uploadGenre, setUploadGenre] = useState("FICTION");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      books.filter((book) => {
        if (genre !== "ALL" && book.genre !== genre) return false;
        if (shelf === "fav" && !book.favorite) return false;
        if (shelf === "finished" && !book.finished) return false;
        if (shelf === "reading" && (!book.reading || book.finished)) return false;
        return book.title.toLowerCase().includes(query.trim().toLowerCase());
      }),
    [books, genre, shelf, query],
  );

  const subtitle = `A personal archive • ${books.length} recommended • ${books.length === 1 ? "A book" : "Books"}`;

  return (
    <main className="min-h-screen pb-24">
      <LibraryHeader subtitle={subtitle} query={query} onQuery={setQuery} />

      <div className="mx-auto mt-8 max-w-6xl px-5">
        <div className="shelf-scroll flex gap-2 overflow-x-auto pb-1">
          {GENRES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setGenre(item)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                genre === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="shelf-scroll flex gap-6 overflow-x-auto">
            {SHELVES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setShelf(item.key)}
                className={`shrink-0 border-b pb-1 font-display text-2xl transition-colors ${
                  shelf === item.key
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={uploadGenre}
              onChange={(event) => setUploadGenre(event.target.value)}
              aria-label="Genre for new uploads"
              className="rounded-full border border-border bg-card px-4 py-2 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground outline-none"
            >
              {GENRES.filter((item) => item !== "ALL").map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) void addFiles(event.target.files, uploadGenre);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-primary-foreground shadow-soft transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {busy ? "Shelving" : "Upload PDF"}
            </button>
          </div>
        </div>

        <section className="mt-8">
          {loading ? (
            <p className="text-sm text-muted-foreground">Opening the shelf…</p>
          ) : filtered.length === 0 ? (
            <div className="card-soft px-8 py-14 text-center">
              <h2 className="font-display text-3xl">The shelf is empty</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Upload a PDF and its first page becomes the cover. Everything stays on this device.
              </p>
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
