const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "movies.json");

async function ensureDataFile() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(DATA_FILE, fs.constants.F_OK);
  } catch (_) {
    await fsp.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAllMovies() {
  try {
    await ensureDataFile();
    const content = await fsp.readFile(DATA_FILE, "utf8");
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  } catch (_) {
    return [];
  }
}

async function writeAllMovies(movies) {
  await ensureDataFile();
  await fsp.writeFile(DATA_FILE, JSON.stringify(movies, null, 2), "utf8");
}

module.exports = { readAllMovies, writeAllMovies };
