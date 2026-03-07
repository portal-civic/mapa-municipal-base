import { createEl, empty } from "../utils/dom.js";

function statusClass(status) {
  return `status-pill status-${status}`;
}

export function renderLeftPanelEmpty(container, t) {
  empty(container);

  const section = createEl("section", "panel-section");
  section.appendChild(createEl("h2", "panel-title", t("panel.detail_title")));
  section.appendChild(createEl("p", null, t("panel.detail_empty")));

  container.appendChild(section);
}

export function renderFeatureDetails(container, feature, { t, i18n }) {
  empty(container);

  const props = feature.properties;
  const section = createEl("section", "panel-section");

  section.appendChild(createEl("h2", "panel-title", i18n.featureText(feature, "title") || t("panel.detail_title")));

  const descriptionBox = createEl("div", "detail-kv");
  descriptionBox.appendChild(createEl("strong", null, t("panel.description")));
  descriptionBox.appendChild(createEl("p", null, i18n.featureText(feature, "description") || t("panel.no_description")));
  section.appendChild(descriptionBox);

  const details = createEl("div", "details-list");

  const category = createEl("div", "detail-kv");
  category.appendChild(createEl("strong", null, t("panel.category")));
  category.appendChild(createEl("p", null, t(`categories.${props.category}`, props.category)));

  const subcategory = createEl("div", "detail-kv");
  subcategory.appendChild(createEl("strong", null, t("panel.subcategory")));
  subcategory.appendChild(createEl("p", null, t(`subcategories.${props.subcategory}`, props.subcategory)));

  const status = createEl("div", "detail-kv");
  status.appendChild(createEl("strong", null, t("panel.status")));
  const pill = createEl("span", statusClass(props.status), t(`status.${props.status}`, props.status));
  status.appendChild(pill);

  details.appendChild(category);
  details.appendChild(subcategory);
  details.appendChild(status);

  section.appendChild(details);
  container.appendChild(section);
}
