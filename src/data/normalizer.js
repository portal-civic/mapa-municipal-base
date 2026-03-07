function normalizeFeature(feature, kind, index) {
  const props = feature.properties || {};

  return {
    ...feature,
    properties: {
      ...props,
      id: props.id || `${kind}-${index + 1}`,
      geometry_kind: kind,
    },
  };
}

export function normalizeProjectData(data) {
  return {
    ...data,
    geojson: {
      points: {
        ...data.geojson.points,
        features: data.geojson.points.features.map((f, idx) => normalizeFeature(f, "points", idx)),
      },
      lines: {
        ...data.geojson.lines,
        features: data.geojson.lines.features.map((f, idx) => normalizeFeature(f, "lines", idx)),
      },
      areas: {
        ...data.geojson.areas,
        features: data.geojson.areas.features.map((f, idx) => normalizeFeature(f, "areas", idx)),
      },
    },
  };
}
