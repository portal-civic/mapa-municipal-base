export function resolveIconPath(projectSlug, iconName) {
  if (!iconName) {
    return null;
  }

  return {
    project: `projects/${projectSlug}/icons/${iconName}`,
    global: `assets/icons-global/${iconName}`,
  };
}
