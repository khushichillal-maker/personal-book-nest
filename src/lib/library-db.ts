import { openDB } from "idb";

const DB_NAME = "my-library-db";
const STORE = "books";
const PROFILE_STORE = "profile";

const getDb = () => {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        db.createObjectStore(PROFILE_STORE, { keyPath: "id" });
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

export const defaultProfile = {
  id: "profile",
  name: "Reader",
  bio: "Book lover",
  avatar: "",
  favoriteGenre: "FICTION",
};

export const getProfile = async () => {
  try {
    const db = await getDb();
    const p = await db.get(PROFILE_STORE, "profile");
    return p || defaultProfile;
  } catch { return defaultProfile; }
};

export const putProfile = async (p: any) => {
  try {
    const db = await getDb();
    await db.put(PROFILE_STORE, {...p, id: "profile" });
  } catch {}
  return p;
};

export const getProgress = async () => null;
export const putProgress = async (p: any) => p;
export const defaultBooks: any[] = [];
export type Book = any;
export type Profile = any;
export type Progress = any;
