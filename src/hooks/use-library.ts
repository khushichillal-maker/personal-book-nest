import { useEffect, useState } from "react";
import { getAllBooks, putBook } from "@/lib/library-db";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist";
if (typeof window!== "undefined") {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export const formatMb = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 100) return mb.toFixed(0) + " MB";
  if (mb >= 1) return mb.toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
};

const makeCover = async (file: File): Promise<string | undefined> => {
  try {
    // Skip cover for >150MB to avoid crash
    if (file.size > 150 * 1024 * 1024) return undefined;
    const buf = await file.slice(0, 30 * 1024 * 1024).arrayBuffer(); // read only first 30MB
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport } as any).promise;
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch { return undefined; }
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
          alert(`${file.name} bigger than 500 MB!`);
          continue;
        }
        const cover = await makeCover(file);
        const id = Date.now().toString() + "-" + i + "-" + file.name.replace(/[^a-z0-9]/gi, "_");
        const newBook = {
          id,
          title: file.name.replace(/\.pdf$/i, ""),
          genre: genre || "FICTION",
          size: file.size,
          file,
          cover, // <-- real cover here!
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
