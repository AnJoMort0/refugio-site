import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '..');
const PUBLIC_DIRECTORY = path.join(PROJECT_DIRECTORY, 'public');
const REQUIRED_MESSAGE_LANGUAGES = ['pt', 'fr', 'en', 'es', 'de'];
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : entryPath;
  }));
  return files.flat();
}

function relative(filePath) {
  return path.relative(PROJECT_DIRECTORY, filePath).replaceAll(path.sep, '/');
}

function reportError(message) {
  errors.push(message);
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isExternalReference(reference) {
  return /^(?:[a-z]+:|#|\/\/)/i.test(reference);
}

function cleanReference(reference) {
  return reference.split(/[?#]/, 1)[0].trim();
}

function resolvePublicReference(reference, sourceFile) {
  if (reference.startsWith('/')) {
    return path.join(PUBLIC_DIRECTORY, reference.slice(1));
  }
  return path.resolve(path.dirname(sourceFile), reference);
}

async function checkJsonFiles(jsonFiles) {
  for (const file of jsonFiles) {
    try {
      JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      reportError(`${relative(file)} is not valid JSON: ${error.message}`);
    }
  }
}

function checkJavaScriptSyntax(javaScriptFiles) {
  for (const file of javaScriptFiles) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.error?.code === 'EPERM') {
      console.warn('JavaScript syntax subprocesses are unavailable in this environment; skipping nested syntax checks.');
      return;
    }
    if (result.status !== 0) {
      const detail = result.stderr || result.stdout || result.error?.message || 'Unknown syntax-check failure.';
      reportError(`${relative(file)} has invalid JavaScript:\n${detail.trim()}`);
    }
  }
}

async function checkHtmlFiles(htmlFiles) {
  for (const file of htmlFiles) {
    const source = await readFile(file, 'utf8');
    const ids = new Set();

    for (const match of source.matchAll(/\bid\s*=\s*(["'])([^"']+)\1/g)) {
      const id = match[2];
      if (ids.has(id)) reportError(`${relative(file)} contains the duplicate id "${id}".`);
      ids.add(id);
    }

    for (const match of source.matchAll(/\b(?:action|href|src)\s*=\s*(["'])([^"']+)\1/g)) {
      const reference = cleanReference(match[2]);
      if (!reference || isExternalReference(reference)) continue;

      const target = resolvePublicReference(reference, file);
      if (!await pathExists(target)) {
        reportError(`${relative(file)} references missing file "${match[2]}".`);
      }
    }
  }
}

async function checkModuleReferences(javaScriptFiles) {
  for (const file of javaScriptFiles) {
    const source = await readFile(file, 'utf8');
    const references = new Set();

    for (const match of source.matchAll(/\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?(["'])(\.[^"']+)\1/g)) {
      references.add(match[2]);
    }
    for (const match of source.matchAll(/\bimport\(\s*(["'])(\.[^"']+)\1\s*\)/g)) {
      references.add(match[2]);
    }
    for (const match of source.matchAll(/new URL\(\s*(["'])(\.[^"']+)\1\s*,\s*import\.meta\.url\s*\)/g)) {
      references.add(match[2]);
    }

    for (const reference of references) {
      if (!await pathExists(path.resolve(path.dirname(file), reference))) {
        reportError(`${relative(file)} imports missing module or asset "${reference}".`);
      }
    }
  }
}

async function checkCssReferences(cssFiles) {
  for (const file of cssFiles) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) {
      const reference = cleanReference(match[2]);
      if (!reference || isExternalReference(reference)) continue;

      if (!await pathExists(path.resolve(path.dirname(file), reference))) {
        reportError(`${relative(file)} references missing asset "${match[2]}".`);
      }
    }
  }
}

function hasNestedValue(object, keyPath) {
  let value = object;
  for (const key of keyPath.split('.')) {
    if (!value || !Object.hasOwn(value, key)) return false;
    value = value[key];
  }
  return true;
}

async function checkTranslationReferences(sourceFiles) {
  const dictionaryPath = path.join(PUBLIC_DIRECTORY, 'locales', 'pt.json');
  const dictionary = JSON.parse(await readFile(dictionaryPath, 'utf8'));
  const referencedKeys = new Set();

  for (const file of sourceFiles) {
    const source = await readFile(file, 'utf8');

    for (const match of source.matchAll(/data-i18n\s*=\s*(["'])([^"']+)\1/g)) {
      referencedKeys.add(match[2]);
    }
    for (const match of source.matchAll(/data-i18n-attr\s*=\s*'([^']+)'/g)) {
      try {
        Object.values(JSON.parse(match[1])).forEach((key) => referencedKeys.add(key));
      } catch (error) {
        reportError(`${relative(file)} has invalid data-i18n-attr JSON: ${error.message}`);
      }
    }
    for (const match of source.matchAll(/\bgetText\(\s*(?:dictionary\s*,\s*)?(["'])([^"']+)\1/g)) {
      referencedKeys.add(match[2]);
    }
  }

  const staticKeys = [...referencedKeys].filter((key) => !key.includes('${'));

  for (const key of staticKeys) {
    if (!hasNestedValue(dictionary, key)) {
      reportError(`Translation key "${key}" is referenced but missing from public/locales/pt.json.`);
    }
  }

  return staticKeys.length;
}

function checkTranslatedObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const keys = Object.keys(value);
  const isTranslatedObject = keys.some((key) => REQUIRED_MESSAGE_LANGUAGES.includes(key));

  if (isTranslatedObject) {
    for (const language of REQUIRED_MESSAGE_LANGUAGES) {
      if (typeof value[language] !== 'string' || !value[language].trim()) {
        reportError(`public/locales/messages.json is missing ${label}.${language}.`);
      }
    }
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    checkTranslatedObject(nestedValue, `${label}.${key}`);
  }
}

async function checkMessageCatalog() {
  const catalogPath = path.join(PUBLIC_DIRECTORY, 'locales', 'messages.json');
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
  const templates = Array.isArray(catalog.templates) ? catalog.templates : [];
  const templateIds = new Set();

  if (!templates.length) reportError('public/locales/messages.json does not contain any templates.');

  for (const template of templates) {
    if (!template.id) {
      reportError('public/locales/messages.json contains a template without an id.');
      continue;
    }
    if (templateIds.has(template.id)) {
      reportError(`public/locales/messages.json contains duplicate template id "${template.id}".`);
    }
    templateIds.add(template.id);
    checkTranslatedObject(template.label, `templates.${template.id}.label`);
    checkTranslatedObject(template.body, `templates.${template.id}.body`);
  }

  checkTranslatedObject(catalog.snippets, 'snippets');

  if (catalog.defaultTemplate && !templateIds.has(catalog.defaultTemplate)) {
    reportError(`Default message template "${catalog.defaultTemplate}" does not exist.`);
  }

  return templates.length;
}

async function checkGalleryManifest() {
  const manifestPath = path.join(PUBLIC_DIRECTORY, 'assets', 'images', 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  for (const entry of manifest) {
    if (!entry?.src) {
      reportError('public/assets/images/manifest.json contains an entry without src.');
      continue;
    }

    const target = path.resolve(PUBLIC_DIRECTORY, cleanReference(entry.src));
    if (!await pathExists(target)) {
      reportError(`Gallery manifest references missing image "${entry.src}".`);
    }
  }

  return manifest.length;
}

async function checkSharedUtilities() {
  const dateUtilities = await import(pathToFileURL(path.join(PUBLIC_DIRECTORY, 'js', 'utils', 'date.js')));
  const phoneUtilities = await import(pathToFileURL(path.join(PUBLIC_DIRECTORY, 'js', 'utils', 'phone.js')));
  const sampleDate = dateUtilities.parseDateKey('2026-08-20');

  if (dateUtilities.formatDateKey(dateUtilities.addDays(sampleDate, 1)) !== '2026-08-21') {
    reportError('Shared date utilities failed the date-addition check.');
  }
  if (dateUtilities.diffCalendarDays('2026-08-20', '2026-08-23') !== 3) {
    reportError('Shared date utilities failed the day-difference check.');
  }
  if (!phoneUtilities.isValidPhoneNumber('912 345 678')) {
    reportError('Shared phone validation rejected a valid Portuguese local number.');
  }
  if (!phoneUtilities.isValidPhoneNumber('+351 912 345 678')) {
    reportError('Shared phone validation rejected a valid international number.');
  }
  if (phoneUtilities.isValidPhoneNumber('12345')) {
    reportError('Shared phone validation accepted an invalid short number.');
  }
}

async function checkAdminModel() {
  const seedModule = await import(pathToFileURL(path.join(PUBLIC_DIRECTORY, 'js', 'admin', 'admin-seed.js')));
  const logicModule = await import(pathToFileURL(path.join(PUBLIC_DIRECTORY, 'js', 'admin', 'admin-logic.js')));
  const state = seedModule.createInitialAdminState(new Date('2026-08-21T12:00:00'));

  const checkCoverage = (label, expectedValues, actualValues) => {
    const actual = new Set(actualValues);
    const missing = expectedValues.filter((value) => !actual.has(value));
    if (missing.length) reportError(`Admin seed is missing ${label}: ${missing.join(', ')}.`);
  };

  if (state.version !== seedModule.ADMIN_DATA_VERSION || !state.reservations.length) {
    reportError('Admin seed data failed its structural smoke check.');
    return;
  }

  if (state.reservations.length < 15 || state.websiteRequests.length < 8) {
    reportError('Admin showcase seed no longer contains enough reservations and requests to exercise the prototype.');
  }

  checkCoverage('reservation statuses', ['request', 'awaiting_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'], state.reservations.map((reservation) => reservation.status));
  checkCoverage('payment statuses', ['unpaid', 'awaiting_transfer', 'deposit_paid', 'paid', 'refunded'], state.reservations.map((reservation) => reservation.paymentStatus));
  checkCoverage('reservation sources', ['booking', 'abritel', 'website', 'private', 'owner'], state.reservations.map((reservation) => reservation.source));
  checkCoverage('guest languages', ['pt', 'fr', 'en', 'es', 'de'], state.reservations.map((reservation) => reservation.preferredLanguage));
  checkCoverage('website request statuses', ['new', 'accepted', 'rejected'], state.websiteRequests.map((request) => request.status));
  checkCoverage('work compensation types', ['paid', 'free', 'voluntary'], state.workSessions.map((session) => session.compensationType));

  const reservationIds = new Set(state.reservations.map((reservation) => reservation.id));
  const guestIds = new Set(state.guests.map((guest) => guest.id));
  if (reservationIds.size !== state.reservations.length) reportError('Admin seed contains duplicate reservation IDs.');
  if (new Set(state.websiteRequests.map((request) => request.id)).size !== state.websiteRequests.length) reportError('Admin seed contains duplicate website request IDs.');

  for (const reservation of state.reservations) {
    const totals = logicModule.calculateReservationTotals(reservation, state);
    if (!Number.isFinite(totals.total) || totals.total < 0) {
      reportError(`Admin reservation "${reservation.id}" produced an invalid total.`);
    }
    if (!guestIds.has(reservation.guestId)) {
      reportError(`Admin reservation "${reservation.id}" references a missing guest.`);
    }
    if (logicModule.getGuestCount(reservation) > state.property.occupancyLimit) {
      reportError(`Admin reservation "${reservation.id}" exceeds the property occupancy limit.`);
    }
    if ((reservation.guests?.childAges || []).some((age) => age < 0 || age > 12)) {
      reportError(`Admin reservation "${reservation.id}" contains an invalid child age.`);
    }
  }

  for (const request of state.websiteRequests.filter((candidate) => candidate.status === 'accepted')) {
    if (!request.acceptedReservationId || !reservationIds.has(request.acceptedReservationId)) {
      reportError(`Accepted website request "${request.id}" is not linked to a reservation.`);
    }
  }

  const dashboard = logicModule.summarizeDashboard(state);
  if (!Array.isArray(dashboard.activeReservations) || !Array.isArray(dashboard.openRequests)) {
    reportError('Admin dashboard summary failed its structural smoke check.');
  }
}

const publicFiles = await walk(PUBLIC_DIRECTORY);
const scriptFiles = await walk(path.join(PROJECT_DIRECTORY, 'scripts'));
const htmlFiles = publicFiles.filter((file) => file.endsWith('.html'));
const cssFiles = publicFiles.filter((file) => file.endsWith('.css'));
const javaScriptFiles = [...publicFiles, ...scriptFiles].filter((file) => /\.(?:js|mjs)$/.test(file));
const jsonFiles = publicFiles.filter((file) => file.endsWith('.json'));
const translationSourceFiles = [...htmlFiles, ...publicFiles.filter((file) => file.endsWith('.js'))];

await checkJsonFiles(jsonFiles);
checkJavaScriptSyntax(javaScriptFiles);
await checkHtmlFiles(htmlFiles);
await checkModuleReferences(javaScriptFiles);
await checkCssReferences(cssFiles);
const translationKeyCount = await checkTranslationReferences(translationSourceFiles);
const messageTemplateCount = await checkMessageCatalog();
const galleryImageCount = await checkGalleryManifest();
await checkSharedUtilities();
await checkAdminModel();

if (errors.length) {
  console.error(`Project checks failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `Project checks passed: ${javaScriptFiles.length} scripts, ${jsonFiles.length} JSON files, `
    + `${htmlFiles.length} pages, ${translationKeyCount} translation keys, `
    + `${messageTemplateCount} message templates, and ${galleryImageCount} gallery images.`
  );
}
