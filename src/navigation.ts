export type GameIndex = 0 | 1;

interface NavigationOptions {
  tabs: [HTMLButtonElement, HTMLButtonElement];
  panels: [HTMLElement, HTMLElement];
  onSelect: (index: GameIndex, previous: GameIndex | null) => void;
}

export function createNavigation({
  tabs,
  panels,
  onSelect,
}: NavigationOptions) {
  const abortController = new AbortController();
  let selectedIndex: GameIndex | null = null;

  function select(index: GameIndex): void {
    if (selectedIndex === index) return;
    const previous = selectedIndex;
    tabs.forEach((tab, tabIndex) =>
      tab.setAttribute("aria-selected", String(tabIndex === index)),
    );
    panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index;
    });
    selectedIndex = index;
    onSelect(index, previous);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index as GameIndex), {
      signal: abortController.signal,
    });
  });

  return {
    select,
    destroy: () => abortController.abort(),
  };
}
