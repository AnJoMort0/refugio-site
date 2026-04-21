const DEFAULT_LANGUAGE = 'pt';
const SUPPORTED_LANGUAGES = ['pt', 'en', 'fr', 'es'];
const STORAGE_KEY = 'refugio-language';

function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
}

async function loadLocale(language) {
  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  const response = await fetch(`./locales/${safeLanguage}.json`);

  if (!response.ok) {
    throw new Error(`Could not load locale file for ${safeLanguage}`);
  }

  return response.json();
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
  document.documentElement.lang = dictionary.meta?.htmlLang || language;
  document.title = dictionary.meta?.title || document.title;

  const description = document.querySelector('meta[name="description"]');
  if (description && dictionary.meta?.description) {
    description.setAttribute('content', dictionary.meta.description);
  }
}

export async function setLanguage(language) {
  const safeLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  const dictionary = await loadLocale(safeLanguage);

  applyTextTranslations(dictionary);
  applyAttributeTranslations(dictionary);
  updateDocumentLanguage(safeLanguage, dictionary);

  localStorage.setItem(STORAGE_KEY, safeLanguage);

  const switcher = document.querySelector('#language-switcher');
  if (switcher) {
    switcher.value = safeLanguage;
    switcher.setAttribute('aria-label', dictionary.languageSwitcher?.label || 'Choose language');
  }

  document.dispatchEvent(
    new CustomEvent('language:changed', {
      detail: { language: safeLanguage, dictionary }
    })
  );
}

export async function initI18n() {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  const initialLanguage = [savedLanguage, browserLanguage, DEFAULT_LANGUAGE].find((lang) =>
    SUPPORTED_LANGUAGES.includes(lang)
  ) || DEFAULT_LANGUAGE;

  const switcher = document.querySelector('#language-switcher');
  if (switcher) {
    switcher.addEventListener('change', async (event) => {
      await setLanguage(event.target.value);
    });
  }

  await setLanguage(initialLanguage);
}
