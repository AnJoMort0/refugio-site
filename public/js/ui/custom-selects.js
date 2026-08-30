const instances = new WeakMap();
const openInstances = new Set();
let selectId = 0;
let documentObserver = null;

function chevronIcon() {
  return `
    <svg class="lucide-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m6 9 6 6 6-6"></path>
    </svg>
  `;
}

function optionLabel(option) {
  return option.label || option.textContent?.trim() || '';
}

function selectLabel(select) {
  if (select.getAttribute('aria-label')) return select.getAttribute('aria-label');

  const labelledBy = select.getAttribute('aria-labelledby');
  if (labelledBy) {
    const label = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    if (label) return label;
  }

  const fieldLabel = select.closest('label')?.querySelector(':scope > span');
  return fieldLabel?.textContent?.trim() || select.name || '';
}

function closeInstance(instance, { returnFocus = false } = {}) {
  if (!instance?.isOpen) return;
  instance.isOpen = false;
  instance.wrapper.classList.remove('is-open');
  instance.button.setAttribute('aria-expanded', 'false');
  openInstances.delete(instance);
  if (instance.search) {
    instance.search.value = '';
    filterOptions(instance, '');
  }
  if (returnFocus) instance.button.focus();
}

function closeOthers(current) {
  [...openInstances].forEach((instance) => {
    if (instance !== current) closeInstance(instance);
  });
}

function enabledOptions(instance) {
  return [...instance.optionsContainer.querySelectorAll('[role="option"]:not([disabled]):not([hidden])')];
}

function normalizeSearch(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

function filterOptions(instance, query) {
  const normalizedQuery = normalizeSearch(query);
  instance.optionsContainer.querySelectorAll('[role="option"]').forEach((option) => {
    option.hidden = Boolean(normalizedQuery) && !normalizeSearch(option.textContent).includes(normalizedQuery);
  });
}

function openInstance(instance) {
  if (instance.select.disabled || instance.isOpen) return;
  closeOthers(instance);
  instance.isOpen = true;
  instance.wrapper.classList.add('is-open');
  instance.button.setAttribute('aria-expanded', 'true');
  openInstances.add(instance);

  if (instance.search) {
    instance.search.focus();
    return;
  }

  const options = enabledOptions(instance);
  const selected = options.find((option) => option.getAttribute('aria-selected') === 'true') || options[0];
  window.requestAnimationFrame(() => selected?.focus());
}

function chooseOption(instance, value) {
  if (instance.select.disabled) return;
  instance.select.value = value;
  instance.select.dispatchEvent(new Event('input', { bubbles: true }));
  instance.select.dispatchEvent(new Event('change', { bubbles: true }));
  instance.wrapper.classList.remove('is-invalid');
  syncInstance(instance);
  closeInstance(instance, { returnFocus: true });
}

function moveOptionFocus(instance, current, offset) {
  const options = enabledOptions(instance);
  if (!options.length) return;
  const currentIndex = Math.max(options.indexOf(current), 0);
  const nextIndex = (currentIndex + offset + options.length) % options.length;
  options[nextIndex].focus();
}

function optionMarkup(instance, option, index) {
  const isSelected = option.selected;
  const isLocked = option.dataset.locked === 'true';
  const isDisabled = option.disabled;
  const optionId = `${instance.id}-option-${index}`;
  return `
    <button
      id="${optionId}"
      class="custom-select-option${isSelected ? ' is-selected' : ''}${isLocked ? ' is-locked' : ''}"
      type="button"
      role="option"
      data-custom-select-value="${String(option.value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"
      aria-selected="${String(isSelected)}"
      ${isDisabled ? 'disabled' : ''}
      ${isLocked ? 'aria-disabled="true"' : ''}
      ${option.title ? `title="${option.title.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"` : ''}
    >${optionLabel(option).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</button>
  `;
}

function syncInstance(instance) {
  const { select, wrapper, button, value, list, optionsContainer } = instance;
  const options = [...select.options].filter((option) => !option.hidden);
  const selected = select.selectedOptions[0] || options[0];
  const label = selectLabel(select);

  value.textContent = selected ? optionLabel(selected) : '';
  button.disabled = select.disabled;
  button.setAttribute('aria-label', label);
  wrapper.classList.toggle('is-disabled', select.disabled);
  optionsContainer.setAttribute('aria-label', label);
  if (instance.search) {
    instance.search.placeholder = select.dataset.searchPlaceholder || '';
    instance.search.setAttribute('aria-label', select.dataset.searchPlaceholder || label);
  }
  optionsContainer.innerHTML = options.map((option, index) => optionMarkup(instance, option, index)).join('');

  optionsContainer.querySelectorAll('[data-custom-select-value]').forEach((optionButton) => {
    optionButton.addEventListener('click', () => chooseOption(instance, optionButton.dataset.customSelectValue || ''));
    optionButton.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveOptionFocus(instance, optionButton, event.key === 'ArrowDown' ? 1 : -1);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const available = enabledOptions(instance);
        available[event.key === 'Home' ? 0 : available.length - 1]?.focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeInstance(instance, { returnFocus: true });
      }
    });
  });

  if (select.disabled) closeInstance(instance);
}

function enhanceSelect(select) {
  if (!(select instanceof HTMLSelectElement) || select.multiple || select.size > 1 || instances.has(select)) return;

  const id = select.id || `custom-select-${++selectId}`;
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';
  select.classList.forEach((className) => wrapper.classList.add(`custom-select--${className}`));
  wrapper.dataset.customSelect = '';

  const button = document.createElement('button');
  button.className = 'custom-select-trigger';
  button.type = 'button';
  button.id = `${id}-trigger`;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = `<span class="custom-select-value"></span><span class="custom-select-caret">${chevronIcon()}</span>`;

  const list = document.createElement('div');
  list.className = 'custom-select-popover';
  list.id = `${id}-options`;
  list.setAttribute('aria-labelledby', button.id);
  button.setAttribute('aria-controls', list.id);

  const isSearchable = select.hasAttribute('data-searchable');
  const search = isSearchable ? document.createElement('input') : null;
  if (search) {
    search.className = 'custom-select-search';
    search.type = 'search';
    search.autocomplete = 'off';
    search.spellcheck = false;
    search.placeholder = select.dataset.searchPlaceholder || '';
    search.setAttribute('aria-label', select.dataset.searchPlaceholder || selectLabel(select));
    wrapper.classList.add('is-searchable');
  }

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'custom-select-options';
  optionsContainer.setAttribute('role', 'listbox');

  select.before(wrapper);
  list.append(...[search, optionsContainer].filter(Boolean));
  wrapper.append(select, button, list);
  select.classList.add('custom-select-native');

  const instance = {
    id,
    select,
    wrapper,
    button,
    value: button.querySelector('.custom-select-value'),
    list,
    optionsContainer,
    search,
    isOpen: false,
    observer: null
  };
  instances.set(select, instance);

  button.addEventListener('click', () => {
    if (instance.isOpen) closeInstance(instance);
    else openInstance(instance);
  });
  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openInstance(instance);
    } else if (event.key === 'Escape') {
      closeInstance(instance);
    }
  });
  search?.addEventListener('input', () => filterOptions(instance, search.value));
  search?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      enabledOptions(instance)[0]?.focus();
    } else if (event.key === 'Enter') {
      const firstOption = enabledOptions(instance)[0];
      if (firstOption) {
        event.preventDefault();
        chooseOption(instance, firstOption.dataset.customSelectValue || '');
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeInstance(instance, { returnFocus: true });
    }
  });
  select.addEventListener('change', () => syncInstance(instance));
  select.addEventListener('invalid', (event) => {
    event.preventDefault();
    wrapper.classList.add('is-invalid');
    button.focus();
  });
  select.form?.addEventListener('reset', () => window.setTimeout(() => syncInstance(instance), 0));

  instance.observer = new MutationObserver(() => syncInstance(instance));
  instance.observer.observe(select, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
    attributeFilter: ['disabled', 'hidden', 'label', 'selected', 'data-locked', 'title', 'data-search-placeholder']
  });

  syncInstance(instance);
}

function enhanceWithin(root) {
  if (root instanceof HTMLSelectElement) enhanceSelect(root);
  root.querySelectorAll?.('select').forEach(enhanceSelect);
}

export function syncCustomSelect(select) {
  const instance = instances.get(select);
  if (instance) syncInstance(instance);
}

export function initCustomSelects(root = document) {
  enhanceWithin(root);
  if (documentObserver) return;

  document.addEventListener('click', (event) => {
    [...openInstances].forEach((instance) => {
      if (!instance.wrapper.contains(event.target)) closeInstance(instance);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    [...openInstances].forEach((instance) => closeInstance(instance, { returnFocus: true }));
  });

  documentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element && !node.closest('[data-custom-select]')) enhanceWithin(node);
      });
    });
  });
  documentObserver.observe(document.body, { childList: true, subtree: true });
}
