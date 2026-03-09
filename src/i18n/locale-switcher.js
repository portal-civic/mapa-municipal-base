import { createEl, empty } from "../utils/dom.js";

const LANGUAGE_LABELS = {
  ca: "VAL",
  es: "CAS",
  en: "ENG",
};

export function renderLocaleSwitcher(container, languages, activeLang, onChange) {
  empty(container);
  container.className = "locale-switcher";

  const segmented = createEl("div", "locale-segmented");
  segmented.setAttribute("role", "group");
  segmented.setAttribute("aria-label", "Canviar idioma");

  for (const lang of languages) {
    const option = createEl("button", "locale-segmented__option");
    option.type = "button";
    option.textContent = LANGUAGE_LABELS[lang] || lang.toUpperCase();
    option.setAttribute("aria-pressed", String(lang === activeLang));
    if (lang === activeLang) {
      option.classList.add("is-active");
    }
    option.addEventListener("click", () => {
      if (lang !== activeLang) {
        onChange(lang);
      }
    });
    segmented.appendChild(option);
  }

  container.appendChild(segmented);
}
