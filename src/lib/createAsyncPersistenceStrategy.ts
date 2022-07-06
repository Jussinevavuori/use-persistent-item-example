import {
  IPersistenceStrategy,
  PersistenceStrategyGetOptions,
  PersistenceStrategySetOptions,
} from "./PersistenceStrategy";

export type CreateAsyncPersistenceStrategyOptions = {
  get(key: string): Promise<string | undefined>;
  set(key: string, serial: string): Promise<void>;
  clear(key: string): Promise<void>;
};

export function createAsyncPersistenceStrategy<T extends {}>(
  methods: CreateAsyncPersistenceStrategyOptions
): IPersistenceStrategy {
  return {
    supportsSync: false,

    getSync<T>(opts: PersistenceStrategyGetOptions<T>): T | undefined {
      return undefined;
    },

    async get<T>(
      opts: PersistenceStrategyGetOptions<T>
    ): Promise<T | undefined> {
      try {
        const serial = await methods.get(opts.key);
        if (!serial) return undefined;
        const value = opts.deserialize
          ? opts.deserialize(serial)
          : JSON.parse(serial);
        if (!value) return undefined;
        if (opts.validate(value)) return value;
        return undefined;
      } catch (e) {
        return undefined;
      }
    },

    async set<T>(opts: PersistenceStrategySetOptions<T>): Promise<T> {
      const serial = opts.serialize
        ? opts.serialize(opts.value)
        : JSON.stringify(opts.value);
      await methods.set(opts.key, serial);
      return opts.value;
    },

    async clear(key: string): Promise<void> {
      await methods.clear(key);
    },
  };
}

// Example implementation of ServerPersistenceStrategy
const ServerPersistenceStrategy = createAsyncPersistenceStrategy({
  async get(key: string) {
    return fetch(getUrl(key)).then((res) => res.text());
  },
  async set(key: string, serial: string) {
    await fetch(getUrl(key), {
      method: "POST",
      body: serial,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
  async clear(key: string) {
    await fetch(getUrl(key), { method: "DELETE" });
  },
});

// Utility function for URLs
function getUrl(key: string) {
  return `http://localhost:4000/?key=${key}`;
}
