function readNested(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function createI18n({ dictionaries, defaultLang }) {
  let lang = defaultLang;

  function t(key, fallback = "") {
    const value = readNested(dictionaries[lang], key);
    return value ?? fallback ?? key;
  }

  function setLang(nextLang) {
    if (!dictionaries[nextLang]) {
      return;
    }
    lang = nextLang;
  }

  function getLang() {
    return lang;
  }

  function getSupported() {
    return Object.keys(dictionaries);
  }

  function featureText(feature, field) {
    const props = feature?.properties || {};
    const localizedField = `${field}_${lang}`;
    return props[localizedField] || props[field] || "";
  }

  return {
    t,
    setLang,
    getLang,
    getSupported,
    featureText,
  };
}
