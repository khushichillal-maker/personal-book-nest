import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Check, Heart, Trash2 } from "lucide-react";
import { type Book, deleteBook, getBook, putBook } from "@/lib/library-db";
import { formatMb } from "@/hooks/use-library";
import { useOwner } from "@/hooks/use-owner";

export const Route = createFileRoute("/book/$bookId")({
  component: BookDetail,
});

function BookDetail() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const { owner } = useOwner();
  const [book][setBook] = useState<Book | null | undefined>(undefined);
  const [editGenre][setEditGenre] = useState(false);
  const [newGenre][setNewGenre] = useState("");

  useEffect(() => {
    getBook(bookId).then((found) => {
      setBook(found?? null);
      if(found) setNewGenre(found.genre || "");
    });
  }, [bookId]);

  const patch = async (changes: Partial<Book>) => {
    if (!book) return;
    const next = {...book,...changes };
    await putBook(next);
    setBook(next);
  };

  const saveGenre = async () => {
    await patch({ genre: newGenre.toUpperCase() });
    setEditGenre(false);
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
  if (book === null) return <main className="p-10 text-center"><Link to="/">Back</Link></main>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Shelf
      </Link>

      <div className="mt-10 grid gap-10 sm:grid-cols-[minmax(0,260px)_1fr]">
        <div className="mx-auto aspect-[2/3] w-56 overflow-hidden rounded-2xl bg-spine shadow-lift sm:w-full">
          {book.cover? <img src={book.cover} alt={book.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-6 text-center font-display text-2xl">{book.title}</div>}
        </div>

        <div>
          <h1 className="font-display text-4xl sm:text-5xl">{book.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{formatMb(book.size)} · PDF</p>

          {/* SIMPLE FICTION SECTION - NOW ANY GENRE YOU TYPE */}
          <div className="mt-6 rounded-2xl border border-border bg-card px-5 py-4">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">About this book</p>
            <p className="mt-2 font-display text-xl">
              This book - {book.genre || "Unknown"}
            </p>

            {owner && (
              <div className="mt-4">
                {!editGenre? (
                  <button onClick={() => setEditGenre(true)} className="text-xs uppercase tracking-widest underline text-muted-foreground">Edit genre</button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="e.g. SCI-FI, SELF-HELP"
                      className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-xs uppercase outline-none"
                    />
                    <button onClick={saveGenre} className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground">Save</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {owner? (
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={read} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground"><BookOpen className="h-4 w-4" /> Read</button>
              <button type="button" onClick={() => patch({ favorite:!book.favorite })} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.16em]"><Heart className={`h-4 w-4 ${book.favorite? "fill-current" : ""}`} /> My Fav</button>
              <button type="button" onClick={() => patch({ finished:!book.finished })} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs uppercase tracking-[0.16em]"><Check className="h-4 w-4" /> Finished</button>
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
