export function getActiveProject(defaultProject = "demo") {
  const params = new URLSearchParams(window.location.search);
  return params.get("project") || defaultProject;
}
