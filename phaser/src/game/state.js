// The global variables of the Lua program. run() starts over with none of them
// set, like a fresh Lua state.
//
// Renamed from the Lua source: ⧗ (frame counter) is `tick`, ▒ (tile) is `tile`.

export let g = {};

export function resetState() {
  g = {};
}
