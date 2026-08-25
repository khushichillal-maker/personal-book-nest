import { openDB, type DBSchema } from "idb";

export type Book = {
  id: string;
  title: string;
  genre: string;
  size: number;
  file: Blob;
  cover?: string;
  favorite?: boolean;
  finished?: boolean;
  reading?: boolean;
  createdAt: number;
};

interface LibraryDB extends DBSchema {
  books: {
    key: string;
    value: Book;
  };
}

const DB_NAME = "my-library-db";
const STORE = "books";

const getDb = () => openDB<LibraryDB>(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: "id" });
    }
  },
});

export const getAllBooks = async (): Promise<Book[]> => {
  const db = await getDb();
  return db.getAll(STORE);
};

export const getBook = async (id: string) => {
  const db = await getDb();
  return db.get(STORE, id);
};

export const putBook = async (book: Book) => {
  const db = await getDb();
  await db.put(STORE, book);
};

export const deleteBook = async (id: string) => {
  const db = await getDb();
  await db.delete(STORE, id);
};
