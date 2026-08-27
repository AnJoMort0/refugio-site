import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '..', 'public');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.webp', 'image/webp']
]);

function isInsidePublicDirectory(filePath) {
  const root = PUBLIC_DIRECTORY.toLowerCase();
  const candidate = filePath.toLowerCase();
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

async function resolvePublicFile(pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.resolve(PUBLIC_DIRECTORY, `.${requestedPath}`);
  if (!isInsidePublicDirectory(filePath)) return null;

  try {
    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      if (!(await stat(filePath)).isFile()) return null;
    }
    return filePath;
  } catch {
    return null;
  }
}

function streamFile(response, requestMethod, filePath, statusCode = 200) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': MIME_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream'
  });
  if (requestMethod === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || HOST}`).pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
    return;
  }

  const filePath = await resolvePublicFile(pathname);
  if (filePath) {
    streamFile(response, request.method, filePath);
    return;
  }

  streamFile(response, request.method, path.join(PUBLIC_DIRECTORY, '404.html'), 404);
});

server.listen(PORT, HOST, () => {
  console.log(`O Refúgio preview: http://${HOST}:${PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
