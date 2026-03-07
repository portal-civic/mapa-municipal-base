import { createEl, empty } from "../utils/dom.js";

export function renderLayerSelector(container, layers, t, onToggle) {
  empty(container);

  const section = createEl("section", "panel-section");
  section.appendChild(createEl("h2", "panel-title", t("layers.title")));

  const list = createEl("div", "layer-list");

  for (const [kind, config] of Object.entries(layers)) {
    const item = createEl("label", "layer-item");
    const check = createEl("input");
    check.type = "checkbox";
    check.checked = Boolean(config.enabled);
    check.addEventListener("change", () => onToggle(kind, check.checked));

    item.appendChild(check);
    item.appendChild(createEl("span", null, t(`layers.${kind}`, kind)));
    list.appendChild(item);
  }

  section.appendChild(list);
  container.appendChild(section);
}
