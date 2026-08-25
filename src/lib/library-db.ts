const DB_NAME = "my-library-db";
const STORE = "books";
const PROFILE_STORE = "profile";

const getDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        db.createObjectStore(PROFILE_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const withStore = async (storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => void): Promise<any> => {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result: any;
    const req = fn(store) as any;
    if (req && req.onsuccess !== undefined) {
      req.onsuccess = () => result = req.result;
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

export const getAllBooks = async (): Promise<any[]> => {
  const db = await getDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
};

export const getBook = async (id: string) => {
  const db = await getDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
};

export const putBook = async (book: any) => {
  const db = await getDb();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(book);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

export const deleteBook = async (id: string) => {
  const db = await getDb();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

// PROFILE - fixes your about.tsx
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
    return await new Promise<any>((res) => {
      const tx = db.transaction(PROFILE_STORE, "readonly");
      const req = tx.objectStore(PROFILE_STORE).get("profile");
      req.onsuccess = () => res(req.result || defaultProfile);
      req.onerror = () => res(defaultProfile);
    });
  } catch { return defaultProfile; }
};

export const putProfile = async (p: any) => {
  try {
    const db = await getDb();
    await new Promise<void>((res) => {
      const tx = db.transaction(PROFILE_STORE, "readwrite");
      tx.objectStore(PROFILE_STORE).put({ ...p, id: "profile" });
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {}
  return p;
};

export const saveProfile = putProfile;
export type Book = any;
export type Profile = any;
