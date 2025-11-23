import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/settings.js';

const form = document.getElementById('settingsForm');
const statusEl = document.getElementById('status');

// Theme elements
const themeRadios = document.querySelectorAll('input[name="theme"]');

// Security sliders
const vaultTimeoutRange = document.getElementById('vaultTimeout');
const vaultTimeoutLabel = document.getElementById('vaultTimeoutLabel');
const clipboardTimeoutRange = document.getElementById('clipboardTimeout');
const clipboardTimeoutLabel = document.getElementById('clipboardTimeoutLabel');
const hibpCacheTtlRange = document.getElementById('hibpCacheTtlHours');
const hibpCacheTtlLabel = document.getElementById('hibpCacheTtlLabel');

// Generator sliders
const minLengthRange = document.getElementById('minLength');
const minLengthLabel = document.getElementById('minLengthLabel');

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(theme) {
  if (theme === 'system') {
    return systemPrefersDark() ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(theme) {
  const resolved = resolveTheme(theme);
  document.body.dataset.theme = resolved;
}

function updateSliderLabels() {
  if (vaultTimeoutRange && vaultTimeoutLabel) {
    vaultTimeoutLabel.textContent = `${vaultTimeoutRange.value} min`;
  }
  if (clipboardTimeoutRange && clipboardTimeoutLabel) {
    const val = Number(clipboardTimeoutRange.value);
    clipboardTimeoutLabel.textContent = val === 0 ? 'Never' : `${val}s`;
  }
  if (hibpCacheTtlRange && hibpCacheTtlLabel) {
    const hours = Number(hibpCacheTtlRange.value);
    hibpCacheTtlLabel.textContent = hours === 1 ? '1 hour' : `${hours} hours`;
  }
  if (minLengthRange && minLengthLabel) {
    minLengthLabel.textContent = minLengthRange.value;
  }
}

function populateForm(settings) {
  const formData = { ...DEFAULT_SETTINGS, ...settings };

  // Populate all form fields
  Object.entries(formData).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;

    if (field.type === 'checkbox') {
      field.checked = Boolean(value);
    } else if (field.type === 'radio') {
      const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
      if (radio) radio.checked = true;
    } else {
      field.value = value;
    }
  });

  updateSliderLabels();
  applyTheme(formData.theme);
}

async function init() {
  const settings = await loadSettings();
  populateForm(settings);

  // Add slider event listeners
  if (vaultTimeoutRange) {
    vaultTimeoutRange.addEventListener('input', updateSliderLabels);
  }
  if (clipboardTimeoutRange) {
    clipboardTimeoutRange.addEventListener('input', updateSliderLabels);
  }
  if (hibpCacheTtlRange) {
    hibpCacheTtlRange.addEventListener('input', updateSliderLabels);
  }
  if (minLengthRange) {
    minLengthRange.addEventListener('input', updateSliderLabels);
  }

  // Add theme change listener
  themeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        applyTheme(radio.value);
      }
    });
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(form);
  const settings = {};

  data.forEach((value, key) => {
    const field = form.elements.namedItem(key);
    if (field.type === 'checkbox') {
      settings[key] = field.checked;
    } else if (field.type === 'number' || field.type === 'range') {
      settings[key] = Number(value);
    } else {
      settings[key] = value;
    }
  });

  // Handle unchecked checkboxes
  Array.from(form.elements).forEach(element => {
    if (element.type === 'checkbox' && !settings.hasOwnProperty(element.name)) {
      settings[element.name] = false;
    }
  });

  await saveSettings(settings);
  applyTheme(settings.theme);

  statusEl.textContent = 'Settings saved successfully!';
  statusEl.style.opacity = '1';

  setTimeout(() => {
    statusEl.style.opacity = '0';
    setTimeout(() => {
      statusEl.textContent = '';
    }, 300);
  }, 2500);
});

// Listen for system theme changes if 'system' is selected
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const systemRadio = form.querySelector('input[name="theme"][value="system"]');
  if (systemRadio && systemRadio.checked) {
    applyTheme('system');
  }
});

init();
