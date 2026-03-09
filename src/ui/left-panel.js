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

function buildGeneralDescriptionNode(text) {
  const value = String(text || "").trim();
  if (!value) {
    return "";
  }

  const paragraphs = value
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return value;
  }

  const wrap = createEl("div", "detail-general-copy");
  for (const paragraph of paragraphs) {
    wrap.appendChild(createEl("p", "detail-general-paragraph", paragraph));
  }
  return wrap;
}

function resolveGeneralSections(t, generalInfo) {
  if (!Array.isArray(generalInfo?.sections)) {
    return [];
  }

  return generalInfo.sections
    .map((section) => {
      const title = section?.titleKey ? t(section.titleKey, section.title || "") : section?.title || "";
      const text = section?.textKey ? t(section.textKey, section.text || "") : section?.text || "";
      return { title: String(title).trim(), text: String(text).trim() };
    })
    .filter((section) => section.title || section.text);
}

function renderGeneralSections(body, sections) {
  const sectionsWrap = createEl("div", "detail-general-sections");

  for (const section of sections) {
    const block = createEl("section", "detail-general-section");
    if (section.title) {
      block.appendChild(createEl("h3", "detail-general-section-title", section.title));
    }

    const textNode = buildGeneralDescriptionNode(section.text);
    if (typeof textNode === "string") {
      block.appendChild(createEl("p", "detail-general-paragraph", textNode));
    } else {
      block.appendChild(textNode);
    }

    sectionsWrap.appendChild(block);
  }

  body.appendChild(sectionsWrap);
}

function renderGeneralRows(body, t, generalInfo) {
  const copyBlock = createEl("div", "detail-general-block");
  const sections = resolveGeneralSections(t, generalInfo);
  if (sections.length) {
    renderGeneralSections(copyBlock, sections);
  } else {
    const generalText = generalInfo?.descriptionKey
      ? t(generalInfo.descriptionKey, generalInfo.description || t("panel.detail_empty"))
      : generalInfo?.description || t("panel.detail_empty");
    const generalDescriptionNode = buildGeneralDescriptionNode(generalText);
    if (typeof generalDescriptionNode === "string") {
      copyBlock.appendChild(createEl("p", "detail-general-paragraph", generalDescriptionNode));
    } else {
      copyBlock.appendChild(generalDescriptionNode);
    }
  }
  body.appendChild(copyBlock);

  if (generalInfo?.linkUrl) {
    const rows = createEl("div", "detail-rows detail-rows-clean");
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
    body.appendChild(rows);
  }
}

export function renderLeftPanelEmpty(container, { t, onClose, branding, leftPanelConfig }) {
  empty(container);
  container.classList.add("is-general");

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
  container.classList.remove("is-general");

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
