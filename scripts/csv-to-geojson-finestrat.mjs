import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const inputPath = path.join(root, "projects", "finestrat-salut", "raw", "finestrat-salut-net.csv");
const mapPath = path.join(root, "projects", "finestrat-salut", "raw", "category-map.json");
const outputPath = path.join(root, "projects", "finestrat-salut", "points.geojson");
const categoriesOutputPath = path.join(root, "projects", "finestrat-salut", "categories.json");
const CATEGORY_COLORS = {
  espais_naturals: "#8ed581",
  equipaments_esportius_culturals: "#f06636",
  associacions_iniciatives: "#487bb6",
  serveis_sociosanitaris_socials: "#e9d500",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (ch === "\r") {
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function toSlugFallback(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function sanitizeText(value) {
  return (value || "").trim();
}

function toFiniteOrder(value) {
  const parsed = Number.parseInt(`${value}`.trim(), 10);
  return Number.isFinite(parsed) ? parsed : 9999;
}

async function main() {
  const [csvRaw, categoryMapRaw] = await Promise.all([
    readFile(inputPath, "utf8"),
    readFile(mapPath, "utf8"),
  ]);

  const csvText = csvRaw.replace(/^\uFEFF/, "");
  const rows = parseCsv(csvText);
  const header = rows[0] || [];
  const body = rows.slice(1);

  const idx = Object.fromEntries(header.map((name, i) => [name, i]));
  const requiredHeaders = ["name", "lat", "lng", "mainCategory", "icon", "address", "directionsUrl"];

  for (const key of requiredHeaders) {
    if (typeof idx[key] !== "number") {
      throw new Error(`Falta columna requerida: ${key}`);
    }
  }

  const categoryMap = JSON.parse(categoryMapRaw);
  const features = [];
  const discarded = [];
  const categoriesDetected = new Set();
  const iconsDetected = new Set();
  const categoryMetaMap = new Map();

  for (let i = 0; i < body.length; i += 1) {
    const row = body[i];
    const line = i + 2;

    const name = sanitizeText(row[idx.name]);
    const lat = Number.parseFloat(sanitizeText(row[idx.lat]));
    const lng = Number.parseFloat(sanitizeText(row[idx.lng]));
    const sourceCategoryLabel = sanitizeText(row[idx.mainCategory]);
    const sourceSubcategoryLabel = typeof idx.subcategory === "number" ? sanitizeText(row[idx.subcategory]) : "";
    const sourceCategoryId = typeof idx.mainCategoryId === "number" ? sanitizeText(row[idx.mainCategoryId]) : "";
    const sourceSubcategoryId = typeof idx.subcategoryId === "number" ? sanitizeText(row[idx.subcategoryId]) : "";
    const sourceCategoryOrder = typeof idx.categoryOrder === "number" ? sanitizeText(row[idx.categoryOrder]) : "";
    const sourceCategoryColor = typeof idx.color === "number" ? sanitizeText(row[idx.color]) : "";
    const iconNameRaw = sanitizeText(row[idx.icon]);

    if (!name || !sourceCategoryLabel || !isValidLatLng(lat, lng)) {
      discarded.push({ line, reason: "missing_required_or_invalid_coordinates" });
      continue;
    }

    const category = sourceCategoryId || categoryMap[sourceCategoryLabel] || toSlugFallback(sourceCategoryLabel);
    const subcategory = sourceSubcategoryId || (sourceSubcategoryLabel ? toSlugFallback(sourceSubcategoryLabel) : "general");
    const categoryOrder = toFiniteOrder(sourceCategoryOrder);
    const categoryColor = sourceCategoryColor || CATEGORY_COLORS[category] || "#4b5563";
    categoriesDetected.add(sourceCategoryLabel);

    const iconName = iconNameRaw ? `${iconNameRaw}.svg` : "";
    if (iconName) {
      iconsDetected.add(iconNameRaw);
    }

    const existingCategoryMeta = categoryMetaMap.get(category);
    if (!existingCategoryMeta) {
      categoryMetaMap.set(category, {
        id: category,
        color: categoryColor,
        order: categoryOrder,
        sourceLabel: sourceCategoryLabel,
        firstSeen: i,
        subcategories: new Map(),
      });
    } else if (categoryOrder < existingCategoryMeta.order) {
      existingCategoryMeta.order = categoryOrder;
    }

    const categoryMeta = categoryMetaMap.get(category);
    const subExisting = categoryMeta.subcategories.get(subcategory);
    if (!subExisting) {
      categoryMeta.subcategories.set(subcategory, {
        id: subcategory,
        sourceLabel: sourceSubcategoryLabel || "General",
        firstSeen: i,
      });
    }

    const feature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        category,
        subcategory,
        categoryOrder,
        status: "finalitzat",
        title_ca: name,
        title_es: name,
        title_en: name,
        description_ca: "",
        description_es: "",
        description_en: "",
        icon: iconName,
        color: categoryColor,
        address: sanitizeText(row[idx.address]),
        directionsUrl: sanitizeText(row[idx.directionsUrl]),
        sourceCategoryLabel,
        sourceSubcategoryLabel,
      },
    };

    features.push(feature);
  }

  const output = {
    type: "FeatureCollection",
    features,
  };

  const categoriesOutput = {
    items: [...categoryMetaMap.values()]
      .sort((a, b) => (a.order - b.order) || (a.firstSeen - b.firstSeen) || a.sourceLabel.localeCompare(b.sourceLabel, "ca"))
      .map((category) => {
        const subcategories = [...category.subcategories.values()]
          .sort((a, b) => (a.firstSeen - b.firstSeen) || a.sourceLabel.localeCompare(b.sourceLabel, "ca"))
          .map((subcategory) => ({ id: subcategory.id }));
        return {
          id: category.id,
          color: category.color,
          subcategories,
        };
      }),
  };

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  await writeFile(categoriesOutputPath, `${JSON.stringify(categoriesOutput, null, 2)}\n`, "utf8");

  console.log("[csv->geojson] input rows:", body.length);
  console.log("[csv->geojson] features generated:", features.length);
  console.log("[csv->geojson] rows discarded:", discarded.length);
  console.log("[csv->geojson] categories detected:", [...categoriesDetected].sort().join(" | "));
  console.log("[csv->geojson] icons detected:", [...iconsDetected].sort().join(", "));
  console.log("[csv->geojson] categories generated:", categoriesOutput.items.map((item) => item.id).join(" -> "));

  if (discarded.length) {
    console.log("[csv->geojson] discarded detail:", JSON.stringify(discarded, null, 2));
  }
}

main().catch((error) => {
  console.error("[csv->geojson] error:", error.message);
  process.exitCode = 1;
});
