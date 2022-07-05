import { createSubscribable } from "./createSubscribable";
import { IPersistenceStrategy } from "./PersistenceStrategy";

export interface IPersistentItem<T> {
  // Interfaces for getting data (sync / async) and subscribing to data updates
  get(): Promise<T | undefined>;
  getSync(): T | undefined;
  subscribe(listener: (t: T | undefined) => void): () => void;

  // Interfaces for updating data (set value, update value with updater function
  // or clear value)
  set(value: T): Promise<T>;
  update(updater: (t: T | undefined) => T): Promise<T>;
  clear(): Promise<void>;

  // Options
  key: string;
  persistenceStrategy: IPersistenceStrategy;
  validate: (t: any) => t is T;
  serialize?: (t: T) => string;
  deserialize?: (string: string) => T | undefined;
}

export function createPersistentItem<T>(options: {
  key: string;
  validate: (t: any) => t is T;
  persistenceStrategy: IPersistenceStrategy;
  serialize?: (t: T) => string;
  deserialize?: (string: string) => T | undefined;
}): IPersistentItem<T> {
  // Create subscribable for item
  const subscribable = createSubscribable<T | undefined>();

  return {
    ...options,

    // Sync getter, only if persistence strategy supports getSync
    getSync() {
      return options.persistenceStrategy.getSync({
        key: options.key,
        validate: options.validate,
        deserialize: options.deserialize
      });
    },

    // Async getter, supported by all persistence strategies
    get() {
      return options.persistenceStrategy.get({
        key: options.key,
        validate: options.validate,
        deserialize: options.deserialize
      });
    },

    // Async setter, publishes an update on success
    async set(value: T) {
      try {
        await options.persistenceStrategy.set({
          value,
          key: options.key,
          serialize: options.serialize
        });
        subscribable.publish(value);
      } catch (e) {
        console.error(e);
      } finally {
        return value;
      }
    },

    // Async setter, takes previous value and updater function, publishes an
    // update on success
    async update(updater: (prev: T | undefined) => T) {
      const prev = await this.get();
      const value = updater(prev);
      try {
        await options.persistenceStrategy.set({
          value,
          key: options.key,
          serialize: options.serialize
        });
        subscribable.publish(value);
      } catch (e) {
        console.error(e);
      } finally {
        return value;
      }
    },

    // Async clear, publishes an update on success
    async clear() {
      try {
        await options.persistenceStrategy.clear(options.key);
        subscribable.publish(undefined);
      } catch (e) {
        console.error(e);
      }
    },

    // this.subscribable.subscribe wrapper
    subscribe(listener: (value: T | undefined) => void) {
      return subscribable.subscribe(listener);
    }
  };
}
