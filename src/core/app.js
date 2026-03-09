import { getActiveProject } from "./router.js";
import { createStore } from "./state.js";
import { createEventBus } from "./events.js";
import { loadLocale, loadProjectData } from "../data/loader.js";
import { validateProjectData } from "../data/validators.js";
import { normalizeProjectData } from "../data/normalizer.js";
import { createI18n } from "../i18n/i18n.js";
import { renderLocaleSwitcher } from "../i18n/locale-switcher.js";
import { createMap } from "../map/map-init.js";
import { setupBasemaps } from "../map/basemaps.js";
import { createLayerManager } from "../map/layer-manager.js";
import { renderHeader } from "../ui/header.js";
import { renderFooter } from "../ui/footer.js";
import { renderLeftPanelEmpty, renderFeatureDetails } from "../ui/left-panel.js";
import { renderFilters } from "../ui/filters.js";
import { renderLegend } from "../ui/legend.js";
import { createEl, empty, qs } from "../utils/dom.js";
import { logError, logInfo } from "../utils/logger.js";

function setupLeftPanelConfig(projectConfig) {
  const leftPanelConfig = projectConfig.leftPanel || {};
  const accentColor = leftPanelConfig.accentColor;
  if (accentColor) {
    document.documentElement.style.setProperty("--panel-accent", accentColor);
  } else {
    document.documentElement.style.removeProperty("--panel-accent");
  }
  return leftPanelConfig;
}

function setupRightPanelConfig(projectConfig) {
  return projectConfig.rightPanel || {};
}

function ensureInfoToggleButton(container, { t, onClick }) {
  let button = qs(".left-panel-toggle", container);
  if (!button) {
    button = createEl("button", "left-panel-toggle");
    button.type = "button";
    button.appendChild(createEl("span", "left-panel-toggle-icon", "i"));
    container.appendChild(button);
    button.addEventListener("click", onClick);
  }
  button.setAttribute("aria-label", t("panel.general_heading", "Informació general"));
  return button;
}

function ensureCustomZoomButtons(container, { onZoomIn, onZoomOut }) {
  let zoomInButton = qs(".map-zoom-in", container);
  if (!zoomInButton) {
    zoomInButton = createEl("button", "map-zoom-btn map-zoom-in");
    zoomInButton.type = "button";
    zoomInButton.setAttribute("aria-label", "Acostar");
    zoomInButton.addEventListener("click", onZoomIn);
    container.appendChild(zoomInButton);
  }

  let zoomOutButton = qs(".map-zoom-out", container);
  if (!zoomOutButton) {
    zoomOutButton = createEl("button", "map-zoom-btn map-zoom-out");
    zoomOutButton.type = "button";
    zoomOutButton.setAttribute("aria-label", "Allunyar");
    zoomOutButton.addEventListener("click", onZoomOut);
    container.appendChild(zoomOutButton);
  }
}

async function bootstrap() {
  const activeProject = getActiveProject("demo");
  const rawData = await loadProjectData(activeProject);
  validateProjectData(rawData);
  const projectData = normalizeProjectData(rawData);
  const leftPanelConfig = setupLeftPanelConfig(projectData.config);
  const rightPanelConfig = setupRightPanelConfig(projectData.config);

  const defaultLang = projectData.config.defaultLanguage || "ca";
  const dictionaries = {
    ca: await loadLocale(projectData.base, "ca"),
    es: await loadLocale(projectData.base, "es"),
    en: await loadLocale(projectData.base, "en"),
  };

  const i18n = createI18n({ dictionaries, defaultLang });
  const events = createEventBus();

  const store = createStore({
    lang: defaultLang,
    project: activeProject,
    filters: {
      category: "all",
      subcategory: "all",
      status: "all",
    },
    selectedFeature: null,
    isLeftPanelVisible: leftPanelConfig.showGeneralInfoOnLoad !== false,
  });

  const map = createMap(projectData.config);
  setupBasemaps(map, projectData.config);

  const leftPanel = qs("#left-panel");
  const categoryPanel = qs("#category-panel");
  const legendPanel = qs("#legend-panel");
  const header = qs("#app-header");
  const footer = qs("#app-footer");

  const layerManager = createLayerManager({
    map,
    geojson: projectData.geojson,
    layerConfig: projectData.layers,
    i18n,
    projectSlug: activeProject,
    onFeatureSelected: (feature) => {
      store.setState({ selectedFeature: feature, isLeftPanelVisible: true });
      events.emit("feature:selected", feature);
    },
  });

  const mapWrap = qs(".map-wrap");
  const infoButtonEnabled = leftPanelConfig.showInfoButton !== false;
  if (mapWrap) {
    ensureCustomZoomButtons(mapWrap, {
      onZoomIn: () => map.zoomIn(),
      onZoomOut: () => map.zoomOut(),
    });
  }

  if (mapWrap && infoButtonEnabled) {
    ensureInfoToggleButton(mapWrap, {
      t: i18n.t,
      onClick: () => {
        const state = store.getState();
        if (state.selectedFeature) {
          store.setState({ selectedFeature: null, isLeftPanelVisible: true });
          return;
        }
        store.setState({ isLeftPanelVisible: !state.isLeftPanelVisible });
      },
    });
  }

  function redrawPanels(state) {
    if (state.selectedFeature) {
      renderFeatureDetails(leftPanel, state.selectedFeature, {
        t: i18n.t,
        i18n,
        leftPanelConfig,
        onClose: () => store.setState({ selectedFeature: null, isLeftPanelVisible: false }),
      });
    } else if (leftPanelConfig.generalInfo?.enabled !== false) {
      renderLeftPanelEmpty(leftPanel, {
        t: i18n.t,
        onClose: () => store.setState({ isLeftPanelVisible: false }),
        branding: {
          title: i18n.t(projectData.config.branding.titleKey, projectData.config.branding.title),
          subtitle: i18n.t(projectData.config.branding.subtitleKey, projectData.config.branding.subtitle),
        },
        leftPanelConfig,
      });
    } else {
      renderLeftPanelEmpty(leftPanel, {
        t: i18n.t,
        onClose: () => store.setState({ isLeftPanelVisible: false }),
        branding: {
          title: i18n.t(projectData.config.branding.titleKey, projectData.config.branding.title),
          subtitle: i18n.t(projectData.config.branding.subtitleKey, projectData.config.branding.subtitle),
        },
        leftPanelConfig: {
          generalInfo: {
            descriptionKey: "panel.detail_empty",
          },
        },
      });
    }

    if (state.isLeftPanelVisible) {
      leftPanel.classList.add("open");
    } else {
      leftPanel.classList.remove("open");
    }

    const filtersContainer = createEl("div");
    empty(categoryPanel);
    categoryPanel.appendChild(filtersContainer);

    renderFilters(filtersContainer, {
      categories: projectData.categories,
      pointFeatures: projectData.geojson.points.features,
      currentFilters: state.filters,
      t: i18n.t,
      rightPanelConfig,
      onFilterChange: (patch) => {
        const nextFilters = {
          ...store.getState().filters,
          ...patch,
        };
        store.setState({ filters: nextFilters });
        layerManager.setFilters(nextFilters);
      },
    });

    renderLegend(legendPanel, {
      categories: projectData.categories,
      currentFilters: state.filters,
      t: i18n.t,
    });

    const localeNode = createEl("div");
    renderLocaleSwitcher(localeNode, i18n.getSupported(), state.lang, (nextLang) => {
      i18n.setLang(nextLang);
      store.setState({ lang: nextLang });
      if (mapWrap && infoButtonEnabled) {
        ensureInfoToggleButton(mapWrap, {
          t: i18n.t,
          onClick: () => {
            const current = store.getState();
            if (current.selectedFeature) {
              store.setState({ selectedFeature: null, isLeftPanelVisible: true });
              return;
            }
            store.setState({ isLeftPanelVisible: !current.isLeftPanelVisible });
          },
        });
      }
    });

    renderHeader(header, {
      title: i18n.t(projectData.config.branding.titleKey, projectData.config.branding.title),
      subtitle: i18n.t(projectData.config.branding.subtitleKey, projectData.config.branding.subtitle),
      localeNode,
    });

    renderFooter(footer, {
      leftText: i18n.t("footer.left", "Plataforma base de mapes municipals"),
      rightText: `${i18n.t("footer.right", "Projecte")}: ${state.project}`,
    });
  }

  store.subscribe((state) => {
    redrawPanels(state);
    layerManager.setFilters(state.filters);
  });

  redrawPanels(store.getState());
  layerManager.redraw();

  logInfo("Projecte carregat", { project: activeProject });
}

bootstrap().catch((error) => {
  logError("Error en inicialització", error);
  const header = document.querySelector("#app-header");
  if (header) {
    header.textContent = "Error carregant el projecte";
  }
});
