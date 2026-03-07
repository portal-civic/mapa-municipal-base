import { createEl, empty } from "../utils/dom.js";

export function renderHeader(container, { title, subtitle, localeNode, onLeftToggle, onRightToggle, mobileLabel }) {
  empty(container);

  const leftBtn = createEl("button", "mobile-toggle");
  leftBtn.textContent = "☰";
  leftBtn.setAttribute("aria-label", mobileLabel);
  leftBtn.addEventListener("click", onLeftToggle);

  const branding = createEl("div", "branding");
  branding.appendChild(createEl("h1", "branding-title", title));
  branding.appendChild(createEl("p", "branding-subtitle", subtitle));

  const actions = createEl("div", "header-actions");
  actions.appendChild(localeNode);

  const rightBtn = createEl("button", "mobile-toggle");
  rightBtn.textContent = "⚙";
  rightBtn.setAttribute("aria-label", mobileLabel);
  rightBtn.addEventListener("click", onRightToggle);

  container.appendChild(leftBtn);
  container.appendChild(branding);
  container.appendChild(actions);
  container.appendChild(rightBtn);
}
