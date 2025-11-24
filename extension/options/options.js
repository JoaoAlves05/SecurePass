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
  statusEl.classList.add('visible');

  setTimeout(() => {
    statusEl.classList.remove('visible');
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

// Data Management
const resetSettingsBtn = document.getElementById('resetSettings');
const clearDataBtn = document.getElementById('clearData');
const exportVaultBtn = document.getElementById('exportVault');
const importVaultBtn = document.getElementById('importVaultBtn');
const importVaultFile = document.getElementById('importVaultFile');

async function sendMessage(type, payload = {}) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type, ...payload }, response => {
      resolve(response || { ok: false, error: 'No response from background.' });
    });
  });
}

async function handleResetSettings() {
  if (!confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) return;

  await saveSettings(DEFAULT_SETTINGS);
  populateForm(DEFAULT_SETTINGS);

  statusEl.textContent = 'Settings reset to defaults.';
  statusEl.classList.add('visible');
  setTimeout(() => statusEl.classList.remove('visible'), 2500);
}

async function handleClearData() {
  if (!confirm('DANGER: This will permanently delete ALL your vault data and reset all settings.\n\nAre you absolutely sure?')) return;

  // Clear local storage (vault + settings)
  await chrome.storage.local.clear();
  // Clear sync storage (synced settings)
  await chrome.storage.sync.clear();

  // Reload defaults
  populateForm(DEFAULT_SETTINGS);

  statusEl.textContent = 'All data cleared successfully.';
  statusEl.classList.add('visible');
  setTimeout(() => statusEl.classList.remove('visible'), 2500);
}

async function handleExportVault() {
  const response = await sendMessage('EXPORT_VAULT');
  if (!response?.ok) {
    alert(response?.error || 'Unable to export vault. Is it unlocked?');
    return;
  }

  const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `securepass-vault-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleImportVault() {
  importVaultFile.click();
}

async function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      const passphrase = prompt('Please enter your master password to encrypt the imported data:');
      if (!passphrase) {
        alert('Import cancelled. Master password is required.');
        importVaultFile.value = '';
        return;
      }

      const response = await sendMessage('IMPORT_VAULT', { data, passphrase });

      if (!response?.ok) {
        alert(response?.error || 'Import failed.');
        return;
      }

      alert(`Successfully imported ${response.count} credentials.`);
      importVaultFile.value = ''; // Reset file input
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}

if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener('click', handleResetSettings);
}

if (clearDataBtn) {
  clearDataBtn.addEventListener('click', handleClearData);
}

if (exportVaultBtn) {
  exportVaultBtn.addEventListener('click', handleExportVault);
}

if (importVaultBtn) {
  importVaultBtn.addEventListener('click', handleImportVault);
}

if (importVaultFile) {
  importVaultFile.addEventListener('change', handleImportFile);
}

document.addEventListener('DOMContentLoaded', init);
