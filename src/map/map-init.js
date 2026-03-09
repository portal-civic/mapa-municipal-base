export function createMap(config) {
  const map = L.map("map", {
    zoomControl: false,
    minZoom: config.map.minZoom,
    maxZoom: config.map.maxZoom,
  }).setView(config.map.center, config.map.zoom);

  return map;
}
