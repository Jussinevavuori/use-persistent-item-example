export type Subscriber<TMessage> = (message: TMessage) => void;

export type Subscribable<TMessage> = {
  publish: (message: TMessage) => void;
  subscribe: (subscriber: Subscriber<TMessage>) => () => void;
};

export function createSubscribable<TMessage>(): Subscribable<TMessage> {
  const subscribers = new Set<(message: TMessage) => void>();

  return {
    publish: (message: TMessage) => {
      subscribers.forEach((s) => s(message));
    },

    subscribe: (subscriber: Subscriber<TMessage>) => {
      subscribers.add(subscriber);
      return () => {
        subscribers.delete(subscriber);
      };
    },
  };
}
