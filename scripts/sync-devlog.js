#!/usr/bin/env node

/**
 * DevLog Synchronization Script
 *
 * Синхронизира devlog директориите между:
 * - admin/notes/devlog
 * - mobile/notes/devlog
 * - Obsidian Vault (C:\Obsidian\Vault\02_Projects\KetoCakR\DevLogs)
 *
 * Usage: node scripts/sync-devlog.js [--obsidian-only] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const ADMIN_DEVLOG = path.join(PROJECT_ROOT, 'admin', 'notes', 'devlog');
const MOBILE_DEVLOG = path.join(PROJECT_ROOT, 'Mobile', 'notes', 'devlog');
const OBSIDIAN_PATH = 'C:\\Obsidian\\Vault\\02_Projects\\KetoCakR\\DevLogs';

// Parse CLI arguments
const args = process.argv.slice(2);
const obsidianOnly = args.includes('--obsidian-only');
const dryRun = args.includes('--dry-run');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

function getFileStats(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getAllFiles(dir, prefix = '') {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === '.gitkeep' || item.startsWith('.')) continue;

    const fullPath = path.join(dir, item);
    const relPath = prefix ? `${prefix}/${item}` : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, relPath));
    } else {
      files.push({ relPath, fullPath, stat });
    }
  }
  return files;
}

function syncDirectories(source, target, label) {
  log(`\n📁 ${label}`, 'cyan');
  log(`  Source: ${source}`);
  log(`  Target: ${target}`);

  ensureDir(target);
  const sourceFiles = getAllFiles(source);
  let synced = 0;

  for (const { relPath, fullPath, stat } of sourceFiles) {
    const targetPath = path.join(target, relPath);
    const targetDir = path.dirname(targetPath);

    ensureDir(targetDir);

    const sourceHash = getFileHash(fullPath);
    const targetHash = getFileHash(targetPath);

    if (sourceHash !== targetHash) {
      if (!dryRun) {
        fs.copyFileSync(fullPath, targetPath);
      }
      log(`  ✓ Synced: ${relPath}`, 'green');
      synced++;
    }
  }

  // Check for files in target that don't exist in source
  const targetFiles = getAllFiles(target);
  for (const { relPath, fullPath } of targetFiles) {
    const sourcePath = path.join(source, relPath);
    if (!fs.existsSync(sourcePath)) {
      log(`  ⚠ Orphaned: ${relPath} (exists only in target)`, 'yellow');
    }
  }

  return synced;
}

function main() {
  log('\n🔄 DevLog Synchronization Starting...', 'blue');
  log(`Dry run: ${dryRun ? 'YES (no changes made)' : 'NO (changes will be applied)'}`, 'yellow');

  let totalSynced = 0;

  // Step 1: Sync admin <-> mobile
  if (!obsidianOnly) {
    const adminToMobile = syncDirectories(ADMIN_DEVLOG, MOBILE_DEVLOG, 'Admin → Mobile');
    const mobileToAdmin = syncDirectories(MOBILE_DEVLOG, ADMIN_DEVLOG, 'Mobile → Admin');
    totalSynced += adminToMobile + mobileToAdmin;
  }

  // Step 2: Sync to Obsidian
  if (fs.existsSync(OBSIDIAN_PATH)) {
    log(`\n📚 Syncing to Obsidian`, 'cyan');
    log(`  Obsidian Vault: ${OBSIDIAN_PATH}`);

    const adminToObsidian = syncDirectories(ADMIN_DEVLOG, OBSIDIAN_PATH, 'Admin → Obsidian');
    const mobileToObsidian = syncDirectories(MOBILE_DEVLOG, OBSIDIAN_PATH, 'Mobile → Obsidian');
    totalSynced += adminToObsidian + mobileToObsidian;
  } else {
    log(`\n⚠ Obsidian vault not found at ${OBSIDIAN_PATH}`, 'red');
  }

  // Summary
  log(`\n✨ Synchronization Complete!`, 'green');
  log(`Total files synced: ${totalSynced}`, 'green');

  if (dryRun) {
    log(`\n⚡ Dry run completed. Run without --dry-run to apply changes.`, 'yellow');
  }
}

main();
