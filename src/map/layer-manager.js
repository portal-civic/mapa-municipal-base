import { getAreaStyle, getLineStyle, getPointStyle } from "./style-factory.js";
import { bindFeatureInteractions } from "./interactions.js";

function featureMatchesFilters(feature, filters) {
  const props = feature.properties;
  const categoryOk = filters.category === "all" || props.category === filters.category;
  const subcategoryOk = filters.subcategory === "all" || props.subcategory === filters.subcategory;
  const statusOk = filters.status === "all" || props.status === filters.status;

  return categoryOk && subcategoryOk && statusOk;
}

export function createLayerManager({ map, geojson, layerConfig, i18n, onFeatureSelected }) {
  const groups = {
    points: L.layerGroup().addTo(map),
    lines: L.layerGroup().addTo(map),
    areas: L.layerGroup().addTo(map),
  };

  let currentFilters = {
    category: "all",
    subcategory: "all",
    status: "all",
  };

  let visibility = {
    points: true,
    lines: true,
    areas: true,
  };

  function tooltipText(feature) {
    return i18n.featureText(feature, "title") || i18n.featureText(feature, "name");
  }

  function redraw() {
    Object.values(groups).forEach((group) => group.clearLayers());

    const handlers = {
      getTooltipText: tooltipText,
      onClick: onFeatureSelected,
    };

    for (const kind of ["points", "lines", "areas"]) {
      if (!visibility[kind]) {
        continue;
      }

      const dataset = geojson[kind];
      const minZoom = layerConfig[kind]?.minZoom ?? 0;
      if (map.getZoom() < minZoom) {
        continue;
      }

      for (const feature of dataset.features) {
        if (!featureMatchesFilters(feature, currentFilters)) {
          continue;
        }

        let layer;
        if (kind === "points") {
          layer = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], getPointStyle(feature));
        } else if (kind === "lines") {
          layer = L.geoJSON(feature, { style: () => getLineStyle(feature) });
        } else {
          layer = L.geoJSON(feature, { style: () => getAreaStyle(feature) });
        }

        if (layer.eachLayer) {
          layer.eachLayer((inner) => bindFeatureInteractions(inner, feature, handlers));
          groups[kind].addLayer(layer);
        } else {
          bindFeatureInteractions(layer, feature, handlers);
          groups[kind].addLayer(layer);
        }
      }
    }
  }

  map.on("zoomend", redraw);

  return {
    redraw,
    setFilters(filters) {
      currentFilters = {
        ...currentFilters,
        ...filters,
      };
      redraw();
    },
    setVisibility(nextVisibility) {
      visibility = {
        ...visibility,
        ...nextVisibility,
      };
      redraw();
    },
  };
}
