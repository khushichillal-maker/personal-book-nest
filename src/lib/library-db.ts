import { openDB } from "idb";

const DB_NAME = "my-library-db";
const STORE = "books";

const getDb = () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
};

export const getAllBooks = async (): Promise<any[]> => {
  const db = await getDb();
  return db.getAll(STORE);
};

export const getBook = async (id: string) => {
  const db = await getDb();
  return db.get(STORE, id);
};

export const putBook = async (book: any) => {
  const db = await getDb();
  await db.put(STORE, book);
};

export const deleteBook = async (id: string) => {
  const db = await getDb();
  await db.delete(STORE, id);
};

// These were missing and causing RED X - adding them back
export const defaultProfile = {
  name: "Reader",
  bio: "",
  avatar: "",
};

export const getProfile = async () => defaultProfile;
export const putProfile = async (p: any) => p;

export type Book = any;
export type Profile = any;
