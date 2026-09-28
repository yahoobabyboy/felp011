/**
 * Pre-build: keep uploaded images inside GitHub's comfort zone.
 *
 * GitHub warns above 50 MB per file, blocks above 100 MB, and a repository
 * should stay under ~1 GB. Photographers forget to resize, so this caps each
 * upload at 2400 px on the long edge, re-encodes to quality-82 JPEG, and warns
 * when a file is still too large. Nothing is deleted — the original stays in
 * version history.
 */
import { readdir, stat, rename, writeFile } from "node:fs/promises";
import { join, extname, parse } from "node:path";
import sharp from "sharp";

const MEDIA = new URL("../public/media/", import.meta.url).pathname;
const MAX_EDGE = 2400;
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".tif", ".heic"]);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (ALLOWED.has(extname(entry.name).toLowerCase())) yield full;
  }
}

let checked = 0;
let shrunk = 0;
let oversized = 0;
let skipped = 0;

for await (const file of walk(MEDIA)) {
  checked += 1;
  const { name, ext } = parse(file);
  const before = (await stat(file)).size;

  try {
    const image = sharp(file, { failOn: "none" });
    const meta = await image.metadata();
    const needsResize = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE;

    if (!needsResize && before <= MAX_BYTES) continue;

    const buffer = await image
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();

    const target = join(file, `..`, `.${name}-optimized.jpg`);
    if (ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg") {
      skipped += 1;
      console.log(`  left ${name}${ext} alone: this script only re-encodes JPEG, and writing JPEG bytes behind a ${ext} name would be a lie.`);
      continue;
    }

    await writeFile(target, buffer);
    await rename(target, file);

    if (before > MAX_BYTES) {
      oversized += 1;
      console.log(`  replaced ${name}${ext} (${(before / 1e6).toFixed(1)} MB -> ${(buffer.length / 1e6).toFixed(1)} MB)`);
    } else {
      shrunk += 1;
      console.log(`  resized ${name}${ext} ${meta.width}x${meta.height} -> 2400px max (${(before / 1e6).toFixed(1)} MB -> ${(buffer.length / 1e6).toFixed(1)} MB)`);
    }
  } catch (error) {
    console.warn(`  skipped ${name}${ext}: ${error.message}`);
  }
}

if (checked > 0) {
  console.log(`media check: ${checked} image(s), ${shrunk} resized, ${oversized} compressed, ${skipped} left alone`);
}
