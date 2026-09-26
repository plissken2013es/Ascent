// The map view of the editor: the whole map drawn like the game draws it, with
// zoom and panning, overlays (rooms, grid, flags, entities) and the mouse
// tools.

import { RGB } from "../pico8/gfx.js";
import { ENTITIES, FLAGS, MAP_H, MAP_W, ROOM, UPGRADES } from "./model.js";

const TILE = 8;

// The screen palette of the game: colors 14 and 15 are secret colors
function color(c) {
  const p = c === 14 ? 131 : c === 15 ? 139 : c;
  return RGB[(p & 0xf) | (p & 0x80 ? 16 : 0)];
}

// The sprite sheet as an image (color 0 transparent, like map() draws it)
export function spriteSheet(gfx) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const image = context.createImageData(128, 128);
  for (let i = 0; i < 128 * 128; i++) {
    const c = gfx[i];
    const rgb = color(c);
    image.data[i * 4] = rgb >> 16;
    image.data[i * 4 + 1] = (rgb >> 8) & 0xff;
    image.data[i * 4 + 2] = rgb & 0xff;
    image.data[i * 4 + 3] = c === 0 ? 0 : 255;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

export class MapView {
  constructor(canvas, level, cart, options) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.level = level;
    this.flags = cart.flags;
    this.sheet = spriteSheet(cart.gfx);
    this.options = options;

    // The map at 1 pixel per game pixel
    this.map = document.createElement("canvas");
    this.map.width = MAP_W * TILE;
    this.map.height = MAP_H * TILE;
    this.mapContext = this.map.getContext("2d");
    this.drawnVersion = -1;

    this.zoom = 3;
    this.offsetX = 0;
    this.offsetY = 0;
    this.hover = null;
    this.selection = null;
    // tool: { name, apply(x, y, first), rect?: true }
    this.tool = null;
    this.drag = null;
    this.listeners = {};

    this.setupMouse();
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.resize();
  }

  on(event, listener) {
    this.listeners[event] = listener;
  }

  emit(event, ...args) {
    if (this.listeners[event]) this.listeners[event](...args);
  }

  resize() {
    const box = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(box.width));
    this.canvas.height = Math.max(1, Math.floor(box.height));
    this.draw();
  }

  //
  // Drawing
  //

  drawMap() {
    const c = this.mapContext;
    c.fillStyle = "#000";
    c.fillRect(0, 0, this.map.width, this.map.height);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = this.level.get(x, y);
        if (tile) {
          c.drawImage(this.sheet, (tile % 16) * 8, Math.floor(tile / 16) * 8, 8, 8, x * 8, y * 8, 8, 8);
        }
      }
    }
    this.drawnVersion = this.level.version;
  }

  draw() {
    if (this.drawnVersion !== this.level.version) this.drawMap();
    const c = this.context;
    const z = this.zoom;
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#101018";
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.save();
    c.translate(-this.offsetX * z, -this.offsetY * z);
    c.drawImage(this.map, 0, 0, this.map.width * z, this.map.height * z);

    const cell = TILE * z;
    const [x0, y0, x1, y1] = this.visibleTiles();

    if (this.options.flags) {
      c.globalAlpha = 0.45;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const bits = this.flags[this.level.get(x, y)];
          if (!bits) continue;
          const shown = FLAGS.filter((f) => bits & (1 << f.bit));
          shown.forEach((f, i) => {
            c.fillStyle = f.color;
            c.fillRect(x * cell, y * cell + (i * cell) / shown.length, cell, cell / shown.length);
          });
        }
      }
      c.globalAlpha = 1;
    }

    if (this.options.grid && z >= 2) {
      c.strokeStyle = "rgba(255, 255, 255, 0.08)";
      c.lineWidth = 1;
      c.beginPath();
      for (let x = x0; x <= x1 + 1; x++) {
        c.moveTo(x * cell + 0.5, y0 * cell);
        c.lineTo(x * cell + 0.5, (y1 + 1) * cell);
      }
      for (let y = y0; y <= y1 + 1; y++) {
        c.moveTo(x0 * cell, y * cell + 0.5);
        c.lineTo((x1 + 1) * cell, y * cell + 0.5);
      }
      c.stroke();
    }

    if (this.options.rooms) {
      const room = ROOM * cell;
      c.strokeStyle = "rgba(255, 210, 63, 0.5)";
      c.lineWidth = 1;
      c.beginPath();
      for (let x = 0; x <= MAP_W / ROOM; x++) {
        c.moveTo(x * room + 0.5, 0);
        c.lineTo(x * room + 0.5, MAP_H * cell);
      }
      for (let y = 0; y <= MAP_H / ROOM; y++) {
        c.moveTo(0, y * room + 0.5);
        c.lineTo(MAP_W * cell, y * room + 0.5);
      }
      c.stroke();
      if (z >= 2) {
        c.fillStyle = "rgba(255, 210, 63, 0.7)";
        c.font = "11px sans-serif";
        for (let ry = 0; ry < MAP_H / ROOM; ry++) {
          for (let rx = 0; rx < MAP_W / ROOM; rx++) c.fillText(`${rx},${ry}`, rx * room + 3, ry * room + 12);
        }
      }
    }

    if (this.options.entities) {
      c.font = `${Math.max(9, Math.min(12, 3 * z))}px sans-serif`;
      c.lineWidth = 2;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const tile = this.level.get(x, y);
          const entity = ENTITIES[tile];
          if (!entity) continue;
          c.strokeStyle = "#7fc8ff";
          c.strokeRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
          // (twinkles are everywhere: no label)
          if (z >= 3 && tile !== 197) {
            let label = entity.name;
            if (tile === 145) label += UPGRADES[x] ? `: ${UPGRADES[x].split(" ")[0]}` : ": none";
            c.fillStyle = "rgba(0, 0, 0, 0.7)";
            const w = c.measureText(label).width;
            c.fillRect(x * cell, y * cell - 13, w + 6, 13);
            c.fillStyle = "#7fc8ff";
            c.fillText(label, x * cell + 3, y * cell - 3);
          }
        }
      }
    }

    // Tool preview, selection and hovered tile
    if (this.drag && this.drag.rect) {
      const [ax, ay, bx, by] = this.dragRect();
      c.fillStyle = "rgba(255, 210, 63, 0.25)";
      c.fillRect(ax * cell, ay * cell, (bx - ax + 1) * cell, (by - ay + 1) * cell);
    }
    if (this.selection) {
      c.strokeStyle = "#ffd23f";
      c.lineWidth = 2;
      c.strokeRect(this.selection.x * cell, this.selection.y * cell, cell, cell);
    }
    if (this.hover) {
      c.strokeStyle = "#ffffff";
      c.lineWidth = 1;
      c.strokeRect(this.hover.x * cell + 0.5, this.hover.y * cell + 0.5, cell - 1, cell - 1);
    }
    c.restore();
  }

  visibleTiles() {
    const cell = TILE * this.zoom;
    const x0 = Math.max(0, Math.floor((this.offsetX * this.zoom) / cell));
    const y0 = Math.max(0, Math.floor((this.offsetY * this.zoom) / cell));
    const x1 = Math.min(MAP_W - 1, Math.floor((this.offsetX * this.zoom + this.canvas.width) / cell));
    const y1 = Math.min(MAP_H - 1, Math.floor((this.offsetY * this.zoom + this.canvas.height) / cell));
    return [x0, y0, x1, y1];
  }

  //
  // Navigation
  //

  // The map pixel under a canvas position
  toMap(px, py) {
    return [px / this.zoom + this.offsetX, py / this.zoom + this.offsetY];
  }

  tileAt(event) {
    const box = this.canvas.getBoundingClientRect();
    const [mx, my] = this.toMap(event.clientX - box.left, event.clientY - box.top);
    const x = Math.floor(mx / TILE);
    const y = Math.floor(my / TILE);
    return x >= 0 && x < MAP_W && y >= 0 && y < MAP_H ? { x, y } : null;
  }

  setZoom(zoom, px = this.canvas.width / 2, py = this.canvas.height / 2) {
    const [mx, my] = this.toMap(px, py);
    this.zoom = Math.min(12, Math.max(0.5, zoom));
    this.offsetX = mx - px / this.zoom;
    this.offsetY = my - py / this.zoom;
    this.emit("zoom", this.zoom);
    this.draw();
  }

  // Shows the whole map
  fit() {
    this.zoom = Math.max(0.5, Math.min(this.canvas.width / this.map.width, this.canvas.height / this.map.height));
    this.offsetX = -(this.canvas.width / this.zoom - this.map.width) / 2;
    this.offsetY = -(this.canvas.height / this.zoom - this.map.height) / 2;
    this.emit("zoom", this.zoom);
    this.draw();
  }

  // Centers a room (rx, ry) in the view
  showRoom(rx, ry, zoom = this.zoom) {
    this.zoom = zoom;
    this.offsetX = (rx + 0.5) * ROOM * TILE - this.canvas.width / 2 / this.zoom;
    this.offsetY = (ry + 0.5) * ROOM * TILE - this.canvas.height / 2 / this.zoom;
    this.emit("zoom", this.zoom);
    this.draw();
  }

  dragRect() {
    const { start, end } = this.drag;
    return [Math.min(start.x, end.x), Math.min(start.y, end.y), Math.max(start.x, end.x), Math.max(start.y, end.y)];
  }

  setupMouse() {
    const canvas = this.canvas;
    let panning = null;
    let space = false;

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space" && event.target === document.body) {
        space = true;
        canvas.style.cursor = "grab";
        event.preventDefault();
      }
    });
    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        space = false;
        canvas.style.cursor = "";
      }
    });

    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    canvas.addEventListener("pointerdown", (event) => {
      canvas.setPointerCapture(event.pointerId);
      if (event.button === 1 || event.button === 2 || space) {
        panning = { x: event.clientX, y: event.clientY, offsetX: this.offsetX, offsetY: this.offsetY };
        return;
      }
      const tile = this.tileAt(event);
      if (!tile || !this.tool) return;
      this.selection = tile;
      this.emit("select", tile);
      if (this.tool.rect) {
        this.drag = { start: tile, end: tile, rect: true };
      } else {
        this.drag = { last: tile };
        this.level.begin();
        this.tool.apply(tile.x, tile.y, true);
      }
      this.draw();
    });

    canvas.addEventListener("pointermove", (event) => {
      if (panning) {
        this.offsetX = panning.offsetX - (event.clientX - panning.x) / this.zoom;
        this.offsetY = panning.offsetY - (event.clientY - panning.y) / this.zoom;
        this.draw();
        return;
      }
      const tile = this.tileAt(event);
      const changed =
        (tile && tile.x) !== (this.hover && this.hover.x) || (tile && tile.y) !== (this.hover && this.hover.y);
      this.hover = tile;
      if (changed) this.emit("hover", tile);
      if (this.drag && tile) {
        if (this.drag.rect) {
          this.drag.end = tile;
        } else if (tile.x !== this.drag.last.x || tile.y !== this.drag.last.y) {
          // Fill the gap when the mouse moves fast
          const { x: lx, y: ly } = this.drag.last;
          const steps = Math.max(Math.abs(tile.x - lx), Math.abs(tile.y - ly));
          for (let s = 1; s <= steps; s++) {
            this.tool.apply(
              Math.round(lx + ((tile.x - lx) * s) / steps),
              Math.round(ly + ((tile.y - ly) * s) / steps),
              false
            );
          }
          this.drag.last = tile;
        }
      }
      if (changed || this.drag) this.draw();
    });

    const finish = () => {
      if (panning) {
        panning = null;
        return;
      }
      if (!this.drag) return;
      if (this.drag.rect) {
        const [ax, ay, bx, by] = this.dragRect();
        this.level.begin();
        for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) this.tool.apply(x, y, x === ax && y === ay);
      }
      this.level.end();
      this.drag = null;
      this.emit("change");
      this.draw();
    };
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", finish);
    canvas.addEventListener("pointerleave", () => {
      if (!this.drag && this.hover) {
        this.hover = null;
        this.emit("hover", null);
        this.draw();
      }
    });

    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const box = canvas.getBoundingClientRect();
        this.setZoom(this.zoom * (event.deltaY < 0 ? 1.25 : 0.8), event.clientX - box.left, event.clientY - box.top);
      },
      { passive: false }
    );
  }
}
