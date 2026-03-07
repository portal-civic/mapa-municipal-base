const REQUIRED_STATUSES = new Set(["prevista", "en_execucio", "finalitzat"]);

export function validateProjectData(data) {
  if (!data?.config || !data?.layers || !data?.geojson) {
    throw new Error("Dades del projecte incompletes");
  }

  for (const [kind, collection] of Object.entries(data.geojson)) {
    if (collection?.type !== "FeatureCollection") {
      throw new Error(`${kind}.geojson no és un FeatureCollection vàlid`);
    }

    for (const feature of collection.features) {
      const props = feature.properties || {};
      if (!props.category || !props.subcategory || !props.status) {
        throw new Error(`Feature sense camps obligatoris a ${kind}.geojson`);
      }

      if (!REQUIRED_STATUSES.has(props.status)) {
        throw new Error(`Status no vàlid: ${props.status}`);
      }
    }
  }
}
