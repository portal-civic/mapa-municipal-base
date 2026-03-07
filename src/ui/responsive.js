export function setupResponsivePanels(leftPanel, rightPanel) {
  function closePanels() {
    leftPanel.classList.remove("open");
    rightPanel.classList.remove("open");
  }

  return {
    toggleLeft() {
      leftPanel.classList.toggle("open");
      rightPanel.classList.remove("open");
    },
    toggleRight() {
      rightPanel.classList.toggle("open");
      leftPanel.classList.remove("open");
    },
    closePanels,
  };
}
