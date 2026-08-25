import { useEffect, useState } from "react";
import { getAllBooks, putBook, type Book } from "@/lib/library-db";

export const formatMb = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

export const useLibrary = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const all = await getAllBooks();
    setBooks(all.sort((a,b) => b.createdAt - a.createdAt));
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const addFiles = async (fileList: FileList, genre: string) => {
    setBusy(true);
    try {
      for (const file of Array.from(fileList)) {
        // ALLOW UP TO 1GB = 1024 MB
        if (file.size > 1024 * 1024 * 1024) {
          alert(`${file.name} is bigger than 1GB — too big!`);
          continue;
        }

        const id = `${Date.now()}-${file.name}`.replace(/[^a-z0-9-_.]/gi, "_");
        const newBook: Book = {
          id,
          title: file.name.replace(/\.pdf$/i, ""),
          genre: genre || "FICTION",
          size: file.size,
          file: file, // save directly, no copy
          cover: undefined, // no heavy cover for 1GB
          createdAt: Date.now(),
          favorite: false,
          finished: false,
          reading: false,
        };

        // Try to make cover ONLY if small (<20 MB) — for big files skip to avoid crash
        if (file.size < 20 * 1024 * 1024) {
          try {
            const cover = await makeCover(file);
            if (cover) newBook.cover = cover;
          } catch {}
        }

        await putBook(newBook);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return { books, loading, busy, addFiles, refresh };
};

// lightweight cover generator — only for small files
async function makeCover(file: Blob): Promise<string | undefined> {
  return undefined; // skip cover for now to allow 1GB — you can add pdfjs later if you want
    }
