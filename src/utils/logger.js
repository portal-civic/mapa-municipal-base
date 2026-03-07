export function logInfo(message, payload) {
  console.info(`[mapa-base] ${message}`, payload ?? "");
}

export function logWarn(message, payload) {
  console.warn(`[mapa-base] ${message}`, payload ?? "");
}

export function logError(message, payload) {
  console.error(`[mapa-base] ${message}`, payload ?? "");
}
