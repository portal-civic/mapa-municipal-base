function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function setupBasemaps(map, config) {
  const grayscale = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: config.map.maxZoom,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
  }).addTo(map);

  const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: config.map.maxZoom,
    attribution: "Tiles &copy; Esri",
    opacity: 0,
  }).addTo(map);

  const start = config.basemapCrossfade.startZoom;
  const end = config.basemapCrossfade.endZoom;

  function applyCrossfade() {
    const zoom = map.getZoom();
    const progress = clamp((zoom - start) / (end - start), 0, 1);
    satellite.setOpacity(progress);
  }

  map.on("zoom move", applyCrossfade);
  applyCrossfade();

  return { grayscale, satellite };
}
