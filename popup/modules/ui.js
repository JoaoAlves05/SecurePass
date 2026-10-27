import { state } from '../state.js';
import { resetInactivityTimer } from './vaultSession.js';
import { showToast } from './toast.js';
import { resolveUnlockSetup } from './modalResolver.js';

const $ = id => document.getElementById(id);
let previousFocus;
let settingsTrigger;
function manageFocus() {
  const modals = ['entryModal', 'unlockSetupModal'].map($).filter(el => !el.classList.contains('hidden'));
  const settings = $('settingsPanel').classList.contains('visible');
  const active = modals.at(-1) || (settings ? $('settingsPanel') : null);
  document.querySelector('.app-container')?.toggleAttribute('inert', Boolean(active));
  document.querySelector('main')?.toggleAttribute('inert', Boolean(active));
  for (const modal of ['entryModal', 'unlockSetupModal'].map($)) modal.inert = Boolean(active && modal !== active);
  $('settingsPanel').inert = Boolean(modals.length) || !settings;
  if (!active && previousFocus?.isConnected) previousFocus.focus();
}
export function setView(id) {
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === `view-${id}`));
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    const selected = el.dataset.view === id; el.classList.toggle('active', selected); el.setAttribute('aria-selected', String(selected));
    if (selected) requestAnimationFrame(() => { $('navIndicator').style.width = `${el.offsetWidth}px`; $('navIndicator').style.transform = `translateX(${el.offsetLeft - 4}px)`; });
  });
}
export function openSettingsPanel() {
  settingsTrigger = $('openSettings'); $('settingsPanel').classList.add('visible'); $('settingsPanel').setAttribute('aria-hidden', 'false'); manageFocus();
  document.dispatchEvent(new CustomEvent('settings-opened'));
}
function backFromSettings() {
  if ($('settingsPanel').getAttribute('aria-hidden') === 'true') return;
  if (document.dispatchEvent(new CustomEvent('settings-back', { cancelable: true }))) closeSettingsPanel();
}
export function closeSettingsPanel() {
  if (document.body.classList.contains('management-mode')) return;
  document.dispatchEvent(new CustomEvent('settings-closed'));
  $('settingsPanel').classList.remove('visible'); $('settingsPanel').setAttribute('aria-hidden', 'true'); manageFocus();
  requestAnimationFrame(() => {
    if ($('settingsPanel').getAttribute('aria-hidden') === 'true' && settingsTrigger?.isConnected) settingsTrigger.focus();
  });
}
export function openModal(id) {
  previousFocus = document.activeElement;
  $('modalBackdrop').classList.remove('hidden'); $(id).classList.remove('hidden'); manageFocus();
  $(id).querySelector('input, textarea, button')?.focus();
}
export function closeModal(id, { force = false } = {}) {
  if (id === 'unlockSetupModal' && !force && $(id).dataset.busy === 'password') return;
  const wasVisible = !$(id).classList.contains('hidden');
  const target = previousFocus;
  if (id === 'unlockSetupModal') resolveUnlockSetup(null);
  const modal = $(id);
  modal.classList.add('hidden');
  modal.querySelectorAll('input, textarea').forEach(input => { input.value = ''; });
  const any = ['entryModal', 'unlockSetupModal'].some(key => !$(key).classList.contains('hidden'));
  $('modalBackdrop').classList.toggle('hidden', !any); manageFocus();
  if (id === 'unlockSetupModal') {
    document.dispatchEvent(new CustomEvent('unlock-dialog-closed'));
    if (wasVisible) requestAnimationFrame(() => {
      if (!any && !$('operationDialog').open && target?.isConnected && target.getClientRects().length && !target.closest('[hidden], [inert]')) target.focus({ preventScroll: true });
    });
  }
}
export async function detectActiveOrigin() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && /^https?:/.test(tab.url)) return new URL(tab.url).origin;
  } catch {}
  return '';
}
export async function openEntryModal(entry) {
  if (!state.vaultUnlocked) { showToast('Unlock the vault first.', 'warning'); setView('vault'); return; }
  state.editingEntryId = entry?.id || null; $('entryForm').reset();
  $('entryModalTitle').textContent = state.editingEntryId ? 'Update credential' : 'Save credential';
  $('entrySite').value = entry?.site || await detectActiveOrigin();
  $('entryUsername').value = entry?.username || ''; $('entryPassword').value = entry?.password || ''; $('entryNotes').value = entry?.notes || '';
  openModal('entryModal'); resetInactivityTimer();
}
export function attachUIListeners() {
  document.addEventListener('vault-ui-locked', () => { for (const id of ['entryModal', 'unlockSetupModal']) closeModal(id, { force: true }); });
  $('settingsPanel').inert = true;
  document.querySelectorAll('.nav-item[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  $('openSettings').addEventListener('click', openSettingsPanel); $('closeSettings').addEventListener('click', backFromSettings);
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.close)));
  $('modalBackdrop').addEventListener('click', () => { for (const id of ['entryModal', 'unlockSetupModal']) closeModal(id); });
  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.removeAttribute('tabindex');
    button.addEventListener('click', () => {
      const input = $(button.dataset.togglePassword); input.type = input.type === 'password' ? 'text' : 'password';
      button.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
    });
  });
  document.querySelectorAll('[data-toggle-target]').forEach(button => button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true'; button.setAttribute('aria-expanded', String(!expanded)); $(button.dataset.toggleTarget).hidden = expanded;
  }));
  document.addEventListener('keydown', event => {
    if ($('operationDialog')?.open) return;
    const modal = ['unlockSetupModal', 'entryModal'].map($).find(el => !el.classList.contains('hidden'));
    const active = modal || ($('settingsPanel').classList.contains('visible') ? $('settingsPanel') : null);
    if (event.key === 'Escape') { if (modal) closeModal(modal.id); else backFromSettings(); }
    if (event.key === 'Tab' && active) {
      const items = [...active.querySelectorAll('button, input, textarea, select, summary, a[href], [tabindex="0"]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length && !el.closest('[hidden], [inert]'));
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
  });
}
