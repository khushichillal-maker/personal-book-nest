import { useCallback, useEffect, useState } from "react";
import { type Book, deleteBook, listBooks, putBook } from "@/lib/library-db";
import { renderFirstPage } from "@/lib/pdf-thumb";

export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const all = await listBooks();
    all.sort((a, b) => b.addedAt - a.addedAt);
    setBooks(all);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addFiles = useCallback(
    async (files: FileList | File[], genre: string) => {
      setBusy(true);
      try {
        for (const file of Array.from(files)) {
          if (file.type !== "application/pdf") continue;
          const cover = await renderFirstPage(file);
          await putBook({
            id: crypto.randomUUID(),
            title: file.name.replace(/\.pdf$/i, ""),
            size: file.size,
            addedAt: Date.now(),
            cover,
            favorite: false,
            finished: false,
            reading: true,
            genre,
            file,
          });
        }
        await refresh();
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const update = useCallback(
    async (book: Book, patch: Partial<Book>) => {
      await putBook({ ...book, ...patch });
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteBook(id);
      await refresh();
    },
    [refresh],
  );

  return { books, loading, busy, addFiles, update, remove, refresh };
}

export const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
