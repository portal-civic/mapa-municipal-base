function statusColor(status) {
  switch (status) {
    case "prevista":
      return "#d97706";
    case "en_execucio":
      return "#2563eb";
    case "finalitzat":
      return "#16a34a";
    default:
      return "#4b5563";
  }
}

export function getPointStyle(feature) {
  return {
    radius: 7,
    color: statusColor(feature.properties.status),
    weight: 2,
    fillColor: "#ffffff",
    fillOpacity: 0.95,
  };
}

export function getLineStyle(feature) {
  return {
    color: statusColor(feature.properties.status),
    weight: 4,
    opacity: 0.85,
  };
}

export function getAreaStyle(feature) {
  return {
    color: statusColor(feature.properties.status),
    weight: 2,
    fillColor: statusColor(feature.properties.status),
    fillOpacity: 0.22,
  };
}
