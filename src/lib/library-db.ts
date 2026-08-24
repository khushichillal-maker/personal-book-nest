export type Book = {
  id: string;
  title: string;
  size: number;
  addedAt: number;
  cover?: string;
  favorite: boolean;
  finished: boolean;
  reading: boolean;
  genre: string;
  file: Blob;
};

const DB_NAME = "my-library";
const STORE = "books";
const PROFILE = "profile";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(PROFILE)) db.createObjectStore(PROFILE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = fn(db.transaction(store, mode).objectStore(store));
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      }),
  );
}

export const listBooks = () => tx<Book[]>(STORE, "readonly", (s) => s.getAll());
export const getBook = (id: string) => tx<Book | undefined>(STORE, "readonly", (s) => s.get(id));
export const putBook = (book: Book) => tx<IDBValidKey>(STORE, "readwrite", (s) => s.put(book));
export const deleteBook = (id: string) => tx<undefined>(STORE, "readwrite", (s) => s.delete(id));

export type Profile = {
  name: string;
  bio: string;
  links: string;
  avatar?: string;
};

export const defaultProfile: Profile = {
  name: "The Curator",
  bio: "Reader of long winters and longer novels. This shelf is a slow archive of everything I have loved, abandoned, and returned to.",
  links: "letterboxd.com/curator",
};

export const getProfile = () =>
  tx<Profile | undefined>(PROFILE, "readonly", (s) => s.get("me")).then((p) => p ?? defaultProfile);
export const saveProfile = (p: Profile) => tx<IDBValidKey>(PROFILE, "readwrite", (s) => s.put(p, "me"));
