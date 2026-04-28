import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const imageDir = path.resolve('public/assets/images');
const manifestPath = path.resolve('public/assets/images/manifest.json');
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function buildLabel(filename) {
  const base = filename.replace(path.extname(filename), '');
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const entries = await readdir(imageDir, { withFileTypes: true });
const images = entries
  .filter((entry) => entry.isFile())
  .filter((entry) => allowedExtensions.has(path.extname(entry.name).toLowerCase()))
  .map((entry) => ({
    src: `./assets/images/${entry.name}`,
    label: buildLabel(entry.name)
  }))
  .sort((a, b) => a.src.localeCompare(b.src));

await writeFile(manifestPath, `${JSON.stringify(images, null, 2)}\n`);
console.log(`Wrote ${images.length} gallery images to ${manifestPath}`);
