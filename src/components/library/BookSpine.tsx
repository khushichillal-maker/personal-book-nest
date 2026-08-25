import { Link } from "@tanstack/react-router";
import { Heart, Check } from "lucide-react";
import type { Book } from "@/lib/library-db";
import { formatMb } from "@/hooks/use-library";
import { bookGenres } from "@/lib/genres";


export function BookSpine({ book }: { book: Book }) {
  const genres = bookGenres(book);

  return (
    <Link
      to="/book/$bookId"
      params={{ bookId: book.id }}
      className="group w-[132px] shrink-0 sm:w-[152px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-spine shadow-soft transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-lift">
        <div className="absolute inset-y-0 left-0 z-10 w-2 bg-foreground/10" />
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center font-display text-base leading-tight text-secondary-foreground">
            {book.title}
          </div>
        )}
        {(book.favorite || book.finished) && (
          <div className="absolute right-2 top-2 z-10 flex gap-1">
            {book.favorite && (
              <span className="rounded-full bg-card/90 p-1 text-primary shadow-soft">
                <Heart className="h-3 w-3 fill-current" />
              </span>
            )}
            {book.finished && (
              <span className="rounded-full bg-card/90 p-1 text-primary shadow-soft">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 line-clamp-2 font-display text-lg leading-snug">{book.title}</p>
      <p className="text-xs tracking-wide text-muted-foreground">{formatMb(book.size)}</p>
      {genres.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="rounded-full bg-secondary px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.12em] text-secondary-foreground"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

    </Link>
  );
}
