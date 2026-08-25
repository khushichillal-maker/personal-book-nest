import { useCallback, useEffect, useState } from "react";

const KEY = "library-owner";
// sha256 of the owner passcode (change the hash to change the passcode)
const OWNER_HASH = "d24e49f68b2c76351f8647cc7426be38cbeda72ef4e442540f05c3a882f23747";

async function sha256(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function useOwner() {
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    setOwner(localStorage.getItem(KEY) === "1");
  }, []);

  const unlock = useCallback(async (passcode: string) => {
    const hash = await sha256(passcode);
    if (hash !== OWNER_HASH) return false;
    localStorage.setItem(KEY, "1");
    setOwner(true);
    return true;
  }, []);

  const lock = useCallback(() => {
    localStorage.removeItem(KEY);
    setOwner(false);
  }, []);

  return { owner, unlock, lock };
}
