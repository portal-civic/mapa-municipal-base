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
import { renderLayerSelector } from "../ui/layer-selector.js";
import { renderFilters } from "../ui/filters.js";
import { setupResponsivePanels } from "../ui/responsive.js";
import { createEl, empty, qs } from "../utils/dom.js";
import { logError, logInfo } from "../utils/logger.js";

async function bootstrap() {
  const activeProject = getActiveProject("demo");
  const rawData = await loadProjectData(activeProject);
  validateProjectData(rawData);
  const projectData = normalizeProjectData(rawData);

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
    layersVisibility: {
      points: Boolean(projectData.layers.points.enabled),
      lines: Boolean(projectData.layers.lines.enabled),
      areas: Boolean(projectData.layers.areas.enabled),
    },
    selectedFeature: null,
  });

  const map = createMap(projectData.config);
  setupBasemaps(map, projectData.config);

  const leftPanel = qs("#left-panel");
  const rightPanel = qs("#right-panel");
  const header = qs("#app-header");
  const footer = qs("#app-footer");

  const responsive = setupResponsivePanels(leftPanel, rightPanel);

  const layerManager = createLayerManager({
    map,
    geojson: projectData.geojson,
    layerConfig: projectData.layers,
    i18n,
    onFeatureSelected: (feature) => {
      store.setState({ selectedFeature: feature });
      events.emit("feature:selected", feature);
      responsive.closePanels();
    },
  });

  function redrawPanels(state) {
    renderLeftPanelEmpty(leftPanel, i18n.t);
    if (state.selectedFeature) {
      renderFeatureDetails(leftPanel, state.selectedFeature, { t: i18n.t, i18n });
    }

    empty(rightPanel);
    renderLayerSelector(rightPanel, projectData.layers, i18n.t, (kind, enabled) => {
      const layersVisibility = {
        ...store.getState().layersVisibility,
        [kind]: enabled,
      };
      store.setState({ layersVisibility });
      layerManager.setVisibility(layersVisibility);
    });

    const filtersContainer = createEl("div");
    rightPanel.appendChild(filtersContainer);

    renderFilters(filtersContainer, {
      categories: projectData.categories,
      currentFilters: state.filters,
      t: i18n.t,
      onFilterChange: (patch) => {
        const nextFilters = {
          ...store.getState().filters,
          ...patch,
        };
        store.setState({ filters: nextFilters });
        layerManager.setFilters(nextFilters);
      },
    });

    const localeNode = createEl("div");
    renderLocaleSwitcher(localeNode, i18n.getSupported(), state.lang, (nextLang) => {
      i18n.setLang(nextLang);
      store.setState({ lang: nextLang });
    });

    renderHeader(header, {
      title: i18n.t(projectData.config.branding.titleKey, projectData.config.branding.title),
      subtitle: i18n.t(projectData.config.branding.subtitleKey, projectData.config.branding.subtitle),
      localeNode,
      onLeftToggle: responsive.toggleLeft,
      onRightToggle: responsive.toggleRight,
      mobileLabel: i18n.t("common.mobile_menu", "Obrir panells"),
    });

    renderFooter(footer, {
      leftText: i18n.t("footer.left", "Plataforma base de mapes municipals"),
      rightText: `${i18n.t("footer.right", "Projecte")}: ${state.project}`,
    });
  }

  store.subscribe((state) => {
    redrawPanels(state);
    layerManager.setFilters(state.filters);
    layerManager.setVisibility(state.layersVisibility);
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
