import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const BookCover = ({ file, title, savedCover }: { file?: File, title: string, savedCover?: string }) => {
  const [cover, setCover] = useState(savedCover);
  useEffect(() => {
    if (cover) return;
    if (!file) return;
    if (file.size > 120 * 1024 * 1024) return; // skip big files
    let cancelled = false;
    (async () => {
      try {
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp } as any).promise;
        if (!cancelled) setCover(canvas.toDataURL("image/jpeg", 0.7));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [file]);

  if (cover) return <img src={cover} alt={title} className="w-full h-full object-cover rounded-[22px]" />;
  return <div className="w-full h-full flex items-center justify-center bg-[#EDE3D5] text-center p-3 text-sm font-serif">{title}</div>;
};
