import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Current __dirname:', process.cwd());
try {
  fs.mkdirSync('node_modules', { recursive: true });
  console.log('Created node_modules folder directly!');
} catch (e) {
  console.error('Error creating node_modules:', e);
}
