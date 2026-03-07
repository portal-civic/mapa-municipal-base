import { createEl, empty } from "../utils/dom.js";

export function renderFooter(container, { leftText, rightText }) {
  empty(container);
  container.appendChild(createEl("small", null, leftText));
  container.appendChild(createEl("small", null, rightText));
}
