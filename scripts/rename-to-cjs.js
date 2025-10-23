import { renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distElectron = join(__dirname, '..', 'dist-electron');

// Rename main.js to main.cjs
const mainJs = join(distElectron, 'main.js');
const mainCjs = join(distElectron, 'main.cjs');
if (existsSync(mainJs)) {
  renameSync(mainJs, mainCjs);
  console.log('✓ Renamed main.js to main.cjs');
}

// Rename preload.js to preload.cjs
const preloadJs = join(distElectron, 'preload.js');
const preloadCjs = join(distElectron, 'preload.cjs');
if (existsSync(preloadJs)) {
  renameSync(preloadJs, preloadCjs);
  console.log('✓ Renamed preload.js to preload.cjs');
}
