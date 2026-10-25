const $ = id => document.getElementById(id);

export function attachSettingsNavigation() {
  const links = [...document.querySelectorAll('.settings-navigation a')];
  const sections = [...document.querySelectorAll('.settings-content-wrapper > .settings-section')];
  const select = $('settingsSectionSelect');
  const showSection = (id, focus = false) => {
    if (!sections.some(section => section.id === id)) return;
    for (const section of sections) section.hidden = section.id !== id;
    for (const link of links) {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    select.value = id;
    document.querySelector('.settings-scroll-container').scrollTop = 0;
    if (focus) $(id).querySelector('h3').focus({ preventScroll: true });
  };
  for (const link of links) link.addEventListener('click', event => {
    event.preventDefault();
    const id = link.hash.slice(1);
    history.replaceState(null, '', `#${id}`);
    showSection(id, true);
  });
  select.addEventListener('change', () => {
    history.replaceState(null, '', `#${select.value}`);
    showSection(select.value);
  });
  window.addEventListener('hashchange', () => showSection(location.hash.slice(1)));
  showSection(location.hash.slice(1) || 'securitySection');
}
