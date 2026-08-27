import { getCurrentDictionary, getNestedValue } from '../services/i18n.js';
import { isValidPhoneNumber } from '../utils/phone.js';

const TOPIC_CONFIG = {
  confirmed: ['confirmedCancel', 'confirmedChange', 'confirmedQuestion'],
  requested: ['requestCancel', 'requestChange', 'requestQuestion', 'requestStatus'],
  past: ['pastFeedback', 'pastQuestion'],
  none: [
    'noReservationBooking',
    'noReservationSpace',
    'noReservationAccessibility',
    'noReservationLocalArea',
    'noReservationPartnerships',
    'other'
  ]
};

const LANGUAGE_BY_PAGE_LANG = {
  pt: 'pt',
  fr: 'fr',
  en: 'en',
  es: 'es'
};

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
  const attachmentInput = form?.querySelector('#contact-attachments');
  const attachmentButton = form?.querySelector('[data-contact-attachment-button]');
  const attachmentSummary = form?.querySelector('#contact-attachment-summary');
  const attachmentList = form?.querySelector('#contact-attachment-list');
  const params = new URLSearchParams(window.location.search);
  let dictionary = getCurrentDictionary();

  const getText = (path) => getNestedValue(dictionary, path) || '';

  function getTopicOptions(context) {
    return (TOPIC_CONFIG[context] || []).map((key) => ({
      value: key,
      label: getText(`contactPage.topics.${key}`)
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
      option.title = phoneIsValid ? '' : getText('contactPage.validation.phoneRequiredForMethod');
    });
  }

  function updateTopicOptions(selectedTopic = '') {
    if (!contextSelect || !topicSelect) return;

    const options = getTopicOptions(contextSelect.value);
    topicSelect.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.length
      ? getText('contactPage.form.topicPlaceholder')
      : getText('contactPage.form.topicContextFirst');
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

  function getSelectedAttachments() {
    return Array.from(attachmentInput?.files || []).filter((file) => file?.name);
  }

  function renderAttachmentList() {
    if (!attachmentList) return;

    const attachments = getSelectedAttachments();
    attachmentList.replaceChildren();

    attachments.forEach((file) => {
      const item = document.createElement('li');
      item.textContent = file.name;
      attachmentList.append(item);
    });

    attachmentList.hidden = attachmentList.children.length === 0;

    if (!attachmentSummary) return;

    if (attachments.length === 0) {
      attachmentSummary.textContent = getText('contactPage.form.attachmentsEmpty');
      return;
    }

    attachmentSummary.textContent = attachments.length === 1
      ? getText('contactPage.form.attachmentsOne')
      : getText('contactPage.form.attachmentsMany').replace('{count}', String(attachments.length));
  }

  function validateContactForm() {
    const fields = Array.from(form?.querySelectorAll('input, select, textarea') || []);
    fields.forEach((input) => setFieldValidity(input, ''));

    if (phoneInput?.value.trim() && !isValidPhoneNumber(phoneInput.value)) {
      setFieldValidity(phoneInput, getText('contactPage.validation.phoneInvalid'));
      phoneInput.reportValidity();
      return false;
    }

    if (preferredContactSelect?.selectedOptions[0]?.dataset.requiresPhone !== undefined && !hasValidPhone()) {
      setFieldValidity(
        phoneInput,
        getText('contactPage.validation.phoneRequiredForMethod')
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

  updateLanguageDefault();
  updatePhoneDependentOptions();
  updateTopicOptions();
  applyUrlPrefill();
  renderAttachmentList();

  document.addEventListener('language:changed', (event) => {
    const selectedTopic = topicSelect?.value || '';
    dictionary = event.detail?.dictionary || getCurrentDictionary();
    updateLanguageDefault();
    updatePhoneDependentOptions();
    updateTopicOptions(selectedTopic);
    renderAttachmentList();
  });

  phoneInput?.addEventListener('input', () => {
    setFieldValidity(phoneInput, '');
    if (phoneInput.value.trim() && !isValidPhoneNumber(phoneInput.value)) {
      setFieldValidity(phoneInput, getText('contactPage.validation.phoneInvalid'));
    }
    updatePhoneDependentOptions();
  });

  preferredContactSelect?.addEventListener('change', () => {
    setFieldValidity(preferredContactSelect, '');

    if (preferredContactSelect.selectedOptions[0]?.dataset.requiresPhone !== undefined && !hasValidPhone()) {
      setFieldValidity(
        phoneInput,
        getText('contactPage.validation.phoneRequiredForMethod')
      );
      blinkPhoneField();
      preferredContactSelect.value = 'email';
    }
  });

  contextSelect?.addEventListener('change', () => {
    setFieldValidity(contextSelect, '');
    updateTopicOptions();
  });

  topicSelect?.addEventListener('change', () => {
    setFieldValidity(topicSelect, '');
  });

  attachmentInput?.addEventListener('change', renderAttachmentList);

  attachmentButton?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    attachmentInput?.click();
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
      if (typeof File !== 'undefined' && value instanceof File) continue;

      const text = String(value).trim();
      if (text) nextParams.set(key, text);
    }

    const attachmentNames = getSelectedAttachments().map((file) => file.name.trim()).filter(Boolean);
    if (attachmentNames.length) {
      nextParams.set('attachments', attachmentNames.join(', '));
    }

    window.location.href = `${form.getAttribute('action') || './obrigado.html'}?${nextParams.toString()}`;
  });
}
