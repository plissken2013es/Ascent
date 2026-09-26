// The level of Ascent: the 128x32 map of the cartridge (16x4 rooms of 8x8
// tiles). The entities are map tiles too: the game replaces them by entities
// when it starts (parse_tile() in game/main.js).

export const MAP_W = 128;
export const MAP_H = 32;
export const ROOM = 8;

// The tiles that parse_tile() turns into entities
export const ENTITIES = {
  64: { name: "Player start", help: "Where the game starts (exactly one)" },
  80: { name: "Blob", help: "Jumps up and down, hurts. Created again when its room is entered" },
  88: { name: "Mushroom", help: "Bounces the player up" },
  94: { name: "Fan", help: "Blows the player up (24x71 pixels)" },
  96: { name: "Checkpoint", help: "Where the player comes back after dying" },
  98: { name: "Bearpig", help: "Charges at the player. Created again when its room is entered" },
  116: { name: "Vines", help: "Block the way until the vines upgrade" },
  121: { name: "Spirit orb", help: "Lore: the good ending needs all 8" },
  145: { name: "Upgrader", help: "Gives the upgrade of its column (see below)" },
  148: { name: "Pod", help: "The crashed ship, smokes" },
  183: { name: "Core", help: "Starts the ending when reached" },
  197: { name: "Twinkle", help: "A star that twinkles now and then" }
};

// The upgrade an upgrader gives depends on its map column (update of
// make_upgrader() in game/enemies.js)
export const UPGRADES = {
  5: "scale (climb weird walls)",
  51: "rush (dash)",
  66: "grab (ledges)",
  83: "vines",
  125: "stomp (dive)"
};

// Sprite flags, as the game uses them
export const FLAGS = [
  { bit: 0, name: "solid", color: "#ff5a4f" },
  { bit: 1, name: "platform", color: "#ffd23f" },
  { bit: 2, name: "ladder", color: "#4fc3ff" },
  { bit: 3, name: "spikes", color: "#ff4fd8" },
  { bit: 4, name: "scalable", color: "#7dff6a" }
];

export class Level {
  // cartText: a .p8 cartridge, whose map is edited
  constructor(cartText) {
    this.load(cartText);
  }

  load(cartText) {
    this.cartText = cartText;
    this.tiles = readMap(cartText);
    this.undoStack = [];
    this.redoStack = [];
    this.pending = null;
    this.version = 0;
  }

  get(x, y) {
    return x >= 0 && x < MAP_W && y >= 0 && y < MAP_H ? this.tiles[y * MAP_W + x] : 0;
  }

  // Changes are grouped in actions (e.g. one stroke of the pencil), which undo
  // and redo as a whole
  begin() {
    this.pending = [];
  }

  set(x, y, tile) {
    if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return false;
    const i = y * MAP_W + x;
    if (this.tiles[i] === tile) return false;
    const change = { i, from: this.tiles[i], to: tile };
    this.tiles[i] = tile;
    this.version++;
    if (this.pending) {
      this.pending.push(change);
    } else {
      this.undoStack.push([change]);
      this.redoStack = [];
    }
    return true;
  }

  end() {
    if (this.pending && this.pending.length) {
      this.undoStack.push(this.pending);
      this.redoStack = [];
    }
    this.pending = null;
  }

  // Sets several tiles as one action
  apply(changes) {
    this.begin();
    for (const [x, y, tile] of changes) this.set(x, y, tile);
    this.end();
  }

  undo() {
    const action = this.undoStack.pop();
    if (!action) return false;
    for (let i = action.length - 1; i >= 0; i--) this.tiles[action[i].i] = action[i].from;
    this.redoStack.push(action);
    this.version++;
    return true;
  }

  redo() {
    const action = this.redoStack.pop();
    if (!action) return false;
    for (const change of action) this.tiles[change.i] = change.to;
    this.undoStack.push(action);
    this.version++;
    return true;
  }

  // The cartridge with the edited map, everything else as it was
  toCart() {
    return writeMap(this.cartText, this.tiles);
  }

  // Entities of the map: [{ tile, x, y }]
  entities() {
    const list = [];
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = this.get(x, y);
        if (ENTITIES[tile]) list.push({ tile, x, y });
      }
    }
    return list;
  }

  // What would not work in the game
  problems() {
    const problems = [];
    const entities = this.entities();
    const count = (tile) => entities.filter((e) => e.tile === tile);
    const starts = count(64);
    if (starts.length === 0) problems.push({ message: "No player start: the game can't start" });
    if (starts.length > 1) {
      for (const e of starts.slice(1)) {
        problems.push({ x: e.x, y: e.y, message: "Another player start: only the last one is used" });
      }
    }
    const orbs = count(121).length;
    if (orbs < 8) problems.push({ message: `${orbs} spirit orbs: the good ending needs 8` });
    if (count(183).length === 0) problems.push({ message: "No core: the game can't be finished" });
    for (const e of count(145)) {
      if (!UPGRADES[e.x]) {
        problems.push({
          x: e.x,
          y: e.y,
          message: `Upgrader in column ${e.x} gives nothing (columns ${Object.keys(UPGRADES).join(", ")})`
        });
      }
    }
    // The core ending happens around fixed coordinates
    for (const e of count(183)) {
      if (Math.floor(e.x / ROOM) !== 14 || Math.floor(e.y / ROOM) !== 1) {
        problems.push({ x: e.x, y: e.y, message: "The ending is drawn in room 14,1: the core belongs there" });
      }
    }
    return problems;
  }
}

//
// .p8 map section: 32 lines of 128 tiles as 2 hex digits each
//

export function readMap(cartText) {
  const tiles = new Uint8Array(MAP_W * MAP_H);
  const lines = cartText.split(/\r?\n/);
  const start = lines.indexOf("__map__");
  if (start < 0) throw new Error("No __map__ section in the cartridge");
  for (let y = 0; y < MAP_H; y++) {
    const line = lines[start + 1 + y] || "";
    if (line.startsWith("__")) break;
    for (let x = 0; x < MAP_W; x++) {
      tiles[y * MAP_W + x] = parseInt(line.substr(x * 2, 2), 16) || 0;
    }
  }
  return tiles;
}

export function writeMap(cartText, tiles) {
  const lines = cartText.split("\n");
  const start = lines.indexOf("__map__");
  if (start < 0) throw new Error("No __map__ section in the cartridge");
  let end = start + 1;
  while (end < lines.length && !lines[end].startsWith("__") && end - start <= MAP_H) end++;
  const rows = [];
  for (let y = 0; y < MAP_H; y++) {
    let row = "";
    for (let x = 0; x < MAP_W; x++) row += tiles[y * MAP_W + x].toString(16).padStart(2, "0");
    rows.push(row);
  }
  return [...lines.slice(0, start + 1), ...rows, ...lines.slice(end)].join("\n");
}
