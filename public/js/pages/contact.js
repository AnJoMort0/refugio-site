const TOPIC_OPTIONS = {
  'Já tenho uma reserva': ['Cancelar reserva', 'Alterar reserva', 'Perguntas sobre a reserva'],
  'Fiz um pedido de reserva': [
    'Cancelar pedido de reserva',
    'Alterar pedido de reserva',
    'Perguntas sobre pedido de reserva'
  ],
  'Não tenho reserva': [
    'Perguntas sobre reservar',
    'Perguntas sobre o espaço',
    'Estive aqui e quero deixar feedback',
    'Parcerias ou imprensa',
    'Outro'
  ]
};

const LANGUAGE_BY_PAGE_LANG = {
  pt: 'Português',
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  es: 'Español'
};

function isValidInternationalPhone(value) {
  return /^(?:\+|00)[0-9][0-9\s()\-]{5,}$/.test(value.trim());
}

function setFieldValidity(input, message = '') {
  input?.setCustomValidity(message);
  input?.closest('.field')?.classList.toggle('is-invalid', Boolean(message));
}

export function initContactPage() {
  const page = document.querySelector('.contact-page');
  if (!page) return;

  const form = page.querySelector('.contact-form');
  const phoneInput = form?.querySelector('input[name="phone"]');
  const preferredContactSelect = form?.querySelector('#preferred-contact');
  const languageSelect = form?.querySelector('#contact-language');
  const contextSelect = form?.querySelector('#contact-context');
  const topicSelect = form?.querySelector('#contact-topic');

  function updateLanguageDefault() {
    if (!languageSelect) return;
    const pageLanguage = (document.documentElement.lang || 'pt').slice(0, 2).toLowerCase();
    languageSelect.value = LANGUAGE_BY_PAGE_LANG[pageLanguage] || LANGUAGE_BY_PAGE_LANG.pt;
  }

  function updatePhoneDependentOptions() {
    if (!preferredContactSelect) return;

    const hasValidPhone = Boolean(phoneInput?.value.trim() && isValidInternationalPhone(phoneInput.value));
    preferredContactSelect.querySelectorAll('[data-requires-phone]').forEach((option) => {
      option.disabled = !hasValidPhone;
    });

    if (!hasValidPhone && preferredContactSelect.selectedOptions[0]?.dataset.requiresPhone !== undefined) {
      preferredContactSelect.value = 'Email';
    }
  }

  function updateTopicOptions() {
    if (!contextSelect || !topicSelect) return;

    const options = TOPIC_OPTIONS[contextSelect.value] || [];
    topicSelect.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.length ? 'Escolha uma opção' : 'Escolha primeiro o contexto';
    topicSelect.append(placeholder);

    options.forEach((topic) => {
      const option = document.createElement('option');
      option.value = topic;
      option.textContent = topic;
      topicSelect.append(option);
    });

    topicSelect.disabled = options.length === 0;
  }

  function validateContactForm() {
    const fields = Array.from(form?.querySelectorAll('input, select, textarea') || []);
    fields.forEach((input) => setFieldValidity(input, ''));

    if (phoneInput?.value.trim() && !isValidInternationalPhone(phoneInput.value)) {
      setFieldValidity(phoneInput, 'Indique um telefone válido com indicativo internacional, começando por + ou 00.');
      phoneInput.reportValidity();
      return false;
    }

    if (preferredContactSelect?.selectedOptions[0]?.dataset.requiresPhone !== undefined && !phoneInput?.value.trim()) {
      setFieldValidity(phoneInput, 'Indique um telefone para pedir contacto por telefone.');
      phoneInput?.reportValidity();
      return false;
    }

    if (form && !form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    return true;
  }

  updateLanguageDefault();
  updatePhoneDependentOptions();
  updateTopicOptions();

  document.addEventListener('language:changed', updateLanguageDefault);

  phoneInput?.addEventListener('input', () => {
    setFieldValidity(phoneInput, '');
    if (phoneInput.value.trim() && !isValidInternationalPhone(phoneInput.value)) {
      setFieldValidity(phoneInput, 'Indique um telefone válido com indicativo internacional, começando por + ou 00.');
    }
    updatePhoneDependentOptions();
  });

  preferredContactSelect?.addEventListener('change', () => {
    setFieldValidity(preferredContactSelect, '');
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
    const params = new URLSearchParams();

    for (const [key, value] of data.entries()) {
      const text = String(value).trim();
      if (text) params.set(key, text);
    }

    window.location.href = `${form.getAttribute('action') || './obrigado.html'}?${params.toString()}`;
  });
}
