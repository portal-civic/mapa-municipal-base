export function bindFeatureInteractions(layer, feature, handlers) {
  const tooltipConfig = handlers.getTooltip(feature);
  if (tooltipConfig?.content) {
    layer.bindTooltip(tooltipConfig.content, tooltipConfig.options);
  }

  layer.on("click", () => handlers.onClick(feature));
}
