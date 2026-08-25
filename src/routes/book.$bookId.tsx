import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Check, Heart, Trash2 } from "lucide-react";
import { type Book, deleteBook, getBook, putBook } from "@/lib/library-db";
import { formatMb } from "@/hooks/use-library";
import { useOwner } from "@/hooks/use-owner";

export const Route = createFileRoute("/book/$bookId")({
  head: () => ({
    meta: [
      { title: "Book detail — Welcome to my library" },
      { name: "description", content: "Read, favourite, finish or remove a book from your shelf." },
      { property: "og:title", content: "Book detail — Welcome to my library" },
      { property: "og:description", content: "A single volume from the personal archive." },
    ],
  }),
  component: BookDetail,
});

function BookDetail() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const { owner } = useOwner();
  const [book, setBook] = useState<Book | null | undefined>(undefined);

  useEffect(() => {
    getBook(bookId).then((found) => setBook(found ?? null));
  }, [bookId]);

  const patch = async (changes: Partial<Book>) => {
    if (!book) return;
    const next = { ...book, ...changes };
    await putBook(next);
    setBook(next);
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

  if (book === undefined) {
    return <main className="p-10 text-sm text-muted-foreground">Loading…</main>;
  }

  if (book === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-4xl">Not on the shelf</h1>
        <Link to="/" className="text-sm text-muted-foreground underline">
          Back to the library
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Shelf
      </Link>

      <div className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-start">
        <div className="mx-auto aspect-[2/3] w-56 overflow-hidden rounded-2xl bg-spine shadow-lift sm:w-full">
          {book.cover ? (
            <img src={book.cover} alt={`Cover of ${book.title}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center font-display text-2xl">
              {book.title}
            </div>
          )}
        </div>

        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">{book.genre}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{book.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{formatMb(book.size)} · PDF</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={read}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
            >
              <BookOpen className="h-4 w-4" /> Read
            </button>
            <button
              type="button"
              onClick={() => patch({ favorite: !book.favorite })}
              className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors ${
                book.favorite ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card"
              }`}
            >
              <Heart className={`h-4 w-4 ${book.favorite ? "fill-current" : ""}`} /> My Fav
            </button>
            <button
              type="button"
              onClick={() => patch({ finished: !book.finished, reading: book.finished })}
              className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors ${
                book.finished ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card"
              }`}
            >
              <Check className="h-4 w-4" /> Finished
            </button>
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-6 py-3 text-xs uppercase tracking-[0.16em] text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
