import { createEl, empty } from "../utils/dom.js";

function withOptionalLink(node, href, target) {
  if (!href) {
    return node;
  }
  const link = createEl("a", "app-footer__link-wrap");
  link.href = href;
  if (target) {
    link.target = target;
    if (target === "_blank") {
      link.rel = "noopener noreferrer";
    }
  }
  link.appendChild(node);
  return link;
}

function resolveFooterConfig(projectConfig) {
  const footer = projectConfig?.footer || {};
  return {
    enabled: footer.enabled !== false,
    style: footer.style || "default",
    leftText: footer.leftText || "",
    leftTextKey: footer.leftTextKey || "",
    rightText: footer.rightText || "",
    rightTextKey: footer.rightTextKey || "",
    logos: Array.isArray(footer.logos) ? footer.logos : [],
  };
}

function renderLogoItem(logo) {
  const item = createEl("span", "app-footer__logo-item");

  if (logo?.src) {
    const img = createEl("img", "app-footer__logo-img");
    img.src = logo.src;
    img.alt = logo.alt || logo.label || "Logo";
    item.appendChild(img);
  } else {
    item.classList.add("is-placeholder");
    item.appendChild(createEl("span", "app-footer__logo-placeholder", logo?.label || logo?.name || "Logo"));
  }

  return withOptionalLink(item, logo?.href, logo?.target);
}

export function renderFooter(container, { config, t, project, leftText, rightText }) {
  empty(container);

  const footer = resolveFooterConfig(config);
  if (!footer.enabled) {
    return false;
  }

  const root = createEl("div", "app-footer__content");
  root.classList.add(`app-footer__content--${String(footer.style).replace(/[^a-z0-9-_]/gi, "")}`);

  const left = createEl(
    "small",
    "app-footer__text",
    footer.leftTextKey ? t(footer.leftTextKey, footer.leftText || leftText || "") : footer.leftText || leftText || "",
  );
  root.appendChild(left);

  if (footer.logos.length) {
    const logosWrap = createEl("div", "app-footer__logos");
    for (const logo of footer.logos) {
      if (!logo?.enabled && logo?.enabled !== undefined) {
        continue;
      }
      const label = logo?.labelKey ? t(logo.labelKey, logo.label || logo.name || "") : logo?.label || logo?.name || "";
      logosWrap.appendChild(renderLogoItem({ ...logo, label }));
    }
    if (logosWrap.childElementCount) {
      root.appendChild(logosWrap);
    }
  }

  const finalRightText =
    footer.rightTextKey ? t(footer.rightTextKey, footer.rightText || rightText || "") : footer.rightText || rightText || "";
  const rightValue = finalRightText || (project ? `${t("footer.right", "Projecte")}: ${project}` : "");
  if (rightValue) {
    root.appendChild(createEl("small", "app-footer__text app-footer__text--right", rightValue));
  }

  container.appendChild(root);
  return true;
}
