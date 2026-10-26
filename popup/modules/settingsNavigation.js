const $ = id => document.getElementById(id);
const LEGACY_SECTIONS = {
  preferencesSection: 'generalSection',
  appearanceSection: 'generalSection',
  dataSection: 'backupsSection',
  recoverySection: 'backupsSection',
  syncSection: 'advancedSection',
  dangerSection: 'advancedSection'
};

export function attachSettingsNavigation() {
  const links = [...document.querySelectorAll('[data-settings-section]')];
  const sections = [...document.querySelectorAll('.settings-content-wrapper > .settings-section')];
  const panel = $('settingsPanel');
  const navigation = $('settingsNavigation');
  const content = document.querySelector('.settings-scroll-container');
  const viewport = matchMedia('(min-width: 760px)');
  const isSidebar = () => document.body.classList.contains('management-mode') && viewport.matches;
  const positions = new Map();
  let currentId = null;
  let lastSection = 'generalSection';

  const showSection = (requested, { focus = false, replace = false } = {}) => {
    const resolved = LEGACY_SECTIONS[requested] || requested;
    const selected = links.find(link => link.dataset.settingsSection === resolved);
    const id = selected ? resolved : isSidebar() ? lastSection : null;
    if (currentId) positions.set(currentId, content.scrollTop);
    currentId = id;
    if (id) lastSection = id;
    const link = links.find(item => item.dataset.settingsSection === id);
    for (const section of sections) section.hidden = section.id !== id;
    for (const item of links) {
      if (item === link) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    }
    panel.dataset.settingsDetail = String(Boolean(id));
    navigation.hidden = Boolean(id) && !isSidebar();
    content.hidden = !id;
    $('settingsTitle').textContent = id && !isSidebar() ? link.dataset.settingsTitle : document.body.classList.contains('management-mode') ? 'Vault management' : 'Settings';
    $('closeSettings').hidden = isSidebar() || (document.body.classList.contains('management-mode') && !id);
    $('closeSettings').setAttribute('aria-label', id && !isSidebar() ? 'Back to settings' : 'Back to extension');
    const hash = `#${id || 'settings'}`;
    if (location.hash !== hash) history[replace ? 'replaceState' : 'pushState'](null, '', hash);
    requestAnimationFrame(() => {
      if (currentId !== id) return;
      content.scrollTop = positions.get(id) || 0;
      if (focus) {
        const target = id ? isSidebar() ? $(id).querySelector('h3') : $('settingsTitle')
          : links.find(item => item.dataset.settingsSection === lastSection);
        target?.focus({ preventScroll: true });
      }
    });
    document.dispatchEvent(new CustomEvent('settings-section-changed', { detail: { id } }));
  };

  for (const link of links) link.addEventListener('click', event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showSection(link.dataset.settingsSection, { focus: true });
  });
  document.addEventListener('settings-back', event => {
    if (!currentId || isSidebar()) return;
    event.preventDefault();
    showSection('settings', { focus: true });
  });
  document.addEventListener('settings-opened', () => showSection(location.hash.slice(1), { focus: true, replace: true }));
  const followHistory = () => {
    const requested = LEGACY_SECTIONS[location.hash.slice(1)] || location.hash.slice(1);
    if (requested !== (currentId || 'settings')) showSection(requested, { focus: panel.getAttribute('aria-hidden') === 'false', replace: true });
  };
  window.addEventListener('popstate', followHistory);
  window.addEventListener('hashchange', followHistory);
  viewport.addEventListener('change', () => showSection(location.hash.slice(1), { focus: panel.getAttribute('aria-hidden') === 'false', replace: true }));
  showSection(location.hash.slice(1), { replace: true });
}
