import {
  IPersistenceStrategy,
  PersistenceStrategyGetOptions,
  PersistenceStrategySetOptions,
} from "./PersistenceStrategy";

// Utility function for URLs
function getUrl(key: string) {
  return `http://localhost:4000/?key=${key}`;
}

export const ServerPersistenceStrategy: IPersistenceStrategy = {
  // Server strategy does not support synchronous operations
  supportsSync: false,

  // Server strategy cannot return value synchronously, always return undefined
  getSync<T>(opts: PersistenceStrategyGetOptions<T>): T | undefined {
    return undefined;
  },

  // Server strategy can get item asynchronously
  async get<T>(opts: PersistenceStrategyGetOptions<T>): Promise<T | undefined> {
    try {
      // Get serial value from server
      const serial = await fetch(getUrl(opts.key)).then((res) => res.text());

      // No value found, return undefined
      if (!serial) return undefined;

      // Deserialize
      const value = opts.deserialize
        ? opts.deserialize(serial)
        : JSON.parse(serial);

      // Serialization failed
      if (!value) return undefined;

      // Validate, return value or undefined on invalid validation
      if (opts.validate(value)) return value;
      return undefined;
    } catch (e) {
      return undefined;
    }
  },

  // Server strategy setter
  async set<T>(opts: PersistenceStrategySetOptions<T>): Promise<T> {
    // Stringify value
    const serial = opts.serialize
      ? opts.serialize(opts.value)
      : JSON.stringify(opts.value);

    // Send to server
    await fetch(getUrl(opts.key), {
      method: "POST",
      body: serial,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    // Return value
    return opts.value;
  },

  // Local storage clear
  async clear(key: string): Promise<void> {
    // Clear value from server
    await fetch(getUrl(key), { method: "DELETE" });
  },
};
