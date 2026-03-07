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
