import { createEl, empty } from "../utils/dom.js";

function getActiveLegend(categories, filters) {
  if (!filters || filters.category === "all") {
    return {
      context: null,
      items: categories.items.map((category) => ({
        id: category.id,
        labelKey: `categories.${category.id}`,
        fallback: category.id,
        color: category.color,
      })),
    };
  }

  const category = categories.items.find((item) => item.id === filters.category);
  if (!category) {
    return {
      context: null,
      items: categories.items.map((item) => ({
        id: item.id,
        labelKey: `categories.${item.id}`,
        fallback: item.id,
        color: item.color,
      })),
    };
  }

  if (filters.subcategory === "all") {
    return {
      context: {
        key: `categories.${category.id}`,
        fallback: category.id,
      },
      items: [
        {
          id: category.id,
          labelKey: `categories.${category.id}`,
          fallback: category.id,
          color: category.color,
        },
      ],
    };
  }

  const subcategory = (category.subcategories || []).find((item) => item.id === filters.subcategory);
  const subcategoryId = subcategory?.id || filters.subcategory;

  return {
    context: {
      key: `subcategories.${subcategoryId}`,
      fallback: subcategoryId,
    },
    items: [
      {
        id: `${category.id}-${subcategoryId}`,
        labelKey: `subcategories.${subcategoryId}`,
        fallback: subcategoryId,
        color: category.color,
      },
    ],
  };
}

export function renderLegend(container, { categories, currentFilters, t }) {
  empty(container);
  const legend = getActiveLegend(categories, currentFilters);

  const section = createEl("section", "panel-section");
  section.appendChild(createEl("h2", "panel-title", t("legend.title", "Llegenda")));
  if (legend.context) {
    section.appendChild(createEl("p", "legend-context", t(legend.context.key, legend.context.fallback)));
  }

  const list = createEl("div", "legend-list");

  for (const category of legend.items) {
    const item = createEl("div", "legend-item");
    const swatch = createEl("span", "legend-swatch");
    swatch.style.backgroundColor = category.color || "#9ca3af";
    item.appendChild(swatch);
    item.appendChild(createEl("span", null, t(category.labelKey, category.fallback)));
    list.appendChild(item);
  }

  section.appendChild(list);
  container.appendChild(section);
}
