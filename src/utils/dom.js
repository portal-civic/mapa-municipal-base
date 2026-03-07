export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (typeof text === "string") {
    el.textContent = text;
  }
  return el;
}

export function empty(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
