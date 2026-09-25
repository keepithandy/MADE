import {access} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const required = [
  'index.html',
  'css/style.css',
  'css/themes.css',
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/responsive.css',
  'js/data.js',
  'js/app.js',
  'js/systems.js'
];

await Promise.all(required.map(file => access(join(root, file))));
console.log('MADE package ready:');
for (const file of required) console.log('  ' + file);
