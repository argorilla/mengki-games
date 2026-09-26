import { describe, expect, it } from "vitest";
import {
  addCaughtBanana,
  getSpawnInterval,
  loseLife,
  recordMengkiFound,
} from "../src/game-rules";

describe("aturan Cari Mengki", () => {
  it("tidak menghitung Mengki yang sama dua kali", () => {
    const once = recordMengkiFound(new Set(), 3);
    const twice = recordMengkiFound(once, 3);
    expect(once.size).toBe(1);
    expect(twice.size).toBe(1);
  });
});

describe("aturan Tangkap Pisang", () => {
  it("menambah satu skor untuk setiap pisang tertangkap", () => {
    expect(addCaughtBanana(4)).toBe(5);
  });

  it("mengurangi nyawa tanpa melewati nol", () => {
    expect(loseLife(3)).toBe(2);
    expect(loseLife(0)).toBe(0);
  });

  it("tidak mempercepat interval spawn melewati batas minimum", () => {
    expect(getSpawnInterval(0)).toBe(1.25);
    expect(getSpawnInterval(100)).toBe(0.55);
  });
});
