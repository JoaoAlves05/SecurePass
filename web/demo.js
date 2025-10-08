// Password Strength Tester Demo JS
document.addEventListener('DOMContentLoaded', () => {

  // Toggle password visibility
  const toggleBtn = document.getElementById('togglePw');
  const pwInput = document.getElementById('pw');
  const inputWrap = pwInput.closest('.input-wrap');

  // Helper to set SVG icon
  function setIcon(open) {
    // Eye open / closed SVGs
    if (open) {
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-7 0-11 6.5-11 7s4 7 11 7 11-6.5 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>`;
    } else {
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 2l20 20-1.4 1.4L16 17.8A11.8 11.8 0 0 1 12 19c-7 0-11-6.5-11-7 1.2-1.9 3.4-4 6.3-5.6L3.4 3.4 2 2zM9.5 9.5A3 3 0 0 0 14.5 14.5L9.5 9.5z"/></svg>`;
    }
  }

  // Init icon state
  setIcon(false);

  toggleBtn.addEventListener('click', function(e) {
    const wasPassword = pwInput.type === 'password';
    pwInput.type = wasPassword ? 'text' : 'password';
    setIcon(wasPassword);
    // toggle a class for nicer visual feedback
    if (wasPassword) inputWrap.classList.add('revealed'); else inputWrap.classList.remove('revealed');
    // keep focus on input for easy typing
    pwInput.focus({ preventScroll: true });
    // move cursor to end
    const val = pwInput.value;
    pwInput.setSelectionRange(val.length, val.length);
  });

  // Atualiza a barra de força da password
  function updateStrengthBar(score) {
    const bar = document.getElementById('strength-bar').children;
    for (let i = 0; i < 4; i++) {
      bar[i].className = (i <= score) ? `active-${score}` : '';
    }
    document.getElementById('strength-desc').textContent =
      ["Very weak","Weak","Fair","Good","Excellent"][score];
  }

  // Calcula SHA-1 localmente
  async function sha1Hex(str) {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // ⚙️ Atualiza a força à medida que o utilizador escreve
  document.getElementById('pw').addEventListener('input', () => {
    const pw = document.getElementById('pw').value;
    const z = zxcvbn(pw);
    updateStrengthBar(z.score);
    let msg = `<span class="success">Strength: ${z.score}/4 (${["Very weak","Weak","Fair","Good","Excellent"][z.score]})</span>\n`;
    if (z.feedback.suggestions.length)
      msg += `<span class="suggestion">Suggestions: ${z.feedback.suggestions.join("; ")}</span>`;
    document.getElementById('out').innerHTML = msg;
  });

  // 🧩 Botão "Check" – consulta API local / verifica exposição
  document.getElementById('check').addEventListener('click', async () => {
    const pw = document.getElementById('pw').value;
    const out = document.getElementById('out');
    if (!pw) {
      out.innerHTML = '<span class="danger">Please enter a password.</span>';
      return;
    }

    out.innerHTML = 'Checking...';
    const h = await sha1Hex(pw);
    const prefix = h.slice(0, 5);
    const suffix = h.slice(5);

    try {
      const res = await fetch('/api/v1/pwned-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix })
      });

      if (!res.ok) {
        out.innerHTML = '<span class="danger">Error contacting the server.</span>';
        return;
      }

      const data = await res.json();
      const found = data.results.find(r => r.suffix === suffix);
      const z = zxcvbn(pw);
      updateStrengthBar(z.score);

      let msg = '';
      if (found) {
        msg += `<span class="danger">⚠️ This password has been exposed!<br>Count: ${found.count}</span><br><br>`;
      } else {
        msg += '<span class="success">✅ This password was not found in known leaks.</span><br><br>';
      }

      msg += `<span class="success">Strength: ${z.score}/4 (${["Very weak","Weak","Fair","Good","Excellent"][z.score]})</span><br>`;
      if (z.feedback.suggestions.length)
        msg += `<span class="suggestion">Suggestions: ${z.feedback.suggestions.join("; ")}</span>`;
      msg += `<div class="meta">Checked at: ${new Date().toLocaleTimeString()}</div>`;

      out.innerHTML = msg;

    } catch (e) {
      console.error(e);
      out.innerHTML = '<span class="danger">Error contacting the server.</span>';
    }
  });

});
