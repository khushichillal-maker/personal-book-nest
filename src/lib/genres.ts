import type { Book } from "@/lib/library-db";

export const ALL_GENRES = [
  "FICTION",
  "NONFICTION",
  "MYSTERY & THRILLER",
  "ROMANCE",
  "FANTASY",
  "SCI-FI",
  "MANGA",
  "POETRY",
  "MEMOIR",
  "CLASSICS",
] as const;

/** Backwards-compatible read: older books stored a single `genre` string. */
export const bookGenres = (book: Pick<Book, "genres" | "genre">): string[] => {
  if (book.genres?.length) return book.genres;
  return book.genre ? [book.genre] : [];
};
