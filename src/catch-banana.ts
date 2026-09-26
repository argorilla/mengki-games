import { getElement } from "./dom";
import { CATCH_RULES } from "./game-constants";
import {
  addCaughtBanana,
  clamp,
  getSpawnInterval,
  loseLife,
} from "./game-rules";

interface Banana {
  element: HTMLSpanElement;
  x: number;
  y: number;
  speed: number;
}

export function createCatchBananaGame() {
  const stage = getElement<HTMLDivElement>("catch-stage");
  const playerElement = getElement<HTMLDivElement>("catch-monkey");
  const startOverlay = getElement<HTMLDivElement>("catch-start");
  const gameOverOverlay = getElement<HTMLDivElement>("catch-over");
  const scoreElement = getElement<HTMLElement>("catch-score");
  const livesElement = getElement<HTMLElement>("catch-lives");
  const finalScoreElement = getElement<HTMLElement>("final-score");
  let active = false;
  let animationFrame = 0;
  let lastFrameTime = 0;
  let spawnClock = 0;
  let playerPosition: number = CATCH_RULES.playerStart;
  let score = 0;
  let lives: number = CATCH_RULES.startingLives;
  let bananas: Banana[] = [];
  let listeners: AbortController | null = null;
  const movement = { left: false, right: false };

  function renderPlayer(): void {
    playerElement.style.left = `${playerPosition * 100}%`;
  }

  function clearBananas(): void {
    bananas.forEach(({ element }) => element.remove());
    bananas = [];
  }

  function stopAnimation(): void {
    active = false;
    cancelAnimationFrame(animationFrame);
    movement.left = false;
    movement.right = false;
  }

  function spawnBanana(): void {
    const element = document.createElement("span");
    element.className = "banana";
    element.textContent = "🍌";
    element.setAttribute("aria-hidden", "true");
    stage.appendChild(element);
    bananas.push({
      element,
      x: 0.06 + Math.random() * 0.88,
      y: -0.12,
      speed: 0.27 + Math.min(score * 0.012, 0.28),
    });
  }

  function finishGame(): void {
    stopAnimation();
    finalScoreElement.textContent = String(score);
    gameOverOverlay.hidden = false;
  }

  function update(time: number): void {
    if (!active) return;
    const deltaSeconds = Math.min(
      (time - lastFrameTime) / 1000,
      CATCH_RULES.maximumFrameSeconds,
    );
    lastFrameTime = time;
    spawnClock += deltaSeconds;
    if (spawnClock > getSpawnInterval(score)) {
      spawnClock = 0;
      spawnBanana();
    }
    const direction = Number(movement.right) - Number(movement.left);
    playerPosition = clamp(
      playerPosition + direction * deltaSeconds * CATCH_RULES.playerSpeed,
      CATCH_RULES.playerMinimumX,
      CATCH_RULES.playerMaximumX,
    );
    renderPlayer();

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    for (let index = bananas.length - 1; index >= 0; index -= 1) {
      const banana = bananas[index];
      banana.y += banana.speed * deltaSeconds;
      banana.element.style.transform = `translate(${banana.x * width}px, ${banana.y * height}px)`;
      const isCaught =
        banana.y > CATCH_RULES.catchMinimumY &&
        banana.y < CATCH_RULES.catchMaximumY &&
        Math.abs(banana.x - playerPosition) < CATCH_RULES.catchDistance;
      if (isCaught) {
        banana.element.remove();
        bananas.splice(index, 1);
        score = addCaughtBanana(score);
        scoreElement.textContent = String(score);
      } else if (banana.y > 1) {
        banana.element.remove();
        bananas.splice(index, 1);
        lives = loseLife(lives);
        livesElement.textContent = String(lives);
        if (lives === 0) {
          finishGame();
          break;
        }
      }
    }
    if (active) animationFrame = requestAnimationFrame(update);
  }

  function startGame(): void {
    stopAnimation();
    clearBananas();
    score = 0;
    lives = CATCH_RULES.startingLives;
    playerPosition = CATCH_RULES.playerStart;
    spawnClock = 0.5;
    scoreElement.textContent = "0";
    livesElement.textContent = String(CATCH_RULES.startingLives);
    startOverlay.hidden = true;
    gameOverOverlay.hidden = true;
    renderPlayer();
    active = true;
    lastFrameTime = performance.now();
    animationFrame = requestAnimationFrame(update);
  }

  function setKeyMovement(event: KeyboardEvent, pressed: boolean): void {
    if (!active) return;
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a")
      movement.left = pressed;
    else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d")
      movement.right = pressed;
    else return;
    event.preventDefault();
  }

  function start(): void {
    if (listeners) return;
    listeners = new AbortController();
    const options = { signal: listeners.signal };
    getElement("start-catch").addEventListener("click", startGame, options);
    getElement("catch-again").addEventListener("click", startGame, options);
    document.addEventListener(
      "keydown",
      (event) => setKeyMovement(event, true),
      options,
    );
    document.addEventListener(
      "keyup",
      (event) => setKeyMovement(event, false),
      options,
    );

    (
      [
        ["move-left", "left"],
        ["move-right", "right"],
      ] as const
    ).forEach(([id, direction]) => {
      const button = getElement<HTMLButtonElement>(id);
      button.addEventListener(
        "pointerdown",
        (event) => {
          event.preventDefault();
          button.setPointerCapture(event.pointerId);
          movement[direction] = true;
        },
        options,
      );
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(
        (eventName) => {
          button.addEventListener(
            eventName,
            () => {
              movement[direction] = false;
            },
            options,
          );
        },
      );
    });
  }

  function stop(): void {
    const wasActive = active;
    stopAnimation();
    clearBananas();
    listeners?.abort();
    listeners = null;
    if (wasActive) startOverlay.hidden = false;
  }

  return { start, stop };
}
