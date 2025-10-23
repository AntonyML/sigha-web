import { watch } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const electronDir = join(__dirname, '..', 'electron');
const distElectron = join(__dirname, '..', 'dist-electron');

console.log('Watching for TypeScript changes in electron/...');

// Initial compilation
compile();

// Watch for changes
watch(electronDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.ts')) {
    console.log(`File changed: ${filename}`);
    compile();
  }
});

function compile() {
  try {
    console.log('Compiling TypeScript...');
    execSync('tsc -p electron/tsconfig.json', { stdio: 'inherit', cwd: join(__dirname, '..') });
    
    // Rename .js files to .cjs
    import('./rename-to-cjs.js');
    
    console.log('✓ Compilation complete');
  } catch (error) {
    console.error('Compilation failed:', error.message);
  }
}
