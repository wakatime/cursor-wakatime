#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, '.cursor-plugin', 'plugin.json');
const hooksPath = path.join(root, 'hooks', 'hooks.json');
const errors = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${path.relative(root, file)}: ${error.message}`);
    return {};
  }
}

const manifest = readJson(manifestPath);
const hooks = readJson(hooksPath);
const namePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

if (!namePattern.test(manifest.name || '')) errors.push('plugin name must be lowercase kebab-case');
if (!/^\d+\.\d+\.\d+$/.test(manifest.version || '')) errors.push('plugin version must be semantic versioning');
for (const field of ['description', 'displayName', 'license']) {
  if (!manifest[field]) errors.push(`plugin manifest is missing ${field}`);
}
if (!manifest.author?.name) errors.push('plugin manifest is missing author.name');
if (!manifest.logo || !fs.existsSync(path.join(root, manifest.logo))) {
  errors.push('plugin manifest logo is missing or does not exist');
}

const expectedEvents = ['sessionStart', 'beforeSubmitPrompt', 'afterFileEdit'];
for (const event of expectedEvents) {
  const entries = hooks.hooks?.[event];
  if (!Array.isArray(entries) || entries.length === 0) errors.push(`hooks are missing ${event}`);
  for (const entry of entries || []) {
    if (entry.command !== 'node ./bin/cursor-wakatime.js --background') {
      errors.push(`${event} has an unexpected command`);
    }
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log('Cursor plugin manifest and hooks are valid.');
