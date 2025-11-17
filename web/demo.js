// SecurePass extension demo interactions

document.addEventListener('DOMContentLoaded', () => {
  const pwInput = document.getElementById('pwInput');
  const togglePw = document.getElementById('togglePw');
  const strengthBars = Array.from(document.querySelectorAll('#strengthBar div'));
  const strengthDesc = document.getElementById('strengthDesc');
  const checkBtn = document.getElementById('checkBtn');
  const result = document.getElementById('out');

  const lengthControl = document.getElementById('lengthControl');
  const lengthValue = document.getElementById('lengthValue');
  const genLower = document.getElementById('genLower');
  const genUpper = document.getElementById('genUpper');
  const genNumbers = document.getElementById('genNumbers');
  const genSymbols = document.getElementById('genSymbols');
  const genSimilar = document.getElementById('genSimilar');
  const generatedPreview = document.getElementById('generatedPreview');
  const generateBtn = document.getElementById('generateBtn');
  const copyGenerated = document.getElementById('copyGenerated');
  const sendToTester = document.getElementById('sendToTester');

  const demoLock = document.getElementById('demoLock');
  const demoLockValue = document.getElementById('demoLockValue');

  function setIcon(open) {
    togglePw.innerHTML = open
      ? '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zm11 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 5c-7 0-11 6.5-11 7s4 7 11 7c1.6 0 3-.4 4.3-1.1l1.6 1.6 1.4-1.4-16-16-1.4 1.4 2.8 2.8C3 8.6 1.6 10.4 1 12c.1.3 1.8 3 5 4.9l1.5-1.5A3.8 3.8 0 0 1 7.1 12c0-1 .4-1.9 1-2.5L12 13.4c0 .2 0 .4-.1.6a2 2 0 1 1-3.1-2.3l-1.4-1.4A4 4 0 0 0 12 16a4 4 0 0 0 1.2-.2l2.3 2.3C13.7 18.8 12.4 19 12 19c-7 0-11-6.5-11-7s4-7 11-7c2.1 0 4 .6 5.7 1.5l-1.5 1.5A6.1 6.1 0 0 0 12 5Z"/></svg>';
  }

  function updateMeter(score) {
    const colors = ['#f97316', '#f59e0b', '#22c55e', '#22c55e'];
    strengthBars.forEach((bar, idx) => {
      bar.style.background = idx <= score ? colors[Math.min(score, colors.length - 1)] : 'rgba(255,255,255,0.1)';
    });
    const labels = ['Very weak', 'Weak', 'Good', 'Excellent', 'Outstanding'];
    strengthDesc.textContent = `Strength: ${labels[Math.min(score, 4)]}`;
  }

  function updateFromInput() {
    const pw = pwInput.value;
    if (!pw) {
      updateMeter(0);
      result.innerHTML = '';
      return;
    }
    const z = zxcvbn(pw);
    updateMeter(z.score);
    let msg = `<span class="success">Strength: ${z.score}/4 (${['Very weak', 'Weak', 'Fair', 'Good', 'Excellent'][z.score]})</span><br>`;
    if (z.feedback.suggestions.length) {
      msg += `<span class="suggestion">Suggestions: ${z.feedback.suggestions.join('; ')}</span>`;
    }
    result.innerHTML = msg;
  }

  async function sha1Hex(str) {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  togglePw.addEventListener('click', () => {
    const open = pwInput.type === 'password';
    pwInput.type = open ? 'text' : 'password';
    setIcon(open);
    pwInput.focus({ preventScroll: true });
    const val = pwInput.value;
    pwInput.setSelectionRange(val.length, val.length);
  });

  setIcon(false);
  pwInput.addEventListener('input', updateFromInput);

  checkBtn.addEventListener('click', async () => {
    const pw = pwInput.value;
    if (!pw) {
      result.innerHTML = '<span class="danger">Please enter a password first.</span>';
      return;
    }
    result.textContent = 'Checking...';
    const h = await sha1Hex(pw);
    const prefix = h.slice(0, 5);
    const suffix = h.slice(5);
    try {
      const res = await fetch('/api/v1/pwned-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix })
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      const found = data.results.find(r => r.suffix === suffix);
      const z = zxcvbn(pw);
      updateMeter(z.score);
      let msg = '';
      if (found) {
        msg += `<span class="danger">⚠️ Exposed ${found.count} times</span><br>`;
      } else {
        msg += '<span class="success">✅ Not found in the queried set.</span><br>';
      }
      msg += `<span class="success">Strength: ${z.score}/4 (${['Very weak', 'Weak', 'Fair', 'Good', 'Excellent'][z.score]})</span><br>`;
      if (z.feedback.suggestions.length) {
        msg += `<span class="suggestion">Suggestions: ${z.feedback.suggestions.join('; ')}</span>`;
      }
      msg += `<div class="meta">Checked at ${new Date().toLocaleTimeString()}</div>`;
      result.innerHTML = msg;
    } catch (err) {
      console.error(err);
      result.innerHTML = '<span class="danger">Unable to reach the demo API.</span>';
    }
  });

  lengthControl.addEventListener('input', () => {
    lengthValue.textContent = lengthControl.value;
  });

  function buildCharset() {
    let chars = '';
    if (genLower.checked) chars += 'abcdefghijkmnopqrstuvwxyz';
    if (genUpper.checked) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (genNumbers.checked) chars += '23456789';
    if (genSymbols.checked) chars += '!@#$%^&*()_+-={}[]:;,.?';
    if (!genSimilar.checked) {
      chars = chars.replace(/[IlO0]/g, '');
    }
    return chars;
  }

  function generatePassword() {
    const charset = buildCharset();
    if (!charset) return '';
    const length = parseInt(lengthControl.value, 10);
    let output = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      output += charset[array[i] % charset.length];
    }
    return output;
  }

  function renderGenerated() {
    const pwd = generatePassword();
    generatedPreview.value = pwd;
  }

  generateBtn.addEventListener('click', () => {
    renderGenerated();
  });

  copyGenerated.addEventListener('click', () => {
    if (!generatedPreview.value) return;
    navigator.clipboard.writeText(generatedPreview.value);
  });

  sendToTester.addEventListener('click', () => {
    if (!generatedPreview.value) return;
    pwInput.value = generatedPreview.value;
    updateFromInput();
    pwInput.focus();
  });

  demoLock.addEventListener('input', () => {
    demoLockValue.textContent = demoLock.value;
  });

  // Initialize defaults
  setIcon(false);
  updateFromInput();
  renderGenerated();
});
