# My Cozy Library

Build a personal aesthetic library website called "Welcome to my library"

Header: 
- Center title "Welcome to my library" in serif font, subtitle "A personal archive • 8 recommended • A book"
- Below header, filter pills: ALL, NONFICTION, FICTION, MYSTERY & THRILLER, FANTASY, ROMANCE
- Add a small search for "vampire or faerie fantasy romance" like a Goodreads search bar

Main Features:
- Upload PDF button, unlimited storage using IndexedDB
- Auto-generate book cover from first page of PDF using pdf.js, 0.5 scale thumbnail
- Display books as vertical book spines/covers in a horizontal scroll row, like real books on a shelf
- Categories: All Books, Currently Reading, My Fav, Finished
- Each book card: cover image, title, file size in MB
- On click: open detail page with large cover, title, READ button (opens PDF in new tab), MY FAV and FINISHED buttons, DELETE button
- Search bar filters by title
- Dark/Light mode toggle
- About page with curator avatar, bio, editable name/bio/links
- Design style: Minimal, beige background #FFFEF8, card rounded 28px, soft shadows, Instrument Serif font for headings + Inter for body, very clean and Goodreads-glow-up aesthetic

Make it mobile responsive and store everything locally, no backend.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://personal-book-nest.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/29322c30-37ff-42a1-8bd1-67b1d3d1d82b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
