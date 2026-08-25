import { useEffect, useState } from "react";
import { getAllBooks, putBook } from "@/lib/library-db";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const formatMb = (b:number) => `${(b/1024/1024).toFixed(1)} MB`;

const generateCoverFromFile = async (file: File) => {
  try {
    if (!file || file.size > 80*1024*1024) return undefined;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale: 0.6 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width; canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
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
    // AUTO-FIX old beige books
    for (const b of all) {
      if (!b.cover && b.file) {
        const c = await generateCoverFromFile(b.file);
        if (c) {
          b.cover = c;
          await putBook(b);
        }
      }
    }
    all.sort((a:any,b:any)=> (b.createdAt||0)-(a.createdAt||0));
    setBooks(all);
    setLoading(false);
  };

  useEffect(()=>{ refresh(); },[]);

  const addFiles = async (fileList: FileList, genre: string) => {
    setBusy(true);
    try{
      for(const file of Array.from(fileList)){
        if(file.size > 500*1024*1024){ 
          alert(file.name+" >500MB skipped"); 
          continue; 
        }
        const id = Date.now()+"-"+Math.random().toString(36).slice(2);
        // Save instantly so book appears on shelf
        const newBook: any = {
          id,
          title: file.name.replace(/\.pdf$/i,"").replace(/OceanofPDF\.com_/gi,"").trim(),
          genre: genre||"FICTION",
          size: file.size,
          file,
          cover: undefined,
          createdAt: Date.now()
        };
        await putBook(newBook);
        // Generate cover in background, then update
        generateCoverFromFile(file).then(async (c)=>{
          if(c){
            newBook.cover = c;
            await putBook(newBook);
            await refresh();
          }
        });
      }
      await refresh();
    } finally{ 
      setBusy(false); 
    }
  };

  return { books, loading, busy, addFiles, refresh, formatMb };
};
