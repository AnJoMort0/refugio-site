import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const [key, ...valueParts] = argument.replace(/^--/, '').split('=');
  return [key, valueParts.join('=') || true];
}));
const url = String(args.url || 'http://127.0.0.1:3000/index.html');
const output = path.resolve(String(args.output || 'temp/page-capture.png'));
const width = Number(args.width || 390);
const height = Number(args.height || 844);
const port = Number(args.port || 9333);
const profile = path.resolve(`.tmp-edge-cdp-${port}`);
const emulateReducedMotion = args.motion !== 'normal';

await rm(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
await mkdir(profile, { recursive: true });
await mkdir(path.dirname(output), { recursive: true });

const browserArguments = [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank'
];
if (emulateReducedMotion) browserArguments.splice(3, 0, '--force-prefers-reduced-motion');

const browser = spawn(EDGE_PATH, browserArguments, { stdio: 'ignore' });

async function waitForDebuggingTarget() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const target = targets.find((candidate) => candidate.type === 'page');
      if (target?.webSocketDebuggerUrl) return target;
    } catch {
      // Edge may need a moment to open its debugging endpoint.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Could not connect to the Edge debugging endpoint.');
}

const target = await waitForDebuggingTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const runtimeErrors = [];
let commandId = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') {
    runtimeErrors.push(message.params?.exceptionDetails?.text || 'Uncaught runtime exception');
  }
  if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
    runtimeErrors.push(message.params.entry.text || 'Browser log error');
  }
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result || {});
});

function command(method, params = {}) {
  commandId += 1;
  socket.send(JSON.stringify({ id: commandId, method, params }));
  return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject }));
}

async function navigate(nextUrl) {
  await command('Page.navigate', { url: nextUrl });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const ready = await command('Runtime.evaluate', {
      expression: "document.readyState === 'complete'",
      returnByValue: true
    });
    if (ready.result.value) break;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  await new Promise((resolve) => setTimeout(resolve, 1200));
}

try {
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Log.enable');
  await command('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 767,
    screenWidth: width,
    screenHeight: height
  });
  if (emulateReducedMotion) {
    await command('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
  }
  await navigate(url);

  if (args.locale) {
    await command('Runtime.evaluate', {
      expression: `localStorage.setItem('refugio-language', ${JSON.stringify(String(args.locale))})`
    });
    await navigate(url);
  }

  if (args.admin) {
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    const adminUsers = {
      dev: { id: 'user-dev-andre', username: 'andre', displayName: 'André', role: 'dev', roleLabel: 'Dev' },
      owner: { id: 'user-owner-jorge', username: 'jorge', displayName: 'Jorge', role: 'owner', roleLabel: 'Proprietário' },
      employee: { id: 'user-employee-dulce', username: 'dulce', displayName: 'Dulce', role: 'employee', roleLabel: 'Funcionário' }
    };
    const adminUser = adminUsers[String(args['admin-user'] || 'dev')] || adminUsers.dev;
    const session = {
      user: adminUser,
      createdAt: new Date().toISOString(),
      expiresAt
    };
    await command('Runtime.evaluate', {
      expression: `localStorage.setItem('refugio-admin-session-v1', ${JSON.stringify(JSON.stringify(session))})`
    });
    await navigate(url);
  }

  if (args['pwa-offline']) {
    await command('Runtime.evaluate', {
      expression: `navigator.serviceWorker
        ? navigator.serviceWorker.ready.then(() => true).catch(() => false)
        : Promise.resolve(false)`,
      awaitPromise: true,
      returnByValue: true
    });
    await navigate(url);
    await command('Network.enable');
    await command('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });
    await navigate(url);
  }

  if (args.view) {
    const viewSelector = `[data-view="${String(args.view)}"]`;
    await command('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(viewSelector)})?.click()`
    });
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  if (args['scroll-before-click']) {
    await command('Runtime.evaluate', {
      expression: `window.scrollTo({ top: ${Number(args['scroll-before-click']) || 0}, behavior: 'instant' })`
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  if (args.click) {
    await command('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(String(args.click))})?.click()`
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (args.scroll) {
    await command('Runtime.evaluate', {
      expression: `window.scrollTo({ top: ${Number(args.scroll) || 0}, behavior: 'instant' })`
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  const metricsResult = await command('Runtime.evaluate', {
    expression: `JSON.stringify({
      innerWidth,
      innerHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      title: document.title,
      serviceWorkerControlled: Boolean(navigator.serviceWorker?.controller),
      standalone: window.matchMedia('(display-mode: standalone)').matches
    })`,
    returnByValue: true
  });
  const metrics = JSON.parse(metricsResult.result.value);
  const screenshot = await command('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false
  });
  await writeFile(output, Buffer.from(screenshot.data, 'base64'));
  process.stdout.write(`${JSON.stringify({ output, ...metrics, runtimeErrors })}\n`);
} finally {
  try {
    await command('Browser.close');
  } catch {
    // The browser process is cleaned up below as well.
  }
  browser.kill();
  socket.close();
  if (browser.exitCode === null) {
    await Promise.race([
      new Promise((resolve) => browser.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 2000))
    ]);
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
}
