// src/lib/library-db.ts - FINAL GREEN BUILD
export type Book = {
  id: string;
  title: string;
  genre: string;
  size: number;
  file: File;
  cover?: string;
  favorite?: boolean;
  finished?: boolean;
  reading?: boolean;
  progress?: number;
  createdAt: number;
};

export type Profile = {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
};

export const defaultProfile: Profile = {
  id: "owner",
  name: "My Library",
  bio: "A personal archive",
};

const DB_NAME = "personal-book-nest";
const STORE = "books";
const PROFILE_STORE = "profile";
const DB_VERSION = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
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
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as Book[]);
    req.onerror = () => reject(req.error);
  });
}

export async function putBook(book: Book): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(book);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteBook(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBook(id: string): Promise<Book | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as Book | undefined);
    req.onerror = () => reject(req.error);
  });
}

// --- PROFILE FUNCTIONS (fixes your build error) ---

export async function getProfile(): Promise<Profile> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(PROFILE_STORE, "readonly");
    const req = tx.objectStore(PROFILE_STORE).get("owner");
    req.onsuccess = () => resolve((req.result as Profile) || defaultProfile);
    req.onerror = () => resolve(defaultProfile);
  });
}

export async function saveProfile(profile: Profile): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROFILE_STORE, "readwrite");
    tx.objectStore(PROFILE_STORE).put(profile);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
