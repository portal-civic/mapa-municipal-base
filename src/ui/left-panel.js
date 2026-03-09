import { createEl, empty } from "../utils/dom.js";

function statusClass(status) {
  return `status-pill status-${status}`;
}

const DETAIL_FIELDS = ["description", "status", "subcategory", "address", "directions"];

function isPresent(value) {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}

function getFieldsVisibility(leftPanelConfig) {
  const defaults = {
    description: true,
    status: true,
    subcategory: true,
    address: true,
    directions: true,
  };

  const fieldsConfig = leftPanelConfig?.fields;
  if (!fieldsConfig) {
    return defaults;
  }

  if (Array.isArray(fieldsConfig)) {
    const allowed = new Set(fieldsConfig);
    return DETAIL_FIELDS.reduce((acc, key) => {
      acc[key] = allowed.has(key);
      return acc;
    }, {});
  }

  return {
    ...defaults,
    ...fieldsConfig,
  };
}

function buildTopBar({ heading, t, onClose }) {
  const topBar = createEl("div", "detail-topbar");
  topBar.appendChild(createEl("span", "detail-info-badge", "i"));
  topBar.appendChild(createEl("p", "detail-topbar-heading", heading));

  if (onClose) {
    const closeButton = createEl("button", "panel-close detail-close", "×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", t("panel.close", "Tancar"));
    closeButton.addEventListener("click", onClose);
    topBar.appendChild(closeButton);
  }

  return topBar;
}

function buildDetailRow({ label, valueNode, valueClass = "detail-row-value" }) {
  const row = createEl("div", "detail-row");
  row.appendChild(createEl("span", "detail-row-key", label));
  if (typeof valueNode === "string") {
    row.appendChild(createEl("span", valueClass, valueNode));
  } else {
    const valueWrap = createEl("div", valueClass);
    valueWrap.appendChild(valueNode);
    row.appendChild(valueWrap);
  }
  return row;
}

function renderGeneralRows(body, t, generalInfo) {
  const rows = createEl("div", "detail-rows detail-rows-clean");
  const generalText = generalInfo?.descriptionKey
    ? t(generalInfo.descriptionKey, generalInfo.description || t("panel.detail_empty"))
    : generalInfo?.description || t("panel.detail_empty");
  rows.appendChild(buildDetailRow({ label: t("panel.description"), valueNode: generalText }));

  if (generalInfo?.linkUrl) {
    const link = createEl(
      "a",
      "detail-link",
      generalInfo.linkLabelKey
        ? t(generalInfo.linkLabelKey, generalInfo.linkLabel || t("panel.more_info", "Més informació"))
        : generalInfo.linkLabel || t("panel.more_info", "Més informació"),
    );
    link.href = generalInfo.linkUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    rows.appendChild(buildDetailRow({ label: t("panel.link", "Enllaç"), valueNode: link }));
  }

  body.appendChild(rows);
}

export function renderLeftPanelEmpty(container, { t, onClose, branding, leftPanelConfig }) {
  empty(container);

  const section = createEl("section", "panel-section detail-panel-section");
  section.appendChild(
    buildTopBar({
      heading: t("panel.general_heading", "Informació general"),
      t,
      onClose,
    }),
  );

  const body = createEl("div", "detail-body");
  const generalInfo = leftPanelConfig?.generalInfo || {};
  body.appendChild(
    createEl(
      "p",
      "detail-overline",
      generalInfo.overlineKey
        ? t(generalInfo.overlineKey, generalInfo.overline || branding.subtitle)
        : generalInfo.overline || branding.subtitle,
    ),
  );
  body.appendChild(
    createEl(
      "h2",
      "panel-title detail-title",
      generalInfo.titleKey ? t(generalInfo.titleKey, generalInfo.title || branding.title) : generalInfo.title || branding.title,
    ),
  );
  renderGeneralRows(body, t, generalInfo);
  section.appendChild(body);

  container.appendChild(section);
}

export function renderFeatureDetails(container, feature, { t, i18n, onClose, leftPanelConfig }) {
  empty(container);

  const props = feature.properties;
  const fieldsVisibility = getFieldsVisibility(leftPanelConfig);
  const section = createEl("section", "panel-section detail-panel-section");

  const categoryText = t(`categories.${props.category}`, props.category);
  section.appendChild(
    buildTopBar({
      heading: categoryText,
      t,
      onClose,
    }),
  );

  const body = createEl("div", "detail-body");
  body.appendChild(createEl("p", "detail-overline", categoryText));
  body.appendChild(createEl("h2", "panel-title detail-title", i18n.featureText(feature, "title") || t("panel.detail_title")));

  const details = createEl("div", "detail-rows detail-rows-clean");

  const description = i18n.featureText(feature, "description");
  if (fieldsVisibility.description && isPresent(description)) {
    details.appendChild(buildDetailRow({ label: t("panel.description"), valueNode: description }));
  }

  if (fieldsVisibility.status && isPresent(props.status)) {
    const pill = createEl("span", statusClass(props.status), t(`status.${props.status}`, props.status));
    details.appendChild(buildDetailRow({ label: t("panel.status"), valueNode: pill }));
  }

  if (fieldsVisibility.subcategory && isPresent(props.subcategory)) {
    details.appendChild(
      buildDetailRow({
        label: t("panel.subcategory"),
        valueNode: t(`subcategories.${props.subcategory}`, props.subcategory),
      }),
    );
  }

  if (fieldsVisibility.address && isPresent(props.address)) {
    details.appendChild(buildDetailRow({ label: t("panel.address", "Adreça"), valueNode: props.address }));
  }

  if (fieldsVisibility.directions && isPresent(props.directionsUrl)) {
    const link = createEl("a", "detail-link", t("panel.directions", "Com arribar"));
    link.href = props.directionsUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    details.appendChild(buildDetailRow({ label: t("panel.link", "Enllaç"), valueNode: link }));
  }

  if (!details.childNodes.length) {
    details.appendChild(buildDetailRow({ label: t("panel.description"), valueNode: t("panel.no_description") }));
  }

  body.appendChild(details);
  section.appendChild(body);
  container.appendChild(section);
}
