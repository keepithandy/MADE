import {readFile, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const css = await readFile(join(root, 'css/style.css'), 'utf8');
const data = (await readFile(join(root, 'js/data.js'), 'utf8'))
  .replace(/^export const /gm, 'const ');
const app = (await readFile(join(root, 'js/app.js'), 'utf8'))
  .replace(/^import \{districts,businesses,eventTemplates,first,last,rivals\} from '\.\/data\.js';\r?\n/m, '');
const systems = await readFile(join(root, 'js/systems.js'), 'utf8');
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#171715"><title>MADE — A Crime Dynasty Life Simulator</title><style>' +
  css + '</style></head><body><div id="app"></div><script>' +
  data + '\n' + app + '\n' + systems + '</script></body></html>';
await writeFile(join(root, 'index.html'), html);
