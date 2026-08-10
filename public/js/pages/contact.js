const DEFAULT_LANGUAGE = 'pt';
const TOPIC_CONFIG = {
  'Já tenho uma reserva': [
    ['confirmedCancel', 'Cancelar reserva'],
    ['confirmedChange', 'Alterar reserva'],
    ['confirmedQuestion', 'Perguntas sobre a reserva']
  ],
  'Fiz um pedido de reserva': [
    ['requestCancel', 'Cancelar pedido de reserva'],
    ['requestChange', 'Alterar pedido de reserva'],
    ['requestQuestion', 'Perguntas sobre pedido de reserva'],
    ['requestStatus', 'Saber o estado do pedido']
  ],
  'Já tive uma reserva': [
    ['pastFeedback', 'Estive aqui e quero deixar feedback'],
    ['pastQuestion', 'Pergunta sobre uma estadia anterior']
  ],
  'Não tenho reserva': [
    ['noReservationBooking', 'Perguntas sobre reservar'],
    ['noReservationSpace', 'Perguntas sobre o espaço'],
    ['noReservationAccessibility', 'Acessibilidade ou pedidos especiais'],
    ['noReservationLocalArea', 'Perguntas sobre a zona'],
    ['noReservationPartnerships', 'Parcerias ou imprensa'],
    ['other', 'Outro']
  ]
};

const LANGUAGE_BY_PAGE_LANG = {
  pt: 'Português',
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  es: 'Español'
};

function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
}

function isValidPhoneNumber(value) {
  const trimmedValue = value.trim();
  const digitsOnly = trimmedValue.replace(/\D/g, '');
  const hasInternationalPrefix = /^(?:\+|00)[0-9][0-9\s()\-]{5,}$/.test(trimmedValue);
  const hasPortugueseLocalFormat = /^(?:2|9)\d{8}$/.test(digitsOnly);

  return hasInternationalPrefix || hasPortugueseLocalFormat;
}

function setFieldValidity(input, message = '') {
  input?.setCustomValidity(message);
  input?.closest('.field')?.classList.toggle('is-invalid', Boolean(message));
}

export async function initContactPage() {
  const page = document.querySelector('.contact-page');
  if (!page) return;

  const form = page.querySelector('.contact-form');
  const phoneInput = form?.querySelector('input[name="phone"]');
  const preferredContactSelect = form?.querySelector('#preferred-contact');
  const languageSelect = form?.querySelector('#contact-language');
  const contextSelect = form?.querySelector('#contact-context');
  const topicSelect = form?.querySelector('#contact-topic');
  const params = new URLSearchParams(window.location.search);
  let dictionary = {};

  const getText = (path, fallback) => getNestedValue(dictionary, path) || fallback;

  async function loadDictionary() {
    try {
      const language = localStorage.getItem('refugio-language') || DEFAULT_LANGUAGE;
      const response = await fetch(`./locales/${language}.json`);
      if (!response.ok) throw new Error('Locale not found');
      dictionary = await response.json();
    } catch (error) {
      dictionary = {};
    }
  }

  function getTopicOptions(context) {
    return (TOPIC_CONFIG[context] || []).map(([key, fallback]) => ({
      value: fallback,
      label: getText(`contactPage.topics.${key}`, fallback)
    }));
  }

  function updateLanguageDefault() {
    if (!languageSelect || params.has('contact_language')) return;
    const pageLanguage = (document.documentElement.lang || 'pt').slice(0, 2).toLowerCase();
    languageSelect.value = LANGUAGE_BY_PAGE_LANG[pageLanguage] || LANGUAGE_BY_PAGE_LANG.pt;
  }

  function hasValidPhone() {
    return Boolean(phoneInput?.value.trim() && isValidPhoneNumber(phoneInput.value));
  }

  function blinkPhoneField() {
    const field = phoneInput?.closest('.field');
    if (!field) return;

    field.classList.remove('is-attention');
    window.requestAnimationFrame(() => {
      field.classList.add('is-attention');
      window.setTimeout(() => field.classList.remove('is-attention'), 760);
    });
  }

  function updatePhoneDependentOptions() {
    if (!preferredContactSelect) return;

    const phoneIsValid = hasValidPhone();
    preferredContactSelect.querySelectorAll('[data-requires-phone]').forEach((option) => {
      option.dataset.locked = String(!phoneIsValid);
      option.setAttribute('aria-disabled', String(!phoneIsValid));
      option.title = phoneIsValid ? '' : getText('contactPage.validation.phoneRequiredForMethod', 'Indique um telefone para usar esta opção.');
    });
  }

  function updateTopicOptions(selectedTopic = '') {
    if (!contextSelect || !topicSelect) return;

    const options = getTopicOptions(contextSelect.value);
    topicSelect.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.length
      ? getText('contactPage.form.topicPlaceholder', 'Escolha uma opção')
      : getText('contactPage.form.topicContextFirst', 'Escolha primeiro o contexto');
    topicSelect.append(placeholder);

    options.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      topicSelect.append(option);
    });

    topicSelect.disabled = options.length === 0;

    if (selectedTopic && options.some(({ value }) => value === selectedTopic)) {
      topicSelect.value = selectedTopic;
    }
  }

  function applyUrlPrefill() {
    if (!form) return;

    ['name', 'email', 'phone', 'message'].forEach((name) => {
      const value = params.get(name);
      const field = form.elements.namedItem(name);
      if (value && (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
        field.value = value;
      }
    });

    const contactLanguage = params.get('contact_language');
    if (contactLanguage && languageSelect) {
      languageSelect.value = contactLanguage;
    }

    const context = params.get('context');
    const topic = params.get('topic');
    if (context && contextSelect) {
      contextSelect.value = context;
      updateTopicOptions(topic || '');
    }

    updatePhoneDependentOptions();
  }

  function validateContactForm() {
    const fields = Array.from(form?.querySelectorAll('input, select, textarea') || []);
    fields.forEach((input) => setFieldValidity(input, ''));

    if (phoneInput?.value.trim() && !isValidPhoneNumber(phoneInput.value)) {
      setFieldValidity(phoneInput, getText('contactPage.validation.phoneInvalid', 'Indique um telefone válido.'));
      phoneInput.reportValidity();
      return false;
    }

    if (preferredContactSelect?.selectedOptions[0]?.dataset.requiresPhone !== undefined && !hasValidPhone()) {
      setFieldValidity(
        phoneInput,
        getText('contactPage.validation.phoneRequiredForMethod', 'Indique um telefone para pedir contacto por telefone.')
      );
      blinkPhoneField();
      phoneInput?.reportValidity();
      return false;
    }

    if (form && !form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    return true;
  }

  await loadDictionary();
  updateLanguageDefault();
  updatePhoneDependentOptions();
  updateTopicOptions();
  applyUrlPrefill();

  document.addEventListener('language:changed', async () => {
    const selectedTopic = topicSelect?.value || '';
    await loadDictionary();
    updateLanguageDefault();
    updatePhoneDependentOptions();
    updateTopicOptions(selectedTopic);
  });

  phoneInput?.addEventListener('input', () => {
    setFieldValidity(phoneInput, '');
    if (phoneInput.value.trim() && !isValidPhoneNumber(phoneInput.value)) {
      setFieldValidity(phoneInput, getText('contactPage.validation.phoneInvalid', 'Indique um telefone válido.'));
    }
    updatePhoneDependentOptions();
  });

  preferredContactSelect?.addEventListener('change', () => {
    setFieldValidity(preferredContactSelect, '');

    if (preferredContactSelect.selectedOptions[0]?.dataset.requiresPhone !== undefined && !hasValidPhone()) {
      setFieldValidity(
        phoneInput,
        getText('contactPage.validation.phoneRequiredForMethod', 'Indique um telefone para usar esta opção.')
      );
      blinkPhoneField();
      preferredContactSelect.value = 'Email';
    }
  });

  contextSelect?.addEventListener('change', () => {
    setFieldValidity(contextSelect, '');
    updateTopicOptions();
  });

  topicSelect?.addEventListener('change', () => {
    setFieldValidity(topicSelect, '');
  });

  form?.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
      setFieldValidity(target, '');
    }
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateContactForm()) return;

    const data = new FormData(form);
    const nextParams = new URLSearchParams();

    for (const [key, value] of data.entries()) {
      const text = String(value).trim();
      if (text) nextParams.set(key, text);
    }

    window.location.href = `${form.getAttribute('action') || './obrigado.html'}?${nextParams.toString()}`;
  });
}
