import { evaluatePassword } from '../src/passwordStrength.js';
import { loadSettings, saveSettings } from '../src/settings.js';

const ICONS = {
  sun:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line></svg>',
  moon:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 14.5A8.38 8.38 0 0 1 12.5 3 6.5 6.5 0 1 0 21 14.5z"></path></svg>',
  eye:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  eyeOff:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.88"></path><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.16 4.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',
  copy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  arrowRight:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
  lock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="11" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>',
  edit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg>'
};

const passwordInput = document.getElementById('passwordInput');
const strengthBar = document.getElementById('strengthBar');
const strengthVerdict = document.getElementById('strengthVerdict');
const entropyEl = document.getElementById('entropy');
const crackTimeEl = document.getElementById('crackTime');
const suggestionsList = document.getElementById('suggestionsList');
const suggestionsEmpty = document.getElementById('suggestionsEmpty');
const hibpStatus = document.getElementById('hibpStatus');
const hibpButton = document.getElementById('checkHibp');
const togglePasswordBtn = document.getElementById('togglePassword');
const copyTestPasswordBtn = document.getElementById('copyTestPassword');
const themeToggle = document.getElementById('themeToggle');
const openSettingsBtn = document.getElementById('openSettings');
const closeSettingsBtn = document.getElementById('closeSettings');
const settingsPanel = document.getElementById('settingsPanel');
const themeRadios = document.querySelectorAll('input[name="appearanceTheme"]');
const autoLockRange = document.getElementById('autoLockRange');
const autoLockLabel = document.getElementById('autoLockLabel');
const syncToggle = document.getElementById('syncToggle');
const toastEl = document.getElementById('toast');
const viewTabs = document.querySelectorAll('.nav-item');
const views = {
  generator: document.getElementById('view-generator'),
  tester: document.getElementById('view-tester'),
  vault: document.getElementById('view-vault')
};

const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const includeLower = document.getElementById('includeLower');
const includeUpper = document.getElementById('includeUpper');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const avoidSimilar = document.getElementById('avoidSimilar');
const generatorStatus = document.getElementById('generatorStatus');
const generateButton = document.getElementById('generatePassword');
const generatedResult = document.getElementById('generatedResult');
const copyGeneratedBtn = document.getElementById('copyGenerated');
const useForTestBtn = document.getElementById('useForTest');
const saveGeneratedBtn = document.getElementById('saveGenerated');
const saveTestedBtn = document.getElementById('saveTested');

const vaultLockedPanel = document.getElementById('vaultLocked');
const vaultUnlockedPanel = document.getElementById('vaultUnlocked');
const createMasterSection = document.getElementById('createMaster');
const unlockMasterSection = document.getElementById('unlockMaster');
const createMasterForm = document.getElementById('createMasterForm');
const unlockForm = document.getElementById('unlockForm');
const vaultPassphraseInput = document.getElementById('vaultPassphrase');
const newMasterInput = document.getElementById('newMaster');
const confirmMasterInput = document.getElementById('confirmMaster');
const vaultList = document.getElementById('vaultList');
const vaultEmpty = document.getElementById('vaultEmpty');
const vaultSearch = document.getElementById('vaultSearch');
const addEntryBtn = document.getElementById('addEntry');
const changeMasterBtn = document.getElementById('changeMaster');
const lockVaultBtn = document.getElementById('lockVault');

const modalBackdrop = document.getElementById('modalBackdrop');
const entryModal = document.getElementById('entryModal');
const entryForm = document.getElementById('entryForm');
const entryModalTitle = document.getElementById('entryModalTitle');
const entrySiteInput = document.getElementById('entrySite');
const entryUsernameInput = document.getElementById('entryUsername');
const entryPasswordInput = document.getElementById('entryPassword');
const entryNotesInput = document.getElementById('entryNotes');

const masterModal = document.getElementById('masterModal');
const masterForm = document.getElementById('masterForm');
const currentMasterInput = document.getElementById('currentMaster');
const nextMasterInput = document.getElementById('nextMaster');
const confirmNextMasterInput = document.getElementById('confirmNextMaster');

const THEMES = ['system', 'dark', 'light'];
const revealTimers = new Map();
let settingsSaveTimeout = null;

const state = {
  settings: null,
  vaultUnlocked: false,
  vaultInitialized: null,
  passphrase: null,
  entries: [],
  filter: '',
  generatorPassword: '',
  inactivityTimer: null,
  currentView: 'tester',
  editingEntryId: null
};

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
  updateThemeToggleIcon();
}

function scheduleSettingsSave() {
  if (!state.settings) return;
  clearTimeout(settingsSaveTimeout);
  settingsSaveTimeout = setTimeout(() => {
    saveSettings(state.settings).catch(() => {
      showToast('Unable to save preferences.', 'warning');
    });
  }, 250);
}

function showToast(message, variant = 'info') {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove('visible', 'success', 'error', 'warning');
  if (variant !== 'info') {
    toastEl.classList.add(variant);
  }
  requestAnimationFrame(() => {
    toastEl.classList.add('visible');
  });
  setTimeout(() => {
    toastEl.classList.remove('visible', 'success', 'error', 'warning');
  }, 3200);
}

function mapScoreToColor(score) {
  if (score >= 0.8) return 'linear-gradient(90deg, #22c55e, #16a34a)';
  if (score >= 0.6) return 'linear-gradient(90deg, #84cc16, #16a34a)';
  if (score >= 0.4) return 'linear-gradient(90deg, #f97316, #f59e0b)';
  return 'linear-gradient(90deg, #ef4444, #dc2626)';
}

function scoreToBadge(score) {
  if (score >= 0.75) return 'badge-strong';
  if (score >= 0.45) return 'badge-medium';
  return 'badge-weak';
}

function updateStrength(password) {
  const { score, verdict, entropy, crackTime, suggestions } = evaluatePassword(password);
  strengthBar.style.width = `${Math.max(score * 100, 6)}%`;
  strengthBar.style.background = mapScoreToColor(score);
  strengthVerdict.textContent = verdict;
  strengthVerdict.classList.remove('badge-weak', 'badge-medium', 'badge-strong');
  strengthVerdict.classList.add(scoreToBadge(score));
  entropyEl.textContent = `Entropy: ${entropy} bits`;
  crackTimeEl.textContent = `Crack time: ${crackTime}`;

  suggestionsList.innerHTML = '';
  if (suggestions.length) {
    suggestionsEmpty.classList.add('hidden');
    suggestionsList.classList.add('visible');
    suggestions.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      suggestionsList.appendChild(li);
    });
  } else {
    suggestionsList.classList.remove('visible');
    suggestionsEmpty.classList.remove('hidden');
  }

  const tipsToggle = document.querySelector('[data-toggle-target="tipsContent"]');
  const tipsContent = document.getElementById('tipsContent');
  if (tipsToggle && tipsContent) {
    const wasExpanded = tipsToggle.getAttribute('aria-expanded') === 'true';
    if (suggestions.length) {
      if (!wasExpanded) {
        toggleCollapsible(tipsToggle);
        tipsToggle.dataset.autoOpened = 'true';
      }
    } else {
      if (tipsToggle.dataset.autoOpened === 'true' && wasExpanded) {
        toggleCollapsible(tipsToggle);
      }
      delete tipsToggle.dataset.autoOpened;
    }
  }
}

function toggleCollapsible(button) {
  if (!button) return;
  const targetId = button.getAttribute('data-toggle-target');
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (!target) return;
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const nextState = !isExpanded;
  button.setAttribute('aria-expanded', String(nextState));
  target.hidden = !nextState;
  updateToggleLabel(button, nextState);
}

function updateToggleLabel(button, expanded = false) {
  if (!button) return;
  const labels = button.dataset.labels ? button.dataset.labels.split('|').map(label => label.trim()) : null;
  if (labels && labels.length === 2) {
    button.textContent = expanded ? labels[1] : labels[0];
  }
}

function setLoading(button, loading) {
  if (!button) return;
  button.disabled = loading;
  button.dataset.loading = loading;
}

function updateThemeToggleIcon() {
  if (!themeToggle) return;
  const resolved = resolveTheme(state.settings?.theme || 'system');
  const icon = resolved === 'dark' ? ICONS.sun : ICONS.moon;
  themeToggle.innerHTML = icon;
  const label = resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
}

function updatePasswordToggleIcon() {
  if (!togglePasswordBtn) return;
  const isHidden = passwordInput.type === 'password';
  togglePasswordBtn.innerHTML = isHidden ? ICONS.eye : ICONS.eyeOff;
  togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Show password' : 'Hide password');
}

function syncSettingsView() {
  if (!state.settings) return;
  themeRadios.forEach(radio => {
    radio.checked = radio.value === state.settings.theme;
  });
  const timeout = state.settings.vaultTimeout || 15;
  autoLockRange.value = timeout;
  autoLockLabel.textContent = `${timeout} min`;
  syncToggle.checked = Boolean(state.settings.useSync);
  updateThemeToggleIcon();
}

function openSettingsPanel() {
  if (!settingsPanel) return;
  settingsPanel.setAttribute('aria-hidden', 'false');
  // Move focus to the close button for accessibility
  closeSettingsBtn?.focus();
}

function closeSettingsPanel() {
  if (!settingsPanel) return;
  // Move focus back to the trigger button BEFORE hiding the panel
  // This prevents the "aria-hidden element contains focus" error
  openSettingsBtn?.focus();
  settingsPanel.setAttribute('aria-hidden', 'true');
}

async function sendMessage(type, payload = {}) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type, ...payload }, response => {
      resolve(response || { ok: false, error: 'No response from background.' });
    });
  });
}

async function copyToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (error) {
    return false;
  }
}

function setView(view) {
  if (!views[view]) return;
  state.currentView = view;
  viewTabs.forEach(tab => {
    const isActive = tab.dataset.view === view;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  Object.entries(views).forEach(([key, section]) => {
    if (!section) return;
    section.classList.toggle('active', key === view);
  });
}

function resetInactivityTimer() {
  if (!state.vaultUnlocked) return;
  const minutes = state.settings?.vaultTimeout || 15;
  clearTimeout(state.inactivityTimer);
  state.inactivityTimer = setTimeout(async () => {
    await lockVault();
    showToast('Vault locked after inactivity.', 'warning');
  }, minutes * 60 * 1000);
}

async function detectActiveOrigin() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      return new URL(tab.url).origin;
    }
  } catch (error) {
    // ignore
  }
  return '';
}

function clearRevealTimer(id) {
  const timer = revealTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    revealTimers.delete(id);
  }
}

function hidePasswordReveal(container, button, id) {
  if (!container) return;
  container.classList.add('hidden');
  container.textContent = '';
  if (button) {
    button.innerHTML = ICONS.eye;
    button.setAttribute('aria-label', 'Reveal password');
  }
  if (id) clearRevealTimer(id);
}

function createVaultIconButton(icon, label, extraClass = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `vault-icon-btn${extraClass ? ` ${extraClass}` : ''}`;
  button.setAttribute('aria-label', label);
  button.innerHTML = icon;
  return button;
}

function renderVaultEntries() {
  if (!state.vaultUnlocked) {
    vaultList.innerHTML = '';
    vaultEmpty.classList.add('hidden');
    return;
  }
  const query = state.filter.toLowerCase();
  const filtered = state.entries
    .slice()
    .filter(entry => {
      if (!query) return true;
      return (
        entry.site.toLowerCase().includes(query) ||
        entry.username.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const siteCompare = a.site.localeCompare(b.site, undefined, { sensitivity: 'base' });
      if (siteCompare !== 0) return siteCompare;
      return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
    });

  vaultList.innerHTML = '';
  if (!filtered.length) {
    vaultEmpty.classList.remove('hidden');
    return;
  }
  vaultEmpty.classList.add('hidden');

  filtered.forEach(entry => {
    const item = document.createElement('li');
    item.className = 'vault-item';
    item.dataset.id = entry.id;

    const header = document.createElement('header');
    const title = document.createElement('h3');
    title.textContent = entry.site || 'Untitled';
    header.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'meta';
    const updated = new Date(entry.updatedAt || entry.createdAt);
    meta.textContent = `Updated ${updated.toLocaleString()}`;
    header.appendChild(meta);

    item.appendChild(header);

    if (entry.username) {
      const username = document.createElement('div');
      username.className = 'username';
      username.textContent = entry.username;
      item.appendChild(username);
    }

    if (entry.notes) {
      const notes = document.createElement('p');
      notes.className = 'meta';
      notes.textContent = entry.notes;
      item.appendChild(notes);
    }

    const passwordReveal = document.createElement('div');
    passwordReveal.className = 'password-reveal hidden';
    item.appendChild(passwordReveal);

    const actions = document.createElement('div');
    actions.className = 'vault-actions';

    const revealBtn = createVaultIconButton(ICONS.eye, 'Reveal password');
    revealBtn.addEventListener('click', () => {
      resetInactivityTimer();
      const isHidden = passwordReveal.classList.contains('hidden');
      if (isHidden) {
        passwordReveal.textContent = entry.password;
        passwordReveal.classList.remove('hidden');
        revealBtn.innerHTML = ICONS.eyeOff;
        revealBtn.setAttribute('aria-label', 'Hide password');
        clearRevealTimer(entry.id);
        const timer = setTimeout(() => {
          hidePasswordReveal(passwordReveal, revealBtn, entry.id);
        }, 10000);
        revealTimers.set(entry.id, timer);
      } else {
        hidePasswordReveal(passwordReveal, revealBtn, entry.id);
      }
    });

    const copyBtn = createVaultIconButton(ICONS.copy, 'Copy password');
    copyBtn.addEventListener('click', async () => {
      resetInactivityTimer();
      const ok = await copyToClipboard(entry.password);
      showToast(ok ? 'Password copied to clipboard.' : 'Unable to copy password.', ok ? 'success' : 'warning');
    });

    const editBtn = createVaultIconButton(ICONS.edit, 'Edit credential');
    editBtn.addEventListener('click', () => {
      openEntryModal(entry);
    });

    const deleteBtn = createVaultIconButton(ICONS.trash, 'Delete credential', 'danger');
    deleteBtn.addEventListener('click', async () => {
      const confirmed = window.confirm('Delete this credential from the vault?');
      if (!confirmed) return;
      await deleteCredential(entry.id);
    });

    actions.append(revealBtn, copyBtn, editBtn, deleteBtn);
    item.appendChild(actions);
    vaultList.appendChild(item);
  });
}

function renderVaultState() {
  const showLocked = !state.vaultUnlocked;
  vaultLockedPanel.classList.toggle('hidden', !showLocked);
  vaultUnlockedPanel.classList.toggle('hidden', showLocked);
  createMasterSection.classList.toggle('hidden', state.vaultInitialized !== false);
  unlockMasterSection.classList.toggle('hidden', !state.vaultInitialized);
  if (!state.vaultUnlocked) {
    vaultSearch.value = '';
    state.filter = '';
    state.entries = [];
  }
}

function clearEntryForm() {
  entryForm.reset();
  entrySiteInput.value = '';
  entryUsernameInput.value = '';
  entryPasswordInput.value = '';
  entryNotesInput.value = '';
}

function closeModal(id) {
  const modal = id === 'entryModal' ? entryModal : masterModal;
  if (!modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
  }
  if (!entryModal.classList.contains('hidden') || !masterModal.classList.contains('hidden')) {
    return;
  }
  modalBackdrop.classList.add('hidden');
}

function openModal(id) {
  modalBackdrop.classList.remove('hidden');
  const modal = id === 'entryModal' ? entryModal : masterModal;
  modal.classList.remove('hidden');
  const focusTarget = modal.querySelector('input, textarea, button');
  if (focusTarget) {
    setTimeout(() => focusTarget.focus(), 10);
  }
}

async function openEntryModal(entry = null) {
  if (!requireUnlockedVault()) return;
  state.editingEntryId = entry ? entry.id : null;
  entryModalTitle.textContent = entry ? 'Update credential' : 'Save credential';
  clearEntryForm();
  if (entry) {
    entrySiteInput.value = entry.site || '';
    entryUsernameInput.value = entry.username || '';
    entryPasswordInput.value = entry.password || '';
    entryNotesInput.value = entry.notes || '';
  } else {
    entryPasswordInput.value = state.generatorPassword || passwordInput.value;
    if (!entrySiteInput.value) {
      entrySiteInput.value = await detectActiveOrigin();
    }
  }
  openModal('entryModal');
  resetInactivityTimer();
}

function openMasterModal() {
  if (!requireUnlockedVault()) return;
  masterForm.reset();
  openModal('masterModal');
  resetInactivityTimer();
}

function requireUnlockedVault() {
  if (state.vaultUnlocked && state.passphrase) {
    resetInactivityTimer();
    return true;
  }
  showToast('Unlock the vault first to continue.', 'warning');
  setView('vault');
  return false;
}

async function lockVault(showMessage = false) {
  await sendMessage('LOCK_VAULT');
  state.vaultUnlocked = false;
  state.passphrase = null;
  state.entries = [];
  clearTimeout(state.inactivityTimer);
  renderVaultState();
  renderVaultEntries();
  if (showMessage) {
    showToast('Vault locked.', 'info');
  }
}

async function refreshVaultEntries() {
  if (!state.vaultUnlocked) return;
  const response = await sendMessage('LIST_CREDENTIALS');
  if (!response?.ok) {
    return;
  }
  if (!response.unlocked) {
    await lockVault();
    return;
  }
  state.entries = response.entries || [];
  renderVaultEntries();
}

async function deleteCredential(id) {
  if (!requireUnlockedVault()) return;
  const response = await sendMessage('DELETE_CREDENTIAL', {
    id,
    passphrase: state.passphrase
  });
  if (!response?.ok) {
    showToast(response?.error || 'Unable to delete credential.', 'error');
    return;
  }
  showToast('Credential removed from vault.', 'success');
  await refreshVaultEntries();
  resetInactivityTimer();
}

async function handleEntrySubmit(event) {
  event.preventDefault();
  if (!requireUnlockedVault()) return;
  const site = entrySiteInput.value.trim();
  const username = entryUsernameInput.value.trim();
  const password = entryPasswordInput.value.trim();
  const notes = entryNotesInput.value.trim();

  if (!site) {
    showToast('Website or app is required.', 'warning');
    entrySiteInput.focus();
    return;
  }
  if (!password) {
    showToast('Password is required.', 'warning');
    entryPasswordInput.focus();
    return;
  }

  const payload = {
    site,
    username,
    password,
    notes
  };

  let response;
  if (state.editingEntryId) {
    response = await sendMessage('UPDATE_CREDENTIAL', {
      id: state.editingEntryId,
      updates: payload,
      passphrase: state.passphrase
    });
  } else {
    response = await sendMessage('STORE_CREDENTIAL', {
      entry: payload,
      passphrase: state.passphrase
    });
  }

  if (!response?.ok) {
    showToast(response?.error || 'Unable to save credential.', 'error');
    return;
  }

  closeModal('entryModal');
  showToast(state.editingEntryId ? 'Credential updated.' : 'Credential saved to vault.', 'success');
  state.editingEntryId = null;
  await refreshVaultEntries();
  resetInactivityTimer();
}

async function handleUnlock(event) {
  event.preventDefault();
  const passphrase = vaultPassphraseInput.value.trim();
  if (!passphrase) return;
  const timeoutMinutes = state.settings?.vaultTimeout || 15;
  const response = await sendMessage('UNLOCK_VAULT', { passphrase, timeoutMinutes });
  if (!response?.ok) {
    showToast(response?.error || 'Unable to unlock vault.', 'error');
    return;
  }
  state.passphrase = passphrase;
  state.vaultUnlocked = true;
  state.vaultInitialized = true;
  vaultPassphraseInput.value = '';
  state.entries = response.data?.entries || [];
  renderVaultState();
  renderVaultEntries();
  resetInactivityTimer();
  showToast('Vault unlocked.', 'success');
}

async function handleCreateMaster(event) {
  event.preventDefault();
  const master = newMasterInput.value.trim();
  const confirm = confirmMasterInput.value.trim();
  if (!master || !confirm) {
    showToast('Enter and confirm the master password.', 'warning');
    return;
  }
  if (master !== confirm) {
    showToast('Master passwords do not match.', 'error');
    return;
  }
  const initResponse = await sendMessage('INITIALIZE_VAULT', { passphrase: master });
  if (!initResponse?.ok) {
    showToast(initResponse?.error || 'Unable to initialise vault.', 'error');
    return;
  }
  if (initResponse.created === false) {
    state.vaultInitialized = true;
    renderVaultState();
    showToast('Vault already exists. Unlock it with your master password.', 'warning');
    return;
  }
  const timeoutMinutes = state.settings?.vaultTimeout || 15;
  const unlockResponse = await sendMessage('UNLOCK_VAULT', { passphrase: master, timeoutMinutes });
  newMasterInput.value = '';
  confirmMasterInput.value = '';
  if (!unlockResponse?.ok) {
    state.vaultInitialized = true;
    renderVaultState();
    showToast('Vault created. Unlock with your new master password.', 'success');
    return;
  }
  state.passphrase = master;
  state.vaultInitialized = true;
  state.vaultUnlocked = true;
  state.entries = unlockResponse.data?.entries || [];
  renderVaultState();
  renderVaultEntries();
  resetInactivityTimer();
  showToast('Vault created and unlocked.', 'success');
}

async function loadVaultStatus() {
  const response = await sendMessage('VAULT_STATUS');
  if (!response?.ok) return;
  state.vaultInitialized = response.status?.initialized ?? false;
  if (response.status?.unlocked) {
    await lockVault();
  } else {
    state.vaultUnlocked = false;
    renderVaultState();
  }
}

function syncGeneratorControls() {
  if (!state.settings) return;
  lengthRange.value = state.settings.minLength;
  lengthValue.textContent = state.settings.minLength;
  includeLower.checked = state.settings.includeLowercase;
  includeUpper.checked = state.settings.includeUppercase;
  includeNumbers.checked = state.settings.includeNumbers;
  includeSymbols.checked = state.settings.includeSymbols;
  avoidSimilar.checked = state.settings.avoidSimilar;
  syncSettingsView();
}

async function handleGenerate() {
  setLoading(generateButton, true);
  generatorStatus.textContent = '';
  const constraints = {
    length: Number(lengthRange.value),
    overrides: {
      minLength: Number(lengthRange.value),
      includeLowercase: includeLower.checked,
      includeUppercase: includeUpper.checked,
      includeNumbers: includeNumbers.checked,
      includeSymbols: includeSymbols.checked,
      avoidSimilar: avoidSimilar.checked
    }
  };
  const response = await sendMessage('GENERATE_PASSWORD', { constraints });
  setLoading(generateButton, false);
  if (!response?.ok) {
    generatorStatus.textContent = response?.error || 'Could not generate password.';
    generatorStatus.style.color = 'var(--danger)';
    return;
  }
  state.generatorPassword = response.password;
  generatedResult.value = response.password;
  generatorStatus.textContent = 'Strong password generated.';
  generatorStatus.style.color = 'var(--primary)';
  showToast('New password generated.', 'success');
}

async function saveGeneratedToVault() {
  if (!generatedResult.value) {
    showToast('Generate a password first.', 'warning');
    return;
  }
  await openEntryModal({
    id: null,
    site: await detectActiveOrigin(),
    username: '',
    password: generatedResult.value,
    notes: ''
  });
}

async function saveTestedToVault() {
  if (!passwordInput.value) {
    showToast('Enter a password first.', 'warning');
    return;
  }
  await openEntryModal({
    id: null,
    site: await detectActiveOrigin(),
    username: '',
    password: passwordInput.value,
    notes: ''
  });
}

async function changeMasterPassword(event) {
  event.preventDefault();
  if (!requireUnlockedVault()) return;
  const current = currentMasterInput.value.trim();
  const next = nextMasterInput.value.trim();
  const confirm = confirmNextMasterInput.value.trim();
  if (!current || !next || !confirm) {
    showToast('Complete all fields.', 'warning');
    return;
  }
  if (next !== confirm) {
    showToast('New master passwords do not match.', 'error');
    return;
  }
  const response = await sendMessage('CHANGE_MASTER_PASSWORD', {
    oldPassphrase: current,
    newPassphrase: next
  });
  if (!response?.ok) {
    showToast(response?.error || 'Unable to change master password.', 'error');
    return;
  }
  state.passphrase = next;
  closeModal('masterModal');
  resetInactivityTimer();
  showToast('Master password updated.', 'success');
}

function attachEventListeners() {
  passwordInput.addEventListener('input', event => {
    updateStrength(event.target.value);
    hibpStatus.textContent = 'Not checked yet.';
    hibpStatus.style.color = 'var(--text-muted)';
  });

  togglePasswordBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    updatePasswordToggleIcon();
  });

  copyTestPasswordBtn.addEventListener('click', async () => {
    if (!passwordInput.value) {
      showToast('Enter a password first.', 'warning');
      return;
    }
    const ok = await copyToClipboard(passwordInput.value);
    showToast(ok ? 'Password copied.' : 'Clipboard unavailable.', ok ? 'success' : 'warning');
  });

  hibpButton.addEventListener('click', async () => {
    if (!passwordInput.value) {
      showToast('Enter a password to check.', 'warning');
      return;
    }
    setLoading(hibpButton, true);
    hibpStatus.textContent = 'Checking…';
    hibpStatus.style.color = 'var(--text-muted)';
    const response = await sendMessage('HIBP_CHECK', { password: passwordInput.value });
    setLoading(hibpButton, false);
    if (!response?.ok) {
      hibpStatus.textContent = response?.error || 'Could not check breaches.';
      hibpStatus.style.color = 'var(--warning)';
      return;
    }
    if (response.result?.compromised) {
      hibpStatus.textContent = `Compromised ${response.result.count.toLocaleString()} times.`;
      hibpStatus.style.color = 'var(--danger)';
      showToast('This password has appeared in breaches.', 'error');
    } else {
      hibpStatus.textContent = 'No known breaches found.';
      hibpStatus.style.color = 'var(--success)';
      showToast('Password not found in breaches.', 'success');
    }
  });

  generateButton.addEventListener('click', handleGenerate);

  lengthRange.addEventListener('input', event => {
    lengthValue.textContent = event.target.value;
  });

  const generatorToggles = [includeLower, includeUpper, includeNumbers, includeSymbols, avoidSimilar];
  generatorToggles.forEach(inputEl => {
    inputEl.addEventListener('change', () => {
      if (!state.settings) return;
      state.settings.includeLowercase = includeLower.checked;
      state.settings.includeUppercase = includeUpper.checked;
      state.settings.includeNumbers = includeNumbers.checked;
      state.settings.includeSymbols = includeSymbols.checked;
      state.settings.avoidSimilar = avoidSimilar.checked;
      scheduleSettingsSave();
    });
  });

  lengthRange.addEventListener('change', () => {
    if (!state.settings) return;
    state.settings.minLength = Number(lengthRange.value);
    scheduleSettingsSave();
  });

  copyGeneratedBtn.addEventListener('click', async () => {
    if (!generatedResult.value) {
      showToast('Generate a password first.', 'warning');
      return;
    }
    const ok = await copyToClipboard(generatedResult.value);
    showToast(ok ? 'Generated password copied.' : 'Clipboard unavailable.', ok ? 'success' : 'warning');
  });

  useForTestBtn.addEventListener('click', () => {
    if (!generatedResult.value) {
      showToast('Generate a password first.', 'warning');
      return;
    }
    passwordInput.value = generatedResult.value;
    updateStrength(generatedResult.value);
    setView('tester');
    passwordInput.focus();
  });

  saveGeneratedBtn.addEventListener('click', saveGeneratedToVault);
  if (saveTestedBtn) {
    saveTestedBtn.addEventListener('click', saveTestedToVault);
  }

  createMasterForm.addEventListener('submit', handleCreateMaster);
  unlockForm.addEventListener('submit', handleUnlock);
  entryForm.addEventListener('submit', handleEntrySubmit);
  masterForm.addEventListener('submit', changeMasterPassword);

  modalBackdrop.addEventListener('click', () => {
    closeModal('entryModal');
    closeModal('masterModal');
  });

  document.querySelectorAll('[data-close]')?.forEach(button => {
    button.addEventListener('click', event => {
      const target = event.currentTarget.getAttribute('data-close');
      closeModal(target);
    });
  });

  document.querySelectorAll('.modal-header .icon-button').forEach(button => {
    button.addEventListener('click', event => {
      const modal = event.target.closest('.modal');
      if (modal) {
        closeModal(modal.id === 'entryModal' ? 'entryModal' : 'masterModal');
      }
    });
  });

  document.querySelectorAll('[data-toggle-target]')?.forEach(button => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    updateToggleLabel(button, expanded);
    button.addEventListener('click', event => {
      delete event.currentTarget.dataset.autoOpened;
      toggleCollapsible(event.currentTarget);
    });
  });

  addEntryBtn.addEventListener('click', () => openEntryModal());
  changeMasterBtn.addEventListener('click', () => openMasterModal());
  lockVaultBtn.addEventListener('click', () => lockVault(true));

  vaultSearch.addEventListener('input', event => {
    state.filter = event.target.value;
    renderVaultEntries();
    resetInactivityTimer();
  });

  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setView(tab.dataset.view);
    });
  });

  themeToggle.addEventListener('click', async () => {
    if (!state.settings) return;
    const currentIndex = THEMES.indexOf(state.settings.theme || 'system');
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    state.settings.theme = nextTheme;
    applyTheme(nextTheme);
    await saveSettings(state.settings);
  });

  openSettingsBtn.addEventListener('click', () => openSettingsPanel());
  closeSettingsBtn.addEventListener('click', () => closeSettingsPanel());
  settingsPanel.addEventListener('click', event => {
    if (event.target === settingsPanel) {
      closeSettingsPanel();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && settingsPanel.getAttribute('aria-hidden') === 'false') {
      closeSettingsPanel();
    }
  });

  themeRadios.forEach(radio => {
    radio.addEventListener('change', async event => {
      if (!event.target.checked || !state.settings) return;
      state.settings.theme = event.target.value;
      applyTheme(event.target.value);
      await saveSettings(state.settings);
      syncSettingsView();
    });
  });

  autoLockRange.addEventListener('input', event => {
    autoLockLabel.textContent = `${event.target.value} min`;
  });

  autoLockRange.addEventListener('change', () => {
    if (!state.settings) return;
    state.settings.vaultTimeout = Number(autoLockRange.value);
    scheduleSettingsSave();
  });

  syncToggle.addEventListener('change', async () => {
    if (!state.settings) return;
    state.settings.useSync = syncToggle.checked;
    await saveSettings(state.settings);
  });
}

async function initialise() {
  state.settings = await loadSettings();
  if (!state.settings.theme) {
    state.settings.theme = 'system';
  }
  applyTheme(state.settings.theme);
  if (state.settings.theme === 'system' && window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => applyTheme(state.settings.theme));
  }
  syncGeneratorControls();
  updateStrength('');
  updatePasswordToggleIcon();
  copyTestPasswordBtn.innerHTML = ICONS.copy;
  copyTestPasswordBtn.setAttribute('aria-label', 'Copy password');
  copyGeneratedBtn.innerHTML = ICONS.copy;
  copyGeneratedBtn.setAttribute('aria-label', 'Copy generated password');
  useForTestBtn.innerHTML = ICONS.arrowRight;
  useForTestBtn.setAttribute('aria-label', 'Send to tester');
  lockVaultBtn.innerHTML = ICONS.lock;
  lockVaultBtn.setAttribute('aria-label', 'Lock vault');
  attachEventListeners();
  await loadVaultStatus();
  setView('tester');
}

initialise();
