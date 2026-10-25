const $ = id => document.getElementById(id);
const LEGACY_SECTIONS = {
  preferencesSection: 'generalSection',
  dataSection: 'backupsSection',
  recoverySection: 'backupsSection',
  syncSection: 'advancedSection',
  dangerSection: 'advancedSection'
};

export function attachSettingsNavigation() {
  const tabs = [...document.querySelectorAll('[data-settings-section]')];
  const sections = [...document.querySelectorAll('.settings-content-wrapper > .settings-section')];
  const indicator = $('settingsNavIndicator');
  const updateIndicator = () => {
    const selected = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
    if (!selected?.offsetWidth) return;
    indicator.style.width = `${selected.offsetWidth}px`;
    indicator.style.transform = `translateX(${selected.offsetLeft - 4}px)`;
  };
  const showSection = (requested, focus = false) => {
    const resolved = LEGACY_SECTIONS[requested] || requested;
    const id = sections.some(section => section.id === resolved) ? resolved : 'generalSection';
    for (const section of sections) section.hidden = section.id !== id;
    for (const tab of tabs) {
      const selected = tab.dataset.settingsSection === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.classList.toggle('active', selected);
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    history.replaceState(null, '', `#${id}`);
    document.querySelector('.settings-scroll-container').scrollTop = 0;
    requestAnimationFrame(updateIndicator);
    document.dispatchEvent(new CustomEvent('settings-section-changed', { detail: { id } }));
  };
  for (const tab of tabs) {
    tab.addEventListener('click', () => showSection(tab.dataset.settingsSection));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return;
      event.preventDefault();
      showSection(tabs[next].dataset.settingsSection, true);
    });
  }
  window.addEventListener('hashchange', () => showSection(location.hash.slice(1)));
  document.addEventListener('settings-opened', updateIndicator);
  new ResizeObserver(updateIndicator).observe(document.querySelector('.settings-tabs'));
  showSection(location.hash.slice(1));
}
