export function getFeatureCenter(feature) {
  const geometry = feature?.geometry;
  if (!geometry) {
    return null;
  }

  const type = geometry.type;
  const coords = geometry.coordinates;

  if (type === "Point") {
    return [coords[1], coords[0]];
  }

  if (type === "LineString" && coords.length) {
    const mid = coords[Math.floor(coords.length / 2)];
    return [mid[1], mid[0]];
  }

  if (type === "Polygon" && coords[0]?.length) {
    const ring = coords[0];
    const mid = ring[Math.floor(ring.length / 2)];
    return [mid[1], mid[0]];
  }

  return null;
}
