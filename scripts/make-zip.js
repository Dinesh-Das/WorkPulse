import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function zipDirectory(sourceDir, outPath) {
  const archiverFunc = typeof archiver === 'function' ? archiver : archiver.default;
  const archive = archiverFunc('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

async function main() {
  const outDir = path.resolve(__dirname, '../out');
  const makeDir = path.resolve(outDir, 'make');
  
  console.log(`Searching for packaged apps in: ${outDir}`);

  if (!fs.existsSync(makeDir)) {
    console.log(`Creating directory: ${makeDir}`);
    fs.mkdirSync(makeDir, { recursive: true });
  }

  // Find the packaged app directory in 'out'
  const dirs = fs.readdirSync(outDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'make')
    .map(dirent => dirent.name);

  console.log(`Found directories: ${dirs.join(', ')}`);

  if (dirs.length === 0) {
    console.error('No packaged application found in out/ directory.');
    process.exit(1);
  }

  for (const dir of dirs) {
    const sourcePath = path.join(outDir, dir);
    const zipPath = path.join(makeDir, `${dir}.zip`);
    console.log(`Zipping ${dir} to ${zipPath}...`);
    try {
      await zipDirectory(sourcePath, zipPath);
      console.log(`Successfully created: ${zipPath}`);
    } catch (err) {
      console.error(`Failed to zip ${dir}:`, err);
      throw err;
    }
  }
}

main().catch(err => {
  console.error('Zip failed:', err);
  process.exit(1);
});
