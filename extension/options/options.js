import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/settings.js';

const form = document.getElementById('settingsForm');
const statusEl = document.getElementById('status');
const themeSelect = document.getElementById('theme');

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

function populateForm(settings) {
  const formData = { ...DEFAULT_SETTINGS, ...settings };
  Object.entries(formData).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;
    if (field.type === 'checkbox') {
      field.checked = Boolean(value);
    } else {
      field.value = value;
    }
  });
  applyTheme(formData.theme);
}

async function init() {
  const settings = await loadSettings();
  populateForm(settings);
}

// Apply theme immediately when changed
if (themeSelect) {
  themeSelect.addEventListener('change', () => {
    applyTheme(themeSelect.value);
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
    } else if (field.type === 'number') {
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
  applyTheme(settings.theme); // Ensure theme is applied (in case it wasn't changed via select)
  statusEl.textContent = 'Settings saved.';
  setTimeout(() => (statusEl.textContent = ''), 2500);
});

// Listen for system theme changes if 'system' is selected
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (themeSelect && themeSelect.value === 'system') {
    applyTheme('system');
  }
});

init();
