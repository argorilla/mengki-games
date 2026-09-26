import mengkiImageUrl from "../assets/mengki.gif";
import { getElement } from "./dom";
import { FIND_RULES } from "./game-constants";
import { clamp, recordMengkiFound } from "./game-rules";
import { MENGKI_POSITIONS } from "./mengki-positions";

interface DragState {
  pointerX: number;
  pointerY: number;
  startingPanX: number;
  startingPanY: number;
}

export function createFindMengkiGame() {
  const stage = getElement<HTMLDivElement>("find-stage");
  const world = getElement<HTMLDivElement>("world");
  const foundCount = getElement<HTMLElement>("found-count");
  const completion = getElement<HTMLDivElement>("find-complete");
  const zoomLabel = getElement<HTMLElement>("zoom-label");
  let found = new Set<number>();
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let drag: DragState | null = null;
  let touchDistance: number | null = null;
  let listeners: AbortController | null = null;

  MENGKI_POSITIONS.forEach((position, index) => {
    const button = document.createElement("button");
    button.className = `monkey${position.hidden ? " hidden-one" : ""}`;
    button.style.left = `${position.x}%`;
    button.style.top = `${position.y}%`;
    button.setAttribute("aria-label", `Temukan Mengki ${index + 1}`);
    button.innerHTML = `<img src="${mengkiImageUrl}" alt="">`;
    button.dataset.mengkiIndex = String(index);
    world.appendChild(button);
  });

  function getPanBounds() {
    const stageRect = stage.getBoundingClientRect();
    const scaledWidth = world.offsetWidth * zoom;
    const scaledHeight = world.offsetHeight * zoom;
    return {
      minimumX: Math.min(0, stageRect.width - (world.offsetLeft + scaledWidth)),
      maximumX: Math.max(0, -world.offsetLeft),
      minimumY: Math.min(0, stageRect.height - scaledHeight),
      maximumY: Math.max(0, stageRect.height - scaledHeight),
    };
  }

  function renderWorld(): void {
    const bounds = getPanBounds();
    panX = clamp(panX, bounds.minimumX, bounds.maximumX);
    panY = clamp(panY, bounds.minimumY, bounds.maximumY);
    world.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  function setZoom(
    nextZoom: number,
    centerX = stage.clientWidth / 2,
    centerY = stage.clientHeight / 2,
  ): void {
    const previousZoom = zoom;
    zoom = clamp(nextZoom, FIND_RULES.minimumZoom, FIND_RULES.maximumZoom);
    panX = centerX - ((centerX - panX) * zoom) / previousZoom;
    panY = centerY - ((centerY - panY) * zoom) / previousZoom;
    renderWorld();
  }

  function reset(): void {
    found.clear();
    world.querySelectorAll<HTMLButtonElement>(".monkey").forEach((button) => {
      button.classList.remove("found");
      const index = Number(button.dataset.mengkiIndex);
      button.setAttribute("aria-label", `Temukan Mengki ${index + 1}`);
    });
    foundCount.textContent = `0/${FIND_RULES.totalMengki}`;
    completion.hidden = true;
    zoom = 1;
    panX = 0;
    panY = 0;
    renderWorld();
  }

  function start(): void {
    if (listeners) return;
    listeners = new AbortController();
    const options = { signal: listeners.signal };

    world.addEventListener(
      "click",
      (event) => {
        const button = (event.target as Element).closest<HTMLButtonElement>(
          ".monkey",
        );
        if (!button) return;
        event.stopPropagation();
        const index = Number(button.dataset.mengkiIndex);
        const nextFound = recordMengkiFound(found, index);
        if (nextFound.size === found.size) return;
        found = nextFound;
        button.classList.add("found");
        button.setAttribute(
          "aria-label",
          `Mengki ${index + 1} sudah ditemukan`,
        );
        foundCount.textContent = `${found.size}/${FIND_RULES.totalMengki}`;
        if (found.size === FIND_RULES.totalMengki) completion.hidden = false;
      },
      options,
    );

    getElement("zoom-in").addEventListener(
      "click",
      () => setZoom(zoom + FIND_RULES.zoomButtonStep),
      options,
    );
    getElement("zoom-out").addEventListener(
      "click",
      () => setZoom(zoom - FIND_RULES.zoomButtonStep),
      options,
    );
    getElement("zoom-reset").addEventListener(
      "click",
      () => {
        zoom = 1;
        panX = 0;
        panY = 0;
        renderWorld();
      },
      options,
    );
    getElement("find-again").addEventListener("click", reset, options);

    stage.addEventListener(
      "pointerdown",
      (event) => {
        if ((event.target as Element).closest(".monkey")) return;
        drag = {
          pointerX: event.clientX,
          pointerY: event.clientY,
          startingPanX: panX,
          startingPanY: panY,
        };
        stage.setPointerCapture(event.pointerId);
        stage.classList.add("dragging");
      },
      options,
    );
    stage.addEventListener(
      "pointermove",
      (event) => {
        if (!drag) return;
        panX = drag.startingPanX + event.clientX - drag.pointerX;
        panY = drag.startingPanY + event.clientY - drag.pointerY;
        renderWorld();
      },
      options,
    );
    const releaseDrag = () => {
      drag = null;
      stage.classList.remove("dragging");
    };
    stage.addEventListener("pointerup", releaseDrag, options);
    stage.addEventListener("pointercancel", releaseDrag, options);
    stage.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const rect = stage.getBoundingClientRect();
        setZoom(
          zoom * (event.deltaY < 0 ? 1.15 : 0.87),
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      },
      { ...options, passive: false },
    );
    stage.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length !== 2) return;
        const [first, second] = event.touches;
        const distance = Math.hypot(
          first.clientX - second.clientX,
          first.clientY - second.clientY,
        );
        if (touchDistance) {
          const rect = stage.getBoundingClientRect();
          setZoom(
            (zoom * distance) / touchDistance,
            (first.clientX + second.clientX) / 2 - rect.left,
            (first.clientY + second.clientY) / 2 - rect.top,
          );
        }
        touchDistance = distance;
      },
      { ...options, passive: false },
    );
    stage.addEventListener(
      "touchend",
      () => {
        touchDistance = null;
      },
      options,
    );
    window.addEventListener("resize", renderWorld, options);
    renderWorld();
  }

  function stop(): void {
    listeners?.abort();
    listeners = null;
    drag = null;
    touchDistance = null;
    stage.classList.remove("dragging");
  }

  return { start, stop };
}
