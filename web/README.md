# SecurePass Web Demo

This directory contains the web landing page and a fully functional embedded demo of the SecurePass extension.

## 🚀 How to Run

Because this demo uses modern web features like **ES Modules** and the **Web Crypto API** (for real encryption), it **must be served via a web server**. Opening `index.html` directly (via `file://`) will likely cause it to crash or fail to load modules.

### Quick Start (Python)

If you have Python installed (macOS/Linux usually do), simply run:

```bash
# Run this command inside the 'web' directory
python3 -m http.server 8000
```

Then open your browser to: [http://localhost:8000](http://localhost:8000)

### Alternative (Node.js)

If you have Node.js installed:

```bash
npx serve .
```

## 🛠️ Features

- **Premium Landing Page**: A completely redesigned, responsive landing page.
- **Interactive Demo**: A fully functional mock of the extension running inside an iframe (`app.html`).
- **Real Encryption**: The demo uses the actual `cryptoVault.js` logic from the extension, performing real AES-256 encryption in your browser.
- **Mock Chrome API**: A robust `mock-chrome.js` layer simulates the Chrome Extension environment (storage, messaging, alarms) so the app code runs unmodified.

## ⚠️ Troubleshooting

- **"Crypto API unavailable"**: Ensure you are running on `localhost` or `https`. The Web Crypto API requires a Secure Context.
- **Modules failing to load**: Ensure you are using a web server, not opening files directly.
