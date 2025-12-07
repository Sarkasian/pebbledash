/**
 * Bundle size analysis script
 *
 * Analyzes the dist output of each package and reports file sizes.
 * Run with: pnpm analyze
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

interface FileInfo {
  path: string;
  size: number;
  sizeKB: string;
}

interface PackageReport {
  name: string;
  totalSize: number;
  totalSizeKB: string;
  jsSize: number;
  jsSizeKB: string;
  dtsSize: number;
  dtsSizeKB: string;
  mapSize: number;
  mapSizeKB: string;
  files: FileInfo[];
}

const PACKAGES_DIR = join(process.cwd(), 'packages');

function formatSize(bytes: number): string {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function getFilesRecursive(dir: string, basePath: string = ''): FileInfo[] {
  if (!existsSync(dir)) return [];

  const files: FileInfo[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = basePath ? join(basePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      files.push(...getFilesRecursive(fullPath, relativePath));
    } else {
      const stats = statSync(fullPath);
      files.push({
        path: relativePath,
        size: stats.size,
        sizeKB: formatSize(stats.size),
      });
    }
  }

  return files;
}

function analyzePackage(packageName: string): PackageReport | null {
  const distPath = join(PACKAGES_DIR, packageName, 'dist');

  if (!existsSync(distPath)) {
    return null;
  }

  const files = getFilesRecursive(distPath);

  let jsSize = 0;
  let dtsSize = 0;
  let mapSize = 0;

  for (const file of files) {
    if (file.path.endsWith('.js')) {
      jsSize += file.size;
    } else if (file.path.endsWith('.d.ts')) {
      dtsSize += file.size;
    } else if (file.path.endsWith('.map')) {
      mapSize += file.size;
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return {
    name: packageName,
    totalSize,
    totalSizeKB: formatSize(totalSize),
    jsSize,
    jsSizeKB: formatSize(jsSize),
    dtsSize,
    dtsSizeKB: formatSize(dtsSize),
    mapSize,
    mapSizeKB: formatSize(mapSize),
    files: files.sort((a, b) => b.size - a.size),
  };
}

function printReport(reports: PackageReport[]) {
  console.log('\n📦 Bundle Size Analysis\n');
  console.log('='.repeat(60));

  for (const report of reports) {
    console.log(`\n📁 @pebbledash/${report.name}`);
    console.log('-'.repeat(40));
    console.log(`   Total:       ${report.totalSizeKB}`);
    console.log(`   JavaScript:  ${report.jsSizeKB}`);
    console.log(`   TypeScript:  ${report.dtsSizeKB}`);
    console.log(`   Source Maps: ${report.mapSizeKB}`);

    console.log('\n   Largest files:');
    const topFiles = report.files.slice(0, 5);
    for (const file of topFiles) {
      console.log(`     ${file.sizeKB.padStart(10)} - ${file.path}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary\n');

  const totals = reports.reduce(
    (acc, r) => ({
      total: acc.total + r.totalSize,
      js: acc.js + r.jsSize,
      dts: acc.dts + r.dtsSize,
      map: acc.map + r.mapSize,
    }),
    { total: 0, js: 0, dts: 0, map: 0 },
  );

  console.log(`   Total dist size:    ${formatSize(totals.total)}`);
  console.log(`   JavaScript only:    ${formatSize(totals.js)}`);
  console.log(`   TypeScript decls:   ${formatSize(totals.dts)}`);
  console.log(`   Source maps:        ${formatSize(totals.map)}`);
  console.log(`   JS + Types (no maps): ${formatSize(totals.js + totals.dts)}`);
}

// Main
const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const reports = packageDirs.map(analyzePackage).filter((r): r is PackageReport => r !== null);

if (reports.length === 0) {
  console.log('No dist folders found. Run `pnpm build` first.');
  process.exit(1);
}

printReport(reports);
