
// Mock Chrome API for Web Demo

const listeners = new Set();
const storage = {
  local: window.localStorage,
  sync: window.localStorage // Mock sync with local storage for demo
};

// Check for Secure Context (required for crypto.subtle)
const isSecureContext = window.isSecureContext;

if (!isSecureContext) {
  console.warn('SecurePass Demo: Not running in a Secure Context. Web Crypto API may be unavailable.');
  // We can't easily polyfill crypto.subtle for real security, but for a DEMO we might want to warn the user.
  // However, the app uses it for "actual" encryption in the demo.
  // If it fails, we should show a UI error in the app, but here we can try to prevent the crash.
}

function getStorage(area, keys, callback) {
  const result = {};
  if (Array.isArray(keys)) {
    keys.forEach(key => {
      const value = storage[area].getItem(key);
      if (value !== null) {
        try {
          result[key] = JSON.parse(value);
        } catch (e) {
          result[key] = value;
        }
      }
    });
  } else if (typeof keys === 'object') {
    Object.keys(keys).forEach(key => {
      const value = storage[area].getItem(key);
      if (value !== null) {
        try {
          result[key] = JSON.parse(value);
        } catch (e) {
          result[key] = value;
        }
      } else {
        result[key] = keys[key];
      }
    });
  } else if (typeof keys === 'string') {
     const value = storage[area].getItem(keys);
      if (value !== null) {
        try {
          result[keys] = JSON.parse(value);
        } catch (e) {
          result[keys] = value;
        }
      }
  }
  callback(result);
}

function setStorage(area, items, callback) {
  Object.keys(items).forEach(key => {
    storage[area].setItem(key, JSON.stringify(items[key]));
  });
  if (callback) callback();
}

function removeStorage(area, keys, callback) {
  if (Array.isArray(keys)) {
    keys.forEach(key => storage[area].removeItem(key));
  } else if (typeof keys === 'string') {
    storage[area].removeItem(keys);
  }
  if (callback) callback();
}

window.chrome = {
  runtime: {
    onInstalled: {
      addListener: (callback) => {
        // Simulate install event on load if not initialized
        if (!localStorage.getItem('installed')) {
          localStorage.setItem('installed', 'true');
          setTimeout(callback, 100); // Slight delay to ensure environment is ready
        }
      }
    },
    onMessage: {
      addListener: (callback) => {
        listeners.add(callback);
      },
      removeListener: (callback) => {
        listeners.delete(callback);
      }
    },
    sendMessage: (message, callback) => {
      // Simulate async message passing
      setTimeout(() => {
        let responded = false;
        const sendResponse = (response) => {
          if (!responded && callback) {
            callback(response);
            responded = true;
          }
        };

        let handled = false;
        for (const listener of listeners) {
          // In actual Chrome API, if a listener returns true, it keeps the channel open.
          // Here we just call them.
          const result = listener(message, {}, sendResponse);
          if (result === true) {
            handled = true;
          }
        }
        
        // If not handled (no listener returned true) and no response sent yet,
        // we might need to fallback. But for this mock, we assume listeners will respond if they exist.
      }, 0);
    },
    getManifest: () => ({
      version: '1.2.0',
      name: 'SecurePass Demo'
    }),
    lastError: null
  },
  storage: {
    local: {
      get: (keys, cb) => getStorage('local', keys, cb),
      set: (items, cb) => setStorage('local', items, cb),
      remove: (keys, cb) => removeStorage('local', keys, cb),
      clear: (cb) => { storage.local.clear(); if(cb) cb(); }
    },
    sync: {
      get: (keys, cb) => getStorage('sync', keys, cb),
      set: (items, cb) => setStorage('sync', items, cb),
      remove: (keys, cb) => removeStorage('sync', keys, cb),
      clear: (cb) => { storage.sync.clear(); if(cb) cb(); }
    },
    session: {
      // Session storage mock (in-memory for session)
      _data: {},
      get: (keys, cb) => {
        const result = {};
        if (keys === null) {
           cb(window.chrome.storage.session._data);
           return;
        }
        if (typeof keys === 'string') {
          result[keys] = window.chrome.storage.session._data[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach(k => result[k] = window.chrome.storage.session._data[k]);
        } else {
           // Object defaults
           Object.keys(keys).forEach(k => {
             result[k] = window.chrome.storage.session._data[k] !== undefined ? window.chrome.storage.session._data[k] : keys[k];
           });
        }
        cb(result); 
      },
      set: (items, cb) => {
        Object.assign(window.chrome.storage.session._data, items);
        if (cb) cb();
      },
      remove: (keys, cb) => {
         if (typeof keys === 'string') delete window.chrome.storage.session._data[keys];
         if (Array.isArray(keys)) keys.forEach(k => delete window.chrome.storage.session._data[k]);
         if (cb) cb();
      }
    }
  },
  tabs: {
    query: (queryInfo, callback) => {
      // Mock active tab
      callback([{ url: window.location.href }]);
    }
  },
  alarms: {
    _alarms: new Map(),
    create: (name, alarmInfo) => {
      const delayInMinutes = alarmInfo.delayInMinutes || 0;
      const delayMs = delayInMinutes * 60 * 1000;
      
      if (window.chrome.alarms._alarms.has(name)) {
        clearTimeout(window.chrome.alarms._alarms.get(name).timer);
      }

      const timer = setTimeout(() => {
        window.chrome.alarms._alarms.delete(name);
        if (window.chrome.alarms.onAlarm._listeners) {
          window.chrome.alarms.onAlarm._listeners.forEach(cb => cb({ name }));
        }
      }, delayMs);

      window.chrome.alarms._alarms.set(name, { timer, info: alarmInfo });
    },
    clear: (name, callback) => {
      if (window.chrome.alarms._alarms.has(name)) {
        clearTimeout(window.chrome.alarms._alarms.get(name).timer);
        window.chrome.alarms._alarms.delete(name);
      }
      if (callback) callback(true);
    },
    onAlarm: {
      _listeners: new Set(),
      addListener: (callback) => {
        window.chrome.alarms.onAlarm._listeners.add(callback);
      },
      removeListener: (callback) => {
        window.chrome.alarms.onAlarm._listeners.delete(callback);
      }
    }
  }
};

// Polyfill for crypto.randomUUID if not available
if (!crypto.randomUUID) {
  crypto.randomUUID = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };
}

// Error Handling for Demo
window.addEventListener('error', (event) => {
  console.error('Demo Error:', event.error);
  // If it's a module error or crypto error, we might want to alert the user in the UI
  // But since this script runs before the UI, we can't easily touch the DOM yet.
});
