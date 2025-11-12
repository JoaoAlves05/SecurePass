(async () => {
  const style = document.createElement('style');
  style.textContent = `
    .securepass-button {
      margin-left: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 999px;
      background: #38bdf8;
      color: #0f172a;
      font-weight: 600;
      border: none;
      cursor: pointer;
      font-size: 0.75rem;
    }
    .securepass-panel {
      position: absolute;
      z-index: 2147483647;
      background: rgba(15, 23, 42, 0.95);
      color: #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.45);
      width: 280px;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .securepass-panel h3 {
      margin: 0 0 0.5rem;
      font-size: 0.95rem;
    }
    .securepass-panel .meter {
      height: 8px;
      background: rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    .securepass-panel .meter div {
      height: 100%;
      width: 0%;
      background: #f87171;
      transition: width 0.3s ease;
    }
    .securepass-panel .meta {
      font-size: 0.75rem;
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .securepass-panel ul {
      margin: 0;
      padding-left: 1rem;
      font-size: 0.7rem;
      max-height: 80px;
      overflow-y: auto;
    }
    .securepass-panel .actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .securepass-panel button {
      flex: 1;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      background: #38bdf8;
      color: #0f172a;
    }
    .securepass-panel .status {
      font-size: 0.7rem;
      margin-top: 0.35rem;
    }
  `;
  document.documentElement.appendChild(style);

  const [{ observePasswordFields }, passwordModule] = await Promise.all([
    import(chrome.runtime.getURL('src/formAnalyzer.js')),
    import(chrome.runtime.getURL('src/passwordStrength.js'))
  ]);

  const activePanels = new Map();

  function mapScoreToColor(score) {
    if (score >= 0.8) return '#34d399';
    if (score >= 0.6) return '#4ade80';
    if (score >= 0.4) return '#facc15';
    return '#f87171';
  }

  function positionPanel(panel, field) {
    const rect = field.getBoundingClientRect();
    panel.style.top = `${rect.bottom + window.scrollY + 8}px`;
    panel.style.left = `${rect.left + window.scrollX}px`;
  }

  function updatePanel(panel, password) {
    const strength = passwordModule.evaluatePassword(password);
    panel.querySelector('.meter div').style.width = `${Math.max(strength.score * 100, 6)}%`;
    panel.querySelector('.meter div').style.background = mapScoreToColor(strength.score);
    panel.querySelector('.verdict').textContent = strength.verdict;
    panel.querySelector('.entropy').textContent = `${strength.entropy} bits`;
    const list = panel.querySelector('ul');
    list.innerHTML = '';
    strength.suggestions.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      list.appendChild(li);
    });
  }

  function createPanel(field, constraints) {
    const panel = document.createElement('div');
    panel.className = 'securepass-panel';
    panel.innerHTML = `
      <h3>SecurePass Insights</h3>
      <div class="meter"><div></div></div>
      <div class="meta">
        <span class="verdict">Weak</span>
        <span class="entropy">0 bits</span>
      </div>
      <ul></ul>
      <div class="actions">
        <button class="generate">Generate</button>
        <button class="hibp">Check HIBP</button>
      </div>
      <div class="status"></div>
    `;
    document.body.appendChild(panel);
    updatePanel(panel, field.value);
    positionPanel(panel, field);

    const statusEl = panel.querySelector('.status');
    const generateBtn = panel.querySelector('.generate');
    const hibpBtn = panel.querySelector('.hibp');

    const inputHandler = () => {
      updatePanel(panel, field.value);
      statusEl.textContent = '';
    };

    const observer = new ResizeObserver(() => positionPanel(panel, field));
    observer.observe(field);

    const scrollHandler = () => positionPanel(panel, field);
    window.addEventListener('scroll', scrollHandler, true);

    generateBtn.addEventListener('click', async () => {
      generateBtn.disabled = true;
      const response = await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'GENERATE_PASSWORD', constraints }, resolve);
      });
      generateBtn.disabled = false;
      if (!response || !response.ok) {
        statusEl.textContent = response?.error || 'Unable to generate password.';
        return;
      }
      field.value = response.password;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      updatePanel(panel, field.value);
      statusEl.textContent = 'Generated password applied.';
    });

    hibpBtn.addEventListener('click', async () => {
      hibpBtn.disabled = true;
      statusEl.textContent = 'Checking HIBP…';
      const response = await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'HIBP_CHECK', password: field.value }, resolve);
      });
      hibpBtn.disabled = false;
      if (!response || !response.ok) {
        statusEl.textContent = response?.error || 'HIBP check failed.';
        return;
      }
      statusEl.textContent = response.result.compromised
        ? `⚠️ Breached ${response.result.count.toLocaleString()} times`
        : '✅ Not found in breaches';
    });

    const outsideHandler = event => {
      if (
        panel.contains(event.target) ||
        event.target === field ||
        event.target.closest('.securepass-button')
      ) {
        return;
      }
      cleanup();
    };
    document.addEventListener('click', outsideHandler, true);

    const cleanup = () => {
      field.removeEventListener('input', inputHandler);
      window.removeEventListener('scroll', scrollHandler, true);
      document.removeEventListener('click', outsideHandler, true);
      observer.disconnect();
      panel.remove();
      activePanels.delete(field);
    };

    field.addEventListener('input', inputHandler);
    return cleanup;
  }

  function attachButton(field, constraints) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '🔒 SecurePass';
    button.className = 'securepass-button';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const existing = activePanels.get(field);
      if (existing) {
        existing();
        return;
      }
      const cleanup = createPanel(field, constraints);
      activePanels.set(field, cleanup);
    });
    field.insertAdjacentElement('afterend', button);
  }

  observePasswordFields((field, constraints) => {
    attachButton(field, constraints);
  });
})();
