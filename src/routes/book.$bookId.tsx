import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Check, Heart, Plus, Trash2, X } from "lucide-react";
import { type Book, deleteBook, getBook, putBook } from "@/lib/library-db";
import { formatMb } from "@/hooks/use-library";
import { useOwner } from "@/hooks/use-owner";
import { ALL_GENRES, bookGenres } from "@/lib/genres";

export const Route = createFileRoute("/book/$bookId")({
  component: BookDetail,
});

function BookDetail() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const { owner } = useOwner();
  const [book, setBook] = useState<Book | null | undefined>(undefined);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    getBook(bookId).then((found) => setBook(found ?? null));
  }, [bookId]);

  const patch = async (changes: Partial<Book>) => {
    if (!book) return;
    const next = { ...book, ...changes };
    await putBook(next);
    setBook(next);
  };

  const genres = book ? bookGenres(book) : [];

  const toggleGenre = async (genre: string) => {
    const value = genre.trim().toUpperCase();
    if (!value) return;
    const next = genres.includes(value)
      ? genres.filter((item) => item !== value)
      : [...genres, value];
    await patch({ genres: next, genre: next[0] ?? "" });
  };

  const addTyped = async () => {
    const value = tagInput.trim().toUpperCase();
    if (!value || genres.includes(value)) {
      setTagInput("");
      return;
    }
    const next = [...genres, value];
    setTagInput("");
    await patch({ genres: next, genre: next[0] ?? "" });
  };

  const read = () => {
    if (!book) return;
    const url = URL.createObjectURL(book.file);
    window.open(url, "_blank", "noopener");
  };

  const remove = async () => {
    await deleteBook(bookId);
    navigate({ to: "/" });
  };

  if (book === undefined) return <main className="p-10 text-sm text-muted-foreground">Loading…</main>;
  if (book === null) return <main className="p-10 text-center"><Link to="/">Back to shelf</Link></main>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Shelf
      </Link>
      <div className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,260px)_1fr]">
        <div className="mx-auto aspect-[2/3] w-56 overflow-hidden rounded-2xl bg-spine shadow-lift sm:w-full">
          {book.cover ? <img src={book.cover} alt={book.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-6 text-center font-display text-2xl">{book.title}</div>}
        </div>
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">{book.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{formatMb(book.size)} · PDF</p>

          <div className="mt-6 rounded-2xl border border-border bg-card px-5 py-4">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">Genres</p>

            {genres.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em]"
                  >
                    {genre}
                    {owner && (
                      <button type="button" onClick={() => toggleGenre(genre)} aria-label={`Remove ${genre}`}>
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No genres yet</p>
            )}

            {owner && (
              <div className="mt-5 space-y-4">
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void addTyped();
                      }
                    }}
                    placeholder="Type a genre, e.g. DARK ROMANCE"
                    className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-xs uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void addTyped()}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-[0.14em] text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map((genre) => {
                    const active = genres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => void toggleGenre(genre)}
                        className={`rounded-full border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] transition-colors ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {owner ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={read} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground"><BookOpen className="h-4 w-4" /> Read</button>
              <button type="button" onClick={() => patch({ favorite: !book.favorite })} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.16em]"><Heart className={`h-4 w-4 ${book.favorite ? "fill-current" : ""}`} /> My Fav</button>
              <button type="button" onClick={() => patch({ finished: !book.finished })} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.16em]"><Check className="h-4 w-4" /> Finished</button>
              <button type="button" onClick={remove} className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-6 py-3 text-xs uppercase tracking-[0.16em] text-destructive"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          ) : (
            <div className="card-soft mt-8 px-6 py-5 text-sm text-muted-foreground">Showcase only · reading disabled</div>
          )}
        </div>
      </div>
    </main>
  );
}
