// Parses the data sections of a PICO-8 text cartridge (.p8): sprites, sprite
// flags, map, sound effects and music. The Lua code is ported by hand.

function sections(text) {
  const result = {};
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const header = line.match(/^__(\w+)__$/);
    if (header) {
      current = result[header[1]] = [];
    } else if (current) {
      current.push(line);
    }
  }
  return result;
}

function hexBytes(line) {
  const bytes = [];
  for (let i = 0; i + 1 < line.length; i += 2) {
    bytes.push(parseInt(line.substr(i, 2), 16));
  }
  return bytes;
}

// 128x128 pixels, one hex digit per pixel
function parseGfx(lines) {
  const gfx = new Uint8Array(128 * 128);
  lines.slice(0, 128).forEach((line, y) => {
    for (let x = 0; x < 128 && x < line.length; x++) {
      gfx[y * 128 + x] = parseInt(line[x], 16);
    }
  });
  return gfx;
}

// 128x32 cells, two hex digits per cell (the lower 32 rows share the memory of
// the lower half of the sprite sheet and are not used by this cartridge)
function parseMap(lines) {
  const map = new Uint8Array(128 * 32);
  lines.slice(0, 32).forEach((line, y) => {
    hexBytes(line)
      .slice(0, 128)
      .forEach((tile, x) => {
        map[y * 128 + x] = tile;
      });
  });
  return map;
}

function parseFlags(lines) {
  const flags = new Uint8Array(256);
  hexBytes(lines.join(""))
    .slice(0, 256)
    .forEach((bits, i) => {
      flags[i] = bits;
    });
  return flags;
}

// Each line: filters/editor mode, speed, loop start and loop end (one byte
// each), then 32 notes of 5 hex digits: key (2), instrument (1, +8 for a
// custom instrument), volume (1) and effect (1)
function parseSfx(lines) {
  const sfx = [];
  for (let i = 0; i < 64; i++) {
    const line = lines[i] || "";
    const [filters = 0, speed = 0, loopStart = 0, loopEnd = 0] = hexBytes(line.substr(0, 8));
    const notes = [];
    for (let n = 0; n < 32; n++) {
      const note = parseInt(line.substr(8 + n * 5, 5), 16) || 0;
      notes.push({
        key: (note >> 12) & 0x3f,
        instrument: (note >> 8) & 0x7,
        custom: (note >> 11) & 0x1,
        volume: (note >> 4) & 0x7,
        effect: note & 0x7
      });
    }
    sfx.push({ filters, speed, loopStart, loopEnd, notes });
  }
  return sfx;
}

// Each line: flags (1: loop start, 2: loop end, 4: stop at end) and the sound
// effect of each of the 4 channels (0x40 set when the channel is disabled)
function parseMusic(lines) {
  const music = [];
  for (let i = 0; i < 64; i++) {
    const line = lines[i] || "";
    const match = line.match(/^([0-9a-f]{2}) ([0-9a-f]{8})$/);
    if (match) {
      const flags = parseInt(match[1], 16);
      music.push({
        start: !!(flags & 1),
        loop: !!(flags & 2),
        stop: !!(flags & 4),
        channels: hexBytes(match[2])
      });
    } else {
      music.push({ start: false, loop: false, stop: false, channels: [0x41, 0x42, 0x43, 0x44] });
    }
  }
  return music;
}

export function parseCart(text) {
  const data = sections(text);
  return {
    gfx: parseGfx(data.gfx || []),
    map: parseMap(data.map || []),
    flags: parseFlags(data.gff || []),
    sfx: parseSfx(data.sfx || []),
    music: parseMusic(data.music || [])
  };
}
