import { EventEmitter } from "events";

const globalForEmitter = global as unknown as {
  emitter: EventEmitter | undefined;
};

export const emitter = globalForEmitter.emitter ?? new EventEmitter();

globalForEmitter.emitter = emitter;
