import { getAreaStyle, getLineStyle, getPointStyle } from "./style-factory.js";
import { bindFeatureInteractions } from "./interactions.js";
import {
  buildPoiIconMarkup,
  buildPoiTooltipMarkup,
  POI_MARKER_SIZE,
} from "../utils/icons.js";

function featureMatchesFilters(feature, filters) {
  const props = feature.properties;
  const categoryOk = filters.category === "all" || props.category === filters.category;
  const subcategoryOk = filters.subcategory === "all" || props.subcategory === filters.subcategory;
  const statusOk = filters.status === "all" || props.status === filters.status;

  return categoryOk && subcategoryOk && statusOk;
}

export function createLayerManager({ map, geojson, layerConfig, i18n, onFeatureSelected, projectSlug }) {
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

  function tooltipText(feature) {
    return i18n.featureText(feature, "title") || i18n.featureText(feature, "name");
  }

  function resolveFeatureColor(feature) {
    return feature?.properties?.color || getPointStyle(feature).color || "#4b5563";
  }

  function tooltipForFeature(feature) {
    const text = tooltipText(feature);
    if (!text) {
      return null;
    }

    if (feature.properties.geometry_kind === "points") {
      const color = resolveFeatureColor(feature);
      return {
        content: buildPoiTooltipMarkup({ text, color }),
        options: {
          direction: "top",
          opacity: 1,
          sticky: true,
          offset: [0, -(POI_MARKER_SIZE / 2 + 10)],
          className: "poi-short-tooltip",
        },
      };
    }

    return {
      content: text,
      options: {
        direction: "top",
        opacity: 0.95,
        sticky: true,
      },
    };
  }

  function buildPointLayer(feature) {
    const [lng, lat] = feature.geometry.coordinates;
    const iconName = feature.properties.icon;
    const pointColor = resolveFeatureColor(feature);
    const iconMarkup = buildPoiIconMarkup({ color: pointColor, iconName });

    const markerIcon = L.divIcon({
      className: "poi-icon-marker",
      html: iconMarkup,
      iconSize: [POI_MARKER_SIZE, POI_MARKER_SIZE],
      iconAnchor: [POI_MARKER_SIZE / 2, POI_MARKER_SIZE / 2],
      popupAnchor: [0, -(POI_MARKER_SIZE / 2)],
    });

    return L.marker([lat, lng], { icon: markerIcon });
  }

  function redraw() {
    Object.values(groups).forEach((group) => group.clearLayers());

    const handlers = {
      getTooltip: tooltipForFeature,
      onClick: onFeatureSelected,
    };

    for (const kind of ["points", "lines", "areas"]) {
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
          layer = buildPointLayer(feature);
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
  };
}
