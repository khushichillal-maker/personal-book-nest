import { useEffect, useState } from "react";
import { getAllBooks, putBook } from "@/lib/library-db";

export const formatMb = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 100) return mb.toFixed(0) + " MB";
  if (mb >= 1) return mb.toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
};

export const useLibrary = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const all = await getAllBooks();
    all.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    setBooks(all);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const addFiles = async (fileList: FileList, genre: string) => {
    setBusy(true);
    try {
      const files = Array.from(fileList);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 500 * 1024 * 1024) {
          alert(`${file.name} is bigger than 500 MB limit!`);
          continue;
        }
        const id = Date.now().toString() + "-" + i + "-" + file.name.replace(/[^a-z0-9]/gi, "_");
        const newBook = {
          id,
          title: file.name.replace(/\.pdf$/i, ""),
          genre: genre || "FICTION",
          size: file.size,
          file,
          createdAt: Date.now(),
          favorite: false,
          finished: false,
          reading: false,
        };
        await putBook(newBook);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return { books, loading, busy, addFiles, refresh };
};
