export function createEventBus() {
  const listeners = new Map();

  function on(event, handler) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }

    listeners.get(event).add(handler);

    return () => off(event, handler);
  }

  function off(event, handler) {
    const eventHandlers = listeners.get(event);
    if (!eventHandlers) {
      return;
    }

    eventHandlers.delete(handler);
  }

  function emit(event, payload) {
    const eventHandlers = listeners.get(event);
    if (!eventHandlers) {
      return;
    }

    for (const handler of eventHandlers) {
      handler(payload);
    }
  }

  return { on, off, emit };
}
