const state = {
  installAvailable: false,
  installed: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
  updateAvailable: false,
  offline: !navigator.onLine
};

let deferredInstallPrompt = null;
let registration = null;
let initialized = false;
let reloadingForUpdate = false;
let updateRequested = false;
const listeners = new Set();

function notify() {
  const snapshot = getAdminPwaState();
  listeners.forEach((listener) => listener(snapshot));
}

function setUpdateAvailable(available) {
  state.updateAvailable = available;
  notify();
}

function watchRegistration(nextRegistration) {
  registration = nextRegistration;
  setUpdateAvailable(Boolean(registration.waiting));

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      }
    });
  });
}

export function getAdminPwaState() {
  return { ...state };
}

export function initAdminPwa(listener) {
  if (typeof listener === 'function') listeners.add(listener);
  if (initialized) {
    notify();
    return;
  }
  initialized = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    state.installAvailable = true;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    state.installAvailable = false;
    state.installed = true;
    notify();
  });

  window.addEventListener('online', () => {
    state.offline = false;
    notify();
  });
  window.addEventListener('offline', () => {
    state.offline = true;
    notify();
  });

  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      watchRegistration(await navigator.serviceWorker.register('./admin-sw.js', {
        scope: './',
        updateViaCache: 'none'
      }));
    } catch (error) {
      console.warn('Admin PWA registration failed.', error);
    }
  }, { once: true });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!updateRequested || reloadingForUpdate) return;
    reloadingForUpdate = true;
    window.location.reload();
  });
}

export async function promptAdminPwaInstall() {
  if (!deferredInstallPrompt) return false;

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  state.installAvailable = false;
  notify();
  return choice.outcome === 'accepted';
}

export function activateAdminPwaUpdate() {
  if (!registration?.waiting) return false;
  updateRequested = true;
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  return true;
}
