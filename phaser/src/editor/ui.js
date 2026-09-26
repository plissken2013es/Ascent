// The panels of the editor (editor.html) around the map view

import { ENTITIES, FLAGS, ROOM, UPGRADES } from "./model.js";

// Where the editor keeps its work, and hands a map to the game to play it
export const DRAFT_KEY = "ascent-editor-draft";
export const PLAY_KEY = "ascent-editor-play";

const $ = (selector) => document.querySelector(selector);

function h(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith("on")) element.addEventListener(key.slice(2), value);
    else if (key === "class") element.className = value;
    else element.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child !== null && child !== undefined) element.append(child);
  }
  return element;
}

// A 16x16 icon of a sprite
function spriteIcon(sheet, tile) {
  const canvas = h("canvas", { width: 8, height: 8, class: "sprite" });
  canvas.getContext("2d").drawImage(sheet, (tile % 16) * 8, Math.floor(tile / 16) * 8, 8, 8, 0, 0, 8, 8);
  return canvas;
}

// The first brush: the most common tile of the map (besides nothing)
function mostUsedTile(level) {
  const counts = new Map();
  for (const tile of level.tiles) if (tile) counts.set(tile, (counts.get(tile) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 1;
}

const TOOLS = [
  { name: "pencil", label: "Pencil", key: "KeyB", help: "Paints the selected tile. Drag to paint more." },
  { name: "eraser", label: "Eraser", key: "KeyE", help: "Clears tiles (tile 0, nothing)." },
  { name: "rect", label: "Rectangle", key: "KeyR", help: "Drag a rectangle to fill it with the selected tile." },
  { name: "picker", label: "Picker", key: "KeyI", help: "Picks the tile under the mouse as the brush." }
];

export class EditorUI {
  constructor({ level, view, cart, original }) {
    this.level = level;
    this.view = view;
    this.cart = cart;
    this.original = original;
    this.brush = 1;
    this.toolName = "pencil";

    this.buildHeader();
    this.buildTools();
    this.buildEntities();
    this.buildSheet();
    this.buildViewOptions();
    this.buildLegend();
    this.setupKeyboard();
    this.setupPlay();

    view.on("hover", (tile) => this.refreshStatus(tile));
    view.on("select", (tile) => this.showTile(tile));
    view.on("change", () => {
      this.changed();
      if (this.picked) {
        this.picked = false;
        this.setTool("pencil");
      }
    });
    view.on("zoom", (zoom) => ($("#zoom").textContent = `${Math.round(zoom * 100)}%`));

    this.setTool("pencil");
    this.setBrush(mostUsedTile(level));
    this.refresh();
  }

  //
  // Header: files, undo and redo
  //

  buildHeader() {
    $("#open").addEventListener("click", () => $("#open-file").click());
    $("#open-file").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        this.level.load(await file.text());
        this.changed();
        this.view.draw();
        this.toast(`Opened ${file.name}`);
      } catch (e) {
        this.toast(`Can't open ${file.name}: ${e.message}`);
      }
      event.target.value = "";
    });
    $("#save").addEventListener("click", () => this.save());
    $("#reset").addEventListener("click", () => {
      if (!confirm("Replace this map by the map of the game?")) return;
      this.level.load(this.original);
      this.changed();
      this.view.draw();
    });
    $("#undo").addEventListener("click", () => this.undo());
    $("#redo").addEventListener("click", () => this.redo());
  }

  save() {
    const blob = new Blob([this.level.toCart()], { type: "text/plain" });
    const a = h("a", { href: URL.createObjectURL(blob), download: "ascent.p8" });
    a.click();
    URL.revokeObjectURL(a.href);
    this.toast("Saved ascent.p8");
  }

  undo() {
    if (this.level.undo()) this.changed();
    this.view.draw();
  }

  redo() {
    if (this.level.redo()) this.changed();
    this.view.draw();
  }

  //
  // Tools and brushes
  //

  buildTools() {
    const tools = $("#tools");
    for (const tool of TOOLS) {
      tools.append(
        h(
          "button",
          {
            "data-tool": tool.name,
            title: `${tool.help} (${tool.key.slice(3)})`,
            onclick: () => this.setTool(tool.name)
          },
          tool.label
        )
      );
    }
  }

  setTool(name) {
    this.toolName = name;
    const level = this.level;
    const paint = (tile) => (x, y) => level.set(x, y, tile);
    const tools = {
      pencil: { apply: (x, y) => paint(this.brush)(x, y) },
      eraser: { apply: paint(0) },
      rect: { rect: true, apply: (x, y) => paint(this.brush)(x, y) },
      // (back to the pencil once the mouse is released)
      picker: {
        apply: (x, y) => {
          this.setBrush(level.get(x, y));
          this.picked = true;
        }
      }
    };
    this.view.tool = tools[name];
    for (const button of document.querySelectorAll("#tools button")) {
      button.classList.toggle("active", button.dataset.tool === name);
    }
    $("#tool-help").textContent = TOOLS.find((t) => t.name === name).help;
  }

  buildEntities() {
    const list = $("#entities");
    for (const [tile, entity] of Object.entries(ENTITIES)) {
      list.append(
        h(
          "button",
          { "data-tile": tile, title: entity.help, onclick: () => this.setBrush(Number(tile)) },
          spriteIcon(this.view.sheet, Number(tile)),
          entity.name
        )
      );
    }
  }

  buildSheet() {
    const canvas = $("#sheet");
    const context = canvas.getContext("2d");
    this.drawSheet = () => {
      context.clearRect(0, 0, 128, 128);
      context.drawImage(this.view.sheet, 0, 0);
      context.strokeStyle = "#ffd23f";
      context.lineWidth = 1;
      context.strokeRect((this.brush % 16) * 8 + 0.5, Math.floor(this.brush / 16) * 8 + 0.5, 7, 7);
    };
    canvas.addEventListener("click", (event) => {
      const box = canvas.getBoundingClientRect();
      const x = Math.floor(((event.clientX - box.left) / box.width) * 16);
      const y = Math.floor(((event.clientY - box.top) / box.height) * 16);
      this.setBrush(y * 16 + x);
      if (this.toolName === "eraser" || this.toolName === "picker") this.setTool("pencil");
    });
  }

  setBrush(tile) {
    this.brush = tile;
    this.drawSheet();
    const preview = $("#brush canvas").getContext("2d");
    preview.clearRect(0, 0, 8, 8);
    preview.drawImage(this.view.sheet, (tile % 16) * 8, Math.floor(tile / 16) * 8, 8, 8, 0, 0, 8, 8);
    const entity = ENTITIES[tile];
    $("#brush-name").textContent = `Tile ${tile}${entity ? ` · ${entity.name}` : ""}${this.flagNames(tile)}`;
    for (const button of document.querySelectorAll("#entities button")) {
      button.classList.toggle("active", Number(button.dataset.tile) === tile);
    }
  }

  flagNames(tile) {
    const names = FLAGS.filter((f) => this.cart.flags[tile] & (1 << f.bit)).map((f) => f.name);
    return names.length ? ` · ${names.join(", ")}` : "";
  }

  //
  // View options
  //

  buildViewOptions() {
    const options = this.view.options;
    const labels = { rooms: "Rooms", grid: "Grid", flags: "Flags", entities: "Entities" };
    const container = $("#view-options");
    for (const [key, label] of Object.entries(labels)) {
      const input = h("input", { type: "checkbox", "data-option": key });
      input.checked = !!options[key];
      input.addEventListener("change", () => {
        options[key] = input.checked;
        this.view.draw();
      });
      container.append(h("label", {}, input, label));
    }
    $("#zoom-in").addEventListener("click", () => this.view.setZoom(this.view.zoom * 1.25));
    $("#zoom-out").addEventListener("click", () => this.view.setZoom(this.view.zoom * 0.8));
    $("#zoom-fit").addEventListener("click", () => this.view.fit());
  }

  buildLegend() {
    $("#legend").append(
      ...FLAGS.map((f) => h("div", {}, h("span", { class: "flag", style: `background: ${f.color}` }), f.name))
    );
  }

  //
  // Information
  //

  refreshStatus(tile) {
    if (!tile) {
      $("#status").textContent = "";
      return;
    }
    const n = this.level.get(tile.x, tile.y);
    const entity = ENTITIES[n];
    $("#status").textContent =
      `Tile ${tile.x},${tile.y} · room ${Math.floor(tile.x / ROOM)},${Math.floor(tile.y / ROOM)} · ` +
      `pixel ${tile.x * 8},${tile.y * 8} · tile ${n}${entity ? ` (${entity.name})` : ""}${this.flagNames(n)}`;
  }

  showTile(tile) {
    this.selected = tile;
    const info = $("#tile-info");
    info.replaceChildren();
    if (!tile) return;
    const n = this.level.get(tile.x, tile.y);
    const entity = ENTITIES[n];
    const rows = [
      ["Position", `${tile.x},${tile.y}`],
      ["Room", `${Math.floor(tile.x / ROOM)},${Math.floor(tile.y / ROOM)}`],
      ["Tile", h("span", {}, spriteIcon(this.view.sheet, n), ` ${n}`)],
      ["Flags", this.flagNames(n).slice(3) || "none"]
    ];
    if (entity) rows.push(["Entity", entity.name], ["", entity.help]);
    if (n === 145) rows.push(["Upgrade", UPGRADES[tile.x] || "none (this column gives nothing)"]);
    info.append(
      h(
        "dl",
        {},
        rows.map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])
      )
    );
  }

  refreshProblems() {
    const problems = this.level.problems();
    $("#problems-count").textContent = problems.length ? `(${problems.length})` : "";
    const list = $("#problems");
    list.replaceChildren();
    if (!problems.length) {
      list.append(h("li", { class: "ok" }, "None: the game can be played to the end"));
    }
    for (const problem of problems) {
      const at = problem.x !== undefined;
      list.append(
        h(
          "li",
          {
            class: at ? "at" : "",
            title: at ? "Show it" : "",
            onclick: () => {
              if (!at) return;
              const tile = { x: problem.x, y: problem.y };
              this.view.selection = tile;
              this.view.showRoom(Math.floor(tile.x / ROOM), Math.floor(tile.y / ROOM), Math.max(this.view.zoom, 3));
              this.showTile(tile);
            }
          },
          problem.message + (at ? ` (${problem.x},${problem.y})` : "")
        )
      );
    }
  }

  refresh() {
    $("#undo").disabled = !this.level.undoStack.length;
    $("#redo").disabled = !this.level.redoStack.length;
    this.refreshProblems();
    if (this.selected) this.showTile(this.selected);
  }

  // After each change: the draft is kept in the browser
  changed() {
    try {
      localStorage.setItem(DRAFT_KEY, this.level.toCart());
    } catch (e) {
      // no storage: the map is only lost when the page is closed
    }
    this.refresh();
  }

  toast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
  }

  //
  // Keyboard and test play
  //

  setupKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (!$("#play-overlay").hidden) {
        if (event.code === "Escape") this.closePlay();
        return;
      }
      if (event.target.tagName === "INPUT") return;
      const ctrl = event.ctrlKey || event.metaKey;
      if (ctrl && event.code === "KeyZ") this.undo();
      else if (ctrl && event.code === "KeyY") this.redo();
      else if (ctrl && event.code === "KeyS") this.save();
      else if (ctrl) return;
      else if (event.code === "KeyP") this.play(event.shiftKey);
      else if (event.code === "KeyF") this.view.fit();
      else if (event.code === "Equal" || event.code === "NumpadAdd") this.view.setZoom(this.view.zoom * 1.25);
      else if (event.code === "Minus" || event.code === "NumpadSubtract") this.view.setZoom(this.view.zoom * 0.8);
      else {
        const tool = TOOLS.find((t) => t.key === event.code);
        if (!tool) return;
        this.setTool(tool.name);
      }
      event.preventDefault();
    });
  }

  setupPlay() {
    $("#play").addEventListener("click", () => this.play(false));
    $("#play-here").addEventListener("click", () => this.play(true));
    $("#play-close").addEventListener("click", () => this.closePlay());
    // Esc in the game (see main.js)
    window.addEventListener("message", (event) => {
      if (event.origin === location.origin && event.data && event.data.type === "ascent-editor-close") this.closePlay();
    });
  }

  // Plays the map in the game (index.html?play), from the start or from the
  // selected tile
  play(fromHere) {
    if (fromHere && !this.selected) {
      this.toast("Select a tile first");
      return;
    }
    const from = fromHere ? { x: this.selected.x * 8 + 4, y: this.selected.y * 8 + 5 } : null;
    localStorage.setItem(PLAY_KEY, JSON.stringify({ cart: this.level.toCart(), from }));
    const frame = $("#play-frame");
    frame.src = "index.html?play";
    $("#play-overlay").hidden = false;
    frame.addEventListener("load", () => frame.contentWindow.focus(), { once: true });
  }

  closePlay() {
    $("#play-frame").src = "about:blank";
    $("#play-overlay").hidden = true;
  }
}
