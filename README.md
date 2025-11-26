# SecurePass

**SecurePass** is a Local-First Security Suite that analyzes, generates, and protects your passwords directly in your browser.

> 🔒 **Privacy First:** Your data never leaves your device. We use a Zero-Knowledge architecture with AES-256 encryption.

## Features

- **Password Tester:** Real-time strength analysis using zxcvbn entropy calculation. Check if your password has been exposed in known data breaches (HIBP) using k-anonymity.
- **Secure Vault:** Store credentials locally with military-grade encryption.
- **Smart Generator:** Create cryptographically strong passwords with customizable length and character sets.

## Installation

### Extension (Chrome/Edge/Brave)

1.  Clone this repository.
2.  Open `chrome://extensions`.
3.  Enable "Developer mode".
4.  Click "Load unpacked" and select the `extension/` folder.

### Web Demo

Visit the live demo at: [https://JoaoAlves05.github.io/SecurePass/](https://JoaoAlves05.github.io/SecurePass/)

## Development

This project is organized as a monorepo:

- `extension/`: The core browser extension.
- `web/`: The static landing page and demo.
- `backend/`: Optional Python backend (for future features).

### Running Locally

To run the web demo with live sync from the extension code:

```bash
python3 scripts/dev.py
```

## Security & Privacy

- **Zero-Knowledge:** We don't know your master password. If you lose it, your data is lost forever.
- **Local Processing:** All encryption and logic happen in your browser.
- **Open Source:** Audit the code yourself.

## License

MIT
