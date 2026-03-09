import { createEl, empty } from "../utils/dom.js";

export function renderHeader(container, { title, subtitle, localeNode }) {
  empty(container);

  const branding = createEl("div", "branding");
  branding.appendChild(createEl("h1", "branding-title", title));
  branding.appendChild(createEl("p", "branding-subtitle", subtitle));

  const actions = createEl("div", "header-actions");
  actions.appendChild(localeNode);
  container.appendChild(branding);
  container.appendChild(actions);
}
