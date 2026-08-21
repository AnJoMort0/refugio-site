const DEFAULT_LANGUAGE = 'pt';
const SUPPORTED_LANGUAGES = ['pt', 'en', 'fr', 'es'];
const STORAGE_KEY = 'refugio-language';
const LANGUAGE_LABELS = {
  pt: 'Português',
  en: 'English',
  fr: 'Français',
  es: 'Español'
};
const localeRequests = new Map();

let activeLanguage = DEFAULT_LANGUAGE;
let activeDictionary = {};

export function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
}

function mergeDictionaries(baseDictionary, overrideDictionary) {
  if (!baseDictionary || typeof baseDictionary !== 'object') return overrideDictionary;
  if (!overrideDictionary || typeof overrideDictionary !== 'object') return baseDictionary;

  const mergedDictionary = { ...baseDictionary };

  Object.entries(overrideDictionary).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      baseDictionary[key] &&
      typeof baseDictionary[key] === 'object' &&
      !Array.isArray(baseDictionary[key])
    ) {
      mergedDictionary[key] = mergeDictionaries(baseDictionary[key], value);
      return;
    }

    mergedDictionary[key] = value;
  });

  return mergedDictionary;
}

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

async function loadLocale(language) {
  const safeLanguage = normalizeLanguage(language);

  if (localeRequests.has(safeLanguage)) {
    return localeRequests.get(safeLanguage);
  }

  const localeRequest = fetch(new URL(`../../locales/${safeLanguage}.json`, import.meta.url))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load locale file for ${safeLanguage}`);
      }

      return response.json();
    })
    .catch((error) => {
      localeRequests.delete(safeLanguage);
      throw error;
    });

  localeRequests.set(safeLanguage, localeRequest);
  return localeRequest;
}

export async function loadResolvedDictionary(language = activeLanguage) {
  const safeLanguage = normalizeLanguage(language);
  const dictionary = await loadLocale(safeLanguage);

  if (safeLanguage === DEFAULT_LANGUAGE) return dictionary;

  return mergeDictionaries(await loadLocale(DEFAULT_LANGUAGE), dictionary);
}

export function getActiveLanguage() {
  return activeLanguage;
}

export function getCurrentDictionary() {
  return activeDictionary;
}

function applyTextTranslations(dictionary) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    const translatedValue = getNestedValue(dictionary, key);

    if (translatedValue !== undefined) {
      element.textContent = translatedValue;
    }
  });
}

function applyAttributeTranslations(dictionary) {
  document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
    try {
      const mapping = JSON.parse(element.dataset.i18nAttr);

      Object.entries(mapping).forEach(([attributeName, key]) => {
        const translatedValue = getNestedValue(dictionary, key);

        if (translatedValue !== undefined) {
          element.setAttribute(attributeName, translatedValue);
        }
      });
    } catch (error) {
      console.warn('Invalid data-i18n-attr JSON on element:', element, error);
    }
  });
}

function updateDocumentLanguage(language, dictionary) {
  const currentPage = document.body.dataset.page || '';
  const shouldUseDefaultMeta = currentPage === 'home' || currentPage === '';
  document.documentElement.lang = dictionary.meta?.htmlLang || language;
  const titleElement = document.querySelector('title');
  const hasPageSpecificTitle = Boolean(titleElement?.dataset.i18n);

  if (!hasPageSpecificTitle && shouldUseDefaultMeta && dictionary.meta?.title) {
    document.title = dictionary.meta.title;
  } else if (titleElement?.textContent) {
    document.title = titleElement.textContent;
  }

  const description = document.querySelector('meta[name="description"]');
  const hasPageSpecificDescription = Boolean(description?.dataset.i18nAttr);

  if (description && !hasPageSpecificDescription && shouldUseDefaultMeta && dictionary.meta?.description) {
    description.setAttribute('content', dictionary.meta.description);
  }
}

export async function setLanguage(language) {
  const safeLanguage = normalizeLanguage(language);
  const resolvedDictionary = await loadResolvedDictionary(safeLanguage);

  activeLanguage = safeLanguage;
  activeDictionary = resolvedDictionary;

  applyTextTranslations(resolvedDictionary);
  applyAttributeTranslations(resolvedDictionary);
  updateDocumentLanguage(safeLanguage, resolvedDictionary);

  localStorage.setItem(STORAGE_KEY, safeLanguage);

  const menuButton = document.querySelector('#language-menu-button');
  const currentLabel = document.querySelector('.language-menu-current');
  const options = document.querySelectorAll('[data-language-option]');

  if (menuButton) {
    menuButton.setAttribute('aria-label', resolvedDictionary.languageSwitcher?.label || '');
  }

  if (currentLabel) {
    currentLabel.textContent = LANGUAGE_LABELS[safeLanguage] || LANGUAGE_LABELS[DEFAULT_LANGUAGE];
  }

  if (options.length) {
    options.forEach((option) => {
      const isActive = option.dataset.languageOption === safeLanguage;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-selected', String(isActive));
    });
  }

  document.dispatchEvent(
    new CustomEvent('language:changed', {
      detail: { language: safeLanguage, dictionary: resolvedDictionary }
    })
  );
}

export async function initI18n() {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  const initialLanguage = [savedLanguage, browserLanguage, DEFAULT_LANGUAGE].find((lang) =>
    SUPPORTED_LANGUAGES.includes(lang)
  ) || DEFAULT_LANGUAGE;

  const languageMenu = document.querySelector('[data-language-menu]');
  const menuButton = document.querySelector('#language-menu-button');
  const options = document.querySelectorAll('[data-language-option]');

  if (languageMenu && menuButton && options.length) {
    menuButton.addEventListener('click', () => {
      const isOpen = languageMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    options.forEach((option) => {
      option.addEventListener('click', async () => {
        await setLanguage(option.dataset.languageOption);
        languageMenu.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (event) => {
      if (languageMenu.contains(event.target)) return;
      languageMenu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  }

  await setLanguage(initialLanguage);
}
