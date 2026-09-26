export const FIND_RULES = {
  totalMengki: 10,
  minimumZoom: 1,
  maximumZoom: 3.5,
  zoomButtonStep: 0.4,
} as const;

export const CATCH_RULES = {
  startingLives: 3,
  playerStart: 0.5,
  playerMinimumX: 0.08,
  playerMaximumX: 0.92,
  playerSpeed: 0.75,
  catchMinimumY: 0.72,
  catchMaximumY: 0.91,
  catchDistance: 0.075,
  maximumFrameSeconds: 0.05,
  minimumSpawnInterval: 0.55,
  initialSpawnInterval: 1.25,
} as const;
