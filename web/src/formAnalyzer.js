export function extractConstraints(field) {
  const minAttr = parseInt(field.getAttribute('minlength') || '0', 10);
  const maxAttr = parseInt(field.getAttribute('maxlength') || '0', 10);
  const min = Number.isFinite(minAttr) && minAttr > 0 ? minAttr : 0;
  const max = Number.isFinite(maxAttr) && maxAttr > 0 ? maxAttr : 0;
  const pattern = field.getAttribute('pattern');
  const title = field.getAttribute('title') || '';
  const datasetPattern = field.dataset.pattern || null;
  const form = field.form;
  const confirmField = form ? Array.from(form.querySelectorAll('input[type="password"], input[data-password="true"]')).find(el => el !== field) : null;

  const custom = {
    requiresUppercase: /uppercase|capital/i.test(title),
    requiresLowercase: /lowercase/i.test(title),
    requiresNumber: /number|digit/i.test(title),
    requiresSymbol: /special|symbol/i.test(title)
  };

  const minLength = Math.max(min, 8);
  const maxLength = max ? Math.max(minLength, max) : Math.max(minLength + 4, 128);

  return {
    minLength,
    maxLength,
    pattern: datasetPattern || pattern || null,
    confirmField,
    notes: title,
    customRequirements: custom
  };
}

export function observePasswordFields(callback) {
  const seen = new WeakSet();
  function process(root = document) {
    const fields = root.querySelectorAll('input[type="password"]:not([data-securepass])');
    fields.forEach(field => {
      if (seen.has(field)) return;
      seen.add(field);
      field.dataset.securepass = '1';
      callback(field, extractConstraints(field));
    });
  }

  process();

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches && node.matches('input[type="password"]')) {
            process(node.parentElement || document);
          } else {
            process(node);
          }
        }
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
