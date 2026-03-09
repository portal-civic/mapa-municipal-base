import { createEl, empty } from "../utils/dom.js";

const SOCIAL_ICON_BY_PLATFORM = {
  facebook: "fa-brands fa-facebook-f",
  instagram: "fa-brands fa-instagram",
  linkedin: "fa-brands fa-linkedin-in",
  tiktok: "fa-brands fa-tiktok",
  youtube: "fa-brands fa-youtube",
  x: "fa-brands fa-x-twitter",
  twitter: "fa-brands fa-x-twitter",
  telegram: "fa-brands fa-telegram",
  whatsapp: "fa-brands fa-whatsapp",
};

function withLinkIfNeeded(node, href, target) {
  if (!href) {
    return node;
  }

  const link = createEl("a", "muni-header__link-wrap");
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

function resolveLabel(item, t) {
  if (!item) {
    return "";
  }
  if (item.labelKey) {
    return t(item.labelKey, item.label || item.labelKey);
  }
  return item.label || "";
}

function buildMenu(items, className, t) {
  const validItems = Array.isArray(items) ? items.filter((item) => resolveLabel(item, t)) : [];
  if (!validItems.length) {
    return null;
  }

  const nav = createEl("nav", `muni-header__menu ${className}`);
  const list = createEl("ul", "muni-header__menu-list");

  for (const item of validItems) {
    const li = createEl("li", "muni-header__menu-item");
    const link = createEl("a", "muni-header__menu-link", resolveLabel(item, t));
    link.href = item.href || "#";
    if (item.target) {
      link.target = item.target;
      if (item.target === "_blank") {
        link.rel = "noopener noreferrer";
      }
    }
    if (item.active) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
    li.appendChild(link);
    list.appendChild(li);
  }

  nav.appendChild(list);
  return nav;
}

function buildSocialLinks(items, t) {
  const validItems = Array.isArray(items) ? items.filter((item) => item?.url) : [];
  if (!validItems.length) {
    return null;
  }

  const wrap = createEl("div", "muni-header__social");
  for (const item of validItems) {
    const platform = String(item.platform || "").toLowerCase();
    const iconClass = item.iconClass || SOCIAL_ICON_BY_PLATFORM[platform] || "fa-solid fa-globe";
    const textLabel = item.labelKey ? t(item.labelKey, item.label || item.platform) : item.label || item.platform;
    const a = createEl("a", "muni-header__social-link");
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", textLabel || platform || "social");
    const icon = createEl("i", `muni-header__social-icon ${iconClass}`);
    icon.setAttribute("aria-hidden", "true");
    a.appendChild(icon);
    wrap.appendChild(a);
  }
  return wrap;
}

function resolveHeaderConfig(projectConfig) {
  const header = projectConfig?.header || {};
  const blocks = header.blocks || {};
  const fallbackBrand = projectConfig?.branding || {};

  return {
    enabled: header.enabled !== false,
    showBrand: (blocks.brand ?? header.showBrand) !== false,
    showBadges: (blocks.badges ?? header.showBadges) !== false,
    showPrimaryMenu: (blocks.primaryMenu ?? header.showPrimaryMenu) !== false,
    showSecondaryMenu: (blocks.secondaryMenu ?? header.showSecondaryMenu) !== false,
    showSocialLinks: (blocks.social ?? header.showSocialLinks) === true,
    showLanguageSwitcher: (blocks.languageSwitcher ?? header.showLanguageSwitcher) !== false,
    variant: header.variant || "default",
    brand: header.brand || {
      title: fallbackBrand.title || "",
      subtitle: fallbackBrand.subtitle || "",
      titleKey: fallbackBrand.titleKey,
      subtitleKey: fallbackBrand.subtitleKey,
    },
    returnLink: header.returnLink || null,
    badges: Array.isArray(header.badges) ? header.badges : [],
    primaryMenu: Array.isArray(header.primaryMenu) ? header.primaryMenu : [],
    secondaryMenu: Array.isArray(header.secondaryMenu) ? header.secondaryMenu : [],
    socialLinks: Array.isArray(header.socialLinks) ? header.socialLinks : [],
  };
}

export function renderHeader(container, { config, t, localeNode }) {
  empty(container);

  const headerConfig = resolveHeaderConfig(config);
  if (!headerConfig.enabled) {
    return false;
  }

  const root = createEl("div", "muni-header");
  const variantClass = `muni-header--${String(headerConfig.variant).replace(/[^a-z0-9-_]/gi, "")}`;
  root.classList.add(variantClass);
  const top = createEl("div", "muni-header__top");
  const left = createEl("div", "muni-header__left");
  const center = createEl("div", "muni-header__center");
  const right = createEl("div", "muni-header__right");

  if (headerConfig.showBrand) {
    const brandWrap = createEl("div", "muni-header__brand");
    const logo = headerConfig.brand?.logo || {};
    if (logo.enabled && logo.src) {
      const img = createEl("img", "muni-header__brand-logo");
      img.src = logo.src;
      img.alt = logo.alt || headerConfig.brand?.title || "Logo";
      brandWrap.appendChild(withLinkIfNeeded(img, logo.href, logo.target));
    }

    const title = headerConfig.brand?.titleKey
      ? t(headerConfig.brand.titleKey, headerConfig.brand.title || "")
      : headerConfig.brand?.title || "";
    const subtitle = headerConfig.brand?.subtitleKey
      ? t(headerConfig.brand.subtitleKey, headerConfig.brand.subtitle || "")
      : headerConfig.brand?.subtitle || "";

    if (title || subtitle) {
      const text = createEl("div", "muni-header__brand-text");
      if (title) {
        text.appendChild(createEl("h1", "muni-header__brand-title", title));
      }
      if (subtitle) {
        text.appendChild(createEl("p", "muni-header__brand-subtitle", subtitle));
      }
      brandWrap.appendChild(text);
    }

    if (brandWrap.childElementCount) {
      left.appendChild(brandWrap);
    }
  }

  if (headerConfig.showBadges && headerConfig.badges.length) {
    const badges = createEl("div", "muni-header__badges");
    for (const badge of headerConfig.badges) {
      if (!badge?.src) {
        continue;
      }
      const badgeWrap = createEl("span", "muni-header__badge");
      const img = createEl("img", "muni-header__badge-img");
      img.src = badge.src;
      img.alt = badge.alt || "Badge";
      badgeWrap.appendChild(img);
      badges.appendChild(withLinkIfNeeded(badgeWrap, badge.href, badge.target));
    }
    if (badges.childElementCount) {
      center.appendChild(badges);
    }
  }

  if (headerConfig.showPrimaryMenu) {
    const primaryMenu = buildMenu(headerConfig.primaryMenu, "muni-header__menu--primary", t);
    if (primaryMenu) {
      center.appendChild(primaryMenu);
    }
  }

  if (headerConfig.showSecondaryMenu) {
    const secondaryMenu = buildMenu(headerConfig.secondaryMenu, "muni-header__menu--secondary", t);
    if (secondaryMenu) {
      center.appendChild(secondaryMenu);
    }
  }

  if (headerConfig.showSocialLinks) {
    const social = buildSocialLinks(headerConfig.socialLinks, t);
    if (social) {
      right.appendChild(social);
    }
  }

  if (headerConfig.returnLink?.enabled !== false && headerConfig.returnLink?.href) {
    const label = headerConfig.returnLink.labelKey
      ? t(headerConfig.returnLink.labelKey, headerConfig.returnLink.label || "")
      : headerConfig.returnLink.label || "";
    if (label) {
      const backLink = createEl("a", "muni-header__back-link", label);
      backLink.href = headerConfig.returnLink.href;
      if (headerConfig.returnLink.target) {
        backLink.target = headerConfig.returnLink.target;
        if (headerConfig.returnLink.target === "_blank") {
          backLink.rel = "noopener noreferrer";
        }
      }
      right.appendChild(backLink);
    }
  }

  if (headerConfig.showLanguageSwitcher && localeNode) {
    const langWrap = createEl("div", "muni-header__lang");
    langWrap.appendChild(localeNode);
    right.appendChild(langWrap);
  }

  if (left.childElementCount) {
    top.appendChild(left);
  }
  if (center.childElementCount) {
    top.appendChild(center);
  }
  if (right.childElementCount) {
    top.appendChild(right);
  }
  if (top.childElementCount) {
    root.appendChild(top);
  }

  if (!root.childElementCount) {
    return false;
  }

  container.appendChild(root);
  return true;
}
