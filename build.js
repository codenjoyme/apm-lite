#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');

const tsc = path.join(__dirname, 'node_modules', 'typescript', 'lib', 'tsc.js');
try {
  execFileSync(process.execPath, [tsc], { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
