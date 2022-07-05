import { useState, useEffect } from "react";
import { IPersistentItem } from "../lib/createPersistentItem";

export function usePersistentItem<T>(item: IPersistentItem<T>) {
  // State for holding current value, automatically updated. Initialize with
  // synchronously gotten value (undefined for async persistence strategies).
  const [value, setValue] = useState<T | undefined>(item.getSync());

  // Initialize value asynchronously for async persistence strategies
  useEffect(() => {
    if (!item.persistenceStrategy.supportsSync) {
      item.get().then((_) => setValue(_));
    }
  }, [setValue, item]);

  // Subscribe to updates and auto-update state
  useEffect(() => item.subscribe((t) => setValue(t)), [setValue, item]);

  // Return current value
  return value;
}
