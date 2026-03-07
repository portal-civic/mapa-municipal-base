export function createStore(initialState = {}) {
  let state = structuredClone(initialState);
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function setState(patch) {
    state = {
      ...state,
      ...patch,
    };

    for (const callback of subscribers) {
      callback(state);
    }

    return state;
  }

  function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  return {
    getState,
    setState,
    subscribe,
  };
}
