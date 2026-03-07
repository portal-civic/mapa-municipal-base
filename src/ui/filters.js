import { createEl, empty } from "../utils/dom.js";

function makeSelectRow({ labelText, options, selected, onChange }) {
  const row = createEl("div", "form-row");
  row.appendChild(createEl("label", null, labelText));

  const select = createEl("select", "select");

  for (const option of options) {
    const opt = createEl("option", null, option.label);
    opt.value = option.value;
    opt.selected = option.value === selected;
    select.appendChild(opt);
  }

  select.addEventListener("change", (event) => onChange(event.target.value));
  row.appendChild(select);

  return row;
}

export function renderFilters(container, { categories, currentFilters, t, onFilterChange }) {
  empty(container);

  const section = createEl("section", "panel-section");
  section.appendChild(createEl("h2", "panel-title", t("filters.title")));

  const allOption = { value: "all", label: t("common.all") };
  const statusOptions = [
    allOption,
    { value: "prevista", label: t("status.prevista") },
    { value: "en_execucio", label: t("status.en_execucio") },
    { value: "finalitzat", label: t("status.finalitzat") },
  ];

  const categoryOptions = [
    allOption,
    ...categories.items.map((cat) => ({
      value: cat.id,
      label: t(`categories.${cat.id}`, cat.id),
    })),
  ];

  const selectedCategory = categories.items.find((cat) => cat.id === currentFilters.category);
  const subcategoryOptions = [
    allOption,
    ...((selectedCategory?.subcategories || []).map((sub) => ({
      value: sub.id,
      label: t(`subcategories.${sub.id}`, sub.id),
    }))),
  ];

  section.appendChild(
    makeSelectRow({
      labelText: t("filters.category"),
      options: categoryOptions,
      selected: currentFilters.category,
      onChange: (value) => onFilterChange({ category: value, subcategory: "all" }),
    }),
  );

  section.appendChild(
    makeSelectRow({
      labelText: t("filters.subcategory"),
      options: subcategoryOptions,
      selected: currentFilters.subcategory,
      onChange: (value) => onFilterChange({ subcategory: value }),
    }),
  );

  section.appendChild(
    makeSelectRow({
      labelText: t("filters.status"),
      options: statusOptions,
      selected: currentFilters.status,
      onChange: (value) => onFilterChange({ status: value }),
    }),
  );

  container.appendChild(section);
}
