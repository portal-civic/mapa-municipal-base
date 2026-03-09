import { createEl, empty } from "../utils/dom.js";

const DEFAULT_GENERIC_SUBCATEGORY_IDS = ["general"];

function makeBullet() {
  return createEl("span", "filter-bullet");
}

function makeFilterButton({ text, className, isActive, color, onClick }) {
  const button = createEl("button", className);
  button.type = "button";
  const bullet = makeBullet();
  if (color) bullet.style.setProperty("--filter-color", color);
  button.appendChild(bullet);
  button.appendChild(createEl("span", null, text));
  if (isActive) button.classList.add("active");
  button.addEventListener("click", onClick);
  return button;
}

function buildStatuses(t) {
  return [
    { id: "all", label: t("common.all") },
    { id: "prevista", label: t("status.prevista") },
    { id: "en_execucio", label: t("status.en_execucio") },
    { id: "finalitzat", label: t("status.finalitzat") },
  ];
}

function resolveRightPanelTitle(t, rightPanelConfig = {}) {
  if (rightPanelConfig.titleKey) {
    return t(rightPanelConfig.titleKey, rightPanelConfig.title || t("filters.title"));
  }
  if (rightPanelConfig.title) {
    return rightPanelConfig.title;
  }
  return t("filters.title");
}

function resolveShowSubsections(categories, rightPanelConfig = {}, pointFeatures = []) {
  const configured = rightPanelConfig.showSubsections ?? rightPanelConfig.showSubcategories;
  if (configured === true) return true;
  if (configured === false) return false;

  for (const category of categories.items) {
    if (getVisibleSubcategories(category, rightPanelConfig, pointFeatures).length > 0) {
      return true;
    }
  }

  return false;
}

function resolveShowStatus(rightPanelConfig = {}) {
  if (typeof rightPanelConfig.showStatus === "boolean") {
    return rightPanelConfig.showStatus;
  }
  return rightPanelConfig.showStatusFilter !== false;
}

function getSubcategoriesFromPoints(categoryId, pointFeatures = [], genericSubcategoryIds) {
  const generic = new Set((genericSubcategoryIds || DEFAULT_GENERIC_SUBCATEGORY_IDS).map((id) => `${id}`.toLowerCase()));
  const ids = new Set();

  for (const feature of pointFeatures) {
    const props = feature?.properties || {};
    if (props.category !== categoryId || !props.subcategory) continue;
    const subId = `${props.subcategory}`.toLowerCase().trim();
    if (!subId || generic.has(subId)) continue;
    ids.add(subId);
  }

  return [...ids].map((id) => ({ id }));
}

function getVisibleSubcategories(category, rightPanelConfig = {}, pointFeatures = []) {
  const fromConfig = getVisibleSubcategoriesFromConfig(category, rightPanelConfig.genericSubcategoryIds);
  const fromPoints = getSubcategoriesFromPoints(category.id, pointFeatures, rightPanelConfig.genericSubcategoryIds);
  const merged = new Map();

  for (const subcategory of [...fromConfig, ...fromPoints]) {
    merged.set(`${subcategory.id}`.toLowerCase(), subcategory);
  }

  return [...merged.values()];
}

function getVisibleSubcategoriesFromConfig(category, genericSubcategoryIds) {
  const set = new Set((genericSubcategoryIds || DEFAULT_GENERIC_SUBCATEGORY_IDS).map((id) => `${id}`.toLowerCase()));
  return (category.subcategories || []).filter((subcategory) => !set.has(`${subcategory.id}`.toLowerCase()));
}

export function renderFilters(
  container,
  { categories, pointFeatures = [], currentFilters, t, onFilterChange, rightPanelConfig = {} },
) {
  empty(container);

  const section = createEl("section", "panel-section filters-panel");
  if ((rightPanelConfig.appearance || "").toLowerCase() === "compact") {
    section.classList.add("filters-panel-compact");
  }
  section.appendChild(createEl("h2", "panel-title filters-title", resolveRightPanelTitle(t, rightPanelConfig)));

  const filtersList = createEl("div", "filters-list");
  const showSubcategories = resolveShowSubsections(categories, rightPanelConfig, pointFeatures);
  const showStatusFilter = resolveShowStatus(rightPanelConfig);
  const showAllOption = rightPanelConfig.showAllOption !== false;

  if (showAllOption) {
    filtersList.appendChild(
      makeFilterButton({
        text: t(rightPanelConfig.allLabelKey || "common.all"),
        className: "filters-all filters-all-accent filter-row",
        isActive: currentFilters.category === "all" && currentFilters.subcategory === "all",
        color: "var(--panel-accent)",
        onClick: () => onFilterChange({ category: "all", subcategory: "all" }),
      }),
    );
  }

  for (const category of categories.items) {
    const group = createEl("div", "category-group");
    const categoryLabel = t(`categories.${category.id}`, category.id);
    const categoryActive = currentFilters.category === category.id && currentFilters.subcategory === "all";
    const visibleSubcategories = showSubcategories ? getVisibleSubcategories(category, rightPanelConfig, pointFeatures) : [];

    group.appendChild(
      makeFilterButton({
        text: categoryLabel,
        className: "category-main filter-row",
        isActive: categoryActive,
        color: category.color,
        onClick: () => onFilterChange({ category: category.id, subcategory: "all" }),
      }),
    );

    if (visibleSubcategories.length > 0) {
      const subList = createEl("div", "subcategory-list");
      for (const subcategory of visibleSubcategories) {
        const subLabel = t(`subcategories.${subcategory.id}`, subcategory.id);
        const subActive = currentFilters.category === category.id && currentFilters.subcategory === subcategory.id;

        subList.appendChild(
          makeFilterButton({
            text: subLabel,
            className: "subcategory-item filter-row subcategory-row",
            isActive: subActive,
            color: category.color,
            onClick: () => onFilterChange({ category: category.id, subcategory: subcategory.id }),
          }),
        );
      }
      group.appendChild(subList);
    }

    filtersList.appendChild(group);
  }

  section.appendChild(filtersList);

  if (showStatusFilter) {
    const statuses = buildStatuses(t);
    const statusWrap = createEl("div", "filters-status");
    statusWrap.appendChild(createEl("p", "filters-subtitle", t("filters.status")));
    const pills = createEl("div", "status-pills");

    for (const status of statuses) {
      const button = createEl("button", "status-filter", status.label);
      button.type = "button";
      if (currentFilters.status === status.id) button.classList.add("active");
      button.addEventListener("click", () => onFilterChange({ status: status.id }));
      pills.appendChild(button);
    }

    statusWrap.appendChild(pills);
    section.appendChild(statusWrap);
  }

  container.appendChild(section);
}
