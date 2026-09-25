import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, extname, relative, dirname} from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.md':'text/plain; charset=utf-8'};
createServer(async (req,res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if (relative(root,path).startsWith('..')) throw new Error('Outside project');
    const body = await readFile(path.endsWith(root) ? resolve(root,'index.html') : path);
    res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream'});
    res.end(body);
  } catch {
    res.writeHead(404,{'content-type':'text/plain'});
    res.end('Not found');
  }
}).listen(8765,'127.0.0.1',()=>console.log('MADE ready at http://127.0.0.1:8765'));
