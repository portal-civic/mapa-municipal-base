async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`No s'ha pogut carregar ${path}`);
  }

  return response.json();
}

export async function loadProjectData(projectSlug) {
  const base = `projects/${projectSlug}`;

  const [config, categories, layers, points, lines, areas] = await Promise.all([
    fetchJson(`${base}/config.json`),
    fetchJson(`${base}/categories.json`),
    fetchJson(`${base}/layers.json`),
    fetchJson(`${base}/points.geojson`),
    fetchJson(`${base}/lines.geojson`),
    fetchJson(`${base}/areas.geojson`),
  ]);

  return {
    base,
    projectSlug,
    config,
    categories,
    layers,
    geojson: {
      points,
      lines,
      areas,
    },
  };
}

export async function loadLocale(projectBasePath, lang) {
  return fetchJson(`${projectBasePath}/i18n/${lang}.json`);
}
