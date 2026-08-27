import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const LOCALE_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '..', 'public', 'locales');
const SOURCE_LANGUAGE = 'pt';
const TARGET_LANGUAGES = ['en', 'fr', 'es'];

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function alignToSource(source, target, keyPath, missingKeys, typeMismatches) {
  if (Array.isArray(source)) {
    if (!Array.isArray(target)) {
      typeMismatches.push(keyPath || '<root>');
      return target;
    }

    if (target.length < source.length) {
      for (let index = target.length; index < source.length; index += 1) {
        missingKeys.push(`${keyPath}[${index}]`);
      }
      return target;
    }

    return source.map((sourceValue, index) => (
      alignToSource(sourceValue, target[index], `${keyPath}[${index}]`, missingKeys, typeMismatches)
    ));
  }

  if (isPlainObject(source)) {
    if (!isPlainObject(target)) {
      typeMismatches.push(keyPath || '<root>');
      return target;
    }

    return Object.fromEntries(Object.entries(source).map(([key, sourceValue]) => {
      const childPath = keyPath ? `${keyPath}.${key}` : key;
      if (!Object.hasOwn(target, key)) {
        missingKeys.push(childPath);
        return [key, undefined];
      }
      return [key, alignToSource(sourceValue, target[key], childPath, missingKeys, typeMismatches)];
    }));
  }

  return target;
}

const sourcePath = path.join(LOCALE_DIRECTORY, `${SOURCE_LANGUAGE}.json`);
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const alignedLocales = [];
let hasErrors = false;

for (const language of TARGET_LANGUAGES) {
  const targetPath = path.join(LOCALE_DIRECTORY, `${language}.json`);
  const target = JSON.parse(await readFile(targetPath, 'utf8'));
  const missingKeys = [];
  const typeMismatches = [];
  const aligned = alignToSource(source, target, '', missingKeys, typeMismatches);

  if (missingKeys.length || typeMismatches.length) {
    hasErrors = true;
    if (missingKeys.length) console.error(`${language}.json is missing: ${missingKeys.join(', ')}`);
    if (typeMismatches.length) console.error(`${language}.json has incompatible values at: ${typeMismatches.join(', ')}`);
    continue;
  }

  alignedLocales.push({ targetPath, aligned });
}

if (hasErrors) {
  console.error('Locale files were not changed. Translate the missing Portuguese keys, then run this command again.');
  process.exitCode = 1;
} else {
  await Promise.all(alignedLocales.map(({ targetPath, aligned }) => (
    writeFile(targetPath, `${JSON.stringify(aligned, null, 2)}\n`, 'utf8')
  )));
  console.log('Locales now follow pt.json ordering and contain no keys removed from Portuguese.');
}
