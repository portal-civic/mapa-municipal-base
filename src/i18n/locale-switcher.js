import { createEl, empty } from "../utils/dom.js";

export function renderLocaleSwitcher(container, languages, activeLang, onChange) {
  empty(container);

  const select = createEl("select", "select");
  select.setAttribute("aria-label", "Canviar idioma");

  for (const lang of languages) {
    const opt = createEl("option", null, lang.toUpperCase());
    opt.value = lang;
    opt.selected = lang === activeLang;
    select.appendChild(opt);
  }

  select.addEventListener("change", (event) => onChange(event.target.value));
  container.appendChild(select);
}
