export function resolveIconPath(projectSlug, iconName) {
  if (!iconName) {
    return null;
  }

  if (/^https?:\/\//i.test(iconName)) {
    return {
      primary: iconName,
      fallback: iconName,
    };
  }

  const normalized = iconName.includes(".") ? iconName : `${iconName}.svg`;

  return {
    primary: `projects/${projectSlug}/icons/${normalized}`,
    fallback: `assets/icons-global/${normalized}`,
  };
}

const HTML_ESCAPE_TABLE = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const POI_MARKER_SIZE = 34;

const ICON_TO_FA_CLASS = {
  "megaphone": "fa-solid fa-bullhorn",
  "bullhorn": "fa-solid fa-bullhorn",
  "bolt": "fa-solid fa-bolt",
  "droplet": "fa-solid fa-droplet",
  "water": "fa-solid fa-droplet",
  "triangle-exclamation": "fa-solid fa-triangle-exclamation",
  "book-open": "fa-solid fa-book-open",
  "trash": "fa-solid fa-trash-can",
  "trash-can": "fa-solid fa-trash-can",
  "landmark": "fa-solid fa-landmark",
  "landmark-dome": "fa-solid fa-landmark",
  "heart-pulse": "fa-solid fa-heart-pulse",
  "heart-circle-bolt": "fa-solid fa-heart-pulse",
  "house-medical": "fa-solid fa-house-medical",
  "person-running": "fa-solid fa-person-running",
  "person-hiking": "fa-solid fa-person-hiking",
  "person-biking": "fa-solid fa-person-biking",
  "person-swimming": "fa-solid fa-person-swimming",
  "person-cane": "fa-solid fa-person-cane",
  "person-dress": "fa-solid fa-person-dress",
  "campground": "fa-solid fa-campground",
  "seedling": "fa-solid fa-seedling",
  "palette": "fa-solid fa-palette",
  "music": "fa-solid fa-music",
  "masks-theater": "fa-solid fa-masks-theater",
  "volleyball": "fa-solid fa-volleyball",
  "faucet-drip": "fa-solid fa-faucet-drip",
  "mortar-pestle": "fa-solid fa-mortar-pestle",
  "hand-holding-heart": "fa-solid fa-hand-holding-heart",
  "hand-fist": "fa-solid fa-hand-fist",
  "hand": "fa-solid fa-hand",
  "eye": "fa-solid fa-eye",
  "dumbbell": "fa-solid fa-dumbbell",
  "basketball": "fa-solid fa-basketball",
  "baseball": "fa-solid fa-baseball",
  "futbol": "fa-solid fa-futbol",
  "sun": "fa-solid fa-sun",
  "mountain": "fa-solid fa-mountain",
  "people-group": "fa-solid fa-users",
  "user-group": "fa-solid fa-users",
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPE_TABLE[char]);
}

function normalizeIconKey(iconName) {
  return String(iconName || "")
    .trim()
    .toLowerCase()
    .split("/")
    .pop()
    .replace(/\.[a-z0-9]+$/i, "");
}

export function resolveFaIconClass(iconName) {
  const raw = String(iconName || "").trim();
  if (!raw) {
    return "fa-solid fa-circle-info";
  }

  if (raw.includes("fa-")) {
    return raw.includes("fa-solid") || raw.includes("fa-regular") || raw.includes("fa-brands")
      ? raw
      : `fa-solid ${raw}`;
  }

  const iconKey = normalizeIconKey(raw);
  return ICON_TO_FA_CLASS[iconKey] || "fa-solid fa-circle-info";
}

export function buildPoiIconMarkup({ color, iconName }) {
  const safeColor = escapeHtml(color || "#4b5563");
  const iconClass = escapeHtml(resolveFaIconClass(iconName));

  return `
    <span class="poi-icon-wrap" style="--poi-color: ${safeColor};">
      <i class="poi-icon-glyph ${iconClass}" aria-hidden="true"></i>
    </span>
  `;
}

export function buildPoiTooltipMarkup({ text, color }) {
  const safeText = escapeHtml(text);
  const safeColor = escapeHtml(color || "#4b5563");

  return `
    <span class="poi-short-tip" style="--poi-tip-color: ${safeColor};">
      <span class="poi-short-tip__label">${safeText}</span>
      <span class="poi-short-tip__arrow" aria-hidden="true"></span>
    </span>
  `;
}
