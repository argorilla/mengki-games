import { CATCH_RULES } from "./game-constants";

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function recordMengkiFound(
  found: ReadonlySet<number>,
  index: number,
): Set<number> {
  if (found.has(index)) return new Set(found);
  return new Set([...found, index]);
}

export function addCaughtBanana(score: number): number {
  return score + 1;
}

export function loseLife(lives: number): number {
  return Math.max(0, lives - 1);
}

export function getSpawnInterval(score: number): number {
  return Math.max(
    CATCH_RULES.minimumSpawnInterval,
    CATCH_RULES.initialSpawnInterval - score * 0.025,
  );
}
