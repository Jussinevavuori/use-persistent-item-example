import { LocalStoragePersistenceStrategy } from "./LocalStoragePersistenceStrategy";
import { ServerPersistenceStrategy } from "./ServerPersistenceStrategy";
import { SessionStoragePersistenceStrategy } from "./SessionStoragePersistenceStrategy";

/**
 * Options for getting a value using a persistence strategy
 */
export type PersistenceStrategyGetOptions<T> = {
  key: string;
  validate: (t: any) => t is T;
  deserialize?: (serial: string) => T | undefined;
};

/**
 * Options for setting a value using a persistence strategy
 */
export type PersistenceStrategySetOptions<T> = {
  key: string;
  value: T;
  serialize?: (t: T) => string;
};

/**
 * Interface that must be implemented by each persistence strategy
 */
export interface IPersistenceStrategy {
  supportsSync?: boolean;
  get<T>(options: PersistenceStrategyGetOptions<T>): Promise<T | undefined>;
  getSync<T>(options: PersistenceStrategyGetOptions<T>): T | undefined;
  set<T>(options: PersistenceStrategySetOptions<T>): Promise<T>;
  clear(key: string): Promise<void>;
}

/**
 * List of all persistence strategies
 */
export const PersistenceStrategy = {
  LocalStorage: LocalStoragePersistenceStrategy,
  SessionStorage: SessionStoragePersistenceStrategy,
  Server: ServerPersistenceStrategy,
};
