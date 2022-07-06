import {
  IPersistenceStrategy,
  PersistenceStrategyGetOptions,
  PersistenceStrategySetOptions,
} from "./PersistenceStrategy";

export type CreateSyncPersistenceStrategyOptions = {
  get(key: string): string | undefined;
  set(key: string, serial: string): void;
  clear(key: string): void;
};

export function createSyncPersistenceStrategy<T extends {}>(
  methods: CreateSyncPersistenceStrategyOptions
): IPersistenceStrategy {
  return {
    supportsSync: true,

    getSync<T>(opts: PersistenceStrategyGetOptions<T>): T | undefined {
      try {
        const serial = methods.get(opts.key);
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

    async get<T>(
      opts: PersistenceStrategyGetOptions<T>
    ): Promise<T | undefined> {
      return this.getSync(opts);
    },

    async set<T>(opts: PersistenceStrategySetOptions<T>): Promise<T> {
      const serial = opts.serialize
        ? opts.serialize(opts.value)
        : JSON.stringify(opts.value);
      methods.set(opts.key, serial);
      return opts.value;
    },

    async clear(key: string): Promise<void> {
      methods.clear(key);
    },
  };
}

// Example implementation of LocalStoragePersistenceStrategy
const LocalStoragePersistenceStrategy = createSyncPersistenceStrategy({
  get(key: string) {
    return localStorage.getItem(key) ?? undefined;
  },
  set(key: string, serial: string) {
    localStorage.setItem(key, serial);
  },
  clear(key: string) {
    localStorage.removeItem(key);
  },
});
