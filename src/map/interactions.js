export function bindFeatureInteractions(layer, feature, handlers) {
  layer.bindTooltip(handlers.getTooltipText(feature), {
    direction: "top",
    opacity: 0.95,
    sticky: true,
  });

  layer.on("click", () => handlers.onClick(feature));
}
