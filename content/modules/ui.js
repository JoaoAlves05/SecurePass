export function mapScoreToColor(score) {
  return score >= .8 ? '#16a34a' : score >= .6 ? '#65a30d' : score >= .4 ? '#d97706' : '#dc2626';
}
export function positionFloating(button, field) {
  const rect = field.getBoundingClientRect();
  const visible = field.isConnected && !field.disabled && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth && getComputedStyle(field).visibility !== 'hidden';
  button.hidden = !visible;
  if (!visible) return;
  button.style.top = `${Math.max(2, Math.min(innerHeight - 30, rect.top + (rect.height - 28) / 2))}px`;
  button.style.left = `${Math.max(2, Math.min(innerWidth - 30, rect.right - 34))}px`;
}
export function positionPanel(panel, field) {
  if (!panel.isConnected) return;
  const viewport = window.visualViewport;
  const leftEdge = viewport?.offsetLeft || 0; const topEdge = viewport?.offsetTop || 0;
  const width = viewport?.width || innerWidth; const height = viewport?.height || innerHeight;
  const rect = field.getBoundingClientRect();
  const panelWidth = Math.min(320, width - 16);
  panel.style.width = `${Math.max(180, panelWidth)}px`;
  panel.style.maxHeight = `${Math.max(100, height - 16)}px`;
  const measured = panel.getBoundingClientRect().height;
  const below = rect.bottom + 8;
  const top = below + measured <= topEdge + height - 8 ? below : rect.top - measured - 8;
  panel.style.left = `${Math.max(leftEdge + 8, Math.min(rect.left, leftEdge + width - panelWidth - 8))}px`;
  panel.style.top = `${Math.max(topEdge + 8, Math.min(top, topEdge + height - measured - 8))}px`;
}
export function setupShadowDom() {
  const shadowHost = document.createElement('div'); shadowHost.id = 'securepass-extension-root';
  shadowHost.style.cssText = 'all: initial; position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2147483647;';
  document.body.append(shadowHost);
  const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    :host { font-size: 16px; color-scheme: light; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }
    .sp-light {
      --sp-bg: #f0f4f8; --sp-surface: #ffffff; --sp-hover: #e6ebf2;
      --sp-text: #1e293b; --sp-muted: #475569; --sp-border: #d7dee8;
      --sp-primary: #172033; --sp-on-primary: #ffffff; --sp-accent: #274ee8;
      --sp-danger: #b4233c; --sp-shadow: 0 10px 32px rgba(31,38,65,.16);
      color-scheme: light;
    }
    .sp-dark {
      --sp-bg: #101013; --sp-surface: #202024; --sp-hover: #2b2b31;
      --sp-text: #f8fafc; --sp-muted: #b1b1bc; --sp-border: #35353d;
      --sp-primary: #f8fafc; --sp-on-primary: #15151a; --sp-accent: #91a4ff;
      --sp-danger: #ff9caf; --sp-shadow: 0 12px 32px rgba(0,0,0,.4);
      color-scheme: dark;
    }
    button { font: inherit; cursor: pointer; }
    button:disabled { cursor: default; opacity: .5; }
    button:focus-visible, summary:focus-visible { outline: 2px solid var(--sp-accent); outline-offset: 3px; }
    svg { flex: none; display: block; }
    .securepass-floating {
      pointer-events: auto; position: fixed; display: grid; place-items: center;
      width: 28px; height: 28px; padding: 5px; border-radius: 8px;
      border: 1px solid var(--sp-border); background: var(--sp-bg); color: var(--sp-text);
      box-shadow: 0 2px 6px rgba(0,0,0,.12);
    }
    .securepass-floating:hover, .securepass-floating[aria-expanded=true] { background: var(--sp-hover); }
    .securepass-panel {
      pointer-events: auto; position: fixed; margin: 0; padding: 16px;
      width: 320px; overflow: auto; overscroll-behavior: contain;
      background: var(--sp-bg); color: var(--sp-text); border: 1px solid var(--sp-border);
      border-radius: 16px; box-shadow: var(--sp-shadow);
      font: 13px/1.5 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      text-align: left; letter-spacing: normal; animation: sp-enter .14s ease-out;
      scrollbar-width: thin; scrollbar-color: var(--sp-border) transparent;
    }
    .securepass-panel ::selection { background: var(--sp-accent); color: var(--sp-bg); }
    .securepass-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    .securepass-brand { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 650; }
    .securepass-panel h3 { font-size: 17px; line-height: 1.3; margin: 0 0 5px; font-weight: 650; }
    .securepass-origin { color: var(--sp-muted); font-size: 12px; margin: 0 0 14px; overflow-wrap: anywhere; }
    .securepass-note { margin: 10px 0 0; color: var(--sp-muted); font-size: 12px; }
    .securepass-account { margin: 0 0 12px; font-weight: 600; overflow-wrap: anywhere; }
    .securepass-actions { display: grid; gap: 6px; }
    .securepass-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; min-height: 38px; padding: 9px 12px; margin: 0;
      border: 1px solid var(--sp-border); border-radius: 999px;
      color: var(--sp-text); background: var(--sp-surface); font-size: 13px; font-weight: 600;
    }
    .securepass-btn:hover:not(:disabled) { background: var(--sp-hover); }
    .securepass-btn.primary { background: var(--sp-primary); color: var(--sp-on-primary); border-color: transparent; }
    .securepass-btn.primary:hover:not(:disabled) { filter: brightness(.94); }
    .securepass-tool { justify-content: flex-start; border: 0; background: transparent; border-radius: 9px; font-weight: 500; }
    .securepass-icon-btn { display: grid; place-items: center; width: 30px; height: 30px; padding: 6px; border: 0; border-radius: 8px; color: var(--sp-muted); background: transparent; }
    .securepass-icon-btn:hover { background: var(--sp-hover); color: var(--sp-text); }
    .securepass-status { margin: 12px 0 0; color: var(--sp-muted); font-size: 12px; overflow-wrap: anywhere; }
    .securepass-status[data-state=error] { color: var(--sp-danger); }
    .securepass-tools { display: grid; gap: 2px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--sp-border); }
    @keyframes sp-enter { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) { .securepass-panel { animation: none; } }
  `;
  shadowRoot.append(style); return { shadowHost, shadowRoot };
}
export async function resolveThemeClass() {
  const response = await chrome.runtime.sendMessage({ type: 'PUBLIC_SETTINGS' });
  const theme = response?.settings?.theme || 'system';
  return theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'sp-dark' : 'sp-light') : theme === 'dark' ? 'sp-dark' : 'sp-light';
}
export function updateAllThemes(shadowRoot) {
  resolveThemeClass().then(cls => shadowRoot.querySelectorAll('.securepass-panel, .securepass-floating').forEach(node => {
    node.classList.remove('sp-dark', 'sp-light'); node.classList.add(cls);
  })).catch(() => {});
}
export async function initThemeSync(shadowRoot) {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => updateAllThemes(shadowRoot));
  chrome.runtime.onMessage.addListener(message => { if (message.type === 'SETTINGS_CHANGED') updateAllThemes(shadowRoot); });
}
