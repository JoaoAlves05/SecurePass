import { evaluatePassword } from '../src/passwordStrength.js';
import { loadSettings, saveSettings } from '../src/settings.js';

const passwordInput = document.getElementById('passwordInput');
const strengthBar = document.getElementById('strengthBar');
const verdictEl = document.getElementById('verdict');
const entropyEl = document.getElementById('entropy');
const crackTimeEl = document.getElementById('crackTime');
const suggestionsEl = document.getElementById('suggestions');
const hibpResult = document.getElementById('hibpResult');
const generateButton = document.getElementById('generateCopy');
const checkButton = document.getElementById('checkHibp');
const visibilityToggle = document.getElementById('visibilityToggle');
const themeToggle = document.getElementById('themeToggle');
const vaultPassphrase = document.getElementById('vaultPassphrase');
const unlockVaultBtn = document.getElementById('unlockVault');
const lockVaultBtn = document.getElementById('lockVault');
const saveCredentialBtn = document.getElementById('saveCredential');
const vaultList = document.getElementById('vaultList');
const credentialLabel = document.getElementById('credentialLabel');

const state = {
  settings: null,
  vaultUnlocked: false,
  passphrase: null
};

const THEMES = ['system', 'dark', 'light'];

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;
  document.body.dataset.theme = resolved;
}

function mapScoreToColor(score) {
  if (score >= 0.8) return 'var(--success)';
  if (score >= 0.6) return '#4ade80';
  if (score >= 0.4) return 'var(--warning)';
  return 'var(--danger)';
}

async function loadInitialSettings() {
  state.settings = await loadSettings();
  if (!state.settings.theme) {
    state.settings.theme = 'system';
  }
  applyTheme(state.settings.theme);
  if (state.settings.theme === 'system' && window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => applyTheme('system'));
  }
}

function updateStrength(password) {
  const result = evaluatePassword(password);
  strengthBar.style.width = `${Math.max(result.score * 100, 6)}%`;
  strengthBar.style.background = mapScoreToColor(result.score);
  verdictEl.textContent = result.verdict;
  entropyEl.textContent = `${result.entropy} bits`;
  crackTimeEl.textContent = result.crackTime;

  suggestionsEl.innerHTML = '';
  result.suggestions.forEach(suggestion => {
    const li = document.createElement('li');
    li.textContent = suggestion;
    suggestionsEl.appendChild(li);
  });
}

function setLoading(button, loading) {
  button.disabled = loading;
  button.dataset.loading = loading;
}

async function sendMessage(type, payload = {}) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type, ...payload }, response => {
      resolve(response);
    });
  });
}

passwordInput.addEventListener('input', event => {
  updateStrength(event.target.value);
  hibpResult.textContent = '';
});

visibilityToggle.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    visibilityToggle.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    visibilityToggle.textContent = '👁️';
  }
});

checkButton.addEventListener('click', async () => {
  setLoading(checkButton, true);
  hibpResult.textContent = 'Checking…';
  const { result, ok, error } = await sendMessage('HIBP_CHECK', { password: passwordInput.value });
  setLoading(checkButton, false);
  if (!ok) {
    hibpResult.textContent = error || 'HIBP check failed.';
    hibpResult.style.color = 'var(--warning)';
    return;
  }
  if (result.compromised) {
    hibpResult.textContent = `Compromised ${result.count.toLocaleString()} times!`;
    hibpResult.style.color = 'var(--danger)';
  } else {
    hibpResult.textContent = 'Not found in breaches.';
    hibpResult.style.color = 'var(--success)';
  }
});

generateButton.addEventListener('click', async () => {
  setLoading(generateButton, true);
  const { password, ok, error } = await sendMessage('GENERATE_PASSWORD', { constraints: {} });
  setLoading(generateButton, false);
  if (!ok) {
    hibpResult.textContent = error || 'Unable to generate password.';
    hibpResult.style.color = 'var(--warning)';
    return;
  }
  passwordInput.value = password;
  updateStrength(password);
  try {
    await navigator.clipboard.writeText(password);
    hibpResult.textContent = 'Generated and copied!';
    hibpResult.style.color = 'var(--accent)';
  } catch (err) {
    hibpResult.textContent = 'Generated. Copy manually.';
    hibpResult.style.color = 'var(--warning)';
  }
});

async function refreshVaultList() {
  const { ok, entries, unlocked } = await sendMessage('LIST_CREDENTIALS');
  if (!ok) {
    vaultList.innerHTML = '<li>Unlock vault to view entries.</li>';
    return;
  }
  if (!unlocked) {
    vaultList.innerHTML = '<li>Vault locked.</li>';
    return;
  }
  if (!entries.length) {
    vaultList.innerHTML = '<li>No credentials stored yet.</li>';
    return;
  }
  vaultList.innerHTML = '';
  entries
    .slice(-10)
    .reverse()
    .forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.label || item.origin}</span><span>${new Date(item.createdAt).toLocaleString()}</span>`;
      vaultList.appendChild(li);
    });
}

unlockVaultBtn.addEventListener('click', async () => {
  const passphrase = vaultPassphrase.value.trim();
  if (!passphrase) return;
  const { ok, data, error } = await sendMessage('UNLOCK_VAULT', {
    passphrase,
    timeoutMinutes: state.settings?.vaultTimeout || 15
  });
  if (!ok) {
    hibpResult.textContent = error || 'Unable to unlock vault.';
    hibpResult.style.color = 'var(--warning)';
    return;
  }
  state.vaultUnlocked = true;
  state.passphrase = passphrase;
  vaultPassphrase.value = '';
  hibpResult.textContent = 'Vault unlocked.';
  hibpResult.style.color = 'var(--success)';
  if (data.entries) {
    await refreshVaultList();
  }
});

lockVaultBtn.addEventListener('click', async () => {
  await sendMessage('LOCK_VAULT');
  state.vaultUnlocked = false;
  state.passphrase = null;
  hibpResult.textContent = 'Vault locked.';
  hibpResult.style.color = 'var(--warning)';
  refreshVaultList();
});

saveCredentialBtn.addEventListener('click', async () => {
  if (!state.vaultUnlocked || !state.passphrase) {
    hibpResult.textContent = 'Unlock vault first.';
    hibpResult.style.color = 'var(--warning)';
    return;
  }
  if (!passwordInput.value) {
    hibpResult.textContent = 'Enter or generate a password first.';
    hibpResult.style.color = 'var(--warning)';
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const origin = tab && tab.url ? new URL(tab.url).origin : 'unknown';
  const entry = {
    origin,
    label: credentialLabel.value || origin,
    password: passwordInput.value
  };
  const { ok, error } = await sendMessage('STORE_CREDENTIAL', {
    entry,
    passphrase: state.passphrase
  });
  if (!ok) {
    hibpResult.textContent = error || 'Failed to save credential.';
    hibpResult.style.color = 'var(--warning)';
    return;
  }
  credentialLabel.value = '';
  hibpResult.textContent = 'Password stored securely.';
  hibpResult.style.color = 'var(--success)';
  refreshVaultList();
});

async function toggleTheme() {
  if (!state.settings) return;
  const currentIndex = THEMES.indexOf(state.settings.theme || 'system');
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
  state.settings.theme = nextTheme;
  applyTheme(nextTheme);
  await saveSettings(state.settings);
}

themeToggle.addEventListener('click', toggleTheme);

loadInitialSettings().then(() => {
  refreshVaultList();
  updateStrength('');
});
