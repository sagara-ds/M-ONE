import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const explicitPort = process.env.PORT !== undefined;
const portText = explicitPort ? process.env.PORT.trim() : '4173';
const requestedPort = Number(portText);
if (!/^\d+$/.test(portText) || !Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
  console.error('PORT harus berupa angka antara 1 dan 65535. Contoh Command Prompt: set "PORT=4174"');
  process.exit(1);
}
let port = requestedPort;
const lastPort = explicitPort ? requestedPort : 4183;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = createServer((request, response) => {
  const requested = decodeURIComponent(request.url.split('?')[0]);
  const path = requested === '/' ? '/index.html' : requested;
  const file = resolve(root, `.${path}`);
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404); response.end('Not found'); return;
  }
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && !explicitPort && port < lastPort) {
    console.warn(`Port ${port} sedang dipakai. Mencoba port ${port + 1}…`);
    port += 1;
    server.listen(port);
    return;
  }
  if (error.code === 'EADDRINUSE') {
    console.error(explicitPort
      ? `Port ${port} sedang dipakai. Pilih port lain dengan PORT, atau hentikan preview lama milikmu dengan Ctrl+C.`
      : 'Port 4173–4183 sedang dipakai. Pilih port lain dengan PORT atau hentikan preview lama milikmu dengan Ctrl+C.');
  } else {
    console.error(`Preview gagal dimulai (${error.code || 'ERROR'}): ${error.message}`);
  }
  process.exitCode = 1;
});
server.on('listening', () => console.log(`Preview: http://localhost:${port}`));
server.listen(port);
