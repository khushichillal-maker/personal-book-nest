import { useCallback, useEffect, useState } from "react";

const KEY = "library-owner";

export function useOwner() {
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    setOwner(localStorage.getItem(KEY) === "1");
  }, []);

  const unlock = useCallback(async (passcode: string) => {
    if (passcode.trim() !== "booknest2026") return false;
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
