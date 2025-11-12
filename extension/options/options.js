import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/settings.js';

const form = document.getElementById('settingsForm');
const statusEl = document.getElementById('status');

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
}

async function init() {
  const settings = await loadSettings();
  populateForm(settings);
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
  await saveSettings(settings);
  statusEl.textContent = 'Settings saved.';
  setTimeout(() => (statusEl.textContent = ''), 2500);
});

init();
