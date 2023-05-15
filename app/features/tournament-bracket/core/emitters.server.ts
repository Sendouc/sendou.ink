import { EventEmitter } from "events";

const globalForEmitter = global as unknown as {
  emitter: EventEmitter | undefined;
};

export const emitter = globalForEmitter.emitter ?? new EventEmitter();

// xxx: test behavior when deployed, do we need if (process.env.NODE_ENV !== 'production') ?
globalForEmitter.emitter = emitter;
