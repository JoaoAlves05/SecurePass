(async () => {
  try {
    const [{ setupShadowDom, initThemeSync }, autofill, analyzer] = await Promise.all([
      import(chrome.runtime.getURL('content/modules/ui.js')),
      import(chrome.runtime.getURL('content/modules/autofill.js')),
      import(chrome.runtime.getURL('src/formAnalyzer.js'))
    ]);
    const { shadowRoot, shadowHost } = setupShadowDom();
    await initThemeSync(shadowRoot);
    await autofill.initAutofill({ analyzer, shadowRoot, shadowHost });
    analyzer.observePasswordFields(autofill.attachButton);
  } catch { console.error('SecurePass could not start. Reload the extension and this page.'); }
})();
