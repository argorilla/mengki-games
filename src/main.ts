import "./styles.css";
import { createCatchBananaGame } from "./catch-banana";
import { getElement } from "./dom";
import { createFindMengkiGame } from "./find-mengki";
import { registerGameTools } from "./model-context";
import { createNavigation } from "./navigation";

const findGame = createFindMengkiGame();
const catchGame = createCatchBananaGame();
const games = [findGame, catchGame] as const;

const navigation = createNavigation({
  tabs: [
    getElement<HTMLButtonElement>("tab-find"),
    getElement<HTMLButtonElement>("tab-catch"),
  ],
  panels: [getElement("panel-find"), getElement("panel-catch")],
  onSelect(index, previous) {
    if (previous !== null) games[previous].stop();
    games[index].start();
  },
});

navigation.select(0);
registerGameTools(navigation.select);
